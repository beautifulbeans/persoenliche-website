import { chromium } from "@playwright/test";
import sharp from "sharp";
import { existsSync } from "node:fs";
const localChrome =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const browser = await chromium.launch({
  executablePath:
    process.env.TEA_TRAIL_CHROME ||
    (existsSync(localChrome) ? localChrome : undefined),
  args: ["--enable-webgl", "--ignore-gpu-blocklist"],
});
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 1,
  });
  await page.goto(
    `${process.env.TEA_TRAIL_URL || "http://127.0.0.1:4321"}/tea-trail/`,
  );
  await page
    .getByRole("button", { name: "Spiel starten", exact: true })
    .click();
  await page.waitForFunction(() => window.__teaTrail, { timeout: 30000 });
  await page.evaluate((overview) => {
    const { game, root } = window.__teaTrail;
    game.pause();
    root
      .querySelectorAll("[data-hud],[data-location],[data-touch-controls]")
      .forEach((o) => (o.hidden = true));
    game.view.render(game.sim, 0, overview);
  }, process.env.TEA_TRAIL_OVERVIEW === "1");
  const png = await page.locator("[data-game-canvas]").screenshot();
  await sharp(png)
    .resize({ width: 1440 })
    .webp({ quality: 85 })
    .toFile("public/tea-trail/atelier-preview.webp");
  await sharp(png)
    .resize(640, 404)
    .webp({ quality: 78 })
    .toFile("public/tea-trail/teaser.webp");
  console.log(
    "Actual Tea Trail diorama captured to public/tea-trail/atelier-preview.webp",
  );
} finally {
  await browser.close();
}
