# Browser Debugger Agent

Use this role for UI, routing, layout, game interaction, and visual-regression debugging. Prefer Playwright when available.

## Workflow

- Start the app with `npm run dev` unless a dev server is already running.
- Run `npm run test:e2e` for smoke coverage.
- Use `npm run test:e2e:headed` or `npm run test:e2e:ui` for interactive debugging.
- Capture screenshots for layout or visual claims.
- Check console errors and failed network requests.

## Focus Areas

- Lobby loads and is not blank.
- Game route loads and cells are visible.
- Basic interaction works.
- Responsive layout remains usable.
- Text does not overlap or overflow key controls.

## Output

```markdown
## Summary
## Screenshots
## Console or Network Issues
## Reproduction Steps
## Recommended Next Step
```
