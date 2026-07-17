# Fotos und Bachelorarbeit einpflegen

## Fotos

1. Fotos in `src/assets/fotografie/` ablegen.
2. Unterstützte Formate: JPG, JPEG, PNG, WebP und AVIF.
3. Für die Galerie ideal: Querformat im Verhältnis 3:2, zum Beispiel 2400 × 1600 Pixel.
4. Die Dateien nummeriert und beschreibend benennen, zum Beispiel `01-wien-abendlicht.jpg`.
5. Optional in `src/data/photography.ts` mit demselben Dateinamen einen präzisen Alternativtext, Titel und eine kurze Notiz ergänzen.
6. Vor dem Commit `npm run sanitize:images` ausführen, um private Bildmetadaten zu entfernen.

Die Galerie erkennt neue Bilddateien automatisch. Sind keine Bilder vorhanden, bleiben die drei Platzhalter sichtbar.

## Albumcover

Der Vinylbereich besitzt vorbereitete lokale Cover-Slots. Lege Bilder – nur wenn du die nötigen Nutzungsrechte dafür hast – unter `src/assets/vinyl/` mit diesen Namen ab:

- `dark-side-of-the-moon.jpg`
- `brothers-in-arms.jpg`
- `blonde.jpg`
- `igor.jpg`
- `swimming.jpg`

Ohne diese Dateien zeigt die Website bewusst typografische Ersatzcover. Dadurch entstehen keine externen Bildanfragen und die Datenschutzerklärung bleibt unverändert.

## Bachelorarbeit

1. Die PDF unter `public/` in einem beschreibend benannten Ordner ablegen.
2. In `src/data/profile.ts` bei `profile.thesis.documentUrl` den relativen Pfad zur PDF eintragen.

Danach erscheint der PDF-Link automatisch im Abschnitt der Bachelorarbeit.

## Datenschutz vor dem Hochladen

- Fotos auf GPS-/EXIF-Daten und erkennbare private Adressen prüfen.
- Die PDF auf private Kontaktdaten, Unterschriften oder nicht zur Veröffentlichung bestimmte Anhänge prüfen.
- Alles im GitHub-Repository ist bei einem öffentlichen Repository grundsätzlich einsehbar – auch Quelldateien, die nicht direkt auf der Website verlinkt sind.
