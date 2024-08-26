// Core
import clsx from "clsx";

// Assets
import mineIcon from "/icons/bomb.svg";
import flagIcon from "/red-flag.png";

// Typescript
import { GameCell, TLevel } from "../types";
import { MouseEvent, memo } from "react";
import { CELL_NUMBERS_COLORS } from "../utils/constants";

type Props = {
  cell: GameCell;
  rowIndex: number;
  cellIndex: number;
  level: TLevel;
  handleCellLeftClick: (row: number, col: number) => void;
  handleCellRightClick: (
    e: MouseEvent<HTMLDivElement>,
    row: number,
    col: number
  ) => void;
};

const Cell = (props: Props) => {
  const {
    cell,
    rowIndex,
    cellIndex,
    level,
    handleCellLeftClick,
    handleCellRightClick,
  } = props;

  return (
    <div
      className={clsx(
        "cell",
        cell.value === "mine" && cell.hightlight === "red" && "cell-mine-red",
        cell.value === "mine" &&
          cell.hightlight === "green" &&
          "cell-mine-green",
        typeof cell.value === "number" && CELL_NUMBERS_COLORS[cell.value],
        level === "easy" ? "big" : "small"
      )}
      onClick={() => handleCellLeftClick(rowIndex, cellIndex)}
      onContextMenu={(e) => handleCellRightClick(e, rowIndex, cellIndex)}
    >
      {cell.value === "mine" && cell.isOpened && <img src={mineIcon} />}

      {typeof cell.value === "number" && cell.isOpened && (
        <>{cell.value || ""}</>
      )}

      {!cell.isOpened && (
        <div className="overlay">
          <img
            src={flagIcon}
            className={clsx("flag", cell.isFlagged && "visible")}
          />
        </div>
      )}
    </div>
  );
};

const MemoCell = memo(Cell);

export default MemoCell;
