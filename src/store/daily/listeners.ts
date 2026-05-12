import { isBrowser } from '@/utils';
import { refreshTodayKey } from './actions';

const POLL_INTERVAL_MS = 60_000;

/**
 * Keeps the daily store's `todayKey` in sync with the wall clock so that
 * long-lived sessions roll over at UTC midnight.
 *
 * Strategy:
 * - `visibilitychange` → instant refresh when the tab regains focus, which
 *   covers the common case of the tab being hidden across midnight.
 * - 60s interval → safety net for sessions that stay continuously visible.
 *
 * `refreshTodayKey` is a no-op when the key hasn't changed, so polling is
 * cheap and won't trigger spurious re-renders.
 */
export const initDailyDateListener = (): (() => void) | undefined => {
  if (!isBrowser()) {
    return undefined;
  }

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      refreshTodayKey();
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  const intervalId = window.setInterval(refreshTodayKey, POLL_INTERVAL_MS);

  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.clearInterval(intervalId);
  };
};
