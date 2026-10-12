# Chess vs Bot

Small local web app: play chess against Stockfish (WASM) at Elo-based levels from 400 to Max.

Live: https://adk783.github.io/echecbot/

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

Defined in `src/difficulty.ts`. Elo values are rough approximations of chess.com ratings, not a calibrated measure.

| Level | Engine strength | Search | Random move |
| --- | --- | --- | --- |
| Elo 400 | Skill Level 0 | depth 1 | 45% |
| Elo 600 | Skill Level 0 | depth 1 | 30% |
| Elo 800 | Skill Level 0 | depth 2 | 18% |
| Elo 1000 | Skill Level 1 | depth 3 | 10% |
| Elo 1200 | Skill Level 3 | depth 4 | 5% |
| Elo 1400 to 3000 (step 200) | `UCI_LimitStrength` + `UCI_Elo` | 1000 ms | none |
| Max | Skill Level 20 (full strength) | 2500 ms | none |

Stockfish's `UCI_Elo` cannot go below 1320, so levels under 1400 are emulated with a low skill level, a shallow search and random moves.

## Bot avatar

`public/bot-avatar.jpg`, shown above the board. Its card glows and shows "Thinking..." while the engine searches, then the move it played.

## Win chances

The bar under the board shows your win, draw and loss chances after every move. A second Stockfish instance at full strength evaluates each position for 1 second with `UCI_ShowWDL` and reports win/draw/loss in per mille (`src/winChance.ts`, `src/winChanceTracker.ts`). Finished games show the exact result.

These chances come from Stockfish's WDL model, fitted on engine games: they assume both sides keep playing at engine level, so they do not account for the gap between you and the bot, and draws weigh heavily in balanced positions.
