import React, { useCallback, useEffect, useRef, useState } from 'react';
import StatusBar, { StatusTone } from '../shared/StatusBar';
import WinOverlay from '../shared/WinOverlay';

type Level = 'small' | 'medium' | 'large';

const SIZES: Record<Level, number> = {
  small: 10,
  medium: 16,
  large: 22,
};

interface Cell {
  walls: { top: boolean; right: boolean; bottom: boolean; left: boolean };
  visited: boolean;
}

const generateMaze = (cols: number, rows: number): Cell[][] => {
  const grid: Cell[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      walls: { top: true, right: true, bottom: true, left: true },
      visited: false,
    })),
  );

  const stack: Array<[number, number]> = [];
  let cx = 0;
  let cy = 0;
  grid[cy][cx].visited = true;
  stack.push([cx, cy]);

  while (stack.length) {
    [cx, cy] = stack[stack.length - 1];
    const neighbors: Array<[number, number, keyof Cell['walls'], keyof Cell['walls']]> = [];
    if (cy > 0 && !grid[cy - 1][cx].visited) neighbors.push([cx, cy - 1, 'top', 'bottom']);
    if (cx < cols - 1 && !grid[cy][cx + 1].visited) neighbors.push([cx + 1, cy, 'right', 'left']);
    if (cy < rows - 1 && !grid[cy + 1][cx].visited) neighbors.push([cx, cy + 1, 'bottom', 'top']);
    if (cx > 0 && !grid[cy][cx - 1].visited) neighbors.push([cx - 1, cy, 'left', 'right']);

    if (neighbors.length === 0) {
      stack.pop();
      continue;
    }
    const [nx, ny, w1, w2] = neighbors[Math.floor(Math.random() * neighbors.length)];
    grid[cy][cx].walls[w1] = false;
    grid[ny][nx].walls[w2] = false;
    grid[ny][nx].visited = true;
    stack.push([nx, ny]);
  }

  return grid;
};

