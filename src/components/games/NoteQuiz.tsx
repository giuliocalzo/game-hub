import React, { useCallback, useEffect, useState } from 'react';
import StatusBar, { StatusTone } from '../shared/StatusBar';
import WinOverlay from '../shared/WinOverlay';
import { noteFreq, playTone } from './audio';

// Treble-clef notes on or near the staff.
// The staff lines top-to-bottom are F5 E5 D5 C5 B4 A4 G4 F4 E4 (alternating line/space).
// We'll enumerate a set of common notes with their vertical step index.
// Step 0 is E4 (bottom line); each step = one staff position (line or space).
// Note value mapping: C D E F G A B, C=0 etc. Compute step from octave+note.

const ALL_NOTES: Array<{ name: string; note: string }> = [];
const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
for (const oct of [4, 5]) {
  for (const l of LETTERS) {
    ALL_NOTES.push({ name: `${l}${oct}`, note: `${l}${oct}` });
  }
}
// Add C6
ALL_NOTES.push({ name: 'C6', note: 'C6' });

// Compute staff step: E4 = 0. Each staff position (line/space) = 1 step.
// Letters C and D come after B in the scientific notation octave, so they
// belong to the previous scientific octave relative to E.
const stepOf = (note: string): number => {
  const letter = note[0];
  const oct = parseInt(note.slice(1), 10);
  const order = ['E', 'F', 'G', 'A', 'B', 'C', 'D'];
  const idx = order.indexOf(letter);
  const effectiveOct = letter === 'C' || letter === 'D' ? oct - 1 : oct;
  return (effectiveOct - 4) * 7 + idx;
};

const TOTAL = 10;

const pickNote = (): typeof ALL_NOTES[number] => {
  // Limit to notes within a reasonable range: E4 to A5
  const subset = ALL_NOTES.filter((n) => {
    const s = stepOf(n.note);
    return s >= 0 && s <= 12;
  });
  return subset[Math.floor(Math.random() * subset.length)];
};

const buildOptions = (correct: string): string[] => {
  const set = new Set<string>([correct]);
  while (set.size < 4) {
    const letter = LETTERS[Math.floor(Math.random() * LETTERS.length)];
    const oct = Math.random() < 0.5 ? 4 : 5;
    set.add(`${letter}${oct}`);
  }
  return Array.from(set).sort(() => Math.random() - 0.5);
};

const NoteQuiz: React.FC<{ isBotEnabled: boolean }> = () => {
  const [note, setNote] = useState(() => pickNote());
  const [options, setOptions] = useState<string[]>(() => buildOptions(note.name));
  const [asked, setAsked] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<{ ok: boolean; pick: string } | null>(null);
  const [done, setDone] = useState(false);

  const nextRound = useCallback(() => {
    const n = pickNote();
    setNote(n);
    setOptions(buildOptions(n.name));
    setFeedback(null);
  }, []);

  const reset = useCallback(() => {
    setAsked(0);
    setScore(0);
    setDone(false);
    nextRound();
  }, [nextRound]);

  useEffect(() => {
    // Play the new note
    playTone(noteFreq(note.note), 500, 'triangle', 0.15);
  }, [note]);

  const pick = (opt: string) => {
    if (feedback || done) return;
    const correct = opt === note.name;
    setFeedback({ ok: correct, pick: opt });
    if (correct) setScore((s) => s + 1);
    setTimeout(() => {
      if (asked + 1 >= TOTAL) {
        setDone(true);
      } else {
        setAsked((n) => n + 1);
        nextRound();
      }
    }, 900);
  };

  const replay = () => playTone(noteFreq(note.note), 500, 'triangle', 0.15);

  const step = stepOf(note.note);
  // Line/space y coordinate on the staff. Bottom line (E4, step 0) at y = 120. Each step = 10px upward.
  const y = 120 - step * 10;
  // Staff lines at steps 0, 2, 4, 6, 8 (E, G, B, D, F)
  const ledgerLines: number[] = [];
  if (step > 8) for (let s = 10; s <= step; s += 2) ledgerLines.push(120 - s * 10);
  if (step < 0) for (let s = -2; s >= step; s -= 2) ledgerLines.push(120 - s * 10);

  const tone: StatusTone = done ? 'success' : 'info';

  return (
    <div className="flex flex-col items-center gap-4">
      <StatusBar tone={tone}>
        {done
          ? `Round complete — ${score}/${TOTAL}`
          : `Note ${asked + 1}/${TOTAL} · Score ${score}`}
      </StatusBar>

      <div className="relative w-full max-w-md p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl flex flex-col items-center gap-4">
        <svg viewBox="0 0 320 180" className="w-full" style={{ aspectRatio: '320 / 180' }}>
          {/* Staff lines */}
          {[0, 2, 4, 6, 8].map((s) => (
            <line key={s} x1={10} y1={120 - s * 10} x2={310} y2={120 - s * 10} stroke="#0f172a" strokeWidth={1.5} />
          ))}
          {/* Simple G-clef placeholder */}
          <text x={20} y={130} fontSize={80} fontFamily="serif" fill="#0f172a">
            𝄞
          </text>
          {/* Ledger lines */}
          {ledgerLines.map((ly, i) => (
            <line key={i} x1={170} y1={ly} x2={210} y2={ly} stroke="#0f172a" strokeWidth={1.5} />
          ))}
          {/* Note head */}
          <ellipse cx={190} cy={y} rx={10} ry={7} fill="#0f172a" transform={`rotate(-20 190 ${y})`} />
          {/* Stem */}
          {step < 6 ? (
            <line x1={199} y1={y} x2={199} y2={y - 40} stroke="#0f172a" strokeWidth={2} />
          ) : (
            <line x1={181} y1={y} x2={181} y2={y + 40} stroke="#0f172a" strokeWidth={2} />
          )}
        </svg>

        <button
          onClick={replay}
          className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          🔊 Replay
        </button>

        <div className="grid grid-cols-2 gap-2 w-full">
          {options.map((opt) => {
            const isPicked = feedback?.pick === opt;
            const isCorrect = feedback && opt === note.name;
            return (
              <button
                key={opt}
                onClick={() => pick(opt)}
                disabled={!!feedback || done}
                className={`py-3 rounded-xl text-xl font-extrabold border-2 transition ${
                  feedback
                    ? isCorrect
                      ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-200 border-emerald-300 dark:border-emerald-500/40'
                      : isPicked
                      ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-200 border-rose-300 dark:border-rose-500/40'
                      : 'bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700'
                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10'
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {done && (
          <WinOverlay
            title={`${score}/${TOTAL}`}
            subtitle={score === TOTAL ? 'Perfect pitch!' : 'Keep reading the staff'}
            onPlayAgain={reset}
            playAgainLabel="New round"
          />
        )}
      </div>
    </div>
  );
};

export default NoteQuiz;
