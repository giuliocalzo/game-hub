import React, { useCallback, useEffect, useState } from 'react';
import StatusBar, { StatusTone } from '../shared/StatusBar';
import WinOverlay from '../shared/WinOverlay';

const SIZE = 4;
type Grid = number[][];

const emptyGrid = (): Grid =>
  Array.from({ length: SIZE }, () => Array(SIZE).fill(0));

const addRandomTile = (grid: Grid): Grid => {
  const empty: Array<[number, number]> = [];
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) if (!grid[r][c]) empty.push([r, c]);
  if (!empty.length) return grid;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  const next = grid.map((row) => row.slice());
  next[r][c] = Math.random() < 0.9 ? 2 : 4;
  return next;
};

const rotateCW = (grid: Grid): Grid =>
  grid[0].map((_, c) => grid.map((row) => row[c]).reverse());

const slideLeft = (grid: Grid): { grid: Grid; score: number; moved: boolean } => {
  let score = 0;
  let moved = false;
  const next = grid.map((row) => {
    const filtered = row.filter((v) => v !== 0);
    for (let i = 0; i < filtered.length - 1; i++) {
      if (filtered[i] === filtered[i + 1]) {
        filtered[i] *= 2;
        score += filtered[i];
        filtered.splice(i + 1, 1);
      }
    }
    while (filtered.length < SIZE) filtered.push(0);
    if (filtered.some((v, i) => v !== row[i])) moved = true;
    return filtered;
  });
  return { grid: next, score, moved };
};

const move = (
  grid: Grid,
  dir: 'left' | 'right' | 'up' | 'down',
): { grid: Grid; score: number; moved: boolean } => {
  let g = grid;
  const times =
    dir === 'left' ? 0 : dir === 'up' ? 1 : dir === 'right' ? 2 : 3;
  for (let i = 0; i < times; i++) g = rotateCW(g);
  const result = slideLeft(g);
  let out = result.grid;
  for (let i = 0; i < (4 - times) % 4; i++) out = rotateCW(out);
  return { grid: out, score: result.score, moved: result.moved };
};

const hasMoves = (grid: Grid): boolean => {
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      if (!grid[r][c]) return true;
      if (c + 1 < SIZE && grid[r][c] === grid[r][c + 1]) return true;
      if (r + 1 < SIZE && grid[r][c] === grid[r + 1][c]) return true;
    }
  return false;
};

const TILE_STYLES: Record<number, string> = {
  0: 'bg-gray-200 text-transparent',
  2: 'bg-amber-50 text-gray-700 dark:text-gray-300',
  4: 'bg-amber-100 text-gray-700 dark:text-gray-300',
  8: 'bg-orange-300 text-white',
  16: 'bg-orange-400 text-white',
  32: 'bg-orange-500 text-white',
  64: 'bg-red-500 text-white',
  128: 'bg-yellow-300 text-white',
  256: 'bg-yellow-400 text-white',
  512: 'bg-yellow-500 text-white',
  1024: 'bg-indigo-400 text-white',
  2048: 'bg-indigo-600 text-white',
};

