import RAPIER from "@dimforge/rapier3d-compat";
import {
  GOAL,
  COURSES,
  type CourseProp,
  LEVEL,
  OBSTACLES,
  PLAYER_RADIUS,
  RECORD,
  ROLLER,
  roundDuration,
  START,
  sectionAt,
  surfaceAt,
  type Surface,
  type ContactMaterial,
} from "./level";
import { Liquid, clamp, scoreRound, type LossCause } from "./liquid";
export interface Controls {
  x: number;
  z: number;
  tiltX: number;
  tiltZ: number;
  steady: boolean;
}
export interface Spill {
  x: number;
  z: number;
  amount: number;
  section: string;
}
export interface RoundResult {
  levelId: number;
  arrived: boolean;
  checkpoints: number;
  finished: boolean;
  tea: number;
  elapsed: number;
  collisions: number;
  smoothness: number;
  score: number;
  leaves: number;
  gentle: boolean;
  duration: number;
  loss: Record<LossCause, number>;
  spills: Spill[];
}
export class Simulation {
  world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });
  events = new RAPIER.EventQueue(true);
  player: RAPIER.RigidBody;
  playerCollider: RAPIER.Collider;
  roller: RAPIER.RigidBody;
  arm: RAPIER.RigidBody;
  liquid = new Liquid();
  elapsed = 0;
  collisions = 0;
  yaw = 0;
  speed = 0;
  surface: Surface = "wood";
  contactMaterial: ContactMaterial = "wood";
  private contactMaterials = new Map<number, ContactMaterial>();
  gentle = false;
  levelId = 0;
  checkpoint = 0;
  arrived = false;
  props: { definition: CourseProp; body: RAPIER.RigidBody }[] = [];
  get course() {
    return COURSES[this.levelId];
  }
  finished = false;
  ended = false;
  phase = 0;
  rollerX = ROLLER.x;
  recordAngle = 0;
  impact = 0;
  spilled = 0;
  smoothIntegral = 0;
  lastV = { x: 0, z: 0 };
  collisionCooldown = 0;
  spills: Spill[] = [];
  private lastSpill = -1;
  private cornerX = 0;
  private cornerZ = 0;
  constructor() {
    this.world.timestep = 1 / 60;
    this.world.createCollider(
      RAPIER.ColliderDesc.cuboid(10, 0.15, 17)
        .setTranslation(0, -0.15, 0)
        .setFriction(0.6),
    );
    for (const x of [-LEVEL.width / 2, LEVEL.width / 2])
      this.world.createCollider(
        RAPIER.ColliderDesc.cuboid(0.15, 1, LEVEL.depth / 2).setTranslation(
          x,
          0.6,
          0,
        ),
      );
    for (const z of [-LEVEL.depth / 2, LEVEL.depth / 2])
      this.world.createCollider(
        RAPIER.ColliderDesc.cuboid(LEVEL.width / 2, 1, 0.15).setTranslation(
          0,
          0.6,
          z,
        ),
      );
    for (const o of OBSTACLES) {
      const body = this.world.createRigidBody(
        RAPIER.RigidBodyDesc.fixed().setTranslation(o.x, o.h / 2, o.z),
      );
      if (o.rotation)
        body.setRotation(
          {
            x: 0,
            y: Math.sin(o.rotation / 2),
            z: 0,
            w: Math.cos(o.rotation / 2),
          },
          false,
        );
      // Low chips and spoon still meet the foot collider; the body is constrained to the walkable plane.
      const collider = this.world.createCollider(
        RAPIER.ColliderDesc.cuboid(o.w / 2, Math.max(0.28, o.h / 2), o.d / 2)
          .setFriction(0.45)
          .setRestitution(0.04),
        body,
      );
      this.contactMaterials.set(
        collider.handle,
        ["camera", "lens", "weights", "tin", "spoon"].includes(o.kind)
          ? "metal"
          : o.kind === "chips"
            ? "porcelain"
            : o.kind === "cards"
              ? "cloth"
              : "wood",
      );
      if (o.kind === "camera")
        this.world.createCollider(
          RAPIER.ColliderDesc.cylinder(0.62, 0.64)
            .setTranslation(0.35, 0.88 - o.h / 2, 0.94)
            .setRotation({ x: Math.SQRT1_2, y: 0, z: 0, w: Math.SQRT1_2 })
            .setFriction(0.45),
          body,
        );
    }
    this.player = this.world.createRigidBody(
      RAPIER.RigidBodyDesc.dynamic()
        .setTranslation(START.x, 0.72, START.z)
        .enabledTranslations(true, false, true)
        .lockRotations()
        .setCcdEnabled(true)
        .setAdditionalMassProperties(
          2.65,
          { x: 0, y: 0.17, z: -0.13 },
          { x: 0.7, y: 0.5, z: 0.7 },
          { x: 0, y: 0, z: 0, w: 1 },
        ),
    );
    this.playerCollider = this.world.createCollider(
      RAPIER.ColliderDesc.capsule(0.3, PLAYER_RADIUS)
        .setDensity(0.65)
        .setFriction(0)
        .setFrictionCombineRule(RAPIER.CoefficientCombineRule.Min)
        .setRestitution(0.08)
        .setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS),
      this.player,
    );
    this.roller = this.world.createRigidBody(
      RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(
        ROLLER.x,
        0.62,
        ROLLER.z,
      ),
    );
    this.world.createCollider(
      RAPIER.ColliderDesc.cuboid(0.61, 0.61, 0.65).setFriction(0.5),
      this.roller,
    );
    this.arm = this.world.createRigidBody(
      RAPIER.RigidBodyDesc.kinematicPositionBased(),
    );
    this.world.createCollider(
      RAPIER.ColliderDesc.cuboid(1.02, 0.25, 0.1).setFriction(0.2),
      this.arm,
    );
    this.reset(false, 0);
  }
  get position() {
    return this.player.translation();
  }
  get progress() {
    return clamp((START.z - this.position.z) / (START.z - GOAL.z), 0, 1);
  }
  get duration() {
    return roundDuration(this.gentle, this.levelId);
  }
  reset(gentle: boolean, variation = Math.random(), levelId = this.levelId) {
    this.levelId = Math.max(
      0,
      Math.min(COURSES.length - 1, Math.floor(levelId)),
    );
    this.checkpoint = 0;
    this.arrived = false;
    for (const prop of this.props) {
      for (let i = 0; i < prop.body.numColliders(); i++)
        this.contactMaterials.delete(prop.body.collider(i).handle);
      this.world.removeRigidBody(prop.body);
    }
    this.props = this.course.props.map((definition) => {
      const moving = definition.kind === "cards";
      const descriptor = moving
        ? RAPIER.RigidBodyDesc.kinematicPositionBased()
        : RAPIER.RigidBodyDesc.dynamic()
            .enabledTranslations(true, false, true)
            .enabledRotations(false, true, false)
            .setLinearDamping(3)
            .setAngularDamping(4)
            .setCcdEnabled(true);
      const body = this.world.createRigidBody(
        descriptor.setTranslation(
          definition.x,
          moving ? 0.7 : 0.42,
          definition.z,
        ),
      );
      const shape = moving
        ? RAPIER.ColliderDesc.cuboid(definition.radius, 0.65, 0.14)
        : RAPIER.ColliderDesc.cylinder(0.4, definition.radius);
      const collider = this.world.createCollider(
        shape
          .setMass(moving ? 2 : definition.kind === "chips" ? 3.5 : 1.4)
          .setFriction(0.65)
          .setRestitution(0.08),
        body,
      );
      this.contactMaterials.set(collider.handle, moving ? "cloth" : "metal");
      return { definition, body };
    });
    this.gentle = gentle;
    this.elapsed =
      this.collisions =
      this.speed =
      this.yaw =
      this.impact =
      this.spilled =
      this.smoothIntegral =
      this.collisionCooldown =
        0;
    this.finished = this.ended = false;
    this.phase = variation * 0.65;
    this.lastV = { x: 0, z: 0 };
    this.cornerX = this.cornerZ = 0;
    this.spills = [];
    this.lastSpill = -1;
    this.player.setTranslation({ ...START, y: 0.72 }, true);
    this.player.setLinvel({ x: 0, y: 0, z: 0 }, true);
    this.player.resetForces(true);
    this.liquid.reset();
    this.updateObstacles(0);
    this.world.step(this.events);
    this.events.drainCollisionEvents(() => {});
  }
  updateObstacles(time: number) {
    time *= this.course.pace;
    for (const { definition: d, body } of this.props) {
      if (d.kind === "cards")
        body.setNextKinematicTranslation({
          x:
            d.x +
            Math.sin((time / this.course.pace) * (d.rate ?? 1) + this.phase) *
              (d.travel ?? 1),
          y: 0.7,
          z: d.z,
        });
    }
    this.rollerX =
      ROLLER.x + Math.sin(time * 0.85 + this.phase) * ROLLER.travel;
    this.roller.setNextKinematicTranslation({
      x: this.rollerX,
      y: 0.62,
      z: ROLLER.z,
    });
    this.recordAngle = time * 0.6 + this.phase;
    const a = this.recordAngle;
    this.arm.setNextKinematicTranslation({
      x: RECORD.x + Math.cos(a) * 0.9,
      y: 0.6,
      z: RECORD.z + Math.sin(a) * 0.9,
    });
    this.arm.setNextKinematicRotation({
      x: 0,
      y: -Math.sin(a / 2),
      z: 0,
      w: Math.cos(a / 2),
    });
  }
  step(dt: number, input: Controls) {
    if (this.ended) return;
    this.elapsed = Math.min(this.duration, this.elapsed + dt);
    this.updateObstacles(this.elapsed);
    const p = this.position;
    const v = this.player.linvel();
    this.surface = surfaceAt(p.x, p.z);
    const stick = Math.min(1, Math.hypot(input.x, input.z));
    const desiredYaw = stick > 0.06 ? Math.atan2(-input.x, -input.z) : this.yaw;
    const delta = Math.atan2(
      Math.sin(desiredYaw - this.yaw),
      Math.cos(desiredYaw - this.yaw),
    );
    // Facing follows the intended direction; it no longer steers the body like a vehicle.
    const turn = clamp(delta * 15, -10, 10);
    this.yaw += turn * dt;
    const maxSpeed =
      (input.steady ? 1.65 : this.gentle ? 2.5 : 2.95) *
      (this.surface === "cloth" ? 0.94 : 1);
    const deadzone = 0.08;
    const desiredSpeed =
      Math.max(0, (stick - deadzone) / (1 - deadzone)) * maxSpeed;
    const wantedX = stick > deadzone ? (input.x / stick) * desiredSpeed : 0,
      wantedZ = stick > deadzone ? (input.z / stick) * desiredSpeed : 0;
    const response =
      this.surface === "vinyl"
        ? 9
        : this.surface === "stone"
          ? 15
          : this.surface === "cloth"
            ? 17
            : 15;
    let ax = (wantedX - v.x) * response,
      az = (wantedZ - v.z) * response;
    const braking = stick <= deadzone || wantedX * v.x + wantedZ * v.z < 0;
    const accelerationLimit = braking ? 14 : Math.abs(delta) > 0.5 ? 11 : 7;
    const forceScale = Math.min(
      1,
      accelerationLimit / Math.max(0.01, Math.hypot(ax, az)),
    );
    ax *= forceScale;
    az *= forceScale;
    if (this.surface === "vinyl") {
      ax += -(p.z - RECORD.z) * 0.85;
      az += (p.x - RECORD.x) * 0.85;
    }
    // Finish a deliberate stop, without a long sub-pixel drift on ordinary floors.
    if (
      stick <= deadzone &&
      Math.hypot(v.x, v.z) < 0.055 &&
      this.surface !== "vinyl"
    ) {
      this.player.setLinvel({ x: 0, y: 0, z: 0 }, true);
      ax = az = 0;
    }
    this.player.resetForces(true);
    this.player.addForce(
      { x: ax * this.player.mass(), y: 0, z: az * this.player.mass() },
      true,
    );
    this.world.step(this.events);
    let hit = false;
    this.events.drainCollisionEvents((a, b, started) => {
      if (
        started &&
        (a === this.playerCollider.handle || b === this.playerCollider.handle)
      ) {
        hit = true;
        this.contactMaterial =
          this.contactMaterials.get(a === this.playerCollider.handle ? b : a) ??
          "metal";
      }
    });
    const nowV = this.player.linvel();
    const actualAx = clamp((nowV.x - this.lastV.x) / dt, -28, 28),
      actualAz = clamp((nowV.z - this.lastV.z) / dt, -28, 28);
    this.collisionCooldown = Math.max(0, this.collisionCooldown - dt);
    if (hit && this.collisionCooldown <= 0 && Math.hypot(v.x, v.z) > 0.3) {
      this.collisions++;
      this.impact = Math.max(2, Math.hypot(v.x - nowV.x, v.z - nowV.z) * 5);
      this.collisionCooldown = 0.55;
    } else this.impact *= Math.exp(-6 * dt);
    // The cup reacts to actual lateral acceleration, not a key event or visual body yaw.
    // Ignore low-speed pivots; smooth 45-degree WASD transitions over about 80 ms.
    const oldSpeed = Math.hypot(v.x, v.z);
    const along =
      oldSpeed > 0.1
        ? (actualAx * v.x + actualAz * v.z) / (oldSpeed * oldSpeed)
        : 0;
    const bend =
      oldSpeed > 0.1 && desiredSpeed > 0.1
        ? Math.acos(
            clamp(
              (wantedX * v.x + wantedZ * v.z) / (oldSpeed * desiredSpeed),
              -1,
              1,
            ),
          )
        : 0;
    // A single 45-degree keyboard correction has a wide comfort margin.
    // Larger bends amplify real lateral forces, equally for keys and analogue sticks.
    const bendPressure = clamp((bend - 0.68) / 0.65, 0, 1);
    const speedPressure = hit
      ? 0
      : clamp((oldSpeed - 1.7) / 1.1, 0, 1) * bendPressure;
    const sideX = clamp(actualAx - v.x * along, -12, 12) * speedPressure;
    const sideZ = clamp(actualAz - v.z * along, -12, 12) * speedPressure;
    const cornerResponse = 1 - Math.exp(-12 * dt);
    this.cornerX += (sideX - this.cornerX) * cornerResponse;
    this.cornerZ += (sideZ - this.cornerZ) * cornerResponse;
    this.lastV = { x: nowV.x, z: nowV.z };
    this.speed = Math.hypot(nowV.x, nowV.z);
    this.smoothIntegral +=
      clamp(
        (Math.hypot(actualAx, actualAz) - 1) / 13 +
          (Math.abs(turn) * this.speed) / 30,
        0,
        1,
      ) * dt;
    this.spilled = this.liquid.step(dt, {
      ax: actualAx,
      az: actualAz,
      turn: Math.hypot(this.cornerX, this.cornerZ),
      cornerX: this.cornerX,
      cornerZ: this.cornerZ,
      impact: this.impact,
      tiltX: input.tiltX,
      tiltZ: input.tiltZ,
      gentle: this.gentle || input.steady,
    });
    if (this.spilled > 0) {
      if (
        this.lastSpill >= 0 &&
        this.elapsed - this.lastSpill < 0.5 &&
        this.spills.length
      )
        this.spills[this.spills.length - 1].amount += this.spilled;
      else
        this.spills.push({
          x: p.x,
          z: p.z,
          amount: this.spilled,
          section: sectionAt(p.z),
        });
      this.lastSpill = this.elapsed;
    }
    const pos = this.position;
    const mark = this.course.checkpoints[this.checkpoint];
    if (mark && Math.hypot(pos.x - mark.x, pos.z - mark.z) < mark.radius)
      this.checkpoint++;
    this.arrived =
      this.checkpoint === this.course.checkpoints.length &&
      Math.hypot(pos.x - GOAL.x, pos.z - GOAL.z) < GOAL.radius &&
      this.speed < 1.35;
    this.finished =
      this.arrived && this.liquid.amount >= this.course.minimumTea;
    this.ended = this.arrived || this.elapsed >= this.duration;
  }
  result(): RoundResult {
    const smoothness = clamp(
      1 - this.smoothIntegral / Math.max(1, this.elapsed),
      0,
      1,
    );
    return {
      levelId: this.levelId,
      arrived: this.arrived,
      checkpoints: this.checkpoint,
      finished: this.finished,
      tea: this.liquid.amount,
      elapsed: this.elapsed,
      collisions: this.collisions,
      smoothness,
      ...scoreRound(
        this.liquid.amount,
        this.elapsed,
        this.collisions,
        smoothness,
        this.finished,
        this.duration,
      ),
      gentle: this.gentle,
      duration: this.duration,
      loss: { ...this.liquid.loss },
      spills: this.spills.map((s) => ({ ...s })),
    };
  }
  dispose() {
    this.events.free();
    this.world.free();
  }
}
