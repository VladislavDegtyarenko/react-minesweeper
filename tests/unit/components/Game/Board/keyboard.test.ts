import { describe, expect, it } from 'vitest';
import { getBoardKeyboardTarget } from '@/components/Game/components/Board/keyboard';

const POSITION = { rowIndex: 2, cellIndex: 3, rows: 4, cols: 6 };

describe('board keyboard navigation', () => {
  it.each([
    ['ArrowLeft', 2, 2],
    ['ArrowRight', 2, 4],
    ['ArrowUp', 1, 3],
    ['ArrowDown', 3, 3],
    ['Home', 2, 0],
    ['End', 2, 5],
  ])('moves with %s on a rectangular board', (key, rowIndex, cellIndex) => {
    expect(getBoardKeyboardTarget({ ...POSITION, key: String(key) })).toEqual({
      rowIndex,
      cellIndex,
    });
  });

  it('keeps arrow navigation at edges without wrapping to another row', () => {
    for (const key of ['ArrowLeft', 'ArrowUp']) {
      expect(
        getBoardKeyboardTarget({ ...POSITION, rowIndex: 0, cellIndex: 0, key }),
      ).toEqual({ rowIndex: 0, cellIndex: 0 });
    }
    for (const key of ['ArrowRight', 'ArrowDown']) {
      expect(
        getBoardKeyboardTarget({ ...POSITION, rowIndex: 3, cellIndex: 5, key }),
      ).toEqual({ rowIndex: 3, cellIndex: 5 });
    }
  });

  it('distinguishes row edges from board edges', () => {
    expect(
      getBoardKeyboardTarget({ ...POSITION, key: 'Home', ctrlKey: true }),
    ).toEqual({ rowIndex: 0, cellIndex: 0 });
    expect(
      getBoardKeyboardTarget({ ...POSITION, key: 'End', ctrlKey: true }),
    ).toEqual({ rowIndex: 3, cellIndex: 5 });
  });

  it('leaves activation keys and Tab to their own handlers', () => {
    for (const key of ['Tab', 'Enter', ' ', 'f', 'Escape']) {
      expect(getBoardKeyboardTarget({ ...POSITION, key })).toBeNull();
    }
  });

  it('rejects absent grids and stale or non-integer positions', () => {
    for (const invalid of [
      { rows: 0 },
      { cols: -1 },
      { rows: 1.5 },
      { cols: Infinity },
      { rowIndex: -1 },
      { rowIndex: 4 },
      { cellIndex: 6 },
      { cellIndex: NaN },
      { rowIndex: 0.5 },
    ]) {
      expect(
        getBoardKeyboardTarget({ ...POSITION, ...invalid, key: 'Home' }),
      ).toBeNull();
    }
  });

  it('handles a one-cell board', () => {
    for (const key of [
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End',
    ]) {
      expect(
        getBoardKeyboardTarget({
          rows: 1,
          cols: 1,
          rowIndex: 0,
          cellIndex: 0,
          key,
        }),
      ).toEqual({ rowIndex: 0, cellIndex: 0 });
    }
  });
});
