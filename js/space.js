// Weiter draußen: Nachbarsterne und Milchstraße.
// lj = Entfernung von der Sonne in Lichtjahren
// sizeSun = Radius im Vergleich zur Sonne (Sonne = 1)

// ---------- Nachbarsterne (Richtung grob, Entfernung echt) ----------
window.STARS = [
  {
    id: 's_sonne', name: 'Sonne (hier wohnen wir!)', kind: 'Unser Stern', color: '#ffd84a',
    dir: [0, 0, 0], lj: 0, dot: 7, enter: 'orbit', arrow: true
  },
  {
    id: 'proxima', name: 'Proxima Centauri', kind: 'Roter Zwerg – der nächste Stern!', color: '#ff6b4a',
    dir: [-0.45, -0.25, -0.86], lj: 4.24, dot: 3.5, sizeSun: 0.15,
    intro: 'Proxima Centauri ist der Stern, der unserer Sonne am nächsten ist. Er ist ein kleiner, roter Stern – ein „Roter Zwerg“.',
    fun: 'Um Proxima Centauri kreist ein Planet, der ungefähr so groß ist wie die Erde. Ob es dort Leben gibt, weiß niemand.',
    compare: 'Proxima Centauri ist viel kleiner als unsere Sonne – nur etwa ein Siebtel so groß.'
  },
  {
    id: 'alphacen', name: 'Alpha Centauri', kind: 'Doppelstern – zwei Sonnen', color: '#fff1c4',
    dir: [-0.33, -0.33, -0.88], lj: 4.37, dot: 5.5, sizeSun: 1.22,
    intro: 'Alpha Centauri sind eigentlich zwei Sterne, die umeinander kreisen – zwei Sonnen! Zusammen mit Proxima Centauri bilden sie eine Sternenfamilie.',
    fun: 'Von der Südhalbkugel der Erde aus ist Alpha Centauri einer der hellsten Sterne am Himmel. Von Deutschland aus kann man ihn leider nicht sehen.',
    compare: 'Der größere der beiden Sterne ist ein bisschen größer als unsere Sonne.'
  },
  {
    id: 'barnard', name: 'Barnards Pfeilstern', kind: 'Roter Zwerg', color: '#ff7a55',
    dir: [0.05, -1, 0.08], lj: 5.96, dot: 3, sizeSun: 0.2,
    intro: 'Barnards Pfeilstern ist ein kleiner, roter Stern. Man kann ihn nur mit einem Fernrohr sehen.',
    fun: 'Er heißt „Pfeilstern“, weil er sich am Himmel schneller bewegt als jeder andere Stern – wie ein Pfeil!',
    compare: 'Er ist nur etwa ein Fünftel so groß wie unsere Sonne.'
  },
  {
    id: 'wolf359', name: 'Wolf 359', kind: 'Roter Zwerg', color: '#ff5a3c',
    dir: [-0.94, 0.27, 0.13], lj: 7.9, dot: 2.8, sizeSun: 0.16,
    intro: 'Wolf 359 ist ein sehr kleiner, schwach leuchtender roter Stern.',
    fun: 'Wolf 359 ist so lichtschwach, dass man ihn nur mit einem großen Fernrohr sehen kann – obwohl er so nah ist.',
    compare: 'Wolf 359 ist nur etwa ein Sechstel so groß wie unsere Sonne.'
  },
  {
    id: 'sirius', name: 'Sirius', kind: 'Der hellste Stern am Nachthimmel', color: '#cfe3ff',
    dir: [-0.19, 0.94, -0.29], lj: 8.6, dot: 6.5, sizeSun: 1.71,
    intro: 'Sirius ist der hellste Stern am Nachthimmel. Er leuchtet weiß-bläulich und funkelt oft in vielen Farben.',
    fun: 'Sirius hat einen kleinen Begleiter: einen „Weißen Zwerg“. Der ist nur so groß wie die Erde, aber fast so schwer wie die Sonne!',
    compare: 'Sirius ist fast doppelt so groß wie unsere Sonne.'
  },
  {
    id: 'epseri', name: 'Epsilon Eridani', kind: 'Oranger Stern', color: '#ffc27a',
    dir: [0.59, 0.79, -0.16], lj: 10.5, dot: 4, sizeSun: 0.74,
    intro: 'Epsilon Eridani ist ein oranger Stern, etwas kleiner und viel jünger als unsere Sonne.',
    fun: 'Um Epsilon Eridani gibt es Staubringe und mindestens einen großen Planeten – ein bisschen wie ein junges Sonnensystem.',
    compare: 'Er ist etwa drei Viertel so groß wie unsere Sonne.'
  },
  {
    id: 'procyon', name: 'Prokyon', kind: 'Gelb-weißer Stern', color: '#fff4d8',
    dir: [-0.42, 0.9, 0.09], lj: 11.4, dot: 5.5, sizeSun: 2.05,
    intro: 'Prokyon ist einer der hellsten Sterne am Winterhimmel. Er gehört zum Sternbild „Kleiner Hund“.',
    fun: 'Der Name Prokyon bedeutet „Vor dem Hund“ – er geht kurz vor Sirius, dem „Hundsstern“, auf.',
    compare: 'Prokyon ist etwa doppelt so groß wie unsere Sonne.'
  },
  {
    id: 'tauceti', name: 'Tau Ceti', kind: 'Stern ähnlich wie unsere Sonne', color: '#ffe9a8',
    dir: [0.87, 0.42, -0.28], lj: 11.9, dot: 4.2, sizeSun: 0.79,
    intro: 'Tau Ceti ist ein gelber Stern, der unserer Sonne ziemlich ähnlich ist – nur etwas kleiner.',
    fun: 'Weil Tau Ceti der Sonne so ähnlich ist, suchen Forscher dort besonders gerne nach Planeten, auf denen es Leben geben könnte.',
    compare: 'Tau Ceti ist etwa vier Fünftel so groß wie die Sonne.'
  },
  {
    id: 'altair', name: 'Altair', kind: 'Heller weißer Stern', color: '#e8f0ff',
    dir: [0.46, -0.87, 0.16], lj: 16.7, dot: 5.5, sizeSun: 1.8,
    intro: 'Altair ist ein heller Stern im Sternbild Adler. Er gehört zum „Sommerdreieck“, das du im Sommer am Himmel sehen kannst.',
    fun: 'Altair dreht sich unglaublich schnell um sich selbst – in nur etwa 9 Stunden! Dadurch ist er in der Mitte richtig dick, wie ein plattgedrückter Ball.',
    compare: 'Altair ist fast doppelt so groß wie die Sonne.'
  },
  {
    id: 'wega', name: 'Wega', kind: 'Bläulich-weißer Stern', color: '#cfe0ff',
    dir: [0.12, -0.78, 0.62], lj: 25, dot: 6.5, sizeSun: 2.4,
    intro: 'Wega ist einer der hellsten Sterne am Sommerhimmel. Sie leuchtet bläulich-weiß und gehört auch zum „Sommerdreieck“.',
    fun: 'In etwa 12.000 Jahren wird Wega unser Polarstern sein – der Stern, der genau im Norden steht.',
    compare: 'Wega ist mehr als doppelt so groß wie unsere Sonne.'
  }
];

