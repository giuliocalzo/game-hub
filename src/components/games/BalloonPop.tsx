import React, { useCallback, useEffect, useRef, useState } from 'react';
import StatusBar, { StatusTone } from '../shared/StatusBar';
import WinOverlay from '../shared/WinOverlay';

type Level = 'easy' | 'medium' | 'hard';
type Op = '+' | '−' | '×';

interface Balloon {
  id: number;
  x: number; // 0..1
  y: number; // 0..1, 0 top 1 bottom
  color: string;
  value: number;
  speed: number; // 0..1 units per second
  popped?: boolean;
}

const W = 640;
const H = 440;

const COLORS = ['#ef4444', '#f97316', '#eab308', '#10b981', '#3b82f6', '#a855f7', '#ec4899'];

const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const genQuestion = (level: Level): { a: number; b: number; op: Op; answer: number } => {
  const ops: Op[] = level === 'easy' ? ['+'] : level === 'medium' ? ['+', '−'] : ['+', '−', '×'];
  const op = ops[randInt(0, ops.length - 1)];
  const range = level === 'easy' ? [1, 10] : level === 'medium' ? [1, 20] : [2, 12];
  let a = randInt(range[0], range[1]);
  let b = randInt(range[0], range[1]);
  let answer = 0;
  if (op === '+') answer = a + b;
  else if (op === '−') {
    if (b > a) [a, b] = [b, a];
    answer = a - b;
  } else {
    a = randInt(2, 10);
    b = randInt(2, 10);
    answer = a * b;
  }
  return { a, b, op, answer };
};

const makeBalloon = (id: number, correct: number, level: Level): Balloon => {
  const jitter = level === 'easy' ? 5 : level === 'medium' ? 10 : 20;
  const offset = randInt(-jitter, jitter);
  const value = Math.max(0, correct + offset);
  return {
    id,
    x: Math.random() * 0.9 + 0.05,
    y: 1.1 + Math.random() * 0.4,
    color: COLORS[randInt(0, COLORS.length - 1)],
    value,
    speed: 0.06 + Math.random() * 0.06,
  };
};

const ROUND_TIME = 60;
const TARGET = 10;

