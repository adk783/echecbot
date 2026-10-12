import type { Color } from 'chess.js';
import type { GameStatusKind } from './gameStatus';

/** Win, draw and loss chances in per mille (sum 1000), from one side's point of view. */
export interface Wdl {
  win: number;
  draw: number;
  loss: number;
}

const PER_MILLE_TOTAL = 1000;
const PERCENT_TOTAL = 100;
const PER_MILLE_PER_PERCENT = PER_MILLE_TOTAL / PERCENT_TOTAL;
const WDL_PATTERN = /\bwdl (\d+) (\d+) (\d+)\b/;
const BOUND_PATTERN = /\b(lowerbound|upperbound)\b/;

const CERTAIN_LOSS: Wdl = { win: 0, draw: 0, loss: PER_MILLE_TOTAL };
const CERTAIN_DRAW: Wdl = { win: 0, draw: PER_MILLE_TOTAL, loss: 0 };

/**
 * Reads the `wdl` field of a Stockfish `info` line (side to move point of view).
 * Returns null when the line has no final wdl or the values are inconsistent.
 */
export function parseWdl(line: string): Wdl | null {
  if (BOUND_PATTERN.test(line)) {
    return null;
  }
  const match = WDL_PATTERN.exec(line);
  if (match === null) {
    return null;
  }
  const wdl = { win: Number(match[1]), draw: Number(match[2]), loss: Number(match[3]) };
  return wdl.win + wdl.draw + wdl.loss === PER_MILLE_TOTAL ? wdl : null;
}

/** Converts a side-to-move wdl to the given side's point of view. */
export function fromPerspective(wdl: Wdl, sideToMove: Color, perspective: Color): Wdl {
  return sideToMove === perspective ? wdl : { win: wdl.loss, draw: wdl.draw, loss: wdl.win };
}

/** Exact result for a finished game (side to move point of view), or null while it goes on. */
export function terminalWdl(status: GameStatusKind): Wdl | null {
  if (status === 'checkmate') {
    return CERTAIN_LOSS;
  }
  if (status === 'stalemate' || status === 'draw') {
    return CERTAIN_DRAW;
  }
  return null;
}

/** Rounds per mille to whole percentages that always sum to 100 (largest remainder method). */
export function toPercentages(wdl: Wdl): Wdl {
  const keys = ['win', 'draw', 'loss'] as const;
  const exact = keys.map((key) => wdl[key] / PER_MILLE_PER_PERCENT);
  const rounded = exact.map(Math.floor);
  let missing = PERCENT_TOTAL - rounded.reduce((sum, value) => sum + value, 0);
  const byRemainder = exact
    .map((value, index) => ({ index, remainder: value - Math.floor(value) }))
    .sort((a, b) => b.remainder - a.remainder);
  for (const { index } of byRemainder) {
    if (missing <= 0) {
      break;
    }
    rounded[index] += 1;
    missing -= 1;
  }
  return { win: rounded[0], draw: rounded[1], loss: rounded[2] };
}
