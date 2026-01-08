export type DebouncedFn<T extends (...args: unknown[]) => void> = ((
  ...args: Parameters<T>
) => void) & {
  cancel: () => void;
};

export const debounce = <T extends (...args: unknown[]) => void>(
  fn: T,
  delay = 150,
): DebouncedFn<T> => {
  let timer: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<T>) => {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      fn(...args);
    }, delay);
  };

  debounced.cancel = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  return debounced as DebouncedFn<T>;
};
