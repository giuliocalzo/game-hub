import React, { useMemo, useState } from 'react';
import { Bot, Users, Search } from 'lucide-react';
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
  art: '🎨',
  math: '🔢',
};

const CATEGORY_ORDER: GameCategory[] = [
  'board',
  'card',
  'dice',
  'arcade',
  'puzzle',
  'art',
  'math',
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
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
      {/* Search bar (Android-style pill) */}
      <div className="relative max-w-lg mx-auto mb-5">
        <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 dark:text-gray-500" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('home.search.placeholder')}
          aria-label={t('home.search.placeholder')}
          className="w-full pl-11 pr-4 py-3 rounded-full bg-white/90 border border-gray-200 shadow-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 dark:bg-gray-800/90 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:ring-blue-500/40"
        />
      </div>

      {/* Mode toggle (compact pill) */}
      <div className="flex justify-center mb-5">
        <div
          role="radiogroup"
          aria-label="Game mode"
          className="inline-flex items-center p-1 bg-white/80 rounded-full shadow-sm border border-gray-200 dark:bg-gray-800/80 dark:border-gray-700 text-xs"
        >
          <button
            role="radio"
            aria-checked={!isBotEnabled}
            onClick={() => onToggleBot(false)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full font-semibold transition-all ${
              !isBotEnabled
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            {t('mode.two_players')}
          </button>
          <button
            role="radio"
            aria-checked={isBotEnabled}
            onClick={() => onToggleBot(true)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full font-semibold transition-all ${
              isBotEnabled
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            {t('mode.vs_bot')}
          </button>
        </div>
      </div>

      {/* Category chips (horizontal scroll on mobile) */}
      <div
        role="tablist"
        aria-label="Category filter"
        className="flex gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none justify-start md:justify-center"
        style={{ scrollbarWidth: 'none' }}
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

      {/* Empty state */}
      {grouped.length === 0 && (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
          {t('home.empty')}
        </div>
      )}

      {/* Sections */}
      <div className="space-y-6">
        {grouped.map(({ category, games: cgames }) => (
          <section key={category}>
            <h2 className="px-1 mb-3 text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <span aria-hidden="true">{CATEGORY_EMOJI[category]}</span>
              {t(`category.${category}.label`)}
              <span className="text-xs font-normal normal-case tracking-normal text-gray-400 dark:text-gray-500">
                · {cgames.length}
              </span>
            </h2>

            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4">
              {cgames.map((game) => {
                const botUnsupported = isBotEnabled && !game.supportsBot && !game.solo;
                const name = t(`game.${game.id}.name`);
                return (
                  <button
                    key={game.id}
                    onClick={() => onSelectGame(game.id)}
                    disabled={botUnsupported}
                    aria-label={`${t('card.play')} ${name}`}
                    title={t(`game.${game.id}.tagline`)}
                    className={`group flex flex-col items-center gap-1.5 focus:outline-none ${
                      botUnsupported ? 'opacity-40 cursor-not-allowed' : ''
                    }`}
                  >
                    <span
                      className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-[28%] bg-gradient-to-br ${game.gradient} flex items-center justify-center shadow-md transition-transform ${
                        botUnsupported
                          ? ''
                          : 'group-hover:-translate-y-1 group-active:scale-95 group-focus-visible:ring-4 group-focus-visible:ring-blue-300 dark:group-focus-visible:ring-blue-500/50'
                      }`}
                      style={{ aspectRatio: '1 / 1' }}
                    >
                      <span className="absolute inset-0 rounded-[28%] bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span
                        className="text-3xl sm:text-4xl drop-shadow-sm"
                        aria-hidden="true"
                      >
                        {game.icon}
                      </span>
                      {botUnsupported && (
                        <span className="absolute -top-1 -right-1 text-[9px] font-bold bg-gray-900 text-white px-1.5 py-0.5 rounded-full shadow">
                          1P
                        </span>
                      )}
                    </span>
                    <span className="text-[11px] sm:text-xs font-medium text-gray-800 dark:text-gray-200 text-center leading-tight w-full truncate px-0.5">
                      {name}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-10">
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
    className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
      active
        ? 'bg-gray-900 text-white border-gray-900 dark:bg-gray-100 dark:text-gray-900 dark:border-gray-100'
        : 'bg-white/80 text-gray-700 border-gray-200 hover:border-gray-300 dark:bg-gray-800/80 dark:text-gray-200 dark:border-gray-700 dark:hover:border-gray-600'
    }`}
  >
    {children}
  </button>
);

export default HomePage;
