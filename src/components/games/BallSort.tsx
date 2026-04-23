import React, { useCallback, useEffect, useState } from 'react';
import { RefreshCw, Undo2 } from 'lucide-react';
import StatusBar, { StatusTone } from '../shared/StatusBar';
import WinOverlay from '../shared/WinOverlay';

const COLORS = [
  '#ef4444', '#3b82f6', '#10b981', '#f59e0b',
  '#a855f7', '#06b6d4', '#ec4899', '#84cc16',
];

type Level = 'easy' | 'medium' | 'hard';

const LEVEL: Record<Level, { colors: number; empty: number }> = {
  easy: { colors: 4, empty: 2 },
  medium: { colors: 6, empty: 2 },
  hard: { colors: 8, empty: 2 },
};

const TUBE_SIZE = 4;

const generateBoard = (level: Level): string[][] => {
  const { colors, empty } = LEVEL[level];
  const pool: string[] = [];
  for (let i = 0; i < colors; i++) {
    for (let k = 0; k < TUBE_SIZE; k++) pool.push(COLORS[i]);
  }
  // Shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const tubes: string[][] = [];
  for (let i = 0; i < colors; i++) {
    tubes.push(pool.slice(i * TUBE_SIZE, (i + 1) * TUBE_SIZE));
  }
  for (let i = 0; i < empty; i++) tubes.push([]);
  return tubes;
};

const isSolved = (tubes: string[][]): boolean =>
  tubes.every(
    (t) =>
      t.length === 0 ||
      (t.length === TUBE_SIZE && t.every((c) => c === t[0])),
  );

const BallSort: React.FC<{ isBotEnabled: boolean }> = () => {
  const [level, setLevel] = useState<Level>('easy');
  const [tubes, setTubes] = useState<string[][]>(() => generateBoard('easy'));
  const [selected, setSelected] = useState<number | null>(null);
  const [history, setHistory] = useState<string[][][]>([]);
  const [moves, setMoves] = useState(0);
  const [done, setDone] = useState(false);

  const reset = useCallback((l: Level = level) => {
    setLevel(l);
    setTubes(generateBoard(l));
    setSelected(null);
    setHistory([]);
    setMoves(0);
    setDone(false);
  }, [level]);

  useEffect(() => {
    if (isSolved(tubes)) setDone(true);
  }, [tubes]);

  const click = (idx: number) => {
    if (done) return;
    if (selected === null) {
      if (tubes[idx].length === 0) return;
      setSelected(idx);
    } else if (selected === idx) {
      setSelected(null);
    } else {
      // Move from selected to idx if possible
      const src = tubes[selected];
      const dst = tubes[idx];
      if (src.length === 0 || dst.length >= TUBE_SIZE) {
        setSelected(idx);
        return;
      }
      const top = src[src.length - 1];
      if (dst.length > 0 && dst[dst.length - 1] !== top) {
        setSelected(idx);
        return;
      }
      setHistory((h) => [...h, tubes.map((t) => t.slice())]);
      const newTubes = tubes.map((t) => t.slice());
      newTubes[selected].pop();
      newTubes[idx].push(top);
      // Pour multiple of same color in one move
      while (
        newTubes[selected].length > 0 &&
        newTubes[selected][newTubes[selected].length - 1] === top &&
        newTubes[idx].length < TUBE_SIZE
      ) {
        newTubes[selected].pop();
        newTubes[idx].push(top);
      }
      setTubes(newTubes);
      setMoves((m) => m + 1);
      setSelected(null);
    }
  };

  const undo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setTubes(last);
    setHistory((h) => h.slice(0, -1));
    setMoves((m) => Math.max(0, m - 1));
    setSelected(null);
    setDone(false);
  };

  const tone: StatusTone = done ? 'success' : 'info';

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-2">
        {(['easy', 'medium', 'hard'] as Level[]).map((l) => (
          <button
            key={l}
            onClick={() => reset(l)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
              level === l
                ? 'bg-gray-900 text-white border-gray-900 dark:bg-gray-100 dark:text-gray-900 dark:border-gray-100'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
            }`}
          >
            {l}
          </button>
        ))}
        <button
          onClick={undo}
          disabled={!history.length || done}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
        >
          <Undo2 className="w-3.5 h-3.5" /> Undo
        </button>
        <button
          onClick={() => reset(level)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <RefreshCw className="w-3.5 h-3.5" /> New
        </button>
      </div>

      <StatusBar tone={tone}>
        {done ? `Sorted in ${moves} moves!` : `Moves ${moves} · Tap a tube, then tap a target`}
      </StatusBar>

      <div className="relative w-full max-w-3xl">
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-400 dark:from-slate-800 dark:to-slate-950 shadow-xl">
          {tubes.map((tube, i) => {
            const isSel = selected === i;
            return (
              <button
                key={i}
                onClick={() => click(i)}
                disabled={done}
                className={`relative flex flex-col-reverse items-center justify-start gap-1 w-14 sm:w-16 rounded-b-2xl rounded-t-md border-2 transition-all p-1 ${
                  isSel
                    ? 'border-amber-400 ring-4 ring-amber-200 -translate-y-2'
                    : 'border-gray-300 dark:border-gray-600'
                } bg-white/60 dark:bg-gray-900/40 backdrop-blur-sm`}
                style={{ height: TUBE_SIZE * 36 + 8 }}
              >
                {tube.map((c, j) => (
                  <span
                    key={j}
                    className="w-10 h-8 rounded-full"
                    style={{ background: c, boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.4), 0 1px 2px rgba(0,0,0,0.25)' }}
                  />
                ))}
              </button>
            );
          })}
        </div>

        {done && (
          <WinOverlay
            title={`${moves} moves`}
            subtitle="All sorted!"
            onPlayAgain={() => reset(level)}
            playAgainLabel="New puzzle"
          />
        )}
      </div>
    </div>
  );
};

export default BallSort;
