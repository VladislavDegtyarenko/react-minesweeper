import { memo } from "react";
import { TBoard, TLevel } from "../types";
import Cell from "./Cell";

type BoardProps = {
  gameBoard: TBoard;
  handleCellInteraction: (
    e: globalThis.PointerEvent,
    row: number,
    col: number
  ) => void;
  level: TLevel;
};

const Board = memo(
  ({
    gameBoard,
    handleCellInteraction,
    level,
  }: BoardProps) => {
    return (
      <div className="board">
        {gameBoard.map((rows, rowIndex) => (
          <div className="row" key={rowIndex}>
            {rows.map((cell, cellIndex) => (
              <Cell
                cell={cell}
                rowIndex={rowIndex}
                cellIndex={cellIndex}
                handleCellInteraction={handleCellInteraction}
                level={level}
                key={cellIndex}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }
);

export default Board;
