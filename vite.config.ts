import { defineConfig } from 'vite';

// GitHub Pages serves the app under /echecbot/; dev server stays at the root.
const PAGES_BASE_PATH = '/echecbot/';

export default defineConfig(({ command }) => ({
  base: command === 'build' ? PAGES_BASE_PATH : '/',
}));
