import { TiltSensor } from "./sensors";
import { TeaAudio } from "./audio";
import { GOAL, OBSTACLES, START, roundDuration, COURSES } from "./level";
import type { Game } from "./game";
import type { RoundResult } from "./simulation";
interface Preferences {
  volume: number;
  muted: boolean;
  gentle: boolean;
  sensitivity: number;
}
interface Best {
  score: number;
  tea: number;
  time: number;
}
const SETTINGS_KEY = "tea-trail:session-settings:v2",
  BEST_KEY = "tea-trail:session-best:v4";
const defaults: Preferences = {
  volume: 40,
  muted: false,
  gentle: false,
  sensitivity: 50,
};
const bounded = (value: unknown, fallback: number) =>
  typeof value === "number" && Number.isFinite(value)
    ? Math.min(100, Math.max(0, value))
    : fallback;
function readPrefs(): Preferences {
  try {
    const value = JSON.parse(sessionStorage.getItem(SETTINGS_KEY) ?? "null");
    return value && typeof value === "object"
      ? {
          volume: bounded(value.volume, 40),
          muted: value.muted === true,
          gentle: value.gentle === true,
          sensitivity: bounded(value.sensitivity, 50),
        }
      : defaults;
  } catch {
    return { ...defaults };
  }
}
function readBest(): Record<string, Best> {
  try {
    const value = JSON.parse(sessionStorage.getItem(BEST_KEY) ?? "{}");
    const out: Record<string, Best> = {};
    for (const mode of COURSES.flatMap((_, i) => [
      `${i}:normal`,
      `${i}:gentle`,
    ])) {
      const b = value?.[mode];
      if (
        b &&
        Number.isFinite(b.score) &&
        b.score >= 0 &&
        b.score <= 1000 &&
        Number.isFinite(b.tea) &&
        b.tea >= 0 &&
        b.tea <= 1 &&
        Number.isFinite(b.time) &&
        b.time >= 0 &&
        b.time <= roundDuration(mode.endsWith(":gentle"), Number(mode[0]))
      )
        out[mode] = b;
    }
    return out;
  } catch {
    return {};
  }
}
export function mountTeaTrail() {
  const root = document.querySelector<HTMLElement>("[data-tea-trail]");
  if (!root || root.dataset.mounted) return;
  root.dataset.mounted = "true";
  root.dataset.touch = String(
    navigator.maxTouchPoints > 0 || matchMedia("(any-pointer: coarse)").matches,
  );
  const q = <T extends HTMLElement = HTMLElement>(name: string) =>
    root.querySelector<T>(`[data-${name}]`)!;
  const abort = new AbortController();
  const signal = abort.signal;
  const prefs = readPrefs();
  let best = readBest();
  let selectedLevel = 0;
  let unlocked = 0;
  type Attempt = {
    levelId: number;
    tea: number;
    elapsed: number;
    score: number;
    finished: boolean;
    gentle: boolean;
  };
  let attempts: Attempt[] = [];
  try {
    const saved = JSON.parse(
      sessionStorage.getItem("tea-trail:session-progress:v2") ?? "null",
    );
    if (saved && Number.isInteger(saved.unlocked))
      unlocked = Math.max(0, Math.min(COURSES.length - 1, saved.unlocked));
    if (Number.isInteger(saved?.selected))
      selectedLevel = Math.max(0, Math.min(unlocked, saved.selected));
    if (Array.isArray(saved?.attempts))
      attempts = saved.attempts
        .filter(
          (a: Attempt) =>
            Number.isInteger(a.levelId) &&
            a.levelId >= 0 &&
            a.levelId < COURSES.length &&
            Number.isFinite(a.tea) &&
            a.tea >= 0 &&
            a.tea <= 1 &&
            Number.isFinite(a.elapsed) &&
            a.elapsed >= 0 &&
            a.elapsed <= 45 &&
            Number.isInteger(a.score) &&
            a.score >= 0 &&
            a.score <= 1000 &&
            typeof a.finished === "boolean" &&
            typeof a.gentle === "boolean",
        )
        .slice(0, 8);
  } catch {
    /* Session history remains available in memory. */
  }
  const saveProgress = () => {
    try {
      sessionStorage.setItem(
        "tea-trail:session-progress:v2",
        JSON.stringify({ unlocked, selected: selectedLevel, attempts }),
      );
    } catch {
      /* Memory fallback. */
    }
  };
  const renderHistory = () => {
    root
      .querySelectorAll<HTMLElement>("[data-history]")
      .forEach((container) => {
        container.replaceChildren();
        if (!attempts.length) {
          const empty = document.createElement("p");
          empty.textContent =
            "Noch keine Versuche. Deine nächsten acht Runden erscheinen hier.";
          container.append(empty);
          return;
        }
        const table = document.createElement("table");
        const caption = document.createElement("caption");
        caption.className = "sr-only";
        caption.textContent = "Letzte Versuche, neuester zuerst";
        table.append(caption);
        const head = document.createElement("thead");
        const heading = document.createElement("tr");
        for (const title of ["Level", "Tee", "Zeit", "Punkte", "Ergebnis"]) {
          const th = document.createElement("th");
          th.scope = "col";
          th.textContent = title;
          heading.append(th);
        }
        head.append(heading);
        table.append(head);
        const body = document.createElement("tbody");
        for (const a of attempts) {
          const row = document.createElement("tr");
          for (const text of [
            `${a.levelId + 1}${a.gentle ? " · Sanft" : ""}`,
            `${Math.round(a.tea * 100)} %`,
            `${a.elapsed.toFixed(1).replace(".", ",")} s`,
            String(a.score),
            a.finished ? "Geschafft" : "Noch einmal",
          ]) {
            const cell = document.createElement("td");
            cell.textContent = text;
            row.append(cell);
          }
          body.append(row);
        }
        table.append(body);
        container.append(table);
      });
  };
  let game: Game | null = null;
  let busy = false;
  let disposed = false;
  let playing = false;
  let wasPaused = false;
  let chimeTimer = 0;
  const stage = q("stage"),
    startPanel = q("start-panel"),
    start = q<HTMLButtonElement>("start");
  let canvas = q<HTMLCanvasElement>("game-canvas");
  const pauseDialog = q<HTMLDialogElement>("pause-dialog"),
    settingsDialog = q<HTMLDialogElement>("settings-dialog"),
    resultDialog = q<HTMLDialogElement>("result-dialog"),
    errorDialog = q<HTMLDialogElement>("error-dialog");
  const audio = new TeaAudio();
  const sensor = new TiltSensor(
    (text) => {
      q("sensor-status").textContent = text;
    },
    (enabled) => {
      q("sensor-enable").hidden = enabled;
      q("sensor-disable").hidden = !enabled;
      q("calibrate").hidden = !enabled;
    },
  );
  sensor.strength = prefs.sensitivity / 100;
  const savePrefs = () => {
    try {
      sessionStorage.setItem(SETTINGS_KEY, JSON.stringify(prefs));
    } catch {
      /* Private browsing or blocked storage keeps session preferences. */
    }
  };
  const updateBest = () => {
    q("round-seconds").textContent = String(
      roundDuration(prefs.gentle, selectedLevel),
    );
    q("course-title").textContent =
      `Level ${selectedLevel + 1} · ${COURSES[selectedLevel].name}`;
    q("course-description").textContent = COURSES[selectedLevel].description;
    q("course-requirement").textContent =
      `Alle drei Wegmarken passieren. Mindestens ${Math.round(COURSES[selectedLevel].minimumTea * 100)} % Tee am Tisch abstellen.`;
    root
      .querySelectorAll<HTMLButtonElement>("[data-level]")
      .forEach((button) => {
        const index = Number(button.dataset.level);
        button.disabled = index > unlocked;
        button.setAttribute("aria-pressed", String(index === selectedLevel));
        button.querySelector("i")!.className =
          `ph ${index > unlocked ? "ph-lock-simple" : "ph-leaf"}`;
        button.title =
          index > unlocked
            ? "Vorheriges Level erfolgreich abschließen"
            : COURSES[index].description;
      });
    const b = best[`${selectedLevel}:${prefs.gentle ? "gentle" : "normal"}`];
    q("best").textContent = b
      ? `Bestleistung${prefs.gentle ? " · Sanft" : ""}: ${b.score} Punkte · ${Math.round(b.tea * 100)} % Tee`
      : "Deine erste Tasse wartet.";
  };
  const updateAudio = () => {
    audio.set(prefs.volume / 100, prefs.muted);
    q("mute").setAttribute("aria-pressed", String(prefs.muted));
    q("mute").setAttribute(
      "aria-label",
      prefs.muted ? "Ton einschalten" : "Ton stummschalten",
    );
    q("mute").querySelector("i")!.className =
      `ph ${prefs.muted || prefs.volume === 0 ? "ph-speaker-slash" : "ph-speaker-high"}`;
  };
  q<HTMLInputElement>("volume").value = String(prefs.volume);
  q<HTMLInputElement>("gentle").checked = prefs.gentle;
  q<HTMLInputElement>("sensitivity").value = String(prefs.sensitivity);
  q("sensitivity-output").textContent = `${prefs.sensitivity} %`;
  updateAudio();
  updateBest();
  renderHistory();
  const closeDialogs = () => {
    for (const dialog of [
      pauseDialog,
      settingsDialog,
      resultDialog,
      errorDialog,
    ])
      if (dialog.open) dialog.close();
  };
  const pause = () => {
    if (!playing) return;
    playing = false;
    game?.pause();
    stage.dataset.state = "paused";
    q("game-status").textContent = "Pausiert. Die Zeit steht still.";
    pauseDialog.showModal();
  };
  const resume = () => {
    if (!game || (game.sim.ended && !game.sim.arrived)) return;
    closeDialogs();
    playing = true;
    stage.dataset.state = "playing";
    audio.unlock();
    game.resume();
    q("game-status").textContent = "Weiter geht’s. Bring den Tee zum Tisch.";
  };
  const error = (message: string) => {
    playing = false;
    game?.pause();
    closeDialogs();
    q("error-message").textContent = message;
    errorDialog.showModal();
  };
  const drawMap = (result: RoundResult) => {
    const map = q<HTMLCanvasElement>("loss-map"),
      c = map.getContext("2d");
    if (!c) return;
    const sx = (x: number) => 105 + x * 9,
      sz = (z: number) => 130 + z * 7.3;
    c.clearRect(0, 0, 210, 260);
    c.fillStyle = "#e3e9dc";
    c.fillRect(0, 0, 210, 260);
    c.strokeStyle = "#a5b39b";
    c.lineWidth = 2;
    c.strokeRect(24, 12, 162, 235);
    c.fillStyle = "#a7b398";
    for (const o of OBSTACLES)
      c.fillRect(sx(o.x - o.w / 2), sz(o.z - o.d / 2), o.w * 9, o.d * 7.3);
    c.font = "600 13px sans-serif";
    c.textAlign = "center";
    c.fillStyle = "#344831";
    c.fillText("Start", sx(START.x), sz(START.z) + 22);
    c.fillText("Tisch", sx(GOAL.x), sz(GOAL.z) - 15);
    c.fillStyle = "#527049";
    c.beginPath();
    c.arc(sx(GOAL.x), sz(GOAL.z), 9, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#8f492f";
    for (const spill of result.spills) {
      c.beginPath();
      c.arc(
        sx(spill.x),
        sz(spill.z),
        Math.min(9, 3 + spill.amount * 120),
        0,
        Math.PI * 2,
      );
      c.fill();
    }
  };
  const finish = (result: RoundResult) => {
    playing = false;
    stage.dataset.state = "finished";
    closeDialogs();
    q("result-title").textContent = result.finished
      ? "Zeit für einen guten Tee."
      : result.arrived
        ? "Ein bisschen mehr Tee, bitte."
        : "Der Tisch wartet noch.";
    q("result-summary").textContent = result.finished
      ? `${result.leaves === 3 ? "Ruhige Hände, eine volle Tasse." : result.tea > 0.55 ? "Gut angekommen. Jeder ruhigere Schritt zählt." : "Angekommen! Mit sanfteren Kurven bleibt beim nächsten Mal mehr Tee."}${result.gentle ? " Im sanften Modus." : ""}`
      : result.arrived
        ? `Am Tisch angekommen, aber dieses Level braucht mindestens ${Math.round(COURSES[result.levelId].minimumTea * 100)} % Tee. Bremse vor den Kurven kurz ab.`
        : `${result.duration} Sekunden sind um. ${Math.round(result.tea * 100)} % Tee sind noch in deiner Tasse. Merke dir die Wegmarken. Vor engen Kurven kurz ruhiger tragen.`;
    q("result-tea").textContent = `${Math.round(result.tea * 100)} %`;
    q("result-time").textContent =
      `${result.elapsed.toFixed(1).replace(".", ",")} s`;
    q("result-score").textContent = String(result.score);
    const leaves = q("result-leaves");
    leaves.replaceChildren();
    leaves.setAttribute("aria-label", `${result.leaves} von 3 Teeblättern`);
    for (let i = 0; i < 3; i++) {
      const icon = document.createElement("i");
      icon.className = `ph ph-leaf${i >= result.leaves ? " is-empty" : ""}`;
      icon.setAttribute("aria-hidden", "true");
      leaves.append(icon);
    }
    const mode = `${result.levelId}:${result.gentle ? "gentle" : "normal"}`;
    let storageAvailable = true;
    const newBest =
      result.finished && (!best[mode] || result.score > best[mode].score);
    if (newBest) {
      best[mode] = {
        score: result.score,
        tea: result.tea,
        time: result.elapsed,
      };
      try {
        sessionStorage.setItem(BEST_KEY, JSON.stringify(best));
      } catch {
        storageAvailable = false;
      }
    }
    q("result-best").textContent = newBest
      ? storageAvailable
        ? "Deine neue Bestleistung in dieser Sitzung."
        : "Neue Bestleistung für diese Sitzung. Browserspeicherung ist hier nicht verfügbar."
      : `${result.collisions} ${result.collisions === 1 ? "Kollision" : "Kollisionen"} · ${Math.round(result.smoothness * 100)} % ruhige Bewegung`;
    attempts.unshift({
      levelId: result.levelId,
      tea: result.tea,
      elapsed: result.elapsed,
      score: result.score,
      finished: result.finished,
      gentle: result.gentle,
    });
    attempts = attempts.slice(0, 8);
    if (result.finished)
      unlocked = Math.max(
        unlocked,
        Math.min(COURSES.length - 1, result.levelId + 1),
      );
    q("next-level").hidden =
      !result.finished || result.levelId >= COURSES.length - 1;
    if (result.finished && result.levelId === COURSES.length - 1)
      q("result-title").textContent = "Drei Level. Ein guter Tee.";
    saveProgress();
    renderHistory();
    updateBest();
    drawMap(result);
    const list = q("loss-list");
    list.replaceChildren();
    for (const [cause, amount] of Object.entries(result.loss)) {
      const item = document.createElement("li");
      const label = document.createElement("span");
      label.textContent = cause;
      const value = document.createElement("span");
      value.textContent = `${(amount * 100).toFixed(1).replace(".", ",")} %`;
      item.append(label, value);
      list.append(item);
    }
    const bySection: Record<string, number> = {};
    for (const spill of result.spills)
      bySection[spill.section] = (bySection[spill.section] ?? 0) + spill.amount;
    const top = Object.entries(bySection).sort((a, b) => b[1] - a[1])[0];
    q("loss-tip").textContent = top
      ? `Am meisten verloren: ${top[0]} (${(top[1] * 100).toFixed(1).replace(".", ",")} %). Die Punkte auf der Karte zeigen die Stellen.`
      : "Kein Tropfen verloren. So schmeckt eine ruhige Runde.";
    q("game-status").textContent =
      `Runde beendet. ${result.finished ? "Ziel erreicht." : ""} ${Math.round(result.tea * 100)} Prozent Tee, ${result.score} Punkte, ${result.leaves} Teeblätter.`;
    resultDialog.showModal();
    q("restart").focus();
    if (result.finished) {
      audio.unlock();
      audio.finish();
      chimeTimer = window.setTimeout(() => {
        if (resultDialog.open) audio.pause();
      }, 950);
    }
  };
  const begin = async () => {
    if (busy || disposed) return;
    busy = true;
    root
      .querySelectorAll<HTMLButtonElement>("[data-settings-open]")
      .forEach((button) => {
        button.disabled = true;
      });
    clearTimeout(chimeTimer);
    closeDialogs();
    start.disabled = true;
    audio.unlock();
    stage.dataset.state = "loading";
    q("start-label").textContent = "Atelier wird vorbereitet …";
    q("load-status").textContent =
      "Modelle und Physik laden. Nur beim ersten Start.";
    try {
      if (!game) {
        const module = await import("./game");
        await module.preparePhysics();
        if (disposed) return;
        game = new module.Game({
          root,
          sensor,
          audio,
          onPause: pause,
          onEnd: finish,
          onError: error,
          onServe: () => {
            stage.dataset.state = "serving";
            q("game-status").textContent =
              "Am Tisch angekommen. Die Figur stellt den Tee ab.";
          },
        });
        await game.load();
        if (disposed) return;
      }
      root.classList.add("is-playing");
      startPanel.hidden = true;
      root.querySelector<HTMLImageElement>(".tt-poster")!.hidden = true;
      canvas.hidden = false;
      canvas.tabIndex = 0;
      q("hud").hidden =
        q("location").hidden =
        q("touch-controls").hidden =
          false;
      q("load-status").textContent = "";
      q("game-status").textContent =
        "Die Runde beginnt. Folge dem Weg zum Teetisch.";
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => resolve()),
      );
      if (disposed) return;
      game.view.resize();
      stage.scrollIntoView({ block: "nearest", behavior: "instant" });
      playing = true;
      game.start(prefs.gentle, selectedLevel);
      stage.dataset.state = "playing";
      // Diagnostics are intentionally absent from production builds.
      if (import.meta.env.DEV)
        (window as unknown as { __teaTrail?: unknown }).__teaTrail = {
          game,
          root,
          pause,
          resume,
          finish,
          sensor,
        };
    } catch (cause) {
      if (!disposed) {
        console.error("Tea Trail loading:", cause);
        game?.dispose();
        game = null;
        const replacement = canvas.cloneNode(false) as HTMLCanvasElement;
        canvas.replaceWith(replacement);
        canvas = replacement;
        audio.pause();
        start.disabled = false;
        stage.dataset.state = "idle";
        q("start-label").textContent = "Erneut versuchen";
        q("load-status").textContent =
          "Das Atelier konnte nicht starten. Bitte prüfe die Verbindung und ob WebGL 2 im Browser verfügbar ist.";
        startPanel.hidden = false;
        root.querySelector<HTMLImageElement>(".tt-poster")!.hidden = false;
        canvas.hidden = true;
        root.classList.remove("is-playing");
      }
    } finally {
      busy = false;
      start.disabled = false;
      root
        .querySelectorAll<HTMLButtonElement>("[data-settings-open]")
        .forEach((button) => {
          button.disabled = false;
        });
    }
  };
  const chooseLevel = () => {
    game?.pause();
    playing = false;
    closeDialogs();
    root.classList.remove("is-playing");
    stage.dataset.state = "idle";
    startPanel.hidden = false;
    q("start-label").textContent = "Spiel starten";
    canvas.hidden = true;
    root.querySelector<HTMLImageElement>(".tt-poster")!.hidden = false;
    q("hud").hidden = q("location").hidden = q("touch-controls").hidden = true;
    updateBest();
    start.focus();
  };
  root.querySelectorAll<HTMLButtonElement>("[data-level]").forEach((button) =>
    button.addEventListener(
      "click",
      () => {
        const index = Number(button.dataset.level);
        if (playing || index > unlocked) return;
        selectedLevel = index;
        saveProgress();
        updateBest();
      },
      { signal },
    ),
  );
  q("choose-level").addEventListener("click", chooseLevel, { signal });
  q("next-level").addEventListener(
    "click",
    () => {
      selectedLevel = Math.min(unlocked, selectedLevel + 1);
      saveProgress();
      chooseLevel();
    },
    { signal },
  );
  q("sensor-intro").addEventListener(
    "click",
    () => {
      openSettings();
    },
    { signal },
  );
  start.addEventListener("click", begin, { signal });
  q("restart").addEventListener("click", begin, { signal });
  q("pause").addEventListener("click", pause, { signal });
  q("resume").addEventListener("click", resume, { signal });
  pauseDialog.addEventListener(
    "cancel",
    (e) => {
      e.preventDefault();
      resume();
    },
    { signal },
  );
  resultDialog.addEventListener(
    "cancel",
    (e) => {
      e.preventDefault();
      q("restart").focus();
    },
    { signal },
  );
  errorDialog.addEventListener("cancel", (e) => e.preventDefault(), { signal });
  const openSettings = () => {
    if (settingsDialog.open) return;
    wasPaused = playing || pauseDialog.open;
    if (playing) pause();
    if (pauseDialog.open) pauseDialog.close();
    settingsDialog.showModal();
  };
  const closeSettings = () => {
    settingsDialog.close();
    if (wasPaused) {
      pauseDialog.showModal();
      q("resume").focus();
    } else start.focus();
  };
  root
    .querySelectorAll("[data-settings-open]")
    .forEach((button) =>
      button.addEventListener("click", openSettings, { signal }),
    );
  q("settings-close").addEventListener("click", closeSettings, { signal });
  q("settings-done").addEventListener("click", closeSettings, { signal });
  settingsDialog.addEventListener(
    "cancel",
    (e) => {
      e.preventDefault();
      closeSettings();
    },
    { signal },
  );
  q("sensor-enable").addEventListener("click", () => void sensor.enable(), {
    signal,
  });
  q("sensor-disable").addEventListener(
    "click",
    () => {
      sensor.disable();
      q("sensor-status").textContent =
        "Neigung ist aus. Joystick und Ruhig-Taste funktionieren weiterhin.";
    },
    { signal },
  );
  q("calibrate").addEventListener("click", sensor.calibrate, { signal });
  q("gentle").addEventListener(
    "change",
    () => {
      prefs.gentle = q<HTMLInputElement>("gentle").checked;
      savePrefs();
      updateBest();
    },
    { signal },
  );
  q("sensitivity").addEventListener(
    "input",
    () => {
      prefs.sensitivity = Number(q<HTMLInputElement>("sensitivity").value);
      sensor.strength = prefs.sensitivity / 100;
      q("sensitivity-output").textContent = `${prefs.sensitivity} %`;
      savePrefs();
    },
    { signal },
  );
  q("mute").addEventListener(
    "click",
    () => {
      prefs.muted = !prefs.muted;
      updateAudio();
      savePrefs();
      if (playing) canvas.focus({ preventScroll: true });
    },
    { signal },
  );
  q("volume").addEventListener(
    "input",
    () => {
      prefs.volume = Number(q<HTMLInputElement>("volume").value);
      updateAudio();
      savePrefs();
    },
    { signal },
  );
  q("reload").addEventListener("click", () => window.location.reload(), {
    signal,
  });
  root.addEventListener(
    "keydown",
    (event) => {
      if (event.code === "Escape" && playing && event.target !== canvas) {
        event.preventDefault();
        pause();
      }
    },
    { signal },
  );
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    playing = false;
    clearTimeout(chimeTimer);
    abort.abort();
    game?.dispose();
    sensor.dispose();
    audio.dispose();
    delete root.dataset.mounted;
  };
  window.addEventListener("pagehide", dispose, { once: true });
  document.addEventListener("astro:before-swap", dispose, {
    once: true,
    signal,
  });
  // This listener must survive the initial pageshow and the pagehide cleanup.
  window.addEventListener("pageshow", (e) => {
    if (e.persisted && disposed) window.location.reload();
  });
}
