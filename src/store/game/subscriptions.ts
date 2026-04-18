import { initVisibilityPauseListener } from './listeners';
import { selectGameStatus } from './selectors';
import { useGameStore } from './store';
import { pauseTimer, startTimer, stopTimer } from '../timer/actions';

const GAME_STATUS_IDLE = 'idle';
const GAME_STATUS_PLAYING = 'playing';
const GAME_STATUS_PAUSED = 'paused';
const GAME_STATUS_WON = 'won';
const GAME_STATUS_LOST = 'lost';

/**
 * Initializes all game store subscriptions.
 * Called automatically when the module is imported.
 */
export const initSubscriptions = (): void => {
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

  initVisibilityPauseListener();
};

// Auto-initialize subscriptions
initSubscriptions();
