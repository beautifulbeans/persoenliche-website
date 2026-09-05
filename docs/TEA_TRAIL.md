# Tea Trail

Stand: 6. September 2026. Vollständig spielbares, statisch ausgeliefertes 3D-Minispiel unter `/tea-trail/`. Der bisherige „Coming Soon“-Platzhalter der Startseite enthält jetzt einen Teaser mit einer kleinen Aufnahme aus dem Spiel, der direkten Einladung „Kleines Minigame. Kurz abschalten.“ und einem Spiel-Link. „15 Sekunden, eine Tasse Tee und ein paar kleine Umwege.“ erklärt die Runde in einem Satz. Das Bild lädt verzögert; Spielcode, Modelle, Texturen und Ton starten dort nicht. Keine Anmeldung, Werbung, Rangliste, Musikaufnahmen oder Datenübertragung von Spielständen.

## Aktuelle Abstimmung nach den Spieltests

Die aktuelle Fassung verbindet die überarbeitete Bewegung und malerische Abenteuer-Spielästhetik mit mehr Zeitdruck:

- Bewegungsrichtung folgt direkt Tastatur oder Stick, unabhängig von der sanft nachgezogenen Blickrichtung. Vektoriell begrenzte Beschleunigung, griffigere Untergründe, kräftigeres Bremsen und ein sauberer Stillstand ersetzen die bisherige Fahrzeugsteuerung.
- Die Portion hat mehr Platz unter dem Rand, die Flüssigkeit ist stärker gedämpft. Normale Start-Stopp-Folgen bleiben im Test verlustfrei. Schnelle, enge Kurven erzeugen jetzt zusätzliche Querkräfte; ein direkter Zusammenstoß mit der Kamera kostet im Test etwa 4,3 % Tee.
- Die Figur besitzt vorgeplante Fußlandungen, feste Standpositionen im Weltraum und eine prozedurale Zweigelenk-Beinbewegung. Schrittgeräusche werden beim tatsächlichen Auftreten ausgelöst. Auch Tablettneigung und Schwerkraftausgleich berücksichtigen die Blickrichtung.
- Aus dem schlichten Atelierbrett wird eine begrünte Gartenterrasse: rundere Formen, Baumkronen, Blüten, gebogene Blätter, Pergola, ruhige gemalte Holzmaserung, weniger kleinteilige Linien und neues Licht. Die persönlichen Parcoursgegenstände bleiben erhalten.

- Die normale Runde dauert jetzt **15 statt zuletzt 25 Sekunden**. Der sanfte Modus bleibt bei 35 Sekunden und einer eigenen Bestleistung. Drei Blätter verlangen mindestens 90 % Tee und 820 Punkte. Bewegung, Physik, Kamera und Hindernisse wurden für diese Kürzung nicht beschleunigt oder verändert.
- Die Kamera ist näher an der Figur und blickt weniger weit voraus. Auf dem Desktop ist am Start der nächste Hauptabschnitt noch außerhalb des Bildes. Im Hochformat bleiben Figur, nächste Hindernisse und Touchflächen sichtbar.
- WASD wird ausdrücklich als digitale Steuerung berücksichtigt: Einzelne diagonale Übergänge bleiben im Test verlustfrei, schnelle 90°-Ecken kosten Tee. Kurzes Bremsen mit der Leertaste vor und während der Ecke schützt die Tasse.

| Reproduzierbare Prüfung | Aktuelles Ergebnis |
| --- | ---: |
| Schnelle 90°-Kurve bei voller Fahrt | 4,0 % Teeverlust |
| Dieselbe Kurve, 0,2 s vorher und in der Kurve gebremst | kein Teeverlust |
| Einzelner 45°-Richtungswechsel | kein Teeverlust |
| 90°-Kurve mit kurzem diagonalen Zwischenschritt | 2,2 % Teeverlust |
| Breiter Weg im sanften Modus, ausschließlich acht digitale WASD-Richtungen und Bremstaste | 21,9 s, 99,7 % Tee |
| Direkter Weg über die Schallplatte im normalen Modus, ausschließlich acht digitale WASD-Richtungen und Bremstaste | 12,9 s, 91,6 % Tee |
| Wiederholtes normales Anlaufen, Lenken und Anhalten | 100 % Tee |
| Nachlauf nach Loslassen bei voller Fahrt | weniger als 0,42 m, Stillstand innerhalb von 0,4 s |

