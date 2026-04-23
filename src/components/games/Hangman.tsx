import React, { useCallback, useEffect, useMemo, useState } from 'react';
import StatusBar, { StatusTone } from '../shared/StatusBar';
import WinOverlay from '../shared/WinOverlay';

const WORDS = [
  'banana', 'sunshine', 'puppy', 'castle', 'rocket', 'dragon',
  'pirate', 'wizard', 'rainbow', 'planet', 'forest', 'turtle',
  'pyjamas', 'butter', 'pencil', 'monster', 'thunder', 'adventure',
  'library', 'sandwich', 'pillow', 'kitchen',
];

const ALPHA = 'abcdefghijklmnopqrstuvwxyz'.split('');
const MAX_WRONG = 6;

const Hangman: React.FC<{ isBotEnabled: boolean }> = () => {
  const [word, setWord] = useState<string>(() => WORDS[Math.floor(Math.random() * WORDS.length)]);
  const [guessed, setGuessed] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState(0);

  const masked = useMemo(
    () =>
      word
        .split('')
        .map((ch) => (guessed.has(ch) ? ch : '_'))
        .join(' '),
    [word, guessed],
  );

  const won = useMemo(
    () => word.split('').every((ch) => guessed.has(ch)),
    [word, guessed],
  );
  const lost = wrong >= MAX_WRONG;

  const reset = useCallback(() => {
    setWord(WORDS[Math.floor(Math.random() * WORDS.length)]);
    setGuessed(new Set());
    setWrong(0);
  }, []);

  const guess = useCallback(
    (ch: string) => {
      if (won || lost || guessed.has(ch)) return;
      const next = new Set(guessed);
      next.add(ch);
      setGuessed(next);
      if (!word.includes(ch)) setWrong((w) => w + 1);
    },
    [won, lost, guessed, word],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const ch = e.key.toLowerCase();
      if (ch.length === 1 && ch >= 'a' && ch <= 'z') guess(ch);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [guess]);

  const tone: StatusTone = won ? 'success' : lost ? 'warning' : 'info';
  const status = won
    ? 'You saved the word!'
    : lost
      ? `Out of guesses! The word was "${word}".`
      : `Wrong guesses: ${wrong} / ${MAX_WRONG}`;

  return (
    <div className="flex flex-col items-center gap-5">
      <StatusBar tone={tone}>{status}</StatusBar>

      {/* Hangman drawing */}
      <svg
        viewBox="0 0 180 200"
        className="w-40 h-48"
        aria-label="Hangman drawing"
      >
        <line x1="20" y1="180" x2="160" y2="180" stroke="#334155" strokeWidth="4" />
        <line x1="50" y1="180" x2="50" y2="20" stroke="#334155" strokeWidth="4" />
        <line x1="50" y1="20" x2="120" y2="20" stroke="#334155" strokeWidth="4" />
        <line x1="120" y1="20" x2="120" y2="40" stroke="#334155" strokeWidth="4" />
        {wrong > 0 && <circle cx="120" cy="55" r="15" stroke="#1e293b" strokeWidth="3" fill="none" />}
        {wrong > 1 && <line x1="120" y1="70" x2="120" y2="115" stroke="#1e293b" strokeWidth="3" />}
        {wrong > 2 && <line x1="120" y1="80" x2="100" y2="105" stroke="#1e293b" strokeWidth="3" />}
        {wrong > 3 && <line x1="120" y1="80" x2="140" y2="105" stroke="#1e293b" strokeWidth="3" />}
        {wrong > 4 && <line x1="120" y1="115" x2="100" y2="145" stroke="#1e293b" strokeWidth="3" />}
        {wrong > 5 && <line x1="120" y1="115" x2="140" y2="145" stroke="#1e293b" strokeWidth="3" />}
      </svg>

      <div
        className="text-3xl md:text-4xl font-extrabold tracking-widest uppercase text-gray-900 bg-white/80 px-5 py-3 rounded-xl border border-gray-200 shadow-sm"
        aria-live="polite"
      >
        {masked}
      </div>

      <div className="grid grid-cols-7 md:grid-cols-9 gap-1.5 max-w-md">
        {ALPHA.map((ch) => {
          const isGuessed = guessed.has(ch);
          const correct = isGuessed && word.includes(ch);
          return (
            <button
              key={ch}
              onClick={() => guess(ch)}
              disabled={isGuessed || won || lost}
              className={`w-9 h-9 rounded-lg font-bold uppercase text-sm transition-all ${
                isGuessed
                  ? correct
                    ? 'bg-emerald-500 text-white'
                    : 'bg-rose-400 text-white'
                  : 'bg-white border border-gray-200 hover:bg-gray-50 active:scale-95 text-gray-800'
              }`}
            >
              {ch}
            </button>
          );
        })}
      </div>

      {(won || lost) && (
        <button
          onClick={reset}
          className="mt-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold shadow hover:brightness-110 active:scale-95"
        >
          New word
        </button>
      )}

      {lost && (
        <WinOverlay
          title="Out of guesses"
          subtitle={`The word was "${word}".`}
          onPlayAgain={reset}
          playAgainLabel="Try again"
        />
      )}
    </div>
  );
};

export default Hangman;
