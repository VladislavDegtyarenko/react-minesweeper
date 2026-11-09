import { CELL_MARKERS } from '@/config';
import type { GameCell } from '@/types';

export const describeBoardCell = (cell: GameCell, isGameLost: boolean): string => {
  const isMine = cell.value === 'mine';

  if (isGameLost && cell.marker === CELL_MARKERS.FLAG && !isMine) {
    return 'incorrect flag';
  }

  if (!cell.isOpened) {
    if (cell.marker === CELL_MARKERS.FLAG) {
      return 'flag';
    }

    if (cell.marker === CELL_MARKERS.QUESTION) {
      return 'question';
    }

    return 'closed';
  }

  if (isMine) {
    return 'mine';
  }

  if (cell.value === 0) {
    return 'empty';
  }

  return String(cell.value);
};
