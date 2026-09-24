export type Suit = 'clubs' | 'diamonds' | 'hearts' | 'spades';
export type Card = { id: string; suit: Suit; rank: number };
export type Kind = 'durak' | 'arschloch' | 'neunern' | 'poker';
export type Move = { type: string; cards?: string[]; amount?: number; suit?: Suit; label: string };
export type Player = { name: string; hand: Card[]; chips: number };
export type TableGroup = { label: string; cards: Card[] };
export const suits: Suit[] = ['clubs', 'diamonds', 'hearts', 'spades'];
export const symbols: Record<Suit, string> = { clubs: '♣', diamonds: '♦', hearts: '♥', spades: '♠' };
export const suitNames: Record<Suit, string> = { clubs: 'Kreuz', diamonds: 'Karo', hearts: 'Herz', spades: 'Pik' };
export const rankName = (rank: number) => ({ 11: 'B', 12: 'D', 13: 'K', 14: 'A' }[rank] ?? String(rank));
export const cardName = (card: Card) => `${rankName(card.rank)} ${suitNames[card.suit]}`;
export const deck = (low = 2): Card[] => suits.flatMap(suit => Array.from({ length: 15 - low }, (_, i) => ({ id: `${suit}-${i + low}`, suit, rank: i + low })));
export const shuffle = <T>(input: T[], random = Math.random): T[] => {
  const cards = [...input];
  for (let i = cards.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [cards[i], cards[j]] = [cards[j]!, cards[i]!]; }
  return cards;
};
export const sameMove = (a: Move, b: Move) => a.type === b.type && a.amount === b.amount && a.suit === b.suit && [...a.cards ?? []].sort().join() === [...b.cards ?? []].sort().join();
export const strength = (card: Card) => card.rank === 2 ? 15 : card.rank;
export const conjugatePlayerText = (text: string) => {
  const verbs: Record<string, string> = {
    greift:'greifst', legt:'legst', deckt:'deckst', schiebt:'schiebst', nimmt:'nimmst', beginnt:'beginnst',
    spielt:'spielst', hat:'hast', muss:'musst', gewinnt:'gewinnst', erhält:'erhältst', gibt:'gibst',
    erhöht:'erhöhst', geht:'gehst', checkt:'checkst', ist:'bist', eröffnet:'eröffnest', klopft:'klopfst',
    zieht:'ziehst', wählt:'wählst',
  };
  return text.split(/(?<=[.!?])\s+/).map(sentence => sentence.startsWith('Du ')
    ? sentence.replace(/[\p{L}]+/gu, verb => verbs[verb] ?? verb)
    : sentence).join(' ');
};
export abstract class Game {
  abstract kind: Kind;
  players: Player[];
  turn = 0;
  over = false;
  winners: number[] = [];
  stock: Card[] = [];
  discard: Card[] = [];
  board: Card[] = [];
  message = '';
  history: string[] = [];
  constructor(count: number, public random = Math.random) {
    this.players = ['Du', 'Mika', 'Jules', 'Alex'].slice(0, count).map(name => ({ name, hand: [], chips: 1000 }));
  }
  abstract legal(): Move[];
  abstract apply(move: Move): void;
  abstract bot(): Move;
  abstract groups(): TableGroup[];
  abstract info(): string;
  play(move: Move) {
    if (this.over || !this.legal().some(m => sameMove(m, move))) throw new Error('Dieser Zug ist nicht erlaubt.');
    this.apply(move);
  }
  log(text: string) {
    text = conjugatePlayerText(text);
    this.message = text; this.history.push(text); this.history = this.history.slice(-12);
  }
  take(player: number, ids: string[]): Card[] {
    const cards = this.players[player]!.hand.filter(card => ids.includes(card.id));
    this.players[player]!.hand = this.players[player]!.hand.filter(card => !ids.includes(card.id));
    return cards;
  }
  finish(winners: number[]) { this.over = true; this.winners = winners; }
  // Every physical card belongs to exactly one zone. Display references never count twice.
  physicalCards(): Card[] { return [...this.stock, ...this.discard, ...this.board, ...this.players.flatMap(p => p.hand)]; }
  choose(scored: { move: Move; score: number }[]): Move {
    return scored.map(s => ({ ...s, score: s.score + this.random() * 0.8 })).sort((a, b) => b.score - a.score)[0]!.move;
  }
}
