import React, { useCallback, useEffect, useRef, useState } from 'react';
import StatusBar, { StatusTone } from '../shared/StatusBar';
import WinOverlay from '../shared/WinOverlay';

const W = 720;
const H = 360;
const LANE_COUNT = 3;
const LANE_W = W / LANE_COUNT;
const GROUND = H - 60;
const PLAYER = { w: 34, h: 52, x: LANE_W / 2 };

type Level = 'easy' | 'medium' | 'hard';
type Op = '+' | '−' | '×';

interface Question {
  a: number;
  b: number;
  op: Op;
  answer: number;
  options: number[]; // length === LANE_COUNT
  correctLane: number;
}

interface Gate {
  y: number; // 0 at top
  question: Question;
  resolved: boolean;
}

const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const makeQuestion = (level: Level): Question => {
  const ops: Op[] = level === 'easy' ? ['+'] : level === 'medium' ? ['+', '−'] : ['+', '−', '×'];
  const op = ops[randInt(0, ops.length - 1)];
  const range = level === 'easy' ? [1, 10] : level === 'medium' ? [2, 20] : [3, 12];
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
  // Build 3 options: the correct answer and two distractors
  const set = new Set<number>([answer]);
  while (set.size < LANE_COUNT) {
    const delta = randInt(-6, 6);
    const v = answer + (delta || 1);
    if (v >= 0) set.add(v);
  }
  const shuffled = Array.from(set).sort(() => Math.random() - 0.5);
  const correctLane = shuffled.indexOf(answer);
  return { a, b, op, answer, options: shuffled, correctLane };
};

const TARGET_CORRECT = 10;

