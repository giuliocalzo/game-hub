import React, { useCallback, useEffect, useMemo, useState } from 'react';
import StatusBar, { StatusTone } from '../shared/StatusBar';
import WinOverlay from '../shared/WinOverlay';
import { useTranslation } from '../../i18n/I18nContext';
import { WORD_SEARCH_POOLS } from '../../i18n/content';

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
    for (let attempt = 0; attempt < 300; attempt++) {
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
  const { t, lang } = useTranslation();
  const pools = WORD_SEARCH_POOLS[lang];
  const [themeIndex, setThemeIndex] = useState(0);
  const pool = pools[themeIndex] ?? pools[0];
  const [data, setData] = useState(() => build(pool));
  const [found, setFound] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Array<[number, number]>>([]);

  const newPuzzle = useCallback((idx: number) => {
    setThemeIndex(idx);
    setData(build(pools[idx]));
    setFound(new Set());
    setSelected([]);
  }, [pools]);

  // On language change, rebuild the puzzle with the current theme index in the new language.
  useEffect(() => {
    setData(build(pools[themeIndex] ?? pools[0]));
    setFound(new Set());
    setSelected([]);
  }, [lang]); // eslint-disable-line react-hooks/exhaustive-deps

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
      .find((w) => w === letters || w === reversed);
    if (match && !found.has(match)) {
      const next = new Set(found);
      next.add(match);
      setFound(next);
    }
    setSelected([]);
  }, [selected, data, pool, found]);

  const won = found.size === pool.length;

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
        setTimeout(commitSelection, 10);
      } else {
        setSelected([[r, c]]);
      }
    }
  };

  const inSelection = (r: number, c: number) =>
    selected.some(([sr, sc]) => sr === r && sc === c);

  const tone: StatusTone = won ? 'success' : 'info';

  return (
    <div className="flex flex-col items-center gap-5" lang={lang}>
      <div className="flex gap-2 flex-wrap justify-center">
        {pools.map((_, i) => (
          <button
            key={i}
            onClick={() => newPuzzle(i)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
              themeIndex === i
                ? 'bg-gray-900 text-white border-gray-900 dark:bg-gray-100 dark:text-gray-900 dark:border-gray-100'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
            }`}
          >
            {t('wordSearch.theme', { n: i + 1 })}
          </button>
        ))}
      </div>

      <StatusBar tone={tone}>
        {won
          ? t('wordSearch.done_status')
          : t('wordSearch.progress', { found: found.size, total: pool.length })}
      </StatusBar>

      <div className="relative">
        <div
          className="p-2 rounded-2xl bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-500/20 dark:to-blue-500/20 shadow-inner grid gap-0.5"
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
                        : 'bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-500/20 text-gray-700 dark:text-gray-300'
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
            title={t('wordSearch.done_title')}
            subtitle={t('wordSearch.done_subtitle')}
            onPlayAgain={() => newPuzzle(themeIndex)}
            playAgainLabel={t('wordSearch.new_puzzle')}
          />
        )}
      </div>

      <div className="flex gap-2 flex-wrap justify-center max-w-md">
        {pool.map((w) => (
          <span
            key={w}
            className={`text-sm px-2 py-1 rounded ${
              found.has(w.toUpperCase())
                ? 'line-through text-emerald-600 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
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
