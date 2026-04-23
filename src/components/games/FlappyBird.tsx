import React, { useCallback, useEffect, useRef, useState } from 'react';
import StatusBar, { StatusTone } from '../shared/StatusBar';
import WinOverlay from '../shared/WinOverlay';

const WIDTH = 360;
const HEIGHT = 520;
const BIRD = { r: 16, x: 80 };
const GRAVITY = 0.45;
const LIFT = -7.5;
const PIPE_W = 60;
const GAP = 130;
const SPEED = 2;

interface Pipe {
  x: number;
  gapY: number;
  scored: boolean;
}

const FlappyBird: React.FC<{ isBotEnabled: boolean }> = () => {
  const [y, setY] = useState(HEIGHT / 2);
  const [v, setV] = useState(0);
  const [pipes, setPipes] = useState<Pipe[]>([]);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [running, setRunning] = useState(false);
  const [over, setOver] = useState(false);
  const rafRef = useRef<number | null>(null);
  const pipesRef = useRef(pipes);
  pipesRef.current = pipes;
  const yRef = useRef(y);
  yRef.current = y;
  const vRef = useRef(v);
  vRef.current = v;

  const reset = useCallback(() => {
    setY(HEIGHT / 2);
    setV(0);
    setPipes([]);
    setScore(0);
    setRunning(false);
    setOver(false);
  }, []);

  const flap = useCallback(() => {
    if (over) return;
    if (!running) setRunning(true);
    setV(LIFT);
  }, [over, running]);

  useEffect(() => {
    if (!running || over) return;
    let spawn = 0;
    const loop = () => {
      // physics
      const nv = vRef.current + GRAVITY;
      const ny = yRef.current + nv;
      setV(nv);
      setY(ny);
      // spawn pipes
      spawn++;
      if (spawn % 90 === 0) {
        const gapY = 80 + Math.floor(Math.random() * (HEIGHT - 160 - GAP));
        setPipes((p) => [...p, { x: WIDTH, gapY, scored: false }]);
      }
      // move pipes
      setPipes((p) =>
        p
          .map((pp) => ({ ...pp, x: pp.x - SPEED }))
          .filter((pp) => pp.x > -PIPE_W),
      );

      // collisions / scoring
      const by = ny;
      const bx = BIRD.x;
      let dead = false;
      if (by - BIRD.r < 0 || by + BIRD.r > HEIGHT) dead = true;
      for (const pp of pipesRef.current) {
        const pr = pp.x + PIPE_W;
        if (bx + BIRD.r > pp.x && bx - BIRD.r < pr) {
          if (by - BIRD.r < pp.gapY || by + BIRD.r > pp.gapY + GAP) dead = true;
        }
        if (!pp.scored && pp.x + PIPE_W < bx) {
          pp.scored = true;
          setScore((s) => {
            const ns = s + 1;
            setBest((b) => Math.max(b, ns));
            return ns;
          });
        }
      }
      if (dead) {
        setOver(true);
        setRunning(false);
        return;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [running, over]);

  // Controls
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === 'ArrowUp') {
        e.preventDefault();
        flap();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [flap]);

  const tone: StatusTone = over ? 'warning' : running ? 'info' : 'neutral';

  return (
    <div className="flex flex-col items-center gap-5">
      <StatusBar tone={tone}>
        {over ? `Game over — Score ${score} · Best ${best}` : running ? `Score: ${score}` : 'Tap, click or press space to flap.'}
      </StatusBar>

      <div className="relative" style={{ width: WIDTH, maxWidth: '100%' }}>
        <div
          onClick={flap}
          className="relative rounded-2xl overflow-hidden shadow-xl cursor-pointer select-none"
          style={{
            width: '100%',
            aspectRatio: `${WIDTH} / ${HEIGHT}`,
            background: 'linear-gradient(to bottom, #93c5fd, #c7d2fe)',
          }}
        >
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="absolute inset-0 w-full h-full"
            preserveAspectRatio="xMidYMid meet"
          >
            {pipes.map((p, i) => (
              <g key={i}>
                <rect x={p.x} y={0} width={PIPE_W} height={p.gapY} fill="#16a34a" />
                <rect x={p.x} y={p.gapY + GAP} width={PIPE_W} height={HEIGHT - p.gapY - GAP} fill="#16a34a" />
                <rect x={p.x - 3} y={p.gapY - 14} width={PIPE_W + 6} height={14} fill="#166534" />
                <rect x={p.x - 3} y={p.gapY + GAP} width={PIPE_W + 6} height={14} fill="#166534" />
              </g>
            ))}
            <circle cx={BIRD.x} cy={y} r={BIRD.r} fill="#facc15" stroke="#78350f" strokeWidth={2} />
            <circle cx={BIRD.x + 6} cy={y - 4} r={3} fill="#0f172a" />
            <polygon points={`${BIRD.x + BIRD.r - 2},${y} ${BIRD.x + BIRD.r + 8},${y - 3} ${BIRD.x + BIRD.r + 8},${y + 3}`} fill="#f97316" />
          </svg>
        </div>
        {over && (
          <WinOverlay
            title="Game over"
            subtitle={`Score: ${score} · Best: ${best}`}
            onPlayAgain={reset}
            playAgainLabel="Try again"
          />
        )}
      </div>

      <p className="text-xs md:text-sm text-gray-500 max-w-md text-center">
        Tap (or press space) to flap. Steer through the gaps without touching the pipes or walls.
      </p>
    </div>
  );
};

export default FlappyBird;