const MathRunner: React.FC<{ isBotEnabled: boolean }> = () => {
  const [level, setLevel] = useState<Level>('easy');
  const [lane, setLane] = useState(1);
  const [gates, setGates] = useState<Gate[]>([]);
  const [speed, setSpeed] = useState(80); // pixels per second
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [flash, setFlash] = useState<'ok' | 'bad' | null>(null);

  const laneRef = useRef(lane);
  laneRef.current = lane;
  const speedRef = useRef(speed);
  speedRef.current = speed;
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);
  const spawnAccumRef = useRef(0);

  const reset = useCallback((l: Level = level) => {
    setLevel(l);
    setLane(1);
    setGates([]);
    setSpeed(80);
    setCorrect(0);
    setWrong(0);
    setRunning(false);
    setDone(false);
    setFlash(null);
    spawnAccumRef.current = 0;
    lastRef.current = null;
  }, [level]);

  const start = () => {
    if (done) return;
    setRunning(true);
  };

  // Main loop
  useEffect(() => {
    if (!running || done) return;
    const tick = (ts: number) => {
      if (lastRef.current === null) lastRef.current = ts;
      const dt = Math.min(0.05, (ts - lastRef.current) / 1000);
      lastRef.current = ts;

      // Advance gates
      setGates((prev) => {
        const advanced = prev.map((g) => ({ ...g, y: g.y + speedRef.current * dt }));
        const remaining: Gate[] = [];
        for (const g of advanced) {
          // Check collision with player at GROUND - PLAYER.h/2
          const gateLine = GROUND - PLAYER.h + 4;
          if (!g.resolved && g.y >= gateLine && g.y <= gateLine + 8) {
            g.resolved = true;
            if (laneRef.current === g.question.correctLane) {
              setCorrect((c) => c + 1);
              setFlash('ok');
              window.setTimeout(() => setFlash(null), 250);
              setSpeed((s) => Math.min(260, s + 8));
            } else {
              setWrong((w) => w + 1);
              setFlash('bad');
              window.setTimeout(() => setFlash(null), 350);
              setSpeed((s) => Math.max(60, s - 20));
            }
          }
          if (g.y < H + 80) remaining.push(g);
        }
        return remaining;
      });

      // Spawn new gates periodically
      spawnAccumRef.current += dt;
      const spawnEvery = 2.6 - Math.min(1.3, speedRef.current / 200);
      if (spawnAccumRef.current >= spawnEvery) {
        spawnAccumRef.current = 0;
        setGates((prev) => [...prev, { y: -60, question: makeQuestion(level), resolved: false }]);
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      lastRef.current = null;
    };
  }, [running, done, level]);

  // Keyboard controls
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (done) return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        setLane((l) => Math.max(0, l - 1));
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        setLane((l) => Math.min(LANE_COUNT - 1, l + 1));
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [done]);

  // Win/lose
  useEffect(() => {
    if (correct >= TARGET_CORRECT) setDone(true);
    if (wrong >= 5) setDone(true);
  }, [correct, wrong]);

  const tone: StatusTone = done ? (correct >= TARGET_CORRECT ? 'success' : 'warning') : 'info';
  const playerX = lane * LANE_W + PLAYER.x - PLAYER.w / 2;
  const playerY = GROUND - PLAYER.h;

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
          ? correct >= TARGET_CORRECT
            ? `Goal reached! ${correct} correct · ${wrong} wrong`
            : `Too many wrong answers — ${correct} correct`
          : `Correct ${correct}/${TARGET_CORRECT} · Wrong ${wrong}/5${!running ? ' · Tap Start to run' : ''}`}
      </StatusBar>

      <div className="relative w-full" style={{ maxWidth: 860 }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full rounded-2xl shadow-xl select-none"
          style={{
            background: 'linear-gradient(180deg, #bfdbfe 0%, #60a5fa 40%, #1e40af 100%)',
            aspectRatio: `${W} / ${H}`,
          }}
        >
          {/* Lane dividers */}
          {Array.from({ length: LANE_COUNT + 1 }).map((_, i) => (
            <line
              key={i}
              x1={i * LANE_W}
              y1={0}
              x2={i * LANE_W}
              y2={H}
              stroke="rgba(255,255,255,0.2)"
              strokeWidth={2}
              strokeDasharray="8 8"
            />
          ))}

          {/* Ground */}
          <rect x={0} y={GROUND} width={W} height={H - GROUND} fill="rgba(0,0,0,0.25)" />

          {/* Feedback flash */}
          {flash && (
            <rect
              x={0}
              y={0}
              width={W}
              height={H}
              fill={flash === 'ok' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.18)'}
            />
          )}

          {/* Gates */}
          {gates.map((g, i) => (
            <g key={i}>
              {g.question.options.map((opt, laneIdx) => {
                const gx = laneIdx * LANE_W;
                return (
                  <g key={laneIdx}>
                    <rect
                      x={gx + 6}
                      y={g.y}
                      width={LANE_W - 12}
                      height={60}
                      rx={10}
                      fill={g.resolved && laneIdx === g.question.correctLane ? 'rgba(34,197,94,0.6)' :
                            g.resolved && laneIdx !== g.question.correctLane ? 'rgba(239,68,68,0.35)' :
                            'rgba(255,255,255,0.9)'}
                      stroke="rgba(15,23,42,0.35)"
                      strokeWidth={2}
                    />
                    <text
                      x={gx + LANE_W / 2}
                      y={g.y + 38}
                      textAnchor="middle"
                      fontSize={26}
                      fontWeight={800}
                      fill="#0f172a"
                    >
                      {opt}
                    </text>
                  </g>
                );
              })}
              {/* Equation on the wall above gates */}
              <text
                x={W / 2}
                y={g.y - 10}
                textAnchor="middle"
                fontSize={20}
                fontWeight={800}
                fill="white"
                style={{ textShadow: '0 2px 4px rgba(0,0,0,0.4)' }}
              >
                {g.question.a} {g.question.op} {g.question.b} = ?
              </text>
            </g>
          ))}

          {/* Player */}
          <g
            transform={`translate(${playerX}, ${playerY})`}
            style={{ transition: 'transform 120ms' }}
          >
            <rect x={0} y={0} width={PLAYER.w} height={PLAYER.h} rx={6} fill="#f59e0b" stroke="#78350f" strokeWidth={2} />
            <circle cx={PLAYER.w / 2} cy={14} r={10} fill="#fde68a" />
            <circle cx={PLAYER.w / 2 - 3} cy={13} r={1.5} fill="#0f172a" />
            <circle cx={PLAYER.w / 2 + 3} cy={13} r={1.5} fill="#0f172a" />
          </g>
        </svg>

        {done && (
          <WinOverlay
            title={correct >= TARGET_CORRECT ? 'Goal reached!' : 'Out of tries'}
            subtitle={`${correct} correct · ${wrong} wrong`}
            onPlayAgain={() => reset(level)}
            playAgainLabel="Run again"
          />
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-2">
        {!running && !done && (
          <button
            onClick={start}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold shadow hover:brightness-110 active:scale-95"
          >
            ▶ Start running
          </button>
        )}
        <div className="grid grid-cols-2 gap-2 w-48">
          <button
            onClick={() => setLane((l) => Math.max(0, l - 1))}
            disabled={done}
            className="py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow active:scale-95 font-semibold"
          >
            ◀ Left
          </button>
          <button
            onClick={() => setLane((l) => Math.min(LANE_COUNT - 1, l + 1))}
            disabled={done}
            className="py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow active:scale-95 font-semibold"
          >
            Right ▶
          </button>
        </div>
      </div>
    </div>
  );
};

export default MathRunner;
