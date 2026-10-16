# Persönliche Website

Eine deutschsprachige digitale Vita mit beruflicher Laufbahn, Bachelorarbeit und persönlichen Interessen.

## Lokal starten

```sh
npm install
npm run dev
```

## Datenschutz im Repository

Dieses Repository enthält ausschließlich Inhalte, die für eine öffentliche Website freigegeben werden können. Vollständige Adresse, Geburtsdatum, Familienstand, private Telefonnummer und unbearbeitete Lebenslaufdateien werden nicht im Projekt gespeichert.

Vor einem Push entfernt `npm run sanitize:images` EXIF-, XMP- und IPTC-Metadaten aus den JPG-Quelldateien, ohne die komprimierten Bilddaten neu zu berechnen.

Pushes auf `main` werden über GitHub Actions automatisch als GitHub Pages veröffentlicht.

## Darstellung prüfen

`npx playwright install chromium webkit` installiert die Testbrowser. `npm run test:design` prüft in Chromium und WebKit den bildschirmfüllenden Einstieg, lesbare Navigation, Studienfarben, das Tee-/Training-Raster und die tatsächliche Kartendrehung mit scharfem Endzustand. Die Prüfungen decken Bildschirmbreiten von 320 bis 1440 Pixeln sowie reduzierte Bewegung ab. Mit `DESIGN_REVIEW_URL` lässt sich eine laufende Produktionsvorschau prüfen.

## Tea Trail

Das 3D-Minispiel liegt unter `/tea-trail/`: Drei zunehmend schwierigere Level mit 15, 20 und 25 Sekunden, jeweils 20 Sekunden mehr im sanften Modus. Nummerierte Wegmarken, bewegliche Hindernisse und mindestens 80/85/90 % Tee bestimmen den Aufstieg. Die letzten acht Versuche bleiben nur in der Browsersitzung gespeichert, ohne Cookies oder Konto. Der bisherige Minigame-Platzhalter der Startseite enthält einen Teaser mit einem kleinen, verzögert geladenen Vorschaubild und einem Spiel-Link. Spielwelt, Rendering und Physik starten erst nach einem Klick auf der Spielseite.

`npm run test:tea-trail` prüft Physik, Desktop- und Touchbedienung sowie Sensor- und Speicher-Fallbacks. `npm run tea-trail:assets` erzeugt das komprimierte Atelier neu. Aufbau, Messwerte, alle geänderten Dateien und bekannte Grenzen stehen in [docs/TEA_TRAIL.md](docs/TEA_TRAIL.md).
