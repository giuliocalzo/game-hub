import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import StatusBar, { StatusTone } from '../shared/StatusBar';
import WinOverlay from '../shared/WinOverlay';

const GRID = 10;

type Piece = {
  shape: Array<[number, number]>; // offsets from origin
  color: string;
};

const SHAPES: Array<Array<[number, number]>> = [
  [[0, 0]],
  [[0, 0], [1, 0]],
  [[0, 0], [1, 0], [2, 0]],
  [[0, 0], [1, 0], [2, 0], [3, 0]],
  [[0, 0], [0, 1]],
  [[0, 0], [0, 1], [0, 2]],
  [[0, 0], [0, 1], [0, 2], [0, 3]],
  [[0, 0], [1, 0], [0, 1], [1, 1]], // 2x2
  [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1], [0, 2], [1, 2], [2, 2]], // 3x3
  [[0, 0], [1, 0], [0, 1]], // L
  [[0, 0], [1, 0], [1, 1]], // L
  [[1, 0], [0, 1], [1, 1]], // L
  [[0, 0], [0, 1], [1, 1]], // L
  [[0, 0], [1, 0], [2, 0], [0, 1]], // long L
  [[0, 0], [1, 0], [2, 0], [2, 1]], // long L
];

const COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#06b6d4', '#3b82f6', '#a855f7', '#ec4899',
];

const randomPiece = (): Piece => ({
  shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
  color: COLORS[Math.floor(Math.random() * COLORS.length)],
});

const emptyGrid = (): (string | null)[] => Array(GRID * GRID).fill(null);

const canPlace = (grid: (string | null)[], shape: Array<[number, number]>, x: number, y: number): boolean => {
  for (const [dx, dy] of shape) {
    const xx = x + dx;
    const yy = y + dy;
    if (xx < 0 || xx >= GRID || yy < 0 || yy >= GRID) return false;
    if (grid[yy * GRID + xx] !== null) return false;
  }
  return true;
};

const place = (
  grid: (string | null)[],
  shape: Array<[number, number]>,
  color: string,
  x: number,
  y: number,
): (string | null)[] => {
  const next = grid.slice();
  for (const [dx, dy] of shape) next[(y + dy) * GRID + (x + dx)] = color;
  return next;
};

const clearLines = (grid: (string | null)[]): { next: (string | null)[]; cleared: number } => {
  const next = grid.slice();
  const rowsToClear: number[] = [];
  const colsToClear: number[] = [];
  for (let y = 0; y < GRID; y++) {
    if (Array.from({ length: GRID }).every((_, x) => next[y * GRID + x] !== null)) rowsToClear.push(y);
  }
  for (let x = 0; x < GRID; x++) {
    if (Array.from({ length: GRID }).every((_, y) => next[y * GRID + x] !== null)) colsToClear.push(x);
  }
  rowsToClear.forEach((y) => {
    for (let x = 0; x < GRID; x++) next[y * GRID + x] = null;
  });
  colsToClear.forEach((x) => {
    for (let y = 0; y < GRID; y++) next[y * GRID + x] = null;
  });
  return { next, cleared: rowsToClear.length + colsToClear.length };
};

const canPlaceAny = (grid: (string | null)[], pieces: Array<Piece | null>): boolean => {
  for (const p of pieces) {
    if (!p) continue;
    for (let y = 0; y < GRID; y++) {
      for (let x = 0; x < GRID; x++) {
        if (canPlace(grid, p.shape, x, y)) return true;
      }
    }
  }
  return false;
};

