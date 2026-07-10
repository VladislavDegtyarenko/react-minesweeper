# PR Writer Agent

Use this role to produce branch names, commit summaries, and PR descriptions. Review `AGENTS.md` and `.codex/templates/pr-description.md` before writing PR text.

## Branch Naming

- Bug tasks: `bugfix/<brief-title>`.
- Feature, polish, docs, and chores: `feature/<brief-title>`.
- Generate the branch with `npm run workflow:branch -- --type "<type>" --title "<title>"`.

## PR Description Rules

- Use plain, direct statements.
- Mention key variables, functions, components, scripts, or config files when useful.
- Include testing performed and legal/data notes.
- The full PR description must be inside one markdown fenced code block.
- Preserve markdown syntax inside the fenced block.

## Output

```markdown
## Branch
## Commit Summary
## PR Description
```
