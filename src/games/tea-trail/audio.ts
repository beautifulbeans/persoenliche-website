import type { Surface, ContactMaterial } from "./level";
/** Original, procedural foley. No recordings, downloads or copyrighted music. */
export class TeaAudio {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private ambience: AudioBufferSourceNode | null = null;
  private ambientGain: GainNode | null = null;
  private kettleGain: GainNode | null = null;
  private kettle: AudioBufferSourceNode | null = null;
  private volume = 0.4;
  private muted = false;
  private lastSpill = 0;
  private lastCollision = 0;
  private lastCrackle = 0;
  unlock() {
    try {
      if (!this.context) {
        const Audio =
          window.AudioContext ??
          (window as unknown as { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext;
        if (!Audio) return;
        this.context = new Audio();
        this.master = this.context.createGain();
        this.master.connect(this.context.destination);
        this.noise = this.context.createBuffer(
          1,
          this.context.sampleRate * 2,
          this.context.sampleRate,
        );
        const data = this.noise.getChannelData(0);
        let last = 0;
        for (let i = 0; i < data.length; i++) {
          last = (last + (Math.random() * 2 - 1) * 0.05) / 1.02;
          data[i] = last * 3;
        }
        const source = this.context.createBufferSource();
        source.buffer = this.noise;
        source.loop = true;
        const filter = this.context.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 420;
        this.ambientGain = this.context.createGain();
        this.ambientGain.gain.value = 0.028;
        source.connect(filter);
        filter.connect(this.ambientGain);
        this.ambientGain.connect(this.master);
        source.start();
        this.ambience = source;
        const kettle = this.context.createBufferSource();
        kettle.buffer = this.noise;
        kettle.loop = true;
        kettle.playbackRate.value = 1.7;
        const kettleFilter = this.context.createBiquadFilter();
        kettleFilter.type = "bandpass";
        kettleFilter.frequency.value = 1900;
        kettleFilter.Q.value = 0.8;
        this.kettleGain = this.context.createGain();
        this.kettleGain.gain.value = 0.009;
        kettle.connect(kettleFilter);
        kettleFilter.connect(this.kettleGain);
        this.kettleGain.connect(this.master);
        kettle.start();
        this.kettle = kettle;
      }
      this.set(this.volume, this.muted);
      void this.context.resume().catch(() => {});
    } catch {
      /* Audio is an enhancement: the round remains fully playable. */
    }
  }
  set(volume: number, muted: boolean) {
    this.volume = volume;
    this.muted = muted;
    if (this.context && this.master)
      this.master.gain.setTargetAtTime(
        muted ? 0 : volume,
        this.context.currentTime,
        0.03,
      );
  }
  private sound(
    frequency: number,
    duration: number,
    gain: number,
    kind: "noise" | "sine" = "sine",
    decay = 0.01,
  ) {
    const c = this.context;
    if (!c || !this.master || this.muted || c.state !== "running") return;
    const envelope = c.createGain();
    envelope.gain.setValueAtTime(0.0001, c.currentTime);
    envelope.gain.exponentialRampToValueAtTime(
      Math.max(0.0002, gain),
      c.currentTime + decay,
    );
    envelope.gain.exponentialRampToValueAtTime(
      0.0001,
      c.currentTime + duration,
    );
    envelope.connect(this.master);
    const source =
      kind === "noise" ? c.createBufferSource() : c.createOscillator();
    if (source instanceof AudioBufferSourceNode) source.buffer = this.noise;
    else {
      source.type = "sine";
      source.frequency.setValueAtTime(frequency, c.currentTime);
      source.frequency.exponentialRampToValueAtTime(
        frequency * 0.76,
        c.currentTime + duration,
      );
    }
    const filter = c.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = frequency;
    source.connect(filter);
    filter.connect(envelope);
    source.start();
    source.stop(c.currentTime + duration);
    source.onended = () => {
      source.disconnect();
      filter.disconnect();
      envelope.disconnect();
    };
  }
  update(
    dt: number,
    speed: number,
    surface: Surface,
    slosh: number,
    spilled: number,
    impact: number,
    recordDistance: number,
    goalDistance: number,
    contactMaterial: ContactMaterial,
    footstep = false,
  ) {
    this.lastSpill += dt;
    this.lastCollision += dt;
    this.lastCrackle += dt;
    if (footstep && speed > 0.08) {
      this.sound(
        surface === "stone" ? 1200 : surface === "cloth" ? 250 : 650,
        0.09,
        surface === "cloth" ? 0.025 : 0.047,
        "noise",
      );
      this.sound(surface === "stone" ? 280 : 160, 0.065, 0.024);
    }
    if (this.lastSpill > 0.16 && (spilled > 0.00005 || slosh > 0.32)) {
      this.lastSpill = 0;
      this.sound(
        spilled > 0 ? 1500 : 650,
        0.16,
        spilled > 0 ? 0.045 : 0.012,
        spilled > 0 ? "sine" : "noise",
      );
    }
    if (impact > 2 && this.lastCollision > 0.55) {
      this.lastCollision = 0;
      this.sound(
        contactMaterial === "metal"
          ? 480
          : contactMaterial === "cloth"
            ? 160
            : 240,
        0.2,
        contactMaterial === "cloth" ? 0.035 : 0.075,
        "noise",
      );
      if (contactMaterial === "metal") this.sound(710, 0.25, 0.024);
      this.sound(2450, 0.4, 0.025);
      this.sound(3270, 0.3, 0.012);
    }
    if (recordDistance < 5 && this.lastCrackle > 0.2 + Math.random() * 0.5) {
      this.lastCrackle = 0;
      this.sound(2400, 0.03, 0.022 * (1 - recordDistance / 5), "noise", 0.002);
    }
    if (this.ambientGain && this.context)
      this.ambientGain.gain.setTargetAtTime(
        0.023 + 0.017 * Math.max(0, 1 - goalDistance / 12),
        this.context.currentTime,
        0.5,
      );
    if (this.kettleGain && this.context)
      this.kettleGain.gain.setTargetAtTime(
        0.009 + 0.03 * Math.max(0, 1 - goalDistance / 15),
        this.context.currentTime,
        0.5,
      );
  }
  finish() {
    this.sound(784, 0.65, 0.06);
    this.sound(1174, 0.9, 0.035);
  }
  pause() {
    if (this.context?.state === "running")
      void this.context.suspend().catch(() => {});
  }
  dispose() {
    this.ambience?.stop();
    this.ambience?.disconnect();
    this.kettle?.stop();
    this.kettle?.disconnect();
    void this.context?.close().catch(() => {});
    this.context = null;
    this.master = null;
    this.noise = null;
    this.kettle = null;
    this.kettleGain = null;
  }
}
