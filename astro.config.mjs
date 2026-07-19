import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

const excludedSitemapPaths = new Set([
  "/404.html",
  "/404/",
  "/datenschutz/",
  "/impressum/",
]);

export default defineConfig({
  site: "https://fabianderagisch.com",
  base: "/",
  output: "static",
  trailingSlash: "always",
  integrations: [
    sitemap({
      filter: (page) => !excludedSitemapPaths.has(new URL(page).pathname),
    }),
  ],
});
