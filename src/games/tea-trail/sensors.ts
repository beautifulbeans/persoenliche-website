import { clamp } from "./liquid";
type PermissionOrientation = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<string>;
};
type PermissionMotion = typeof DeviceMotionEvent & {
  requestPermission?: () => Promise<string>;
};
export class TiltSensor {
  enabled = false;
  strength = 0.5;
  x = 0;
  z = 0;
  private neutral: { beta: number; gamma: number } | null = null;
  private latest: { beta: number; gamma: number } | null = null;
  private lastEvent = 0;
  private active = true;
  private timer = 0;
  private disposed = false;
  private request = 0;
  private motionAllowed = false;
  private shakeX = 0;
  private shakeZ = 0;
  private lastMotion = 0;
  constructor(
    private status: (text: string) => void,
    private changed: (enabled: boolean) => void,
  ) {}
  async enable() {
    const request = ++this.request;
    if (this.disposed) return;
    if (
      !window.isSecureContext ||
      typeof DeviceOrientationEvent === "undefined"
    ) {
      this.status(
        "Neigung ist hier nicht verfügbar. Joystick und Ruhig-Taste funktionieren vollständig.",
      );
      return;
    }
    try {
      const Sensor = DeviceOrientationEvent as PermissionOrientation;
      // Must happen synchronously in the initiating click, before any other await.
      const orientationPermission =
        Sensor.requestPermission?.() ?? Promise.resolve("granted");
      const Motion =
        typeof DeviceMotionEvent !== "undefined"
          ? (DeviceMotionEvent as PermissionMotion)
          : undefined;
      const motionPermission = Motion
        ? (Motion.requestPermission?.() ?? Promise.resolve("granted")).catch(
            () => "denied",
          )
        : Promise.resolve("denied");
      const [orientation, motion] = await Promise.all([
        orientationPermission,
        motionPermission,
      ]);
      if (orientation !== "granted") {
        this.status(
          "Keine Sensorfreigabe. Du kannst ganz normal mit dem Joystick spielen.",
        );
        return;
      }
      if (this.disposed || request !== this.request) return;
      this.enabled = true;
      this.motionAllowed = motion === "granted";
      this.active = true;
      this.neutral = null;
      this.lastEvent = 0;
      window.addEventListener("deviceorientation", this.onOrientation);
      if (this.motionAllowed)
        window.addEventListener("devicemotion", this.onMotion);
      window.addEventListener("orientationchange", this.calibrate);
      this.changed(true);
      this.status(
        "Halte dein Handy bequem. Diese Haltung wird als Mitte übernommen.",
      );
      clearTimeout(this.timer);
      this.timer = window.setTimeout(() => {
        if (!this.lastEvent) {
          this.disable();
          this.status(
            "Kein Sensorsignal. Joystick und Ruhig-Taste bleiben verfügbar.",
          );
        }
      }, 3500);
    } catch {
      this.disable();
      this.status(
        "Neigung konnte nicht aktiviert werden. Spiele mit dem Joystick weiter.",
      );
    }
  }
  private onOrientation = (event: DeviceOrientationEvent) => {
    if (
      event.beta === null ||
      event.gamma === null ||
      !Number.isFinite(event.beta) ||
      !Number.isFinite(event.gamma)
    )
      return;
    this.latest = { beta: event.beta, gamma: event.gamma };
    this.lastEvent = performance.now();
    if (!this.neutral) {
      this.neutral = { ...this.latest };
      this.status(
        "Neigung aktiv. Handy ruhig halten: deutliches Kippen oder Rütteln kann Tee verschütten.",
      );
    }
  };
  private onMotion = (event: DeviceMotionEvent) => {
    const a = event.acceleration;
    if (
      !a ||
      a.x === null ||
      a.y === null ||
      !Number.isFinite(a.x) ||
      !Number.isFinite(a.y)
    )
      return;
    // Linear acceleration excludes gravity; no arbitrary shake trigger or penalty.
    this.shakeX = clamp(-a.x / 8, -0.75, 0.75);
    this.shakeZ = clamp(a.y / 8, -0.75, 0.75);
    this.lastMotion = performance.now();
  };
  calibrate = () => {
    this.neutral = null;
    this.x = this.z = 0;
    this.shakeX = this.shakeZ = 0;
    this.status("Halte dein Handy kurz ruhig. Die Mitte wird neu gesetzt.");
  };
  setActive(active: boolean) {
    this.active = active;
    this.x = this.z = 0;
    window.removeEventListener("deviceorientation", this.onOrientation);
    window.removeEventListener("devicemotion", this.onMotion);
    this.shakeX = this.shakeZ = 0;
    if (active && this.enabled) {
      this.neutral = null;
      window.addEventListener("deviceorientation", this.onOrientation);
      if (this.motionAllowed)
        window.addEventListener("devicemotion", this.onMotion);
    }
  }
  sample(dt: number) {
    if (
      !this.enabled ||
      !this.active ||
      !this.neutral ||
      !this.latest ||
      (performance.now() - this.lastEvent > 1500 &&
        performance.now() - this.lastMotion > 180)
    ) {
      this.x = this.z = 0;
      return;
    }
    const deadzone = (n: number) =>
      Math.sign(n) * clamp((Math.abs(n) - 2.5) / 18, 0, 1);
    const degrees = (n: number) =>
      (Math.atan2(
        Math.sin((n * Math.PI) / 180),
        Math.cos((n * Math.PI) / 180),
      ) *
        180) /
      Math.PI;
    const shaking = performance.now() - this.lastMotion < 180;
    const gamma = clamp(
        deadzone(degrees(this.latest.gamma - this.neutral.gamma)) +
          (shaking ? this.shakeX : 0),
        -1.35,
        1.35,
      ),
      beta = clamp(
        deadzone(degrees(this.latest.beta - this.neutral.beta)) +
          (shaking ? this.shakeZ : 0),
        -1.35,
        1.35,
      );
    const angle =
      ((screen.orientation?.angle ??
        (window as unknown as { orientation?: number }).orientation ??
        0) *
        Math.PI) /
      180;
    const x = gamma * Math.cos(angle) + beta * Math.sin(angle),
      z = beta * Math.cos(angle) - gamma * Math.sin(angle);
    const s = 1 - Math.exp(-10 * dt);
    this.x += (x * this.strength - this.x) * s;
    this.z += (z * this.strength - this.z) * s;
  }
  disable() {
    this.request++;
    this.enabled = false;
    this.neutral = null;
    this.latest = null;
    this.x = this.z = 0;
    clearTimeout(this.timer);
    window.removeEventListener("deviceorientation", this.onOrientation);
    window.removeEventListener("devicemotion", this.onMotion);
    this.motionAllowed = false;
    this.shakeX = this.shakeZ = 0;
    window.removeEventListener("orientationchange", this.calibrate);
    this.changed(false);
  }
  dispose() {
    this.disposed = true;
    this.disable();
  }
}
