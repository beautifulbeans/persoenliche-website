import type { APIRoute } from "astro";

const indexablePaths = [
  "/",
  "/bachelorarbeit/",
  "/galerie/",
  "/kartenspiele/",
  "/tea-trail/",
];

export const GET: APIRoute = ({ site }) => {
  const entries = indexablePaths.map((path) => `  <url><loc>${new URL(path, site)}</loc></url>`);
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    "</urlset>",
    "",
  ].join("\n");

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
