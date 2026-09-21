const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const runningSwaps = new WeakMap<HTMLElement, Animation>();

type SwapOptions = {
  duration?: number;
  offset?: number;
  stagger?: number;
};

export const prefersReducedMotion = () => reducedMotion.matches;

export const setPressedState = (
  buttons: Iterable<HTMLButtonElement>,
  selected: HTMLButtonElement,
) => {
  Array.from(buttons).forEach((button) => {
    const active = button === selected;
    button.classList.toggle("is-selected", active);
    button.setAttribute("aria-pressed", String(active));
  });
  const group = selected.parentElement;
  if (group?.hasAttribute("data-sliding-selection")) {
    syncSelectionIndicator(group, !selected.matches(":focus-visible"));
  }
};

export const animateContentSwap = (
  candidates: Array<HTMLElement | null | undefined>,
  update: () => void,
  { duration = 210, offset = 4, stagger = 12 }: SwapOptions = {},
) => {
  const elements = candidates.filter((element): element is HTMLElement => Boolean(element));
  elements.forEach((element) => runningSwaps.get(element)?.cancel());
  update();

  if (reducedMotion.matches) return;

  elements.forEach((element, index) => {
    runningSwaps.get(element)?.cancel();

    const animation = element.animate(
      [
        {
          opacity: 0.18,
          transform: `translate3d(0, ${offset}px, 0)`,
          filter: "blur(1px)",
        },
        {
          opacity: 1,
          transform: "translate3d(0, 0, 0)",
          filter: "blur(0)",
        },
      ],
      {
        duration,
        delay: index * stagger,
        easing: "cubic-bezier(0.23, 1, 0.32, 1)",
      },
    );

    runningSwaps.set(element, animation);
    void animation.finished
      .catch(() => undefined)
      .finally(() => {
        if (runningSwaps.get(element) === animation) runningSwaps.delete(element);
      });
  });
};

const selectionAnimations = new WeakMap<HTMLElement, Animation>();

export const syncSelectionIndicator = (group: HTMLElement, animate = true) => {
  const selected = group.querySelector<HTMLButtonElement>('button[aria-pressed="true"]');
  if (!selected || !group.offsetWidth) return;
  let indicator = group.querySelector<HTMLElement>(':scope > .selection-indicator');
  const previous = indicator?.getBoundingClientRect();
  if (!indicator) {
    indicator = document.createElement('span');
    indicator.className = 'selection-indicator';
    indicator.setAttribute('aria-hidden', 'true');
    group.prepend(indicator);
  }
  selectionAnimations.get(group)?.cancel();
  group.classList.add('has-selection-indicator');
  Object.assign(indicator.style, {
    left: `${selected.offsetLeft}px`, top: `${selected.offsetTop}px`,
    width: `${selected.offsetWidth}px`, height: `${selected.offsetHeight}px`,
  });
  if (!animate || prefersReducedMotion() || !previous?.width) return;
  const next = indicator.getBoundingClientRect();
  const animation = indicator.animate([
    { transform: `translate3d(${previous.x - next.x}px, ${previous.y - next.y}px, 0) scale(${previous.width / next.width}, ${previous.height / next.height})` },
    { transform: 'translate3d(0, 0, 0) scale(1)' },
  ], { duration: 300, easing: 'cubic-bezier(0.32, 0.72, 0, 1)' });
  selectionAnimations.set(group, animation);
};
