import React, { useCallback, useEffect, useRef, useState } from 'react';
import StatusBar, { StatusTone } from '../shared/StatusBar';
import WinOverlay from '../shared/WinOverlay';

interface Item {
  id: number;
  emoji: string;
  label: string;
  x: number; // 0..1
  y: number; // 0..1
  size: number;
  rotation: number;
  found: boolean;
}

interface Decor {
  emoji: string;
  x: number;
  y: number;
  size: number;
}

interface Scene {
  name: string;
  emoji: string;
  bg: string;
  decor: Decor[];
  items: Array<{ emoji: string; label: string }>;
}

const SCENES: Scene[] = [
  {
    name: 'Beach',
    emoji: '🏖️',
    bg: 'linear-gradient(180deg, #bae6fd 0%, #fde68a 60%, #fcd34d 100%)',
    decor: [
      { emoji: '🌴', x: 0.05, y: 0.35, size: 80 },
      { emoji: '🌴', x: 0.9, y: 0.45, size: 80 },
      { emoji: '⛱️', x: 0.7, y: 0.75, size: 80 },
      { emoji: '🌊', x: 0.2, y: 0.85, size: 60 },
      { emoji: '🌊', x: 0.55, y: 0.9, size: 60 },
      { emoji: '☀️', x: 0.85, y: 0.08, size: 80 },
      { emoji: '🏐', x: 0.4, y: 0.75, size: 50 },
    ],
    items: [
      { emoji: '🦀', label: 'Crab' },
      { emoji: '🐚', label: 'Shell' },
      { emoji: '🐠', label: 'Fish' },
      { emoji: '⚓', label: 'Anchor' },
      { emoji: '🐙', label: 'Octopus' },
      { emoji: '🦩', label: 'Flamingo' },
    ],
  },
  {
    name: 'Forest',
    emoji: '🌲',
    bg: 'linear-gradient(180deg, #bbf7d0 0%, #86efac 60%, #4ade80 100%)',
    decor: [
      { emoji: '🌲', x: 0.08, y: 0.5, size: 90 },
      { emoji: '🌳', x: 0.25, y: 0.7, size: 80 },
      { emoji: '🌲', x: 0.5, y: 0.35, size: 90 },
      { emoji: '🌳', x: 0.75, y: 0.65, size: 80 },
      { emoji: '🌲', x: 0.92, y: 0.45, size: 85 },
      { emoji: '☁️', x: 0.3, y: 0.08, size: 60 },
      { emoji: '🍄', x: 0.15, y: 0.85, size: 40 },
    ],
    items: [
      { emoji: '🦊', label: 'Fox' },
      { emoji: '🐿️', label: 'Squirrel' },
      { emoji: '🦉', label: 'Owl' },
      { emoji: '🐻', label: 'Bear' },
      { emoji: '🦔', label: 'Hedgehog' },
      { emoji: '🐝', label: 'Bee' },
    ],
  },
  {
    name: 'Space',
    emoji: '🚀',
    bg: 'linear-gradient(180deg, #1e1b4b 0%, #312e81 60%, #4c1d95 100%)',
    decor: [
      { emoji: '⭐', x: 0.1, y: 0.15, size: 40 },
      { emoji: '⭐', x: 0.35, y: 0.08, size: 30 },
      { emoji: '⭐', x: 0.6, y: 0.2, size: 35 },
      { emoji: '⭐', x: 0.85, y: 0.1, size: 40 },
      { emoji: '🪐', x: 0.2, y: 0.5, size: 80 },
      { emoji: '🌙', x: 0.8, y: 0.35, size: 70 },
      { emoji: '☄️', x: 0.5, y: 0.65, size: 60 },
    ],
    items: [
      { emoji: '🚀', label: 'Rocket' },
      { emoji: '👽', label: 'Alien' },
      { emoji: '🛸', label: 'UFO' },
      { emoji: '🌍', label: 'Earth' },
      { emoji: '🪐', label: 'Saturn' },
      { emoji: '🧑‍🚀', label: 'Astronaut' },
    ],
  },
];

const W = 640;
const H = 440;

