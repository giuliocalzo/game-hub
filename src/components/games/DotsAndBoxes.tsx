import React, { useCallback, useEffect, useMemo, useState } from 'react';
import StatusBar, { StatusTone } from '../shared/StatusBar';
import WinOverlay from '../shared/WinOverlay';

const SIZE = 5; // dots per side → (SIZE-1) boxes per side

type Player = 0 | 1;

interface State {
  hLines: boolean[][]; // (SIZE) rows of (SIZE-1) horizontal lines
  vLines: boolean[][]; // (SIZE-1) rows of (SIZE) vertical lines
  boxes: (Player | null)[][];
  current: Player;
  scores: [number, number];
}

const init = (): State => ({
  hLines: Array.from({ length: SIZE }, () => Array(SIZE - 1).fill(false)),
  vLines: Array.from({ length: SIZE - 1 }, () => Array(SIZE).fill(false)),
  boxes: Array.from({ length: SIZE - 1 }, () => Array(SIZE - 1).fill(null)),
  current: 0,
  scores: [0, 0],
});

const boxCompleted = (h: boolean[][], v: boolean[][], r: number, c: number): boolean =>
  h[r][c] && h[r + 1][c] && v[r][c] && v[r][c + 1];

const DotsAndBoxes: React.FC<{ isBotEnabled: boolean }> = ({ isBotEnabled }) => {
  const [s, setS] = useState<State>(init);

  const total = (SIZE - 1) * (SIZE - 1);
  const done = s.scores[0] + s.scores[1] >= total;

  const apply = useCallback(
    (type: 'h' | 'v', r: number, c: number) => {
      if (done) return;
      if (type === 'h' && s.hLines[r][c]) return;
      if (type === 'v' && s.vLines[r][c]) return;
      const h = s.hLines.map((row) => row.slice());
      const v = s.vLines.map((row) => row.slice());
      if (type === 'h') h[r][c] = true;
      else v[r][c] = true;

      let completed = 0;
      const boxes = s.boxes.map((row) => row.slice());
      for (let i = 0; i < SIZE - 1; i++) {
        for (let j = 0; j < SIZE - 1; j++) {
          if (!boxes[i][j] && boxCompleted(h, v, i, j)) {
            boxes[i][j] = s.current;
            completed++;
          }
        }
      }
      const scores: [number, number] = [...s.scores] as [number, number];
      scores[s.current] += completed;
      const nextPlayer: Player = completed > 0 ? s.current : (s.current === 0 ? 1 : 0);
      setS({ hLines: h, vLines: v, boxes, scores, current: nextPlayer });
    },
    [s, done],
  );

  // Bot for player 1
  useEffect(() => {
    if (!isBotEnabled || s.current !== 1 || done) return;
    const t = setTimeout(() => {
      // Prefer lines that complete a box
      const options: Array<{ type: 'h' | 'v'; r: number; c: number; completes: number }> = [];
      for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE - 1; c++) if (!s.hLines[r][c]) {
        const h = s.hLines.map((row) => row.slice()); h[r][c] = true;
        let cpl = 0;
        for (let i = 0; i < SIZE - 1; i++) for (let j = 0; j < SIZE - 1; j++)
          if (!s.boxes[i][j] && boxCompleted(h, s.vLines, i, j)) cpl++;
        options.push({ type: 'h', r, c, completes: cpl });
      }
      for (let r = 0; r < SIZE - 1; r++) for (let c = 0; c < SIZE; c++) if (!s.vLines[r][c]) {
        const v = s.vLines.map((row) => row.slice()); v[r][c] = true;
        let cpl = 0;
        for (let i = 0; i < SIZE - 1; i++) for (let j = 0; j < SIZE - 1; j++)
          if (!s.boxes[i][j] && boxCompleted(s.hLines, v, i, j)) cpl++;
        options.push({ type: 'v', r, c, completes: cpl });
      }
      if (!options.length) return;
      options.sort((a, b) => b.completes - a.completes);
      const best = options[0];
      // If nothing completes, play a random "safe" line that doesn't give 3-sided box
      if (best.completes === 0) {
        const safe = options.filter((o) => {
          const h = s.hLines.map((row) => row.slice());
          const v = s.vLines.map((row) => row.slice());
          if (o.type === 'h') h[o.r][o.c] = true; else v[o.r][o.c] = true;
          // For each adjacent box, count edges
          const checkBox = (i: number, j: number) => {
            if (i < 0 || j < 0 || i >= SIZE - 1 || j >= SIZE - 1) return 0;
            let edges = 0;
            if (h[i][j]) edges++;
            if (h[i + 1][j]) edges++;
            if (v[i][j]) edges++;
            if (v[i][j + 1]) edges++;
            return edges;
          };
          let risky = false;
          if (o.type === 'h') {
            if (checkBox(o.r - 1, o.c) === 3) risky = true;
            if (checkBox(o.r, o.c) === 3) risky = true;
          } else {
            if (checkBox(o.r, o.c - 1) === 3) risky = true;
            if (checkBox(o.r, o.c) === 3) risky = true;
          }
          return !risky;
        });
        const pick = safe.length ? safe[Math.floor(Math.random() * safe.length)] : best;
        apply(pick.type, pick.r, pick.c);
      } else {
        apply(best.type, best.r, best.c);
      }
    }, 600);
    return () => clearTimeout(t);
  }, [isBotEnabled, s, done, apply]);

  const reset = () => setS(init());

  const winnerLabel = useMemo(() => {
    if (!done) return null;
    if (s.scores[0] > s.scores[1]) return 'Player 1';
    if (s.scores[1] > s.scores[0]) return isBotEnabled ? 'Bot' : 'Player 2';
    return 'Tie';
  }, [done, s.scores, isBotEnabled]);

  const tone: StatusTone = done ? 'success' : isBotEnabled && s.current === 1 ? 'purple' : 'info';

  return (
    <div className="flex flex-col items-center gap-5">
      <StatusBar tone={tone}>
        {done
          ? `Final: ${s.scores[0]} – ${s.scores[1]}`
          : `${s.current === 0 ? 'Player 1' : isBotEnabled ? 'Bot' : 'Player 2'}'s turn · ${s.scores[0]} – ${s.scores[1]}`}
      </StatusBar>

      <div className="relative">
        <div
          className="p-4 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-100 shadow-inner"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${SIZE * 2 - 1}, auto)`,
            gap: 0,
          }}
        >
          {Array.from({ length: SIZE * 2 - 1 }).flatMap((_, row) =>
            Array.from({ length: SIZE * 2 - 1 }).map((_, col) => {
              const isDotRow = row % 2 === 0;
              const isDotCol = col % 2 === 0;
              if (isDotRow && isDotCol) {
                return <div key={`${row}-${col}`} className="w-3 h-3 rounded-full bg-gray-900" />;
              }
              if (isDotRow && !isDotCol) {
                const r = row / 2;
                const c = (col - 1) / 2;
                const drawn = s.hLines[r][c];
                return (
                  <button
                    key={`${row}-${col}`}
                    onClick={() => apply('h', r, c)}
                    disabled={drawn || done || (isBotEnabled && s.current === 1)}
                    className={`h-3 w-10 md:w-12 mx-0 ${
                      drawn ? 'bg-gray-800' : 'bg-transparent hover:bg-gray-300'
                    }`}
                    aria-label={`horizontal line ${r} ${c}`}
                  />
                );
              }
              if (!isDotRow && isDotCol) {
                const r = (row - 1) / 2;
                const c = col / 2;
                const drawn = s.vLines[r][c];
                return (
                  <button
                    key={`${row}-${col}`}
                    onClick={() => apply('v', r, c)}
                    disabled={drawn || done || (isBotEnabled && s.current === 1)}
                    className={`w-3 h-10 md:h-12 ${
                      drawn ? 'bg-gray-800' : 'bg-transparent hover:bg-gray-300'
                    }`}
                    aria-label={`vertical line ${r} ${c}`}
                  />
                );
              }
              // Box center
              const r = (row - 1) / 2;
              const c = (col - 1) / 2;
              const owner = s.boxes[r][c];
              return (
                <div
                  key={`${row}-${col}`}
                  className={`w-10 md:w-12 h-10 md:h-12 flex items-center justify-center text-xs font-bold ${
                    owner === 0
                      ? 'bg-blue-200 text-blue-800'
                      : owner === 1
                        ? 'bg-rose-200 text-rose-800'
                        : ''
                  }`}
                >
                  {owner === 0 ? 'P1' : owner === 1 ? 'P2' : ''}
                </div>
              );
            }),
          )}
        </div>
        {done && winnerLabel && (
          <WinOverlay
            title={winnerLabel === 'Tie' ? "It's a tie!" : `${winnerLabel} wins!`}
            subtitle={`${s.scores[0]} – ${s.scores[1]}`}
            tie={winnerLabel === 'Tie'}
            onPlayAgain={reset}
          />
        )}
      </div>

      <p className="text-xs md:text-sm text-gray-500 max-w-md text-center">
        Take turns drawing a line. Complete the 4th side of a box to claim it and play again.
      </p>
    </div>
  );
};

export default DotsAndBoxes;