const BalloonPop: React.FC<{ isBotEnabled: boolean }> = () => {
  const [level, setLevel] = useState<Level>('easy');
  const [q, setQ] = useState(() => genQuestion('easy'));
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [hits, setHits] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
  const [done, setDone] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const nextIdRef = useRef(0);
  const spawnTimerRef = useRef(0);
  const lastTickRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const reset = useCallback((l: Level = level) => {
    setLevel(l);
    setQ(genQuestion(l));
    setBalloons([]);
    setScore(0);
    setMisses(0);
    setHits(0);
    setTimeLeft(ROUND_TIME);
    setDone(false);
    setFeedback(null);
    nextIdRef.current = 0;
    spawnTimerRef.current = 0;
    lastTickRef.current = null;
  }, [level]);

  useEffect(() => {
    if (done) return;
    const tick = (ts: number) => {
      if (lastTickRef.current === null) lastTickRef.current = ts;
      const dt = Math.min(0.05, (ts - lastTickRef.current) / 1000);
      lastTickRef.current = ts;

      spawnTimerRef.current += dt;
      const spawnEvery = level === 'easy' ? 0.9 : level === 'medium' ? 0.7 : 0.55;
      let spawnCount = 0;
      while (spawnTimerRef.current > spawnEvery) {
        spawnTimerRef.current -= spawnEvery;
        spawnCount++;
      }

      setBalloons((prev) => {
        const next = prev
          .map((b) => ({ ...b, y: b.y - b.speed * dt }))
          .filter((b) => b.y > -0.2 && !b.popped);

        // Ensure at least one correct-value balloon is on screen
        const hasCorrect = next.some((b) => b.value === q.answer);
        for (let i = 0; i < spawnCount; i++) {
          const id = nextIdRef.current++;
          if (i === 0 && !hasCorrect) {
            next.push({
              ...makeBalloon(id, q.answer, level),
              value: q.answer,
            });
          } else {
            // 35% chance correct-valued balloon
            const val = Math.random() < 0.35 ? q.answer : makeBalloon(id, q.answer, level).value;
            next.push({
              ...makeBalloon(id, q.answer, level),
              value: val,
            });
          }
        }
        return next.slice(-20);
      });

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      lastTickRef.current = null;
    };
  }, [done, q.answer, level]);

  useEffect(() => {
    if (done) return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setDone(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [done]);

  useEffect(() => {
    if (hits >= TARGET) setDone(true);
  }, [hits]);

  const pop = (b: Balloon) => {
    if (done || b.popped) return;
    setBalloons((prev) => prev.map((x) => (x.id === b.id ? { ...x, popped: true } : x)));
    if (b.value === q.answer) {
      setScore((s) => s + 10);
      setHits((h) => h + 1);
      setFeedback('✓ +10');
      setQ(genQuestion(level));
    } else {
      setScore((s) => Math.max(0, s - 3));
      setMisses((m) => m + 1);
      setFeedback(`✗ ${q.a} ${q.op} ${q.b} = ${q.answer}`);
    }
    window.setTimeout(() => setFeedback(null), 900);
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
          ? `Round complete — ${score} pts · ${hits}/${TARGET} pops`
          : `Score ${score} · Hits ${hits}/${TARGET} · Misses ${misses} · ${timeLeft}s`}
      </StatusBar>

      <div className="text-center">
        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow">
          <span className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-gray-100">
            {q.a} {q.op} {q.b} = ?
          </span>
        </div>
        <div className="h-5 mt-1 text-sm font-semibold text-gray-600 dark:text-gray-300">
          {feedback}
        </div>
      </div>

      <div className="relative w-full" style={{ maxWidth: W }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full rounded-2xl shadow-xl select-none"
          style={{
            background: 'linear-gradient(180deg, #bae6fd 0%, #e0f2fe 50%, #dbeafe 100%)',
            aspectRatio: `${W} / ${H}`,
          }}
        >
          {/* Clouds */}
          <ellipse cx={100} cy={60} rx={40} ry={14} fill="rgba(255,255,255,0.7)" />
          <ellipse cx={520} cy={90} rx={52} ry={16} fill="rgba(255,255,255,0.6)" />

          {balloons.map((b) => {
            const cx = b.x * W;
            const cy = b.y * H;
            return (
              <g
                key={b.id}
                transform={`translate(${cx}, ${cy})`}
                onClick={() => pop(b)}
                style={{ cursor: 'pointer' }}
              >
                {/* String */}
                <line x1={0} y1={44} x2={0} y2={80} stroke="#0f172a" strokeWidth={1.2} opacity={0.5} />
                {/* Balloon */}
                <ellipse
                  cx={0}
                  cy={0}
                  rx={36}
                  ry={44}
                  fill={b.color}
                  stroke="rgba(0,0,0,0.15)"
                  strokeWidth={1.5}
                />
                {/* Highlight */}
                <ellipse cx={-12} cy={-14} rx={8} ry={12} fill="rgba(255,255,255,0.45)" />
                {/* Tie */}
                <polygon points="-6,42 6,42 0,52" fill={b.color} stroke="rgba(0,0,0,0.2)" strokeWidth={1} />
                {/* Value */}
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={22}
                  fontWeight={800}
                  fill="white"
                  style={{ pointerEvents: 'none', textShadow: '0 1px 2px rgba(0,0,0,0.35)' }}
                >
                  {b.value}
                </text>
              </g>
            );
          })}
        </svg>

        {done && (
          <WinOverlay
            title={`${score} points`}
            subtitle={hits >= TARGET ? 'Goal reached — great work!' : 'Time up — try again?'}
            onPlayAgain={() => reset(level)}
            playAgainLabel="New round"
          />
        )}
      </div>
    </div>
  );
};

export default BalloonPop;
