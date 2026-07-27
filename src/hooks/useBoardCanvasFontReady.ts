import { useEffect, useRef } from 'react';

/**
 * Runs the latest Canvas redraw callback after document fonts are ready.
 */
export function useBoardCanvasFontReady(onReady: () => void): void {
  const onReadyRef = useRef(onReady);

  onReadyRef.current = onReady;

  useEffect(() => {
    let isMounted = true;

    document.fonts?.ready.then(() => {
      if (isMounted) {
        onReadyRef.current();
      }

      return undefined;
    });

    return () => {
      isMounted = false;
    };
  }, []);
}
