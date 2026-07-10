import { describe, expect, it } from 'vitest';

import { getBranchPrefix } from '../branch-name-utils.mjs';

describe('getBranchPrefix', () => {
  it.each([
    ['bug', 'bugfix'],
    ['🐞 Bug', 'bugfix'],
    ['polish', 'polish'],
    ['docs', 'docs'],
    ['documentation', 'docs'],
    ['chore', 'feature'],
  ])('maps %s to %s', (taskType, prefix) => {
    expect(getBranchPrefix(taskType)).toBe(prefix);
  });
});
