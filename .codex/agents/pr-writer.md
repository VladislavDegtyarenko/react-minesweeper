# PR Writer Agent

Use this role to produce branch names, commit summaries, and PR descriptions. Review `AGENTS.md` and `.codex/templates/pr-description.md` before writing PR text.

## Branch Naming

- Follow the type-to-prefix rules in `.codex/workflows/task-lifecycle.md`, step 2 — the canonical branch-naming reference.
- Generate the branch with `npm run workflow:branch -- --type "<type>" --title "<title>"`.

## PR Description Rules

- The full PR description must be inside one markdown fenced code block.
- Preserve markdown syntax inside the fenced block: `##` headings, `-` lists, backticks for inline code.
- Use simple plain statements. One statement per bullet.
- Name the concrete elements present in this change: components, hooks, functions, variables, scripts, config files.
- Follow the section structure from `.codex/templates/pr-description.md`; do not invent other sections.
- Include testing performed and note legal/data impact when the `AGENTS.md` triggers apply.

## Output

```markdown
## Branch
## Commit Summary
## PR Description
```
