import { CELL_MARKERS } from '@/config';
import type { GameCell, TBoard } from '@/types';

const describeCell = (cell: GameCell, isGameLost: boolean): string => {
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

export const getBoardCanvasAccessibleLabel = ({
  board,
  isGameLost,
}: {
  board: TBoard;
  isGameLost: boolean;
}): string => {
  const rows = board.length;
  const cols = board[0]?.length ?? 0;
  const rowDescriptions = board.map(
    (row, rowIndex) =>
      `Row ${rowIndex + 1}: ${row
        .map((cell) => describeCell(cell, isGameLost))
        .join(', ')}`,
  );

  return [
    `Minesweeper board, ${rows} rows by ${cols} columns.`,
    ...rowDescriptions,
  ].join(' ');
};
