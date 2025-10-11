import type { TBoard, GameCell } from "../types";
import { DIRECTIONS } from "../constants";

const createBoard = (rows: number, cols: number) => {
  const board: TBoard = [];

  for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
    board[rowIndex] = [];

    for (let cellIndex = 0; cellIndex < cols; cellIndex++) {
      board[rowIndex][cellIndex] = {
        value: null,
        isFlagged: false,
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
  totalMines: number
) => {
  let mines = 0;

  while (mines < totalMines) {
    const row = Math.floor(Math.random() * rows);
    const column = Math.floor(Math.random() * cols);

    if (board[row][column].value !== "mine") {
      (board[row][column] as GameCell).value = "mine";
      mines++;
    }
  }

  return board;
};

const fillBoardWithNumbers = (board: TBoard) => {
  // const finalBoard: TBoard = JSON.parse(JSON.stringify(boardWithMines));

  board.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell.value !== "mine") {
        let minesAround = 0;

        DIRECTIONS.forEach(([dRow, dCol]) => {
          const newRow = rowIndex + dRow;
          const newCol = colIndex + dCol;

          if (newRow in board && newCol in board[newRow]) {
            if (board[newRow][newCol].value === "mine") {
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

export const initBoard = (rows: number, cols: number, totalMines: number) => {
  const emptyBoard = createBoard(rows, cols);
  const boardWithMines = fillBoardWithMines(emptyBoard, rows, cols, totalMines);
  const gameBoard = fillBoardWithNumbers(boardWithMines);

  return gameBoard;
};

export const initGame = (rows: number, cols: number, totalMines: number) => {
  // const boardInStorage = localStorage.getItem(LOCAL_STORAGE_KEYS.gameBoard);
  // console.log("boardInStorage: ", boardInStorage);

  // if (boardInStorage) {
  //   return JSON.parse(boardInStorage) as TBoard;
  // }

  const screenOrientation = window.screen.orientation.type;
  const isPortrait = screenOrientation.includes("portrait");

  const totalRows = isPortrait && rows !== cols ? cols : rows;
  const totalCols = isPortrait && rows !== cols ? rows : cols;

  return initBoard(totalRows, totalCols, totalMines);
};
