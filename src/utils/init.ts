import { DIRECTIONS } from '@/config';
import type { GameCell, Level, TBoard } from '@/types';

type RandomSource = () => number;

const defaultRandom: RandomSource = Math.random;

const createBoard = (rows: number, cols: number) => {
  const board: TBoard = [];

  for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
    board[rowIndex] = [];

    for (let cellIndex = 0; cellIndex < cols; cellIndex++) {
      board[rowIndex][cellIndex] = {
        value: null,
        marker: null,
        isOpened: false,
      };
    }
  }

  return board;
};

const fillBoardWithMines = (
  board: TBoard,
  rows: number,
  cols: number,
  totalMines: number,
  excludeFlatIndex: number | undefined,
  random: RandomSource,
) => {
  const total = rows * cols;

  // Build a flat index array, optionally excluding one cell (e.g. first-click cell).
  // Swap the excluded index to the end so it is never selected by the shuffle.
  const indices = Array.from({ length: total }, (_, i) => i);
  if (excludeFlatIndex !== undefined) {
    const last = total - 1;
    indices[excludeFlatIndex] = indices[last];
    indices[last] = excludeFlatIndex;
  }

  const available = excludeFlatIndex !== undefined ? total - 1 : total;

  // Partial Fisher-Yates shuffle — O(totalMines), no collision retries needed.
  for (let i = 0; i < totalMines; i++) {
    const j = i + Math.floor(random() * (available - i));
    const tmp = indices[i];
    indices[i] = indices[j];
    indices[j] = tmp;

    const r = Math.floor(indices[i] / cols);
    const c = indices[i] % cols;
    (board[r][c] as GameCell).value = 'mine';
  }

  return board;
};

const fillBoardWithNumbers = (board: TBoard) => {
  // const finalBoard: TBoard = JSON.parse(JSON.stringify(boardWithMines));

  board.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell.value !== 'mine') {
        let minesAround = 0;

        DIRECTIONS.forEach(([dRow, dCol]) => {
          const newRow = rowIndex + dRow;
          const newCol = colIndex + dCol;

          if (newRow in board && newCol in board[newRow]) {
            if (board[newRow][newCol].value === 'mine') {
              minesAround++;
            }
          }
        });

        cell.value = minesAround;
      }
    });
  });

  return board;
};

export type InitBoardOptions = {
  excludeCell?: { row: number; col: number };
  random?: RandomSource;
};

export const initBoard = (
  level: Omit<Level, 'id' | 'label'>,
  optionsOrExcludeCell?: InitBoardOptions | { row: number; col: number },
) => {
  const { rows, cols, totalMines } = level;
  const options: InitBoardOptions =
    optionsOrExcludeCell && 'row' in optionsOrExcludeCell
      ? { excludeCell: optionsOrExcludeCell }
      : optionsOrExcludeCell ?? {};
  const random = options.random ?? defaultRandom;
  const excludeCell = options.excludeCell;

  const excludeFlatIndex =
    excludeCell !== undefined ? excludeCell.row * cols + excludeCell.col : undefined;

  const emptyBoard = createBoard(rows, cols);
  const boardWithMines = fillBoardWithMines(
    emptyBoard,
    rows,
    cols,
    totalMines,
    excludeFlatIndex,
    random,
  );
  const gameBoard = fillBoardWithNumbers(boardWithMines);

  return gameBoard;
};

export const initGame = (
  level: Omit<Level, 'id' | 'label'>,
  options?: InitBoardOptions,
) => {
  // const boardInStorage = localStorage.getItem(LOCAL_STORAGE_KEYS.gameBoard);
  // console.log("boardInStorage: ", boardInStorage);

  // if (boardInStorage) {
  //   return JSON.parse(boardInStorage) as TBoard;
  // }

  // const screenOrientation = window.screen.orientation.type;
  // const isPortrait = screenOrientation.includes("portrait");

  const { rows, cols, totalMines } = level;

  // const totalRows = isPortrait && rows !== cols ? cols : rows;
  // const totalCols = isPortrait && rows !== cols ? rows : cols;

  return initBoard(
    {
      // rows: totalRows,
      // cols: totalCols,
      rows,
      cols,
      totalMines,
    },
    options,
  );
};
