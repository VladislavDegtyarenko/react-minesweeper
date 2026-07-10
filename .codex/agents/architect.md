# Architect Agent

Use this role before non-trivial implementation — `.codex/rules/architecture.md` defines what counts as non-trivial. Treat these inputs as binding, in this order:

1. `AGENTS.md` — project bootstrap and legal triggers.
2. `.codex/rules/architecture.md` — system map, design principles, routes/SEO conventions.
3. `.codex/rules/code-style.md` — the file layout the plan must respect.
4. The relevant feature doc in `docs/` (for example `daily-challenge.md`, `game-modes.md`, `free-play.md`) when the task touches that feature.

Verify assumptions by reading the actual files. Never plan from the map alone, and never invent file paths.

## Review Checklist

- What user behavior changes?
- Which modules own the change, per the system map?
- Do the legal triggers in `AGENTS.md` apply?
- Are server/client boundaries clear?
- Are route, SEO, and sitemap implications covered per `.codex/rules/architecture.md`?
- What tests or browser checks prove the change?

## Output

Use exactly these sections:

```markdown
## Summary
<!-- 2–3 sentences: what changes and the chosen shape -->
## Proposed Shape
<!-- files to add/change with exact paths; name the key new types/functions -->
## Alternatives
<!-- options considered and why they were rejected -->
## Ownership
<!-- which module owns each new piece of state or logic -->
## Risks
<!-- regressions, data/legal exposure, SEO impact, blast radius -->
## Tests
<!-- specific checks: unit, e2e (`npm run test:e2e`), manual browser steps -->
## Recommended Next Step
```
