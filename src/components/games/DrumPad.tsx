import React, { useEffect, useState } from 'react';
import { playKick, playNoise, playTone } from './audio';

interface Pad {
  id: number;
  label: string;
  kbd: string;
  color: string;
  trigger: () => void;
}

const PADS: Pad[] = [
  {
    id: 0, label: 'Kick', kbd: '1', color: 'from-rose-500 to-rose-700',
    trigger: () => playKick(),
  },
  {
    id: 1, label: 'Snare', kbd: '2', color: 'from-orange-500 to-amber-600',
    trigger: () => {
      playNoise(160, 1200, 0.3);
      playTone(200, 80, 'square', 0.15);
    },
  },
  {
    id: 2, label: 'Hi-hat', kbd: '3', color: 'from-yellow-400 to-amber-500',
    trigger: () => playNoise(60, 6000, 0.25),
  },
  {
    id: 3, label: 'Clap', kbd: '4', color: 'from-lime-400 to-green-600',
    trigger: () => {
      playNoise(30, 1500, 0.3);
      setTimeout(() => playNoise(80, 1500, 0.3), 30);
    },
  },
  {
    id: 4, label: 'Tom', kbd: '5', color: 'from-emerald-400 to-teal-600',
    trigger: () => {
      // short mid-range sweep
      playTone(240, 200, 'sine', 0.3);
      playTone(120, 260, 'sine', 0.2);
    },
  },
  {
    id: 5, label: 'Crash', kbd: '6', color: 'from-cyan-400 to-blue-600',
    trigger: () => playNoise(400, 4000, 0.28),
  },
  {
    id: 6, label: 'Ride', kbd: '7', color: 'from-indigo-400 to-indigo-700',
    trigger: () => playNoise(280, 5000, 0.22),
  },
  {
    id: 7, label: 'Rim', kbd: '8', color: 'from-violet-500 to-purple-700',
    trigger: () => {
      playTone(1200, 40, 'square', 0.22);
      playNoise(40, 3000, 0.18);
    },
  },
  {
    id: 8, label: 'Cowbell', kbd: '9', color: 'from-pink-500 to-fuchsia-600',
    trigger: () => {
      playTone(800, 120, 'square', 0.18);
      playTone(540, 120, 'square', 0.15);
    },
  },
];

const DrumPad: React.FC<{ isBotEnabled: boolean }> = () => {
  const [active, setActive] = useState<Set<number>>(new Set());

  const hit = (pad: Pad) => {
    pad.trigger();
    setActive((s) => {
      const n = new Set(s);
      n.add(pad.id);
      return n;
    });
    setTimeout(() => {
      setActive((s) => {
        const n = new Set(s);
        n.delete(pad.id);
        return n;
      });
    }, 160);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
      const pad = PADS.find((p) => p.kbd === e.key);
      if (pad) {
        e.preventDefault();
        hit(pad);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="grid grid-cols-3 gap-3 sm:gap-4 p-4 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-950 shadow-2xl w-full max-w-lg">
        {PADS.map((p) => {
          const isOn = active.has(p.id);
          return (
            <button
              key={p.id}
              onPointerDown={() => hit(p)}
              className={`relative aspect-square rounded-2xl bg-gradient-to-br ${p.color} text-white font-bold shadow-lg transition-all ${
                isOn
                  ? 'scale-95 ring-4 ring-white/60 brightness-125'
                  : 'hover:brightness-110 active:scale-95'
              }`}
              aria-label={p.label}
            >
              <span className="absolute top-1.5 left-2 text-xs opacity-70">{p.kbd}</span>
              <span className="text-base sm:text-lg drop-shadow">{p.label}</span>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md text-center">
        Tap the pads or press keys 1–9. Make your own beat!
      </p>
    </div>
  );
};

export default DrumPad;
