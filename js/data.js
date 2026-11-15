// Alle Himmelskörper mit kindgerechten Infos.
// r / orbit = Darstellung in der Übersicht (NICHT maßstabsgetreu)
// sizeR = echter Radius im Verhältnis zur Erde (Erde = 1)
// period = Umlaufzeit in Erdtagen
window.BODIES = [
  {
    id: 'sonne', name: 'Sonne', kind: 'Stern', color: '#ffc93c',
    r: 30, orbit: 0, period: 0, start: 0, sizeR: 109, arrow: true,
    diameterKm: 1392700, distanceKm: 149600000, distanceFrom: 'Erde',
    yearLabel: null, year: null,
    day: 'ca. 25 Tage (so lange dreht sie sich einmal um sich selbst)',
    temp: 'an der Oberfläche ca. 5.500 °C',
    moons: 'keine – aber 8 Planeten kreisen um sie!',
    intro: 'Die Sonne ist ein Stern – eine riesige, glühend heiße Kugel aus Gas. Sie schenkt uns Licht und Wärme. Ohne die Sonne gäbe es kein Leben auf der Erde.',
    fun: 'Das Licht der Sonne braucht ungefähr 8 Minuten, bis es bei uns auf der Erde ankommt.',
    tip: 'Schau niemals direkt in die Sonne – das ist gefährlich für deine Augen!',
    compare: 'Die Sonne ist so riesig, dass über eine Million Erden in sie hineinpassen würden!'
  },
  {
    id: 'merkur', name: 'Merkur', el: { L: 252.25032350, Ld: 149472.67411175, w: 77.45779628, wd: 0.16047689, e: 0.20563593 }, kind: 'Gesteinsplanet', color: '#9c9590',
    r: 4, orbit: 62, period: 88, start: 0.5, sizeR: 0.383,
    diameterKm: 4879, distanceKm: 57900000, distanceFrom: 'Sonne',
    year: '88 Erdtage', day: '176 Erdtage (von Sonnenaufgang bis Sonnenaufgang)',
    temp: 'tagsüber bis 430 °C, nachts bis −180 °C', moons: 'keine',
    texture: 'craters', craterColor: '#7b756f',
    craters: [[-0.3, -0.3, 0.18], [0.35, 0.1, 0.14], [-0.1, 0.45, 0.12], [0.2, -0.5, 0.1], [-0.55, 0.2, 0.09]],
    intro: 'Merkur ist der kleinste Planet und kreist der Sonne am nächsten. Er saust sehr schnell um die Sonne – deshalb ist sein Jahr ganz kurz.',
    fun: 'Auf Merkur dauert ein Tag länger als ein ganzes Jahr! Bis die Sonne dort einmal auf- und wieder aufgeht, vergehen zwei Merkur-Jahre.',
    compare: 'Merkur ist nur ein bisschen größer als unser Mond. Fast drei Merkure passen nebeneinander auf die Erde.'
  },
  {
    id: 'venus', name: 'Venus', el: { L: 181.97909950, Ld: 58517.81538729, w: 131.60246718, wd: 0.00268329, e: 0.00677672 }, kind: 'Gesteinsplanet', color: '#e6bf78',
    r: 7, orbit: 92, period: 225, start: 2.1, sizeR: 0.949,
    diameterKm: 12104, distanceKm: 108200000, distanceFrom: 'Sonne',
    year: '225 Erdtage', day: '117 Erdtage', temp: 'ca. 465 °C – heißer als ein Pizzaofen!', moons: 'keine',
    texture: 'bands', bands: [[-0.7, 0.2, 'rgba(255,236,190,0.45)'], [-0.25, 0.15, 'rgba(200,150,80,0.35)'], [0.15, 0.22, 'rgba(255,236,190,0.4)'], [0.55, 0.15, 'rgba(200,150,80,0.3)']],
    atmo: 'rgba(255,220,150,0.5)',
    intro: 'Venus ist fast genauso groß wie die Erde. Sie ist von dicken, giftigen Wolken umhüllt, die die Hitze einsperren – darum ist sie der heißeste Planet.',
    fun: 'Venus dreht sich andersherum als fast alle anderen Planeten. Dort geht die Sonne im Westen auf und im Osten unter!',
    compare: 'Venus ist fast genauso groß wie die Erde – wie eine Zwillingsschwester.'
  },
  {
    id: 'erde', name: 'Erde', el: { L: 100.46457166, Ld: 35999.37244981, w: 102.93768193, wd: 0.32327364, e: 0.01671123 }, kind: 'Gesteinsplanet – unser Zuhause', color: '#2f6fd6',
    r: 7.5, orbit: 128, period: 365.25, start: 4.0, sizeR: 1,
    diameterKm: 12742, distanceKm: 149600000, distanceFrom: 'Sonne',
    year: '365 Tage', day: '24 Stunden', temp: 'im Durchschnitt ca. 15 °C', moons: '1 – unser Mond',
    texture: 'earth', atmo: 'rgba(140,200,255,0.6)',
    intro: 'Die Erde ist unser Zuhause! Sie ist der einzige Planet, von dem wir wissen, dass es dort Leben gibt: Menschen, Tiere und Pflanzen.',
    fun: 'Mehr als zwei Drittel der Erde sind mit Wasser bedeckt. Darum sieht sie aus dem Weltall blau aus – man nennt sie auch den „Blauen Planeten“.',
    compare: 'Das ist die Erde. Mit ihr vergleichen wir alle anderen Planeten.'
  },
  {
    id: 'mond', name: 'Mond', kind: 'Mond der Erde', color: '#c9c6c0', parent: 'erde',
    r: 2.2, orbit: 17, period: 27.3, start: 0, sizeR: 0.273,
    diameterKm: 3475, distanceKm: 384400, distanceFrom: 'Erde',
    yearLabel: 'Eine Runde um die Erde', year: 'ca. 27 Tage',
    day: 'ca. 29 Erdtage (von Vollmond zu Vollmond)', temp: 'tagsüber ca. 120 °C, nachts ca. −130 °C', moons: '–',
    texture: 'craters', craterColor: '#a29e97',
    craters: [[-0.25, -0.2, 0.22], [0.3, 0.25, 0.16], [0.1, -0.5, 0.12], [-0.4, 0.4, 0.1], [0.5, -0.15, 0.09]],
    intro: 'Der Mond ist der Begleiter der Erde und kreist um sie herum. Er leuchtet nicht selbst – er wird von der Sonne angestrahlt, wie eine Taschenlampe einen Ball anstrahlt.',
    fun: '1969 sind zum ersten Mal Menschen auf dem Mond gelandet. Ihre Fußspuren sind immer noch da, weil es dort keinen Wind gibt, der sie wegweht!',
    compare: 'Der Mond ist ungefähr ein Viertel so groß wie die Erde.'
  },
  {
    id: 'mars', name: 'Mars', el: { L: -4.55343205, Ld: 19140.30268499, w: -23.94362959, wd: 0.44441088, e: 0.09339410 }, kind: 'Gesteinsplanet', color: '#cf5f38',
    r: 5.5, orbit: 165, period: 687, start: 1.2, sizeR: 0.532,
    diameterKm: 6779, distanceKm: 227900000, distanceFrom: 'Sonne',
    year: '687 Erdtage (fast 2 Jahre)', day: '24 Stunden und 37 Minuten', temp: 'im Durchschnitt ca. −60 °C',
    moons: '2 – Phobos und Deimos',
    texture: 'mars',
    intro: 'Mars wird auch der „Rote Planet“ genannt. Sein Boden ist voller Rost – deshalb ist er rot. Gerade fahren Roboter-Fahrzeuge auf ihm herum und erforschen ihn.',
    fun: 'Auf dem Mars steht der höchste Vulkan im ganzen Sonnensystem: der Olympus Mons. Er ist fast dreimal so hoch wie der Mount Everest!',
    compare: 'Mars ist ungefähr halb so groß wie die Erde.'
  },
  {
    id: 'jupiter', name: 'Jupiter', el: { L: 34.39644051, Ld: 3034.74612775, w: 14.72847983, wd: 0.21252668, e: 0.04838624 }, kind: 'Gasriese', gas: true, color: '#d8b48a',
    r: 18, orbit: 280, period: 4333, start: 3.3, sizeR: 11.21,
    diameterKm: 139820, distanceKm: 778500000, distanceFrom: 'Sonne',
    year: 'fast 12 Erdjahre', day: 'ca. 10 Stunden – der kürzeste Tag aller Planeten!',
    temp: 'oben in den Wolken ca. −110 °C', moons: 'über 90',
    texture: 'bands', spot: '#c4553a',
    bands: [[-0.8, 0.14, '#b98a5e'], [-0.5, 0.12, '#f0dcc0'], [-0.25, 0.17, '#a8744a'], [0.05, 0.12, '#f3e3c8'], [0.26, 0.2, '#b9875a'], [0.6, 0.13, '#e8d2b0']],
    intro: 'Jupiter ist der größte Planet. Er besteht vor allem aus Gas – man könnte nirgends auf ihm landen. Seine Streifen sind riesige Wolkenbänder.',
    fun: 'Der rote Fleck auf Jupiter ist ein Wirbelsturm, der schon seit über 150 Jahren tobt – und er ist größer als die ganze Erde!',
    compare: 'Jupiter ist so riesig, dass über 1.300 Erden in ihn hineinpassen würden!'
  },
  {
    id: 'saturn', name: 'Saturn', el: { L: 49.95424423, Ld: 1222.49362201, w: 92.59887831, wd: -0.41897216, e: 0.05386179 }, kind: 'Gasriese', gas: true, color: '#e3c98f',
    r: 15, orbit: 370, period: 10759, start: 5.4, sizeR: 9.45, rings: true,
    diameterKm: 116460, distanceKm: 1434000000, distanceFrom: 'Sonne',
    year: 'ca. 29 Erdjahre', day: 'ca. 10 ½ Stunden', temp: 'ca. −140 °C', moons: 'über 270 – Rekord!',
    texture: 'bands',
    bands: [[-0.65, 0.18, '#d1af6e'], [-0.25, 0.13, '#f1deae'], [0.12, 0.2, '#ccaa6a'], [0.5, 0.16, '#ead19a']],
    intro: 'Saturn ist berühmt für seine wunderschönen Ringe. Sie bestehen aus unzähligen Brocken aus Eis und Gestein – manche so klein wie Sandkörner, andere so groß wie ein Haus.',
    fun: 'Saturn ist so leicht, dass er in einer riesigen Badewanne schwimmen würde – wenn es eine so große Badewanne gäbe!',
    compare: 'Saturn ist ungefähr neunmal so breit wie die Erde – und das ohne seine Ringe!'
  },
  {
    id: 'uranus', name: 'Uranus', el: { L: 313.23810451, Ld: 428.48202785, w: 170.95427630, wd: 0.40805281, e: 0.04725744 }, kind: 'Eisriese', gas: true, color: '#9ee0e6',
    r: 11, orbit: 455, period: 30687, start: 0.9, sizeR: 4.01,
    diameterKm: 50724, distanceKm: 2871000000, distanceFrom: 'Sonne',
    year: '84 Erdjahre', day: 'ca. 17 Stunden', temp: 'bis −224 °C – der kälteste Planet!', moons: 'fast 30',
    texture: 'bands', bands: [[-0.5, 0.25, 'rgba(255,255,255,0.12)'], [0.3, 0.2, 'rgba(60,140,160,0.15)']],
    atmo: 'rgba(180,240,245,0.45)',
    intro: 'Uranus ist ein Eisriese und leuchtet blaugrün. Er ist so weit weg, dass man ihn ohne Fernrohr fast nicht sehen kann.',
    fun: 'Uranus liegt auf der Seite! Er rollt wie eine Kugel um die Sonne – wahrscheinlich ist vor sehr langer Zeit etwas Großes gegen ihn gestoßen.',
    compare: 'Uranus ist ungefähr viermal so breit wie die Erde.'
  },
  {
    id: 'neptun', name: 'Neptun', el: { L: -55.12002969, Ld: 218.45945325, w: 44.96476227, wd: -0.32241464, e: 0.00859048 }, kind: 'Eisriese', gas: true, color: '#3d6fe0',
    r: 10.5, orbit: 530, period: 60190, start: 2.6, sizeR: 3.88,
    diameterKm: 49244, distanceKm: 4495000000, distanceFrom: 'Sonne',
    year: '165 Erdjahre', day: 'ca. 16 Stunden', temp: 'ca. −214 °C', moons: '16',
    texture: 'bands', spot: '#1f3c8f',
    bands: [[-0.55, 0.15, 'rgba(120,170,255,0.35)'], [0.2, 0.18, 'rgba(20,50,140,0.35)']],
    atmo: 'rgba(120,170,255,0.45)',
    intro: 'Neptun ist der Planet, der am weitesten von der Sonne entfernt ist. Er ist tiefblau, eiskalt und dunkel.',
    fun: 'Auf Neptun wehen die stärksten Winde im ganzen Sonnensystem – über 2.000 km/h! Das ist schneller als ein Düsenflugzeug.',
    compare: 'Neptun ist fast genauso groß wie Uranus – ungefähr viermal so breit wie die Erde.'
  }
];

