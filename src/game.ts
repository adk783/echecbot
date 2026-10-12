import { Chess, type Color, type Move, type Square } from 'chess.js';
import { Board, type BoardPiece } from './board';
import { BotCard } from './botCard';
import { DIFFICULTY_LEVELS, type DifficultyLevel, pickRandomItem, shouldPlayRandomMove } from './difficulty';
import { Engine } from './engine';
import { colorName, getGameStatus } from './gameStatus';
import { WinBar } from './winBar';
import { WinChanceTracker } from './winChanceTracker';

const AUTO_PROMOTION_PIECE = 'q';

export interface GameElements {
  board: HTMLElement;
  status: HTMLElement;
  botCard: HTMLElement;
  winChance: HTMLElement;
}

interface BotMove {
  from: string;
  to: string;
  promotion?: string;
}

/** Orchestrates one chess game between the user and the engine. */
export class Game {
  private chess = new Chess();
  private readonly board: Board;
  private readonly engine = new Engine();
  private readonly botCard: BotCard;
  private readonly winChance: WinChanceTracker;
  private readonly statusElement: HTMLElement;
  private playerColor: Color = 'w';
  private level: DifficultyLevel = DIFFICULTY_LEVELS[0];
  private selected: Square | null = null;
  private lastMove: Move | null = null;
  private isBotThinking = false;
  private errorMessage: string | null = null;
  /** Incremented on each new game so a late bot reply from a previous game is dropped. */
  private gameId = 0;

  constructor(elements: GameElements) {
    this.statusElement = elements.status;
    this.botCard = new BotCard(elements.botCard);
    this.winChance = new WinChanceTracker(new WinBar(elements.winChance));
    this.board = new Board(elements.board, (square) => this.handleSquareClick(square));
  }

  setLevel(level: DifficultyLevel): void {
    this.level = level;
    this.botCard.setLevelLabel(level.label);
  }

  newGame(playerColor: Color): void {
    this.gameId += 1;
    this.chess = new Chess();
    this.playerColor = playerColor;
    this.selected = null;
    this.lastMove = null;
    this.isBotThinking = false;
    this.errorMessage = null;
    this.botCard.clear();
    this.render();
    this.trackWinChance();
    void this.playBotMoveIfNeeded();
  }

  private isPlayerTurn(): boolean {
    return !this.chess.isGameOver() && this.chess.turn() === this.playerColor && !this.isBotThinking;
  }

  private handleSquareClick(square: Square): void {
    if (!this.isPlayerTurn()) {
      return;
    }
    if (this.selected !== null) {
      const legal = this.chess
        .moves({ square: this.selected, verbose: true })
        .find((move) => move.to === square);
      if (legal) {
        this.applyPlayerMove(legal.from, legal.to);
        return;
      }
    }
    const piece = this.chess.get(square);
    const isOwnPiece = piece !== undefined && piece.color === this.playerColor;
    this.selected = isOwnPiece && square !== this.selected ? square : null;
    this.render();
  }

  private applyPlayerMove(from: string, to: string): void {
    this.lastMove = this.chess.move({ from, to, promotion: AUTO_PROMOTION_PIECE });
    this.selected = null;
    this.errorMessage = null;
    this.render();
    this.trackWinChance();
    void this.playBotMoveIfNeeded();
  }

  private trackWinChance(): void {
    this.winChance.update({
      fen: this.chess.fen(),
      sideToMove: this.chess.turn(),
      status: getGameStatus(this.chess).kind,
      perspective: this.playerColor,
    });
  }

  private async playBotMoveIfNeeded(): Promise<void> {
    if (this.chess.isGameOver() || this.chess.turn() === this.playerColor) {
      return;
    }
    const currentGameId = this.gameId;
    this.isBotThinking = true;
    this.botCard.showThinking();
    this.render();
    try {
      const move = await this.chooseBotMove();
      if (currentGameId !== this.gameId) {
        return;
      }
      this.lastMove = this.chess.move(move);
      this.botCard.showMessage(`Played ${this.lastMove.san}`);
      this.trackWinChance();
    } catch (error) {
      if (currentGameId !== this.gameId) {
        return;
      }
      console.error('Bot move failed', error);
      this.errorMessage = 'The engine failed to produce a legal move. Start a new game.';
      this.botCard.clear();
    }
    this.isBotThinking = false;
    this.render();
  }

  private async chooseBotMove(): Promise<BotMove> {
    const config = this.level.config;
    const legalMoves = this.chess.moves({ verbose: true });
    if (shouldPlayRandomMove(config.randomMoveChance)) {
      const random = pickRandomItem(legalMoves);
      return { from: random.from, to: random.to, promotion: random.promotion };
    }
    const move = await this.engine.getBestMove(this.chess.fen(), config);
    const isLegal = legalMoves.some((legal) => legal.from === move.from && legal.to === move.to);
    if (!isLegal) {
      throw new Error(`Engine move is not legal here: ${move.from}${move.to}`);
    }
    return move;
  }

  private render(): void {
    const targets = this.selected
      ? this.chess.moves({ square: this.selected, verbose: true }).map((move) => move.to)
      : [];
    this.board.render({
      pieces: this.collectPieces(),
      orientation: this.playerColor,
      selected: this.selected,
      targets,
      lastMove: this.lastMove,
      checkedKing: this.findCheckedKing(),
      isInteractive: this.isPlayerTurn(),
    });
    this.statusElement.textContent = this.buildStatusText();
  }

  private collectPieces(): BoardPiece[] {
    return this.chess
      .board()
      .flat()
      .filter((cell): cell is NonNullable<typeof cell> => cell !== null);
  }

  private findCheckedKing(): Square | null {
    if (!this.chess.isCheck()) {
      return null;
    }
    const turn = this.chess.turn();
    const king = this.collectPieces().find((piece) => piece.type === 'k' && piece.color === turn);
    return king ? king.square : null;
  }

  private buildStatusText(): string {
    if (this.errorMessage !== null) {
      return this.errorMessage;
    }
    const status = getGameStatus(this.chess);
    const youAre = `You play ${colorName(this.playerColor)}.`;
    return this.isBotThinking ? `${youAre} ${status.message}. Bot is thinking...` : `${youAre} ${status.message}`;
  }
}
