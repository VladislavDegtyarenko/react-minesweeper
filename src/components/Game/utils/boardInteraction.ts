type BoardInteractionListener = (isActive: boolean) => void;

const BOARD_SCROLL_IDLE_MS = 180;

const listeners = new Set<BoardInteractionListener>();

let activePointerCount = 0;
let isActive = false;
let scrollIdleTimeoutId: number | null = null;

const clearScrollIdleTimeout = () => {
  if (scrollIdleTimeoutId === null) {
    return;
  }

  window.clearTimeout(scrollIdleTimeoutId);
  scrollIdleTimeoutId = null;
};

const setIsActive = (nextIsActive: boolean) => {
  if (isActive === nextIsActive) {
    return;
  }

  isActive = nextIsActive;
  listeners.forEach((listener) => listener(isActive));
};

const refreshIsActive = () => {
  setIsActive(activePointerCount > 0 || scrollIdleTimeoutId !== null);
};

export const isBoardInteractionActive = () => isActive;

export const subscribeBoardInteraction = (
  listener: BoardInteractionListener,
) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};

export const beginBoardInteraction = () => {
  activePointerCount += 1;
  setIsActive(true);
};

export const endBoardInteraction = () => {
  activePointerCount = Math.max(0, activePointerCount - 1);
  refreshIsActive();
};

export const resetBoardInteraction = () => {
  activePointerCount = 0;
  clearScrollIdleTimeout();
  refreshIsActive();
};

export const markBoardScrollActivity = () => {
  clearScrollIdleTimeout();
  setIsActive(true);

  scrollIdleTimeoutId = window.setTimeout(() => {
    scrollIdleTimeoutId = null;
    refreshIsActive();
  }, BOARD_SCROLL_IDLE_MS);
};
