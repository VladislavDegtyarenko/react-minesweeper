import { describe, expect, it } from 'vitest';

import {
  DAILY_MAX_ELAPSED_MS,
  DAILY_MIN_ELAPSED_MS,
  clampDailyElapsedMs,
} from '@/game/daily';

describe('clampDailyElapsedMs', () => {
  it('rounds finite values inside the accepted range', () => {
    expect(clampDailyElapsedMs(1234.56)).toBe(1235);
  });

  it('clamps values below the minimum and above the maximum', () => {
    expect(clampDailyElapsedMs(100)).toBe(DAILY_MIN_ELAPSED_MS);
    expect(clampDailyElapsedMs(DAILY_MAX_ELAPSED_MS + 1)).toBe(
      DAILY_MAX_ELAPSED_MS,
    );
  });

  it('uses the minimum for non-finite values', () => {
    expect(clampDailyElapsedMs(Number.NaN)).toBe(DAILY_MIN_ELAPSED_MS);
    expect(clampDailyElapsedMs(Number.POSITIVE_INFINITY)).toBe(
      DAILY_MIN_ELAPSED_MS,
    );
  });
});
