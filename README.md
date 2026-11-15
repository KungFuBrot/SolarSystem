# SolarSystem – Unser Sonnensystem 🪐

Eine interaktive Website, mit der Kinder das Sonnensystem – und was dahinter kommt – entdecken können.

**[Im Browser öffnen](https://kungfubrot.github.io/SolarSystem/)**

## Starten

Online über den Link oben, oder lokal einfach `index.html` im Browser öffnen (Doppelklick). Es wird nichts installiert.

## Was man machen kann

- **Ganzes Sonnensystem ansehen** und von dort aus jeden Planeten und Mond anklicken
- **Anklicken** → eine kleine 🚀 Rakete zündet, beschleunigt langsam und fliegt im Bogen hin; die Kamera begleitet sie. Auf Gesteinsplaneten und Monden macht sie einen Landeanflug und landet, über den Gas- und Eisriesen (ohne festen Boden) schwebt sie in den Wolken, die Sonne und andere Sterne umkreist sie. Danach erscheint die Info-Karte mit kindgerechten Fakten, „Wusstest du?“ und einem Größenvergleich
- **Die Erde** als drehender Globus mit echten Kontinenten, Wüsten, Regenwald, Eis und Wolken; in der Nahaufnahme mit Kontinenten, Ozeanen, Äquator und Orten wie Deutschland, Mount Everest, Sahara, Marianengraben
- **Monde**: neben unserem Mond auch Phobos, Deimos, Io, Europa, Ganymed, Kallisto, Mimas, Enceladus, Titan, Miranda, Titania, Oberon, Triton und Charon – dazu die Raumstation ISS (sichtbar in der Nahaufnahme, nachdem man ihren Planeten angeklickt hat)
- **Weitere Orte im Sonnensystem**: Zwergplaneten Ceres und Pluto, der Halleysche Komet auf seiner langen Bahn (mit Schweif), die Raumsonde Voyager 1 und der Kuipergürtel
- **🔄 Kippen und Drehen**: Knopf drücken und ziehen (oder rechte Maustaste / Pfeiltasten) – das Sonnensystem lässt sich in alle Richtungen kippen
- **Weit hinauszoomen** in drei Stufen, mit fließendem Übergang:
  - 🪐 Sonnensystem
  - ⭐ Nachbarsterne (bis 25 Lichtjahre: Proxima Centauri, Sirius, Teegardens Stern, Wega, Fomalhaut …) und die Oortsche Wolke
  - 🌌 Milchstraße mit Spiralarmen, Zentrum, Polarstern, Plejaden, Orionnebel, Helixnebel, Krebsnebel, Schwarzem Loch Cygnus X-1, Eta Carinae, Omega Centauri, Magellanschen Wolken, Andromeda- und Dreiecksgalaxie
- **🔭** → Karte schließen und alles zeigen – die Kippung bleibt; nochmal drücken richtet die Ansicht gerade aus
- **🔊 Vorlesen** → der Browser liest die Infos auf Deutsch vor
- **Zoomen** mit Mausrad, zwei Fingern (Touch) oder den Knöpfen `+` / `−`
- **Verschieben** durch Ziehen mit Maus oder Finger
- **Echte Zeit**: Alle Planeten, der Mond (mit der richtigen Mondphase), Ceres, Pluto und der Halleysche Komet stehen dort, wo sie zum angezeigten Datum wirklich sind (Bahndaten nach NASA/JPL). Die Abstände bleiben vereinfacht, die Richtungen stimmen.
- **📅 Datum auswählen**: Auf das Datum tippen öffnet einen Kalender (Jahr 1000 bis 3000) – die Planeten springen an ihre Stellung an diesem Tag, z. B. zur Mondlandung am 20. Juli 1969. Voyager 1 und die ISS erscheinen erst ab ihrem Start.
- **Zeitsteuerung**: ⏪ zurückspulen, ⏸️ anhalten, ⏩ vorspulen (nochmal drücken = schneller), 🐢 … 🚀 Tempo von Echtzeit bis 1 Jahr pro Sekunde, **🕐 Jetzt** springt zum aktuellen Zeitpunkt und läuft in Echtzeit weiter. Beim Start läuft die Zeit in Echtzeit (wie nach „Jetzt“)
- **📏 Größen** → alle Planeten in echtem Größenverhältnis neben der riesigen Sonne

Tastatur: `+` / `−` zoomen, Pfeiltasten kippen/drehen, `Leertaste` Pause, `Esc` oder `0` zurück zur Übersicht.

## Dateien

- `index.html` – Seitenaufbau
- `style.css` – Aussehen
- `js/data.js` – Texte und Zahlen zu Sonne, Planeten, Monden, Zwergplaneten, Komet, ISS und Voyager
- `js/earth.js` – Umrisse der Kontinente und Orte auf der Erde
- `js/space.js` – Nachbarsterne und Milchstraße
- `js/app.js` – Zeichnen, 3D-Ansicht, Zoom-Stufen, Rakete, Bedienung
