import { useState, useEffect } from 'react';
import { Gamepad2 } from 'lucide-react';
import HomePage from './components/HomePage';
import GameShell from './components/GameShell';
import LanguagePicker from './components/LanguagePicker';
import ThemePicker from './components/ThemePicker';
import { useTranslation } from './i18n/I18nContext';
import { Game } from './types/games';

// Existing games
import Chess from './components/games/Chess';
import Dama from './components/games/Dama';
import Tris from './components/games/Tris';
import SnakesAndLadders from './components/games/SnakesAndLadders';
import Backgammon from './components/games/Backgammon';
import Uno from './components/games/Uno';
// New board/strategy
import ConnectFour from './components/games/ConnectFour';
import Reversi from './components/games/Reversi';
import Gomoku from './components/games/Gomoku';
import DotsAndBoxes from './components/games/DotsAndBoxes';
import Mancala from './components/games/Mancala';
import Battleship from './components/games/Battleship';
import Ludo from './components/games/Ludo';
// New card
import GoFish from './components/games/GoFish';
import CrazyEights from './components/games/CrazyEights';
import War from './components/games/War';
import Solitaire from './components/games/Solitaire';
// New dice
import Pig from './components/games/Pig';
import Yahtzee from './components/games/Yahtzee';
// New puzzle
import Memory from './components/games/Memory';
import Game2048 from './components/games/Game2048';
import Minesweeper from './components/games/Minesweeper';
import FifteenPuzzle from './components/games/FifteenPuzzle';
import Sudoku from './components/games/Sudoku';
import Nonogram from './components/games/Nonogram';
// New arcade
import Snake from './components/games/Snake';
import Simon from './components/games/Simon';
import WhackAMole from './components/games/WhackAMole';
import Tetris from './components/games/Tetris';
import FlappyBird from './components/games/FlappyBird';
import Pong from './components/games/Pong';
import Breakout from './components/games/Breakout';
import DinoRun from './components/games/DinoRun';
import ReactionTime from './components/games/ReactionTime';
import Catch from './components/games/Catch';
import BubbleShooter from './components/games/BubbleShooter';
import NineMensMorris from './components/games/NineMensMorris';
import Dominoes from './components/games/Dominoes';
// Art activities
import DoodlePad from './components/games/DoodlePad';
import PixelArt from './components/games/PixelArt';
import Spin from './components/games/Spin';
import Sticker from './components/games/Sticker';

import BalloonPop from './components/games/BalloonPop';
import MakeTen from './components/games/MakeTen';
import TellingTime from './components/games/TellingTime';
import NumberPattern from './components/games/NumberPattern';
import Subitize from './components/games/Subitize';

import Piano from './components/games/Piano';
import DrumPad from './components/games/DrumPad';
import Xylophone from './components/games/Xylophone';
import WordScramble from './components/games/WordScramble';
import AlphabetOrder from './components/games/AlphabetOrder';
import HiddenPicture from './components/games/HiddenPicture';
// New educational
import Hangman from './components/games/Hangman';
import WordSearch from './components/games/WordSearch';
import MathQuiz from './components/games/MathQuiz';
import FlagsQuiz from './components/games/FlagsQuiz';
import TypingPractice from './components/games/TypingPractice';

