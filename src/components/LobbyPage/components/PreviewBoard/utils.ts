import { CELL_MARKERS, DIRECTIONS } from '@/constants';
import type { GameCell, Level, TBoard } from '@/types';
import { PREVIEW_BOARDS } from '../../constants';

type PreviewPoint = {
  row: number;
  col: number;
};

const createRandom = (seed: number) => {
  let state = seed;

  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;

    return state / 4294967296;
  };
};

const shufflePoints = (points: PreviewPoint[], seed: number): PreviewPoint[] => {
  const random = createRandom(seed);
  const shuffled = [...points];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    const current = shuffled[index];
    shuffled[index] = shuffled[swapIndex];
    shuffled[swapIndex] = current;
  }

  return shuffled;
};

const createPointKey = (point: PreviewPoint): string => {
  return `${point.row}:${point.col}`;
};

const createPointSet = (points: PreviewPoint[]): Set<string> => {
  return new Set(points.map(createPointKey));
};

const createMineCell = (): GameCell => {
  return {
    isOpened: false,
    marker: null,
    value: 'mine',
  };
};

const createSafeCell = (value: number, isOpened: boolean): GameCell => {
  if (isOpened) {
    return {
      isOpened: true,
      marker: null,
      value,
    };
  }

  return {
    isOpened: false,
    marker: null,
    value,
  };
};

const createFlagCell = (): GameCell => {
  return {
    isOpened: false,
    marker: CELL_MARKERS.FLAG,
    value: 'mine',
  };
};

const isInsideBoard = (
  level: Level,
  rowIndex: number,
  cellIndex: number,
): boolean => {
  const isInsideRows = rowIndex >= 0 && rowIndex < level.rows;
  const isInsideCols = cellIndex >= 0 && cellIndex < level.cols;

  return isInsideRows && isInsideCols;
};

const countAdjacentMines = (
  level: Level,
  mineKeys: Set<string>,
  rowIndex: number,
  cellIndex: number,
): number => {
  return DIRECTIONS.reduce((count, [rowOffset, cellOffset]) => {
    const row = rowIndex + rowOffset;
    const col = cellIndex + cellOffset;

    if (!isInsideBoard(level, row, col)) {
      return count;
    }

    return mineKeys.has(createPointKey({ row, col })) ? count + 1 : count;
  }, 0);
};

const createAllPoints = (level: Level): PreviewPoint[] => {
  return Array.from({ length: level.rows }, (_, row) =>
    Array.from({ length: level.cols }, (_, col) => ({ row, col })),
  ).flat();
};

export const createPreviewBoard = (level: Level): TBoard => {
  const preview = PREVIEW_BOARDS[level.id];
  const points = shufflePoints(createAllPoints(level), preview.seed);
  const mines = points.slice(0, level.totalMines);
  const safeCells = points.slice(level.totalMines);
  const flagKeys = createPointSet(mines.slice(0, preview.flags));
  const openedSafeKeys = createPointSet(
    safeCells.slice(0, preview.openedSafeCells),
  );
  const mineKeys = createPointSet(mines);

  return Array.from({ length: level.rows }, (_, rowIndex) =>
    Array.from({ length: level.cols }, (_, cellIndex) => {
      const point = { row: rowIndex, col: cellIndex };
      const pointKey = createPointKey(point);

      if (flagKeys.has(pointKey)) {
        return createFlagCell();
      }

      if (mineKeys.has(pointKey)) {
        return createMineCell();
      }

      return createSafeCell(
        countAdjacentMines(level, mineKeys, rowIndex, cellIndex),
        openedSafeKeys.has(pointKey),
      );
    }),
  );
};
