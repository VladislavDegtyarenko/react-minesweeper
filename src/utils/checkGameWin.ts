import type { BoardState } from './board/types';

export const checkGameWin = (
  board: Pick<
    BoardState,
    | 'cols'
    | 'correctFlagCount'
    | 'isLayoutReady'
    | 'openedSafeCount'
    | 'rows'
    | 'totalMines'
  >,
) => {
  const totalSafeCells = board.rows * board.cols - board.totalMines;

  return (
    board.openedSafeCount === totalSafeCells ||
    (board.isLayoutReady && board.correctFlagCount === board.totalMines)
  );
};
