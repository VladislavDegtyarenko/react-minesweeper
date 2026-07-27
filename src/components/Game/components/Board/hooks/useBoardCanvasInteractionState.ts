import type { PointerEvent, RefObject } from 'react';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import type { BoardCellCoordinates } from '../types';
import { getRowAndCellIndex } from '../utils';

type PressedPointer = {
  cell: BoardCellCoordinates;
  pointerId: number;
};

const areCellsEqual = (
  first: BoardCellCoordinates | null,
  second: BoardCellCoordinates | null,
) =>
  first?.rowIndex === second?.rowIndex &&
  first?.cellIndex === second?.cellIndex;

const supportsPrimaryHover = () =>
  window.matchMedia?.('(hover: hover)').matches ?? true;

export function useBoardCanvasInteractionState({
  layoutKey,
  surfaceRef,
}: {
  layoutKey: string;
  surfaceRef: RefObject<HTMLElement>;
}) {
  const [hoveredCell, setHoveredCell] = useState<BoardCellCoordinates | null>(
    null,
  );
  const [hoverSnapRevision, setHoverSnapRevision] = useState(0);
  const [pressedPointer, setPressedPointer] = useState<PressedPointer | null>(
    null,
  );
  const pressedPointerRef = useRef<PressedPointer | null>(null);
  const previousLayoutKeyRef = useRef(layoutKey);
  const [pressSnapRevision, setPressSnapRevision] = useState(0);

  const getEventCell = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const surface = surfaceRef.current;

      return surface ? (getRowAndCellIndex(event, surface) ?? null) : null;
    },
    [surfaceRef],
  );

  const trackPointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const cell = getEventCell(event);

      if (!cell) {
        return undefined;
      }

      if (event.pointerType === 'mouse' && supportsPrimaryHover()) {
        setHoveredCell((current) =>
          areCellsEqual(current, cell) ? current : cell,
        );
      } else {
        setHoveredCell(null);

        if (event.pointerType !== 'mouse') {
          setHoverSnapRevision((revision) => revision + 1);
        }
      }

      const nextPressedPointer = {
        cell,
        pointerId: event.pointerId,
      };

      pressedPointerRef.current = nextPressedPointer;
      setPressedPointer(nextPressedPointer);

      return undefined;
    },
    [getEventCell],
  );

  const trackPointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (event.pointerType !== 'mouse' || !supportsPrimaryHover()) {
        return undefined;
      }

      const cell = getEventCell(event);

      setHoveredCell((current) =>
        areCellsEqual(current, cell) ? current : cell,
      );

      return undefined;
    },
    [getEventCell],
  );

  const trackPointerEnd = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (pressedPointerRef.current?.pointerId !== event.pointerId) {
      return undefined;
    }

    pressedPointerRef.current = null;
    setPressedPointer(null);

    return undefined;
  }, []);

  const snapPressedCell = useCallback(() => {
    if (!pressedPointerRef.current) {
      return undefined;
    }

    pressedPointerRef.current = null;
    setPressedPointer(null);
    setPressSnapRevision((revision) => revision + 1);

    return undefined;
  }, []);

  const clearHoveredCell = useCallback(() => {
    setHoveredCell(null);
  }, []);

  const clearInteractionState = useCallback(() => {
    setHoveredCell(null);
    pressedPointerRef.current = null;
    setPressedPointer(null);
  }, []);

  const snapInteractionState = useCallback(() => {
    setHoveredCell(null);
    pressedPointerRef.current = null;
    setPressedPointer(null);
    setHoverSnapRevision((revision) => revision + 1);
    setPressSnapRevision((revision) => revision + 1);
  }, []);

  useLayoutEffect(() => {
    if (previousLayoutKeyRef.current === layoutKey) {
      return undefined;
    }

    previousLayoutKeyRef.current = layoutKey;
    snapInteractionState();
  }, [layoutKey, snapInteractionState]);

  return {
    clearInteractionState,
    clearHoveredCell,
    hoverSnapRevision,
    hoveredCell,
    pressSnapRevision,
    pressedCell: pressedPointer?.cell ?? null,
    snapPressedCell,
    trackPointerDown,
    trackPointerEnd,
    trackPointerMove,
  };
}
