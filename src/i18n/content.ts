// Language-keyed bulk content for games that need localised data
// (typing sentences, word-search themes, etc.).
// Kept here rather than in translations.ts so individual games can
// import only what they need.

import { Lang } from './types';

/** Sentences shown in the typing practice game. */
export const TYPING_SENTENCES: Record<Lang, string[]> = {
  en: [
    'the quick brown fox jumps over the lazy dog',
    'practice makes progress not perfection',
    'a journey of a thousand miles begins with a single step',
    'stars cannot shine without darkness',
    'dream big work hard stay humble',
    'courage is not the absence of fear',
  ],
  it: [
    'chi dorme non piglia pesci ma riposa bene la notte',
    'ogni giorno è un nuovo inizio pieno di possibilità',
    'la musica è il linguaggio universale del cuore',
    'impara dal passato vivi il presente sogna il futuro',
    "l'unione fa la forza anche nelle piccole cose",
    'il viaggio più bello è quello che fai ogni giorno',
  ],
  de: [
    'der frühe vogel fängt den wurm sagt meine oma gern',
    'jeder tag ist eine neue chance etwas schönes zu lernen',
    'kleine schritte führen zu grossen veränderungen im leben',
    'die musik ist die sprache des herzens ohne worte',
    'zusammen sind wir stark und können alles schaffen',
    'lerne aus gestern lebe heute träume für morgen',
  ],
};

/** Themed word pools for the word-search game. Each theme = one pool. */
export const WORD_SEARCH_POOLS: Record<Lang, string[][]> = {
  en: [
    ['apple', 'grape', 'mango', 'lemon', 'peach', 'berry'],
    ['tiger', 'koala', 'eagle', 'whale', 'shark', 'zebra'],
    ['plane', 'train', 'truck', 'boat', 'bike', 'rocket'],
    ['castle', 'dragon', 'wizard', 'forest', 'pirate', 'legend'],
  ],
  it: [
    ['mela', 'pera', 'uva', 'limone', 'pesca', 'fragola'],
    ['tigre', 'koala', 'aquila', 'balena', 'squalo', 'zebra'],
    ['aereo', 'treno', 'camion', 'barca', 'bici', 'razzo'],
    ['castello', 'drago', 'mago', 'foresta', 'pirata', 'legenda'],
  ],
  de: [
    ['apfel', 'birne', 'kirsche', 'zitrone', 'pfirsich', 'traube'],
    ['tiger', 'koala', 'adler', 'wal', 'hai', 'zebra'],
    ['flugzeug', 'zug', 'laster', 'boot', 'rad', 'rakete'],
    ['schloss', 'drache', 'zauberer', 'wald', 'pirat', 'legende'],
  ],
};
