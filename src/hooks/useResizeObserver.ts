import { useLayoutEffect, useRef } from 'react';

/**
 * Observes one or more elements with a ResizeObserver and fires `onResize`
 * whenever any of them change size. Safe in SSR environments — the observer
 * is silently skipped when ResizeObserver is unavailable.
 *
 * `getElements` is called inside the layout effect so it can safely read DOM
 * refs that are only populated after mount (e.g. `ref.current`).
 *
 * @param getElements - Factory called on effect run; returns elements to observe
 *                      (nullish entries are ignored).
 * @param onResize - Callback invoked on every resize notification. Wrapped in a
 *                   ref internally so it never needs to be stable.
 * @param deps - Dependency values that should re-run the effect (e.g. a layout
 *               key that signals a structural board change).
 */
export function useResizeObserver(
  getElements: () => (Element | null | undefined)[],
  onResize: () => void,
  deps: unknown[] = [],
): void {
  const onResizeRef = useRef(onResize);
  onResizeRef.current = onResize;

  useLayoutEffect(() => {
    if (typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const elements = getElements().filter(Boolean) as Element[];
    const observer = new ResizeObserver(() => onResizeRef.current());

    for (const el of elements) {
      observer.observe(el);
    }

    return () => {
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
