import { Game, deck, shuffle, type Card, type Move } from './core';

export const handLabels = ['Höchste Karte', 'Paar', 'Zwei Paare', 'Drilling', 'Straße', 'Flush', 'Full House', 'Vierling', 'Straight Flush'];
const pack = (category: number, ranks: number[]) => [category, ...ranks, 0, 0, 0, 0, 0].slice(0, 6).reduce((n, v) => n * 15 + v, 0);
const straight = (ranks: number[]) => {
  const values = new Set(ranks); if (values.has(14)) values.add(1);
  for (let high = 14; high >= 5; high--) if ([0, 1, 2, 3, 4].every(i => values.has(high - i))) return high;
  return 0;
};
export const evaluate = (cards: Card[]): number => {
  const ranks = cards.map(c => c.rank).sort((a, b) => b - a);
  const counts = [...new Set(ranks)].map(rank => ({ rank, count: ranks.filter(r => r === rank).length })).sort((a, b) => b.count - a.count || b.rank - a.rank);
  const flush = ['clubs', 'diamonds', 'hearts', 'spades'].map(s => cards.filter(c => c.suit === s).map(c => c.rank).sort((a, b) => b - a)).find(cs => cs.length >= 5);
  if (flush && straight(flush)) return pack(8, [straight(flush)]);
  const quad = counts.find(c => c.count === 4);
  if (quad) return pack(7, [quad.rank, ranks.find(r => r !== quad.rank)!]);
  const trip = counts.find(c => c.count >= 3);
  const pair = counts.find(c => c.rank !== trip?.rank && c.count >= 2);
  if (trip && pair) return pack(6, [trip.rank, pair.rank]);
  if (flush) return pack(5, flush.slice(0, 5));
  const run = straight(ranks); if (run) return pack(4, [run]);
  if (trip) return pack(3, [trip.rank, ...ranks.filter(r => r !== trip.rank).slice(0, 2)]);
  const pairs = counts.filter(c => c.count === 2).sort((a, b) => b.rank - a.rank);
  if (pairs.length >= 2) return pack(2, [pairs[0]!.rank, pairs[1]!.rank, ranks.find(r => r !== pairs[0]!.rank && r !== pairs[1]!.rank)!]);
  if (pairs.length) return pack(1, [pairs[0]!.rank, ...ranks.filter(r => r !== pairs[0]!.rank).slice(0, 3)]);
  return pack(0, ranks.slice(0, 5));
};
export const handLabel = (cards: Card[]) => handLabels[Math.floor(evaluate(cards) / 15 ** 5)]!;
const combinations = (cards: Card[], size: number): Card[][] => size === 0
  ? [[]]
  : cards.flatMap((card, index) => combinations(cards.slice(index + 1), size - 1).map(rest => [card, ...rest]));
export const bestFive = (cards: Card[]): Card[] => cards.length <= 5
  ? [...cards]
  : combinations(cards, 5).sort((a, b) => evaluate(b) - evaluate(a))[0]!;

// Samples only cards unknown to the acting player, never the opponent's actual hand or stock.
export const equity = (hand: Card[], board: Card[], random = Math.random, trials = 110) => {
  const known = new Set([...hand, ...board].map(c => c.id));
  const unknown = deck().filter(c => !known.has(c.id));
  let wins = 0;
  for (let i = 0; i < trials; i++) {
    const sample = shuffle(unknown, random);
    const opponent = sample.slice(0, 2);
    const community = [...board, ...sample.slice(2, 7 - board.length)];
    const us = evaluate([...hand, ...community]); const them = evaluate([...opponent, ...community]);
    wins += us > them ? 1 : us === them ? 0.5 : 0;
  }
  return wins / trials;
};

