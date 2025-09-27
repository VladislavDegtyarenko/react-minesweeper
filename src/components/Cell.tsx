// Core
import { memo, PointerEvent, MouseEvent } from "react";
import clsx from "clsx";
import { CELL_NUMBERS_COLORS } from "../constants";

// Assets
import mineIcon from "/icons/bomb.svg";
import flagIcon from "/red-flag.png";

// Typescript
import { GameCell, OpenedMineCell, TLevel } from "../types";

type Props = {
  cell: GameCell;
  rowIndex: number;
  cellIndex: number;
  level: TLevel;
  handleCellInteraction: (
    e: globalThis.PointerEvent,
    row: number,
    col: number
  ) => void;
};

const Cell = (props: Props) => {
  const { cell, rowIndex, cellIndex, level, handleCellInteraction } = props;

  const onPointerEvent = (e: PointerEvent<HTMLDivElement>) =>
    handleCellInteraction(
      e.nativeEvent as unknown as globalThis.PointerEvent,
      rowIndex,
      cellIndex
    );

  const onContextMenu = (e: MouseEvent<HTMLDivElement>) =>
    handleCellInteraction(
      e.nativeEvent as unknown as globalThis.PointerEvent,
      rowIndex,
      cellIndex
    );

  return (
    <div
      className={clsx(
        "cell",
        cell.value === "mine" && (cell as OpenedMineCell).highlight,
        typeof cell.value === "number" && CELL_NUMBERS_COLORS[cell.value],
        level !== "easy" && "small"
      )}
      onPointerDown={onPointerEvent}
      onPointerUp={onPointerEvent}
      onContextMenu={onContextMenu}
    >
      {cell.value === "mine" && <img src={mineIcon} />}

      {typeof cell.value === "number" && <>{cell.value || ""}</>}

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
