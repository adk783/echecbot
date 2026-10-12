import { describe, expect, it } from 'vitest';
import {
  DIFFICULTY_LEVELS,
  buildGoCommand,
  getDifficultyConfig,
  pickRandomItem,
  shouldPlayRandomMove,
} from './difficulty';

describe('getDifficultyConfig', () => {
  it('maps easy to skill 0, depth 1 and 30% random moves', () => {
    expect(getDifficultyConfig('easy')).toEqual({
      skillLevel: 0,
      search: { kind: 'depth', value: 1 },
      randomMoveChance: 0.3,
    });
  });

  it('maps intermediate to skill 6 and 300 ms', () => {
    expect(getDifficultyConfig('intermediate')).toEqual({
      skillLevel: 6,
      search: { kind: 'movetime', value: 300 },
      randomMoveChance: 0,
    });
  });

  it('maps hard to skill 14 and 1000 ms', () => {
    expect(getDifficultyConfig('hard')).toEqual({
      skillLevel: 14,
      search: { kind: 'movetime', value: 1000 },
      randomMoveChance: 0,
    });
  });

  it('maps impossible to skill 20 and 2500 ms', () => {
    expect(getDifficultyConfig('impossible')).toEqual({
      skillLevel: 20,
      search: { kind: 'movetime', value: 2500 },
      randomMoveChance: 0,
    });
  });

  it('lists all four levels in ascending order', () => {
    expect(DIFFICULTY_LEVELS).toEqual(['easy', 'intermediate', 'hard', 'impossible']);
  });
});

describe('buildGoCommand', () => {
  it('builds a depth command', () => {
    expect(buildGoCommand({ kind: 'depth', value: 1 })).toBe('go depth 1');
  });

  it('builds a movetime command', () => {
    expect(buildGoCommand({ kind: 'movetime', value: 2500 })).toBe('go movetime 2500');
  });
});

describe('shouldPlayRandomMove', () => {
  it('plays random when the roll is below the chance', () => {
    expect(shouldPlayRandomMove(0.3, () => 0.29)).toBe(true);
  });

  it('plays the engine move when the roll equals the chance', () => {
    expect(shouldPlayRandomMove(0.3, () => 0.3)).toBe(false);
  });

  it('never plays random when the chance is 0', () => {
    expect(shouldPlayRandomMove(0, () => 0)).toBe(false);
  });
});

describe('pickRandomItem', () => {
  const items = ['a', 'b', 'c'];

  it('picks the first item for a roll of 0', () => {
    expect(pickRandomItem(items, () => 0)).toBe('a');
  });

  it('picks the last item for a roll just below 1', () => {
    expect(pickRandomItem(items, () => 0.999)).toBe('c');
  });

  it('throws on an empty list', () => {
    expect(() => pickRandomItem([], () => 0)).toThrow();
  });
});