Diese Zahlen beschreiben reproduzierbare Prüfungen, keine garantierten Ergebnisse für jede Spielweise. Die Feinabstimmung kann nach weiteren tatsächlichen Spielrunden weiter angepasst werden.

## Gestalterische Integration

Das bestehende Portfolio bleibt die Grundlage: Astro mit TypeScript, lokale Cormorant-Garamond- und Manrope-Schriften, Phosphor-Symbole, matte Olivtöne und das Mineralgrau des persönlichen Bereichs. Die neue Spielroute verwendet das vorhandene `BaseLayout`, eigene lokal begrenzte Klassen und dieselben Fokus- und Buttonmuster. Die bestehenden Startseiten-Interaktionen bleiben erhalten.

Das Gartenatelier ist eigens aus dreidimensionalen Geometrien modelliert: Holzbohlen und Maserung, glasiertes Porzellan, Metallringe an Objektiven, Plattenhüllen und sichtbare Schallplatten, Stoffbrücke, Pflanzgefäße, Karten und Teegeschirr. Die Modelle werden vorab zusammengefasst, quantisiert und mit Meshopt in eine GLB-Datei komprimiert. Das Holz verwendet eine eigene gemalte 512-Pixel-WebP-Textur; sie wird erst nach Start geladen. Ihre UV-Koordinaten werden im Modell ausdrücklich erhalten, obwohl das Bild nicht in der GLB eingebettet ist. Ein zurückhaltender Materialshader stimmt Farbe und Kontrast ab; ein weiterer bewegt das Blattwerk. Das Vorschaubild ist eine Aufnahme dieser tatsächlichen Spielwelt.

## Spielen

- Pfeiltasten oder WASD: bewegen. Beschleunigung bleibt weich; Loslassen bremst zügig. Die Figur dreht ihren Körper nach, ohne die gewünschte Bewegungsrichtung zu verzögern.
- Leertaste oder Umschalttaste: langsamer und stabiler tragen.
- Touch: linker Joystick; rechte „Ruhig“-Taste gedrückt halten.
- Escape, Pause-Button, Tab aus dem Spielfeld, Fensterwechsel oder ein ausgeblendeter Tab pausieren. Eine lange Unterbrechung des Renderloops pausiert ebenfalls.
- Ton und Lautstärke bleiben erreichbar. Ihre Bedienung und der Zurück-Link werden nicht von einem Pausenfenster abgefangen.
- Im markierten Bereich vor dem Teetisch langsam anhalten. Eine leere Tasse beendet die Runde nicht vorzeitig.

Die 15 Sekunden lassen bei der digitalen Tastatur-Testfahrt über die Schallplatte rund zwei Sekunden Reserve. Dafür wurden die Test-Wegpunkte der Abkürzung direkter durch den vorhandenen Parcours gelegt; die begehbare Welt bleibt unverändert. Die Runde fordert zügiges Vorankommen und gezieltes Abbremsen. Der sanfte Modus bietet 35 Sekunden, weniger Tempo und stärkere Stabilisierung; eine Änderung gilt erst für die nächste Runde. Der mit Blättern markierte Umweg über die Stoffbrücke ist für diesen Modus geeignet und passt bei den bisherigen Testfahrten nicht in das normale 15-Sekunden-Limit. Startanleitung und Streckenbeschreibung weisen deshalb auf die Abkürzung hin. Die rotierende Platte erzeugt seitliche Kräfte und verlangt Timing am Tonarm. Das rollende Objektiv und der Tonarm variieren nur in einer begrenzten Anfangsphase; Positionen und übriger Parcours ändern sich nicht zufällig.

