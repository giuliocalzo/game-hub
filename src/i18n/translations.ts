import { Lang, Dict } from './types';

// English is the canonical source. Italian and German translations follow.
// Keys not present in it/de fall back to en.

const en: Dict = {
  // App shell
  'app.brand': 'GameHub',
  'app.tagline': 'Play together · Learn together',
  'app.footer': 'Made with care for curious young players.',

  // Home: hero
  'home.badge': '{count}+ fun games in one place',
  'home.title.pick': 'Pick a game and',
  'home.title.play': "let's play!",
  'home.subtitle':
    'Classic board games, card games, puzzles and arcade fun — all in one colorful home for kids.',

  // Home: mode toggle
  'mode.two_players': '2 Players',
  'mode.vs_bot': 'Play vs Bot',
  'mode.vs_bot_badge': 'vs Bot',

  // Home: search & filter
  'home.search.placeholder': 'Search games…',
  'home.filter.all': 'All',
  'home.empty': 'No games match your search.',

  // Home: card
  'card.solo': '1 player · solo',
  'card.two_players_device': '2 players · same device',
  'card.bot_unavailable': 'Bot mode not available',
  'card.play': 'Play',
  'home.footer_tip': 'Switch between 2 Players and Play vs Bot at any time.',

  // Shell
  'shell.home': 'Home',
  'shell.restart': 'Restart',
  'shell.back_aria': 'Back to home',
  'shell.restart_aria': 'Restart game',
  'shell.how_to_play': 'How to play',

  // Language picker
  'lang.label': 'Language',

  // Theme picker
  'theme.label': 'Theme',
  'theme.light': 'Light',
  'theme.dark': 'Dark',
  'theme.system': 'System',

  // Difficulty
  'difficulty.Easy': 'Easy',
  'difficulty.Medium': 'Medium',
  'difficulty.Hard': 'Hard',

  // Categories
  'category.board.label': 'Board & strategy',
  'category.board.desc': 'Think, plan, outsmart.',
  'category.card.label': 'Card games',
  'category.card.desc': 'Match, collect, and swap.',
  'category.dice.label': 'Dice games',
  'category.dice.desc': 'Roll your luck.',
  'category.puzzle.label': 'Puzzles',
  'category.puzzle.desc': 'Solo challenges.',
  'category.arcade.label': 'Arcade & reflex',
  'category.arcade.desc': 'Quick reactions.',
  'category.educational.label': 'Learn & play',
  'category.educational.desc': 'Sneaky learning.',
  'category.art.label': 'Art & creativity',
  'category.art.desc': 'Make something beautiful.',
  'category.math.label': 'Math games',
  'category.math.desc': 'Counting, calculation, and patterns.',
  'category.music.label': 'Music',
  'category.music.desc': 'Play, strum, and make a beat.',

  // Music activities
  'game.piano.name': 'Piano',
  'game.piano.tagline': 'Play notes with your mouse, touch, or keyboard.',
  'game.piano.instructions': 'Click or tap the keys to play. On desktop, use the keyboard row (a, s, d…) to play the white keys. Toggle note labels with the button at the top.',
  'game.drum-pad.name': 'Drum Pad',
  'game.drum-pad.tagline': 'Nine pads, one groove.',
  'game.drum-pad.instructions': 'Tap the pads to trigger kick, snare, hi-hat, clap, and more. On desktop, press keys 1–9 to play along. Chain taps to build a beat.',
  'game.xylophone.name': 'Xylophone',
  'game.xylophone.tagline': 'Play a tune on the colorful bars.',
  'game.xylophone.instructions': 'Tap a bar to play its note. The bars are tuned to a C-major scale (C D E F G A B C). You can also press keys 1–8 on the keyboard.',
  'game.metronome.name': 'Metronome',
  'game.metronome.tagline': 'Adjustable BPM and time signature.',
  'game.metronome.instructions': 'Drag the slider to set the tempo (40–220 BPM) or tap a preset. Choose 2/4, 3/4, 4/4 or 6/4 and press Start. The first beat of each bar is emphasized with a different color and pitch.',
  'game.note-quiz.name': 'Note Quiz',
  'game.note-quiz.tagline': 'Read the treble clef — pick the right note.',
  'game.note-quiz.instructions': 'A note appears on the staff and plays. Pick its letter name from the four options. Use the replay button to hear it again.',

  // Literacy / puzzle extras
  'game.word-scramble.name': 'Word Scramble',
  'game.word-scramble.tagline': 'Click the letters in order to rebuild the word.',
  'game.word-scramble.instructions': 'The target word has been jumbled into letter tiles. Click the tiles one by one to spell the correct word. Words come from the selected language. Use Backspace to undo the last pick.',
  'game.alphabet-order.name': 'Alphabet Order',
  'game.alphabet-order.tagline': 'Hit the letters in alphabetical order as fast as you can.',
  'game.alphabet-order.instructions': 'Click the letters in alphabetical order, starting from A. The next letter to find is highlighted. Pick A–E, A–J, or the full A–Z.',
  'game.hidden-picture.name': 'Hidden Picture',
  'game.hidden-picture.tagline': 'Find every hidden object as fast as you can.',
  'game.hidden-picture.instructions': 'Each scene hides a handful of objects. Look at the list and click every object when you spot it in the picture. Switch scenes with the chips at the top.',
  'game.maze.name': 'Maze',
  'game.maze.tagline': 'Navigate to the flag through a generated maze.',
  'game.maze.instructions': 'Use arrow keys, WASD, or the on-screen arrows to move your token. Reach the flag in the bottom-right corner. Each maze is freshly generated.',
  'game.ball-sort.name': 'Ball Sort',
  'game.ball-sort.tagline': 'Arrange each tube to hold a single color.',
  'game.ball-sort.instructions': 'Tap a tube to pick up the top ball, then tap a target tube. You can only place a ball on an empty tube or on a ball of the same color. When all tubes are empty or full of one color, you win.',
  'game.color-link.name': 'Color Link',
  'game.color-link.tagline': 'Draw non-crossing paths between pairs.',
  'game.color-link.instructions': 'Drag from a colored dot to its match. Paths cannot cross. Every cell of the grid must be covered when the puzzle is solved.',
  'game.block-puzzle.name': 'Block Puzzle',
  'game.block-puzzle.tagline': 'Place pieces on a 10×10 grid and clear lines.',
  'game.block-puzzle.instructions': 'Pick a piece from the tray, then tap a grid cell to place it. Completing a full row or column clears it and scores bonus points. Game ends when none of the three pieces fit.',
  'game.peg-solitaire.name': 'Peg Solitaire',
  'game.peg-solitaire.tagline': 'Jump pegs over pegs to remove them.',
  'game.peg-solitaire.instructions': 'Select a peg, then click a green dot to jump over an adjacent peg and remove it. The goal is to end with one peg in the center of the board.',
  'game.darts.name': 'Darts',
  'game.darts.tagline': 'Click to throw — aim for the bullseye.',
  'game.darts.instructions': 'Click anywhere on the rotating target to throw a dart. The bullseye is worth 50 points; outer rings score less. You have 10 darts per round.',
  'game.match-3.name': 'Match 3',
  'game.match-3.tagline': 'Swap gems to line up three or more — score combos!',
  'game.match-3.instructions': 'Tap a gem, then tap an adjacent one to swap them. If it makes a line of 3 or more of the same gem, they clear and gems fall in. Chains give bonus points. You have 20 moves.',
  'game.mahjong.name': 'Mahjong Solitaire',
  'game.mahjong.tagline': 'Find matching pairs of open tiles to remove them.',
  'game.mahjong.instructions': 'Click two tiles with the same picture to remove them. A tile is only selectable if it is not covered by another tile above, and has no tile directly touching either its left or right side. Clear the whole board to win.',
  'game.math-runner.name': 'Math Runner',
  'game.math-runner.tagline': 'Steer into the correct answer before the wall!',
  'game.math-runner.instructions': 'Press Start to run. Walls with math problems come at you, each with three answer gates. Use Left/Right arrows or A/D to move lanes and pass through the correct answer. Hit 10 correct to win; 5 wrong ends the run.',

  // Math activities
  'game.balloon-pop.name': 'Balloon Pop',
  'game.balloon-pop.tagline': 'Solve the problem, pop the right balloon.',
  'game.balloon-pop.instructions': 'Read the math problem at the top. Balloons float up with numbers — click the one whose number equals the answer. Wrong pops cost points. Reach the goal before time runs out.',
  'game.make-ten.name': 'Make Ten',
  'game.make-ten.tagline': 'Match pairs that add up to the target.',
  'game.make-ten.instructions': 'Click two cards that add up to the target (10, 20, or 100). Matched pairs stay face up. Clear all pairs in as few moves as possible.',
  'game.telling-time.name': 'Telling Time',
  'game.telling-time.tagline': 'Pick the time shown on the clock.',
  'game.telling-time.instructions': 'Read the clock face, then choose the matching time from the four options. Pick a difficulty to practice o\u2019clock, half hours, quarter hours, or 5-minute marks.',
  'game.number-pattern.name': 'Number Pattern',
  'game.number-pattern.tagline': 'Spot the rule and fill the gap.',
  'game.number-pattern.instructions': 'Look at the sequence and the rule shown above it. One number is missing — pick the value that keeps the pattern going.',
  'game.subitize.name': 'Subitize',
  'game.subitize.tagline': 'Count the dots before they disappear.',
  'game.subitize.instructions': 'Dots flash on screen for a moment. When they disappear, pick how many you saw. Harder levels show more dots and flash faster.',

  // Art activities
  'game.doodle.name': 'Doodle Pad',
  'game.doodle.tagline': 'Free-form drawing with colors and brushes.',
  'game.doodle.instructions': 'Click and drag to draw. Pick a color and brush size, or grab the eraser. Undo steps back one stroke; Clear wipes everything.',
  'game.pixel.name': 'Pixel Art',
  'game.pixel.tagline': 'Paint on a 16×16 grid, pixel by pixel.',
  'game.pixel.instructions': 'Pick a color and click cells to paint. Hold and drag to fill quickly. Use the eraser to remove a pixel.',
  'game.spin.name': 'Spin',
  'game.spin.tagline': 'Draw kaleidoscope patterns with radial symmetry.',
  'game.spin.instructions': 'Drag on the circle to draw. Every stroke is mirrored and rotated to create symmetric patterns. Change the symmetry count or toggle mirror for different effects.',
  'game.sticker.name': 'Sticker',
  'game.sticker.tagline': 'Stamp colorful stickers on a blank canvas.',
  'game.sticker.instructions': 'Pick a sticker and a size, then click anywhere to stamp it. Click a placed sticker to remove it.',

  // Game taglines (keys use the game's id)
  'game.tris.name': 'Tic-Tac-Toe',
  'game.tris.tagline': 'Quick, classic, and great for all ages.',
  'game.tris.instructions': 'Line up three in a row to win.',

  'game.connect-four.name': 'Connect Four',
  'game.connect-four.tagline': 'Drop, match four, win. Classic for all ages.',
  'game.connect-four.instructions':
    'Click a column to drop your disc. First to line up four wins.',

  'game.dama.name': 'Checkers',
  'game.dama.tagline': 'Jump, capture, and crown your kings.',
  'game.dama.instructions':
    'Captures are mandatory. Reach the far row to be crowned a king.',

  'game.reversi.name': 'Reversi',
  'game.reversi.tagline': 'Sandwich your opponent and flip the board.',
  'game.reversi.instructions':
    'Place a disc so at least one row of opponent discs is trapped; those flip to your color.',

  'game.gomoku.name': 'Gomoku',
  'game.gomoku.tagline': 'Like tic-tac-toe, but you need five in a row.',
  'game.gomoku.instructions':
    'Place stones in turn. First to get five in a row wins.',

  'game.dots-boxes.name': 'Dots & Boxes',
  'game.dots-boxes.tagline':
    'Draw the last side of a box to claim it.',
  'game.dots-boxes.instructions':
    'Take turns drawing a line. Complete the 4th side of a box to claim it and play again.',

  'game.mancala.name': 'Mancala',
  'game.mancala.tagline':
    'Sow stones around the pits. Land in your store for a bonus turn.',
  'game.mancala.instructions':
    'Pick up stones from one of your pits and sow them counter-clockwise. Land the last stone in your store for another turn.',

  'game.backgammon.name': 'Backgammon',
  'game.backgammon.tagline': 'Race your pieces home with a bit of dice luck.',
  'game.backgammon.instructions':
    'Move pieces around and bear them off to win. Hitting an opponent sends them to the bar.',

  'game.battleship.name': 'Battleship',
  'game.battleship.tagline':
    "Guess cells on the hidden grid and sink the fleet.",
  'game.battleship.instructions':
    "Click cells in the opponent's waters to fire. Sink every ship to win.",

  'game.ludo.name': 'Ludo',
  'game.ludo.tagline': 'Roll dice, race your four tokens home.',
  'game.ludo.instructions':
    'Roll a 6 to leave base. Move tokens around the track and finish all four to win. Rolling a 6 grants another roll.',

  'game.chess.name': 'Chess',
  'game.chess.tagline': 'The ultimate strategy game. Plan your moves!',
  'game.chess.instructions':
    'Click a piece to select, then click a valid square to move.',

  'game.snakes-and-ladders.name': 'Snakes & Ladders',
  'game.snakes-and-ladders.tagline':
    'Roll the dice, climb ladders, dodge snakes!',
  'game.snakes-and-ladders.instructions':
    'Roll the dice and race to 100. Ladders lift you up, snakes drag you down.',

  'game.uno.name': 'UNO',
  'game.uno.tagline':
    "Match colors and numbers — don’t forget to shout UNO!",
  'game.uno.instructions':
    'Play a card that matches the color or number. Empty your hand first to win.',

  'game.go-fish.name': 'Go Fish',
  'game.go-fish.tagline': 'Ask for ranks you hold. Collect four of a kind.',
  'game.go-fish.instructions':
    'Ask the bot for a rank you hold. If they have it, you take all. Otherwise, "go fish" from the deck.',

  'game.crazy-eights.name': 'Crazy Eights',
  'game.crazy-eights.tagline': 'Match suit or rank. Eights are wild!',
  'game.crazy-eights.instructions':
    'Play a card matching the rank or suit of the top card. Eights are wild — pick any suit. First to empty hand wins.',

  'game.war.name': 'War',
  'game.war.tagline': 'Pure luck: higher card wins the pile.',
  'game.war.instructions':
    'Both players flip the top card. Higher card takes both. Ties trigger a "war".',

  'game.solitaire.name': 'Solitaire',
  'game.solitaire.tagline': 'The classic Klondike. Play by yourself.',
  'game.solitaire.instructions':
    'Click a card to select, then click a destination. Alternate colors go down on tableau. Foundations build up by suit from A to K.',

  'game.pig.name': 'Pig',
  'game.pig.tagline': 'Push your luck. First to 100 wins.',
  'game.pig.instructions':
    'Roll to add to your turn total. Bank to lock it in. Roll a 1 and lose your turn. First to 100 wins!',

  'game.yahtzee.name': 'Yahtzee',
  'game.yahtzee.tagline': 'Roll for the best combinations.',
  'game.yahtzee.instructions':
    'Roll up to 3 times per turn. Keep dice by tapping them. Pick a category to score.',

  'game.snake.name': 'Snake',
  'game.snake.tagline': 'Eat the apples, don’t hit yourself.',
  'game.snake.instructions':
    "Use arrows or WASD to steer. Eat red food, don't hit yourself or the walls.",

  'game.tetris.name': 'Tetris',
  'game.tetris.tagline': 'Rotate, drop, clear. Addictive classic.',
  'game.tetris.instructions':
    '← → to move · ↑ to rotate · ↓ soft-drop · space hard-drop.',

  'game.flappy.name': 'Flappy Bird',
  'game.flappy.tagline': 'Tap to flap. Dodge the pipes.',
  'game.flappy.instructions':
    'Tap (or press space) to flap. Steer through the gaps without touching the pipes or walls.',

  'game.simon.name': 'Simon',
  'game.simon.tagline': 'Watch and repeat the flashing colors.',
  'game.simon.instructions':
    'Watch the pattern, then repeat it by tapping the colors in order.',

  'game.whack.name': 'Whack-a-Mole',
  'game.whack.tagline': 'Tap moles before they disappear.',
  'game.whack.instructions':
    'Tap the moles before they disappear. Score as many as you can in 30 seconds.',

  'game.memory.name': 'Memory',
  'game.memory.tagline': 'Flip cards, remember pairs.',
  'game.memory.instructions':
    'Flip two cards at a time. Remember where each picture is and match the pairs.',

  'game.2048.name': '2048',
  'game.2048.tagline': 'Slide tiles. Matching numbers merge.',
  'game.2048.instructions':
    'Slide tiles in four directions. Matching tiles merge. First to 2048 wins.',

  'game.minesweeper.name': 'Minesweeper',
  'game.minesweeper.tagline':
    'Use the numbers to deduce where the mines are.',
  'game.minesweeper.instructions':
    'Tap to open · right-click (or long-press) to flag. Numbers show nearby mines.',

  'game.fifteen.name': '15 Puzzle',
  'game.fifteen.tagline': 'Rearrange tiles 1 to 15.',
  'game.fifteen.instructions':
    'Slide tiles into the empty square to order them 1 → 15.',

  'game.sudoku.name': 'Sudoku',
  'game.sudoku.tagline': 'Classic 9×9 number logic puzzle.',
  'game.sudoku.instructions':
    'Tap a cell then a number, or use your keyboard. 0 / backspace clears.',

  'game.nonogram.name': 'Nonogram',
  'game.nonogram.tagline': 'Use the number clues to paint the picture.',
  'game.nonogram.instructions':
    'Click to fill a cell. Right-click (or long-press) to mark it empty. Numbers show consecutive filled cells.',

  'game.hangman.name': 'Hangman',
  'game.hangman.tagline': 'Save the stick figure by guessing right.',
  'game.hangman.instructions':
    'Guess the word one letter at a time. Six wrong guesses and the game ends.',

  'game.word-search.name': 'Word Search',
  'game.word-search.tagline': 'Find words hidden in the letter grid.',
  'game.word-search.instructions':
    'Click the first and last letter of a word. Words can go in any direction.',

  'game.math-quiz.name': 'Math Quiz',
  'game.math-quiz.tagline':
    'Solve 10 questions before time runs out.',
  'game.math-quiz.instructions':
    'Answer 10 quick math questions before time runs out.',

  'game.flags-quiz.name': 'Flags Quiz',
  'game.flags-quiz.tagline': 'Spot the country from its flag.',
  'game.flags-quiz.instructions':
    'Look at the flag and pick the correct country.',

  'game.typing.name': 'Typing Practice',
  'game.typing.tagline':
    'Type sentences to build speed and accuracy.',
  'game.typing.instructions':
    'Type the sentence exactly as shown. Your WPM and accuracy update as you go.',

  // Toy-Theater-inspired additions
  'game.bubble.name': 'Bubble Shooter',
  'game.bubble.tagline': 'Aim and pop clusters of matching bubbles.',
  'game.bubble.instructions': 'Move the mouse to aim, click to shoot. Match three or more bubbles of the same color to pop them.',
  'game.morris.name': "Nine Men's Morris",
  'game.morris.tagline': 'Ancient mill game — form three in a row to capture.',
  'game.morris.instructions': 'Place nine stones each, then move along lines. Forming a mill (three in a row) lets you remove an opponent\u2019s stone. When you have only three stones, you can "fly" to any empty point.',
  'game.dominoes.name': 'Dominoes',
  'game.dominoes.tagline': 'Match the ends and empty your hand first.',
  'game.dominoes.instructions': 'Play a tile whose end matches either end of the chain. Draw from the boneyard when you can\u2019t play. First to empty their hand wins.',

  // New arcade games
  'game.pong.name': 'Pong',
  'game.pong.tagline': 'Classic paddle duel. Bounce the ball past your opponent.',
  'game.pong.instructions': 'Move with ↑ ↓ (or W/S). In 2-player mode the right paddle uses I/K. First to 5 wins.',
  'game.breakout.name': 'Breakout',
  'game.breakout.tagline': 'Smash every brick with the bouncing ball.',
  'game.breakout.instructions': 'Move with ← → or mouse. Space or tap to launch the ball. Three lives — clear every brick to win.',
  'game.dino.name': 'Dino Run',
  'game.dino.tagline': 'Endless runner — jump over the cacti.',
  'game.dino.instructions': 'Tap, click, or press space to jump. The game speeds up the longer you survive.',
  'game.reaction.name': 'Reaction Time',
  'game.reaction.tagline': 'Measure your reflexes in milliseconds.',
  'game.reaction.instructions': 'Wait for the button to turn green, then tap as fast as you can. Tap too early and the round resets.',
  'game.catch.name': 'Catch',
  'game.catch.tagline': 'Catch the fruit — dodge the bombs!',
  'game.catch.instructions': 'Move the basket with ← → or by dragging. Catch fruit to score, dodge bombs, and don\u2019t drop good items.',

  // Typing practice — UI strings
  'typing.placeholder': 'Start typing here…',
  'typing.initial': 'Start typing to begin.',
  'typing.progress': 'Typing… {typed}/{total}',
  'typing.done_status': 'Done in {elapsed}s · {wpm} WPM · {accuracy}% accuracy',
  'typing.done_title': '{wpm} WPM',
  'typing.done_subtitle': '{accuracy}% accuracy in {elapsed}s',
  'typing.new_sentence': 'New sentence',
  'typing.errors': 'Errors',
  'typing.length': 'Length',

  // Word search — UI strings
  'wordSearch.theme': 'Theme {n}',
  'wordSearch.progress': 'Found: {found} / {total}',
  'wordSearch.done_status': 'All words found!',
  'wordSearch.done_title': 'Solved!',
  'wordSearch.done_subtitle': 'You found every word.',
  'wordSearch.new_puzzle': 'New puzzle',
};

