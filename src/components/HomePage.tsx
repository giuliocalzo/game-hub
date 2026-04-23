import React, { useMemo, useState } from 'react';
import { Bot, Users, Sparkles, Play, Search } from 'lucide-react';
import { Game, GameCategory } from '../types/games';
import { useTranslation } from '../i18n/I18nContext';

interface HomePageProps {
  games: Game[];
  isBotEnabled: boolean;
  onToggleBot: (enabled: boolean) => void;
  onSelectGame: (gameId: string) => void;
}

const CATEGORY_EMOJI: Record<GameCategory, string> = {
  board: '♟️',
  card: '🃏',
  dice: '🎲',
  puzzle: '🧩',
  arcade: '🕹️',
  educational: '🎓',
};

const CATEGORY_ORDER: GameCategory[] = [
  'board',
  'card',
  'dice',
  'arcade',
  'puzzle',
  'educational',
];

type Filter = 'all' | GameCategory;

const HomePage: React.FC<HomePageProps> = ({
  games,
  isBotEnabled,
  onToggleBot,
  onSelectGame,
}) => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');

  const difficultyStyles: Record<Game['difficulty'], string> = {
    Easy: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    Medium: 'bg-amber-100 text-amber-700 border-amber-200',
    Hard: 'bg-rose-100 text-rose-700 border-rose-200',
  };

  const availableCategories = useMemo(() => {
    const set = new Set(games.map((g) => g.category));
    return CATEGORY_ORDER.filter((c) => set.has(c));
  }, [games]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return games.filter((g) => {
      if (filter !== 'all' && g.category !== filter) return false;
      if (!q) return true;
      const name = t(`game.${g.id}.name`).toLowerCase();
      const tagline = t(`game.${g.id}.tagline`).toLowerCase();
      return (
        name.includes(q) ||
        tagline.includes(q) ||
        g.description.toLowerCase().includes(q) ||
        g.name.toLowerCase().includes(q)
      );
    });
  }, [games, filter, query, t]);

  const grouped = useMemo(() => {
    const byCat = new Map<GameCategory, Game[]>();
    filtered.forEach((g) => {
      const arr = byCat.get(g.category) ?? [];
      arr.push(g);
      byCat.set(g.category, arr);
    });
    return CATEGORY_ORDER.filter((c) => byCat.has(c)).map((c) => ({
      category: c,
      games: byCat.get(c)!,
    }));
  }, [filtered]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
      {/* Hero */}
      <div className="text-center mb-8 md:mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur border border-white shadow-sm mb-5">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-medium text-gray-700">
            {t('home.badge', { count: games.length })}
          </span>
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-4">
          {t('home.title.pick')}
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {' '}{t('home.title.play')}
          </span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t('home.subtitle')}</p>
      </div>

      {/* Mode toggle */}
      <div className="flex justify-center mb-6">
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
            {t('mode.two_players')}
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
            {t('mode.vs_bot')}
          </button>
        </div>
      </div>

      {/* Search + category filter */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('home.search.placeholder')}
            aria-label={t('home.search.placeholder')}
            className="w-full pl-9 pr-3 py-2.5 rounded-full bg-white border border-gray-200 shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>
        <div
          role="tablist"
          aria-label="Category filter"
          className="flex flex-wrap gap-1.5"
        >
          <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>
            {t('home.filter.all')}
          </FilterChip>
          {availableCategories.map((c) => (
            <FilterChip
              key={c}
              active={filter === c}
              onClick={() => setFilter(c)}
            >
              <span aria-hidden="true" className="mr-1">
                {CATEGORY_EMOJI[c]}
              </span>
              {t(`category.${c}.label`)}
            </FilterChip>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {grouped.length === 0 && (
        <div className="text-center py-16 text-gray-500">{t('home.empty')}</div>
      )}

      {/* Sections */}
      <div className="space-y-10">
        {grouped.map(({ category, games: cgames }) => (
          <section key={category}>
            <div className="flex items-baseline gap-2 mb-4">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                <span aria-hidden="true" className="mr-1.5">
                  {CATEGORY_EMOJI[category]}
                </span>
                {t(`category.${category}.label`)}
              </h2>
              <span className="text-sm text-gray-500">
                {t(`category.${category}.desc`)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {cgames.map((game) => {
                const botUnsupported = isBotEnabled && !game.supportsBot && !game.solo;
                const name = t(`game.${game.id}.name`);
                const tagline = t(`game.${game.id}.tagline`);
                return (
                  <button
                    key={game.id}
                    onClick={() => onSelectGame(game.id)}
                    disabled={botUnsupported}
                    aria-label={`${t('card.play')} ${name}`}
                    className={`group relative overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 text-left ${
                      botUnsupported
                        ? 'opacity-60 cursor-not-allowed'
                        : 'hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-blue-200'
                    }`}
                  >
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

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900 leading-tight">
                          {name}
                        </h3>
                        <span
                          className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full border ${
                            difficultyStyles[game.difficulty]
                          }`}
                        >
                          {t(`difficulty.${game.difficulty}`)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-4 min-h-[2.5rem]">
                        {tagline}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500">
                          {game.solo
                            ? t('card.solo')
                            : botUnsupported
                              ? t('card.bot_unavailable')
                              : t('card.two_players_device')}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1.5 text-sm font-semibold transition-colors ${
                            botUnsupported
                              ? 'text-gray-400'
                              : 'text-blue-600 group-hover:text-blue-700'
                          }`}
                        >
                          {t('card.play')}
                          <Play className="w-4 h-4 fill-current transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <p className="text-center text-xs text-gray-500 mt-12">
        {t('home.footer_tip')}
      </p>
    </div>
  );
};

interface FilterChipProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

const FilterChip: React.FC<FilterChipProps> = ({ active, onClick, children }) => (
  <button
    role="tab"
    aria-selected={active}
    onClick={onClick}
    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
      active
        ? 'bg-gray-900 text-white border-gray-900'
        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
    }`}
  >
    {children}
  </button>
);

export default HomePage;
