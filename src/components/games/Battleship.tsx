import React, { useCallback, useEffect, useMemo, useState } from 'react';
import StatusBar, { StatusTone } from '../shared/StatusBar';
import WinOverlay from '../shared/WinOverlay';

const SIZE = 8;
type Cell = 'water' | 'ship';
type Shot = 'miss' | 'hit' | null;

const SHIP_LENGTHS = [4, 3, 3, 2];

type Board = {
  cells: Cell[][];
  shots: Shot[][];
  ships: Array<{ cells: Array<[number, number]>; sunk: boolean }>;
};

const empty = (): Board => ({
  cells: Array.from({ length: SIZE }, () => Array<Cell>(SIZE).fill('water')),
  shots: Array.from({ length: SIZE }, () => Array<Shot>(SIZE).fill(null)),
  ships: [],
});

const placeRandomly = (): Board => {
  const b = empty();
  for (const len of SHIP_LENGTHS) {
    for (let attempt = 0; attempt < 200; attempt++) {
      const horiz = Math.random() < 0.5;
      const r = Math.floor(Math.random() * (horiz ? SIZE : SIZE - len + 1));
      const c = Math.floor(Math.random() * (horiz ? SIZE - len + 1 : SIZE));
      const cells: Array<[number, number]> = [];
      let ok = true;
      for (let i = 0; i < len; i++) {
        const rr = r + (horiz ? 0 : i);
        const cc = c + (horiz ? i : 0);
        if (b.cells[rr][cc] !== 'water') { ok = false; break; }
        cells.push([rr, cc]);
      }
      if (!ok) continue;
      for (const [rr, cc] of cells) b.cells[rr][cc] = 'ship';
      b.ships.push({ cells, sunk: false });
      break;
    }
  }
  return b;
};

const checkSunk = (b: Board): Board => {
  const shots = b.shots;
  const ships = b.ships.map((s) => ({
    ...s,
    sunk: s.cells.every(([r, c]) => shots[r][c] === 'hit'),
  }));
  return { ...b, ships };
};

const allSunk = (b: Board) => b.ships.every((s) => s.sunk);

