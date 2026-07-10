# Code Style Guide

This file is the source of truth for code style and styling rules. Read it before code changes and code review.

Rules describe the target state for new and edited code. Do not refactor existing violations opportunistically — fix them only when a task already touches that code.

## Imports

- Use the `@/` alias (maps to `src/`) for anything outside the current component folder. Use relative paths only within a component's own folder.

```typescript
// Good
import { useGameStore } from '@/store/game';
import styles from './styles.module.scss';

// Avoid
import { useGameStore } from '../../store/game';
```

## File & Folder Layout

- One React component per file. Folder per component, named after the component:

```text
ComponentName/
  index.tsx             # the component; default export named ComponentName
  styles.module.scss    # styles for this component only
  components/           # sub-components used only here (same layout, recursive)
  hooks/                # hooks used only by this component
  constants.ts          # exported constants
  types.ts              # exported type definitions
  utils.ts              # small set of local helpers
  utils/                # if helpers outgrow one file; expose via utils/index.ts
                        # and import from the folder entrypoint
```

- Only `index.tsx` and `styles.module.scss` are required; add the rest when needed.
- Generic reusable helpers live in `src/utils/` — one file per function, re-exported through `src/utils/index.ts`.
- Shared hooks live in `src/hooks/` with a brief JSDoc line. Shared UI primitives live in `src/components/ui/`.
- Keep the code reusable: when the same logic appears in a second module, extract it to the nearest shared `utils` location instead of copying it.

## React

- Prefer arrow-function components with `export default ComponentName` at the end of the file.
- Hooks use named exports: `export function useSomething()`.
- Props: name the type `Props` when local, `ComponentNameProps` when exported. Destructure props in the parameter list or on the first line of the component.
- Prefer `PropsWithChildren` over a manual `children: ReactNode` unless an explicit `ReactNode` prop is needed.
- Keep components under ~120 lines. When a component grows beyond that, extract a sub-component (`components/`), a hook (`hooks/`), or helpers (`utils.ts`) before adding more.
- Combine class names with `createCx` from `@/utils` (a `classnames/bind` wrapper):

```typescript
const cx = createCx(styles);
// <div className={cx('cell', { revealed: isRevealed })} />
```

## TypeScript

- Use `type` aliases; do not use `interface`. Exception: module augmentation in `src/types/*.d.ts`, where declaration merging is required.
- Use SCREAMING_SNAKE_CASE for constants and read-only definitions; put exported ones in `constants.ts`.
- Put exported type definitions in `types.ts`.
- Use single quotes in JS/TS/TSX.

## Returns

- Put an empty line before a `return` statement, except when it is the only statement in its scope:

```typescript
// Good
const getLabel = (count: number) => {
  const label = formatCount(count);

  return label;
};

// Good — only statement in its scope, no blank line needed
if (!isInitialized) {
  return null;
}
```

- No bare `return;` — return `undefined` explicitly in functions and `null` in React components.

## SCSS & Styling

- Each component owns its `styles.module.scss`. When a sub-component has dedicated styles, its stylesheet lives next to the sub-component in the local `components/` folder — not in the parent stylesheet. (Older components still import the parent stylesheet; leave them unless you are already editing them.)
- Prefer nested SCSS rules over repeating flat selectors.
- Do not add `min-width: 0`, fixed `width`/`height`, or `min-*`/`max-*` width/height values unless the user explicitly asks for it or an unavoidable third-party override requires it. Prefer fluid layout: flex/grid behavior, intrinsic sizing, padding, gap, and `aspect-ratio`.
