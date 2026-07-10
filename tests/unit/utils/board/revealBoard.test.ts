import { describe, expect, it } from 'vitest';

import { CELL_MARKERS } from '@/constants';
import type { TBoard } from '@/types';
import { revealBoard } from '@/game/board/revealBoard';

describe('revealBoard', () => {
  it('opens unflagged mines and leaves flagged mines closed', () => {
    const board: TBoard = [
      [
        { value: 'mine', marker: null, isOpened: false },
        { value: 'mine', marker: CELL_MARKERS.FLAG, isOpened: false },
        { value: 1, marker: null, isOpened: false },
      ],
    ];

    revealBoard(board);

    expect(board[0][0]).toMatchObject({ isOpened: true });
    expect(board[0][1]).toMatchObject({ isOpened: false });
    expect(board[0][2]).toMatchObject({ isOpened: false });
  });

  it('highlights every mine green for a win reveal', () => {
    const board: TBoard = [
      [
        { value: 'mine', marker: null, isOpened: false },
        { value: 'mine', marker: CELL_MARKERS.FLAG, isOpened: false },
      ],
    ];

    revealBoard(board, true);

    expect(board[0][0]).toMatchObject({ highlight: 'green', isOpened: true });
    expect(board[0][1]).toMatchObject({ highlight: 'green', isOpened: false });
  });
});
