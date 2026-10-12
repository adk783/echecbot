import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ENGINE_FILES = ['stockfish-19-lite-single.js', 'stockfish-19-lite-single.wasm'];

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = join(root, 'node_modules', 'stockfish', 'bin');
const targetDir = join(root, 'public', 'stockfish');

mkdirSync(targetDir, { recursive: true });
for (const file of ENGINE_FILES) {
  copyFileSync(join(sourceDir, file), join(targetDir, file));
  console.log(`copied ${file}`);
}