| Abschnitt | Funktion |
| --- | --- |
| Startmatte und freie Holzfläche | Bewegen und Bremsen kennenlernen |
| Kamera, feste Objektive und Pflanzenkübel | Erste breite Rechtskurve; zusätzliche Kollision am vorstehenden Kameraobjektiv |
| Rollendes Objektiv | Erste bewegliche Engstelle |
| Vinylkisten, Stoffbrücke und Plattenspieler | Breiter Umweg oder riskantere Abkürzung |
| Hantel und Teedose | Richtungswechsel vor dem Steinbereich |
| Kartentor, Chips und Löffel | Präzise Schlusskurven und Bodenhindernisse |
| Teetisch mit Kanne und Untertassen | Erkennbares Ziel mit Platz zum Abbremsen |

## Technischer Aufbau

`boot.ts` steuert die statische Oberfläche, Einstellungen, Zustände und Ergebnisdialoge. Erst ein Start-Klick importiert `game.ts` und damit Three.js und Rapier. Die GLB-Datei wird anschließend geladen. Es gibt kein zusätzliches UI-Framework und keine serverseitige Spiellogik.

Die Simulation läuft mit festen Schritten von 1/60 Sekunde. Ein Akkumulator trennt sie von der Bildrate. Rapier übernimmt den dynamischen Spielerkörper, zusammengesetzte Masseeigenschaften mit erhöhtem und nach vorn versetztem Schwerpunkt, CCD und Kollisionen mit festen und kinematischen Körpern. Unterschiedliche Bodenmaterialien verändern Beschleunigungs- und Bremsantwort. Die rotierende Platte überträgt tangentiale Kräfte, der Tonarm ist ein tatsächlich bewegter Collider.

Tablett, Tasse und Flüssigkeit verwenden gekoppelte, gedämpfte Federzustände, die aus der tatsächlichen Geschwindigkeitsänderung nach dem Physikschritt angeregt werden. Die Oberfläche bleibt bei Ruhe waagerecht und reagiert unmittelbar auf Bewegung, Kurven, Stöße und optionale Sensorkräfte. Oberflächenhöhe und Randüberstand bestimmen den Teeverlust. Sichtbare Tropfen und Flecken erscheinen nur bei tatsächlichem Verlust. Ihre Anzahl ist begrenzt und wiederverwendet dieselben Instanzen.

Die zusätzliche Kurvenkraft entsteht aus der Querbeschleunigung, nicht aus der nachlaufenden Körperdrehung. Sie setzt oberhalb von 1,7 m/s und rund 39° Richtungsabweichung weich ein und wird über etwa 83 ms geglättet. Dadurch führt das Hinzufügen oder Loslassen einer einzelnen WASD-Taste nicht sofort zu einer harten Strafwelle. Kollisionen bleiben separat angeregt.

Die Kamera folgt exponentiell geglättet mit begrenztem Vorblick. Der vertikale Bildausschnitt beträgt auf dem Desktop je nach Seitenverhältnis 12,5–14,6 statt bisher 19 Welteinheiten, im Hochformat 16,6. Der Vorblick entlang des Parcours sinkt von 2,8 auf 1,45 Einheiten; ein kleiner seitlicher Vorblick folgt der Bewegung. Die erhöhte Perspektive, niedrige Hindernisse und fehlende hohe Vordergrundwände halten die Figur sichtbar. Reduzierte Bewegung deaktiviert Körperwippen und dekorativen Wind und erhöht die Kamerastabilität. Die notwendigen Schrittphasen und die Flüssigkeitsbewegung bleiben sichtbar.

## Ergebnis und Speicherung

Bis zu 1.000 Punkte: 700 für die verbleibende Teemenge, 150 für Zeit, 75 für wenige Kollisionen und 75 für ruhige Bewegung. Der Zeitanteil verwendet das jeweilige Limit von 15 oder 35 Sekunden. Drei Blätter benötigen mindestens 90 % Tee und 820 Punkte, zwei mindestens 65 % Tee und 650 Punkte. Eine Ankunft erhält mindestens ein Blatt. Ohne Ankunft gibt es keine Punkte und keine Blätter; verbleibender Tee, Verlustursachen und weitere Versuche bleiben sichtbar.

