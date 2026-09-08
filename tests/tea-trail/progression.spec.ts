import { test, expect, type Page } from "@playwright/test";

async function start(page: Page) {
  await page
    .getByRole("button", { name: "Spiel starten", exact: true })
    .click();
  await expect(page.locator("[data-stage]")).toHaveAttribute(
    "data-state",
    "playing",
    { timeout: 30000 },
  );
}
async function arrive(page: Page, tea = 1) {
  await page.evaluate((amount) => {
    const sim = (window as any).__teaTrail.game.sim;
    sim.checkpoint = 3;
    sim.liquid.amount = amount;
    sim.player.setTranslation({ x: 0.8, y: 0.72, z: -12.5 }, true);
    sim.player.setLinvel({ x: 0, y: 0, z: 0 }, true);
  }, tea);
}

test("the three arrows lead to a pausable serving animation, then unlock the next course", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/tea-trail/");
  await expect(page.locator('[data-level="1"]')).toBeDisabled();
  await start(page);
  expect(
    await page.evaluate(() => {
      const view = (window as any).__teaTrail.game.view;
      return view.arrows.visible && view.arrows.children.length === 3;
    }),
  ).toBe(true);
  await arrive(page);
  await expect(page.locator("[data-stage]")).toHaveAttribute(
    "data-state",
    "serving",
  );
  await page.keyboard.press("Escape");
  const frozen = await page.evaluate(() => {
    const g = (window as any).__teaTrail.game;
    return [g.sim.elapsed, g.serving];
  });
  await page.waitForTimeout(250);
  expect(
    await page.evaluate(() => {
      const g = (window as any).__teaTrail.game;
      return [g.sim.elapsed, g.serving];
    }),
  ).toEqual(frozen);
  await page
    .getByRole("button", { name: "Weiterspielen", exact: true })
    .click();
  await page.waitForTimeout(950);
  await expect(page.locator("[data-result-dialog]")).not.toBeVisible();
  await page
    .locator("[data-stage]")
    .screenshot({ path: "/tmp/tea-trail-serving.png" });
  await expect(page.locator("[data-result-dialog]")).toBeVisible();
  expect(
    await page.evaluate(() => {
      const g = (window as any).__teaTrail.game;
      return {
        time: g.sim.elapsed,
        position: g.view.tray.position.toArray(),
        arrows: g.view.arrows.visible,
      };
    }),
  ).toEqual({
    time: frozen[0],
    position: [-0.05, 1.015, -14.12],
    arrows: false,
  });
  await page.screenshot({ path: "/tmp/tea-trail-level-result.png" });
  await page.locator("[data-next-level]").click();
  await expect(page.locator("[data-course-title]")).toContainText("Level 2");
  await expect(page.locator("[data-round-seconds]")).toHaveText("20");
  await start(page);
  await arrive(page, 0.8);
  await expect(page.locator("[data-result-title]")).toHaveText(
    "Ein bisschen mehr Tee, bitte.",
  );
  await expect(page.locator("[data-next-level]")).toBeHidden();
  await page.locator("[data-choose-level]").click();
  await expect(page.locator('[data-level="2"]')).toBeDisabled();
  await start(page);
  await arrive(page);
  await expect(page.locator("[data-result-dialog]")).toBeVisible();
  await page.locator("[data-next-level]").click();
  await expect(page.locator("[data-course-title]")).toContainText("Level 3");
  await start(page);
  expect(
    await page.evaluate(() => (window as any).__teaTrail.game.sim.props.length),
  ).toBe(5);
  await arrive(page);
  await expect(page.locator("[data-result-title]")).toHaveText(
    "Drei Level. Ein guter Tee.",
  );
  await page.reload();
  await expect(page.locator('[data-level="2"]')).toBeEnabled();
  await expect(page.locator("[data-course-title]")).toContainText("Level 3");
  expect(errors).toEqual([]);
});

