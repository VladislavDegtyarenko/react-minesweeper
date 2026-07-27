import { describe, expect, it } from 'vitest';
import {
  getBoardCellClientRect,
  getBoardCellFromClientPoint,
  getBoardCellGroupClientRect,
} from '@/components/Game/components/Board/geometry';
import type { BoardClientRect } from '@/components/Game/components/Board/types';

const SURFACE_RECT: BoardClientRect = {
  top: 200,
  left: 100,
  width: 360,
  height: 720,
  bottom: 920,
  right: 460,
};

describe('board geometry', () => {
  it('maps client coordinates to cells on a scaled surface', () => {
    expect(
      getBoardCellFromClientPoint({
        clientX: 221,
        clientY: 401,
        rows: 9,
        cols: 9,
        surfaceRect: SURFACE_RECT,
      }),
    ).toEqual({ rowIndex: 2, cellIndex: 3 });

    expect(
      getBoardCellFromClientPoint({
        clientX: SURFACE_RECT.right - 0.01,
        clientY: SURFACE_RECT.bottom - 0.01,
        rows: 9,
        cols: 9,
        surfaceRect: SURFACE_RECT,
      }),
    ).toEqual({ rowIndex: 8, cellIndex: 8 });
  });

  it('rejects points outside the surface and invalid grids', () => {
    expect(
      getBoardCellFromClientPoint({
        clientX: SURFACE_RECT.right,
        clientY: SURFACE_RECT.top,
        rows: 9,
        cols: 9,
        surfaceRect: SURFACE_RECT,
      }),
    ).toBeNull();

    expect(
      getBoardCellFromClientPoint({
        clientX: SURFACE_RECT.left,
        clientY: SURFACE_RECT.top,
        rows: 0,
        cols: 9,
        surfaceRect: SURFACE_RECT,
      }),
    ).toBeNull();
  });

  it('returns a cell client rect from logical grid coordinates', () => {
    expect(
      getBoardCellClientRect({
        rowIndex: 2,
        cellIndex: 3,
        rows: 9,
        cols: 9,
        surfaceRect: SURFACE_RECT,
      }),
    ).toEqual({
      top: 360,
      left: 220,
      width: 40,
      height: 80,
      bottom: 440,
      right: 260,
    });
  });

  it('returns the union rect for a cell group', () => {
    expect(
      getBoardCellGroupClientRect({
        cells: [
          { rowIndex: 1, cellIndex: 1 },
          { rowIndex: 2, cellIndex: 3 },
        ],
        rows: 9,
        cols: 9,
        surfaceRect: SURFACE_RECT,
      }),
    ).toEqual({
      top: 280,
      left: 140,
      width: 120,
      height: 160,
      bottom: 440,
      right: 260,
    });
  });

  it('rejects cells outside the logical grid', () => {
    expect(
      getBoardCellClientRect({
        rowIndex: 9,
        cellIndex: 0,
        rows: 9,
        cols: 9,
        surfaceRect: SURFACE_RECT,
      }),
    ).toBeNull();
  });
});
