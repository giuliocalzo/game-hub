import React, { useEffect, useRef, useState } from 'react';
import StatusBar, { StatusTone } from '../shared/StatusBar';
import WinOverlay from '../shared/WinOverlay';

const SIZE = 420;
const CX = SIZE / 2;
const CY = SIZE / 2;

const RINGS = [
  { r: 20, label: 50, fill: '#dc2626' },   // bullseye
  { r: 40, label: 25, fill: '#16a34a' },   // bull
  { r: 80, label: 15, fill: '#fde68a' },
  { r: 130, label: 10, fill: '#f87171' },
  { r: 180, label: 5, fill: '#fed7aa' },
  { r: 210, label: 1, fill: '#bae6fd' },
];

interface Dart {
  id: number;
  x: number;
  y: number;
  points: number;
}

const scoreAt = (x: number, y: number): number => {
  const dx = x - CX;
  const dy = y - CY;
  const d = Math.sqrt(dx * dx + dy * dy);
  for (const ring of RINGS) {
    if (d <= ring.r) return ring.label;
  }
  return 0;
};

const TOTAL = 10;

const Darts: React.FC<{ isBotEnabled: boolean }> = () => {
  const [angle, setAngle] = useState(0);
  const [darts, setDarts] = useState<Dart[]>([]);
  const [thrown, setThrown] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const idRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);

  // Rotate the target
  useEffect(() => {
    if (done) return;
    const tick = (ts: number) => {
      if (lastRef.current === null) lastRef.current = ts;
      const dt = (ts - lastRef.current) / 1000;
      lastRef.current = ts;
      setAngle((a) => (a + dt * 0.6) % (Math.PI * 2));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      lastRef.current = null;
    };
  }, [done]);

  const reset = () => {
    setDarts([]);
    setThrown(0);
    setScore(0);
    setDone(false);
  };

  const throwDart = (e: React.MouseEvent<SVGSVGElement>) => {
    if (done) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * SIZE;
    const y = ((e.clientY - rect.top) / rect.height) * SIZE;
    // Transform the click back into the target's local (rotating) frame
    const cos = Math.cos(-angle);
    const sin = Math.sin(-angle);
    const lx = CX + (x - CX) * cos - (y - CY) * sin;
    const ly = CY + (x - CX) * sin + (y - CY) * cos;
    const pts = scoreAt(lx, ly);
    const dart: Dart = { id: idRef.current++, x: lx, y: ly, points: pts };
    setDarts((d) => [...d, dart]);
    setScore((s) => s + pts);
    setThrown((n) => {
      const next = n + 1;
      if (next >= TOTAL) setDone(true);
      return next;
    });
  };

  const tone: StatusTone = done ? 'success' : 'info';

  return (
    <div className="flex flex-col items-center gap-4">
      <StatusBar tone={tone}>
        {done
          ? `Game over — ${score} points!`
          : `Dart ${thrown + 1}/${TOTAL} · Score ${score}`}
      </StatusBar>

      <div className="relative w-full" style={{ maxWidth: 520 }}>
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="w-full rounded-full shadow-xl cursor-crosshair"
          style={{ background: 'radial-gradient(circle, #1e293b 0%, #020617 85%)', aspectRatio: '1 / 1' }}
          onClick={throwDart}
        >
          <g transform={`rotate(${(angle * 180) / Math.PI} ${CX} ${CY})`}>
            {/* Rings */}
            {RINGS.slice().reverse().map((r) => (
              <circle
                key={r.r}
                cx={CX}
                cy={CY}
                r={r.r}
                fill={r.fill}
                stroke="rgba(0,0,0,0.3)"
                strokeWidth={1}
              />
            ))}
            {/* Cross pattern */}
            <line x1={CX - 210} y1={CY} x2={CX + 210} y2={CY} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
            <line x1={CX} y1={CY - 210} x2={CX} y2={CY + 210} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
            {/* Darts stick with the target (so they rotate with it) */}
            {darts.map((d) => (
              <g key={d.id}>
                <circle cx={d.x} cy={d.y} r={6} fill="#0f172a" stroke="white" strokeWidth={1.5} />
                <circle cx={d.x} cy={d.y} r={2.5} fill="#facc15" />
              </g>
            ))}
          </g>
        </svg>

        {done && (
          <WinOverlay
            title={`${score} points`}
            subtitle={score >= 350 ? 'Bullseye champion!' : score >= 200 ? 'Sharp shooter' : 'Keep practicing'}
            onPlayAgain={reset}
            playAgainLabel="Play again"
          />
        )}
      </div>
    </div>
  );
};

export default Darts;
