import { Game, deck, shuffle, strength, cardName, suitNames, suits, type Card, type Move, type TableGroup } from './core';

export class Durak extends Game {
  kind = 'durak' as const;
  trump: Card;
  attacker = 0;
  phase: 'attack' | 'defend' = 'attack';
  taking = false;
  limit = 6;
  pairs: { attack: Card; defense?: Card }[] = [];
  constructor(random = Math.random) {
    super(2, random); this.stock = shuffle(deck(6), random);
    this.trump = this.stock[0]!;
    for (let n = 0; n < 6; n++) for (const p of this.players) p.hand.push(this.stock.pop()!);
    const low = this.players.map(p => Math.min(...p.hand.filter(c => c.suit === this.trump.suit).map(c => c.rank)));
    this.attacker = low[1]! < low[0]! ? 1 : 0; this.turn = this.attacker;
    this.log(`${this.players[this.turn]!.name} greift an. ${suitNames[this.trump.suit]} ist Trumpf.`);
  }
  beats(card: Card, attack: Card) { return (card.suit === attack.suit && card.rank > attack.rank) || (card.suit === this.trump.suit && attack.suit !== this.trump.suit); }
  legal(): Move[] {
    if (this.over) return [];
    const hand = this.players[this.turn]!.hand;
    if (this.phase === 'defend') {
      const attack = this.pairs.find(p => !p.defense)!.attack;
      const nextDefender = this.attacker;
      const canTransfer = this.pairs.every(pair => !pair.defense && pair.attack.rank === attack.rank)
        && this.pairs.length < Math.min(6, this.players[nextDefender]!.hand.length);
      const transfers = canTransfer
        ? hand.filter(card => card.rank === attack.rank).map(card => ({ type: 'transfer', cards: [card.id], label: 'Angriff schieben' }))
        : [];
      return [
        ...hand.filter(c => this.beats(c, attack)).map(c => ({ type: 'defend', cards: [c.id], label: 'Decken' })),
        ...transfers,
        { type: 'take', label: 'Aufnehmen' },
      ];
    }
    const ranks = new Set(this.board.map(c => c.rank));
    const attacks = this.pairs.length < this.limit ? hand.filter(c => !this.board.length || ranks.has(c.rank)).map(c => ({ type: 'attack', cards: [c.id], label: this.board.length ? 'Nachwerfen' : 'Angreifen' })) : [];
    return [...attacks, ...(this.board.length ? [{ type: 'done', label: this.taking ? 'Aufnehmen lassen' : 'Angriff beenden' }] : [])];
  }
  apply(move: Move) {
    const who = this.turn;
    if (move.type === 'attack') {
      const card = this.take(who, move.cards!)[0]!; this.board.push(card); this.pairs.push({ attack: card });
      if (!this.taking) { this.phase = 'defend'; this.turn = 1 - this.attacker; }
      this.log(`${this.players[who]!.name} legt ${cardName(card)}.`);
    } else if (move.type === 'defend') {
      const card = this.take(who, move.cards!)[0]!; this.board.push(card); this.pairs.find(p => !p.defense)!.defense = card;
      if (this.pairs.some(pair => !pair.defense)) { this.phase = 'defend'; this.turn = who; }
      else { this.phase = 'attack'; this.turn = this.attacker; }
      this.log(`${this.players[who]!.name} deckt mit ${cardName(card)}.`);
    } else if (move.type === 'transfer') {
      const card = this.take(who, move.cards!)[0]!;
      const previousAttacker = this.attacker;
      this.board.push(card); this.pairs.push({ attack: card });
      this.attacker = who; this.turn = previousAttacker; this.phase = 'defend';
      this.limit = Math.min(6, this.players[previousAttacker]!.hand.length);
      this.log(`${this.players[who]!.name} schiebt den Angriff mit ${cardName(card)} weiter.`);
    } else if (move.type === 'take') {
      this.taking = true; this.phase = 'attack'; this.turn = this.attacker;
      this.log(`${this.players[who]!.name} nimmt auf. Passende Werte dürfen noch nachgeworfen werden.`);
    } else {
      const defender = 1 - this.attacker;
      if (this.taking) this.players[defender]!.hand.push(...this.board); else this.discard.push(...this.board);
      this.board = []; this.pairs = [];
      for (const index of [this.attacker, defender]) while (this.stock.length && this.players[index]!.hand.length < 6) this.players[index]!.hand.push(this.stock.pop()!);
      if (!this.stock.length) {
        const empty = [0, 1].filter(i => !this.players[i]!.hand.length);
        if (empty.length) { this.finish(empty); this.log(empty.length === 2 ? 'Unentschieden. Beide Hände sind leer.' : `${this.players[empty[0]!]!.name} gewinnt. Die letzte Karte ist weg.`); return; }
      }
      if (!this.taking) this.attacker = defender;
      this.taking = false; this.phase = 'attack'; this.turn = this.attacker;
      this.limit = Math.min(6, this.players[1 - this.attacker]!.hand.length);
      this.log(`${this.players[this.turn]!.name} beginnt den nächsten Angriff.`);
    }
  }
  bot(): Move {
    const hand = this.players[this.turn]!.hand;
    return this.choose(this.legal().map(move => {
      const c = hand.find(c => c.id === move.cards?.[0]);
      let score = move.type === 'done' ? -2 : move.type === 'take' ? -5 : 0;
      if (c) {
        const cost = c.rank + (c.suit === this.trump.suit ? 12 : 0);
        score = 15 - cost * 0.6 + hand.filter(other => other.rank === c.rank).length;
        if (move.type === 'defend') score += 4;
        if (move.type === 'transfer') score += 7;
        if (this.stock.length === 0) score += 9;
        if (this.taking) score += 12;
      }
      return { move, score };
    }));
  }
  groups(): TableGroup[] { if (!this.pairs.length) return [{ label: 'Angriff', cards: [] }]; return this.pairs.map((p, i) => ({ label: `Angriff ${i + 1}`, cards: [p.attack, ...p.defense ? [p.defense] : []] })); }
  info() { return `${this.stock.length} im Stapel · Trumpf ${suitNames[this.trump.suit]} · ${this.phase === 'defend' ? 'Verteidigen oder aufnehmen' : this.taking ? 'Nachwerfen oder abschließen' : 'Angreifen oder Angriff beenden'}`; }
}

