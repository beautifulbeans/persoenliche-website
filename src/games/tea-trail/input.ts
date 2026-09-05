import type { Controls } from "./simulation";
import type { TiltSensor } from "./sensors";
export const CAMERA_ANGLE = 0.48;
export class Input {
  active = false;
  private keys = new Set<string>();
  private pointer: number | null = null;
  private stick = { x: 0, z: 0 };
  private steady = false;
  private abort = new AbortController();
  private origin = { x: 0, y: 0 };
  constructor(
    canvas: HTMLCanvasElement,
    private joystick: HTMLElement,
    private thumb: HTMLElement,
    private steadyButton: HTMLButtonElement,
    private sensor: TiltSensor,
    pause: () => void,
  ) {
    const signal = this.abort.signal;
    const steady = this.steadyButton;
    const supported = new Set([
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "KeyW",
      "KeyA",
      "KeyS",
      "KeyD",
      "Space",
      "ShiftLeft",
      "ShiftRight",
    ]);
    canvas.addEventListener(
      "keydown",
      (e) => {
        if (!this.active || document.activeElement !== canvas) return;
        if (e.code === "Tab") {
          pause();
          return;
        }
        if (e.code === "Escape") {
          e.preventDefault();
          pause();
          return;
        }
        if (supported.has(e.code)) {
          e.preventDefault();
          this.keys.add(e.code);
        }
      },
      { signal },
    );
    window.addEventListener("keyup", (e) => this.keys.delete(e.code), {
      signal,
    });
    canvas.addEventListener(
      "blur",
      (event) => {
        if (!this.active) return;
        this.clear();
        // Let an intentional click reach its control before opening a modal.
        // Keyboard Tab pauses above; navigation, sound and settings retain their native click.
        if (
          event.relatedTarget instanceof HTMLElement &&
          event.relatedTarget.closest("button, a, input")
        )
          return;
        pause();
      },
      { signal },
    );
    window.addEventListener(
      "blur",
      () => {
        this.clear();
        if (this.active) pause();
      },
      { signal },
    );
    joystick.addEventListener(
      "pointerdown",
      (e) => {
        if (!this.active || this.pointer !== null) return;
        e.preventDefault();
        this.pointer = e.pointerId;
        joystick.setPointerCapture(e.pointerId);
        const rect = joystick.getBoundingClientRect();
        this.origin = {
          x: rect.x + rect.width / 2,
          y: rect.y + rect.height / 2,
        };
        this.move(e);
      },
      { signal },
    );
    joystick.addEventListener(
      "pointermove",
      (e) => {
        if (e.pointerId === this.pointer) {
          e.preventDefault();
          this.move(e);
        }
      },
      { signal },
    );
    const release = (e: PointerEvent) => {
      if (e.pointerId === this.pointer) {
        this.pointer = null;
        this.stick = { x: 0, z: 0 };
        this.thumb.style.transform = "";
      }
    };
    joystick.addEventListener("pointerup", release, { signal });
    joystick.addEventListener("pointercancel", release, { signal });
    joystick.addEventListener("lostpointercapture", release, { signal });
    steady.addEventListener(
      "pointerdown",
      (e) => {
        if (this.active) {
          e.preventDefault();
          steady.setPointerCapture(e.pointerId);
          this.steady = true;
          steady.classList.add("is-held");
        }
      },
      { signal },
    );
    for (const name of ["pointerup", "pointercancel", "lostpointercapture"])
      steady.addEventListener(
        name,
        () => {
          this.steady = false;
          steady.classList.remove("is-held");
        },
        { signal },
      );
  }
  private move(e: PointerEvent) {
    const x = (e.clientX - this.origin.x) / 42,
      z = (e.clientY - this.origin.y) / 42,
      size = Math.max(1, Math.hypot(x, z));
    this.stick = { x: x / size, z: z / size };
    this.thumb.style.transform = `translate(${this.stick.x * 34}px, ${this.stick.z * 34}px)`;
  }
  sample(dt: number): Controls {
    this.sensor.sample(dt);
    const k = this.keys;
    let x =
      this.stick.x +
      Number(k.has("ArrowRight") || k.has("KeyD")) -
      Number(k.has("ArrowLeft") || k.has("KeyA"));
    let z =
      this.stick.z +
      Number(k.has("ArrowDown") || k.has("KeyS")) -
      Number(k.has("ArrowUp") || k.has("KeyW"));
    const length = Math.max(1, Math.hypot(x, z));
    x /= length;
    z /= length;
    const c = Math.cos(CAMERA_ANGLE),
      s = Math.sin(CAMERA_ANGLE);
    return {
      x: this.active ? x * c + z * s : 0,
      z: this.active ? -x * s + z * c : 0,
      tiltX: this.sensor.x * c + this.sensor.z * s,
      tiltZ: -this.sensor.x * s + this.sensor.z * c,
      steady:
        this.steady ||
        k.has("Space") ||
        k.has("ShiftLeft") ||
        k.has("ShiftRight"),
    };
  }
  clear() {
    this.keys.clear();
    if (this.pointer !== null && this.joystick.hasPointerCapture(this.pointer))
      this.joystick.releasePointerCapture(this.pointer);
    this.steadyButton.classList.remove("is-held");
    this.pointer = null;
    this.stick = { x: 0, z: 0 };
    this.steady = false;
    this.thumb.style.transform = "";
  }
  dispose() {
    this.active = false;
    this.clear();
    this.abort.abort();
  }
}
