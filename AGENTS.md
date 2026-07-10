# AGENTS

## Codex Workflow

- Use `.codex/orchestrator.md` for the repo-local Team Lead workflow.
- Specialist agent instructions live in `.codex/agents/`.
- `AGENTS.md` is the bootstrap for required project context; detailed rule files live in `.codex/rules/`.

## Required Rules

- Before code changes or code review, read `.codex/rules/code-style.md`.
- Do not duplicate rule text in agent docs; point agents to the relevant file in `.codex/rules/`.

## Project Context

- For Notion-related project planning and PR/task lookups, use the Notion page `Minesweeper Game to Production`: `https://www.notion.so/2b4ca6160f2b809f9cf8cec286e4242b`.
- The task tracker for this project is the inline Notion database `Tasks Tracker` inside that page.

## Legal Pages

- Whenever you change account, authentication, leaderboard, avatar, profile, database schema, local storage, cookies, analytics, third-party providers, or any user-data handling, review the legal pages and update them if needed:
  - `src/app/(pages)/privacy/page.tsx`
  - `src/app/(pages)/terms-of-service/page.tsx`
- If a legal page is updated, also bump `lastUpdatedDateTime` and `lastUpdated` on the page.