const AVAILABLE_GAMES: Game[] = [
  // Board / strategy
  {
    id: 'tris',
    name: 'Tic-Tac-Toe',
    description: 'Get three in a row to win',
    tagline: 'Quick, classic, and great for all ages.',
    icon: '❌',
    gradient: 'from-sky-400 to-blue-500',
    difficulty: 'Easy',
    supportsBot: true,
    category: 'board',
  },
  {
    id: 'connect-four',
    name: 'Connect Four',
    description: 'Drop discs, line up four',
    tagline: 'Drop, match four, win. Classic for all ages.',
    icon: '🔴',
    gradient: 'from-blue-500 to-indigo-600',
    difficulty: 'Easy',
    supportsBot: true,
    category: 'board',
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
    category: 'board',
  },
  {
    id: 'reversi',
    name: 'Reversi',
    description: 'Flip opponent discs',
    tagline: 'Sandwich your opponent and flip the board.',
    icon: '⚪',
    gradient: 'from-emerald-600 to-emerald-800',
    difficulty: 'Medium',
    supportsBot: true,
    category: 'board',
  },
  {
    id: 'gomoku',
    name: 'Gomoku',
    description: 'Five stones in a row',
    tagline: 'Like tic-tac-toe, but you need five in a row.',
    icon: '⚫',
    gradient: 'from-amber-500 to-yellow-600',
    difficulty: 'Medium',
    supportsBot: true,
    category: 'board',
  },
  {
    id: 'dots-boxes',
    name: 'Dots & Boxes',
    description: 'Close squares to score',
    tagline: 'Draw the last side of a box to claim it.',
    icon: '🔲',
    gradient: 'from-sky-300 to-blue-500',
    difficulty: 'Easy',
    supportsBot: true,
    category: 'board',
  },
  {
    id: 'mancala',
    name: 'Mancala',
    description: 'Ancient sow-and-capture game',
    tagline: 'Sow stones around the pits. Land in your store for a bonus turn.',
    icon: '🪨',
    gradient: 'from-amber-400 to-yellow-700',
    difficulty: 'Medium',
    supportsBot: true,
    category: 'board',
  },
  {
    id: 'backgammon',
    name: 'Backgammon',
    description: 'Race your pieces home',
    tagline: 'Race your pieces home with a bit of dice luck.',
    icon: '🎯',
    gradient: 'from-amber-600 to-yellow-800',
    difficulty: 'Hard',
    supportsBot: true,
    category: 'board',
  },
  {
    id: 'battleship',
    name: 'Battleship',
    description: 'Sink the enemy fleet',
    tagline: 'Guess cells on the hidden grid and sink the fleet.',
    icon: '🚢',
    gradient: 'from-blue-600 to-indigo-800',
    difficulty: 'Medium',
    supportsBot: true,
    category: 'board',
  },
  {
    id: 'ludo',
    name: 'Ludo',
    description: 'Race all four tokens home',
    tagline: 'Roll dice, race your four tokens home.',
    icon: '🎲',
    gradient: 'from-rose-500 to-amber-500',
    difficulty: 'Easy',
    supportsBot: true,
    category: 'board',
  },
  {
    id: 'chess',
    name: 'Chess',
    description: 'Strategic board game',
    tagline: 'The ultimate strategy game. Plan your moves!',
    icon: '♔',
    gradient: 'from-slate-600 to-slate-800',
    difficulty: 'Hard',
    supportsBot: true,
    category: 'board',
  },
  {
    id: 'snakes-and-ladders',
    name: 'Snakes & Ladders',
    description: 'Roll dice and climb to victory',
    tagline: 'Roll the dice, climb ladders, dodge snakes!',
    icon: '🐍',
    gradient: 'from-emerald-400 to-green-600',
    difficulty: 'Easy',
    supportsBot: true,
    category: 'board',
  },

  // Card games
  {
    id: 'uno',
    name: 'UNO',
    description: 'Match colors and numbers',
    tagline: "Match colors and numbers — don\u2019t forget to shout UNO!",
    icon: '🃏',
    gradient: 'from-rose-500 to-orange-500',
    difficulty: 'Medium',
    supportsBot: true,
    category: 'card',
  },
  {
    id: 'go-fish',
    name: 'Go Fish',
    description: 'Collect sets of four',
    tagline: 'Ask for ranks you hold. Collect four of a kind.',
    icon: '🐟',
    gradient: 'from-sky-400 to-blue-600',
    difficulty: 'Easy',
    supportsBot: true,
    category: 'card',
  },
  {
    id: 'crazy-eights',
    name: 'Crazy Eights',
    description: 'Match suit or rank',
    tagline: 'Match suit or rank. Eights are wild!',
    icon: '8️⃣',
    gradient: 'from-purple-500 to-indigo-600',
    difficulty: 'Easy',
    supportsBot: true,
    category: 'card',
  },
  {
    id: 'war',
    name: 'War',
    description: 'Higher card wins',
    tagline: 'Pure luck: higher card wins the pile.',
    icon: '⚔️',
    gradient: 'from-rose-500 to-red-700',
    difficulty: 'Easy',
    supportsBot: true,
    category: 'card',
  },
  {
    id: 'solitaire',
    name: 'Solitaire',
    description: 'Klondike card solitaire',
    tagline: 'The classic Klondike. Play by yourself.',
    icon: '🂱',
    gradient: 'from-emerald-500 to-teal-700',
    difficulty: 'Medium',
    supportsBot: false,
    solo: true,
    category: 'card',
  },

  // Dice
  {
    id: 'pig',
    name: 'Pig',
    description: 'Bank before rolling a 1',
    tagline: 'Push your luck. First to 100 wins.',
    icon: '🐷',
    gradient: 'from-pink-400 to-rose-500',
    difficulty: 'Easy',
    supportsBot: true,
    category: 'dice',
  },
  {
    id: 'yahtzee',
    name: 'Yahtzee',
    description: 'Dice combinations on a scorecard',
    tagline: 'Roll for the best combinations.',
    icon: '🎲',
    gradient: 'from-amber-500 to-orange-600',
    difficulty: 'Medium',
    supportsBot: false,
    solo: true,
    category: 'dice',
  },

  // Arcade
  {
    id: 'snake',
    name: 'Snake',
    description: 'Grow without crashing',
    tagline: 'Eat the apples, don\u2019t hit yourself.',
    icon: '🐍',
    gradient: 'from-emerald-500 to-green-700',
    difficulty: 'Easy',
    supportsBot: false,
    solo: true,
    category: 'arcade',
  },
  {
    id: 'tetris',
    name: 'Tetris',
    description: 'Stack blocks, clear lines',
    tagline: 'Rotate, drop, clear. Addictive classic.',
    icon: '🧱',
    gradient: 'from-cyan-500 to-blue-600',
    difficulty: 'Medium',
    supportsBot: false,
    solo: true,
    category: 'arcade',
  },
  {
    id: 'flappy',
    name: 'Flappy Bird',
    description: 'Tap to fly through gaps',
    tagline: 'Tap to flap. Dodge the pipes.',
    icon: '🐤',
    gradient: 'from-yellow-300 to-orange-400',
    difficulty: 'Hard',
    supportsBot: false,
    solo: true,
    category: 'arcade',
  },
  {
    id: 'simon',
    name: 'Simon',
    description: 'Memorize the color sequence',
    tagline: 'Watch and repeat the flashing colors.',
    icon: '🔴',
    gradient: 'from-emerald-500 via-yellow-400 to-rose-500',
    difficulty: 'Medium',
    supportsBot: false,
    solo: true,
    category: 'arcade',
  },
  {
    id: 'whack',
    name: 'Whack-a-Mole',
    description: 'Tap moles as they pop up',
    tagline: 'Tap moles before they disappear.',
    icon: '🐹',
    gradient: 'from-amber-400 to-yellow-600',
    difficulty: 'Easy',
    supportsBot: false,
    solo: true,
    category: 'arcade',
  },
  {
    id: 'pong',
    name: 'Pong',
    description: 'Classic paddle duel',
    tagline: 'Classic paddle duel. Bounce the ball past your opponent.',
    icon: '🏓',
    gradient: 'from-slate-700 to-slate-900',
    difficulty: 'Easy',
    supportsBot: true,
    category: 'arcade',
  },
  {
    id: 'breakout',
    name: 'Breakout',
    description: 'Smash every brick',
    tagline: 'Smash every brick with the bouncing ball.',
    icon: '🧱',
    gradient: 'from-fuchsia-500 to-pink-600',
    difficulty: 'Medium',
    supportsBot: false,
    solo: true,
    category: 'arcade',
  },
  {
    id: 'dino',
    name: 'Dino Run',
    description: 'Endless runner',
    tagline: 'Endless runner — jump over the cacti.',
    icon: '🦖',
    gradient: 'from-emerald-500 to-teal-600',
    difficulty: 'Easy',
    supportsBot: false,
    solo: true,
    category: 'arcade',
  },
  {
    id: 'reaction',
    name: 'Reaction Time',
    description: 'Reflex test',
    tagline: 'Measure your reflexes in milliseconds.',
    icon: '⚡',
    gradient: 'from-rose-500 to-red-600',
    difficulty: 'Easy',
    supportsBot: false,
    solo: true,
    category: 'arcade',
  },
  {
    id: 'catch',
    name: 'Catch',
    description: 'Catch fruit, dodge bombs',
    tagline: 'Catch the fruit — dodge the bombs!',
    icon: '🧺',
    gradient: 'from-orange-400 to-amber-600',
    difficulty: 'Easy',
    supportsBot: false,
    solo: true,
    category: 'arcade',
  },
  {
    id: 'bubble',
    name: 'Bubble Shooter',
    description: 'Aim and pop bubbles',
    tagline: 'Aim and pop clusters of matching bubbles.',
    icon: '🫧',
    gradient: 'from-cyan-400 to-blue-600',
    difficulty: 'Easy',
    supportsBot: false,
    solo: true,
    category: 'arcade',
  },
  {
    id: 'morris',
    name: "Nine Men's Morris",
    description: 'Mill strategy game',
    tagline: 'Ancient mill game — form three in a row to capture.',
    icon: '🪨',
    gradient: 'from-amber-700 to-stone-700',
    difficulty: 'Medium',
    supportsBot: true,
    category: 'board',
  },
  {
    id: 'dominoes',
    name: 'Dominoes',
    description: 'Match ends and empty your hand',
    tagline: 'Match the ends and empty your hand first.',
    icon: '🀰',
    gradient: 'from-stone-500 to-stone-800',
    difficulty: 'Medium',
    supportsBot: true,
    category: 'card',
  },

  // Art & creativity
  {
    id: 'doodle',
    name: 'Doodle Pad',
    description: 'Free-form drawing',
    tagline: 'Free-form drawing with colors and brushes.',
    icon: '✏️',
    gradient: 'from-pink-400 to-rose-500',
    difficulty: 'Easy',
    supportsBot: false,
    solo: true,
    category: 'art',
  },
  {
    id: 'pixel',
    name: 'Pixel Art',
    description: 'Grid-based pixel painter',
    tagline: 'Paint on a 16×16 grid, pixel by pixel.',
    icon: '🟦',
    gradient: 'from-sky-400 to-indigo-500',
    difficulty: 'Easy',
    supportsBot: false,
    solo: true,
    category: 'art',
  },
  {
    id: 'spin',
    name: 'Spin',
    description: 'Kaleidoscope drawing',
    tagline: 'Draw kaleidoscope patterns with radial symmetry.',
    icon: '🌀',
    gradient: 'from-fuchsia-500 to-purple-700',
    difficulty: 'Easy',
    supportsBot: false,
    solo: true,
    category: 'art',
  },
  {
    id: 'sticker',
    name: 'Sticker',
    description: 'Stamp emoji stickers',
    tagline: 'Stamp colorful stickers on a blank canvas.',
    icon: '🌟',
    gradient: 'from-amber-300 to-orange-500',
    difficulty: 'Easy',
    supportsBot: false,
    solo: true,
    category: 'art',
  },

  // Math
  {
    id: 'balloon-pop',
    name: 'Balloon Pop',
    description: 'Pop balloons that match the answer',
    tagline: 'Solve the problem, pop the right balloon.',
    icon: '🎈',
    gradient: 'from-rose-400 to-pink-600',
    difficulty: 'Easy',
    supportsBot: false,
    solo: true,
    category: 'math',
  },
  {
    id: 'make-ten',
    name: 'Make Ten',
    description: 'Pair cards that sum to the target',
    tagline: 'Match pairs that add up to the target.',
    icon: '🔟',
    gradient: 'from-sky-400 to-blue-600',
    difficulty: 'Easy',
    supportsBot: false,
    solo: true,
    category: 'math',
  },
  {
    id: 'telling-time',
    name: 'Telling Time',
    description: 'Read the clock face',
    tagline: 'Pick the time shown on the clock.',
    icon: '🕒',
    gradient: 'from-yellow-400 to-orange-500',
    difficulty: 'Easy',
    supportsBot: false,
    solo: true,
    category: 'math',
  },
  {
    id: 'number-pattern',
    name: 'Number Pattern',
    description: 'Find the missing number',
    tagline: 'Spot the rule and fill the gap.',
    icon: '🔢',
    gradient: 'from-indigo-500 to-purple-600',
    difficulty: 'Medium',
    supportsBot: false,
    solo: true,
    category: 'math',
  },
  {
    id: 'subitize',
    name: 'Subitize',
    description: 'Quick-count the dots',
    tagline: 'Count the dots before they disappear.',
    icon: '👁️',
    gradient: 'from-cyan-400 to-teal-600',
    difficulty: 'Easy',
    supportsBot: false,
    solo: true,
    category: 'math',
  },

  // Music
  {
    id: 'piano',
    name: 'Piano',
    description: 'Two-octave playable piano',
    tagline: 'Play notes with your mouse, touch, or keyboard.',
    icon: '🎹',
    gradient: 'from-gray-700 to-gray-900',
    difficulty: 'Easy',
    supportsBot: false,
    solo: true,
    category: 'music',
  },
  {
    id: 'drum-pad',
    name: 'Drum Pad',
    description: 'Tap drums and make a beat',
    tagline: 'Nine pads, one groove.',
    icon: '🥁',
    gradient: 'from-rose-500 to-red-700',
    difficulty: 'Easy',
    supportsBot: false,
    solo: true,
    category: 'music',
  },
  {
    id: 'xylophone',
    name: 'Xylophone',
    description: 'Tap the colored bars',
    tagline: 'Play a tune on the colorful bars.',
    icon: '🎶',
    gradient: 'from-amber-400 to-orange-500',
    difficulty: 'Easy',
    supportsBot: false,
    solo: true,
    category: 'music',
  },

  // Puzzle
  {
    id: 'memory',
    name: 'Memory',
    description: 'Flip and match pairs',
    tagline: 'Flip cards, remember pairs.',
    icon: '🧠',
    gradient: 'from-indigo-500 to-purple-600',
    difficulty: 'Easy',
    supportsBot: false,
    solo: true,
    category: 'puzzle',
  },
  {
    id: '2048',
    name: '2048',
    description: 'Combine tiles to reach 2048',
    tagline: 'Slide tiles. Matching numbers merge.',
    icon: '🔢',
    gradient: 'from-amber-500 to-orange-600',
    difficulty: 'Medium',
    supportsBot: false,
    solo: true,
    category: 'puzzle',
  },
  {
    id: 'minesweeper',
    name: 'Minesweeper',
    description: 'Clear the field, avoid mines',
    tagline: 'Use the numbers to deduce where the mines are.',
    icon: '💣',
    gradient: 'from-stone-400 to-stone-600',
    difficulty: 'Medium',
    supportsBot: false,
    solo: true,
    category: 'puzzle',
  },
  {
    id: 'fifteen',
    name: '15 Puzzle',
    description: 'Slide tiles into order',
    tagline: 'Rearrange tiles 1 to 15.',
    icon: '🔲',
    gradient: 'from-indigo-400 to-purple-500',
    difficulty: 'Easy',
    supportsBot: false,
    solo: true,
    category: 'puzzle',
  },
  {
    id: 'sudoku',
    name: 'Sudoku',
    description: 'Fill the grid with 1–9',
    tagline: 'Classic 9×9 number logic puzzle.',
    icon: '🧮',
    gradient: 'from-gray-600 to-gray-800',
    difficulty: 'Hard',
    supportsBot: false,
    solo: true,
    category: 'puzzle',
  },
  {
    id: 'nonogram',
    name: 'Nonogram',
    description: 'Reveal the hidden picture',
    tagline: 'Use the number clues to paint the picture.',
    icon: '🎨',
    gradient: 'from-fuchsia-500 to-pink-600',
    difficulty: 'Medium',
    supportsBot: false,
    solo: true,
    category: 'puzzle',
  },
  {
    id: 'hidden-picture',
    name: 'Hidden Picture',
    description: 'Spot hidden objects in a scene',
    tagline: 'Find every hidden object as fast as you can.',
    icon: '🔎',
    gradient: 'from-teal-400 to-emerald-600',
    difficulty: 'Easy',
    supportsBot: false,
    solo: true,
    category: 'puzzle',
  },

  // Educational
  {
    id: 'hangman',
    name: 'Hangman',
    description: 'Guess the word, letter by letter',
    tagline: 'Save the stick figure by guessing right.',
    icon: '🪢',
    gradient: 'from-slate-500 to-slate-700',
    difficulty: 'Easy',
    supportsBot: false,
    solo: true,
    category: 'educational',
  },
  {
    id: 'word-search',
    name: 'Word Search',
    description: 'Find hidden words',
    tagline: 'Find words hidden in the letter grid.',
    icon: '🔍',
    gradient: 'from-blue-400 to-indigo-500',
    difficulty: 'Easy',
    supportsBot: false,
    solo: true,
    category: 'educational',
  },
  {
    id: 'math-quiz',
    name: 'Math Quiz',
    description: 'Fast-paced math questions',
    tagline: 'Solve 10 questions before time runs out.',
    icon: '➕',
    gradient: 'from-emerald-500 to-teal-600',
    difficulty: 'Medium',
    supportsBot: false,
    solo: true,
    category: 'educational',
  },
  {
    id: 'flags-quiz',
    name: 'Flags Quiz',
    description: 'Identify country flags',
    tagline: 'Spot the country from its flag.',
    icon: '🏳️',
    gradient: 'from-rose-400 to-red-600',
    difficulty: 'Easy',
    supportsBot: false,
    solo: true,
    category: 'educational',
  },
  {
    id: 'typing',
    name: 'Typing Practice',
    description: 'WPM & accuracy trainer',
    tagline: 'Type sentences to build speed and accuracy.',
    icon: '⌨️',
    gradient: 'from-gray-500 to-gray-700',
    difficulty: 'Easy',
    supportsBot: false,
    solo: true,
    category: 'educational',
  },
  {
    id: 'word-scramble',
    name: 'Word Scramble',
    description: 'Unscramble jumbled letters',
    tagline: 'Click the letters in order to rebuild the word.',
    icon: '🔤',
    gradient: 'from-lime-500 to-emerald-600',
    difficulty: 'Easy',
    supportsBot: false,
    solo: true,
    category: 'educational',
  },
  {
    id: 'alphabet-order',
    name: 'Alphabet Order',
    description: 'Tap letters A–Z in order',
    tagline: 'Hit the letters in alphabetical order as fast as you can.',
    icon: '🔠',
    gradient: 'from-amber-400 to-pink-500',
    difficulty: 'Easy',
    supportsBot: false,
    solo: true,
    category: 'educational',
  },
];

