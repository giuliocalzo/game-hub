import React, { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshCw, Undo2 } from 'lucide-react';
import StatusBar, { StatusTone } from '../shared/StatusBar';
import WinOverlay from '../shared/WinOverlay';

// A simplified mahjong-solitaire. Tiles are placed in a 2-layer pyramid:
// 8×6 bottom layer + 6×4 middle layer + 4×2 top layer = 48+24+8 = 80 tiles.
// A tile is "free" if nothing covers it AND at least one of left/right sides
// is open at its layer.

interface Tile {
  id: number;
  layer: number;
  x: number; // in half-cells (to allow offsets between layers)
  y: number;
  emoji: string;
  removed: boolean;
}

const TILE_EMOJIS = ['🐶', '🐱', '🐭', '🐰', '🐻', '🦁', '🐼', '🐸', '🦊', '🐵',
  '🍎', '🍌', '🍇', '🍊', '🍓', '🍉', '🍒', '🍑', '🥝', '🍍',
  '⭐', '🌈', '🌸', '🌻', '🌺', '🦋', '🌙', '☀️', '⚡', '❄️',
  '🚀', '🎈', '🎁', '🎲', '⚽', '🎨', '🎵', '💎', '🏆', '🍀'];

// Layout: each layer is a grid of columns/rows; layers stack with offsets
const LAYERS: Array<{ cols: number; rows: number; offX: number; offY: number }> = [
  { cols: 8, rows: 6, offX: 0, offY: 0 },   // 48
  { cols: 6, rows: 4, offX: 1, offY: 1 },   // 24
  { cols: 4, rows: 2, offX: 2, offY: 2 },   // 8
];
// total = 80 — even, works for pairs

const shuffle = <T,>(arr: T[]): T[] => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const buildBoard = (): Tile[] => {
  const positions: Array<{ layer: number; x: number; y: number }> = [];
  LAYERS.forEach((L, layer) => {
    for (let cy = 0; cy < L.rows; cy++) {
      for (let cx = 0; cx < L.cols; cx++) {
        positions.push({ layer, x: cx + L.offX, y: cy + L.offY });
      }
    }
  });
  const total = positions.length; // 80
  const neededPairs = total / 2;
  // Pool of tile emojis, each appearing exactly twice
  const pool: string[] = [];
  const pick = shuffle(TILE_EMOJIS).slice(0, neededPairs);
  for (const e of pick) pool.push(e, e);
  const shuffled = shuffle(pool);
  const shuffledPositions = shuffle(positions);
  return shuffledPositions.map((p, i) => ({
    id: i,
    layer: p.layer,
    x: p.x,
    y: p.y,
    emoji: shuffled[i],
    removed: false,
  }));
};

const TILE_W = 56;
const TILE_H = 72;
const HALF_X = TILE_W / 2;
const HALF_Y = TILE_H / 2;

const overlaps = (a: Tile, b: Tile): boolean => {
  const ax1 = a.x * HALF_X;
  const ax2 = ax1 + TILE_W;
  const ay1 = a.y * HALF_Y;
  const ay2 = ay1 + TILE_H;
  const bx1 = b.x * HALF_X;
  const bx2 = bx1 + TILE_W;
  const by1 = b.y * HALF_Y;
  const by2 = by1 + TILE_H;
  return ax1 < bx2 && ax2 > bx1 && ay1 < by2 && ay2 > by1;
};

const isFree = (t: Tile, tiles: Tile[]): boolean => {
  // Covered from above?
  for (const o of tiles) {
    if (o.removed || o.id === t.id) continue;
    if (o.layer > t.layer && overlaps(t, o)) return false;
  }
  // At least one side (left or right in same layer) must be open
  let leftOpen = true;
  let rightOpen = true;
  for (const o of tiles) {
    if (o.removed || o.id === t.id || o.layer !== t.layer) continue;
    const dy1 = t.y * HALF_Y;
    const dy2 = dy1 + TILE_H;
    const oy1 = o.y * HALF_Y;
    const oy2 = oy1 + TILE_H;
    const yOverlap = dy1 < oy2 && dy2 > oy1;
    if (!yOverlap) continue;
    if (o.x + 2 === t.x) leftOpen = false;
    if (o.x === t.x + 2) rightOpen = false;
  }
  return leftOpen || rightOpen;
};

