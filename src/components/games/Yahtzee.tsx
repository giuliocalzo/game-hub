import React, { useCallback, useState } from 'react';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from 'lucide-react';
import StatusBar, { StatusTone } from '../shared/StatusBar';
import WinOverlay from '../shared/WinOverlay';

type Dice = [number, number, number, number, number];

const DIE_ICONS = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];

type Category =
  | 'ones' | 'twos' | 'threes' | 'fours' | 'fives' | 'sixes'
  | 'threeKind' | 'fourKind' | 'fullHouse' | 'smallStr' | 'largeStr' | 'yahtzee' | 'chance';

const CATEGORIES: Array<{ id: Category; label: string; hint: string }> = [
  { id: 'ones', label: 'Ones', hint: 'Sum of 1s' },
  { id: 'twos', label: 'Twos', hint: 'Sum of 2s' },
  { id: 'threes', label: 'Threes', hint: 'Sum of 3s' },
  { id: 'fours', label: 'Fours', hint: 'Sum of 4s' },
  { id: 'fives', label: 'Fives', hint: 'Sum of 5s' },
  { id: 'sixes', label: 'Sixes', hint: 'Sum of 6s' },
  { id: 'threeKind', label: '3 of a kind', hint: 'Sum of all' },
  { id: 'fourKind', label: '4 of a kind', hint: 'Sum of all' },
  { id: 'fullHouse', label: 'Full house', hint: '25 pts' },
  { id: 'smallStr', label: 'Small straight', hint: '30 pts' },
  { id: 'largeStr', label: 'Large straight', hint: '40 pts' },
  { id: 'yahtzee', label: 'Yahtzee!', hint: '50 pts' },
  { id: 'chance', label: 'Chance', hint: 'Sum of all' },
];

const countOf = (d: Dice, v: number) => d.filter((x) => x === v).length;

const scoreFor = (cat: Category, d: Dice): number => {
  const sum = d.reduce((a, b) => a + b, 0);
  const counts = [1, 2, 3, 4, 5, 6].map((v) => countOf(d, v));
  const sorted = [...d].sort((a, b) => a - b);
  const distinct = Array.from(new Set(sorted));
  const hasSeq = (n: number) => {
    for (let start = 1; start <= 7 - n; start++) {
      if (Array.from({ length: n }, (_, i) => start + i).every((v) => distinct.includes(v))) return true;
    }
    return false;
  };
  switch (cat) {
    case 'ones': return countOf(d, 1) * 1;
    case 'twos': return countOf(d, 2) * 2;
    case 'threes': return countOf(d, 3) * 3;
    case 'fours': return countOf(d, 4) * 4;
    case 'fives': return countOf(d, 5) * 5;
    case 'sixes': return countOf(d, 6) * 6;
    case 'threeKind': return counts.some((n) => n >= 3) ? sum : 0;
    case 'fourKind': return counts.some((n) => n >= 4) ? sum : 0;
    case 'fullHouse': return counts.some((n) => n === 3) && counts.some((n) => n === 2) ? 25 : 0;
    case 'smallStr': return hasSeq(4) ? 30 : 0;
    case 'largeStr': return hasSeq(5) ? 40 : 0;
    case 'yahtzee': return counts.some((n) => n === 5) ? 50 : 0;
    case 'chance': return sum;
  }
};

const rollDice = (dice: Dice, keep: boolean[]): Dice =>
  dice.map((v, i) => (keep[i] ? v : Math.floor(Math.random() * 6) + 1)) as Dice;

const Yahtzee: React.FC<{ isBotEnabled: boolean }> = () => {
  const [dice, setDice] = useState<Dice>([1, 2, 3, 4, 5]);
  const [keep, setKeep] = useState<boolean[]>([false, false, false, false, false]);
  const [rolls, setRolls] = useState(3);
  const [rolledThisTurn, setRolledThisTurn] = useState(false);
  const [scores, setScores] = useState<Partial<Record<Category, number>>>({});

  const total = Object.values(scores).reduce((a, b) => a + (b ?? 0), 0);
  const done = Object.keys(scores).length === CATEGORIES.length;

  const reset = () => {
    setDice([1, 2, 3, 4, 5]);
    setKeep([false, false, false, false, false]);
    setRolls(3);
    setRolledThisTurn(false);
    setScores({});
  };

  const roll = useCallback(() => {
    if (done || rolls === 0) return;
    setDice((d) => rollDice(d, keep));
    setRolls((r) => r - 1);
    setRolledThisTurn(true);
  }, [done, rolls, keep]);

  const pick = (cat: Category) => {
    if (done || scores[cat] !== undefined || !rolledThisTurn) return;
    const pts = scoreFor(cat, dice);
    setScores((s) => ({ ...s, [cat]: pts }));
    setKeep([false, false, false, false, false]);
    setRolls(3);
    setRolledThisTurn(false);
    setDice([1, 2, 3, 4, 5]);
  };

  const tone: StatusTone = done ? 'success' : 'info';

  return (
    <div className="flex flex-col items-center gap-5">
      <StatusBar tone={tone}>
        {done
          ? `Total: ${total}`
          : `Rolls left: ${rolls} · Total so far: ${total}`}
      </StatusBar>

      <div className="flex gap-2">
        {dice.map((v, i) => {
          const Icon = DIE_ICONS[v - 1];
          return (
            <button
              key={i}
              onClick={() => rolledThisTurn && setKeep((k) => k.map((x, j) => (j === i ? !x : x)))}
              disabled={!rolledThisTurn}
              className={`w-14 h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center border-2 transition ${
                keep[i]
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 bg-white hover:border-blue-300'
              }`}
              aria-label={`Die ${i + 1} showing ${v}${keep[i] ? ', kept' : ''}`}
            >
              <Icon className="w-10 h-10 text-gray-800" />
            </button>
          );
        })}
      </div>

      <button
        onClick={roll}
        disabled={rolls === 0 || done}
        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold shadow hover:brightness-110 active:scale-95 disabled:opacity-50"
      >
        Roll {rolls > 0 ? `(${rolls} left)` : ''}
      </button>

      <div className="grid grid-cols-2 gap-2 w-full max-w-xl">
        {CATEGORIES.map((c) => {
          const filled = scores[c.id] !== undefined;
          const preview = rolledThisTurn && !filled ? scoreFor(c.id, dice) : null;
          return (
            <button
              key={c.id}
              onClick={() => pick(c.id)}
              disabled={filled || !rolledThisTurn || done}
              className={`flex items-center justify-between px-3 py-2 rounded-lg border text-sm transition ${
                filled
                  ? 'bg-gray-100 border-gray-200 text-gray-500'
                  : rolledThisTurn
                    ? 'bg-white border-gray-200 hover:border-blue-300 text-gray-800'
                    : 'bg-white border-gray-200 text-gray-400'
              }`}
            >
              <span>
                <span className="font-semibold">{c.label}</span>
                <span className="text-gray-400 ml-1 text-xs">{c.hint}</span>
              </span>
              <span className="font-bold">
                {filled ? scores[c.id] : preview !== null ? `+${preview}` : '—'}
              </span>
            </button>
          );
        })}
      </div>

      {done && (
        <WinOverlay
          title={`Total: ${total}`}
          subtitle={total >= 200 ? 'Amazing game!' : 'Try again for a higher score.'}
          onPlayAgain={reset}
          playAgainLabel="New game"
        />
      )}

      <p className="text-xs md:text-sm text-gray-500 max-w-md text-center">
        Roll up to 3 times per turn. Keep dice by tapping them. Pick a category to score.
      </p>
    </div>
  );
};

export default Yahtzee;
