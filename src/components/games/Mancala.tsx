import React, { useCallback, useEffect, useState } from 'react';
import StatusBar, { StatusTone } from '../shared/StatusBar';
import WinOverlay from '../shared/WinOverlay';

// Kalah rules.
// Board layout:
//   0..5 → Player 0's pits (left to right from their side)
//   6    → Player 0's store (right side)
//   7..12 → Player 1's pits (right to left from their side, so 7 is opposite of 5)
//   13   → Player 1's store (left side)

type Player = 0 | 1;

interface State {
  pits: number[]; // length 14
  current: Player;
  winner: Player | 'tie' | null;
}

const START_STONES = 4;

const init = (): State => ({
  pits: [
    START_STONES, START_STONES, START_STONES, START_STONES, START_STONES, START_STONES, 0,
    START_STONES, START_STONES, START_STONES, START_STONES, START_STONES, START_STONES, 0,
  ],
  current: 0,
  winner: null,
});

const STORE = [6, 13] as const;

const makeMove = (state: State, pit: number): State | null => {
  if (state.winner !== null) return null;
  const owner: Player = pit <= 5 ? 0 : pit >= 7 && pit <= 12 ? 1 : -1 as unknown as Player;
  if (owner !== state.current) return null;
  if (state.pits[pit] === 0) return null;

  const pits = state.pits.slice();
  let stones = pits[pit];
  pits[pit] = 0;
  let idx = pit;
  while (stones > 0) {
    idx = (idx + 1) % 14;
    // Skip opponent's store
    if (idx === STORE[state.current === 0 ? 1 : 0]) continue;
    pits[idx]++;
    stones--;
  }

  // Capture: last stone in own empty pit → capture opposite stones
  const ownPits = state.current === 0 ? [0, 1, 2, 3, 4, 5] : [7, 8, 9, 10, 11, 12];
  if (ownPits.includes(idx) && pits[idx] === 1) {
    const opposite = 12 - idx;
    if (pits[opposite] > 0) {
      pits[STORE[state.current]] += pits[opposite] + 1;
      pits[opposite] = 0;
      pits[idx] = 0;
    }
  }

  // Free turn if last stone in own store
  const bonus = idx === STORE[state.current];
  let next: Player = bonus ? state.current : (state.current === 0 ? 1 : 0);

  // Game over check: one side empty
  const p0Empty = pits.slice(0, 6).every((v) => v === 0);
  const p1Empty = pits.slice(7, 13).every((v) => v === 0);
  let winner: State['winner'] = null;
  if (p0Empty || p1Empty) {
    // Sweep remaining to owners' store
    if (!p0Empty) {
      for (let i = 0; i < 6; i++) {
        pits[6] += pits[i];
        pits[i] = 0;
      }
    }
    if (!p1Empty) {
      for (let i = 7; i < 13; i++) {
        pits[13] += pits[i];
        pits[i] = 0;
      }
    }
    if (pits[6] > pits[13]) winner = 0;
    else if (pits[13] > pits[6]) winner = 1;
    else winner = 'tie';
    next = state.current; // irrelevant
  }

  return { pits, current: next, winner };
};

const Mancala: React.FC<{ isBotEnabled: boolean }> = ({ isBotEnabled }) => {
  const [state, setState] = useState<State>(init);

  const play = useCallback(
    (pit: number) => {
      const res = makeMove(state, pit);
      if (res) setState(res);
    },
    [state],
  );

  // Bot
  useEffect(() => {
    if (!isBotEnabled || state.current !== 1 || state.winner !== null) return;
    const t = setTimeout(() => {
      // Greedy: prefer a move that lands in own store (free turn), then max capture, then max stones to store
      const options: Array<{ pit: number; gained: number; freeTurn: boolean }> = [];
      for (let p = 7; p <= 12; p++) {
        if (state.pits[p] === 0) continue;
        const next = makeMove(state, p);
        if (!next) continue;
        const gained = next.pits[13] - state.pits[13];
        const freeTurn = next.current === 1;
        options.push({ pit: p, gained, freeTurn });
      }
      if (!options.length) return;
      options.sort((a, b) => {
        if (a.freeTurn !== b.freeTurn) return a.freeTurn ? -1 : 1;
        return b.gained - a.gained;
      });
      play(options[0].pit);
    }, 700);
    return () => clearTimeout(t);
  }, [isBotEnabled, state, play]);

  const reset = () => setState(init());

  const tone: StatusTone =
    state.winner !== null
      ? 'success'
      : isBotEnabled && state.current === 1
        ? 'purple'
        : 'info';

  const winLabel =
    state.winner === 'tie'
      ? "It's a tie!"
      : state.winner !== null
        ? `${state.winner === 0 ? 'Player 1' : isBotEnabled ? 'Bot' : 'Player 2'} wins!`
        : null;

  return (
    <div className="flex flex-col items-center gap-5">
      <StatusBar tone={tone}>
        {state.winner !== null
          ? winLabel ?? ''
          : `${state.current === 0 ? 'Player 1' : isBotEnabled ? 'Bot' : 'Player 2'}'s turn`}
      </StatusBar>

      <div className="relative">
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-br from-amber-200 to-yellow-300 shadow-xl">
          {/* Left store (Player 2/Bot) */}
          <Store label={isBotEnabled ? 'Bot' : 'P2'} count={state.pits[13]} />
          <div className="flex flex-col gap-3">
            {/* Player 1 (bottom) on the top row reversed so it reads normally */}
            <div className="flex gap-2">
              {[12, 11, 10, 9, 8, 7].map((i) => (
                <Pit
                  key={i}
                  count={state.pits[i]}
                  onClick={() => play(i)}
                  disabled={
                    state.current !== 1 ||
                    state.pits[i] === 0 ||
                    state.winner !== null ||
                    (isBotEnabled && state.current === 1)
                  }
                />
              ))}
            </div>
            <div className="flex gap-2">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <Pit
                  key={i}
                  count={state.pits[i]}
                  onClick={() => play(i)}
                  disabled={
                    state.current !== 0 ||
                    state.pits[i] === 0 ||
                    state.winner !== null
                  }
                />
              ))}
            </div>
          </div>
          <Store label="P1" count={state.pits[6]} />
        </div>

        {state.winner !== null && winLabel && (
          <WinOverlay
            title={winLabel}
            subtitle={`${state.pits[6]} – ${state.pits[13]}`}
            tie={state.winner === 'tie'}
            onPlayAgain={reset}
          />
        )}
      </div>

      <p className="text-xs md:text-sm text-gray-500 max-w-md text-center">
        Pick up stones from one of your pits and sow them counter-clockwise. Land the last stone in your store for another turn. Game ends when one side is empty.
      </p>
    </div>
  );
};

const Pit: React.FC<{ count: number; onClick: () => void; disabled: boolean }> = ({
  count,
  onClick,
  disabled,
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-lg font-bold shadow-inner transition-all ${
      disabled ? 'bg-amber-100 text-amber-700 cursor-not-allowed' : 'bg-white text-amber-800 hover:bg-amber-50 active:scale-95'
    }`}
  >
    {count}
  </button>
);

const Store: React.FC<{ label: string; count: number }> = ({ label, count }) => (
  <div className="w-16 md:w-20 h-32 md:h-40 rounded-3xl bg-white shadow-inner flex flex-col items-center justify-center border-2 border-amber-400">
    <div className="text-xs text-amber-700 font-semibold">{label}</div>
    <div className="text-3xl font-extrabold text-amber-800">{count}</div>
  </div>
);

export default Mancala;
