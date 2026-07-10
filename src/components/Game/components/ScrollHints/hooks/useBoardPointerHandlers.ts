import type { GameStatus } from '@/store/game/store';
import { throttle } from '@/utils';
import { handleCellInteraction } from '@/game/board';
import type { MouseEvent, PointerEvent } from 'react';
import { useEffect, useRef } from 'react';
import { getRowAndCellIndex } from '../../Board/utils';

const POINTER_MOVE_THROTTLE_MS = 100;

type UseBoardPointerHandlersOptions = {
  gameStatus: GameStatus;
};

/**
 * Returns pointer/context-menu handlers for the board's scrollable area.
 * The pointer-move handler is throttled and stable across re-renders so the
 * throttle state survives status changes.
 */
export const useBoardPointerHandlers = ({
  gameStatus,
}: UseBoardPointerHandlersOptions) => {
  const onPointerEvent = (e: PointerEvent<HTMLDivElement>) => {
    const indexes = getRowAndCellIndex(e);

    if (!indexes) {
      return undefined;
    }

    if (gameStatus === 'paused') {
      e.preventDefault();

      return undefined;
    }

    const { rowIndex, cellIndex } = indexes;

    handleCellInteraction({
      e: e.nativeEvent as unknown as globalThis.PointerEvent,
      row: rowIndex,
      col: cellIndex,
    });
  };

  // Keep a ref to the latest onPointerEvent so the throttled handler always
  // calls the current closure without being recreated on every render.
  const onPointerEventRef = useRef(onPointerEvent);
  useEffect(() => {
    onPointerEventRef.current = onPointerEvent;
  });

  // Created once; never re-instantiated, so throttle state survives re-renders.
  const throttledPointerMove = useRef(
    throttle(
      (e: PointerEvent<HTMLDivElement>) => onPointerEventRef.current(e),
      POINTER_MOVE_THROTTLE_MS,
    ),
  ).current;

  const onContextMenu = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();

    const indexes = getRowAndCellIndex(
      e as unknown as PointerEvent<HTMLDivElement>,
    );

    if (!indexes) {
      return undefined;
    }

    if (gameStatus === 'paused') {
      return undefined;
    }

    const { rowIndex, cellIndex } = indexes;

    handleCellInteraction({
      e: e.nativeEvent as unknown as globalThis.PointerEvent,
      row: rowIndex,
      col: cellIndex,
    });
  };

  return { onContextMenu, onPointerEvent, throttledPointerMove };
};
