import { test, expect, type Page } from "@playwright/test";
async function startGame(page: Page) {
  await page.goto("/tea-trail/");
  await page
    .getByRole("button", { name: "Spiel starten", exact: true })
    .click();
  await expect(page.locator("[data-stage]")).toHaveAttribute(
    "data-state",
    "playing",
    { timeout: 30000 },
  );
}
const diagnostics = (page: Page) =>
  page.evaluate(() => {
    const d = (window as any).__teaTrail;
    return {
      metrics: d.game.metrics,
      position: d.game.sim.position,
      elapsed: d.game.sim.elapsed,
    };
  });
test("homepage teaser and idle game never fetch the engine, models or start audio", async ({
  page,
}) => {
  const requests: string[] = [];
  page.on("request", (r) => requests.push(r.url()));
  await page.addInitScript(() => {
    (window as any).__audioCount = 0;
    const Original = window.AudioContext;
    window.AudioContext = class extends Original {
      constructor(...a: ConstructorParameters<typeof AudioContext>) {
        super(...a);
        (window as any).__audioCount++;
      }
    };
  });
  await page.goto("/");
  await expect(
    page.getByRole("link", { name: "Tea Trail spielen" }),
  ).toHaveAttribute("href", "/tea-trail/");
  const teaser = page.locator(".minigame-teaser");
  await teaser.scrollIntoViewIfNeeded();
  await expect(teaser.locator("h3")).toContainText("Kleines Minigame.");
  await expect(teaser.locator("h3")).toContainText("Kurz abschalten.");
  await expect(teaser).toContainText("15 Sekunden, eine Tasse Tee");
  await expect(teaser.locator("img")).toHaveAttribute("loading", "lazy");
  await expect(teaser.locator("a")).toHaveAttribute(
    "data-astro-prefetch",
    "false",
  );
  await teaser.screenshot({ path: "/tmp/tea-trail-home-teaser.png" });
  expect(
    requests.filter((u) =>
      /rapier|three|tea-trail\/(atelier.*|painted-wood)\.(glb|webp)|games\/tea-trail/.test(
        u,
      ),
    ),
  ).toEqual([]);
  requests.length = 0;
  await page.goto("/tea-trail/");
  await expect(
    page.getByRole("button", { name: "Spiel starten", exact: true }),
  ).toBeVisible();
  expect(
    requests.filter((u) =>
      /rapier|node_modules\/.*three|atelier\.glb|painted-wood\.webp|games\/tea-trail\/(game|scene|simulation|input)\.ts/.test(
        u,
      ),
    ),
  ).toEqual([]);
  expect(await page.evaluate(() => (window as any).__audioCount)).toBe(0);
  await page.screenshot({ path: "/tmp/tea-trail-intro.png", fullPage: true });
});
test("desktop moves, pauses, releases keys, resumes and preserves resources over retries", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await startGame(page);
  await page.waitForTimeout(1000);
  const before = await diagnostics(page);
  const framing = await page.evaluate(() => {
    const view = (window as any).__teaTrail.game.view;
    const record = view.camera.position
      .clone()
      .set(-0.55, 0.25, 0.1)
      .project(view.camera);
    const player = view.camera.position
      .clone()
      .set(0, 0.95, 13.2)
      .project(view.camera);
    return {
      height: view.camera.top - view.camera.bottom,
      recordY: record.y,
      playerX: player.x,
      playerY: player.y,
    };
  });
  expect(framing.height).toBeLessThan(15);
  expect(framing.recordY).toBeGreaterThan(1);
  expect(Math.abs(framing.playerX)).toBeLessThan(0.6);
  expect(Math.abs(framing.playerY)).toBeLessThan(0.6);
  expect(
    await page.evaluate(() => (window as any).__teaTrail.game.sim.duration),
  ).toBe(15);
  expect(
    await page.evaluate(() => {
      let valid = false;
      (window as any).__teaTrail.game.view.scene.traverse((object: any) => {
        if (object.material?.name === "painted-wood")
          valid = Boolean(
            object.material.map && object.geometry.attributes.uv?.count,
          );
      });
      return valid;
    }),
  ).toBe(true);
  await page.keyboard.down("ArrowUp");
  await page.waitForTimeout(1200);
  await page.keyboard.up("ArrowUp");
  const after = await diagnostics(page);
  expect(
    Math.hypot(
      after.position.x - before.position.x,
      after.position.z - before.position.z,
    ),
  ).toBeGreaterThan(1);
  await page.screenshot({ path: "/tmp/tea-trail-desktop.png" });
  console.log("DESKTOP", after.metrics);
  await page.keyboard.press("Escape");
  await expect(page.locator("[data-pause-dialog]")).toBeVisible();
  const elapsed = (await diagnostics(page)).elapsed;
  await page.waitForTimeout(250);
  expect((await diagnostics(page)).elapsed).toBe(elapsed);
  expect(
    await page.evaluate(() => {
      const event = new KeyboardEvent("keydown", {
        code: "ArrowDown",
        bubbles: true,
        cancelable: true,
      });
      document.activeElement!.dispatchEvent(event);
      return event.defaultPrevented;
    }),
  ).toBe(false);
  await page
    .getByRole("button", { name: "Weiterspielen", exact: true })
    .click();
  await expect(page.locator("[data-stage]")).toHaveAttribute(
    "data-state",
    "playing",
  );
  const first = (await diagnostics(page)).metrics;
  await page.evaluate(() => {
    const d = (window as any).__teaTrail;
    d.game.sim.elapsed = d.game.sim.duration - 0.01;
  });
  await expect(page.locator("[data-result-dialog]")).toBeVisible();
  await expect(page.locator("[data-result-score]")).toHaveText("0");
  await expect(page.locator("[data-result-summary]")).toContainText(
    "15 Sekunden sind um",
  );
  await page.screenshot({ path: "/tmp/tea-trail-result.png" });
  await page.getByRole("button", { name: "Noch einmal", exact: true }).click();
  await expect(page.locator("[data-stage]")).toHaveAttribute(
    "data-state",
    "playing",
  );
  const next = (await diagnostics(page)).metrics;
  expect(next.geometries).toBe(first.geometries);
  expect(next.textures).toBe(first.textures);
  expect(errors).toEqual([]);
});
test("touch joystick, pointer cancellation and portrait / landscape layouts", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 3,
  });
  const page = await context.newPage();
  await page.goto("/tea-trail/");
  await page.screenshot({
    path: "/tmp/tea-trail-mobile-intro.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Spiel starten", exact: true }).tap();
  await expect(page.locator("[data-stage]")).toHaveAttribute(
    "data-state",
    "playing",
    { timeout: 30000 },
  );
  console.log(
    "TOUCH DEVICE",
    await page.evaluate(() => ({
      touch: navigator.maxTouchPoints,
      coarse: matchMedia("(pointer: coarse)").matches,
      any: matchMedia("(any-pointer: coarse)").matches,
      display: getComputedStyle(
        document.querySelector("[data-touch-controls]")!,
      ).display,
    })),
  );
  await expect(page.locator("[data-joystick]")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const before = await diagnostics(page),
    rect = (await page.locator("[data-joystick]").boundingBox())!;
  const cdp = await context.newCDPSession(page);
  const x = rect.x + rect.width / 2,
    y = rect.y + rect.height / 2;
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x, y, id: 1 }],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x: x + 24, y: y - 32, id: 1 }],
  });
  await page.waitForTimeout(1100);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchCancel",
    touchPoints: [],
  });
  const after = await diagnostics(page);
  expect(
    Math.hypot(
      after.position.x - before.position.x,
      after.position.z - before.position.z,
    ),
  ).toBeGreaterThan(1);
  expect(
    await page
      .locator("[data-joystick-thumb]")
      .evaluate((el) => (el as HTMLElement).style.transform),
  ).toBe("");
  await page.screenshot({ path: "/tmp/tea-trail-mobile.png" });
  console.log("MOBILE EMULATION", after.metrics);
  await page.setViewportSize({ width: 844, height: 390 });
  await page.waitForTimeout(400);
  await page.screenshot({ path: "/tmp/tea-trail-landscape.png" });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const joystick = (await page.locator("[data-joystick]").boundingBox())!;
  expect(joystick.y + joystick.height).toBeLessThanOrEqual(390);
  await page
    .getByRole("button", { name: "Spiel pausieren", exact: true })
    .tap();
  await expect(page.locator("[data-pause-dialog]")).toBeVisible();
  await context.close();
});
test("sensor denial falls back without preventing play", async ({ page }) => {
  await page.addInitScript(() => {
    (window as any).__permissionCalls = 0;
    Object.defineProperty(DeviceOrientationEvent, "requestPermission", {
      value: () => {
        (window as any).__permissionCalls++;
        return Promise.resolve("denied");
      },
      configurable: true,
    });
  });
  await page.goto("/tea-trail/");
  expect(await page.evaluate(() => (window as any).__permissionCalls)).toBe(0);
  await page
    .getByRole("button", { name: "Spiel nach deinem Gefühl einstellen" })
    .click();
  await page
    .getByRole("button", { name: "Neigung aktivieren", exact: true })
    .click();
  await expect(page.locator("[data-sensor-status]")).toContainText(
    "Keine Sensorfreigabe",
  );
  expect(await page.evaluate(() => (window as any).__permissionCalls)).toBe(1);
  await page.getByRole("button", { name: "Passt für mich" }).click();
  await page
    .getByRole("button", { name: "Spiel starten", exact: true })
    .click();
  await expect(page.locator("[data-stage]")).toHaveAttribute(
    "data-state",
    "playing",
    { timeout: 30000 },
  );
  expect(
    await page.evaluate(() => (window as any).__teaTrail.sensor.enabled),
  ).toBe(false);
});
test("sensor calibration, dead zone, clamps and disable", async ({ page }) => {
  await page.addInitScript(() =>
    Object.defineProperty(DeviceOrientationEvent, "requestPermission", {
      value: () => Promise.resolve("granted"),
      configurable: true,
    }),
  );
  await page.goto("/tea-trail/");
  await page
    .getByRole("button", { name: "Spiel nach deinem Gefühl einstellen" })
    .click();
  await page
    .getByRole("button", { name: "Neigung aktivieren", exact: true })
    .click();
  await page.evaluate(() =>
    window.dispatchEvent(
      new DeviceOrientationEvent("deviceorientation", { beta: 45, gamma: 0 }),
    ),
  );
  await page.getByRole("button", { name: "Passt für mich" }).click();
  await page
    .getByRole("button", { name: "Spiel starten", exact: true })
    .click();
  await expect(page.locator("[data-stage]")).toHaveAttribute(
    "data-state",
    "playing",
    { timeout: 30000 },
  );
  const values = await page.evaluate(() => {
    const s = (window as any).__teaTrail.sensor;
    window.dispatchEvent(
      new DeviceOrientationEvent("deviceorientation", { beta: 45, gamma: 0 }),
    );
    window.dispatchEvent(
      new DeviceOrientationEvent("deviceorientation", { beta: 46, gamma: 1 }),
    );
    s.sample(0.5);
    const dead = [s.x, s.z];
    window.dispatchEvent(
      new DeviceOrientationEvent("deviceorientation", { beta: 85, gamma: 80 }),
    );
    s.sample(0.5);
    const tilt = [s.x, s.z];
    s.disable();
    s.sample(0.5);
    return { dead, tilt, disabled: [s.x, s.z], enabled: s.enabled };
  });
  expect(values.dead).toEqual([0, 0]);
  expect(values.tilt.some((v) => Math.abs(v) > 0.1)).toBe(true);
  expect(values.tilt.every((v) => Math.abs(v) <= 0.5)).toBe(true);
  expect(values.disabled).toEqual([0, 0]);
  expect(values.enabled).toBe(false);
});
test("unavailable sensors, blocked storage and failed models or textures remain recoverable", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "DeviceOrientationEvent", {
      value: undefined,
      configurable: true,
    });
    Storage.prototype.setItem = () => {
      throw new Error("Blocked");
    };
    Storage.prototype.getItem = () => {
      throw new Error("Blocked");
    };
  });
  await page.route("**/atelier.glb", (route) =>
    route.fulfill({ status: 503, body: "Unavailable" }),
  );
  await page.goto("/tea-trail/");
  await page
    .getByRole("button", { name: "Spiel nach deinem Gefühl einstellen" })
    .click();
  await page
    .getByRole("button", { name: "Neigung aktivieren", exact: true })
    .click();
  await expect(page.locator("[data-sensor-status]")).toContainText(
    "nicht verfügbar",
  );
  await page.getByRole("button", { name: "Passt für mich" }).click();
  await page
    .getByRole("button", { name: "Spiel starten", exact: true })
    .click();
  await expect(page.locator("[data-load-status]")).toContainText(
    "konnte nicht starten",
    { timeout: 30000 },
  );
  await page.unroute("**/atelier.glb");
  await page.route("**/painted-wood.webp", (route) =>
    route.fulfill({ status: 503, body: "Unavailable" }),
  );
  await page
    .getByRole("button", { name: "Erneut versuchen", exact: true })
    .click();
  await expect(page.locator("[data-load-status]")).toContainText(
    "konnte nicht starten",
    { timeout: 30000 },
  );
  await page.unroute("**/painted-wood.webp");
  await page
    .getByRole("button", { name: "Erneut versuchen", exact: true })
    .click();
  await expect(page.locator("[data-stage]")).toHaveAttribute(
    "data-state",
    "playing",
    { timeout: 30000 },
  );
});
test("completed round persists best and pagehide releases WebGL", async ({
  page,
}) => {
  await startGame(page);
  await page.evaluate(() => {
    const d = (window as any).__teaTrail;
    d.game.sim.player.setTranslation({ x: 0, y: 0.72, z: -13.1 }, true);
    d.game.sim.player.setLinvel({ x: 0, y: 0, z: 0 }, true);
  });
  await expect(page.locator("[data-result-dialog]")).toBeVisible();
  await expect(page.locator("[data-result-best]")).toHaveText(
    "Deine neue persönliche Bestleistung.",
  );
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("tea-trail:best:v3")!).normal.score,
    ),
  ).toBeGreaterThan(800);
  const disposed = await page.evaluate(() => {
    const d = (window as any).__teaTrail;
    const before = d.game.view.renderer.info.memory.geometries;
    window.dispatchEvent(new PageTransitionEvent("pagehide"));
    return {
      before,
      after: d.game.view.renderer.info.memory.geometries,
      sensor: d.sensor.enabled,
    };
  });
  expect(disposed.before).toBeGreaterThan(0);
  expect(disposed.after).toBe(0);
  expect(disposed.sensor).toBe(false);
  await page.reload();
  await expect(page.locator("[data-best]")).toContainText("Bestleistung");
});

