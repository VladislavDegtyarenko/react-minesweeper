# Team Lead Orchestrator

This repo uses a single Team Lead agent to coordinate work. The Team Lead owns task intake, branch choice, implementation integration, review, PR text, and Notion status updates. Specialist agents may help, but they do not finalize or merge work.

## Sources Of Truth

- Project bootstrap and legal triggers: `AGENTS.md`.
- Code and styling rules: `.codex/rules/code-style.md`.
- System map and design principles: `.codex/rules/architecture.md`.
- Standard lifecycle: `.codex/workflows/task-lifecycle.md`.
- Specialist role instructions: `.codex/agents/`.
- PR body template: `.codex/templates/pr-description.md`.
- Notion identifiers (pages, data source, statuses): the `Notion` section of `AGENTS.md`.

## Operating Loop

1. Read the user request, `AGENTS.md`, and `.codex/rules/code-style.md`.
2. If the work is task-board driven, consult the Notion tracker before coding.
3. Choose or create a branch with `npm run workflow:branch -- --type "<type>" --title "<title>"`.
4. Prepare an architecture plan for non-trivial changes (`.codex/rules/architecture.md` defines the threshold).
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

Use this result format for ad-hoc agents. When a specialist doc in `.codex/agents/` defines its own output format, that format wins:

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
