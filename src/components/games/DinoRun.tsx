import React, { useCallback, useEffect, useRef, useState } from 'react';
import StatusBar, { StatusTone } from '../shared/StatusBar';
import WinOverlay from '../shared/WinOverlay';

const W = 600;
const H = 200;
const GROUND = H - 30;
const DINO = { w: 32, h: 36, x: 60 };
const GRAVITY = 0.8;
const JUMP = -13;

interface Obstacle {
  x: number;
  w: number;
  h: number;
  passed: boolean;
}

const DinoRun: React.FC<{ isBotEnabled: boolean }> = () => {
  const [y, setY] = useState(GROUND - DINO.h);
  const [vy, setVy] = useState(0);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [speed, setSpeed] = useState(6);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [running, setRunning] = useState(false);
  const [over, setOver] = useState(false);

  const yRef = useRef(y);
  yRef.current = y;
  const vyRef = useRef(vy);
  vyRef.current = vy;
  const obsRef = useRef(obstacles);
  obsRef.current = obstacles;
  const speedRef = useRef(speed);
  speedRef.current = speed;

  const reset = useCallback(() => {
    setY(GROUND - DINO.h);
    setVy(0);
    setObstacles([]);
    setSpeed(6);
    setScore(0);
    setRunning(false);
    setOver(false);
  }, []);

  const jump = useCallback(() => {
    if (over) return;
    if (!running) setRunning(true);
    if (yRef.current + DINO.h >= GROUND - 1) setVy(JUMP);
  }, [over, running]);

  useEffect(() => {
    if (!running || over) return;
    let raf = 0;
    let tick = 0;
    const loop = () => {
      tick++;
      // Physics
      setY((py) => {
        let ny = py + vyRef.current;
        if (ny + DINO.h > GROUND) { ny = GROUND - DINO.h; setVy(0); }
        return ny;
      });
      setVy((v) => (yRef.current + DINO.h >= GROUND ? v : v + GRAVITY));

      // Obstacles
      if (tick % Math.max(35, Math.floor(80 - speedRef.current * 3)) === 0) {
        const h = 20 + Math.floor(Math.random() * 25);
        setObstacles((o) => [...o, { x: W, w: 14, h, passed: false }]);
      }
      setObstacles((o) =>
        o
          .map((ob) => ({ ...ob, x: ob.x - speedRef.current }))
          .filter((ob) => ob.x > -40),
      );

      // Collisions & scoring
      for (const ob of obsRef.current) {
        const dinoBox = { x: DINO.x, y: yRef.current, w: DINO.w, h: DINO.h };
        const obBox = { x: ob.x, y: GROUND - ob.h, w: ob.w, h: ob.h };
        if (
          dinoBox.x < obBox.x + obBox.w &&
          dinoBox.x + dinoBox.w > obBox.x &&
          dinoBox.y < obBox.y + obBox.h &&
          dinoBox.y + dinoBox.h > obBox.y
        ) {
          setOver(true);
          setRunning(false);
          setBest((b) => Math.max(b, Math.floor(score)));
          return;
        }
        if (!ob.passed && ob.x + ob.w < DINO.x) {
          ob.passed = true;
          setScore((s) => s + 1);
        }
      }

      // Distance score (incremental)
      if (tick % 6 === 0) setScore((s) => s + 1);
      // Ramp up speed
      if (tick % 600 === 0) setSpeed((s) => Math.min(14, s + 0.5));

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [running, over, score]);

  // Keyboard / click / tap
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [jump]);

  const tone: StatusTone = over ? 'warning' : running ? 'info' : 'neutral';
  const status = over
    ? `Crashed! Score ${score} · Best ${best}`
    : running
      ? `Score: ${score}`
      : 'Tap or press space to jump.';

  return (
    <div className="flex flex-col items-center gap-5">
      <StatusBar tone={tone}>{status}</StatusBar>

      <div className="relative w-full" style={{ maxWidth: W }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full rounded-2xl shadow-xl cursor-pointer select-none"
          style={{
            background:
              'linear-gradient(to bottom, #fef3c7 0%, #fed7aa 70%, #78350f 100%)',
          }}
          onClick={jump}
        >
          {/* ground line */}
          <line x1="0" y1={GROUND} x2={W} y2={GROUND} stroke="#78350f" strokeWidth="2" />

          {/* Dino */}
          <g transform={`translate(${DINO.x}, ${y})`}>
            <rect x="0" y="0" width={DINO.w} height={DINO.h} rx="4" fill="#059669" />
            <rect x={DINO.w - 8} y="4" width="8" height="8" rx="2" fill="#065f46" />
            <circle cx={DINO.w - 4} cy="7" r="1.5" fill="white" />
          </g>

          {/* Obstacles (cacti) */}
          {obstacles.map((ob, i) => (
            <g key={i} transform={`translate(${ob.x}, ${GROUND - ob.h})`}>
              <rect x="4" y="0" width={ob.w - 8} height={ob.h} rx="2" fill="#15803d" />
              <rect x="0" y={ob.h / 3} width="4" height={ob.h / 3} rx="1" fill="#15803d" />
              <rect x={ob.w - 4} y={ob.h / 4} width="4" height={ob.h / 3} rx="1" fill="#15803d" />
            </g>
          ))}
        </svg>
        {over && (
          <WinOverlay
            title="Crashed!"
            subtitle={`Score: ${score} · Best: ${best}`}
            onPlayAgain={reset}
            playAgainLabel="Try again"
          />
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={jump}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold shadow hover:brightness-110 active:scale-95"
        >
          Jump
        </button>
        <button
          onClick={reset}
          className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-semibold shadow hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default DinoRun;
