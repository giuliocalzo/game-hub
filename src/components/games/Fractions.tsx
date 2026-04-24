import React, { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import StatusBar, { StatusTone } from '../shared/StatusBar';
import WinOverlay from '../shared/WinOverlay';

type Level = 'easy' | 'medium' | 'hard';

interface Tile {
  id: number;
  n: number; // numerator
  d: number; // denominator
  picked: boolean;
}

const EPSILON = 1e-9;

// Level: how many tiles in the pool and which denominators are used.
const LEVEL_CONFIG: Record<Level, { poolSize: number; denominators: number[] }> = {
  easy: { poolSize: 8, denominators: [2, 3, 4, 6] },
  medium: { poolSize: 10, denominators: [2, 3, 4, 5, 6, 8] },
  hard: { poolSize: 12, denominators: [2, 3, 4, 5, 6, 8, 10, 12] },
};

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

const simplify = (n: number, d: number): [number, number] => {
  const g = gcd(Math.abs(n), Math.abs(d));
  return [n / g, d / g];
};

const TOTAL_ROUNDS = 8;

const ANIMALS = ['🐶', '🐱', '🐰', '🐼', '🦊', '🐸', '🐵', '🦁', '🐻', '🐨'];

const buildPool = (level: Level): Tile[] => {
  const { poolSize, denominators } = LEVEL_CONFIG[level];
  // Ensure at least one solvable subset exists.
  // Strategy: pick 2-4 tiles that sum to 1, then fill with decoys.
  const target = 1;

  const pickWinningSet = (): Array<[number, number]> => {
    // Choose 2-4 tiles
    const count = 2 + Math.floor(Math.random() * 3); // 2, 3, or 4
    const parts: Array<[number, number]> = [];
    // Use common denominators from the level
    const useDen = denominators[Math.floor(Math.random() * denominators.length)];
    let remaining = useDen;
    for (let i = 0; i < count - 1; i++) {
      const take = 1 + Math.floor(Math.random() * (remaining - (count - 1 - i)));
      const clamped = Math.max(1, Math.min(remaining - (count - 1 - i), take));
      parts.push([clamped, useDen]);
      remaining -= clamped;
    }
    parts.push([remaining, useDen]);
    // Simplify each
    return parts.map(([n, d]) => simplify(n, d));
  };

  const winning = pickWinningSet();
  const pool: Array<[number, number]> = [...winning];
  while (pool.length < poolSize) {
    const d = denominators[Math.floor(Math.random() * denominators.length)];
    const n = 1 + Math.floor(Math.random() * (d - 1));
    const s = simplify(n, d);
    // Avoid making pool too simple — don't add 1/1
    if (s[0] / s[1] >= 1 - EPSILON) continue;
    pool.push(s);
  }
  // Shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.map(([n, d], id) => ({ id, n, d, picked: false }));
};

const sumTiles = (tiles: Tile[]): number =>
  tiles.filter((t) => t.picked).reduce((s, t) => s + t.n / t.d, 0);

const Fractions: React.FC<{ isBotEnabled: boolean }> = () => {
  const [level, setLevel] = useState<Level>('easy');
  const [tiles, setTiles] = useState<Tile[]>(() => buildPool('easy'));
  const [animal, setAnimal] = useState(() => ANIMALS[Math.floor(Math.random() * ANIMALS.length)]);
  const [asked, setAsked] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'ok' | 'over' | null>(null);
  const [done, setDone] = useState(false);

  const nextRound = useCallback((l: Level) => {
    setTiles(buildPool(l));
    setAnimal(ANIMALS[Math.floor(Math.random() * ANIMALS.length)]);
    setFeedback(null);
  }, []);

  const reset = useCallback((l: Level = level) => {
    setLevel(l);
    setAsked(0);
    setScore(0);
    setDone(false);
    nextRound(l);
  }, [level, nextRound]);

  const current = sumTiles(tiles);

  useEffect(() => {
    if (feedback || done) return;
    if (Math.abs(current - 1) < EPSILON) {
      setFeedback('ok');
      setScore((s) => s + 1);
      setTimeout(() => {
        if (asked + 1 >= TOTAL_ROUNDS) setDone(true);
        else {
          setAsked((n) => n + 1);
          nextRound(level);
        }
      }, 1100);
    } else if (current > 1 + EPSILON) {
      setFeedback('over');
      setTimeout(() => {
        // Reset the round
        setTiles((prev) => prev.map((t) => ({ ...t, picked: false })));
        setFeedback(null);
      }, 700);
    }
  }, [current, feedback, done, asked, level, nextRound]);

  const togglePick = (id: number) => {
    if (feedback || done) return;
    setTiles((arr) => arr.map((t) => (t.id === id ? { ...t, picked: !t.picked } : t)));
  };

  const reveal = feedback === 'ok';
  const tone: StatusTone = done ? 'success' : feedback === 'over' ? 'warning' : 'info';

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-2">
        {(['easy', 'medium', 'hard'] as Level[]).map((l) => (
          <button
            key={l}
            onClick={() => reset(l)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
              level === l
                ? 'bg-gray-900 text-white border-gray-900 dark:bg-gray-100 dark:text-gray-900 dark:border-gray-100'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
            }`}
          >
            {l}
          </button>
        ))}
        <button
          onClick={() => reset(level)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <RefreshCw className="w-3.5 h-3.5" /> New
        </button>
      </div>

      <StatusBar tone={tone}>
        {done
          ? `Round complete — ${score}/${TOTAL_ROUNDS}`
          : feedback === 'over'
          ? 'Over 1 — resetting!'
          : `Question ${asked + 1}/${TOTAL_ROUNDS} · Score ${score} · Pick fractions that sum to 1`}
      </StatusBar>

      <div className="relative w-full max-w-xl p-5 rounded-2xl bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-amber-900/20 dark:via-gray-800 dark:to-orange-900/20 border border-gray-200 dark:border-gray-700 shadow-xl flex flex-col items-center gap-5">
        {/* Animal reveal panel */}
        <div className="relative w-32 h-32 rounded-2xl bg-gradient-to-br from-sky-200 to-indigo-300 dark:from-sky-700 dark:to-indigo-800 shadow-inner flex items-center justify-center overflow-hidden">
          <span className={`text-7xl transition-all duration-500 ${reveal ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}>
            {animal}
          </span>
          {!reveal && (
            <span className="absolute inset-0 flex items-center justify-center text-5xl text-white/80 font-extrabold">
              ?
            </span>
          )}
        </div>

        {/* Current sum indicator */}
        <div className={`text-lg font-bold ${
          current > 1 + EPSILON ? 'text-rose-600 dark:text-rose-400' : current === 1 ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-300'
        }`}>
          Sum: {current === 0 ? '0' : current.toFixed(2).replace(/\.?0+$/, '')} / 1
        </div>

        {/* Fraction tiles */}
        <div className="grid grid-cols-4 gap-2 w-full">
          {tiles.map((t) => (
            <button
              key={t.id}
              onClick={() => togglePick(t.id)}
              disabled={!!feedback || done}
              className={`flex flex-col items-center justify-center py-2 rounded-xl border-2 font-extrabold text-lg transition ${
                t.picked
                  ? 'bg-indigo-500 text-white border-indigo-600 scale-95 shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10'
              }`}
            >
              <span className="text-2xl leading-none">{t.n}</span>
              <span className={`block w-8 border-t-2 my-0.5 ${t.picked ? 'border-white' : 'border-gray-900 dark:border-gray-100'}`} />
              <span className="text-2xl leading-none">{t.d}</span>
            </button>
          ))}
        </div>

        {done && (
          <WinOverlay
            title={`${score}/${TOTAL_ROUNDS}`}
            subtitle={score === TOTAL_ROUNDS ? 'Fraction wizard!' : 'Nice work'}
            onPlayAgain={() => reset(level)}
            playAgainLabel="New round"
          />
        )}
      </div>
    </div>
  );
};

export default Fractions;
