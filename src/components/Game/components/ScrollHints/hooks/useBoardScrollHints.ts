import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { throttle } from '@/utils';
import { DEFAULT_BOARD_SCROLL_HINTS } from '../constants';
import type { BoardScrollHints } from '../types';
import { areBoardScrollHintsEqual, getBoardScrollHints } from '../utils';

const SCROLL_THROTTLE_MS = 50;

type UseBoardScrollHintsOptions = {
  /**
   * Opaque key whose change re-runs the resize-observer setup and recomputes
   * hints. Pass a value that captures any layout inputs that affect the
   * board's scroll extent (rows, cols, zoom, available height, etc.).
   */
  layoutKey: unknown;
};

/**
 * Tracks board overflow and reports which edges still have hidden content.
 * Used by mobile fade hints so they disappear at each scroll boundary.
 */
export const useBoardScrollHints = ({
  layoutKey,
}: UseBoardScrollHintsOptions) => {
  const boardRef = useRef<HTMLDivElement>(null);
  const [scrollHints, setScrollHints] = useState<BoardScrollHints>(
    DEFAULT_BOARD_SCROLL_HINTS,
  );

  const updateScrollHints = useCallback(() => {
    const boardElement = boardRef.current;
    const nextScrollHints = boardElement
      ? getBoardScrollHints(boardElement)
      : DEFAULT_BOARD_SCROLL_HINTS;

    setScrollHints((currentScrollHints) =>
      areBoardScrollHintsEqual(currentScrollHints, nextScrollHints)
        ? currentScrollHints
        : nextScrollHints,
    );
  }, []);

  // Throttled scroll handler with leading + trailing edges so the resting
  // hint always reflects the final scroll position. Stored in a ref so the
  // throttle's cooldown state survives re-renders; created once because
  // updateScrollHints is stable (useCallback with []).
  const onScroll = useRef(
    throttle(() => updateScrollHints(), SCROLL_THROTTLE_MS),
  ).current;

  useLayoutEffect(() => {
    const boardElement = boardRef.current;

    if (!boardElement) {
      return undefined;
    }

    updateScrollHints();

    const resizeObserver =
      typeof ResizeObserver === 'undefined'
        ? undefined
        : new ResizeObserver(updateScrollHints);
    const contentElement = boardElement.firstElementChild;

    resizeObserver?.observe(boardElement);

    if (contentElement) {
      resizeObserver?.observe(contentElement);
    }

    window.addEventListener('resize', updateScrollHints);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', updateScrollHints);
    };
  }, [layoutKey, updateScrollHints]);

  return { boardRef, onScroll, scrollHints };
};
