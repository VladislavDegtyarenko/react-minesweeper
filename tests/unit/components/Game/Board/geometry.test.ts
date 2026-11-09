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

describe('board geometry boundaries', () => {
  it('round-trips every cell center after fractional scaling and scrolling', () => {
    for (const scale of [0.65, 1, 1.375, 2]) {
      const surfaceRect = {
        left: -117.25,
        top: -35.5,
        width: 930 * scale,
        height: 496 * scale,
        right: -117.25 + 930 * scale,
        bottom: -35.5 + 496 * scale,
      };
      for (let rowIndex = 0; rowIndex < 16; rowIndex++) {
        for (let cellIndex = 0; cellIndex < 30; cellIndex++) {
          const cellRect = getBoardCellClientRect({
            rowIndex,
            cellIndex,
            rows: 16,
            cols: 30,
            surfaceRect,
          });
          expect(cellRect).not.toBeNull();
          expect(
            getBoardCellFromClientPoint({
              rows: 16,
              cols: 30,
              surfaceRect,
              clientX: cellRect!.left + cellRect!.width / 2,
              clientY: cellRect!.top + cellRect!.height / 2,
            }),
          ).toEqual({ rowIndex, cellIndex });
        }
      }
    }
  });

  it('includes the upper-left edge but excludes the lower-right edges', () => {
    const options = { rows: 9, cols: 9, surfaceRect: SURFACE_RECT };
    expect(
      getBoardCellFromClientPoint({ ...options, clientX: 100, clientY: 200 }),
    ).toEqual({ rowIndex: 0, cellIndex: 0 });
    for (const [clientX, clientY] of [
      [99.99, 200],
      [100, 199.99],
      [460, 200],
      [100, 920],
    ]) {
      expect(
        getBoardCellFromClientPoint({ ...options, clientX, clientY }),
      ).toBeNull();
    }
    expect(
      getBoardCellFromClientPoint({ ...options, clientX: 140, clientY: 280 }),
    ).toEqual({ rowIndex: 1, cellIndex: 1 });
  });

  it('rejects non-finite pointer positions before producing cell indexes', () => {
    for (const value of [NaN, Infinity, -Infinity]) {
      expect(
        getBoardCellFromClientPoint({
          rows: 9,
          cols: 9,
          surfaceRect: SURFACE_RECT,
          clientX: value,
          clientY: 200,
        }),
      ).toBeNull();
      expect(
        getBoardCellFromClientPoint({
          rows: 9,
          cols: 9,
          surfaceRect: SURFACE_RECT,
          clientX: 100,
          clientY: value,
        }),
      ).toBeNull();
    }
  });

  it('rejects unusable layout rectangles in both coordinate directions', () => {
    for (const invalid of [
      { left: NaN },
      { top: Infinity },
      { width: 0 },
      { height: -1 },
      { width: Infinity },
    ]) {
      const options = {
        rows: 9,
        cols: 9,
        surfaceRect: { ...SURFACE_RECT, ...invalid },
      };
      expect(
        getBoardCellFromClientPoint({ ...options, clientX: 100, clientY: 200 }),
      ).toBeNull();
      expect(
        getBoardCellClientRect({ ...options, rowIndex: 0, cellIndex: 0 }),
      ).toBeNull();
    }
  });
});
