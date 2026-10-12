import { describe, expect, it } from 'vitest';
import {
  DIFFICULTY_LEVELS,
  buildGoCommand,
  buildStrengthCommands,
  findDifficultyLevel,
  pickRandomItem,
  shouldPlayRandomMove,
} from './difficulty';

describe('DIFFICULTY_LEVELS', () => {
  it('goes from Elo 400 to 3000 in steps of 200, then Max', () => {
    expect(DIFFICULTY_LEVELS.map((level) => level.label)).toEqual([
      'Elo 400',
      'Elo 600',
      'Elo 800',
      'Elo 1000',
      'Elo 1200',
      'Elo 1400',
      'Elo 1600',
      'Elo 1800',
      'Elo 2000',
      'Elo 2200',
      'Elo 2400',
      'Elo 2600',
      'Elo 2800',
      'Elo 3000',
      'Max',
    ]);
  });

  it('has unique ids', () => {
    const ids = DIFFICULTY_LEVELS.map((level) => level.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('makes random moves rarer as the Elo grows', () => {
    const chances = DIFFICULTY_LEVELS.map((level) => level.config.randomMoveChance);
    const sorted = [...chances].sort((a, b) => b - a);
    expect(chances).toEqual(sorted);
  });
});

describe('level configs', () => {
  it('plays Elo 400 at skill 0, depth 1, with many random moves', () => {
    expect(findDifficultyLevel('400').config).toEqual({
      strength: { kind: 'skill', skillLevel: 0 },
      search: { kind: 'depth', value: 1 },
      randomMoveChance: 0.45,
    });
  });

  it('plays Elo 1200 with low skill and few random moves', () => {
    expect(findDifficultyLevel('1200').config).toEqual({
      strength: { kind: 'skill', skillLevel: 3 },
      search: { kind: 'depth', value: 4 },
      randomMoveChance: 0.05,
    });
  });

  it('uses the engine Elo limiter from 1400 upward', () => {
    expect(findDifficultyLevel('1400').config).toEqual({
      strength: { kind: 'elo', elo: 1400 },
      search: { kind: 'movetime', value: 1000 },
      randomMoveChance: 0,
    });
    expect(findDifficultyLevel('3000').config.strength).toEqual({ kind: 'elo', elo: 3000 });
  });

  it('plays Max at full strength with the longest think time', () => {
    expect(findDifficultyLevel('max').config).toEqual({
      strength: { kind: 'skill', skillLevel: 20 },
      search: { kind: 'movetime', value: 2500 },
      randomMoveChance: 0,
    });
  });
});

describe('findDifficultyLevel', () => {
  it('throws on an unknown id', () => {
    expect(() => findDifficultyLevel('9999')).toThrow();
  });
});

describe('buildStrengthCommands', () => {
  it('disables the Elo limiter and sets the skill level', () => {
    expect(buildStrengthCommands({ kind: 'skill', skillLevel: 3 })).toEqual([
      'setoption name UCI_LimitStrength value false',
      'setoption name Skill Level value 3',
    ]);
  });

  it('enables the Elo limiter and sets the Elo', () => {
    expect(buildStrengthCommands({ kind: 'elo', elo: 1800 })).toEqual([
      'setoption name UCI_LimitStrength value true',
      'setoption name UCI_Elo value 1800',
    ]);
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
