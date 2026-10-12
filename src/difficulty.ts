export type DifficultyLevel = 'easy' | 'intermediate' | 'hard' | 'impossible';

export type SearchLimit =
  | { kind: 'depth'; value: number }
  | { kind: 'movetime'; value: number };

export interface DifficultyConfig {
  skillLevel: number;
  search: SearchLimit;
  /** Probability in [0, 1] of playing a random legal move instead of the engine move. */
  randomMoveChance: number;
}

export type RandomSource = () => number;

const EASY_SKILL_LEVEL = 0;
const EASY_SEARCH_DEPTH = 1;
const EASY_RANDOM_MOVE_CHANCE = 0.3;

const INTERMEDIATE_SKILL_LEVEL = 6;
const INTERMEDIATE_MOVE_TIME_MS = 300;

const HARD_SKILL_LEVEL = 14;
const HARD_MOVE_TIME_MS = 1000;

const IMPOSSIBLE_SKILL_LEVEL = 20;
const IMPOSSIBLE_MOVE_TIME_MS = 2500;

const NO_RANDOM_MOVES = 0;

export const DIFFICULTY_LEVELS: readonly DifficultyLevel[] = [
  'easy',
  'intermediate',
  'hard',
  'impossible',
];

const CONFIGS: Record<DifficultyLevel, DifficultyConfig> = {
  easy: {
    skillLevel: EASY_SKILL_LEVEL,
    search: { kind: 'depth', value: EASY_SEARCH_DEPTH },
    randomMoveChance: EASY_RANDOM_MOVE_CHANCE,
  },
  intermediate: {
    skillLevel: INTERMEDIATE_SKILL_LEVEL,
    search: { kind: 'movetime', value: INTERMEDIATE_MOVE_TIME_MS },
    randomMoveChance: NO_RANDOM_MOVES,
  },
  hard: {
    skillLevel: HARD_SKILL_LEVEL,
    search: { kind: 'movetime', value: HARD_MOVE_TIME_MS },
    randomMoveChance: NO_RANDOM_MOVES,
  },
  impossible: {
    skillLevel: IMPOSSIBLE_SKILL_LEVEL,
    search: { kind: 'movetime', value: IMPOSSIBLE_MOVE_TIME_MS },
    randomMoveChance: NO_RANDOM_MOVES,
  },
};

export function getDifficultyConfig(level: DifficultyLevel): DifficultyConfig {
  return CONFIGS[level];
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
