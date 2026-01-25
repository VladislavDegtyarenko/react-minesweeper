import { useGameStore } from "@/store/game";
import GameStatus from "./GameStatus";
import TimerDisplay from "./TimerDisplay";
import { startNewGame, restartGame, togglePause } from "@/store/game/actions";
import { useSFXStore } from "@/store/sfx";
import { toggleMuteSFX } from "@/store/sfx/actions";
import { selectGameStatus } from "@/store/game/selectors";
import Button from "./ui/Button";

const Header = () => {
  const isMuted = useSFXStore((state) => state.isMuted);
  const gameStatus = useGameStore(selectGameStatus);

  return (
    <header>
      <div className="header-label mines-left">
        <GameStatus />
      </div>
      <div className="header-buttons">
        <Button
          onClick={togglePause}
          isDisabled={
            gameStatus === "idle" ||
            gameStatus === "won" ||
            gameStatus === "lost"
          }
          title={gameStatus === "paused" ? "Play" : "Pause"}
        >
          {gameStatus === "paused" ? (
            <img src="/icons/play.svg" alt="Play" />
          ) : (
            <img src="/icons/pause.svg" alt="Pause" />
          )}
        </Button>
        <Button onClick={startNewGame} title="New">
          New
        </Button>
        <Button
          onClick={restartGame}
          isDisabled={gameStatus === "idle"}
          title="Restart"
        >
          <img src="/icons/restart.svg" alt="Restart" />
        </Button>
        <Button
          isIcon
          onClick={toggleMuteSFX}
          title={isMuted ? "Unmute" : "Mute"}
        >
          <img
            src={isMuted ? "/icons/sound-muted.svg" : "/icons/sound.svg"}
            alt={isMuted ? "Unmute" : "Mute"}
          />
        </Button>
      </div>
      <div className="header-label timer">
        <TimerDisplay />
      </div>
    </header>
  );
};

export default Header;
