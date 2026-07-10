import { describe, expect, it } from 'vitest';

import { computeStreaks } from '@/utils/daily';

describe('computeStreaks', () => {
  it('deduplicates win days and counts a current streak through today', () => {
    expect(
      computeStreaks(
        [
          { dailyKey: '2026-07-08' },
          { dailyKey: '2026-07-10' },
          { dailyKey: '2026-07-09' },
          { dailyKey: '2026-07-09' },
        ],
        '2026-07-10',
      ),
    ).toEqual({
      currentStreak: 3,
      bestStreak: 3,
      lastWinKey: '2026-07-10',
    });
  });

  it('keeps a streak current when the latest win was yesterday', () => {
    expect(
      computeStreaks(
        [{ dailyKey: '2026-07-08' }, { dailyKey: '2026-07-09' }],
        '2026-07-10',
      ),
    ).toEqual({
      currentStreak: 2,
      bestStreak: 2,
      lastWinKey: '2026-07-09',
    });
  });

  it('resets current streak after a missed day while preserving best streak', () => {
    expect(
      computeStreaks(
        [
          { dailyKey: '2026-07-01' },
          { dailyKey: '2026-07-02' },
          { dailyKey: '2026-07-05' },
        ],
        '2026-07-10',
      ),
    ).toEqual({
      currentStreak: 0,
      bestStreak: 2,
      lastWinKey: '2026-07-05',
    });
  });

  it('returns an empty summary without wins', () => {
    expect(computeStreaks([], '2026-07-10')).toEqual({
      currentStreak: 0,
      bestStreak: 0,
      lastWinKey: null,
    });
  });
});
