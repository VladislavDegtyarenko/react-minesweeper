// Core
import { memo, PointerEvent, MouseEvent, useState } from "react";
import clsx from "clsx";
import { CELL_NUMBERS_COLORS } from "../constants";

// Assets
import mineIcon from "/icons/bomb.svg";
import flagIcon from "/red-flag.png";

// Typescript
import type {
  GameCell,
  HandleCellInteractionProps,
  OpenedMineCell,
  TLevel,
} from "../types";

type Props = {
  cell: GameCell;
  rowIndex: number;
  cellIndex: number;
  level: TLevel;
  handleCellInteraction: ({
    e,
    row,
    col,
    onFlagToggle,
  }: HandleCellInteractionProps) => void;
};

const Cell = (props: Props) => {
  const { cell, rowIndex, cellIndex, level, handleCellInteraction } = props;

  const [shouldAnimate, setShouldAnimate] = useState(false);

  const onPointerEvent = (e: PointerEvent<HTMLDivElement>) => {
    handleCellInteraction({
      e: e.nativeEvent as unknown as globalThis.PointerEvent,
      row: rowIndex,
      col: cellIndex,
    });
  };

  const onContextMenu = (e: MouseEvent<HTMLDivElement>) => {
    handleCellInteraction({
      e: e.nativeEvent as unknown as globalThis.PointerEvent,
      row: rowIndex,
      col: cellIndex,
      onFlagToggle: () => setShouldAnimate(true),
    });
  };

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
            className={clsx(
              "flag",
              shouldAnimate && cell.isFlagged === true && "visible",
              shouldAnimate && cell.isFlagged === false && "hidden"
            )}
          />
        </div>
      )}
    </div>
  );
};

const MemoCell = memo(Cell);

export default MemoCell;
