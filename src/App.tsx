import { useState, useEffect } from 'react';
import { Gamepad2 } from 'lucide-react';
import HomePage from './components/HomePage';
import GameShell from './components/GameShell';
import Chess from './components/games/Chess';
import Dama from './components/games/Dama';
import Tris from './components/games/Tris';
import SnakesAndLadders from './components/games/SnakesAndLadders';
import Backgammon from './components/games/Backgammon';
import Uno from './components/games/Uno';
import { Game } from './types/games';

const AVAILABLE_GAMES: Game[] = [
  {
    id: 'tris',
    name: 'Tic-Tac-Toe',
    description: 'Get three in a row to win',
    tagline: 'Quick, classic, and great for all ages.',
    icon: '❌',
    gradient: 'from-sky-400 to-blue-500',
    difficulty: 'Easy',
    supportsBot: true,
  },
  {
    id: 'snakes-and-ladders',
    name: 'Snakes & Ladders',
    description: 'Roll dice and climb to victory',
    tagline: 'Roll the dice, climb the ladders, dodge the snakes!',
    icon: '🎲',
    gradient: 'from-emerald-400 to-green-600',
    difficulty: 'Easy',
    supportsBot: true,
  },
  {
    id: 'uno',
    name: 'UNO',
    description: 'Match colors and numbers in this fast-paced card game',
    tagline: 'Match colors and numbers — don\u2019t forget to shout UNO!',
    icon: '🃏',
    gradient: 'from-rose-500 to-orange-500',
    difficulty: 'Medium',
    supportsBot: true,
  },
  {
    id: 'dama',
    name: 'Checkers',
    description: 'Jump and capture opponent pieces',
    tagline: 'Jump, capture, and crown your kings.',
    icon: '⚫',
    gradient: 'from-rose-400 to-red-600',
    difficulty: 'Medium',
    supportsBot: true,
  },
  {
    id: 'backgammon',
    name: 'Backgammon',
    description: 'Race your pieces home in this classic strategy game',
    tagline: 'Race your pieces home with a bit of dice luck.',
    icon: '🎯',
    gradient: 'from-amber-500 to-yellow-600',
    difficulty: 'Hard',
    supportsBot: true,
  },
  {
    id: 'chess',
    name: 'Chess',
    description: 'Strategic board game with pieces and tactics',
    tagline: 'The ultimate strategy game. Plan your moves!',
    icon: '♔',
    gradient: 'from-slate-600 to-slate-800',
    difficulty: 'Hard',
    supportsBot: true,
  },
];

type View = 'home' | 'game';

function App() {
  const [view, setView] = useState<View>('home');
  const [activeGameId, setActiveGameId] = useState<string | null>(null);
  const [isBotEnabled, setIsBotEnabled] = useState<boolean>(false);
  const [restartKey, setRestartKey] = useState<number>(0);

  // Keep page title in sync — nice touch for tabs.
  useEffect(() => {
    const active = AVAILABLE_GAMES.find((g) => g.id === activeGameId);
    document.title =
      view === 'game' && active ? `${active.name} — GameHub` : 'GameHub';
  }, [view, activeGameId]);

  const activeGame = AVAILABLE_GAMES.find((g) => g.id === activeGameId) ?? null;

  const renderGame = (gameId: string) => {
    switch (gameId) {
      case 'chess':
        return <Chess isBotEnabled={isBotEnabled} />;
      case 'dama':
        return <Dama isBotEnabled={isBotEnabled} />;
      case 'tris':
        return <Tris isBotEnabled={isBotEnabled} />;
      case 'snakes-and-ladders':
        return <SnakesAndLadders isBotEnabled={isBotEnabled} />;
      case 'backgammon':
        return <Backgammon isBotEnabled={isBotEnabled} />;
      case 'uno':
        return <Uno isBotEnabled={isBotEnabled} />;
      default:
        return <div className="text-gray-600">Game not found.</div>;
    }
  };

  const handleSelectGame = (gameId: string) => {
    setActiveGameId(gameId);
    setRestartKey((k) => k + 1);
    setView('game');
  };

  const handleBackHome = () => {
    setView('home');
  };

  const handleRestart = () => {
    setRestartKey((k) => k + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Decorative background blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-96 h-96 rounded-full bg-purple-200/40 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 rounded-full bg-pink-200/30 blur-3xl" />
      </div>

      <div className="relative">
        {/* Header */}
        <header className="bg-white/70 backdrop-blur-md shadow-sm border-b border-white/60 sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <button
              onClick={handleBackHome}
              className="flex items-center gap-2.5 group"
              aria-label="Go to home"
            >
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md group-hover:shadow-lg transition-shadow">
                <Gamepad2 className="w-5 h-5 text-white" />
              </span>
              <span className="text-2xl font-extrabold tracking-tight text-gray-900">
                Game<span className="text-blue-600">Hub</span>
              </span>
            </button>
            <span className="hidden sm:block text-sm text-gray-500">
              Play together · Learn together
            </span>
          </div>
        </header>

        {/* Main */}
        <main>
          {view === 'home' || !activeGame ? (
            <HomePage
              games={AVAILABLE_GAMES}
              isBotEnabled={isBotEnabled}
              onToggleBot={setIsBotEnabled}
              onSelectGame={handleSelectGame}
            />
          ) : (
            <GameShell
              game={activeGame}
              isBotEnabled={isBotEnabled}
              onBack={handleBackHome}
              onRestart={handleRestart}
            >
              {/* key forces the game to fully remount on restart / game switch */}
              <div key={`${activeGame.id}-${restartKey}`}>
                {renderGame(activeGame.id)}
              </div>
            </GameShell>
          )}
        </main>

        <footer className="max-w-6xl mx-auto px-4 py-8 text-center text-xs text-gray-500">
          Made with care for curious young players.
        </footer>
      </div>
    </div>
  );
}

export default App;
