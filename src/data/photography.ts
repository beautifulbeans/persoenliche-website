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
  // "01-wien-abendlicht.jpg": {
  //   alt: "Abendlicht zwischen Häuserfassaden in Wien",
  //   title: "Wien im Abendlicht",
  //   note: "Fujifilm X-T30 III",
  // },
};

export const photographyPlaceholders = [
  { title: "Favorite Shot 01", note: "Eigenes Foto folgt" },
  { title: "Favorite Shot 02", note: "Eigenes Foto folgt" },
  { title: "Favorite Shot 03", note: "Eigenes Foto folgt" },
];
