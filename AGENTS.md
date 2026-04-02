# AGENTS

## Rules

- Always put utility functions in a separate `utils` file or `utils/` folder, depending on the local structure of the feature/module.
- Use a single `utils.ts` file only for small local helper sets.
- If utility logic grows into multiple files, move it into a local `utils/` folder.
- In that case, expose the helpers through `utils/index.ts` and import from the folder entrypoint rather than individual utility files unless there is a clear reason not to.
- Prefer `types.ts` for exported type definitions.
- Do not use interfaces.
- Try, but it is not required, to limit React components to 120 lines. If a component grows beyond that, prefer splitting the logic.
- Always put an empty line before a `return` statement, except when it is the only line in the current scope.
- If a component has sub-components used in it, create a local `components/` folder and put them there.
