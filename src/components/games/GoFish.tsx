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

const deal = () => {
  const deck = build();
  const youHand: Card[] = deck.splice(0, 7);
  const botHand: Card[] = deck.splice(0, 7);
  return { deck, youHand, botHand };
};

const takeRank = (hand: Card[], rank: number): { given: Card[]; rest: Card[] } => {
  const given = hand.filter((c) => c.rank === rank);
  const rest = hand.filter((c) => c.rank !== rank);
  return { given, rest };
};

const collectBooks = (hand: Card[]): { books: number[]; rest: Card[] } => {
  const counts: Record<number, Card[]> = {};
  for (const c of hand) (counts[c.rank] ??= []).push(c);
  const books: number[] = [];
  const rest: Card[] = [];
  for (const r in counts) {
    const arr = counts[r];
    if (arr.length === 4) books.push(arr[0].rank);
    else rest.push(...arr);
  }
  return { books, rest };
};

const GoFish: React.FC<{ isBotEnabled: boolean }> = () => {
  const [deck, setDeck] = useState<Card[]>([]);
  const [you, setYou] = useState<Card[]>([]);
  const [bot, setBot] = useState<Card[]>([]);
  const [youBooks, setYouBooks] = useState<number[]>([]);
  const [botBooks, setBotBooks] = useState<number[]>([]);
  const [turn, setTurn] = useState<'you' | 'bot'>('you');
  const [log, setLog] = useState<string>('Your turn. Ask the bot for a rank.');
  const [done, setDone] = useState(false);

  const reset = useCallback(() => {
    const d = deal();
    const you0 = collectBooks(d.youHand);
    const bot0 = collectBooks(d.botHand);
    setDeck(d.deck);
    setYou(you0.rest);
    setBot(bot0.rest);
    setYouBooks(you0.books);
    setBotBooks(bot0.books);
    setTurn('you');
    setLog('Your turn. Tap a card to ask for that rank.');
    setDone(false);
  }, []);

  useEffect(() => {
    reset();
  }, [reset]);

  const drawOne = (side: 'you' | 'bot', hand: Card[], deckNow: Card[]): {
    newHand: Card[];
    drawn?: Card;
    newDeck: Card[];
    books: number[];
  } => {
    if (!deckNow.length) return { newHand: hand, newDeck: deckNow, books: [] };
    const drawn = deckNow[0];
    const newDeck = deckNow.slice(1);
    const withCard = [...hand, drawn];
    const { books, rest } = collectBooks(withCard);
    return { newHand: rest, drawn, newDeck, books };
  };

  const endIfOver = (yHand: Card[], bHand: Card[], d: Card[]) => {
    if (!d.length && (!yHand.length || !bHand.length)) {
      setDone(true);
      return true;
    }
    return false;
  };

  const ask = (rank: number) => {
    if (turn !== 'you' || done) return;
    const { given, rest } = takeRank(bot, rank);
    if (given.length) {
      const combined = [...you, ...given];
      const { books, rest: yRest } = collectBooks(combined);
      const newBooks = [...youBooks, ...books];
      setBot(rest);
      setYou(yRest);
      setYouBooks(newBooks);
      setLog(`Bot gave you ${given.length} × ${rankText(rank)}. Ask again!`);
      endIfOver(yRest, rest, deck);
    } else {
      setLog(`Bot says: Go fish!`);
      const { newHand, drawn, newDeck, books } = drawOne('you', you, deck);
      setDeck(newDeck);
      setYouBooks((b) => [...b, ...books]);
      if (drawn && drawn.rank === rank) {
        setYou(newHand);
        setLog(`You drew ${rankText(drawn.rank)}${drawn.suit} — the rank you asked for! Go again.`);
      } else {
        setYou(newHand);
        setTurn('bot');
        setLog(drawn ? `You drew ${rankText(drawn.rank)}${drawn.suit}. Bot's turn.` : `Deck empty. Bot's turn.`);
      }
      endIfOver(newHand, bot, newDeck);
    }
  };

  // Bot turn
  useEffect(() => {
    if (turn !== 'bot' || done || !bot.length) return;
    const t = setTimeout(() => {
      const rank = bot[Math.floor(Math.random() * bot.length)].rank;
      const { given, rest } = takeRank(you, rank);
      if (given.length) {
        const combined = [...bot, ...given];
        const { books, rest: bRest } = collectBooks(combined);
        setYou(rest);
        setBot(bRest);
        setBotBooks((b) => [...b, ...books]);
        setLog(`Bot asks for ${rankText(rank)}. You gave ${given.length}. Bot asks again!`);
      } else {
        const { newHand, drawn, newDeck, books } = drawOne('bot', bot, deck);
        setDeck(newDeck);
        setBot(newHand);
        setBotBooks((b) => [...b, ...books]);
        if (drawn && drawn.rank === rank) {
          setLog(`Bot asks for ${rankText(rank)}. Go fish — but bot drew it! Goes again.`);
        } else {
          setTurn('you');
          setLog(`Bot asks for ${rankText(rank)}. Go fish. Your turn.`);
        }
      }
    }, 900);
    return () => clearTimeout(t);
  }, [turn, bot, you, deck, done]);

  const tone: StatusTone = done ? 'success' : turn === 'bot' ? 'purple' : 'info';

  const winner =
    done
      ? youBooks.length > botBooks.length
        ? 'You win!'
        : botBooks.length > youBooks.length
          ? 'Bot wins!'
          : "It's a tie!"
      : null;

  // Unique ranks in your hand, for asking buttons
  const yourRanks = Array.from(new Set(you.map((c) => c.rank))).sort((a, b) => a - b);

  return (
    <div className="flex flex-col items-center gap-5">
      <StatusBar tone={tone}>{log}</StatusBar>

      <div className="flex justify-between w-full max-w-lg text-xs text-gray-600">
        <div>
          Your books: <span className="font-bold">{youBooks.length}</span>
        </div>
        <div>Deck: {deck.length}</div>
        <div>
          Bot books: <span className="font-bold">{botBooks.length}</span>
        </div>
      </div>

      {/* Bot hand (face down) */}
      <div className="flex gap-1 flex-wrap justify-center">
        {bot.map((c, i) => (
          <div
            key={c.id + i}
            className="w-8 h-12 rounded bg-gradient-to-br from-indigo-500 to-purple-600 border border-white shadow"
          />
        ))}
      </div>

      {/* Your hand */}
      <div className="flex gap-2 flex-wrap justify-center max-w-lg">
        {you.map((c) => (
          <div
            key={c.id}
            className={`w-10 h-14 rounded border-2 bg-white flex items-center justify-center text-sm font-bold shadow ${
              c.suit === '♥' || c.suit === '♦' ? 'text-rose-500 border-rose-200' : 'text-gray-900 border-gray-300'
            }`}
          >
            {rankText(c.rank) + c.suit}
          </div>
        ))}
      </div>

      {/* Rank ask buttons */}
      <div className="flex flex-wrap gap-1.5 justify-center">
        {yourRanks.map((r) => (
          <button
            key={r}
            onClick={() => ask(r)}
            disabled={turn !== 'you' || done}
            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-gray-200 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50"
          >
            Ask for {rankText(r)}
          </button>
        ))}
      </div>

      {done && winner && (
        <WinOverlay
          title={winner}
          subtitle={`Books — you: ${youBooks.length} · bot: ${botBooks.length}`}
          tie={winner.includes('tie')}
          onPlayAgain={reset}
        />
      )}

      <p className="text-xs md:text-sm text-gray-500 max-w-md text-center">
        Ask the bot for a rank you hold. If they have it, you take all. Otherwise, "go fish" from the deck.
      </p>
    </div>
  );
};

export default GoFish;
