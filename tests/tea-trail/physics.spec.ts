import { test, expect } from "@playwright/test";
import RAPIER from "@dimforge/rapier3d-compat";
import {
  Simulation,
  type Controls,
} from "../../src/games/tea-trail/simulation";
import { Liquid, scoreRound } from "../../src/games/tea-trail/liquid";
import { CharacterRig } from "../../src/games/tea-trail/character";
import { CAMERA_ANGLE } from "../../src/games/tea-trail/input";
import {
  COURSES,
  ROUND_SECONDS,
  GENTLE_ROUND_SECONDS,
  SAFE_WAYPOINTS,
  SHORT_WAYPOINTS,
} from "../../src/games/tea-trail/level";
const neutral: Controls = { x: 0, z: 0, tiltX: 0, tiltZ: 0, steady: false };
test.beforeAll(async () => {
  await RAPIER.init();
});
function drive(
  points: typeof SAFE_WAYPOINTS,
  gentle = false,
  variation = 0,
  levelId = points === SAFE_WAYPOINTS ? 2 : 0,
) {
  const sim = new Simulation();
  sim.reset(gentle, variation, levelId);
  let waypoint = 1;
  for (let frame = 0; frame < 2701 && !sim.ended; frame++) {
    const p = sim.position,
      target = points[waypoint];
    const dx = target.x - p.x,
      dz = target.z - p.z,
      distance = Math.hypot(dx, dz);
    if (distance < 0.75 && waypoint < points.length - 1) waypoint++;
    const strength =
      waypoint === points.length - 1
        ? Math.min(0.6, distance * 0.6)
        : points === SHORT_WAYPOINTS
          ? 1
          : 0.83;
    sim.step(1 / 60, {
      ...neutral,
      x: (dx / Math.max(0.01, distance)) * strength,
      z: (dz / Math.max(0.01, distance)) * strength,
    });
  }
  const result = sim.result();
  console.log(
    JSON.stringify({
      route: points === SAFE_WAYPOINTS ? "safe" : "short",
      variation,
      waypoint,
      position: sim.position,
      ...result,
      spills: result.spills.length,
    }),
  );
  sim.dispose();
  return result;
}
test("stationary tea remains at rest and timeout gives no win", () => {
  const sim = new Simulation();
  for (let i = 0; i < 3601; i++) sim.step(1 / 60, neutral);
  expect(sim.liquid.amount).toBe(1);
  expect(sim.ended).toBe(true);
  expect(sim.finished).toBe(false);
  expect(sim.result().leaves).toBe(0);
  sim.dispose();
});
test("gentle mode leaves enough time for the longer safe route", () => {
  const r = drive(SAFE_WAYPOINTS, true);
  expect(r.finished).toBe(true);
  expect(r.elapsed).toBeLessThan(GENTLE_ROUND_SECONDS);
  expect(r.tea).toBeGreaterThan(0.78);
});
test("shortcut is traversable for every bounded obstacle phase", () => {
  for (const variation of [0, 0.5, 1]) {
    const r = drive(SHORT_WAYPOINTS, false, variation);
    expect(r.finished).toBe(true);
  }
});
test("gentle mode protects the tea", () => {
  const normal = drive(SHORT_WAYPOINTS),
    gentle = drive(SHORT_WAYPOINTS, true);
  expect(gentle.finished).toBe(true);
  expect(gentle.tea).toBeGreaterThanOrEqual(normal.tea);
});
test("acceleration excites fluid; loss is conserved and damping settles it", () => {
  const liquid = new Liquid();
  for (let i = 0; i < 360; i++)
    liquid.step(1 / 60, {
      ax: Math.sin(i * 0.2) * 22,
      az: Math.cos(i * 0.1) * 16,
      turn: 4,
      impact: 2,
      tiltX: 0,
      tiltZ: 0,
      gentle: false,
    });
  expect(liquid.amount).toBeLessThan(0.85);
  expect(liquid.amount).toBeGreaterThanOrEqual(0);
  expect(Object.values(liquid.loss).reduce((a, b) => a + b, 0)).toBeCloseTo(
    1 - liquid.amount,
    8,
  );
  for (let i = 0; i < 600; i++)
    liquid.step(1 / 60, {
      ax: 0,
      az: 0,
      turn: 0,
      impact: 0,
      tiltX: 0,
      tiltZ: 0,
      gentle: false,
    });
  expect(Math.hypot(liquid.x, liquid.z)).toBeLessThan(0.0001);
});
test("score bounds, three-leaf threshold and clean reset", () => {
  expect(scoreRound(1, ROUND_SECONDS * 0.8, 0, 1, true).leaves).toBe(3);
  expect(scoreRound(1, ROUND_SECONDS, 0, 1, false).score).toBe(0);
  const sim = new Simulation();
  for (let i = 0; i < 120; i++) sim.step(1 / 60, { ...neutral, x: 1 });
  sim.reset(true, 0.5);
  expect(sim.elapsed).toBe(0);
  expect(sim.collisions).toBe(0);
  expect(sim.liquid.amount).toBe(1);
  expect(sim.position.z).toBeCloseTo(13.2);
  expect(sim.spills).toHaveLength(0);
  sim.dispose();
});
test("ordinary starts, corners and stops keep a full cup", () => {
  const sim = new Simulation();
  // A small square on the unobstructed start deck, using full digital key presses.
  for (let repeat = 0; repeat < 3; repeat++) {
    for (const direction of [
      { x: 1, z: 0 },
      { x: 0, z: -1 },
      { x: -1, z: 0 },
      { x: 0, z: 1 },
    ]) {
      for (let frame = 0; frame < 35; frame++)
        sim.step(1 / 60, { ...neutral, ...direction });
      for (let frame = 0; frame < 20; frame++) sim.step(1 / 60, neutral);
    }
  }
  expect(sim.collisions).toBe(0);
  expect(sim.liquid.amount).toBeGreaterThan(0.999);
  sim.dispose();
});
test("release plants the character and reversal does not create a steering arc", () => {
  const sim = new Simulation();
  for (let frame = 0; frame < 40; frame++)
    sim.step(1 / 60, { ...neutral, x: 1 });
  const before = { ...sim.position };
  for (let frame = 0; frame < 24; frame++) sim.step(1 / 60, neutral);
  expect(sim.position.x - before.x).toBeLessThan(0.42);
  expect(sim.speed).toBeLessThan(0.01);
  const stopped = { ...sim.position };
  for (let frame = 0; frame < 30; frame++)
    sim.step(1 / 60, { ...neutral, x: -1 });
  expect(sim.position.x).toBeLessThan(stopped.x - 0.4);
  expect(Math.abs(sim.position.z - stopped.z)).toBeLessThan(0.025);
  sim.dispose();
});
test("a hard collision still spills tea, with less loss in gentle mode", () => {
  const crash = (gentle: boolean) => {
    const sim = new Simulation();
    sim.reset(gentle, 0);
    for (let i = 0; i < 170; i++) sim.step(1 / 60, { ...neutral, z: -1 });
    const result = sim.result();
    sim.dispose();
    return result;
  };
  const normal = crash(false),
    gentle = crash(true);
  console.log("Crash comparison", normal.tea, gentle.tea);
  expect(normal.collisions).toBeGreaterThan(0);
  expect(normal.tea).toBeLessThan(0.995);
  expect(normal.tea).toBeGreaterThan(0.8);
  expect(gentle.tea).toBeGreaterThan(normal.tea);
});
test("stance feet stay planted while the body moves and footsteps stop at rest", () => {
  const sim = new Simulation();
  const character = new CharacterRig();
  character.update(sim, 0, false);
  let contacts = character.footContacts;
  let plantedFrames = 0,
    steps = 0;
  for (let frame = 0; frame < 180; frame++) {
    sim.step(1 / 60, frame < 90 ? { ...neutral, x: 1 } : neutral);
    character.update(sim, 1 / 60, false);
    const next = character.footContacts;
    next.forEach((foot, i) => {
      if (foot.planted && contacts[i].planted) {
        expect(
          Math.hypot(foot.x - contacts[i].x, foot.z - contacts[i].z),
        ).toBeLessThan(0.00001);
        plantedFrames++;
      }
      expect(foot.y).toBeGreaterThan(0.08);
    });
    if (character.landed) steps++;
    if (frame > 145) expect(character.landed).toBe(false);
    contacts = next;
  }
  expect(plantedFrames).toBeGreaterThan(100);
  expect(steps).toBeGreaterThan(4);
  sim.dispose();
});
test("fast corners spill a little; a short keyboard brake and diagonal transitions stay fair", () => {
  const corner = (kind: "fast" | "braked" | "diagonal" | "split") => {
    const sim = new Simulation();
    for (let frame = 0; frame < 50; frame++)
      sim.step(1 / 60, { ...neutral, x: 1 });
    if (kind === "braked")
      for (let frame = 0; frame < 12; frame++)
        sim.step(1 / 60, { ...neutral, x: 1, steady: true });
    if (kind === "split")
      for (let frame = 0; frame < 7; frame++)
        sim.step(1 / 60, { ...neutral, x: Math.SQRT1_2, z: -Math.SQRT1_2 });
    for (let frame = 0; frame < 35; frame++)
      sim.step(1 / 60, {
        ...neutral,
        x: kind === "diagonal" ? Math.SQRT1_2 : 0,
        z: kind === "diagonal" ? -Math.SQRT1_2 : -1,
        steady: kind === "braked",
      });
    for (let frame = 0; frame < 40; frame++) sim.step(1 / 60, neutral);
    const result = sim.result();
    expect(result.collisions).toBe(0);
    sim.dispose();
    return 1 - result.tea;
  };
  const fast = corner("fast"),
    braked = corner("braked"),
    diagonal = corner("diagonal"),
    split = corner("split");
  console.log("Keyboard corner loss", { fast, braked, diagonal, split });
  expect(fast).toBeGreaterThan(0.005);
  expect(fast).toBeLessThan(0.08);
  expect(braked).toBeLessThan(0.003);
  expect(diagonal).toBeLessThan(0.01);
  expect(split).toBeLessThanOrEqual(fast * 1.15 + 0.001);
});
test("15-second deadline and the separate gentle timer end exactly their own rounds", () => {
  for (const gentle of [false, true]) {
    const sim = new Simulation();
    sim.reset(gentle, 0);
    const duration = gentle ? GENTLE_ROUND_SECONDS : ROUND_SECONDS;
    for (let frame = 0; frame < (duration - 0.1) * 60; frame++)
      sim.step(1 / 60, neutral);
    expect(sim.ended).toBe(false);
    for (let frame = 0; frame < 12; frame++) sim.step(1 / 60, neutral);
    expect(sim.elapsed).toBe(duration);
    expect(sim.ended).toBe(true);
    expect(sim.result().duration).toBe(duration);
    sim.dispose();
  }
});
test("15-second shortcut and gentle detour can be finished with digital WASD and a brake key", () => {
  for (const points of [SAFE_WAYPOINTS, SHORT_WAYPOINTS]) {
    const sim = new Simulation();
    sim.reset(points === SAFE_WAYPOINTS, 0, points === SAFE_WAYPOINTS ? 2 : 0);
    let waypoint = 1;
    let digital = { x: 0, z: 0 };
    for (let frame = 0; frame < sim.duration * 60 + 1 && !sim.ended; frame++) {
      const p = sim.position,
        target = points[waypoint];
      const dx = target.x - p.x,
        dz = target.z - p.z,
        distance = Math.hypot(dx, dz);
      if (distance < 0.7 && waypoint < points.length - 1) waypoint++;
      if (frame % 7 === 0) {
        const screenX =
          dx * Math.cos(CAMERA_ANGLE) - dz * Math.sin(CAMERA_ANGLE);
        const screenZ =
          dx * Math.sin(CAMERA_ANGLE) + dz * Math.cos(CAMERA_ANGLE);
        const direction =
          Math.round(Math.atan2(screenZ, screenX) / (Math.PI / 4)) *
          (Math.PI / 4);
        const x = Math.cos(direction),
          z = Math.sin(direction);
        digital = {
          x: x * Math.cos(CAMERA_ANGLE) + z * Math.sin(CAMERA_ANGLE),
          z: -x * Math.sin(CAMERA_ANGLE) + z * Math.cos(CAMERA_ANGLE),
        };
      }
      const stopping = waypoint === points.length - 1 && distance < 1.1;
      sim.step(1 / 60, {
        ...neutral,
        ...(stopping ? { x: 0, z: 0 } : digital),
        steady: distance < 1.15,
      });
    }
    const result = sim.result();
    console.log(
      "Digital route",
      points === SAFE_WAYPOINTS ? "safe" : "shortcut",
      {
        time: result.elapsed,
        tea: result.tea,
        collisions: result.collisions,
        finished: result.finished,
        waypoint,
      },
    );
    expect(result.finished).toBe(true);
    expect(result.tea).toBeGreaterThan(0.8);
    sim.dispose();
  }
});

