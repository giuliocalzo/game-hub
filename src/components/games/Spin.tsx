import React, { useCallback, useRef, useState } from 'react';
import { Trash2, Undo2 } from 'lucide-react';

interface Stroke {
  points: Array<[number, number]>;
  color: string;
  size: number;
}

const SIZE = 440;
const CX = SIZE / 2;
const CY = SIZE / 2;

const PALETTE = [
  '#ec4899', '#a855f7', '#6366f1', '#3b82f6',
  '#10b981', '#eab308', '#f97316', '#ef4444',
];

const SYMMETRY_OPTIONS = [4, 6, 8, 12];

const Spin: React.FC<{ isBotEnabled: boolean }> = () => {
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [current, setCurrent] = useState<Stroke | null>(null);
  const [color, setColor] = useState('#a855f7');
  const [sym, setSym] = useState(8);
  const [mirror, setMirror] = useState(true);
  const svgRef = useRef<SVGSVGElement>(null);

  const pointFromEvent = useCallback((clientX: number, clientY: number): [number, number] => {
    const rect = svgRef.current!.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * SIZE;
    const y = ((clientY - rect.top) / rect.height) * SIZE;
    return [x, y];
  }, []);

  const handleDown = (e: React.PointerEvent<SVGSVGElement>) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const p = pointFromEvent(e.clientX, e.clientY);
    setCurrent({ points: [p], color, size: 3 });
  };
  const handleMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!current) return;
    const p = pointFromEvent(e.clientX, e.clientY);
    setCurrent({ ...current, points: [...current.points, p] });
  };
  const handleUp = () => {
    if (!current) return;
    setStrokes((s) => [...s, current]);
    setCurrent(null);
  };

  const rotatePoint = ([x, y]: [number, number], angle: number): [number, number] => {
    const dx = x - CX;
    const dy = y - CY;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return [CX + dx * cos - dy * sin, CY + dx * sin + dy * cos];
  };

  const mirrorPoint = ([x, y]: [number, number]): [number, number] => [2 * CX - x, y];

  const toPath = (pts: Array<[number, number]>): string =>
    pts.reduce(
      (acc, [x, y], i) => acc + (i === 0 ? `M${x.toFixed(1)} ${y.toFixed(1)}` : ` L${x.toFixed(1)} ${y.toFixed(1)}`),
      '',
    );

  const renderStroke = (s: Stroke, key: number | string) => {
    const paths: React.ReactNode[] = [];
    for (let k = 0; k < sym; k++) {
      const angle = (Math.PI * 2 * k) / sym;
      const rot = s.points.map((p) => rotatePoint(p, angle));
      paths.push(
        <path
          key={`${key}-r${k}`}
          d={toPath(rot)}
          fill="none"
          stroke={s.color}
          strokeWidth={s.size}
          strokeLinecap="round"
          strokeLinejoin="round"
        />,
      );
      if (mirror) {
        const mir = rot.map(mirrorPoint);
        paths.push(
          <path
            key={`${key}-r${k}-m`}
            d={toPath(mir)}
            fill="none"
            stroke={s.color}
            strokeWidth={s.size}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.85}
          />,
        );
      }
    }
    return paths;
  };

  const undo = () => setStrokes((s) => s.slice(0, -1));
  const clear = () => setStrokes([]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <div className="flex items-center gap-1 p-1.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
          {PALETTE.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-7 h-7 rounded-full border-2 transition-transform ${
                c === color
                  ? 'border-gray-900 dark:border-gray-100 scale-110'
                  : 'border-white dark:border-gray-700'
              }`}
              style={{ backgroundColor: c }}
              aria-label={`Color ${c}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-1 p-1 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
          {SYMMETRY_OPTIONS.map((n) => (
            <button
              key={n}
              onClick={() => setSym(n)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                n === sym
                  ? 'bg-indigo-500 text-white'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {n}×
            </button>
          ))}
        </div>
        <button
          onClick={() => setMirror((m) => !m)}
          className={`px-3 py-2 rounded-full text-sm font-semibold border transition ${
            mirror
              ? 'bg-indigo-500 text-white border-indigo-500'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700'
          }`}
        >
          Mirror
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

      <svg
        ref={svgRef}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="w-full rounded-full shadow-xl touch-none cursor-crosshair"
        style={{
          background: 'radial-gradient(circle, #0f172a 0%, #020617 80%)',
          maxWidth: 560,
          aspectRatio: '1 / 1',
        }}
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        onPointerLeave={handleUp}
      >
        {/* Guide lines */}
        {Array.from({ length: sym }).map((_, k) => {
          const angle = (Math.PI * 2 * k) / sym;
          const x2 = CX + Math.cos(angle) * SIZE;
          const y2 = CY + Math.sin(angle) * SIZE;
          return (
            <line
              key={k}
              x1={CX}
              y1={CY}
              x2={x2}
              y2={y2}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={1}
            />
          );
        })}
        {strokes.map((s, i) => renderStroke(s, i))}
        {current && renderStroke(current, 'cur')}
        <circle cx={CX} cy={CY} r={3} fill="rgba(255,255,255,0.3)" />
      </svg>
    </div>
  );
};

export default Spin;
