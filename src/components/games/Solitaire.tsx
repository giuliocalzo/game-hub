import React, { useCallback, useMemo, useState } from 'react';
import StatusBar, { StatusTone } from '../shared/StatusBar';
import WinOverlay from '../shared/WinOverlay';

type Suit = '♠' | '♥' | '♦' | '♣';
type Card = { rank: number; suit: Suit; id: string; faceUp: boolean };

const RANK_LABEL: Record<number, string> = { 1: 'A', 11: 'J', 12: 'Q', 13: 'K' };
const labelOf = (r: number) => RANK_LABEL[r] ?? String(r);
const isRed = (s: Suit) => s === '♥' || s === '♦';

type Sel =
  | { type: 'tableau'; col: number; idx: number }
  | { type: 'waste' }
  | { type: 'foundation'; i: number }
  | null;

const buildDeck = (): Card[] => {
  const suits: Suit[] = ['♠', '♥', '♦', '♣'];
  const deck: Card[] = [];
  for (const s of suits) for (let r = 1; r <= 13; r++)
    deck.push({ rank: r, suit: s, id: `${r}${s}`, faceUp: false });
  return deck.sort(() => Math.random() - 0.5);
};

interface State {
  tableau: Card[][];
  foundations: Card[][];
  stock: Card[];
  waste: Card[];
}

const initial = (): State => {
  const deck = buildDeck();
  const tableau: Card[][] = [[], [], [], [], [], [], []];
  for (let col = 0; col < 7; col++) {
    for (let i = 0; i <= col; i++) {
      const c = deck.shift()!;
      tableau[col].push({ ...c, faceUp: i === col });
    }
  }
  return {
    tableau,
    foundations: [[], [], [], []],
    stock: deck,
    waste: [],
  };
};