const MahjongSolitaire: React.FC<{ isBotEnabled: boolean }> = () => {
  const [tiles, setTiles] = useState<Tile[]>(() => buildBoard());
  const [selected, setSelected] = useState<number | null>(null);
  const [history, setHistory] = useState<number[][]>([]); // pairs of removed ids
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);
  const startRef = useRef<number>(Date.now());
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const reset = useCallback(() => {
    setTiles(buildBoard());
    setSelected(null);
    setHistory([]);
    setElapsed(0);
    setDone(false);
    startRef.current = Date.now();
  }, []);

  useEffect(() => {
    if (done) return;
    tickRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 500);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [done]);

  useEffect(() => {
    if (tiles.every((t) => t.removed)) setDone(true);
  }, [tiles]);

  const click = (id: number) => {
    if (done) return;
    const tile = tiles.find((t) => t.id === id);
    if (!tile || tile.removed) return;
    if (!isFree(tile, tiles)) return;

    if (selected === null) {
      setSelected(id);
      return;
    }
    if (selected === id) {
      setSelected(null);
      return;
    }
    const prev = tiles.find((t) => t.id === selected);
    if (prev && prev.emoji === tile.emoji) {
      setTiles((arr) => arr.map((t) => (t.id === id || t.id === selected ? { ...t, removed: true } : t)));
      setHistory((h) => [...h, [prev.id, id]]);
      setSelected(null);
    } else {
      setSelected(id);
    }
  };

  const undo = () => {
    if (history.length === 0) return;
    const pair = history[history.length - 1];
    setTiles((arr) => arr.map((t) => (pair.includes(t.id) ? { ...t, removed: false } : t)));
    setHistory((h) => h.slice(0, -1));
    setSelected(null);
    setDone(false);
  };

  const remaining = tiles.filter((t) => !t.removed).length;

  // Board dimensions
  const maxX = Math.max(...tiles.map((t) => t.x)) + 2;
  const maxY = Math.max(...tiles.map((t) => t.y)) + 2;
  const W = maxX * HALF_X + 16;
  const H = maxY * HALF_Y + 16;

  const tone: StatusTone = done ? 'success' : 'info';

  // Render tiles sorted by layer (lower first), then y, then x
  const orderedTiles = [...tiles].sort((a, b) => {
    if (a.layer !== b.layer) return a.layer - b.layer;
    if (a.y !== b.y) return a.y - b.y;
    return a.x - b.x;
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-2">
        <button
          onClick={undo}
          disabled={!history.length || done}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
        >
          <Undo2 className="w-3.5 h-3.5" /> Undo
        </button>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <RefreshCw className="w-3.5 h-3.5" /> New
        </button>
      </div>

      <StatusBar tone={tone}>
        {done
          ? `Cleared in ${elapsed}s!`
          : `Tiles remaining ${remaining} · ${elapsed}s`}
      </StatusBar>

      <div className="relative w-full overflow-x-auto" style={{ maxWidth: 900 }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          style={{ width: '100%', aspectRatio: `${W} / ${H}`, minWidth: 400 }}
          className="rounded-2xl shadow-xl"
        >
          <rect x={0} y={0} width={W} height={H} fill="url(#felt)" />
          <defs>
            <linearGradient id="felt" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#064e3b" />
              <stop offset="100%" stopColor="#022c22" />
            </linearGradient>
          </defs>

          {orderedTiles.map((t) => {
            if (t.removed) return null;
            const px = t.x * HALF_X + 8;
            const py = t.y * HALF_Y + 8;
            const free = isFree(t, tiles);
            const isSel = selected === t.id;
            const shadowOffset = t.layer * 2;
            return (
              <g
                key={t.id}
                transform={`translate(${px}, ${py})`}
                onClick={() => click(t.id)}
                style={{ cursor: free ? 'pointer' : 'default' }}
              >
                {/* Shadow */}
                <rect
                  x={shadowOffset}
                  y={shadowOffset}
                  width={TILE_W}
                  height={TILE_H}
                  rx={6}
                  fill="rgba(0,0,0,0.3)"
                />
                {/* Tile */}
                <rect
                  x={0}
                  y={0}
                  width={TILE_W}
                  height={TILE_H}
                  rx={6}
                  fill={isSel ? '#fef3c7' : '#fafaf9'}
                  stroke={isSel ? '#f59e0b' : free ? '#cbd5e1' : '#94a3b8'}
                  strokeWidth={isSel ? 3 : 1.5}
                  opacity={free ? 1 : 0.7}
                />
                {/* Emoji */}
                <text
                  x={TILE_W / 2}
                  y={TILE_H / 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={34}
                  style={{ userSelect: 'none', filter: free ? 'none' : 'grayscale(0.5)' }}
                >
                  {t.emoji}
                </text>
              </g>
            );
          })}
        </svg>

        {done && (
          <WinOverlay
            title={`Cleared in ${elapsed}s`}
            subtitle="Every tile matched!"
            onPlayAgain={reset}
            playAgainLabel="New board"
          />
        )}
      </div>
    </div>
  );
};

export default MahjongSolitaire;
