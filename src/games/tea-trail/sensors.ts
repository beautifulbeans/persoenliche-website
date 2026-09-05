import { clamp } from "./liquid";
type PermissionOrientation = typeof DeviceOrientationEvent & {
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
      if (
        Sensor.requestPermission &&
        (await Sensor.requestPermission()) !== "granted"
      ) {
        this.status(
          "Keine Sensorfreigabe. Du kannst ganz normal mit dem Joystick spielen.",
        );
        return;
      }
      if (this.disposed || request !== this.request) return;
      this.enabled = true;
      this.active = true;
      this.neutral = null;
      this.lastEvent = 0;
      window.addEventListener("deviceorientation", this.onOrientation);
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
      this.status("Neigung aktiv. Deine aktuelle Haltung ist die Mitte.");
    }
  };
  calibrate = () => {
    this.neutral = null;
    this.x = this.z = 0;
    this.status("Halte dein Handy kurz ruhig. Die Mitte wird neu gesetzt.");
  };
  setActive(active: boolean) {
    this.active = active;
    this.x = this.z = 0;
    window.removeEventListener("deviceorientation", this.onOrientation);
    if (active && this.enabled) {
      this.neutral = null;
      window.addEventListener("deviceorientation", this.onOrientation);
    }
  }
  sample(dt: number) {
    if (
      !this.enabled ||
      !this.active ||
      !this.neutral ||
      !this.latest ||
      performance.now() - this.lastEvent > 1500
    ) {
      this.x = this.z = 0;
      return;
    }
    const deadzone = (n: number) =>
      Math.sign(n) * clamp((Math.abs(n) - 2.5) / 18, 0, 1);
    const gamma = deadzone(this.latest.gamma - this.neutral.gamma),
      beta = deadzone(this.latest.beta - this.neutral.beta);
    const angle =
      ((screen.orientation?.angle ??
        (window as unknown as { orientation?: number }).orientation ??
        0) *
        Math.PI) /
      180;
    const x = gamma * Math.cos(angle) + beta * Math.sin(angle),
      z = beta * Math.cos(angle) - gamma * Math.sin(angle);
    const s = 1 - Math.exp(-7 * dt);
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
    window.removeEventListener("orientationchange", this.calibrate);
    this.changed(false);
  }
  dispose() {
    this.disposed = true;
    this.disable();
  }
}
