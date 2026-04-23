import React, { useState } from 'react';
import { ArrowLeft, RotateCcw, Bot, Users, Info, X } from 'lucide-react';
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
  isBotEnabled,
  onBack,
  onRestart,
  children,
}) => {
  const { t } = useTranslation();
  const [showInfo, setShowInfo] = useState(false);
  const showingBot = isBotEnabled && game.supportsBot;
  const name = t(`game.${game.id}.name`);
  const instructions = t(`game.${game.id}.instructions`);

  return (
    <div className="max-w-7xl mx-auto px-1 sm:px-3 pt-2 pb-4">
      {/* Compact action bar */}
      <div className="flex items-center justify-between gap-2 mb-2 px-1 sm:px-0">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onBack}
            className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 active:scale-95 transition text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:ring-blue-500/40"
            aria-label={t('shell.back_aria')}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span
            className={`inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br ${game.gradient} text-xl shadow-sm shrink-0`}
            aria-hidden="true"
          >
            {game.icon}
          </span>
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 truncate">
            {name}
          </h2>
          <span
            className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
              showingBot
                ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-200 dark:border-purple-500/30'
                : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-200 dark:border-blue-500/30'
            }`}
          >
            {showingBot ? (
              <>
                <Bot className="w-3 h-3" /> {t('mode.vs_bot_badge')}
              </>
            ) : (
              <>
                <Users className="w-3 h-3" /> {t('mode.two_players')}
              </>
            )}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setShowInfo(true)}
            className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 active:scale-95 transition text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:ring-blue-500/40"
            aria-label={t('shell.how_to_play')}
          >
            <Info className="w-4 h-4" />
          </button>
          <button
            onClick={onRestart}
            className="inline-flex items-center gap-1.5 px-3 h-9 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold shadow-sm hover:brightness-105 active:scale-95 transition focus:outline-none focus:ring-2 focus:ring-emerald-300"
            aria-label={t('shell.restart_aria')}
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">{t('shell.restart')}</span>
          </button>
        </div>
      </div>

      {/* Game surface — tight frame, maximum play area */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-2 sm:p-4 md:p-5 dark:bg-gray-800/80 dark:border-gray-700 dark:shadow-black/40">
        {children}
      </div>

      {/* Instructions modal */}
      {showInfo && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-3"
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