test("last eight attempts and unlocked levels survive reload only in this session, without cookies", async ({
  page,
  browser,
}) => {
  await page.goto("/tea-trail/");
  await start(page);
  await page.evaluate(() => {
    const d = (window as any).__teaTrail;
    d.game.pause();
    for (let i = 0; i < 10; i++) {
      d.game.sim.elapsed = i + 1;
      d.game.sim.liquid.amount = 1 - i / 100;
      d.finish(d.game.sim.result());
    }
  });
  await page.reload();
  const rows = page.locator(".tt-history-section tbody tr");
  await expect(rows).toHaveCount(8);
  await expect(rows.first()).toContainText("91 %");
  await expect(rows.last()).toContainText("98 %");
  expect(await page.context().cookies()).toEqual([]);
  expect(
    await page.evaluate(() =>
      Object.keys(localStorage).filter((key) => key.startsWith("tea-trail:")),
    ),
  ).toEqual([]);
  const context = await browser.newContext();
  const fresh = await context.newPage();
  await fresh.goto(new URL("/tea-trail/", page.url()).href);
  await expect(fresh.locator(".tt-history-section tbody tr")).toHaveCount(0);
  await expect(fresh.locator('[data-level="1"]')).toBeDisabled();
  await context.close();
});

test("opt-in phone tilt and linear acceleration reach the actual liquid simulation", async ({
  page,
}) => {
  await page.addInitScript(() => {
    (window as any).__permissionClicks = [];
    for (const event of [DeviceOrientationEvent, DeviceMotionEvent])
      Object.defineProperty(event, "requestPermission", {
        configurable: true,
        value: () => {
          (window as any).__permissionClicks.push(
            navigator.userActivation.isActive,
          );
          return Promise.resolve("granted");
        },
      });
  });
  await page.goto("/tea-trail/");
  await page
    .getByRole("button", { name: "Spiel nach deinem Gefühl einstellen" })
    .click();
  await expect(page.locator(".tt-sensor-setting")).toContainText(
    "Kippen oder Rütteln",
  );
  await page.locator("[data-sensor-enable]").click();
  expect(await page.evaluate(() => (window as any).__permissionClicks)).toEqual(
    [true, true],
  );
  await page.getByRole("button", { name: "Passt für mich" }).click();
  await start(page);
  const results = await page.evaluate(async () => {
    const d = (window as any).__teaTrail;
    const run = async (kind: "quiet" | "tilt" | "shake") => {
      d.game.pause();
      d.game.sim.reset(false, 0);
      d.game.resume();
      window.dispatchEvent(
        new DeviceOrientationEvent("deviceorientation", { beta: 45, gamma: 0 }),
      );
      for (let i = 0; i < 110; i++) {
        window.dispatchEvent(
          new DeviceOrientationEvent("deviceorientation", {
            beta: 45,
            gamma: kind === "tilt" ? 28 : 1,
          }),
        );
        if (kind === "shake")
          window.dispatchEvent(
            new DeviceMotionEvent("devicemotion", {
              acceleration: { x: Math.sin(i * 0.12) * 10, y: 0, z: 0 },
            }),
          );
        await new Promise((r) => setTimeout(r, 16));
      }
      return {
        tea: d.game.sim.liquid.amount,
        loss: d.game.sim.liquid.loss.Handyneigung,
      };
    };
    const quiet = await run("quiet"),
      tilt = await run("tilt"),
      shake = await run("shake");
    d.sensor.disable();
    return { quiet, tilt, shake, enabled: d.sensor.enabled };
  });
  console.log("PHONE INPUT", results);
  expect(results.quiet.tea).toBeGreaterThan(0.999);
  expect(results.tilt.tea).toBeLessThan(0.97);
  expect(results.tilt.loss).toBeGreaterThan(0.02);
  expect(results.shake.tea).toBeLessThan(0.99);
  expect(results.enabled).toBe(false);
});
