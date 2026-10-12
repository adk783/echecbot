import { type DifficultyLevel, buildGoCommand, getDifficultyConfig } from './difficulty';
import { parseBestMoveLine, parseUciMove, type UciMove } from './uci';

const ENGINE_URL = `${import.meta.env.BASE_URL}stockfish/stockfish-19-lite-single.js`;

type LineListener = (line: string) => void;

/** Promise-based wrapper around the Stockfish UCI web worker. */
export class Engine {
  private readonly worker = new Worker(ENGINE_URL);
  private listener: LineListener | null = null;
  private ready: Promise<void> | null = null;
  private queue: Promise<unknown> = Promise.resolve();

  constructor() {
    this.worker.onmessage = (event: MessageEvent<unknown>) => {
      if (typeof event.data === 'string') {
        this.listener?.(event.data);
      }
    };
  }

  /** Asks the engine for its move in the given position at the given difficulty. */
  getBestMove(fen: string, level: DifficultyLevel): Promise<UciMove> {
    const task = this.queue.then(() => this.search(fen, level));
    this.queue = task.catch(() => undefined);
    return task;
  }

  terminate(): void {
    this.worker.terminate();
  }

  private async search(fen: string, level: DifficultyLevel): Promise<UciMove> {
    await this.ensureReady();
    const config = getDifficultyConfig(level);
    this.send(`setoption name Skill Level value ${config.skillLevel}`);
    this.send(`position fen ${fen}`);
    const bestMoveLine = this.waitForLine((line) => parseBestMoveLine(line) !== null);
    this.send(buildGoCommand(config.search));
    const token = parseBestMoveLine(await bestMoveLine);
    const move = token === null ? null : parseUciMove(token);
    if (move === null) {
      throw new Error(`Engine returned an invalid move: ${token}`);
    }
    return move;
  }

  private ensureReady(): Promise<void> {
    if (this.ready === null) {
      this.ready = this.initialize();
    }
    return this.ready;
  }

  private async initialize(): Promise<void> {
    const uciOk = this.waitForLine((line) => line === 'uciok');
    this.send('uci');
    await uciOk;
    const readyOk = this.waitForLine((line) => line === 'readyok');
    this.send('isready');
    await readyOk;
  }

  private waitForLine(matches: (line: string) => boolean): Promise<string> {
    return new Promise((resolve) => {
      this.listener = (line) => {
        if (matches(line)) {
          this.listener = null;
          resolve(line);
        }
      };
    });
  }

  private send(command: string): void {
    this.worker.postMessage(command);
  }
}