Die Ergebnisansicht zeigt Zeit, Tee, Punkte, eine Verlustkarte, den Abschnitt mit dem größten Verlust und Anteile für Beschleunigen/Bremsen, Kurven, Kollisionen und Handyneigung. Die Stellen und verlorenen Mengen stammen aus der Simulation. Die Aufteilung nach Ursache ist eine gewichtete Näherung anhand der gleichzeitig wirkenden Kräfte, keine unabhängige wissenschaftliche Ursachenanalyse.

Local Storage:

- `tea-trail:settings:v1`: Lautstärke, Stummschaltung, sanfter Modus und Sensorstärke.
- `tea-trail:best:v3`: beste erfolgreiche Runde unter den neuen Zeitregeln, getrennt für normalen und sanften Modus. Alte `v1`- und `v2`-Werte bleiben im Speicher erhalten, werden wegen der geänderten Regeln jedoch nicht verglichen.

Sensorfreigabe, neutrale Haltung, Rohwerte und Bewegungsverläufe werden nicht gespeichert. Ungültige Speicherinhalte werden verworfen; verweigerter Speicherzugriff verhindert weder Start noch Spiel. Die Datenschutzhinweise der Website beschreiben diese Funktionen.

## Sensoren

Neigung ist standardmäßig deaktiviert. Der eigene Aktivierungsbutton prüft Secure Context und API-Verfügbarkeit und ruft gegebenenfalls `DeviceOrientationEvent.requestPermission()` direkt aus dem Klick auf. Erst danach werden Werte verarbeitet. Die erste gültige Haltung nach Aktivierung oder Fortsetzung wird als neutral kalibriert.

2,5° Totzone, exponentielle Glättung, begrenzte Ausschläge und eine einstellbare Stärke von 0–100 % schützen vor Zittern und extremen Werten. Die Orientierung des Displays wird bei der Achsenumrechnung berücksichtigt. Neue Kalibrierung ist jederzeit in den Einstellungen möglich. Veraltete Signale werden zu null, ein fehlendes erstes Sensorsignal deaktiviert die Funktion nach 3,5 Sekunden. Verweigerte oder fehlende Freigabe führt zur unveränderten Joystick- und Ruhig-Steuerung. Sensorlistener werden in Pause und beim Verlassen abgemeldet.

## Ton

Originale, prozedural erzeugte Klänge über Web Audio: gefilterte Schritte auf Holz, Stein und Stoff, Schwappen, Tropfen, materialabhängige Kontaktklänge, Porzellanklirren, dezente Raumluft, entferntes Kesselrauschen und lokales Vinylknistern. Keine externen Audio-Dateien, Musik oder Lizenzen für fremde Aufnahmen nötig. Der AudioContext entsteht erst nach einem Start-Klick. Pause suspendiert ihn, Verlassen schließt ihn vollständig.

## Performance

Gemessen lokal auf Apple M1 mit Chrome, jeweils eine vollständige, automatisch und analog gesteuerte Runde über den direkten Weg durch die Schallplatte. Desktop 1440 × 1000 bei DPR 1; Touch-Emulation 390 × 844 mit gemeldetem DPR 3 und intern auf 1,35 begrenzter Renderauflösung. Beide Runden erreichten nach 10,27 Sekunden den Tisch mit rund 95,8 % Tee und 851 Punkten. Die folgenden Werte wurden mit dem 15-Sekunden-Limit neu gemessen. Die separaten rein digitalen Steuerungsprüfungen stehen oben.

| Messwert | Desktop | Mobile Touch-Emulation |
| --- | ---: | ---: |
| Durchschnittliche Bildrate über die Runde | 60,1 FPS | 57,6 FPS |
| 95. Perzentil Frame-Abstand | 16,7 ms | 16,7 ms |
| 95. Perzentil CPU-Aufwand des Renderaufrufs | 1,4 ms | 1,9 ms |
| Qualität | Hoch | Mittel |
| Render-Pixel-Ratio | 1,0 | 1,35 |
| Zeichenaufrufe am Rundenende | 90 | 87 |
| Dreiecke inklusive erfasster Renderdurchläufe | ca. 393.700 | ca. 387.500 |
| Angelegte Geometrien / Texturen am Rundenende | 54 / 10 | 54 / 10 |

