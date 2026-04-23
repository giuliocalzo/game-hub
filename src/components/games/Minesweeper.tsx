import React, { useCallback, useMemo, useState } from 'react';
import StatusBar, { StatusTone } from '../shared/StatusBar';
import WinOverlay from '../shared/WinOverlay';

type Difficulty = 'easy' | 'medium' | 'hard';
const CONFIG: Record<Difficulty, { rows: number; cols: number; mines: number }> = {
  easy: { rows: 9, cols: 9, mines: 10 },
  medium: { rows: 12, cols: 12, mines: 22 },
  hard: { rows: 14, cols: 14, mines: 36 },
};

type Cell = { mine: boolean; open: boolean; flag: boolean; adj: number };

const build = (d: Difficulty): Cell[][] => {
  const { rows, cols, mines } = CONFIG[d];
  const grid: Cell[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ mine: false, open: false, flag: false, adj: 0 })),
  );
  let placed = 0;
  while (placed < mines) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if (!grid[r][c].mine) {
      grid[r][c].mine = true;
      placed++;
    }
  }
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      if (grid[r][c].mine) continue;
      let n = 0;
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc].mine) n++;
        }
      grid[r][c].adj = n;
    }
  return grid;
};

const COLOR_FOR_NUM = [
  '', 'text-blue-600', 'text-emerald-600', 'text-rose-600', 'text-purple-700',
  'text-orange-600', 'text-teal-600', 'text-gray-800', 'text-gray-600',
];

const Minesweeper: React.FC<{ isBotEnabled: boolean }> = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [grid, setGrid] = useState<Cell[][]>(() => build('easy'));
  const [over, setOver] = useState(false);
  const [won, setWon] = useState(false);

  const reset = useCallback((d: Difficulty) => {
    setDifficulty(d);
    setGrid(build(d));
    setOver(false);
    setWon(false);
  }, []);

  const flood = (g: Cell[][], r: number, c: number) => {
    const rows = g.length, cols = g[0].length;
    if (r < 0 || r >= rows || c < 0 || c >= cols) return;
    const cell = g[r][c];
    if (cell.open || cell.flag) return;
    cell.open = true;
    if (cell.adj === 0 && !cell.mine) {
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++)
          if (dr || dc) flood(g, r + dr, c + dc);
    }
  };

  const open = (r: number, c: number) => {
    if (over || won) return;
    const cell = grid[r][c];
    if (cell.flag || cell.open) return;
    const g = grid.map((row) => row.map((cc) => ({ ...cc })));
    if (g[r][c].mine) {
      for (const row of g) for (const cc of row) if (cc.mine) cc.open = true;
      setGrid(g);
      setOver(true);
      return;
    }
    flood(g, r, c);
    setGrid(g);
    checkWin(g);
  };

  const flag = (r: number, c: number) => {
    if (over || won) return;
    const g = grid.map((row) => row.map((cc) => ({ ...cc })));
    const cell = g[r][c];
    if (cell.open) return;
    cell.flag = !cell.flag;
    setGrid(g);
  };

  const checkWin = (g: Cell[][]) => {
    const safe = g.flat().filter((c) => !c.mine);
    if (safe.every((c) => c.open)) setWon(true);
  };

  const remainingMines = useMemo(() => {
    const flags = grid.flat().filter((c) => c.flag).length;
    return CONFIG[difficulty].mines - flags;
  }, [grid, difficulty]);

  const tone: StatusTone = won ? 'success' : over ? 'warning' : 'info';
  const status = won
    ? 'You cleared the field!'
    : over
      ? 'Boom! Try again.'
      : `Mines left: ${remainingMines}`;

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex gap-2">
        {(Object.keys(CONFIG) as Difficulty[]).map((d) => (
          <button
            key={d}
            onClick={() => reset(d)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
              difficulty === d
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-700 border-gray-200'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      <StatusBar tone={tone}>{status}</StatusBar>

      <div className="relative">
        <div
          className="p-2 rounded-2xl bg-gradient-to-br from-stone-200 to-stone-300 shadow-inner"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${CONFIG[difficulty].cols}, minmax(0,1fr))`,
            gap: 2,
          }}
        >
          {grid.map((row, r) =>
            row.map((cell, c) => {
              const handleRightClick = (e: React.MouseEvent) => {
                e.preventDefault();
                flag(r, c);
              };
              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => open(r, c)}
                  onContextMenu={handleRightClick}
                  className={`w-7 h-7 md:w-8 md:h-8 text-xs md:text-sm font-bold flex items-center justify-center rounded ${
                    cell.open
                      ? cell.mine
                        ? 'bg-rose-500 text-white'
                        : 'bg-stone-50 border border-stone-200'
                      : 'bg-stone-400 hover:bg-stone-300 text-stone-700'
                  }`}
                >
                  {cell.open
                    ? cell.mine
                      ? '💣'
                      : cell.adj > 0
                        ? <span className={COLOR_FOR_NUM[cell.adj]}>{cell.adj}</span>
                        : ''
                    : cell.flag
                      ? '🚩'
                      : ''}
                </button>
              );
            }),
          )}
        </div>
        {(over || won) && (
          <WinOverlay
            title={won ? 'Field cleared!' : 'Boom!'}
            subtitle={won ? 'All safe squares opened.' : 'Try another path.'}
            onPlayAgain={() => reset(difficulty)}
          />
        )}
      </div>

      <p className="text-xs md:text-sm text-gray-500 max-w-md text-center">
        Tap to open · right-click (or long-press) to flag. Numbers show nearby mines.
      </p>
    </div>
  );
};

export default Minesweeper;
