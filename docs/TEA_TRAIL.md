# Tea Trail

Stand: 8. September 2026. Statisches Astro-/TypeScript-Minispiel unter `/tea-trail/`. Die Startseite enthält ausschließlich die Einladung „Kleines Minigame. Kurz abschalten.“, ein verzögert geladenes Vorschaubild und den Link. Engine, Modelle, Texturen und Audio starten erst nach einem bewussten Klick auf der Spielseite. Kein Konto, keine Cookies, keine Rangliste und keine Übertragung von Spielständen.

## Drei zunehmend schwierigere Level

Alle Level spielen im gemeinsamen Gartenatelier, mit unterschiedlichen Pflichtwegen und zusätzlichen Hindernissen. Die drei nummerierten goldenen Bodenmarken müssen in der richtigen Reihenfolge passiert werden. Erledigte Marken verblassen. Dadurch lässt sich der längere Parcours nicht durch einen direkten Lauf zum Tisch umgehen.

| Level | Normal / sanft | Tee zum Bestehen | Parcours |
| --- | --- | --- | --- |
| 1 · Am Plattenspieler | 15 / 35 Sekunden | 80 % | Direkte Strecke über die Schallplatte, rollendes Objektiv, verschiebbare Teedose |
| 2 · Karten im Wind | 20 / 40 Sekunden | 85 % | Zusätzliche Rechtskurve, schnellerer Tonarm, seitlich bewegte Spielkarte, lose Dose und Chips |
| 3 · Letzter Aufguss | 25 / 45 Sekunden | 90 % | Langer Weg über die Stoffbrücke, zwei bewegte Karten, zwei lose Dosen und Chips; schnelleres Objektiv und Tonarm |

Ein erfolgreich servierter Tee schaltet das nächste Level frei. Zeitüberschreitung oder zu wenig Tee schalten nichts frei. Auch eine zu leere Tasse wird am Tisch abgestellt; anschließend erklärt das Ergebnis die Mindestmenge. Alle freigeschalteten Level bleiben innerhalb der Sitzung wiederholbar. Der sanfte Modus bietet jeweils 20 zusätzliche Sekunden und stärkere Stabilisierung, mit gesonderter Bestleistung pro Level.

Die Hindernisse behalten ihre persönlichen Bezüge: Kamera und Objektive bilden die erste Kurve, Vinyl und Tonarm verlangen Timing, Hantel und Teedosen lenken in den Steinbereich, Karten und Pokerchips verengen das letzte Stück. Lose Dosen und Chipstapel besitzen dynamische Rapier-Körper und lassen sich beim Anstoßen tatsächlich verschieben. Bewegte Karten sind kinematische Barrieren. Die Anfangsphase der beweglichen Hindernisse variiert begrenzt; der Grundriss bleibt lernbar.

Drei dunkle Bodenpfeile, ein Zielring und „TEE HIER ABSTELLEN“ markieren den Anhaltepunkt. Nach allen Wegmarken nennt auch das HUD die drei Pfeile. Eine 1,8 Sekunden lange Sequenz lässt die Figur zum Tisch treten und das Tablett abstellen. Die Uhr stoppt bei Ankunft; Escape pausiert auch diese Sequenz. Der Ergebnisdialog folgt erst danach.

## Steuerung und Physik

WASD/Pfeile bewegen, Leertaste oder Umschalt tragen langsamer und stabiler. Auf Touchgeräten gibt es Joystick und Ruhig-Taste. Digitale Richtungswechsel werden vektoriell geglättet, Loslassen bremst griffig. Die nachlaufende Körperdrehung verändert die gewünschte Bewegungsrichtung nicht. Fußkontakte bleiben in der Standphase an derselben Weltposition; eine prozedurale Zweigelenk-Beinbewegung verbindet die Schritte auch beim Annähern an den Tisch.

Rapier läuft mit festen 1/60-Sekunden-Schritten, CCD, zusammengesetzten Masseeigenschaften und erhöhtem Schwerpunkt. Untergründe verändern Beschleunigung und Reibung. Die Platte überträgt tangentiale Kräfte. Tablett, Tasse und Tee verwenden gekoppelte gedämpfte Federn, angeregt durch tatsächliche Beschleunigung, Kurvenkräfte, Kollisionsimpulse und optionale Sensorsignale. Überstand am Tassenrand reduziert die Teemenge und erzeugt begrenzte, wiederverwendete Tropfeninstanzen.

