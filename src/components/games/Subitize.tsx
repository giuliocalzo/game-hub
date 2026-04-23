import React, { useCallback, useEffect, useRef, useState } from 'react';
import StatusBar, { StatusTone } from '../shared/StatusBar';
import WinOverlay from '../shared/WinOverlay';

type Level = 'easy' | 'medium' | 'hard';

interface Dot {
  x: number;
  y: number;
  color: string;
}

const W = 360;
const H = 240;

const COLORS = ['#f97316', '#10b981', '#3b82f6', '#a855f7', '#ec4899', '#eab308'];

const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const range = (level: Level): [number, number] =>
  level === 'easy' ? [1, 5] : level === 'medium' ? [4, 9] : [6, 15];

const flashMs = (level: Level): number =>
  level === 'easy' ? 1400 : level === 'medium' ? 900 : 600;

const generateDots = (count: number): Dot[] => {
  const dots: Dot[] = [];
  const r = 20;
  let guard = 0;
  while (dots.length < count && guard < 400) {
    guard++;
    const x = randInt(r + 10, W - r - 10);
    const y = randInt(r + 10, H - r - 10);
    if (dots.every((d) => (d.x - x) ** 2 + (d.y - y) ** 2 > (r * 2 + 4) ** 2)) {
      dots.push({ x, y, color: COLORS[randInt(0, COLORS.length - 1)] });
    }
  }
  return dots;
};

const buildOptions = (count: number, level: Level): number[] => {
  const set = new Set<number>([count]);
  const [lo, hi] = range(level);
  while (set.size < 4) {
    const delta = randInt(-3, 3);
    const v = Math.max(lo, Math.min(hi, count + delta));
    if (v !== count) set.add(v);
  }
  return Array.from(set).sort((a, b) => a - b);
};

const TOTAL = 10;

const Subitize: React.FC<{ isBotEnabled: boolean }> = () => {
  const [level, setLevel] = useState<Level>('easy');
  const [count, setCount] = useState(() => randInt(1, 5));
  const [dots, setDots] = useState<Dot[]>(() => generateDots(count));
  const [options, setOptions] = useState<number[]>(() => buildOptions(count, 'easy'));
  const [phase, setPhase] = useState<'flash' | 'answer' | 'feedback'>('flash');
  const [asked, setAsked] = useState(0);
  const [score, setScore] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const nextRound = useCallback((l: Level) => {
    const [lo, hi] = range(l);
    const c = randInt(lo, hi);
    setCount(c);
    setDots(generateDots(c));
    setOptions(buildOptions(c, l));
    setPick(null);
    setPhase('flash');
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setPhase('answer'), flashMs(l));
  }, []);

  const reset = useCallback((l: Level = level) => {
    setLevel(l);
    setAsked(0);
    setScore(0);
    setDone(false);
    nextRound(l);
  }, [level, nextRound]);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const pickOption = (opt: number) => {
    if (phase !== 'answer' || done) return;
    setPick(opt);
    setPhase('feedback');
    if (opt === count) setScore((s) => s + 1);
    timerRef.current = setTimeout(() => {
      if (asked + 1 >= TOTAL) {
        setDone(true);
      } else {
        setAsked((n) => n + 1);
        nextRound(level);
      }
    }, 1000);
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
          : `Question ${asked + 1}/${TOTAL} · Score ${score} · ${
              phase === 'flash' ? 'Look!' : 'How many?'
            }`}
      </StatusBar>

      <div className="relative w-full max-w-md p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl flex flex-col items-center gap-4">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full rounded-xl"
          style={{
            background: 'linear-gradient(135deg, #ecfeff 0%, #dbeafe 100%)',
            aspectRatio: `${W} / ${H}`,
          }}
        >
          {phase === 'flash' ? (
            dots.map((d, i) => (
              <circle key={i} cx={d.x} cy={d.y} r={18} fill={d.color} stroke="rgba(0,0,0,0.15)" strokeWidth={1} />
            ))
          ) : (
            <>
              <rect x={0} y={0} width={W} height={H} fill="rgba(15,23,42,0.05)" />
              <text
                x={W / 2}
                y={H / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={80}
                fontWeight={900}
                fill="#0f172a"
                opacity={0.4}
              >
                ?
              </text>
            </>
          )}
        </svg>

        <div className="grid grid-cols-4 gap-2 w-full">
          {options.map((opt) => {
            const isPicked = pick === opt;
            const isCorrect = phase === 'feedback' && opt === count;
            return (
              <button
                key={opt}
                onClick={() => pickOption(opt)}
                disabled={phase !== 'answer' || done}
                className={`py-3 rounded-xl text-xl font-extrabold border-2 transition ${
                  phase === 'feedback'
                    ? isCorrect
                      ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-200 border-emerald-300 dark:border-emerald-500/40'
                      : isPicked
                      ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-200 border-rose-300 dark:border-rose-500/40'
                      : 'bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700'
                    : phase === 'flash'
                    ? 'bg-white dark:bg-gray-800 text-gray-300 dark:text-gray-600 border-gray-100 dark:border-gray-700 cursor-not-allowed'
                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 hover:border-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-500/10'
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
            subtitle={score === TOTAL ? 'Sharp eyes!' : 'Quick counting takes practice'}
            onPlayAgain={() => reset(level)}
            playAgainLabel="New round"
          />
        )}
      </div>
    </div>
  );
};

export default Subitize;
