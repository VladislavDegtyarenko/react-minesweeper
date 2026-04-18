import { devtools } from 'zustand/middleware';
import type { StateCreator } from 'zustand';

const isZustandDevtoolsEnabled =
  process.env.NEXT_PUBLIC_ENABLE_ZUSTAND_DEVTOOLS === 'true';

export const withOptionalDevtools = <T>(
  initializer: StateCreator<T, [], []>,
  name: string,
): StateCreator<T, [], []> => {
  if (!isZustandDevtoolsEnabled) {
    return initializer;
  }

  return devtools(initializer, { name }) as unknown as StateCreator<T, [], []>;
};
