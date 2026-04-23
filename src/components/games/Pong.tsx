import React, { useCallback, useEffect, useRef, useState } from 'react';
import StatusBar, { StatusTone } from '../shared/StatusBar';
import WinOverlay from '../shared/WinOverlay';

const W = 640;
const H = 360;
const PADDLE_W = 10;
const PADDLE_H = 70;
const BALL = 8;
const WIN = 5;

interface PongProps {
  isBotEnabled: boolean;
}

const Pong: React.FC<PongProps> = ({ isBotEnabled }) => {
  const [leftY, setLeftY] = useState(H / 2 - PADDLE_H / 2);
  const [rightY, setRightY] = useState(H / 2 - PADDLE_H / 2);
  const [ball, setBall] = useState({ x: W / 2, y: H / 2, vx: 4, vy: 2 });
  const [score, setScore] = useState<[number, number]>([0, 0]);
  const [running, setRunning] = useState(false);
  const [winner, setWinner] = useState<0 | 1 | null>(null);

  const leftYRef = useRef(leftY);
  leftYRef.current = leftY;
  const rightYRef = useRef(rightY);
  rightYRef.current = rightY;
  const ballRef = useRef(ball);
  ballRef.current = ball;
  const keys = useRef({ up: false, down: false, w: false, s: false, up2: false, down2: false });

  const reset = useCallback(() => {
    setLeftY(H / 2 - PADDLE_H / 2);
    setRightY(H / 2 - PADDLE_H / 2);
    setBall({ x: W / 2, y: H / 2, vx: Math.random() < 0.5 ? 4 : -4, vy: (Math.random() * 4 - 2) });
    setScore([0, 0]);
    setRunning(false);
    setWinner(null);
  }, []);

  const launchBall = useCallback((dir: number) => {
    setBall({
      x: W / 2,
      y: H / 2,
      vx: 4 * dir,
      vy: Math.random() * 4 - 2,
    });
  }, []);

  useEffect(() => {
    if (!running || winner !== null) return;
    let raf = 0;
    const loop = () => {
      // Move paddles from keyboard
      const k = keys.current;
      setLeftY((y) => {
        let ny = y;
        if (k.up || k.w) ny -= 6;
        if (k.down || k.s) ny += 6;
        return Math.max(0, Math.min(H - PADDLE_H, ny));
      });

      if (isBotEnabled) {
        // Bot lerps toward ball Y with a lag & max speed
        setRightY((y) => {
          const target = ballRef.current.y - PADDLE_H / 2;
          const diff = target - y;
          const step = Math.max(-5, Math.min(5, diff * 0.12));
          const ny = y + step;
          return Math.max(0, Math.min(H - PADDLE_H, ny));
        });
      } else {
        setRightY((y) => {
          let ny = y;
          if (k.up2) ny -= 6;
          if (k.down2) ny += 6;
          return Math.max(0, Math.min(H - PADDLE_H, ny));
        });
      }

      // Ball
      setBall((b) => {
        let { x, y, vx, vy } = b;
        x += vx;
        y += vy;
        // top/bottom
        if (y - BALL < 0) { y = BALL; vy = -vy; }
        if (y + BALL > H) { y = H - BALL; vy = -vy; }
        // left paddle
        if (
          x - BALL < PADDLE_W + 10 &&
          y > leftYRef.current &&
          y < leftYRef.current + PADDLE_H &&
          vx < 0
        ) {
          vx = -vx * 1.05;
          vy += (y - (leftYRef.current + PADDLE_H / 2)) * 0.05;
        }
        // right paddle
        if (
          x + BALL > W - PADDLE_W - 10 &&
          y > rightYRef.current &&
          y < rightYRef.current + PADDLE_H &&
          vx > 0
        ) {
          vx = -vx * 1.05;
          vy += (y - (rightYRef.current + PADDLE_H / 2)) * 0.05;
        }
        // scoring
        if (x < 0) {
          setScore(([a, b2]) => {
            const next: [number, number] = [a, b2 + 1];
            if (next[1] >= WIN) setWinner(1);
            return next;
          });
          launchBall(1);
          return { x: W / 2, y: H / 2, vx: 4, vy: Math.random() * 4 - 2 };
        }
        if (x > W) {
          setScore(([a, b2]) => {
            const next: [number, number] = [a + 1, b2];
            if (next[0] >= WIN) setWinner(0);
            return next;
          });
          launchBall(-1);
          return { x: W / 2, y: H / 2, vx: -4, vy: Math.random() * 4 - 2 };
        }
        // cap speed
        const maxV = 9;
        vx = Math.max(-maxV, Math.min(maxV, vx));
        vy = Math.max(-maxV, Math.min(maxV, vy));
        return { x, y, vx, vy };
      });

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [running, winner, isBotEnabled, launchBall]);

  // Keyboard
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (!running && winner === null) setRunning(true);
      if (e.key === 'ArrowUp') { e.preventDefault(); keys.current.up = true; }
      else if (e.key === 'ArrowDown') { e.preventDefault(); keys.current.down = true; }
      else if (e.key === 'w' || e.key === 'W') keys.current.w = true;
      else if (e.key === 's' || e.key === 'S') keys.current.s = true;
      else if (e.key === 'i' || e.key === 'I') keys.current.up2 = true;
      else if (e.key === 'k' || e.key === 'K') keys.current.down2 = true;
      else if (e.key === ' ') { e.preventDefault(); setRunning((r) => !r); }
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') keys.current.up = false;
      else if (e.key === 'ArrowDown') keys.current.down = false;
      else if (e.key === 'w' || e.key === 'W') keys.current.w = false;
      else if (e.key === 's' || e.key === 'S') keys.current.s = false;
      else if (e.key === 'i' || e.key === 'I') keys.current.up2 = false;
      else if (e.key === 'k' || e.key === 'K') keys.current.down2 = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [running, winner]);

  const tone: StatusTone = winner !== null ? 'success' : running ? 'info' : 'neutral';
  const status = winner !== null
    ? `${winner === 0 ? (isBotEnabled ? 'You win!' : 'Player 1 wins!') : (isBotEnabled ? 'Bot wins' : 'Player 2 wins')} — ${score[0]}–${score[1]}`
    : running
      ? `${score[0]} – ${score[1]}`
      : 'Press a key (or start) to begin.';

  return (
    <div className="flex flex-col items-center gap-5">
      <StatusBar tone={tone}>{status}</StatusBar>

      <div className="relative w-full" style={{ maxWidth: 960 }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full rounded-2xl shadow-xl"
          style={{ background: '#0f172a' }}
        >
          <line x1={W / 2} y1="0" x2={W / 2} y2={H} stroke="#475569" strokeWidth="2" strokeDasharray="8 8" />
          <rect x={10} y={leftY} width={PADDLE_W} height={PADDLE_H} fill="#e2e8f0" rx="3" />
          <rect x={W - 10 - PADDLE_W} y={rightY} width={PADDLE_W} height={PADDLE_H} fill="#e2e8f0" rx="3" />
          <circle cx={ball.x} cy={ball.y} r={BALL} fill="#fef3c7" />
          <text x={W / 4} y={40} textAnchor="middle" fontSize="28" fontWeight="bold" fill="#cbd5e1">{score[0]}</text>
          <text x={(W * 3) / 4} y={40} textAnchor="middle" fontSize="28" fontWeight="bold" fill="#cbd5e1">{score[1]}</text>
        </svg>
        {winner !== null && (
          <WinOverlay
            title={`${score[0]}–${score[1]}`}
            subtitle={winner === 0 ? (isBotEnabled ? 'You won!' : 'Player 1 wins!') : (isBotEnabled ? 'Bot wins' : 'Player 2 wins')}
            onPlayAgain={reset}
          />
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setRunning((r) => !r)}
          disabled={winner !== null}
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

export default Pong;
