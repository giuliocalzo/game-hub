import React, { useCallback, useEffect, useState } from 'react';
import StatusBar, { StatusTone } from '../shared/StatusBar';
import WinOverlay from '../shared/WinOverlay';
import { RefreshCw } from 'lucide-react';

interface Card {
  id: number;
  value: number;
  matched: boolean;
}

// Target sums per level
type Level = 'ten' | 'twenty' | 'hundred';

const LEVEL_TARGET: Record<Level, number> = {
  ten: 10,
  twenty: 20,
  hundred: 100,
};

const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const shuffle = <T,>(arr: T[]): T[] => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const generateDeck = (level: Level, pairs = 8): Card[] => {
  const target = LEVEL_TARGET[level];
  const values: number[] = [];
  for (let i = 0; i < pairs; i++) {
    let a: number;
    if (level === 'ten') {
      a = randInt(1, 9);
    } else if (level === 'twenty') {
      a = randInt(1, 19);
    } else {
      // hundred: multiples of 5
      a = randInt(1, 19) * 5;
    }
    const b = target - a;
    values.push(a, b);
  }
  return shuffle(values).map((v, i) => ({ id: i, value: v, matched: false }));
};

const CARD_COLORS = [
  'from-pink-400 to-rose-500',
  'from-blue-400 to-indigo-500',
  'from-emerald-400 to-teal-500',
  'from-amber-400 to-orange-500',
  'from-purple-400 to-fuchsia-500',
  'from-cyan-400 to-sky-500',
];

const MakeTen: React.FC<{ isBotEnabled: boolean }> = () => {
  const [level, setLevel] = useState<Level>('ten');
  const [deck, setDeck] = useState<Card[]>(() => generateDeck('ten'));
  const [selected, setSelected] = useState<number[]>([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [moves, setMoves] = useState(0);
  const [done, setDone] = useState(false);
  const [flash, setFlash] = useState<'ok' | 'bad' | null>(null);

  const reset = useCallback((l: Level = level) => {
    setLevel(l);
    setDeck(generateDeck(l));
    setSelected([]);
    setMatchedCount(0);
    setMoves(0);
    setDone(false);
    setFlash(null);
  }, [level]);

  const target = LEVEL_TARGET[level];

  useEffect(() => {
    if (selected.length !== 2) return;
    const [aId, bId] = selected;
    const a = deck.find((c) => c.id === aId)!;
    const b = deck.find((c) => c.id === bId)!;
    setMoves((m) => m + 1);
    if (a.value + b.value === target) {
      setFlash('ok');
      setTimeout(() => {
        setDeck((d) =>
          d.map((c) => (c.id === aId || c.id === bId ? { ...c, matched: true } : c)),
        );
        setMatchedCount((n) => n + 2);
        setSelected([]);
        setFlash(null);
      }, 380);
    } else {
      setFlash('bad');
      setTimeout(() => {
        setSelected([]);
        setFlash(null);
      }, 700);
    }
  }, [selected, deck, target]);

  useEffect(() => {
    if (matchedCount === deck.length && deck.length > 0) setDone(true);
  }, [matchedCount, deck.length]);

  const pick = (id: number) => {
    if (done) return;
    if (selected.includes(id)) return;
    if (selected.length >= 2) return;
    const card = deck.find((c) => c.id === id);
    if (!card || card.matched) return;
    setSelected((s) => [...s, id]);
  };

  const tone: StatusTone = done ? 'success' : 'info';

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-2">
        {(Object.keys(LEVEL_TARGET) as Level[]).map((l) => (
          <button
            key={l}
            onClick={() => reset(l)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
              level === l
                ? 'bg-gray-900 text-white border-gray-900 dark:bg-gray-100 dark:text-gray-900 dark:border-gray-100'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
            }`}
          >
            Make {LEVEL_TARGET[l]}
          </button>
        ))}
        <button
          onClick={() => reset(level)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <RefreshCw className="w-3.5 h-3.5" /> New deck
        </button>
      </div>

      <StatusBar tone={tone}>
        {done
          ? `Solved in ${moves} moves!`
          : `Pair cards that add up to ${target} · ${matchedCount / 2}/${deck.length / 2} pairs · ${moves} moves`}
      </StatusBar>

      <div className="relative w-full max-w-xl">
        <div className="grid grid-cols-4 gap-2 sm:gap-3 p-3 rounded-2xl bg-gradient-to-br from-slate-100 to-blue-100 dark:from-slate-800 dark:to-slate-900 shadow-inner">
          {deck.map((c, i) => {
            const isSelected = selected.includes(c.id);
            const gradient = CARD_COLORS[i % CARD_COLORS.length];
            const isFlashOk = isSelected && flash === 'ok';
            const isFlashBad = isSelected && flash === 'bad';
            return (
              <button
                key={c.id}
                onClick={() => pick(c.id)}
                disabled={c.matched || done}
                className={`aspect-square rounded-xl font-extrabold text-2xl sm:text-3xl flex items-center justify-center transition-all shadow ${
                  c.matched
                    ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-200 opacity-70'
                    : isFlashOk
                    ? 'bg-emerald-500 text-white scale-95 ring-4 ring-emerald-300'
                    : isFlashBad
                    ? 'bg-rose-500 text-white ring-4 ring-rose-300'
                    : isSelected
                    ? `bg-gradient-to-br ${gradient} text-white scale-95 ring-4 ring-white dark:ring-gray-700`
                    : `bg-gradient-to-br ${gradient} text-white hover:scale-105 active:scale-95`
                }`}
                aria-label={`Card ${c.value}${c.matched ? ' matched' : ''}`}
              >
                {c.value}
              </button>
            );
          })}
        </div>

        {done && (
          <WinOverlay
            title={`Cleared in ${moves} moves`}
            subtitle="All pairs matched!"
            onPlayAgain={() => reset(level)}
            playAgainLabel="New deck"
          />
        )}
      </div>
    </div>
  );
};

export default MakeTen;
