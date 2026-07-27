import type { CSSProperties, PointerEvent } from 'react';
import { CELL_GAP_PX, CELL_SIZE_REM } from './constants';
import { getBoardCellFromClientPoint, getBoardGridSize } from './geometry';

const formatCssNumber = (value: number): number => Number(value.toFixed(6));

const getBoardCanvasAxisSize = (cellCount: number, zoom: number): string => {
  const cellsRem = formatCssNumber(cellCount * CELL_SIZE_REM * zoom);
  const gapsPx = formatCssNumber(cellCount * CELL_GAP_PX * zoom);

  return `calc(${cellsRem}rem + ${gapsPx}px)`;
};

export const getBoardCanvasStyle = ({
  cols,
  rows,
  zoom,
}: {
  cols: number;
  rows: number;
  zoom: number;
}): CSSProperties => ({
  height: getBoardCanvasAxisSize(rows, zoom),
  width: getBoardCanvasAxisSize(cols, zoom),
});

export const getRowAndCellIndex = (
  e: PointerEvent<HTMLDivElement>,
  surfaceElement: HTMLElement,
): { rowIndex: number; cellIndex: number } | undefined => {
  const gridSize = getBoardGridSize(surfaceElement);

  if (!gridSize) {
    return undefined;
  }

  return (
    getBoardCellFromClientPoint({
      clientX: e.clientX,
      clientY: e.clientY,
      ...gridSize,
      surfaceRect: surfaceElement.getBoundingClientRect(),
    }) ?? undefined
  );
};
