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
};

export const TRANSLATIONS: Record<Lang, Dict> = { en, it, de };
