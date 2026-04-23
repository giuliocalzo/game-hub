import React, { useCallback, useEffect, useRef, useState } from 'react';
import StatusBar, { StatusTone } from '../shared/StatusBar';
import WinOverlay from '../shared/WinOverlay';

const W = 480;
const H = 400;
const BASKET_W = 70;
const BASKET_H = 16;
const ITEM = 18;

type ItemKind = 'good' | 'bad';
interface Item {
  x: number;
  y: number;
  vy: number;
  kind: ItemKind;
  emoji: string;
}

const GOOD = ['🍎', '🍊', '🍓', '🍋', '⭐', '🍌'];
const BAD = ['💣', '🪨'];

const Catch: React.FC<{ isBotEnabled: boolean }> = () => {
  const [basketX, setBasketX] = useState(W / 2 - BASKET_W / 2);
  const [items, setItems] = useState<Item[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [running, setRunning] = useState(false);
  const [over, setOver] = useState(false);
  const [best, setBest] = useState(0);

  const basketRef = useRef(basketX);
  basketRef.current = basketX;
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const keys = useRef({ left: false, right: false });

  const reset = useCallback(() => {
    setBasketX(W / 2 - BASKET_W / 2);
    setItems([]);
    setScore(0);
    setLives(3);
    setRunning(false);
    setOver(false);
  }, []);

  useEffect(() => {
    if (!running || over) return;
    let raf = 0;
    let tick = 0;
    const loop = () => {
      tick++;
      // Basket
      setBasketX((x) => {
        let nx = x;
        if (keys.current.left) nx -= 7;
        if (keys.current.right) nx += 7;
        return Math.max(0, Math.min(W - BASKET_W, nx));
      });
      // Spawn
      if (tick % 45 === 0) {
        const isBad = Math.random() < 0.2;
        setItems((it) => [
          ...it,
          {
            x: 10 + Math.random() * (W - ITEM - 20),
            y: -ITEM,
            vy: 2 + Math.random() * 2 + Math.min(4, tick / 600),
            kind: isBad ? 'bad' : 'good',
            emoji: isBad
              ? BAD[Math.floor(Math.random() * BAD.length)]
              : GOOD[Math.floor(Math.random() * GOOD.length)],
          },
        ]);
      }
      // Move items & collision
      setItems((its) => {
        const remaining: Item[] = [];
        for (const it of its) {
          const ny = it.y + it.vy;
          // basket collision
          if (
            ny + ITEM >= H - 30 &&
            ny + ITEM <= H - 30 + BASKET_H + 6 &&
            it.x + ITEM / 2 >= basketRef.current &&
            it.x + ITEM / 2 <= basketRef.current + BASKET_W
          ) {
            if (it.kind === 'good') setScore((s) => s + 1);
            else {
              setLives((L) => {
                const nl = L - 1;
                if (nl <= 0) {
                  setOver(true);
                  setRunning(false);
                  setBest((b) => Math.max(b, score));
                }
                return nl;
              });
            }
            continue;
          }
          // missed to floor
          if (ny > H) {
            if (it.kind === 'good') {
              setLives((L) => {
                const nl = L - 1;
                if (nl <= 0) {
                  setOver(true);
                  setRunning(false);
                  setBest((b) => Math.max(b, score));
                }
                return nl;
              });
            }
            continue;
          }
          remaining.push({ ...it, y: ny });
        }
        return remaining;
      });

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [running, over, score]);

  // Keyboard
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (!running && !over && ['ArrowLeft', 'ArrowRight', 'a', 'A', 'd', 'D'].includes(e.key))
        setRunning(true);
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        keys.current.left = true;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        keys.current.right = true;
      } else if (e.key === ' ') setRunning((r) => !r);
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.current.left = false;
      else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.current.right = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [running, over]);

  const tone: StatusTone = over ? 'warning' : running ? 'info' : 'neutral';

  return (
    <div className="flex flex-col items-center gap-5">
      <StatusBar tone={tone}>
        {over
          ? `Game over · Score ${score} · Best ${Math.max(best, score)}`
          : running
            ? `Score ${score} · ${'♥'.repeat(lives)}${'♡'.repeat(3 - lives)}`
            : 'Use ← → (or drag) to move the basket.'}
      </StatusBar>

      <div className="relative w-full" style={{ maxWidth: W }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full rounded-2xl shadow-xl cursor-pointer select-none"
          style={{ background: 'linear-gradient(to bottom, #bae6fd, #e0e7ff)' }}
          onMouseMove={(e) => {
            const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * W;
            if (!running && !over) setRunning(true);
            setBasketX(Math.max(0, Math.min(W - BASKET_W, x - BASKET_W / 2)));
          }}
          onTouchMove={(e) => {
            const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
            const x = ((e.touches[0].clientX - rect.left) / rect.width) * W;
            if (!running && !over) setRunning(true);
            setBasketX(Math.max(0, Math.min(W - BASKET_W, x - BASKET_W / 2)));
          }}
        >
          {items.map((it, i) => (
            <text
              key={i}
              x={it.x + ITEM / 2}
              y={it.y + ITEM}
              fontSize={ITEM}
              textAnchor="middle"
            >
              {it.emoji}
            </text>
          ))}
          {/* Basket */}
          <rect
            x={basketX}
            y={H - 30}
            width={BASKET_W}
            height={BASKET_H}
            rx="6"
            fill="#d97706"
          />
          <rect
            x={basketX + 4}
            y={H - 34}
            width={BASKET_W - 8}
            height="6"
            rx="3"
            fill="#b45309"
          />
        </svg>
        {over && (
          <WinOverlay
            title="Game over"
            subtitle={`Score: ${score}`}
            onPlayAgain={reset}
            playAgainLabel="Play again"
          />
        )}
      </div>

      {/* Mobile controls */}
      <div className="grid grid-cols-2 gap-2 md:hidden">
        <button
          onTouchStart={() => { keys.current.left = true; setRunning(true); }}
          onTouchEnd={() => { keys.current.left = false; }}
          className="w-16 h-12 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow font-bold"
        >←</button>
        <button
          onTouchStart={() => { keys.current.right = true; setRunning(true); }}
          onTouchEnd={() => { keys.current.right = false; }}
          className="w-16 h-12 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow font-bold"
        >→</button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setRunning((r) => !r)}
          disabled={over}
          className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-semibold shadow hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
        >
          {running ? 'Pause' : 'Start'}
        </button>
        <button
          onClick={reset}
          className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-semibold shadow hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default Catch;
