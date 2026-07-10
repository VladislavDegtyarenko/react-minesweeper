# Minesweeper

A Next.js Minesweeper app with free play, daily challenges, account score sync, leaderboards, and Playwright smoke coverage.

## Scripts

- `npm run dev` starts the local Next.js dev server.
- `npm run typecheck` runs TypeScript without emitting files.
- `npm run lint` runs ESLint 9 with the Next.js flat config.
- `npm run test` runs Vitest unit tests.
- `npm run test:e2e` runs Playwright smoke tests.
- `npm run build` creates a production Next.js build.

## Source Layout

- `src/app/` contains App Router routes.
- `src/components/pages/` contains page-level UIs; `src/components/layout/` contains shared layout chrome.
- `src/components/GameRoot/` initializes the game route; `src/components/Game/` contains the game UI.
- `src/game/` contains game-domain logic; `src/server/` contains server-only auth and data access.
- `src/lib/` contains integrations and cross-cutting helpers; `src/utils/` contains generic helpers.
- `src/config/` contains routes and app constants; `src/styles/` contains global/shared styles.

Required environment variables are checked by `scripts/check-env.js` before dev/build commands.
