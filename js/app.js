(() => {
  'use strict';

  const TAU = Math.PI * 2;
  const LJ = 30; // Einheiten pro Lichtjahr in der Nachbarsterne-Ansicht
  const SYSTEM = window.BODIES, STARS = window.STARS, GALAXY = window.GALAXY;
  const byId = Object.fromEntries([...SYSTEM, ...STARS, ...GALAXY].map(b => [b.id, b]));
  SYSTEM.forEach(b => { if (b.parent) b.parentBody = byId[b.parent]; });
  const ORIGIN = { x: 0, y: 0, z: 0 };

  for (const s of STARS) {
    const [dx, dy, dz] = s.dir;
    const L = Math.hypot(dx, dy, dz) || 1;
    const k = s.lj * LJ / L;
    s.pos = { x: dx * k, y: dy * k, z: dz * k };
  }

  const $ = id => document.getElementById(id);
  const canvas = $('space');
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, DPR = 1;

  const SPEEDS = [0.25, 0.5, 1, 2, 5, 10, 20, 50, 100, 200]; // Erdtage pro Sekunde
  const state = {
    view: 'orbit',          // orbit | size | stars | galaxy
    speedIdx: 5, paused: false,
    days: 0, moonDays: 0, time: 0,
    showOrbits: true, showNames: true,
    selected: null, follow: null, hover: null,
    tiltMode: false
  };
  const ORDER = { size: 0, orbit: 0, stars: 1, galaxy: 2 };
  const cam = { x: 0, y: 0, z: 1 };
  const rot = { yaw: 0, pitch: 0 };   // pitch 0 = von oben
  const off = { x: 0, y: 0 };
  let flight = null, trans = null, zoomMul = 1, push = 1;

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const fmt = (n, d = 0) => n.toLocaleString('de-DE', { maximumFractionDigits: d });
  const wrapAngle = a => Math.atan2(Math.sin(a), Math.cos(a));
  function hexA(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`;
  }

  // ---------- Layout für "Echte Größen" (Erdradius = 10 Einheiten) ----------
  const SIZE_UNIT = 10;
  const SIZE_LIST = SYSTEM.filter(b => b.inSize !== false);
  let SIZE_END = 0;
  (function layoutSize() {
    const sun = byId.sonne;
    sun.sizePos = { x: 0, y: 0, z: 0 };
    let x = sun.sizeR * SIZE_UNIT;
    for (const id of ['merkur', 'venus', 'erde', 'mond', 'mars', 'jupiter', 'saturn', 'uranus', 'neptun']) {
      const b = byId[id];
      const R = b.sizeR * SIZE_UNIT;
      const ext = b.rings ? R * 2.3 : R;
      x += Math.max(55, ext * 0.35) + ext;
      b.sizePos = { x, y: 0, z: 0 };
      x += ext;
    }
    SIZE_END = x + 40;
  })();

  // ---------- Zufall, Asteroiden, Sterne, Milchstraße ----------
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const gauss = () => (rnd() + rnd() + rnd() - 1.5) / 1.5;
  const belt = Array.from({ length: 650 }, () => {
    const a = 196 + rnd() * 36 + (rnd() - 0.5) * 6;
    return { a, ang: rnd() * TAU, period: 1200 + (a - 196) * 28, s: 0.5 + rnd() * 0.9, l: 120 + rnd() * 80 | 0 };
  });

  // Spiralarme: bei r = 265 (Sonne) liegen die Arme bei 45°, 135°, …
  const ARM_K = 3.08;
  const armTheta = (k, r) => Math.PI / 4 - ARM_K * Math.log(265 / 40) + k * Math.PI / 2 + ARM_K * Math.log(r / 40);
  const galPts = [];
  (function buildGalaxy() {
    const push3 = (x, y, z, s, col) => galPts.push({ x, y, z, s, col });
    for (let k = 0; k < 4; k++) {
      for (let i = 0; i < 1100; i++) {
        const r = 40 + 470 * Math.pow(rnd(), 0.85) + gauss() * 10;
        const th = armTheta(k, Math.max(r, 40)) + gauss() * 0.13;
        const pink = rnd() < 0.05;
        const a = (0.35 + rnd() * 0.5).toFixed(2);
        push3(Math.cos(th) * r, Math.sin(th) * r, gauss() * 4, 0.8 + rnd(),
          pink ? `rgba(255,140,200,${a})` : `rgba(${190 + rnd() * 50 | 0},${205 + rnd() * 40 | 0},255,${a})`);
      }
    }
    // Orion-Arm (unser kleiner Arm)
    for (let i = 0; i < 260; i++) {
      const r = 225 + rnd() * 85;
      const th = Math.PI / 2 + 0.05 + ARM_K * Math.log(r / 265) * 0.55 + gauss() * 0.05;
      push3(Math.cos(th) * r, Math.sin(th) * r, gauss() * 3, 0.7 + rnd(), `rgba(210,225,255,${(0.3 + rnd() * 0.4).toFixed(2)})`);
    }
    // Scheibe und Zentrum
    for (let i = 0; i < 1100; i++) {
      const r = Math.sqrt(rnd()) * 520, th = rnd() * TAU;
      push3(Math.cos(th) * r, Math.sin(th) * r, gauss() * 6, 0.6 + rnd() * 0.6, `rgba(220,225,255,${(0.12 + rnd() * 0.2).toFixed(2)})`);
    }
    for (let i = 0; i < 1300; i++) {
      const r = -Math.log(1 - rnd() * 0.97) * 32, th = rnd() * TAU;
      push3(Math.cos(th) * r * 1.25, Math.sin(th) * r, gauss() * Math.max(4, 30 - r * 0.25), 0.8 + rnd(),
        `rgba(255,${215 + rnd() * 30 | 0},${150 + rnd() * 50 | 0},${(0.35 + rnd() * 0.45).toFixed(2)})`);
    }
  })();
  const blobSpecks = Array.from({ length: 40 }, () => ({ x: gauss() * 0.7, y: gauss() * 0.5, s: 0.6 + rnd(), a: 0.3 + rnd() * 0.5 }));

  // ---------- Welt & Projektion ----------
  const Z = () => cam.z * zoomMul;
  const tilted = () => state.view !== 'size';
  function bodies(v = state.view) {
    return v === 'orbit' ? SYSTEM : v === 'size' ? SIZE_LIST : v === 'stars' ? STARS : GALAXY;
  }
  function posOf(b) {
    if (state.view === 'size') return b.sizePos;
    if (state.view !== 'orbit') return b.pos;
    if (!b.orbit) return ORIGIN;
    if (b.parentBody) {
      const p = posOf(b.parentBody);
      const per = Math.sign(b.period) * Math.max(Math.abs(b.period), 1.5);
      const a = b.start + TAU * state.moonDays / per;
      return { x: p.x + Math.cos(a) * b.orbit, y: p.y - Math.sin(a) * b.orbit, z: 0 };
    }
    const a = b.start + TAU * state.days / b.period;
    return { x: Math.cos(a) * b.orbit, y: -Math.sin(a) * b.orbit, z: 0 };
  }
  const center = () => ({ x: W / 2 + off.x, y: H / 2 + off.y });

  function proj() {
    const c = center();
    if (!tilted()) return { k: Z(), cy: 1, sy: 0, cp: 1, sp: 0, cx: c.x, cyy: c.y };
    return { k: Z(), cy: Math.cos(rot.yaw), sy: Math.sin(rot.yaw), cp: Math.cos(rot.pitch), sp: Math.sin(rot.pitch), cx: c.x, cyy: c.y };
  }
  function w2s(x, y, z = 0, P = proj()) {
    const dx = x - cam.x, dy = y - cam.y;
    const rx = dx * P.cy - dy * P.sy, ry = dx * P.sy + dy * P.cy;
    return { x: rx * P.k + P.cx, y: (ry * P.cp - z * P.sp) * P.k + P.cyy, d: ry * P.sp + z * P.cp };
  }
  const w2sp = (p, P) => w2s(p.x, p.y, p.z || 0, P);
  function s2w(sx, sy, zh = 0) {
    const P = proj();
    const rx = (sx - P.cx) / P.k, py = (sy - P.cyy) / P.k;
    const cp = Math.sign(P.cp || 1) * Math.max(Math.abs(P.cp), 0.1);
    const ry = (py + zh * P.sp) / cp;
    return { x: rx * P.cy + ry * P.sy + cam.x, y: -rx * P.sy + ry * P.cy + cam.y, z: zh };
  }
  function panBy(dx, dy) {
    const a = s2w(0, 0), b = s2w(dx, dy);
    cam.x -= b.x - a.x; cam.y -= b.y - a.y;
  }

  // ---------- Größen, Sichtbarkeit ----------
  function viewCfg(v = state.view) {
    const m = Math.max(Math.min(W, H), 50);
    const inner = pad => Math.max(m / 2 - pad, m * 0.3);
    if (v === 'orbit') { const home = inner(70) / 545; return { home, min: home * 0.6, max: 220 }; }
    if (v === 'size') {
      const left = byId.sonne.sizeR * SIZE_UNIT * 0.86;
      const w = Math.max(W, 50);
      return { home: w / ((SIZE_END - left) * 1.04), min: w / (SIZE_END + 400), max: 60, hx: (left + SIZE_END) / 2 };
    }
    if (v === 'stars') { const home = inner(60) / (20 * LJ); return { home, min: home * 0.55, max: m / 2 / (1.2 * LJ) }; }
    const home = inner(50) / 560;
    return { home, min: m / 2 / 27000, max: m / 2 / 12 };
  }
  function homeView() {
    const c = viewCfg();
    return { x: c.hx || 0, y: 0, z: c.home };
  }
  const anchorOf = v => v === 'galaxy' ? byId.du.pos : ORIGIN;

  function screenR(b) {
    const k = Z();
    switch (state.view) {
      case 'size': return b.sizeR * SIZE_UNIT * k;
      case 'orbit': {
        const R = b.r * k;
        if (b.id === 'sonne') return Math.max(R, 11);
        if (b.parentBody) return Math.max(R, 2);
        return Math.max(R, b.r >= 15 ? 7 : b.r >= 10 ? 6 : 4.5);
      }
      case 'stars': return b.dot * clamp(Math.sqrt(k / viewCfg('stars').home), 0.85, 2);
      default:
        if (b.render === 'marker') return 7;
        if (b.render === 'core') return 7;
        return Math.max((b.wr || 0) * k, b.dot || 5);
    }
  }
  // Monde nur zeigen, wenn sie nicht im Planeten verschwinden
  function moonOrbitPx(b) { return b.orbit * Z(); }
  function moonActive(b) {
    const s = state.selected;
    return !!s && (s === b || s === b.parentBody || s.parentBody === b.parentBody);
  }
  function isVisible(b) {
    if (state.view === 'orbit' && b.parentBody) {
      if (!moonActive(b)) return false;
      const o = moonOrbitPx(b);
      return o > screenR(b.parentBody) + 4 && o > 8;
    }
    if (state.view === 'galaxy' && galaxyTiny() && !b.wr) return false;
    if (state.view === 'galaxy' && b.near) {
      const d = Math.hypot(b.pos.x - byId.du.pos.x, b.pos.y - byId.du.pos.y) * Z();
      return d > 16;
    }
    return true;
  }
  // Ganz weit draußen ist die Milchstraße nur noch ein kleiner Fleck
  const galaxyTiny = () => 540 * Z() < 45;
  function isClickable(b) {
    if (!isVisible(b)) return false;
    if (state.view === 'orbit' && b.parentBody) return moonOrbitPx(b) >= 14;
    return true;
  }

  // ---------- Kamera-Flüge ----------
  function focusZoom(b) {
    const m = Math.min(W, H);
    if (state.view === 'stars') return m * 0.5 / (2.5 * LJ);
    if (state.view === 'galaxy') return m * 0.3 / (b.focus || 40);
    if (state.view === 'orbit' && b.id === 'sonne') return m * 0.12 / b.r;
    const R = state.view === 'size' ? b.sizeR * SIZE_UNIT : b.r;
    return m * 0.17 / (R * (b.rings ? 1.9 : 1));
  }
  function startFlight(o) {
    const c = viewCfg();
    flight = Object.assign({
      t: 0, delay: 0, catchUp: 1, bump: 0, rotate: false,
      fx: cam.x, fy: cam.y, fz: cam.z, fyaw: rot.yaw, fpitch: rot.pitch
    }, o);
    flight.tz = clamp(flight.tz, c.min, c.max);
  }
  function flyTo(b) {
    state.follow = b;
    const tz = focusZoom(b);
    startFlight({ target: () => posOf(b), tz, dur: clamp(0.7 + 0.18 * Math.abs(Math.log(tz / cam.z)), 0.7, 2) });
  }
  function flyHome() {
    state.follow = null;
    const h = homeView();
    const atHome = !flight && Math.abs(cam.z / h.z - 1) < 0.04 && Math.hypot(cam.x - h.x, cam.y - h.y) * cam.z < 4;
    startFlight({
      target: () => h, tz: h.z, dur: 1.2, rotate: atHome,
      tyaw: rot.yaw - wrapAngle(rot.yaw), tpitch: 0
    });
  }
  function stopMotion() { state.follow = null; flight = null; }

  function zoomAt(sx, sy, f) {
    if (trans) return;
    const c = viewCfg();
    const atMin = cam.z <= c.min * 1.002, atMax = cam.z >= c.max * 0.998;
    if (!flight && f < 1 && atMin) { push *= f; if (push < 0.65) { push = 1; goOut(); } return; }
    if (!flight && f > 1 && atMax) { push *= f; if (push > 1.55) { push = 1; goIn(); } return; }
    push = 1;
    if (flight) { flight.tz = clamp(flight.tz * f, c.min, c.max); return; }
    const nz = clamp(cam.z * f, c.min, c.max);
    if (state.follow) { cam.z = nz; return; }
    const w = s2w(sx, sy);
    cam.z = nz;
    const w2 = s2w(sx, sy);
    cam.x += w.x - w2.x; cam.y += w.y - w2.y;
  }
  const NEXT_OUT = { orbit: 'stars', stars: 'galaxy' };
  const NEXT_IN = { stars: 'orbit', galaxy: 'stars' };
  function goOut() { if (NEXT_OUT[state.view]) goToView(NEXT_OUT[state.view]); }
  function goIn() { if (NEXT_IN[state.view]) goToView(NEXT_IN[state.view]); }

  // ---------- Zeichnen: Himmelskörper ----------
  function drawSun(c, x, y, R, t, glowScale = 3.2) {
    const pulse = 1 + Math.sin(t * 1.7) * 0.03;
    const gR = R * glowScale * pulse;
    if (glowScale > 1) {
      const g = c.createRadialGradient(x, y, R * 0.7, x, y, gR);
      g.addColorStop(0, 'rgba(255,210,90,0.55)');
      g.addColorStop(0.4, 'rgba(255,150,40,0.18)');
      g.addColorStop(1, 'rgba(255,120,0,0)');
      c.fillStyle = g;
      c.beginPath(); c.arc(x, y, gR, 0, TAU); c.fill();
    }
    const g2 = c.createRadialGradient(x - R * 0.25, y - R * 0.25, R * 0.05, x, y, R);
    g2.addColorStop(0, '#fffbe0');
    g2.addColorStop(0.45, '#ffd84a');
    g2.addColorStop(0.85, '#ffa424');
    g2.addColorStop(1, '#ff8a1a');
    c.fillStyle = g2;
    c.beginPath(); c.arc(x, y, R, 0, TAU); c.fill();
  }

  // Stern als leuchtender Punkt (Nachbarsterne, Milchstraße)
  function drawStarPoint(c, x, y, R, color, t = 0) {
    const g = c.createRadialGradient(x, y, 0, x, y, R * 3.4);
    g.addColorStop(0, hexA(color, 0.55));
    g.addColorStop(1, hexA(color, 0));
    c.fillStyle = g;
    c.beginPath(); c.arc(x, y, R * 3.4, 0, TAU); c.fill();
    if (R > 4.5) {
      const L = R * (2.6 + Math.sin(t * 2 + x) * 0.3);
      c.strokeStyle = hexA(color, 0.5);
      c.lineWidth = 1;
      c.beginPath(); c.moveTo(x - L, y); c.lineTo(x + L, y); c.moveTo(x, y - L); c.lineTo(x, y + L); c.stroke();
    }
    const g2 = c.createRadialGradient(x, y, 0, x, y, R);
    g2.addColorStop(0, '#ffffff');
    g2.addColorStop(0.5, color);
    g2.addColorStop(1, hexA(color, 0.9));
    c.fillStyle = g2;
    c.beginPath(); c.arc(x, y, R, 0, TAU); c.fill();
  }

  // Stern als Kugel (für den Größenvergleich)
  function drawStarBall(c, x, y, R, color) {
    const g = c.createRadialGradient(x - R * 0.25, y - R * 0.25, R * 0.05, x, y, R);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.5, color);
    g.addColorStop(1, hexA(color, 0.75));
    c.fillStyle = g;
    c.beginPath(); c.arc(x, y, R, 0, TAU); c.fill();
  }

  function ellipse(c, x, y, rx, ry, r0, color) {
    c.fillStyle = color;
    c.beginPath(); c.ellipse(x, y, Math.max(rx, 0.1), Math.max(ry, 0.1), r0, 0, TAU); c.fill();
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
      } else if (b.texture === 'lines') {
        c.strokeStyle = 'rgba(150,90,50,0.6)';
        c.lineWidth = Math.max(0.6, R * 0.05);
        c.beginPath();
        c.moveTo(x - R, y - R * 0.3); c.quadraticCurveTo(x, y - R * 0.1, x + R, y - R * 0.5);
        c.moveTo(x - R * 0.8, y + R * 0.5); c.quadraticCurveTo(x - R * 0.1, y + R * 0.1, x + R * 0.9, y + R * 0.4);
        c.moveTo(x - R * 0.2, y - R); c.quadraticCurveTo(x + R * 0.1, y, x - R * 0.3, y + R);
        c.stroke();
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

  function drawGalaxyObject(c, b, s, R) {
    const t = state.time;
    switch (b.render) {
      case 'marker': {
        const pr = 11 + Math.sin(t * 3) * 3;
        c.strokeStyle = 'rgba(255,216,74,0.9)';
        c.lineWidth = 2;
        c.beginPath(); c.arc(s.x, s.y, pr, 0, TAU); c.stroke();
        c.strokeStyle = 'rgba(255,216,74,0.35)';
        c.beginPath(); c.arc(s.x, s.y, pr + 7, 0, TAU); c.stroke();
        drawStarPoint(c, s.x, s.y, 3.5, '#ffd84a', t);
        break;
      }
      case 'core': drawStarPoint(c, s.x, s.y, 5, '#fff1c9', t); break;
      case 'star': drawStarPoint(c, s.x, s.y, R, b.color, t); break;
      case 'nebula': {
        const r = Math.max(R, 6) * 2.2;
        const g = c.createRadialGradient(s.x, s.y, 0, s.x, s.y, r);
        g.addColorStop(0, 'rgba(255,220,240,0.9)');
        g.addColorStop(0.3, 'rgba(255,120,200,0.5)');
        g.addColorStop(1, 'rgba(120,60,200,0)');
        c.fillStyle = g;
        c.beginPath(); c.arc(s.x, s.y, r, 0, TAU); c.fill();
        break;
      }
      case 'cluster': {
        const r = Math.max(R, 6);
        const pts = [[0, 0], [-0.9, -0.4], [0.8, -0.6], [-0.3, 0.8], [0.9, 0.5], [-1, 0.6], [0.2, -1]];
        for (const [dx, dy] of pts) drawStarPoint(c, s.x + dx * r, s.y + dy * r, Math.max(1.4, r * 0.22), b.color, t);
        break;
      }
      case 'blob': {
        const r = Math.max(R, 5);
        c.save();
        c.translate(s.x, s.y);
        c.scale(1, 0.7);
        const g = c.createRadialGradient(0, 0, 0, 0, 0, r * 1.3);
        g.addColorStop(0, 'rgba(235,238,255,0.75)');
        g.addColorStop(0.5, 'rgba(180,195,255,0.3)');
        g.addColorStop(1, 'rgba(150,170,255,0)');
        c.fillStyle = g;
        c.beginPath(); c.arc(0, 0, r * 1.3, 0, TAU); c.fill();
        c.restore();
        for (const p of blobSpecks) {
          c.fillStyle = `rgba(230,235,255,${p.a})`;
          c.fillRect(s.x + p.x * r, s.y + p.y * r, p.s, p.s);
        }
        break;
      }
      case 'galaxy': {
        const r = Math.max(R, 6);
        c.save();
        c.translate(s.x, s.y);
        c.rotate(0.7);
        c.scale(1, 0.32);
        const g = c.createRadialGradient(0, 0, 0, 0, 0, r);
        g.addColorStop(0, 'rgba(255,248,225,1)');
        g.addColorStop(0.12, 'rgba(255,230,190,0.75)');
        g.addColorStop(0.45, 'rgba(190,180,255,0.3)');
        g.addColorStop(1, 'rgba(150,150,255,0)');
        c.fillStyle = g;
        c.beginPath(); c.arc(0, 0, r, 0, TAU); c.fill();
        c.strokeStyle = 'rgba(40,30,60,0.35)';
        c.lineWidth = Math.max(1, r * 0.04);
        c.beginPath(); c.arc(0, r * 0.08, r * 0.45, Math.PI * 1.1, Math.PI * 1.9); c.stroke();
        c.restore();
        break;
      }
    }
  }

  // ---------- Zeichnen: Hintergrund & Ebenen ----------

  function orbitEllipse(cx, cy, r) {
    const k = Z();
    const ry = tilted() ? r * k * Math.abs(Math.cos(rot.pitch)) : r * k;
    ctx.beginPath(); ctx.ellipse(cx, cy, Math.max(r * k, 0.3), Math.max(ry, 0.3), 0, 0, TAU);
  }

  function drawOrbits(P) {
    const sun = w2s(0, 0, 0, P);
    for (const b of SYSTEM) {
      if (!b.orbit) continue;
      const sel = state.selected === b || state.hover === b;
      if (b.parentBody) {
        if (!isVisible(b)) continue;
        const p = w2sp(posOf(b.parentBody), P);
        ctx.strokeStyle = sel ? 'rgba(230,230,240,0.75)' : 'rgba(200,200,225,0.22)';
        ctx.lineWidth = 1;
        orbitEllipse(p.x, p.y, b.orbit); ctx.stroke();
        continue;
      }
      ctx.strokeStyle = sel ? hexA(b.color, 0.8) : 'rgba(150,170,255,0.2)';
      ctx.lineWidth = sel ? 2 : 1;
      orbitEllipse(sun.x, sun.y, b.orbit); ctx.stroke();
    }
  }

  function drawBelt(P) {
    const sz = clamp(Z() * 0.7, 0.8, 1.8);
    for (const a of belt) {
      const ang = a.ang + TAU * state.days / a.period;
      const s = w2s(Math.cos(ang) * a.a, -Math.sin(ang) * a.a, 0, P);
      if (s.x < -5 || s.y < -5 || s.x > W + 5 || s.y > H + 5) continue;
      ctx.fillStyle = `rgb(${a.l},${a.l - 10},${a.l - 25})`;
      const q = sz * a.s;
      if (q < 1.5) ctx.fillRect(s.x - q / 2, s.y - q / 2, q, q);
      else { ctx.beginPath(); ctx.arc(s.x, s.y, q / 2, 0, TAU); ctx.fill(); }
    }
  }

  function drawStarGrid(P) {
    const c0 = w2s(0, 0, 0, P);
    const k = Z();
    ctx.lineWidth = 1;
    ctx.font = '500 12px Fredoka, "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    for (const r of [5, 10, 15, 20, 25]) {
      ctx.strokeStyle = 'rgba(150,170,255,0.18)';
      orbitEllipse(c0.x, c0.y, r * LJ); ctx.stroke();
      if (state.showNames && r * LJ * k > 40) {
        ctx.fillStyle = 'rgba(170,185,240,0.7)';
        ctx.fillText(`${r} Lichtjahre`, c0.x, c0.y - r * LJ * k * Math.abs(P.cp) - 5);
      }
    }
    // Stiele: zeigen, wie weit ein Stern über oder unter unserer Ebene liegt
    ctx.setLineDash([3, 4]);
    for (const s of STARS) {
      if (!s.lj) continue;
      const a = w2sp(s.pos, P), b = w2s(s.pos.x, s.pos.y, 0, P);
      ctx.strokeStyle = hexA(s.color, 0.35);
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      ctx.fillStyle = hexA(s.color, 0.35);
      ctx.beginPath(); ctx.ellipse(b.x, b.y, 3, Math.max(0.5, 3 * Math.abs(P.cp)), 0, 0, TAU); ctx.fill();
    }
    ctx.setLineDash([]);
  }

  function drawGalaxy(P) {
    const k = Z();
    const c0 = w2s(0, 0, 0, P);
    const cp = Math.max(Math.abs(P.cp), 0.03);
    // Leuchtende Scheibe
    ctx.save();
    ctx.translate(c0.x, c0.y);
    ctx.scale(1, cp);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 540 * k);
    g.addColorStop(0, 'rgba(255,230,180,0.35)');
    g.addColorStop(0.25, 'rgba(160,170,255,0.12)');
    g.addColorStop(1, 'rgba(120,130,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(0, 0, 540 * k, 0, TAU); ctx.fill();
    ctx.restore();
    // Sterne der Milchstraße
    const q = clamp(k * 1.1, 0.8, 2.2);
    for (const p of galPts) {
      const dx = p.x - cam.x, dy = p.y - cam.y;
      const rx = dx * P.cy - dy * P.sy, ry = dx * P.sy + dy * P.cy;
      const x = rx * k + P.cx, y = (ry * P.cp - p.z * P.sp) * k + P.cyy;
      if (x < -3 || y < -3 || x > W + 3 || y > H + 3) continue;
      ctx.fillStyle = p.col;
      const s = q * p.s;
      ctx.fillRect(x - s / 2, y - s / 2, s, s);
    }
    // Helles Zentrum (eine Kugel, darum rund)
    const g2 = ctx.createRadialGradient(c0.x, c0.y, 0, c0.x, c0.y, 75 * k);
    g2.addColorStop(0, 'rgba(255,245,215,0.85)');
    g2.addColorStop(0.35, 'rgba(255,215,150,0.35)');
    g2.addColorStop(1, 'rgba(255,200,120,0)');
    ctx.fillStyle = g2;
    ctx.beginPath(); ctx.arc(c0.x, c0.y, 75 * k, 0, TAU); ctx.fill();

    if (galaxyTiny()) {
      ctx.save();
      ctx.translate(c0.x, c0.y);
      ctx.scale(1, cp);
      const r = Math.max(540 * k, 6);
      const g3 = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
      g3.addColorStop(0, 'rgba(255,245,215,1)');
      g3.addColorStop(0.2, 'rgba(255,220,170,0.7)');
      g3.addColorStop(0.6, 'rgba(170,180,255,0.3)');
      g3.addColorStop(1, 'rgba(150,160,255,0)');
      ctx.fillStyle = g3;
      ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();
      ctx.restore();
      if (state.showNames) {
        ctx.font = '600 14px Fredoka, "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffd77a';
        ctx.fillText('Milchstraße (unsere Galaxie)', c0.x, c0.y + Math.max(540 * k * cp, 6) + 20);
      }
    }
    if (state.showNames && k > 0.12 && k < 3) {
      ctx.font = 'italic 500 13px Fredoka, "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(200,210,255,0.75)';
      window.GALAXY_ARMS.forEach((arm, i) => {
        const th = armTheta(i, arm.labelR);
        const s = w2s(Math.cos(th) * arm.labelR, Math.sin(th) * arm.labelR, 0, P);
        ctx.fillText(arm.name, s.x, s.y);
      });
      const s = w2sp(byId.du.pos, P);
      ctx.fillStyle = 'rgba(255,225,140,0.85)';
      ctx.fillText('Orion-Arm (hier wohnen wir)', s.x, s.y - 26);
    }
  }

  // ---------- Beschriftungen & Pfeile ----------
  function drawLabels(items) {
    ctx.font = '600 14px Fredoka, "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const placed = [];
    const hit = r => placed.some(p => r.x < p.x + p.w && r.x + r.w > p.x && r.y < p.y + p.h && r.y + r.h > p.y);
    const prio = x => (x.b === state.selected) * 8 + (x.b === state.hover) * 4 + (x.b.id === 'erde' || x.b.id === 'du' || x.b.id === 's_sonne') * 2 + !x.b.parentBody;
    items.sort((a, b) => prio(b) - prio(a));
    for (const it of items) {
      const w = ctx.measureText(it.b.name).width + 16;
      const ext = it.b.rings ? it.R * (state.view === 'size' ? 0.9 : 1.75) : it.R;
      const cands = it.custom ? [it.custom] : [{ x: it.x, y: it.y + ext + 15 }, { x: it.x, y: it.y - ext - 15 }];
      for (const p0 of cands) {
        if (p0.x < -w || p0.x > W + w) continue;
        const p = { x: clamp(p0.x, w / 2 + 4, W - w / 2 - 4), y: p0.y };
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
    ctx.textBaseline = 'alphabetic';
  }

  // Pfeile am Rand zu wichtigen Zielen, die gerade nicht zu sehen sind
  let arrowHits = [];
  function drawArrows(P) {
    arrowHits = [];
    if (state.view === "size") return;
    for (const b of bodies()) {
      if (!b.arrow) continue;
      const s = w2sp(posOf(b), P);
      const m = 30;
      if (s.x > m && s.x < W - m && s.y > m && s.y < H - m) continue;
      const c = center();
      const dx = s.x - c.x, dy = s.y - c.y;
      const left = W > 900 ? 300 : 30, top = W > 900 ? 150 : 140, bottom = W > 900 ? 140 : 200;
      const right = document.body.classList.contains('info-open') && W > 900 ? 420 : 80;
      const tx = dx > 0 ? (W - right - c.x) / dx : (left - c.x) / dx;
      const ty = dy > 0 ? (H - bottom - c.y) / dy : (top - c.y) / dy;
      const t = Math.min(Math.abs(tx), Math.abs(ty));
      const x = c.x + dx * t, y = c.y + dy * t;
      const a = Math.atan2(dy, dx);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(a);
      ctx.fillStyle = 'rgba(255,201,60,0.95)';
      ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(-6, -9); ctx.lineTo(-2, 0); ctx.lineTo(-6, 9); ctx.fill();
      ctx.restore();
      const name = b.id === 'du' ? 'Sonne' : b.id === 's_sonne' ? 'Sonne' : b.name;
      ctx.font = '600 13px Fredoka, "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const lx = x - Math.cos(a) * 34, ly = y - Math.sin(a) * 22;
      const w = ctx.measureText(name).width + 14;
      ctx.fillStyle = 'rgba(8,10,28,0.75)';
      ctx.beginPath(); ctx.roundRect(lx - w / 2, ly - 10, w, 20, 10); ctx.fill();
      ctx.fillStyle = '#ffd77a';
      ctx.fillText(name, lx, ly + 1);
      ctx.textBaseline = 'alphabetic';
      arrowHits.push({ b, x, y }, { b, x: lx, y: ly });
    }
  }

  // ---------- Hauptbild ----------
  function draw() {
    // Hintergrund: einfach schwarz – Sterne gibt es nur dort, wo wirklich welche sind
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);

    const v = state.view;
    const P = proj();
    if (v === 'orbit') { if (state.showOrbits) drawOrbits(P); drawBelt(P); }
    if (v === 'stars') drawStarGrid(P);
    if (v === 'galaxy') drawGalaxy(P);

    const sunS = (v === 'orbit' || v === 'size') ? w2sp(posOf(byId.sonne), P) : null;
    const items = [];
    for (const b of bodies()) {
      if (!isVisible(b)) continue;
      const s = w2sp(posOf(b), P);
      const R = screenR(b);
      const ext = b.rings ? R * 2.3 : b.id === 'sonne' ? R * 3.3 : R * 3.5;
      if (s.x + ext < -50 || s.x - ext > W + 50 || s.y + ext < -50 || s.y - ext > H + 50) continue;
      items.push({ b, s, R });
    }
    items.sort((a, b) => a.s.d - b.s.d);

    const labels = [];
    const ringFlat = v === 'size' ? 0.22 : 0.12 + 0.6 * Math.abs(P.cp);
    for (const { b, s, R } of items) {
      if (v === 'stars') drawStarPoint(ctx, s.x, s.y, R, b.color, state.time);
      else if (v === 'galaxy') drawGalaxyObject(ctx, b, s, R);
      else if (b.id === 'sonne') drawSun(ctx, s.x, s.y, R, state.time, v === 'orbit' ? 3.2 : 1.12);
      else if (R < 1.6) { ctx.fillStyle = b.color; ctx.beginPath(); ctx.arc(s.x, s.y, 1.6, 0, TAU); ctx.fill(); }
      else drawPlanet(ctx, b, s.x, s.y, R, v === 'orbit' ? Math.atan2(sunS.y - s.y, sunS.x - s.x) : Math.PI, ringFlat);

      if (state.selected === b) {
        const pr = (b.rings ? R * 2.35 : Math.max(R, 6)) + 7 + Math.sin(state.time * 4) * 2;
        if (pr < Math.max(W, H)) {
          ctx.strokeStyle = 'rgba(255,201,60,0.9)';
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 6]);
          ctx.lineDashOffset = -state.time * 20;
          ctx.beginPath(); ctx.arc(s.x, s.y, pr, 0, TAU); ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      if (state.showNames) {
        if (b.id === 'sonne' && v === 'size') {
          const e = w2s(b.sizeR * SIZE_UNIT, 0, 0, P);
          labels.push({ b, x: s.x, y: s.y, R, custom: { x: clamp(e.x - 50, 60, W - 60), y: H / 2 - 120 } });
        } else if (R < H * 0.4 && !(b.parentBody && v === 'orbit' && moonOrbitPx(b) < 30) && !(v === 'galaxy' && galaxyTiny() && b.id !== 'andromeda')) {
          labels.push({ b, x: s.x, y: s.y, R: Math.max(R, 2) });
        }
      }
    }
    if (v === 'orbit' && state.showNames && Z() > 0.45 && Z() < 6) {
      ctx.font = 'italic 500 12px Fredoka, "Segoe UI", sans-serif';
      ctx.fillStyle = 'rgba(200,200,220,0.65)';
      ctx.textAlign = 'center';
      const s = w2s(0, -238, 0, P);
      ctx.fillText('Asteroidengürtel', s.x, s.y);
    }
    if (labels.length) drawLabels(labels);
    if (!trans) drawArrows(P);
  }

  // ---------- Treffer-Test ----------
  function hitTest(sx, sy) {
    for (const a of arrowHits) if (Math.hypot(sx - a.x, sy - a.y) < 22) return a.b;
    const P = proj();
    let best = null, bestScore = Infinity;
    for (const b of bodies()) {
      if (!isClickable(b)) continue;
      const s = w2sp(posOf(b), P);
      const R = screenR(b);
      const d = Math.hypot(sx - s.x, sy - s.y);
      if (d > Math.max(R, 20)) continue;
      const score = (d <= R ? 0 : 1e6) + (d <= R ? R - s.d * 1e-6 : d);
      if (score < bestScore) { bestScore = score; best = b; }
    }
    return best;
  }

  // ---------- Rakete ----------
  const IGNITION = 0.5;
  const rocket = { mode: 'none', x: 0, y: 0, ang: -Math.PI / 2, target: null, t: 0, dur: 2.4, S: ORIGIN, a0: 0, side: 1, orbitAng: 0, v: 0, alpha: 1, puffT: 0, flame: 0 };
  const smoke = [];   // in Weltkoordinaten, bleibt im Raum stehen
  const sparks = [];  // auf dem Bildschirm

  function parkRadius(b) {
    const R = screenR(b);
    return (b.rings ? R * 2.3 : Math.max(R, 4)) + 18;
  }
  function rocketWorld(u) {
    const T = posOf(rocket.target), S = rocket.S;
    const dx = T.x - S.x, dy = T.y - S.y, D = Math.hypot(dx, dy) || 1;
    const C = {
      x: (S.x + T.x) / 2 - dy * 0.22 * rocket.side,
      y: (S.y + T.y) / 2 + dx * 0.22 * rocket.side,
      z: ((S.z || 0) + (T.z || 0)) / 2 + D * 0.3
    };
    const a = 1 - u;
    return {
      x: a * a * S.x + 2 * a * u * C.x + u * u * T.x,
      y: a * a * S.y + 2 * a * u * C.y + u * u * T.y,
      z: a * a * (S.z || 0) + 2 * a * u * C.z + u * u * (T.z || 0)
    };
  }
  const AT_TARGET = ['park', 'approach', 'descend', 'landed', 'hover'];
  const atTarget = () => AT_TARGET.includes(rocket.mode);
  // Landen geht auf Planeten und Monden – Sonne und Sterne werden umkreist
  const canLand = b => (state.view === 'orbit' || state.view === 'size') && b.id !== 'sonne';
  function launchStart(b) {
    if (rocket.mode === 'fly') return rocketWorld(ease(clamp((rocket.t - IGNITION) / rocket.dur, 0, 1)));
    if (atTarget() && rocket.target) return { ...posOf(rocket.target) };
    if (state.view === 'stars') return ORIGIN;
    if (state.view === 'galaxy') return { ...byId.du.pos };
    // Im Sonnensystem startet die Rakete auf der Erde (oder auf dem Mond, wenn sie zur Erde soll)
    return { ...posOf(b.id === 'erde' ? byId.mond : byId.erde) };
  }

  function launchRocket(b) {
    const S = launchStart(b);
    const fresh = rocket.mode !== 'fly' && !atTarget();
    Object.assign(rocket, { mode: 'fly', target: b, t: 0, S, alpha: 1, side: Math.random() < 0.5 ? 1 : -1, flame: 0 });
    const P = proj();
    const sS = w2sp(S, P), sT = w2sp(posOf(b), P);
    const mid = w2sp(rocketWorld(0.85), P);
    rocket.a0 = Math.hypot(mid.x - sT.x, mid.y - sT.y) > 2 ? Math.atan2(mid.y - sT.y, mid.x - sT.x) : -Math.PI / 2;
    const D = Math.hypot(posOf(b).x - S.x, posOf(b).y - S.y);
    rocket.dur = clamp(1.9 + 0.12 * Math.log(1 + D * cam.z / 40), 1.9, 2.8);
    if (fresh) {
      const n = w2sp(rocketWorld(0.02), P);
      rocket.ang = Math.atan2(n.y - sS.y, n.x - sS.x) || -Math.PI / 2;
      rocket.x = sS.x; rocket.y = sS.y;
    }
    // Start dort, wo die Rakete gerade steht (z. B. auf der Oberfläche), und sanft auf die Bahn einschwenken
    rocket.offX = rocket.x - sS.x; rocket.offY = rocket.y - sS.y;

    // Kamera begleitet die Rakete: kurz aufholen, unterwegs etwas herauszoomen, am Ziel hineinzoomen
    state.follow = b;
    const m = Math.min(W, H);
    const tz = clamp(focusZoom(b), viewCfg().min, viewCfg().max);
    const zFit = m * 0.42 / Math.max(D, 1e-6);
    const midLog = (Math.log(cam.z) + Math.log(tz)) / 2;
    startFlight({
      target: () => rocketWorld(ease(clamp((rocket.t - IGNITION) / rocket.dur, 0, 1))),
      tz, dur: rocket.dur, delay: IGNITION, catchUp: 0.35,
      bump: Math.max(0, midLog - Math.log(zFit))
    });
  }

  function addSmoke(sx, sy, zh, big) {
    const w = s2w(sx, sy, zh);
    smoke.push({ x: w.x, y: w.y, z: zh, r: big ? 4 : 2.5, life: 1, decay: big ? 1.0 : 1.6 });
  }
  function sparkle(x, y) {
    const cols = ['#ffc93c', '#ff8a3d', '#ffffff', '#6aa8ff'];
    for (let i = 0; i < 26; i++) {
      const a = Math.random() * TAU, v = 60 + Math.random() * 110;
      sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: 2 + Math.random() * 2, life: 1, col: cols[i % cols.length] });
    }
  }
  function turnTo(target, dt, speed) {
    rocket.ang += wrapAngle(target - rocket.ang) * (1 - Math.exp(-dt * speed));
  }

  // Landeanflug: über den Planeten schwenken, Nase hoch, abbremsen, aufsetzen.
  // Gas- und Eisriesen haben keinen festen Boden – dort schwebt die Rakete über den Wolken.
  const APPROACH = 1.0, DESCEND = 1.5;
  function landingStep(dt, P) {
    const b = rocket.target;
    const c = w2sp(posOf(b), P);
    const R = Math.max(screenR(b), 3);
    const gas = !!b.gas;
    const surf = R + (gas ? 26 : 15), hover = R + 65;
    const UP = -Math.PI / 2;
    rocket.phaseT += dt;
    if (rocket.mode === 'approach') {
      const t = clamp(rocket.phaseT / APPROACH, 0, 1), e = ease(t);
      const da = wrapAngle(UP - rocket.orbitAng);
      const at = r0 => rocket.orbitAng + da * r0;
      const pr = parkRadius(b);
      const pos = r0 => ({ x: c.x + Math.cos(at(r0)) * lerp(pr, hover, r0), y: c.y + Math.sin(at(r0)) * lerp(pr, hover, r0) });
      const p = pos(e), q = pos(Math.min(1, e + 0.03));
      const move = Math.atan2(q.y - p.y, q.x - p.x);
      const k = clamp((t - 0.45) / 0.55, 0, 1);
      turnTo(k > 0 ? move + wrapAngle(UP - move) * k : move, dt, 9);
      rocket.x = p.x; rocket.y = p.y;
      rocket.flame = 0.75;
      puff(dt, 0.04, true);
      if (t >= 1) { rocket.mode = 'descend'; rocket.phaseT = 0; }
    } else if (rocket.mode === 'descend') {
      const t = clamp(rocket.phaseT / DESCEND, 0, 1);
      const e = 1 - Math.pow(1 - t, 3);          // wird immer langsamer
      const r = lerp(hover, surf, e);
      turnTo(UP, dt, 12);
      rocket.x = c.x + Math.sin(state.time * 9) * (1 - t) * 1.5;
      rocket.y = c.y - r;
      rocket.flame = lerp(0.95, gas ? 0.5 : 0.35, t);
      puff(dt, 0.05, true);
      if (t >= 1) {
        rocket.mode = gas ? 'hover' : 'landed';
        rocket.phaseT = 0;
        if (gas) rocket.flame = 0.5; else { rocket.flame = 0; dust(c.x, c.y - R); }
        if (state.selected === b) openInfo(b);
      }
    } else if (rocket.mode === 'hover') {
      // Sanft auf und ab schweben, die Flamme bleibt an
      const bob = Math.sin(rocket.phaseT * 2.2) * 3;
      rocket.x = c.x + Math.sin(rocket.phaseT * 1.3) * 1.5;
      rocket.y = c.y - surf + bob;
      turnTo(UP + Math.sin(rocket.phaseT * 1.7) * 0.06, dt, 6);
      rocket.flame = 0.45 + Math.cos(rocket.phaseT * 2.2) * 0.12;
      puff(dt, 0.1, false);
    } else {
      rocket.x = c.x; rocket.y = c.y - surf;
      rocket.ang = UP;
      rocket.flame = 0;
    }
  }
  function puff(dt, every, big) {
    rocket.puffT -= dt;
    if (rocket.puffT > 0) return;
    const z = rocket.target ? (posOf(rocket.target).z || 0) : 0;
    addSmoke(rocket.x - Math.cos(rocket.ang) * 16, rocket.y - Math.sin(rocket.ang) * 16, z, big);
    rocket.puffT = every;
  }
  function dust(x, y) {
    for (let i = 0; i < 22; i++) {
      const dir = i % 2 ? 1 : -1, v = 30 + Math.random() * 70;
      sparks.push({ x: x + dir * 4, y, vx: dir * v, vy: -Math.random() * 35, r: 1.5 + Math.random() * 2.5, life: 1, col: i % 3 ? '#c9c2b4' : '#ffffff' });
    }
  }

  function updateRocket(dt) {
    const P = proj();
    if (rocket.mode === 'fly') {
      const b = rocket.target;
      rocket.t += dt;
      const tt = clamp((rocket.t - IGNITION) / rocket.dur, 0, 1);
      const u = ease(tt);
      const W0 = rocketWorld(u);
      const s = w2sp(W0, P);
      // Am Ende sanft in die Parkbahn um das Ziel einschwenken
      const blend = clamp((tt - 0.7) / 0.3, 0, 1);
      const bl = blend * blend * (3 - 2 * blend);
      const pr = parkRadius(b);
      const st = clamp(tt / 0.3, 0, 1), sk = 1 - st * st * (3 - 2 * st);
      const nx = s.x + Math.cos(rocket.a0) * pr * bl + rocket.offX * sk;
      const ny = s.y + Math.sin(rocket.a0) * pr * bl + rocket.offY * sk;
      // Richtung: wohin die Bahn gerade zeigt
      const ahead = w2sp(rocketWorld(Math.min(1, u + 0.02)), P);
      let want = Math.atan2(ahead.y - s.y, ahead.x - s.x);
      if (u > 0.985) want = rocket.a0 - Math.PI / 2;
      turnTo(want, dt, tt === 0 ? 5 : 9);
      // Zünden: Flamme wird größer, Rakete zittert
      rocket.flame = Math.min(1, rocket.flame + dt * 2.2);
      const shake = tt === 0 ? (Math.random() - 0.5) * 1.6 * rocket.flame : 0;
      rocket.x = nx + shake; rocket.y = ny + shake;
      rocket.puffT -= dt;
      if (rocket.puffT <= 0) {
        addSmoke(rocket.x - Math.cos(rocket.ang) * 16, rocket.y - Math.sin(rocket.ang) * 16, W0.z, true);
        rocket.puffT = tt === 0 ? 0.06 : 0.025;
      }
      if (tt >= 1) {
        rocket.orbitAng = rocket.a0;
        rocket.phaseT = 0;
        if (canLand(b)) {
          rocket.mode = 'approach';
        } else {
          rocket.mode = 'park';
          const c = w2sp(posOf(b), P);
          sparkle(c.x, c.y);
          if (state.selected === b) openInfo(b);
        }
      }
    } else if (['approach', 'descend', 'landed', 'hover'].includes(rocket.mode)) {
      landingStep(dt, P);
    } else if (rocket.mode === 'park') {
      const b = rocket.target;
      rocket.orbitAng -= dt * 1.3;
      const c = w2sp(posOf(b), P), pr = parkRadius(b);
      rocket.x = c.x + Math.cos(rocket.orbitAng) * pr;
      rocket.y = c.y + Math.sin(rocket.orbitAng) * pr;
      turnTo(rocket.orbitAng - Math.PI / 2, dt, 10);
      rocket.flame = 0.55;
      rocket.puffT -= dt;
      if (rocket.puffT <= 0) { addSmoke(rocket.x - Math.cos(rocket.ang) * 14, rocket.y - Math.sin(rocket.ang) * 14, posOf(b).z || 0, false); rocket.puffT = 0.08; }
    } else if (rocket.mode === 'leave') {
      rocket.v += 500 * dt;
      rocket.x += Math.cos(rocket.ang) * rocket.v * dt;
      rocket.y += Math.sin(rocket.ang) * rocket.v * dt;
      rocket.alpha -= dt * 1.1;
      rocket.flame = 1;
      addSmoke(rocket.x - Math.cos(rocket.ang) * 16, rocket.y - Math.sin(rocket.ang) * 16, 0, true);
      if (rocket.alpha <= 0) rocket.mode = 'none';
    }
    for (let i = smoke.length - 1; i >= 0; i--) {
      const p = smoke[i];
      p.life -= dt * p.decay;
      if (p.life <= 0) smoke.splice(i, 1); else p.r += dt * 8;
    }
    for (let i = sparks.length - 1; i >= 0; i--) {
      const p = sparks[i];
      p.life -= dt * 1.3;
      if (p.life <= 0) { sparks.splice(i, 1); continue; }
      p.x += p.vx * dt; p.y += p.vy * dt;
    }
  }

  function drawRocket() {
    const P = proj();
    for (const p of smoke) {
      const s = w2sp(p, P);
      ctx.globalAlpha = Math.max(0, p.life) * 0.45;
      ctx.fillStyle = '#d9dcef';
      ctx.beginPath(); ctx.arc(s.x, s.y, p.r, 0, TAU); ctx.fill();
    }
    for (const p of sparks) {
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.col;
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
    const fl = rocket.flame * ((rocket.mode === 'park' ? 7 : 12) + Math.random() * 6);
    if (fl > 0.5) {
      ctx.fillStyle = '#ff7a1a';
      ctx.beginPath(); ctx.moveTo(-L * 0.42, -5); ctx.lineTo(-L * 0.42 - fl, 0); ctx.lineTo(-L * 0.42, 5); ctx.fill();
      ctx.fillStyle = '#ffe066';
      ctx.beginPath(); ctx.moveTo(-L * 0.42, -2.8); ctx.lineTo(-L * 0.42 - fl * 0.6, 0); ctx.lineTo(-L * 0.42, 2.8); ctx.fill();
    }
    // Landebeine
    if (rocket.mode === 'landed' || (rocket.mode === 'descend' && rocket.phaseT > 0.5 && !rocket.target.gas)) {
      ctx.strokeStyle = '#b9bfd6';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-L * 0.28, -5); ctx.lineTo(-L * 0.54, -10);
      ctx.moveTo(-L * 0.28, 5); ctx.lineTo(-L * 0.54, 10);
      ctx.stroke();
    }
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
  function bigYears(y) {
    if (y >= 1e12) return `ca. ${fmt(y / 1e12, 1)} Billionen Jahre`;
    if (y >= 1e9) return `ca. ${fmt(y / 1e9, 1)} Milliarden Jahre`;
    return `ca. ${fmt(y / 1e6)} Millionen Jahre`;
  }
  function factRows(b) {
    if (b.lj != null) {
      return [
        ['📍', 'Entfernung von der Sonne', `${fmt(b.lj, b.lj < 20 ? 1 : 0)} Lichtjahre`],
        ['💡', 'Das Licht braucht bis zu uns', `ca. ${fmt(b.lj, b.lj < 20 ? 1 : 0)} Jahre`],
        ['🚗', 'Mit dem Auto (100 km/h)', bigYears(b.lj * 1.0793e7) + ' ohne Pause!'],
        ...(b.extra || [])
      ];
    }
    return [
      ['📏', 'Durchmesser', fmt(b.diameterKm) + ' km'],
      b.distanceKm && ['📍', b.distLabel || `Entfernung zur ${b.distanceFrom}`, distText(b.distanceKm)],
      b.year && ['🔄', b.yearLabel || 'Ein Jahr (eine Runde um die Sonne)', b.year],
      b.day && ['🌗', 'Ein Tag', b.day],
      b.temp && ['🌡️', 'Temperatur', b.temp],
      b.moons && ['🌙', 'Monde', b.moons],
      b.distanceKm && b.car !== false && ['🚗', `Mit dem Auto (100 km/h) zur ${b.distanceFrom}`, carText(b.distanceKm) + ' ohne Pause!']
    ].filter(Boolean);
  }

  function drawBall(c, b, x, y, R) {
    if (b.id === 'sonne') drawSun(c, x, y, R, 0, 1);
    else if (b.lj != null) drawStarBall(c, x, y, R, b.color);
    else drawPlanet(c, b, x, y, R, -2.4, 0.4);
  }

  function drawInfoPic(b) {
    const c = infoPic.getContext('2d');
    const S = 110, d = Math.min(window.devicePixelRatio || 1, 2);
    infoPic.width = S * d; infoPic.height = S * d;
    c.setTransform(d, 0, 0, d, 0, 0);
    c.clearRect(0, 0, S, S);
    if (b.id === 'sonne') { drawSun(c, S / 2, S / 2, 30, 0, 1.75); return; }
    if (b.lj != null && (b.render === 'star' || !b.render)) { drawStarPoint(c, S / 2, S / 2, 13, b.color, 0); return; }
    if (b.render) {
      const R = b.render === 'galaxy' ? 52 : b.render === 'blob' ? 34 : b.render === 'cluster' ? 22 : 12;
      drawGalaxyObject(c, b, { x: S / 2, y: S / 2 }, R);
      return;
    }
    drawPlanet(c, b, S / 2, S / 2, b.rings ? 21 : 40, -2.4, 0.4);
  }

  function drawCompare(b) {
    const box = $('compareBox');
    const ref = b.sizeSun ? byId.sonne : byId.erde;
    const rB = b.sizeSun || b.sizeR;
    if (!rB || !b.compare) { box.style.display = 'none'; return; }
    box.style.display = '';
    $('cmpTitle').textContent = `📐 So groß im Vergleich zur ${ref === byId.sonne ? 'Sonne' : 'Erde'}`;
    const c = cmp.getContext('2d');
    const w = cmp.clientWidth || 300, h = cmp.clientHeight || 130;
    const d = Math.min(window.devicePixelRatio || 1, 2);
    cmp.width = w * d; cmp.height = h * d;
    c.setTransform(d, 0, 0, d, 0, 0);
    c.clearRect(0, 0, w, h);
    c.font = '500 13px Fredoka, "Segoe UI", sans-serif';
    c.textAlign = 'center';
    const cy = h / 2 - 8;
    const rA = 1;

    if (b === ref) {
      drawBall(c, b, w / 2, cy, 40);
      c.fillStyle = '#dfe4ff';
      c.fillText(b.name, w / 2, h - 6);
      return;
    }
    const big = rB >= rA ? b : ref, small = big === b ? ref : b;
    const ratio = Math.max(rA, rB) / Math.min(rA, rB);
    if (ratio > 12) {
      const R = 420;
      drawBall(c, big, w * 0.5 - R, cy, R);
      drawBall(c, small, w * 0.78, cy, Math.max(R / ratio, 1.5));
      c.fillStyle = '#dfe4ff';
      c.textAlign = 'left';
      c.fillText('← ' + small.name, w * 0.78 + 10, cy + 4);
      c.fillStyle = big.lj != null || big.id === 'sonne' ? '#4a2000' : '#ffffff';
      c.fillText(big.name, 10, h - 8);
      return;
    }
    const ringA = ref.rings ? 2.25 : 1, ringB = b.rings ? 2.25 : 1;
    const s = h * 0.36 / Math.max(rA * ringA, rB * ringB);
    const xA = w * 0.3, xB = w * 0.68;
    drawBall(c, ref, xA, cy, Math.max(rA * s, 1.5));
    drawBall(c, b, xB, cy, Math.max(rB * s, 1.5));
    c.fillStyle = '#dfe4ff';
    c.fillText(ref.name, xA, h - 6);
    c.fillText(b.name, xB, h - 6);
  }

  function openInfo(b) {
    $('infoName').textContent = b.name;
    $('infoKind').textContent = b.kind;
    $('infoIntro').textContent = b.intro;
    $('infoTip').textContent = b.tip ? '⚠️ ' + b.tip : '';
    $('infoFun').textContent = b.fun;
    $('infoCompare').textContent = b.compare || '';

    const facts = $('infoFacts');
    facts.innerHTML = '';
    for (const [ico, lbl, val] of factRows(b)) {
      const el = document.createElement('div');
      el.className = 'fact';
      el.innerHTML = '<span class="ico"></span><div><div class="lbl"></div><div class="val"></div></div>';
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
    if (rocket.mode === 'fly' || atTarget()) { rocket.mode = 'leave'; rocket.v = 120; }
    state.selected = null;
    document.body.classList.remove('info-open');
    $('info').setAttribute('aria-hidden', 'true');
    updateBar();
  }

  function select(b) {
    if (trans) return;
    if (b.enter) { goToView(b.enter); return; }
    stopSpeaking();
    state.selected = b;
    if (atTarget() && rocket.target === b) {
      flyTo(b);
      openInfo(b);
    } else {
      document.body.classList.remove('info-open');  // Karte kommt, wenn die Rakete ankommt
      launchRocket(b);
    }
    updateBar();
  }

  // ---------- Ansichten wechseln (mit Zoom-Übergang) ----------
  const snap = document.createElement('canvas');
  const NOTES = {
    orbit: 'Psst: Hier sind Größen und Abstände nicht echt – sonst würdest du die Planeten gar nicht sehen! Zoome weit hinaus, um zu den Nachbarsternen zu reisen.',
    size: 'Hier siehst du die echten Größen nebeneinander. Die Sonne ist so riesig, dass nur ein kleines Stück von ihr auf den Bildschirm passt!',
    stars: 'Ein Lichtjahr ist der Weg, den Licht in einem Jahr schafft – fast 10 Billionen Kilometer! Die gestrichelten Linien zeigen, wie weit ein Stern über oder unter uns liegt.',
    galaxy: 'Unsere Sonne ist nur einer von über 100 Milliarden Sternen in der Milchstraße. Zoome noch weiter hinaus, dann findest du die Andromeda-Galaxie!'
  };
  const SUBS = {
    orbit: 'Klick auf einen Planeten oder Mond – deine Rakete fliegt hin! 🚀',
    size: 'Wie groß sind die Planeten wirklich?',
    stars: 'Unsere Nachbarsterne – klick einen an!',
    galaxy: 'Die Milchstraße – unsere Galaxie'
  };

  function applyView(v) {
    state.view = v;
    document.body.dataset.view = v;
    for (const btn of document.querySelectorAll('.modes button')) btn.classList.toggle('active', btn.dataset.mode === v);
    $('note').textContent = NOTES[v];
    $('modeSub').textContent = SUBS[v];
    buildBar();
  }

  function goToView(v) {
    if (trans || v === state.view) return;
    const from = state.view;
    // Bild vom alten Zustand merken
    snap.width = canvas.width; snap.height = canvas.height;
    snap.getContext('2d').drawImage(canvas, 0, 0);
    const pivot = w2sp(anchorOf(from));
    const dir = (from === 'size' || v === 'size') ? 'fade' : ORDER[v] > ORDER[from] ? 'out' : 'in';

    stopSpeaking();
    state.selected = null;
    document.body.classList.remove('info-open');
    rocket.mode = 'none';
    smoke.length = 0; sparks.length = 0;
    stopMotion();
    applyView(v);
    Object.assign(cam, homeView());
    if (v === 'galaxy' && from === 'stars') { cam.x = byId.du.pos.x * 0.6; cam.y = byId.du.pos.y * 0.6; }
    if (v === 'size') { rot.yaw = 0; rot.pitch = 0; }
    trans = { t: 0, dur: 1.0, dir, pivot };
    updateBar();
  }

  function drawTransition(dt) {
    trans.t += dt;
    const tt = clamp(trans.t / trans.dur, 0, 1), e = ease(tt);
    zoomMul = trans.dir === 'out' ? lerp(3.5, 1, e) : trans.dir === 'in' ? lerp(0.25, 1, e) : 1;
    return e;
  }
  function overlayTransition(e) {
    ctx.fillStyle = `rgba(3,4,11,${(1 - e) * 0.9})`;
    ctx.fillRect(0, 0, W, H);
    const a = w2sp(anchorOf(state.view));
    const s = trans.dir === 'out' ? lerp(1, 0.05, e) : trans.dir === 'in' ? lerp(1, 8, e) : 1;
    const px = lerp(trans.pivot.x, a.x, e), py = lerp(trans.pivot.y, a.y, e);
    ctx.save();
    ctx.globalAlpha = Math.pow(1 - e, trans.dir === 'in' ? 1.6 : 1);
    ctx.translate(px, py);
    ctx.scale(s, s);
    ctx.translate(-trans.pivot.x, -trans.pivot.y);
    ctx.drawImage(snap, 0, 0, W, H);
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
  function buildBar() {
    bar.innerHTML = '';
    for (const b of bodies()) {
      if (b.bar === false) continue;
      const btn = document.createElement('button');
      btn.dataset.id = b.id;
      btn.innerHTML = `<span class="dot" style="--c:${b.color}"></span><span></span>`;
      btn.lastChild.textContent = b.id === 'du' || b.id === 's_sonne' ? 'Sonne' : b.name;
      btn.addEventListener('click', () => select(b));
      bar.appendChild(btn);
    }
    bar.scrollLeft = 0;
  }
  function updateBar() {
    for (const btn of bar.children) btn.classList.toggle('active', !!state.selected && btn.dataset.id === state.selected.id);
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
  $('zoomIn').addEventListener('click', () => { const c = center(); zoomAt(c.x, c.y, 1.6); });
  $('zoomOut').addEventListener('click', () => { const c = center(); zoomAt(c.x, c.y, 1 / 1.6); });
  const tiltBtn = $('tiltBtn');
  function setTiltMode(on) {
    state.tiltMode = on;
    tiltBtn.classList.toggle('active', on);
    canvas.classList.toggle('tilting', on);
  }
  tiltBtn.addEventListener('click', () => { setTiltMode(!state.tiltMode); });

  function showWholeView() { closeInfo(); flyHome(); }
  $('homeBtn').addEventListener('click', showWholeView);
  $('closeInfo').addEventListener('click', showWholeView);
  $('backBtn').addEventListener('click', showWholeView);

  for (const btn of document.querySelectorAll('.modes button')) btn.addEventListener('click', () => { goToView(btn.dataset.mode); });

  // Knopf, der zum Weiterzoomen in die nächste Ebene einlädt
  const levelHint = $('levelHint');
  let levelHintAction = null;
  levelHint.addEventListener('click', () => { if (levelHintAction) levelHintAction(); });
  function updateLevelHint() {
    let text = '', act = null;
    if (!trans && !flight && !document.body.classList.contains('info-open')) {
      const c = viewCfg();
      if (NEXT_OUT[state.view] && cam.z <= c.min * 1.9) {
        text = state.view === 'orbit' ? '⭐ Weiter rauszoomen: zu den Nachbarsternen' : '🌌 Weiter rauszoomen: zur Milchstraße';
        act = goOut;
      } else if (NEXT_IN[state.view] && cam.z >= c.max / 1.3) {
        text = state.view === 'stars' ? '🪐 Weiter reinzoomen: ins Sonnensystem' : '⭐ Weiter reinzoomen: zu den Nachbarsternen';
        act = goIn;
      }
    }
    levelHintAction = act;
    if (levelHint.textContent !== text) levelHint.textContent = text;
    levelHint.classList.toggle('show', !!text);
  }


  // ---------- Maus & Touch ----------
  const pointers = new Map();
  let dragMoved = false, pinchPrev = null;

  function pinchInfo() {
    const [a, b] = [...pointers.values()];
    return { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 };
  }
  function rotateBy(dx, dy) {
    if (!tilted()) return;
    rot.yaw -= dx * 0.008;
    rot.pitch = clamp(rot.pitch + dy * 0.008, -1.45, 1.45);
    if (flight && flight.rotate) flight.rotate = false;
  }

  canvas.addEventListener('contextmenu', e => e.preventDefault());
  canvas.addEventListener('pointerdown', e => {
    canvas.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, rot: e.button === 2 || e.shiftKey || state.tiltMode });
    if (pointers.size === 1) dragMoved = false;
    if (pointers.size === 2) { pinchPrev = pinchInfo(); dragMoved = true; }
  });

  canvas.addEventListener('pointermove', e => {
    const p = pointers.get(e.pointerId);
    if (!p) {
      if (e.pointerType === 'mouse' && !trans) {
        state.hover = hitTest(e.clientX, e.clientY);
        canvas.classList.toggle('hovering', !!state.hover);
      }
      return;
    }
    const dx = e.clientX - p.x, dy = e.clientY - p.y;
    p.x = e.clientX; p.y = e.clientY;
    if (trans) return;
    if (pointers.size === 1) {
      if (!dragMoved && Math.hypot(e.clientX - p.sx, e.clientY - p.sy) > 6) {
        dragMoved = true;
        canvas.classList.add('dragging');
      }
      if (dragMoved) {
        if (p.rot && tilted()) rotateBy(dx, dy);
        else { stopMotion(); panBy(dx, dy); }
      }
    } else if (pointers.size === 2 && pinchPrev) {
      const info = pinchInfo();
      zoomAt(info.mx, info.my, info.d / pinchPrev.d);
      if (state.tiltMode) rotateBy(info.mx - pinchPrev.mx, info.my - pinchPrev.my);
      else if (!state.follow && !flight) panBy(info.mx - pinchPrev.mx, info.my - pinchPrev.my);
      pinchPrev = info;
    }
  });

  function endPointer(e) {
    if (!pointers.has(e.pointerId)) return;
    if (pointers.size === 1 && !dragMoved && e.type === 'pointerup' && !trans) {
      const b = hitTest(e.clientX, e.clientY);
      if (b) select(b);
    }
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinchPrev = null;
    if (pointers.size === 1) [...pointers.values()][0].sx = -1e9; // nach dem Zoomen kein Klick mehr
    if (pointers.size === 0) canvas.classList.remove('dragging');
  }
  canvas.addEventListener('pointerup', endPointer);
  canvas.addEventListener('pointercancel', endPointer);
  canvas.addEventListener('pointerleave', () => { if (!pointers.size) { state.hover = null; canvas.classList.remove('hovering'); } });

  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
    zoomAt(e.clientX, e.clientY, Math.exp(-clamp(dy, -200, 200) * 0.0016));
  }, { passive: false });

  window.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' && e.target.type === 'range' && e.key.startsWith('Arrow')) return;
    const c = center();
    if (e.key === '+' || e.key === '=') zoomAt(c.x, c.y, 1.4);
    else if (e.key === '-') zoomAt(c.x, c.y, 1 / 1.4);
    else if (e.key === ' ' && state.view === 'orbit') { e.preventDefault(); togglePause(); }
    else if (e.key === 'Escape' || e.key === '0') showWholeView();
    else if (e.key === 'ArrowLeft') rotateBy(-12, 0);
    else if (e.key === 'ArrowRight') rotateBy(12, 0);
    else if (e.key === 'ArrowUp') rotateBy(0, -12);
    else if (e.key === 'ArrowDown') rotateBy(0, 12);
    else return;
  });

  // ---------- Größe & Hauptschleife ----------
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const c = viewCfg();
    cam.z = clamp(cam.z, c.min, c.max);
    if (state.selected && document.body.classList.contains('info-open')) drawCompare(state.selected);
  }
  window.addEventListener('resize', resize);
  resize();
  applyView('orbit');
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
    step(dt);
    requestAnimationFrame(frame);
  }
  function step(dt) {
    state.time += dt;
    if (!state.paused && state.view === 'orbit') {
      const sp = SPEEDS[state.speedIdx];
      state.days += sp * dt;
      state.moonDays += Math.min(sp, 1) * dt;
    }

    // Bildmitte weich verschieben, wenn die Info-Karte offen ist
    const open = document.body.classList.contains('info-open');
    const wide = W > 900;
    const k = 1 - Math.exp(-dt * 7);
    off.x += ((open && wide ? -197 : 0) - off.x) * k;
    off.y += ((open && !wide ? -H * 0.24 : 0) - off.y) * k;

    if (flight) {
      flight.t += dt;
      const tt = clamp((flight.t - flight.delay) / flight.dur, 0, 1);
      const ec = ease(clamp(tt / flight.catchUp, 0, 1));
      const ez = ease(tt);
      const p = flight.target();
      cam.x = lerp(flight.fx, p.x, ec);
      cam.y = lerp(flight.fy, p.y, ec);
      cam.z = Math.exp(lerp(Math.log(flight.fz), Math.log(flight.tz), ez) - flight.bump * Math.sin(Math.PI * tt));
      if (flight.rotate) { rot.yaw = lerp(flight.fyaw, flight.tyaw, ez); rot.pitch = lerp(flight.fpitch, flight.tpitch, ez); }
      if (tt >= 1) flight = null;
    } else if (state.follow) {
      const p = posOf(state.follow);
      cam.x = p.x; cam.y = p.y;
    }

    const e = trans ? drawTransition(dt) : 1;
    updateRocket(dt);
    draw();
    drawRocket();
    if (trans) {
      overlayTransition(e);
      if (trans.t >= trans.dur) { trans = null; zoomMul = 1; }
    }
    hudTimer -= dt;
    if (hudTimer <= 0) { updateHud(); updateLevelHint(); hudTimer = 0.2; }
  }
  requestAnimationFrame(frame);

  // Für Tests in der Konsole
  window.__solar = { step, state, cam, rot, select, goToView, flyHome, rocket, byId, w2s: (b) => w2sp(posOf(b)) };
})();
