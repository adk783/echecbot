export interface UciMove {
  from: string;
  to: string;
  promotion: string | undefined;
}

const UCI_MOVE_PATTERN = /^([a-h][1-8])([a-h][1-8])([qrbn])?$/;
const BEST_MOVE_PATTERN = /^bestmove (\S+)/;

/** Parses a UCI move such as `e2e4` or `e7e8q`. Returns null when the format is invalid. */
export function parseUciMove(value: string): UciMove | null {
  const match = UCI_MOVE_PATTERN.exec(value);
  if (match === null) {
    return null;
  }
  return { from: match[1], to: match[2], promotion: match[3] };
}

/** Returns the move token of a `bestmove` line, or null for any other line. */
export function parseBestMoveLine(line: string): string | null {
  const match = BEST_MOVE_PATTERN.exec(line);
  return match === null ? null : match[1];
}
