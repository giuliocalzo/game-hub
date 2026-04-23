import React, { useCallback, useState } from 'react';
import { Trash2, Eraser } from 'lucide-react';

const SIZE = 16;

const PALETTE = [
  '#000000', '#374151', '#9ca3af', '#ffffff',
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#10b981', '#06b6d4', '#3b82f6',
  '#6366f1', '#a855f7', '#ec4899', '#a16207',
];

const PixelArt: React.FC<{ isBotEnabled: boolean }> = () => {
  const [grid, setGrid] = useState<(string | null)[]>(() => Array(SIZE * SIZE).fill(null));
  const [color, setColor] = useState('#3b82f6');
  const [erasing, setErasing] = useState(false);
  const [painting, setPainting] = useState(false);

  const paintCell = useCallback(
    (i: number) => {
      setGrid((g) => {
        const next = g.slice();
        next[i] = erasing ? null : color;
        return next;
      });
    },
    [color, erasing],
  );

  const clear = () => setGrid(Array(SIZE * SIZE).fill(null));

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Palette + tools */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <div className="grid grid-cols-8 gap-1 p-1.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
          {PALETTE.map((c) => (
            <button
              key={c}
              onClick={() => { setColor(c); setErasing(false); }}
              className={`w-6 h-6 rounded border-2 transition-transform ${
                !erasing && c === color
                  ? 'border-gray-900 dark:border-gray-100 scale-110'
                  : 'border-white dark:border-gray-700'
              }`}
              style={{ backgroundColor: c, boxShadow: c === '#ffffff' ? 'inset 0 0 0 1px #e5e7eb' : undefined }}
              aria-label={`Color ${c}`}
            />
          ))}
        </div>
        <button
          onClick={() => setErasing((x) => !x)}
          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold border transition ${
            erasing
              ? 'bg-rose-500 text-white border-rose-500'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:border-rose-300'
          }`}
        >
          <Eraser className="w-4 h-4" /> Eraser
        </button>
        <button
          onClick={clear}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold bg-white dark:bg-gray-800 text-rose-600 dark:text-rose-300 border border-gray-200 dark:border-gray-700 hover:bg-rose-50 dark:hover:bg-rose-500/10"
        >
          <Trash2 className="w-4 h-4" /> Clear
        </button>
      </div>

      {/* Canvas */}
      <div
        className="p-2 rounded-2xl bg-gradient-to-br from-slate-300 to-slate-500 shadow-xl"
        onPointerDown={() => setPainting(true)}
        onPointerUp={() => setPainting(false)}
        onPointerLeave={() => setPainting(false)}
      >
        <div
          className="grid gap-0 bg-white dark:bg-gray-100"
          style={{ gridTemplateColumns: `repeat(${SIZE}, minmax(0, 1fr))`, width: 'min(92vw, 480px)', aspectRatio: '1 / 1' }}
        >
          {grid.map((c, i) => (
            <div
              key={i}
              onPointerDown={() => paintCell(i)}
              onPointerEnter={() => { if (painting) paintCell(i); }}
              className="cursor-pointer"
              style={{
                background: c ?? '#ffffff',
                outline: '0.5px solid rgba(0,0,0,0.08)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PixelArt;
