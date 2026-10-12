export type SearchLimit =
  | { kind: 'depth'; value: number }
  | { kind: 'movetime'; value: number };

/** How the engine is weakened: by its skill level, or by its built-in Elo limiter. */
export type EngineStrength =
  | { kind: 'skill'; skillLevel: number }
  | { kind: 'elo'; elo: number };

export interface DifficultyConfig {
  strength: EngineStrength;
  search: SearchLimit;
  /** Probability in [0, 1] of playing a random legal move instead of the engine move. */
  randomMoveChance: number;
}

export interface DifficultyLevel {
  id: string;
  label: string;
  config: DifficultyConfig;
}

export type RandomSource = () => number;

interface WeakLevelSpec {
  elo: number;
  skillLevel: number;
  searchDepth: number;
  randomMoveChance: number;
}

/**
 * Stockfish's Elo limiter cannot go below 1320, so the weakest levels are
 * emulated with a low skill level, a shallow search and random moves.
 * Values are rough approximations of chess.com ratings.
 */
const WEAK_LEVELS: readonly WeakLevelSpec[] = [
  { elo: 400, skillLevel: 0, searchDepth: 1, randomMoveChance: 0.45 },
  { elo: 600, skillLevel: 0, searchDepth: 1, randomMoveChance: 0.3 },
  { elo: 800, skillLevel: 0, searchDepth: 2, randomMoveChance: 0.18 },
  { elo: 1000, skillLevel: 1, searchDepth: 3, randomMoveChance: 0.1 },
  { elo: 1200, skillLevel: 3, searchDepth: 4, randomMoveChance: 0.05 },
];

const LIMITED_ELO_MIN = 1400;
const LIMITED_ELO_MAX = 3000;
const LIMITED_ELO_STEP = 200;
const LIMITED_MOVE_TIME_MS = 1000;

const MAX_LEVEL_ID = 'max';
const MAX_SKILL_LEVEL = 20;
const MAX_MOVE_TIME_MS = 2500;

const NO_RANDOM_MOVES = 0;

function eloLabel(elo: number): string {
  return `Elo ${elo}`;
}

function weakLevel(spec: WeakLevelSpec): DifficultyLevel {
  return {
    id: String(spec.elo),
    label: eloLabel(spec.elo),
    config: {
      strength: { kind: 'skill', skillLevel: spec.skillLevel },
      search: { kind: 'depth', value: spec.searchDepth },
      randomMoveChance: spec.randomMoveChance,
    },
  };
}

function limitedLevel(elo: number): DifficultyLevel {
  return {
    id: String(elo),
    label: eloLabel(elo),
    config: {
      strength: { kind: 'elo', elo },
      search: { kind: 'movetime', value: LIMITED_MOVE_TIME_MS },
      randomMoveChance: NO_RANDOM_MOVES,
    },
  };
}

function limitedLevels(): DifficultyLevel[] {
  const levels: DifficultyLevel[] = [];
  for (let elo = LIMITED_ELO_MIN; elo <= LIMITED_ELO_MAX; elo += LIMITED_ELO_STEP) {
    levels.push(limitedLevel(elo));
  }
  return levels;
}

const MAX_LEVEL: DifficultyLevel = {
  id: MAX_LEVEL_ID,
  label: 'Max',
  config: {
    strength: { kind: 'skill', skillLevel: MAX_SKILL_LEVEL },
    search: { kind: 'movetime', value: MAX_MOVE_TIME_MS },
    randomMoveChance: NO_RANDOM_MOVES,
  },
};

/** All levels, weakest first. */
export const DIFFICULTY_LEVELS: readonly DifficultyLevel[] = [
  ...WEAK_LEVELS.map(weakLevel),
  ...limitedLevels(),
  MAX_LEVEL,
];

/** Returns the level with the given id. Throws on an unknown id. */
export function findDifficultyLevel(id: string): DifficultyLevel {
  const level = DIFFICULTY_LEVELS.find((candidate) => candidate.id === id);
  if (level === undefined) {
    throw new Error(`Unknown difficulty level: ${id}`);
  }
  return level;
}

/** Builds the UCI `setoption` commands that apply an engine strength. */
export function buildStrengthCommands(strength: EngineStrength): string[] {
  if (strength.kind === 'elo') {
    return ['setoption name UCI_LimitStrength value true', `setoption name UCI_Elo value ${strength.elo}`];
  }
  return ['setoption name UCI_LimitStrength value false', `setoption name Skill Level value ${strength.skillLevel}`];
}

/** Builds the UCI `go` command for a search limit. */
export function buildGoCommand(search: SearchLimit): string {
  return `go ${search.kind} ${search.value}`;
}

/** True when the roll falls under the chance. A chance of 0 never triggers. */
export function shouldPlayRandomMove(chance: number, random: RandomSource = Math.random): boolean {
  return random() < chance;
}

/** Picks one item uniformly. Throws on an empty list. */
export function pickRandomItem<T>(items: readonly T[], random: RandomSource = Math.random): T {
  if (items.length === 0) {
    throw new Error('Cannot pick from an empty list');
  }
  return items[Math.floor(random() * items.length)];
}
