import React from 'react';
import { Trophy, Sparkles, Handshake } from 'lucide-react';

interface WinOverlayProps {
  title: string;
  subtitle?: string;
  tie?: boolean;
  onPlayAgain?: () => void;
  playAgainLabel?: string;
}

const WinOverlay: React.FC<WinOverlayProps> = ({
  title,
  subtitle,
  tie = false,
  onPlayAgain,
  playAgainLabel = 'Play again',
}) => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
    <div className="pointer-events-auto bg-white/95 backdrop-blur rounded-2xl shadow-xl border border-gray-200 px-6 py-5 text-center animate-fadeIn max-w-xs dark:bg-gray-800/95 dark:border-gray-700">
      <div className="flex items-center justify-center gap-2 text-amber-500 mb-1 dark:text-amber-300">
        <Sparkles className="w-5 h-5" />
        {tie ? (
          <Handshake className="w-6 h-6 text-blue-500 dark:text-blue-300" />
        ) : (
          <Trophy className="w-6 h-6" />
        )}
        <Sparkles className="w-5 h-5" />
      </div>
      <div className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</div>
      {subtitle && (
        <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">{subtitle}</p>
      )}
      {onPlayAgain && (
        <button
          onClick={onPlayAgain}
          className="mt-3 inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-semibold shadow hover:brightness-110 active:scale-95 transition"
        >
          {playAgainLabel}
        </button>
      )}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 200ms ease-out; }
      `}</style>
    </div>
  </div>
);

export default WinOverlay;
