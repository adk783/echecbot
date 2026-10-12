import type { Color, PieceSymbol, Square } from 'chess.js';

export interface BoardPiece {
  type: PieceSymbol;
  color: Color;
  square: Square;
}

export interface BoardView {
  pieces: BoardPiece[];
  orientation: Color;
  selected: Square | null;
  targets: Square[];
  lastMove: { from: Square; to: Square } | null;
  checkedKing: Square | null;
  isInteractive: boolean;
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

const GLYPHS: Record<Color, Record<PieceSymbol, string>> = {
  w: { k: '♔', q: '♕', r: '♖', b: '♗', n: '♘', p: '♙' },
  b: { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' },
};

/** Renders the 8x8 board and reports square clicks. Holds no game state. */
export class Board {
  constructor(
    private readonly root: HTMLElement,
    private readonly onSquareClick: (square: Square) => void,
  ) {
    root.addEventListener('click', (event) => {
      const cell = (event.target as HTMLElement).closest<HTMLElement>('[data-square]');
      if (cell?.dataset.square) {
        this.onSquareClick(cell.dataset.square as Square);
      }
    });
  }

  render(view: BoardView): void {
    const files = view.orientation === 'w' ? FILES : [...FILES].reverse();
    const ranks = view.orientation === 'w' ? RANKS : [...RANKS].reverse();
    const pieceBySquare = new Map(view.pieces.map((piece) => [piece.square, piece]));

    this.root.classList.toggle('is-locked', !view.isInteractive);
    this.root.replaceChildren(
      ...ranks.flatMap((rank, row) =>
        files.map((file, column) => {
          const square = `${file}${rank}` as Square;
          return this.createCell(square, (row + column) % 2 === 0, pieceBySquare.get(square), view);
        }),
      ),
    );
  }

  private createCell(
    square: Square,
    isLight: boolean,
    piece: BoardPiece | undefined,
    view: BoardView,
  ): HTMLElement {
    const cell = document.createElement('div');
    cell.dataset.square = square;
    cell.className = `square ${isLight ? 'light' : 'dark'}`;
    cell.setAttribute('role', 'button');
    cell.setAttribute('aria-label', piece ? `${square} ${piece.color}${piece.type}` : square);

    if (view.lastMove && (square === view.lastMove.from || square === view.lastMove.to)) {
      cell.classList.add('last-move');
    }
    if (square === view.selected) {
      cell.classList.add('selected');
    }
    if (square === view.checkedKing) {
      cell.classList.add('in-check');
    }
    if (view.targets.includes(square)) {
      cell.classList.add(piece ? 'capture-target' : 'move-target');
    }
    if (piece) {
      const glyph = document.createElement('span');
      glyph.className = `piece piece-${piece.color}`;
      glyph.textContent = GLYPHS[piece.color][piece.type];
      cell.append(glyph);
    }
    return cell;
  }
}
