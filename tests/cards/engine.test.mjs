import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { deck, sameMove, conjugatePlayerText } = require(`${process.env.CARD_ENGINE_DIR}/core.js`);
const { Durak, President, Nines } = require(`${process.env.CARD_ENGINE_DIR}/shedding.js`);
const { Poker, evaluate, equity, handLabels, bestFive } = require(`${process.env.CARD_ENGINE_DIR}/poker.js`);
const seeded = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const c = (rank, suit = 'hearts') => ({ id: `${suit}-${rank}`, suit, rank });
const invariant = (game, count) => {
  const cards = game.physicalCards();
  assert.equal(cards.length, count); assert.equal(new Set(cards.map(c => c.id)).size, count);
  assert.ok(game.players.every(p => p.chips >= 0));
  if (game instanceof Poker) assert.equal(game.players.reduce((sum, p) => sum + p.chips, 0) + game.pot, 2000);
};
test('German player text conjugates every verb that belongs to “Du”', () => {
  assert.equal(conjugatePlayerText('Du erhält die höchste Karte und gibt eine Karte zurück.'), 'Du erhältst die höchste Karte und gibst eine Karte zurück.');
  assert.equal(conjugatePlayerText('Du legt 9 Herz und wählt Pik.'), 'Du legst 9 Herz und wählst Pik.');
  assert.equal(conjugatePlayerText('Du hat das Klopfen vergessen und zieht zwei Karten.'), 'Du hast das Klopfen vergessen und ziehst zwei Karten.');
  assert.equal(conjugatePlayerText('Mika gewinnt. Du ist das Arschloch.'), 'Mika gewinnt. Du bist das Arschloch.');
});
for (const [Class, count] of [[Durak, 36], [President, 52], [Nines, 36], [Poker, 52]]) {
  test(`${Class.name}: 1,000 full matches conserve cards and finish legally`, () => {
    for (let seed = 1; seed <= 1000; seed++) {
      const game = new Class(seeded(seed)); let turns = 0;
      while (!game.over && turns++ < 1500) {
        invariant(game, count);
        const move = game.bot(); assert.ok(game.legal().some(m => sameMove(m, move)), `seed ${seed}`);
        game.play(move);
      }
      assert.ok(game.over, `seed ${seed} did not finish (${game.message})`); invariant(game, count);
      assert.ok(game.winners.length);
    }
  });
}
test('Illegal actions cannot mutate a game', () => {
  for (const Class of [Durak, President, Nines, Poker]) { const game = new Class(seeded(5)); const before = JSON.stringify(game); assert.throws(() => game.play({ type: 'fake', cards: ['fake'] })); assert.equal(JSON.stringify(game), before); }
});
test('Durak: trump coverage and throwing limits', () => {
  const game = new Durak(seeded(6)); game.trump = c(6, 'spades');
  assert.ok(game.beats(c(6, 'spades'), c(14, 'hearts')));
  assert.ok(!game.beats(c(14, 'hearts'), c(6, 'spades')));
  assert.ok(!game.beats(c(9, 'hearts'), c(9, 'hearts')));
  assert.ok(game.beats(c(10, 'hearts'), c(9, 'hearts')));
  game.limit = 1; game.play(game.legal()[0]);
  game.play(game.legal().find(m => m.type === 'take'));
  assert.deepEqual(game.legal().map(m => m.type), ['done']);
});
test('Durak: every card-versus-card trump comparison follows the beating rule', () => {
  const cards = deck(6);
  for (const trump of ['clubs','diamonds','hearts','spades']) {
    const game = new Durak(seeded(6)); game.trump = c(6, trump);
    for (const defense of cards) for (const attack of cards) {
      const expected = (defense.suit === attack.suit && defense.rank > attack.rank) || (defense.suit === trump && attack.suit !== trump);
      assert.equal(game.beats(defense, attack), expected, `${defense.id} against ${attack.id}, trump ${trump}`);
    }
  }
});
test('Durak: an undefended attack can be passed with the same rank and the new defender covers every card', () => {
  const game = new Durak(seeded(8));
  game.trump = c(6, 'spades'); game.stock = []; game.discard = []; game.board = []; game.pairs = [];
  game.over = false; game.winners = []; game.attacker = 0; game.turn = 0; game.phase = 'attack'; game.taking = false;
  game.players[0].hand = [c(7), c(8), c(8, 'clubs'), c(9, 'diamonds')];
  game.players[1].hand = [c(7, 'clubs'), c(10, 'spades'), c(11, 'diamonds')];

  game.play({ type: 'attack', cards: ['hearts-7'], label: '' });
  const transfer = game.legal().find(move => move.type === 'transfer');
  assert.equal(transfer?.cards?.[0], 'clubs-7');
  game.play(transfer);
  assert.equal(game.attacker, 1); assert.equal(game.turn, 0); assert.equal(game.pairs.length, 2);

  game.play({ type: 'defend', cards: ['hearts-8'], label: '' });
  assert.equal(game.phase, 'defend'); assert.equal(game.turn, 0);
  assert.ok(!game.legal().some(move => move.type === 'transfer'));
  game.play({ type: 'defend', cards: ['clubs-8'], label: '' });
  assert.equal(game.phase, 'attack'); assert.equal(game.turn, 1);
});
test('Durak: a same-rank trump offers both defend and transfer, unless the next defender lacks cards', () => {
  const game=new Durak(seeded(4));game.trump=c(6,'clubs');game.attacker=0;game.turn=0;game.phase='attack';game.board=[];game.pairs=[];
  game.players[0].hand=[c(7),c(8),c(9)];game.players[1].hand=[c(7,'clubs'),c(10,'diamonds')];
  game.play({type:'attack',cards:['hearts-7'],label:''});
  assert.deepEqual(game.legal().filter(m=>m.cards?.[0]==='clubs-7').map(m=>m.type),['defend','transfer']);
  game.players[0].hand=[];
  assert.ok(!game.legal().some(m=>m.type==='transfer'));
});
test('Arschloch: equal count, higher rank, pass reset and next-round exchange', () => {
  const game = new President(seeded(11));
  game.top = [c(6), c(6, 'clubs')];
  game.players[0].hand = [c(7), c(7, 'clubs'), c(14), c(2)];
  const moves = game.legal().filter(m => m.type === 'play'); assert.equal(moves.length, 1); assert.equal(moves[0].cards.length, 2);
  const next = new President(seeded(12), [0,1,2,3]); invariant(next,52); assert.equal(next.players[0].hand.length,14); assert.equal(next.players[3].hand.length,12);
  next.play(next.legal()[0]); invariant(next,52); assert.equal(next.players[0].hand.length,13); assert.equal(next.players[3].hand.length,13);
});
test('Arschloch: every rank and group size only accepts an equally sized higher group', () => {
  const ranks = [3,4,5,6,7,8,9,10,11,12,13,14,2];
  const choose = (n,k) => k === 1 ? n : k === 2 ? n*(n-1)/2 : k === 3 ? n*(n-1)*(n-2)/6 : 1;
  for (const topRank of ranks) for (let size=1;size<=4;size++) for (const candidateRank of ranks) {
    const game = new President(seeded(1)); game.turn=0;
    game.top = ['clubs','diamonds','hearts','spades'].slice(0,size).map(suit=>c(topRank,suit));
    game.players[0].hand = ['clubs','diamonds','hearts','spades'].map(suit=>c(candidateRank,suit));
    const plays=game.legal().filter(m=>m.type==='play');
    const expected = (candidateRank===2?15:candidateRank) > (topRank===2?15:topRank) ? choose(4,size) : 0;
    assert.equal(plays.length,expected,`top ${size}x${topRank}, candidate ${candidateRank}`);
    assert.ok(plays.every(m=>m.cards.length===size));
    if (expected) {
      const selected=game.selectionFor(game.players[0].hand[0].id,[]);
      assert.equal(selected.length,size);
      assert.ok(plays.some(m=>sameMove(m,{type:'play',cards:selected,label:''})));
    }
  }
});
test('Arschloch: two individually higher cards cannot beat a pair unless their values match', () => {
  const game=new President(seeded(2));game.turn=0;game.top=[c(12),c(12,'clubs')];
  game.players[0].hand=[c(13),c(14,'clubs')];
  assert.deepEqual(game.legal().map(m=>m.type),['pass']);
  game.players[0].hand.push(c(13,'spades'));
  const pair=game.legal().find(m=>m.type==='play');assert.deepEqual(new Set(pair.cards),new Set(['hearts-13','spades-13']));
  assert.deepEqual(new Set(game.selectionFor('hearts-13',[])),new Set(pair.cards));
});
test('Neunern: 7 stacks a draw penalty; 8 skips; 9 chooses a suit', () => {
  const game = new Nines(seeded(2)); invariant(game,36);
  assert.ok(game.players.every(p=>p.hand.length===5));
  game.board=[c(6)];game.activeSuit='hearts';game.turn=0;
  game.players[0].hand=[c(7),c(12,'clubs')];game.players[1].hand=[c(7,'clubs'),c(13)];
  game.play({type:'knock',label:''});game.play({type:'play',cards:['hearts-7'],label:''}); assert.equal(game.penalty,2);
  assert.ok(game.legal().some(m=>m.cards?.[0]==='clubs-7'));
  game.play({type:'knock',label:''});game.play({type:'play',cards:['clubs-7'],label:''}); assert.equal(game.penalty,4);
  const count=game.players[2].hand.length;game.play({type:'draw',label:''});assert.equal(game.players[2].hand.length,count+4);assert.equal(game.turn,3);
  game.players[3].hand=[c(8,'clubs'),c(14)];game.play({type:'play',cards:['clubs-8'],label:''});assert.equal(game.turn,1);
  game.players[1].hand=[c(9,'spades'),c(6,'diamonds')];
  assert.equal(game.legal().filter(m=>m.cards?.[0]==='spades-9').length,4);
  game.play({type:'play',cards:['spades-9'],suit:'diamonds',label:''});assert.equal(game.activeSuit,'diamonds');
  game.players[2].hand=[c(10,'clubs'),c(6,'diamonds')];assert.deepEqual(game.legal().flatMap(m=>m.cards??[]),['diamonds-6']);
});
test('Neunerln: every top card, requested suit, hand card and penalty state has the expected legality', () => {
  const cards=deck(6);
  for (const top of cards) for (const activeSuit of ['clubs','diamonds','hearts','spades']) for (const card of cards) for (const penalty of [0,2,6]) {
    const game=new Nines(seeded(1));game.turn=0;game.board=[top];game.activeSuit=activeSuit;game.penalty=penalty;game.players[0].hand=[card];
    const plays=game.legal().filter(m=>m.type==='play'&&m.cards?.[0]===card.id);
    const expected=penalty ? card.rank===7 : card.rank===9||card.suit===activeSuit||card.rank===top.rank;
    assert.equal(Boolean(plays.length),expected,`${card.id} on ${top.id}, suit ${activeSuit}, penalty ${penalty}`);
    assert.equal(plays.length,expected ? card.rank===9 ? 4 : 1 : 0);
  }
});
test('Neunern: draw once, play only that card, and recycle without duplicating cards', () => {
  const game=new Nines(seeded(4));game.turn=0;game.board=[c(6)];game.activeSuit='hearts';game.players[0].hand=[c(10,'clubs')];game.stock=[c(11)];game.discard=[c(12,'clubs')];
  game.play({type:'draw',label:''});assert.equal(game.turn,0);assert.equal(game.drawn,'hearts-11');
  assert.deepEqual(game.legal().map(m=>m.type),['play','knock','pass']);game.play({type:'pass',label:''});assert.equal(game.turn,1);
  const before=game.physicalCards().map(c=>c.id).sort();game.drawOne(1);assert.deepEqual(game.physicalCards().map(c=>c.id).sort(),before);assert.equal(game.board[0].id,'hearts-6');
});
test('Poker ranking: wheel, full houses, flush kicker, board ties and category ordering', () => {
  assert.ok(evaluate([c(14),c(2),c(3),c(4),c(5)]) < evaluate([c(2),c(3),c(4),c(5),c(6)]));
  const full=[c(14),c(14,'clubs'),c(14,'spades'),c(13),c(13,'clubs'),c(13,'spades'),c(2,'diamonds')];
  assert.ok(evaluate(full)>evaluate([c(12),c(12,'clubs'),c(12,'spades'),c(14),c(14,'clubs')]));
  assert.ok(evaluate([c(14),c(12),c(10),c(8),c(4)]) > evaluate([c(14),c(12),c(10),c(8),c(3)]));
  const royal=[10,11,12,13,14].map(r=>c(r)); assert.equal(evaluate([...royal,c(2,'clubs'),c(3,'clubs')]),evaluate([...royal,c(8,'spades'),c(8,'clubs')]));
  const examples=[
    [c(14),c(12,'clubs'),c(10),c(8,'diamonds'),c(4)],
    [c(2),c(2,'clubs'),c(10),c(8,'diamonds'),c(4)],
    [c(2),c(2,'clubs'),c(3),c(3,'clubs'),c(4)],
    [c(2),c(2,'clubs'),c(2,'spades'),c(8,'diamonds'),c(4)],
    [c(2),c(3,'clubs'),c(4),c(5,'diamonds'),c(6)],
    [c(2),c(4),c(7),c(9),c(12)],
    [c(2),c(2,'clubs'),c(2,'spades'),c(3),c(3,'clubs')],
    [c(2),c(2,'clubs'),c(2,'spades'),c(2,'diamonds'),c(3)],royal];
  for(let i=1;i<examples.length;i++) assert.ok(evaluate(examples[i])>evaluate(examples[i-1]));
});
test('Poker: best five selects the strongest five out of seven', () => {
  const cards=[c(14),c(14,'clubs'),c(14,'spades'),c(13),c(13,'clubs'),c(2,'diamonds'),c(3,'spades')];
  const best=bestFive(cards);assert.equal(best.length,5);assert.equal(evaluate(best),evaluate(cards));
  assert.deepEqual(new Set(best.map(card=>card.rank)),new Set([14,13]));
});
test('Poker: all 2,598,960 five-card hands match the canonical category counts', {timeout:120000}, () => {
  const cards=deck();const counts=Array(9).fill(0);
  for(let a=0;a<48;a++)for(let b=a+1;b<49;b++)for(let d=b+1;d<50;d++)for(let e=d+1;e<51;e++)for(let f=e+1;f<52;f++) {
    const value=evaluate([cards[a],cards[b],cards[d],cards[e],cards[f]]);
    counts[Math.floor(value/15**5)]++;
  }
  assert.deepEqual(counts,[1302540,1098240,123552,54912,10200,5108,3744,624,40],handLabels.join(', '));
});
test('Poker: BB option, streets, blinds and chip conservation', () => {
  const game = new Poker(seeded(1)); assert.equal(game.turn,0); assert.equal(game.price,10);
  game.play({type:'call',label:''}); assert.equal(game.street,0); assert.equal(game.turn,1);
  game.play({type:'check',label:''}); assert.equal(game.street,1); assert.equal(game.turn,1); assert.equal(game.board.length,3);
  for(let i=0;i<6;i++) game.play({type:'check',label:''});
  assert.ok(game.over); invariant(game,52); assert.equal(game.discard.length,3);
});
test('Poker: all-in call, unmatched refund and short raise not reopening action', () => {
  const game = new Poker(seeded(3),0,[100,1900]);
  game.play({type:'raise',amount:100,label:''}); assert.equal(game.turn,1);assert.ok(!game.over);
  game.play({type:'call',label:''});assert.ok(game.over);assert.equal(game.board.length,5);invariant(game,52);
  const short = new Poker(seeded(2),0,[1965,35]);
  short.play({type:'raise',amount:40,label:''});
  short.play({type:'call',label:''});assert.ok(short.over);invariant(short,52);
  const reopen = new Poker(seeded(2),0,[1930,70]);
  reopen.play({type:'raise',amount:50,label:''});
  reopen.play({type:'raise',amount:70,label:''});
  assert.ok(!reopen.raiseBounds().available);assert.ok(reopen.legal().some(m=>m.type==='call'));
});
test('Poker: bot cannot use the opponent hand or stock order', () => {
  const a = new Poker(seeded(42)), b = new Poker(seeded(42));
  a.turn=b.turn=1;
  [b.players[0].hand[0],b.stock[0]]=[b.stock[0],b.players[0].hand[0]];
  b.stock.reverse(); a.random=seeded(88); b.random=seeded(88);
  assert.deepEqual(a.bot(),b.bot());
  const aa=[c(14),c(14,'clubs')], low=[c(2),c(7,'clubs')];
  assert.ok(equity(aa,[],seeded(2),500)>.75);assert.ok(equity(low,[],seeded(2),500)<.5);
});

