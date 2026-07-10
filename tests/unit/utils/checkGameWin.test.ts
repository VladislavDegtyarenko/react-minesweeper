import { describe, expect, it } from 'vitest';

import { checkGameWin } from '@/utils/checkGameWin';

describe('checkGameWin', () => {
  it('wins when every safe cell is opened', () => {
    expect(checkGameWin(71, 71, 0, 10)).toBe(true);
  });

  it('wins when every mine is correctly flagged', () => {
    expect(checkGameWin(0, 71, 10, 10)).toBe(true);
  });

  it('does not win while both counters are incomplete', () => {
    expect(checkGameWin(70, 71, 9, 10)).toBe(false);
  });
});
