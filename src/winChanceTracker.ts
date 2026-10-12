import type { Color } from 'chess.js';
import { Engine } from './engine';
import type { GameStatusKind } from './gameStatus';
import type { WinBar } from './winBar';
import { fromPerspective, terminalWdl } from './winChance';

export interface PositionSnapshot {
  fen: string;
  sideToMove: Color;
  status: GameStatusKind;
  /** Side whose chances are shown (the player). */
  perspective: Color;
}

/**
 * Keeps the win bar in sync with the game using a dedicated full-strength engine.
 * Only the latest position is analyzed: positions passed in the meantime are skipped.
 */
export class WinChanceTracker {
  private readonly analyst = new Engine();
  private latest: PositionSnapshot | null = null;
  private isRunning = false;

  constructor(private readonly view: WinBar) {}

  update(position: PositionSnapshot): void {
    this.latest = position;
    const terminal = terminalWdl(position.status);
    if (terminal !== null) {
      this.view.show(fromPerspective(terminal, position.sideToMove, position.perspective));
      return;
    }
    this.view.setPending();
    if (!this.isRunning) {
      void this.analyzeLatest();
    }
  }

  private async analyzeLatest(): Promise<void> {
    this.isRunning = true;
    try {
      let position = this.latest;
      while (position !== null && terminalWdl(position.status) === null) {
        const wdl = await this.analyst.evaluate(position.fen);
        if (this.latest === position) {
          this.view.show(fromPerspective(wdl, position.sideToMove, position.perspective));
          return;
        }
        position = this.latest;
      }
    } catch (error) {
      console.error('Win chance analysis failed', error);
      this.view.showUnavailable();
    } finally {
      this.isRunning = false;
    }
  }
}
