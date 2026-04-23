import React, { useCallback, useRef, useState } from 'react';
import { Eraser, Trash2, Undo2 } from 'lucide-react';

interface Stroke {
  points: Array<[number, number]>;
  color: string;
  size: number;
}

const W = 640;
const H = 440;

const PALETTE = [
  '#000000', '#ef4444', '#f97316', '#eab308', '#84cc16',
  '#10b981', '#0ea5e9', '#6366f1', '#a855f7', '#ec4899',
  '#ffffff', '#a16207',
];

const SIZES = [3, 6, 12, 20];

const DoodlePad: React.FC<{ isBotEnabled: boolean }> = () => {
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [current, setCurrent] = useState<Stroke | null>(null);
  const [color, setColor] = useState('#6366f1');
  const [size, setSize] = useState(6);
  const [erasing, setErasing] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const pointFromEvent = useCallback((clientX: number, clientY: number): [number, number] => {
    const rect = svgRef.current!.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * W;
    const y = ((clientY - rect.top) / rect.height) * H;
    return [Math.max(0, Math.min(W, x)), Math.max(0, Math.min(H, y))];
  }, []);

  const handleDown = (e: React.PointerEvent<SVGSVGElement>) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const p = pointFromEvent(e.clientX, e.clientY);
    setCurrent({
      points: [p],
      color: erasing ? '#ffffff' : color,
      size: erasing ? size * 1.6 : size,
    });
  };

  const handleMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!current) return;
    const p = pointFromEvent(e.clientX, e.clientY);
    setCurrent({ ...current, points: [...current.points, p] });
  };

  const handleUp = () => {
    if (!current) return;
    if (current.points.length > 0) setStrokes((s) => [...s, current]);
    setCurrent(null);
  };

  const toPath = (s: Stroke): string =>
    s.points.reduce(
      (acc, [x, y], i) => acc + (i === 0 ? `M${x.toFixed(1)} ${y.toFixed(1)}` : ` L${x.toFixed(1)} ${y.toFixed(1)}`),
      '',
    );

  const undo = () => setStrokes((s) => s.slice(0, -1));
  const clear = () => setStrokes([]);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Palette + tools */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <div className="flex items-center gap-1 p-1.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
          {PALETTE.map((c) => (
            <button
              key={c}
              onClick={() => { setColor(c); setErasing(false); }}
              className={`w-7 h-7 rounded-full border-2 transition-transform ${
                !erasing && c === color
                  ? 'border-gray-900 dark:border-gray-100 scale-110'
                  : 'border-white dark:border-gray-700'
              }`}
              style={{ backgroundColor: c, boxShadow: c === '#ffffff' ? 'inset 0 0 0 1px #e5e7eb' : undefined }}
              aria-label={`Color ${c}`}
            />
          ))}
        </div>

        <div className="flex items-center gap-1 p-1.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
          {SIZES.map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
                s === size
                  ? 'bg-blue-100 ring-2 ring-blue-400 dark:bg-blue-500/30 dark:ring-blue-400'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              aria-label={`Brush size ${s}`}
            >
              <span className="rounded-full bg-gray-800 dark:bg-gray-200" style={{ width: s, height: s }} />
            </button>
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
          onClick={undo}
          disabled={!strokes.length}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
        >
          <Undo2 className="w-4 h-4" /> Undo
        </button>
        <button
          onClick={clear}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold bg-white dark:bg-gray-800 text-rose-600 dark:text-rose-300 border border-gray-200 dark:border-gray-700 hover:bg-rose-50 dark:hover:bg-rose-500/10"
        >
          <Trash2 className="w-4 h-4" /> Clear
        </button>
      </div>

      {/* Canvas */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full rounded-2xl shadow-xl select-none touch-none cursor-crosshair"
        style={{
          background: '#ffffff',
          maxWidth: 900,
          aspectRatio: `${W} / ${H}`,
        }}
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        onPointerLeave={handleUp}
      >
        {strokes.map((s, i) => (
          <path
            key={i}
            d={toPath(s)}
            fill="none"
            stroke={s.color}
            strokeWidth={s.size}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        {current && (
          <path
            d={toPath(current)}
            fill="none"
            stroke={current.color}
            strokeWidth={current.size}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </div>
  );
};

export default DoodlePad;
