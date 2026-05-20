import { isBrowser } from '@/utils';
import { togglePause } from './actions';
import { selectGameStatus } from './selectors';
import { useGameStore, type GameState } from './store';

const VISIBILITY_STATE_HIDDEN = 'hidden';
const GAME_STATUS_PLAYING = 'playing';

/**
 * Initializes a document visibility listener that auto-pauses the game.
 * Attaches only while the game is playing.
 */
export const initVisibilityPauseListener = (): (() => void) | undefined => {
  if (!isBrowser()) {
    return undefined;
  }

  let removeVisibilityListener: (() => void) | undefined;

  const handleVisibilityChange = () => {
    const isHidden = document.visibilityState === VISIBILITY_STATE_HIDDEN;

    if (!isHidden) {
      return undefined;
    }

    const { gameStatus, isOnboardingTourOpen } = useGameStore.getState();

    if (gameStatus !== GAME_STATUS_PLAYING || isOnboardingTourOpen) {
      return undefined;
    }

    togglePause();

    return undefined;
  };

  const attachVisibilityListener = () => {
    if (removeVisibilityListener) {
      return undefined;
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    removeVisibilityListener = () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };

    return undefined;
  };

  const detachVisibilityListener = () => {
    if (!removeVisibilityListener) {
      return undefined;
    }

    removeVisibilityListener();
    removeVisibilityListener = undefined;

    return undefined;
  };

  const updateVisibilityListener = (gameStatus: GameState['gameStatus']) => {
    if (gameStatus === GAME_STATUS_PLAYING) {
      attachVisibilityListener();
      return undefined;
    }

    detachVisibilityListener();

    return undefined;
  };

  const unsubscribe = useGameStore.subscribe(
    selectGameStatus,
    updateVisibilityListener,
  );

  updateVisibilityListener(useGameStore.getState().gameStatus);

  return () => {
    detachVisibilityListener();
    unsubscribe();
  };
};
