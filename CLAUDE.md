# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (clears .next cache first)
npm run build        # Production build
npm run lint         # ESLint

npm run db:push      # Push Drizzle schema to Neon (no migration file generated)
npm run db:generate  # Generate versioned migration SQL files
npm run db:studio    # Open Drizzle Studio UI (reads .env.local)
```

All `db:*` commands read from `.env.local`.

## Architecture

Full-stack Next.js (App Router) minesweeper game with auth, leaderboard, and persistent high scores.

**Stack:**
- **Next.js 16** (App Router) + TypeScript
- **Clerk** (`@clerk/nextjs`) — auth, sessions, avatar upload
- **Neon** (PostgreSQL, serverless) + **Drizzle ORM** — single `best_scores` table
- **Zustand** — all client game state (board, timer, settings, stats, sfx)
- **Radix UI** + **SCSS modules** + **Framer Motion**

**Environment variables required:**
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
- `DATABASE_URL` (pooled, used at runtime)
- `DATABASE_URL_UNPOOLED` (used by drizzle-kit for migrations)

**Data flow:** Game state lives entirely in Zustand stores (`src/store/`). The database is only touched on win (upsert best score) and on leaderboard/account page load. Server actions in `src/utils/db/queries/` handle all DB operations — they are `'use server'` modules and must not be imported from client code directly.

**Auth bridge:** `src/components/ClerkAuthBridge/` syncs Clerk session state into the app, providing the current user's Clerk `userId` downstream without prop-drilling.

**Routing:** Route constants are in `src/config/routes.json`. Clerk's `clerkMiddleware` in `middleware.ts` protects server-side access; auth redirect URLs are `/login` and `/signup`.

**DB schema** (`src/utils/db/schema.ts`): One table — `best_scores` with `(user_id, level_id)` unique index and `(level_id, best_time_ms)` leaderboard index. `level_id` is a Postgres enum (`easy | medium | expert`), enum values sourced from `LEVEL_IDS` in `src/utils/db/constants.ts`.

## Code Style

From `AGENTS.md`:

- Utility functions go in a `utils.ts` file or `utils/` folder (expose via `index.ts`).
- Constants in `constants.ts` using `SCREAMING_SNAKE_CASE`; types in `types.ts`; no interfaces.
- Folder-per-component named after the component; entry is `index.tsx`, styles are `styles.module.scss`.
- Sub-components go in a local `components/` subfolder; component-specific hooks in a local `hooks/` subfolder.
- Prefer nested SCSS rules over flat selectors.
- Empty line before `return` unless it's the only statement in scope. No empty `return` statements.
- Aim for components ≤ 120 lines; split when they grow beyond that.

## Project Planning

- Notion page: `Minesweeper Game to Production` — `https://www.notion.so/2b4ca6160f2b809f9cf8cec286e4242b`
- Task tracker: inline Notion database `Tasks Tracker` inside that page.
