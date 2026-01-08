import { memo } from "react";
import { useGameStore } from "@/store/game";
import { selectIsGameEnded, selectMinesLeft } from "@/store/game/selectors";

const GameStatus = memo(() => {
  const isGameWin = useGameStore((state) => state.isGameWin);
  const isGameOver = useGameStore((state) => state.isGameOver);
  const isGameEnded = useGameStore(selectIsGameEnded);
  const minesLeft = useGameStore(selectMinesLeft);

  return (
    <>
      {isGameWin && <span className="win">Win!</span>}
      {isGameOver && <span className="game-over">Lost!</span>}
      {!isGameEnded && (
        <>
          <img src="/icons/bomb.svg" className="header-icon" alt="mines left" />
          {minesLeft}
        </>
      )}
    </>
  );
});

export default GameStatus;