// ---------- Milchstraße (1 Einheit = 100 Lichtjahre, Zentrum bei 0,0,0) ----------
window.GALAXY_SUN = { x: 0, y: 265, z: 0 };
window.GALAXY = [
  {
    id: 'du', name: 'Sonne – du bist hier!', kind: 'Unser Zuhause', color: '#ffd84a',
    pos: { x: 0, y: 265, z: 0 }, render: 'marker', enter: 'stars', arrow: true
  },
  {
    id: 'zentrum', name: 'Zentrum der Milchstraße', kind: 'Schwarzes Loch „Sagittarius A*“', color: '#fff1c9',
    pos: { x: 0, y: 0, z: 0 }, render: 'core', lj: 26000, focus: 120,
    intro: 'Ganz in der Mitte der Milchstraße sitzt ein riesiges Schwarzes Loch. Es heißt Sagittarius A* (sprich: „Sagittarius A Stern“).',
    fun: 'Dieses Schwarze Loch ist so schwer wie etwa 4 Millionen Sonnen! Alles, was ihm zu nahe kommt – sogar Licht – kann ihm nicht mehr entkommen.'
  },
  {
    id: 'plejaden', name: 'Plejaden', kind: 'Sternhaufen – das Siebengestirn', color: '#a9c8ff',
    pos: { x: 3.4, y: 262.2, z: -1.2 }, near: true, render: 'cluster', wr: 0.4, lj: 444, focus: 6,
    intro: 'Die Plejaden sind eine Gruppe von jungen, hellblauen Sternen, die zusammen entstanden sind – wie Geschwister.',
    fun: 'Man nennt die Plejaden auch das „Siebengestirn“. Mit guten Augen kannst du im Winter sechs oder sieben Sterne erkennen – mit einem Fernrohr sind es Hunderte!'
  },
  {
    id: 'beteigeuze', name: 'Beteigeuze', kind: 'Roter Überriese', color: '#ff7a3a',
    pos: { x: -3.6, y: 269.1, z: -0.8 }, near: true, render: 'star', dot: 6, lj: 550, focus: 6, sizeSun: 760,
    intro: 'Beteigeuze ist ein riesiger roter Stern im Sternbild Orion. Man erkennt ihn gut an seiner orangeroten Farbe.',
    fun: 'Würde man Beteigeuze an die Stelle unserer Sonne setzen, würde er weit über die Bahn des Mars hinausreichen! Irgendwann wird er in einer gewaltigen Explosion vergehen – einer Supernova.',
    compare: 'Beteigeuze ist viele hundert Mal so breit wie unsere Sonne!'
  },
  {
    id: 'orionnebel', name: 'Orionnebel', kind: 'Sternen-Kinderstube', color: '#ff8fd0',
    pos: { x: -8.9, y: 274.8, z: -1.9 }, near: true, render: 'nebula', wr: 0.6, lj: 1344, focus: 8,
    intro: 'Der Orionnebel ist eine riesige, leuchtende Wolke aus Gas und Staub. Darin entstehen gerade neue Sterne – eine Sternen-Kinderstube!',
    fun: 'Im Winter kannst du den Orionnebel sogar ohne Fernrohr sehen: als kleinen, verschwommenen Fleck im „Schwert“ des Sternbilds Orion.'
  },
  {
    id: 'lmc', name: 'Große Magellansche Wolke', kind: 'Kleine Nachbar-Galaxie', color: '#cfd8ff',
    pos: { x: -700, y: 900, z: -1100 }, render: 'blob', wr: 70, lj: 160000, focus: 140,
    extra: [['📏', 'Durchmesser', 'ca. 14.000 Lichtjahre']],
    intro: 'Die Große Magellansche Wolke ist eine kleine Galaxie, die um unsere Milchstraße kreist – so ähnlich wie ein Mond um einen Planeten.',
    fun: 'Von der Südhalbkugel aus kann man sie nachts ohne Fernrohr sehen: wie ein abgerissenes Stück Milchstraße.'
  },
  {
    id: 'smc', name: 'Kleine Magellansche Wolke', kind: 'Kleine Nachbar-Galaxie', color: '#d7dcff',
    pos: { x: -420, y: 1250, z: -1550 }, render: 'blob', wr: 35, lj: 200000, focus: 80,
    extra: [['📏', 'Durchmesser', 'ca. 7.000 Lichtjahre']],
    intro: 'Die Kleine Magellansche Wolke ist die kleine Schwester der Großen Magellanschen Wolke – auch sie ist eine Zwerggalaxie.',
    fun: 'Die beiden Wolken sind nach dem Seefahrer Ferdinand Magellan benannt, dessen Mannschaft sie auf ihrer Reise um die ganze Welt beschrieben hat.'
  },
  {
    id: 'andromeda', name: 'Andromeda-Galaxie', kind: 'Unsere große Nachbar-Galaxie', color: '#e6dcff',
    pos: { x: -14000, y: 18500, z: -9000 }, render: 'galaxy', wr: 1100, lj: 2500000, focus: 1500, arrow: true,
    extra: [['📏', 'Durchmesser', 'ca. 220.000 Lichtjahre'], ['✨', 'Sterne', 'ca. 1 Billion (1.000 Milliarden)']],
    intro: 'Die Andromeda-Galaxie ist die große Nachbarin unserer Milchstraße. Sie ist eine Spiralgalaxie, so wie unsere – nur noch größer.',
    fun: 'Andromeda und unsere Milchstraße kommen sich langsam näher. In ein paar Milliarden Jahren werden sie wahrscheinlich zusammenstoßen und zu einer riesigen Galaxie verschmelzen!'
  }
];

// Spiralarme der Milchstraße (für die Beschriftung und die Sterne-Punkte)
window.GALAXY_ARMS = [
  { name: 'Perseus-Arm', labelR: 450 },
  { name: 'Sagittarius-Arm', labelR: 215 },
  { name: 'Scutum-Centaurus-Arm', labelR: 330 },
  { name: 'Norma-Arm', labelR: 400 }
];
