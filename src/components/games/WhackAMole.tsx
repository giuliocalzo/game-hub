import React, { useCallback, useEffect, useRef, useState } from 'react';
import StatusBar, { StatusTone } from '../shared/StatusBar';
import WinOverlay from '../shared/WinOverlay';

const HOLES = 9;
const DURATION = 30;

const WhackAMole: React.FC<{ isBotEnabled: boolean }> = () => {
  const [active, setActive] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [running, setRunning] = useState(false);
  const [showEnd, setShowEnd] = useState(false);
  const [best, setBest] = useState(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const moleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = useCallback(() => {
    setScore(0);
    setTimeLeft(DURATION);
    setRunning(true);
    setShowEnd(false);
  }, []);

  const stop = useCallback(() => {
    setRunning(false);
    setActive(null);
    if (tickRef.current) clearInterval(tickRef.current);
    if (moleRef.current) clearTimeout(moleRef.current);
    setShowEnd(true);
    setBest((b) => Math.max(b, score));
  }, [score]);

  // Timer
  useEffect(() => {
    if (!running) return;
    tickRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (tickRef.current) clearInterval(tickRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [running]);

  useEffect(() => {
    if (running && timeLeft === 0) stop();
  }, [running, timeLeft, stop]);

  // Mole popper
  useEffect(() => {
    if (!running) return;
    const pop = () => {
      const next = Math.floor(Math.random() * HOLES);
      setActive(next);
      const dur = 450 + Math.random() * 600;
      moleRef.current = setTimeout(() => {
        setActive(null);
        moleRef.current = setTimeout(pop, 180 + Math.random() * 400);
      }, dur);
    };
    pop();
    return () => {
      if (moleRef.current) clearTimeout(moleRef.current);
    };
  }, [running]);

  const whack = (i: number) => {
    if (!running || active !== i) return;
    setScore((s) => s + 1);
    setActive(null);
  };

  const tone: StatusTone = running ? 'info' : showEnd ? 'success' : 'neutral';
  const status = running
    ? `Time left: ${timeLeft}s · Score: ${score}`
    : showEnd
      ? `Time's up! Score: ${score} · Best: ${best}`
      : 'Ready to start?';

  return (
    <div className="flex flex-col items-center gap-5">
      <StatusBar tone={tone}>{status}</StatusBar>

      <div className="relative">
        <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-gradient-to-br from-amber-100 to-yellow-200 shadow-inner">
          {Array.from({ length: HOLES }).map((_, i) => (
            <button
              key={i}
              onClick={() => whack(i)}
              aria-label={`Hole ${i + 1}`}
              className="relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-amber-800/80 shadow-inner flex items-end justify-center overflow-hidden"
            >
              <div
                className={`text-5xl md:text-6xl transition-transform duration-150 ${
                  active === i ? 'translate-y-0' : 'translate-y-full'
                }`}
              >
                🐹
              </div>
            </button>
          ))}
        </div>
        {showEnd && (
          <WinOverlay
            title={`Score: ${score}`}
            subtitle={score >= best ? 'New best!' : `Best: ${best}`}
            onPlayAgain={start}
          />
        )}
      </div>

      {!running && !showEnd && (
        <button
          onClick={start}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold shadow hover:brightness-110 active:scale-95"
        >
          Start
        </button>
      )}

    </div>
  );
};

export default WhackAMole;
