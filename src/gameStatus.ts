import type { Chess, Color } from 'chess.js';

export type GameStatusKind = 'playing' | 'check' | 'checkmate' | 'stalemate' | 'draw';

export interface GameStatus {
  kind: GameStatusKind;
  /** Side to move. */
  turn: Color;
  message: string;
}

export function colorName(color: Color): string {
  return color === 'w' ? 'White' : 'Black';
}

/** Derives the displayable status of the game from a chess.js instance. */
export function getGameStatus(chess: Chess): GameStatus {
  const turn = chess.turn();
  const mover = colorName(turn);

  if (chess.isCheckmate()) {
    const winner = colorName(turn === 'w' ? 'b' : 'w');
    return { kind: 'checkmate', turn, message: `Checkmate, ${winner} wins` };
  }
  if (chess.isStalemate()) {
    return { kind: 'stalemate', turn, message: 'Stalemate, draw' };
  }
  if (chess.isDraw()) {
    return { kind: 'draw', turn, message: 'Draw' };
  }
  if (chess.isCheck()) {
    return { kind: 'check', turn, message: `${mover} to move, check` };
  }
  return { kind: 'playing', turn, message: `${mover} to move` };
}
