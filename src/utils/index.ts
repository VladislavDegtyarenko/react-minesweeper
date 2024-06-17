import { IBoard } from "../types";
import { DIRECTIONS } from "./constants";

const createBoard = (rows: number, cols: number) => {
  const board: IBoard = [];

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
  emptyBoard: IBoard,
  rows: number,
  cols: number,
  totalMines: number
) => {
  const boardWithMines: IBoard = JSON.parse(JSON.stringify(emptyBoard));

  let mines = 0;

  while (mines < totalMines) {
    const row = Math.floor(Math.random() * rows);
    const column = Math.floor(Math.random() * cols);

    if (boardWithMines[row][column].value !== "mine") {
      boardWithMines[row][column].value = "mine";
      mines++;
    }
  }

  return boardWithMines;
};

const fillBoardWithNumbers = (boardWithMines: IBoard) => {
  const finalBoard: IBoard = JSON.parse(JSON.stringify(boardWithMines));

  finalBoard.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell.value !== "mine") {
        let minesAround = 0;

        DIRECTIONS.forEach(([dRow, dCol]) => {
          const newRow = rowIndex + dRow;
          const newCol = colIndex + dCol;

          if (newRow in finalBoard && newCol in finalBoard[newRow]) {
            if (finalBoard[newRow][newCol].value === "mine") {
              minesAround++;
            }
          }
        });

        cell.value = minesAround;
      }
    });
  });

  return finalBoard;
};

export const initBoard = (rows: number, cols: number, totalMines: number) => {
  const emptyBoard = createBoard(rows, cols);
  const boardWithMines = fillBoardWithMines(emptyBoard, rows, cols, totalMines);
  const gameBoard = fillBoardWithNumbers(boardWithMines);

  return gameBoard;
};

export const revealEmptyCells = (
  board: IBoard,
  rows: number,
  cols: number,
  row: number,
  col: number
) => {
  const gameBoard: IBoard = JSON.parse(JSON.stringify(board));

  const queue: [number, number][] = [[row, col]]; // Queue of cell coordinates

  while (queue.length > 0) {
    const [currentRow, currentCol] = queue.shift()!; // Dequeue the next cell

    const cell = gameBoard[currentRow][currentCol];
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
          !gameBoard[newRow][newCol].isOpened &&
          !gameBoard[newRow][newCol].isFlagged
        ) {
          queue.push([newRow, newCol]); // Add adjacent empty cells to queue
        }
      }
    }
  }

  return gameBoard;
};

export const revealAllMines = (board: IBoard, highlightWin?: boolean) => {
  board.forEach((row) => {
    row.forEach((cell) => {
      if (cell.value === "mine") {
        cell.isOpened = true;
        if (highlightWin) {
          cell.hightlight = "green";
        }
      }
    });
  });
};

export const checkGameWin = (board: IBoard, totalMines: number) => {
  let unopenedCells = 0;
  // let flaggedCells = 0;

  board.forEach((row) => {
    row.forEach((cell) => {
      if (!cell.isOpened) {
        unopenedCells++;
      }
    });
  });

  // Win condition: All non-mine cells are opened, or all mines are flagged.
  return unopenedCells === totalMines /* || flaggedCells === totalMines */;
};

export const getTimeDiff = (timeNow: Date | null, startTime: Date | null) => {
  if (timeNow === null || startTime === null) return "00:00";

  return new Intl.DateTimeFormat("en-US", {
    minute: "2-digit",
    second: "numeric",
  }).format(timeNow.getTime() - startTime.getTime());
  // return Math.floor((timeNow.getTime() - startTime.getTime()) / 1000);
};
