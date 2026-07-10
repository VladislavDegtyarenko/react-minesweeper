# Vercel Integration

## Current State

This repository is now a Next.js app and should be treated as a server-capable deployment target rather than a static site.

Relevant findings from the current codebase:

- `package.json` uses Next scripts only: `next dev`, `next build`, `next start`.
- `next.config.mjs` is empty, so there is no custom Vercel-specific config yet.
- There is no `vercel.json` and no tracked `.vercel/` project link.
- The current GitHub Actions deploy workflow still targets GitHub Pages and uploads `./dist`, which does not match the current Next.js app shape.
- The app depends on server features:
  - Clerk server auth in `src/server/auth/server.ts`
  - Neon + Drizzle server database access in `src/server/db/index.ts`
  - Server Actions in `src/app/(lobby)/actions.ts` and `src/app/(pages)/account/actions.ts`
  - Dynamic rendering in `src/app/(pages)/account/page.tsx` and `src/app/(pages)/leaderboard/page.tsx`
  - Edge runtime OG image generation in `src/app/opengraph-image.tsx`

## Required Environment Variables

The current Vercel deployment needs these variables configured:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
- `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL`
- `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL`
- `DATABASE_URL`
- `DATABASE_URL_UNPOOLED`
- `NEXT_PUBLIC_SITE_URL`

Notes:

- `DATABASE_URL` is used by the running app and should be the pooled Neon connection.
- `DATABASE_URL_UNPOOLED` is used by `drizzle-kit` for migrations.
- `NEXT_PUBLIC_SITE_URL` should point to the production Vercel domain or custom domain.
- The code still falls back to `https://minesweeper-classix.vercel.app` in SEO config, so the production domain should be kept explicit.

## Why Vercel Fits Better Than GitHub Pages

The app is not a static export:

- authenticated account pages depend on server-side user resolution
- leaderboard and account pages are forced dynamic
- the app uses server actions and server-only modules
- the OG image route uses the Edge runtime

Because of that, the current GitHub Pages workflow is legacy configuration and should be replaced by a Vercel-native deployment flow.

## Recommended CLI Setup

For a consistent local and agent-assisted deployment workflow, standardize on the Vercel CLI:

```bash
npm install -D vercel
```

Recommended follow-up scripts:

```json
{
  "scripts": {
    "vercel:link": "vercel link",
    "vercel:env:pull": "vercel env pull .env.local",
    "vercel:build": "vercel build",
    "vercel:deploy": "vercel deploy",
    "vercel:deploy:prod": "vercel deploy --prod"
  }
}
```

Additional repo hygiene to include with that setup:

- add `.vercel` to `.gitignore`
- decide whether deployments happen only through Vercel Git integration, only through CLI, or both
- replace or retire `.github/workflows/deploy.yml`

## Suggested Claude / Codex Workflow

To make Vercel deployments smoother for coding agents, keep the deployment path explicit in project instructions.

Recommended additions:

- extend `AGENTS.md` with a short Vercel section:
  - prefer `npx vercel build` before deployment-related changes are finalized
  - use `vercel env pull` instead of manually copying preview/production env values
  - never commit `.vercel/` contents
- add repo-local Claude guidance for the same workflow if this project will be used from Claude Code
- document which deploy path is authoritative:
  - Vercel Git integration from `main`
  - or manual CLI deploys for preview / production

## Implementation Plan

1. Install and document the Vercel CLI workflow.
2. Link the local repo to the correct Vercel project.
3. Pull Vercel-managed env vars into `.env.local` for local parity.
4. Add package scripts for build and deploy commands.
5. Update agent-facing instructions for Codex and Claude so deployment tasks follow one path.
6. Replace the legacy GitHub Pages workflow with a Vercel-native deployment strategy.
7. Refresh top-level docs so they describe the current Next.js + Vercel architecture instead of the old Vite setup.
