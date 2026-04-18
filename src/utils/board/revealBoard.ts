import { CELL_MARKERS } from '@/constants';
import type { BoardState } from './types';

type RevealBoardBoard = Pick<
  BoardState,
  'highlights' | 'incorrectFlags' | 'markers' | 'mines' | 'opened'
>;

export const revealBoard = (
  board: RevealBoardBoard,
  options?: {
    highlightWin?: boolean;
    markIncorrectFlags?: boolean;
  },
) => {
  const touchedIndexes: number[] = [];
  const { highlightWin = false, markIncorrectFlags = false } = options ?? {};

  for (let index = 0; index < board.mines.length; index++) {
    if (board.mines[index]) {
      if (board.markers[index] !== CELL_MARKERS.FLAG) {
        board.opened[index] = true;
      }

      if (highlightWin) {
        board.highlights[index] = 'green';
      }

      touchedIndexes.push(index);

      continue;
    }

    if (markIncorrectFlags && board.markers[index] === CELL_MARKERS.FLAG) {
      board.incorrectFlags[index] = true;
      touchedIndexes.push(index);
    }
  }

  return touchedIndexes;
};
