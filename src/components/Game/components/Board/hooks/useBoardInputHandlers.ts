import type { GameStatus } from '@/store/game/store';
import {
  beginBoardInteraction,
  endBoardInteraction,
  resetBoardInteraction,
} from '@/components/Game/utils/boardInteraction';
import {
  useCallback,
  useEffect,
  useRef,
  type PointerEvent,
  type RefObject,
} from 'react';
import { useBoardCanvasInteractionState } from './useBoardCanvasInteractionState';
import { useBoardPinchZoom } from './useBoardPinchZoom';
import { useBoardPointerHandlers } from './useBoardPointerHandlers';
import { useBoardTouchDefaultSuppression } from './useBoardTouchDefaultSuppression';

type UseBoardInputHandlersOptions = {
  boardRef: RefObject<HTMLDivElement>;
  bleedFrameRef: RefObject<HTMLElement>;
  contentRef: RefObject<HTMLDivElement>;
  gameStatus: GameStatus;
  layoutKey: string;
  pinchSurfaceRef: RefObject<HTMLElement>;
  surfaceRef: RefObject<HTMLElement>;
};

export function useBoardInputHandlers({
  boardRef,
  bleedFrameRef,
  contentRef,
  gameStatus,
  layoutKey,
  pinchSurfaceRef,
  surfaceRef,
}: UseBoardInputHandlersOptions) {
  const isInteractive = gameStatus === 'playing' || gameStatus === 'idle';
  const {
    clearInteractionState,
    clearHoveredCell,
    hoverSnapRevision,
    hoveredCell,
    pressSnapRevision,
    pressedCell,
    snapPressedCell,
    trackPointerDown,
    trackPointerEnd,
    trackPointerMove,
  } = useBoardCanvasInteractionState({
    layoutKey,
    surfaceRef,
  });
  const {
    cancelTrackedPointer,
    onContextMenu,
    onPointerEvent,
    throttledPointerMove,
  } = useBoardPointerHandlers({
    gameStatus,
    surfaceRef,
  });
  const {
    onPointerCancel: onPinchPointerCancel,
    onPointerDown: onPinchPointerDown,
    onPointerMove: onPinchPointerMove,
    onPointerUp: onPinchPointerUp,
  } = useBoardPinchZoom({
    boardRef,
    bleedFrameRef,
    contentRef,
    pinchSurfaceRef,
  });
  const activeInteractionPointersRef = useRef(new Set<number>());

  useBoardTouchDefaultSuppression({ boardRef });

  const beginTrackedBoardInteraction = useCallback((pointerId: number) => {
    if (activeInteractionPointersRef.current.has(pointerId)) {
      return undefined;
    }

    activeInteractionPointersRef.current.add(pointerId);
    beginBoardInteraction();

    return undefined;
  }, []);

  const endTrackedBoardInteraction = useCallback((pointerId: number) => {
    if (!activeInteractionPointersRef.current.delete(pointerId)) {
      return undefined;
    }

    endBoardInteraction();

    return undefined;
  }, []);

  useEffect(
    () => () => {
      activeInteractionPointersRef.current.clear();
      resetBoardInteraction();
    },
    [],
  );

  useEffect(() => {
    if (!isInteractive) {
      clearInteractionState();
    }
  }, [clearInteractionState, isInteractive]);

  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (isInteractive) {
        trackPointerDown(event);
        beginTrackedBoardInteraction(event.pointerId);
      } else {
        clearInteractionState();
      }

      if (onPinchPointerDown(event) || !isInteractive) {
        if (event.pointerType === 'touch') {
          snapPressedCell();
        }

        return undefined;
      }

      onPointerEvent(event);

      return undefined;
    },
    [
      beginTrackedBoardInteraction,
      clearInteractionState,
      isInteractive,
      onPinchPointerDown,
      onPointerEvent,
      snapPressedCell,
      trackPointerDown,
    ],
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (onPinchPointerMove(event)) {
        snapPressedCell();

        return undefined;
      }

      if (!isInteractive) {
        clearInteractionState();
        cancelTrackedPointer(event.pointerId);

        return undefined;
      }

      trackPointerMove(event);
      throttledPointerMove(event);

      return undefined;
    },
    [
      cancelTrackedPointer,
      clearInteractionState,
      isInteractive,
      onPinchPointerMove,
      snapPressedCell,
      throttledPointerMove,
      trackPointerMove,
    ],
  );

  const handlePointerUp = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      trackPointerEnd(event);
      endTrackedBoardInteraction(event.pointerId);

      if (onPinchPointerUp(event) || !isInteractive) {
        cancelTrackedPointer(event.pointerId);

        return undefined;
      }

      onPointerEvent(event);

      return undefined;
    },
    [
      cancelTrackedPointer,
      endTrackedBoardInteraction,
      isInteractive,
      onPinchPointerUp,
      onPointerEvent,
      trackPointerEnd,
    ],
  );

  const handlePointerCancel = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      trackPointerEnd(event);
      endTrackedBoardInteraction(event.pointerId);

      if (onPinchPointerCancel(event) || !isInteractive) {
        cancelTrackedPointer(event.pointerId);

        return undefined;
      }

      onPointerEvent(event);

      return undefined;
    },
    [
      cancelTrackedPointer,
      endTrackedBoardInteraction,
      isInteractive,
      onPinchPointerCancel,
      onPointerEvent,
      trackPointerEnd,
    ],
  );

  const handlePointerLeave = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      clearInteractionState();

      if (event.pointerType === 'mouse') {
        endTrackedBoardInteraction(event.pointerId);
        cancelTrackedPointer(event.pointerId);
      }

      return undefined;
    },
    [cancelTrackedPointer, clearInteractionState, endTrackedBoardInteraction],
  );

  return {
    hoverSnapRevision,
    hoveredCell,
    onContextMenu: isInteractive ? onContextMenu : undefined,
    onPointerCancel: handlePointerCancel,
    onPointerDown: handlePointerDown,
    onPointerLeave: handlePointerLeave,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
    onScroll: clearHoveredCell,
    pressSnapRevision,
    pressedCell,
  };
}
