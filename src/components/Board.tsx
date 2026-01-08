import { useShallow } from "zustand/react/shallow";
import { useGameStore } from "@/store/game";
import { memo } from "react";
import Row from "./Row";

const Board = () => {
  const { rows } = useGameStore(
    useShallow((state) => ({
      rows: state.level.rows,
    }))
  );

  return (
    <div className="board">
      {Array.from({ length: rows }, (_, rowIndex) => (
        <Row rowIndex={rowIndex} key={rowIndex} />
      ))}
    </div>
  );
};

Board.displayName = "Board";

export default memo(Board);
