import { CELL_MARKERS } from '@/config';
import { type TBoard } from '../../types';

export const revealBoard = (board: TBoard, highlightWin?: boolean) => {
  board.forEach((row) => {
    row.forEach((cell) => {
      if (cell.value === 'mine') {
        // Open non-flagged mines

        if (cell.marker !== CELL_MARKERS.FLAG) {
          cell.isOpened = true;
        }

        if (highlightWin) {
          // Highlight all mines on win
          cell.highlight = 'green';
        }
      }
    });
  });
};
