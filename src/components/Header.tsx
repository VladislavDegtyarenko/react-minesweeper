import GameStatus from "./GameStatus";
import TimerDisplay from "./TimerDisplay";

type HeaderProps = {
  isGameWin: boolean;
  isGameOver: boolean;
  isGameEnded: boolean;
  minesLeft: number;
  startNewGame: () => void;
  restartGame: () => void;
  timeDiff: string;
  isMutedSFX: boolean;
  toggleMuteSFX: () => void;
};

const Header = ({
  isGameWin,
  isGameOver,
  isGameEnded,
  minesLeft,
  startNewGame,
  restartGame,
  timeDiff,
  isMutedSFX,
  toggleMuteSFX,
}: HeaderProps) => {
  return (
    <header>
      <div className="header-label mines-left">
        <GameStatus
          isGameWin={isGameWin}
          isGameOver={isGameOver}
          isGameEnded={isGameEnded}
          minesLeft={minesLeft}
        />
      </div>
      <div className="header-buttons">
        <button className="button solid" onClick={startNewGame}>
          New
        </button>
        <button className="button solid" onClick={restartGame}>
          Restart
        </button>
        <button className="button solid icon" onClick={toggleMuteSFX}>
          <img
            src={isMutedSFX ? "/icons/sound-muted.svg" : "/icons/sound.svg"}
            alt={isMutedSFX ? "Unmute" : "Mute"}
          />
        </button>
      </div>
      <div className="header-label timer">
        <TimerDisplay timeDiff={timeDiff} />
      </div>
    </header>
  );
};

export default Header;
