# Minesweeper

A Next.js Minesweeper app with free play, daily challenges, account score sync, leaderboards, and Playwright smoke coverage.

[Play Minesweeper](https://minesweeper-classix.vercel.app/) · [Explore Storybook](https://vladislavdegtyarenko.github.io/react-minesweeper/) · [Source](https://github.com/VladislavDegtyarenko/react-minesweeper)

[![Storybook checks](https://github.com/VladislavDegtyarenko/react-minesweeper/actions/workflows/storybook.yml/badge.svg)](https://github.com/VladislavDegtyarenko/react-minesweeper/actions/workflows/storybook.yml)

Storybook demonstrates seven application components with editable examples, generated documentation, interaction tests, and automated accessibility checks. It runs without an account or database connection.

## Run Storybook

Use Node.js 24 and npm. From the project folder:

```sh
npm ci
npx playwright install chromium
npm run storybook
```

Open [localhost:6006](http://localhost:6006). No `.env.local` file is required for Storybook. To run the actual game, configure the variables described in [the application setup guide](docs/setup-clerk-neon-drizzle.md), then run `npm run dev`.

Keep `@playwright/test` and `playwright` pinned to the same exact version when upgrading them, and install Chromium again after the upgrade. Use `npm ci` to restore the versions recorded in `package-lock.json`; mixing an independently updated test runner with an older Playwright CLI can prevent tests from loading.

Start with [the controlled Switch](https://vladislavdegtyarenko.github.io/react-minesweeper/?path=/story/ui-switch--toggle-with-mouse-and-keyboard), [saved-game confirmation](https://vladislavdegtyarenko.github.io/react-minesweeper/?path=/story/lobby-continuebanner--cancel-and-escape), or [retry feedback](https://vladislavdegtyarenko.github.io/react-minesweeper/?path=/story/game-scoresyncnotice--retry-then-fail). A story is a named example of a component with fixed inputs. Use **Docs** for usage notes and **Controls** to change those inputs.

## Scripts

- `npm run dev` starts the local Next.js dev server.
- `npm run typecheck` generates Next.js route types, then checks TypeScript without compiling the application.
- `npm run lint` runs ESLint 9 with the Next.js flat config.
- `npm run test` runs Vitest unit tests.
- `npm run storybook` starts Storybook at port 6006.
- `npm run build-storybook` creates a static site in `storybook-static/`.
- `npm run test:storybook` runs all stories, interaction assertions, and accessibility checks in Chromium.
- `npm run test:storybook:build` checks the built site at the GitHub Pages subpath.
- `npm run test:e2e` runs Playwright smoke tests.
- `npm run build` creates a production Next.js build.

## Source Layout

- `src/app/` contains App Router routes.
- `src/components/pages/` contains page-level UIs; `src/components/layout/` contains shared layout chrome.
- `src/components/GameRoot/` initializes the game route; `src/components/Game/` contains the game UI.
- `src/game/` contains game-domain logic; `src/server/` contains server-only auth and data access.
- `src/lib/` contains integrations and cross-cutting helpers; `src/utils/` contains generic helpers.
- `src/config/` contains routes and app constants; `src/styles/` contains global/shared styles.
- Each documented component has a neighboring `*.stories.tsx` file. Its `stories/` folder contains example-only wrappers or sample data when needed.
- `.storybook/` contains Storybook configuration, its introduction, layout overrides, and the isolated settings substitute.
- `src/storybook/` contains helpers used only by stories. The application does not import them.
- `tests/storybook/` checks the static output; `.github/workflows/storybook.yml` runs checks and publishes it.

Required environment variables are checked by `scripts/check-env.js` before dev/build commands.

## Testing and publication

The test suites cover different boundaries:

| Command                        | What it proves                                                                                                     |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `npm test`                     | Pure game rules and utility behavior, without a browser                                                            |
| `npm run test:storybook`       | Components render and respond to interactions in a real browser; axe detects supported accessibility violations    |
| `npm run test:storybook:build` | The static site, direct links, image paths, storage isolation, and dialog layouts work under `/react-minesweeper/` |
| `npm run test:e2e`             | The complete application loads and board interactions work; application environment variables are required         |

Build and check the same output that GitHub Pages serves:

```sh
STORYBOOK_BASE_PATH=/react-minesweeper npm run build-storybook
npm run test:storybook:build
```

`STORYBOOK_BASE_PATH` configures the static build and the Canvas cell-asset URLs. The application keeps its existing root-relative URLs without any new required environment variable. To check the deployed site instead of starting a local preview:

```sh
STORYBOOK_URL=https://vladislavdegtyarenko.github.io/react-minesweeper/ npm run test:storybook:build
```

GitHub Actions runs lint, TypeScript checking, unit tests, Storybook tests, the static build, and static-site checks on pull requests and `main`. Lint enforces the existing baseline of at most 19 warnings. Only a successful `main` run can deploy to Pages. Repository Pages settings must use **GitHub Actions** as the publishing source. Pull requests do not deploy. The public static site has no background Vitest process; use Actions for automated results or the local Storybook test panel for interactive debugging.

The full application build uses the existing Vercel deployment configuration. To run application browser tests against a deployed preview instead of starting a local server, set `PLAYWRIGHT_BASE_URL` to that preview's URL when running `npm run test:e2e`. This avoids copying hosting credentials into the project folder.

## Storybook walkthrough

1. **Button: inputs and callbacks.** Change a variant and toggle `isDisabled`. The Actions panel records the callback spy, a test function that remembers calls without starting a game. Open `Button.stories.tsx` to see how one play function checks click, Enter, and Space, while the disabled story checks that activation is blocked.
2. **Switch and ToggleGroup: controlled state.** The component receives its current value and reports requested changes through a callback. A small example parent updates that value with React state and responds to Controls changes. No global game setting changes. ToggleGroup’s single-selection items expose radio semantics and `aria-checked`; the example ignores empty values to keep a difficulty selected.
3. **Cell and LevelCard: deterministic rendering.** Cell examples mount the real Canvas board renderer with fixed one-cell boards; LevelCard uses the application difficulty definitions. Controls change cell state and zoom, and the marker example updates local React state. Canvas assets load through the same path helper used by the static deployment. The settings module is replaced before its storage subscriptions execute, so examples do not read a visitor’s saved preferences. The full application Board owns gameplay input.
4. **ContinueBanner: dialogs and focus.** A Radix portal places the dialog outside the component container. Tests query the story document’s body, verify the title and description, wrap focus between buttons, dismiss with Escape, and check that focus returns to the opener. Forwarding Button’s native reference makes that restoration work in the application too. A separate open-dialog story lets the accessibility addon scan the modal state.
5. **ScoreSyncNotice: asynchronous feedback.** The retry example simulates a rejected promise locally. The parent shows a pending message, prevents another submission, catches the failure, and restores an enabled Retry button. Tests wait for observable UI changes rather than sleeping. This proves feedback behavior, not successful server synchronization.
6. **Accessibility and deployment: what the evidence means.** `a11y.test: 'error'` makes detected accessibility violations fail the test command. Keyboard tests cover behavior that a scanner alone cannot prove. Static-site tests catch subpath asset failures that development-server tests would miss. Neither these scans nor the component stories establish that the entire game is accessible; incomplete scan results, screen-reader behavior, and visual layout still need human review.

In an interview, open a play function beside its live story, explain who owns each state change, and show the corresponding Actions run. Be explicit about the mocked boundaries and the checks that still belong to the full application.

## Add another story

Put a typed CSF 3 file beside the component, following an existing example with `Meta`, `StoryObj`, and `satisfies`. CSF is Storybook’s format for describing examples. Reuse the actual component and inputs, describe its purpose and accessible behavior, and add only meaningful controls. Put stateful example wrappers in the component’s `stories/` folder and reusable story helpers in `src/storybook/`.

Add play assertions for behavior that can regress, including disabled and error states. Keep network requests and application storage out of these examples. Run `npm run typecheck`, `npm run lint`, and `npm run test:storybook` before opening a pull request. Paid screenshot-comparison services and full-game Storybook scenarios are outside the current scope.
