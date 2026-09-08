import { test, expect } from "@playwright/test";
test.skip(
  process.env.TEA_TRAIL_PRODUCTION !== "1",
  "Run against the static production preview.",
);
test("static release lazy-loads, plays, pauses and has no debug API", async ({
  page,
}) => {
  const errors: string[] = [],
    requests: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("request", (r) => requests.push(r.url()));
  page.on("response", (r) => {
    if (r.status() >= 400) errors.push(`${r.status()}: ${r.url()}`);
  });
  await page.goto("/#tea-trail");
  const teaser = page.locator(".minigame-teaser");
  await teaser.scrollIntoViewIfNeeded();
  await expect(teaser.locator("h3")).toContainText("Kleines Minigame.");
  await expect(teaser.locator("h3")).toContainText("Kurz abschalten.");
  await expect(teaser).toContainText("15 Sekunden, eine Tasse Tee");
  await expect(teaser.locator("a")).toHaveAttribute(
    "data-astro-prefetch",
    "false",
  );
  await teaser.screenshot({
    path: "/tmp/tea-trail-production-teaser-desktop.png",
  });
  await teaser.getByRole("link", { name: "Tea Trail spielen" }).click();
  await page.waitForURL("**/tea-trail/");
  expect(
    requests.some((url) =>
      /\/game\..*\.js|atelier\.glb|painted-wood\.webp/.test(url),
    ),
  ).toBe(false);
  await page.screenshot({
    path: "/tmp/tea-trail-production-intro.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Spiel starten", exact: true })
    .click();
  await expect(page.locator("[data-stage]")).toHaveAttribute(
    "data-state",
    "playing",
    { timeout: 30000 },
  );
  expect(requests.some((url) => /\/game\..*\.js/.test(url))).toBe(true);
  expect(await page.evaluate(() => "__teaTrail" in window)).toBe(false);
  await page.keyboard.down("KeyW");
  await page.waitForTimeout(1000);
  await page.keyboard.up("KeyW");
  await expect(page.locator("[data-goal]")).not.toContainText("· 0 % zum Teetisch");
  await page
    .getByRole("button", { name: "Ton stummschalten", exact: true })
    .click();
  await expect(page.locator("[data-mute]")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.screenshot({ path: "/tmp/tea-trail-production-game.png" });
  await page.keyboard.press("Escape");
  await expect(page.locator("[data-pause-dialog]")).toBeVisible();
  expect(errors).toEqual([]);
});
test("static release supports small touch screens and reduced motion", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 320, height: 740 },
    hasTouch: true,
    isMobile: true,
    deviceScaleFactor: 2,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto(`${process.env.TEA_TRAIL_URL}/#tea-trail`);
  const teaser = page.locator(".minigame-teaser");
  await teaser.scrollIntoViewIfNeeded();
  const teaserBounds = (await teaser.boundingBox())!;
  expect(teaserBounds.x).toBeGreaterThanOrEqual(0);
  expect(teaserBounds.x + teaserBounds.width).toBeLessThanOrEqual(320);
  await expect(teaser.locator("img")).toHaveJSProperty("naturalWidth", 640);
  await teaser.screenshot({
    path: "/tmp/tea-trail-production-teaser-mobile.png",
  });
  await teaser.getByRole("link", { name: "Tea Trail spielen" }).tap();
  await page.waitForURL("**/tea-trail/");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect(page.locator("[data-level]")).toHaveCount(3);
  await expect(page.locator("[data-sensor-intro]")).toBeVisible();
  await page.screenshot({ path: "/tmp/tea-trail-production-small-intro.png", fullPage: true });
  await page.getByRole("button", { name: "Spiel starten", exact: true }).tap();
  await expect(page.locator("[data-stage]")).toHaveAttribute(
    "data-state",
    "playing",
    { timeout: 30000 },
  );
  await expect(page.locator("[data-joystick]")).toBeVisible();
  const joystick = (await page.locator("[data-joystick]").boundingBox())!;
  expect(joystick.y + joystick.height).toBeLessThanOrEqual(740);
  await page.screenshot({ path: "/tmp/tea-trail-production-small-mobile.png" });
  await context.close();
});
