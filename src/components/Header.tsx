import BombIcon from "/icons/bomb.svg";
import TimerIcon from "/icons/timer.svg";

type HeaderProps = {
  isGameWin: boolean;
  isGameOver: boolean;
  isGameEnded: boolean;
  minesLeft: number;
  newGame: () => void;
  restartGame: () => void;
  timeDiff: string;
};

const Header = ({
  isGameWin,
  isGameOver,
  isGameEnded,
  minesLeft,
  newGame,
  restartGame,
  timeDiff,
}: HeaderProps) => {
  return (
    <header>
      <div className="header-label">
        {isGameWin && <span className="win">You win!</span>}
        {isGameOver && <span className="game-over">Game over!</span>}
        {!isGameEnded && (
          <>
            <img src={BombIcon} className="header-icon" />
            {minesLeft}
          </>
        )}
      </div>
      <div className="header-buttons">
        <button onClick={newGame}>New</button>
        <button onClick={restartGame}>Restart</button>
      </div>
      <div className="header-label">
        <img src={TimerIcon} className="header-icon" />
        {timeDiff}
      </div>
    </header>
  );
};

export default Header;
