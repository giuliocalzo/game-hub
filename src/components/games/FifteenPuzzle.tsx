import React, { useCallback, useMemo, useState } from 'react';
import StatusBar, { StatusTone } from '../shared/StatusBar';
import WinOverlay from '../shared/WinOverlay';

const SIZE = 4;

const solved = (): number[] => {
  const arr = Array.from({ length: SIZE * SIZE }, (_, i) => i + 1);
  arr[arr.length - 1] = 0; // 0 is blank
  return arr;
};

const isSolved = (arr: number[]): boolean =>
  arr.every((v, i) => (i === arr.length - 1 ? v === 0 : v === i + 1));

// Shuffle by performing valid moves so the puzzle is always solvable
const scramble = (): number[] => {
  let arr = solved();
  for (let i = 0; i < 200; i++) {
    const blank = arr.indexOf(0);
    const neighbors = getNeighbors(blank);
    const pick = neighbors[Math.floor(Math.random() * neighbors.length)];
    arr = swap(arr, blank, pick);
  }
  return arr;
};

const getNeighbors = (idx: number): number[] => {
  const r = Math.floor(idx / SIZE);
  const c = idx % SIZE;
  const out: number[] = [];
  if (r > 0) out.push(idx - SIZE);
  if (r < SIZE - 1) out.push(idx + SIZE);
  if (c > 0) out.push(idx - 1);
  if (c < SIZE - 1) out.push(idx + 1);
  return out;
};

const swap = (arr: number[], a: number, b: number): number[] => {
  const next = arr.slice();
  [next[a], next[b]] = [next[b], next[a]];
  return next;
};

const Fifteen: React.FC<{ isBotEnabled: boolean }> = () => {
  const [tiles, setTiles] = useState<number[]>(scramble);
  const [moves, setMoves] = useState(0);

  const won = useMemo(() => isSolved(tiles), [tiles]);

  const move = useCallback(
    (idx: number) => {
      if (won) return;
      const blank = tiles.indexOf(0);
      if (!getNeighbors(blank).includes(idx)) return;
      setTiles(swap(tiles, blank, idx));
      setMoves((m) => m + 1);
    },
    [tiles, won],
  );

  const reset = () => {
    setTiles(scramble());
    setMoves(0);
  };

  const tone: StatusTone = won ? 'success' : 'info';

  return (
    <div className="flex flex-col items-center gap-5">
      <StatusBar tone={tone}>
        {won ? `Solved in ${moves} moves!` : `Moves: ${moves}`}
      </StatusBar>

      <div className="relative">
        <div
          className="grid gap-1.5 p-2 rounded-2xl bg-gradient-to-br from-indigo-200 to-purple-200 shadow-inner"
          style={{ gridTemplateColumns: `repeat(${SIZE}, minmax(0,1fr))` }}
        >
          {tiles.map((v, i) => (
            <button
              key={i}
              onClick={() => move(i)}
              disabled={v === 0 || won}
              className={`w-16 h-16 md:w-20 md:h-20 rounded-xl flex items-center justify-center text-2xl md:text-3xl font-extrabold transition-all ${
                v === 0
                  ? 'bg-transparent cursor-default'
                  : 'bg-white dark:bg-gray-800 text-indigo-700 shadow hover:-translate-y-0.5 active:scale-95'
              }`}
            >
              {v !== 0 && v}
            </button>
          ))}
        </div>
        {won && (
          <WinOverlay
            title="Puzzle solved!"
            subtitle={`In ${moves} moves.`}
            onPlayAgain={reset}
            playAgainLabel="Shuffle again"
          />
        )}
      </div>

      <button
        onClick={reset}
        className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-semibold shadow hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800/60"
      >
        Shuffle
      </button>

    </div>
  );
};

export default Fifteen;