export class Poker extends Game {
  kind = 'poker' as const;
  bets = [0, 0];
  contributed = [0, 0];
  street = 0;
  lastRaise = 20;
  pending = new Set([0, 1]);
  acted = new Set<number>();
  showdown = false;
  lastPot = 0;
  constructor(random = Math.random, public dealer = 0, chips = [1000, 1000]) {
    super(2, random); this.stock = shuffle(deck(), random);
    for (let n = 0; n < 2; n++) for (const p of this.players) p.hand.push(this.stock.pop()!);
    this.players.forEach((p, i) => { p.chips = chips[i]!; });
    this.pay(dealer, Math.min(10, this.players[dealer]!.chips));
    this.pay(1 - dealer, Math.min(20, this.players[1 - dealer]!.chips));
    this.turn = dealer; this.log('Blinds 10 / 20. Der Button beginnt vor dem Flop.');
    if (this.players.some(p => !p.chips)) this.resolveAllIn();
  }
  get pot() { return this.contributed[0]! + this.contributed[1]!; }
  get price() { return Math.max(...this.bets) - this.bets[this.turn]!; }
  raiseBounds() {
    const who = this.turn; const other = 1 - who;
    const max = this.bets[who]! + this.players[who]!.chips;
    const min = Math.max(...this.bets) + this.lastRaise;
    const available = !this.over && this.players[other]!.chips > 0 && max > Math.max(...this.bets) && !this.acted.has(who);
    return { min: Math.min(min, max), fullMin: min, max, available };
  }
  legal(): Move[] {
    if (this.over) return [];
    const moves: Move[] = this.price > 0 ? [{ type: 'fold', label: 'Passen' }, { type: 'call', label: `Mitgehen · ${Math.min(this.price, this.players[this.turn]!.chips)}` }] : [{ type: 'check', label: 'Checken' }];
    const { available, min, max } = this.raiseBounds();
    if (available) for (const amount of new Set([min, Math.min(max, Math.max(min, Math.max(...this.bets) + Math.floor((this.pot + this.price) / 2))), Math.min(max, Math.max(min, Math.max(...this.bets) + this.pot + this.price)), max])) {
      moves.push({ type: 'raise', amount, label: amount === max ? `All-in · ${amount}` : `${Math.max(...this.bets) ? 'Erhöhen auf' : 'Setzen'} ${amount}` });
    }
    return moves;
  }
  override play(move: Move) {
    if (move.type === 'raise') {
      const bounds = this.raiseBounds(); const amount = move.amount;
      if (!bounds.available || !Number.isInteger(amount) || amount! > bounds.max || amount! < bounds.min) throw new Error('Ungültige Erhöhung.');
      this.apply(move);
    } else super.play(move);
  }
  pay(who: number, amount: number) { this.players[who]!.chips -= amount; this.bets[who]! += amount; this.contributed[who]! += amount; }
  apply(move: Move) {
    const who = this.turn, other = 1 - who;
    if (move.type === 'fold') { this.settle([other], false); this.log(`${this.players[who]!.name} passt. ${this.players[other]!.name} gewinnt den Pot.`); return; }
    if (move.type === 'raise') {
      const increment = move.amount! - Math.max(...this.bets);
      this.pay(who, move.amount! - this.bets[who]!);
      if (increment >= this.lastRaise) { this.lastRaise = increment; this.acted.clear(); }
      this.pending = new Set([other]);
      this.log(`${this.players[who]!.name} ${this.players[who]!.chips ? `erhöht auf ${move.amount}` : 'geht all-in'}.`);
    } else {
      const amount = Math.min(this.price, this.players[who]!.chips);
      this.pay(who, amount); this.pending.delete(who);
      this.log(`${this.players[who]!.name} ${amount ? `geht ${amount} mit` : 'checkt'}.`);
    }
    this.acted.add(who); this.turn = other;
    if (this.players.some(p => p.chips === 0)) { this.resolveAllIn(); return; }
    if (!this.pending.size) this.nextStreet();
  }
  resolveAllIn() {
    // A player with chips must still call or fold an unmatched opposing all-in.
    const able = this.players.findIndex(p => p.chips > 0);
    if (able >= 0 && this.bets[able]! < this.bets[1 - able]!) { this.turn = able; this.pending = new Set([able]); return; }
    this.refund();
    while (this.board.length < 5) this.dealStreet();
    this.compare();
  }
  dealStreet() {
    this.discard.push(this.stock.pop()!); // Burn before each community street.
    const count = this.board.length === 0 ? 3 : 1;
    for (let n = 0; n < count; n++) this.board.push(this.stock.pop()!);
    this.street++;
  }
  nextStreet() {
    if (this.street === 3) { this.compare(); return; }
    this.dealStreet(); this.bets = [0, 0]; this.lastRaise = 20; this.pending = new Set([0, 1]); this.acted.clear();
    this.turn = 1 - this.dealer; this.log(`${['', 'Flop', 'Turn', 'River'][this.street]}. ${this.players[this.turn]!.name} beginnt.`);
  }
  refund() {
    const difference = this.contributed[0]! - this.contributed[1]!;
    if (difference) { const index = difference > 0 ? 0 : 1; this.players[index]!.chips += Math.abs(difference); this.contributed[index]! -= Math.abs(difference); }
  }
  compare() {
    const values = this.players.map(p => evaluate([...p.hand, ...this.board]));
    const winners = values[0] === values[1] ? [0, 1] : [values[0]! > values[1]! ? 0 : 1];
    this.settle(winners, true);
    this.log(winners.length === 2 ? 'Gleichstand. Der Pot wird geteilt.' : `${this.players[winners[0]!]!.name} gewinnt mit ${handLabel([...this.players[winners[0]!]!.hand, ...this.board])}.`);
  }
  settle(winners: number[], reveal: boolean) {
    this.refund();
    this.lastPot = this.pot;
    const share = Math.floor(this.pot / winners.length); const odd = this.pot % winners.length;
    winners.forEach(i => { this.players[i]!.chips += share; });
    if (odd) this.players[winners.includes(1 - this.dealer) ? 1 - this.dealer : winners[0]!]!.chips += odd;
    this.contributed = [0, 0]; this.bets = [0, 0]; this.showdown = reveal; this.finish(winners);
  }
  bot(): Move {
    const options = this.legal(); const hand = this.players[this.turn]!.hand;
    const chance = equity(hand, this.board, this.random);
    const odds = this.price / (this.pot + this.price || 1);
    const call = options.find(m => m.type === 'call'); const check = options.find(m => m.type === 'check');
    const raises = options.filter(m => m.type === 'raise');
    const bluff = this.random() < (this.street ? 0.075 : 0.04);
    if (raises.length && (chance > 0.68 || bluff)) {
      const target = Math.max(...this.bets) + Math.max(20, Math.floor((this.pot + this.price) * (chance > 0.88 ? 1 : 0.65)));
      return raises.sort((a, b) => Math.abs(a.amount! - target) - Math.abs(b.amount! - target))[0]!;
    }
    if (check) return check;
    if (call && (chance >= odds + 0.04 || this.price <= 20 && chance > 0.28)) return call;
    return options.find(m => m.type === 'fold')!;
  }
  groups() { return [{ label: ['Preflop', 'Flop', 'Turn', 'River'][Math.min(this.street, 3)]!, cards: this.board }]; }
  info() { return `Pot ${this.pot} · Blinds 10 / 20 · Button: ${this.players[this.dealer]!.name} · Nur Spielchips`; }
}
