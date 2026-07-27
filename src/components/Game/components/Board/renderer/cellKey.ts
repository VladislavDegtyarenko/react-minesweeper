import type { BoardCellCoordinates } from '../types';

const BOARD_CELL_KEY_PATTERN = /^(\d+):(\d+)$/;

export const getBoardCellAnimationKey = (
  rowIndex: number,
  cellIndex: number,
): string => `${rowIndex}:${cellIndex}`;

export const parseBoardCellAnimationKey = (
  key: string,
): BoardCellCoordinates | null => {
  const match = BOARD_CELL_KEY_PATTERN.exec(key);

  if (!match) {
    return null;
  }

  return {
    rowIndex: Number(match[1]),
    cellIndex: Number(match[2]),
  };
};
