import { describe, expect, it } from 'vitest';

import {
  createSeededRandom,
  getDailyKey,
  getDailySeed,
} from '@/game/daily';

describe('daily seed helpers', () => {
  it('formats keys from UTC dates', () => {
    expect(getDailyKey(new Date('2026-07-10T23:30:00-05:00'))).toBe(
      '2026-07-11',
    );
    expect(getDailyKey(new Date(Date.UTC(2026, 0, 5, 2, 0, 0)))).toBe(
      '2026-01-05',
    );
  });

  it('generates stable seeds for a daily key, level, and seed version', () => {
    expect(getDailySeed('2026-07-10', 'easy')).toBe(4222009412);
    expect(getDailySeed('2026-07-10', 'medium')).toBe(2104035225);
    expect(getDailySeed('2026-07-10', 'easy', 2)).toBe(1341278053);
  });

  it('creates a deterministic random sequence for a seed', () => {
    const random = createSeededRandom(4222009412);

    expect(Array.from({ length: 5 }, () => random())).toEqual([
      0.37161967111751437,
      0.08640622161328793,
      0.3323060357943177,
      0.3383467390667647,
      0.9708782834932208,
    ]);
  });
});
