import React, { useCallback, useEffect, useMemo, useState } from 'react';
import StatusBar, { StatusTone } from '../shared/StatusBar';
import WinOverlay from '../shared/WinOverlay';

const WORD_POOLS: string[][] = [
  ['apple', 'grape', 'mango', 'lemon', 'peach', 'berry'],
  ['tiger', 'koala', 'eagle', 'whale', 'shark', 'zebra'],
  ['plane', 'train', 'truck', 'boat', 'bike', 'rocket'],
  ['castle', 'dragon', 'wizard', 'forest', 'pirate', 'legend'],
];

const SIZE = 12;
const DIRS: Array<[number, number]> = [
  [0, 1], [1, 0], [1, 1], [-1, 1], [0, -1], [-1, 0], [-1, -1], [1, -1],
];
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const build = (words: string[]) => {
  const grid: string[][] = Array.from({ length: SIZE }, () => Array(SIZE).fill(''));
  const placements: Record<string, Array<[number, number]>> = {};
  const upperWords = words.map((w) => w.toUpperCase());

  for (const w of upperWords) {
    for (let attempt = 0; attempt < 200; attempt++) {
      const [dr, dc] = DIRS[Math.floor(Math.random() * DIRS.length)];
      const r0 = Math.floor(Math.random() * SIZE);
      const c0 = Math.floor(Math.random() * SIZE);
      const endR = r0 + dr * (w.length - 1);
      const endC = c0 + dc * (w.length - 1);
      if (endR < 0 || endR >= SIZE || endC < 0 || endC >= SIZE) continue;
      let ok = true;
      const cells: Array<[number, number]> = [];
      for (let i = 0; i < w.length; i++) {
        const r = r0 + dr * i, c = c0 + dc * i;
        if (grid[r][c] && grid[r][c] !== w[i]) { ok = false; break; }
        cells.push([r, c]);
      }
      if (!ok) continue;
      for (let i = 0; i < w.length; i++) {
        const [r, c] = cells[i];
        grid[r][c] = w[i];
      }
      placements[w] = cells;
      break;
    }
  }
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      if (!grid[r][c]) grid[r][c] = LETTERS[Math.floor(Math.random() * 26)];
  return { grid, placements };
};

const WordSearch: React.FC<{ isBotEnabled: boolean }> = () => {
  const [pool, setPool] = useState<string[]>(() => WORD_POOLS[0]);
  const [data, setData] = useState(() => build(WORD_POOLS[0]));
  const [found, setFound] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Array<[number, number]>>([]);

  const newPuzzle = useCallback((p: string[]) => {
    setPool(p);
    setData(build(p));
    setFound(new Set());
    setSelected([]);
  }, []);

  const foundCells = useMemo(() => {
    const set = new Set<string>();
    for (const w of found) for (const [r, c] of data.placements[w] ?? []) set.add(`${r},${c}`);
    return set;
  }, [found, data]);

  const commitSelection = useCallback(() => {
    if (selected.length < 2) {
      setSelected([]);
      return;
    }
    const letters = selected.map(([r, c]) => data.grid[r][c]).join('');
    const reversed = letters.split('').reverse().join('');
    const match = pool
      .map((w) => w.toUpperCase())
      .find((w) => (w === letters || w === reversed));
    if (match && !found.has(match)) {
      const next = new Set(found);
      next.add(match);
      setFound(next);
    }
    setSelected([]);
  }, [selected, data, pool, found]);

  const won = found.size === pool.length;

  // Click-based selection: click start, then click end; if in line, highlight.
  const handleClick = (r: number, c: number) => {
    if (won) return;
    if (selected.length === 0) {
      setSelected([[r, c]]);
      return;
    }
    if (selected.length === 1) {
      const [sr, sc] = selected[0];
      const dr = Math.sign(r - sr);
      const dc = Math.sign(c - sc);
      const len = Math.max(Math.abs(r - sr), Math.abs(c - sc)) + 1;
      if ((dr === 0 || dc === 0 || Math.abs(r - sr) === Math.abs(c - sc)) && len > 1) {
        const cells: Array<[number, number]> = [];
        for (let i = 0; i < len; i++) cells.push([sr + dr * i, sc + dc * i]);
        setSelected(cells);
        // commit after a tick to show selection briefly
        setTimeout(commitSelection, 10);
      } else {
        setSelected([[r, c]]);
      }
    }
  };

  useEffect(() => {
    newPuzzle(WORD_POOLS[0]);
  }, [newPuzzle]);

  const inSelection = (r: number, c: number) =>
    selected.some(([sr, sc]) => sr === r && sc === c);

  const tone: StatusTone = won ? 'success' : 'info';

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex gap-2 flex-wrap justify-center">
        {WORD_POOLS.map((p, i) => (
          <button
            key={i}
            onClick={() => newPuzzle(p)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
              pool === p
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-700 border-gray-200'
            }`}
          >
            Theme {i + 1}
          </button>
        ))}
      </div>

      <StatusBar tone={tone}>
        {won ? 'All words found!' : `Found: ${found.size} / ${pool.length}`}
      </StatusBar>

      <div className="relative">
        <div
          className="p-2 rounded-2xl bg-gradient-to-br from-indigo-100 to-blue-100 shadow-inner grid gap-0.5"
          style={{ gridTemplateColumns: `repeat(${SIZE}, 26px)` }}
        >
          {data.grid.map((row, r) =>
            row.map((ch, c) => {
              const isFound = foundCells.has(`${r},${c}`);
              const isSel = inSelection(r, c);
              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => handleClick(r, c)}
                  className={`w-[26px] h-[26px] text-xs font-bold rounded ${
                    isFound
                      ? 'bg-emerald-400 text-white'
                      : isSel
                        ? 'bg-yellow-300 text-gray-900'
                        : 'bg-white hover:bg-blue-50 text-gray-700'
                  }`}
                >
                  {ch}
                </button>
              );
            }),
          )}
        </div>
        {won && (
          <WinOverlay
            title="Solved!"
            subtitle="You found every word."
            onPlayAgain={() => newPuzzle(pool)}
            playAgainLabel="New puzzle"
          />
        )}
      </div>

      <div className="flex gap-2 flex-wrap justify-center max-w-md">
        {pool.map((w) => (
          <span
            key={w}
            className={`text-sm px-2 py-1 rounded ${
              found.has(w.toUpperCase())
                ? 'line-through text-emerald-600 bg-emerald-50'
                : 'bg-white border border-gray-200 text-gray-700'
            }`}
          >
            {w}
          </span>
        ))}
      </div>

    </div>
  );
};

export default WordSearch;