Die Renderzeit ist eine CPU-Messung um den Aufruf, keine GPU-Zeitmessung. Die mobile Ansicht wurde auf der GPU des Macs gerendert und ist kein Benchmark für ein echtes Mittelklasse-Handy.

Schutzmaßnahmen: 13 zusammengefasste Modell-Meshes, Instancing für Blätter/Tropfen/Flecken, 64 Tropfen und 96 Flecken in festen Pools, mobile Schatten mit 1024 statt 2048 Pixeln und reduzierte Renderauflösung. Bei länger hoher Framezeit wird die Qualität zuerst auf Mittel, dann auf Niedrig gesenkt. Niedrig verwendet DPR 1 und deaktiviert Schattenkarten; Spiellogik bleibt unverändert.

| Zusätzliche Ressource | Unkomprimiert / Dateigröße | Gzip-Vergleich | Ladezeitpunkt |
| --- | ---: | ---: | --- |
| Oberflächen- und Einstellungscode | ca. 20 kB | ca. 7,7 kB | Spielroute |
| Spiel, Three.js, Rapier inklusive WASM | ca. 3,53 MB | ca. 1,25 MB | Start-Klick |
| Komprimiertes Atelier-GLB | 1.243.852 Bytes | 273.009 Bytes | Start-Klick |
| Gemalte Holztextur, 512 × 512 | 19.744 Bytes | bereits bildkomprimiert | Start-Klick |
| WebP-Vorschau | 92.810 Bytes | bereits bildkomprimiert | Spielroute |
| Startseiten-Teaser, 640 × 404 WebP | 21.660 Bytes | bereits bildkomprimiert | verzögert nahe dem sichtbaren Bereich |
| Startseiten-Spielcode, 3D- und Audioressourcen | 0 Bytes | 0 Bytes | werden dort nicht geladen |

Gzip-Werte sind lokal berechnete Vergleichswerte. Die tatsächliche Übertragung hängt von der Komprimierung des Hostings ab. Die Startseite bekommt Markup, angepasste CSS-Regeln und ein kleines statisches Vorschaubild mit `loading="lazy"`. Der Link deaktiviert Prefetch ausdrücklich. Im gebauten HTML und über Netzwerkbeobachtung sind weder Engine-Import noch Modellabruf auf der Startseite vorhanden. Eine vollständige Vorher/Nachher-Lighthouse-Messung der übrigen Website wurde nicht durchgeführt.

Der Build weist auf den großen, absichtlich erst nach dem Start importierten Engine-Chunk hin. Dieser enthält insbesondere die gebündelte Rapier-WASM-Datei. Der Hinweis ist dokumentiert und nicht durch ein erhöhtes Warnlimit versteckt.

Beim Verlassen: Animation Frame abbrechen, Inputs abmelden, Pointer Capture lösen, Sensorlistener entfernen, ausstehendes Modell-Fetch abbrechen, Physikwelt und EventQueue freigeben, Geometrien/Materialien/Texturen/Instanzen und Renderziele entsorgen, das Textur-ImageBitmap schließen, WebGLContext freigeben und AudioContext schließen. Ein im Back/Forward-Cache wiederhergestelltes Dokument lädt einen frischen Startzustand. Wiederholte Runden verwenden dieselben Ressourcen; der Ressourcentest prüft gleichbleibende Zähler und null GPU-Geometrien nach Disposal.

## Prüfungen

26 automatisierte Prüfungen bestanden. Erfolgreich geprüft:

