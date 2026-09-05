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

## Tea Trail

Das 3D-Minispiel liegt unter `/tea-trail/`: 15 Sekunden im normalen, 35 Sekunden im sanften Modus. Der bisherige Minigame-Platzhalter der Startseite enthält einen Teaser mit einem kleinen, verzögert geladenen Vorschaubild und einem Spiel-Link. Spielwelt, Rendering und Physik starten erst nach einem Klick auf der Spielseite.

`npm run test:tea-trail` prüft Physik, Desktop- und Touchbedienung sowie Sensor- und Speicher-Fallbacks. `npm run tea-trail:assets` erzeugt das komprimierte Atelier neu. Aufbau, Messwerte, alle geänderten Dateien und bekannte Grenzen stehen in [docs/TEA_TRAIL.md](docs/TEA_TRAIL.md).
