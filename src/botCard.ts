const AVATAR_URL = `${import.meta.env.BASE_URL}bot-avatar.jpg`;

/** Shows the bot's face, its level, and what it is doing. Holds no game state. */
export class BotCard {
  private readonly levelElement: HTMLElement;
  private readonly bubbleElement: HTMLElement;

  constructor(private readonly root: HTMLElement) {
    const avatar = root.querySelector<HTMLImageElement>('.avatar');
    const level = root.querySelector<HTMLElement>('.player-level');
    const bubble = root.querySelector<HTMLElement>('.bubble');
    if (avatar === null || level === null || bubble === null) {
      throw new Error('Bot card markup is incomplete');
    }
    avatar.src = AVATAR_URL;
    this.levelElement = level;
    this.bubbleElement = bubble;
  }

  setLevelLabel(label: string): void {
    this.levelElement.textContent = label;
  }

  showThinking(): void {
    this.root.classList.add('is-thinking');
    this.setBubble('Thinking...');
  }

  showMessage(message: string): void {
    this.root.classList.remove('is-thinking');
    this.setBubble(message);
  }

  clear(): void {
    this.root.classList.remove('is-thinking');
    this.setBubble(null);
  }

  private setBubble(message: string | null): void {
    this.bubbleElement.textContent = message ?? '';
    this.bubbleElement.hidden = message === null;
  }
}
