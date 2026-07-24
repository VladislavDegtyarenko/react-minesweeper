import { useResizeObserver } from '@/hooks';
import { useCallback, useLayoutEffect, useRef } from 'react';
import { markBoardScrollActivity } from '@/components/Game/utils/boardInteraction';
import { DEFAULT_BOARD_SCROLL_HINTS } from '../constants';
import type { BoardScrollHints } from '../types';
import { areBoardScrollHintsEqual, getBoardScrollHints } from '../utils';

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
  const scrollHintsRef = useRef<HTMLDivElement>(null);
  const lastScrollHintsRef = useRef<BoardScrollHints>(
    DEFAULT_BOARD_SCROLL_HINTS,
  );
  const updateFrameRef = useRef<number | null>(null);

  const applyScrollHints = useCallback((scrollHints: BoardScrollHints) => {
    const scrollHintsElement = scrollHintsRef.current;

    if (!scrollHintsElement) {
      return;
    }

    scrollHintsElement.style.setProperty(
      '--scroll-hint-bottom',
      String(scrollHints.bottom),
    );
    scrollHintsElement.style.setProperty(
      '--scroll-hint-left',
      String(scrollHints.left),
    );
    scrollHintsElement.style.setProperty(
      '--scroll-hint-right',
      String(scrollHints.right),
    );
    scrollHintsElement.style.setProperty(
      '--scroll-hint-top',
      String(scrollHints.top),
    );
  }, []);

  const updateScrollHints = useCallback(() => {
    const boardElement = boardRef.current;
    const nextScrollHints = boardElement
      ? getBoardScrollHints(boardElement)
      : DEFAULT_BOARD_SCROLL_HINTS;

    if (
      areBoardScrollHintsEqual(lastScrollHintsRef.current, nextScrollHints)
    ) {
      return;
    }

    lastScrollHintsRef.current = nextScrollHints;
    applyScrollHints(nextScrollHints);
  }, [applyScrollHints]);

  const scheduleScrollHintUpdate = useCallback(() => {
    markBoardScrollActivity();

    if (updateFrameRef.current !== null) {
      return;
    }

    updateFrameRef.current = window.requestAnimationFrame(() => {
      updateFrameRef.current = null;
      updateScrollHints();
    });
  }, [updateScrollHints]);

  useLayoutEffect(() => {
    if (!boardRef.current) {
      return undefined;
    }

    updateScrollHints();
  }, [layoutKey, updateScrollHints]);

  useLayoutEffect(() => {
    const boardElement = boardRef.current;

    if (!boardElement) {
      return undefined;
    }

    boardElement.addEventListener('scroll', scheduleScrollHintUpdate, {
      passive: true,
    });

    return () => {
      boardElement.removeEventListener('scroll', scheduleScrollHintUpdate);
    };
  }, [scheduleScrollHintUpdate]);

  useLayoutEffect(() => {
    return () => {
      if (updateFrameRef.current !== null) {
        window.cancelAnimationFrame(updateFrameRef.current);
        updateFrameRef.current = null;
      }
    };
  }, []);

  useResizeObserver(
    () => {
      const boardElement = boardRef.current;

      return [boardElement, boardElement?.firstElementChild];
    },
    updateScrollHints,
    [layoutKey],
  );

  return { boardRef, scrollHintsRef };
};
