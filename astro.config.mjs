import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://fabianderagisch.com",
  base: "/",
  output: "static",
  trailingSlash: "always",
});
