type FlipCardElements = {
  card: HTMLElement;
  inner: HTMLElement | null;
  front: HTMLElement | null;
  back: HTMLElement | null;
  openButton: HTMLButtonElement | null;
  closeButton: HTMLButtonElement | null;
};

/** Rotate each face only during the turn. Resting text never stays on a 3D layer. */
export function initializeFlipCard({ card, inner, front, back, openButton, closeButton }: FlipCardElements) {
  if (!inner || !front || !back) return;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let visibleFace = front;
  let motion: Animation | undefined;
  let flipRun = 0;

  const setHeight = () => {
    inner.style.height = `${(card.classList.contains("is-flipped") ? back : front).scrollHeight}px`;
  };
  const showFace = (flipped: boolean) => {
    front.setAttribute("aria-hidden", String(flipped));
    back.setAttribute("aria-hidden", String(!flipped));
    front.toggleAttribute("inert", flipped);
    back.toggleAttribute("inert", !flipped);
    visibleFace = flipped ? back : front;
  };

  const setFlipped = async (flipped: boolean, moveFocus = false) => {
    const run = ++flipRun;
    const outgoing = visibleFace;
    const incoming = flipped ? back : front;
    const startingTransform = getComputedStyle(outgoing).transform;
    motion?.cancel();
    card.classList.toggle("is-flipped", flipped);
    openButton?.setAttribute("aria-expanded", String(flipped));
    setHeight();

    const finish = () => {
      if (run !== flipRun) return;
      motion?.cancel();
      motion = undefined;
      card.classList.remove("is-flipping");
      if (moveFocus) (flipped ? closeButton : openButton)?.focus({ preventScroll: true });
    };

    if (reduceMotion.matches || outgoing === incoming) {
      showFace(flipped);
      finish();
      return;
    }

    card.classList.add("is-flipping");
    const direction = flipped ? 1 : -1;
    const easing = "cubic-bezier(0.4, 0, 0.2, 1)";
    motion = outgoing.animate(
      [{ transform: startingTransform }, { transform: `rotateY(${-90 * direction}deg)` }],
      { duration: 180, easing, fill: "forwards" },
    );
    await motion.finished.catch(() => undefined);
    if (run !== flipRun) return;
    motion.cancel();
    showFace(flipped);
    motion = incoming.animate(
      [{ transform: `rotateY(${90 * direction}deg)` }, { transform: "rotateY(0deg)" }],
      { duration: 240, easing, fill: "forwards" },
    );
    await motion.finished.catch(() => undefined);
    finish();
  };

  showFace(false);
  setHeight();
  openButton?.addEventListener("click", (event) => {
    event.stopPropagation();
    void setFlipped(true, true);
  });
  closeButton?.addEventListener("click", (event) => {
    event.stopPropagation();
    void setFlipped(false, true);
  });
  card.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    const selection = window.getSelection();
    const selectedInsideCard = selection && !selection.isCollapsed && selection.anchorNode && card.contains(selection.anchorNode);
    if (target.closest("a, button") || selectedInsideCard) return;
    void setFlipped(!card.classList.contains("is-flipped"));
  });
  reduceMotion.addEventListener("change", () => void setFlipped(card.classList.contains("is-flipped")));
  void document.fonts.ready.then(setHeight);
  const resizeObserver = new ResizeObserver(setHeight);
  resizeObserver.observe(front);
  resizeObserver.observe(back);
}
