import { type TBoard } from '../../types';

export const revealBoard = (board: TBoard, highlightWin?: boolean) => {
  board.forEach((row) => {
    row.forEach((cell) => {
      if (cell.value === 'mine' && !cell.isFlagged) {
        // Open non-flagged mines
        cell.isOpened = true;

        if (highlightWin) {
          // Highlight mines on win
          cell.highlight = 'green';
        }
      }
    });
  });
};