Normale Start-/Stopp-Folgen und einzelne 45°-Übergänge bleiben im deterministischen Test verlustfrei. Eine schnelle 90°-Ecke kostet rund 4 % Tee; rechtzeitiges kurzes Bremsen verhindert diesen Verlust. Eine harte Kollision mit der Kamera kostet rund 4,3 %. Die höheren Level erhöhen die Schwierigkeit über Strecke, Timing und geforderte Restmenge, ohne WASD künstlich unpräzise zu machen.

Reproduzierbare Fahrten mit ausschließlich acht digitalen Richtungen und Bremstaste erreichen im normalen Modus Level 1 in 11,58 s mit 99,9 %, Level 2 in 17,62 s mit 94,2 % und Level 3 in 22,62 s mit 90,6 % Tee. Die Testfahrt kennt die Wegpunkte und bremst gezielt; dies sind Machbarkeitsnachweise, keine Prognosen für Erstspieler. Zu spätes Bremsen an den Karten verfehlt in den Vergleichsfahrten die Mindestmenge.

Escape, Verlassen des Spielfeldfokus, Fenster-/Tabwechsel und lange Renderunterbrechungen pausieren. Pfeiltasten werden nur bei aktivem Spielfokus abgefangen. Lautstärke, Stummschaltung und Rückkehr zur Website bleiben erreichbar. Safe Areas, Hoch-/Querformat, sichtbare Fokuszustände und reduzierte dekorative Bewegung werden berücksichtigt.

## Grafik und Aufbau

Das eigene, warme Gartenatelier verwendet die Cormorant-/Manrope-Typografie, Phosphor-Symbole und zurückhaltenden Farben des Portfolios. Keine fremden Spielfiguren oder übernommenen Assets. Die GLB enthält Holz, Porzellan, Metall, Stoff, Pflanzen und persönliche Gegenstände. Eine selbst erzeugte 512 × 512-WebP-Holztextur ergänzt die Materialien.

Diese Überarbeitung rundet die Silhouetten von Objektiven, Geschirr und Figur ab und ersetzt die facettierten Normalen der kleinen Büsche durch weiche Schattierung. Antialiasing ist jetzt auch auf Mobilgeräten aktiv. Die Renderauflösung ist auf DPR 2 mobil beziehungsweise 2,25 am Desktop begrenzt; mobile Schatten haben 1536 statt 1024 Pixel. Weiche gerichtete Schatten und etwas mehr indirektes Licht verbessern die Lesbarkeit. Die adaptive Qualität reduziert bei anhaltend langsamen Frames weiterhin Auflösung und Schatten.

Der Generator fasst die statische Welt in 13 Meshes zusammen, quantisiert die Attribute und komprimiert mit Meshopt. Laufzeitgegenstände und nummerierte Marken werden je nach Level hinzugefügt. Beim Levelwechsel werden alte Geometrien, Materialien und Beschriftungstexturen freigegeben; ein Neustart desselben Levels verwendet sie wieder.

`boot.ts` verwaltet Oberfläche, Zustände und Sitzung; erst Start importiert `game.ts` mit Three und Rapier. Es gibt kein zusätzliches UI-Framework. Der engere, weich folgende Kameraausschnitt bleibt erhalten. Das Vorschaubild ist eine Aufnahme der tatsächlichen Spielwelt.

## Sitzungsübersicht und Wertung

Bis zu 1000 Punkte: 700 für Tee, 150 für verbleibende Zeit relativ zum jeweiligen Level-Limit, 75 für wenige Kollisionen und 75 für ruhige Bewegung. Drei Blätter verlangen mindestens 90 % Tee und 820 Punkte. Nur ein erfolgreich bestandenes Level erhält Punkte/Blätter. Bei einem Fehlschlag bleiben Zeit, Tee, Kollisionen und Verlustursachen sichtbar.

Die letzten acht Versuche stehen unter dem Spiel und aufklappbar im Ergebnis: Level, Normal/Sanft, Tee, Zeit, Punkte und Bestanden/Noch einmal. Die Verlustkarte zeigt tatsächliche Stellen, der Text den Abschnitt mit dem größten Verlust. Die Aufteilung nach Beschleunigung, Kurve, Kollision und Handyneigung ist eine gewichtete Näherung gleichzeitig wirkender Kräfte.

Ausschließlich `sessionStorage`, kein `localStorage`:

- `tea-trail:session-settings:v2`: Lautstärke, stumm, sanfter Modus, Sensorstärke.
- `tea-trail:session-best:v4`: Bestleistung pro Level und Modus.
- `tea-trail:session-progress:v2`: freigeschaltete Level, Auswahl und letzte acht Versuche.

