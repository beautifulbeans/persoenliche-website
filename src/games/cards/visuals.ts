import { type Card, rankName, symbols } from './core';

// A single viewBox scales the indices, pips and court artwork together, including trump cards.
export function cardFace(card: Card): string {
  const symbol = symbols[card.suit];
  const rank = rankName(card.rank);
  const corner = `<text data-card-rank x="10" y="20" font-size="17" font-weight="700">${rank}</text><text x="12" y="35" font-size="17">${symbol}</text>`;
  let center = '';
  if (card.rank > 10 && card.rank < 14) {
    const crown = card.rank === 13 ? 'M35 42L31 30L42 35L50 27L58 35L69 30L65 42Z' : card.rank === 12 ? 'M36 42L34 33L44 36L50 29L56 36L66 33L64 42Z' : 'M34 42Q43 29 60 34L68 42Z';
    const portrait = `<path d="${crown}" fill="currentColor"/><path d="M40 45V50Q40 61 50 63Q60 61 60 50V45 M33 71Q35 63 44 62L50 69L56 62Q65 63 67 71" fill="none" stroke="currentColor" stroke-width="2"/><path d="M43 49h3m8 0h3m-7 3v4h-3m0 3h6" stroke="currentColor" fill="none"/>`;
    center = `<rect x="27" y="28" width="46" height="88" rx="3" fill="none" stroke="currentColor" opacity=".3"/><g>${portrait}</g><g transform="rotate(180 50 72)">${portrait}</g><path d="M29 72h42" stroke="currentColor" stroke-width="4"/><text x="50" y="78" text-anchor="middle" font-size="19" stroke="#fff9e9" stroke-width="2" paint-order="stroke">${symbol}</text>`;
  } else {
    const n = card.rank === 14 ? 1 : card.rank;
    const positions: Record<number, number[][]> = {
      1:[[50,74]],2:[[50,43],[50,103]],3:[[50,43],[50,73],[50,103]],4:[[34,43],[66,43],[34,103],[66,103]],
      5:[[34,43],[66,43],[50,73],[34,103],[66,103]],6:[[34,43],[66,43],[34,73],[66,73],[34,103],[66,103]],
      7:[[34,43],[66,43],[50,58],[34,73],[66,73],[34,103],[66,103]],8:[[34,43],[66,43],[50,58],[34,73],[66,73],[50,88],[34,103],[66,103]],
      9:[[34,40],[66,40],[34,62],[66,62],[50,73],[34,84],[66,84],[34,106],[66,106]],
      10:[[34,40],[66,40],[50,51],[34,62],[66,62],[34,84],[66,84],[50,95],[34,106],[66,106]]
    };
    center = positions[n]!.map(([x,y]) => `<text x="${x}" y="${y}" dominant-baseline="central" text-anchor="middle" font-size="${n === 1 ? 43 : 23}"${y! > 74 ? ` transform="rotate(180 ${x} ${y})"` : ''}>${symbol}</text>`).join('');
  }
  return `<svg class="cg-card-face" viewBox="0 0 100 144" aria-hidden="true" focusable="false" fill="currentColor" font-family="Arial, sans-serif">${center}${corner}<g transform="rotate(180 50 72)">${corner}</g></svg>`;
}

export function chipStack(amount: number, label: string): HTMLElement {
  const stack = document.createElement('span'); stack.className = 'cg-chips'; stack.dataset.label=label;
  stack.setAttribute('aria-label', `${label}: ${amount} Chips`);
  const stacks = document.createElement('span'); stacks.className = 'cg-chip-piles'; stacks.setAttribute('aria-hidden','true');
  let remainder = amount;
  for (const [value, color] of [[100,'blue'],[25,'green'],[5,'red'],[1,'cream']] as const) {
    const count = Math.floor(remainder / value); remainder %= value;
    if (!count) continue;
    const pile = document.createElement('span'); pile.className = `cg-chip-pile is-${color}`;
    pile.style.setProperty('--count', String(Math.min(count, 6)));
    for (let i=0; i<Math.min(count,6); i++) { const chip = document.createElement('i'); chip.style.setProperty('--i',String(i)); chip.innerHTML=`<svg viewBox="0 0 64 64" preserveAspectRatio="none" aria-hidden="true"><circle cx="32" cy="32" r="29" fill="currentColor" stroke="#14251d" stroke-width="2"/><circle cx="32" cy="32" r="25" fill="none" stroke="#f6e9cd" stroke-width="7" stroke-dasharray="8 11.63"/><circle cx="32" cy="32" r="18" fill="none" stroke="#ffffff88" stroke-width="1.5"/><text x="32" y="37" fill="#fff4dd" text-anchor="middle" font-family="Arial,sans-serif" font-size="15" font-weight="700">${value}</text></svg>`; pile.append(chip); }
    stacks.append(pile);
  }
  const value = document.createElement('b'); const caption=document.createElement('small');caption.textContent=label === 'Du' ? 'Deine Chips' : label;const total=document.createElement('span');total.textContent=String(amount);value.append(caption,total);
  stack.append(stacks,value); return stack;
}