const Battleship: React.FC<{ isBotEnabled: boolean }> = ({ isBotEnabled }) => {
  const [you, setYou] = useState<Board>(() => placeRandomly());
  const [bot, setBot] = useState<Board>(() => placeRandomly());
  const [turn, setTurn] = useState<'you' | 'bot'>('you');
  const [winner, setWinner] = useState<'you' | 'bot' | null>(null);
  const [message, setMessage] = useState<string>(isBotEnabled ? 'Fire at will — click a square.' : 'Player 1: fire at opponent\'s board.');

  const reset = () => {
    setYou(placeRandomly());
    setBot(placeRandomly());
    setTurn('you');
    setWinner(null);
    setMessage('Fire at will — click a square.');
  };

  const fireAt = useCallback(
    (target: 'you' | 'bot', r: number, c: number) => {
      if (winner) return;
      const board = target === 'bot' ? bot : you;
      if (board.shots[r][c]) return;
      const next: Board = {
        ...board,
        shots: board.shots.map((row, rr) => row.map((v, cc) => (rr === r && cc === c ? (board.cells[r][c] === 'ship' ? 'hit' : 'miss') : v))),
      };
      const hit = next.shots[r][c] === 'hit';
      const updated = checkSunk(next);
      if (target === 'bot') setBot(updated);
      else setYou(updated);

      if (allSunk(updated)) {
        setWinner(target === 'bot' ? 'you' : 'bot');
        setMessage(target === 'bot' ? (isBotEnabled ? 'You sank the fleet!' : 'Player wins!') : 'Bot sank your fleet.');
        return;
      }

      if (!hit) setTurn(target === 'bot' ? 'bot' : 'you');
      setMessage(hit ? 'Hit! Fire again.' : 'Miss.');
    },
    [bot, you, winner, isBotEnabled],
  );

  // Bot fires at you
  useEffect(() => {
    if (turn !== 'bot' || winner) return;
    const t = setTimeout(() => {
      // Hunt & target: if any un-sunk hit, fire adjacent unknown
      const targets: Array<[number, number]> = [];
      for (let r = 0; r < SIZE; r++)
        for (let c = 0; c < SIZE; c++)
          if (you.shots[r][c] === 'hit') {
            const hitShip = you.ships.find((s) => s.cells.some(([sr, sc]) => sr === r && sc === c));
            if (hitShip && !hitShip.sunk) {
              for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
                const nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && you.shots[nr][nc] === null)
                  targets.push([nr, nc]);
              }
            }
          }
      let pick: [number, number];
      if (targets.length) {
        pick = targets[Math.floor(Math.random() * targets.length)];
      } else {
        const candidates: Array<[number, number]> = [];
        for (let r = 0; r < SIZE; r++)
          for (let c = 0; c < SIZE; c++)
            if (you.shots[r][c] === null && (r + c) % 2 === 0) candidates.push([r, c]);
        if (!candidates.length) {
          for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++)
            if (you.shots[r][c] === null) candidates.push([r, c]);
        }
        pick = candidates[Math.floor(Math.random() * candidates.length)];
      }
      fireAt('you', pick[0], pick[1]);
    }, 700);
    return () => clearTimeout(t);
  }, [turn, winner, you, fireAt]);

  const tone: StatusTone = winner ? 'success' : turn === 'bot' ? 'purple' : 'info';

  const counts = useMemo(() => ({
    youRemaining: you.ships.reduce((a, s) => a + (s.sunk ? 0 : 1), 0),
    botRemaining: bot.ships.reduce((a, s) => a + (s.sunk ? 0 : 1), 0),
  }), [you, bot]);

  return (
    <div className="flex flex-col items-center gap-5">
      <StatusBar tone={tone}>{message}</StatusBar>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        <MiniBoard
          title={isBotEnabled ? "Opponent's waters" : "Player 2's waters"}
          board={bot}
          hideShips
          onFire={(r, c) => turn === 'you' && !winner && fireAt('bot', r, c)}
          remaining={counts.botRemaining}
        />
        <MiniBoard
          title="Your fleet"
          board={you}
          hideShips={false}
          remaining={counts.youRemaining}
        />
      </div>

      {winner && (
        <WinOverlay
          title={winner === 'you' ? 'Victory!' : 'Fleet lost'}
          subtitle={winner === 'you' ? 'You sank every ship.' : 'The bot sank your fleet.'}
          onPlayAgain={reset}
        />
      )}

    </div>
  );
};

const MiniBoard: React.FC<{
  title: string;
  board: Board;
  hideShips: boolean;
  onFire?: (r: number, c: number) => void;
  remaining: number;
}> = ({ title, board, hideShips, onFire, remaining }) => (
  <div>
    <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center justify-between">
      <span>{title}</span>
      <span className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">Ships left: {remaining}</span>
    </div>
    <div
      className="grid p-1 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600"
      style={{ gridTemplateColumns: `repeat(${SIZE}, 1.8rem)`, gap: 2 }}
    >
      {board.cells.map((row, r) =>
        row.map((cell, c) => {
          const shot = board.shots[r][c];
          const showShip = !hideShips && cell === 'ship';
          return (
            <button
              key={`${r}-${c}`}
              onClick={() => onFire?.(r, c)}
              disabled={!!shot || !onFire}
              className={`w-[1.8rem] h-[1.8rem] rounded flex items-center justify-center text-sm font-bold ${
                shot === 'hit'
                  ? 'bg-rose-500 text-white'
                  : shot === 'miss'
                    ? 'bg-white/60 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400 dark:text-gray-500'
                    : showShip
                      ? 'bg-gray-700'
                      : 'bg-blue-400/80 hover:bg-blue-300'
              }`}
            >
              {shot === 'hit' ? '✕' : shot === 'miss' ? '·' : ''}
            </button>
          );
        }),
      )}
    </div>
  </div>
);

export default Battleship;
