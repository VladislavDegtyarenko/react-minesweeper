# Architecture

System map and design principles for this repo. Read this before planning (architect role) or reviewing non-trivial work. Verify against the actual files — this map is a starting point, not a substitute for reading code.

## System Map

- **Routes** — `src/app/` (Next.js App Router):
  - `(lobby)/page.tsx` — lobby at `/`
  - `game/page.tsx` + `game/Game.client.tsx` — the game at `/game`, client-only rendering
  - `(pages)/` — content pages: account, blog, how-to-play, leaderboard, privacy, terms-of-service
  - `login/`, `signup/` — Clerk auth pages
  - Route paths are defined once as `ROUTES` in `src/config/routes.json`
- **Page components** — route files stay thin; the real page UIs live in `src/components/<Name>Page/` (AccountPage, LobbyPage, LeaderboardPage) and `src/components/Game/`.
- **State** — Zustand stores in `src/store/<domain>/`: `game`, `daily`, `settings`, `sfx`, `stats`, `timer`. Stores split into `store.ts`, `actions.ts`, `selectors.ts`, `types.ts`; larger ones add `listeners.ts`, `subscriptions.ts`, and submodules (`game/preferences`, `game/snapshot`).
- **Game engine** — pure, React-free logic in `src/utils/board/` (reveal, win check) and `src/utils/daily/` (seed, streaks, validation). Keep it pure so it stays testable.
- **Server/data** — Drizzle + Neon in `src/utils/db/` (schema plus `queries/`); Clerk helpers in `src/utils/auth/` and `src/utils/clerk/`.
- **SEO** — helpers in `src/utils/seo/`; route hiding in `src/proxy.ts`.

## Design Principles

- Prefer existing repo patterns over new abstractions. Keep the blast radius small.
- Server components by default; push `'use client'` boundaries as far down the tree as possible.
- Extend an existing Zustand store before creating a new one. Cross-store effects belong in `listeners.ts`/`subscriptions.ts`, not in components.
- Game-logic changes go into the pure modules (`src/utils/board`, `src/utils/daily`), not into components or stores.
- Database access goes through `src/utils/db/queries/` only; never query from components.
- Make data flow and ownership explicit: one module owns each piece of state.

## Routes & SEO Conventions

- New page: add its path to `src/config/routes.json` and generate metadata with `generateMetadata()` from `@/utils/seo`.
- Public (indexable) page: add it to `PUBLIC_PAGES` in `src/utils/seo/publicPages.ts`.
- Hidden page: add it to `HIDDEN_ROUTES` in `src/proxy.ts` and set `noIndex: true` in its metadata.
- The production URL comes from the `NEXT_PUBLIC_SITE_URL` env variable.

## What Counts As Non-Trivial

Treat a change as non-trivial — an architect plan is required — when it does any of the following:

- touches more than ~3 modules or crosses store boundaries
- adds a dependency, a route, or a new store
- changes the database schema or a persisted shape (local storage, game snapshot)
- touches auth or any user-data handling (see the legal triggers in `AGENTS.md`)
- changes SEO or sitemap behavior
