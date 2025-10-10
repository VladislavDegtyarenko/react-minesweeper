import { type TBoard } from "../types";

export const revealAllMines = (board: TBoard, highlightWin?: boolean) => {
  board.forEach((row) => {
    row.forEach((cell) => {
      if (cell.value === "mine") {
        cell.isOpened = true;
        if (highlightWin) {
          cell.highlight = "green";
        }
      }
    });
  });
};
