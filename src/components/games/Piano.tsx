import React, { useEffect, useState } from 'react';
import { noteFreq, playTone } from './audio';

interface KeyDef {
  note: string;
  label: string;
  kbd?: string;
  isBlack: boolean;
}

// Two octaves starting at C4
const buildKeys = (): KeyDef[] => {
  const octaves = [4, 5];
  const whiteNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const blackAfter: Record<string, string> = { C: 'C#', D: 'D#', F: 'F#', G: 'G#', A: 'A#' };
  // White keyboard row: a s d f g h j k l ; ' + q w (we'll pick reasonable mapping)
  const kbdWhite = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'q', 'w', 'e'];
  const kbdBlack = ['w', 'e', 't', 'y', 'u', '2', '3', '5', '6', '7'];

  const keys: KeyDef[] = [];
  let wIdx = 0;
  let bIdx = 0;
  for (const oct of octaves) {
    for (const w of whiteNotes) {
      keys.push({
        note: `${w}${oct}`,
        label: w,
        kbd: kbdWhite[wIdx] || undefined,
        isBlack: false,
      });
      wIdx++;
      if (blackAfter[w]) {
        keys.push({
          note: `${blackAfter[w]}${oct}`,
          label: blackAfter[w],
          kbd: kbdBlack[bIdx] || undefined,
          isBlack: true,
        });
        bIdx++;
      }
    }
  }
  return keys;
};

const ALL_KEYS = buildKeys();
const WHITE_KEYS = ALL_KEYS.filter((k) => !k.isBlack);

const WHITE_W = 56;
const WHITE_H = 200;
const BLACK_W = 36;
const BLACK_H = 130;

const W_VIEW = WHITE_KEYS.length * WHITE_W;
const H_VIEW = WHITE_H;

const Piano: React.FC<{ isBotEnabled: boolean }> = () => {
  const [showLabels, setShowLabels] = useState(true);
  const [active, setActive] = useState<Set<string>>(new Set());

  const press = (note: string) => {
    playTone(noteFreq(note), 600, 'triangle', 0.18);
    setActive((s) => {
      const n = new Set(s);
      n.add(note);
      return n;
    });
    setTimeout(() => {
      setActive((s) => {
        const n = new Set(s);
        n.delete(note);
        return n;
      });
    }, 250);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
      const key = ALL_KEYS.find((k) => k.kbd && k.kbd.toLowerCase() === e.key.toLowerCase());
      if (key) {
        e.preventDefault();
        press(key.note);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowLabels((s) => !s)}
          className="px-3 py-1.5 rounded-full text-xs font-semibold border bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          {showLabels ? 'Hide notes' : 'Show notes'}
        </button>
      </div>

      <div className="w-full max-w-4xl mx-auto overflow-x-auto">
        <svg
          viewBox={`0 0 ${W_VIEW} ${H_VIEW}`}
          className="w-full select-none drop-shadow-xl"
          style={{ aspectRatio: `${W_VIEW} / ${H_VIEW}`, minWidth: 600 }}
        >
          {/* White keys */}
          {WHITE_KEYS.map((k, i) => {
            const x = i * WHITE_W;
            const isOn = active.has(k.note);
            return (
              <g key={k.note} onPointerDown={() => press(k.note)} style={{ cursor: 'pointer' }}>
                <rect
                  x={x + 1}
                  y={0}
                  width={WHITE_W - 2}
                  height={WHITE_H}
                  fill={isOn ? '#c7d2fe' : '#fafaf9'}
                  stroke="#0f172a"
                  strokeWidth={1.5}
                  rx={4}
                />
                {showLabels && (
                  <text
                    x={x + WHITE_W / 2}
                    y={WHITE_H - 16}
                    textAnchor="middle"
                    fontSize={14}
                    fontWeight={700}
                    fill="#475569"
                  >
                    {k.label}
                  </text>
                )}
                {showLabels && k.kbd && (
                  <text
                    x={x + WHITE_W / 2}
                    y={WHITE_H - 34}
                    textAnchor="middle"
                    fontSize={10}
                    fontWeight={600}
                    fill="#94a3b8"
                  >
                    {k.kbd}
                  </text>
                )}
              </g>
            );
          })}

          {/* Black keys overlay */}
          {ALL_KEYS.filter((k) => k.isBlack).map((k) => {
            // Each black key sits at the right edge of its preceding white key.
            const whiteIdx = WHITE_KEYS.findIndex((wk) => {
              const kIdx = ALL_KEYS.indexOf(k);
              // Find the white key just before this black key
              for (let i = kIdx - 1; i >= 0; i--) {
                if (!ALL_KEYS[i].isBlack) return wk === ALL_KEYS[i];
              }
              return false;
            });
            if (whiteIdx < 0) return null;
            const x = (whiteIdx + 1) * WHITE_W - BLACK_W / 2;
            const isOn = active.has(k.note);
            return (
              <g key={k.note} onPointerDown={() => press(k.note)} style={{ cursor: 'pointer' }}>
                <rect
                  x={x}
                  y={0}
                  width={BLACK_W}
                  height={BLACK_H}
                  fill={isOn ? '#4338ca' : '#0f172a'}
                  rx={3}
                />
                {showLabels && (
                  <text
                    x={x + BLACK_W / 2}
                    y={BLACK_H - 12}
                    textAnchor="middle"
                    fontSize={9}
                    fontWeight={600}
                    fill="#cbd5e1"
                  >
                    {k.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md text-center">
        Click or tap the keys to play. Use your keyboard too!
      </p>
    </div>
  );
};

export default Piano;
