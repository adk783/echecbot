import { describe, expect, it } from 'vitest';
import { fromPerspective, parseWdl, terminalWdl, toPercentages } from './winChance';

describe('parseWdl', () => {
  it('reads win, draw and loss from an info line', () => {
    const line = 'info depth 18 seldepth 24 multipv 1 score cp 31 wdl 87 900 13 nodes 1 nps 1 time 1 pv e2e4';
    expect(parseWdl(line)).toEqual({ win: 87, draw: 900, loss: 13 });
  });

  it('returns null for a line without wdl', () => {
    expect(parseWdl('info depth 1 score cp 20 nodes 20')).toBeNull();
    expect(parseWdl('bestmove e2e4')).toBeNull();
  });

  it('ignores bound scores, which are not final for that depth', () => {
    expect(parseWdl('info depth 12 score cp 40 lowerbound wdl 100 850 50 nodes 1')).toBeNull();
    expect(parseWdl('info depth 12 score cp 40 upperbound wdl 100 850 50 nodes 1')).toBeNull();
  });

  it('rejects values that do not sum to 1000', () => {
    expect(parseWdl('info depth 5 score cp 1 wdl 500 500 500 nodes 1')).toBeNull();
  });
});

describe('fromPerspective', () => {
  const wdl = { win: 700, draw: 200, loss: 100 };

  it('keeps the values when the perspective is the side to move', () => {
    expect(fromPerspective(wdl, 'w', 'w')).toEqual(wdl);
  });

  it('swaps win and loss for the other side', () => {
    expect(fromPerspective(wdl, 'w', 'b')).toEqual({ win: 100, draw: 200, loss: 700 });
  });
});

describe('terminalWdl', () => {
  it('gives a certain loss to the side to move when checkmated', () => {
    expect(terminalWdl('checkmate')).toEqual({ win: 0, draw: 0, loss: 1000 });
  });

  it('gives a certain draw on stalemate or draw', () => {
    expect(terminalWdl('stalemate')).toEqual({ win: 0, draw: 1000, loss: 0 });
    expect(terminalWdl('draw')).toEqual({ win: 0, draw: 1000, loss: 0 });
  });

  it('returns null while the game goes on', () => {
    expect(terminalWdl('playing')).toBeNull();
    expect(terminalWdl('check')).toBeNull();
  });
});

describe('toPercentages', () => {
  it('converts per mille to whole percentages', () => {
    expect(toPercentages({ win: 500, draw: 300, loss: 200 })).toEqual({ win: 50, draw: 30, loss: 20 });
  });

  it('always sums to 100 after rounding', () => {
    const result = toPercentages({ win: 335, draw: 335, loss: 330 });
    expect(result.win + result.draw + result.loss).toBe(100);
  });

  it('gives the leftover point to the largest remainder', () => {
    expect(toPercentages({ win: 87, draw: 900, loss: 13 })).toEqual({ win: 9, draw: 90, loss: 1 });
  });
});