type View = 'home' | 'game';

function App() {
  const { t } = useTranslation();
  const [view, setView] = useState<View>('home');
  const [activeGameId, setActiveGameId] = useState<string | null>(null);
  const [isBotEnabled, setIsBotEnabled] = useState<boolean>(false);
  const [restartKey, setRestartKey] = useState<number>(0);

  useEffect(() => {
    const active = AVAILABLE_GAMES.find((g) => g.id === activeGameId);
    const brand = t('app.brand');
    document.title =
      view === 'game' && active
        ? `${t(`game.${active.id}.name`)} — ${brand}`
        : brand;
  }, [view, activeGameId, t]);

  const activeGame = AVAILABLE_GAMES.find((g) => g.id === activeGameId) ?? null;

  const renderGame = (gameId: string) => {
    switch (gameId) {
      case 'chess': return <Chess isBotEnabled={isBotEnabled} />;
      case 'dama': return <Dama isBotEnabled={isBotEnabled} />;
      case 'tris': return <Tris isBotEnabled={isBotEnabled} />;
      case 'snakes-and-ladders': return <SnakesAndLadders isBotEnabled={isBotEnabled} />;
      case 'backgammon': return <Backgammon isBotEnabled={isBotEnabled} />;
      case 'uno': return <Uno isBotEnabled={isBotEnabled} />;
      case 'connect-four': return <ConnectFour isBotEnabled={isBotEnabled} />;
      case 'reversi': return <Reversi isBotEnabled={isBotEnabled} />;
      case 'gomoku': return <Gomoku isBotEnabled={isBotEnabled} />;
      case 'dots-boxes': return <DotsAndBoxes isBotEnabled={isBotEnabled} />;
      case 'mancala': return <Mancala isBotEnabled={isBotEnabled} />;
      case 'battleship': return <Battleship isBotEnabled={isBotEnabled} />;
      case 'ludo': return <Ludo isBotEnabled={isBotEnabled} />;
      case 'go-fish': return <GoFish isBotEnabled={isBotEnabled} />;
      case 'crazy-eights': return <CrazyEights isBotEnabled={isBotEnabled} />;
      case 'war': return <War isBotEnabled={isBotEnabled} />;
      case 'solitaire': return <Solitaire isBotEnabled={isBotEnabled} />;
      case 'pig': return <Pig isBotEnabled={isBotEnabled} />;
      case 'yahtzee': return <Yahtzee isBotEnabled={isBotEnabled} />;
      case 'memory': return <Memory isBotEnabled={isBotEnabled} />;
      case '2048': return <Game2048 isBotEnabled={isBotEnabled} />;
      case 'minesweeper': return <Minesweeper isBotEnabled={isBotEnabled} />;
      case 'fifteen': return <FifteenPuzzle isBotEnabled={isBotEnabled} />;
      case 'sudoku': return <Sudoku isBotEnabled={isBotEnabled} />;
      case 'nonogram': return <Nonogram isBotEnabled={isBotEnabled} />;
      case 'snake': return <Snake isBotEnabled={isBotEnabled} />;
      case 'tetris': return <Tetris isBotEnabled={isBotEnabled} />;
      case 'flappy': return <FlappyBird isBotEnabled={isBotEnabled} />;
      case 'simon': return <Simon isBotEnabled={isBotEnabled} />;
      case 'whack': return <WhackAMole isBotEnabled={isBotEnabled} />;
      case 'pong': return <Pong isBotEnabled={isBotEnabled} />;
      case 'breakout': return <Breakout isBotEnabled={isBotEnabled} />;
      case 'dino': return <DinoRun isBotEnabled={isBotEnabled} />;
      case 'reaction': return <ReactionTime isBotEnabled={isBotEnabled} />;
      case 'catch': return <Catch isBotEnabled={isBotEnabled} />;
      case 'bubble': return <BubbleShooter isBotEnabled={isBotEnabled} />;
      case 'morris': return <NineMensMorris isBotEnabled={isBotEnabled} />;
      case 'dominoes': return <Dominoes isBotEnabled={isBotEnabled} />;
      case 'doodle': return <DoodlePad isBotEnabled={isBotEnabled} />;
      case 'pixel': return <PixelArt isBotEnabled={isBotEnabled} />;
      case 'spin': return <Spin isBotEnabled={isBotEnabled} />;
      case 'sticker': return <Sticker isBotEnabled={isBotEnabled} />;
      case 'balloon-pop': return <BalloonPop isBotEnabled={isBotEnabled} />;
      case 'make-ten': return <MakeTen isBotEnabled={isBotEnabled} />;
      case 'telling-time': return <TellingTime isBotEnabled={isBotEnabled} />;
      case 'number-pattern': return <NumberPattern isBotEnabled={isBotEnabled} />;
      case 'subitize': return <Subitize isBotEnabled={isBotEnabled} />;
      case 'piano': return <Piano isBotEnabled={isBotEnabled} />;
      case 'drum-pad': return <DrumPad isBotEnabled={isBotEnabled} />;
      case 'xylophone': return <Xylophone isBotEnabled={isBotEnabled} />;
      case 'word-scramble': return <WordScramble isBotEnabled={isBotEnabled} />;
      case 'alphabet-order': return <AlphabetOrder isBotEnabled={isBotEnabled} />;
      case 'hidden-picture': return <HiddenPicture isBotEnabled={isBotEnabled} />;
      case 'hangman': return <Hangman isBotEnabled={isBotEnabled} />;
      case 'word-search': return <WordSearch isBotEnabled={isBotEnabled} />;
      case 'math-quiz': return <MathQuiz isBotEnabled={isBotEnabled} />;
      case 'flags-quiz': return <FlagsQuiz isBotEnabled={isBotEnabled} />;
      case 'typing': return <TypingPractice isBotEnabled={isBotEnabled} />;
      default: return <div className="text-gray-600">Game not found.</div>;
    }
  };

  const handleSelectGame = (gameId: string) => {
    setActiveGameId(gameId);
    setRestartKey((k) => k + 1);
    setView('game');
  };

  const handleBackHome = () => setView('home');

  const handleRestart = () => setRestartKey((k) => k + 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-slate-900 dark:to-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-blue-200/40 blur-3xl dark:bg-blue-500/10" />
        <div className="absolute top-1/3 -right-24 w-96 h-96 rounded-full bg-purple-200/40 blur-3xl dark:bg-purple-500/10" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 rounded-full bg-pink-200/30 blur-3xl dark:bg-pink-500/10" />
      </div>

      <div className="relative">
        <header className="bg-white/70 backdrop-blur-md shadow-sm border-b border-white/60 sticky top-0 z-40 dark:bg-gray-900/70 dark:border-gray-800/60">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
            <button
              onClick={handleBackHome}
              className="flex items-center gap-2.5 group"
              aria-label={t('shell.back_aria')}
            >
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md group-hover:shadow-lg transition-shadow">
                <Gamepad2 className="w-5 h-5 text-white" />
              </span>
              <span className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
                Game<span className="text-blue-600 dark:text-blue-400">Hub</span>
              </span>
            </button>
            <div className="flex items-center gap-2 md:gap-3">
              <span className="hidden lg:block text-sm text-gray-500 dark:text-gray-400">
                {t('app.tagline')}
              </span>
              <ThemePicker />
              <LanguagePicker />
            </div>
          </div>
        </header>

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
              <div key={`${activeGame.id}-${restartKey}`}>
                {renderGame(activeGame.id)}
              </div>
            </GameShell>
          )}
        </main>

        <footer className="max-w-6xl mx-auto px-4 py-8 text-center text-xs text-gray-500 dark:text-gray-400">
          {t('app.footer')}
        </footer>
      </div>
    </div>
  );
}

export default App;
