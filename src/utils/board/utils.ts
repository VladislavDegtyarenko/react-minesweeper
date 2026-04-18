import { CELL_MARKERS } from '@/constants';
import type { CellMarkerState } from '@/types';
import type { BoardState, CellView } from './types';

export const getCellIndex = (row: number, col: number, cols: number) => {
  return row * cols + col;
};

export const getCellCoordinates = (index: number, cols: number) => {
  return {
    row: Math.floor(index / cols),
    col: index % cols,
  };
};

export const getNeighborIndexes = (
  index: number,
  rows: number,
  cols: number,
) => {
  const { row, col } = getCellCoordinates(index, cols);
  const neighborIndexes: number[] = [];

  for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
    for (let colOffset = -1; colOffset <= 1; colOffset++) {
      if (rowOffset === 0 && colOffset === 0) {
        continue;
      }

      const nextRow = row + rowOffset;
      const nextCol = col + colOffset;

      if (
        nextRow < 0 ||
        nextRow >= rows ||
        nextCol < 0 ||
        nextCol >= cols
      ) {
        continue;
      }

      neighborIndexes.push(getCellIndex(nextRow, nextCol, cols));
    }
  }

  return neighborIndexes;
};

export const buildCellView = (
  board: Pick<
    BoardState,
    | 'cols'
    | 'highlights'
    | 'incorrectFlags'
    | 'isLayoutReady'
    | 'markers'
    | 'mines'
    | 'numbers'
    | 'opened'
  >,
  index: number,
): CellView => {
  const { row, col } = getCellCoordinates(index, board.cols);
  const isMine = board.isLayoutReady && board.mines[index];

  return {
    index,
    row,
    col,
    value: isMine ? 'mine' : board.isLayoutReady ? board.numbers[index] : null,
    isMine,
    isOpened: board.opened[index],
    marker: board.markers[index],
    highlight: board.highlights[index],
    showIncorrectFlag: board.incorrectFlags[index],
  };
};

export const createCellViews = (
  board: Pick<
    BoardState,
    | 'cols'
    | 'highlights'
    | 'incorrectFlags'
    | 'isLayoutReady'
    | 'markers'
    | 'mines'
    | 'numbers'
    | 'opened'
  >,
) => {
  return board.opened.map((_, index) => buildCellView(board, index));
};

export const updateCellViews = (
  board: BoardState,
  touchedIndexes: number[],
) => {
  if (touchedIndexes.length === 0) {
    return board.cellViews;
  }

  const nextCellViews = [...board.cellViews];
  const uniqueIndexes = new Set(touchedIndexes);

  uniqueIndexes.forEach((index) => {
    nextCellViews[index] = buildCellView(board, index);
  });

  return nextCellViews;
};

export const countCorrectFlags = (
  markers: CellMarkerState[],
  mines: boolean[],
) => {
  let correctFlagCount = 0;

  for (let index = 0; index < markers.length; index++) {
    if (markers[index] === CELL_MARKERS.FLAG && mines[index]) {
      correctFlagCount++;
    }
  }

  return correctFlagCount;
};
