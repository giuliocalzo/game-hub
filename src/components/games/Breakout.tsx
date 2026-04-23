import React, { useCallback, useEffect, useRef, useState } from 'react';
import StatusBar, { StatusTone } from '../shared/StatusBar';
import WinOverlay from '../shared/WinOverlay';

const W = 480;
const H = 360;
const PADDLE_W = 80;
const PADDLE_H = 10;
const BALL = 7;
const BRICK_COLS = 8;
const BRICK_ROWS = 5;
const BRICK_W = W / BRICK_COLS;
const BRICK_H = 18;
const BRICK_TOP = 30;

const BRICK_COLORS = ['#ef4444', '#f97316', '#eab308', '#10b981', '#3b82f6'];

interface Brick {
  r: number;
  c: number;
  alive: boolean;
}

const makeBricks = (): Brick[] => {
  const arr: Brick[] = [];
  for (let r = 0; r < BRICK_ROWS; r++)
    for (let c = 0; c < BRICK_COLS; c++) arr.push({ r, c, alive: true });
  return arr;
};

const Breakout: React.FC<{ isBotEnabled: boolean }> = () => {
  const [paddleX, setPaddleX] = useState(W / 2 - PADDLE_W / 2);
  const [ball, setBall] = useState({ x: W / 2, y: H - 40, vx: 3, vy: -3, stuck: true });
  const [bricks, setBricks] = useState<Brick[]>(makeBricks);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [running, setRunning] = useState(false);
  const [over, setOver] = useState<'won' | 'lost' | null>(null);

  const keys = useRef({ left: false, right: false });
  const paddleRef = useRef(paddleX);
  paddleRef.current = paddleX;
  const bricksRef = useRef(bricks);
  bricksRef.current = bricks;

  const reset = useCallback(() => {
    setPaddleX(W / 2 - PADDLE_W / 2);
    setBall({ x: W / 2, y: H - 40, vx: 3, vy: -3, stuck: true });
    setBricks(makeBricks());
    setScore(0);
    setLives(3);
    setRunning(false);
    setOver(null);
  }, []);

  const launch = useCallback(() => {
    setBall((b) => (b.stuck ? { ...b, stuck: false } : b));
  }, []);

  useEffect(() => {
    if (!running || over) return;
    let raf = 0;
    const loop = () => {
      // Paddle keyboard
      setPaddleX((x) => {
        let nx = x;
        if (keys.current.left) nx -= 6;
        if (keys.current.right) nx += 6;
        return Math.max(0, Math.min(W - PADDLE_W, nx));
      });

      setBall((b) => {
        if (b.stuck) return { ...b, x: paddleRef.current + PADDLE_W / 2 };
        let { x, y, vx, vy } = b;
        x += vx;
        y += vy;
        // walls
        if (x - BALL < 0) { x = BALL; vx = -vx; }
        if (x + BALL > W) { x = W - BALL; vx = -vx; }
        if (y - BALL < 0) { y = BALL; vy = -vy; }
        // floor → lose life
        if (y - BALL > H) {
          setLives((L) => {
            const nl = L - 1;
            if (nl <= 0) setOver('lost');
            return nl;
          });
          return { x: W / 2, y: H - 40, vx: 3, vy: -3, stuck: true };
        }
        // paddle
        if (
          y + BALL >= H - 20 &&
          y + BALL <= H - 20 + PADDLE_H &&
          x >= paddleRef.current &&
          x <= paddleRef.current + PADDLE_W &&
          vy > 0
        ) {
          vy = -Math.abs(vy);
          const hitPos = (x - paddleRef.current) / PADDLE_W - 0.5;
          vx = hitPos * 8;
        }
        // bricks
        let hit = false;
        const next = bricksRef.current.map((brk) => ({ ...brk }));
        for (const brk of next) {
          if (!brk.alive) continue;
          const bx = brk.c * BRICK_W;
          const by = BRICK_TOP + brk.r * BRICK_H;
          if (x + BALL > bx && x - BALL < bx + BRICK_W && y + BALL > by && y - BALL < by + BRICK_H) {
            brk.alive = false;
            // simple bounce: pick axis based on prior position
            const prevX = x - vx;
            const prevY = y - vy;
            if (prevX + BALL <= bx || prevX - BALL >= bx + BRICK_W) vx = -vx;
            else vy = -vy;
            hit = true;
            setScore((s) => s + 10);
            break;
          }
        }
        if (hit) {
          setBricks(next);
          if (next.every((b2) => !b2.alive)) setOver('won');
        }
        return { x, y, vx, vy, stuck: false };
      });

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [running, over]);

  // Keyboard
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        keys.current.left = true;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        keys.current.right = true;
      } else if (e.key === ' ') {
        e.preventDefault();
        if (!running && !over) setRunning(true);
        launch();
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.current.left = false;
      else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.current.right = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [running, over, launch]);

  const tone: StatusTone = over === 'won' ? 'success' : over === 'lost' ? 'warning' : running ? 'info' : 'neutral';
  const status = over === 'won'
    ? `You cleared it! Score ${score}`
    : over === 'lost'
      ? `Game over — Score ${score}`
      : running
        ? `Score ${score} · Lives ${'♥'.repeat(lives)}`
        : 'Space or tap to launch the ball.';

  return (
    <div className="flex flex-col items-center gap-5">
      <StatusBar tone={tone}>{status}</StatusBar>

      <div className="relative w-full" style={{ maxWidth: W }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full rounded-2xl shadow-xl cursor-pointer"
          style={{ background: '#0f172a' }}
          onClick={() => {
            if (!running) setRunning(true);
            launch();
          }}
          onMouseMove={(e) => {
            const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * W;
            setPaddleX(Math.max(0, Math.min(W - PADDLE_W, x - PADDLE_W / 2)));
          }}
        >
          {bricks.map((b, i) =>
            b.alive ? (
              <rect
                key={i}
                x={b.c * BRICK_W + 2}
                y={BRICK_TOP + b.r * BRICK_H + 2}
                width={BRICK_W - 4}
                height={BRICK_H - 4}
                fill={BRICK_COLORS[b.r % BRICK_COLORS.length]}
                rx="3"
              />
            ) : null,
          )}
          <rect x={paddleX} y={H - 20} width={PADDLE_W} height={PADDLE_H} fill="#e2e8f0" rx="4" />
          <circle cx={ball.x} cy={ball.y} r={BALL} fill="#fef3c7" />
        </svg>
        {over && (
          <WinOverlay
            title={over === 'won' ? 'Cleared!' : 'Game over'}
            subtitle={`Score: ${score}`}
            onPlayAgain={reset}
            playAgainLabel={over === 'won' ? 'Play again' : 'Try again'}
          />
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => {
            setRunning((r) => !r);
            launch();
          }}
          disabled={!!over}
          className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-semibold shadow hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
        >
          {running ? 'Pause' : 'Start'}
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

export default Breakout;
