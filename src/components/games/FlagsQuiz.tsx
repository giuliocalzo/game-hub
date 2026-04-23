import React, { useCallback, useState } from 'react';
import StatusBar, { StatusTone } from '../shared/StatusBar';
import WinOverlay from '../shared/WinOverlay';

const FLAGS: Array<{ name: string; flag: string }> = [
  { name: 'Italy', flag: '🇮🇹' },
  { name: 'France', flag: '🇫🇷' },
  { name: 'Germany', flag: '🇩🇪' },
  { name: 'Spain', flag: '🇪🇸' },
  { name: 'Portugal', flag: '🇵🇹' },
  { name: 'Japan', flag: '🇯🇵' },
  { name: 'China', flag: '🇨🇳' },
  { name: 'South Korea', flag: '🇰🇷' },
  { name: 'India', flag: '🇮🇳' },
  { name: 'Brazil', flag: '🇧🇷' },
  { name: 'Argentina', flag: '🇦🇷' },
  { name: 'Mexico', flag: '🇲🇽' },
  { name: 'Canada', flag: '🇨🇦' },
  { name: 'United States', flag: '🇺🇸' },
  { name: 'United Kingdom', flag: '🇬🇧' },
  { name: 'Ireland', flag: '🇮🇪' },
  { name: 'Netherlands', flag: '🇳🇱' },
  { name: 'Belgium', flag: '🇧🇪' },
  { name: 'Sweden', flag: '🇸🇪' },
  { name: 'Norway', flag: '🇳🇴' },
  { name: 'Finland', flag: '🇫🇮' },
  { name: 'Denmark', flag: '🇩🇰' },
  { name: 'Greece', flag: '🇬🇷' },
  { name: 'Turkey', flag: '🇹🇷' },
  { name: 'Egypt', flag: '🇪🇬' },
  { name: 'South Africa', flag: '🇿🇦' },
  { name: 'Australia', flag: '🇦🇺' },
  { name: 'New Zealand', flag: '🇳🇿' },
];

const ROUNDS = 10;

const pickQuestion = (pool: typeof FLAGS, prev: string | null) => {
  const choices = [...pool].sort(() => Math.random() - 0.5);
  let correct = choices.find((c) => c.name !== prev) ?? choices[0];
  const distractors = choices.filter((c) => c.name !== correct.name).slice(0, 3);
  const options = [...distractors, correct].sort(() => Math.random() - 0.5);
  return { correct, options };
};

const FlagsQuiz: React.FC<{ isBotEnabled: boolean }> = () => {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [q, setQ] = useState(() => pickQuestion(FLAGS, null));
  const [locked, setLocked] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const reset = useCallback(() => {
    setRound(0);
    setScore(0);
    setQ(pickQuestion(FLAGS, null));
    setLocked(null);
    setDone(false);
  }, []);

  const answer = (name: string) => {
    if (locked || done) return;
    setLocked(name);
    const ok = name === q.correct.name;
    if (ok) setScore((s) => s + 1);
    setTimeout(() => {
      if (round + 1 >= ROUNDS) {
        setDone(true);
      } else {
        setRound((r) => r + 1);
        setLocked(null);
        setQ(pickQuestion(FLAGS, q.correct.name));
      }
    }, 700);
  };

  const tone: StatusTone = done ? 'success' : 'info';

  return (
    <div className="flex flex-col items-center gap-5">
      <StatusBar tone={tone}>
        {done ? `Quiz complete — ${score}/${ROUNDS}` : `Question ${round + 1}/${ROUNDS} · Score ${score}`}
      </StatusBar>

      <div className="text-8xl select-none">{q.correct.flag}</div>
      <div className="grid grid-cols-2 gap-3 w-full max-w-md">
        {q.options.map((o) => {
          const picked = locked === o.name;
          const isRight = o.name === q.correct.name;
          const state =
            !locked
              ? 'bg-white hover:bg-blue-50 border-gray-200'
              : picked && isRight
                ? 'bg-emerald-500 text-white border-emerald-500'
                : picked && !isRight
                  ? 'bg-rose-500 text-white border-rose-500'
                  : !picked && isRight
                    ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                    : 'bg-white border-gray-200';
          return (
            <button
              key={o.name}
              onClick={() => answer(o.name)}
              disabled={!!locked || done}
              className={`px-4 py-3 rounded-xl border font-semibold transition ${state}`}
            >
              {o.name}
            </button>
          );
        })}
      </div>

      {done && (
        <WinOverlay
          title={`${score}/${ROUNDS}`}
          subtitle={score === ROUNDS ? 'Geography whiz!' : 'Want another round?'}
          onPlayAgain={reset}
          playAgainLabel="Play again"
        />
      )}

      <p className="text-xs md:text-sm text-gray-500 max-w-md text-center">
        Look at the flag and pick the correct country.
      </p>
    </div>
  );
};

export default FlagsQuiz;
