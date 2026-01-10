import { useGameStore } from "@/store/game";
import Cell from "./Cell";
import { useShallow } from "zustand/react/shallow";
import { memo } from "react";

const Row = ({ rowIndex }: { rowIndex: number }) => {
  const { cols } = useGameStore(
    useShallow((state) => ({
      cols: state.level.cols,
    }))
  );

  return (
    <div className="row" key={rowIndex}>
      {Array.from({ length: cols }, (_, cellIndex) => (
        <Cell rowIndex={rowIndex} cellIndex={cellIndex} key={cellIndex} />
      ))}
    </div>
  );
};

Row.displayName = "Row";

export default memo(Row);
