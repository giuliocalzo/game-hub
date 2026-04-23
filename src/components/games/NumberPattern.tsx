import React, { useCallback, useEffect, useRef, useState } from 'react';
import StatusBar, { StatusTone } from '../shared/StatusBar';
import WinOverlay from '../shared/WinOverlay';

type Level = 'easy' | 'medium' | 'hard';

const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

interface Puzzle {
  sequence: Array<number | null>; // one entry is null
  missingIndex: number;
  answer: number;
  label: string;
}

const TOTAL = 8;

const generateArithmetic = (level: Level): Puzzle => {
  const step = level === 'easy' ? randInt(1, 5) : level === 'medium' ? randInt(2, 10) : randInt(3, 15);
  const dir = Math.random() < 0.5 ? 1 : -1;
  const start = level === 'easy' ? randInt(1, 10) : randInt(5, 50);
  const length = 5;
  const seq: number[] = [];
  for (let i = 0; i < length; i++) seq.push(start + dir * step * i);
  const idx = randInt(1, length - 1);
  const answer = seq[idx];
  const display: Array<number | null> = seq.map((v, i) => (i === idx ? null : v));
  return {
    sequence: display,
    missingIndex: idx,
    answer,
    label: dir > 0 ? `+${step}` : `\u2212${Math.abs(step)}`,
  };
};

const generateGeometric = (level: Level): Puzzle => {
  const factor = level === 'hard' ? randInt(2, 4) : 2;
  const start = randInt(1, level === 'hard' ? 5 : 3);
  const length = 5;
  const seq: number[] = [];
  for (let i = 0; i < length; i++) seq.push(start * Math.pow(factor, i));
  const idx = randInt(1, length - 1);
  const answer = seq[idx];
  const display: Array<number | null> = seq.map((v, i) => (i === idx ? null : v));
  return {
    sequence: display,
    missingIndex: idx,
    answer,
    label: `\u00D7${factor}`,
  };
};

const generatePuzzle = (level: Level): Puzzle => {
  if (level === 'easy') return generateArithmetic('easy');
  if (level === 'medium') return generateArithmetic('medium');
  // hard: sometimes geometric
  return Math.random() < 0.5 ? generateArithmetic('hard') : generateGeometric('hard');
};

const buildOptions = (answer: number): number[] => {
  const set = new Set<number>([answer]);
  while (set.size < 4) {
    const delta = randInt(-Math.max(3, Math.abs(answer) / 2), Math.max(3, Math.abs(answer) / 2));
    const v = answer + (delta || 1);
    if (v >= 0) set.add(v);
  }
  return Array.from(set).sort(() => Math.random() - 0.5);
};

const NumberPattern: React.FC<{ isBotEnabled: boolean }> = () => {
  const [level, setLevel] = useState<Level>('easy');
  const [puzzle, setPuzzle] = useState<Puzzle>(() => generatePuzzle('easy'));
  const [options, setOptions] = useState<number[]>(() => buildOptions(puzzle.answer));
  const [asked, setAsked] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<{ ok: boolean; pick: number } | null>(null);
  const [done, setDone] = useState(false);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const nextRound = useCallback((l: Level) => {
    const p = generatePuzzle(l);
    setPuzzle(p);
    setOptions(buildOptions(p.answer));
    setFeedback(null);
  }, []);

  const reset = useCallback((l: Level = level) => {
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    setLevel(l);
    setAsked(0);
    setScore(0);
    setDone(false);
    nextRound(l);
  }, [level, nextRound]);

  useEffect(() => () => {
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
  }, []);

  const pick = (opt: number) => {
    if (feedback || done) return;
    const correct = opt === puzzle.answer;
    setFeedback({ ok: correct, pick: opt });
    if (correct) setScore((s) => s + 1);
    feedbackTimer.current = setTimeout(() => {
      if (asked + 1 >= TOTAL) {
        setDone(true);
      } else {
        setAsked((n) => n + 1);
        nextRound(level);
      }
    }, 900);
  };

  const tone: StatusTone = done ? 'success' : 'info';

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
      </div>

      <StatusBar tone={tone}>
        {done
          ? `Round complete — ${score}/${TOTAL}`
          : `Question ${asked + 1}/${TOTAL} · Score ${score}`}
      </StatusBar>

      <div className="relative w-full max-w-xl p-6 rounded-2xl bg-gradient-to-br from-indigo-50 via-white to-sky-50 dark:from-indigo-900/30 dark:via-gray-800 dark:to-sky-900/30 border border-gray-200 dark:border-gray-700 shadow-xl flex flex-col items-center gap-5">
        <div className="text-xs font-semibold tracking-wider uppercase text-indigo-500 dark:text-indigo-300">
          Rule: {puzzle.label}
        </div>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {puzzle.sequence.map((v, i) => (
            <React.Fragment key={i}>
              <div
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex items-center justify-center text-2xl sm:text-3xl font-extrabold border-2 ${
                  v === null
                    ? 'border-dashed border-amber-400 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-200'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 shadow'
                }`}
              >
                {v === null ? '?' : v}
              </div>
              {i < puzzle.sequence.length - 1 && (
                <span className="text-gray-400 dark:text-gray-500 font-bold">→</span>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 w-full sm:w-80">
          {options.map((opt) => {
            const isPicked = feedback?.pick === opt;
            const isCorrect = feedback && opt === puzzle.answer;
            return (
              <button
                key={opt}
                onClick={() => pick(opt)}
                disabled={!!feedback || done}
                className={`py-3 rounded-xl text-lg sm:text-xl font-extrabold border-2 transition ${
                  feedback
                    ? isCorrect
                      ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-200 border-emerald-300 dark:border-emerald-500/40'
                      : isPicked
                      ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-200 border-rose-300 dark:border-rose-500/40'
                      : 'bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700'
                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10'
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {done && (
          <WinOverlay
            title={`${score}/${TOTAL} correct`}
            subtitle={score === TOTAL ? 'Pattern pro!' : 'Keep spotting the pattern'}
            onPlayAgain={() => reset(level)}
            playAgainLabel="New round"
          />
        )}
      </div>
    </div>
  );
};

export default NumberPattern;
