import React, { useCallback, useEffect, useRef, useState } from 'react';
import StatusBar, { StatusTone } from '../shared/StatusBar';
import WinOverlay from '../shared/WinOverlay';

type Level = 'five' | 'ten' | 'full';

const RANGE: Record<Level, number> = {
  five: 5,
  ten: 10,
  full: 26,
};

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const shuffle = <T,>(arr: T[]): T[] => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const pickLetters = (level: Level): string[] => {
  const count = RANGE[level];
  // Always start from A so the sequence is predictable
  return shuffle(ALPHABET.slice(0, count));
};

const AlphabetOrder: React.FC<{ isBotEnabled: boolean }> = () => {
  const [level, setLevel] = useState<Level>('five');
  const [letters, setLetters] = useState<string[]>(() => pickLetters('five'));
  const [nextIdx, setNextIdx] = useState(0);
  const [missed, setMissed] = useState<Set<string>>(new Set());
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);
  const [wrong, setWrong] = useState<string | null>(null);
  const startRef = useRef<number | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const reset = useCallback((l: Level = level) => {
    setLevel(l);
    setLetters(pickLetters(l));
    setNextIdx(0);
    setMissed(new Set());
    setElapsed(0);
    setDone(false);
    setWrong(null);
    startRef.current = Date.now();
  }, [level]);

  useEffect(() => {
    if (done) {
      if (tickRef.current) clearInterval(tickRef.current);
      return;
    }
    if (startRef.current === null) startRef.current = Date.now();
    tickRef.current = setInterval(() => {
      if (startRef.current !== null) {
        setElapsed(Math.floor((Date.now() - startRef.current) / 100) / 10);
      }
    }, 100);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [done, level]);

  const pick = (letter: string) => {
    if (done || wrong) return;
    const expected = ALPHABET[nextIdx];
    if (letter === expected) {
      if (nextIdx + 1 >= RANGE[level]) {
        setDone(true);
        setNextIdx(nextIdx + 1);
      } else {
        setNextIdx((n) => n + 1);
      }
    } else {
      setMissed((m) => new Set(m).add(letter));
      setWrong(letter);
      setTimeout(() => setWrong(null), 500);
    }
  };

  const tone: StatusTone = done ? 'success' : 'info';

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-2">
        {(['five', 'ten', 'full'] as Level[]).map((l) => (
          <button
            key={l}
            onClick={() => reset(l)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
              level === l
                ? 'bg-gray-900 text-white border-gray-900 dark:bg-gray-100 dark:text-gray-900 dark:border-gray-100'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
            }`}
          >
            A–{ALPHABET[RANGE[l] - 1]}
          </button>
        ))}
      </div>

      <StatusBar tone={tone}>
        {done
          ? `Done in ${elapsed.toFixed(1)}s · ${missed.size} mistakes`
          : `Find letter ${ALPHABET[nextIdx]} · ${nextIdx}/${RANGE[level]} · ${elapsed.toFixed(1)}s`}
      </StatusBar>

      <div className="relative w-full max-w-2xl p-5 rounded-2xl bg-gradient-to-br from-sky-50 via-white to-pink-50 dark:from-sky-900/20 dark:via-gray-800 dark:to-pink-900/20 border border-gray-200 dark:border-gray-700 shadow-xl">
        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 gap-2 sm:gap-3">
          {letters.map((l) => {
            const isDone = ALPHABET.indexOf(l) < nextIdx;
            const isNext = l === ALPHABET[nextIdx];
            const isWrong = l === wrong;
            const wasMissed = missed.has(l) && !isDone;
            return (
              <button
                key={l}
                onClick={() => pick(l)}
                disabled={isDone || done}
                className={`aspect-square rounded-xl text-2xl sm:text-3xl font-extrabold transition-all shadow-md ${
                  isDone
                    ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-200 opacity-70'
                    : isWrong
                    ? 'bg-rose-500 text-white scale-95 ring-4 ring-rose-300'
                    : isNext
                    ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white ring-2 ring-amber-300 animate-pulse'
                    : wasMissed
                    ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-200 border border-amber-200 dark:border-amber-500/30 hover:scale-105 active:scale-95'
                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 hover:scale-105 active:scale-95'
                }`}
              >
                {l}
              </button>
            );
          })}
        </div>

        {done && (
          <WinOverlay
            title={`${elapsed.toFixed(1)}s`}
            subtitle={missed.size === 0 ? 'Perfect order!' : `${missed.size} mistake${missed.size === 1 ? '' : 's'}`}
            onPlayAgain={() => reset(level)}
            playAgainLabel="New round"
          />
        )}
      </div>
    </div>
  );
};

export default AlphabetOrder;
