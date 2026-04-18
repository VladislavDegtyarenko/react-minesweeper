import type { Level } from '@/types';
import type { BoardLayout, BoardState } from './board/types';
import { createCellViews, getNeighborIndexes } from './board/utils';

const getCellCount = (rows: number, cols: number) => {
  return rows * cols;
};

const createEmptyLayout = (cellCount: number): BoardLayout => {
  return {
    mines: Array.from({ length: cellCount }, () => false),
    numbers: Array.from({ length: cellCount }, () => 0),
  };
};

export const createBoardLayout = (
  level: Omit<Level, 'id' | 'label'>,
  excludedIndex: number,
): BoardLayout => {
  const { rows, cols, totalMines } = level;
  const cellCount = getCellCount(rows, cols);
  const layout = createEmptyLayout(cellCount);
  const candidates: number[] = [];

  for (let index = 0; index < cellCount; index++) {
    if (index !== excludedIndex) {
      candidates.push(index);
    }
  }

  for (let index = 0; index < totalMines; index++) {
    const remainingIndex =
      index + Math.floor(Math.random() * (candidates.length - index));
    const candidate = candidates[remainingIndex];
    candidates[remainingIndex] = candidates[index];
    candidates[index] = candidate;

    layout.mines[candidate] = true;
  }

  for (let index = 0; index < cellCount; index++) {
    if (!layout.mines[index]) {
      continue;
    }

    for (const neighborIndex of getNeighborIndexes(index, rows, cols)) {
      if (!layout.mines[neighborIndex]) {
        layout.numbers[neighborIndex]++;
      }
    }
  }

  return layout;
};

type CreateBoardStateOptions = {
  layout?: BoardLayout | null;
};

export const createBoardState = (
  level: Omit<Level, 'id' | 'label'>,
  options: CreateBoardStateOptions = {},
): BoardState => {
  const { rows, cols, totalMines } = level;
  const cellCount = getCellCount(rows, cols);
  const layout = options.layout ?? null;
  const emptyLayout = layout ?? createEmptyLayout(cellCount);
  const board: BoardState = {
    rows,
    cols,
    totalMines,
    isLayoutReady: Boolean(layout),
    mines: emptyLayout.mines,
    numbers: emptyLayout.numbers,
    opened: Array.from({ length: cellCount }, () => false),
    markers: Array.from({ length: cellCount }, () => null),
    highlights: Array.from({ length: cellCount }, () => null),
    incorrectFlags: Array.from({ length: cellCount }, () => false),
    openedSafeCount: 0,
    correctFlagCount: 0,
    flagsPlaced: 0,
    cellViews: [],
  };

  board.cellViews = createCellViews(board);

  return board;
};