const Solitaire: React.FC<{ isBotEnabled: boolean }> = () => {
  const [s, setS] = useState<State>(initial);
  const [sel, setSel] = useState<Sel>(null);
  const [moves, setMoves] = useState(0);

  const reset = () => {
    setS(initial());
    setSel(null);
    setMoves(0);
  };

  const won = useMemo(
    () => s.foundations.every((f) => f.length === 13),
    [s.foundations],
  );

  const topOf = (pile: Card[]) => pile[pile.length - 1];

  const canStackOnTableau = (moving: Card, dest?: Card): boolean => {
    if (!dest) return moving.rank === 13;
    return dest.faceUp && dest.rank === moving.rank + 1 && isRed(dest.suit) !== isRed(moving.suit);
  };

  const canStackOnFoundation = (moving: Card, fIdx: number): boolean => {
    const pile = s.foundations[fIdx];
    if (!pile.length) return moving.rank === 1;
    const top = topOf(pile);
    return top.suit === moving.suit && top.rank + 1 === moving.rank;
  };

  const commit = (next: State) => {
    // Flip top of tableau if face-down after move
    const tableau = next.tableau.map((col) => {
      if (col.length && !col[col.length - 1].faceUp) {
        const dup = col.slice();
        dup[dup.length - 1] = { ...dup[dup.length - 1], faceUp: true };
        return dup;
      }
      return col;
    });
    setS({ ...next, tableau });
    setSel(null);
    setMoves((m) => m + 1);
  };

  const clickStock = () => {
    if (s.stock.length === 0) {
      if (!s.waste.length) return;
      const next: State = {
        ...s,
        stock: s.waste.slice().reverse().map((c) => ({ ...c, faceUp: false })),
        waste: [],
      };
      setS(next);
      return;
    }
    const drawn = { ...s.stock[0], faceUp: true };
    commit({
      ...s,
      stock: s.stock.slice(1),
      waste: [...s.waste, drawn],
    });
  };

  const clickFoundation = (fIdx: number) => {
    if (!sel) {
      if (s.foundations[fIdx].length) setSel({ type: 'foundation', i: fIdx });
      return;
    }
    // Move to foundation
    const moving = getSelectedCard();
    if (!moving) { setSel(null); return; }
    if (!canStackOnFoundation(moving, fIdx)) { setSel(null); return; }
    applyMove('foundation', fIdx);
  };

  const clickWaste = () => {
    if (!sel) {
      if (s.waste.length) setSel({ type: 'waste' });
      return;
    }
    setSel(null);
  };

  const clickTableau = (col: number, idx: number) => {
    if (!sel) {
      const card = s.tableau[col][idx];
      if (!card.faceUp) return;
      setSel({ type: 'tableau', col, idx });
      return;
    }
    // Destination: only tail card matters; idx ignored
    applyMove('tableau', col);
  };

  const getSelectedCard = useCallback((): Card | null => {
    if (!sel) return null;
    if (sel.type === 'waste') return s.waste[s.waste.length - 1] ?? null;
    if (sel.type === 'foundation') return s.foundations[sel.i][s.foundations[sel.i].length - 1] ?? null;
    return s.tableau[sel.col][sel.idx] ?? null;
  }, [sel, s]);

  const applyMove = (destType: 'tableau' | 'foundation', destIdx: number) => {
    if (!sel) return;
    const moving = getSelectedCard();
    if (!moving) { setSel(null); return; }

    if (destType === 'foundation') {
      if (sel.type === 'tableau' && sel.idx !== s.tableau[sel.col].length - 1) { setSel(null); return; }
      if (!canStackOnFoundation(moving, destIdx)) { setSel(null); return; }
      const next: State = { ...s, foundations: s.foundations.map((f, i) => (i === destIdx ? [...f, { ...moving }] : f)) };
      if (sel.type === 'tableau') {
        next.tableau = s.tableau.map((col, i) => (i === sel.col ? col.slice(0, sel.idx) : col));
      } else if (sel.type === 'waste') {
        next.waste = s.waste.slice(0, -1);
      } else if (sel.type === 'foundation') {
        next.foundations = next.foundations.map((f, i) =>
          i === sel.i ? f.slice(0, -1) : i === destIdx ? f : f,
        );
      }
      commit(next);
      return;
    }

    // destType === 'tableau'
    const destCol = s.tableau[destIdx];
    const destTop = topOf(destCol);
    if (!canStackOnTableau(moving, destTop)) { setSel(null); return; }

    let movingStack: Card[] = [];
    const next: State = { ...s };
    if (sel.type === 'tableau') {
      movingStack = s.tableau[sel.col].slice(sel.idx);
      next.tableau = s.tableau.map((col, i) =>
        i === sel.col ? col.slice(0, sel.idx) : i === destIdx ? [...col, ...movingStack] : col,
      );
    } else if (sel.type === 'waste') {
      movingStack = [s.waste[s.waste.length - 1]];
      next.waste = s.waste.slice(0, -1);
      next.tableau = s.tableau.map((col, i) => (i === destIdx ? [...col, ...movingStack] : col));
    } else if (sel.type === 'foundation') {
      movingStack = [s.foundations[sel.i][s.foundations[sel.i].length - 1]];
      next.foundations = s.foundations.map((f, i) => (i === sel.i ? f.slice(0, -1) : f));
      next.tableau = s.tableau.map((col, i) => (i === destIdx ? [...col, ...movingStack] : col));
    }
    commit(next);
  };

  const tone: StatusTone = won ? 'success' : 'info';

  const cardEl = (c: Card, opts?: { small?: boolean; selected?: boolean }) => (
    <div
      className={`w-10 h-14 md:w-12 md:h-16 rounded-md border-2 flex items-center justify-center text-xs md:text-sm font-bold shadow-sm ${
        !c.faceUp
          ? 'bg-gradient-to-br from-indigo-500 to-purple-700 border-white'
          : 'bg-white border-gray-300'
      } ${opts?.selected ? 'ring-2 ring-yellow-300 -translate-y-1' : ''}`}
    >
      {c.faceUp && (
        <span className={isRed(c.suit) ? 'text-rose-500' : 'text-gray-900'}>
          {labelOf(c.rank)}{c.suit}
        </span>
      )}
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-4">
      <StatusBar tone={tone}>
        {won ? `Solved in ${moves} moves!` : `Moves: ${moves}`}
      </StatusBar>

      <div className="flex gap-3 items-start">
        {/* Stock + Waste */}
        <div className="flex flex-col gap-2">
          <button onClick={clickStock} aria-label="Stock">
            {s.stock.length ? cardEl({ ...s.stock[0], faceUp: false }) : (
              <div className="w-10 h-14 md:w-12 md:h-16 rounded-md border-2 border-dashed border-gray-300 text-xs text-gray-400 flex items-center justify-center">↻</div>
            )}
          </button>
          <button onClick={clickWaste} className="relative" aria-label="Waste">
            {s.waste.length ? cardEl(s.waste[s.waste.length - 1], { selected: sel?.type === 'waste' }) : (
              <div className="w-10 h-14 md:w-12 md:h-16 rounded-md border-2 border-dashed border-gray-300" />
            )}
          </button>
        </div>

        <div className="flex-1" />

        {/* Foundations */}
        <div className="flex gap-2">
          {s.foundations.map((f, i) => (
            <button
              key={i}
              onClick={() => clickFoundation(i)}
              className="relative"
              aria-label={`Foundation ${i + 1}`}
            >
              {f.length ? cardEl(f[f.length - 1], { selected: sel?.type === 'foundation' && sel.i === i }) : (
                <div className="w-10 h-14 md:w-12 md:h-16 rounded-md border-2 border-dashed border-gray-300 text-xs text-gray-400 flex items-center justify-center">A</div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tableau */}
      <div className="grid grid-cols-7 gap-2">
        {s.tableau.map((col, ci) => (
          <div key={ci} className="relative min-h-[8rem]">
            {col.length === 0 ? (
              <button
                onClick={() => clickTableau(ci, 0)}
                className="w-10 h-14 md:w-12 md:h-16 rounded-md border-2 border-dashed border-gray-300"
              />
            ) : (
              col.map((c, idx) => (
                <button
                  key={c.id}
                  onClick={() => clickTableau(ci, idx)}
                  className="absolute left-0"
                  style={{ top: `${idx * 22}px` }}
                >
                  {cardEl(c, {
                    selected:
                      sel?.type === 'tableau' && sel.col === ci && idx >= sel.idx,
                  })}
                </button>
              ))
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-2">
        <button
          onClick={reset}
          className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm font-semibold shadow hover:bg-gray-50"
        >
          New deal
        </button>
      </div>

      {won && (
        <WinOverlay
          title="Solved!"
          subtitle={`In ${moves} moves.`}
          onPlayAgain={reset}
          playAgainLabel="New deal"
        />
      )}

    </div>
  );
};

export default Solitaire;
