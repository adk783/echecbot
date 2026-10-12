import './style.css';
import { DIFFICULTY_LEVELS, type DifficultyLevel } from './difficulty';
import { Game } from './game';

const LEVEL_LABELS: Record<DifficultyLevel, string> = {
  easy: 'Easy',
  intermediate: 'Intermediate',
  hard: 'Hard',
  impossible: 'Impossible',
};

function requireElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (element === null) {
    throw new Error(`Missing element #${id}`);
  }
  return element as T;
}

const levelSelect = requireElement<HTMLSelectElement>('level');
const colorSelect = requireElement<HTMLSelectElement>('color');
const newGameButton = requireElement<HTMLButtonElement>('new-game');

for (const level of DIFFICULTY_LEVELS) {
  levelSelect.add(new Option(LEVEL_LABELS[level], level));
}

const game = new Game({ board: requireElement('board'), status: requireElement('status') });

function startGame(): void {
  game.setLevel(levelSelect.value as DifficultyLevel);
  game.newGame(colorSelect.value === 'b' ? 'b' : 'w');
}

levelSelect.addEventListener('change', () => game.setLevel(levelSelect.value as DifficultyLevel));
newGameButton.addEventListener('click', startGame);
startGame();
