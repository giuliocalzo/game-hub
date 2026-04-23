import React from 'react';
import { ArrowLeft, RotateCcw, Bot, Users } from 'lucide-react';
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
  const showingBot = isBotEnabled && game.supportsBot;
  const name = t(`game.${game.id}.name`);
  const tagline = t(`game.${game.id}.tagline`);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
      {/* Sub-header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-200 shadow-sm hover:bg-gray-50 active:scale-95 transition text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-300"
            aria-label={t('shell.back_aria')}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{t('shell.home')}</span>
          </button>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${game.gradient} text-2xl shadow-sm`}
              aria-hidden="true"
            >
              {game.icon}
            </span>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
                {name}
              </h2>
              <p className="text-xs text-gray-500 hidden sm:block">{tagline}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
              showingBot
                ? 'bg-purple-50 text-purple-700 border-purple-200'
                : 'bg-blue-50 text-blue-700 border-blue-200'
            }`}
          >
            {showingBot ? (
              <>
                <Bot className="w-3.5 h-3.5" /> {t('mode.vs_bot_badge')}
              </>
            ) : (
              <>
                <Users className="w-3.5 h-3.5" /> {t('mode.two_players')}
              </>
            )}
          </span>
          <button
            onClick={onRestart}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold shadow-sm hover:shadow-md hover:brightness-105 active:scale-95 transition focus:outline-none focus:ring-2 focus:ring-emerald-300"
            aria-label={t('shell.restart_aria')}
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t('shell.restart')}</span>
          </button>
        </div>
      </div>

      {/* Game surface */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-5 md:p-8">
        {children}

        {/* Translated "how to play" — lives here so every game is covered */}
        <p className="mt-6 pt-4 border-t border-gray-100 text-xs md:text-sm text-gray-500 text-center max-w-xl mx-auto whitespace-pre-line">
          {t(`game.${game.id}.instructions`)}
        </p>
      </div>
    </div>
  );
};

export default GameShell;
