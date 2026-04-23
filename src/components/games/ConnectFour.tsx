import React, { useCallback, useEffect, useState } from 'react';
import StatusBar, { StatusTone } from '../shared/StatusBar';
import WinOverlay from '../shared/WinOverlay';

interface ConnectFourProps {
  isBotEnabled: boolean;
}

type Cell = 'R' | 'Y' | null;
const COLS = 7;
const ROWS = 6;

const emptyBoard = (): Cell[][] =>
  Array.from({ length: ROWS }, () => Array<Cell>(COLS).fill(null));

const findLandingRow = (board: Cell[][], col: number): number => {
  for (let r = ROWS - 1; r >= 0; r--) if (!board[r][col]) return r;
  return -1;
};

const checkWin = (
  board: Cell[][],
  row: number,
  col: number,
  color: Cell,
): Array<[number, number]> | null => {
  if (!color) return null;
  const dirs: Array<[number, number]> = [
    [0, 1], [1, 0], [1, 1], [1, -1],
  ];
  for (const [dr, dc] of dirs) {
    const line: Array<[number, number]> = [[row, col]];
    for (let s = 1; s < 4; s++) {
      const r = row + dr * s;
      const c = col + dc * s;
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS || board[r][c] !== color) break;
      line.push([r, c]);
    }
    for (let s = 1; s < 4; s++) {
      const r = row - dr * s;
      const c = col - dc * s;
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS || board[r][c] !== color) break;
      line.push([r, c]);
    }
    if (line.length >= 4) return line;
  }
  return null;
};

const ConnectFour: React.FC<ConnectFourProps> = ({ isBotEnabled }) => {
  const [board, setBoard] = useState<Cell[][]>(emptyBoard);
  const [turn, setTurn] = useState<'R' | 'Y'>('R');
  const [winner, setWinner] = useState<'R' | 'Y' | 'tie' | null>(null);
  const [winningCells, setWinningCells] = useState<Array<[number, number]>>([]);
  const [hoverCol, setHoverCol] = useState<number | null>(null);

  const drop = useCallback(
    (col: number, player: 'R' | 'Y') => {
      if (winner) return false;
      const r = findLandingRow(board, col);
      if (r < 0) return false;
      const next = board.map((row) => row.slice());
      next[r][col] = player;
      setBoard(next);

      const win = checkWin(next, r, col, player);
      if (win) {
        setWinner(player);
        setWinningCells(win);
      } else if (next.every((row) => row.every((c) => c !== null))) {
        setWinner('tie');
      } else {
        setTurn(player === 'R' ? 'Y' : 'R');
      }
      return true;
    },
    [board, winner],
  );

  // Bot plays Yellow
  useEffect(() => {
    if (!isBotEnabled || turn !== 'Y' || winner) return;
    const t = setTimeout(() => {
      const cols = Array.from({ length: COLS }, (_, i) => i).filter(
        (c) => findLandingRow(board, c) >= 0,
      );
      if (!cols.length) return;

      // 1. Win if possible
      for (const c of cols) {
        const r = findLandingRow(board, c);
        const test = board.map((row) => row.slice());
        test[r][c] = 'Y';
        if (checkWin(test, r, c, 'Y')) return drop(c, 'Y');
      }
      // 2. Block opponent win
      for (const c of cols) {
        const r = findLandingRow(board, c);
        const test = board.map((row) => row.slice());
        test[r][c] = 'R';
        if (checkWin(test, r, c, 'R')) return drop(c, 'Y');
      }
      // 3. Prefer center, then random
      const preferred = cols.sort(
        (a, b) => Math.abs(a - 3) - Math.abs(b - 3),
      );
      drop(preferred[0], 'Y');
    }, 450);
    return () => clearTimeout(t);
  }, [isBotEnabled, turn, winner, board, drop]);

  const tone: StatusTone = winner
    ? winner === 'tie'
      ? 'neutral'
      : 'success'
    : isBotEnabled && turn === 'Y'
      ? 'purple'
      : turn === 'R'
        ? 'warning'
        : 'info';

  const status = winner
    ? winner === 'tie'
      ? "It's a tie!"
      : `${winner === 'R' ? 'Red' : 'Yellow'} wins!`
    : `${turn === 'R' ? 'Red' : 'Yellow'}'s turn${isBotEnabled && turn === 'Y' ? ' (bot thinking…)' : ''}`;

  const isWinningCell = (r: number, c: number) =>
    winningCells.some(([wr, wc]) => wr === r && wc === c);

  const blockColumn = isBotEnabled && turn === 'Y' && !winner;

  return (
    <div className="flex flex-col items-center gap-5">
      <StatusBar tone={tone}>{status}</StatusBar>

      <div className="relative">
        {/* Hover preview row */}
        <div className="grid grid-cols-7 gap-1.5 mb-1 px-2">
          {Array.from({ length: COLS }).map((_, c) => (
            <div
              key={c}
              className="h-4 flex items-center justify-center"
              aria-hidden="true"
            >
              {hoverCol === c && !winner && !blockColumn && (
                <div
                  className={`w-3 h-3 rounded-full ${
                    turn === 'R' ? 'bg-rose-500' : 'bg-yellow-400'
                  } animate-bounce`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="relative p-2 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-xl">
          <div className="grid grid-cols-7 gap-1.5">
            {board.map((row, r) =>
              row.map((cell, c) => (
                <button
                  key={`${r}-${c}`}
                  onClick={() => !blockColumn && drop(c, turn)}
                  onMouseEnter={() => setHoverCol(c)}
                  onMouseLeave={() => setHoverCol((h) => (h === c ? null : h))}
                  disabled={!!winner || blockColumn || findLandingRow(board, c) < 0}
                  aria-label={`Column ${c + 1}, row ${r + 1}`}
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all ${
                    isWinningCell(r, c) ? 'ring-4 ring-emerald-300' : ''
                  }`}
                  style={{
                    background:
                      cell === 'R'
                        ? 'radial-gradient(circle at 35% 35%, #f87171, #b91c1c)'
                        : cell === 'Y'
                          ? 'radial-gradient(circle at 35% 35%, #fde047, #ca8a04)'
                          : 'radial-gradient(circle, #1e40af, #1e3a8a)',
                  }}
                />
              )),
            )}
          </div>
        </div>
        {winner && (
          <WinOverlay
            title={winner === 'tie' ? "It's a tie!" : `${winner === 'R' ? 'Red' : 'Yellow'} wins!`}
            subtitle={winner === 'tie' ? 'Board filled up.' : 'Four in a row!'}
            tie={winner === 'tie'}
          />
        )}
      </div>

      <p className="text-xs md:text-sm text-gray-500 max-w-md text-center">
        Click a column to drop your disc. First to line up four in a row — horizontally, vertically or diagonally — wins.
      </p>
    </div>
  );
};

export default ConnectFour;
