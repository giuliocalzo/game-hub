import React, { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import StatusBar, { StatusTone } from '../shared/StatusBar';
import WinOverlay from '../shared/WinOverlay';

type Level = 'easy' | 'medium' | 'hard';

interface Puzzle {
  size: number;
  endpoints: Array<{ color: string; a: [number, number]; b: [number, number] }>;
}

// Handcrafted 5x5 / 6x6 / 7x7 puzzles
const PUZZLES: Record<Level, Puzzle[]> = {
  easy: [
    {
      size: 5,
      endpoints: [
        { color: '#ef4444', a: [0, 0], b: [2, 4] },
        { color: '#3b82f6', a: [0, 2], b: [4, 1] },
        { color: '#10b981', a: [2, 1], b: [3, 3] },
        { color: '#f59e0b', a: [4, 3], b: [4, 4] },
      ],
    },
    {
      size: 5,
      endpoints: [
        { color: '#ef4444', a: [0, 0], b: [4, 4] },
        { color: '#3b82f6', a: [0, 4], b: [4, 0] },
        { color: '#10b981', a: [1, 2], b: [3, 2] },
      ],
    },
  ],
  medium: [
    {
      size: 6,
      endpoints: [
        { color: '#ef4444', a: [0, 0], b: [5, 5] },
        { color: '#3b82f6', a: [0, 5], b: [5, 0] },
        { color: '#10b981', a: [1, 1], b: [4, 4] },
        { color: '#f59e0b', a: [2, 2], b: [3, 3] },
        { color: '#a855f7', a: [0, 2], b: [5, 2] },
      ],
    },
  ],
  hard: [
    {
      size: 7,
      endpoints: [
        { color: '#ef4444', a: [0, 0], b: [6, 6] },
        { color: '#3b82f6', a: [0, 6], b: [6, 0] },
        { color: '#10b981', a: [0, 3], b: [6, 3] },
        { color: '#f59e0b', a: [3, 0], b: [3, 6] },
        { color: '#a855f7', a: [1, 1], b: [5, 5] },
        { color: '#ec4899', a: [1, 5], b: [5, 1] },
      ],
    },
  ],
};

// The board stores, per cell, the color it's assigned to (or null)
// plus a path ordering so we know the current active trail per color.

type Trail = Array<[number, number]>;

const samePoint = (a: [number, number], b: [number, number]) => a[0] === b[0] && a[1] === b[1];

const adjacent = (a: [number, number], b: [number, number]) =>
  Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) === 1;

