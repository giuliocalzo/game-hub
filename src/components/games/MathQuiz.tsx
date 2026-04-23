import React, { useCallback, useEffect, useRef, useState } from 'react';
import StatusBar, { StatusTone } from '../shared/StatusBar';
import WinOverlay from '../shared/WinOverlay';

type Op = '+' | '−' | '×' | '÷';
type Level = 'easy' | 'medium' | 'hard';

const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const generate = (level: Level): { a: number; b: number; op: Op; answer: number } => {
  const ops: Op[] = level === 'easy' ? ['+', '−'] : level === 'medium' ? ['+', '−', '×'] : ['+', '−', '×', '÷'];
  const op = ops[randInt(0, ops.length - 1)];
  const range = level === 'easy' ? [1, 12] : level === 'medium' ? [2, 20] : [5, 50];
  let a = randInt(range[0], range[1]);
  let b = randInt(range[0], range[1]);
  let answer = 0;
  switch (op) {
    case '+': answer = a + b; break;
    case '−':
      if (b > a) [a, b] = [b, a];
      answer = a - b; break;
    case '×':
      a = randInt(2, level === 'hard' ? 12 : 10);
      b = randInt(2, level === 'hard' ? 12 : 10);
      answer = a * b; break;
    case '÷':
      b = randInt(2, 10);
      answer = randInt(2, 10);
      a = b * answer; break;
  }
  return { a, b, op, answer };
};

const QUESTIONS = 10;
const TIME = 60;

const MathQuiz: React.FC<{ isBotEnabled: boolean }> = () => {
  const [level, setLevel] = useState<Level>('easy');
  const [q, setQ] = useState(() => generate('easy'));
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [asked, setAsked] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME);
  const [done, setDone] = useState(false);
  const [feedback, setFeedback] = useState<string>('Good luck!');
  const inputRef = useRef<HTMLInputElement>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const reset = useCallback((l: Level = level) => {
    setLevel(l);
    setQ(generate(l));
    setInput('');
    setScore(0);
    setAsked(0);
    setTimeLeft(TIME);
    setDone(false);
    setFeedback('Good luck!');
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [level]);

  useEffect(() => {
    if (done) return;
    tickRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (tickRef.current) clearInterval(tickRef.current);
          setDone(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [done]);

  const submit = () => {
    if (done) return;
    const val = parseInt(input, 10);
    const correct = val === q.answer;
    setScore((s) => s + (correct ? 1 : 0));
    setAsked((n) => n + 1);
    setFeedback(correct ? '✓ Correct!' : `✗ ${q.a} ${q.op} ${q.b} = ${q.answer}`);
    setInput('');
    if (asked + 1 >= QUESTIONS) {
      setDone(true);
    } else {
      setQ(generate(level));
    }
  };

  const tone: StatusTone = done ? 'success' : 'info';

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex gap-2">
        {(['easy', 'medium', 'hard'] as Level[]).map((l) => (
          <button
            key={l}
            onClick={() => reset(l)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
              level === l ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      <StatusBar tone={tone}>
        {done
          ? `Quiz complete — ${score}/${QUESTIONS}`
          : `Question ${asked + 1}/${QUESTIONS} · Score ${score} · Time ${timeLeft}s`}
      </StatusBar>

      <div className="relative w-full max-w-md p-6 rounded-2xl bg-white border border-gray-200 shadow-lg text-center">
        <div className="text-5xl font-extrabold text-gray-900 mb-4">
          {q.a} {q.op} {q.b} = ?
        </div>
        <input
          ref={inputRef}
          type="number"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          disabled={done}
          placeholder="Your answer"
          className="w-40 text-center px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:outline-none text-xl font-bold"
        />
        <div className="mt-3 text-sm text-gray-600">{feedback}</div>
        <button
          onClick={submit}
          disabled={done || !input}
          className="mt-4 px-5 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold shadow hover:brightness-110 active:scale-95 disabled:opacity-50"
        >
          Submit
        </button>
        {done && (
          <WinOverlay
            title={`${score}/${QUESTIONS} correct`}
            subtitle={score === QUESTIONS ? 'Perfect score!' : 'Nice work — try again?'}
            onPlayAgain={() => reset(level)}
            playAgainLabel="New quiz"
          />
        )}
      </div>

      <p className="text-xs md:text-sm text-gray-500 max-w-md text-center">
        Answer 10 quick math questions before time runs out.
      </p>
    </div>
  );
};

export default MathQuiz;
