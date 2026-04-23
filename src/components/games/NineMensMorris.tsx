import React, { useCallback, useEffect, useMemo, useState } from 'react';
import StatusBar, { StatusTone } from '../shared/StatusBar';
import WinOverlay from '../shared/WinOverlay';

// 24 points on three concentric squares, connected as in the standard Nine Men's Morris diagram.
// Coordinate system (SVG 400×400):
const PTS: Array<{ x: number; y: number }> = [
  // outer square corners + edges
  { x: 40, y: 40 }, { x: 200, y: 40 }, { x: 360, y: 40 },        // 0,1,2
  { x: 40, y: 200 },                    { x: 360, y: 200 },       // 3,4
  { x: 40, y: 360 }, { x: 200, y: 360 }, { x: 360, y: 360 },       // 5,6,7
  // middle square
  { x: 100, y: 100 }, { x: 200, y: 100 }, { x: 300, y: 100 },     // 8,9,10
  { x: 100, y: 200 },                    { x: 300, y: 200 },      // 11,12
  { x: 100, y: 300 }, { x: 200, y: 300 }, { x: 300, y: 300 },     // 13,14,15
  // inner square
  { x: 160, y: 160 }, { x: 200, y: 160 }, { x: 240, y: 160 },     // 16,17,18
  { x: 160, y: 200 },                    { x: 240, y: 200 },      // 19,20
  { x: 160, y: 240 }, { x: 200, y: 240 }, { x: 240, y: 240 },     // 21,22,23
];

// Adjacency list
const ADJ: number[][] = [
  [1, 3],       // 0
  [0, 2, 9],    // 1
  [1, 4],       // 2
  [0, 5, 11],   // 3
  [2, 7, 12],   // 4
  [3, 6],       // 5
  [5, 7, 14],   // 6
  [4, 6],       // 7
  [9, 11],      // 8
  [1, 8, 10, 17], // 9
  [9, 12],      // 10
  [3, 8, 13, 19], // 11
  [4, 10, 15, 20], // 12
  [11, 14],     // 13
  [6, 13, 15, 22], // 14
  [12, 14],     // 15
  [17, 19],     // 16
  [9, 16, 18],  // 17
  [17, 20],     // 18
  [11, 16, 21], // 19
  [12, 18, 23], // 20
  [19, 22],     // 21
  [14, 21, 23], // 22
  [20, 22],     // 23
];

// Mills — triples that form a line
const CLEAN_MILLS: Array<[number, number, number]> = [
  // outer square lines
  [0, 1, 2], [5, 6, 7], [0, 3, 5], [2, 4, 7],
  // middle square
  [8, 9, 10], [13, 14, 15], [8, 11, 13], [10, 12, 15],
  // inner square
  [16, 17, 18], [21, 22, 23], [16, 19, 21], [18, 20, 23],
  // spokes connecting squares
  [1, 9, 17], [6, 14, 22], [3, 11, 19], [4, 12, 20],
];

type Cell = 0 | 1 | null; // 0 = P1 (blue), 1 = P2/Bot (red), null = empty
type Phase = 'place' | 'move' | 'remove';

interface State {
  board: Cell[];
  current: 0 | 1;
  phase: Phase;
  phaseBefore: Phase; // to restore after removal
  placed: [number, number];   // stones placed so far by each player
  onBoard: [number, number];  // stones currently on board
  selected: number | null;    // for move phase
  winner: 0 | 1 | null;
  lastMillKeys: Set<string>;  // mills already formed (to detect new mills)
}

const initial = (): State => ({
  board: Array(24).fill(null),
  current: 0,
  phase: 'place',
  phaseBefore: 'place',
  placed: [0, 0],
  onBoard: [0, 0],
  selected: null,
  winner: null,
  lastMillKeys: new Set(),
});

const millsContaining = (i: number) => CLEAN_MILLS.filter((m) => m.includes(i));

const findNewMill = (board: Cell[], player: 0 | 1, at: number): boolean => {
  for (const m of millsContaining(at)) {
    if (m.every((p) => board[p] === player)) return true;
  }
  return false;
};

