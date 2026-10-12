import { toPercentages, type Wdl } from './winChance';

/** Draws the player's win / draw / loss chances as a split bar. Holds no game state. */
export class WinBar {
  private readonly segments: Record<keyof Wdl, HTMLElement>;
  private readonly labels: Record<keyof Wdl, HTMLElement>;

  constructor(private readonly root: HTMLElement) {
    this.segments = {
      win: this.require('.segment-win'),
      draw: this.require('.segment-draw'),
      loss: this.require('.segment-loss'),
    };
    this.labels = {
      win: this.require('.label-win'),
      draw: this.require('.label-draw'),
      loss: this.require('.label-loss'),
    };
  }

  /** Shows chances from the player's point of view, in per mille. */
  show(wdl: Wdl): void {
    const percent = toPercentages(wdl);
    for (const key of ['win', 'draw', 'loss'] as const) {
      this.segments[key].style.flexGrow = String(percent[key]);
      this.labels[key].textContent = `${percent[key]}%`;
    }
    this.root.classList.remove('is-pending', 'is-unavailable');
  }

  /** Marks the shown values as outdated while a new evaluation runs. */
  setPending(): void {
    this.root.classList.add('is-pending');
  }

  showUnavailable(): void {
    this.root.classList.remove('is-pending');
    this.root.classList.add('is-unavailable');
  }

  private require(selector: string): HTMLElement {
    const element = this.root.querySelector<HTMLElement>(selector);
    if (element === null) {
      throw new Error(`Win bar markup is missing ${selector}`);
    }
    return element;
  }
}
