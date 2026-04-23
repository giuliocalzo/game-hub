import React, { useCallback, useEffect, useState } from 'react';
import StatusBar, { StatusTone } from '../shared/StatusBar';
import WinOverlay from '../shared/WinOverlay';

type Suit = '♠' | '♥' | '♦' | '♣';
type Card = { rank: number; suit: Suit; id: string };

const RANK_LABEL: Record<number, string> = { 11: 'J', 12: 'Q', 13: 'K', 14: 'A' };
const rankText = (r: number) => RANK_LABEL[r] ?? String(r);

const build = (): Card[] => {
  const suits: Suit[] = ['♠', '♥', '♦', '♣'];
  const deck: Card[] = [];
  for (const s of suits) for (let r = 2; r <= 14; r++) deck.push({ rank: r, suit: s, id: `${r}${s}` });
  return deck.sort(() => Math.random() - 0.5);
};

const CrazyEights: React.FC<{ isBotEnabled: boolean }> = () => {
  const [deck, setDeck] = useState<Card[]>([]);
  const [you, setYou] = useState<Card[]>([]);
  const [bot, setBot] = useState<Card[]>([]);
  const [top, setTop] = useState<Card | null>(null);
  const [activeSuit, setActiveSuit] = useState<Suit | null>(null);
  const [turn, setTurn] = useState<'you' | 'bot'>('you');
  const [picking, setPicking] = useState(false);
  const [winner, setWinner] = useState<'you' | 'bot' | null>(null);

  const reset = useCallback(() => {
    const d = build();
    const y = d.splice(0, 7);
    const b = d.splice(0, 7);
    const t = d.shift()!;
    setDeck(d);
    setYou(y);
    setBot(b);
    setTop(t);
    setActiveSuit(t.suit);
    setTurn('you');
    setPicking(false);
    setWinner(null);
  }, []);

  useEffect(() => {
    reset();
  }, [reset]);

  const canPlay = useCallback(
    (c: Card) => top !== null && (c.rank === 8 || c.rank === top.rank || c.suit === activeSuit),
    [top, activeSuit],
  );

  const finishPlay = useCallback(
    (card: Card, who: 'you' | 'bot', chosenSuit?: Suit) => {
      const newActive = card.rank === 8 ? (chosenSuit ?? card.suit) : card.suit;
      setTop(card);
      setActiveSuit(newActive);
      const handAfter = (who === 'you' ? you : bot).filter((c) => c.id !== card.id);
      if (who === 'you') setYou(handAfter);
      else setBot(handAfter);
      if (!handAfter.length) {
        setWinner(who);
        return;
      }
      setTurn(who === 'you' ? 'bot' : 'you');
    },
    [you, bot],
  );

  const play = useCallback(
    (card: Card) => {
      if (turn !== 'you' || winner || !top) return;
      if (!canPlay(card)) return;
      if (card.rank === 8) {
        setPicking(true);
        // Temporarily store pending move
        (window as any)._pending = card;
        return;
      }
      finishPlay(card, 'you');
    },
    [turn, winner, top, canPlay, finishPlay],
  );

  const pickSuit = (s: Suit) => {
    const card: Card | undefined = (window as any)._pending;
    if (!card) return;
    (window as any)._pending = undefined;
    setPicking(false);
    finishPlay(card, 'you', s);
  };

  const drawOne = (who: 'you' | 'bot') => {
    if (!deck.length) {
      // reshuffle discard (keep top)
      return;
    }
    const drawn = deck[0];
    setDeck((d) => d.slice(1));
    if (who === 'you') setYou((h) => [...h, drawn]);
    else setBot((h) => [...h, drawn]);
    return drawn;
  };

  const drawAndMaybePlay = useCallback(
    (who: 'you' | 'bot') => {
      if (!deck.length) {
        // skip
        setTurn(who === 'you' ? 'bot' : 'you');
        return;
      }
      const drawn = deck[0];
      setDeck((d) => d.slice(1));
      const playable = canPlay(drawn);
      if (playable) {
        // Auto-play drawn card
        if (drawn.rank === 8) {
          // choose the suit we have most of
          const hand = who === 'you' ? you : bot;
          const counts: Record<Suit, number> = { '♠': 0, '♥': 0, '♦': 0, '♣': 0 };
          for (const c of hand) counts[c.suit]++;
          const chosen = (Object.keys(counts) as Suit[]).sort((a, b) => counts[b] - counts[a])[0];
          finishPlay(drawn, who, chosen);
        } else {
          finishPlay(drawn, who);
        }
      } else {
        if (who === 'you') setYou((h) => [...h, drawn]);
        else setBot((h) => [...h, drawn]);
        setTurn(who === 'you' ? 'bot' : 'you');
      }
    },
    [deck, canPlay, you, bot, finishPlay],
  );

  // Bot turn
  useEffect(() => {
    if (turn !== 'bot' || winner || picking) return;
    const t = setTimeout(() => {
      const playable = bot.filter(canPlay);
      if (playable.length) {
        const nonEight = playable.filter((c) => c.rank !== 8);
        const card = (nonEight[0] ?? playable[0]);
        if (card.rank === 8) {
          const counts: Record<Suit, number> = { '♠': 0, '♥': 0, '♦': 0, '♣': 0 };
          for (const c of bot) counts[c.suit]++;
          const chosen = (Object.keys(counts) as Suit[]).sort((a, b) => counts[b] - counts[a])[0];
          finishPlay(card, 'bot', chosen);
        } else {
          finishPlay(card, 'bot');
        }
      } else {
        drawAndMaybePlay('bot');
      }
    }, 700);
    return () => clearTimeout(t);
  }, [turn, bot, canPlay, winner, picking, finishPlay, drawAndMaybePlay]);

  const tone: StatusTone = winner ? 'success' : turn === 'bot' ? 'purple' : 'info';
  const status = winner
    ? winner === 'you' ? 'You win!' : 'Bot wins!'
    : turn === 'bot'
      ? 'Bot is thinking…'
      : `Your turn · suit: ${activeSuit}${top?.rank === 8 ? ' (chosen)' : ''}`;

  const cardClass = (c: Card) =>
    `w-11 h-16 rounded border-2 bg-white dark:bg-gray-800 flex items-center justify-center text-sm font-bold shadow ${
      c.suit === '♥' || c.suit === '♦' ? 'text-rose-500 border-rose-200' : 'text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600'
    }`;

  return (
    <div className="flex flex-col items-center gap-5">
      <StatusBar tone={tone}>{status}</StatusBar>

      {/* Bot hand */}
      <div className="flex gap-1 flex-wrap justify-center">
        {bot.map((c, i) => (
          <div key={c.id + i} className="w-8 h-12 rounded bg-gradient-to-br from-indigo-500 to-purple-600 border border-white shadow" />
        ))}
      </div>

      {/* Center: deck + top */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-20 rounded bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-white text-xs font-semibold shadow-md">
          {deck.length}
        </div>
        {top && (
          <div
            className={`w-14 h-20 rounded border-2 bg-white dark:bg-gray-800 flex items-center justify-center text-xl font-bold shadow-lg ${
              top.suit === '♥' || top.suit === '♦' ? 'text-rose-500 border-rose-200' : 'text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600'
            }`}
          >
            {rankText(top.rank) + (top.rank === 8 ? (activeSuit ?? '') : top.suit)}
          </div>
        )}
      </div>

      {/* Suit picker */}
      {picking && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-xl text-center">
            <div className="mb-3 font-bold text-gray-800 dark:text-gray-200">Choose a suit</div>
            <div className="grid grid-cols-4 gap-2">
              {(['♠', '♥', '♦', '♣'] as Suit[]).map((s) => (
                <button
                  key={s}
                  onClick={() => pickSuit(s)}
                  className={`w-14 h-14 rounded-xl text-3xl shadow ${
                    s === '♥' || s === '♦' ? 'bg-rose-50 text-rose-500' : 'bg-gray-50 dark:bg-gray-800/60 text-gray-900 dark:text-gray-100'
                  } hover:brightness-110`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Your hand */}
      <div className="flex gap-2 flex-wrap justify-center max-w-lg">
        {you.map((c) => {
          const playable = canPlay(c) && turn === 'you' && !winner;
          return (
            <button
              key={c.id}
              onClick={() => play(c)}
              disabled={!playable}
              className={`${cardClass(c)} transition-all ${
                playable ? 'ring-2 ring-blue-300 hover:-translate-y-1' : 'opacity-60 cursor-not-allowed'
              }`}
            >
              {rankText(c.rank) + c.suit}
            </button>
          );
        })}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => drawAndMaybePlay('you')}
          disabled={turn !== 'you' || !!winner}
          className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-semibold shadow hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800/60 disabled:opacity-50"
        >
          Draw
        </button>
      </div>

      {winner && (
        <WinOverlay
          title={winner === 'you' ? 'You win!' : 'Bot wins!'}
          subtitle="Cleaned out the hand."
          onPlayAgain={reset}
        />
      )}

    </div>
  );
};

export default CrazyEights;