- Astro-Prüfung ohne Fehler, Warnungen oder Hinweise und Produktions-Build für sieben statische Seiten.
- 13 Physik- und Animationstests: Ruhe/Zeitablauf, begehbarer Umweg, Abkürzung bei drei Anfangsphasen, Stabilisierung, Dämpfung/Mengenerhaltung, Wertung/Reset, verlustfreie normale Manöver, kurzer Bremsweg und Umkehr ohne Bogen, dosierter Kollisionsverlust, feste Fußkontakte mit Schrittende im Stand, schnelle/gebremste/diagonale Kurven, beide Zeitlimits und beide Strecken mit ausschließlich digitalen Richtungen.
- Neun Browsertests: verzögertes Laden und Audiofreigabe, Tastatur/Pause/Neustart und engerer Kameraausschnitt, Touch-Cancel und beide Ausrichtungen, verweigerte Sensorfreigabe, Kalibrierung/Totzone/Begrenzung/Deaktivierung, fehlende Sensoren/gesperrter Speicher/503-Wiederholung für Modell und Textur, Ergebnis/Speicherung/Disposal, Einstellungsübernahme einschließlich nächster Rundendauer und Zurück-Navigation.
- Zwei vollständige Runden mit Bildratenmessung, auf Desktop und in mobiler Touch-Emulation.
- Zwei Tests gegen den statischen Produktionsserver: Startseiten-Teaser und Spiel-Link auf Desktop und bei 320 Pixeln, verzögertes Laden, funktionierende Bewegung/Ton/Pause, fehlende Entwicklungs-API, Touchansicht und reduzierte Bewegung.
- Sichtprüfung der Startansicht, des laufenden Parcours und der Ergebnisansicht auf Desktop, Hochformat und Querformat.
- Geprüfte Textkontraste: Haupttext 10,65:1, Sekundärtext 5,52:1, Primärbutton 7,20:1, knapper Timer 6,80:1; Fokusfarbe auf heller Oberfläche 7,11:1.
- `npm audit fix` innerhalb vorhandener Versionsbereiche; anschließend null bekannte Schwachstellen. Der Lockfile enthält jetzt Astro 7.3.1 sowie die kompatiblen Updates der zuvor gemeldeten transitiven Pakete.

Die Entwicklungsdiagnose `window.__teaTrail` wird ausschließlich durch `import.meta.env.DEV` bereitgestellt und ist in der Produktionsausgabe nicht vorhanden.

## Abhängigkeiten

Neu zur Laufzeit: `three` 0.185.1 und `@dimforge/rapier3d-compat` 0.20.0. Ohne React, Vue, zusätzliche UI-Komponentenbibliothek oder externen CDN-Abruf.

Neu für Entwicklung und Asset-Erzeugung: `@types/three` 0.185.4, `@gltf-transform/core`, `@gltf-transform/extensions` und `@gltf-transform/functions` jeweils 4.5.0, `meshoptimizer` 1.2.0 und `@playwright/test` 1.63.0. Der Meshopt-Decoder für den Browser kommt aus Three.js. Die Vorschauerzeugung verwendet zusätzlich das bereits mit Astro vorhandene Sharp. Alle konkreten Auflösungen stehen in `package-lock.json`.

## Geänderte und neue Dateien

