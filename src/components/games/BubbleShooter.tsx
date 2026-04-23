import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import StatusBar, { StatusTone } from '../shared/StatusBar';
import WinOverlay from '../shared/WinOverlay';

const COLS = 8;
const ROWS = 10;
const R = 20;                    // bubble radius (px)
const DX = R * 2;                // horizontal spacing
const DY = R * Math.sqrt(3);     // vertical spacing
const W = COLS * DX + R;         // board width
const SHOOTER_Y = (ROWS + 1) * DY + R + 20;
const H = SHOOTER_Y + 40;

const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'] as const;
type Color = (typeof COLORS)[number];

interface Bubble { r: number; c: number; color: Color; }

interface Shot { x: number; y: number; vx: number; vy: number; color: Color; }

const cellCenter = (r: number, c: number): { x: number; y: number } => {
  const offset = r % 2 === 0 ? 0 : R;
  return { x: R + offset + c * DX, y: R + r * DY };
};

const randomColor = (): Color => COLORS[Math.floor(Math.random() * COLORS.length)];

const BubbleShooter: React.FC<{ isBotEnabled: boolean }> = () => {
  const [grid, setGrid] = useState<Array<Bubble | null>>(() => {
    const arr: Array<Bubble | null> = Array(COLS * ROWS).fill(null);
    for (let r = 0; r < 5; r++) {
      const rowCols = r % 2 === 0 ? COLS : COLS - 1;
      for (let c = 0; c < rowCols; c++) {
        arr[r * COLS + c] = { r, c, color: randomColor() };
      }
    }
    return arr;
  });
  const [current, setCurrent] = useState<Color>(() => randomColor());
  const [next, setNext] = useState<Color>(() => randomColor());
  const [aim, setAim] = useState<number>(-Math.PI / 2); // pointing up
  const [shot, setShot] = useState<Shot | null>(null);
  const [score, setScore] = useState(0);
  const [over, setOver] = useState<'won' | 'lost' | null>(null);

  const gridRef = useRef(grid);
  gridRef.current = grid;
  const shotRef = useRef(shot);
  shotRef.current = shot;

  const reset = useCallback(() => {
    const arr: Array<Bubble | null> = Array(COLS * ROWS).fill(null);
    for (let r = 0; r < 5; r++) {
      const rowCols = r % 2 === 0 ? COLS : COLS - 1;
      for (let c = 0; c < rowCols; c++) {
        arr[r * COLS + c] = { r, c, color: randomColor() };
      }
    }
    setGrid(arr);
    setCurrent(randomColor());
    setNext(randomColor());
    setAim(-Math.PI / 2);
    setShot(null);
    setScore(0);
    setOver(null);
  }, []);

  const neighbors = (r: number, c: number): Array<[number, number]> => {
    const even = r % 2 === 0;
    const candidates = even
      ? [[-1, -1], [-1, 0], [0, -1], [0, 1], [1, -1], [1, 0]]
      : [[-1, 0], [-1, 1], [0, -1], [0, 1], [1, 0], [1, 1]];
    const out: Array<[number, number]> = [];
    for (const [dr, dc] of candidates) {
      const nr = r + dr, nc = c + dc;
      const cap = nr % 2 === 0 ? COLS : COLS - 1;
      if (nr >= 0 && nr < ROWS && nc >= 0 && nc < cap) out.push([nr, nc]);
    }
    return out;
  };

  const snap = (sx: number, sy: number): { r: number; c: number } => {
    let best = { r: 0, c: 0, d: Infinity };
    for (let r = 0; r < ROWS; r++) {
      const cap = r % 2 === 0 ? COLS : COLS - 1;
      for (let c = 0; c < cap; c++) {
        const { x, y } = cellCenter(r, c);
        const d = (x - sx) ** 2 + (y - sy) ** 2;
        if (d < best.d) best = { r, c, d };
      }
    }
    return { r: best.r, c: best.c };
  };

  const floodSame = (g: Array<Bubble | null>, startR: number, startC: number): Array<[number, number]> => {
    const start = g[startR * COLS + startC];
    if (!start) return [];
    const seen = new Set<string>();
    const stack: Array<[number, number]> = [[startR, startC]];
    const out: Array<[number, number]> = [];
    while (stack.length) {
      const [r, c] = stack.pop()!;
      const k = `${r},${c}`;
      if (seen.has(k)) continue;
      seen.add(k);
      const b = g[r * COLS + c];
      if (!b || b.color !== start.color) continue;
      out.push([r, c]);
      for (const n of neighbors(r, c)) stack.push(n);
    }
    return out;
  };

  const floodConnected = (g: Array<Bubble | null>): Set<string> => {
    const connected = new Set<string>();
    const stack: Array<[number, number]> = [];
    // Top row seeds
    for (let c = 0; c < COLS; c++) if (g[c]) stack.push([0, c]);
    while (stack.length) {
      const [r, c] = stack.pop()!;
      const k = `${r},${c}`;
      if (connected.has(k)) continue;
      const b = g[r * COLS + c];
      if (!b) continue;
      connected.add(k);
      for (const n of neighbors(r, c)) stack.push(n);
    }
    return connected;
  };

  // Shot physics
  useEffect(() => {
    if (!shot || over) return;
    let raf = 0;
    const step = () => {
      const s = shotRef.current;
      if (!s) return;
      let nx = s.x + s.vx;
      let ny = s.y + s.vy;
      // bounce walls
      if (nx < R) { nx = R; s.vx = -s.vx; }
      if (nx > W - R) { nx = W - R; s.vx = -s.vx; }

      // collision with grid
      let collided = false;
      for (let r = 0; r < ROWS && !collided; r++) {
        const cap = r % 2 === 0 ? COLS : COLS - 1;
        for (let c = 0; c < cap; c++) {
          if (!gridRef.current[r * COLS + c]) continue;
          const { x, y } = cellCenter(r, c);
          if ((nx - x) ** 2 + (ny - y) ** 2 < (R * 2) ** 2 * 0.9) {
            collided = true;
            break;
          }
        }
      }
      // top wall
      if (ny < R) { ny = R; collided = true; }

      if (collided) {
        const { r, c } = snap(nx, ny);
        const k = r * COLS + c;
        if (gridRef.current[k]) {
          // cell occupied — try to find nearest empty neighbor
          const pool = neighbors(r, c).filter(([nr, nc]) => !gridRef.current[nr * COLS + nc]);
          if (!pool.length) { setShot(null); return; }
          const { r: br, c: bc } = (() => {
            let best = { r: 0, c: 0, d: Infinity };
            for (const [nr, nc] of pool) {
              const p = cellCenter(nr, nc);
              const d = (p.x - nx) ** 2 + (p.y - ny) ** 2;
              if (d < best.d) best = { r: nr, c: nc, d };
            }
            return best;
          })();
          placeShot(br, bc, s.color);
        } else {
          placeShot(r, c, s.color);
        }
        return;
      }
      if (ny > H) { setShot(null); return; }

      setShot({ ...s, x: nx, y: ny });
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shot]);

  const placeShot = (r: number, c: number, color: Color) => {
    const g = [...gridRef.current];
    g[r * COLS + c] = { r, c, color };
    // Match detection
    const matched = floodSame(g, r, c);
    if (matched.length >= 3) {
      for (const [mr, mc] of matched) g[mr * COLS + mc] = null;
      setScore((s) => s + matched.length * 10);
      // drop disconnected
      const connected = floodConnected(g);
      let dropped = 0;
      for (let rr = 0; rr < ROWS; rr++) {
        const cap = rr % 2 === 0 ? COLS : COLS - 1;
        for (let cc = 0; cc < cap; cc++) {
          if (g[rr * COLS + cc] && !connected.has(`${rr},${cc}`)) {
            g[rr * COLS + cc] = null;
            dropped++;
          }
        }
      }
      if (dropped) setScore((s) => s + dropped * 20);
    }
    setGrid(g);
    setShot(null);
    setCurrent(next);
    setNext(randomColor());

    // Check win / loss
    if (g.every((b) => !b)) setOver('won');
    else {
      for (let rr = ROWS - 2; rr < ROWS; rr++) {
        const cap = rr % 2 === 0 ? COLS : COLS - 1;
        for (let cc = 0; cc < cap; cc++) if (g[rr * COLS + cc]) { setOver('lost'); return; }
      }
    }
  };

  const handleMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    const y = ((e.clientY - rect.top) / rect.height) * H;
    const dx = x - W / 2;
    const dy = y - SHOOTER_Y;
    let angle = Math.atan2(dy, dx);
    // clamp so we can't aim below horizontal
    if (angle > -0.15) angle = -0.15;
    if (angle < -Math.PI + 0.15) angle = -Math.PI + 0.15;
    setAim(angle);
  };

  const handleClick = () => {
    if (shot || over) return;
    const speed = 12;
    setShot({
      x: W / 2,
      y: SHOOTER_Y,
      vx: Math.cos(aim) * speed,
      vy: Math.sin(aim) * speed,
      color: current,
    });
  };

  const tone: StatusTone = over === 'won' ? 'success' : over === 'lost' ? 'warning' : 'info';
  const remaining = useMemo(() => grid.filter(Boolean).length, [grid]);

  return (
    <div className="flex flex-col items-center gap-5">
      <StatusBar tone={tone}>
        {over === 'won'
          ? `Cleared! Score ${score}`
          : over === 'lost'
            ? `Game over — Score ${score}`
            : `Score ${score} · Bubbles left: ${remaining}`}
      </StatusBar>

      <div className="relative w-full" style={{ maxWidth: W }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full rounded-2xl shadow-xl cursor-crosshair select-none"
          style={{ background: 'linear-gradient(to bottom, #0f172a, #1e293b)' }}
          onMouseMove={handleMove}
          onClick={handleClick}
        >
          {/* Aim line */}
          {!over && (
            <line
              x1={W / 2}
              y1={SHOOTER_Y}
              x2={W / 2 + Math.cos(aim) * 200}
              y2={SHOOTER_Y + Math.sin(aim) * 200}
              stroke="rgba(255,255,255,0.25)"
              strokeDasharray="4 6"
              strokeWidth="2"
            />
          )}
          {/* Grid bubbles */}
          {grid.map((b, i) => {
            if (!b) return null;
            const { x, y } = cellCenter(b.r, b.c);
            return (
              <circle key={i} cx={x} cy={y} r={R - 1} fill={b.color} stroke="rgba(0,0,0,0.2)" />
            );
          })}
          {/* Moving shot */}
          {shot && <circle cx={shot.x} cy={shot.y} r={R - 1} fill={shot.color} />}
          {/* Shooter */}
          <circle cx={W / 2} cy={SHOOTER_Y} r={R - 1} fill={current} stroke="white" strokeWidth="2" />
          {/* Next preview */}
          <circle cx={W / 2 - R * 2.5} cy={SHOOTER_Y} r={R - 6} fill={next} opacity="0.7" />
          <text
            x={W / 2 - R * 2.5}
            y={SHOOTER_Y + R + 14}
            textAnchor="middle"
            fontSize="10"
            fill="#cbd5e1"
          >
            next
          </text>
        </svg>
        {over && (
          <WinOverlay
            title={over === 'won' ? 'Cleared!' : 'Game over'}
            subtitle={`Score: ${score}`}
            onPlayAgain={reset}
          />
        )}
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md text-center">
        Aim with the mouse, click to shoot. Match 3+ bubbles of the same color to pop them.
      </p>
    </div>
  );
};

export default BubbleShooter;
