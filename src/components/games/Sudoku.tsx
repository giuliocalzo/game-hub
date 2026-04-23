import React, { useCallback, useEffect, useMemo, useState } from 'react';
import StatusBar, { StatusTone } from '../shared/StatusBar';
import WinOverlay from '../shared/WinOverlay';

type Board = number[][]; // 9x9, 0 = empty

const N = 9;

const deepCopy = (b: Board): Board => b.map((r) => r.slice());

const isValid = (b: Board, r: number, c: number, v: number): boolean => {
  for (let i = 0; i < N; i++) {
    if (b[r][i] === v) return false;
    if (b[i][c] === v) return false;
  }
  const br = Math.floor(r / 3) * 3;
  const bc = Math.floor(c / 3) * 3;
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++)
    if (b[br + i][bc + j] === v) return false;
  return true;
};

const fill = (b: Board): boolean => {
  for (let r = 0; r < N; r++)
    for (let c = 0; c < N; c++) {
      if (b[r][c] === 0) {
        const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
        for (const v of nums) {
          if (isValid(b, r, c, v)) {
            b[r][c] = v;
            if (fill(b)) return true;
            b[r][c] = 0;
          }
        }
        return false;
      }
    }
  return true;
};

type Difficulty = 'easy' | 'medium' | 'hard';
const HOLES: Record<Difficulty, number> = { easy: 35, medium: 45, hard: 55 };

const generate = (diff: Difficulty): { puzzle: Board; solution: Board } => {
  const b: Board = Array.from({ length: N }, () => Array(N).fill(0));
  fill(b);
  const solution = deepCopy(b);
  const holes = HOLES[diff];
  let removed = 0;
  while (removed < holes) {
    const r = Math.floor(Math.random() * N);
    const c = Math.floor(Math.random() * N);
    if (b[r][c] !== 0) {
      b[r][c] = 0;
      removed++;
    }
  }
  return { puzzle: b, solution };
};

const Sudoku: React.FC<{ isBotEnabled: boolean }> = () => {
  const [diff, setDiff] = useState<Difficulty>('easy');
  const [data, setData] = useState(() => generate('easy'));
  const [board, setBoard] = useState<Board>(() => deepCopy(data.puzzle));
  const [selected, setSelected] = useState<[number, number] | null>(null);

  const fixed = useMemo(() => {
    const out: boolean[][] = Array.from({ length: N }, () => Array(N).fill(false));
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (data.puzzle[r][c] !== 0) out[r][c] = true;
    return out;
  }, [data]);

  const reset = useCallback((d: Difficulty = diff) => {
    const fresh = generate(d);
    setDiff(d);
    setData(fresh);
    setBoard(deepCopy(fresh.puzzle));
    setSelected(null);
  }, [diff]);

  const isSolved = useMemo(() => {
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++)
      if (board[r][c] !== data.solution[r][c]) return false;
    return true;
  }, [board, data]);

  const setCell = (r: number, c: number, v: number) => {
    if (fixed[r][c]) return;
    const next = deepCopy(board);
    next[r][c] = v;
    setBoard(next);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!selected) return;
      const [r, c] = selected;
      if (e.key >= '1' && e.key <= '9') setCell(r, c, parseInt(e.key, 10));
      if (e.key === 'Backspace' || e.key === '0' || e.key === 'Delete') setCell(r, c, 0);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected, board, fixed]);

  const tone: StatusTone = isSolved ? 'success' : 'info';

  const cellClass = (r: number, c: number) => {
    const sel = selected && selected[0] === r && selected[1] === c;
    const v = board[r][c];
    const wrong = !fixed[r][c] && v !== 0 && v !== data.solution[r][c];
    return `${sel ? 'bg-blue-200' : wrong ? 'bg-rose-50' : 'bg-white'} ${
      fixed[r][c] ? 'text-gray-900' : 'text-blue-600'
    }`;
  };

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex gap-2">
        {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
          <button
            key={d}
            onClick={() => reset(d)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
              diff === d ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      <StatusBar tone={tone}>
        {isSolved ? 'Solved! Nicely done.' : 'Fill the grid so every row, column and 3×3 box has 1–9.'}
      </StatusBar>

      <div className="relative">
        <div className="p-1 rounded-2xl bg-gray-900 shadow-xl">
          <div
            className="grid bg-gray-900"
            style={{ gridTemplateColumns: `repeat(${N}, 2.2rem)` }}
          >
            {board.map((row, r) =>
              row.map((v, c) => {
                const borderR = (c + 1) % 3 === 0 && c < N - 1 ? 'border-r-2 border-gray-900' : 'border-r border-gray-300';
                const borderB = (r + 1) % 3 === 0 && r < N - 1 ? 'border-b-2 border-gray-900' : 'border-b border-gray-300';
                return (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => setSelected([r, c])}
                    className={`w-[2.2rem] h-[2.2rem] ${borderR} ${borderB} text-lg font-bold ${cellClass(r, c)}`}
                  >
                    {v !== 0 ? v : ''}
                  </button>
                );
              }),
            )}
          </div>
        </div>
        {isSolved && (
          <WinOverlay
            title="Sudoku solved!"
            subtitle="Great logic work."
            onPlayAgain={() => reset(diff)}
            playAgainLabel="New puzzle"
          />
        )}
      </div>

      <div className="grid grid-cols-5 gap-1.5 max-w-xs">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((n) => (
          <button
            key={n}
            onClick={() => selected && setCell(selected[0], selected[1], n)}
            className="w-12 h-10 rounded-lg bg-white border border-gray-200 text-sm font-bold shadow-sm hover:bg-blue-50"
          >
            {n === 0 ? '⌫' : n}
          </button>
        ))}
      </div>

    </div>
  );
};

export default Sudoku;
