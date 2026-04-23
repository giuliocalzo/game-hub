import React, { useCallback, useEffect, useState } from 'react';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from 'lucide-react';
import StatusBar, { StatusTone } from '../shared/StatusBar';
import WinOverlay from '../shared/WinOverlay';

const TARGET = 100;

interface PigProps {
  isBotEnabled: boolean;
}

type Player = 0 | 1;

const Pig: React.FC<PigProps> = ({ isBotEnabled }) => {
  const [scores, setScores] = useState<[number, number]>([0, 0]);
  const [turnTotal, setTurnTotal] = useState(0);
  const [current, setCurrent] = useState<Player>(0);
  const [die, setDie] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);
  const [winner, setWinner] = useState<Player | null>(null);
  const [message, setMessage] = useState<string>('Good luck!');

  const reset = () => {
    setScores([0, 0]);
    setTurnTotal(0);
    setCurrent(0);
    setDie(null);
    setWinner(null);
    setMessage('Good luck!');
  };

  const rollDie = useCallback(
    (player: Player) => {
      if (winner || rolling) return;
      setRolling(true);
      let n = 0;
      const anim = setInterval(() => {
        setDie(Math.floor(Math.random() * 6) + 1);
        n++;
        if (n >= 8) {
          clearInterval(anim);
          const value = Math.floor(Math.random() * 6) + 1;
          setDie(value);
          setRolling(false);
          if (value === 1) {
            setTurnTotal(0);
            const other: Player = player === 0 ? 1 : 0;
            setCurrent(other);
            setMessage('Rolled a 1 — turn over!');
          } else {
            setTurnTotal((t) => t + value);
            setMessage(`Nice! +${value}. Bank it or keep rolling?`);
          }
        }
      }, 70);
    },
    [winner, rolling],
  );

  const bank = useCallback(
    (player: Player) => {
      if (winner || rolling) return;
      const newScore = scores[player] + turnTotal;
      const nextScores: [number, number] = [...scores] as [number, number];
      nextScores[player] = newScore;
      setScores(nextScores);
      setTurnTotal(0);
      if (newScore >= TARGET) {
        setWinner(player);
        setMessage(`${player === 0 ? 'You' : 'Opponent'} banked ${newScore} — victory!`);
      } else {
        const other: Player = player === 0 ? 1 : 0;
        setCurrent(other);
        setMessage(`Banked ${newScore - scores[player]} points. Passing.`);
      }
    },
    [scores, turnTotal, winner, rolling],
  );

  // Bot for player 1
  useEffect(() => {
    if (!isBotEnabled || current !== 1 || winner || rolling) return;
    const t = setTimeout(() => {
      // Simple strategy: bank at 20 or when leading comfortably
      const botScore = scores[1];
      const humanScore = scores[0];
      const needToWin = TARGET - botScore;
      const shouldBank =
        turnTotal >= Math.min(20, needToWin) ||
        (turnTotal > 10 && botScore + turnTotal > humanScore + 15);
      if (shouldBank) bank(1);
      else rollDie(1);
    }, 800);
    return () => clearTimeout(t);
  }, [isBotEnabled, current, turnTotal, scores, winner, rolling, bank, rollDie]);

  const tone: StatusTone = winner
    ? 'success'
    : isBotEnabled && current === 1
      ? 'purple'
      : 'info';

  const youBlocked = isBotEnabled && current === 1 && !winner;

  const DieIcon = die
    ? [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6][die - 1]
    : null;

  return (
    <div className="flex flex-col items-center gap-5">
      <StatusBar tone={tone}>{message}</StatusBar>

      <div className="flex gap-3 w-full max-w-md">
        <PlayerCard
          label={isBotEnabled ? 'You' : 'Player 1'}
          total={scores[0]}
          live={current === 0 ? turnTotal : 0}
          active={current === 0 && !winner}
          tone="from-blue-500 to-indigo-500"
        />
        <PlayerCard
          label={isBotEnabled ? 'Bot' : 'Player 2'}
          total={scores[1]}
          live={current === 1 ? turnTotal : 0}
          active={current === 1 && !winner}
          tone="from-purple-500 to-pink-500"
        />
      </div>

      <div className="relative w-28 h-28 flex items-center justify-center rounded-2xl bg-white border border-gray-200 shadow-inner">
        {DieIcon ? (
          <DieIcon
            className={`w-20 h-20 text-gray-800 ${rolling ? 'animate-spin' : ''}`}
          />
        ) : (
          <span className="text-sm text-gray-400">Roll to start</span>
        )}
        {winner !== null && (
          <WinOverlay
            title={`${winner === 0 ? (isBotEnabled ? 'You win!' : 'Player 1 wins!') : (isBotEnabled ? 'Bot wins' : 'Player 2 wins')}`}
            subtitle={`Final: ${scores[0]} – ${scores[1]}`}
            onPlayAgain={reset}
          />
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => rollDie(current)}
          disabled={rolling || winner !== null || youBlocked}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold shadow hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Roll
        </button>
        <button
          onClick={() => bank(current)}
          disabled={rolling || turnTotal === 0 || winner !== null || youBlocked}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold shadow hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Bank {turnTotal > 0 ? `(+${turnTotal})` : ''}
        </button>
      </div>

      <p className="text-xs md:text-sm text-gray-500 max-w-md text-center">
        Roll to add to your turn total. Bank to lock it in. Roll a 1 and lose your turn. First to 100 wins!
      </p>
    </div>
  );
};

const PlayerCard: React.FC<{
  label: string;
  total: number;
  live: number;
  active: boolean;
  tone: string;
}> = ({ label, total, live, active, tone }) => (
  <div
    className={`flex-1 rounded-2xl p-3 border-2 transition-all ${
      active ? 'border-blue-300 shadow ring-2 ring-blue-100 bg-white' : 'border-gray-200 bg-white/70'
    }`}
  >
    <div className={`text-xs font-semibold bg-gradient-to-r ${tone} bg-clip-text text-transparent`}>
      {label}
    </div>
    <div className="text-3xl font-extrabold text-gray-900 mt-1">{total}</div>
    <div className="text-xs text-gray-500">
      this turn: <span className="font-semibold text-gray-700">{live}</span>
    </div>
  </div>
);

export default Pig;