Die Daten bleiben beim Neuladen im selben Tab bestehen. Eine neue unabhängige Sitzung beginnt leer. Browser können bei ihrer Funktion „Sitzung wiederherstellen“ auch Session Storage wiederherstellen. Alte Local-Storage-Einträge früherer Spielversionen werden nicht mehr gelesen oder geschrieben. Gesperrter Speicher verhindert das Spiel nicht; dann verbleiben Ergebnisse nur im Arbeitsspeicher. Die Datenschutzhinweise wurden angepasst.

## Handybewegung

Vor der Aktivierung steht ausdrücklich: Deutliches Kippen oder Rütteln bringt das Tablett ins Schwanken und kann Tee verschütten. Die Figur wird weiterhin mit dem Joystick bewegt. Sensoren sind standardmäßig aus und vollständig abschaltbar.

Der Aktivierungsbutton prüft HTTPS/Secure Context und API-Verfügbarkeit. `DeviceOrientationEvent.requestPermission()` und, falls vorhanden, `DeviceMotionEvent.requestPermission()` werden beide unmittelbar innerhalb der Nutzerinteraktion aufgerufen. Verweigerte Bewegungserlaubnis verhindert eine erlaubte Neigungsfunktion nicht. Fehlende oder verweigerte Orientierung lässt Joystick und Ruhig-Taste vollständig nutzbar.

Die erste Haltung wird als Mitte kalibriert. 2,5° Totzone, Glättung, begrenzte Winkelkräfte, Ausrichtung des Displays und einstellbare Stärke verhindern Zittern. `DeviceMotionEvent.acceleration` ergänzt echte Beschleunigung ohne Gravitation; es gibt keinen pauschalen Shake-Strafabzug. Die Flüssigkeit reagiert auf die zusätzliche Kraft und verliert Tee erst beim Überlaufen. Die bisher zu schwache Kopplung wurde von 0,3 auf 1,4 angehoben: Deutliches Kippen kann jetzt auch im Stand Tee verschütten. Kleine Abweichungen bleiben im Test verlustfrei.

Veraltete Signale werden null; ein fehlendes erstes Signal deaktiviert nach 3,5 Sekunden. Pause meldet beide Listener ab, Fortsetzen kalibriert neu. Rohwerte, Haltung und Berechtigung werden nicht gespeichert oder übertragen. Echte iOS-/Android-Hardware wurde nicht getestet; automatisierte Tests speisen die Browser-Events einschließlich Berechtigungszweigen ein.

## Ton und Ressourcen

Eigene prozedurale Web-Audio-Klänge: Schritte nach Untergrund, Schwappen, Tropfen, materialabhängige Kontakte, Porzellanklirren, Raumluft, Kesselrauschen und Vinylknistern. Kein Musikdownload, keine Audio-Dateien. Der AudioContext entsteht nur durch Start, pausiert mit dem Spiel und wird beim Verlassen geschlossen.

Beim Verlassen werden RAF, Input-/Sensorlistener, Pointer Capture, Fetch, Physikwelt, EventQueue, WebGL-Geometrien, Materialien, Texturen, Instanzen, Renderziele und Context freigegeben. Die Entwicklungsdiagnose `window.__teaTrail` fehlt im Produktions-Build.

## Messungen und Prüfung

Gemessen auf Apple M1 mit Chrome: vollständige Level-1-Runde einschließlich Serviersequenz, feste Hindernisphase und analoger Teststeuerung. Ankunft nach 10,30 s mit 98,9 % Tee. Mobile Werte sind ausdrücklich Touch-Emulation, keine Smartphone-Hardwaremessung.

| Messwert | Desktop 1440 × 1000 | Touch 390 × 844 |
| --- | ---: | ---: |
| Durchschnitt | 59,3 FPS | 58,8 FPS |
| 95. Perzentil Frame-Abstand | 16,7 ms | 16,8 ms |
| 95. Perzentil CPU-Renderaufruf | 2,3 ms | 2,4 ms |
| Render-DPR | 1 | 2 (gemeldet: 3) |
| Qualität | hoch | mittel |
| Draw Calls am Rundenende | 93 | 91 |
| GPU-Geometrien / Texturen am Rundenende | 63 / 13 | 63 / 13 |

