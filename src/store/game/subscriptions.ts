import { startNewGame } from "./actions";
import { initVisibilityPauseListener } from "./listeners";
import { savePreferredGameMode } from "./preferences";
import { selectGameMode, selectGameStatus } from "./selectors";
import { useGameStore } from "./store";
import { pauseTimer, startTimer, stopTimer } from "../timer/actions";

const GAME_STATUS_IDLE = "idle";
const GAME_STATUS_PLAYING = "playing";
const GAME_STATUS_PAUSED = "paused";
const GAME_STATUS_WON = "won";
const GAME_STATUS_LOST = "lost";

/**
 * Initializes all game store subscriptions.
 * Called automatically when the module is imported.
 */
export const initSubscriptions = (): void => {
  // On game status change, start/pause/stop the timer
  useGameStore.subscribe(selectGameStatus, (gameStatus) => {
    if (
      gameStatus === GAME_STATUS_WON ||
      gameStatus === GAME_STATUS_LOST ||
      gameStatus === GAME_STATUS_IDLE
    ) {
      stopTimer();
    }

    if (gameStatus === GAME_STATUS_PAUSED) {
      pauseTimer();
    }

    if (gameStatus === GAME_STATUS_PLAYING) {
      startTimer();
    }
  });

  // On level change, start a new game
  useGameStore.subscribe(
    (state) => state.level,
    () => {
      startNewGame();
    }
  );

  // Persist the preferred game mode whenever it changes. The active provider
  // (localStorage by default, swappable to an account-backed provider in the
  // future via `setGameModePreferenceProvider`) handles the actual write.
  useGameStore.subscribe(selectGameMode, (mode) => {
    savePreferredGameMode(mode);
  });

  initVisibilityPauseListener();
};

// Auto-initialize subscriptions
initSubscriptions();

