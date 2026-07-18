# Fotos für Kamera und Galerie

Neue Bilder einfach in diesem Ordner ablegen. Unterstützt werden JPG, JPEG, PNG,
WebP und AVIF; Quer- und Hochformat werden automatisch erkannt.

- Mit dem Präfix `new-` (zum Beispiel `new-madeira-kueste.jpg`) erhält ein Bild
  in der Galerie die Markierung **Neu**.
- Optionale Titel, Beschreibungen und Bildtexte können in
  `src/data/photography.ts` über den exakten Dateinamen ergänzt werden.
- Vor einer Veröffentlichung sollten neue Originale mit `npm run sanitize:images`
  von möglichen EXIF- und GPS-Daten bereinigt werden.
