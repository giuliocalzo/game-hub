import React, { useCallback, useEffect, useMemo, useState } from 'react';
import StatusBar, { StatusTone } from '../shared/StatusBar';
import WinOverlay from '../shared/WinOverlay';

type Stone = 'B' | 'W' | null;
const SIZE = 15;

const DIRS: Array<[number, number]> = [
  [0, 1], [1, 0], [1, 1], [1, -1],
];

const checkLine = (grid: Stone[][], r: number, c: number, color: Stone): Array<[number, number]> | null => {
  if (!color) return null;
  for (const [dr, dc] of DIRS) {
    const line: Array<[number, number]> = [[r, c]];
    for (let s = 1; s < 5; s++) {
      const nr = r + dr * s, nc = c + dc * s;
      if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE || grid[nr][nc] !== color) break;
      line.push([nr, nc]);
    }
    for (let s = 1; s < 5; s++) {
      const nr = r - dr * s, nc = c - dc * s;
      if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE || grid[nr][nc] !== color) break;
      line.push([nr, nc]);
    }
    if (line.length >= 5) return line;
  }
  return null;
};

const Gomoku: React.FC<{ isBotEnabled: boolean }> = ({ isBotEnabled }) => {
  const [grid, setGrid] = useState<Stone[][]>(() =>
    Array.from({ length: SIZE }, () => Array(SIZE).fill(null)),
  );
  const [turn, setTurn] = useState<Stone>('B');
  const [winner, setWinner] = useState<Stone | 'tie' | null>(null);
  const [winLine, setWinLine] = useState<Array<[number, number]> | null>(null);

  const place = useCallback(
    (r: number, c: number, color: Stone) => {
      if (!color || winner || grid[r][c]) return;
      const next = grid.map((row) => row.slice());
      next[r][c] = color;
      setGrid(next);
      const line = checkLine(next, r, c, color);
      if (line) {
        setWinner(color);
        setWinLine(line);
      } else if (next.every((row) => row.every((v) => v !== null))) {
        setWinner('tie');
      } else {
        setTurn(color === 'B' ? 'W' : 'B');
      }
    },
    [grid, winner],
  );

  // Simple bot: finds immediate win/block, else near last stone, else center
  useEffect(() => {
    if (!isBotEnabled || turn !== 'W' || winner) return;
    const t = setTimeout(() => {
      const candidates: Array<[number, number]> = [];
      // Collect empty cells near existing stones
      for (let r = 0; r < SIZE; r++)
        for (let c = 0; c < SIZE; c++) {
          if (grid[r][c]) continue;
          let near = false;
          for (let dr = -2; dr <= 2 && !near; dr++)
            for (let dc = -2; dc <= 2 && !near; dc++) {
              const nr = r + dr, nc = c + dc;
              if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && grid[nr][nc]) near = true;
            }
          if (near) candidates.push([r, c]);
        }
      if (!candidates.length) candidates.push([Math.floor(SIZE / 2), Math.floor(SIZE / 2)]);

      // Win
      for (const [r, c] of candidates) {
        const test = grid.map((row) => row.slice());
        test[r][c] = 'W';
        if (checkLine(test, r, c, 'W')) return place(r, c, 'W');
      }
      // Block
      for (const [r, c] of candidates) {
        const test = grid.map((row) => row.slice());
        test[r][c] = 'B';
        if (checkLine(test, r, c, 'B')) return place(r, c, 'W');
      }
      // Heuristic: pick random from candidates
      const pick = candidates[Math.floor(Math.random() * candidates.length)];
      place(pick[0], pick[1], 'W');
    }, 500);
    return () => clearTimeout(t);
  }, [isBotEnabled, turn, winner, grid, place]);

  const reset = () => {
    setGrid(Array.from({ length: SIZE }, () => Array(SIZE).fill(null)));
    setTurn('B');
    setWinner(null);
    setWinLine(null);
  };

  const isWin = useMemo(() => {
    const m = new Set((winLine ?? []).map(([r, c]) => `${r},${c}`));
    return (r: number, c: number) => m.has(`${r},${c}`);
  }, [winLine]);

  const tone: StatusTone = winner
    ? winner === 'tie' ? 'neutral' : 'success'
    : isBotEnabled && turn === 'W' ? 'purple' : 'info';

  const status = winner
    ? winner === 'tie' ? "It's a tie!" : `${winner === 'B' ? 'Black' : 'White'} wins!`
    : `${turn === 'B' ? 'Black' : 'White'}'s turn`;

  return (
    <div className="flex flex-col items-center gap-5">
      <StatusBar tone={tone}>{status}</StatusBar>

      <div className="relative">
        <div className="p-2 rounded-2xl bg-amber-200 shadow-inner overflow-x-auto">
          <div
            className="grid gap-0"
            style={{ gridTemplateColumns: `repeat(${SIZE}, 22px)` }}
          >
            {grid.map((row, r) =>
              row.map((cell, c) => (
                <button
                  key={`${r}-${c}`}
                  onClick={() => place(r, c, turn)}
                  disabled={!!cell || !!winner || (isBotEnabled && turn === 'W')}
                  className="relative w-[22px] h-[22px] bg-amber-200 border border-amber-700/40"
                  aria-label={`Cell ${r}, ${c}`}
                >
                  {cell && (
                    <div
                      className={`absolute inset-[2px] rounded-full ${
                        cell === 'B' ? 'bg-gray-900' : 'bg-white border border-gray-400'
                      } ${isWin(r, c) ? 'ring-2 ring-emerald-400' : ''}`}
                    />
                  )}
                </button>
              )),
            )}
          </div>
        </div>
        {winner && (
          <WinOverlay
            title={winner === 'tie' ? "It's a tie!" : `${winner === 'B' ? 'Black' : 'White'} wins!`}
            subtitle={winner === 'tie' ? 'Board full.' : 'Five in a row!'}
            tie={winner === 'tie'}
            onPlayAgain={reset}
          />
        )}
      </div>

    </div>
  );
};

export default Gomoku;
