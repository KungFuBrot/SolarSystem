// Alle Himmelskörper mit kindgerechten Infos.
// r / orbit = Darstellung in der Übersicht (NICHT maßstabsgetreu)
// sizeR = echter Radius im Verhältnis zur Erde (Erde = 1)
// period = Umlaufzeit in Erdtagen
window.BODIES = [
  {
    id: 'sonne', name: 'Sonne', kind: 'Stern', color: '#ffc93c',
    r: 30, orbit: 0, period: 0, start: 0, sizeR: 109,
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
    id: 'merkur', name: 'Merkur', kind: 'Gesteinsplanet', color: '#9c9590',
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
    id: 'venus', name: 'Venus', kind: 'Gesteinsplanet', color: '#e6bf78',
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
    id: 'erde', name: 'Erde', kind: 'Gesteinsplanet – unser Zuhause', color: '#2f6fd6',
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
    id: 'mars', name: 'Mars', kind: 'Gesteinsplanet', color: '#cf5f38',
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
    id: 'jupiter', name: 'Jupiter', kind: 'Gasriese', color: '#d8b48a',
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
    id: 'saturn', name: 'Saturn', kind: 'Gasriese', color: '#e3c98f',
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
    id: 'uranus', name: 'Uranus', kind: 'Eisriese', color: '#9ee0e6',
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
    id: 'neptun', name: 'Neptun', kind: 'Eisriese', color: '#3d6fe0',
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