const it: Dict = {
  'app.brand': 'GameHub',
  'app.tagline': 'Gioca insieme · Impara insieme',
  'app.footer':
    'Fatto con cura per giovani giocatori curiosi.',

  'home.badge': '{count}+ giochi divertenti in un solo posto',
  'home.title.pick': 'Scegli un gioco e',
  'home.title.play': 'giochiamo!',
  'home.subtitle':
    'Giochi da tavolo classici, giochi di carte, puzzle e arcade — tutto in un\u2019unica casa colorata per bambini.',

  'mode.two_players': '2 Giocatori',
  'mode.vs_bot': 'Gioca contro il Bot',
  'mode.vs_bot_badge': 'vs Bot',

  'home.search.placeholder': 'Cerca un gioco…',
  'home.filter.all': 'Tutti',
  'home.empty': 'Nessun gioco corrisponde alla ricerca.',

  'card.solo': '1 giocatore · da solo',
  'card.two_players_device': '2 giocatori · stesso dispositivo',
  'card.bot_unavailable': 'Modalità Bot non disponibile',
  'card.play': 'Gioca',
  'home.footer_tip':
    'Puoi passare tra 2 Giocatori e Gioca contro il Bot in qualsiasi momento.',

  'shell.home': 'Home',
  'shell.restart': 'Ricomincia',
  'shell.back_aria': 'Torna alla home',
  'shell.restart_aria': 'Ricomincia la partita',
  'shell.how_to_play': 'Come si gioca',

  'lang.label': 'Lingua',

  'theme.label': 'Tema',
  'theme.light': 'Chiaro',
  'theme.dark': 'Scuro',
  'theme.system': 'Sistema',

  'difficulty.Easy': 'Facile',
  'difficulty.Medium': 'Medio',
  'difficulty.Hard': 'Difficile',

  'category.board.label': 'Giochi da tavolo',
  'category.board.desc': 'Pensa, pianifica, vinci.',
  'category.card.label': 'Giochi di carte',
  'category.card.desc': 'Abbina, raccogli, scambia.',
  'category.dice.label': 'Giochi di dadi',
  'category.dice.desc': 'Tenta la fortuna.',
  'category.puzzle.label': 'Puzzle',
  'category.puzzle.desc': 'Sfide in solitaria.',
  'category.arcade.label': 'Arcade & riflessi',
  'category.arcade.desc': 'Reazioni rapide.',
  'category.educational.label': 'Impara giocando',
  'category.educational.desc': 'Imparare senza accorgersene.',
  'category.art.label': 'Arte & creatività',
  'category.art.desc': 'Crea qualcosa di bello.',
  'category.math.label': 'Giochi di matematica',
  'category.math.desc': 'Contare, calcolare, scoprire schemi.',
  'category.music.label': 'Musica',
  'category.music.desc': 'Suona, pizzica, crea un ritmo.',

  // Music activities
  'game.piano.name': 'Pianoforte',
  'game.piano.tagline': 'Suona le note con mouse, tocco o tastiera.',
  'game.piano.instructions': 'Clicca o tocca i tasti per suonare. Sul computer, usa la fila della tastiera (a, s, d…) per i tasti bianchi. Mostra o nascondi le etichette delle note con il bottone in alto.',
  'game.drum-pad.name': 'Batteria',
  'game.drum-pad.tagline': 'Nove pad, un solo groove.',
  'game.drum-pad.instructions': 'Tocca i pad per far partire cassa, rullante, charleston, clap e altro. Sul computer, premi i tasti 1\u20139 per suonare. Concatena i colpi per creare un beat.',
  'game.xylophone.name': 'Xilofono',
  'game.xylophone.tagline': 'Suona una melodia sulle barre colorate.',
  'game.xylophone.instructions': 'Tocca una barra per suonarne la nota. Le barre sono accordate sulla scala di Do maggiore (Do Re Mi Fa Sol La Si Do). Puoi anche premere i tasti 1\u20138 sulla tastiera.',
  'game.metronome.name': 'Metronomo',
  'game.metronome.tagline': 'BPM e tempo regolabili.',
  'game.metronome.instructions': 'Trascina il cursore per impostare il tempo (40\u2013220 BPM) o tocca un preset. Scegli 2/4, 3/4, 4/4 o 6/4 e premi Start. Il primo battito di ogni battuta è evidenziato con un colore e un tono diversi.',
  'game.note-quiz.name': 'Quiz delle Note',
  'game.note-quiz.tagline': 'Leggi la chiave di violino: scegli la nota giusta.',
  'game.note-quiz.instructions': 'Sul pentagramma appare una nota e viene suonata. Scegli il nome della nota tra le quattro opzioni. Usa il tasto di riproduzione per risentirla.',

  // Literacy / puzzle extras
  'game.word-scramble.name': 'Parole Mescolate',
  'game.word-scramble.tagline': 'Clicca le lettere in ordine per ricomporre la parola.',
  'game.word-scramble.instructions': 'La parola è stata mescolata in tessere di lettere. Clicca le tessere una per una per comporre la parola giusta. Le parole seguono la lingua selezionata. Usa \u201cBackspace\u201d per annullare l\u2019ultima lettera.',
  'game.alphabet-order.name': 'Ordine Alfabetico',
  'game.alphabet-order.tagline': 'Tocca le lettere in ordine alfabetico il più velocemente possibile.',
  'game.alphabet-order.instructions': 'Clicca le lettere in ordine alfabetico, partendo dalla A. La lettera successiva è evidenziata. Scegli A\u2013E, A\u2013J oppure tutto A\u2013Z.',
  'game.hidden-picture.name': 'Immagine Nascosta',
  'game.hidden-picture.tagline': 'Trova tutti gli oggetti nascosti il più in fretta possibile.',
  'game.hidden-picture.instructions': 'Ogni scena nasconde alcuni oggetti. Guarda la lista e clicca ogni oggetto quando lo trovi nell\u2019immagine. Cambia scena con i bottoni in alto.',
  'game.maze.name': 'Labirinto',
  'game.maze.tagline': 'Raggiungi la bandierina attraverso un labirinto generato.',
  'game.maze.instructions': 'Usa le frecce direzionali, WASD o i bottoni a schermo per muovere il pallino. Raggiungi la bandierina in basso a destra. Ogni partita genera un labirinto nuovo.',
  'game.ball-sort.name': 'Ordina le Palline',
  'game.ball-sort.tagline': 'Ordina ogni provetta con un unico colore.',
  'game.ball-sort.instructions': 'Tocca una provetta per prelevare la pallina in cima, poi tocca una provetta di destinazione. Puoi appoggiare una pallina solo su una provetta vuota o su una pallina dello stesso colore. Vinci quando tutte le provette sono vuote o piene di un solo colore.',
  'game.color-link.name': 'Collega i Colori',
  'game.color-link.tagline': 'Traccia percorsi che non si incrociano tra le coppie.',
  'game.color-link.instructions': 'Trascina da un punto colorato al suo corrispondente. I percorsi non possono incrociarsi. Quando hai risolto tutto, ogni cella della griglia deve essere coperta.',
  'game.block-puzzle.name': 'Puzzle a Blocchi',
  'game.block-puzzle.tagline': 'Piazza pezzi su una griglia 10×10 e cancella le righe.',
  'game.block-puzzle.instructions': 'Scegli un pezzo dal vassoio, poi tocca una cella della griglia per piazzarlo. Completare una riga o colonna la cancella e ti dà punti bonus. La partita finisce quando nessuno dei tre pezzi entra più.',
  'game.peg-solitaire.name': 'Solitario di Pioli',
  'game.peg-solitaire.tagline': 'Salta un piolo sopra un altro per rimuoverlo.',
  'game.peg-solitaire.instructions': 'Seleziona un piolo, poi clicca un puntino verde per saltare sopra un piolo adiacente ed eliminarlo. L\u2019obiettivo è restare con un solo piolo al centro.',
  'game.darts.name': 'Freccette',
  'game.darts.tagline': 'Clicca per lanciare: mira al centro!',
  'game.darts.instructions': 'Clicca sul bersaglio rotante per lanciare una freccetta. Il centro vale 50 punti; gli anelli esterni valgono meno. Hai 10 freccette per partita.',
  'game.match-3.name': 'Match 3',
  'game.match-3.tagline': 'Scambia le gemme per allinearne tre o più \u2014 fai combo!',
  'game.match-3.instructions': 'Tocca una gemma, poi una adiacente per scambiarle. Se allinei 3 o più gemme uguali, si eliminano e quelle sopra scendono. Le catene danno punti bonus. Hai 20 mosse.',
  'game.mahjong.name': 'Mahjong Solitario',
  'game.mahjong.tagline': 'Trova coppie di tessere libere e rimuovile.',
  'game.mahjong.instructions': 'Clicca due tessere con la stessa immagine per rimuoverle. Una tessera è selezionabile solo se non è coperta da altre sopra e almeno uno dei suoi lati (sinistro o destro) è libero. Svuota tutto il tabellone per vincere.',
  'game.math-runner.name': 'Corsa Matematica',
  'game.math-runner.tagline': 'Entra nella risposta giusta prima del muro!',
  'game.math-runner.instructions': 'Premi Start per iniziare. Arrivano muri con operazioni e tre cancelli di risposta. Usa le frecce Sinistra/Destra o A/D per cambiare corsia e attraversare la risposta corretta. 10 corrette per vincere; 5 sbagliate e finisce.',


  // Math activities
  'game.balloon-pop.name': 'Scoppia Palloncini',
  'game.balloon-pop.tagline': 'Risolvi l\u2019operazione, scoppia il palloncino giusto.',
  'game.balloon-pop.instructions': 'Leggi l\u2019operazione in alto. I palloncini salgono con dei numeri — clicca quello il cui numero è la risposta. Gli errori tolgono punti. Raggiungi l\u2019obiettivo prima che scada il tempo.',
  'game.make-ten.name': 'Fai Dieci',
  'game.make-ten.tagline': 'Accoppia le carte la cui somma dà il bersaglio.',
  'game.make-ten.instructions': 'Clicca due carte che sommano al bersaglio (10, 20 o 100). Le coppie corrette restano scoperte. Completa il mazzo in meno mosse possibili.',
  'game.telling-time.name': 'Leggi l\u2019Orologio',
  'game.telling-time.tagline': 'Scegli l\u2019ora mostrata dall\u2019orologio.',
  'game.telling-time.instructions': 'Guarda l\u2019orologio e scegli l\u2019ora giusta tra le quattro opzioni. Scegli la difficoltà per esercitarti con ore esatte, mezz\u2019ore, quarti d\u2019ora o minuti da cinque.',
  'game.number-pattern.name': 'Schema Numerico',
  'game.number-pattern.tagline': 'Scopri la regola e riempi lo spazio.',
  'game.number-pattern.instructions': 'Osserva la sequenza e la regola mostrata sopra. Un numero manca — scegli il valore che continua lo schema.',
  'game.subitize.name': 'Conta Veloce',
  'game.subitize.tagline': 'Conta i punti prima che spariscano.',
  'game.subitize.instructions': 'I puntini lampeggiano per un attimo sullo schermo. Quando spariscono, scegli quanti ne hai visti. I livelli più difficili mostrano più puntini e lampeggiano più in fretta.',

  'game.doodle.name': 'Blocco da Disegno',
  'game.doodle.tagline': 'Disegno libero con colori e pennelli.',
  'game.doodle.instructions': 'Clicca e trascina per disegnare. Scegli colore e dimensione del pennello, o usa la gomma. Annulla torna indietro di un tratto; Cancella pulisce tutto.',
  'game.pixel.name': 'Pixel Art',
  'game.pixel.tagline': 'Dipingi una griglia 16×16 un pixel alla volta.',
  'game.pixel.instructions': 'Scegli un colore e clicca le celle per colorare. Tieni premuto e trascina per riempire velocemente. Usa la gomma per cancellare.',
  'game.spin.name': 'Caleidoscopio',
  'game.spin.tagline': 'Disegna motivi caleidoscopici con simmetria radiale.',
  'game.spin.instructions': 'Trascina sul cerchio per disegnare. Ogni tratto viene ruotato e specchiato per creare motivi simmetrici. Cambia il numero di simmetrie o attiva/disattiva lo specchio per effetti diversi.',
  'game.sticker.name': 'Adesivi',
  'game.sticker.tagline': 'Attacca adesivi colorati su una tela bianca.',
  'game.sticker.instructions': 'Scegli un adesivo e una taglia, poi clicca ovunque per attaccarlo. Clicca un adesivo esistente per rimuoverlo.',

  'game.tris.name': 'Tris',
  'game.tris.tagline': 'Veloce, classico, per tutte le età.',
  'game.tris.instructions': 'Allinea tre simboli per vincere.',

  'game.connect-four.name': 'Forza Quattro',
  'game.connect-four.tagline':
    'Lascia cadere, fai quattro, vinci. Classico per tutte le età.',
  'game.connect-four.instructions':
    'Clicca una colonna per far cadere il disco. Chi allinea quattro vince.',

  'game.dama.name': 'Dama',
  'game.dama.tagline': 'Salta, cattura e incorona le tue dame.',
  'game.dama.instructions':
    'Le catture sono obbligatorie. Raggiungi il lato opposto per essere incoronato dama.',

  'game.reversi.name': 'Othello',
  'game.reversi.tagline': 'Imprigiona i dischi avversari e ribalta la tavola.',
  'game.reversi.instructions':
    'Posiziona un disco in modo che almeno una fila di dischi avversari sia racchiusa; quelli diventeranno del tuo colore.',

  'game.gomoku.name': 'Gomoku',
  'game.gomoku.tagline': 'Come il tris, ma servono cinque in fila.',
  'game.gomoku.instructions':
    'Piazza le pietre a turno. Vince chi allinea cinque pietre.',

  'game.dots-boxes.name': 'Punti & Quadrati',
  'game.dots-boxes.tagline':
    'Disegna l\u2019ultimo lato del quadrato per conquistarlo.',
  'game.dots-boxes.instructions':
    'A turno disegna una linea. Completa il quarto lato di un quadrato per conquistarlo e giocare ancora.',

  'game.mancala.name': 'Mancala',
  'game.mancala.tagline':
    'Semina le pietre nei pozzetti. Finisci nel tuo magazzino per un turno bonus.',
  'game.mancala.instructions':
    'Prendi le pietre da uno dei tuoi pozzetti e seminale in senso antiorario. L\u2019ultima pietra nel tuo magazzino dà un turno extra.',

  'game.backgammon.name': 'Backgammon',
  'game.backgammon.tagline':
    'Corri con le pedine verso casa con un po\u2019 di fortuna ai dadi.',
  'game.backgammon.instructions':
    'Muovi le pedine e portale fuori per vincere. Colpire un avversario lo manda sulla barra.',

  'game.battleship.name': 'Battaglia Navale',
  'game.battleship.tagline':
    'Indovina le celle della griglia nascosta e affonda la flotta.',
  'game.battleship.instructions':
    "Clicca sulle celle dell'avversario per sparare. Affonda tutte le navi per vincere.",

  'game.ludo.name': 'Non t\u2019arrabbiare',
  'game.ludo.tagline': 'Tira il dado e porta le quattro pedine a casa.',
  'game.ludo.instructions':
    'Tira un 6 per uscire dalla base. Muovi le pedine e falle arrivare tutte a casa. Un 6 dà diritto a un altro tiro.',

  'game.chess.name': 'Scacchi',
  'game.chess.tagline': 'Il gioco di strategia per eccellenza. Pianifica le tue mosse!',
  'game.chess.instructions':
    'Clicca un pezzo per selezionarlo, poi clicca una casella valida per spostarlo.',

  'game.snakes-and-ladders.name': 'Scale e Serpenti',
  'game.snakes-and-ladders.tagline':
    'Tira i dadi, sali sulle scale, schiva i serpenti!',
  'game.snakes-and-ladders.instructions':
    'Tira i dadi e corri fino a 100. Le scale ti fanno salire, i serpenti ti trascinano giù.',

  'game.uno.name': 'UNO',
  'game.uno.tagline':
    'Abbina colori e numeri — non dimenticare di gridare UNO!',
  'game.uno.instructions':
    'Gioca una carta che corrisponda al colore o al numero. Svuota la mano per primo per vincere.',

  'game.go-fish.name': 'Pesca-Pesca',
  'game.go-fish.tagline': 'Chiedi carte del rango che hai. Raccogli quattro dello stesso tipo.',
  'game.go-fish.instructions':
    'Chiedi al bot una carta che hai. Se ce l\u2019ha, la prendi. Altrimenti "pesca" dal mazzo.',

  'game.crazy-eights.name': 'Otto Matto',
  'game.crazy-eights.tagline': 'Abbina seme o rango. Gli otto sono jolly!',
  'game.crazy-eights.instructions':
    'Gioca una carta con stesso rango o seme della carta in cima. Gli otto sono jolly — scegli il seme. Svuota la mano per vincere.',

  'game.war.name': 'Guerra',
  'game.war.tagline': 'Solo fortuna: la carta più alta vince.',
  'game.war.instructions':
    'Entrambi i giocatori girano la carta in cima. La più alta vince entrambe. Il pareggio scatena una "guerra".',

  'game.solitaire.name': 'Solitario',
  'game.solitaire.tagline': 'Il classico Klondike. Gioca da solo.',
  'game.solitaire.instructions':
    'Clicca una carta per selezionarla, poi clicca la destinazione. Colori alternati in ordine decrescente sul tavolo. Le basi vanno da A a K per seme.',

  'game.pig.name': 'Maialino',
  'game.pig.tagline': 'Tenta la fortuna. Il primo a 100 vince.',
  'game.pig.instructions':
    'Tira per aggiungere al totale del turno. "Banca" per fissarlo. Tiri un 1 e perdi il turno. Primo a 100 vince!',

  'game.yahtzee.name': 'Yahtzee',
  'game.yahtzee.tagline': 'Tira per ottenere le migliori combinazioni.',
  'game.yahtzee.instructions':
    'Puoi tirare fino a 3 volte a turno. Tieni i dadi premendoli. Scegli una categoria per segnare.',

  'game.snake.name': 'Snake',
  'game.snake.tagline': 'Mangia le mele, non colpire te stesso.',
  'game.snake.instructions':
    'Usa le frecce o WASD per guidare. Mangia il cibo rosso, non colpire te stesso o i muri.',

  'game.tetris.name': 'Tetris',
  'game.tetris.tagline': 'Ruota, lascia cadere, cancella. Classico irresistibile.',
  'game.tetris.instructions':
    '← → per muovere · ↑ per ruotare · ↓ caduta lenta · spazio caduta rapida.',

  'game.flappy.name': 'Flappy Bird',
  'game.flappy.tagline': 'Tocca per volare. Schiva i tubi.',
  'game.flappy.instructions':
    'Tocca (o premi spazio) per sbattere le ali. Attraversa i varchi senza toccare tubi o pareti.',

  'game.simon.name': 'Simon',
  'game.simon.tagline': 'Guarda e ripeti i colori che lampeggiano.',
  'game.simon.instructions':
    'Guarda la sequenza, poi ripetila toccando i colori nello stesso ordine.',

  'game.whack.name': 'Acchiappa la Talpa',
  'game.whack.tagline': 'Tocca le talpe prima che scompaiano.',
  'game.whack.instructions':
    'Tocca le talpe prima che scompaiano. Segna più punti possibili in 30 secondi.',

  'game.memory.name': 'Memory',
  'game.memory.tagline': 'Gira le carte, ricorda le coppie.',
  'game.memory.instructions':
    'Gira due carte alla volta. Ricorda dove sono le immagini e abbina le coppie.',

  'game.2048.name': '2048',
  'game.2048.tagline': 'Fai scorrere i tasselli. I numeri uguali si uniscono.',
  'game.2048.instructions':
    'Fai scorrere i tasselli in 4 direzioni. I tasselli uguali si fondono. Primo a 2048 vince.',

  'game.minesweeper.name': 'Campo Minato',
  'game.minesweeper.tagline':
    'Usa i numeri per capire dove sono le mine.',
  'game.minesweeper.instructions':
    'Tocca per scoprire · tasto destro (o pressione lunga) per piantare una bandiera. I numeri indicano le mine vicine.',

  'game.fifteen.name': 'Gioco del 15',
  'game.fifteen.tagline': 'Riordina i tasselli da 1 a 15.',
  'game.fifteen.instructions':
    'Fai scorrere i tasselli nello spazio vuoto per metterli in ordine da 1 a 15.',

  'game.sudoku.name': 'Sudoku',
  'game.sudoku.tagline': 'Classico puzzle logico 9×9.',
  'game.sudoku.instructions':
    'Tocca una cella poi un numero, o usa la tastiera. 0 / backspace cancella.',

  'game.nonogram.name': 'Nonogramma',
  'game.nonogram.tagline': 'Usa i numeri per dipingere l\u2019immagine.',
  'game.nonogram.instructions':
    'Clicca per colorare una cella. Tasto destro (o pressione lunga) per marcare come vuota. I numeri indicano celle piene consecutive.',

  'game.hangman.name': 'Impiccato',
  'game.hangman.tagline': 'Salva l\u2019omino indovinando le lettere.',
  'game.hangman.instructions':
    'Indovina la parola una lettera alla volta. Sei errori e la partita finisce.',

  'game.word-search.name': 'Parole Nascoste',
  'game.word-search.tagline': 'Trova le parole nascoste nella griglia.',
  'game.word-search.instructions':
    'Clicca la prima e l\u2019ultima lettera di una parola. Le parole possono andare in qualsiasi direzione.',

  'game.math-quiz.name': 'Quiz di Matematica',
  'game.math-quiz.tagline':
    'Risolvi 10 domande prima che il tempo scada.',
  'game.math-quiz.instructions':
    'Rispondi a 10 domande di matematica prima che il tempo scada.',

  'game.flags-quiz.name': 'Quiz Bandiere',
  'game.flags-quiz.tagline': 'Riconosci il paese dalla sua bandiera.',
  'game.flags-quiz.instructions':
    'Guarda la bandiera e scegli il paese corretto.',

  'game.typing.name': 'Pratica di Dattilografia',
  'game.typing.tagline':
    'Digita le frasi per migliorare velocità e precisione.',
  'game.typing.instructions':
    'Digita la frase esattamente come mostrata. Parole al minuto e precisione si aggiornano mentre scrivi.',

  'game.bubble.name': 'Spara Bolle',
  'game.bubble.tagline': 'Mira e fai scoppiare gruppi di bolle dello stesso colore.',
  'game.bubble.instructions': 'Muovi il mouse per mirare, clicca per sparare. Unisci tre o più bolle dello stesso colore per farle scoppiare.',
  'game.morris.name': 'Tria / Mulino',
  'game.morris.tagline': 'Gioco del mulino — allinea tre pedine per catturare.',
  'game.morris.instructions': 'Posiziona nove pedine, poi muovile lungo le linee. Formando un "mulino" (tre in fila) puoi rimuovere una pedina avversaria. Con sole tre pedine rimaste puoi "volare" in qualunque punto.',
  'game.dominoes.name': 'Domino',
  'game.dominoes.tagline': 'Abbina i numeri e svuota la mano per primo.',
  'game.dominoes.instructions': 'Gioca una tessera i cui numeri corrispondono alle estremità della catena. Pesca dal mazzetto quando non puoi giocare. Vince chi svuota la mano per primo.',

  'game.pong.name': 'Pong',
  'game.pong.tagline': 'Duello di racchette classico. Fai passare la pallina oltre l\u2019avversario.',
  'game.pong.instructions': 'Muovi con ↑ ↓ (o W/S). In 2 giocatori la racchetta destra usa I/K. Primo a 5 vince.',
  'game.breakout.name': 'Arkanoid',
  'game.breakout.tagline': 'Distruggi tutti i mattoni con la pallina.',
  'game.breakout.instructions': 'Muovi con ← → o il mouse. Spazio o tocca per lanciare la pallina. Tre vite — rompi tutti i mattoni per vincere.',
  'game.dino.name': 'Corsa del Dino',
  'game.dino.tagline': 'Corsa senza fine — salta i cactus.',
  'game.dino.instructions': 'Tocca, clicca o premi spazio per saltare. La velocità aumenta più sopravvivi.',
  'game.reaction.name': 'Tempo di Reazione',
  'game.reaction.tagline': 'Misura i tuoi riflessi in millisecondi.',
  'game.reaction.instructions': 'Aspetta che il pulsante diventi verde, poi tocca il più in fretta possibile. Se tocchi troppo presto si ricomincia.',
  'game.catch.name': 'Acchiappa la Frutta',
  'game.catch.tagline': 'Prendi la frutta — schiva le bombe!',
  'game.catch.instructions': 'Muovi il cesto con ← → o trascinando. Prendi la frutta per segnare, schiva le bombe e non far cadere la frutta.',

  'typing.placeholder': 'Inizia a scrivere qui…',
  'typing.initial': 'Inizia a scrivere per cominciare.',
  'typing.progress': 'Sto scrivendo… {typed}/{total}',
  'typing.done_status': 'Fatto in {elapsed}s · {wpm} PPM · {accuracy}% precisione',
  'typing.done_title': '{wpm} PPM',
  'typing.done_subtitle': '{accuracy}% di precisione in {elapsed}s',
  'typing.new_sentence': 'Nuova frase',
  'typing.errors': 'Errori',
  'typing.length': 'Lunghezza',

  'wordSearch.theme': 'Tema {n}',
  'wordSearch.progress': 'Trovate: {found} / {total}',
  'wordSearch.done_status': 'Tutte le parole trovate!',
  'wordSearch.done_title': 'Risolto!',
  'wordSearch.done_subtitle': 'Hai trovato tutte le parole.',
  'wordSearch.new_puzzle': 'Nuovo puzzle',
};

