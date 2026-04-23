import React, { useCallback, useEffect, useMemo, useState } from 'react';
import StatusBar, { StatusTone } from '../shared/StatusBar';
import WinOverlay from '../shared/WinOverlay';

type Disc = 'B' | 'W' | null;
const SIZE = 8;

const initial = (): Disc[][] => {
  const g: Disc[][] = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
  g[3][3] = 'W'; g[4][4] = 'W';
  g[3][4] = 'B'; g[4][3] = 'B';
  return g;
};

const DIRS: Array<[number, number]> = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1],
];

const other = (p: Disc): Disc => (p === 'B' ? 'W' : 'B');

const flipsFor = (grid: Disc[][], r: number, c: number, player: Disc): Array<[number, number]> => {
  if (!player || grid[r][c]) return [];
  const flips: Array<[number, number]> = [];
  for (const [dr, dc] of DIRS) {
    const line: Array<[number, number]> = [];
    let i = r + dr, j = c + dc;
    while (i >= 0 && i < SIZE && j >= 0 && j < SIZE && grid[i][j] === other(player)) {
      line.push([i, j]);
      i += dr; j += dc;
    }
    if (line.length && i >= 0 && i < SIZE && j >= 0 && j < SIZE && grid[i][j] === player) {
      flips.push(...line);
    }
  }
  return flips;
};

const legalMoves = (grid: Disc[][], player: Disc): Map<string, Array<[number, number]>> => {
  const moves = new Map<string, Array<[number, number]>>();
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      const f = flipsFor(grid, r, c, player);
      if (f.length) moves.set(`${r},${c}`, f);
    }
  return moves;
};

const countDiscs = (grid: Disc[][]) => {
  let b = 0, w = 0;
  for (const row of grid) for (const v of row) {
    if (v === 'B') b++;
    else if (v === 'W') w++;
  }
  return { b, w };
};

const Reversi: React.FC<{ isBotEnabled: boolean }> = ({ isBotEnabled }) => {
  const [grid, setGrid] = useState<Disc[][]>(initial);
  const [turn, setTurn] = useState<Disc>('B');
  const [gameOver, setGameOver] = useState(false);

  const moves = useMemo(() => legalMoves(grid, turn), [grid, turn]);
  const { b, w } = useMemo(() => countDiscs(grid), [grid]);

  const play = useCallback(
    (r: number, c: number) => {
      const key = `${r},${c}`;
      const flips = moves.get(key);
      if (!flips) return;
      const next = grid.map((row) => row.slice());
      next[r][c] = turn;
      for (const [fr, fc] of flips) next[fr][fc] = turn;
      const nextTurn = other(turn);
      const nextMoves = legalMoves(next, nextTurn);
      if (nextMoves.size === 0) {
        const back = legalMoves(next, turn);
        if (back.size === 0) {
          setGameOver(true);
          setGrid(next);
          return;
        }
        // opponent skipped
        setGrid(next);
        setTurn(turn);
        return;
      }
      setGrid(next);
      setTurn(nextTurn);
    },
    [grid, turn, moves],
  );

  // Bot (white)
  useEffect(() => {
    if (!isBotEnabled || turn !== 'W' || gameOver) return;
    if (moves.size === 0) return;
    const t = setTimeout(() => {
      // Greedy: most flips
      let best: [string, number] = ['', -1];
      for (const [k, f] of moves) if (f.length > best[1]) best = [k, f.length];
      const [r, c] = best[0].split(',').map(Number);
      play(r, c);
    }, 500);
    return () => clearTimeout(t);
  }, [isBotEnabled, turn, moves, gameOver, play]);

  const reset = () => {
    setGrid(initial());
    setTurn('B');
    setGameOver(false);
  };

  const winner = gameOver ? (b > w ? 'Black' : w > b ? 'White' : 'Tie') : null;
  const tone: StatusTone = gameOver ? 'success' : isBotEnabled && turn === 'W' ? 'purple' : 'info';

  const status = gameOver
    ? `Game over — Black ${b} · White ${w}`
    : moves.size === 0
      ? 'No moves available — turn passes'
      : `${turn === 'B' ? 'Black' : 'White'}'s turn · Black ${b} · White ${w}`;

  return (
    <div className="flex flex-col items-center gap-5">
      <StatusBar tone={tone}>{status}</StatusBar>

      <div className="relative">
        <div className="grid grid-cols-8 gap-0.5 p-2 rounded-2xl bg-emerald-800 shadow-xl">
          {grid.map((row, r) =>
            row.map((cell, c) => {
              const isLegal = moves.has(`${r},${c}`);
              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => play(r, c)}
                  disabled={!isLegal || gameOver}
                  className={`w-9 h-9 md:w-11 md:h-11 rounded bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center`}
                >
                  {cell && (
                    <div
                      className={`w-7 h-7 md:w-9 md:h-9 rounded-full ${
                        cell === 'B' ? 'bg-gray-900' : 'bg-white'
                      } shadow`}
                    />
                  )}
                  {!cell && isLegal && !gameOver && (
                    <div
                      className={`w-3 h-3 rounded-full ${
                        turn === 'B' ? 'bg-gray-900/40' : 'bg-white/60'
                      }`}
                    />
                  )}
                </button>
              );
            }),
          )}
        </div>
        {gameOver && (
          <WinOverlay
            title={winner === 'Tie' ? "It's a tie!" : `${winner} wins!`}
            subtitle={`Black ${b} · White ${w}`}
            tie={winner === 'Tie'}
            onPlayAgain={reset}
          />
        )}
      </div>

    </div>
  );
};

export default Reversi;
