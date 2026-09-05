import { test, expect } from "@playwright/test";
import { SHORT_WAYPOINTS } from "../../src/games/tea-trail/level";
import { cpus } from "node:os";
for (const mobile of [false, true]) {
  test(`representative full round ${mobile ? "mobile" : "desktop"} performance`, async ({
    browser,
  }) => {
    test.skip(
      process.env.TEA_TRAIL_PERF !== "1",
      "Opt-in full-length render measurement.",
    );
    test.setTimeout(60000);
    const context = await browser.newContext({
      viewport: mobile
        ? { width: 390, height: 844 }
        : { width: 1440, height: 1000 },
      isMobile: mobile,
      hasTouch: mobile,
      deviceScaleFactor: mobile ? 3 : 1,
    });
    const page = await context.newPage();
    await page.goto(
      `${process.env.TEA_TRAIL_URL || "http://127.0.0.1:4321"}/tea-trail/`,
    );
    await page
      .getByRole("button", { name: "Spiel starten", exact: true })
      .click();
    await page.waitForFunction(() => (window as any).__teaTrail);
    await page.evaluate((points) => {
      const game = (window as any).__teaTrail.game;
      game.sim.reset(false, 0);
      game.view.resetSpills();
      let waypoint = 1;
      game.input.sample = () => {
        const position = game.sim.position,
          target = points[waypoint];
        const x = target.x - position.x,
          z = target.z - position.z,
          distance = Math.hypot(x, z);
        if (distance < 0.75 && waypoint < points.length - 1) waypoint++;
        const strength =
          waypoint === points.length - 1 ? Math.min(0.6, distance * 0.6) : 1;
        return {
          x: (x / Math.max(0.01, distance)) * strength,
          z: (z / Math.max(0.01, distance)) * strength,
          tiltX: 0,
          tiltZ: 0,
          steady: false,
        };
      };
    }, SHORT_WAYPOINTS);
    await page.waitForTimeout(8000);
    await page.screenshot({
      path: `/tmp/tea-trail-route-${mobile ? "mobile" : "desktop"}.png`,
    });
    await expect(page.locator("[data-result-dialog]")).toBeVisible({
      timeout: 40000,
    });
    const report = await page.evaluate(() => {
      const game = (window as any).__teaTrail.game;
      return {
        metrics: game.metrics,
        result: {
          score: game.sim.result().score,
          tea: game.sim.liquid.amount,
          elapsed: game.sim.elapsed,
          finished: game.sim.finished,
        },
      };
    });
    console.log(
      JSON.stringify({
        device: mobile
          ? "390x844 touch emulation DPR3"
          : "1440x1000 desktop DPR1",
        cpu: cpus()[0].model,
        ...report,
      }),
    );
    expect(report.result.finished).toBe(true);
    expect(report.metrics.fps).toBeGreaterThan(28);
    await context.close();
  });
}