// ---------- Monde der anderen Planeten ----------
// orbit/r = Darstellung um den Planeten, period = Erdtage (negativ = rückwärts)
(function addMoons() {
  const PLANET = {
    mars: ['des Mars', 'zum Mars', 'um den Mars'],
    jupiter: ['des Jupiters', 'zum Jupiter', 'um den Jupiter'],
    saturn: ['des Saturns', 'zum Saturn', 'um den Saturn'],
    uranus: ['des Uranus', 'zum Uranus', 'um den Uranus'],
    neptun: ['des Neptuns', 'zum Neptun', 'um den Neptun'],
    pluto: ['des Pluto', 'zum Pluto', 'um den Pluto'],
    erde: ['der Erde', 'zur Erde', 'um die Erde']
  };
  const moon = m => {
    const [gen, to, around] = PLANET[m.parent];
    return Object.assign({
      kind: 'Mond ' + gen, texture: 'craters', craterColor: 'rgba(0,0,0,0.25)',
      craters: [[-0.3, -0.25, 0.2], [0.3, 0.2, 0.16], [0.05, -0.55, 0.12], [-0.4, 0.4, 0.1]],
      distLabel: 'Entfernung ' + to, yearLabel: 'Eine Runde ' + around,
      sizeR: m.diameterKm / 12742, bar: false, inSize: false, car: false, start: Math.random() * 6.28
    }, m);
  };
  // Zwergplaneten, Komet, Raumsonde
  window.BODIES.push(
    {
      id: 'ceres', name: 'Ceres', el: { peri: 2459920.5, P: 1680, w: 153.9, e: 0.0785 }, kind: 'Zwergplanet im Asteroidengürtel', color: '#9a948c',
      r: 2.2, orbit: 214, period: 1682, start: 2.5, sizeR: 0.074,
      texture: 'craters', craterColor: 'rgba(255,255,255,0.55)', craters: [[0.15, -0.1, 0.12], [-0.35, 0.3, 0.15], [0.4, 0.35, 0.1]],
      diameterKm: 940, distanceKm: 414000000, distanceFrom: 'Sonne',
      year: 'ca. 4 ½ Erdjahre', day: 'ca. 9 Stunden', temp: 'ca. −105 °C', moons: 'keine',
      intro: 'Ceres ist der größte Brocken im Asteroidengürtel – so groß, dass sie rund geworden ist. Darum zählt sie zu den Zwergplaneten.',
      fun: 'Auf Ceres gibt es helle, weiße Flecken in einem Krater. Das ist Salz, das aus ihrem Inneren nach oben gekommen ist!',
      compare: 'Ceres ist so klein, dass über 13 Ceres-Kugeln nebeneinander auf die Erde passen.'
    },
    {
      id: 'pluto', name: 'Pluto', el: { L: 238.92903833, Ld: 145.20780515, w: 224.06891629, wd: -0.04062942, e: 0.24882730 }, kind: 'Zwergplanet', color: '#d9c2a5',
      r: 3, orbit: 600, period: 90560, start: 4.4, sizeR: 0.187,
      texture: 'craters', craterColor: '#f6ead6', craters: [[0.18, 0.15, 0.34], [-0.4, -0.3, 0.12]],
      diameterKm: 2377, distanceKm: 5906000000, distanceFrom: 'Sonne',
      year: '248 Erdjahre', day: 'ca. 6 Tage und 9 Stunden', temp: 'ca. −230 °C', moons: '5 – der größte heißt Charon',
      intro: 'Pluto war früher der neunte Planet. Seit 2006 nennt man ihn „Zwergplaneten“, weil es weit draußen noch viele ähnliche Eiswelten gibt.',
      fun: 'Auf Pluto gibt es eine riesige helle Fläche in Form eines Herzens! Die Raumsonde New Horizons hat sie 2015 fotografiert.',
      compare: 'Pluto ist kleiner als unser Mond – nur etwa ein Fünftel so breit wie die Erde.'
    },
    {
      id: 'halley', name: 'Halleyscher Komet', kind: 'Komet', color: '#cfe8ff',
      r: 1, sizeR: 15 / 12742, inSize: false, comet: true, focus: 28,
      ellipse: { a: 315, e: 0.778, w: 5.36, inc: 0.32, peri: 2446470.5, P: 27510 },
      rows: [
        ['📏', 'Größe', 'ca. 15 km lang – ein dreckiger Schneeball'],
        ['📍', 'Entfernung zur Sonne', 'zwischen 88 Millionen und 5,3 Milliarden km'],
        ['🔄', 'Eine Runde um die Sonne', 'ca. 76 Jahre'],
        ['🔭', 'Von der Erde aus zu sehen', 'zuletzt 1986 – das nächste Mal 2061']
      ],
      intro: 'Der Halleysche Komet ist ein Brocken aus Eis, Staub und Gestein – wie ein schmutziger Schneeball. Kommt er der Sonne nahe, bekommt er einen langen, leuchtenden Schweif.',
      fun: 'Der Schweif eines Kometen zeigt immer von der Sonne weg – egal, in welche Richtung der Komet gerade fliegt!',
      compare: 'Halley ist nur etwa 15 Kilometer groß – winzig im Vergleich zur Erde.'
    },
    {
      id: 'voyager', name: 'Voyager 1', kind: 'Raumsonde – am weitesten weg von allem, was Menschen gebaut haben', color: '#e8d9a8',
      r: 1.5, fixed: { x: -146, y: 546, z: 396 }, probe: true, noLand: true, inSize: false, since: 2443391.5, // Start am 5.9.1977
      rows: [
        ['🚀', 'Gestartet', '1977 – vor fast 50 Jahren'],
        ['📍', 'Entfernung zur Sonne', 'über 25 Milliarden km'],
        ['📡', 'Ihre Funksignale brauchen', 'fast einen ganzen Tag bis zur Erde'],
        ['🌍', 'Besucht', 'Jupiter und Saturn']
      ],
      intro: 'Voyager 1 ist eine Raumsonde, die 1977 von der Erde gestartet ist. Sie hat Jupiter und Saturn besucht und fliegt seitdem immer weiter hinaus – heute ist sie schon zwischen den Sternen.',
      fun: 'An Bord ist eine goldene Schallplatte mit Bildern, Musik und Grüßen in vielen Sprachen – falls Außerirdische sie jemals finden!'
    }
  );

  window.BODIES.push(
    moon({
      id: 'iss', name: 'ISS', parent: 'erde', kind: 'Internationale Raumstation', color: '#d7dbe6',
      r: 0.45, orbit: 11, period: 0.064, station: true, bar: true, texture: null, since: 2451137.5, // erstes Modul am 20.11.1998
      rows: [
        ['📏', 'Größe', 'ca. 109 m breit – so groß wie ein Fußballfeld'],
        ['📍', 'Höhe über der Erde', 'ca. 400 km'],
        ['🔄', 'Eine Runde um die Erde', 'ca. 90 Minuten'],
        ['👩‍🚀', 'An Bord', 'meistens 7 Astronautinnen und Astronauten']
      ],
      intro: 'Die Internationale Raumstation ISS ist ein großes Haus im Weltall. Dort leben und forschen Astronautinnen und Astronauten aus vielen Ländern.',
      fun: 'Die ISS fliegt so schnell um die Erde, dass die Menschen an Bord jeden Tag etwa 16 Sonnenaufgänge sehen!'
    }),
    moon({
      id: 'charon', name: 'Charon', parent: 'pluto', color: '#a9a29a', r: 1.4, orbit: 7, period: 6.39,
      diameterKm: 1212, distanceKm: 19591, year: 'ca. 6 ½ Tage',
      intro: 'Charon ist der größte Mond von Pluto – er ist fast halb so groß wie Pluto selbst.',
      fun: 'Pluto und Charon zeigen sich immer dieselbe Seite. Von einer Seite des Pluto sieht man Charon immer am Himmel – von der anderen Seite nie!',
      compare: 'Charon ist ungefähr ein Drittel so groß wie unser Mond.'
    }),
    moon({
      id: 'phobos', name: 'Phobos', parent: 'mars', color: '#8b7d6b', r: 0.6, orbit: 8.5, period: 0.319,
      diameterKm: 22, distanceKm: 9376, year: '7 Stunden und 39 Minuten',
      intro: 'Phobos ist der größere der beiden Mars-Monde. Er ist nicht rund, sondern sieht aus wie eine riesige Kartoffel.',
      fun: 'Phobos kommt dem Mars jedes Jahr ein winziges Stückchen näher. In vielen Millionen Jahren wird er zerbrechen und vielleicht einen Ring um den Mars bilden!',
      compare: 'Phobos ist winzig: Über 500 Phobos-Monde passen nebeneinander auf die Erde.'
    }),
    moon({
      id: 'deimos', name: 'Deimos', parent: 'mars', color: '#a39582', r: 0.5, orbit: 11, period: 1.26,
      diameterKm: 12, distanceKm: 23460, year: 'ca. 30 Stunden',
      intro: 'Deimos ist der kleinere Mars-Mond – nur etwa 12 Kilometer groß. Auch er ist wie eine Kartoffel geformt.',
      fun: 'Auf Deimos ist die Schwerkraft so schwach, dass du mit einem kräftigen Sprung fast ins Weltall hüpfen könntest!',
      compare: 'Über 1.000 Deimos-Monde passen nebeneinander auf die Erde.'
    }),
    moon({
      id: 'io', name: 'Io', parent: 'jupiter', color: '#e8d36a', r: 1.7, orbit: 24, period: 1.77,
      craterColor: '#c2662a', craters: [[-0.3, -0.2, 0.16], [0.35, 0.15, 0.13], [0, 0.5, 0.11], [0.2, -0.5, 0.09], [-0.5, 0.3, 0.08]],
      diameterKm: 3643, distanceKm: 421700, year: 'ca. 1 Tag und 18 Stunden',
      intro: 'Io ist ein Mond des Jupiters und sieht aus wie eine Pizza – gelb, orange und mit dunklen Flecken.',
      fun: 'Io hat über 400 aktive Vulkane – mehr als jeder andere Ort im Sonnensystem! Manche spucken ihre Lava hunderte Kilometer hoch.',
      compare: 'Io ist ein kleines bisschen größer als unser Mond.'
    }),
    moon({
      id: 'europa', name: 'Europa', parent: 'jupiter', color: '#e8dccb', r: 1.5, orbit: 28.5, period: 3.55,
      texture: 'lines', diameterKm: 3122, distanceKm: 671000, year: 'ca. 3 ½ Tage',
      intro: 'Europa ist von einer dicken Eisschicht bedeckt, die voller Risse ist – wie ein zerbrochenes Ei.',
      fun: 'Unter dem Eis von Europa gibt es wahrscheinlich einen riesigen Ozean – mit mehr Wasser als auf der ganzen Erde! Forscher fragen sich, ob dort Leben sein könnte.',
      compare: 'Europa ist etwas kleiner als unser Mond.'
    }),
    moon({
      id: 'ganymed', name: 'Ganymed', parent: 'jupiter', color: '#a89c8c', r: 2.4, orbit: 34, period: 7.15,
      diameterKm: 5268, distanceKm: 1070400, year: 'ca. 7 Tage',
      intro: 'Ganymed ist der größte Mond im ganzen Sonnensystem. Er ist sogar größer als der Planet Merkur!',
      fun: 'Ganymed ist der einzige Mond, der ein eigenes Magnetfeld hat – fast wie ein kleiner Planet.',
      compare: 'Ganymed ist ungefähr zwei Fünftel so groß wie die Erde – und größer als Merkur.'
    }),
    moon({
      id: 'kallisto', name: 'Kallisto', parent: 'jupiter', color: '#6e6458', r: 2.2, orbit: 41, period: 16.7,
      craterColor: 'rgba(255,255,255,0.25)', diameterKm: 4821, distanceKm: 1882700, year: 'ca. 17 Tage',
      intro: 'Kallisto ist ein dunkler, eisiger Mond des Jupiters. Seine Oberfläche ist über und über mit Kratern bedeckt.',
      fun: 'Kallisto gehört zu den Himmelskörpern mit den meisten Kratern im ganzen Sonnensystem.',
      compare: 'Kallisto ist fast genauso groß wie der Planet Merkur.'
    }),
    moon({
      id: 'mimas', name: 'Mimas', parent: 'saturn', color: '#cfd0d4', r: 0.6, orbit: 37, period: 0.94,
      craters: [[0.3, -0.1, 0.33]], diameterKm: 396, distanceKm: 185500, year: 'ca. 23 Stunden',
      intro: 'Mimas ist ein kleiner, eisiger Mond des Saturns.',
      fun: 'Mimas hat einen riesigen Krater, der fast ein Drittel so breit ist wie der ganze Mond. Dadurch sieht er aus wie ein großes Auge!',
      compare: 'Mimas ist so klein, dass er locker in Deutschland hineinpassen würde.'
    }),
    moon({
      id: 'enceladus', name: 'Enceladus', parent: 'saturn', color: '#f4f6fa', r: 0.7, orbit: 42, period: 1.37,
      craterColor: 'rgba(120,170,220,0.35)', diameterKm: 504, distanceKm: 238000, year: 'ca. 1 Tag und 9 Stunden',
      intro: 'Enceladus ist ein kleiner Saturnmond, der strahlend weiß leuchtet – er ist mit frischem Eis bedeckt.',
      fun: 'Aus Enceladus schießen riesige Wasserfontänen ins Weltall, wie Geysire! Darunter liegt ein Ozean.',
      compare: 'Über 25 Enceladus-Monde passen nebeneinander auf die Erde.'
    }),
    moon({
      id: 'titan', name: 'Titan', parent: 'saturn', color: '#d9a24a', r: 2.3, orbit: 54, period: 15.9,
      texture: 'bands', bands: [[-0.6, 0.25, 'rgba(255,220,150,0.35)'], [0.1, 0.3, 'rgba(160,100,30,0.25)']],
      atmo: 'rgba(255,190,100,0.55)', diameterKm: 5150, distanceKm: 1221870, year: 'ca. 16 Tage', temp: 'ca. −180 °C',
      intro: 'Titan ist der größte Mond des Saturns. Er ist in eine dicke, orange Lufthülle eingehüllt – fast wie in Nebel.',
      fun: 'Auf Titan gibt es Seen und Flüsse – aber nicht aus Wasser, sondern aus flüssigem Gas, weil es dort so kalt ist!',
      compare: 'Titan ist sogar größer als der Planet Merkur!'
    }),
    moon({
      id: 'miranda', name: 'Miranda', parent: 'uranus', color: '#b7b4ae', r: 0.7, orbit: 15, period: 1.41,
      diameterKm: 472, distanceKm: 129900, year: 'ca. 1 Tag und 10 Stunden',
      intro: 'Miranda ist ein kleiner Mond des Uranus und sieht aus, als wäre er aus verschiedenen Stücken zusammengeflickt.',
      fun: 'Auf Miranda gibt es eine der höchsten Klippen im Sonnensystem – etwa 20 Kilometer tief! Wegen der schwachen Schwerkraft würdest du beim Hinunterspringen mehrere Minuten lang fallen.',
      compare: 'Über 25 Miranda-Monde passen nebeneinander auf die Erde.'
    }),
    moon({
      id: 'titania', name: 'Titania', parent: 'uranus', color: '#a9a39b', r: 1.2, orbit: 20, period: 8.7,
      diameterKm: 1578, distanceKm: 436300, year: 'ca. 9 Tage',
      intro: 'Titania ist der größte Mond des Uranus. Er ist grau, eisig und hat tiefe Schluchten.',
      fun: 'Die Uranus-Monde sind nach Figuren aus Theaterstücken von William Shakespeare benannt. Titania ist dort die Feenkönigin!',
      compare: 'Titania ist knapp halb so groß wie unser Mond.'
    }),
    moon({
      id: 'oberon', name: 'Oberon', parent: 'uranus', color: '#9c8f86', r: 1.2, orbit: 24, period: 13.5,
      diameterKm: 1523, distanceKm: 583500, year: 'ca. 13 ½ Tage',
      intro: 'Oberon ist der äußerste große Mond des Uranus und voller Krater.',
      fun: 'In Shakespeares Theaterstück ist Oberon der Feenkönig – der Mann von Titania! Die beiden kreisen als Nachbarn um Uranus.',
      compare: 'Oberon ist fast genauso groß wie Titania.'
    }),
    moon({
      id: 'triton', name: 'Triton', parent: 'neptun', color: '#d9c3b8', r: 1.5, orbit: 17, period: -5.88,
      craterColor: 'rgba(160,110,100,0.35)', diameterKm: 2707, distanceKm: 354760, year: 'ca. 6 Tage – rückwärts!', temp: 'ca. −235 °C',
      intro: 'Triton ist der größte Mond des Neptuns. Er gehört zu den kältesten Orten im ganzen Sonnensystem.',
      fun: 'Triton kreist rückwärts um Neptun – andersherum, als Neptun sich dreht! Wahrscheinlich war er früher ein Zwergplanet, den Neptun eingefangen hat.',
      compare: 'Triton ist ein bisschen kleiner als unser Mond.'
    })
  );
})();
