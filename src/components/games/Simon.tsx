import React, { useCallback, useEffect, useRef, useState } from 'react';
import StatusBar, { StatusTone } from '../shared/StatusBar';
import WinOverlay from '../shared/WinOverlay';

const COLORS = ['green', 'red', 'yellow', 'blue'] as const;
type Color = (typeof COLORS)[number];

const COLOR_CLASS: Record<Color, { base: string; lit: string }> = {
  green: { base: 'bg-emerald-500', lit: 'bg-emerald-300' },
  red: { base: 'bg-rose-500', lit: 'bg-rose-300' },
  yellow: { base: 'bg-yellow-400', lit: 'bg-yellow-200' },
  blue: { base: 'bg-sky-500', lit: 'bg-sky-300' },
};

const Simon: React.FC<{ isBotEnabled: boolean }> = () => {
  const [sequence, setSequence] = useState<Color[]>([]);
  const [userIdx, setUserIdx] = useState(0);
  const [playingBack, setPlayingBack] = useState(false);
  const [activeLit, setActiveLit] = useState<Color | null>(null);
  const [status, setStatus] = useState<'idle' | 'playing' | 'over'>('idle');
  const [best, setBest] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const playBack = useCallback((seq: Color[]) => {
    setPlayingBack(true);
    let i = 0;
    const step = () => {
      if (i >= seq.length) {
        setActiveLit(null);
        setPlayingBack(false);
        setUserIdx(0);
        return;
      }
      setActiveLit(seq[i]);
      timeoutRef.current = setTimeout(() => {
        setActiveLit(null);
        i++;
        timeoutRef.current = setTimeout(step, 180);
      }, 450);
    };
    timeoutRef.current = setTimeout(step, 400);
  }, []);

  const addStep = useCallback(
    (prev: Color[]) => {
      const next = [...prev, COLORS[Math.floor(Math.random() * 4)]];
      setSequence(next);
      playBack(next);
    },
    [playBack],
  );

  const start = () => {
    setSequence([]);
    setUserIdx(0);
    setStatus('playing');
    addStep([]);
  };

  const handlePress = (c: Color) => {
    if (status !== 'playing' || playingBack) return;
    const expect = sequence[userIdx];
    setActiveLit(c);
    setTimeout(() => setActiveLit(null), 160);
    if (c !== expect) {
      setStatus('over');
      setBest((b) => Math.max(b, sequence.length - 1));
      return;
    }
    const nextIdx = userIdx + 1;
    if (nextIdx >= sequence.length) {
      setUserIdx(0);
      setTimeout(() => addStep(sequence), 600);
    } else {
      setUserIdx(nextIdx);
    }
  };

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    [],
  );

  const tone: StatusTone =
    status === 'over' ? 'warning' : status === 'playing' ? 'info' : 'neutral';
  const statusText =
    status === 'idle'
      ? 'Press start to play.'
      : status === 'over'
        ? `Game over — you got ${sequence.length - 1} in a row.`
        : playingBack
          ? 'Watch the sequence…'
          : `Your turn — repeat ${sequence.length} step${sequence.length === 1 ? '' : 's'}.`;

  return (
    <div className="flex flex-col items-center gap-5">
      <StatusBar tone={tone}>{statusText}</StatusBar>

      <div className="relative">
        <div className="grid grid-cols-2 gap-3 p-3 rounded-3xl bg-gray-900 shadow-xl">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => handlePress(c)}
              disabled={status !== 'playing' || playingBack}
              className={`w-32 h-32 md:w-40 md:h-40 rounded-3xl transition-all ${
                activeLit === c ? COLOR_CLASS[c].lit : COLOR_CLASS[c].base
              } ${status === 'playing' && !playingBack ? 'hover:brightness-110 active:scale-95' : ''}`}
              aria-label={c}
            />
          ))}
        </div>
        {status === 'over' && (
          <WinOverlay
            title="Oops — wrong color"
            subtitle={`You matched ${sequence.length - 1} steps.`}
            onPlayAgain={start}
            playAgainLabel="Try again"
          />
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
          Current: <span className="font-bold">{Math.max(0, sequence.length - (status === 'over' ? 1 : 0))}</span> · Best: <span className="font-bold">{best}</span>
        </div>
        {status !== 'playing' && (
          <button
            onClick={start}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold shadow hover:brightness-110 active:scale-95"
          >
            {status === 'over' ? 'Play again' : 'Start'}
          </button>
        )}
      </div>

    </div>
  );
};

export default Simon;
