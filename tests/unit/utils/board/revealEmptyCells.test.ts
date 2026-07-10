import { describe, expect, it } from 'vitest';

import { CELL_MARKERS } from '@/config';
import type { TBoard } from '@/types';
import { applyOpenedCells, revealEmptyCells } from '@/game/board/revealEmptyCells';

describe('revealEmptyCells', () => {
  it('returns the empty cascade plus bordering numbers, skipping flagged and opened cells', () => {
    const board: TBoard = [
      [
        { value: 0, marker: null, isOpened: false },
        { value: 0, marker: null, isOpened: false },
        { value: 1, marker: null, isOpened: false },
        { value: 2, marker: CELL_MARKERS.QUESTION, isOpened: false },
        { value: 3, marker: null, isOpened: true },
      ],
      [
        { value: 1, marker: CELL_MARKERS.FLAG, isOpened: false },
        { value: 1, marker: null, isOpened: true },
        { value: 1, marker: CELL_MARKERS.QUESTION, isOpened: false },
        { value: 2, marker: null, isOpened: false },
        { value: 'mine', marker: CELL_MARKERS.FLAG, isOpened: false },
      ],
      [
        { value: 'mine', marker: null, isOpened: false },
        { value: 1, marker: null, isOpened: false },
        { value: 0, marker: null, isOpened: false },
        { value: 1, marker: null, isOpened: false },
        { value: 'mine', marker: CELL_MARKERS.QUESTION, isOpened: false },
      ],
      [
        { value: 1, marker: null, isOpened: false },
        { value: 1, marker: CELL_MARKERS.FLAG, isOpened: false },
        { value: 0, marker: null, isOpened: true },
        { value: 1, marker: null, isOpened: false },
        { value: null, marker: CELL_MARKERS.QUESTION, isOpened: false },
      ],
    ];

    expect(revealEmptyCells(board, 4, 5, 0, 0)).toEqual([
      [0, 0],
      [0, 1],
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
        { value: 2, marker: CELL_MARKERS.FLAG, isOpened: false },
        { value: 3, marker: null, isOpened: true },
      ],
      [
        { value: 'mine', marker: null, isOpened: false },
        { value: 1, marker: null, isOpened: false },
        { value: 'mine', marker: CELL_MARKERS.FLAG, isOpened: false },
        { value: 2, marker: CELL_MARKERS.QUESTION, isOpened: false },
      ],
      [
        { value: 0, marker: null, isOpened: false },
        { value: 1, marker: null, isOpened: true },
        { value: 'mine', marker: null, isOpened: false },
        { value: null, marker: CELL_MARKERS.QUESTION, isOpened: false },
      ],
      [
        { value: 'mine', marker: null, isOpened: true },
        { value: 2, marker: null, isOpened: false },
        { value: 3, marker: CELL_MARKERS.FLAG, isOpened: false },
        { value: 1, marker: null, isOpened: false },
      ],
    ];
    const unchangedRow = board[3];
    const unchangedCell = board[0][1];
    const flaggedMineCell = board[1][2];
    const alreadyOpenedCell = board[0][3];

    const nextBoard = applyOpenedCells(board, [
      [0, 0],
      [1, 3],
      [2, 0],
    ]);

    expect(nextBoard[0][0]).toMatchObject({ isOpened: true, marker: null });
    expect(nextBoard[1][3]).toMatchObject({ isOpened: true, marker: null });
    expect(nextBoard[2][0]).toMatchObject({ isOpened: true, marker: null });
    expect(nextBoard[0][1]).toBe(unchangedCell);
    expect(nextBoard[1][2]).toBe(flaggedMineCell);
    expect(nextBoard[0][3]).toBe(alreadyOpenedCell);
    expect(nextBoard[3]).toBe(unchangedRow);
  });
});
