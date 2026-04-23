import React from 'react';
import { Bot, Users, Sparkles, Play } from 'lucide-react';
import { Game } from '../types/games';

interface HomePageProps {
  games: Game[];
  isBotEnabled: boolean;
  onToggleBot: (enabled: boolean) => void;
  onSelectGame: (gameId: string) => void;
}

const difficultyStyles: Record<Game['difficulty'], string> = {
  Easy: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Medium: 'bg-amber-100 text-amber-700 border-amber-200',
  Hard: 'bg-rose-100 text-rose-700 border-rose-200',
};

const HomePage: React.FC<HomePageProps> = ({
  games,
  isBotEnabled,
  onToggleBot,
  onSelectGame,
}) => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
      {/* Hero */}
      <div className="text-center mb-10 md:mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur border border-white shadow-sm mb-5">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-medium text-gray-700">
            Fun, safe games for every kid
          </span>
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-4">
          Pick a game and
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {' '}let's play!
          </span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Six classic games, one colorful home. Play with a friend on the same
          device, or challenge our friendly bot.
        </p>
      </div>

      {/* Mode toggle */}
      <div className="flex justify-center mb-10">
        <div
          role="radiogroup"
          aria-label="Game mode"
          className="inline-flex items-center p-1 bg-white rounded-full shadow-md border border-gray-200"
        >
          <button
            role="radio"
            aria-checked={!isBotEnabled}
            onClick={() => onToggleBot(false)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
              !isBotEnabled
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="w-4 h-4" />
            2 Players
          </button>
          <button
            role="radio"
            aria-checked={isBotEnabled}
            onClick={() => onToggleBot(true)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
              isBotEnabled
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Bot className="w-4 h-4" />
            Play vs Bot
          </button>
        </div>
      </div>

      {/* Game cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        {games.map((game) => {
          const botUnsupported = isBotEnabled && !game.supportsBot;
          return (
            <button
              key={game.id}
              onClick={() => onSelectGame(game.id)}
              disabled={botUnsupported}
              aria-label={`Play ${game.name}`}
              className={`group relative overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 text-left ${
                botUnsupported
                  ? 'opacity-60 cursor-not-allowed'
                  : 'hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-blue-200'
              }`}
            >
              {/* Colored top banner */}
              <div
                className={`relative h-32 bg-gradient-to-br ${game.gradient} flex items-center justify-center overflow-hidden`}
              >
                <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/15 blur-2xl" />
                <div className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full bg-white/10" />
                <span
                  className="text-7xl md:text-8xl drop-shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                  aria-hidden="true"
                >
                  {game.icon}
                </span>
              </div>

              {/* Body */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-900 leading-tight">
                    {game.name}
                  </h3>
                  <span
                    className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full border ${
                      difficultyStyles[game.difficulty]
                    }`}
                  >
                    {game.difficulty}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-4 min-h-[2.5rem]">
                  {game.tagline}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500">
                    {botUnsupported ? 'Bot mode not available' : '2 players · same device'}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 text-sm font-semibold transition-colors ${
                      botUnsupported
                        ? 'text-gray-400'
                        : 'text-blue-600 group-hover:text-blue-700'
                    }`}
                  >
                    Play
                    <Play className="w-4 h-4 fill-current transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer hint */}
      <p className="text-center text-xs text-gray-500 mt-10">
        Tip: switch between <span className="font-medium">2 Players</span> and{' '}
        <span className="font-medium">Play vs Bot</span> at any time from the
        home screen.
      </p>
    </div>
  );
};

export default HomePage;
