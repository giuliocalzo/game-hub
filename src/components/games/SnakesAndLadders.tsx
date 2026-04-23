import React, { useState, useCallback } from 'react';
import { Dice6 } from 'lucide-react';
import { SnakesAndLaddersPlayer } from '../../types/games';
import StatusBar from '../shared/StatusBar';
import WinOverlay from '../shared/WinOverlay';

interface SnakesAndLaddersProps {
  isBotEnabled: boolean;
}

const SnakesAndLadders: React.FC<SnakesAndLaddersProps> = ({ isBotEnabled }) => {
  const [players] = useState<SnakesAndLaddersPlayer[]>([
    { id: '1', name: 'Player 1', position: 1, color: 'bg-blue-500' },
    { id: '2', name: 'Bot Player', position: 1, color: 'bg-red-500' },
  ]);
  
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [gameBoard, setGameBoard] = useState<SnakesAndLaddersPlayer[]>(players);
  const [winner, setWinner] = useState<string | null>(null);

  // Snakes and Ladders positions (simplified)
  const snakes: Record<number, number> = {
    16: 6, 47: 26, 49: 11, 56: 53, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 98: 78
  };
  
  const ladders: Record<number, number> = {
    1: 38, 4: 14, 9: 21, 21: 42, 28: 84, 36: 44, 51: 67, 71: 91, 80: 100
  };

  const rollDice = useCallback(async () => {
    if (isRolling || winner) return;
    
    // Auto-roll for bot player
    if (isBotEnabled && currentPlayerIndex === 1) {
      // Add a small delay for bot moves
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setIsRolling(true);
    
    // Animate dice roll
    for (let i = 0; i < 10; i++) {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const finalDiceValue = Math.floor(Math.random() * 6) + 1;
    setDiceValue(finalDiceValue);
    
    // Move current player
    const currentPlayer = gameBoard[currentPlayerIndex];
    let newPosition = Math.min(currentPlayer.position + finalDiceValue, 100);
    
    // Check for snakes or ladders
    if (snakes[newPosition]) {
      newPosition = snakes[newPosition];
    } else if (ladders[newPosition]) {
      newPosition = ladders[newPosition];
    }
    
    const newGameBoard = [...gameBoard];
    newGameBoard[currentPlayerIndex] = { ...currentPlayer, position: newPosition };
    
    setGameBoard(newGameBoard);
    
    // Check for winner
    if (newPosition === 100) {
      setWinner(currentPlayer.name);
    } else {
      // Next player's turn
      setCurrentPlayerIndex((currentPlayerIndex + 1) % players.length);
    }
    
    setIsRolling(false);
  }, [isRolling, winner, gameBoard, currentPlayerIndex, players.length]);

  // Auto-roll for bot player
  React.useEffect(() => {
    if (isBotEnabled && currentPlayerIndex === 1 && !isRolling && !winner) {
      const timeout = setTimeout(() => {
        rollDice();
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [isBotEnabled, currentPlayerIndex, isRolling, winner, rollDice]);

  const getSquareContent = (squareNumber: number) => {
    const playersHere = gameBoard.filter(p => p.position === squareNumber);
    
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <span className="text-xs font-medium text-gray-700">{squareNumber}</span>
        {playersHere.map((player, index) => (
          <div
            key={player.id}
            className={`absolute w-3 h-3 rounded-full ${player.color} border border-white`}
            style={{
              top: `${index * 4 + 2}px`,
              right: `${index * 4 + 2}px`,
            }}
          />
        ))}
        {snakes[squareNumber] && (
          <div className="absolute top-0 left-0 w-full h-full bg-red-200 opacity-30 flex items-center justify-center">
            <span className="text-xs">🐍</span>
          </div>
        )}
        {ladders[squareNumber] && (
          <div className="absolute top-0 left-0 w-full h-full bg-green-200 opacity-30 flex items-center justify-center">
            <span className="text-xs">🪜</span>
          </div>
        )}
      </div>
    );
  };

  const getBoardSquares = () => {
    const squares = [];
    for (let row = 0; row < 10; row++) {
      const rowSquares = [];
      for (let col = 0; col < 10; col++) {
        const squareNumber = row % 2 === 0 
          ? (9 - row) * 10 + col + 1
          : (9 - row) * 10 + (9 - col) + 1;
        
        rowSquares.push(
          <div
            key={squareNumber}
            className={`w-8 h-8 border border-gray-300 relative ${
              (row + col) % 2 === 0 ? 'bg-amber-50' : 'bg-amber-100'
            }`}
          >
            {getSquareContent(squareNumber)}
          </div>
        );
      }
      squares.push(
        <div key={row} className="flex">
          {rowSquares}
        </div>
      );
    }
    return squares;
  };

  const activePlayerName = isBotEnabled && currentPlayerIndex === 1
    ? 'Bot Player'
    : gameBoard[currentPlayerIndex].name;

  return (
    <div className="flex flex-col items-center gap-5">
      <StatusBar tone={winner ? 'success' : isBotEnabled && currentPlayerIndex === 1 ? 'purple' : 'info'}>
        {winner ? `${winner} reached 100 — victory!` : `${activePlayerName}'s turn`}
      </StatusBar>

      <div className="flex items-center gap-4">
        <button
          onClick={rollDice}
          disabled={isRolling || !!winner || (isBotEnabled && currentPlayerIndex === 1)}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold shadow-md transition-all ${
            isRolling || winner || (isBotEnabled && currentPlayerIndex === 1)
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 active:scale-95'
          }`}
        >
          <Dice6 className={`w-5 h-5 ${isRolling ? 'animate-spin' : ''}`} />
          <span>Roll Dice</span>
        </button>

        {diceValue && (
          <div className="flex items-center justify-center w-14 h-14 bg-white border-2 border-emerald-200 rounded-xl text-3xl font-extrabold text-emerald-700 shadow-sm">
            {diceValue}
          </div>
        )}
      </div>

      <div className="relative">
        <div className="bg-white p-3 md:p-4 rounded-2xl shadow-lg border border-gray-200">
          <div className="grid grid-cols-1 gap-1">{getBoardSquares()}</div>
        </div>
        {winner && (
          <WinOverlay
            title={`${winner} wins!`}
            subtitle="First to 100 takes the crown."
          />
        )}
      </div>

      <div className="flex gap-4 flex-wrap justify-center">
        {gameBoard.map((player, index) => {
          const label = isBotEnabled && index === 1 ? 'Bot Player' : player.name;
          const isActive = index === currentPlayerIndex && !winner;
          return (
            <div
              key={player.id}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${
                isActive
                  ? 'bg-white border-blue-300 shadow ring-2 ring-blue-100'
                  : 'bg-white/70 border-gray-200'
              }`}
            >
              <div className={`w-3.5 h-3.5 rounded-full ${player.color}`} />
              <span className="text-gray-700">
                {label}: <span className="font-bold">{player.position}</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SnakesAndLadders;