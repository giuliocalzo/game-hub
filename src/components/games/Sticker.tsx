import React, { useRef, useState } from 'react';
import { Trash2, Undo2 } from 'lucide-react';

interface Sticker {
  id: number;
  x: number;
  y: number;
  emoji: string;
  size: number;
  rotation: number;
}

const W = 640;
const H = 440;

const EMOJIS = [
  '⭐', '🌟', '✨', '🌈', '🌸', '🌺', '🌻', '🌷', '🌼',
  '🦄', '🐶', '🐱', '🐼', '🦊', '🦁', '🐸', '🐙', '🐠',
  '🚀', '🎈', '🎉', '🎁', '🍰', '🍎', '🍌', '🍓', '🍉',
  '❤️', '💙', '💚', '💛', '💜', '🧡', '🤍', '🖤',
];

const SIZES = [36, 56, 80];

const Sticker: React.FC<{ isBotEnabled: boolean }> = () => {
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [emoji, setEmoji] = useState('⭐');
  const [size, setSize] = useState(56);
  const svgRef = useRef<SVGSVGElement>(null);
  const nextId = useRef(0);

  const handlePlace = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = svgRef.current!.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    const y = ((e.clientY - rect.top) / rect.height) * H;
    setStickers((s) => [
      ...s,
      {
        id: nextId.current++,
        x,
        y,
        emoji,
        size,
        rotation: (Math.random() - 0.5) * 30,
      },
    ]);
  };

  const removeSticker = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setStickers((s) => s.filter((st) => st.id !== id));
  };

  const undo = () => setStickers((s) => s.slice(0, -1));
  const clear = () => setStickers([]);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Palette + tools */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <div className="flex flex-wrap items-center gap-1 p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm max-w-xl justify-center">
          {EMOJIS.map((e) => (
            <button
              key={e}
              onClick={() => setEmoji(e)}
              className={`w-9 h-9 rounded-lg text-2xl flex items-center justify-center transition ${
                e === emoji
                  ? 'bg-blue-100 dark:bg-blue-500/30 ring-2 ring-blue-400'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              aria-label={`Sticker ${e}`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 p-1 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
          {SIZES.map((s, i) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                s === size
                  ? 'bg-indigo-500 text-white'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {['S', 'M', 'L'][i]}
            </button>
          ))}
        </div>
        <button
          onClick={undo}
          disabled={!stickers.length}
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
        className="w-full rounded-2xl shadow-xl cursor-copy select-none"
        style={{
          background: 'linear-gradient(135deg, #fce7f3 0%, #e0e7ff 50%, #dcfce7 100%)',
          maxWidth: 900,
          aspectRatio: `${W} / ${H}`,
        }}
        onClick={handlePlace}
      >
        {stickers.map((s) => (
          <g key={s.id} transform={`translate(${s.x}, ${s.y}) rotate(${s.rotation})`}>
            <text
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={s.size}
              onClick={(e) => removeSticker(s.id, e)}
              style={{ cursor: 'pointer' }}
            >
              {s.emoji}
            </text>
          </g>
        ))}
      </svg>

      <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md text-center">
        Click anywhere on the canvas to stamp a sticker. Click a sticker to remove it.
      </p>
    </div>
  );
};

export default Sticker;
