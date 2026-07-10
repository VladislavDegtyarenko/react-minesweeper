import { DAILY_MAX_ELAPSED_MS, DAILY_MIN_ELAPSED_MS } from './constants';

/**
 * Clamp daily attempt elapsed times before they hit storage. Trust MVP:
 * we don't validate moves, but we refuse to store obviously tampered or
 * absurd values.
 */
export const clampDailyElapsedMs = (elapsedMs: number): number => {
  if (!Number.isFinite(elapsedMs)) {
    return DAILY_MIN_ELAPSED_MS;
  }

  const rounded = Math.round(elapsedMs);

  if (rounded < DAILY_MIN_ELAPSED_MS) {
    return DAILY_MIN_ELAPSED_MS;
  }

  if (rounded > DAILY_MAX_ELAPSED_MS) {
    return DAILY_MAX_ELAPSED_MS;
  }

  return rounded;
};