const Game2048: React.FC<{ isBotEnabled: boolean }> = () => {
  const [grid, setGrid] = useState<Grid>(() =>
    addRandomTile(addRandomTile(emptyGrid())),
  );
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [won, setWon] = useState(false);
  const [over, setOver] = useState(false);

  const reset = useCallback(() => {
    setGrid(addRandomTile(addRandomTile(emptyGrid())));
    setScore(0);
    setWon(false);
    setOver(false);
  }, []);

  const tryMove = useCallback(
    (dir: 'left' | 'right' | 'up' | 'down') => {
      if (over) return;
      const res = move(grid, dir);
      if (!res.moved) return;
      const withTile = addRandomTile(res.grid);
      setGrid(withTile);
      setScore((s) => {
        const next = s + res.score;
        setBest((b) => Math.max(b, next));
        return next;
      });
      if (!won && withTile.some((row) => row.some((v) => v >= 2048))) setWon(true);
      if (!hasMoves(withTile)) setOver(true);
    },
    [grid, over, won],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, 'left' | 'right' | 'up' | 'down'> = {
        ArrowLeft: 'left',
        ArrowRight: 'right',
        ArrowUp: 'up',
        ArrowDown: 'down',
        a: 'left',
        d: 'right',
        w: 'up',
        s: 'down',
      };
      const dir = map[e.key];
      if (dir) {
        e.preventDefault();
        tryMove(dir);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [tryMove]);

  // Touch swipe support
  useEffect(() => {
    let sx = 0, sy = 0;
    const start = (e: TouchEvent) => {
      sx = e.touches[0].clientX;
      sy = e.touches[0].clientY;
    };
    const end = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - sx;
      const dy = e.changedTouches[0].clientY - sy;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return;
      if (Math.abs(dx) > Math.abs(dy)) tryMove(dx > 0 ? 'right' : 'left');
      else tryMove(dy > 0 ? 'down' : 'up');
    };
    window.addEventListener('touchstart', start, { passive: true });
    window.addEventListener('touchend', end, { passive: true });
    return () => {
      window.removeEventListener('touchstart', start);
      window.removeEventListener('touchend', end);
    };
  }, [tryMove]);

  const tone: StatusTone = won ? 'success' : over ? 'warning' : 'info';
  const status = won
    ? `You reached 2048! Keep going or restart.`
    : over
      ? 'No moves left. Try again!'
      : 'Use arrows, WASD, or swipe to combine tiles.';

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex items-center justify-between w-full max-w-md">
        <StatBox label="Score" value={score} tone="from-blue-500 to-indigo-500" />
        <StatBox label="Best" value={best} tone="from-amber-500 to-orange-500" />
      </div>
      <StatusBar tone={tone}>{status}</StatusBar>

      <div className="relative">
        <div className="p-3 rounded-2xl bg-stone-300">
          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: `repeat(${SIZE}, minmax(0,1fr))` }}
          >
            {grid.map((row, r) =>
              row.map((v, c) => (
                <div
                  key={`${r}-${c}`}
                  className={`w-16 h-16 md:w-20 md:h-20 rounded-xl flex items-center justify-center font-extrabold text-xl md:text-2xl transition-all ${
                    TILE_STYLES[v] ?? 'bg-purple-600 text-white'
                  }`}
                >
                  {v || ''}
                </div>
              )),
            )}
          </div>
        </div>
        {over && (
          <WinOverlay
            title="Game over"
            subtitle={`Final score: ${score}`}
            onPlayAgain={reset}
            playAgainLabel="New game"
          />
        )}
      </div>

      {/* Direction controls for touch / mouse users */}
      <div className="grid grid-cols-3 gap-2 md:hidden">
        <div />
        <ArrowBtn onClick={() => tryMove('up')}>↑</ArrowBtn>
        <div />
        <ArrowBtn onClick={() => tryMove('left')}>←</ArrowBtn>
        <ArrowBtn onClick={() => tryMove('down')}>↓</ArrowBtn>
        <ArrowBtn onClick={() => tryMove('right')}>→</ArrowBtn>
      </div>

    </div>
  );
};

const StatBox: React.FC<{ label: string; value: number; tone: string }> = ({
  label,
  value,
  tone,
}) => (
  <div
    className={`flex-1 mx-1 rounded-xl px-4 py-2 text-white bg-gradient-to-br ${tone} text-center shadow`}
  >
    <div className="text-[10px] uppercase tracking-wider opacity-80">{label}</div>
    <div className="text-lg font-bold">{value}</div>
  </div>
);

const ArrowBtn: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({
  onClick,
  children,
}) => (
  <button
    onClick={onClick}
    className="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow text-xl font-bold active:scale-95"
  >
    {children}
  </button>
);

export default Game2048;
