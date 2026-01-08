// Core
import { memo, PointerEvent, MouseEvent, useState } from "react";
import clsx from "clsx";
import { useShallow } from "zustand/react/shallow";
import { CELL_NUMBERS_COLORS } from "../constants";

// Typescript
import type { OpenedMineCell } from "../types";
import { handleCellInteraction } from "@/utils/board";
import { useGameStore } from "@/store/game";

type Props = {
  rowIndex: number;
  cellIndex: number;
};

const Cell = (props: Props) => {
  const { rowIndex, cellIndex } = props;

  // Subscribe to individual primitive values to prevent re-renders when other cells change
  const { value, isOpened, isFlagged, highlight, levelId } = useGameStore(
    useShallow((state) => {
      const cell = state.board[rowIndex][cellIndex];

      return {
        value: cell.value,
        isOpened: cell.isOpened,
        isFlagged: cell.isFlagged,
        highlight: (cell as OpenedMineCell).highlight,
        levelId: state.level.id,
      };
    })
  );

  const [shouldAnimate, setShouldAnimate] = useState(false);

  const onPointerEvent = (e: PointerEvent<HTMLDivElement>) => {
    handleCellInteraction({
      e: e.nativeEvent as unknown as globalThis.PointerEvent,
      row: rowIndex,
      col: cellIndex,
      onFlagToggle: () => setShouldAnimate(true),
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
        value === "mine" && highlight,
        typeof value === "number" && CELL_NUMBERS_COLORS[value],
        levelId !== "easy" && "small"
      )}
      onPointerDown={onPointerEvent}
      onPointerUp={onPointerEvent}
      onContextMenu={onContextMenu}
    >
      {value === "mine" && <img src="/icons/bomb.svg" alt="mine" />}

      {typeof value === "number" && <>{value || ""}</>}

      {!isOpened && (
        <div className="overlay">
          <img
            src="/red-flag.png"
            alt="flag"
            className={clsx(
              "flag",
              shouldAnimate && isFlagged === true && "visible",
              shouldAnimate && isFlagged === false && "hidden"
            )}
          />
        </div>
      )}
    </div>
  );
};

Cell.displayName = "Cell";

export default memo(Cell);
