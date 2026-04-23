import React, { useCallback, useEffect, useMemo, useState } from 'react';
import StatusBar, { StatusTone } from '../shared/StatusBar';
import WinOverlay from '../shared/WinOverlay';

interface MemoryProps {
  isBotEnabled: boolean;
}

const EMOJIS = [
  '🐶', '🐱', '🦊', '🐼', '🐸', '🦁', '🐙', '🦄',
  '🍎', '🍓', '🍉', '🍕', '⚽', '🎈', '🚀', '🌈',
];

type Card = {
  id: number;
  emoji: string;
  matched: boolean;
  flipped: boolean;
};

type Difficulty = 'easy' | 'normal' | 'hard';

const SIZES: Record<Difficulty, { pairs: number; cols: number; label: string }> = {
  easy: { pairs: 6, cols: 4, label: 'Easy (6 pairs)' },
  normal: { pairs: 8, cols: 4, label: 'Normal (8 pairs)' },
  hard: { pairs: 12, cols: 6, label: 'Hard (12 pairs)' },
};

const buildDeck = (pairs: number): Card[] => {
  const chosen = [...EMOJIS].sort(() => Math.random() - 0.5).slice(0, pairs);
  const deck = [...chosen, ...chosen]
    .map((emoji, idx) => ({ id: idx, emoji, matched: false, flipped: false }))
    .sort(() => Math.random() - 0.5)
    .map((c, i) => ({ ...c, id: i }));
  return deck;
};

const Memory: React.FC<MemoryProps> = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [deck, setDeck] = useState<Card[]>(() => buildDeck(SIZES.normal.pairs));
  const [opened, setOpened] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchedCount, setMatchedCount] = useState(0);
  const [lock, setLock] = useState(false);

  const cols = SIZES[difficulty].cols;
  const won = useMemo(
    () => matchedCount === SIZES[difficulty].pairs,
    [matchedCount, difficulty],
  );

  const reset = useCallback(
    (diff: Difficulty = difficulty) => {
      setDifficulty(diff);
      setDeck(buildDeck(SIZES[diff].pairs));
      setOpened([]);
      setMoves(0);
      setMatchedCount(0);
      setLock(false);
    },
    [difficulty],
  );

  const handleFlip = (id: number) => {
    if (lock || won) return;
    const card = deck[id];
    if (card.flipped || card.matched) return;
    const next = deck.map((c) => (c.id === id ? { ...c, flipped: true } : c));
    setDeck(next);
    const nowOpen = [...opened, id];
    setOpened(nowOpen);

    if (nowOpen.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = nowOpen;
      if (next[a].emoji === next[b].emoji) {
        setTimeout(() => {
          setDeck((d) =>
            d.map((c) => (c.id === a || c.id === b ? { ...c, matched: true } : c)),
          );
          setMatchedCount((n) => n + 1);
          setOpened([]);
        }, 300);
      } else {
        setLock(true);
        setTimeout(() => {
          setDeck((d) =>
            d.map((c) => (c.id === a || c.id === b ? { ...c, flipped: false } : c)),
          );
          setOpened([]);
          setLock(false);
        }, 700);
      }
    }
  };

  useEffect(() => {
    reset('normal');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tone: StatusTone = won ? 'success' : 'info';
  const status = won
    ? `You found all pairs in ${moves} moves!`
    : `Matches: ${matchedCount} / ${SIZES[difficulty].pairs} · Moves: ${moves}`;

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex items-center gap-2 flex-wrap justify-center">
        {(Object.keys(SIZES) as Difficulty[]).map((d) => (
          <button
            key={d}
            onClick={() => reset(d)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              difficulty === d
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
            }`}
          >
            {SIZES[d].label}
          </button>
        ))}
      </div>

      <StatusBar tone={tone}>{status}</StatusBar>

      <div className="relative">
        <div
          className="grid gap-2 md:gap-3 p-3 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-100"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {deck.map((card) => {
            const show = card.flipped || card.matched;
            return (
              <button
                key={card.id}
                onClick={() => handleFlip(card.id)}
                disabled={card.matched || lock}
                className="w-16 h-20 md:w-20 md:h-24 perspective"
                aria-label={show ? `Card ${card.emoji}` : 'Card face down'}
              >
                <div
                  className={`relative w-full h-full transition-transform duration-300 preserve-3d ${
                    show ? 'rotate-y-180' : ''
                  }`}
                >
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-2xl font-bold shadow-md backface-hidden">
                    ?
                  </div>
                  <div
                    className={`absolute inset-0 rounded-xl bg-white shadow-md flex items-center justify-center text-4xl md:text-5xl rotate-y-180 backface-hidden border ${
                      card.matched ? 'border-emerald-400 ring-2 ring-emerald-300' : 'border-gray-200'
                    }`}
                  >
                    {card.emoji}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {won && (
          <WinOverlay
            title="All pairs found!"
            subtitle={`You did it in ${moves} moves.`}
            onPlayAgain={() => reset(difficulty)}
          />
        )}
      </div>

      <style>{`
        .perspective { perspective: 800px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};

export default Memory;
