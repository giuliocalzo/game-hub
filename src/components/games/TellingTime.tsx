import React, { useCallback, useState } from 'react';
import StatusBar, { StatusTone } from '../shared/StatusBar';
import WinOverlay from '../shared/WinOverlay';

type Level = 'hour' | 'half' | 'quarter' | 'minute';

const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const TOTAL = 8;

const pickTime = (level: Level): { h: number; m: number } => {
  const h = randInt(1, 12);
  let m = 0;
  if (level === 'hour') m = 0;
  else if (level === 'half') m = [0, 30][randInt(0, 1)];
  else if (level === 'quarter') m = [0, 15, 30, 45][randInt(0, 3)];
  else m = randInt(0, 11) * 5;
  return { h, m };
};

const fmt = (h: number, m: number) => `${h}:${m.toString().padStart(2, '0')}`;

const buildOptions = (answer: { h: number; m: number }, level: Level): string[] => {
  const set = new Set<string>([fmt(answer.h, answer.m)]);
  while (set.size < 4) {
    const t = pickTime(level);
    set.add(fmt(t.h, t.m));
  }
  return Array.from(set).sort(() => Math.random() - 0.5);
};

const Clock: React.FC<{ h: number; m: number; size?: number }> = ({ h, m, size = 240 }) => {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 10;

  const minuteAngle = (m / 60) * 360 - 90;
  const hourAngle = (((h % 12) + m / 60) / 12) * 360 - 90;

  const tickLabels = [];
  for (let i = 1; i <= 12; i++) {
    const a = (i / 12) * 360 - 90;
    const rad = (a * Math.PI) / 180;
    const tx = cx + Math.cos(rad) * (r - 22);
    const ty = cy + Math.sin(rad) * (r - 22);
    tickLabels.push(
      <text
        key={i}
        x={tx}
        y={ty}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={18}
        fontWeight={700}
        fill="#0f172a"
      >
        {i}
      </text>,
    );
  }

  const ticks = [];
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * 360 - 90;
    const rad = (a * Math.PI) / 180;
    const x1 = cx + Math.cos(rad) * (r - 4);
    const y1 = cy + Math.sin(rad) * (r - 4);
    const x2 = cx + Math.cos(rad) * r;
    const y2 = cy + Math.sin(rad) * r;
    ticks.push(
      <line
        key={i}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={i % 5 === 0 ? '#0f172a' : '#94a3b8'}
        strokeWidth={i % 5 === 0 ? 2 : 1}
      />,
    );
  }

  const hourRad = (hourAngle * Math.PI) / 180;
  const minRad = (minuteAngle * Math.PI) / 180;

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="drop-shadow-xl">
      <circle cx={cx} cy={cy} r={r} fill="#fefce8" stroke="#0f172a" strokeWidth={4} />
      <circle cx={cx} cy={cy} r={r - 10} fill="none" stroke="#fde68a" strokeWidth={1} />
      {ticks}
      {tickLabels}
      {/* Hour hand */}
      <line
        x1={cx}
        y1={cy}
        x2={cx + Math.cos(hourRad) * (r * 0.52)}
        y2={cy + Math.sin(hourRad) * (r * 0.52)}
        stroke="#0f172a"
        strokeWidth={6}
        strokeLinecap="round"
      />
      {/* Minute hand */}
      <line
        x1={cx}
        y1={cy}
        x2={cx + Math.cos(minRad) * (r * 0.78)}
        y2={cy + Math.sin(minRad) * (r * 0.78)}
        stroke="#1d4ed8"
        strokeWidth={4}
        strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r={6} fill="#0f172a" />
      <circle cx={cx} cy={cy} r={2} fill="#fef3c7" />
    </svg>
  );
};

const TellingTime: React.FC<{ isBotEnabled: boolean }> = () => {
  const [level, setLevel] = useState<Level>('hour');
  const [answer, setAnswer] = useState(() => pickTime('hour'));
  const [options, setOptions] = useState(() => buildOptions({ h: answer.h, m: answer.m }, 'hour'));
  const [asked, setAsked] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<{ ok: boolean; pick: string } | null>(null);
  const [done, setDone] = useState(false);

  const reset = useCallback((l: Level = level) => {
    setLevel(l);
    const a = pickTime(l);
    setAnswer(a);
    setOptions(buildOptions(a, l));
    setAsked(0);
    setScore(0);
    setFeedback(null);
    setDone(false);
  }, [level]);

  const nextRound = () => {
    if (asked + 1 >= TOTAL) {
      setDone(true);
      return;
    }
    const a = pickTime(level);
    setAnswer(a);
    setOptions(buildOptions(a, level));
    setAsked((n) => n + 1);
    setFeedback(null);
  };

  const pick = (opt: string) => {
    if (feedback || done) return;
    const correct = opt === fmt(answer.h, answer.m);
    setFeedback({ ok: correct, pick: opt });
    if (correct) setScore((s) => s + 1);
    setTimeout(nextRound, 900);
  };

  const tone: StatusTone = done ? 'success' : 'info';

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap gap-2 justify-center">
        {(['hour', 'half', 'quarter', 'minute'] as Level[]).map((l) => (
          <button
            key={l}
            onClick={() => reset(l)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
              level === l
                ? 'bg-gray-900 text-white border-gray-900 dark:bg-gray-100 dark:text-gray-900 dark:border-gray-100'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
            }`}
          >
            {l === 'hour' ? 'o\u2019clock' : l === 'half' ? 'half hour' : l === 'quarter' ? 'quarter' : '5-min'}
          </button>
        ))}
      </div>

      <StatusBar tone={tone}>
        {done
          ? `Round complete — ${score}/${TOTAL}`
          : `Question ${asked + 1}/${TOTAL} · Score ${score}`}
      </StatusBar>

      <div className="relative w-full max-w-md p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl flex flex-col items-center gap-4">
        <Clock h={answer.h} m={answer.m} />

        <div className="grid grid-cols-2 gap-2 w-full">
          {options.map((opt) => {
            const isPicked = feedback?.pick === opt;
            const isCorrect = feedback && opt === fmt(answer.h, answer.m);
            return (
              <button
                key={opt}
                onClick={() => pick(opt)}
                disabled={!!feedback || done}
                className={`py-3 rounded-xl text-xl font-extrabold border-2 transition ${
                  feedback
                    ? isCorrect
                      ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-200 border-emerald-300 dark:border-emerald-500/40'
                      : isPicked
                      ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-200 border-rose-300 dark:border-rose-500/40'
                      : 'bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700'
                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-500/10'
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
            subtitle={score === TOTAL ? 'Clock master!' : 'Tick-tock — try again?'}
            onPlayAgain={() => reset(level)}
            playAgainLabel="New round"
          />
        )}
      </div>
    </div>
  );
};

export default TellingTime;