const combos = (cards: Card[], size: number): Card[][] => size === 0 ? [[]] : cards.flatMap((c, i) => combos(cards.slice(i + 1), size - 1).map(tail => [c, ...tail]));
export class President extends Game {
  kind = 'arschloch' as const;
  top: Card[] = [];
  last = 0;
  passed = new Set<number>();
  ranking: number[] = [];
  exchangeLoser: number | null = null;
  constructor(random = Math.random, ranking?: number[]) {
    super(4, random); const cards = shuffle(deck(), random);
    cards.forEach((card, i) => this.players[i % 4]!.hand.push(card));
    if (ranking?.length === 4) {
      this.turn = ranking[0]!; this.exchangeLoser = ranking[3]!;
      const highest = [...this.players[this.exchangeLoser]!.hand].sort((a, b) => strength(b) - strength(a))[0]!;
      this.players[this.turn]!.hand.push(...this.take(this.exchangeLoser, [highest.id]));
      this.log(`${this.players[this.turn]!.name} erhält die höchste Karte und gibt eine Karte zurück.`);
    } else this.log('Du eröffnest. Einzelkarte oder gleichrangige Gruppe auswählen.');
  }
  next(from: number) { for (let i = 1; i <= 4; i++) { const n = (from + i) % 4; if (this.players[n]!.hand.length) return n; } return from; }
  legal(): Move[] {
    if (this.over) return [];
    const hand = this.players[this.turn]!.hand;
    if (this.exchangeLoser !== null) return hand.map(c => ({ type: 'exchange', cards: [c.id], label: 'Karte zurückgeben' }));
    const ranks = [...new Set(hand.map(c => c.rank))];
    const moves: Move[] = [];
    for (const rank of ranks) {
      if (this.top.length && strength({ rank } as Card) <= strength(this.top[0]!)) continue;
      const group = hand.filter(c => c.rank === rank);
      for (const count of this.top.length ? [this.top.length] : [1, 2, 3, 4]) {
        if (count <= group.length) for (const cards of combos(group, count)) moves.push({ type: 'play', cards: cards.map(c => c.id), label: 'Ausspielen' });
      }
    }
    if (this.top.length) moves.push({ type: 'pass', label: 'Passen' });
    return moves;
  }
  selectionFor(cardId: string, selected: string[]): string[] {
    const card = this.players[this.turn]!.hand.find(c => c.id === cardId);
    if (!card) return selected;
    if (selected.includes(cardId)) return [];
    if (this.exchangeLoser !== null) return [cardId];
    if (this.top.length) {
      // A response must have exactly as many equal cards as the current play.
      // Selecting one valid card selects the complete legal group so overlapping
      // hand cards can never make a pair/triple response frustrating to enter.
      return this.legal().find(move => move.cards?.includes(cardId))?.cards ?? [];
    }
    const existing = this.players[this.turn]!.hand.find(c => c.id === selected[0]);
    return existing?.rank === card.rank ? [...selected, cardId] : [cardId];
  }
  apply(move: Move) {
    const who = this.turn;
    if (move.type === 'exchange') {
      this.players[this.exchangeLoser!]!.hand.push(...this.take(who, move.cards!));
      this.exchangeLoser = null; this.log(`${this.players[who]!.name} eröffnet die neue Runde.`); return;
    }
    if (move.type === 'play') {
      this.top = this.take(who, move.cards!); this.board.push(...this.top); this.last = who; this.passed.clear();
      this.log(`${this.players[who]!.name} spielt ${this.top.map(cardName).join(', ')}.`);
      if (!this.players[who]!.hand.length) this.ranking.push(who);
      if (this.ranking.length === 3) { this.ranking.push(this.next(who)); this.finish([this.ranking[0]!]); this.log(`${this.players[this.ranking[0]!]!.name} gewinnt. ${this.players[this.ranking[3]!]!.name} ist das Arschloch.`); return; }
    } else { this.passed.add(who); this.log(`${this.players[who]!.name} passt.`); }
    const contenders = this.players.map((p, i) => p.hand.length && i !== this.last ? i : -1).filter(i => i >= 0);
    if (contenders.every(i => this.passed.has(i))) {
      this.discard.push(...this.board); this.board = []; this.top = []; this.passed.clear();
      this.turn = this.players[this.last]!.hand.length ? this.last : this.next(this.last);
      this.log(`${this.players[this.turn]!.name} hat das Ausspiel.`);
    } else this.turn = this.next(who);
  }
  bot(): Move {
    const hand = this.players[this.turn]!.hand;
    const danger = this.players.some((p, i) => i !== this.turn && p.hand.length > 0 && p.hand.length <= 2);
    return this.choose(this.legal().map(move => {
      const cards = hand.filter(c => move.cards?.includes(c.id));
      const value = cards.length ? strength(cards[0]!) : 0;
      let score = move.type === 'pass' ? -5 : cards.length * 7 - value * 0.5;
      if (move.type === 'exchange') score = -value;
      if (cards.length === hand.length) score += 100;
      if (danger && this.top.length && cards.length) score += value;
      if (cards.length === 1 && hand.filter(c => c.rank === cards[0]?.rank).length > 1) score -= 5;
      return { move, score };
    }));
  }
  groups() { return [{ label: this.top.length ? `${this.players[this.last]!.name} · zu überbieten` : 'Freies Ausspiel', cards: this.board }]; }
  info() { return this.exchangeLoser !== null ? 'Kartentausch · höchste Karte gegen freie Wahl' : `3 niedrig · 2 hoch · ${this.top.length ? `${this.top.length} Karte${this.top.length > 1 ? 'n' : ''} überbieten` : 'Freies Ausspiel'}`; }
}

