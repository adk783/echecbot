import { Chess } from 'chess.js';
import { describe, expect, it } from 'vitest';
import { getGameStatus } from './gameStatus';

describe('getGameStatus', () => {
  it('reports white to move at the start', () => {
    expect(getGameStatus(new Chess())).toEqual({ kind: 'playing', turn: 'w', message: 'White to move' });
  });

  it('reports black to move after 1.e4', () => {
    const chess = new Chess();
    chess.move('e4');
    expect(getGameStatus(chess)).toEqual({ kind: 'playing', turn: 'b', message: 'Black to move' });
  });

  it('reports check', () => {
    const chess = new Chess('4k3/8/8/8/8/8/4R3/4K3 b - - 0 1');
    expect(getGameStatus(chess)).toEqual({ kind: 'check', turn: 'b', message: 'Black to move, check' });
  });

  it('reports checkmate with the winner', () => {
    const chess = new Chess();
    for (const san of ['f3', 'e5', 'g4', 'Qh4#']) {
      chess.move(san);
    }
    expect(getGameStatus(chess)).toEqual({ kind: 'checkmate', turn: 'w', message: 'Checkmate, Black wins' });
  });

  it('reports stalemate', () => {
    const chess = new Chess('7k/5Q2/6K1/8/8/8/8/8 b - - 0 1');
    expect(getGameStatus(chess)).toEqual({ kind: 'stalemate', turn: 'b', message: 'Stalemate, draw' });
  });

  it('reports a draw by insufficient material', () => {
    const chess = new Chess('8/8/4k3/8/8/4K3/8/8 w - - 0 1');
    expect(getGameStatus(chess)).toEqual({ kind: 'draw', turn: 'w', message: 'Draw' });
  });

  it('reports a draw by fifty-move rule', () => {
    const chess = new Chess('4k3/8/8/8/8/8/4R3/4K3 w - - 100 80');
    expect(getGameStatus(chess).kind).toBe('draw');
  });
});