| Ressource | Dateigröße | Lokal gzip-komprimiert |
| --- | ---: | ---: |
| Spiel-Engine einschließlich Rapier-WASM | 3.556.576 Bytes | 1.262.706 Bytes |
| Kleine Spielseiten-Steuerung vor Start | 26.461 Bytes | 9.675 Bytes |
| Meshopt-GLB | 1.741.496 Bytes | 313.953 Bytes |
| Holztextur | 19.744 Bytes | bereits WebP |
| Spielseiten-Vorschau | 90.828 Bytes | bereits WebP |
| Startseiten-Teaser | 22.678 Bytes | bereits WebP |

Gzip ist ein lokaler Vergleichswert; die tatsächliche Übertragung hängt vom Hosting ab. Die Startseite lädt weiterhin keinen Spielcode und nur das statische Teaserbild. Eine vollständige Lighthouse-Vorher-/Nachher-Prüfung des Portfolios wurde nicht durchgeführt. Der Build meldet den großen, bewusst erst nach Start importierten Engine-Chunk; das Warnlimit wurde nicht versteckt.

33 automatisierte Prüfungen: 17 Physik-/Bewegungsprüfungen, 9 bestehende Browser-/Fehlerfallprüfungen, 3 neue Integrationsprüfungen für Level/Servieren/Sitzung/Sensorwirkung, 2 vollständige Performance-Runden und 2 Prüfungen der statischen Produktionsausgabe. Astro meldet 0 Fehler, 0 Warnungen, 0 Hinweise; sieben statische Seiten werden gebaut.

Die neuen Prüfungen weisen digitale Erreichbarkeit aller Level, bewegte Teedosen und deren Reset, Pflichtmarken, Mindestmenge, echte Flüssigkeitsreaktion auf eingespeiste Sensor-Events, unmittelbar aus dem Klick angefragte Berechtigungen, pausierbare Serviersequenz, Level-Freischaltung und Sitzungsverlauf nach. Kleine simulierte Handybewegungen verlieren nichts, starkes Kippen rund 22 % und wiederholte Beschleunigung rund 2 % in der jeweiligen Testsequenz. Diese Werte sind keine pauschalen Spielabzüge.

Sichtprüfung von Desktop, Hoch-/Querformat, Tisch und Ergebnis. Das mobile Startpanel hat eine deckendere Fläche für lesbare Anleitung über der Vorschau. Gesperrter Speicher, fehlende/verweigerte Sensoren und fehlgeschlagene Modell-/Texturabrufe werden gezielt getestet. `npm run sanitize:images` prüfte 29 JPEG-Dateien.

## Abhängigkeiten

Für diese Überarbeitung wurden keine Pakete hinzugefügt oder aktualisiert. Weiterhin Three 0.185.1 und Rapier 0.20.0; Modellbau mit glTF-Transform 4.5.0 und Meshoptimizer 1.2.0, Tests mit Playwright 1.63.0. Der normale Build verwendet eingecheckte Assets und benötigt weder Modellgenerator noch Browser.

## Dateien dieser Überarbeitung

- `src/games/tea-trail/level.ts`, `simulation.ts`: drei Kurse, Pflichtmarken, dynamische Hindernisse, Mindesttee und Level-Regeln.
- `src/games/tea-trail/game.ts`, `character.ts`, `scene.ts`: Serviersequenz, Fußbewegung, HUD, Zielpfeile, Marken und glattere Darstellung.
- `src/games/tea-trail/liquid.ts`, `sensors.ts`: wirksame Neigungs-/Beschleunigungskräfte und opt-in Berechtigungen.
- `src/games/tea-trail/boot.ts`: Freischaltung, Auswahl, Session Storage, letzte acht Versuche, Ergebniszustände.
- `src/pages/tea-trail.astro`, `src/styles/tea-trail.css`: Levelauswahl, Sensorwarnung und responsive Verlaufstabelle.
- `src/pages/datenschutz.astro`: Sitzungsdaten und optionale Beschleunigungswerte.
- `scripts/build-tea-trail.mjs`, `public/tea-trail/atelier.glb`: rundere Modelle und weiche Pflanzennormalen.
- `public/tea-trail/atelier-preview.webp`, `public/tea-trail/teaser.webp`: aktualisierte Aufnahmen.
- `tests/tea-trail/physics.spec.ts`, `browser.spec.ts`, `progression.spec.ts`, `production.spec.ts`: Machbarkeit, bewegte Objekte, Sensorwirkung, Servieren, Freischaltung und Sitzung.
- `README.md`, `docs/TEA_TRAIL.md`: Einstieg, Regeln und Prüfbericht.

