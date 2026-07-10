# PR Description Template

The final PR description must be emitted as one fenced markdown code block, with markdown syntax preserved inside it (`##` headings, `-` lists, backticks for inline code):

````markdown
```markdown
## Brief
- 

## Changes
- 

## Open Questions
- 

## Test Cases & Regression Check
- 
```
````

Section guide:

- `Brief` — what the PR does and why, in one to three plain statements.
- `Changes` — what actually changed, naming the concrete elements in this change: components, hooks, functions, variables, scripts, config files.
- `Open Questions` — unresolved decisions for reviewers; write `None` if there are none.
- `Test Cases & Regression Check` — test cases performed or to run, plus regression areas to check, grounded in the changed elements.

Use simple plain statements. One statement per bullet.
