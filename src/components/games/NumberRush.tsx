import React, { useCallback, useEffect, useRef, useState } from 'react';
import StatusBar, { StatusTone } from '../shared/StatusBar';
import WinOverlay from '../shared/WinOverlay';

const W = 720;
const H = 440;

interface Bubble {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  value: number;
  r: number;
}

const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const COLORS = ['#f87171', '#f97316', '#facc15', '#a3e635', '#22d3ee', '#818cf8', '#e879f9'];

const bubbleColor = (val: number): string => COLORS[val % COLORS.length];

const ROUND_TIME = 45;

const NumberRush: React.FC<{ isBotEnabled: boolean }> = () => {
  const [player, setPlayer] = useState({ x: W / 2, y: H / 2, value: 3, r: 22 });
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
  const [done, setDone] = useState(false);
  const [running, setRunning] = useState(false);
  const [flash, setFlash] = useState<'ok' | 'bad' | null>(null);

  const playerRef = useRef(player);
  playerRef.current = player;
  const targetRef = useRef({ x: W / 2, y: H / 2 });
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);
  const nextIdRef = useRef(0);
  const spawnAccumRef = useRef(0);
  const svgRef = useRef<SVGSVGElement>(null);

  const reset = useCallback(() => {
    setPlayer({ x: W / 2, y: H / 2, value: 3, r: 22 });
    setBubbles([]);
    setScore(0);
    setTimeLeft(ROUND_TIME);
    setDone(false);
    setRunning(false);
    setFlash(null);
    targetRef.current = { x: W / 2, y: H / 2 };
    spawnAccumRef.current = 0;
    lastRef.current = null;
  }, []);

  const start = () => {
    if (done) return;
    setRunning(true);
  };

  // Game loop
  useEffect(() => {
    if (!running || done) return;
    const loop = (ts: number) => {
      if (lastRef.current === null) lastRef.current = ts;
      const dt = Math.min(0.05, (ts - lastRef.current) / 1000);
      lastRef.current = ts;

      // Move player toward target
      setPlayer((p) => {
        const dx = targetRef.current.x - p.x;
        const dy = targetRef.current.y - p.y;
        const speed = 260;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 1) return p;
        const step = Math.min(dist, speed * dt);
        const nx = p.x + (dx / dist) * step;
        const ny = p.y + (dy / dist) * step;
        return { ...p, x: Math.max(p.r, Math.min(W - p.r, nx)), y: Math.max(p.r, Math.min(H - p.r, ny)) };
      });

      // Spawn bubbles
      spawnAccumRef.current += dt;
      const spawnEvery = 0.6;
      while (spawnAccumRef.current > spawnEvery) {
        spawnAccumRef.current -= spawnEvery;
        const side = randInt(0, 3); // 0 top, 1 right, 2 bottom, 3 left
        const playerVal = playerRef.current.value;
        const valMin = Math.max(1, playerVal - 4);
        const valMax = playerVal + 4;
        const value = randInt(valMin, valMax);
        const r = 14 + value;
        let x = 0; let y = 0; let vx = 0; let vy = 0;
        const sp = 40 + Math.random() * 50;
        if (side === 0) { x = Math.random() * W; y = -r; vx = (Math.random() - 0.5) * 40; vy = sp; }
        else if (side === 1) { x = W + r; y = Math.random() * H; vx = -sp; vy = (Math.random() - 0.5) * 40; }
        else if (side === 2) { x = Math.random() * W; y = H + r; vx = (Math.random() - 0.5) * 40; vy = -sp; }
        else { x = -r; y = Math.random() * H; vx = sp; vy = (Math.random() - 0.5) * 40; }
        setBubbles((bs) => [...bs, { id: nextIdRef.current++, x, y, vx, vy, value, r }]);
      }

      // Move bubbles + check collisions
      setBubbles((bs) => {
        const p = playerRef.current;
        const next: Bubble[] = [];
        for (const b of bs) {
          const nx = b.x + b.vx * dt;
          const ny = b.y + b.vy * dt;
          if (nx < -80 || nx > W + 80 || ny < -80 || ny > H + 80) continue;
          const dx = p.x - nx;
          const dy = p.y - ny;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < p.r + b.r - 4) {
            if (b.value <= p.value) {
              // Absorb
              setScore((s) => s + b.value * 2);
              setPlayer((pp) => ({ ...pp, value: pp.value + 1, r: Math.min(60, pp.r + 1) }));
              setFlash('ok');
              window.setTimeout(() => setFlash((f) => (f === 'ok' ? null : f)), 160);
              continue;
            } else {
              // Hit by bigger: lose a point and shrink
              setScore((s) => Math.max(0, s - 5));
              setPlayer((pp) => ({ ...pp, value: Math.max(1, pp.value - 1), r: Math.max(14, pp.r - 2) }));
              setFlash('bad');
              window.setTimeout(() => setFlash((f) => (f === 'bad' ? null : f)), 200);
              continue;
            }
          }
          next.push({ ...b, x: nx, y: ny });
        }
        return next;
      });

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      lastRef.current = null;
    };
  }, [running, done]);

  // Timer
  useEffect(() => {
    if (!running || done) return;
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
  }, [running, done]);

  // Pointer
  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    const y = ((e.clientY - rect.top) / rect.height) * H;
    targetRef.current = { x, y };
  };

  // Keyboard arrows as fallback
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!running || done) return;
      const step = 40;
      const t = targetRef.current;
      let nx = t.x; let ny = t.y;
      if (e.key === 'ArrowLeft' || e.key === 'a') { nx -= step; }
      else if (e.key === 'ArrowRight' || e.key === 'd') { nx += step; }
      else if (e.key === 'ArrowUp' || e.key === 'w') { ny -= step; }
      else if (e.key === 'ArrowDown' || e.key === 's') { ny += step; }
      else return;
      e.preventDefault();
      targetRef.current = { x: Math.max(20, Math.min(W - 20, nx)), y: Math.max(20, Math.min(H - 20, ny)) };
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [running, done]);

  const tone: StatusTone = done ? 'success' : 'info';

  return (
    <div className="flex flex-col items-center gap-4">
      <StatusBar tone={tone}>
        {done
          ? `Round over — score ${score}, size ${player.value}`
          : running
          ? `Score ${score} · Size ${player.value} · ${timeLeft}s`
          : 'Move your cursor to steer. Absorb smaller or equal numbers to grow.'}
      </StatusBar>

      <div className="relative w-full" style={{ maxWidth: 900 }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full rounded-2xl shadow-xl cursor-crosshair touch-none"
          style={{
            background: 'radial-gradient(circle at 50% 30%, #0ea5e9 0%, #0c4a6e 80%)',
            aspectRatio: `${W} / ${H}`,
          }}
          onPointerMove={onMove}
        >
          {flash && (
            <rect x={0} y={0} width={W} height={H} fill={flash === 'ok' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.15)'} />
          )}

          {bubbles.map((b) => (
            <g key={b.id}>
              <circle cx={b.x} cy={b.y} r={b.r} fill={bubbleColor(b.value)} stroke="rgba(0,0,0,0.25)" strokeWidth={1.5} />
              <circle cx={b.x - b.r / 3} cy={b.y - b.r / 3} rx={b.r / 4} ry={b.r / 4} fill="rgba(255,255,255,0.35)" />
              <text
                x={b.x}
                y={b.y + 4}
                textAnchor="middle"
                fontSize={Math.max(12, b.r * 0.65)}
                fontWeight={800}
                fill="white"
                style={{ pointerEvents: 'none', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
              >
                {b.value}
              </text>
            </g>
          ))}

          {/* Player */}
          <g>
            <circle cx={player.x} cy={player.y} r={player.r} fill="#fbbf24" stroke="#78350f" strokeWidth={3} />
            <circle cx={player.x - player.r / 3} cy={player.y - player.r / 3} rx={player.r / 4} ry={player.r / 4} fill="rgba(255,255,255,0.5)" />
            <text
              x={player.x}
              y={player.y + 5}
              textAnchor="middle"
              fontSize={Math.max(14, player.r * 0.8)}
              fontWeight={900}
              fill="#78350f"
              style={{ pointerEvents: 'none' }}
            >
              {player.value}
            </text>
          </g>
        </svg>

        {done && (
          <WinOverlay
            title={`${score} points`}
            subtitle={`You grew to size ${player.value}`}
            onPlayAgain={reset}
            playAgainLabel="Play again"
          />
        )}
      </div>

      {!running && !done && (
        <button
          onClick={start}
          className="px-6 py-2.5 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white text-sm font-bold shadow hover:brightness-110 active:scale-95"
        >
          ▶ Start
        </button>
      )}
    </div>
  );
};

export default NumberRush;
