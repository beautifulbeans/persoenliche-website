import { prefersReducedMotion, syncSelectionIndicator } from './motion';

// Preserve native details semantics while allowing a second click to reverse motion.
const disclosures = document.querySelectorAll<HTMLDetailsElement>(
  '[data-fluid-details], .tea-tip, .training-insight',
);
disclosures.forEach((details) => {
  const summary = details.querySelector('summary');
  let animation: Animation | undefined;
  let targetOpen = details.open;
  summary?.addEventListener('click', (event) => {
    if (prefersReducedMotion() || event.detail === 0) {
      animation?.cancel();
      animation = undefined;
      details.style.overflow = '';
      return;
    }
    event.preventDefault();
    const from = details.getBoundingClientRect().height;
    targetOpen = animation ? !targetOpen : !details.open;
    animation?.cancel();
    details.open = true;
    const to = targetOpen ? details.getBoundingClientRect().height : summary.getBoundingClientRect().height;
    details.style.overflow = 'hidden';
    const current = details.animate(
      [{ height: `${from}px` }, { height: `${to}px` }],
      { duration: targetOpen ? 300 : 220, easing: 'cubic-bezier(0.32, 0.72, 0, 1)' },
    );
    animation = current;
    void current.finished.then(() => {
      if (animation !== current) return;
      details.open = targetOpen;
      details.style.overflow = '';
      animation = undefined;
    }).catch(() => undefined);
  });
});

const groups = document.querySelectorAll<HTMLElement>(
  '[data-sliding-selection], .tea-fact-switch, .card-game-switch, .training-insight .fact-switch',
);
const resize = new ResizeObserver((entries) => {
  entries.forEach(({ target }) => syncSelectionIndicator(target as HTMLElement, false));
});
groups.forEach((group) => {
  group.dataset.slidingSelection = '';
  syncSelectionIndicator(group, false);
  resize.observe(group);
});

// One interruptible press/release gesture for navigation, switches, dialogs and game actions.
// Scale is independent of the element's transform, so flips, drags and image motion stay intact.
const presses = new Map<number, HTMLElement>();
const pressureMotion = new WeakMap<HTMLElement, Animation>();
const pressTarget = (target: EventTarget | null) => target instanceof Element
  ? target.closest<HTMLElement>('button:not(:disabled), summary, a[href]') : null;
function pressure(node: HTMLElement, pressed: boolean) {
  const current = getComputedStyle(node).scale;
  pressureMotion.get(node)?.cancel();
  if (prefersReducedMotion()) return;
  const motion = node.animate(
    [{ scale: current === 'none' ? '1' : current }, { scale: pressed ? '0.965' : '1' }],
    { duration: pressed ? 90 : 280, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: pressed ? 'forwards' : 'none' },
  );
  pressureMotion.set(node, motion);
  if (!pressed) void motion.finished.catch(() => undefined).finally(() => {
    if (pressureMotion.get(node) === motion) pressureMotion.delete(node);
  });
}
document.addEventListener('pointerdown', event => {
  if (event.button !== 0 || !event.isPrimary) return;
  const node = pressTarget(event.target);
  if (!node || node.matches('.cg-card, .playing-card, .teapot, .vinyl-button, .tt-joystick') || node.closest('[data-joystick]')) return;
  // Inline text links keep a stable reading baseline.
  if (getComputedStyle(node).display === 'inline') return;
  node.dataset.pressFeedback = '';
  presses.set(event.pointerId, node); pressure(node, true);
}, { passive: true });
const release = (event: PointerEvent) => {
  const node = presses.get(event.pointerId); if (node) { pressure(node, false); presses.delete(event.pointerId); }
};
document.addEventListener('pointerup', release, { passive: true });
document.addEventListener('pointercancel', release, { passive: true });
window.addEventListener('blur', () => { presses.forEach(node => pressure(node, false)); presses.clear(); });