const de: Dict = {
  'app.brand': 'GameHub',
  'app.tagline': 'Zusammen spielen · Zusammen lernen',
  'app.footer':
    'Mit Liebe gemacht für neugierige junge Spieler.',

  'home.badge': '{count}+ Spiele an einem Ort',
  'home.title.pick': 'Wähle ein Spiel und',
  'home.title.play': 'los geht\u2019s!',
  'home.subtitle':
    'Klassische Brettspiele, Kartenspiele, Rätsel und Arcade-Spaß — alles in einem bunten Zuhause für Kinder.',

  'mode.two_players': '2 Spieler',
  'mode.vs_bot': 'Gegen den Bot',
  'mode.vs_bot_badge': 'vs Bot',

  'home.search.placeholder': 'Spiele suchen…',
  'home.filter.all': 'Alle',
  'home.empty': 'Keine Spiele entsprechen der Suche.',

  'card.solo': '1 Spieler · Solo',
  'card.two_players_device': '2 Spieler · ein Gerät',
  'card.bot_unavailable': 'Bot-Modus nicht verfügbar',
  'card.play': 'Spielen',
  'home.footer_tip':
    'Jederzeit zwischen 2 Spieler und Gegen den Bot wechseln.',

  'shell.home': 'Start',
  'shell.restart': 'Neu starten',
  'shell.back_aria': 'Zurück zur Startseite',
  'shell.restart_aria': 'Spiel neu starten',
  'shell.how_to_play': 'Spielanleitung',

  'lang.label': 'Sprache',

  'theme.label': 'Design',
  'theme.light': 'Hell',
  'theme.dark': 'Dunkel',
  'theme.system': 'System',

  'difficulty.Easy': 'Leicht',
  'difficulty.Medium': 'Mittel',
  'difficulty.Hard': 'Schwer',

  'category.board.label': 'Brett & Strategie',
  'category.board.desc': 'Denken, planen, gewinnen.',
  'category.card.label': 'Kartenspiele',
  'category.card.desc': 'Sammeln, tauschen, gewinnen.',
  'category.dice.label': 'Würfelspiele',
  'category.dice.desc': 'Sag\u2019 dem Glück Hallo.',
  'category.puzzle.label': 'Rätsel',
  'category.puzzle.desc': 'Solo-Herausforderungen.',
  'category.arcade.label': 'Arcade & Reflex',
  'category.arcade.desc': 'Schnelle Reaktionen.',
  'category.educational.label': 'Lernen & Spielen',
  'category.educational.desc': 'Heimliches Lernen.',
  'category.art.label': 'Kunst & Kreativität',
  'category.art.desc': 'Mach etwas Schönes.',
  'category.math.label': 'Mathespiele',
  'category.math.desc': 'Zählen, Rechnen und Muster.',
  'category.music.label': 'Musik',
  'category.music.desc': 'Spielen, zupfen, den Beat machen.',

  // Music activities
  'game.piano.name': 'Klavier',
  'game.piano.tagline': 'Spiele Noten mit Maus, Touch oder Tastatur.',
  'game.piano.instructions': 'Klicke oder tippe die Tasten. Am PC nutzt du die Buchstabenreihe (a, s, d …) für die weißen Tasten. Mit dem Knopf oben blendest du die Notennamen ein oder aus.',
  'game.drum-pad.name': 'Drum Pad',
  'game.drum-pad.tagline': 'Neun Pads, ein Groove.',
  'game.drum-pad.instructions': 'Tippe die Pads für Kick, Snare, Hi-Hat, Clap und mehr. Am PC drückst du die Tasten 1\u20139. Kombiniere Taps zu einem Beat.',
  'game.xylophone.name': 'Xylofon',
  'game.xylophone.tagline': 'Spiele eine Melodie auf den bunten Stäben.',
  'game.xylophone.instructions': 'Tippe einen Stab, um seine Note zu spielen. Die Stäbe sind auf die C-Dur-Tonleiter gestimmt (C D E F G A H C). Du kannst auch die Tasten 1\u20138 drücken.',
  'game.metronome.name': 'Metronom',
  'game.metronome.tagline': 'BPM und Taktart einstellbar.',
  'game.metronome.instructions': 'Ziehe den Regler, um das Tempo einzustellen (40\u2013220 BPM), oder tippe einen Voreinstellungswert. Wähle 2/4, 3/4, 4/4 oder 6/4 und drücke Start. Der erste Schlag jedes Taktes wird mit anderer Farbe und Tonhöhe hervorgehoben.',
  'game.note-quiz.name': 'Noten-Quiz',
  'game.note-quiz.tagline': 'Lies den Violinschlüssel \u2014 wähle die richtige Note.',
  'game.note-quiz.instructions': 'Eine Note erscheint auf den Notenlinien und erklingt. Wähle den Buchstaben aus den vier Antworten. Mit dem Wiedergabe-Knopf hörst du sie noch einmal.',

  // Literacy / puzzle extras
  'game.word-scramble.name': 'Wort Verwirbelt',
  'game.word-scramble.tagline': 'Klicke die Buchstaben in der richtigen Reihenfolge.',
  'game.word-scramble.instructions': 'Das Wort wurde in Buchstaben-Kacheln zerlegt. Klicke die Kacheln der Reihe nach, um das Wort richtig zu schreiben. Die Wörter richten sich nach der gewählten Sprache. \u201eBackspace\u201c nimmt den letzten Buchstaben zurück.',
  'game.alphabet-order.name': 'ABC-Reihenfolge',
  'game.alphabet-order.tagline': 'Tippe die Buchstaben so schnell wie möglich in Reihenfolge.',
  'game.alphabet-order.instructions': 'Klicke die Buchstaben in alphabetischer Reihenfolge ab A. Der nächste Buchstabe ist hervorgehoben. Wähle A\u2013E, A\u2013J oder das ganze A\u2013Z.',
  'game.hidden-picture.name': 'Wimmelbild',
  'game.hidden-picture.tagline': 'Finde alle versteckten Objekte so schnell wie möglich.',
  'game.hidden-picture.instructions': 'Jede Szene versteckt einige Objekte. Sieh dir die Liste an und klicke jedes Objekt an, wenn du es im Bild findest. Mit den Knöpfen oben wechselst du die Szene.',
  'game.maze.name': 'Labyrinth',
  'game.maze.tagline': 'Finde den Weg durch ein generiertes Labyrinth zur Fahne.',
  'game.maze.instructions': 'Bewege die Figur mit den Pfeiltasten, WASD oder den Knöpfen auf dem Bildschirm. Erreiche die Fahne unten rechts. Jedes Mal wird ein neues Labyrinth erzeugt.',
  'game.ball-sort.name': 'Ball Sortieren',
  'game.ball-sort.tagline': 'Ordne jede Röhre so, dass sie nur eine Farbe enthält.',
  'game.ball-sort.instructions': 'Tippe eine Röhre, um den obersten Ball aufzunehmen, dann tippe eine Zielröhre. Bälle dürfen nur auf leere Röhren oder auf Bälle derselben Farbe abgelegt werden. Wenn alle Röhren leer oder einfarbig voll sind, hast du gewonnen.',
  'game.color-link.name': 'Farben Verbinden',
  'game.color-link.tagline': 'Zeichne Pfade zwischen Paaren, ohne sie zu kreuzen.',
  'game.color-link.instructions': 'Ziehe von einem farbigen Punkt zu seinem Gegenstück. Pfade dürfen sich nicht kreuzen. Am Ende muss jede Zelle des Feldes bedeckt sein.',
  'game.block-puzzle.name': 'Block-Puzzle',
  'game.block-puzzle.tagline': 'Setze Teile auf ein 10×10-Feld und lösche Linien.',
  'game.block-puzzle.instructions': 'Wähle ein Teil aus der Leiste und tippe eine Feld-Zelle, um es zu platzieren. Volle Reihen oder Spalten werden gelöscht und geben Bonuspunkte. Das Spiel endet, wenn keines der drei Teile mehr passt.',
  'game.peg-solitaire.name': 'Solitär',
  'game.peg-solitaire.tagline': 'Springe Steine über Steine, um sie zu entfernen.',
  'game.peg-solitaire.instructions': 'Wähle einen Stein und klicke einen grünen Punkt, um über einen benachbarten Stein zu springen und ihn zu entfernen. Ziel ist, mit einem einzigen Stein in der Mitte zu enden.',
  'game.darts.name': 'Darts',
  'game.darts.tagline': 'Klicke zum Werfen \u2014 ziele auf die Mitte!',
  'game.darts.instructions': 'Klicke auf die rotierende Scheibe, um einen Dart zu werfen. Das Bullseye gibt 50 Punkte; äußere Ringe weniger. Pro Runde hast du 10 Darts.',
  'game.match-3.name': 'Match 3',
  'game.match-3.tagline': 'Tausche Edelsteine, um drei in einer Reihe zu bilden!',
  'game.match-3.instructions': 'Tippe einen Edelstein und dann einen benachbarten, um sie zu tauschen. Entsteht eine Reihe von 3 oder mehr gleichen Steinen, werden sie entfernt und neue fallen nach. Ketten geben Bonuspunkte. Du hast 20 Züge.',
  'game.mahjong.name': 'Mahjong Solitär',
  'game.mahjong.tagline': 'Finde Paare offener Steine und entferne sie.',
  'game.mahjong.instructions': 'Klicke zwei Steine mit demselben Bild, um sie zu entfernen. Ein Stein ist nur wählbar, wenn er nicht von einem Stein darüber bedeckt ist und mindestens eine Seite (links oder rechts) frei ist. Leere das Brett, um zu gewinnen.',
  'game.math-runner.name': 'Mathe Runner',
  'game.math-runner.tagline': 'Lenke in das richtige Antwort-Tor vor der Wand!',
  'game.math-runner.instructions': 'Drücke Start zum Laufen. Mauern mit Rechenaufgaben kommen auf dich zu, jede mit drei Antwort-Toren. Mit Pfeil-links/rechts oder A/D wechselst du die Spur und läufst durch die richtige Antwort. 10 richtige zum Gewinnen; 5 falsche beenden den Lauf.',


  // Math activities
  'game.balloon-pop.name': 'Ballon Platzen',
  'game.balloon-pop.tagline': 'Rechne aus und triff den richtigen Ballon.',
  'game.balloon-pop.instructions': 'Lies die Aufgabe oben. Ballons steigen mit Zahlen auf — klicke den mit der richtigen Antwort. Falsche Klicks kosten Punkte. Erreiche das Ziel, bevor die Zeit abläuft.',
  'game.make-ten.name': 'Zehn Machen',
  'game.make-ten.tagline': 'Finde Paare, die zusammen das Ziel ergeben.',
  'game.make-ten.instructions': 'Klicke zwei Karten, die zusammen das Ziel (10, 20 oder 100) ergeben. Richtige Paare bleiben offen. Leere das Deck in möglichst wenigen Zügen.',
  'game.telling-time.name': 'Uhrzeit Lesen',
  'game.telling-time.tagline': 'Wähle die angezeigte Uhrzeit.',
  'game.telling-time.instructions': 'Lies das Zifferblatt und wähle die passende Uhrzeit aus den vier Antworten. Wähle eine Schwierigkeitsstufe, um ganze Stunden, halbe, viertel Stunden oder 5-Minuten-Schritte zu üben.',
  'game.number-pattern.name': 'Zahlenmuster',
  'game.number-pattern.tagline': 'Erkenne die Regel und füll die Lücke.',
  'game.number-pattern.instructions': 'Sieh dir die Folge und die Regel darüber an. Eine Zahl fehlt — wähle den Wert, der das Muster fortsetzt.',
  'game.subitize.name': 'Blitz-Zählen',
  'game.subitize.tagline': 'Zähle die Punkte, bevor sie verschwinden.',
  'game.subitize.instructions': 'Punkte blitzen kurz auf. Wenn sie verschwinden, wähle, wie viele du gesehen hast. Höhere Stufen zeigen mehr Punkte und blitzen schneller.',

  'game.doodle.name': 'Zeichenblock',
  'game.doodle.tagline': 'Freies Zeichnen mit Farben und Pinseln.',
  'game.doodle.instructions': 'Klicken und ziehen zum Zeichnen. Farbe und Pinselgröße wählen oder den Radiergummi benutzen. "Undo" macht einen Strich rückgängig; "Löschen" leert alles.',
  'game.pixel.name': 'Pixel Art',
  'game.pixel.tagline': 'Pixel für Pixel auf einem 16×16-Raster malen.',
  'game.pixel.instructions': 'Farbe wählen und Zellen anklicken. Gedrückt halten und ziehen zum schnellen Füllen. Mit dem Radiergummi entfernst du Pixel.',
  'game.spin.name': 'Kaleidoskop',
  'game.spin.tagline': 'Zeichne Kaleidoskop-Muster mit radialer Symmetrie.',
  'game.spin.instructions': 'Im Kreis ziehen zum Zeichnen. Jeder Strich wird gedreht und gespiegelt und erzeugt symmetrische Muster. Wähle die Symmetrie-Anzahl oder schalte Spiegeln ein/aus.',
  'game.sticker.name': 'Sticker',
  'game.sticker.tagline': 'Bunte Sticker auf eine leere Leinwand kleben.',
  'game.sticker.instructions': 'Sticker und Größe wählen, dann irgendwo klicken, um ihn zu setzen. Auf einen Sticker klicken, um ihn zu entfernen.',

  'game.tris.name': 'Tic-Tac-Toe',
  'game.tris.tagline': 'Schnell, klassisch, für jedes Alter.',
  'game.tris.instructions': 'Drei in einer Reihe gewinnt.',

  'game.connect-four.name': 'Vier gewinnt',
  'game.connect-four.tagline':
    'Einwerfen, vier gewinnen. Klassiker für jedes Alter.',
  'game.connect-four.instructions':
    'Klicke auf eine Spalte, um den Stein fallen zu lassen. Wer zuerst vier in einer Reihe hat, gewinnt.',

  'game.dama.name': 'Dame',
  'game.dama.tagline': 'Springe, schlage und kröne deine Damen.',
  'game.dama.instructions':
    'Schlagen ist Pflicht. Erreiche die gegenüberliegende Reihe, um zur Dame zu werden.',

  'game.reversi.name': 'Reversi',
  'game.reversi.tagline':
    'Schließe die gegnerischen Steine ein und dreh das Brett um.',
  'game.reversi.instructions':
    'Setze einen Stein so, dass mindestens eine Reihe gegnerischer Steine eingeschlossen ist; diese wechseln die Farbe.',

  'game.gomoku.name': 'Gomoku',
  'game.gomoku.tagline': 'Wie Tic-Tac-Toe, aber mit fünf in einer Reihe.',
  'game.gomoku.instructions':
    'Setzt abwechselnd Steine. Wer zuerst fünf in einer Reihe hat, gewinnt.',

  'game.dots-boxes.name': 'Käsekästchen',
  'game.dots-boxes.tagline':
    'Ziehe die letzte Seite eines Kästchens, um es zu beanspruchen.',
  'game.dots-boxes.instructions':
    'Abwechselnd eine Linie ziehen. Die 4. Seite eines Kästchens schließen: Kästchen geht an dich und du bist nochmal dran.',

  'game.mancala.name': 'Mancala',
  'game.mancala.tagline':
    'Säe Steine in die Mulden. Endet der Zug in deinem Speicher: Bonuszug.',
  'game.mancala.instructions':
    'Nimm Steine aus einer deiner Mulden und säe sie gegen den Uhrzeigersinn. Landet der letzte Stein im Speicher, bist du noch einmal dran.',

  'game.backgammon.name': 'Backgammon',
  'game.backgammon.tagline':
    'Bringe deine Steine nach Hause — mit etwas Würfelglück.',
  'game.backgammon.instructions':
    'Bewege die Steine und würfle sie hinaus, um zu gewinnen. Ein Treffer schickt den Gegner auf die Bar.',

  'game.battleship.name': 'Schiffe versenken',
  'game.battleship.tagline':
    'Rate Felder auf der versteckten Karte und versenke die Flotte.',
  'game.battleship.instructions':
    'Klicke auf Felder im gegnerischen Meer, um zu schießen. Versenke alle Schiffe, um zu gewinnen.',

  'game.ludo.name': 'Mensch ärgere dich nicht',
  'game.ludo.tagline':
    'Würfle und bringe deine vier Figuren nach Hause.',
  'game.ludo.instructions':
    'Eine 6 würfeln, um aus dem Startfeld zu ziehen. Alle vier Figuren ins Ziel bringen. Eine 6 gibt einen weiteren Wurf.',

  'game.chess.name': 'Schach',
  'game.chess.tagline':
    'Das ultimative Strategiespiel. Plane deine Züge!',
  'game.chess.instructions':
    'Klicke eine Figur an, dann ein gültiges Feld, um zu ziehen.',

  'game.snakes-and-ladders.name': 'Leiterspiel',
  'game.snakes-and-ladders.tagline':
    'Würfle, klettere Leitern hoch, weiche Schlangen aus!',
  'game.snakes-and-ladders.instructions':
    'Würfle und laufe bis 100. Leitern heben dich hoch, Schlangen ziehen dich runter.',

  'game.uno.name': 'UNO',
  'game.uno.tagline':
    'Farben und Zahlen anlegen — vergiss nicht, UNO zu rufen!',
  'game.uno.instructions':
    'Lege eine Karte, die zu Farbe oder Zahl der obersten Karte passt. Leere deine Hand zuerst, um zu gewinnen.',

  'game.go-fish.name': 'Quartett',
  'game.go-fish.tagline':
    'Frage nach Werten, die du hast. Sammle vier gleiche.',
  'game.go-fish.instructions':
    'Frage den Bot nach einem Wert, den du hast. Hat er welche, bekommst du alle. Sonst "go fish" vom Stapel.',

  'game.crazy-eights.name': 'Mau Mau',
  'game.crazy-eights.tagline':
    'Farbe oder Wert passen. Achten sind Wildcards!',
  'game.crazy-eights.instructions':
    'Lege eine Karte, deren Wert oder Farbe zur obersten passt. Achten sind wild — wähle eine Farbe. Wer zuerst keine Karten mehr hat, gewinnt.',

  'game.war.name': 'Krieg',
  'game.war.tagline': 'Reines Glück: höhere Karte gewinnt.',
  'game.war.instructions':
    'Beide Spieler decken die oberste Karte auf. Die höhere gewinnt beide. Gleichstand löst einen "Krieg" aus.',

  'game.solitaire.name': 'Solitär',
  'game.solitaire.tagline': 'Der Klondike-Klassiker. Für Alleinspieler.',
  'game.solitaire.instructions':
    'Klicke eine Karte zur Auswahl, dann ein Ziel. Abwechselnde Farben absteigend auf den Stapeln. Grundstapel von Ass bis König nach Farbe.',

  'game.pig.name': 'Pig',
  'game.pig.tagline':
    'Wage es. Wer zuerst 100 erreicht, gewinnt.',
  'game.pig.instructions':
    'Würfle, um Punkte zu sammeln. "Bank" sichert sie. Eine 1 und dein Zug endet. Erster auf 100 gewinnt!',

  'game.yahtzee.name': 'Yahtzee',
  'game.yahtzee.tagline':
    'Würfle nach den besten Kombinationen.',
  'game.yahtzee.instructions':
    'Bis zu 3 Würfe pro Runde. Würfel durch Antippen behalten. Wähle eine Kategorie zum Werten.',

  'game.snake.name': 'Snake',
  'game.snake.tagline': 'Iss die Äpfel, triff dich selbst nicht.',
  'game.snake.instructions':
    'Steuere mit Pfeiltasten oder WASD. Iss rotes Futter, meide dich selbst und die Wände.',

  'game.tetris.name': 'Tetris',
  'game.tetris.tagline':
    'Drehen, fallen lassen, Reihen löschen.',
  'game.tetris.instructions':
    '← → bewegen · ↑ drehen · ↓ weicher Fall · Leertaste harter Fall.',

  'game.flappy.name': 'Flappy Bird',
  'game.flappy.tagline':
    'Tippen zum Flattern. Weiche den Röhren aus.',
  'game.flappy.instructions':
    'Tippe (oder Leertaste) zum Flattern. Fliege durch die Lücken, ohne Röhren oder Wände zu berühren.',

  'game.simon.name': 'Simon',
  'game.simon.tagline': 'Schau zu und wiederhole die leuchtenden Farben.',
  'game.simon.instructions':
    'Merke dir das Muster und tippe die Farben dann in der richtigen Reihenfolge.',

  'game.whack.name': 'Maulwurfjagd',
  'game.whack.tagline':
    'Erwische die Maulwürfe, bevor sie verschwinden.',
  'game.whack.instructions':
    'Tippe die Maulwürfe ab, bevor sie verschwinden. Sammle möglichst viele Punkte in 30 Sekunden.',

  'game.memory.name': 'Memory',
  'game.memory.tagline': 'Karten umdrehen, Paare merken.',
  'game.memory.instructions':
    'Drehe zwei Karten um. Merke dir die Bilder und finde alle Paare.',

  'game.2048.name': '2048',
  'game.2048.tagline':
    'Kacheln schieben. Gleiche Zahlen verschmelzen.',
  'game.2048.instructions':
    'Schiebe Kacheln in vier Richtungen. Gleiche Kacheln verschmelzen. Wer 2048 erreicht, gewinnt.',

  'game.minesweeper.name': 'Minesweeper',
  'game.minesweeper.tagline':
    'Nutze die Zahlen, um die Minen zu finden.',
  'game.minesweeper.instructions':
    'Tippen zum Öffnen · Rechtsklick (oder langer Druck) zum Markieren. Zahlen zeigen benachbarte Minen.',

  'game.fifteen.name': '15er-Puzzle',
  'game.fifteen.tagline': 'Sortiere die Kacheln 1 bis 15.',
  'game.fifteen.instructions':
    'Schiebe Kacheln in das leere Feld, um sie von 1 bis 15 zu sortieren.',

  'game.sudoku.name': 'Sudoku',
  'game.sudoku.tagline':
    'Klassisches 9×9 Zahlenlogik-Rätsel.',
  'game.sudoku.instructions':
    'Zelle antippen und Zahl wählen, oder die Tastatur nutzen. 0 / Rücktaste löscht.',

  'game.nonogram.name': 'Nonogramm',
  'game.nonogram.tagline':
    'Nutze die Zahlenhinweise, um das Bild zu malen.',
  'game.nonogram.instructions':
    'Klicke zum Ausfüllen. Rechtsklick (oder langer Druck) markiert als leer. Zahlen zeigen zusammenhängende gefüllte Zellen.',

  'game.hangman.name': 'Galgenmännchen',
  'game.hangman.tagline':
    'Rette das Männchen mit richtigen Buchstaben.',
  'game.hangman.instructions':
    'Errate das Wort Buchstabe für Buchstabe. Sechs Fehler und das Spiel endet.',

  'game.word-search.name': 'Wortsuche',
  'game.word-search.tagline':
    'Finde die versteckten Wörter im Raster.',
  'game.word-search.instructions':
    'Klicke den ersten und letzten Buchstaben eines Worts. Wörter können in jede Richtung stehen.',

  'game.math-quiz.name': 'Mathe-Quiz',
  'game.math-quiz.tagline':
    'Löse 10 Aufgaben, bevor die Zeit abläuft.',
  'game.math-quiz.instructions':
    'Beantworte 10 schnelle Matheaufgaben, bevor die Zeit abläuft.',

  'game.flags-quiz.name': 'Flaggen-Quiz',
  'game.flags-quiz.tagline': 'Erkenne das Land an seiner Flagge.',
  'game.flags-quiz.instructions':
    'Schau dir die Flagge an und wähle das richtige Land.',

  'game.typing.name': 'Tipp-Training',
  'game.typing.tagline':
    'Tippe Sätze und baue Geschwindigkeit & Genauigkeit aus.',
  'game.typing.instructions':
    'Tippe den Satz genau wie gezeigt. WPM und Genauigkeit aktualisieren sich live.',

  'game.bubble.name': 'Bubble Shooter',
  'game.bubble.tagline': 'Zielen und Blasen gleicher Farbe zum Platzen bringen.',
  'game.bubble.instructions': 'Mit der Maus zielen, zum Schießen klicken. Drei oder mehr Blasen derselben Farbe verbinden, um sie platzen zu lassen.',
  'game.morris.name': 'Mühle',
  'game.morris.tagline': 'Alter Mühle-Klassiker — drei in einer Reihe schlägt.',
  'game.morris.instructions': 'Platziere neun Steine, dann ziehe entlang der Linien. Eine "Mühle" (drei in einer Reihe) erlaubt dir, einen gegnerischen Stein zu entfernen. Mit nur drei Steinen darfst du zu jedem freien Punkt "fliegen".',
  'game.dominoes.name': 'Domino',
  'game.dominoes.tagline': 'Verbinde gleiche Augen und leere deine Hand zuerst.',
  'game.dominoes.instructions': 'Lege einen Stein, dessen Ende zu einem Ende der Kette passt. Ziehe aus dem Stapel, wenn du nicht legen kannst. Wer zuerst die Hand leert, gewinnt.',

  'game.pong.name': 'Pong',
  'game.pong.tagline': 'Klassisches Schläger-Duell. Bring den Ball am Gegner vorbei.',
  'game.pong.instructions': 'Steuerung mit ↑ ↓ (oder W/S). Im 2-Spieler-Modus nutzt der rechte Schläger I/K. Erster auf 5 gewinnt.',
  'game.breakout.name': 'Breakout',
  'game.breakout.tagline': 'Zerstöre alle Steine mit dem Ball.',
  'game.breakout.instructions': 'Bewege mit ← → oder der Maus. Leertaste oder Tippen schießt den Ball ab. Drei Leben — zerstöre alle Steine, um zu gewinnen.',
  'game.dino.name': 'Dino-Lauf',
  'game.dino.tagline': 'Endloser Lauf — spring über die Kakteen.',
  'game.dino.instructions': 'Tippen, klicken oder Leertaste zum Springen. Das Spiel wird schneller, je länger du durchhältst.',
  'game.reaction.name': 'Reaktionszeit',
  'game.reaction.tagline': 'Miss deine Reflexe in Millisekunden.',
  'game.reaction.instructions': 'Warte bis der Knopf grün wird, dann so schnell wie möglich tippen. Zu früh und die Runde startet neu.',
  'game.catch.name': 'Fangen',
  'game.catch.tagline': 'Fang das Obst — weich den Bomben aus!',
  'game.catch.instructions': 'Bewege den Korb mit ← → oder per Ziehen. Fang Obst für Punkte, meide Bomben und lass kein Obst fallen.',

  'typing.placeholder': 'Hier beginnen zu tippen…',
  'typing.initial': 'Tippe los, um zu starten.',
  'typing.progress': 'Tippe… {typed}/{total}',
  'typing.done_status': 'Fertig in {elapsed}s · {wpm} WPM · {accuracy}% Genauigkeit',
  'typing.done_title': '{wpm} WPM',
  'typing.done_subtitle': '{accuracy}% Genauigkeit in {elapsed}s',
  'typing.new_sentence': 'Neuer Satz',
  'typing.errors': 'Fehler',
  'typing.length': 'Länge',

  'wordSearch.theme': 'Thema {n}',
  'wordSearch.progress': 'Gefunden: {found} / {total}',
  'wordSearch.done_status': 'Alle Wörter gefunden!',
  'wordSearch.done_title': 'Gelöst!',
  'wordSearch.done_subtitle': 'Du hast alle Wörter gefunden.',
  'wordSearch.new_puzzle': 'Neues Rätsel',
};

export const TRANSLATIONS: Record<Lang, Dict> = { en, it, de };
