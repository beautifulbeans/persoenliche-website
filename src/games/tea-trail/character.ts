import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import type { Simulation } from "./simulation";
import { clamp } from "./liquid";

type Leg = {
  side: number;
  upper: THREE.Mesh;
  lower: THREE.Mesh;
  boot: THREE.Mesh;
  position: THREE.Vector3;
  from: THREE.Vector3;
  to: THREE.Vector3;
  planted: boolean;
  swing: number;
  duration: number;
  yaw: number;
};
const up = new THREE.Vector3(0, 1, 0);
const sphere = (r: number) => new THREE.SphereGeometry(r, 28, 20);

/** Feet stay in world space during stance; only the swinging foot follows a landing arc. */
export class CharacterRig {
  root = new THREE.Group();
  body = new THREE.Group();
  private legs: Leg[] = [];
  private previous = new THREE.Vector3();
  private velocity = new THREE.Vector3();
  private local = new THREE.Vector3();
  private hip = new THREE.Vector3();
  private knee = new THREE.Vector3();
  private direction = new THREE.Vector3();
  private nextLeg = 0;
  private initialized = false;
  private distance = 0;
  private ground = 0.055;
  landed = false;
  private materials = new Map<string, THREE.MeshStandardMaterial>();
  constructor() {
    this.root.add(this.body);
    // A small gardener: linen sleeves, jade vest, stitched apron, terracotta neckerchief.
    const torso = this.part(
      new THREE.CapsuleGeometry(0.31, 0.33, 6, 16),
      "#48755f",
      this.body,
      [0, 1.01, 0],
    );
    torso.scale.z = 0.75;
    this.part(
      new RoundedBoxGeometry(0.43, 0.48, 0.045, 2, 0.035),
      "#ded0a2",
      this.body,
      [0, 0.92, -0.252],
    );
    this.part(
      new RoundedBoxGeometry(0.24, 0.15, 0.035, 2, 0.025),
      "#b6a878",
      this.body,
      [0, 0.82, -0.282],
    );
    for (const x of [-0.15, 0.15]) {
      const strap = this.part(
        new THREE.BoxGeometry(0.045, 0.45, 0.036),
        "#d8c698",
        this.body,
        [x, 1.16, -0.22],
      );
      strap.rotation.x = -0.28;
      this.part(sphere(0.027), "#ba9865", this.body, [x, 1.02, -0.28]);
    }
    this.part(
      new THREE.CylinderGeometry(0.11, 0.12, 0.14, 12),
      "#dcb08b",
      this.body,
      [0, 1.34, -0.015],
    );
    const face = this.part(
      sphere(0.29),
      "#e3b68f",
      this.body,
      [0, 1.59, -0.015],
    );
    face.scale.set(0.93, 1.02, 0.94);
    for (const side of [-1, 1]) {
      this.part(sphere(0.061), "#d9a580", this.body, [side * 0.267, 1.56, 0]);
      const eye = this.part(sphere(0.025), "#303b31", this.body, [
        side * 0.095,
        1.59,
        -0.27,
      ]);
      eye.scale.y = 1.2;
      this.part(sphere(0.008), "#fff3dc", this.body, [
        side * 0.095 - 0.006,
        1.6,
        -0.29,
      ]);
    }
    this.part(sphere(0.044), "#d59d78", this.body, [0, 1.53, -0.285]);
    const hair = this.part(
      new THREE.SphereGeometry(
        0.302,
        20,
        12,
        0,
        Math.PI * 2,
        0,
        Math.PI * 0.56,
      ),
      "#554034",
      this.body,
      [0, 1.62, 0.015],
    );
    hair.rotation.x = -0.15;
    for (let i = 0; i < 5; i++) {
      const lock = this.part(
        sphere(0.11),
        i % 2 ? "#644937" : "#554034",
        this.body,
        [-0.21 + i * 0.1, 1.77 - i * 0.017, -0.17],
      );
      lock.scale.set(0.82, 0.78, 1.3);
      lock.rotation.y = -0.55;
    }
    const scarf = this.part(
      new THREE.TorusGeometry(0.145, 0.048, 6, 16),
      "#b46950",
      this.body,
      [0, 1.32, -0.02],
    );
    scarf.rotation.x = Math.PI / 2;
    const knot = this.part(
      sphere(0.055),
      "#ca8261",
      this.body,
      [0.09, 1.29, -0.17],
    );
    knot.scale.set(0.7, 1.6, 0.8);
    for (const side of [-1, 1]) {
      const sleeve = this.part(
        new THREE.CapsuleGeometry(0.115, 0.24, 4, 12),
        "#d7c9a3",
        this.body,
        [side * 0.34, 1.11, -0.15],
      );
      sleeve.rotation.x = -0.85;
      const forearm = this.part(
        new THREE.CapsuleGeometry(0.083, 0.19, 4, 10),
        "#dcb08b",
        this.body,
        [side * 0.36, 1.07, -0.36],
      );
      forearm.rotation.x = -1.25;
      this.part(sphere(0.1), "#e3b68f", this.body, [side * 0.36, 1.08, -0.51]);
      const upper = this.part(
        new THREE.CylinderGeometry(0.115, 0.09, 1, 10),
        "#4d5446",
        this.root,
      );
      const lower = this.part(
        new THREE.CylinderGeometry(0.09, 0.075, 1, 10),
        "#58604e",
        this.root,
      );
      const boot = this.part(
        new RoundedBoxGeometry(0.22, 0.17, 0.36, 2, 0.07),
        "#69503b",
        this.root,
      );
      this.legs.push({
        side,
        upper,
        lower,
        boot,
        position: new THREE.Vector3(),
        from: new THREE.Vector3(),
        to: new THREE.Vector3(),
        planted: true,
        swing: 0,
        duration: 0.2,
        yaw: 0,
      });
    }
    // Each shared color is batched; details do not each add another draw call.
    const byMaterial = new Map<THREE.Material, THREE.BufferGeometry[]>();
    this.body.updateMatrixWorld(true);
    this.body.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      const geometry = object.geometry.clone().applyMatrix4(object.matrix);
      const list = byMaterial.get(object.material) ?? [];
      list.push(geometry.index ? geometry.toNonIndexed() : geometry);
      byMaterial.set(object.material, list);
      object.geometry.dispose();
    });
    this.body.clear();
    for (const [material, geometries] of byMaterial) {
      const mesh = new THREE.Mesh(mergeGeometries(geometries), material);
      mesh.castShadow = mesh.receiveShadow = true;
      this.body.add(mesh);
      geometries.forEach((g) => g.dispose());
    }
  }
  private part(
    geometry: THREE.BufferGeometry,
    color: string,
    parent: THREE.Group,
    position: number[] = [0, 0, 0],
  ) {
    let material = this.materials.get(color);
    if (!material) {
      material = new THREE.MeshStandardMaterial({ color, roughness: 0.92 });
      this.materials.set(color, material);
    }
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(position[0], position[1], position[2]);
    mesh.castShadow = mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }
  private restingFoot(leg: Leg, yaw: number, lead = 0) {
    return this.local
      .set(leg.side * 0.17, 0.085, -lead)
      .applyAxisAngle(up, yaw)
      .add(this.root.position);
  }
  update(
    sim: Simulation,
    dt: number,
    reduced: boolean,
    pose?: {
      position: { x: number; z: number };
      yaw: number;
      speed: number;
      velocity: { x: number; z: number };
    },
  ) {
    this.landed = false;
    const p = pose?.position ?? sim.position;
    const yaw = pose?.yaw ?? sim.yaw;
    const speed = pose?.speed ?? sim.speed;
    const velocity = pose?.velocity ?? sim.lastV;
    const surfaceY =
      sim.surface === "vinyl"
        ? 0.285
        : sim.surface === "cloth"
          ? 0.242
          : sim.surface === "stone"
            ? 0.102
            : 0.047;
    this.ground +=
      (surfaceY - this.ground) * (dt === 0 ? 1 : 1 - Math.exp(-24 * dt));
    this.root.position.set(p.x, this.ground, p.z);
    this.root.rotation.y = yaw;
    this.root.updateMatrixWorld(true);
    if (!this.initialized || sim.elapsed === 0) {
      for (const leg of this.legs) {
        leg.position.copy(this.restingFoot(leg, yaw));
        leg.planted = true;
        leg.yaw = yaw;
      }
      this.previous.copy(this.root.position);
      this.distance = 0;
      this.initialized = true;
    }
    const travelled = this.previous.distanceTo(this.root.position);
    this.velocity.set(velocity.x, 0, velocity.z);
    this.distance += travelled;
    this.previous.copy(this.root.position);
    const moving = speed > 0.08;
    if (dt > 0 && !this.legs.some((leg) => !leg.planted)) {
      const leg = this.legs[this.nextLeg];
      const offset = leg.position.distanceTo(this.restingFoot(leg, yaw));
      if ((moving && this.distance > 0.045) || (!moving && offset > 0.11)) {
        leg.from.copy(leg.position);
        leg.duration = clamp(0.47 / Math.max(speed, 1.8), 0.155, 0.2);
        leg.to
          .copy(this.restingFoot(leg, yaw))
          .addScaledVector(this.velocity, leg.duration * 1.65);
        leg.swing = 0;
        leg.planted = false;
        leg.yaw = yaw;
        this.nextLeg = 1 - this.nextLeg;
        this.distance = 0;
      } else if (!moving) this.nextLeg = 1 - this.nextLeg;
    }
    for (const leg of this.legs) {
      if (!leg.planted) {
        if (!moving)
          leg.to.lerp(this.restingFoot(leg, yaw), 1 - Math.exp(-20 * dt));
        leg.swing = Math.min(1, leg.swing + dt / leg.duration);
        const t = leg.swing;
        // Smooth swing and toe clearance, followed by an exact planted position.
        leg.position.lerpVectors(leg.from, leg.to, t * t * (3 - 2 * t));
        leg.position.y += Math.sin(t * Math.PI) * (moving ? 0.18 : 0.08);
        if (t === 1) {
          leg.planted = true;
          this.landed = true;
        }
      }
      this.local.copy(leg.position);
      this.root.worldToLocal(this.local);
      this.hip.set(leg.side * 0.17, 0.68, 0.025);
      this.direction.subVectors(this.local, this.hip);
      const distance = Math.min(0.695, this.direction.length());
      this.direction.normalize();
      this.knee.copy(this.hip).addScaledVector(this.direction, distance * 0.5);
      // Equal 0.35 m bones; the knee bends forward in the character's local plane.
      const bend = Math.sqrt(Math.max(0, 0.35 ** 2 - (distance * 0.5) ** 2));
      const forward = new THREE.Vector3(0, 0, -1)
        .addScaledVector(this.direction, this.direction.z)
        .normalize();
      this.knee.addScaledVector(forward, bend);
      this.segment(leg.upper, this.hip, this.knee);
      this.segment(leg.lower, this.knee, this.local);
      leg.boot.position.copy(this.local);
      leg.boot.rotation.set(
        leg.planted ? 0 : Math.sin(leg.swing * Math.PI * 2) * 0.2,
        leg.yaw - yaw,
        0,
      );
    }
    const bob =
      moving && !reduced
        ? Math.sin(this.legs.find((l) => !l.planted)?.swing! * Math.PI || 0) *
          0.018
        : 0;
    this.body.position.y +=
      (bob - this.body.position.y) * (1 - Math.exp(-20 * dt));
    const lean = reduced ? 0 : -Math.min(0.045, speed * 0.014);
    this.body.rotation.x +=
      (lean - this.body.rotation.x) * (1 - Math.exp(-12 * dt));
  }
  private segment(mesh: THREE.Mesh, a: THREE.Vector3, b: THREE.Vector3) {
    mesh.position.copy(a).add(b).multiplyScalar(0.5);
    this.direction.subVectors(b, a);
    mesh.scale.y = this.direction.length();
    mesh.quaternion.setFromUnitVectors(up, this.direction.normalize());
  }
  get footContacts() {
    return this.legs.map((leg) => ({
      planted: leg.planted,
      x: leg.position.x,
      y: leg.position.y,
      z: leg.position.z,
    }));
  }
}