const Maze: React.FC<{ isBotEnabled: boolean }> = () => {
  const [level, setLevel] = useState<Level>('small');
  const [grid, setGrid] = useState<Cell[][]>(() => generateMaze(SIZES.small, SIZES.small));
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [moves, setMoves] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);
  const startRef = useRef<number>(Date.now());
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const size = SIZES[level];
  const cellSize = 480 / size;

  const reset = useCallback((l: Level = level) => {
    setLevel(l);
    setGrid(generateMaze(SIZES[l], SIZES[l]));
    setPos({ x: 0, y: 0 });
    setMoves(0);
    setElapsed(0);
    setDone(false);
    startRef.current = Date.now();
  }, [level]);

  useEffect(() => {
    if (done) return;
    tickRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 500);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [done, level]);

  const move = useCallback(
    (dx: number, dy: number) => {
      if (done) return;
      setPos((p) => {
        const cell = grid[p.y][p.x];
        if (dx === 1 && !cell.walls.right && p.x < size - 1) {
          setMoves((m) => m + 1);
          return { x: p.x + 1, y: p.y };
        }
        if (dx === -1 && !cell.walls.left && p.x > 0) {
          setMoves((m) => m + 1);
          return { x: p.x - 1, y: p.y };
        }
        if (dy === 1 && !cell.walls.bottom && p.y < size - 1) {
          setMoves((m) => m + 1);
          return { x: p.x, y: p.y + 1 };
        }
        if (dy === -1 && !cell.walls.top && p.y > 0) {
          setMoves((m) => m + 1);
          return { x: p.x, y: p.y - 1 };
        }
        return p;
      });
    },
    [done, grid, size],
  );

  useEffect(() => {
    if (pos.x === size - 1 && pos.y === size - 1) setDone(true);
  }, [pos, size]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (done) return;
      if (e.key === 'ArrowUp' || e.key === 'w') { e.preventDefault(); move(0, -1); }
      else if (e.key === 'ArrowDown' || e.key === 's') { e.preventDefault(); move(0, 1); }
      else if (e.key === 'ArrowLeft' || e.key === 'a') { e.preventDefault(); move(-1, 0); }
      else if (e.key === 'ArrowRight' || e.key === 'd') { e.preventDefault(); move(1, 0); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [move, done]);

  const tone: StatusTone = done ? 'success' : 'info';
  const viewSize = cellSize * size;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-2">
        {(['small', 'medium', 'large'] as Level[]).map((l) => (
          <button
            key={l}
            onClick={() => reset(l)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
              level === l
                ? 'bg-gray-900 text-white border-gray-900 dark:bg-gray-100 dark:text-gray-900 dark:border-gray-100'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
            }`}
          >
            {SIZES[l]}×{SIZES[l]}
          </button>
        ))}
      </div>

      <StatusBar tone={tone}>
        {done
          ? `Solved in ${moves} moves · ${elapsed}s`
          : `Moves ${moves} · ${elapsed}s · Use arrow keys or WASD`}
      </StatusBar>

      <div className="relative w-full" style={{ maxWidth: 560 }}>
        <svg
          viewBox={`0 0 ${viewSize} ${viewSize}`}
          className="w-full rounded-2xl shadow-xl"
          style={{ background: '#fafafa', aspectRatio: '1 / 1' }}
        >
          {/* Goal marker */}
          <rect
            x={(size - 1) * cellSize}
            y={(size - 1) * cellSize}
            width={cellSize}
            height={cellSize}
            fill="#bbf7d0"
          />
          <text
            x={(size - 1) * cellSize + cellSize / 2}
            y={(size - 1) * cellSize + cellSize / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={cellSize * 0.7}
          >
            🏁
          </text>

          {/* Walls */}
          {grid.flatMap((row, y) =>
            row.flatMap((cell, x) => {
              const x0 = x * cellSize;
              const y0 = y * cellSize;
              const lines: React.ReactNode[] = [];
              if (cell.walls.top) lines.push(<line key={`${x}-${y}-t`} x1={x0} y1={y0} x2={x0 + cellSize} y2={y0} stroke="#0f172a" strokeWidth={2} strokeLinecap="round" />);
              if (cell.walls.left) lines.push(<line key={`${x}-${y}-l`} x1={x0} y1={y0} x2={x0} y2={y0 + cellSize} stroke="#0f172a" strokeWidth={2} strokeLinecap="round" />);
              if (y === size - 1 && cell.walls.bottom) lines.push(<line key={`${x}-${y}-b`} x1={x0} y1={y0 + cellSize} x2={x0 + cellSize} y2={y0 + cellSize} stroke="#0f172a" strokeWidth={2} strokeLinecap="round" />);
              if (x === size - 1 && cell.walls.right) lines.push(<line key={`${x}-${y}-r`} x1={x0 + cellSize} y1={y0} x2={x0 + cellSize} y2={y0 + cellSize} stroke="#0f172a" strokeWidth={2} strokeLinecap="round" />);
              return lines;
            }),
          )}

          {/* Player */}
          <circle
            cx={pos.x * cellSize + cellSize / 2}
            cy={pos.y * cellSize + cellSize / 2}
            r={cellSize * 0.32}
            fill="#6366f1"
            stroke="white"
            strokeWidth={2}
            style={{ transition: 'cx 150ms, cy 150ms' }}
          />
        </svg>

        {done && (
          <WinOverlay
            title={`${moves} moves`}
            subtitle={`Escaped in ${elapsed}s`}
            onPlayAgain={() => reset(level)}
            playAgainLabel="New maze"
          />
        )}
      </div>

      {/* Touch controls */}
      <div className="grid grid-cols-3 gap-2 w-44">
        <div />
        <button onClick={() => move(0, -1)} className="py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow active:scale-95">▲</button>
        <div />
        <button onClick={() => move(-1, 0)} className="py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow active:scale-95">◀</button>
        <button onClick={() => move(0, 1)} className="py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow active:scale-95">▼</button>
        <button onClick={() => move(1, 0)} className="py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow active:scale-95">▶</button>
      </div>
    </div>
  );
};

export default Maze;