test("all three levels are winnable with digital directions and deliberate braking", () => {
  for (let level = 0; level < COURSES.length; level++) {
    const brake = [1.15, 1.8, 1.4][level];
    const sim = new Simulation();
    sim.reset(false, 0, level);
    const points = COURSES[level].path;
    let waypoint = 1;
    let digital = { x: 0, z: 0 };
    for (let f = 0; f < 2700 && !sim.ended; f++) {
      const p = sim.position,
        t = points[waypoint],
        dx = t.x - p.x,
        dz = t.z - p.z,
        d = Math.hypot(dx, dz);
      if (d < 0.7 && waypoint < points.length - 1) waypoint++;
      if (f % 7 === 0) {
        const sx = dx * Math.cos(CAMERA_ANGLE) - dz * Math.sin(CAMERA_ANGLE),
          sz = dx * Math.sin(CAMERA_ANGLE) + dz * Math.cos(CAMERA_ANGLE),
          angle =
            (Math.round(Math.atan2(sz, sx) / (Math.PI / 4)) * Math.PI) / 4;
        const x = Math.cos(angle),
          z = Math.sin(angle);
        digital = {
          x: x * Math.cos(CAMERA_ANGLE) + z * Math.sin(CAMERA_ANGLE),
          z: -x * Math.sin(CAMERA_ANGLE) + z * Math.cos(CAMERA_ANGLE),
        };
      }
      const stop = waypoint === points.length - 1 && d < 1.1;
      sim.step(1 / 60, {
        ...(stop ? { x: 0, z: 0 } : digital),
        tiltX: 0,
        tiltZ: 0,
        steady: d < brake,
      });
    }
    expect(
      sim.finished,
      `Level ${level + 1}: ${Math.round(sim.liquid.amount * 100)} % tea`,
    ).toBe(true);
    expect(sim.checkpoint).toBe(3);
    expect(sim.elapsed).toBeLessThan(sim.duration);
    sim.dispose();
  }
});
test("a collision moves a tea tin and a retry restores it", () => {
  const sim = new Simulation();
  sim.reset(false, 0, 0);
  const tin = sim.props[0].body;
  const origin = { ...tin.translation() };
  sim.player.setTranslation({ x: origin.x, y: 0.72, z: origin.z + 1.2 }, true);
  for (let i = 0; i < 45; i++) sim.step(1 / 60, { ...neutral, z: -1 });
  expect(
    Math.hypot(tin.translation().x - origin.x, tin.translation().z - origin.z),
  ).toBeGreaterThan(0.12);
  sim.reset(false, 0, 0);
  expect(sim.props[0].body.translation().z).toBeCloseTo(origin.z, 4);
  sim.dispose();
});
test("the table cannot bypass course marks and a near-empty cup cannot unlock a level", () => {
  const sim = new Simulation();
  sim.player.setTranslation({ x: 0, y: 0.72, z: -13.1 }, true);
  sim.step(1 / 60, neutral);
  expect(sim.ended).toBe(false);
  sim.checkpoint = 3;
  sim.liquid.amount = 0.3;
  sim.step(1 / 60, neutral);
  expect(sim.arrived).toBe(true);
  expect(sim.finished).toBe(false);
  sim.dispose();
});
test("strong phone tilt actually spills tea while a small tilt stays comfortable", () => {
  const pour = (tilt: number) => {
    const sim = new Simulation();
    for (let i = 0; i < 180; i++) sim.step(1 / 60, { ...neutral, tiltX: tilt });
    const result = sim.result();
    sim.dispose();
    return result;
  };
  const quiet = pour(0.04),
    tilted = pour(0.5);
  expect(quiet.tea).toBeGreaterThan(0.999);
  expect(tilted.tea).toBeLessThan(0.95);
  expect(tilted.loss.Handyneigung).toBeGreaterThan(0.03);
});
