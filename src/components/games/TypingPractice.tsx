import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import StatusBar, { StatusTone } from '../shared/StatusBar';
import WinOverlay from '../shared/WinOverlay';

const SENTENCES = [
  'the quick brown fox jumps over the lazy dog',
  'practice makes progress not perfection',
  'a journey of a thousand miles begins with a single step',
  'stars cannot shine without darkness',
  'dream big work hard stay humble',
  'courage is not the absence of fear',
];

const TypingPractice: React.FC<{ isBotEnabled: boolean }> = () => {
  const [target, setTarget] = useState<string>(() => SENTENCES[0]);
  const [typed, setTyped] = useState<string>('');
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [finishedAt, setFinishedAt] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setTarget(SENTENCES[Math.floor(Math.random() * SENTENCES.length)]);
    setTyped('');
    setStartedAt(null);
    setFinishedAt(null);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  useEffect(() => {
    reset();
  }, [reset]);

  const onChange = (v: string) => {
    if (!startedAt && v.length > 0) setStartedAt(Date.now());
    setTyped(v);
    if (v === target) setFinishedAt(Date.now());
  };

  const errors = useMemo(
    () =>
      typed.split('').reduce((acc, ch, i) => (ch !== target[i] ? acc + 1 : acc), 0),
    [typed, target],
  );

  const { wpm, accuracy, elapsed } = useMemo(() => {
    const end = finishedAt ?? Date.now();
    const secs = startedAt ? Math.max(1, (end - startedAt) / 1000) : 0;
    const words = typed.length / 5;
    const w = secs > 0 ? Math.round((words / secs) * 60) : 0;
    const acc = typed.length ? Math.max(0, 100 - (errors / typed.length) * 100) : 100;
    return { wpm: w, accuracy: Math.round(acc), elapsed: Math.round(secs) };
  }, [startedAt, finishedAt, typed, errors]);

  const done = finishedAt !== null;
  const tone: StatusTone = done ? 'success' : 'info';

  return (
    <div className="flex flex-col items-center gap-5">
      <StatusBar tone={tone}>
        {done
          ? `Done in ${elapsed}s · ${wpm} WPM · ${accuracy}% accuracy`
          : startedAt
            ? `Typing… ${typed.length}/${target.length}`
            : 'Start typing to begin.'}
      </StatusBar>

      <div className="relative w-full max-w-xl p-5 rounded-2xl bg-white border border-gray-200 shadow-md font-mono text-lg tracking-wide leading-relaxed">
        {target.split('').map((ch, i) => {
          let cls = 'text-gray-400';
          if (i < typed.length) {
            cls = typed[i] === ch ? 'text-emerald-600' : 'text-rose-500 underline';
          }
          if (i === typed.length && !done) cls += ' bg-blue-100';
          return (
            <span key={i} className={cls}>
              {ch}
            </span>
          );
        })}
        {done && (
          <WinOverlay
            title={`${wpm} WPM`}
            subtitle={`${accuracy}% accuracy in ${elapsed}s`}
            onPlayAgain={reset}
            playAgainLabel="New sentence"
          />
        )}
      </div>

      <input
        ref={inputRef}
        value={typed}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Start typing here…"
        disabled={done}
        className="w-full max-w-xl px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:outline-none font-mono"
      />

      <div className="flex gap-3 text-sm text-gray-600">
        <span>Errors: <strong>{errors}</strong></span>
        <span>·</span>
        <span>Length: <strong>{target.length}</strong></span>
      </div>

      <button
        onClick={reset}
        className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm font-semibold shadow hover:bg-gray-50"
      >
        New sentence
      </button>

      <p className="text-xs md:text-sm text-gray-500 max-w-md text-center">
        Type the sentence exactly as shown. Your WPM and accuracy update as you go.
      </p>
    </div>
  );
};

export default TypingPractice;
