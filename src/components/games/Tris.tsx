import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Trophy, Sparkles } from 'lucide-react';
import { TrisBoard } from '../../types/games';

interface TrisProps {
  isBotEnabled: boolean;
}

type Cell = 'X' | 'O' | null;

const WINNING_COMBINATIONS: Array<[number, number, number]> = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6],             // diagonals
];

const checkWinnerWithLine = (
  squares: Cell[],
): { winner: 'X' | 'O' | 'tie' | null; line: number[] | null } => {
  for (const combo of WINNING_COMBINATIONS) {
    const [a, b, c] = combo;
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a] as 'X' | 'O', line: combo };
    }
  }
  if (squares.every((s) => s !== null)) return { winner: 'tie', line: null };
  return { winner: null, line: null };
};

const Tris: React.FC<TrisProps> = ({ isBotEnabled }) => {
  const [board, setBoard] = useState<TrisBoard>({
    squares: Array(9).fill(null),
    currentPlayer: 'X',
    winner: null,
  });
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [scores, setScores] = useState({ X: 0, O: 0, ties: 0 });
  const [lastMove, setLastMove] = useState<number | null>(null);
  const botTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkWinner = useCallback(
    (squares: Cell[]): 'X' | 'O' | 'tie' | null =>
      checkWinnerWithLine(squares).winner,
    [],
  );

  const getBestMove = useCallback(
    (squares: Cell[]): number => {
      const available = squares
        .map((s, i) => (s === null ? i : null))
        .filter((v): v is number => v !== null);

      for (const move of available) {
        const test = [...squares];
        test[move] = 'O';
        if (checkWinner(test) === 'O') return move;
      }
      for (const move of available) {
        const test = [...squares];
        test[move] = 'X';
        if (checkWinner(test) === 'X') return move;
      }
      if (squares[4] === null) return 4;
      const corners = [0, 2, 6, 8].filter((c) => squares[c] === null);
      if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
      return available[Math.floor(Math.random() * available.length)];
    },
    [checkWinner],
  );

  const applyMove = useCallback(
    (index: number, player: 'X' | 'O') => {
      const newSquares = [...board.squares];
      newSquares[index] = player;
      const result = checkWinnerWithLine(newSquares);

      setBoard({
        squares: newSquares,
        currentPlayer: player === 'X' ? 'O' : 'X',
        winner: result.winner,
      });
      setWinningLine(result.line);
      setLastMove(index);

      if (result.winner === 'X') setScores((s) => ({ ...s, X: s.X + 1 }));
      else if (result.winner === 'O') setScores((s) => ({ ...s, O: s.O + 1 }));
      else if (result.winner === 'tie') setScores((s) => ({ ...s, ties: s.ties + 1 }));
    },
    [board.squares],
  );

  useEffect(() => {
    if (board.currentPlayer === 'O' && isBotEnabled && !board.winner) {
      botTimeoutRef.current = setTimeout(() => {
        const move = getBestMove(board.squares);
        if (move !== undefined) applyMove(move, 'O');
      }, 500);
    }
    return () => {
      if (botTimeoutRef.current) clearTimeout(botTimeoutRef.current);
    };
  }, [board.currentPlayer, board.winner, board.squares, isBotEnabled, getBestMove, applyMove]);

  const handleSquareClick = (index: number) => {
    if (board.squares[index] || board.winner) return;
    if (isBotEnabled && board.currentPlayer === 'O') return;
    applyMove(index, board.currentPlayer);
  };

  const playAgain = () => {
    setBoard({ squares: Array(9).fill(null), currentPlayer: 'X', winner: null });
    setWinningLine(null);
    setLastMove(null);
  };

  const isBotTurn = isBotEnabled && board.currentPlayer === 'O' && !board.winner;

  return (
    <div className="flex flex-col items-center gap-6 md:gap-8">
      {/* Scoreboard + turn */}
      <div className="w-full max-w-md flex items-center justify-between gap-3">
        <PlayerChip
          label={isBotEnabled ? 'You' : 'Player 1'}
          mark="X"
          score={scores.X}
          active={!board.winner && board.currentPlayer === 'X'}
          color="blue"
        />
        <div className="text-xs font-semibold text-gray-400">
          {scores.ties > 0 ? `Ties: ${scores.ties}` : 'VS'}
        </div>
        <PlayerChip
          label={isBotEnabled ? 'Bot' : 'Player 2'}
          mark="O"
          score={scores.O}
          active={!board.winner && board.currentPlayer === 'O'}
          color="rose"
        />
      </div>

      {/* Status strip */}
      <div
        className={`text-sm md:text-base font-medium px-4 py-2 rounded-full border ${
          board.winner
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : isBotTurn
              ? 'bg-purple-50 text-purple-700 border-purple-200'
              : 'bg-gray-50 text-gray-600 border-gray-200'
        }`}
        aria-live="polite"
      >
        {board.winner === 'tie'
          ? "It's a tie! Well played."
          : board.winner
            ? `${board.winner} wins the round!`
            : isBotTurn
              ? 'Bot is thinking…'
              : `It's ${board.currentPlayer}'s turn`}
      </div>

      {/* Board */}
      <div className="relative">
        <div className="grid grid-cols-3 gap-2 md:gap-3 p-3 md:p-4 rounded-2xl bg-gradient-to-br from-indigo-100 to-blue-100 shadow-inner">
          {board.squares.map((square, index) => {
            const isWinning = winningLine?.includes(index) ?? false;
            const isLast = lastMove === index;
            const clickable = !square && !board.winner && !isBotTurn;
            return (
              <button
                key={index}
                onClick={() => handleSquareClick(index)}
                disabled={!clickable}
                aria-label={`Square ${index + 1}${square ? `, ${square}` : ', empty'}`}
                className={`relative w-20 h-20 md:w-24 md:h-24 rounded-xl bg-white shadow-sm flex items-center justify-center text-5xl md:text-6xl font-extrabold transition-all duration-200
                  ${clickable ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:scale-95' : 'cursor-default'}
                  ${isWinning ? 'ring-4 ring-emerald-400 bg-emerald-50' : ''}
                  ${isLast && !isWinning ? 'ring-2 ring-blue-200' : ''}
                `}
              >
                {square && (
                  <span
                    className={`inline-block animate-pop ${
                      square === 'X' ? 'text-blue-500' : 'text-rose-500'
                    }`}
                  >
                    {square}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Win overlay */}
        {board.winner && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="pointer-events-auto bg-white/95 backdrop-blur rounded-2xl shadow-xl border border-gray-200 px-6 py-5 text-center animate-fadeIn">
              <div className="flex items-center justify-center gap-2 text-amber-500 mb-1">
                <Sparkles className="w-5 h-5" />
                <Trophy className="w-6 h-6" />
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="text-xl font-bold text-gray-900">
                {board.winner === 'tie' ? "It's a tie!" : `${board.winner} wins!`}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {board.winner === 'tie' ? 'Try again?' : 'Nice moves.'}
              </p>
              <button
                onClick={playAgain}
                className="mt-3 inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-semibold shadow hover:brightness-110 active:scale-95 transition"
              >
                Play again
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pop {
          0% { transform: scale(0.4); opacity: 0; }
          60% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-pop { animation: pop 220ms ease-out; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 200ms ease-out; }
      `}</style>
    </div>
  );
};

interface PlayerChipProps {
  label: string;
  mark: 'X' | 'O';
  score: number;
  active: boolean;
  color: 'blue' | 'rose';
}

const PlayerChip: React.FC<PlayerChipProps> = ({ label, mark, score, active, color }) => {
  const colorClasses =
    color === 'blue'
      ? 'from-blue-500 to-indigo-500'
      : 'from-rose-500 to-pink-500';
  return (
    <div
      className={`flex-1 flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
        active
          ? 'bg-white border-gray-300 shadow-md ring-2 ring-offset-1 ring-blue-200'
          : 'bg-white/70 border-gray-200 opacity-80'
      }`}
    >
      <div
        className={`w-9 h-9 rounded-lg bg-gradient-to-br ${colorClasses} text-white flex items-center justify-center font-extrabold shadow-sm`}
      >
        {mark}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-gray-500 truncate">{label}</div>
        <div className="text-sm font-bold text-gray-800">Wins: {score}</div>
      </div>
    </div>
  );
};

export default Tris;
