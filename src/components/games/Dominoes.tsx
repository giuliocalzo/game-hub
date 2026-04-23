import React, { useCallback, useEffect, useState } from 'react';
import StatusBar, { StatusTone } from '../shared/StatusBar';
import WinOverlay from '../shared/WinOverlay';

// Simple Draw Dominoes: each player starts with 7 tiles from a double-six set (28 tiles).
// Players alternate; on their turn they must play a tile whose end matches one of the exposed ends of the chain
// (or the first tile if the chain is empty). If they can't, they draw from the boneyard until they can or it's empty.
// If the boneyard is empty and they can't play, they pass. Game ends when a player empties their hand or both pass.
// Winner: whoever goes out, or lowest pip sum if blocked.

type Tile = { a: number; b: number; id: string };

const buildSet = (): Tile[] => {
  const out: Tile[] = [];
  for (let a = 0; a <= 6; a++) for (let b = a; b <= 6; b++) out.push({ a, b, id: `${a}-${b}` });
  return out.sort(() => Math.random() - 0.5);
};

type ChainTile = { a: number; b: number; id: string };
type Hand = Tile[];

const pips = (hand: Tile[]) => hand.reduce((s, t) => s + t.a + t.b, 0);

const Dominoes: React.FC<{ isBotEnabled: boolean }> = ({ isBotEnabled }) => {
  const [boneyard, setBoneyard] = useState<Tile[]>([]);
  const [you, setYou] = useState<Hand>([]);
  const [bot, setBot] = useState<Hand>([]);
  const [chain, setChain] = useState<ChainTile[]>([]);
  const [turn, setTurn] = useState<'you' | 'bot'>('you');
  const [log, setLog] = useState<string>('Pick a tile to start the chain.');
  const [passStreak, setPassStreak] = useState(0);
  const [winner, setWinner] = useState<'you' | 'bot' | 'tie' | null>(null);

  const reset = useCallback(() => {
    const deck = buildSet();
    const you0 = deck.splice(0, 7);
    const bot0 = deck.splice(0, 7);
    setBoneyard(deck);
    setYou(you0);
    setBot(bot0);
    setChain([]);
    setTurn('you');
    setLog('Pick a tile to start the chain.');
    setPassStreak(0);
    setWinner(null);
  }, []);

  useEffect(() => {
    reset();
  }, [reset]);

  const leftEnd = chain.length ? chain[0].a : null;
  const rightEnd = chain.length ? chain[chain.length - 1].b : null;

  const canPlay = useCallback(
    (t: Tile): 'left' | 'right' | 'either' | 'none' => {
      if (chain.length === 0) return 'either';
      const hitLeft = t.a === leftEnd || t.b === leftEnd;
      const hitRight = t.a === rightEnd || t.b === rightEnd;
      if (hitLeft && hitRight) return 'either';
      if (hitLeft) return 'left';
      if (hitRight) return 'right';
      return 'none';
    },
    [chain, leftEnd, rightEnd],
  );

  const placeTile = useCallback(
    (
      who: 'you' | 'bot',
      tile: Tile,
      side: 'left' | 'right',
    ) => {
      // orient tile so the matching end is inward
      const toChain: ChainTile = { ...tile };
      if (chain.length > 0) {
        if (side === 'left') {
          if (tile.b !== leftEnd) { toChain.a = tile.b; toChain.b = tile.a; }
        } else {
          if (tile.a !== rightEnd) { toChain.a = tile.b; toChain.b = tile.a; }
        }
      }
      const newChain = side === 'left' ? [toChain, ...chain] : [...chain, toChain];
      setChain(newChain);
      const hand = who === 'you' ? you : bot;
      const newHand = hand.filter((h) => h.id !== tile.id);
      if (who === 'you') setYou(newHand);
      else setBot(newHand);
      setPassStreak(0);
      if (!newHand.length) {
        setWinner(who);
        setLog(`${who === 'you' ? 'You' : 'Bot'} emptied the hand — win!`);
        return true;
      }
      return false;
    },
    [chain, leftEnd, rightEnd, you, bot],
  );

  const playUser = (tile: Tile, forceSide?: 'left' | 'right') => {
    if (turn !== 'you' || winner) return;
    const fit = canPlay(tile);
    if (fit === 'none') return;
    const side: 'left' | 'right' = forceSide
      ? forceSide
      : fit === 'either'
        ? (chain.length === 0 ? 'right' : 'right')
        : fit;
    // If "either", let the user pick by default place on right; for first tile it just starts the chain
    const won = placeTile('you', tile, side);
    if (!won) {
      setTurn('bot');
      setLog("Bot's turn.");
    }
  };

  const drawUntilPlayable = (who: 'you' | 'bot'): { played: boolean; passed: boolean } => {
    let hand = who === 'you' ? [...you] : [...bot];
    const yard = [...boneyard];
    // Try playing with what we have first
    const playable = hand.find((t) => canPlay(t) !== 'none');
    if (playable) {
      return { played: false, passed: false };
    }
    while (yard.length) {
      const t = yard.shift()!;
      hand.push(t);
      if (canPlay(t) !== 'none') break;
    }
    if (who === 'you') setYou(hand); else setBot(hand);
    setBoneyard(yard);
    const canNow = hand.some((t) => canPlay(t) !== 'none');
    if (!canNow) return { played: false, passed: true };
    return { played: false, passed: false };
  };

  const handleDraw = () => {
    if (turn !== 'you' || winner) return;
    const result = drawUntilPlayable('you');
    if (result.passed) {
      setPassStreak((n) => n + 1);
      setTurn('bot');
      setLog('No playable tile, and boneyard is empty. Passing.');
    } else {
      setLog('You drew a tile.');
    }
  };

  // End game by pass
  useEffect(() => {
    if (passStreak >= 2 && !winner) {
      const yp = pips(you);
      const bp = pips(bot);
      if (yp < bp) setWinner('you');
      else if (bp < yp) setWinner('bot');
      else setWinner('tie');
    }
  }, [passStreak, winner, you, bot]);

  // Bot turn
  useEffect(() => {
    if (turn !== 'bot' || winner) return;
    const t = setTimeout(() => {
      const playable = bot.find((tt) => canPlay(tt) !== 'none');
      if (playable) {
        const fit = canPlay(playable);
        const side: 'left' | 'right' = fit === 'either' ? 'right' : fit;
        const won = placeTile('bot', playable, side);
        if (!won) {
          setTurn('you');
          setLog('Your turn.');
        }
        return;
      }
      // Must draw or pass
      if (boneyard.length) {
        const yard = [...boneyard];
        let hand = [...bot];
        while (yard.length) {
          const t2 = yard.shift()!;
          hand.push(t2);
          if (canPlay(t2) !== 'none') break;
        }
        setBot(hand);
        setBoneyard(yard);
        const p = hand.find((tt) => canPlay(tt) !== 'none');
        if (p) {
          const fit = canPlay(p);
          const side: 'left' | 'right' = fit === 'either' ? 'right' : fit;
          const won = placeTile('bot', p, side);
          if (!won) {
            setTurn('you');
            setLog('Bot drew and played. Your turn.');
          }
        } else {
          setPassStreak((n) => n + 1);
          setTurn('you');
          setLog('Bot had to pass. Your turn.');
        }
      } else {
        setPassStreak((n) => n + 1);
        setTurn('you');
        setLog('Bot had to pass (boneyard empty). Your turn.');
      }
    }, 700);
    return () => clearTimeout(t);
  }, [turn, bot, boneyard, canPlay, placeTile, winner]);

  const tone: StatusTone = winner ? 'success' : turn === 'bot' ? 'purple' : 'info';

  const pip = (n: number, half: 'a' | 'b') => (
    <div className="w-8 h-8 flex items-center justify-center text-lg font-bold">
      <span className="opacity-80">{n}</span>
      <span className="sr-only">{half}</span>
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-5">
      <StatusBar tone={tone}>{log}</StatusBar>

      <div className="flex gap-4 text-xs text-gray-600 dark:text-gray-300">
        <span>Your tiles: <strong>{you.length}</strong></span>
        <span>Boneyard: <strong>{boneyard.length}</strong></span>
        <span>Bot tiles: <strong>{bot.length}</strong></span>
      </div>

      {/* Bot hand — face down */}
      <div className="flex gap-1 flex-wrap justify-center">
        {bot.map((t, i) => (
          <div key={t.id + i} className="w-8 h-16 rounded bg-gradient-to-br from-indigo-500 to-purple-600 border border-white shadow" />
        ))}
      </div>

      {/* Chain */}
      <div className="relative w-full overflow-x-auto">
        <div className="flex items-center justify-center gap-0 min-h-[72px] py-2 px-2">
          {chain.length === 0 ? (
            <div className="text-sm text-gray-500 dark:text-gray-400">No tiles played yet.</div>
          ) : (
            chain.map((t, i) => (
              <div
                key={i}
                className={`flex ${t.a === t.b ? 'flex-col' : 'flex-row'} items-center justify-between bg-white dark:bg-gray-800 border-2 border-gray-800 dark:border-gray-200 rounded-md shadow-sm mx-0.5`}
                style={{ width: t.a === t.b ? 40 : 64, height: t.a === t.b ? 64 : 40 }}
              >
                {pip(t.a, 'a')}
                <div className={`${t.a === t.b ? 'w-full h-px' : 'h-full w-px'} bg-gray-800 dark:bg-gray-200`} />
                {pip(t.b, 'b')}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Your hand */}
      <div className="flex gap-2 flex-wrap justify-center max-w-3xl">
        {you.map((t) => {
          const fit = canPlay(t);
          const playable = fit !== 'none' && turn === 'you' && !winner;
          return (
            <button
              key={t.id}
              onClick={() => playUser(t)}
              disabled={!playable}
              className={`flex flex-row items-center justify-between bg-white dark:bg-gray-800 border-2 rounded-md shadow transition-all ${
                playable
                  ? 'border-blue-400 hover:-translate-y-1 cursor-pointer'
                  : 'border-gray-300 dark:border-gray-600 opacity-60 cursor-not-allowed'
              }`}
              style={{ width: 64, height: 40 }}
            >
              {pip(t.a, 'a')}
              <div className="h-full w-px bg-gray-800 dark:bg-gray-200" />
              {pip(t.b, 'b')}
            </button>
          );
        })}
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleDraw}
          disabled={turn !== 'you' || !!winner}
          className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-semibold shadow hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
        >
          Draw
        </button>
        <button
          onClick={reset}
          className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-semibold shadow hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          New game
        </button>
      </div>

      {winner && (
        <WinOverlay
          title={winner === 'tie' ? "It's a tie!" : winner === 'you' ? 'You win!' : 'Bot wins!'}
          subtitle={`You: ${pips(you)} pips · Bot: ${pips(bot)} pips`}
          tie={winner === 'tie'}
          onPlayAgain={reset}
        />
      )}
    </div>
  );
};

export default Dominoes;
