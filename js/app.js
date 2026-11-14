(() => {
  'use strict';

  const TAU = Math.PI * 2;
  const BODIES = window.BODIES;
  const byId = Object.fromEntries(BODIES.map(b => [b.id, b]));
  BODIES.forEach(b => { if (b.parent) b.parentBody = byId[b.parent]; });

  const $ = id => document.getElementById(id);
  const canvas = $('space');
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, DPR = 1;

  const SPEEDS = [0.25, 0.5, 1, 2, 5, 10, 20, 50, 100, 200]; // Erdtage pro Sekunde
  const state = {
    mode: 'orbit',
    speedIdx: 5,
    paused: false,
    days: 0,
    time: 0,
    showOrbits: true,
    showNames: true,
    selected: null,
    follow: null,
    hover: null
  };
  const cam = { x: 0, y: 0, z: 1 };
  const off = { x: 0, y: 0 };   // Verschiebung der Bildmitte, wenn die Info-Karte offen ist
  let flight = null;

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const fmt = (n, d = 0) => n.toLocaleString('de-DE', { maximumFractionDigits: d });

  // ---------- Layout für "Echte Größen" (Erdradius = 10 Einheiten) ----------
  const SIZE_UNIT = 10;
  let SIZE_END = 0;
  (function layoutSize() {
    const sun = byId.sonne;
    sun.sizePos = { x: 0, y: 0 };
    let x = sun.sizeR * SIZE_UNIT;
    for (const id of ['merkur', 'venus', 'erde', 'mond', 'mars', 'jupiter', 'saturn', 'uranus', 'neptun']) {
      const b = byId[id];
      const R = b.sizeR * SIZE_UNIT;
      const ext = b.rings ? R * 2.3 : R;
      x += Math.max(55, ext * 0.35) + ext;
      b.sizePos = { x, y: 0 };
      x += ext;
    }
    SIZE_END = x + 40;
  })();

  // ---------- Asteroidengürtel & Sterne ----------
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const belt = Array.from({ length: 650 }, () => {
    const a = 196 + rnd() * 36 + (rnd() - 0.5) * 6;
    return { a, ang: rnd() * TAU, period: 1200 + (a - 196) * 28, s: 0.5 + rnd() * 0.9, l: 120 + rnd() * 80 | 0 };
  });
  const stars = Array.from({ length: 420 }, () => ({
    x: rnd(), y: rnd(), d: 0.2 + rnd() * 0.8, s: rnd() < 0.08 ? 1.6 : 0.5 + rnd() * 0.8,
    ph: rnd() * TAU, hue: rnd() < 0.15 ? (rnd() < 0.5 ? '200,220,255' : '255,230,200') : '255,255,255'
  }));

  // ---------- Positionen ----------
  const radiusOf = b => state.mode === 'size' ? b.sizeR * SIZE_UNIT : b.r;
  // Größe auf dem Bildschirm – in der Übersicht nie zu klein zum Anklicken
  function screenR(b) {
    const R = radiusOf(b) * cam.z;
    if (state.mode !== 'orbit') return R;
    if (b.id === 'sonne') return Math.max(R, 11);
    if (b.id === 'mond') return Math.max(R, 2);
    return Math.max(R, b.r >= 15 ? 7 : b.r >= 10 ? 6 : 4.5);
  }
  function posOf(b) {
    if (state.mode === 'size') return b.sizePos;
    if (!b.orbit) return { x: 0, y: 0 };
    const a = b.start + TAU * state.days / b.period;
    const p = b.parentBody ? posOf(b.parentBody) : { x: 0, y: 0 };
    return { x: p.x + Math.cos(a) * b.orbit, y: p.y - Math.sin(a) * b.orbit };
  }
  const center = () => ({ x: W / 2 + off.x, y: H / 2 + off.y });
  function w2s(x, y) { const c = center(); return { x: (x - cam.x) * cam.z + c.x, y: (y - cam.y) * cam.z + c.y }; }
  function s2w(x, y) { const c = center(); return { x: (x - c.x) / cam.z + cam.x, y: (y - c.y) / cam.z + cam.y }; }

  function zoomLimits() {
    const m = Math.min(W, H);
    return state.mode === 'size' ? [W / (SIZE_END + 400), 60] : [m / 2 / 800, 90];
  }
  function homeView() {
    const m = Math.min(W, H);
    if (state.mode === 'size') {
      const left = byId.sonne.sizeR * SIZE_UNIT * 0.86;
      const z = W / ((SIZE_END - left) * 1.04);
      return { x: (left + SIZE_END) / 2, y: 0, z };
    }
    return { x: 0, y: 0, z: (m / 2 - 70) / 545 };
  }

  // ---------- Kamera-Flüge ----------
  function flyTo(b) {
    state.follow = b;
    const [mn, mx] = zoomLimits();
    let target = Math.min(W, H) * 0.17 / (radiusOf(b) * (b.rings ? 1.9 : 1));
    if (state.mode === 'orbit' && b.id === 'sonne') target = Math.min(W, H) * 0.12 / b.r;
    startFlight(() => posOf(b), clamp(target, mn, mx));
  }
  function flyHome() {
    state.follow = null;
    const h = homeView();
    startFlight(() => h, h.z);
  }
  function startFlight(target, tz) {
    const dur = clamp(0.7 + 0.18 * Math.abs(Math.log(tz / cam.z)), 0.7, 2);
    flight = { t: 0, dur, fx: cam.x, fy: cam.y, fz: cam.z, tz, target };
  }
  function stopMotion() { state.follow = null; flight = null; }

  function zoomAt(sx, sy, f) {
    const [mn, mx] = zoomLimits();
    if (flight) { flight.tz = clamp(flight.tz * f, mn, mx); return; }
    const nz = clamp(cam.z * f, mn, mx);
    if (state.follow) { cam.z = nz; return; }
    const w = s2w(sx, sy);
    cam.z = nz;
    const c = center();
    cam.x = w.x - (sx - c.x) / cam.z;
    cam.y = w.y - (sy - c.y) / cam.z;
  }

  // ---------- Zeichnen ----------
  function drawSun(c, x, y, R, t, glowScale = 3.2) {
    const pulse = 1 + Math.sin(t * 1.7) * 0.03;
    const gR = R * glowScale * pulse;
    const g = c.createRadialGradient(x, y, R * 0.7, x, y, gR);
    g.addColorStop(0, 'rgba(255,210,90,0.55)');
    g.addColorStop(0.4, 'rgba(255,150,40,0.18)');
    g.addColorStop(1, 'rgba(255,120,0,0)');
    c.fillStyle = g;
    c.beginPath(); c.arc(x, y, gR, 0, TAU); c.fill();

    const g2 = c.createRadialGradient(x - R * 0.25, y - R * 0.25, R * 0.05, x, y, R);
    g2.addColorStop(0, '#fffbe0');
    g2.addColorStop(0.45, '#ffd84a');
    g2.addColorStop(0.85, '#ffa424');
    g2.addColorStop(1, '#ff8a1a');
    c.fillStyle = g2;
    c.beginPath(); c.arc(x, y, R, 0, TAU); c.fill();
  }

  function ellipse(c, x, y, rx, ry, rot, color) {
    c.fillStyle = color;
    c.beginPath(); c.ellipse(x, y, Math.max(rx, 0.1), Math.max(ry, 0.1), rot, 0, TAU); c.fill();
  }

  const RINGS = [[1.22, 1.45, 'rgba(200,180,140,0.5)'], [1.5, 1.92, 'rgba(232,212,170,0.85)'], [1.98, 2.25, 'rgba(200,178,138,0.6)']];
  function drawRings(c, x, y, R, part, flat) {
    c.save();
    c.translate(x, y);
    c.rotate(-0.35);
    c.beginPath();
    if (part === 'back') c.rect(-R * 3, -R * 3, R * 6, R * 3); else c.rect(-R * 3, 0, R * 6, R * 3);
    c.clip();
    for (const [r1, r2, col] of RINGS) {
      c.beginPath();
      c.ellipse(0, 0, r2 * R, r2 * R * flat, 0, 0, TAU);
      c.moveTo(r1 * R, 0);
      c.ellipse(0, 0, r1 * R, r1 * R * flat, 0, 0, TAU);
      c.fillStyle = col;
      c.fill('evenodd');
    }
    c.restore();
  }

  function drawPlanet(c, b, x, y, R, la, ringFlat) {
    if (b.rings) drawRings(c, x, y, R, 'back', ringFlat);
    c.save();
    c.beginPath(); c.arc(x, y, R, 0, TAU); c.clip();
    c.fillStyle = b.color;
    c.fillRect(x - R, y - R, 2 * R, 2 * R);

    if (R > 2.5) {
      if (b.texture === 'bands') {
        for (const [p, h, col] of b.bands) { c.fillStyle = col; c.fillRect(x - R, y + p * R, 2 * R, h * R); }
        if (b.spot) ellipse(c, x + R * 0.28, y + R * 0.36, R * 0.22, R * 0.12, 0, b.spot);
      } else if (b.texture === 'earth') {
        const land = '#3d9a4a';
        ellipse(c, x - R * 0.35, y - R * 0.18, R * 0.32, R * 0.22, 0.5, land);
        ellipse(c, x - R * 0.18, y + R * 0.3, R * 0.16, R * 0.3, 0.3, land);
        ellipse(c, x + R * 0.35, y - R * 0.2, R * 0.28, R * 0.18, -0.3, land);
        ellipse(c, x + R * 0.4, y + R * 0.3, R * 0.15, R * 0.24, 0.2, '#6aa84f');
        ellipse(c, x, y - R * 0.98, R * 0.6, R * 0.2, 0, '#f4f8ff');
        ellipse(c, x, y + R * 0.98, R * 0.6, R * 0.2, 0, '#f4f8ff');
        ellipse(c, x + R * 0.05, y + R * 0.02, R * 0.5, R * 0.06, 0.25, 'rgba(255,255,255,0.55)');
        ellipse(c, x - R * 0.1, y - R * 0.5, R * 0.35, R * 0.05, -0.2, 'rgba(255,255,255,0.5)');
      } else if (b.texture === 'mars') {
        ellipse(c, x - R * 0.25, y + R * 0.1, R * 0.35, R * 0.18, 0.3, '#9c4426');
        ellipse(c, x + R * 0.35, y - R * 0.25, R * 0.2, R * 0.12, -0.4, '#a84a2a');
        ellipse(c, x, y - R * 0.95, R * 0.42, R * 0.17, 0, '#fbf4ef');
      } else if (b.texture === 'craters') {
        for (const [dx, dy, r] of b.craters) {
          ellipse(c, x + dx * R, y + dy * R, r * R, r * R, 0, b.craterColor);
          ellipse(c, x + dx * R - r * R * 0.15, y + dy * R - r * R * 0.15, r * R * 0.75, r * R * 0.75, 0, 'rgba(0,0,0,0.12)');
        }
      }
    }

    // Licht von der Sonne, Schatten auf der Rückseite
    const lx = x + Math.cos(la) * R * 0.55, ly = y + Math.sin(la) * R * 0.55;
    const g = c.createRadialGradient(lx, ly, 0, lx, ly, R * 2);
    g.addColorStop(0, 'rgba(255,255,255,0.22)');
    g.addColorStop(0.3, 'rgba(0,0,0,0)');
    g.addColorStop(0.7, 'rgba(0,0,10,0.55)');
    g.addColorStop(1, 'rgba(0,0,10,0.8)');
    c.fillStyle = g;
    c.fillRect(x - R, y - R, 2 * R, 2 * R);
    c.restore();

    if (b.atmo && R > 3) {
      c.strokeStyle = b.atmo;
      c.lineWidth = Math.max(1, R * 0.08);
      c.beginPath(); c.arc(x, y, R + c.lineWidth / 2, 0, TAU); c.stroke();
    }
    if (b.rings) drawRings(c, x, y, R, 'front', ringFlat);
  }

  function drawStars() {
    const t = state.time;
    for (const s of stars) {
      const px = ((s.x * W - cam.x * 0.03 * s.d) % W + W) % W;
      const py = ((s.y * H - cam.y * 0.03 * s.d) % H + H) % H;
      const a = 0.45 + 0.4 * Math.sin(t * 1.3 + s.ph) * s.d;
      ctx.fillStyle = `rgba(${s.hue},${a})`;
      ctx.fillRect(px, py, s.s, s.s);
    }
  }

  function drawOrbits() {
    const sun = w2s(0, 0);
    for (const b of BODIES) {
      if (!b.orbit || b.parentBody) continue;
      const sel = state.selected === b || state.hover === b;
      ctx.strokeStyle = sel ? b.color : 'rgba(150,170,255,0.2)';
      ctx.globalAlpha = sel ? 0.8 : 1;
      ctx.lineWidth = sel ? 2 : 1;
      ctx.beginPath(); ctx.arc(sun.x, sun.y, b.orbit * cam.z, 0, TAU); ctx.stroke();
    }
    const moon = byId.mond;
    if (moon.orbit * cam.z > 16) {
      const p = w2s(...Object.values(posOf(byId.erde)));
      ctx.strokeStyle = state.selected === moon ? 'rgba(220,220,220,0.7)' : 'rgba(200,200,220,0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(p.x, p.y, moon.orbit * cam.z, 0, TAU); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function drawBelt() {
    const sun = w2s(0, 0);
    const sz = Math.max(0.8, cam.z * 0.7);
    for (const a of belt) {
      const ang = a.ang + TAU * state.days / a.period;
      const x = sun.x + Math.cos(ang) * a.a * cam.z;
      const y = sun.y - Math.sin(ang) * a.a * cam.z;
      if (x < -5 || y < -5 || x > W + 5 || y > H + 5) continue;
      ctx.fillStyle = `rgb(${a.l},${a.l - 10},${a.l - 25})`;
      const s = sz * a.s;
      ctx.fillRect(x - s / 2, y - s / 2, s, s);
    }
  }

  // Namen mit einfacher Überlappungs-Vermeidung
  function drawLabels(items) {
    ctx.font = '600 14px Fredoka, "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const placed = [];
    const hit = r => placed.some(p => r.x < p.x + p.w && r.x + r.w > p.x && r.y < p.y + p.h && r.y + r.h > p.y);
    const prio = x => (x.b === state.selected) * 4 + (x.b === state.hover) * 2 + (x.b.id === 'erde');
    items.sort((a, b) => prio(b) - prio(a));
    for (const it of items) {
      const w = ctx.measureText(it.b.name).width + 16;
      const ext = it.b.rings ? it.R * (state.mode === 'size' ? 0.9 : 1.75) : it.R;
      let cands = [{ x: it.x, y: it.y + ext + 15 }, { x: it.x, y: it.y - ext - 15 }];
      if (it.custom) cands = [it.custom];
      for (const p of cands) {
        const r = { x: p.x - w / 2, y: p.y - 11, w, h: 22 };
        if (r.x > W || r.x + r.w < 0 || r.y > H || r.y + r.h < 0) continue;
        if (hit(r)) continue;
        placed.push(r);
        const active = it.b === state.selected || it.b === state.hover;
        ctx.fillStyle = active ? 'rgba(255,201,60,0.92)' : 'rgba(8,10,28,0.6)';
        ctx.beginPath(); ctx.roundRect(r.x, r.y, r.w, r.h, 11); ctx.fill();
        ctx.fillStyle = active ? '#2a1a00' : '#f2f4ff';
        ctx.fillText(it.b.name, p.x, p.y + 1);
        break;
      }
    }
  }

  function draw() {
    const bg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.8);
    bg.addColorStop(0, '#0b0d22');
    bg.addColorStop(1, '#03040b');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    drawStars();

    const orbitMode = state.mode === 'orbit';
    if (orbitMode && state.showOrbits) drawOrbits();
    if (orbitMode) drawBelt();

    const sunS = w2s(0, 0);
    const labels = [];
    for (const b of BODIES) {
      const p = posOf(b);
      const s = w2s(p.x, p.y);
      const R = screenR(b);
      const ext = b.rings ? R * 2.3 : b.id === 'sonne' ? R * 3.3 : R;
      if (s.x + ext < -50 || s.x - ext > W + 50 || s.y + ext < -50 || s.y - ext > H + 50) continue;
      if (b.id === 'mond' && orbitMode && b.orbit * cam.z < 5) continue;

      if (b.id === 'sonne') {
        drawSun(ctx, s.x, s.y, R, state.time, orbitMode ? 3.2 : 1.12);
      } else if (R < 1.6) {
        ctx.fillStyle = b.color;
        ctx.beginPath(); ctx.arc(s.x, s.y, 1.6, 0, TAU); ctx.fill();
      } else {
        const la = orbitMode ? Math.atan2(sunS.y - s.y, sunS.x - s.x) : Math.PI;
        drawPlanet(ctx, b, s.x, s.y, R, la, orbitMode ? 0.62 : 0.22);
      }

      if (state.selected === b) {
        const pr = Math.max(R, 6) + 7 + Math.sin(state.time * 4) * 2;
        if (pr < Math.max(W, H)) {
          ctx.strokeStyle = 'rgba(255,201,60,0.9)';
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 6]);
          ctx.lineDashOffset = -state.time * 20;
          ctx.beginPath(); ctx.arc(s.x, s.y, b.rings ? pr + R * 1.35 : pr, 0, TAU); ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      if (state.showNames) {
        if (b.id === 'sonne' && !orbitMode) {
          const e = w2s(b.sizeR * SIZE_UNIT, 0);
          labels.push({ b, x: s.x, y: s.y, R, custom: { x: clamp(e.x - 50, 60, W - 60), y: H / 2 - 120 } });
        } else if (R < H * 0.4 && !(b.id === 'mond' && orbitMode && b.orbit * cam.z < 24)) {
          labels.push({ b, x: s.x, y: s.y, R: Math.max(R, 2) });
        }
      }
    }
    if (orbitMode && state.showNames && cam.z > 0.45 && cam.z < 6) {
      ctx.font = 'italic 500 12px Fredoka, "Segoe UI", sans-serif';
      ctx.fillStyle = 'rgba(200,200,220,0.65)';
      ctx.textAlign = 'center';
      ctx.fillText('Asteroidengürtel', sunS.x, sunS.y - 238 * cam.z);
    }
    if (labels.length) drawLabels(labels);
  }

  // ---------- Treffer-Test ----------
  function hitTest(sx, sy) {
    let best = null, bestScore = Infinity;
    for (const b of BODIES) {
      if (b.id === 'mond' && state.mode === 'orbit' && b.orbit * cam.z < 12) continue;
      const p = posOf(b);
      const s = w2s(p.x, p.y);
      const R = screenR(b);
      const d = Math.hypot(sx - s.x, sy - s.y);
      const reach = Math.max(R, 20);
      if (d > reach) continue;
      // Kleinster getroffener Körper gewinnt (der Mond liegt vor der Erde)
      const score = (d <= R ? 0 : 1e6) + (d <= R ? R : d);
      if (score < bestScore) { bestScore = score; best = b; }
    }
    return best;
  }

  // ---------- Info-Karte ----------
  const infoPic = $('infoPic');
  const cmp = $('cmp');

  function distText(km) {
    if (km >= 1e9) return fmt(km / 1e9, 1) + ' Milliarden km';
    if (km >= 1e6) return fmt(km / 1e6) + ' Millionen km';
    return fmt(km) + ' km';
  }
  function carText(km) {
    const hours = km / 100;
    if (hours < 24 * 365) return `ca. ${fmt(Math.round(hours / 24))} Tage`;
    return `ca. ${fmt(Math.round(hours / 8766))} Jahre`;
  }

  function drawInfoPic(b) {
    const c = infoPic.getContext('2d');
    const S = 110, d = Math.min(window.devicePixelRatio || 1, 2);
    infoPic.width = S * d; infoPic.height = S * d;
    c.setTransform(d, 0, 0, d, 0, 0);
    c.clearRect(0, 0, S, S);
    if (b.id === 'sonne') drawSun(c, S / 2, S / 2, 30, 0, 1.75);
    else drawPlanet(c, b, S / 2, S / 2, b.rings ? 21 : 40, -2.4, 0.4);
  }

  function drawCompare(b) {
    const c = cmp.getContext('2d');
    const w = cmp.clientWidth || 300, h = cmp.clientHeight || 130;
    const d = Math.min(window.devicePixelRatio || 1, 2);
    cmp.width = w * d; cmp.height = h * d;
    c.setTransform(d, 0, 0, d, 0, 0);
    c.clearRect(0, 0, w, h);
    c.font = '500 13px Fredoka, "Segoe UI", sans-serif';
    c.textAlign = 'center';
    c.fillStyle = '#dfe4ff';
    const earth = byId.erde;
    const cy = h / 2 - 8;

    if (b.id === 'erde') {
      drawPlanet(c, earth, w / 2, cy, 40, -2.4, 0.4);
      c.fillStyle = '#dfe4ff';
      c.fillText('Erde', w / 2, h - 6);
      return;
    }
    if (b.id === 'sonne') {
      const R = 420;
      drawSun(c, w * 0.5 - R, cy, R, 0, 1);
      const er = Math.max(R / b.sizeR, 2);
      drawPlanet(c, earth, w * 0.8, cy, er, Math.PI, 0.4);
      c.fillStyle = '#dfe4ff';
      c.fillText('← Erde', w * 0.8 + 26, cy + 4);
      c.textAlign = 'left';
      c.fillStyle = '#6a2c00';
      c.fillText('Sonne', 10, h - 8);
      return;
    }
    const maxR = h * 0.36;
    const s = maxR / Math.max(b.sizeR * (b.rings ? 2.25 : 1), 1);
    const rE = Math.max(earth.sizeR * s, 1.5), rB = Math.max(b.sizeR * s, 1.5);
    const xE = w * 0.3, xB = w * 0.68;
    drawPlanet(c, earth, xE, cy, rE, -2.4, 0.4);
    drawPlanet(c, b, xB, cy, rB, -2.4, 0.4);
    c.fillStyle = '#dfe4ff';
    c.fillText('Erde', xE, h - 6);
    c.fillText(b.name, xB, h - 6);
  }

  function openInfo(b) {
    $('infoName').textContent = b.name;
    $('infoKind').textContent = b.kind;
    $('infoIntro').textContent = b.intro;
    $('infoTip').textContent = b.tip ? '⚠️ ' + b.tip : '';
    $('infoFun').textContent = b.fun;
    $('infoCompare').textContent = b.compare;

    const rows = [
      ['📏', 'Durchmesser', fmt(b.diameterKm) + ' km'],
      ['📍', `Entfernung zur ${b.distanceFrom}`, distText(b.distanceKm)],
      b.year && ['🔄', b.yearLabel || 'Ein Jahr (eine Runde um die Sonne)', b.year],
      ['🌗', 'Ein Tag', b.day],
      ['🌡️', 'Temperatur', b.temp],
      ['🌙', 'Monde', b.moons],
      ['🚗', `Mit dem Auto (100 km/h) zur ${b.distanceFrom}`, carText(b.distanceKm) + ' ohne Pause!']
    ].filter(Boolean);
    const facts = $('infoFacts');
    facts.innerHTML = '';
    for (const [ico, lbl, val] of rows) {
      const el = document.createElement('div');
      el.className = 'fact';
      el.innerHTML = `<span class="ico"></span><div><div class="lbl"></div><div class="val"></div></div>`;
      el.querySelector('.ico').textContent = ico;
      el.querySelector('.lbl').textContent = lbl;
      el.querySelector('.val').textContent = val;
      facts.appendChild(el);
    }

    document.body.classList.add('info-open');
    $('info').setAttribute('aria-hidden', 'false');
    $('info').scrollTop = 0;
    drawInfoPic(b);
    requestAnimationFrame(() => drawCompare(b));
  }

  function closeInfo() {
    stopSpeaking();
    if (rocket.mode === 'fly' || rocket.mode === 'park') { rocket.mode = 'leave'; rocket.v = 120; }
    state.selected = null;
    document.body.classList.remove('info-open');
    $('info').setAttribute('aria-hidden', 'true');
    updateBar();
  }

  function select(b) {
    hideHint();
    stopSpeaking();
    state.selected = b;
    flyTo(b);
    if (rocket.mode === 'park' && rocket.target === b) {
      openInfo(b);
    } else {
      // Karte erst zeigen, wenn die Rakete angekommen ist
      document.body.classList.remove('info-open');
      launchRocket(b);
    }
    updateBar();
  }

  // ---------- Rakete ----------
  const rocket = { mode: 'none', x: 0, y: 0, ang: -Math.PI / 2, target: null, t: 0, dur: 1.5, sx: 0, sy: 0, a0: 0, side: 1, orbitAng: 0, v: 0, alpha: 1, puffT: 0 };
  const puffs = [];

  function bodyScreen(b) { const p = posOf(b); return w2s(p.x, p.y); }
  function parkRadius(b) {
    const R = screenR(b);
    return (b.rings ? R * 2.3 : Math.max(R, 4)) + 18;
  }

  function launchRocket(b) {
    let sx, sy;
    if (rocket.mode === 'fly' || rocket.mode === 'park') {
      sx = rocket.x; sy = rocket.y;
    } else {
      const e = bodyScreen(byId.erde);
      const earthVisible = e.x > 20 && e.x < W - 20 && e.y > 20 && e.y < H - 20;
      if (b.id !== 'erde' && earthVisible) { sx = e.x; sy = e.y; }  // Start von der Erde!
      else { sx = 50; sy = H - 150; }
      rocket.ang = Math.atan2(-1, 0.3);
    }
    const c = bodyScreen(b);
    const away = Math.hypot(sx - c.x, sy - c.y) > 5;
    Object.assign(rocket, {
      mode: 'fly', target: b, t: 0, sx, sy, x: sx, y: sy, alpha: 1,
      dur: Math.max(1.5, (flight ? flight.dur : 1) + 0.2),
      a0: away ? Math.atan2(sy - c.y, sx - c.x) : -Math.PI / 2,
      side: Math.random() < 0.5 ? 1 : -1
    });
  }

  function addPuff(x, y, big) {
    puffs.push({ x, y, vx: (Math.random() - 0.5) * 20, vy: (Math.random() - 0.5) * 20, r: big ? 5 : 3, life: 1, decay: big ? 1.1 : 1.6, spark: false });
  }
  function sparkle(x, y) {
    const cols = ['#ffc93c', '#ff8a3d', '#ffffff', '#6aa8ff'];
    for (let i = 0; i < 26; i++) {
      const a = Math.random() * TAU, v = 60 + Math.random() * 110;
      puffs.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: 2 + Math.random() * 2, life: 1, decay: 1.3, spark: true, col: cols[i % cols.length] });
    }
  }

  function updateRocket(dt) {
    if (rocket.mode === 'fly') {
      const b = rocket.target;
      rocket.t = Math.min(1, rocket.t + dt / rocket.dur);
      const c = bodyScreen(b), pr = parkRadius(b);
      const ex = c.x + Math.cos(rocket.a0) * pr, ey = c.y + Math.sin(rocket.a0) * pr;
      const dx = ex - rocket.sx, dy = ey - rocket.sy;
      const cx = (rocket.sx + ex) / 2 - dy * 0.35 * rocket.side;
      const cy = (rocket.sy + ey) / 2 + dx * 0.35 * rocket.side;
      const t = rocket.t, e = t * t * (3 - 2 * t), u = 1 - e;
      const nx = u * u * rocket.sx + 2 * u * e * cx + e * e * ex;
      const ny = u * u * rocket.sy + 2 * u * e * cy + e * e * ey;
      if (Math.hypot(nx - rocket.x, ny - rocket.y) > 0.4) rocket.ang = Math.atan2(ny - rocket.y, nx - rocket.x);
      rocket.x = nx; rocket.y = ny;
      addPuff(rocket.x - Math.cos(rocket.ang) * 16, rocket.y - Math.sin(rocket.ang) * 16, true);
      if (rocket.t >= 1) {
        rocket.mode = 'park';
        rocket.orbitAng = rocket.a0;
        sparkle(c.x, c.y);
        if (state.selected === b) openInfo(b);
      }
    } else if (rocket.mode === 'park') {
      const b = rocket.target;
      rocket.orbitAng -= dt * 1.3;
      const c = bodyScreen(b), pr = parkRadius(b);
      rocket.x = c.x + Math.cos(rocket.orbitAng) * pr;
      rocket.y = c.y + Math.sin(rocket.orbitAng) * pr;
      rocket.ang = rocket.orbitAng - Math.PI / 2;
      rocket.puffT -= dt;
      if (rocket.puffT <= 0) { addPuff(rocket.x - Math.cos(rocket.ang) * 14, rocket.y - Math.sin(rocket.ang) * 14, false); rocket.puffT = 0.07; }
    } else if (rocket.mode === 'leave') {
      rocket.v += 500 * dt;
      rocket.x += Math.cos(rocket.ang) * rocket.v * dt;
      rocket.y += Math.sin(rocket.ang) * rocket.v * dt;
      rocket.alpha -= dt * 1.1;
      addPuff(rocket.x - Math.cos(rocket.ang) * 16, rocket.y - Math.sin(rocket.ang) * 16, true);
      if (rocket.alpha <= 0) rocket.mode = 'none';
    }
    for (let i = puffs.length - 1; i >= 0; i--) {
      const p = puffs[i];
      p.life -= dt * p.decay;
      if (p.life <= 0) { puffs.splice(i, 1); continue; }
      p.x += p.vx * dt; p.y += p.vy * dt;
      if (!p.spark) p.r += dt * 9;
    }
  }

  function drawRocket() {
    for (const p of puffs) {
      ctx.globalAlpha = Math.max(0, p.life) * (p.spark ? 1 : 0.45);
      ctx.fillStyle = p.spark ? p.col : '#d9dcef';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (rocket.mode === 'none') return;

    const L = 28;
    ctx.save();
    ctx.globalAlpha = clamp(rocket.alpha, 0, 1);
    ctx.translate(rocket.x, rocket.y);
    ctx.rotate(rocket.ang);

    // Flamme
    const fl = (rocket.mode === 'park' ? 6 : 12) + Math.random() * 6;
    ctx.fillStyle = '#ff7a1a';
    ctx.beginPath(); ctx.moveTo(-L * 0.42, -5); ctx.lineTo(-L * 0.42 - fl, 0); ctx.lineTo(-L * 0.42, 5); ctx.fill();
    ctx.fillStyle = '#ffe066';
    ctx.beginPath(); ctx.moveTo(-L * 0.42, -2.8); ctx.lineTo(-L * 0.42 - fl * 0.6, 0); ctx.lineTo(-L * 0.42, 2.8); ctx.fill();

    // Flossen
    ctx.fillStyle = '#e8413c';
    ctx.beginPath(); ctx.moveTo(-L * 0.2, -5); ctx.lineTo(-L * 0.5, -11); ctx.lineTo(-L * 0.42, -4); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-L * 0.2, 5); ctx.lineTo(-L * 0.5, 11); ctx.lineTo(-L * 0.42, 4); ctx.fill();

    // Rumpf mit roter Spitze
    ctx.save();
    ctx.beginPath(); ctx.ellipse(0, 0, L * 0.5, 6, 0, 0, TAU);
    ctx.fillStyle = '#f4f6ff'; ctx.fill();
    ctx.clip();
    ctx.fillStyle = '#e8413c';
    ctx.fillRect(L * 0.24, -7, L * 0.3, 14);
    ctx.fillStyle = 'rgba(0,0,40,0.18)';
    ctx.fillRect(-L * 0.5, 2, L, 5);
    ctx.restore();
    ctx.strokeStyle = 'rgba(20,20,60,0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(0, 0, L * 0.5, 6, 0, 0, TAU); ctx.stroke();

    // Fenster
    ctx.fillStyle = '#6ec6ff';
    ctx.strokeStyle = '#34407a';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(L * 0.04, 0, 3.2, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  // ---------- Vorlesen ----------
  const speakBtn = $('speakBtn');
  const canSpeak = 'speechSynthesis' in window;
  if (!canSpeak) speakBtn.style.display = 'none';
  function stopSpeaking() {
    if (canSpeak) speechSynthesis.cancel();
    speakBtn.textContent = '🔊 Vorlesen';
  }
  speakBtn.addEventListener('click', () => {
    const b = state.selected;
    if (!b || !canSpeak) return;
    if (speechSynthesis.speaking) { stopSpeaking(); return; }
    const u = new SpeechSynthesisUtterance(`${b.name}. ${b.intro} ${b.tip || ''} Wusstest du? ${b.fun}`);
    u.lang = 'de-DE';
    u.rate = 0.92;
    const voice = speechSynthesis.getVoices().find(v => v.lang && v.lang.startsWith('de'));
    if (voice) u.voice = voice;
    u.onend = () => { speakBtn.textContent = '🔊 Vorlesen'; };
    speakBtn.textContent = '⏹️ Stopp';
    speechSynthesis.speak(u);
  });

  // ---------- Steuerung ----------
  const bar = $('planetBar');
  for (const b of BODIES) {
    const btn = document.createElement('button');
    btn.dataset.id = b.id;
    btn.innerHTML = `<span class="dot" style="--c:${b.color}"></span><span></span>`;
    btn.lastChild.textContent = b.name;
    btn.addEventListener('click', () => select(b));
    bar.appendChild(btn);
  }
  function updateBar() {
    for (const btn of bar.children) btn.classList.toggle('active', state.selected && btn.dataset.id === state.selected.id);
  }

  function speedLabel() {
    const v = SPEEDS[state.speedIdx];
    if (v < 1) return `1 Sekunde = ${v * 24} Stunden`;
    return `1 Sekunde = ${v} ${v === 1 ? 'Tag' : 'Tage'}`;
  }
  const speed = $('speed');
  speed.addEventListener('input', () => { state.speedIdx = +speed.value; $('speedText').textContent = speedLabel(); });
  $('speedText').textContent = speedLabel();
  const playBtn = $('playBtn');
  function togglePause() { state.paused = !state.paused; playBtn.textContent = state.paused ? '▶️' : '⏸️'; }
  playBtn.addEventListener('click', togglePause);
  $('tOrbits').addEventListener('change', e => { state.showOrbits = e.target.checked; });
  $('tNames').addEventListener('change', e => { state.showNames = e.target.checked; });
  $('zoomIn').addEventListener('click', () => { hideHint(); zoomAt(W / 2 + off.x, H / 2 + off.y, 1.6); });
  $('zoomOut').addEventListener('click', () => { hideHint(); zoomAt(W / 2 + off.x, H / 2 + off.y, 1 / 1.6); });
  // Zurück zum ganzen Sonnensystem (Karte schließen + Übersicht)
  function showWholeSystem() { hideHint(); closeInfo(); flyHome(); }
  $('homeBtn').addEventListener('click', showWholeSystem);
  $('closeInfo').addEventListener('click', showWholeSystem);
  $('backBtn').addEventListener('click', showWholeSystem);

  const NOTES = {
    orbit: 'Psst: In dieser Ansicht sind Größen und Abstände nicht echt – sonst würdest du die Planeten gar nicht sehen! Unter „Echte Größen“ siehst du, wie groß sie wirklich sind.',
    size: 'Hier siehst du die echten Größen nebeneinander. Die Sonne ist so riesig, dass nur ein kleines Stück von ihr auf den Bildschirm passt! Zoome hinein, um die kleinen Planeten zu sehen.'
  };
  const SUBS = {
    orbit: 'Klick auf einen Planeten – deine Rakete fliegt hin! 🚀',
    size: 'Wie groß sind die Planeten wirklich?'
  };
  function setMode(m) {
    if (state.mode === m) return;
    state.mode = m;
    document.body.classList.toggle('mode-size', m === 'size');
    for (const btn of document.querySelectorAll('.modes button')) btn.classList.toggle('active', btn.dataset.mode === m);
    $('note').textContent = NOTES[m];
    $('modeSub').textContent = SUBS[m];
    stopMotion();
    Object.assign(cam, homeView());
    if (state.selected) flyTo(state.selected);
  }
  for (const btn of document.querySelectorAll('.modes button')) btn.addEventListener('click', () => { hideHint(); setMode(btn.dataset.mode); });
  $('note').textContent = NOTES.orbit;

  const hint = $('hint');
  function hideHint() { hint.classList.add('hidden'); }
  $('hintBtn').addEventListener('click', hideHint);

  // ---------- Maus & Touch ----------
  const pointers = new Map();
  let dragMoved = false, pinchPrev = null;

  function pinchInfo() {
    const [a, b] = [...pointers.values()];
    return { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 };
  }

  canvas.addEventListener('pointerdown', e => {
    canvas.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY });
    if (pointers.size === 1) dragMoved = false;
    if (pointers.size === 2) { pinchPrev = pinchInfo(); dragMoved = true; }
    hideHint();
  });

  canvas.addEventListener('pointermove', e => {
    const p = pointers.get(e.pointerId);
    if (!p) {
      if (e.pointerType === 'mouse') {
        state.hover = hitTest(e.clientX, e.clientY);
        canvas.classList.toggle('hovering', !!state.hover);
      }
      return;
    }
    const dx = e.clientX - p.x, dy = e.clientY - p.y;
    p.x = e.clientX; p.y = e.clientY;
    if (pointers.size === 1) {
      if (!dragMoved && Math.hypot(e.clientX - p.sx, e.clientY - p.sy) > 6) {
        dragMoved = true;
        canvas.classList.add('dragging');
      }
      if (dragMoved) {
        stopMotion();
        cam.x -= dx / cam.z;
        cam.y -= dy / cam.z;
      }
    } else if (pointers.size === 2 && pinchPrev) {
      const info = pinchInfo();
      zoomAt(info.mx, info.my, info.d / pinchPrev.d);
      if (!state.follow && !flight) {
        cam.x -= (info.mx - pinchPrev.mx) / cam.z;
        cam.y -= (info.my - pinchPrev.my) / cam.z;
      }
      pinchPrev = info;
    }
  });

  function endPointer(e) {
    if (!pointers.has(e.pointerId)) return;
    if (pointers.size === 1 && !dragMoved && e.type === 'pointerup') {
      const b = hitTest(e.clientX, e.clientY);
      if (b) select(b);
    }
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinchPrev = null;
    if (pointers.size === 1) {
      const rest = [...pointers.values()][0];
      rest.sx = -1e9; // nach dem Zoomen nicht mehr als Klick werten
    }
    if (pointers.size === 0) canvas.classList.remove('dragging');
  }
  canvas.addEventListener('pointerup', endPointer);
  canvas.addEventListener('pointercancel', endPointer);
  canvas.addEventListener('pointerleave', () => { if (!pointers.size) { state.hover = null; canvas.classList.remove('hovering'); } });

  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    hideHint();
    const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
    zoomAt(e.clientX, e.clientY, Math.exp(-clamp(dy, -200, 200) * 0.0016));
  }, { passive: false });

  window.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' && e.target.type === 'range' && e.key.startsWith('Arrow')) return;
    const c = center();
    if (e.key === '+' || e.key === '=') zoomAt(c.x, c.y, 1.4);
    else if (e.key === '-') zoomAt(c.x, c.y, 1 / 1.4);
    else if (e.key === ' ' && state.mode === 'orbit') { e.preventDefault(); togglePause(); }
    else if (e.key === 'Escape' || e.key === '0') showWholeSystem();
    else return;
    hideHint();
  });

  // ---------- Größe & Hauptschleife ----------
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const [mn, mx] = zoomLimits();
    cam.z = clamp(cam.z, mn, mx);
    if (state.selected) drawCompare(state.selected);
  }
  window.addEventListener('resize', resize);
  resize();
  Object.assign(cam, homeView());

  let last = performance.now(), hudTimer = 0;
  const timeText = $('timeText');
  function updateHud() {
    const total = Math.floor(state.days);
    const years = Math.floor(total / 365.25);
    const days = Math.floor(total - years * 365.25);
    const y = years === 1 ? '1 Jahr' : `${fmt(years)} Jahre`;
    const d = days === 1 ? '1 Tag' : `${days} Tage`;
    timeText.textContent = years > 0 ? `${y} und ${d}` : d;
  }

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    state.time += dt;
    if (!state.paused && state.mode === 'orbit') state.days += SPEEDS[state.speedIdx] * dt;

    // Bildmitte weich verschieben, wenn die Info-Karte offen ist
    const open = document.body.classList.contains('info-open');
    const wide = W > 900;
    const tx = open && wide ? -197 : 0;
    const ty = open && !wide ? -H * 0.24 : 0;
    const k = 1 - Math.exp(-dt * 7);
    off.x += (tx - off.x) * k;
    off.y += (ty - off.y) * k;

    if (flight) {
      flight.t = Math.min(1, flight.t + dt / flight.dur);
      const e = ease(flight.t);
      const p = flight.target();
      cam.x = lerp(flight.fx, p.x, e);
      cam.y = lerp(flight.fy, p.y, e);
      cam.z = Math.exp(lerp(Math.log(flight.fz), Math.log(flight.tz), e));
      if (flight.t >= 1) flight = null;
    } else if (state.follow) {
      const p = posOf(state.follow);
      cam.x = p.x; cam.y = p.y;
    }

    updateRocket(dt);
    draw();
    drawRocket();
    hudTimer -= dt;
    if (hudTimer <= 0) { updateHud(); hudTimer = 0.2; }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // Für Tests in der Konsole
  window.__solar = { state, cam, select, setMode, flyHome };
})();