export class Nines extends Game {
  kind = 'neunern' as const;
  activeSuit: Card['suit'];
  penalty = 0;
  drawn: string | null = null;
  blocked = 0;
  knocked = [false, false, false, false];
  missedKnock = [false, false, false, false];
  roundPoints = [0, 0, 0, 0];
  doubled = false;
  scores: number[];
  constructor(random = Math.random, scores = [0, 0, 0, 0]) {
    super(4, random); this.scores = [...scores]; this.stock = shuffle(deck(6), random);
    for (let n = 0; n < 5; n++) for (const p of this.players) p.hand.push(this.stock.pop()!);
    this.board = [this.stock.pop()!]; this.activeSuit = this.board[0]!.suit;
    this.log('Du beginnst. Gleiche Farbe oder gleicher Wert.');
  }
  legal(): Move[] {
    if (this.over) return [];
    const hand = this.players[this.turn]!.hand;
    if (this.missedKnock[this.turn]) return [{type:'knock-penalty', label:`Klopfen vergessen · ${2 + this.penalty} ziehen`}];
    const top = this.board[0]!;
    const playable = hand.filter(c => this.penalty ? c.rank === 7 : (!this.drawn || c.id === this.drawn) && (c.rank === 9 || c.suit === this.activeSuit || c.rank === top.rank));
    const moves: Move[] = playable.flatMap(c => c.rank === 9 ? suits.map(suit => ({type:'play', cards:[c.id], suit, label:suitNames[suit]})) : [{type:'play', cards:[c.id], label:'Ablegen'}]);
    if (hand.length === 2 && !this.knocked[this.turn] && moves.length) moves.push({type:'knock', label:'Auf den Tisch klopfen'});
    if (this.penalty) moves.push({type:'draw', label:`${this.penalty} Karten ziehen`});
    else if (this.drawn) moves.push({type:'pass', label:'Weiter'});
    else if (!playable.length) moves.push({type:'draw', label:'Karte ziehen'});
    return moves;
  }
  drawOne(who: number): Card | undefined {
    if (!this.stock.length && this.discard.length) { this.stock = shuffle(this.discard, this.random); this.discard = []; }
    const card = this.stock.pop(); if (card) this.players[who]!.hand.push(card); return card;
  }
  apply(move: Move) {
    const who = this.turn;
    if (move.type === 'knock') { this.knocked[who] = true; this.log(`${this.players[who]!.name} klopft auf den Tisch.`); return; }
    if (move.type === 'knock-penalty') {
      const count=2 + this.penalty; let taken=0;
      for (let i=0;i<count;i++) if (this.drawOne(who)) taken++;
      this.penalty=0; this.missedKnock[who]=false; this.knocked[who]=false; this.drawn=null;
      this.log(`${this.players[who]!.name} hat das Klopfen vergessen und zieht ${taken} Strafkarten.`); this.turn=(who+1)%4; return;
    }
    if (move.type === 'play') {
      const wasPenultimate = this.players[who]!.hand.length === 2;
      const card = this.take(who, move.cards!)[0]!;
      this.discard.push(...this.board); this.board = [card]; this.activeSuit = move.suit ?? card.suit;
      this.drawn = null; this.blocked = 0;
      this.log(`${this.players[who]!.name} legt ${cardName(card)}${move.suit ? ` und wählt ${suitNames[move.suit]}` : ''}.`);
      if (wasPenultimate) this.missedKnock[who] = !this.knocked[who];
      this.knocked[who]=false;
      if (!this.players[who]!.hand.length) { this.doubled=card.rank===9; this.finish([who]); return; }
      if (card.rank === 7) this.penalty += 2;
      this.turn = (who + (card.rank === 8 ? 2 : 1)) % 4;
    } else if (move.type === 'draw') {
      this.knocked[who]=false;
      const amount = this.penalty || 1;
      let last: Card | undefined; let drawnCount = 0;
      for (let i = 0; i < amount; i++) { const card = this.drawOne(who); if (card) { last=card; drawnCount++; } }
      this.log(`${this.players[who]!.name} zieht ${drawnCount} ${drawnCount === 1 ? 'Karte' : 'Karten'}.`);
      if (!this.penalty && last) {
        this.drawn = last.id;
        if (this.legal().some(m => m.cards)) { this.blocked = 0; return; }
      }
      this.blocked = last ? 0 : this.blocked + 1;
      this.penalty = 0; this.drawn = null; this.turn = (who + 1) % 4;
      if (this.blocked >= 4) { const min = Math.min(...this.players.map(p => p.hand.length)); this.finish(this.players.flatMap((p,i) => p.hand.length === min ? [i] : [])); this.log('Stapel leer. Die kleinste Hand gewinnt.'); }
    } else { this.drawn = null; this.turn = (who + 1) % 4; }
  }
  bot(): Move {
    const knock = this.legal().find(m => m.type === 'knock'); if (knock) return knock;
    const hand = this.players[this.turn]!.hand;
    const next = this.players[(this.turn + 1) % 4]!;
    return this.choose(this.legal().map(move => {
      const card = hand.find(c => c.id === move.cards?.[0]);
      if (!card) return {move, score:-15};
      const suit = move.suit ?? card.suit;
      const support = hand.filter(c => c.id !== card.id && c.suit === suit).length;
      return {move, score:10 + support * 2 + (card.rank === 7 || card.rank === 8 ? next.hand.length < 3 ? 9 : 3 : 0) - (card.rank === 9 && hand.length > 2 ? 5 : 0)};
    }));
  }
  finish(winners: number[]) {
    super.finish(winners);
    this.roundPoints = this.players.map((p,i) => winners.includes(i) ? 0 : p.hand.length * (this.doubled ? 2 : 1));
    this.scores = this.scores.map((score,i) => score + this.roundPoints[i]!);
  }
  groups() { return [{label: suitNames[this.activeSuit], cards:[...this.discard.slice(-6), ...this.board]}]; }
  info() { return this.penalty ? `+${this.penalty}` : suitNames[this.activeSuit]; }
}
