import React, { useState } from 'react';
import { ArrowLeft, RotateCcw, Info, X } from 'lucide-react';
import { Game } from '../types/games';
import { useTranslation } from '../i18n/I18nContext';

interface GameShellProps {
  game: Game;
  isBotEnabled: boolean;
  onBack: () => void;
  onRestart: () => void;
  children: React.ReactNode;
}

const GameShell: React.FC<GameShellProps> = ({
  game,
  onBack,
  onRestart,
  children,
}) => {
  const { t } = useTranslation();
  const [showInfo, setShowInfo] = useState(false);
  const name = t(`game.${game.id}.name`);
  const instructions = t(`game.${game.id}.instructions`);

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Floating top-left: Back */}
      <button
        onClick={onBack}
        className="fixed top-3 left-3 z-50 inline-flex items-center justify-center w-11 h-11 rounded-full bg-white/90 backdrop-blur border border-gray-200 shadow-lg hover:bg-white active:scale-95 transition text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:bg-gray-800/90 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800 dark:focus:ring-blue-500/40"
        aria-label={t('shell.back_aria')}
        title={t('shell.back_aria')}
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      {/* Floating top-right: Info + Restart */}
      <div className="fixed top-3 right-3 z-50 flex items-center gap-2">
        <button
          onClick={() => setShowInfo(true)}
          className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-white/90 backdrop-blur border border-gray-200 shadow-lg hover:bg-white active:scale-95 transition text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:bg-gray-800/90 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800 dark:focus:ring-blue-500/40"
          aria-label={t('shell.how_to_play')}
          title={t('shell.how_to_play')}
        >
          <Info className="w-5 h-5" />
        </button>
        <button
          onClick={onRestart}
          className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg hover:brightness-110 active:scale-95 transition focus:outline-none focus:ring-2 focus:ring-emerald-300"
          aria-label={t('shell.restart_aria')}
          title={t('shell.restart')}
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Game stage — fills the viewport, scrollable internally if needed */}
      <div className="absolute inset-0 flex items-center justify-center px-2 pt-16 pb-4 sm:pt-20 sm:pb-6 overflow-auto">
        <div className="w-full h-full flex items-center justify-center">
          {children}
        </div>
      </div>

      {/* Instructions modal */}
      {showInfo && (
        <div
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-3"
          onClick={() => setShowInfo(false)}
        >
          <div
            className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowInfo(false)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full inline-flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2.5 mb-3">
              <span
                className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${game.gradient} text-2xl shadow-sm`}
                aria-hidden="true"
              >
                {game.icon}
              </span>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {name}
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">
              {instructions}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameShell;
