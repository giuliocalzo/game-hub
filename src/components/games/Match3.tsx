import React, { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import StatusBar, { StatusTone } from '../shared/StatusBar';
import WinOverlay from '../shared/WinOverlay';

const SIZE = 8;
const GEM_TYPES = ['💎', '🍒', '🍋', '🍇', '🍎', '⭐'];
const GEM_COLORS = ['#38bdf8', '#ef4444', '#facc15', '#a855f7', '#f87171', '#f59e0b'];

const MOVES = 20;

type Board = (number | null)[];

const randGem = (): number => Math.floor(Math.random() * GEM_TYPES.length);

const randomBoard = (): Board => {
  const b: Board = [];
  for (let i = 0; i < SIZE * SIZE; i++) {
    let g: number;
    let attempts = 0;
    do {
      g = randGem();
      attempts++;
      // Avoid creating immediate 3-in-a-row at generation
      const x = i % SIZE;
      const y = Math.floor(i / SIZE);
      const left2 = x >= 2 && b[i - 1] === g && b[i - 2] === g;
      const up2 = y >= 2 && b[i - SIZE] === g && b[i - 2 * SIZE] === g;
      if (!left2 && !up2) break;
    } while (attempts < 20);
    b.push(g);
  }
  return b;
};

const findMatches = (b: Board): Set<number> => {
  const matched = new Set<number>();
  // Horizontal
  for (let y = 0; y < SIZE; y++) {
    let runStart = 0;
    for (let x = 1; x <= SIZE; x++) {
      const prev = b[y * SIZE + x - 1];
      const cur = x < SIZE ? b[y * SIZE + x] : null;
      if (cur !== prev || x === SIZE) {
        const len = x - runStart;
        if (len >= 3 && prev !== null) {
          for (let k = runStart; k < x; k++) matched.add(y * SIZE + k);
        }
        runStart = x;
      }
    }
  }
  // Vertical
  for (let x = 0; x < SIZE; x++) {
    let runStart = 0;
    for (let y = 1; y <= SIZE; y++) {
      const prev = b[(y - 1) * SIZE + x];
      const cur = y < SIZE ? b[y * SIZE + x] : null;
      if (cur !== prev || y === SIZE) {
        const len = y - runStart;
        if (len >= 3 && prev !== null) {
          for (let k = runStart; k < y; k++) matched.add(k * SIZE + x);
        }
        runStart = y;
      }
    }
  }
  return matched;
};

const collapse = (b: Board): Board => {
  const next = b.slice();
  for (let x = 0; x < SIZE; x++) {
    const col: number[] = [];
    for (let y = 0; y < SIZE; y++) {
      const v = next[y * SIZE + x];
      if (v !== null) col.push(v);
    }
    // Fill missing at top
    while (col.length < SIZE) col.unshift(randGem());
    for (let y = 0; y < SIZE; y++) next[y * SIZE + x] = col[y];
  }
  return next;
};

const areAdjacent = (i: number, j: number): boolean => {
  const xi = i % SIZE;
  const yi = Math.floor(i / SIZE);
  const xj = j % SIZE;
  const yj = Math.floor(j / SIZE);
  return Math.abs(xi - xj) + Math.abs(yi - yj) === 1;
};

const Match3: React.FC<{ isBotEnabled: boolean }> = () => {
  const [board, setBoard] = useState<Board>(randomBoard);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [movesLeft, setMovesLeft] = useState(MOVES);
  const [done, setDone] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [highlight, setHighlight] = useState<Set<number>>(new Set());
  const resolveRef = useRef<number | null>(null);

  const reset = useCallback(() => {
    setBoard(randomBoard());
    setSelected(null);
    setScore(0);
    setMovesLeft(MOVES);
    setDone(false);
    setResolving(false);
    setHighlight(new Set());
  }, []);

  useEffect(() => () => {
    if (resolveRef.current !== null) clearTimeout(resolveRef.current);
  }, []);

  const resolve = useCallback((startBoard: Board, combo: number = 0) => {
    const matches = findMatches(startBoard);
    if (matches.size === 0) {
      setResolving(false);
      return;
    }
    setHighlight(matches);
    setScore((s) => s + matches.size * 10 * (combo + 1));
    resolveRef.current = window.setTimeout(() => {
      // Remove matched
      const next: Board = startBoard.map((v, i) => (matches.has(i) ? null : v));
      // Collapse + refill
      const refilled = collapse(next);
      setBoard(refilled);
      setHighlight(new Set());
      // Chain resolve
      resolveRef.current = window.setTimeout(() => resolve(refilled, combo + 1), 200);
    }, 320);
  }, []);

  const trySwap = (i: number, j: number) => {
    const next = board.slice();
    [next[i], next[j]] = [next[j], next[i]];
    const matches = findMatches(next);
    if (matches.size === 0) {
      // Bounce back
      return false;
    }
    setBoard(next);
    setMovesLeft((m) => m - 1);
    setResolving(true);
    resolveRef.current = window.setTimeout(() => resolve(next, 0), 100);
    return true;
  };

  const click = (i: number) => {
    if (done || resolving) return;
    if (selected === null) {
      setSelected(i);
    } else if (selected === i) {
      setSelected(null);
    } else if (areAdjacent(selected, i)) {
      const swapped = trySwap(selected, i);
      setSelected(null);
      if (!swapped) {
        // brief shake could go here
      }
    } else {
      setSelected(i);
    }
  };

  useEffect(() => {
    if (movesLeft <= 0 && !resolving) setDone(true);
  }, [movesLeft, resolving]);

  const tone: StatusTone = done ? 'success' : 'info';

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
        {done
          ? `Game over — ${score} points`
          : `Score ${score} · Moves left ${movesLeft}`}
      </StatusBar>

      <div className="relative w-full" style={{ maxWidth: 520 }}>
        <div
          className="grid gap-1 p-2 sm:p-3 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-400 dark:from-slate-800 dark:to-slate-950 shadow-xl"
          style={{ gridTemplateColumns: `repeat(${SIZE}, minmax(0, 1fr))` }}
        >
          {board.map((g, i) => {
            const isSel = selected === i;
            const isMatched = highlight.has(i);
            const color = g !== null ? GEM_COLORS[g] : 'transparent';
            const emoji = g !== null ? GEM_TYPES[g] : '';
            return (
              <button
                key={i}
                onClick={() => click(i)}
                disabled={done || resolving}
                className={`aspect-square rounded-lg flex items-center justify-center text-2xl sm:text-3xl transition-all shadow ${
                  isMatched
                    ? 'bg-white ring-4 ring-amber-300 scale-110'
                    : isSel
                    ? 'ring-4 ring-amber-300 scale-105'
                    : ''
                }`}
                style={{
                  background: isMatched ? 'white' : color,
                  filter: isMatched ? 'brightness(1.2)' : undefined,
                }}
                aria-label={`Gem ${g}`}
              >
                <span className="drop-shadow-md">{emoji}</span>
              </button>
            );
          })}
        </div>

        {done && (
          <WinOverlay
            title={`${score} points`}
            subtitle={score >= 500 ? 'Gem master!' : score >= 200 ? 'Nice combos' : 'Try again'}
            onPlayAgain={reset}
            playAgainLabel="Play again"
          />
        )}
      </div>
    </div>
  );
};

export default Match3;
