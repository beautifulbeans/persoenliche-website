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
