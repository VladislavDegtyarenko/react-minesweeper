import type {
  BoardCellCoordinates,
  BoardClientPoint,
  BoardClientRect,
  BoardGridSize,
} from './types';

type CellGeometryOptions = BoardCellCoordinates &
  BoardGridSize & {
    surfaceRect: BoardClientRect;
  };

type HitTestOptions = BoardClientPoint &
  BoardGridSize & {
    surfaceRect: BoardClientRect;
  };

const isPositiveInteger = (value: number) =>
  Number.isInteger(value) && value > 0;

const isValidGrid = ({ rows, cols }: BoardGridSize) =>
  isPositiveInteger(rows) && isPositiveInteger(cols);

const isValidSurfaceRect = ({ width, height }: BoardClientRect) =>
  Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0;

const isCellWithinGrid = ({
  rowIndex,
  cellIndex,
  rows,
  cols,
}: BoardCellCoordinates & BoardGridSize) =>
  Number.isInteger(rowIndex) &&
  Number.isInteger(cellIndex) &&
  rowIndex >= 0 &&
  rowIndex < rows &&
  cellIndex >= 0 &&
  cellIndex < cols;

export const getBoardGridSize = (
  surfaceElement: HTMLElement,
): BoardGridSize | null => {
  const rows = Number(surfaceElement.dataset.boardRows);
  const cols = Number(surfaceElement.dataset.boardCols);
  const gridSize = { rows, cols };

  return isValidGrid(gridSize) ? gridSize : null;
};

export const getBoardCellFromClientPoint = ({
  clientX,
  clientY,
  rows,
  cols,
  surfaceRect,
}: HitTestOptions): BoardCellCoordinates | null => {
  if (!isValidGrid({ rows, cols }) || !isValidSurfaceRect(surfaceRect)) {
    return null;
  }

  const relativeX = clientX - surfaceRect.left;
  const relativeY = clientY - surfaceRect.top;

  if (
    relativeX < 0 ||
    relativeY < 0 ||
    relativeX >= surfaceRect.width ||
    relativeY >= surfaceRect.height
  ) {
    return null;
  }

  return {
    rowIndex: Math.floor((relativeY / surfaceRect.height) * rows),
    cellIndex: Math.floor((relativeX / surfaceRect.width) * cols),
  };
};

export const getBoardCellClientRect = ({
  rowIndex,
  cellIndex,
  rows,
  cols,
  surfaceRect,
}: CellGeometryOptions): BoardClientRect | null => {
  if (
    !isValidGrid({ rows, cols }) ||
    !isValidSurfaceRect(surfaceRect) ||
    !isCellWithinGrid({ rowIndex, cellIndex, rows, cols })
  ) {
    return null;
  }

  const cellWidth = surfaceRect.width / cols;
  const cellHeight = surfaceRect.height / rows;
  const left = surfaceRect.left + cellIndex * cellWidth;
  const top = surfaceRect.top + rowIndex * cellHeight;

  return {
    top,
    left,
    width: cellWidth,
    height: cellHeight,
    bottom: top + cellHeight,
    right: left + cellWidth,
  };
};

export const getBoardCellGroupClientRect = ({
  cells,
  rows,
  cols,
  surfaceRect,
}: BoardGridSize & {
  cells: BoardCellCoordinates[];
  surfaceRect: BoardClientRect;
}): BoardClientRect | null => {
  const rects = cells
    .map(({ rowIndex, cellIndex }) =>
      getBoardCellClientRect({
        rowIndex,
        cellIndex,
        rows,
        cols,
        surfaceRect,
      }),
    )
    .filter((rect): rect is BoardClientRect => rect !== null);

  if (rects.length === 0) {
    return null;
  }

  const top = Math.min(...rects.map((rect) => rect.top));
  const left = Math.min(...rects.map((rect) => rect.left));
  const right = Math.max(...rects.map((rect) => rect.right));
  const bottom = Math.max(...rects.map((rect) => rect.bottom));

  return {
    top,
    left,
    width: right - left,
    height: bottom - top,
    right,
    bottom,
  };
};
