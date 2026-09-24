import { type Game, type Move, suitNames } from './core';
import { Nines } from './shedding';
import { Poker } from './poker';

const phrases = new Map<number, { text: string; until: number }>();
const timers = new Map<number, number>();
const turns = new Map<string, number>();

const voices: Record<number, Record<string, string[]>> = {
  1: {
    play: ['Passt hier ganz gut.', 'Die nehm ich.', 'Probieren wir die.'],
    pass: ['Ich passe.', 'Bin diesmal raus.', 'Weiter ohne mich.'],
    defend: ['Die ist gedeckt.', 'Geht sich aus.', 'Abgewehrt.'],
    take: ['Dann nehm ich sie.', 'Okay, die gehen an mich.', 'Muss ich wohl aufnehmen.'],
    transfer: ['Zurück zu dir.', 'Den schieb ich weiter.', 'Gleicher Wert – du bist dran.'],
    check: ['Ich checke.', 'Von mir aus weiter.', 'Ich bleib ruhig.'],
    call: ['Ich geh mit.', 'Das zahl ich.', 'Bin dabei.'],
    fold: ['Die Hand geb ich ab.', 'Das wird mir zu heiß.', 'Ich bin raus.'],
  },
  2: {
    play: ['Das sollte reichen.', 'Sauber abgelegt.', 'Genau die.'],
    pass: ['Keine passende Antwort.', 'Ich passe diesmal.', 'Da geh ich nicht drüber.'],
    defend: ['Korrekt gedeckt.', 'Der Angriff ist abgewehrt.', 'Gelöst.'],
    take: ['Keine Deckung. Ich nehme.', 'Dann eben aufnehmen.', 'Die Rechnung geht nicht auf.'],
    transfer: ['Weitergeschoben.', 'Der kommt zurück.', 'Passender Wert. Du deckst.'],
    check: ['Check.', 'Noch kein Grund zu setzen.', 'Ich schau mir die nächste an.'],
    call: ['Ich gleiche aus.', 'Mitgegangen.', 'Die Quote passt.'],
    fold: ['Nicht gut genug.', 'Ich steige aus.', 'Die Rechnung passt nicht.'],
  },
  3: {
    play: ['Und weg damit.', 'Die macht sich gut hier.', 'Bitte sehr.'],
    pass: ['Na gut, ich passe.', 'Dann eben später.', 'Ausnahmsweise passe ich.'],
    defend: ['Erwischt? Wohl kaum.', 'Schön gedeckt.', 'Nicht mit mir.'],
    take: ['Autsch. Die nehm ich.', 'Geschenkt ist geschenkt.', 'Okay, alle zu mir.'],
    transfer: ['Nicht so schnell – zurück.', 'Den darfst du selbst decken.', 'Schieben kann ich auch.'],
    check: ['Mal sehen, was kommt.', 'Ich checke.', 'Noch halte ich still.'],
    call: ['Ich will es sehen.', 'Da geh ich mit.', 'Komm, zeig her.'],
    fold: ['Für heute genug Mut.', 'Die schenk ich dir.', 'Ich bin raus.'],
  },
};

function sayAs(player: number, key: string, fallback: string): string {
  const options = voices[player]?.[key] ?? [fallback];
  const id = `${player}:${key}`;
  const index = turns.get(id) ?? 0;
  turns.set(id, index + 1);
  return options[index % options.length] ?? fallback;
}

export function resetSpeech() {
  timers.forEach(window.clearTimeout);
  timers.clear(); phrases.clear(); turns.clear();
}

export function speak(player: number, text: string) {
  if (player === 0) return;
  window.clearTimeout(timers.get(player));
  phrases.set(player, { text, until: Date.now() + 3500 });
  renderSpeech();
  timers.set(player, window.setTimeout(() => { phrases.delete(player); renderSpeech(); }, 3500));
}

export function renderSpeech() {
  document.querySelectorAll<HTMLElement>('[data-seat]').forEach(seat => {
    const player = Number(seat.dataset.seat) + 1;
    const phrase = phrases.get(player);
    let bubble = seat.querySelector<HTMLElement>('.cg-speech');
    if (!phrase || phrase.until <= Date.now()) { bubble?.remove(); return; }
    if (bubble?.textContent === phrase.text) return;
    if (!bubble) {
      bubble = document.createElement('span'); bubble.className = 'cg-speech';
      bubble.dataset.voice = String(player); bubble.setAttribute('role', 'status'); seat.append(bubble);
    }
    bubble.textContent = phrase.text;
    if (phrase.until - Date.now() < 3350) bubble.style.animation = 'none';
  });
}

export function actionSpeech(game: Game, move: Move, who: number, rank?: number, drawn = 0) {
  const defaults: Record<string, string> = {
    attack: 'Ich greife an.', defend: 'Gedeckt.', transfer: 'Weitergeschoben.', take: 'Ich nehme auf.', done: 'Fertig.',
    pass: 'Ich passe.', fold: 'Ich bin raus.', check: 'Ich checke.', call: 'Ich gehe mit.',
    exchange: 'Die ist für dich.', knock: 'Klopf, klopf.', 'knock-penalty': 'Klopfen vergessen!',
  };
  let text = sayAs(who, move.type, defaults[move.type] ?? 'Mein Zug.');

  if (move.type === 'draw') text = drawn > 1 ? `Uff, ${drawn} Karten für mich.` : drawn ? sayAs(who, 'draw', 'Ich ziehe eine.') : 'Der Stapel ist leer.';
  if (move.type === 'raise') {
    const variants = [`Ich mach ${move.amount}.`, `Rauf auf ${move.amount}.`, `${move.amount}. Gehst du mit?`];
    const key = `${who}:raise`; const index = turns.get(key) ?? 0; turns.set(key, index + 1);
    text = game.players[who]!.chips === 0 ? 'Alles rein. All-in!' : variants[index % variants.length]!;
  }
  if (move.type === 'done') text = sayAs(who, 'done', 'Der Angriff ist vorbei.');
  if (move.type === 'attack') text = sayAs(who, 'play', 'Die lege ich vor.');
  if (move.type === 'exchange') text = sayAs(who, 'exchange', 'Die ist für dich.');
  if (move.type === 'play') {
    text = move.cards?.length === 2 ? ['Paar. Bitte sehr.', 'Zwei auf einmal.', 'Mein Paar.'][who % 3]! : move.cards?.length === 3 ? 'Ein Drilling für euch.' : move.cards?.length === 4 ? 'Vier Stück. Viel Spaß.' : sayAs(who, 'play', 'Die lege ich.');
    if (game instanceof Nines) {
      if (rank === 7) text = game.penalty > 2 ? `Jetzt sind es ${game.penalty}.` : '+2. Tut mir leid.';
      if (rank === 8) { text = 'Du setzt eine Runde aus.'; speak((who + 1) % 4, sayAs((who + 1) % 4, 'skip', 'Na toll. Ich setze aus.')); }
      if (move.suit) text = [`Ich wünsche ${suitNames[move.suit]}.`, `${suitNames[move.suit]}, bitte.`, `Ab jetzt ${suitNames[move.suit]}.`][who % 3]!;
      if (game.players[who]!.hand.length === 1 && !game.missedKnock[who] && !move.suit && rank !== 7 && rank !== 8) text = ['Nur noch eine.', 'Eine hab ich noch.', 'Letzte Karte!'][who % 3]!;
    }
  }
  if (game instanceof Poker && move.type === 'call' && game.players[who]!.chips === 0) text = 'Mitgegangen. All-in.';
  if (text) speak(who, text);
}
