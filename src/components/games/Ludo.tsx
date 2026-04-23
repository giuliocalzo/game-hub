import React, { useCallback, useEffect, useState } from 'react';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from 'lucide-react';
import StatusBar, { StatusTone } from '../shared/StatusBar';
import WinOverlay from '../shared/WinOverlay';

// Simplified 2-player Ludo-like race game.
// Each player has 4 tokens on a shared 52-cell track (visualized as a circle) plus 6 home-stretch cells.
// Roll a 6 to enter a token from base. Roll to advance; must be exact to finish. All 4 home = win.

const TRACK = 52;
const HOME = 6;

type TokenState = {
  state: 'base' | 'track' | 'home' | 'done';
  pos: number; // track pos or home pos
};

type PlayerState = { tokens: TokenState[]; color: string; start: number; name: string };

const mkPlayer = (color: string, start: number, name: string): PlayerState => ({
  color,
  start,
  name,
  tokens: Array.from({ length: 4 }, () => ({ state: 'base', pos: 0 })),
});

const DIE_ICONS = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];

const Ludo: React.FC<{ isBotEnabled: boolean }> = ({ isBotEnabled }) => {
  const [players, setPlayers] = useState<PlayerState[]>(() => [
    mkPlayer('bg-rose-500', 0, 'Red'),
    mkPlayer('bg-amber-500', 26, isBotEnabled ? 'Bot' : 'Yellow'),
  ]);
  const [turn, setTurn] = useState<0 | 1>(0);
  const [die, setDie] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);
  const [winner, setWinner] = useState<number | null>(null);
  const [message, setMessage] = useState<string>(`${players[0].name}'s turn. Roll to start.`);

  const reset = () => {
    setPlayers([
      mkPlayer('bg-rose-500', 0, 'Red'),
      mkPlayer('bg-amber-500', 26, isBotEnabled ? 'Bot' : 'Yellow'),
    ]);
    setTurn(0);
    setDie(null);
    setWinner(null);
    setMessage('Red\'s turn. Roll to start.');
  };

  const anyMoveable = useCallback(
    (p: PlayerState, value: number): boolean =>
      p.tokens.some((t) => {
        if (t.state === 'done') return false;
        if (t.state === 'base') return value === 6;
        if (t.state === 'home') return t.pos + value <= HOME;
        // track
        return true;
      }),
    [],
  );

  const rollDice = useCallback(() => {
    if (rolling || winner !== null) return;
    setRolling(true);
    let n = 0;
    const anim = setInterval(() => {
      setDie(Math.floor(Math.random() * 6) + 1);
      n++;
      if (n > 6) {
        clearInterval(anim);
        const value = Math.floor(Math.random() * 6) + 1;
        setDie(value);
        setRolling(false);
        if (!anyMoveable(players[turn], value)) {
          setMessage(`${players[turn].name} rolled ${value} — no moves. Passing.`);
          setTimeout(() => {
            setTurn((t) => (t === 0 ? 1 : 0));
            setDie(null);
            setMessage(`${players[turn === 0 ? 1 : 0].name}'s turn.`);
          }, 900);
        } else {
          setMessage(`${players[turn].name} rolled ${value}. Pick a token.`);
        }
      }
    }, 70);
  }, [rolling, winner, players, turn, anyMoveable]);

  const moveToken = useCallback(
    (ti: number) => {
      if (die === null || winner !== null) return;
      const p = players[turn];
      const t = p.tokens[ti];

      const newTokens = p.tokens.map((x) => ({ ...x }));
      const me = newTokens[ti];
      let moved = false;
      if (me.state === 'done') return;
      if (me.state === 'base') {
        if (die !== 6) return;
        me.state = 'track';
        me.pos = p.start;
        moved = true;
      } else if (me.state === 'home') {
        if (me.pos + die > HOME) return;
        me.pos += die;
        if (me.pos === HOME) me.state = 'done';
        moved = true;
      } else {
        // track: calculate new position
        // each player goes 50 cells of track before entering home (we keep simple: 50 track cells from start)
        const traveled = ((me.pos - p.start + TRACK) % TRACK);
        const newTraveled = traveled + die;
        if (newTraveled < 50) {
          me.pos = (p.start + newTraveled) % TRACK;
        } else if (newTraveled - 50 <= HOME) {
          me.state = 'home';
          me.pos = newTraveled - 50;
          if (me.pos === HOME) me.state = 'done';
        } else {
          return; // can't move — overshoot home
        }
        moved = true;
      }

      if (!moved) return;

      // Capture opponent on the same track cell (not on home or safe base)
      if (me.state === 'track') {
        const opp = players[turn === 0 ? 1 : 0];
        const nextPlayers = [...players];
        const oppIndex = turn === 0 ? 1 : 0;
        const oppTokens = opp.tokens.map((x) => {
          if (x.state === 'track' && x.pos === me.pos) {
            return { state: 'base' as const, pos: 0 };
          }
          return x;
        });
        const meNew = { ...players[turn], tokens: newTokens };
        const oppNew = { ...opp, tokens: oppTokens };
        nextPlayers[turn] = meNew;
        nextPlayers[oppIndex] = oppNew;
        setPlayers(nextPlayers);
      } else {
        const next = [...players];
        next[turn] = { ...players[turn], tokens: newTokens };
        setPlayers(next);
      }

      // Check win
      if (newTokens.every((x) => x.state === 'done')) {
        setWinner(turn);
        setMessage(`${players[turn].name} wins!`);
        return;
      }

      // If rolled 6, same player again; else switch
      if (die === 6) {
        setMessage(`${players[turn].name} rolled a 6 — roll again!`);
        setDie(null);
      } else {
        setTurn((t) => (t === 0 ? 1 : 0));
        setDie(null);
        setMessage(`${players[turn === 0 ? 1 : 0].name}'s turn.`);
      }
    },
    [die, players, turn, winner],
  );

  // Bot
  useEffect(() => {
    if (!isBotEnabled || turn !== 1 || winner !== null) return;
    if (die === null) {
      const t = setTimeout(rollDice, 700);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      const p = players[1];
      // Prefer home progress, else first moveable token
      const idx = p.tokens.findIndex((tok) => {
        if (tok.state === 'done') return false;
        if (tok.state === 'base') return die === 6;
        if (tok.state === 'home') return tok.pos + die <= HOME;
        return true;
      });
      if (idx >= 0) moveToken(idx);
    }, 800);
    return () => clearTimeout(t);
  }, [isBotEnabled, turn, die, winner, players, rollDice, moveToken]);

  const tone: StatusTone = winner !== null ? 'success' : turn === 1 && isBotEnabled ? 'purple' : 'info';
  const DieIcon = die ? DIE_ICONS[die - 1] : null;

  return (
    <div className="flex flex-col items-center gap-5">
      <StatusBar tone={tone}>{message}</StatusBar>

      <div className="flex items-center gap-4">
        <button
          onClick={rollDice}
          disabled={rolling || die !== null || winner !== null || (isBotEnabled && turn === 1)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold shadow hover:brightness-110 active:scale-95 disabled:opacity-50"
        >
          Roll
        </button>
        <div className="w-14 h-14 rounded-xl bg-white border border-gray-200 flex items-center justify-center shadow-inner">
          {DieIcon ? <DieIcon className={`w-10 h-10 text-gray-800 ${rolling ? 'animate-spin' : ''}`} /> : <span className="text-xs text-gray-400">–</span>}
        </div>
      </div>

      <div className="relative grid grid-cols-2 gap-6 w-full max-w-2xl">
        {players.map((p, pi) => (
          <div key={pi} className={`rounded-2xl border-2 p-3 ${pi === turn && winner === null ? 'border-blue-300 ring-2 ring-blue-100 bg-white' : 'border-gray-200 bg-white/70'}`}>
            <div className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${p.color}`} />
              {p.name}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {p.tokens.map((t, ti) => {
                const movable =
                  pi === turn &&
                  die !== null &&
                  winner === null &&
                  ((t.state === 'base' && die === 6) ||
                    (t.state === 'track') ||
                    (t.state === 'home' && t.pos + die <= HOME));
                const label =
                  t.state === 'base'
                    ? 'B'
                    : t.state === 'track'
                      ? `T${((t.pos - p.start + TRACK) % TRACK) + 1}`
                      : t.state === 'home'
                        ? `H${t.pos}`
                        : '✓';
                return (
                  <button
                    key={ti}
                    onClick={() => (pi === turn && !(isBotEnabled && turn === 1) ? moveToken(ti) : null)}
                    disabled={!movable || (isBotEnabled && turn === 1)}
                    className={`h-12 rounded-lg text-white font-bold text-sm shadow ${p.color} ${
                      movable ? 'ring-2 ring-blue-300 animate-pulse' : 'opacity-90'
                    } ${t.state === 'done' ? 'opacity-60' : ''}`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {winner !== null && (
          <WinOverlay
            title={`${players[winner].name} wins!`}
            subtitle="All four tokens home."
            onPlayAgain={reset}
          />
        )}
      </div>

    </div>
  );
};

export default Ludo;
