import { describe, expect, it } from 'vitest';

import { CELL_MARKERS } from '@/constants';
import type { TBoard } from '@/types';
import { applyOpenedCells, revealEmptyCells } from '@/game/board/revealEmptyCells';

describe('revealEmptyCells', () => {
  it('returns the empty cascade plus bordering numbers, skipping flagged cells', () => {
    const board: TBoard = [
      [
        { value: 0, marker: null, isOpened: false },
        { value: 0, marker: null, isOpened: false },
        { value: 1, marker: null, isOpened: false },
      ],
      [
        { value: 1, marker: CELL_MARKERS.FLAG, isOpened: false },
        { value: 1, marker: null, isOpened: false },
        { value: 1, marker: null, isOpened: false },
      ],
      [
        { value: 'mine', marker: null, isOpened: false },
        { value: 1, marker: null, isOpened: false },
        { value: 0, marker: null, isOpened: false },
      ],
    ];

    expect(revealEmptyCells(board, 3, 3, 0, 0)).toEqual([
      [0, 0],
      [0, 1],
      [1, 1],
      [0, 2],
      [1, 2],
    ]);
  });
});

describe('applyOpenedCells', () => {
  it('opens target positions and preserves references for unchanged rows and cells', () => {
    const board: TBoard = [
      [
        { value: 0, marker: CELL_MARKERS.QUESTION, isOpened: false },
        { value: 1, marker: null, isOpened: false },
      ],
      [
        { value: 'mine', marker: null, isOpened: false },
        { value: 1, marker: null, isOpened: false },
      ],
    ];
    const unchangedRow = board[1];
    const unchangedCell = board[0][1];

    const nextBoard = applyOpenedCells(board, [[0, 0]]);

    expect(nextBoard[0][0]).toMatchObject({ isOpened: true, marker: null });
    expect(nextBoard[0][1]).toBe(unchangedCell);
    expect(nextBoard[1]).toBe(unchangedRow);
  });
});
