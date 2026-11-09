import { describe, expect, it } from 'vitest';
import { describeBoardCell } from '@/components/Game/components/Board/renderer/accessibility';
import type { GameCell } from '@/types';

describe('board cell descriptions', () => {
  it('does not reveal concealed mine or number values, including after a loss', () => {
    for (const isGameLost of [false, true]) {
      for (const value of ['mine', 0, 8, null] as const) {
        expect(
          describeBoardCell(
            { value, isOpened: false, marker: null },
            isGameLost,
          ),
        ).toBe('closed');
      }
    }
  });

  it.each<[GameCell, boolean, string]>([
    [{ value: 0, isOpened: true, marker: null }, false, 'empty'],
    [{ value: 3, isOpened: true, marker: null }, false, '3'],
    [{ value: 'mine', isOpened: true, marker: null }, true, 'mine'],
    [{ value: 'mine', isOpened: false, marker: 'flag' }, false, 'flag'],
    [{ value: 3, isOpened: false, marker: 'flag' }, false, 'flag'],
    [{ value: 3, isOpened: false, marker: 'flag' }, true, 'incorrect flag'],
    [{ value: 'mine', isOpened: false, marker: 'question' }, false, 'question'],
  ])('describes visible cell state %#', (cell, isGameLost, description) => {
    expect(describeBoardCell(cell, isGameLost)).toBe(description);
  });
});
