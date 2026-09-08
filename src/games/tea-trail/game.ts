import RAPIER from "@dimforge/rapier3d-compat";
import { Simulation, type RoundResult } from "./simulation";
import { Diorama } from "./scene";
import { Input } from "./input";
import { GOAL, RECORD, sectionAt } from "./level";
import type { TiltSensor } from "./sensors";
import type { TeaAudio } from "./audio";
export interface GameOptions {
  root: HTMLElement;
  sensor: TiltSensor;
  audio: TeaAudio;
  onPause: () => void;
  onEnd: (result: RoundResult) => void;
  onError: (message: string) => void;
  onServe: () => void;
}
export class Game {
  sim: Simulation;
  view: Diorama;
  input: Input;
  private frame = 0;
  private running = false;
  private lastTime = 0;
  private accumulator = 0;
  private hudClock = 0;
  private frames: number[] = [];
  private abort = new AbortController();
  private disposed = false;
  private serving = 0;
  private servingStarted = false;
  private timer: HTMLElement;
  private tea: HTMLElement;
  private fill: HTMLElement;
  private goal: HTMLElement;
  private area: HTMLElement;
  constructor(private options: GameOptions) {
    const { root, sensor, onPause } = options;
    const canvas = root.querySelector<HTMLCanvasElement>("[data-game-canvas]")!;
    this.sim = new Simulation();
    try {
      this.view = new Diorama(canvas);
    } catch (error) {
      this.sim.dispose();
      throw error;
    }
    this.input = new Input(
      canvas,
      root.querySelector("[data-joystick]")!,
      root.querySelector("[data-joystick-thumb]")!,
      root.querySelector("[data-steady]")!,
      sensor,
      onPause,
    );
    this.timer = root.querySelector("[data-time]")!;
    this.tea = root.querySelector("[data-tea]")!;
    this.fill = root.querySelector("[data-tea-fill]")!;
    this.goal = root.querySelector("[data-goal]")!;
    this.area = root.querySelector("[data-area]")!;
    document.addEventListener(
      "visibilitychange",
      () => {
        if (document.hidden && this.running) onPause();
      },
      { signal: this.abort.signal },
    );
    canvas.addEventListener(
      "webglcontextlost",
      (e) => {
        e.preventDefault();
        if (!this.disposed) {
          this.pause();
          options.onError(
            "Die 3D-Ansicht wurde unterbrochen. Lade das Atelier erneut; deine Bestleistung bleibt gespeichert.",
          );
        }
      },
      { signal: this.abort.signal },
    );
  }
  async load() {
    await this.view.load();
    if (!this.disposed) this.view.render(this.sim, 0);
  }
  start(gentle: boolean, levelId = 0) {
    this.sim.reset(gentle, Math.random(), levelId);
    this.serving = 0;
    this.servingStarted = false;
    this.view.resetSpills();
    this.frames = [];
    this.view.render(this.sim, 0);
    this.updateHud();
    this.resume();
  }
  resume() {
    if (this.running || this.disposed) return;
    this.input.clear();
    this.running = true;
    this.input.active = true;
    this.options.sensor.setActive(true);
    this.lastTime = performance.now();
    this.accumulator = 0;
    this.options.root
      .querySelector<HTMLCanvasElement>("[data-game-canvas]")!
      .focus({ preventScroll: true });
    this.frame = requestAnimationFrame(this.tick);
  }
  pause() {
    this.running = false;
    this.input.active = false;
    this.input.clear();
    this.options.sensor.setActive(false);
    this.options.audio.pause();
    cancelAnimationFrame(this.frame);
  }
  private tick = (time: number) => {
    if (!this.running) return;
    try {
      const delta = Math.max(0, (time - this.lastTime) / 1000);
      this.lastTime = time;
      // Large foreground interruptions pause instead of taking unseen seconds away.
      if (delta > 0.65) {
        this.options.onPause();
        return;
      }
      this.frames.push(delta * 1000);
      if (this.frames.length > 1800) this.frames.shift();
      this.accumulator += delta;
      const input = this.input.sample(delta);
      let steps = 0;
      while (this.accumulator >= 1 / 60 && steps < 30) {
        this.sim.step(1 / 60, input);
        this.accumulator -= 1 / 60;
        steps++;
      }
      if (this.sim.arrived) {
        if (!this.servingStarted) {
          this.servingStarted = true;
          this.options.onServe();
        }
        this.serving = Math.min(1, this.serving + delta / 1.8);
      }
      this.view.render(this.sim, delta, false, this.serving);
      const p = this.sim.position;
      this.options.audio.update(
        delta,
        this.sim.speed,
        this.sim.surface,
        Math.hypot(this.sim.liquid.x, this.sim.liquid.z),
        this.sim.spilled,
        this.sim.impact,
        Math.hypot(p.x - RECORD.x, p.z - RECORD.z),
        Math.hypot(p.x - GOAL.x, p.z - GOAL.z),
        this.sim.contactMaterial,
        this.view.footstep,
      );
      this.hudClock += delta;
      if (this.hudClock > 0.1) {
        this.hudClock = 0;
        this.updateHud();
      }
      if (this.sim.ended && (!this.sim.arrived || this.serving >= 1)) {
        this.updateHud();
        this.pause();
        this.options.onEnd(this.sim.result());
        return;
      }
      this.frame = requestAnimationFrame(this.tick);
    } catch (error) {
      console.error("Tea Trail:", error);
      this.pause();
      this.options.onError(
        "Das Atelier ist kurz ins Stolpern geraten. Du kannst das Spiel erneut laden.",
      );
    }
  };
  private updateHud() {
    const remaining = Math.ceil(this.sim.duration - this.sim.elapsed);
    this.timer.textContent = String(remaining).padStart(2, "0");
    this.timer.dataset.urgent = String(remaining <= 7);
    this.tea.textContent = `${Math.round(this.sim.liquid.amount * 100)} %`;
    this.fill.style.transform = `scaleX(${this.sim.liquid.amount})`;
    this.fill.parentElement?.setAttribute(
      "aria-valuenow",
      String(Math.round(this.sim.liquid.amount * 100)),
    );
    this.goal.textContent = this.sim.arrived
      ? "Der Tee wird abgestellt …"
      : this.sim.checkpoint < this.sim.course.checkpoints.length
        ? `Wegmarke ${this.sim.checkpoint + 1} von ${this.sim.course.checkpoints.length} · ${Math.round(this.sim.progress * 100)} % zum Teetisch`
        : "Zu den drei Pfeilen · dort anhalten";
    this.area.textContent = `Level ${this.sim.levelId + 1} · ${sectionAt(this.sim.position.z)}`;
  }
  get metrics() {
    const sorted = [...this.frames].sort((a, b) => a - b);
    const total = this.frames.reduce((a, b) => a + b, 0);
    return {
      ...this.view.metrics,
      frames: this.frames.length,
      fps: total ? (1000 * this.frames.length) / total : 0,
      frameP95Ms: sorted[Math.floor(sorted.length * 0.95)] ?? 0,
    };
  }
  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.pause();
    this.abort.abort();
    this.input.dispose();
    this.sim.dispose();
    this.view.dispose();
  }
}
let physicsReady: Promise<void> | undefined;
export function preparePhysics() {
  return (physicsReady ??= RAPIER.init());
}
