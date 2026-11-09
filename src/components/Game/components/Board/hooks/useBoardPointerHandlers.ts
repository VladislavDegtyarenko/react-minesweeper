import type { GameStatus } from '@/store/game/store';
import { throttle } from '@/utils';
import { cancelCellPointerSequence, handleCellInteraction } from '@/game/board';
import type { BoardCellCoordinates } from '@/components/Game/components/Board/types';
import type { MouseEvent, PointerEvent, RefObject } from 'react';
import { useEffect, useRef } from 'react';
import { getRowAndCellIndex } from '../utils';

const POINTER_MOVE_THROTTLE_MS = 100;

type UseBoardPointerHandlersOptions = {
  gameStatus: GameStatus;
  surfaceRef: RefObject<HTMLElement>;
};

/**
 * Returns pointer/context-menu handlers for the board's scrollable area.
 * The pointer-move handler is throttled and stable across re-renders so the
 * throttle state survives status changes.
 */
export function useBoardPointerHandlers({
  gameStatus,
  surfaceRef,
}: UseBoardPointerHandlersOptions) {
  const touchStartCellsRef = useRef(new Map<number, BoardCellCoordinates>());

  const cancelTrackedPointer = (pointerId: number) => {
    touchStartCellsRef.current.delete(pointerId);
    cancelCellPointerSequence();
  };

  const onPointerEvent = (e: PointerEvent<HTMLDivElement>) => {
    const surfaceElement = surfaceRef.current;
    const hitCell = surfaceElement
      ? getRowAndCellIndex(e, surfaceElement)
      : undefined;
    const isTouch = e.pointerType === 'touch';
    const isPointerDown = e.type === 'pointerdown';
    const isPointerEnd = e.type === 'pointerup' || e.type === 'pointercancel';
    let indexes = hitCell;

    if (isTouch && isPointerDown) {
      if (!hitCell) {
        return undefined;
      }

      touchStartCellsRef.current.set(e.pointerId, hitCell);
    } else if (isTouch) {
      const startCell = touchStartCellsRef.current.get(e.pointerId);

      if (!startCell) {
        return undefined;
      }

      if (!hitCell) {
        cancelTrackedPointer(e.pointerId);

        return undefined;
      }

      indexes = startCell;
    }

    if (!indexes) {
      return undefined;
    }

    if (gameStatus === 'paused') {
      if (isTouch) {
        cancelTrackedPointer(e.pointerId);
      }

      e.preventDefault();

      return undefined;
    }

    const { rowIndex, cellIndex } = indexes;

    handleCellInteraction({
      e: e.nativeEvent as unknown as globalThis.PointerEvent,
      row: rowIndex,
      col: cellIndex,
    });

    if (isTouch && isPointerEnd) {
      touchStartCellsRef.current.delete(e.pointerId);
    }
  };

  // Keep a ref to the latest onPointerEvent so the throttled handler always
  // calls the current closure without being recreated on every render.
  const onPointerEventRef = useRef(onPointerEvent);
  useEffect(() => {
    onPointerEventRef.current = onPointerEvent;
  });

  useEffect(
    () => () => {
      touchStartCellsRef.current.clear();
    },
    [],
  );

  // Created once; never re-instantiated, so throttle state survives re-renders.
  const throttledPointerMove = useRef(
    throttle(
      (e: PointerEvent<HTMLDivElement>) => onPointerEventRef.current(e),
      POINTER_MOVE_THROTTLE_MS,
    ),
  ).current;

  const onContextMenu = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();

    const surfaceElement = surfaceRef.current;
    const indexes = surfaceElement
      ? getRowAndCellIndex(
          e as unknown as PointerEvent<HTMLDivElement>,
          surfaceElement,
        )
      : undefined;

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

  return {
    cancelTrackedPointer,
    onContextMenu,
    onPointerEvent,
    throttledPointerMove,
  };
}
