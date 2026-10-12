# Chess vs Bot

Small local web app: play chess against Stockfish (WASM) at four difficulty levels (Easy, Intermediate, Hard, Impossible).

Stack: Vite, TypeScript, chess.js (rules), Stockfish 19 lite single-threaded (engine, Web Worker, UCI).

## Run

```
npm install
npm run dev
```

Open http://localhost:5173.

`npm install` copies the engine files (`stockfish-19-lite-single.js` and `.wasm`) from `node_modules/stockfish/bin` into `public/stockfish/` through a `postinstall` script (`scripts/copy-stockfish.mjs`). Run `npm run copy-engine` to redo it manually.

## Scripts

- `npm test`: unit tests (vitest) for difficulty mapping, UCI parsing and game status.
- `npm run typecheck`: TypeScript check.
- `npm run build`: production build in `dist/`.

## Difficulty

Defined in `src/difficulty.ts`.

| Level | Skill Level | Search | Random move |
| --- | --- | --- | --- |
| Easy | 0 | depth 1 | 30% |
| Intermediate | 6 | 300 ms | none |
| Hard | 14 | 1000 ms | none |
| Impossible | 20 | 2500 ms | none |
