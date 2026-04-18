import { CELL_MARKERS } from '@/constants';
import type { BoardState } from './types';
import { getNeighborIndexes } from './utils';

type RevealEmptyCellsBoard = Pick<
  BoardState,
  'cols' | 'markers' | 'mines' | 'numbers' | 'opened' | 'rows'
>;

export const revealEmptyCells = (
  board: RevealEmptyCellsBoard,
  startIndex: number,
) => {
  const queue = [startIndex];
  const touchedIndexes: number[] = [];
  let headIndex = 0;

  board.opened[startIndex] = true;
  board.markers[startIndex] = null;
  touchedIndexes.push(startIndex);

  while (headIndex < queue.length) {
    const currentIndex = queue[headIndex];
    headIndex++;

    if (board.numbers[currentIndex] !== 0) {
      continue;
    }

    for (const neighborIndex of getNeighborIndexes(
      currentIndex,
      board.rows,
      board.cols,
    )) {
      if (
        board.mines[neighborIndex] ||
        board.opened[neighborIndex] ||
        board.markers[neighborIndex] === CELL_MARKERS.FLAG
      ) {
        continue;
      }

      board.opened[neighborIndex] = true;
      board.markers[neighborIndex] = null;
      touchedIndexes.push(neighborIndex);

      if (board.numbers[neighborIndex] === 0) {
        queue.push(neighborIndex);
      }
    }
  }

  return touchedIndexes;
};