| Datei | Änderung |
| --- | --- |
| `src/pages/tea-trail.astro` | Neue statische Route, Spielbereich, Anleitung, HUD und native Dialoge |
| `src/styles/tea-trail.css` | Auf das Spiel begrenzte Gestaltung, Fokus, Safe Areas, Hoch-/Querformat und reduzierte Bewegung |
| `src/games/tea-trail/boot.ts` | Oberfläche, Zustände, Lazy Import, Einstellungen, Ergebnis, Speicherung und Lebenszyklus |
| `src/games/tea-trail/game.ts` | Spielloop, Zeit, HUD und Zusammenspiel von Physik, Ton und Darstellung |
| `src/games/tea-trail/level.ts` | Gemeinsame Leveldaten, Wegpunkte, Untergründe und Materialien |
| `src/games/tea-trail/simulation.ts` | Rapier-Körper, Bewegung, Hindernisse, Kollisionen, Sieg und Verluststellen |
| `src/games/tea-trail/liquid.ts` | Gedämpfte Flüssigkeit, Tablett/Tasse, Überlaufen und Wertung |
| `src/games/tea-trail/input.ts` | Tastatur, Joystick, Pointer Capture und Ruhig-Taste |
| `src/games/tea-trail/sensors.ts` | Freigabe, neutrale Haltung, Ausrichtung, Glättung und vollständige Deaktivierung |
| `src/games/tea-trail/audio.ts` | Originale Web-Audio-Klänge, Lautstärke, Pause und Freigabe |
| `src/games/tea-trail/scene.ts` | Three.js, Kamera, Materialshader, Flüssigkeit, Partikel und Qualitätsanpassung |
| `src/games/tea-trail/character.ts` | Neue Figur, feste Fußkontakte, geplante Landungen, Bein-Gelenke und synchronisierte Schritte |
| `public/tea-trail/atelier.glb` | Eigenes, komprimiertes 3D-Atelier |
| `public/tea-trail/atelier-preview.webp` | Kleine Aufnahme des echten überarbeiteten Parcours |
| `public/tea-trail/painted-wood.webp` | Eigene generierte Holztextur als kompaktes WebP |
| `public/tea-trail/teaser.webp` | 640-Pixel-Vorschau für den Startseiten-Teaser |
| `scripts/build-tea-trail.mjs` | Reproduzierbarer Modellbau, Zusammenfassung und GLB-Komprimierung |
| `scripts/capture-tea-trail.mjs` | Erzeugung der WebP-Vorschau aus der laufenden Entwicklungsansicht |
| `src/pages/index.astro` | Bisherigen Minigame-Platzhalter durch Tea-Trail-Teaser mit deaktiviertem Prefetch ersetzen |
| `src/styles/latest.css` | Responsiver Teaser, Bild, Text und fokussierbarer Spiel-Link |
| `src/layouts/BaseLayout.astro` | Viewport-Metadaten für Skalierung und Safe Areas |
| `src/pages/datenschutz.astro` | Sachliche Beschreibung lokaler Spielspeicherung und optionaler Sensoren |
| `tests/tea-trail/physics.spec.ts` | 13 deterministische Physik- und Animationstests |
| `tests/tea-trail/browser.spec.ts` | Neun Bedienungs- und Fehlerfalltests |
| `tests/tea-trail/performance.spec.ts` | Zwei optionale vollständige Render-Messrunden |
| `tests/tea-trail/production.spec.ts` | Zwei Tests gegen die statische Ausgabe |
| `playwright.config.ts` | Lokaler Server und portabler Chrome-/Chromium-Teststart |
| `package.json`, `package-lock.json` | Neue Pakete, kompatible Sicherheitsupdates und Spielskripte |
| `.gitignore` | Lokale Testberichte ausschließen |
| `README.md` | Einstieg und Verweis auf diese Dokumentation |
| `docs/TEA_TRAIL.md` | Diese Implementierungs- und Prüfdokumentation |

## Lokal arbeiten

Node 24 ist für die TypeScript-Leveldaten im Modellgenerator geeignet. Der normale Astro-Build verwendet die bereits eingecheckten Assets; er führt weder den Modellgenerator noch einen Browser aus.

```sh
npm install
npm run dev
npm run test:tea-trail
npm run check
npm run build
```

Die Tests verwenden standardmäßig Port 4321, alternativ `TEA_TRAIL_URL`. Falls lokal Chrome vorhanden ist, wird es auf macOS erkannt. Auf anderen Systemen zunächst `npx playwright install chromium` ausführen oder `TEA_TRAIL_CHROME` mit einem ausführbaren Browserpfad setzen.

```sh
# Modelle nach einer Änderung an Geometrie oder Leveldaten neu erzeugen:
npm run tea-trail:assets

# Bei laufender Entwicklungsansicht eine aktuelle Vorschau erzeugen:
npm run tea-trail:preview

# Vollständige Runden zur Bildratenmessung:
TEA_TRAIL_PERF=1 npx playwright test tests/tea-trail/performance.spec.ts

# Produktionsausgabe separat starten und prüfen:
npm run preview -- --port 4341
TEA_TRAIL_URL=http://127.0.0.1:4341 TEA_TRAIL_PRODUCTION=1 npx playwright test tests/tea-trail/production.spec.ts
```

In dieser Arbeitsumgebung lief die Entwicklungsansicht auf Port 4340 und die Produktionsvorschau auf Port 4341. Für die entsprechenden Befehle wurde `TEA_TRAIL_URL` gesetzt. Die Veröffentlichung erfolgt auf ausdrücklichen Wunsch des Website-Inhabers über den bestehenden GitHub-Pages-Workflow bei einem Push auf `main`.

