import React, { useCallback, useMemo, useState } from 'react';
import StatusBar, { StatusTone } from '../shared/StatusBar';
import WinOverlay from '../shared/WinOverlay';

// Hand-crafted small 5x5 puzzles represented by the solution grid.
const PUZZLES: Array<{ name: string; solution: number[][] }> = [
  {
    name: 'Heart',
    solution: [
      [0, 1, 0, 1, 0],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [0, 1, 1, 1, 0],
      [0, 0, 1, 0, 0],
    ],
  },
  {
    name: 'Arrow',
    solution: [
      [0, 0, 1, 0, 0],
      [0, 1, 1, 1, 0],
      [1, 0, 1, 0, 1],
      [0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0],
    ],
  },
  {
    name: 'Smile',
    solution: [
      [0, 1, 0, 1, 0],
      [0, 1, 0, 1, 0],
      [0, 0, 0, 0, 0],
      [1, 0, 0, 0, 1],
      [0, 1, 1, 1, 0],
    ],
  },
];

const SIZE = 5;

// Cell state: 0 empty, 1 filled, -1 marked X
type State = number;

const lineHints = (line: number[]): number[] => {
  const out: number[] = [];
  let run = 0;
  for (const v of line) {
    if (v === 1) run++;
    else if (run) { out.push(run); run = 0; }
  }
  if (run) out.push(run);
  return out.length ? out : [0];
};

const Nonogram: React.FC<{ isBotEnabled: boolean }> = () => {
  const [idx, setIdx] = useState(0);
  const puzzle = PUZZLES[idx];
  const [grid, setGrid] = useState<State[][]>(() =>
    Array.from({ length: SIZE }, () => Array(SIZE).fill(0)),
  );

  const rowHints = useMemo(() => puzzle.solution.map(lineHints), [puzzle]);
  const colHints = useMemo(
    () => Array.from({ length: SIZE }, (_, c) => lineHints(puzzle.solution.map((r) => r[c]))),
    [puzzle],
  );

  const solved = useMemo(
    () => grid.every((row, r) => row.every((v, c) => (v === 1) === (puzzle.solution[r][c] === 1))),
    [grid, puzzle],
  );

  const click = (r: number, c: number, e: React.MouseEvent) => {
    const right = e.type === 'contextmenu' || e.button === 2;
    const next = grid.map((row) => row.slice());
    if (right) {
      next[r][c] = next[r][c] === -1 ? 0 : -1;
    } else {
      next[r][c] = next[r][c] === 1 ? 0 : 1;
    }
    setGrid(next);
  };

  const reset = useCallback(
    (i: number = idx) => {
      setIdx(i);
      setGrid(Array.from({ length: SIZE }, () => Array(SIZE).fill(0)));
    },
    [idx],
  );

  const tone: StatusTone = solved ? 'success' : 'info';

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex gap-2">
        {PUZZLES.map((p, i) => (
          <button
            key={p.name}
            onClick={() => reset(i)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
              idx === i ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200'
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      <StatusBar tone={tone}>
        {solved ? `Solved — ${puzzle.name}!` : `Reveal the picture: ${puzzle.name}`}
      </StatusBar>

      <div className="relative">
        <div
          className="grid gap-0"
          style={{ gridTemplateColumns: `auto repeat(${SIZE}, 2.25rem)` }}
        >
          <div />
          {colHints.map((hs, i) => (
            <div key={i} className="flex flex-col items-center justify-end pb-1 text-xs text-gray-700 font-semibold">
              {hs.map((v, k) => (
                <div key={k}>{v}</div>
              ))}
            </div>
          ))}
          {grid.map((row, r) => (
            <React.Fragment key={r}>
              <div className="flex items-center justify-end pr-2 text-xs text-gray-700 font-semibold">
                {rowHints[r].join(' ')}
              </div>
              {row.map((v, c) => {
                const major = (c + 1) % 5 === 0 && c < SIZE - 1 ? 'border-r-2 border-gray-700' : 'border-r border-gray-300';
                const majorB = (r + 1) % 5 === 0 && r < SIZE - 1 ? 'border-b-2 border-gray-700' : 'border-b border-gray-300';
                return (
                  <button
                    key={c}
                    onClick={(e) => click(r, c, e)}
                    onContextMenu={(e) => { e.preventDefault(); click(r, c, e); }}
                    className={`w-9 h-9 ${major} ${majorB} text-lg font-bold flex items-center justify-center ${
                      v === 1 ? 'bg-gray-900 text-white' : v === -1 ? 'bg-white text-rose-500' : 'bg-white hover:bg-blue-50'
                    }`}
                  >
                    {v === -1 ? '✕' : ''}
                  </button>
                );
              })}
            </React.Fragment>
          ))}
        </div>
        {solved && (
          <WinOverlay
            title="Solved!"
            subtitle={`${puzzle.name} revealed.`}
            onPlayAgain={() => reset(idx)}
            playAgainLabel="Reset"
          />
        )}
      </div>

    </div>
  );
};

export default Nonogram;
