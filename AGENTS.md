# AGENTS

## Codex Workflow

- Use `.codex/orchestrator.md` for the repo-local Team Lead workflow.
- Specialist agent instructions live in `.codex/agents/`.
- `AGENTS.md` is the bootstrap for required project context; detailed rule files live in `.codex/rules/`.

## Required Rules

- Before code changes or code review, read `.codex/rules/code-style.md`.
- Before planning or reviewing non-trivial work, read `.codex/rules/architecture.md` (system map, design principles, routes/SEO conventions, definition of non-trivial).
- Do not duplicate rule text in agent docs; point agents to the relevant file in `.codex/rules/`.

## Git rules and flow
- Prod branch is `main`
- Before starting the work on a new feature and implementing new ones, switch to prod branch and pull the latest changes. Make sure the branch has no uncommited changes, otherwise tell the user about it.
- Create a separate branch (e.g. `feat/some-new-feature` or `fix/little-bug-fix`)

## Storybook maintenance

- When changing a component, its styles, or a dependency used by its stories, check the neighboring `*.stories.tsx` files and their example helpers for affected behavior.
- Stories must reuse the real application components and styles. Styling and internal implementation changes appear in Storybook automatically; do not duplicate component code or edit stories just to mirror those changes.
- When props (component inputs), variants, states, or behavior change, update the affected story inputs, Controls (the editable inputs panel), example wrappers, descriptions, usage examples, and interaction assertions as needed. Add a focused story and meaningful assertions for a new state or behavior within the documented component scope.
- Keep examples reproducible and isolated: update fixed sample data and the in-memory settings substitute when their contracts change, without introducing real account requests or application-storage access.
- Run `npm run test:storybook` for affected component behavior and accessibility, and visually inspect affected examples when appearance changes. Automated interaction and accessibility checks do not compare screenshots or prove that a layout looks correct.
- When Storybook configuration, shared styling, public assets, or asset paths change, also run `STORYBOOK_BASE_PATH=/react-minesweeper npm run build-storybook` and `npm run test:storybook:build` to check the site under its deployment path.
- The public Storybook updates after a successful `main` workflow builds and publishes it. Follow the user's explicit merge-approval rule; a request to update Storybook does not authorize merging a pull request.

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
