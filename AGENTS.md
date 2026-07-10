# AGENTS

## Codex Workflow

- Use `.codex/orchestrator.md` for the repo-local Team Lead workflow.
- Specialist agent instructions live in `.codex/agents/`.
- `AGENTS.md` is the bootstrap for required project context; detailed rule files live in `.codex/rules/`.

## Required Rules

- Before code changes or code review, read `.codex/rules/code-style.md`.
- Before planning or reviewing non-trivial work, read `.codex/rules/architecture.md` (system map, design principles, routes/SEO conventions, definition of non-trivial).
- Do not duplicate rule text in agent docs; point agents to the relevant file in `.codex/rules/`.

## Notion (canonical reference)

This section is the single source of truth for Notion identifiers. Other docs must link here instead of repeating them.

- Project page: `Minesweeper Game to Production` — `https://www.notion.so/2b4ca6160f2b809f9cf8cec286e4242b`
- Tasks Tracker database page: `https://www.notion.so/2f9ca6160f2b8017939ee024933e9a00`
- Tasks Tracker data source: `collection://2f9ca616-0f2b-80b5-b22e-000b20e5fc56`
- Properties: `Task name`, `Status`, `Priority`, `Task type`, `Tags`, `Assignee`, `Due date`
- Statuses: `Not started`, `In progress`, `Done`, `On Hold`, `Cancelled`

## Legal Pages

- Whenever you change account, authentication, leaderboard, avatar, profile, database schema, local storage, cookies, analytics, third-party providers, or any user-data handling, review the legal pages and update them if needed:
  - `src/app/(pages)/privacy/page.tsx`
  - `src/app/(pages)/terms-of-service/page.tsx`
- If a legal page is updated, also bump `lastUpdatedDateTime` and `lastUpdated` on the page.
