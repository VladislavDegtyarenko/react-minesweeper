# Team Lead Orchestrator

This repo uses a single Team Lead agent to coordinate work. The Team Lead owns task intake, branch choice, implementation integration, review, PR text, and Notion status updates. Specialist agents may help, but they do not finalize or merge work.

## Sources Of Truth

- Project bootstrap and legal triggers: `AGENTS.md`.
- Code and styling rules: `.codex/rules/code-style.md`.
- Standard lifecycle: `.codex/workflows/task-lifecycle.md`.
- Specialist role instructions: `.codex/agents/`.
- PR body template: `.codex/templates/pr-description.md`.
- Notion project page: `Minesweeper Game to Production`.
- Notion task data source: `collection://2f9ca616-0f2b-80b5-b22e-000b20e5fc56`.

## Operating Loop

1. Read the user request, `AGENTS.md`, and `.codex/rules/code-style.md`.
2. If the work is task-board driven, consult the Notion tracker before coding.
3. Choose or create a branch with `npm run workflow:branch -- --type "<type>" --title "<title>"`.
4. Prepare an architecture plan for non-trivial changes.
5. Implement the smallest complete change that satisfies the task.
6. Run relevant checks, including browser debugging when visual behavior is touched.
7. Run a code-review pass against `AGENTS.md`, `.codex/rules/code-style.md`, and the task intent.
8. Produce a PR description with `.codex/templates/pr-description.md`.
9. Update Notion status when connector tools are available; otherwise report the exact manual update.

## Delegation Rules

Spawn specialist sub-agents only for bounded work that can run in parallel or produce an independent review. The Team Lead must keep the critical path moving locally and integrate results personally.

Every spawned agent gets:

- Objective.
- Ownership area.
- Allowed mutation level.
- Docs to read.
- Expected output format.
- Reminder that other edits may exist and must not be reverted.

Use this result format:

```markdown
## Summary
## Files Changed or Inspected
## Findings
## Risks
## Tests
## Recommended Next Step
```

## Finalization Rules

- Do not merge or mark Notion tasks done until checks and review are complete.
- Do not update legal pages unless `AGENTS.md` legal triggers apply.
- Do not duplicate project rules into specialist docs; point reviewers to `.codex/rules/`.
