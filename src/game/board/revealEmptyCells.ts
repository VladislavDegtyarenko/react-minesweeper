import { CELL_MARKERS, DIRECTIONS } from '@/config';
import { type GameCell, type TBoard } from '@/types';

// BFS on the original board (read-only).
// Returns every [row, col] position that should be opened in this cascade,
// including the starting cell. Caller is responsible for applying the changes.
export const revealEmptyCells = (
  board: TBoard,
  rows: number,
  cols: number,
  row: number,
  col: number,
): Array<[number, number]> => {
  const toReveal: Array<[number, number]> = [[row, col]];
  // Track enqueued positions by flat index to prevent duplicates without extra allocations.
  const enqueued = new Uint8Array(rows * cols);
  enqueued[row * cols + col] = 1;
  let head = 0;

  while (head < toReveal.length) {
    const [currentRow, currentCol] = toReveal[head++];
    const cell = board[currentRow][currentCol];

    if (cell.value === 0) {
      for (const [dRow, dCol] of DIRECTIONS) {
        const newRow = currentRow + dRow;
        const newCol = currentCol + dCol;

        if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
          const flatIdx = newRow * cols + newCol;
          const neighbor = board[newRow][newCol];
          if (!enqueued[flatIdx] && !neighbor.isOpened && neighbor.marker !== CELL_MARKERS.FLAG) {
            enqueued[flatIdx] = 1;
            toReveal.push([newRow, newCol]);
          }
        }
      }
    }
  }

  return toReveal;
};

// Applies a list of positions to open onto the board using targeted shallow
// cloning. Unchanged rows and cells keep their exact object references,
// preserving Immer-style structural sharing for Zustand selector stability.
export const applyOpenedCells = (
  board: TBoard,
  positions: Array<[number, number]>,
): TBoard => {
  // Group changed columns by row for a single O(positions) pass.
  const rowChanges = new Map<number, Set<number>>();
  for (const [r, c] of positions) {
    let cols = rowChanges.get(r);
    if (!cols) { cols = new Set(); rowChanges.set(r, cols); }
    cols.add(c);
  }

  return board.map((boardRow, r) => {
    const changedCols = rowChanges.get(r);
    if (!changedCols) return boardRow; // unchanged row — reuse reference

    return boardRow.map((cell, c) => {
      if (!changedCols.has(c)) return cell; // unchanged cell — reuse reference
      // Open the cell. Cast needed because TS discriminant narrowing prevents
      // assigning isOpened:true on a type narrowed to isOpened:false.
      return { ...cell, isOpened: true, marker: null } as unknown as GameCell;
    });
  }) as TBoard;
};
