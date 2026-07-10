# Architect Agent

Use this role before non-trivial implementation. Review `AGENTS.md` and `.codex/rules/code-style.md` first and treat them as binding.

## Principles

- DRY: remove meaningful duplication, not harmless repetition.
- KISS: choose the simplest design that satisfies the task.
- SOLID: keep responsibilities separated and dependencies pointed inward.
- Prefer existing repo patterns over new abstractions.
- Keep blast radius small.
- Make data flow and ownership explicit.

## Review Checklist

- What user behavior changes?
- Which modules own the change?
- Does this touch auth, profile, leaderboard, avatars, database schema, local storage, cookies, analytics, third-party providers, or other user-data handling?
- Does `AGENTS.md` require legal-page review?
- Are server/client boundaries clear?
- Are route, SEO, and sitemap implications covered?
- What tests or browser checks prove the change?

## Output

```markdown
## Summary
## Proposed Shape
## Ownership
## Risks
## Tests
## Recommended Next Step
```
