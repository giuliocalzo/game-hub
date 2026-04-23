import React, { useCallback, useEffect, useRef, useState } from 'react';
import StatusBar, { StatusTone } from '../shared/StatusBar';
import WinOverlay from '../shared/WinOverlay';

const COLS = 18;
const ROWS = 18;

type Point = { x: number; y: number };
type Dir = 'up' | 'down' | 'left' | 'right';

const DIR_VEC: Record<Dir, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const randomFood = (snake: Point[]): Point => {
  let p: Point;
  do {
    p = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
  } while (snake.some((s) => s.x === p.x && s.y === p.y));
  return p;
};

const Snake: React.FC<{ isBotEnabled: boolean }> = () => {
  const [snake, setSnake] = useState<Point[]>([{ x: 9, y: 9 }]);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [dir, setDir] = useState<Dir>('right');
  const [pendingDir, setPendingDir] = useState<Dir>('right');
  const [running, setRunning] = useState(false);
  const [over, setOver] = useState(false);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [speed, setSpeed] = useState(140);
  const snakeRef = useRef(snake);
  snakeRef.current = snake;
  const dirRef = useRef(dir);
  dirRef.current = dir;

  const reset = useCallback(() => {
    const start = [{ x: 9, y: 9 }];
    setSnake(start);
    setFood(randomFood(start));
    setDir('right');
    setPendingDir('right');
    setRunning(false);
    setOver(false);
    setScore(0);
    setSpeed(140);
  }, []);

  const tick = useCallback(() => {
    setSnake((prev) => {
      const head = prev[0];
      const d = pendingDir;
      // prevent reversing
      const opposite: Record<Dir, Dir> = { up: 'down', down: 'up', left: 'right', right: 'left' };
      const actual = opposite[dirRef.current] === d ? dirRef.current : d;
      setDir(actual);
      const v = DIR_VEC[actual];
      const next: Point = { x: head.x + v.x, y: head.y + v.y };

      // Collisions
      if (
        next.x < 0 || next.x >= COLS || next.y < 0 || next.y >= ROWS ||
        prev.some((s) => s.x === next.x && s.y === next.y)
      ) {
        setOver(true);
        setRunning(false);
        return prev;
      }

      const ate = next.x === food.x && next.y === food.y;
      const newSnake = [next, ...prev];
      if (!ate) newSnake.pop();
      else {
        setScore((s) => {
          const ns = s + 1;
          setBest((b) => Math.max(b, ns));
          return ns;
        });
        setFood(randomFood(newSnake));
        setSpeed((sp) => Math.max(60, sp - 3));
      }
      return newSnake;
    });
  }, [pendingDir, food]);

  useEffect(() => {
    if (!running || over) return;
    const id = setInterval(tick, speed);
    return () => clearInterval(id);
  }, [running, over, tick, speed]);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, Dir> = {
        ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
        w: 'up', s: 'down', a: 'left', d: 'right',
      };
      const d = map[e.key];
      if (d) {
        e.preventDefault();
        setPendingDir(d);
        if (!running && !over) setRunning(true);
      }
      if (e.key === ' ') setRunning((r) => !r);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [running, over]);

  const tone: StatusTone = over ? 'warning' : running ? 'info' : 'neutral';
  const status = over
    ? `Game over. Score: ${score}`
    : running
      ? `Score: ${score} · Best: ${best}`
      : 'Press a direction to start.';

  return (
    <div className="flex flex-col items-center gap-5">
      <StatusBar tone={tone}>{status}</StatusBar>

      <div className="relative">
        <div
          className="grid gap-0 p-1 rounded-2xl bg-gradient-to-br from-emerald-600 to-green-800 shadow-xl"
          style={{
            gridTemplateColumns: `repeat(${COLS}, minmax(0,1fr))`,
            width: 'min(90vw, 480px)',
            aspectRatio: `${COLS} / ${ROWS}`,
          }}
        >
          {Array.from({ length: ROWS }).flatMap((_, y) =>
            Array.from({ length: COLS }).map((_, x) => {
              const isHead = snake[0].x === x && snake[0].y === y;
              const isBody = !isHead && snake.some((s) => s.x === x && s.y === y);
              const isFood = food.x === x && food.y === y;
              return (
                <div
                  key={`${x}-${y}`}
                  className={`rounded-[2px] ${
                    (x + y) % 2 === 0 ? 'bg-green-700/40' : 'bg-green-700/20'
                  }`}
                >
                  {isHead && <div className="w-full h-full rounded-sm bg-lime-300 ring-1 ring-lime-500" />}
                  {isBody && <div className="w-full h-full rounded-sm bg-lime-400" />}
                  {isFood && <div className="w-full h-full rounded-full bg-red-500 scale-75" />}
                </div>
              );
            }),
          )}
        </div>

        {over && (
          <WinOverlay
            title="Game over"
            subtitle={`Score: ${score}`}
            onPlayAgain={reset}
            playAgainLabel="New game"
          />
        )}
      </div>

      {/* Mobile D-pad */}
      <div className="grid grid-cols-3 gap-2 md:hidden">
        <div />
        <Btn onClick={() => { setPendingDir('up'); setRunning(true); }}>↑</Btn>
        <div />
        <Btn onClick={() => { setPendingDir('left'); setRunning(true); }}>←</Btn>
        <Btn onClick={() => { setPendingDir('down'); setRunning(true); }}>↓</Btn>
        <Btn onClick={() => { setPendingDir('right'); setRunning(true); }}>→</Btn>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setRunning((r) => !r)}
          className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm font-semibold shadow hover:bg-gray-50"
        >
          {running ? 'Pause' : 'Start'}
        </button>
        <button
          onClick={reset}
          className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm font-semibold shadow hover:bg-gray-50"
        >
          Reset
        </button>
      </div>
      <p className="text-xs md:text-sm text-gray-500 max-w-md text-center">
        Use arrows or WASD to steer. Eat red food, don't hit yourself or the walls.
      </p>
    </div>
  );
};

const Btn: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
  <button
    onClick={onClick}
    className="w-12 h-12 rounded-xl bg-white border border-gray-200 shadow text-xl font-bold active:scale-95"
  >
    {children}
  </button>
);

export default Snake;
