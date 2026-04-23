import React, { useCallback, useEffect, useRef, useState } from 'react';
import StatusBar, { StatusTone } from '../shared/StatusBar';

type Phase = 'idle' | 'waiting' | 'go' | 'result' | 'early';

const ReactionTime: React.FC<{ isBotEnabled: boolean }> = () => {
  const [phase, setPhase] = useState<Phase>('idle');
  const [ms, setMs] = useState<number | null>(null);
  const [best, setBest] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const goAtRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setPhase('waiting');
    setMs(null);
    const delay = 1200 + Math.random() * 2500;
    timeoutRef.current = setTimeout(() => {
      goAtRef.current = performance.now();
      setPhase('go');
    }, delay);
  }, []);

  const handleTap = useCallback(() => {
    if (phase === 'idle' || phase === 'result' || phase === 'early') {
      start();
      return;
    }
    if (phase === 'waiting') {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setPhase('early');
      return;
    }
    if (phase === 'go') {
      const delta = Math.round(performance.now() - goAtRef.current);
      setMs(delta);
      setPhase('result');
      setBest((b) => (b == null ? delta : Math.min(b, delta)));
      setHistory((h) => [delta, ...h].slice(0, 5));
    }
  }, [phase, start]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleTap();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleTap]);

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    [],
  );

  const bg = phase === 'go'
    ? 'bg-emerald-500 hover:bg-emerald-400'
    : phase === 'waiting'
      ? 'bg-rose-500'
      : phase === 'early'
        ? 'bg-amber-500'
        : 'bg-blue-500 hover:bg-blue-400';

  const label = phase === 'idle'
    ? 'Tap to start'
    : phase === 'waiting'
      ? 'Wait for green…'
      : phase === 'go'
        ? 'TAP!'
        : phase === 'early'
          ? 'Too early! Tap to retry'
          : `${ms} ms — tap to try again`;

  const tone: StatusTone =
    phase === 'result' ? 'success'
      : phase === 'early' ? 'warning'
        : phase === 'go' ? 'success'
          : phase === 'waiting' ? 'info'
            : 'neutral';

  return (
    <div className="flex flex-col items-center gap-5">
      <StatusBar tone={tone}>
        {best != null
          ? `Best: ${best} ms · Last: ${ms ?? '—'} ms`
          : 'Wait for green, then tap as fast as you can.'}
      </StatusBar>

      <button
        onClick={handleTap}
        className={`w-64 h-64 md:w-80 md:h-80 rounded-3xl text-white font-extrabold text-2xl md:text-3xl shadow-xl active:scale-95 transition-all ${bg}`}
        aria-label="Reaction button"
      >
        {label}
      </button>

      {history.length > 0 && (
        <div className="flex gap-2 flex-wrap justify-center">
          {history.map((v, i) => (
            <span
              key={i}
              className="text-xs font-semibold px-2 py-1 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
            >
              {v} ms
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReactionTime;
