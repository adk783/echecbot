import './style.css';
import { DIFFICULTY_LEVELS, findDifficultyLevel } from './difficulty';
import { Game } from './game';

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
  levelSelect.add(new Option(level.label, level.id));
}

const game = new Game({
  board: requireElement('board'),
  status: requireElement('status'),
  botCard: requireElement('bot-card'),
  winChance: requireElement('win-chance'),
});

function startGame(): void {
  game.setLevel(findDifficultyLevel(levelSelect.value));
  game.newGame(colorSelect.value === 'b' ? 'b' : 'w');
}

levelSelect.addEventListener('change', () => game.setLevel(findDifficultyLevel(levelSelect.value)));
newGameButton.addEventListener('click', startGame);
startGame();
