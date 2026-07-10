# Task Lifecycle

Use this workflow for normal project tasks.

## 1. Notion Intake

- Fetch the `Minesweeper Game to Production` page or query the Tasks Tracker data source.
- Prefer active tasks in `In progress`, then high-priority `Not started` tasks.
- Capture task name, task type, status, priority, and Notion URL.
- Do not mutate Notion during intake.

Task statuses and tracker identifiers: see the `Notion` section of `AGENTS.md`.

## 2. Branch

- pull latest changes from `main` branch first.
- make sure the branch is clean, otherwise warn the user first.
- Use `feature/<brief-title>` for features and chores.
- Use `polish/<brief-title>` for polish.
- Use `docs/<brief-title>` for docs.
- Use `bugfix/<brief-title>` for Notion `🐞 Bug` tasks or explicit bug fixes.
- Generate names with `npm run workflow:branch -- --type "<type>" --title "<title>"`.
- Create a branch with `npm run workflow:branch -- --type "<type>" --title "<title>" --create`.
- Do not create a branch over uncommitted work unless the user explicitly accepts that risk.

## 3. Architecture

- Use `.codex/agents/architect.md` for non-trivial work (`.codex/rules/architecture.md` defines the threshold).
- Keep the plan scoped to the task.
- Identify legal-page, data, auth, storage, SEO, and UI risks before coding.

## 4. Implementation

- Implement according to the architecture plan and `AGENTS.md`.
- Delegate only bounded, disjoint work.
- The Team Lead integrates all code and resolves conflicts.

## 5. Browser Debugging

- Use `.codex/agents/browser-debugger.md` when the task touches UI, layout, game interactions, routing, or visual regressions.
- Prefer Playwright screenshots for visual confirmation.

## 6. Code Review

- Use `.codex/agents/code-reviewer.md`.
- Review against the request, `AGENTS.md`, changed files, and test evidence.
- Fix blocking issues before PR text.

## 7. PR Description

- Use `.codex/agents/pr-writer.md` and `.codex/templates/pr-description.md`.

## 8. Notion Status

- Move task to `In progress` when implementation begins, if connector update tools are available.
- Move task to `Done` only after review and checks pass.
- If update tools are unavailable, report the exact manual status update.
