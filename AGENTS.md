# AGENTS

## Project Context

- For Notion-related project planning and PR/task lookups, use the Notion page `Minesweeper Game to Production`: `https://www.notion.so/2b4ca6160f2b809f9cf8cec286e4242b`.
- The task tracker for this project is the inline Notion database `Tasks Tracker` inside that page.

## Rules

### Code Style

- Always put utility functions in a separate `utils` file or `utils/` folder, depending on the local structure of the feature/module.
- Use a single `utils.ts` file only for small local helper sets.
- If utility logic grows into multiple files, move it into a local `utils/` folder. In that case, expose the helpers through `utils/index.ts` and import from the folder entrypoint rather than individual utility files unless there is a clear reason not to.
- Try to keep the code reusable.

- Prefer `constants.ts` for exported constants definitions.
- For any constants and any read-only definitions, use SCREAMING_SNAKE_CASE.
- Prefer `types.ts` for exported type definitions.
- Do not use interfaces.
- Try, but it is not required, to limit React components to 120 lines. If a component grows beyond that, prefer splitting the logic.
- Always put an empty line before a `return` statement, except when it is the only line in the current scope.
- Do not use empty return statements.
- If a component has sub-components used in it, create a local `components/` folder and put them there.
- Prefer a folder per React component, named after the component. Use `index.tsx` for the React component file inside that folder.
- Use `styles.module.scss` inside the component folder for styles related to that component.
- Store hooks related to a component in a local `hooks/` subfolder inside that component folder.
- Prefer nested SCSS rules over repeating flat selectors when working in `.scss` modules.
- If a component has sub-components with dedicated styles, place those styles in the local `components/` folder next to the sub-component instead of keeping them in the parent component stylesheet.
