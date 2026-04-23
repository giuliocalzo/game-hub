import React, { useCallback, useState } from 'react';
import StatusBar, { StatusTone } from '../shared/StatusBar';
import WinOverlay from '../shared/WinOverlay';

// Simplified War: each player has a deck, flip top card each round. Higher rank wins both.
// Ties: "war" — play 3 face down + 1 face up, winner takes all. If deck runs out, opponent wins.

type Suit = '♠' | '♥' | '♦' | '♣';
type Card = { rank: number; suit: Suit };

const RANK_LABEL: Record<number, string> = {
  11: 'J', 12: 'Q', 13: 'K', 14: 'A',
};

const buildDeck = (): Card[] => {
  const suits: Suit[] = ['♠', '♥', '♦', '♣'];
  const deck: Card[] = [];
  for (const s of suits) for (let r = 2; r <= 14; r++) deck.push({ rank: r, suit: s });
  return deck.sort(() => Math.random() - 0.5);
};

const split = (deck: Card[]): [Card[], Card[]] => {
  const mid = Math.floor(deck.length / 2);
  return [deck.slice(0, mid), deck.slice(mid)];
};

const War: React.FC<{ isBotEnabled: boolean }> = () => {
  const [[p1, p2], setDecks] = useState<[Card[], Card[]]>(() => split(buildDeck()));
  const [played, setPlayed] = useState<{ p1?: Card; p2?: Card; spoils?: Card[] }>({});
  const [log, setLog] = useState<string>('Tap "Flip" to play a round.');
  const [winner, setWinner] = useState<0 | 1 | null>(null);

  const cardLabel = (c: Card) => (RANK_LABEL[c.rank] ?? c.rank) + c.suit;

  const reset = () => {
    setDecks(split(buildDeck()));
    setPlayed({});
    setLog('Tap "Flip" to play a round.');
    setWinner(null);
  };

  const flip = useCallback(() => {
    if (winner !== null) return;
    const d1 = [...p1];
    const d2 = [...p2];
    const pool: Card[] = [];

    const doFlip = (): boolean => {
      const c1 = d1.shift();
      const c2 = d2.shift();
      if (!c1 || !c2) return false;
      pool.push(c1, c2);
      setPlayed({ p1: c1, p2: c2, spoils: pool.slice() });
      if (c1.rank > c2.rank) {
        d1.push(...pool.sort(() => Math.random() - 0.5));
        setLog(`${cardLabel(c1)} beats ${cardLabel(c2)} — Player 1 wins round`);
        return true;
      }
      if (c2.rank > c1.rank) {
        d2.push(...pool.sort(() => Math.random() - 0.5));
        setLog(`${cardLabel(c2)} beats ${cardLabel(c1)} — Player 2 wins round`);
        return true;
      }
      // War
      setLog(`War! Both drew ${RANK_LABEL[c1.rank] ?? c1.rank}`);
      for (let i = 0; i < 3; i++) {
        const x = d1.shift();
        const y = d2.shift();
        if (x) pool.push(x);
        if (y) pool.push(y);
        if (!x || !y) {
          // whoever still has cards takes pool
          if (x) d1.push(...pool);
          if (y) d2.push(...pool);
          return true;
        }
      }
      return doFlip();
    };

    doFlip();
    setDecks([d1, d2]);
    if (!d1.length) setWinner(1);
    else if (!d2.length) setWinner(0);
  }, [p1, p2, winner]);

  const tone: StatusTone = winner !== null ? 'success' : 'info';

  return (
    <div className="flex flex-col items-center gap-5">
      <StatusBar tone={tone}>{log}</StatusBar>

      <div className="flex items-center justify-around w-full max-w-md gap-4">
        <PlayerPile label="Player 1" count={p1.length} card={played.p1} face />
        <div className="text-3xl font-extrabold text-gray-500 dark:text-gray-400 dark:text-gray-500">VS</div>
        <PlayerPile label="Player 2" count={p2.length} card={played.p2} face />
      </div>

      <button
        onClick={flip}
        disabled={winner !== null}
        className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold shadow hover:brightness-110 active:scale-95 disabled:opacity-50"
      >
        Flip
      </button>

      {winner !== null && (
        <WinOverlay
          title={`Player ${winner + 1} wins!`}
          subtitle="Captured the whole deck."
          onPlayAgain={reset}
        />
      )}

    </div>
  );
};

const PlayerPile: React.FC<{
  label: string;
  count: number;
  card?: { rank: number; suit: string };
  face?: boolean;
}> = ({ label, count, card }) => (
  <div className="flex flex-col items-center gap-2">
    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-500">{label}</div>
    <div className="relative w-24 h-32 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 shadow flex items-center justify-center">
      {card ? (
        <div
          className={`text-3xl font-extrabold ${
            card.suit === '♥' || card.suit === '♦' ? 'text-rose-500' : 'text-gray-900 dark:text-gray-100'
          }`}
        >
          {(RANK_LABEL[card.rank] ?? card.rank) + card.suit}
        </div>
      ) : (
        <div className="text-xs text-gray-400 dark:text-gray-500">No card</div>
      )}
    </div>
    <div className="text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500">
      Cards: <span className="font-bold">{count}</span>
    </div>
  </div>
);

export default War;
