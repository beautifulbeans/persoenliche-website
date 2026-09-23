import { type Card, type Game, type Kind, type Move, cardName, symbols } from './core';
import { Durak, President, Nines } from './shedding';
import { Poker, bestFive, handLabel } from './poker';
import { rules } from './rules';
import { actionSpeech, renderSpeech, resetSpeech } from './speech';
import { cardFace, chipStack } from './visuals';
import { positions, animateCards } from './table-motion';
import { prefersReducedMotion, syncSelectionIndicator } from '../../scripts/motion';
const el = <T extends HTMLElement = HTMLElement>(name: string) => document.querySelector<T>(`[data-${name}]`)!;
const requested = new URLSearchParams(location.search).get('spiel');
let kind: Kind = requested && Object.hasOwn(rules, requested) ? requested as Kind : 'durak';
let game: Game;
let selected: string[] = [];
let handOrder: string[] = [];
let dragging = false;
let suppressClick = false;
let timer = 0;
let generation = 0;
let pendingKind: Kind = kind;
let savedFocus: HTMLElement | null = null;
const create = (next: Kind): Game => next === 'durak' ? new Durak() : next === 'arschloch' ? new President() : next === 'neunern' ? new Nines() : new Poker();
const cardElement = (card: Card, interactive = false) => {
  const node = document.createElement(interactive ? 'button' : 'span');
  node.className = `cg-card ${['hearts', 'diamonds'].includes(card.suit) ? 'is-red' : ''}`;
  node.dataset.cardId = card.id;
  node.setAttribute('aria-label', cardName(card));
  node.innerHTML = cardFace(card);
  return node;
};
const actionButton = (label: string, action: () => void, primary = false) => {
  const button = document.createElement('button'); button.textContent = label; button.className = primary ? 'cg-primary' : 'cg-secondary'; button.addEventListener('click', action); return button;
};
function start(next: Kind, continuation = false) {
  window.clearTimeout(timer); generation++; resetSpeech(); selected = []; handOrder = []; kind = next;
  if (continuation && game instanceof Poker && game.players.every(p => p.chips > 0)) game = new Poker(Math.random, 1 - game.dealer, game.players.map(p => p.chips));
  else if (continuation && game instanceof President) game = new President(Math.random, game.ranking);
  else if (continuation && game instanceof Nines) game = new Nines(Math.random, game.scores);
  else game = create(kind);
  history.replaceState(null, '', `/kartenspiele/?spiel=${kind}`);
  el('game-title').textContent = rules[kind].name; el('game-subtitle').textContent = rules[kind].subtitle;
  document.querySelectorAll<HTMLButtonElement>('[data-game-kind]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.gameKind === kind)));
  const tabs = document.querySelector<HTMLElement>('.cg-game-tabs')!; tabs.dataset.slidingSelection = ''; syncSelectionIndicator(tabs);
  render(); animateCards(game); schedule();
}
function play(move: Move) {
  const focused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const keyboard = Boolean(focused?.matches(':focus-visible'));
  try { const balance = game.players[0]!.chips; const before = positions(game); const who=game.turn; const rank=game.players[who]!.hand.find(c=>c.id===move.cards?.[0])?.rank; const count=game.players[who]!.hand.length; game.play(move); if (move.type !== 'knock') selected = []; render(); if (game instanceof Poker && balance !== game.players[0]!.chips && !prefersReducedMotion()) el('player-meta').querySelector('.cg-chip-piles')?.animate([{transform:'translateY(-5px)',opacity:.6},{transform:'translateY(0)',opacity:1}],{duration:260,easing:'cubic-bezier(.22,.75,.22,1)'}); actionSpeech(game,move,who,rank,game.players[who]!.hand.length-count); animateCards(game, before); if (move.type === 'knock' && !prefersReducedMotion()) { const tap=document.createElement('span');tap.className='cg-knock-ripple';document.querySelector('.cg-table')!.append(tap);tap.addEventListener('animationend',()=>tap.remove(),{once:true}); } if (keyboard) el('message').focus({ preventScroll: true }); schedule(); }
  catch (error) { el('message').textContent = error instanceof Error ? error.message : 'Bitte einen gültigen Zug wählen.'; }
}
function schedule() {
  window.clearTimeout(timer);
  if (dragging || game.over || game.turn === 0 || document.hidden || rulesDialog.open || restartDialog.open || historyDialog.open) return;
  const run = generation;
  timer = window.setTimeout(() => {
    if (run !== generation || game.over || game.turn === 0 || rulesDialog.open || restartDialog.open || historyDialog.open) return;
    play(game.bot());
  }, prefersReducedMotion() ? 900 : 1100 + Math.random() * 600);
}
function presidentPrompt(president: President, legal: Move[]): string {
  if (president.exchangeLoser !== null) return 'Wähle eine Karte zum Zurückgeben';
  if (!president.top.length) return 'Lege eine Karte oder mehrere gleiche Werte';
  const hasResponse = legal.some(move => move.cards?.length);
  if (president.top.length === 1) return hasResponse ? 'Höhere Karte antippen' : 'Keine höhere Karte – passen';
  if (president.top.length === 2) return hasResponse ? 'Zwei gleiche höhere Karten antippen' : 'Kein höheres Paar auf der Hand – passen';
  if (president.top.length === 3) return hasResponse ? 'Drei gleiche höhere Karten antippen' : 'Kein höherer Drilling – passen';
  return hasResponse ? 'Vier gleiche höhere Karten antippen' : 'Kein höherer Vierling – passen';
}
function render() {
  el('message').tabIndex = -1;
  const ourTurn = game.turn === 0 && !game.over;
  const legal = ourTurn ? game.legal() : [];
  const playable = new Set(legal.flatMap(m => m.cards ?? []));
  const table = document.querySelector<HTMLElement>('.cg-table')!;
  table.classList.toggle('is-knockable', legal.some(m=>m.type==='knock'));
  el('message').textContent = game.over ? 'Runde beendet' : !ourTurn ? `${game.players[game.turn]!.name} überlegt …` : game instanceof Durak ? game.phase === 'defend' ? legal.some(move => move.type === 'transfer') ? 'Decken, schieben oder aufnehmen' : 'Decken oder aufnehmen' : game.board.length ? 'Nachlegen oder beenden' : 'Lege eine Karte' : game instanceof President ? presidentPrompt(game, legal) : game instanceof Nines ? game.missedKnock[0] ? 'Klopfen vergessen: erst Strafkarten ziehen' : game.knocked[0] ? 'Geklopft. Jetzt Karte ablegen.' : game.players[0]!.hand.length === 2 && legal.some(m=>m.type === 'knock') ? 'Vor der vorletzten Karte klopfen' : game.penalty ? `7 legen oder ${game.penalty} ziehen` : legal.some(m => m.cards) ? 'Gleiche Farbe oder gleicher Wert' : 'Ziehe eine Karte' : 'Wähle deinen Einsatz';
  el('game-info').replaceChildren();
  if (game instanceof Poker) el('game-info').append(chipStack(game.pot, 'Pot'));
  else if (game instanceof Nines) { el('game-info').textContent = `${symbols[game.activeSuit]}${game.penalty ? ` +${game.penalty}` : ''}`; }
  el('hand-count').textContent = `· ${game.players[0]!.hand.length}`;
  el('player-meta').replaceChildren();
  if (game instanceof Poker) el('player-meta').append(chipStack(game.players[0]!.chips,'Du'));
  el('hand-hint').textContent = 'Ziehen zum Sortieren · Karte antippen zum Auswählen';
  const opponents = el('opponents'); opponents.replaceChildren();
  game.players.slice(1).forEach((p, n) => {
    const seat = document.createElement('div'); seat.className = 'cg-seat'; seat.dataset.seat = String(n); opponents.dataset.players = String(game.players.length); seat.classList.toggle('is-turn', !game.over && game.turn === n + 1);
    seat.classList.toggle('is-winner', game.over && game.winners.includes(n + 1));
    seat.innerHTML = `<span class="cg-avatar" aria-hidden="true">${p.name[0]}</span><div><strong>${p.name}</strong><small>${game instanceof Poker ? (game.dealer === n + 1 ? 'Dealer' : '') : `${p.hand.length} Karten`}</small></div>`;
    const cards = document.createElement('div'); cards.className = 'cg-backs';
    if (game instanceof Poker && game.showdown) p.hand.forEach(c => cards.append(cardElement(c)));
    else { cards.setAttribute('aria-label', `${p.hand.length} verdeckte Karten`); for (let i = 0; i < Math.min(p.hand.length, 5); i++) { const back = document.createElement('span'); back.className = 'cg-back'; cards.append(back); } }
    seat.append(cards); if (game instanceof Poker) seat.append(chipStack(p.chips, '')); opponents.append(seat);
  });
  renderSpeech();
  const board = el('board');
  board.replaceChildren(); board.dataset.kind = kind;
  game.groups().forEach(group => {
    const section = document.createElement('div'); section.className = 'cg-table-group';
    const label = document.createElement('p'); label.textContent = group.label; section.append(label);
    const row = document.createElement('div'); row.className = 'cg-table-cards';
    if ((game instanceof President || game instanceof Nines) && group.cards.length) {
      const president = game instanceof President ? game : null;
      const isPresident = Boolean(president);
      row.classList.add('cg-card-pile', isPresident ? 'cg-play-pile' : 'cg-discard-pile');
      const currentStart = president ? group.cards.length - president.top.length : group.cards.length - 1;
      group.cards.forEach((card, index) => {
        const node = cardElement(card);
        const currentIndex = index - currentStart;
        const isCurrent = index >= currentStart;
        const currentCount = president ? president.top.length : 1;
        const x = isCurrent ? (currentIndex - (currentCount - 1) / 2) * (isPresident ? 19 : 0) : ((index % 5) - 2) * (isPresident ? 3.5 : 2.4);
        const y = isCurrent ? 0 : (index - currentStart) * (isPresident ? 2.2 : 2.8);
        node.style.setProperty('--pile-x', `${x}px`);
        node.style.setProperty('--pile-y', `${y}px`);
        node.style.setProperty('--pile-rotate', `${((index * 7) % (isPresident ? 11 : 7)) - (isPresident ? 5 : 3)}deg`);
        node.style.zIndex = String(index + 1);
        node.classList.toggle('is-current-play', isCurrent);
        row.append(node);
      });
      const pileSize = isPresident ? group.cards.length : game.discard.length + game.board.length;
      const count = document.createElement('span'); count.className = 'cg-pile-count'; count.textContent = String(pileSize); count.setAttribute('aria-label', `${pileSize} Karten auf dem Stapel`); row.append(count);
    } else group.cards.forEach(c => row.append(cardElement(c)));
    if (game instanceof Poker) { for (let i = group.cards.length; i < 5; i++) { const slot = document.createElement('span'); slot.className = 'cg-card-slot'; slot.textContent = '♠'; slot.setAttribute('aria-label', 'Noch verdeckte Gemeinschaftskarte'); row.append(slot); } }
    else if (!group.cards.length) { const slot = document.createElement('span'); slot.className = 'cg-card-slot'; slot.textContent = '↓'; slot.setAttribute('aria-label', 'Hier werden Karten abgelegt'); row.append(slot); }
    section.append(row); board.append(section);
  });
  const stock = el('stock'); stock.replaceChildren(); stock.hidden = !(game instanceof Durak || game instanceof Nines || game instanceof Poker);
  if (!stock.hidden) {
    const pile = document.createElement('button'); pile.className = 'cg-stock-stack'; pile.setAttribute('aria-label', `Nachziehstapel: ${game.stock.length} Karten`);
    pile.disabled = !(ourTurn && legal.some(m => m.type === 'draw'));
    for (let i=0; i<Math.min(5,game.stock.length); i++) { const back = document.createElement('span'); back.className='cg-back'; back.style.setProperty('--i',String(i)); pile.append(back); }
    pile.addEventListener('click', () => { const draw = game.legal().find(m => m.type === 'draw'); if (draw && game.turn === 0) play(draw); });
    const count = document.createElement('small'); count.textContent = String(game.stock.length); pile.append(count); stock.append(pile);
    if (game instanceof Durak) {
      const trump = document.createElement('div'); trump.className = 'cg-trump'; trump.setAttribute('aria-label',`Trumpf: ${symbols[game.trump.suit]}`);
      if (game.stock.some(c => c.id === (game as Durak).trump.id)) trump.append(cardElement(game.trump));
      else trump.textContent = symbols[game.trump.suit];
      const label=document.createElement('small'); label.textContent='Trumpf'; trump.append(label); stock.prepend(trump);
    }
  }
  const hand = el('hand'); hand.dataset.kind = kind; hand.replaceChildren();
  const current = game.players[0]!.hand;
  handOrder = handOrder.filter(id => current.some(c => c.id === id));
  current.forEach(c => { if (!handOrder.includes(c.id)) handOrder.push(c.id); });
  const sorted = handOrder.map(id => current.find(c => c.id === id)!);
  sorted.forEach(c => {
    const button = cardElement(c, true) as HTMLButtonElement;
    button.dataset.playable = String(ourTurn && !(game instanceof Poker) && playable.has(c.id));
    button.setAttribute('aria-disabled', String(button.dataset.playable !== 'true'));
    button.title = 'Ziehen zum Sortieren · Alt + Pfeiltasten verschiebt die Karte';
    enableSorting(button); 
    button.setAttribute('aria-pressed', String(selected.includes(c.id))); button.classList.toggle('is-playable', playable.has(c.id));
    button.addEventListener('click', () => {
      if (suppressClick || button.dataset.playable !== 'true') return;
      if (game instanceof President) selected = game.selectionFor(c.id, selected);
      else if (selected.includes(c.id)) selected = selected.filter(id => id !== c.id);
      else selected = [c.id];
      // Keep the hand DOM (and focus/scroll position) stable during selection.
      hand.querySelectorAll<HTMLButtonElement>('[data-card-id]').forEach(b => b.setAttribute('aria-pressed', String(selected.includes(b.dataset.cardId!))));
      renderActions();
    });
    hand.append(button);
  });
  layoutHand();
  const result = el('result'); result.hidden = !game.over; result.replaceChildren();
  if (!game.over) { delete result.dataset.outcome; delete table.dataset.outcome; }
  if (game.over) {
    const outcome = game.winners.includes(0) ? game.winners.length > 1 ? 'draw' : 'win' : 'loss';
    result.dataset.outcome = outcome; table.dataset.outcome = outcome;
    const emblem = document.createElement('span'); emblem.className = 'cg-result-emblem'; emblem.setAttribute('aria-hidden','true');
    emblem.innerHTML = `<i class="ph ${outcome === 'win' ? 'ph-trophy' : outcome === 'loss' ? 'ph-handshake' : 'ph-scales'}"></i>`;
    result.append(emblem);
    const kicker = document.createElement('p'); kicker.className = 'cg-result-kicker'; kicker.textContent = outcome === 'win' ? 'Dein Sieg' : outcome === 'loss' ? 'Gute Runde' : 'Punkteteilung'; result.append(kicker);
    const title = document.createElement('h2');
    title.textContent = game.winners.length > 1 ? 'Geteilter Sieg' : `${game.players[game.winners[0]!]!.name} gewinnt`;
    result.append(title);
    const mood = document.createElement('p'); mood.className = 'cg-result-mood'; mood.textContent = outcome === 'win' ? 'Sauber gespielt.' : outcome === 'loss' ? 'Die nächste Runde wartet schon.' : 'Dieses Mal auf Augenhöhe.'; result.append(mood);
    if (outcome === 'win' && !prefersReducedMotion()) {
      const celebration = document.createElement('span'); celebration.className = 'cg-celebration'; celebration.setAttribute('aria-hidden','true');
      for (let index = 0; index < 12; index++) { const piece = document.createElement('i'); piece.style.setProperty('--i', String(index)); celebration.append(piece); }
      result.append(celebration);
    }
    if (game instanceof Poker) {
      const meta = document.createElement('p'); meta.className = 'cg-result-meta';
      meta.textContent = game.showdown ? `Showdown · Pot ${game.lastPot}` : `Ohne Showdown · Pot ${game.lastPot}`;
      result.append(meta);
      if (game.showdown) {
        const summary = document.createElement('div'); summary.className = 'cg-showdown-summary';
        game.players.forEach((player, index) => {
          const cards = bestFive([...player.hand, ...game.board]);
          const row = document.createElement('div'); row.className = 'cg-showdown-player'; row.classList.toggle('is-winner', game.winners.includes(index));
          const copy = document.createElement('div'); copy.innerHTML = `<strong>${game.winners.includes(index) ? 'Gewinner · ' : ''}${player.name}</strong><span>${handLabel(cards)}</span>`;
          const hand = document.createElement('div'); hand.className = 'cg-showdown-hand'; cards.forEach(card => hand.append(cardElement(card)));
          row.append(copy, hand); summary.append(row);
        });
        result.append(summary);
      } else {
        const note = document.createElement('p'); note.textContent = `${game.players[1 - game.winners[0]!]!.name} ist ausgestiegen.`; result.append(note);
      }
    }
    if (game instanceof President) { const ranks = document.createElement('p'); ranks.textContent = game.ranking.map((i, n) => `${n + 1}. ${game.players[i]!.name}`).join(' · '); result.append(ranks); }
    if (game instanceof Nines) {
      const points=document.createElement('div');points.className='cg-round-points';
      const heading=document.createElement('p');heading.textContent=game.doubled ? 'Mit einer 9 beendet · doppelte Minuspunkte' : 'Minuspunkte dieser Runde';points.append(heading);
      game.players.forEach((p,i)=>{const row=document.createElement('p');row.textContent=`${p.name}: −${(game as Nines).roundPoints[i]} · Gesamt −${(game as Nines).scores[i]}`;points.append(row);});result.append(points);
    }
    result.append(actionButton(game instanceof Poker && game.players.some(p => !p.chips) ? 'Neues Match' : 'Nächste Runde', () => start(kind, true), true));
  }
  renderActions();
  el('history').replaceChildren(...game.history.slice().reverse().map(text => { const li = document.createElement('li'); li.textContent = text; return li; }));
}

function renderActions() {
  const actions = el('actions'); actions.dataset.kind = kind; actions.replaceChildren();
  if (game.over || game.turn !== 0) return;
  const legal = game.legal();
  const selectedMoves = legal.filter(m => m.cards?.length === selected.length && selected.length && m.cards.every(id => selected.includes(id)));
  const suitMoves = legal.filter(m => m.suit && m.cards?.[0] === selected[0]);
  if (suitMoves.length) {
    const chooser = document.createElement('div'); chooser.className = 'cg-suit-choice'; chooser.setAttribute('aria-label','Farbe wählen');
    suitMoves.forEach(m => { const b = actionButton(symbols[m.suit!], () => play(m)); b.setAttribute('aria-label', `${m.label} wählen`); b.classList.toggle('is-red', m.suit === 'hearts' || m.suit === 'diamonds'); chooser.append(b); }); actions.append(chooser);
  } else if (legal.some(m => m.cards?.length) && selected.length) {
    if (selectedMoves.length > 1) selectedMoves.forEach((move,index) => actions.append(actionButton(move.label, () => play(move), index === 0)));
    else {
      const move = selectedMoves[0];
      const button = actionButton(move?.label ?? 'Diese Auswahl passt nicht', () => { if (move) play(move); }, true);
      button.disabled = !move; actions.append(button);
    }
  }
  legal.filter(m => !m.cards && m.type !== 'raise').forEach(m => actions.append(actionButton(game instanceof Poker && m.type === 'fold' ? 'Aussteigen' : m.label, () => play(m), m.type === 'call' || m.type === 'check' || m.type === 'knock')));
  if (game instanceof Poker) {
    const poker = game; const bounds = poker.raiseBounds();
    if (bounds.available) {
      const toggle = actionButton('Erhöhen', () => {
        const panel = el('raise-panel'); panel.hidden = !panel.hidden; toggle.setAttribute('aria-expanded', String(!panel.hidden)); toggle.textContent = panel.hidden ? 'Erhöhen' : 'Abbrechen'; if (!panel.hidden) panel.querySelector('input')?.focus();
      }); toggle.setAttribute('aria-expanded','false'); actions.append(toggle);
      const panel = document.createElement('div'); panel.className = 'cg-raise-panel'; panel.dataset.raisePanel=''; panel.hidden = true; panel.setAttribute('role','group'); panel.setAttribute('aria-label','Einsatz erhöhen');
      panel.addEventListener('keydown', e => { if (e.key === 'Escape') { panel.hidden=true; toggle.setAttribute('aria-expanded','false'); toggle.textContent='Erhöhen'; toggle.focus(); } });
      const input = document.createElement('input'); input.type='range'; input.min=String(bounds.min); input.max=String(bounds.max); input.step='1'; input.value=String(bounds.min); input.setAttribute('aria-label','Gesamteinsatz wählen');
      const amount = document.createElement('output');
      const confirm = actionButton('', () => play({type:'raise',amount:Number(input.value),label:'Erhöhen'}),true);
      const update = () => { amount.textContent = `${input.value} Chips gesamt`; confirm.textContent = `Setzen · ${input.value}`; };
      input.addEventListener('input',update);
      const presets = document.createElement('div'); presets.className='cg-raise-presets';
      for (const [label,value] of [['Min',bounds.min],['½ Pot',Math.max(...poker.bets)+Math.floor((poker.pot+poker.price)/2)],['Pot',Math.max(...poker.bets)+poker.pot+poker.price],['All-in',bounds.max]] as const) presets.append(actionButton(label, () => { input.value=String(Math.max(bounds.min,Math.min(bounds.max,value))); update(); }));
      panel.append(amount,input,presets,confirm); actions.append(panel); update();
    }
  }
}
function reorder(card: HTMLElement, index: number) {
  const hand=el('hand'); const others=[...hand.querySelectorAll<HTMLElement>('.cg-card')].filter(c=>c!==card);
  hand.insertBefore(card,others[Math.max(0,index)] ?? null);
  handOrder=[...hand.querySelectorAll<HTMLElement>('.cg-card')].map(c=>c.dataset.cardId!); layoutHand();
}
function enableSorting(card: HTMLButtonElement) {
  let startX=0,startY=0,active=false;
  card.addEventListener('keydown', e => {
    if (!e.altKey || !['ArrowLeft','ArrowRight'].includes(e.key)) return;
    e.preventDefault(); reorder(card,handOrder.indexOf(card.dataset.cardId!) + (e.key === 'ArrowLeft' ? -1 : 1)); card.focus({preventScroll:true});
  });
  card.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    startX=e.clientX; startY=e.clientY; active=false; card.setPointerCapture(e.pointerId); window.clearTimeout(timer);
  });
  card.addEventListener('pointermove', e => {
    if (!card.hasPointerCapture(e.pointerId)) return;
    const dx=e.clientX-startX,dy=e.clientY-startY;
    if (!active && Math.hypot(dx,dy)<7) return;
    active=true; dragging=true; card.classList.add('is-dragging'); card.style.translate=`${dx}px ${dy}px`;
  });
  const finish = (e: PointerEvent) => {
    if (!card.hasPointerCapture(e.pointerId)) return;
    card.releasePointerCapture(e.pointerId);
    if (active && e.type !== 'pointercancel') {
      const others=[...el('hand').querySelectorAll<HTMLElement>('.cg-card')].filter(c=>c!==card);
      const closest=others.map((c,i)=>{const r=c.getBoundingClientRect();return {i,r,d:Math.hypot(e.clientX-(r.x+r.width/2),e.clientY-(r.y+r.height/2))};}).sort((a,b)=>a.d-b.d)[0];
      if (closest) reorder(card,closest.i+(e.clientX>closest.r.x+closest.r.width/2?1:0));
      suppressClick=true; window.setTimeout(()=>{suppressClick=false;},0);
    }
    card.classList.remove('is-dragging'); card.style.translate=''; dragging=false; active=false; schedule();
  };
  card.addEventListener('pointerup',finish); card.addEventListener('pointercancel',finish);
}
function layoutHand() {
  const hand = el('hand');
  const cards = [...hand.querySelectorAll<HTMLElement>('.cg-card')];
  if (!cards.length) return;
  const width = hand.clientWidth;
  const cardWidth = cards[0]!.offsetWidth;
  const capacity = Math.max(5, Math.floor((width - cardWidth) / 23) + 1);
  const rows = Math.ceil(cards.length / capacity);
  hand.style.setProperty('--rows', String(rows));
  hand.dataset.dense = String(rows > 2);
  const rowStep = rows > 2 ? 30 : innerHeight < 741 && innerWidth < 701 ? 40 : 48;
  hand.style.setProperty('--row-step', `${rowStep}px`);
  const perRow = Math.ceil(cards.length / rows);
  cards.forEach((card, i) => {
    const row = Math.floor(i / perRow);
    const count = Math.min(perRow, cards.length - row * perRow);
    const index = i % perRow;
    const step = Math.min(cardWidth * .72, (width - cardWidth - 40) / Math.max(1, count - 1));
    const center = index - (count - 1) / 2;
    const angle = count > 1 ? center * Math.min(3, 18 / count) : 0;
    card.style.setProperty('--x', `${center * step}px`);
    card.style.setProperty('--y', `${row * rowStep + Math.abs(center) * Math.min(3, 15 / count)}px`);
    card.style.setProperty('--angle', `${angle}deg`);
    card.style.zIndex = String(i + 1);
  });
}
new ResizeObserver(layoutHand).observe(el('hand'));
const historyDialog = el<HTMLDialogElement>('history-dialog');
el('history-open').addEventListener('click', () => { savedFocus = document.activeElement as HTMLElement; historyDialog.showModal(); });
el('history-close').addEventListener('click', () => historyDialog.close());
const restartDialog = el<HTMLDialogElement>('restart-dialog');
const rulesDialog = el<HTMLDialogElement>('rules-dialog');
function requestStart(next: Kind) {
  if (game.over) { start(next); return; }
  pendingKind = next; savedFocus = document.activeElement as HTMLElement; restartDialog.showModal();
}
el('new-game').addEventListener('click', () => requestStart(kind));
document.querySelectorAll<HTMLButtonElement>('[data-game-kind]').forEach(b => b.addEventListener('click', () => { if (b.dataset.gameKind !== kind) requestStart(b.dataset.gameKind as Kind); }));
el('restart-cancel').addEventListener('click', () => restartDialog.close());
el('restart-confirm').addEventListener('click', () => { restartDialog.close(); start(pendingKind); });
el('rules-open').addEventListener('click', () => {
  savedFocus = document.activeElement as HTMLElement; el('rules-title').textContent = rules[kind].name;
  const body = el('rules-body'); body.replaceChildren();
  const goal = document.createElement('p'); goal.className = 'cg-rules-goal'; goal.textContent=rules[kind].goal; body.append(goal);
  rules[kind].sections.forEach((section,i) => {
    const details = document.createElement('details'); details.open = i === 0;
    const heading = document.createElement('summary'); heading.textContent=section.title;
    const list = document.createElement('ul'); section.items.forEach(text => { const li=document.createElement('li'); li.textContent=text; list.append(li); });
    details.append(heading,list); body.append(details);
  });
  if (rules[kind].source) { const link = document.createElement('a'); link.href=rules[kind].source!; link.target='_blank'; link.rel='noopener'; link.textContent='Ausführliche Regelgrundlage ↗'; body.append(link); }
  rulesDialog.showModal();
});
el('dialog-close').addEventListener('click', () => rulesDialog.close());
for (const dialog of [restartDialog, rulesDialog, historyDialog]) {
  dialog.addEventListener('close', () => { savedFocus?.focus({ preventScroll: true }); schedule(); });
  dialog.addEventListener('click', e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); } });
}
document.querySelector('.cg-table')!.addEventListener('click', e => {
  if (!(game instanceof Nines) || game.turn !== 0 || (e.target as HTMLElement).closest('button,a,.cg-card')) return;
  const knock=game.legal().find(m=>m.type==='knock'); if (knock) play(knock);
});
document.addEventListener('visibilitychange', () => { if (document.hidden) window.clearTimeout(timer); else schedule(); });
start(kind);