const ColorLink: React.FC<{ isBotEnabled: boolean }> = () => {
  const [level, setLevel] = useState<Level>('easy');
  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const puzzle = PUZZLES[level][puzzleIdx % PUZZLES[level].length];
  const [trails, setTrails] = useState<Record<string, Trail>>({});
  const [drawing, setDrawing] = useState<{ color: string; trail: Trail } | null>(null);
  const [done, setDone] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const reset = useCallback((l: Level = level, idx: number = 0) => {
    setLevel(l);
    setPuzzleIdx(idx);
    setTrails({});
    setDrawing(null);
    setDone(false);
  }, [level]);

  const size = puzzle.size;
  const cell = 64;
  const viewSize = cell * size;

  const cellAt = (clientX: number, clientY: number): [number, number] | null => {
    const rect = svgRef.current!.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * viewSize;
    const y = ((clientY - rect.top) / rect.height) * viewSize;
    const cx = Math.floor(x / cell);
    const cy = Math.floor(y / cell);
    if (cx < 0 || cx >= size || cy < 0 || cy >= size) return null;
    return [cx, cy];
  };

  const endpointAt = (p: [number, number]): string | null => {
    for (const ep of puzzle.endpoints) {
      if (samePoint(p, ep.a) || samePoint(p, ep.b)) return ep.color;
    }
    return null;
  };

  const cellOwner = (p: [number, number], extraTrails: Record<string, Trail> = trails): string | null => {
    // Endpoint ownership is implicit (belongs to its color)
    const ep = endpointAt(p);
    if (ep) return ep;
    for (const [color, tr] of Object.entries(extraTrails)) {
      if (tr.some((c) => samePoint(c, p))) return color;
    }
    return null;
  };

  const start = (p: [number, number]) => {
    if (done) return;
    const color = endpointAt(p);
    if (color) {
      // Start a new trail for this color (clears any existing trail for it)
      setTrails((t) => ({ ...t, [color]: [] }));
      setDrawing({ color, trail: [p] });
      return;
    }
    // Tapping mid-cell with a completed trail: allow re-drawing by clearing that color
    const own = cellOwner(p);
    if (own) {
      setTrails((t) => ({ ...t, [own]: [] }));
      setDrawing(null);
    }
  };

  const extend = (p: [number, number]) => {
    if (!drawing || done) return;
    const { color, trail } = drawing;
    // Already last cell?
    if (trail.length && samePoint(trail[trail.length - 1], p)) return;
    // Backtrack
    if (trail.length >= 2 && samePoint(trail[trail.length - 2], p)) {
      setDrawing({ color, trail: trail.slice(0, -1) });
      return;
    }
    const last = trail[trail.length - 1];
    if (!adjacent(last, p)) return;
    // Cannot cross another color's trail or an endpoint of a different color
    const owner = cellOwner(p, { ...trails, [color]: trail });
    if (owner && owner !== color) return;
    // Not on own trail (would create a loop)
    if (trail.some((c) => samePoint(c, p))) return;
    setDrawing({ color, trail: [...trail, p] });
  };

  const finish = () => {
    if (!drawing) return;
    const { color, trail } = drawing;
    // Check if trail ends on the other endpoint of its color
    const ep = puzzle.endpoints.find((e) => e.color === color);
    if (!ep) return;
    const last = trail[trail.length - 1];
    const validEnd = samePoint(last, ep.a) || samePoint(last, ep.b);
    if (validEnd && trail.length >= 2) {
      setTrails((t) => ({ ...t, [color]: trail }));
    } else {
      setTrails((t) => ({ ...t, [color]: [] }));
    }
    setDrawing(null);
  };

  // Pointer handlers
  const onDown = (e: React.PointerEvent<SVGSVGElement>) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const p = cellAt(e.clientX, e.clientY);
    if (p) start(p);
  };
  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!drawing) return;
    const p = cellAt(e.clientX, e.clientY);
    if (p) extend(p);
  };
  const onUp = () => finish();

  // Check solved
  useEffect(() => {
    if (done) return;
    // All endpoint pairs connected and every cell owned by some color
    const totalCells = size * size;
    let owned = 0;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (cellOwner([x, y])) owned++;
      }
    }
    const allConnected = puzzle.endpoints.every((ep) => {
      const tr = trails[ep.color];
      if (!tr || tr.length < 2) return false;
      const first = tr[0];
      const last = tr[tr.length - 1];
      return (
        (samePoint(first, ep.a) && samePoint(last, ep.b)) ||
        (samePoint(first, ep.b) && samePoint(last, ep.a))
      );
    });
    if (allConnected && owned === totalCells) setDone(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trails, size, puzzle]);

  const toPath = (tr: Trail): string => {
    if (tr.length < 2) return '';
    return tr
      .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x * cell + cell / 2} ${y * cell + cell / 2}`)
      .join(' ');
  };

  const tone: StatusTone = done ? 'success' : 'info';
  const puzzleCount = PUZZLES[level].length;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap gap-2 justify-center">
        {(['easy', 'medium', 'hard'] as Level[]).map((l) => (
          <button
            key={l}
            onClick={() => reset(l, 0)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
              level === l
                ? 'bg-gray-900 text-white border-gray-900 dark:bg-gray-100 dark:text-gray-900 dark:border-gray-100'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
            }`}
          >
            {l}
          </button>
        ))}
        <button
          onClick={() => reset(level, (puzzleIdx + 1) % puzzleCount)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Next
        </button>
      </div>

      <StatusBar tone={tone}>
        {done
          ? 'Solved!'
          : 'Drag from a dot to its match. Fill every cell.'}
      </StatusBar>

      <div className="relative w-full" style={{ maxWidth: 560 }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${viewSize} ${viewSize}`}
          className="w-full rounded-2xl shadow-xl touch-none cursor-pointer"
          style={{ background: '#0f172a', aspectRatio: '1 / 1' }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerLeave={onUp}
        >
          {/* Grid */}
          {Array.from({ length: size + 1 }).map((_, i) => (
            <g key={i}>
              <line x1={i * cell} y1={0} x2={i * cell} y2={viewSize} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
              <line x1={0} y1={i * cell} x2={viewSize} y2={i * cell} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
            </g>
          ))}

          {/* Completed trails */}
          {Object.entries(trails).map(([color, tr]) => (
            <path
              key={color}
              d={toPath(tr)}
              stroke={color}
              strokeWidth={cell * 0.45}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.75}
            />
          ))}

          {/* Active drawing trail */}
          {drawing && drawing.trail.length > 1 && (
            <path
              d={toPath(drawing.trail)}
              stroke={drawing.color}
              strokeWidth={cell * 0.45}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.75}
            />
          )}

          {/* Endpoints */}
          {puzzle.endpoints.flatMap((ep) => [
            <circle key={`${ep.color}-a`} cx={ep.a[0] * cell + cell / 2} cy={ep.a[1] * cell + cell / 2} r={cell * 0.35} fill={ep.color} stroke="white" strokeWidth={2} />,
            <circle key={`${ep.color}-b`} cx={ep.b[0] * cell + cell / 2} cy={ep.b[1] * cell + cell / 2} r={cell * 0.35} fill={ep.color} stroke="white" strokeWidth={2} />,
          ])}
        </svg>

        {done && (
          <WinOverlay
            title="Connected!"
            subtitle="All dots linked."
            onPlayAgain={() => reset(level, (puzzleIdx + 1) % puzzleCount)}
            playAgainLabel="Next puzzle"
          />
        )}
      </div>
    </div>
  );
};

export default ColorLink;
