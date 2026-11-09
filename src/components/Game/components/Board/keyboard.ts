import type { BoardCellCoordinates, BoardGridSize } from './types';

/** Moves within the grid without wrapping at row or column boundaries. */
export const getBoardKeyboardTarget = ({
  rowIndex,
  cellIndex,
  rows,
  cols,
  key,
  ctrlKey = false,
}: BoardCellCoordinates &
  BoardGridSize & {
    key: string;
    ctrlKey?: boolean;
  }): BoardCellCoordinates | null => {
  if (
    ![rows, cols].every((size) => Number.isInteger(size) && size > 0) ||
    !Number.isInteger(rowIndex) ||
    !Number.isInteger(cellIndex) ||
    rowIndex < 0 ||
    rowIndex >= rows ||
    cellIndex < 0 ||
    cellIndex >= cols
  ) {
    return null;
  }

  switch (key) {
    case 'ArrowLeft':
      return { rowIndex, cellIndex: Math.max(0, cellIndex - 1) };
    case 'ArrowRight':
      return { rowIndex, cellIndex: Math.min(cols - 1, cellIndex + 1) };
    case 'ArrowUp':
      return { rowIndex: Math.max(0, rowIndex - 1), cellIndex };
    case 'ArrowDown':
      return { rowIndex: Math.min(rows - 1, rowIndex + 1), cellIndex };
    case 'Home':
      return { rowIndex: ctrlKey ? 0 : rowIndex, cellIndex: 0 };
    case 'End':
      return { rowIndex: ctrlKey ? rows - 1 : rowIndex, cellIndex: cols - 1 };
    default:
      return null;
  }
};
