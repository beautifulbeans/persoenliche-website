import type { Game } from './core';
import { prefersReducedMotion } from '../../scripts/motion';
type Position = { zone: string; rect: DOMRect };
export type Positions = Map<string, Position>;
export function positions(game: Game): Positions {
  const result: Positions = new Map();
  const stock = document.querySelector('.cg-stock-stack')?.getBoundingClientRect() ?? document.querySelector('.cg-board')!.getBoundingClientRect();
  game.stock.forEach(c => result.set(c.id,{zone:'stock',rect:stock}));
  game.players.forEach((p,i) => {
    const seat = document.querySelector(i ? `[data-seat="${i-1}"] .cg-backs` : '[data-hand]')!.getBoundingClientRect();
    p.hand.forEach(c => result.set(c.id,{zone:`hand-${i}`,rect:i ? seat : document.querySelector(`[data-hand] [data-card-id="${c.id}"]`)?.getBoundingClientRect() ?? seat}));
  });
  document.querySelectorAll<HTMLElement>('.cg-table-cards [data-card-id]').forEach(c => result.set(c.dataset.cardId!,{zone:'board',rect:c.getBoundingClientRect()}));
  game.discard.forEach(c => { if (!result.has(c.id)) result.set(c.id,{zone:'discard',rect:stock}); });
  return result;
}
export function animateCards(game: Game, before?: Positions) {
  if (prefersReducedMotion()) return;
  const after = positions(game);
  const origin = document.querySelector('.cg-stock-stack')?.getBoundingClientRect() ?? document.querySelector('.cg-board')!.getBoundingClientRect();
  const animatedSeats = new Set<string>(); let delay = 0;
  after.forEach((next,id) => {
    const old = before?.get(id) ?? {zone:'stock',rect:origin};
    if (next.zone === old.zone || !['board','hand-0','hand-1','hand-2','hand-3'].includes(next.zone)) return;
    if (next.zone.startsWith('hand-') && next.zone !== 'hand-0') {
      if (animatedSeats.has(next.zone)) return; animatedSeats.add(next.zone);
    }
    const visible = next.zone === 'board' || next.zone === 'hand-0';
    const target = visible ? document.querySelector<HTMLElement>(`${next.zone === 'board' ? '.cg-table-cards' : '[data-hand]'} [data-card-id="${id}"]`) : null;
    const ghost = target?.cloneNode(true) as HTMLElement | undefined ?? document.createElement('span');
    ghost.className = `cg-flight ${visible ? 'cg-card' + (target?.classList.contains('is-red') ? ' is-red' : '') : 'cg-back'}`;
    ghost.dataset.from = old.zone; ghost.dataset.to = next.zone; ghost.removeAttribute('data-card-id'); ghost.setAttribute('aria-hidden','true'); ghost.removeAttribute('aria-label'); ghost.removeAttribute('tabindex');
    const w = visible ? next.rect.width : 30; const h = visible ? next.rect.height : 43;
    ghost.style.cssText = `position:fixed;left:${next.rect.x + next.rect.width/2 - w/2}px;top:${next.rect.y + next.rect.height/2 - h/2}px;width:${w}px;height:${h}px;z-index:1000;margin:0;pointer-events:none;`;
    document.body.append(ghost);
    const dx = old.rect.x + old.rect.width/2 - next.rect.x - next.rect.width/2;
    const dy = old.rect.y + old.rect.height/2 - next.rect.y - next.rect.height/2;
    if (target) target.style.visibility = 'hidden';
    const animation = ghost.animate([{transform:`translate(${dx}px,${dy}px) scale(.72) rotate(-8deg)`,opacity:.75},{transform:'translate(0,0) scale(1) rotate(0deg)',opacity:1}],{duration:560,delay:before ? 0 : delay,easing:'cubic-bezier(.23,1,.32,1)',fill:'both'});
    let cleared = false;
    const release = () => {
      if (cleared) return;
      cleared = true;
      ghost.remove();
      if (target) target.style.visibility = '';
      animation.cancel();
    };
    // A suspended Web Animation must never leave the real hand card invisible.
    window.setTimeout(release, 760 + (before ? 0 : delay));
    delay += 70;
    animation.finished.catch(() => {}).finally(release);
  });
}