test('Neunerln: missed knock blocks the last card and costs two cards', () => {
  const game = new Nines(seeded(10)); game.turn=0;game.players[0].hand=[c(6),c(9)];game.board=[c(6,'clubs')];game.activeSuit='clubs';
  const used=[...game.players.flatMap(p=>p.hand),...game.board].map(c=>c.id);game.stock=deck(6).filter(c=>!used.includes(c.id));
  game.play({type:'play',cards:['hearts-6'],label:''});assert.equal(game.missedKnock[0],true);
  game.turn=0;assert.deepEqual(game.legal().map(m=>m.type),['knock-penalty']);
  assert.throws(()=>game.play({type:'play',cards:['hearts-9'],suit:'clubs',label:''}));
  game.play(game.legal()[0]);assert.equal(game.players[0].hand.length,3);assert.equal(game.turn,1);assert.equal(game.missedKnock[0],false);
});
test('Neunerln: knock before penultimate card permits a nine finish and doubles cumulative points', () => {
  const game=new Nines(seeded(10),[1,2,3,4]);game.turn=0;game.players[0].hand=[c(6),c(9)];game.board=[c(6,'clubs')];game.activeSuit='clubs';
  game.play({type:'knock',label:''});assert.equal(game.knocked[0],true);assert.equal(game.turn,0);
  game.play({type:'play',cards:['hearts-6'],label:''});assert.equal(game.missedKnock[0],false);
  game.turn=0;const counts=game.players.map(p=>p.hand.length);
  game.play({type:'play',cards:['hearts-9'],suit:'clubs',label:''});assert.equal(game.over,true);assert.equal(game.doubled,true);
  assert.deepEqual(game.roundPoints,[0,...counts.slice(1).map(n=>n*2)]);
  assert.deepEqual(game.scores,[1,2+counts[1]*2,3+counts[2]*2,4+counts[3]*2]);
  const next=new Nines(seeded(11),game.scores);assert.deepEqual(next.scores,game.scores);assert.equal(next.doubled,false);
});
