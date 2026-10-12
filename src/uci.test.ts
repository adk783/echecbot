import { describe, expect, it } from 'vitest';
import { parseBestMoveLine, parseUciMove } from './uci';

describe('parseUciMove', () => {
  it('parses a plain move', () => {
    expect(parseUciMove('e2e4')).toEqual({ from: 'e2', to: 'e4', promotion: undefined });
  });

  it('parses a promotion move', () => {
    expect(parseUciMove('e7e8q')).toEqual({ from: 'e7', to: 'e8', promotion: 'q' });
  });

  it.each(['', 'e2', 'e2e9', 'i2e4', 'e2e4x', 'E2E4', '(none)', 'e2e4qq'])(
    'rejects %j',
    (value) => {
      expect(parseUciMove(value)).toBeNull();
    },
  );
});

describe('parseBestMoveLine', () => {
  it('extracts the move from a bestmove line', () => {
    expect(parseBestMoveLine('bestmove e2e4 ponder e7e5')).toBe('e2e4');
  });

  it('extracts the move from a bare bestmove line', () => {
    expect(parseBestMoveLine('bestmove g1f3')).toBe('g1f3');
  });

  it('returns null for non bestmove lines', () => {
    expect(parseBestMoveLine('info depth 1 score cp 20')).toBeNull();
  });

  it('returns the raw token even when invalid so the caller can reject it', () => {
    expect(parseBestMoveLine('bestmove (none)')).toBe('(none)');
  });
});
