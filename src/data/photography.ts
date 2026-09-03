export type PhotographyCopy = {
  alt: string;
  title: string;
  note?: string;
};

/**
 * Optional: Bildtexte werden über den exakten Dateinamen zugeordnet.
 * Ohne Eintrag erzeugt die Galerie einen lesbaren Titel aus dem Dateinamen.
 */
export const photographyCopy: Record<string, PhotographyCopy> = {
  "1_DSCF3245.jpeg": {
    alt: "Schwarz-Weiß-Aufnahme eines DJ-Sets bei Radio Rudina mit Publikum und Discokugel",
    title: "Radio Rudina Set",
    note: "30. August 2026",
  },
  "1_mercados_madeira.png": {
    alt: "Blick von oben in den Innenhof des Mercado dos Lavradores in Funchal, eingerahmt von roten Bougainvilleen",
    title: "Mercados Madeira",
    note: "Funchal, Madeira",
  },
  "Sun Downer.jpg": {
    alt: "Warm beleuchtete Flugzeugfenster während des Sonnenuntergangs",
    title: "Sundowner",
    note: "Irgendwo über den Wolken",
  },
  "Zufall.jpg": {
    alt: "Unscharfe Schwarz-Weiß-Nahaufnahme eines Gesichts mit zwei runden Lichtpunkten",
    title: "Zufall",
    note: "Schwarzweiß",
  },
};

export const photographyPlaceholders = [
  { title: "Favorite Shot 01", note: "Eigenes Foto folgt" },
  { title: "Favorite Shot 02", note: "Eigenes Foto folgt" },
  { title: "Favorite Shot 03", note: "Eigenes Foto folgt" },
];
