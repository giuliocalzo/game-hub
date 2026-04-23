import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Shuffle } from 'lucide-react';
import StatusBar, { StatusTone } from '../shared/StatusBar';
import WinOverlay from '../shared/WinOverlay';
import { WORD_SEARCH_POOLS } from '../../i18n/content';
import { useTranslation } from '../../i18n/I18nContext';

interface Tile {
  id: number;
  letter: string;
  used: boolean;
}

const TOTAL = 8;

const shuffleArr = <T,>(arr: T[]): T[] => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const scrambleWord = (word: string): string[] => {
  const letters = word.split('');
  let attempts = 0;
  while (attempts < 20) {
    const shuffled = shuffleArr(letters);
    if (shuffled.join('') !== word) return shuffled;
    attempts++;
  }
  return letters;
};

const WordScramble: React.FC<{ isBotEnabled: boolean }> = () => {
  const { lang } = useTranslation();
  const pool = useMemo(() => {
    const allPools = WORD_SEARCH_POOLS[lang] ?? WORD_SEARCH_POOLS.en;
    return allPools.flat().filter((w) => w.length >= 4);
  }, [lang]);

  const [target, setTarget] = useState<string>(() => pool[Math.floor(Math.random() * pool.length)]);
  const [tiles, setTiles] = useState<Tile[]>(() =>
    scrambleWord(target).map((l, i) => ({ id: i, letter: l, used: false })),
  );
  const [picked, setPicked] = useState<number[]>([]);
  const [asked, setAsked] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'ok' | 'bad' | null>(null);
  const [done, setDone] = useState(false);

  const nextRound = useCallback(() => {
    const word = pool[Math.floor(Math.random() * pool.length)];
    setTarget(word);
    setTiles(scrambleWord(word).map((l, i) => ({ id: i, letter: l, used: false })));
    setPicked([]);
    setFeedback(null);
  }, [pool]);

  const reset = useCallback(() => {
    setAsked(0);
    setScore(0);
    setDone(false);
    nextRound();
  }, [nextRound]);

  // When language changes, reset the game
  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const pickTile = (tileId: number) => {
    if (feedback || done) return;
    const t = tiles.find((x) => x.id === tileId);
    if (!t || t.used) return;
    setTiles((all) => all.map((x) => (x.id === tileId ? { ...x, used: true } : x)));
    setPicked((p) => [...p, tileId]);
  };

  const unpickLast = () => {
    if (feedback || done) return;
    setPicked((p) => {
      if (p.length === 0) return p;
      const lastId = p[p.length - 1];
      setTiles((all) => all.map((x) => (x.id === lastId ? { ...x, used: false } : x)));
      return p.slice(0, -1);
    });
  };

  const clearAll = () => {
    if (feedback || done) return;
    setTiles((all) => all.map((x) => ({ ...x, used: false })));
    setPicked([]);
  };

  // Check when full
  useEffect(() => {
    if (done || feedback) return;
    if (picked.length !== target.length) return;
    const guess = picked.map((id) => tiles.find((t) => t.id === id)!.letter).join('');
    const ok = guess === target;
    setFeedback(ok ? 'ok' : 'bad');
    if (ok) setScore((s) => s + 1);
    const t = setTimeout(() => {
      if (asked + 1 >= TOTAL) {
        setDone(true);
      } else {
        setAsked((n) => n + 1);
        nextRound();
      }
    }, 900);
    return () => clearTimeout(t);
  }, [picked, target, tiles, asked, nextRound, done, feedback]);

  const tone: StatusTone = done ? 'success' : feedback === 'bad' ? 'warning' : 'info';

  const guessLetters = picked.map((id) => tiles.find((t) => t.id === id)!.letter);

  return (
    <div className="flex flex-col items-center gap-4">
      <StatusBar tone={tone}>
        {done
          ? `Round complete — ${score}/${TOTAL}`
          : `Word ${asked + 1}/${TOTAL} · Score ${score}`}
      </StatusBar>

      <div className="relative w-full max-w-xl p-6 rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-sky-50 dark:from-emerald-900/20 dark:via-gray-800 dark:to-sky-900/20 border border-gray-200 dark:border-gray-700 shadow-xl flex flex-col items-center gap-5">
        {/* Answer slots */}
        <div className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap min-h-[4rem]">
          {Array.from({ length: target.length }).map((_, i) => {
            const letter = guessLetters[i];
            const showOk = feedback === 'ok';
            const showBad = feedback === 'bad';
            return (
              <div
                key={i}
                className={`w-10 h-12 sm:w-12 sm:h-14 rounded-lg flex items-center justify-center text-2xl sm:text-3xl font-extrabold border-2 transition ${
                  letter
                    ? showOk
                      ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-200 border-emerald-300 dark:border-emerald-500/50'
                      : showBad
                      ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-200 border-rose-300 dark:border-rose-500/50'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 shadow-sm'
                    : 'bg-white/50 dark:bg-gray-900/40 border-dashed border-gray-300 dark:border-gray-600'
                }`}
              >
                {letter ? letter.toUpperCase() : ''}
              </div>
            );
          })}
        </div>

        {/* Letter tiles */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
          {tiles.map((t) => (
            <button
              key={t.id}
              onClick={() => pickTile(t.id)}
              disabled={t.used || !!feedback || done}
              className={`w-10 h-12 sm:w-12 sm:h-14 rounded-lg text-xl sm:text-2xl font-extrabold transition shadow ${
                t.used
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-br from-indigo-400 to-purple-500 text-white hover:scale-105 active:scale-95'
              }`}
            >
              {t.letter.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={unpickLast}
            disabled={picked.length === 0 || !!feedback || done}
            className="px-3 py-2 rounded-full text-sm font-semibold bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            ⌫ Backspace
          </button>
          <button
            onClick={clearAll}
            disabled={picked.length === 0 || !!feedback || done}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            <Shuffle className="w-4 h-4" /> Clear
          </button>
        </div>

        {done && (
          <WinOverlay
            title={`${score}/${TOTAL} correct`}
            subtitle={score === TOTAL ? 'Word wizard!' : 'Another round?'}
            onPlayAgain={reset}
            playAgainLabel="New round"
          />
        )}
      </div>
    </div>
  );
};

export default WordScramble;
