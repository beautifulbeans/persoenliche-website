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
};

export const animateContentSwap = (
  candidates: Array<HTMLElement | null | undefined>,
  update: () => void,
  { duration = 210, offset = 6, stagger = 18 }: SwapOptions = {},
) => {
  const elements = candidates.filter((element): element is HTMLElement => Boolean(element));
  update();

  if (reducedMotion.matches) return;

  elements.forEach((element, index) => {
    runningSwaps.get(element)?.cancel();

    const animation = element.animate(
      [
        {
          opacity: 0.18,
          transform: `translate3d(0, ${offset}px, 0)`,
          filter: "blur(2px)",
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
