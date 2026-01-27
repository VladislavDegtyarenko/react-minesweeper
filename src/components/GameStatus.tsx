import { memo } from "react";
import { useGameStore } from "@/store/game";
import { selectGameStatus, selectMinesLeft } from "@/store/game/selectors";

const GameStatus = memo(() => {
  const gameStatus = useGameStore(selectGameStatus);
  const minesLeft = useGameStore(selectMinesLeft);

  if (gameStatus === "won") {
    return <span className="win">Win!</span>;
  }

  if (gameStatus === "lost") {
    return <span className="game-over">Lost!</span>;
  }

  return (
    <>
      <img src="/icons/bomb.svg" className="header-icon" alt="mines left" />
      {minesLeft}
    </>
  );
});

export default GameStatus;
