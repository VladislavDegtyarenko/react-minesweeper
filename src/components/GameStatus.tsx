import { memo } from "react";

type Props = {
  isGameWin: boolean;
  isGameOver: boolean;
  isGameEnded: boolean;
  minesLeft: number;
};

const GameStatus = memo((props: Props) => {
  const { isGameWin, isGameOver, isGameEnded, minesLeft } = props;

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
