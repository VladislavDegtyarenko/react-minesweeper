import { CELL_MARKERS } from '@/constants';
import { TBoard } from '../types';

export const checkGameWin = (board: TBoard, totalMines: number) => {
  let unopenedCells = 0;
  let correctlyFlaggedMines = 0;

  board.forEach((row) => {
    row.forEach((cell) => {
      if (!cell.isOpened) {
        unopenedCells++;
      }

      if (cell.marker === CELL_MARKERS.FLAG && cell.value === 'mine') {
        correctlyFlaggedMines++;
      }
    });
  });

  // Win condition: All non-mine cells are opened, or all mines are flagged.
  return unopenedCells === totalMines || correctlyFlaggedMines === totalMines;
};
