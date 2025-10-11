import { DIRECTIONS } from "../constants";
import { type TBoard } from "../types";

export const revealEmptyCells = (
  board: TBoard,
  rows: number,
  cols: number,
  row: number,
  col: number
) => {
  const queue: [number, number][] = [[row, col]]; // Queue of cell coordinates

  while (queue.length > 0) {
    const [currentRow, currentCol] = queue.shift()!; // Dequeue the next cell

    const cell = board[currentRow][currentCol];
    cell.isOpened = true;

    if (cell.value === 0) {
      for (const [dRow, dCol] of DIRECTIONS) {
        const newRow = currentRow + dRow;
        const newCol = currentCol + dCol;

        if (
          newRow >= 0 &&
          newRow < rows &&
          newCol >= 0 &&
          newCol < cols &&
          !board[newRow][newCol].isOpened &&
          !board[newRow][newCol].isFlagged
        ) {
          queue.push([newRow, newCol]); // Add adjacent empty cells to queue
        }
      }
    }
  }

  return board;
};
