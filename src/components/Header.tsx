import GameStatus from "./GameStatus";
import TimerDisplay from "./TimerDisplay";
import { startNewGame, restartGame } from "@/store/game/actions";
import { useSFXStore } from "@/store/sfx";
import { toggleMuteSFX } from "@/store/sfx/actions";

const Header = () => {
  const isMuted = useSFXStore((state) => state.isMuted);

  return (
    <header>
      <div className="header-label mines-left">
        <GameStatus />
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
            src={isMuted ? "/icons/sound-muted.svg" : "/icons/sound.svg"}
            alt={isMuted ? "Unmute" : "Mute"}
          />
        </button>
      </div>
      <div className="header-label timer">
        <TimerDisplay />
      </div>
    </header>
  );
};

export default Header;
