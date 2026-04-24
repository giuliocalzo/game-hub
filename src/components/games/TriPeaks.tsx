import React, { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import StatusBar, { StatusTone } from '../shared/StatusBar';
import WinOverlay from '../shared/WinOverlay';

type Suit = '♠' | '♥' | '♦' | '♣';

interface Card {
  rank: number; // 1..13
  suit: Suit;
}

interface Slot {
  id: number;
  row: number;
  x: number; // grid x (half-unit)
  covers: number[]; // ids of slots covering this slot from below row
  card: Card;
  removed: boolean;
  faceUp: boolean;
}

const SUITS: Suit[] = ['♠', '♥', '♦', '♣'];
const RED: Record<Suit, boolean> = { '♠': false, '♣': false, '♥': true, '♦': true };

const rankLabel = (r: number): string => {
  if (r === 1) return 'A';
  if (r === 11) return 'J';
  if (r === 12) return 'Q';
  if (r === 13) return 'K';
  return String(r);
};

const shuffle = <T,>(a: T[]): T[] => {
  const arr = a.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const makeDeck = (): Card[] => {
  const deck: Card[] = [];
  for (const s of SUITS) {
    for (let r = 1; r <= 13; r++) deck.push({ rank: r, suit: s });
  }
  return shuffle(deck);
};

// TriPeaks layout: 3 peaks
// Row 0 (top): 3 cards at x = 3, 11, 19 (half-unit grid)
// Row 1: 6 cards at x = 2, 4, 10, 12, 18, 20
// Row 2: 9 cards at x = 1, 3, 5, 9, 11, 13, 17, 19, 21
// Row 3 (bottom, flat line of 10 cards): 10 cards at x = 0, 2, 4, ..., 18, 20, 22
// 3 + 6 + 9 + 10 = 28 cards in layout. Plus 24 in stock pile.

const buildLayout = (deck: Card[]): { slots: Slot[]; stock: Card[]; waste: Card[] } => {
  const slots: Slot[] = [];
  let id = 0;
  let deckIdx = 0;

  const add = (row: number, x: number) => {
    const card = deck[deckIdx++];
    slots.push({ id: id++, row, x, covers: [], card, removed: false, faceUp: row === 3 });
    return id - 1;
  };

  // Row 0: three peaks
  const row0: number[] = [];
  [3, 11, 19].forEach((x) => row0.push(add(0, x)));

  // Row 1: 6 cards, 2 per peak
  const row1: number[] = [];
  [2, 4, 10, 12, 18, 20].forEach((x) => row1.push(add(1, x)));

  // Row 2: 9 cards
  const row2: number[] = [];
  [1, 3, 5, 9, 11, 13, 17, 19, 21].forEach((x) => row2.push(add(2, x)));

  // Row 3: 10 flat-line cards
  const row3: number[] = [];
  [0, 2, 4, 6, 8, 12, 14, 16, 20, 22].forEach((x) => row3.push(add(3, x)));

  // Set up coverage (a card is "coverable" by the two cards below with x=thisX-1 and x=thisX+1 in row+1)
  const byRow: number[][] = [row0, row1, row2, row3];
  for (let r = 0; r < 3; r++) {
    for (const id of byRow[r]) {
      const slot = slots[id];
      for (const childId of byRow[r + 1]) {
        const child = slots[childId];
        if (child.x === slot.x - 1 || child.x === slot.x + 1) slot.covers.push(childId);
      }
    }
  }

  // Remaining deck = stock (24 cards). First stock card goes to waste immediately.
  const remaining = deck.slice(deckIdx);
  const waste = [remaining[0]];
  const stock = remaining.slice(1);
  return { slots, stock, waste };
};

const adjacent = (a: number, b: number): boolean => {
  // A and K wrap: ace adjacent to 2 AND king
  if (a === b) return false;
  const diff = Math.abs(a - b);
  return diff === 1 || diff === 12;
};

const TriPeaks: React.FC<{ isBotEnabled: boolean }> = () => {
  const init = () => {
    const deck = makeDeck();
    return buildLayout(deck);
  };
  const [state, setState] = useState(init);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [done, setDone] = useState<'won' | 'stuck' | null>(null);

  const reset = useCallback(() => {
    setState(init());
    setScore(0);
    setStreak(0);
    setDone(null);
  }, []);

  const topWaste = state.waste[state.waste.length - 1];

  const isSlotFree = (s: Slot): boolean => {
    if (s.removed) return false;
    return s.covers.every((childId) => state.slots[childId].removed);
  };

  // Reveal faces when both children removed
  useEffect(() => {
    setState((prev) => {
      let changed = false;
      const next = { ...prev, slots: prev.slots.map((s) => {
        if (s.removed || s.faceUp) return s;
        if (s.covers.every((c) => prev.slots[c].removed)) {
          changed = true;
          return { ...s, faceUp: true };
        }
        return s;
      }) };
      return changed ? next : prev;
    });
  }, [state.slots]);

  const clickSlot = (sid: number) => {
    if (done) return;
    const slot = state.slots[sid];
    if (!slot || slot.removed || !slot.faceUp) return;
    if (!isSlotFree(slot)) return;
    if (!topWaste || !adjacent(slot.card.rank, topWaste.rank)) return;
    // Take it
    setState((prev) => ({
      ...prev,
      slots: prev.slots.map((s) => (s.id === sid ? { ...s, removed: true } : s)),
      waste: [...prev.waste, slot.card],
    }));
    setScore((s) => s + 10 + streak * 5);
    setStreak((s) => s + 1);
  };

  const drawStock = () => {
    if (done || state.stock.length === 0) return;
    setState((prev) => ({
      ...prev,
      stock: prev.stock.slice(0, -1),
      waste: [...prev.waste, prev.stock[prev.stock.length - 1]],
    }));
    setStreak(0);
  };

  // End-of-game detection
  useEffect(() => {
    if (done) return;
    if (state.slots.every((s) => s.removed)) {
      setDone('won');
      setScore((s) => s + 100 + state.stock.length * 10);
      return;
    }
    const anyPlayable = state.slots.some(
      (s) => !s.removed && s.faceUp && isSlotFree(s) && topWaste && adjacent(s.card.rank, topWaste.rank),
    );
    if (!anyPlayable && state.stock.length === 0) setDone('stuck');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, topWaste]);

  const tone: StatusTone = done === 'won' ? 'success' : done === 'stuck' ? 'warning' : 'info';

  // Board layout dims: x in [0..23] half units, rows 0..3
  const CARD_W = 48;
  const CARD_H = 66;
  const HALF_X = CARD_W / 2;
  const ROW_Y = (r: number) => r * 34 + 10;
  const boardW = 24 * HALF_X + CARD_W + 20;
  const boardH = ROW_Y(3) + CARD_H + 20;

  const renderCard = (c: Card, faceUp: boolean, x: number, y: number, key: string, highlighted: boolean, onClick?: () => void) => (
    <g
      key={key}
      transform={`translate(${x}, ${y})`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <rect
        width={CARD_W}
        height={CARD_H}
        rx={6}
        fill={faceUp ? '#fefce8' : '#1e3a8a'}
        stroke={highlighted ? '#f59e0b' : '#0f172a'}
        strokeWidth={highlighted ? 3 : 1.5}
      />
      {faceUp ? (
        <>
          <text
            x={8}
            y={18}
            fontSize={15}
            fontWeight={700}
            fill={RED[c.suit] ? '#dc2626' : '#0f172a'}
          >
            {rankLabel(c.rank)}
          </text>
          <text
            x={8}
            y={33}
            fontSize={13}
            fill={RED[c.suit] ? '#dc2626' : '#0f172a'}
          >
            {c.suit}
          </text>
          <text
            x={CARD_W / 2}
            y={CARD_H / 2 + 8}
            textAnchor="middle"
            fontSize={28}
            fill={RED[c.suit] ? '#dc2626' : '#0f172a'}
          >
            {c.suit}
          </text>
        </>
      ) : (
        <>
          {/* Back pattern */}
          <rect x={4} y={4} width={CARD_W - 8} height={CARD_H - 8} rx={3} fill="#3b82f6" opacity={0.5} />
          <text x={CARD_W / 2} y={CARD_H / 2 + 6} textAnchor="middle" fontSize={20} fill="white">
            ★
          </text>
        </>
      )}
    </g>
  );

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-2">
        <button
          onClick={reset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <RefreshCw className="w-3.5 h-3.5" /> New game
        </button>
      </div>

      <StatusBar tone={tone}>
        {done === 'won'
          ? `Cleared! Score ${score}`
          : done === 'stuck'
          ? `Stuck — final score ${score}`
          : `Score ${score} · Streak ${streak} · Stock ${state.stock.length}`}
      </StatusBar>

      <div className="relative w-full overflow-x-auto" style={{ maxWidth: 900 }}>
        <svg
          viewBox={`0 0 ${boardW} ${boardH}`}
          className="w-full rounded-2xl shadow-xl"
          style={{ background: 'linear-gradient(135deg, #065f46, #022c22)', aspectRatio: `${boardW} / ${boardH}`, minWidth: 500 }}
        >
          {state.slots.map((s) => {
            if (s.removed) return null;
            const x = s.x * HALF_X + 10;
            const y = ROW_Y(s.row);
            const playable = s.faceUp && isSlotFree(s) && topWaste && adjacent(s.card.rank, topWaste.rank);
            return renderCard(
              s.card,
              s.faceUp,
              x,
              y,
              `slot-${s.id}`,
              !!playable,
              () => clickSlot(s.id),
            );
          })}
        </svg>
      </div>

      {/* Stock + waste */}
      <div className="flex items-center gap-4">
        <button
          onClick={drawStock}
          disabled={!state.stock.length || !!done}
          className="relative disabled:opacity-40"
          aria-label="Draw from stock"
        >
          <svg width={CARD_W + 6} height={CARD_H + 6} viewBox={`0 0 ${CARD_W + 6} ${CARD_H + 6}`}>
            <rect x={3} y={3} width={CARD_W} height={CARD_H} rx={6} fill="#1e3a8a" stroke="#0f172a" strokeWidth={1.5} />
            <text x={(CARD_W + 6) / 2} y={(CARD_H + 6) / 2 + 4} textAnchor="middle" fontSize={14} fontWeight={700} fill="white">
              {state.stock.length}
            </text>
          </svg>
        </button>

        <div className="flex items-center gap-1">
          {state.waste.slice(-4).map((c, i) => {
            const isTop = i === state.waste.slice(-4).length - 1;
            return (
              <svg key={state.waste.length - 4 + i} width={CARD_W + 6} height={CARD_H + 6} viewBox={`0 0 ${CARD_W + 6} ${CARD_H + 6}`}>
                <g transform="translate(3,3)">
                  <rect width={CARD_W} height={CARD_H} rx={6} fill="#fefce8" stroke={isTop ? '#f59e0b' : '#0f172a'} strokeWidth={isTop ? 3 : 1.5} />
                  <text x={8} y={18} fontSize={15} fontWeight={700} fill={RED[c.suit] ? '#dc2626' : '#0f172a'}>{rankLabel(c.rank)}</text>
                  <text x={8} y={33} fontSize={13} fill={RED[c.suit] ? '#dc2626' : '#0f172a'}>{c.suit}</text>
                  <text x={CARD_W / 2} y={CARD_H / 2 + 8} textAnchor="middle" fontSize={28} fill={RED[c.suit] ? '#dc2626' : '#0f172a'}>{c.suit}</text>
                </g>
              </svg>
            );
          })}
        </div>
      </div>

      {done && (
        <WinOverlay
          title={done === 'won' ? 'Cleared!' : 'Stuck'}
          subtitle={`Score ${score}`}
          onPlayAgain={reset}
          playAgainLabel="New deal"
        />
      )}
    </div>
  );
};

export default TriPeaks;