## Bekannte Grenzen

- Echte iOS-/Android-Hardware wurde nicht geprüft. Die Berechtigungszweige wurden simuliert; insbesondere der reale iOS-Dialog, Gerätetilt bei verschiedenen Handhaltungen und thermisches Verhalten auf Mittelklassegeräten bleiben gerätespezifisch zu prüfen.
- Der Spielerkörper bleibt auf einer begehbaren Ebene und aufrecht. Tablett und Tasse sind gewichtete, gekoppelte Feder-Näherungen mit sichtbarer Neigung; sie sind keine frei herunterfallenden, separat gelenkverbundenen Rapier-Körper. Brücke und Stoffbelag sind bewusst niedrige Übergänge. Freies Springen und Stürze gehören nicht zu diesem Parcours.
- Die Flüssigkeit verwendet ein physikalisch angeregtes, gedämpftes Oberflächenmodell. Es ist keine dreidimensionale Fluidsimulation; Quellenanteile des Verlusts sind eine Heuristik.
- Ton ist dezente synthetische Geräuschgestaltung, keine Studio-Foley-Aufnahme. Die Balance wurde technisch geprüft; subjektive Klangqualität auf verschiedenen Lautsprechern ist nicht durch automatisierte Tests belegt.
- WebGL 2 und WebAssembly sind erforderlich. Bei fehlender Unterstützung oder Ladefehlern erscheinen verständliche Hinweise sowie Wiederholung und Rückkehr zur Website.
- Tastatur, Fokus, Statusmeldungen, Kontraste und reduzierte Bewegung werden unterstützt. Das visuelle 3D-Navigationsspiel besitzt keinen vollständigen nichtvisuellen Spielmodus; die Tests sind kein umfassendes WCAG-Audit der gesamten Portfolio-Website.

## Gemalte Holztextur

`public/tea-trail/painted-wood.webp` wurde mit dem eingebauten Bildgenerierungswerkzeug erzeugt, anschließend auf 512 × 512 Pixel verkleinert und als WebP gespeichert. Kein neues Paket oder externer Dienst wird im Spiel benötigt. Keine übernommenen Figuren, Markenzeichen oder Spielassets; der Stilbezug gilt der malerischen Materialrichtung. Die finale Farbe wird im Materialshader zurückhaltender abgestimmt.

Verwendeter Prompt:

> Use case: stylized-concept. Asset type: seamless tileable diffuse/albedo texture for a real-time 3D cozy adventure game, square 1024x1024. Create a beautifully hand-painted warm honey walnut wood grain material, straight-on flat orthographic surface. ONE continuous wood surface, NO individual planks, NO seams, NO borders. Soft broad flowing grain, occasional small elongated knots, visible restrained gouache brush strokes, color variations in toasted ochre and warm medium brown. Medium contrast, neither pale beige nor dark chocolate. Grain runs vertically. Lighting completely even, no directional shading, no highlights, no perspective, no cast shadows. Painterly stylized 3D adventure game art reminiscent of high quality Nintendo fantasy environment textures, but original artwork, not copied from any game. Texture fills edge to edge and tiles in both axes. No objects, no text, no symbols. Save a local file for use as the game's wood material.

## Technische Referenzen

Verwendete offizielle Referenzen: [Three.js WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html), [Three.js Materialien](https://threejs.org/docs/pages/Material.html), [Three.js Texturen](https://threejs.org/docs/pages/Texture.html), [Three.js Ressourcenfreigabe](https://threejs.org/manual/en/how-to-dispose-of-objects.html), [Rapier Rigid Bodies](https://rapier.rs/docs/user_guides/javascript/rigid_bodies/), [Rapier Masse und Schwerpunkt](https://rapier.rs/docs/user_guides/javascript/rigid_body_mass_properties/) und [MDN Sensorfreigabe](https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent/requestPermission_static). Für die Integration waren zusätzlich die tatsächlich installierten Pakettypen und Astro-CLI-Quellen maßgeblich.