test("sound and accessibility settings survive a page reload", async ({
  page,
}) => {
  await startGame(page);
  await page
    .getByRole("button", { name: "Ton stummschalten", exact: true })
    .click();
  await expect(page.locator("[data-mute]")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.keyboard.press("Escape");
  await expect(page.locator("[data-pause-dialog]")).toBeVisible();
  await page
    .getByRole("button", { name: "Einstellungen", exact: true })
    .click();
  await page.locator("[data-gentle]").check();
  expect(
    await page.evaluate(() => (window as any).__teaTrail.game.sim.duration),
  ).toBe(15);
  await page.locator("[data-sensitivity]").fill("25");
  await page.getByRole("button", { name: "Passt für mich" }).click();
  await page.reload();
  await expect(page.locator("[data-round-seconds]")).toHaveText("35");
  await expect(page.locator("[data-mute]")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page
    .getByRole("button", { name: "Spiel nach deinem Gefühl einstellen" })
    .click();
  await expect(page.locator("[data-gentle]")).toBeChecked();
  await expect(page.locator("[data-sensitivity]")).toHaveValue("25");
  await page.getByRole("button", { name: "Passt für mich" }).click();
  await page
    .getByRole("button", { name: "Spiel starten", exact: true })
    .click();
  await expect(page.locator("[data-stage]")).toHaveAttribute(
    "data-state",
    "playing",
  );
  expect(
    await page.evaluate(() => (window as any).__teaTrail.game.sim.duration),
  ).toBe(35);
});

test("back navigation restores a playable start screen", async ({ page }) => {
  await startGame(page);
  await page
    .locator(".tt-header")
    .getByRole("link", { name: "Zurück zur Website" })
    .click();
  await page.waitForURL("**/#persoenlich");
  await page.goBack();
  await expect(
    page.getByRole("button", { name: "Spiel starten", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Spiel starten", exact: true })
    .click();
  await expect(page.locator("[data-stage]")).toHaveAttribute(
    "data-state",
    "playing",
    { timeout: 30000 },
  );
});
