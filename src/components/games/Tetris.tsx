import React, { useCallback, useEffect, useRef, useState } from 'react';
import StatusBar, { StatusTone } from '../shared/StatusBar';
import WinOverlay from '../shared/WinOverlay';

const COLS = 10;
const ROWS = 20;

type Color = string;
type Cell = Color | null;
type Grid = Cell[][];
type Piece = { shape: number[][]; color: Color; r: number; c: number };

const SHAPES: Record<string, { shape: number[][]; color: Color }> = {
  I: { shape: [[1, 1, 1, 1]], color: '#38bdf8' },
  O: { shape: [[1, 1], [1, 1]], color: '#facc15' },
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: '#a78bfa' },
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: '#34d399' },
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: '#f87171' },
  L: { shape: [[1, 0], [1, 0], [1, 1]], color: '#fb923c' },
  J: { shape: [[0, 1], [0, 1], [1, 1]], color: '#60a5fa' },
};

const KEYS = Object.keys(SHAPES);

const emptyGrid = (): Grid => Array.from({ length: ROWS }, () => Array<Cell>(COLS).fill(null));

const spawn = (): Piece => {
  const key = KEYS[Math.floor(Math.random() * KEYS.length)];
  const base = SHAPES[key];
  return {
    shape: base.shape.map((r) => r.slice()),
    color: base.color,
    r: 0,
    c: Math.floor(COLS / 2) - Math.ceil(base.shape[0].length / 2),
  };
};

const rotate = (p: Piece): Piece => {
  const rows = p.shape.length;
  const cols = p.shape[0].length;
  const rotated = Array.from({ length: cols }, (_, i) =>
    Array.from({ length: rows }, (_, j) => p.shape[rows - 1 - j][i]),
  );
  return { ...p, shape: rotated };
};

const collide = (grid: Grid, p: Piece): boolean => {
  for (let r = 0; r < p.shape.length; r++)
    for (let c = 0; c < p.shape[0].length; c++) {
      if (!p.shape[r][c]) continue;
      const gr = p.r + r, gc = p.c + c;
      if (gr < 0 || gr >= ROWS || gc < 0 || gc >= COLS) return true;
      if (grid[gr][gc]) return true;
    }
  return false;
};

const merge = (grid: Grid, p: Piece): Grid => {
  const next = grid.map((row) => row.slice());
  for (let r = 0; r < p.shape.length; r++)
    for (let c = 0; c < p.shape[0].length; c++) {
      if (p.shape[r][c]) next[p.r + r][p.c + c] = p.color;
    }
  return next;
};

const clearLines = (grid: Grid): { grid: Grid; cleared: number } => {
  const kept = grid.filter((row) => row.some((c) => c === null));
  const cleared = ROWS - kept.length;
  const empties = Array.from({ length: cleared }, () => Array<Cell>(COLS).fill(null));
  return { grid: [...empties, ...kept], cleared };
};

const Tetris: React.FC<{ isBotEnabled: boolean }> = () => {
  const [grid, setGrid] = useState<Grid>(emptyGrid);
  const [piece, setPiece] = useState<Piece>(() => spawn());
  const [running, setRunning] = useState(false);
  const [over, setOver] = useState(false);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const pieceRef = useRef(piece);
  pieceRef.current = piece;
  const gridRef = useRef(grid);
  gridRef.current = grid;

  const reset = () => {
    setGrid(emptyGrid());
    setPiece(spawn());
    setRunning(false);
    setOver(false);
    setScore(0);
    setLines(0);
    setLevel(1);
  };

  const attempt = useCallback(
    (next: Piece) => {
      if (!collide(gridRef.current, next)) setPiece(next);
      return !collide(gridRef.current, next);
    },
    [],
  );

  const lock = useCallback(() => {
    const merged = merge(gridRef.current, pieceRef.current);
    const { grid: cleared, cleared: n } = clearLines(merged);
    const addScore = [0, 100, 300, 500, 800][n] ?? 0;
    setGrid(cleared);
    setScore((s) => s + addScore);
    setLines((L) => {
      const nL = L + n;
      setLevel(1 + Math.floor(nL / 10));
      return nL;
    });
    const next = spawn();
    if (collide(cleared, next)) {
      setOver(true);
      setRunning(false);
    } else {
      setPiece(next);
    }
  }, []);

  const tick = useCallback(() => {
    const next = { ...pieceRef.current, r: pieceRef.current.r + 1 };
    if (collide(gridRef.current, next)) {
      lock();
    } else {
      setPiece(next);
    }
  }, [lock]);

  // Gravity
  useEffect(() => {
    if (!running || over) return;
    const speed = Math.max(80, 600 - (level - 1) * 55);
    const id = setInterval(tick, speed);
    return () => clearInterval(id);
  }, [running, over, level, tick]);

  // Controls
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (over) return;
      if (!running && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key))
        setRunning(true);
      const p = pieceRef.current;
      if (e.key === 'ArrowLeft') { e.preventDefault(); attempt({ ...p, c: p.c - 1 }); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); attempt({ ...p, c: p.c + 1 }); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); attempt({ ...p, r: p.r + 1 }); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); attempt(rotate(p)); }
      else if (e.key === ' ') {
        e.preventDefault();
        let cur = p;
        while (!collide(gridRef.current, { ...cur, r: cur.r + 1 })) cur = { ...cur, r: cur.r + 1 };
        setPiece(cur);
        setTimeout(lock, 0);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [running, over, attempt, lock]);

  // Render grid + overlay current piece
  const view: Grid = grid.map((row) => row.slice());
  for (let r = 0; r < piece.shape.length; r++)
    for (let c = 0; c < piece.shape[0].length; c++) {
      if (piece.shape[r][c]) {
        const gr = piece.r + r, gc = piece.c + c;
        if (gr >= 0 && gr < ROWS && gc >= 0 && gc < COLS) view[gr][gc] = piece.color;
      }
    }

  const tone: StatusTone = over ? 'warning' : running ? 'info' : 'neutral';

  return (
    <div className="flex flex-col items-center gap-5">
      <StatusBar tone={tone}>
        {over
          ? `Game over — Score ${score}`
          : running
            ? `Score ${score} · Lines ${lines} · Level ${level}`
            : 'Press a key or Start to play.'}
      </StatusBar>

      <div className="relative">
        <div
          className="p-2 rounded-2xl bg-gray-900 shadow-xl grid"
          style={{
            gridTemplateColumns: `repeat(${COLS}, 1.25rem)`,
            gridAutoRows: '1.25rem',
            gap: 1,
          }}
        >
          {view.map((row, r) =>
            row.map((cell, c) => (
              <div
                key={`${r}-${c}`}
                className="rounded-[2px]"
                style={{ background: cell ?? 'rgba(255,255,255,0.05)' }}
              />
            )),
          )}
        </div>
        {over && (
          <WinOverlay
            title="Game over"
            subtitle={`Score ${score} · Lines ${lines}`}
            onPlayAgain={reset}
            playAgainLabel="New game"
          />
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setRunning((r) => !r)}
          className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-semibold shadow hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800/60"
        >
          {running ? 'Pause' : 'Start'}
        </button>
        <button
          onClick={reset}
          className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-semibold shadow hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800/60"
        >
          Reset
        </button>
      </div>

    </div>
  );
};

export default Tetris;
