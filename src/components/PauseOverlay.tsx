import { togglePause } from "@/store/game/actions";
import { useSettingsStore } from "@/store/settings";
import { selectIsTouchScreen } from "@/store/settings/selectors";

const PauseOverlay = () => {
  const isTouchScreen = useSettingsStore(selectIsTouchScreen);

  return (
    <div className="pause-overlay" role="button" onClick={togglePause}>
      <div className="pause-overlay-content">
        <div className="pause-overlay-icon">
          <img src="/icons/pause.svg" alt="pause" />
        </div>
        <h2>Paused</h2>
        <p>{isTouchScreen ? "Tap" : "Click"} to resume</p>
      </div>
    </div>
  );
};

export default PauseOverlay;
