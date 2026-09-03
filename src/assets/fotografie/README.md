# Fotos für Kamera und Galerie

Neue Bilder einfach in diesem Ordner ablegen. Unterstützt werden JPG, JPEG, PNG,
WebP und AVIF; Quer- und Hochformat werden automatisch erkannt.

- Die Galerie-Unterseite zeigt automatisch **alle** Bilder aus diesem Ordner.
- Die Kamera auf der Startseite zeigt zuerst `1_DSCF3245.jpeg`, danach
  `1_mercados_madeira.png`, `Sun Downer.jpg` und `Zufall.jpg`. Der anschließende
  Slide führt zur vollständigen Galerie.

- Mit dem Präfix `new-` (zum Beispiel `new-madeira-kueste.jpg`) erhält ein Bild
  in der Galerie die Markierung **Neu**.
- Optionale Titel, Beschreibungen und Bildtexte können in
  `src/data/photography.ts` über den exakten Dateinamen ergänzt werden.
- Vor einer Veröffentlichung sollten neue Originale mit `npm run sanitize:images`
  von möglichen EXIF- und GPS-Daten bereinigt werden.