const canMove = (board: Cell[], player: 0 | 1, onBoardCount: number): boolean => {
  // If player has 3 pieces, they can "fly" anywhere — always has a move if any empty exists
  if (onBoardCount === 3) return board.some((v) => v === null);
  for (let i = 0; i < 24; i++) {
    if (board[i] !== player) continue;
    for (const n of ADJ[i]) if (board[n] === null) return true;
  }
  return false;
};

const opponent = (p: 0 | 1): 0 | 1 => (p === 0 ? 1 : 0);

const NineMensMorris: React.FC<{ isBotEnabled: boolean }> = ({ isBotEnabled }) => {
  const [s, setS] = useState<State>(initial);

  const reset = useCallback(() => setS(initial()), []);

  const placeAt = useCallback(
    (i: number) => {
      setS((prev) => {
        if (prev.winner !== null) return prev;
        if (prev.phase !== 'place') return prev;
        if (prev.board[i] !== null) return prev;
        const board = prev.board.slice();
        board[i] = prev.current;
        const placed: [number, number] = [...prev.placed] as [number, number];
        placed[prev.current]++;
        const onBoard: [number, number] = [...prev.onBoard] as [number, number];
        onBoard[prev.current]++;

        const mill = findNewMill(board, prev.current, i);
        if (mill) {
          return { ...prev, board, placed, onBoard, phase: 'remove', phaseBefore: placed[0] === 9 && placed[1] === 9 ? 'move' : 'place' };
        }
        const allPlaced = placed[0] === 9 && placed[1] === 9;
        const nextPhase: Phase = allPlaced ? 'move' : 'place';
        const nextPlayer = opponent(prev.current);
        // If next player has no move
        if (nextPhase === 'move' && !canMove(board, nextPlayer, onBoard[nextPlayer])) {
          return { ...prev, board, placed, onBoard, phase: nextPhase, current: nextPlayer, winner: prev.current };
        }
        return { ...prev, board, placed, onBoard, phase: nextPhase, current: nextPlayer, selected: null };
      });
    },
    [],
  );

  const moveTo = useCallback(
    (from: number, to: number) => {
      setS((prev) => {
        if (prev.winner !== null) return prev;
        if (prev.phase !== 'move') return prev;
        if (prev.board[from] !== prev.current || prev.board[to] !== null) return prev;
        const flying = prev.onBoard[prev.current] === 3;
        if (!flying && !ADJ[from].includes(to)) return prev;
        const board = prev.board.slice();
        board[from] = null;
        board[to] = prev.current;
        const mill = findNewMill(board, prev.current, to);
        if (mill) {
          return { ...prev, board, selected: null, phase: 'remove', phaseBefore: 'move' };
        }
        const nextPlayer = opponent(prev.current);
        if (!canMove(board, nextPlayer, prev.onBoard[nextPlayer])) {
          return { ...prev, board, selected: null, current: nextPlayer, winner: prev.current };
        }
        return { ...prev, board, selected: null, current: nextPlayer };
      });
    },
    [],
  );

  const removePiece = useCallback(
    (i: number) => {
      setS((prev) => {
        if (prev.winner !== null) return prev;
        if (prev.phase !== 'remove') return prev;
        const target = opponent(prev.current);
        if (prev.board[i] !== target) return prev;
        // can't remove from opponent's mill unless all opponent pieces are in mills
        const inMill = millsContaining(i).some((m) => m.every((p) => prev.board[p] === target));
        if (inMill) {
          const allInMill = prev.board.every((v, idx) =>
            v !== target || millsContaining(idx).some((m) => m.every((p) => prev.board[p] === target)),
          );
          if (!allInMill) return prev;
        }
        const board = prev.board.slice();
        board[i] = null;
        const onBoard: [number, number] = [...prev.onBoard] as [number, number];
        onBoard[target]--;
        // Win: opponent reduced below 3 after placement phase ended
        if (prev.placed[target] === 9 && onBoard[target] < 3) {
          return { ...prev, board, onBoard, phase: 'move', winner: prev.current };
        }
        const nextPhase = prev.phaseBefore;
        const nextPlayer = opponent(prev.current);
        if (nextPhase === 'move' && !canMove(board, nextPlayer, onBoard[nextPlayer])) {
          return { ...prev, board, onBoard, phase: nextPhase, current: nextPlayer, winner: prev.current };
        }
        return { ...prev, board, onBoard, phase: nextPhase, current: nextPlayer, selected: null };
      });
    },
    [],
  );

  const onClickPoint = (i: number) => {
    if (s.winner !== null) return;
    // Bot blocks player input when it's bot's turn
    if (isBotEnabled && s.current === 1) return;
    if (s.phase === 'place') placeAt(i);
    else if (s.phase === 'move') {
      if (s.board[i] === s.current) {
        setS((p) => ({ ...p, selected: p.selected === i ? null : i }));
      } else if (s.selected !== null && s.board[i] === null) {
        moveTo(s.selected, i);
      }
    } else if (s.phase === 'remove') {
      removePiece(i);
    }
  };

  // Bot: simple, prefers forming mills, else blocks opponent mills, else picks a legal move
  useEffect(() => {
    if (!isBotEnabled || s.winner !== null || s.current !== 1) return;
    const t = setTimeout(() => {
      setS((prev) => {
        if (prev.current !== 1 || prev.winner !== null) return prev;
        const BOT = 1 as const;
        const YOU = 0 as const;

        const tryMill = (board: Cell[], who: 0 | 1): number[] | null => {
          for (const m of CLEAN_MILLS) {
            const vals = m.map((p) => board[p]);
            const same = vals.filter((v) => v === who).length;
            const empty = vals.filter((v) => v === null).length;
            if (same === 2 && empty === 1) {
              const slot = m[vals.indexOf(null)];
              return [slot];
            }
          }
          return null;
        };

        if (prev.phase === 'place') {
          // Form own mill
          const formMill = tryMill(prev.board, BOT);
          if (formMill) {
            placeAt(formMill[0]);
            return prev;
          }
          // Block opponent
          const blockMill = tryMill(prev.board, YOU);
          if (blockMill) {
            placeAt(blockMill[0]);
            return prev;
          }
          // Otherwise center-ish: prefer empty with most adjacencies
          let best = -1, bestScore = -1;
          for (let i = 0; i < 24; i++) {
            if (prev.board[i] !== null) continue;
            const score = ADJ[i].length;
            if (score > bestScore) { bestScore = score; best = i; }
          }
          if (best >= 0) placeAt(best);
          return prev;
        }

        if (prev.phase === 'remove') {
          // Remove any non-mill opponent piece
          const target = YOU;
          const candidates: number[] = [];
          const strictOnes: number[] = [];
          for (let i = 0; i < 24; i++) {
            if (prev.board[i] !== target) continue;
            const inMill = millsContaining(i).some((m) => m.every((p) => prev.board[p] === target));
            if (!inMill) strictOnes.push(i);
            candidates.push(i);
          }
          const pick = strictOnes.length ? strictOnes : candidates;
          if (pick.length) removePiece(pick[0]);
          return prev;
        }

        if (prev.phase === 'move') {
          // Generate all legal moves
          const flying = prev.onBoard[BOT] === 3;
          const moves: Array<{ from: number; to: number; formsMill: boolean; blocks: boolean }> = [];
          for (let f = 0; f < 24; f++) {
            if (prev.board[f] !== BOT) continue;
            const tos = flying ? Array.from({ length: 24 }, (_, k) => k).filter((k) => prev.board[k] === null) : ADJ[f].filter((k) => prev.board[k] === null);
            for (const t of tos) {
              const next = prev.board.slice();
              next[f] = null;
              next[t] = BOT;
              const forms = findNewMill(next, BOT, t);
              // blocks: would player form a mill there if we didn't move?
              const opp = tryMill(prev.board, YOU);
              const blocks = opp ? opp[0] === t : false;
              moves.push({ from: f, to: t, formsMill: forms, blocks });
            }
          }
          if (!moves.length) return prev;
          moves.sort((a, b) => {
            if (a.formsMill !== b.formsMill) return a.formsMill ? -1 : 1;
            if (a.blocks !== b.blocks) return a.blocks ? -1 : 1;
            return 0;
          });
          const m = moves[0];
          moveTo(m.from, m.to);
          return prev;
        }

        return prev;
      });
    }, 700);
    return () => clearTimeout(t);
  }, [isBotEnabled, s, placeAt, moveTo, removePiece]);

  const tone: StatusTone =
    s.winner !== null
      ? 'success'
      : s.phase === 'remove'
        ? 'warning'
        : isBotEnabled && s.current === 1
          ? 'purple'
          : 'info';

  const status = useMemo(() => {
    if (s.winner !== null) return `${s.winner === 0 ? 'Player 1' : isBotEnabled ? 'Bot' : 'Player 2'} wins!`;
    const who = s.current === 0 ? 'Player 1' : isBotEnabled ? 'Bot' : 'Player 2';
    if (s.phase === 'remove') return `Mill! ${who} removes an opponent piece.`;
    if (s.phase === 'place') {
      const left0 = 9 - s.placed[0];
      const left1 = 9 - s.placed[1];
      return `${who}'s turn — place a stone (P1 left: ${left0}, P2 left: ${left1}).`;
    }
    return `${who}'s turn — move a stone.`;
  }, [s, isBotEnabled]);

  const color = (c: Cell) => (c === 0 ? '#3b82f6' : c === 1 ? '#ef4444' : null);

  return (
    <div className="flex flex-col items-center gap-5">
      <StatusBar tone={tone}>{status}</StatusBar>

      <div className="relative">
        <svg
          viewBox="0 0 400 400"
          className="w-full max-w-md rounded-2xl shadow-xl"
          style={{ background: '#f3e8d3' }}
        >
          {/* Squares */}
          <rect x="40" y="40" width="320" height="320" fill="none" stroke="#78350f" strokeWidth="3" />
          <rect x="100" y="100" width="200" height="200" fill="none" stroke="#78350f" strokeWidth="3" />
          <rect x="160" y="160" width="80" height="80" fill="none" stroke="#78350f" strokeWidth="3" />
          {/* Spokes */}
          <line x1="200" y1="40" x2="200" y2="160" stroke="#78350f" strokeWidth="3" />
          <line x1="200" y1="240" x2="200" y2="360" stroke="#78350f" strokeWidth="3" />
          <line x1="40" y1="200" x2="160" y2="200" stroke="#78350f" strokeWidth="3" />
          <line x1="240" y1="200" x2="360" y2="200" stroke="#78350f" strokeWidth="3" />

          {/* Points */}
          {PTS.map((p, i) => {
            const occ = s.board[i];
            const clickable =
              s.winner === null &&
              (s.phase === 'place'
                ? occ === null
                : s.phase === 'remove'
                  ? occ === opponent(s.current)
                  : occ === s.current || (s.selected !== null && occ === null));
            const highlighted = s.selected === i;
            return (
              <g key={i} onClick={() => clickable && onClickPoint(i)} style={{ cursor: clickable ? 'pointer' : 'default' }}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={occ === null ? 10 : 16}
                  fill={color(occ) ?? '#78350f'}
                  stroke={highlighted ? '#facc15' : 'white'}
                  strokeWidth={highlighted ? 4 : occ === null ? 0 : 2}
                />
                {clickable && occ === null && (
                  <circle cx={p.x} cy={p.y} r={18} fill="transparent" stroke="#fcd34d" strokeDasharray="3 3" strokeOpacity="0.5" />
                )}
              </g>
            );
          })}
        </svg>

        {s.winner !== null && (
          <WinOverlay
            title={`${s.winner === 0 ? 'Player 1' : isBotEnabled ? 'Bot' : 'Player 2'} wins!`}
            subtitle="Opponent has under 3 pieces or can't move."
            onPlayAgain={reset}
          />
        )}
      </div>

      <div className="flex gap-4 text-xs text-gray-600 dark:text-gray-300">
        <span>
          <span className="inline-block w-3 h-3 rounded-full bg-blue-500 align-middle mr-1" />
          P1 placed: {s.placed[0]}/9 · on board: {s.onBoard[0]}
        </span>
        <span>
          <span className="inline-block w-3 h-3 rounded-full bg-red-500 align-middle mr-1" />
          {isBotEnabled ? 'Bot' : 'P2'} placed: {s.placed[1]}/9 · on board: {s.onBoard[1]}
        </span>
      </div>
    </div>
  );
};

export default NineMensMorris;
