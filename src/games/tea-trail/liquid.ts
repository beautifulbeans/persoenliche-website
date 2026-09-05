import { ROUND_SECONDS } from "./level";
export const clamp = (n: number, a: number, b: number) =>
  Math.min(b, Math.max(a, n));
export const TEA_BASE_HEIGHT = 0.075;
export const TEA_FILL_DEPTH = 0.225;
export type LossCause =
  "Beschleunigen & Bremsen" | "Enge Kurven" | "Kollisionen" | "Handyneigung";
export interface LiquidInput {
  ax: number;
  az: number;
  turn: number;
  cornerX?: number;
  cornerZ?: number;
  impact: number;
  tiltX: number;
  tiltZ: number;
  gentle: boolean;
}
/** Fixed-step damped pendulum. Heights and slopes are expressed in cup-local metres. */
export class Liquid {
  amount = 1;
  x = 0;
  z = 0;
  vx = 0;
  vz = 0;
  wave = 0;
  waveVelocity = 0;
  private previousImpact = 0;
  trayX = 0;
  trayZ = 0;
  cupX = 0;
  cupZ = 0;
  loss: Record<LossCause, number> = {
    "Beschleunigen & Bremsen": 0,
    "Enge Kurven": 0,
    Kollisionen: 0,
    Handyneigung: 0,
  };
  reset() {
    this.amount = 1;
    this.x =
      this.z =
      this.vx =
      this.vz =
      this.wave =
      this.waveVelocity =
      this.previousImpact =
      this.trayX =
      this.trayZ =
      this.cupX =
      this.cupZ =
        0;
    for (const k of Object.keys(this.loss) as LossCause[]) this.loss[k] = 0;
  }
  step(dt: number, input: LiquidInput) {
    const stability = input.gentle ? 0.55 : 1;
    const tx = clamp(
      (-input.ax * 0.033 - (input.cornerX ?? 0) * 0.18 + input.tiltX * 0.3) *
        stability,
      -0.8,
      0.8,
    );
    const tz = clamp(
      (-input.az * 0.033 - (input.cornerZ ?? 0) * 0.18 + input.tiltZ * 0.3) *
        stability,
      -0.8,
      0.8,
    );
    this.vx += ((tx - this.x) * 42 - this.vx * 7.8) * dt;
    this.vz += ((tz - this.z) * 42 - this.vz * 7.8) * dt;
    this.x += this.vx * dt;
    this.z += this.vz * dt;
    // A contact is an impulse, not a force spread across the whole carrying motion.
    // Only its rising edge excites this wave; the decaying contact signal cannot add it again.
    this.waveVelocity +=
      Math.max(0, input.impact - this.previousImpact) * 0.7 * stability;
    this.previousImpact = input.impact;
    this.waveVelocity +=
      (-this.wave * 47 -
        this.waveVelocity * 6.4 +
        input.impact * 3.5 * stability +
        Math.abs(input.turn) * 0.09) *
      dt;
    this.wave += this.waveVelocity * dt;
    this.trayX +=
      (clamp(tx * 0.42 + this.x * 0.22, -0.3, 0.3) - this.trayX) *
      (1 - Math.exp(-9 * dt));
    this.trayZ +=
      (clamp(tz * 0.42 + this.z * 0.22, -0.3, 0.3) - this.trayZ) *
      (1 - Math.exp(-9 * dt));
    this.cupX += (this.x * 0.18 - this.cupX) * (1 - Math.exp(-12 * dt));
    this.cupZ += (this.z * 0.18 - this.cupZ) * (1 - Math.exp(-12 * dt));
    // 100% is a sensible serving with room below the rim, rather than a brim-full cup.
    const fillHeight = TEA_BASE_HEIGHT + this.amount * TEA_FILL_DEPTH;
    const crest = Math.hypot(this.x, this.z) * 0.3 + Math.abs(this.wave) * 0.16;
    const overflow = Math.max(0, fillHeight + crest - 0.397);
    const spilled = Math.min(this.amount, overflow * dt * 1.65);
    this.amount -= spilled;
    const weights: [LossCause, number][] = [
      ["Beschleunigen & Bremsen", Math.hypot(input.ax, input.az)],
      ["Enge Kurven", Math.abs(input.turn) * 3],
      ["Kollisionen", input.impact * 4],
      ["Handyneigung", Math.hypot(input.tiltX, input.tiltZ) * 12],
    ];
    const total = weights.reduce((s, [, w]) => s + w, 0);
    for (const [cause, weight] of weights)
      this.loss[cause] +=
        spilled *
        (total > 0.001
          ? weight / total
          : cause === "Beschleunigen & Bremsen"
            ? 1
            : 0);
    return spilled;
  }
}
export function scoreRound(
  tea: number,
  elapsed: number,
  collisions: number,
  smoothness: number,
  finished: boolean,
  duration = ROUND_SECONDS,
) {
  if (!finished) return { score: 0, leaves: 0 };
  const score = Math.round(
    clamp(tea, 0, 1) * 700 +
      clamp(1 - elapsed / duration, 0, 1) * 150 +
      clamp(1 - collisions / 12, 0, 1) * 75 +
      clamp(smoothness, 0, 1) * 75,
  );
  return {
    score,
    leaves:
      tea >= 0.9 && score >= 820 ? 3 : tea >= 0.65 && score >= 650 ? 2 : 1,
  };
}