## Lokal arbeiten

```sh
npm install
npm run dev
npm run test:tea-trail
npm run build
# Modelle neu erzeugen (Node 24):
npm run tea-trail:assets
# Vorschau bei laufendem Entwicklungsserver:
npm run tea-trail:preview
# Vollständige Desktop-/Touch-Messrunden:
TEA_TRAIL_PERF=1 npx playwright test performance.spec.ts
# Statische Ausgabe separat prüfen:
npm run preview -- --port 4341
TEA_TRAIL_URL=http://127.0.0.1:4341 TEA_TRAIL_PRODUCTION=1 npx playwright test production.spec.ts
```

Testserver standardmäßig Port 4321, alternativ `TEA_TRAIL_URL`; macOS-Chrome wird erkannt, sonst `npx playwright install chromium` oder `TEA_TRAIL_CHROME` setzen. Veröffentlichung erfolgt über den bestehenden GitHub-Pages-Workflow nach Push auf `main`.

## Bekannte Grenzen

- Mobile Performancewerte sind Chrome-Touch-Emulation auf einem M1, keine Messung auf Mittelklasse-Handys. Reale iOS-Sensorfreigabe, Handhaltungen und thermisches Verhalten bleiben dort zu prüfen.
- Drei Kurse teilen sich das Atelier; es sind keine drei vollständig verschiedenen Welten. Schwierigkeiten wurden mit reproduzierbaren Fahrten geprüft, nicht mit einer breiten Gruppe menschlicher Testspieler.
- Spieler bleibt aufrecht auf einer begehbaren Ebene. Tablett und Tasse sind gekoppelte Federn, keine frei herunterfallenden Einzelkörper. Flüssigkeit ist eine Oberflächennäherung, keine vollständige Fluidsimulation.
- Synthetisches Sounddesign, keine Studio-Foley-Aufnahmen. Subjektive Grafik-/Klangqualität ist nicht durch automatisierte Tests belegt.
- WebGL 2 und WebAssembly erforderlich. Ladefehler haben Wiederholung und Rückkehr-Link.
- Tastatur, Touch, Kontraste und Statusmeldungen werden unterstützt; kein vollständiger nichtvisueller Spielmodus und kein umfassendes WCAG-Audit des Portfolios.

## Gemalte Holztextur

`public/tea-trail/painted-wood.webp` wurde mit dem eingebauten Bildgenerierungswerkzeug erzeugt, anschließend auf 512 × 512 Pixel verkleinert und als WebP gespeichert. Kein neues Paket oder externer Dienst wird im Spiel benötigt. Keine übernommenen Figuren, Markenzeichen oder Spielassets; der Stilbezug gilt der malerischen Materialrichtung. Die finale Farbe wird im Materialshader zurückhaltender abgestimmt.

Verwendeter Prompt:

> Use case: stylized-concept. Asset type: seamless tileable diffuse/albedo texture for a real-time 3D cozy adventure game, square 1024x1024. Create a beautifully hand-painted warm honey walnut wood grain material, straight-on flat orthographic surface. ONE continuous wood surface, NO individual planks, NO seams, NO borders. Soft broad flowing grain, occasional small elongated knots, visible restrained gouache brush strokes, color variations in toasted ochre and warm medium brown. Medium contrast, neither pale beige nor dark chocolate. Grain runs vertically. Lighting completely even, no directional shading, no highlights, no perspective, no cast shadows. Painterly stylized 3D adventure game art reminiscent of high quality Nintendo fantasy environment textures, but original artwork, not copied from any game. Texture fills edge to edge and tiles in both axes. No objects, no text, no symbols. Save a local file for use as the game's wood material.

## Technische Referenzen

Verwendete offizielle Referenzen: [Three.js WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html), [Three.js Materialien](https://threejs.org/docs/pages/Material.html), [Three.js Texturen](https://threejs.org/docs/pages/Texture.html), [Three.js Ressourcenfreigabe](https://threejs.org/manual/en/how-to-dispose-of-objects.html), [Rapier Rigid Bodies](https://rapier.rs/docs/user_guides/javascript/rigid_bodies/), [Rapier Masse und Schwerpunkt](https://rapier.rs/docs/user_guides/javascript/rigid_body_mass_properties/) und [MDN Sensorfreigabe](https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent/requestPermission_static). Für die Integration waren zusätzlich die tatsächlich installierten Pakettypen und Astro-CLI-Quellen maßgeblich.
