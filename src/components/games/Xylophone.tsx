import React, { useEffect, useState } from 'react';
import { noteFreq, playTone } from './audio';

interface Bar {
  note: string;
  label: string;
  color: string;
  kbd: string;
}

// C major one-octave: C D E F G A B C
const BARS: Bar[] = [
  { note: 'C4', label: 'C', color: '#ef4444', kbd: '1' },
  { note: 'D4', label: 'D', color: '#f97316', kbd: '2' },
  { note: 'E4', label: 'E', color: '#eab308', kbd: '3' },
  { note: 'F4', label: 'F', color: '#22c55e', kbd: '4' },
  { note: 'G4', label: 'G', color: '#06b6d4', kbd: '5' },
  { note: 'A4', label: 'A', color: '#3b82f6', kbd: '6' },
  { note: 'B4', label: 'B', color: '#8b5cf6', kbd: '7' },
  { note: 'C5', label: 'C', color: '#ec4899', kbd: '8' },
];

const Xylophone: React.FC<{ isBotEnabled: boolean }> = () => {
  const [active, setActive] = useState<Set<string>>(new Set());

  const strike = (bar: Bar) => {
    playTone(noteFreq(bar.note), 700, 'triangle', 0.2);
    // Add a very brief sine overtone for the xylophone shimmer
    playTone(noteFreq(bar.note) * 2, 200, 'sine', 0.08);
    setActive((s) => {
      const n = new Set(s);
      n.add(bar.note);
      return n;
    });
    setTimeout(() => {
      setActive((s) => {
        const n = new Set(s);
        n.delete(bar.note);
        return n;
      });
    }, 220);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
      const bar = BARS.find((b) => b.kbd === e.key);
      if (bar) {
        e.preventDefault();
        strike(bar);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-2 items-end p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-950/60 shadow-xl w-full max-w-2xl">
        {BARS.map((bar, i) => {
          const height = 240 - i * 18; // Shorter bars play higher
          const isOn = active.has(bar.note);
          return (
            <button
              key={bar.note}
              onPointerDown={() => strike(bar)}
              className={`relative flex-1 rounded-xl shadow-md transition-all ${
                isOn ? 'scale-95 brightness-110 ring-4 ring-white/70' : 'hover:brightness-105 active:scale-95'
              }`}
              style={{
                height,
                background: `linear-gradient(180deg, ${bar.color} 0%, ${bar.color}dd 100%)`,
              }}
              aria-label={`Xylophone bar ${bar.label}`}
            >
              <span className="absolute inset-x-0 bottom-2 text-center text-white font-extrabold drop-shadow-md text-lg">
                {bar.label}
              </span>
              {/* Nail/peg */}
              <span className="absolute top-3 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-gray-800/40" />
            </button>
          );
        })}
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md text-center">
        Tap the bars or press keys 1–8 to play a tune.
      </p>
    </div>
  );
};

export default Xylophone;
