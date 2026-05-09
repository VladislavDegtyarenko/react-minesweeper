import type { PointerEvent } from 'react';
import { CELL_SELECTOR, CELL_SIZE_REM } from './constants';

export const getCellSize = (zoom: number) => `${CELL_SIZE_REM * zoom}rem`;

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
