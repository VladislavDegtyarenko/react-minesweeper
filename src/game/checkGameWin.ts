// Win condition: All non-mine cells are opened, or all mines are correctly flagged.
// Uses O(1) counters maintained incrementally in the store instead of scanning the board.
export const checkGameWin = (
  openedSafeCells: number,
  totalSafeCells: number,
  correctlyFlaggedMines: number,
  totalMines: number,
): boolean =>
  openedSafeCells === totalSafeCells || correctlyFlaggedMines === totalMines;
