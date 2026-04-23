import React, { useCallback, useEffect, useState } from 'react';
import { RefreshCw, Undo2 } from 'lucide-react';
import StatusBar, { StatusTone } from '../shared/StatusBar';
import WinOverlay from '../shared/WinOverlay';

// English peg solitaire: 7x7 board; corners are blocked (2x2 blocks in corners).
// Center starts empty.
type Cell = 'peg' | 'empty' | 'blocked';

const SIZE = 7;

const initialBoard = (): Cell[][] => {
  const g: Cell[][] = [];
  for (let y = 0; y < SIZE; y++) {
    const row: Cell[] = [];
    for (let x = 0; x < SIZE; x++) {
      const inCorner =
        (x < 2 && y < 2) ||
        (x > 4 && y < 2) ||
        (x < 2 && y > 4) ||
        (x > 4 && y > 4);
      if (inCorner) row.push('blocked');
      else if (x === 3 && y === 3) row.push('empty');
      else row.push('peg');
    }
    g.push(row);
  }
  return g;
};

const countPegs = (g: Cell[][]): number =>
  g.reduce((sum, row) => sum + row.filter((c) => c === 'peg').length, 0);

const hasAnyMove = (g: Cell[][]): boolean => {
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      if (g[y][x] !== 'peg') continue;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const mx = x + dx;
        const my = y + dy;
        const tx = x + 2 * dx;
        const ty = y + 2 * dy;
        if (tx < 0 || tx >= SIZE || ty < 0 || ty >= SIZE) continue;
        if (g[my][mx] === 'peg' && g[ty][tx] === 'empty') return true;
      }
    }
  }
  return false;
};

const validMovesFor = (g: Cell[][], x: number, y: number): Array<[number, number]> => {
  const moves: Array<[number, number]> = [];
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const mx = x + dx;
    const my = y + dy;
    const tx = x + 2 * dx;
    const ty = y + 2 * dy;
    if (tx < 0 || tx >= SIZE || ty < 0 || ty >= SIZE) continue;
    if (g[y][x] === 'peg' && g[my][mx] === 'peg' && g[ty][tx] === 'empty') {
      moves.push([tx, ty]);
    }
  }
  return moves;
};

const PegSolitaire: React.FC<{ isBotEnabled: boolean }> = () => {
  const [board, setBoard] = useState<Cell[][]>(initialBoard);
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [history, setHistory] = useState<Cell[][][]>([]);
  const [done, setDone] = useState(false);

  const reset = useCallback(() => {
    setBoard(initialBoard());
    setSelected(null);
    setHistory([]);
    setDone(false);
  }, []);

  useEffect(() => {
    if (!hasAnyMove(board)) setDone(true);
  }, [board]);

  const click = (x: number, y: number) => {
    if (done) return;
    const cell = board[y][x];
    if (cell === 'blocked') return;

    if (selected) {
      const [sx, sy] = selected;
      const moves = validMovesFor(board, sx, sy);
      const target = moves.find(([tx, ty]) => tx === x && ty === y);
      if (target) {
        const mx = (sx + x) / 2;
        const my = (sy + y) / 2;
        const next = board.map((row) => row.slice());
        next[sy][sx] = 'empty';
        next[my][mx] = 'empty';
        next[y][x] = 'peg';
        setHistory((h) => [...h, board.map((r) => r.slice())]);
        setBoard(next);
        setSelected(null);
        return;
      }
      // Select different peg or deselect
      if (cell === 'peg') {
        setSelected([x, y]);
      } else {
        setSelected(null);
      }
    } else if (cell === 'peg') {
      setSelected([x, y]);
    }
  };

  const undo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setBoard(last);
    setHistory((h) => h.slice(0, -1));
    setSelected(null);
    setDone(false);
  };

  const pegs = countPegs(board);
  const isWin = pegs === 1 && board[3][3] === 'peg';
  const tone: StatusTone = done ? (isWin ? 'success' : 'warning') : 'info';

  const cell = 52;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-2">
        <button
          onClick={undo}
          disabled={!history.length || done}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
        >
          <Undo2 className="w-3.5 h-3.5" /> Undo
        </button>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>

      <StatusBar tone={tone}>
        {done
          ? isWin
            ? 'Perfect — one peg in the center!'
            : `No more moves — ${pegs} pegs left`
          : `Pegs remaining: ${pegs}`}
      </StatusBar>

      <div className="relative w-full" style={{ maxWidth: 440 }}>
        <svg
          viewBox={`0 0 ${cell * SIZE} ${cell * SIZE}`}
          className="w-full rounded-2xl shadow-xl"
          style={{ background: 'linear-gradient(135deg, #78350f, #92400e)', aspectRatio: '1 / 1' }}
        >
          {board.flatMap((row, y) =>
            row.map((c, x) => {
              if (c === 'blocked') return null;
              const isSel = selected && selected[0] === x && selected[1] === y;
              const canMoveHere =
                selected &&
                validMovesFor(board, selected[0], selected[1]).some(([tx, ty]) => tx === x && ty === y);
              const cx = x * cell + cell / 2;
              const cy = y * cell + cell / 2;
              return (
                <g key={`${x}-${y}`} onClick={() => click(x, y)} style={{ cursor: 'pointer' }}>
                  <circle cx={cx} cy={cy} r={cell * 0.35} fill="#422006" stroke="rgba(0,0,0,0.2)" strokeWidth={1} />
                  {c === 'peg' && (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={cell * 0.3}
                      fill={isSel ? '#f59e0b' : '#fbbf24'}
                      stroke="#78350f"
                      strokeWidth={2}
                    />
                  )}
                  {canMoveHere && (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={cell * 0.18}
                      fill="rgba(34, 197, 94, 0.7)"
                      stroke="white"
                      strokeWidth={2}
                    />
                  )}
                </g>
              );
            }),
          )}
        </svg>

        {done && (
          <WinOverlay
            title={isWin ? 'Perfect solve' : `${pegs} pegs left`}
            subtitle={isWin ? 'One peg in the center!' : 'No more moves available'}
            onPlayAgain={reset}
            playAgainLabel="Play again"
          />
        )}
      </div>
    </div>
  );
};

export default PegSolitaire;