const placeItems = (scene: Scene): Item[] => {
  const items: Item[] = [];
  let id = 0;
  for (const def of scene.items) {
    let attempts = 0;
    while (attempts < 40) {
      attempts++;
      const x = 0.07 + Math.random() * 0.86;
      const y = 0.15 + Math.random() * 0.72;
      // Avoid overlap with existing items
      if (items.every((o) => (o.x - x) ** 2 + (o.y - y) ** 2 > 0.015)) {
        items.push({
          id: id++,
          emoji: def.emoji,
          label: def.label,
          x,
          y,
          size: 34 + Math.floor(Math.random() * 10),
          rotation: (Math.random() - 0.5) * 30,
          found: false,
        });
        break;
      }
    }
  }
  return items;
};

const HiddenPicture: React.FC<{ isBotEnabled: boolean }> = () => {
  const [sceneIdx, setSceneIdx] = useState(0);
  const scene = SCENES[sceneIdx];
  const [items, setItems] = useState<Item[]>(() => placeItems(SCENES[0]));
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);
  const [bumpId, setBumpId] = useState<number | null>(null);
  const startRef = useRef<number>(Date.now());
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const reset = useCallback((idx: number = sceneIdx) => {
    setSceneIdx(idx);
    setItems(placeItems(SCENES[idx]));
    setElapsed(0);
    setDone(false);
    startRef.current = Date.now();
  }, [sceneIdx]);

  useEffect(() => {
    if (done) return;
    tickRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 500);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [done, sceneIdx]);

  useEffect(() => {
    if (items.length && items.every((i) => i.found)) setDone(true);
  }, [items]);

  const find = (id: number) => {
    setItems((all) => all.map((x) => (x.id === id ? { ...x, found: true } : x)));
    setBumpId(id);
    setTimeout(() => setBumpId(null), 400);
  };

  const remaining = items.filter((i) => !i.found);
  const tone: StatusTone = done ? 'success' : 'info';

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap gap-2 justify-center">
        {SCENES.map((s, i) => (
          <button
            key={s.name}
            onClick={() => reset(i)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
              sceneIdx === i
                ? 'bg-gray-900 text-white border-gray-900 dark:bg-gray-100 dark:text-gray-900 dark:border-gray-100'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
            }`}
          >
            <span>{s.emoji}</span>
            {s.name}
          </button>
        ))}
      </div>

      <StatusBar tone={tone}>
        {done
          ? `All found in ${elapsed}s!`
          : `${items.length - remaining.length}/${items.length} found · ${elapsed}s`}
      </StatusBar>

      {/* To-find list */}
      <div className="flex flex-wrap gap-2 justify-center w-full max-w-xl">
        {items.map((it) => (
          <span
            key={it.id}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
              it.found
                ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-200 border-emerald-200 dark:border-emerald-500/30 line-through opacity-70'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700'
            }`}
          >
            <span aria-hidden="true">{it.emoji}</span>
            {it.label}
          </span>
        ))}
      </div>

      {/* Scene */}
      <div className="relative w-full" style={{ maxWidth: 900 }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full rounded-2xl shadow-xl select-none"
          style={{ background: scene.bg, aspectRatio: `${W} / ${H}` }}
        >
          {/* Decor (non-interactive background) */}
          {scene.decor.map((d, i) => (
            <text
              key={i}
              x={d.x * W}
              y={d.y * H}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={d.size}
              style={{ pointerEvents: 'none' }}
            >
              {d.emoji}
            </text>
          ))}

          {/* Items to find */}
          {items.map((it) => {
            const cx = it.x * W;
            const cy = it.y * H;
            return (
              <g
                key={it.id}
                transform={`translate(${cx}, ${cy}) rotate(${it.rotation}) scale(${
                  bumpId === it.id ? 1.4 : 1
                })`}
                onClick={() => !it.found && find(it.id)}
                style={{
                  cursor: it.found ? 'default' : 'pointer',
                  opacity: it.found ? 0.25 : 1,
                  transition: 'transform 300ms, opacity 300ms',
                }}
              >
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={it.size}
                >
                  {it.emoji}
                </text>
              </g>
            );
          })}
        </svg>

        {done && (
          <WinOverlay
            title={`Found in ${elapsed}s`}
            subtitle="Try another scene!"
            onPlayAgain={() => reset(sceneIdx)}
            playAgainLabel="Play again"
          />
        )}
      </div>
    </div>
  );
};

export default HiddenPicture;
