import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Play, Pause } from 'lucide-react';
import { playTone } from './audio';

const Metronome: React.FC<{ isBotEnabled: boolean }> = () => {
  const [bpm, setBpm] = useState(96);
  const [beatsPerBar, setBeatsPerBar] = useState(4);
  const [playing, setPlaying] = useState(false);
  const [beat, setBeat] = useState(0);
  const nextTickRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const tick = useCallback(() => {
    setBeat((b) => {
      const isDownbeat = b === 0;
      playTone(isDownbeat ? 1200 : 800, 70, 'square', isDownbeat ? 0.25 : 0.18);
      return (b + 1) % beatsPerBar;
    });
  }, [beatsPerBar]);

  useEffect(() => {
    if (!playing) {
      nextTickRef.current = null;
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      return;
    }
    const loop = () => {
      const now = performance.now();
      if (nextTickRef.current === null) nextTickRef.current = now;
      if (now >= nextTickRef.current) {
        tick();
        const interval = 60000 / bpm;
        nextTickRef.current = nextTickRef.current + interval;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, bpm, tick]);

  const toggle = () => {
    if (!playing) {
      setBeat(0);
      nextTickRef.current = null;
    }
    setPlaying((p) => !p);
  };

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Beats visualizer */}
      <div className="flex items-end justify-center gap-2">
        {Array.from({ length: beatsPerBar }).map((_, i) => {
          const isActive = playing && beat === i;
          const isDownbeat = i === 0;
          return (
            <div
              key={i}
              className={`w-10 sm:w-12 rounded-lg transition-all ${
                isActive
                  ? isDownbeat
                    ? 'bg-rose-500 h-24'
                    : 'bg-indigo-500 h-20'
                  : isDownbeat
                  ? 'bg-rose-200 dark:bg-rose-500/30 h-16'
                  : 'bg-indigo-200 dark:bg-indigo-500/30 h-14'
              }`}
            />
          );
        })}
      </div>

      <div className="text-6xl font-black tabular-nums text-gray-900 dark:text-gray-100">
        {bpm} <span className="text-xl font-bold text-gray-500 dark:text-gray-400">BPM</span>
      </div>

      <input
        type="range"
        min={40}
        max={220}
        value={bpm}
        onChange={(e) => setBpm(parseInt(e.target.value, 10))}
        className="w-64 sm:w-80"
      />

      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 dark:text-gray-300">Beats:</span>
        {[2, 3, 4, 6].map((n) => (
          <button
            key={n}
            onClick={() => setBeatsPerBar(n)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
              beatsPerBar === n
                ? 'bg-gray-900 text-white border-gray-900 dark:bg-gray-100 dark:text-gray-900 dark:border-gray-100'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
            }`}
          >
            {n}/4
          </button>
        ))}
      </div>

      <button
        onClick={toggle}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold shadow-lg hover:brightness-110 active:scale-95"
      >
        {playing ? <><Pause className="w-5 h-5" /> Stop</> : <><Play className="w-5 h-5" /> Start</>}
      </button>

      <div className="flex gap-2 text-xs">
        {[60, 90, 120, 144, 180].map((t) => (
          <button
            key={t}
            onClick={() => setBpm(t)}
            className="px-3 py-1.5 rounded-full font-semibold bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Metronome;
