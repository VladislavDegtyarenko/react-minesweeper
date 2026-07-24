import type { CSSProperties, PointerEvent } from 'react';
import {
  CELL_BORDER_WIDTH_PX,
  CELL_GAP_PX,
  CELL_HIT_INSET_PX,
  CELL_SELECTOR,
  CELL_SIZE_REM,
} from './constants';

export const getCellSize = (zoom: number) => `${CELL_SIZE_REM * zoom}rem`;

// Pinch-zoom previews the board with a single transform: scale(), which
// scales every rendered pixel uniformly - including the gap/inset/border
// widths below, even though they're normally fixed px values. Without this,
// committing the zoom (which only resizes --cell-size) makes those fixed
// values visually "snap" back to their unscaled size. Scaling them here too
// keeps the committed board consistent with what the pinch preview showed.
export const getCellGapVars = (zoom: number): CSSProperties =>
  ({
    '--board-cell-gap': `${CELL_GAP_PX * zoom}px`,
    '--board-cell-hit-inset': `${CELL_HIT_INSET_PX * zoom}px`,
    '--cell-border-width': `${CELL_BORDER_WIDTH_PX * zoom}px`,
  }) as CSSProperties;

export const getRowAndCellIndex = (
  e: PointerEvent<HTMLDivElement>,
): { rowIndex: number; cellIndex: number } | undefined => {
  const element = e.target as HTMLElement;
  const cellElement = element.closest(CELL_SELECTOR);

  if (!cellElement || !(cellElement instanceof HTMLElement)) {
    return undefined;
  }

  const { row, cell } = cellElement.dataset;

  if (!row || !cell) {
    return undefined;
  }

  const rowIndex = parseInt(row);
  const cellIndex = parseInt(cell);

  if (isNaN(rowIndex) || isNaN(cellIndex)) {
    return undefined;
  }

  return { rowIndex, cellIndex };
};