const BlockPuzzle: React.FC<{ isBotEnabled: boolean }> = () => {
  const [grid, setGrid] = useState<(string | null)[]>(emptyGrid);
  const [pieces, setPieces] = useState<Array<Piece | null>>(() => [randomPiece(), randomPiece(), randomPiece()]);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const reset = useCallback(() => {
    setGrid(emptyGrid());
    setPieces([randomPiece(), randomPiece(), randomPiece()]);
    setSelected(null);
    setScore(0);
    setDone(false);
  }, []);

  // Refill tray when all three used
  useEffect(() => {
    if (pieces.every((p) => p === null)) {
      setPieces([randomPiece(), randomPiece(), randomPiece()]);
    }
  }, [pieces]);

  // Game over check
  useEffect(() => {
    if (done) return;
    if (pieces.some((p) => p !== null) && !canPlaceAny(grid, pieces)) {
      setDone(true);
    }
  }, [grid, pieces, done]);

  const tryPlace = (x: number, y: number) => {
    if (done || selected === null) return;
    const piece = pieces[selected];
    if (!piece) return;
    if (!canPlace(grid, piece.shape, x, y)) return;
    const placed = place(grid, piece.shape, piece.color, x, y);
    const { next, cleared } = clearLines(placed);
    setGrid(next);
    setScore((s) => s + piece.shape.length + cleared * GRID);
    const newPieces = pieces.slice();
    newPieces[selected] = null;
    setPieces(newPieces);
    setSelected(null);
  };

  const selPiece = selected !== null ? pieces[selected] : null;
  const tone: StatusTone = done ? 'warning' : 'info';

  const renderPiece = useMemo(() => (p: Piece, cell: number = 20) => {
    const maxX = Math.max(...p.shape.map(([x]) => x)) + 1;
    const maxY = Math.max(...p.shape.map(([, y]) => y)) + 1;
    return (
      <svg viewBox={`0 0 ${maxX * cell} ${maxY * cell}`} width={maxX * cell} height={maxY * cell}>
        {p.shape.map(([x, y], i) => (
          <rect
            key={i}
            x={x * cell}
            y={y * cell}
            width={cell - 2}
            height={cell - 2}
            rx={3}
            fill={p.color}
            stroke="rgba(0,0,0,0.2)"
            strokeWidth={1}
          />
        ))}
      </svg>
    );
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-2">
        <button
          onClick={reset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <RefreshCw className="w-3.5 h-3.5" /> New game
        </button>
      </div>

      <StatusBar tone={tone}>
        {done ? `Game over — ${score} points` : `Score ${score} · Pick a piece, then tap a grid cell`}
      </StatusBar>

      <div className="relative w-full" style={{ maxWidth: 520 }}>
        <div
          className="grid p-1.5 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-400 dark:from-slate-800 dark:to-slate-950 shadow-xl"
          style={{ gridTemplateColumns: `repeat(${GRID}, minmax(0, 1fr))`, gap: 2 }}
        >
          {grid.map((c, i) => {
            const x = i % GRID;
            const y = Math.floor(i / GRID);
            const canPreview = selPiece && canPlace(grid, selPiece.shape, x, y);
            return (
              <button
                key={i}
                onClick={() => tryPlace(x, y)}
                disabled={done}
                className={`aspect-square rounded transition-colors ${
                  c
                    ? ''
                    : canPreview
                    ? 'bg-white/80 dark:bg-gray-900/80'
                    : 'bg-white/50 dark:bg-gray-900/40'
                }`}
                style={{
                  background: c ?? undefined,
                  outline: c ? '1px solid rgba(0,0,0,0.15)' : undefined,
                }}
              />
            );
          })}
        </div>

        {/* Tray */}
        <div className="mt-4 flex justify-center items-center gap-4 h-24">
          {pieces.map((p, i) => (
            <button
              key={i}
              onClick={() => setSelected(selected === i ? null : i)}
              disabled={!p || done}
              className={`min-w-[4rem] min-h-[4rem] rounded-xl flex items-center justify-center p-2 border-2 transition ${
                selected === i
                  ? 'border-amber-400 bg-amber-50 dark:bg-amber-500/10 ring-2 ring-amber-200 -translate-y-1'
                  : p
                  ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300'
                  : 'border-dashed border-gray-200 dark:border-gray-700 opacity-40'
              }`}
            >
              {p ? renderPiece(p, 20) : <span className="text-gray-300">—</span>}
            </button>
          ))}
        </div>

        {done && (
          <WinOverlay
            title={`${score} points`}
            subtitle="No more pieces fit."
            onPlayAgain={reset}
            playAgainLabel="New game"
          />
        )}
      </div>
    </div>
  );
};

export default BlockPuzzle;
