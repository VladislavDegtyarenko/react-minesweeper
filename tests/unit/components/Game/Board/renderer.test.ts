import { describe, expect, it } from 'vitest';
import { CELL_MARKERS } from '@/config';
import {
  BOARD_HOVER_TWEEN_DURATION_MS,
  BOARD_PRESS_TWEEN_DURATION_MS,
  BOARD_RESULT_HIGHLIGHT_TWEEN_DURATION_MS,
  createBoardInteractionTweens,
  createBoardResultHighlightTweens,
  getBoardCanvasAccessibleLabel,
  getBoardCanvasCamera,
  getBoardCanvasDirtyRegion,
  getBoardInteractionDirtyViewport,
  getBoardCanvasMetrics,
  getBoardCanvasShadowGeometry,
  getBoardCellRenderModel,
  getBoardHoverEffectFrame,
  getBoardInteractionEase,
  getMarkerAnimationFrame,
  getBoardResultHighlightBorderWidth,
  getBoardResultHighlightEffectFrame,
  getBoardResultHighlightTarget,
  getVisibleBoardRange,
  hasCompleteBoardCanvasAssets,
  isBoardInteractionDirtyViewportEfficient,
  mixBoardCanvasColors,
  pruneCompletedMarkerAnimations,
  retainBoardInteractionTweenCells,
  sampleBoardInteractionTweens,
  sampleBoardResultHighlightTweens,
  syncBoardResultHighlightTweens,
  syncBoardInteractionTweens,
  type BoardMarkerAnimation,
} from '@/components/Game/components/Board/renderer';
import { getBoardCanvasStyle } from '@/components/Game/components/Board/utils';
import type { GameCell, TBoard } from '@/types';

const createCell = (cell: GameCell): GameCell => cell;

describe('board canvas metrics', () => {
  it('keeps CSS shadow geometry stable across backing-store transforms', () => {
    expect(
      getBoardCanvasShadowGeometry({
        blur: 20,
        offsetY: 4,
        transform: {
          a: 1,
          b: 0,
          c: 0,
          d: 1,
        },
      }),
    ).toEqual({
      blur: 20,
      offsetX: 0,
      offsetY: 4,
    });
    expect(
      getBoardCanvasShadowGeometry({
        blur: 20,
        offsetY: 4,
        transform: {
          a: 2,
          b: 0,
          c: 0,
          d: 2,
        },
      }),
    ).toEqual({
      blur: 40,
      offsetX: 0,
      offsetY: 8,
    });
  });

  it('marks resources ready only when every essential asset loaded', () => {
    const image = {} as HTMLImageElement;

    expect(hasCompleteBoardCanvasAssets({})).toBe(false);
    expect(
      hasCompleteBoardCanvasAssets({
        bomb: image,
        cross: image,
        flag: image,
        question: image,
      }),
    ).toBe(true);
  });

  it('caps the backing store DPR while preserving exact CSS scaling', () => {
    expect(
      getBoardCanvasMetrics({
        cssHeight: 576,
        cssWidth: 1080,
        devicePixelRatio: 3,
      }),
    ).toEqual({
      backingHeight: 1152,
      backingWidth: 2160,
      cssHeight: 576,
      cssWidth: 1080,
      dpr: 2,
      scaleX: 2,
      scaleY: 2,
    });
  });

  it('uses backing-to-CSS ratios after pixel rounding', () => {
    expect(
      getBoardCanvasMetrics({
        cssHeight: 20.4,
        cssWidth: 10.2,
        devicePixelRatio: 1.25,
      }),
    ).toEqual({
      backingHeight: 25,
      backingWidth: 12,
      cssHeight: 20.4,
      cssWidth: 10.2,
      dpr: 1.25,
      scaleX: 12 / 10.2,
      scaleY: 25 / 20.4,
    });
  });

  it('rejects non-positive CSS dimensions', () => {
    expect(
      getBoardCanvasMetrics({
        cssHeight: 0,
        cssWidth: 100,
        devicePixelRatio: 2,
      }),
    ).toBeNull();
  });

  it('reduces DPR for oversized surfaces to cap edge and pixel area', () => {
    const metrics = getBoardCanvasMetrics({
      cssHeight: 3000,
      cssWidth: 5000,
      devicePixelRatio: 3,
    });

    expect(metrics).not.toBeNull();
    expect(metrics!.dpr).toBeLessThan(1);
    expect(metrics!.backingWidth).toBeLessThanOrEqual(4096);
    expect(metrics!.backingHeight).toBeLessThanOrEqual(4096);
    expect(metrics!.backingWidth * metrics!.backingHeight).toBeLessThanOrEqual(
      8_388_608,
    );
  });

  it('keeps the hard pixel budget for fractional CSS dimensions', () => {
    const metrics = getBoardCanvasMetrics({
      cssHeight: 1091.89,
      cssWidth: 2029.34,
      devicePixelRatio: 2,
    });

    expect(metrics).not.toBeNull();
    expect(metrics!.backingWidth * metrics!.backingHeight).toBeLessThanOrEqual(
      8_388_608,
    );
  });

  it('matches the legacy grid CSS dimensions', () => {
    expect(getBoardCanvasStyle({ cols: 9, rows: 9, zoom: 1 })).toEqual({
      height: 'calc(19.125rem + 18px)',
      width: 'calc(19.125rem + 18px)',
    });
    expect(getBoardCanvasStyle({ cols: 30, rows: 16, zoom: 1.5 })).toEqual({
      height: 'calc(51rem + 48px)',
      width: 'calc(95.625rem + 90px)',
    });
  });
});

describe('board canvas camera', () => {
  it('converts the screen viewport into unscaled board coordinates', () => {
    expect(
      getBoardCanvasCamera({
        boardClientHeight: 180,
        boardClientLeft: 1,
        boardClientTop: 1,
        boardClientWidth: 300,
        boardRect: {
          height: 182,
          left: 100,
          top: 50,
          width: 302,
        },
        renderLayerOffsetWidth: 1080,
        renderLayerRect: {
          height: 1248,
          left: -49,
          top: -69,
          width: 1620,
        },
        surfaceRect: {
          height: 1200,
          left: -25,
          top: -45,
          width: 1560,
        },
      }),
    ).toEqual({
      canvasCssHeight: 120,
      canvasCssWidth: 200,
      layerX: 100,
      layerY: 80,
      previewScale: 1.5,
      screenHeight: 180,
      screenWidth: 300,
      surfaceHeight: 800,
      surfaceOffsetX: 16,
      surfaceOffsetY: 16,
      surfaceWidth: 1040,
      viewport: {
        height: 120,
        width: 200,
        x: 84,
        y: 64,
      },
    });
  });

  it('adds one-cell overscan and excludes the rest of the board', () => {
    expect(
      getVisibleBoardRange({
        cols: 30,
        rows: 16,
        surfaceHeight: 576,
        surfaceWidth: 1080,
        viewport: {
          height: 216,
          width: 360,
          x: 360,
          y: 72,
        },
      }),
    ).toEqual({
      endColumn: 21,
      endRow: 9,
      startColumn: 9,
      startRow: 1,
    });
  });

  it('keeps fixed outer bleed outside the scaled render layer', () => {
    expect(
      getBoardCanvasCamera({
        boardClientHeight: 180,
        boardClientLeft: 1,
        boardClientTop: 1,
        boardClientWidth: 300,
        boardRect: {
          height: 182,
          left: 100,
          top: 50,
          width: 302,
        },
        renderLayerOffsetWidth: 324,
        renderLayerRect: {
          height: 405,
          left: 111,
          top: 61,
          width: 405,
        },
        surfaceRect: {
          height: 405,
          left: 111,
          top: 61,
          width: 405,
        },
      }),
    ).toEqual({
      canvasCssHeight: 144,
      canvasCssWidth: 240,
      layerX: -8,
      layerY: -8,
      previewScale: 1.25,
      screenHeight: 180,
      screenWidth: 300,
      surfaceHeight: 324,
      surfaceOffsetX: 0,
      surfaceOffsetY: 0,
      surfaceWidth: 324,
      viewport: {
        height: 144,
        width: 240,
        x: -8,
        y: -8,
      },
    });
  });

  it('can select only cells intersecting a dirty viewport', () => {
    expect(
      getVisibleBoardRange({
        cols: 9,
        overscan: 0,
        rows: 9,
        surfaceHeight: 324,
        surfaceWidth: 324,
        viewport: {
          height: 84,
          width: 84,
          x: -16,
          y: -16,
        },
      }),
    ).toEqual({
      endColumn: 2,
      endRow: 2,
      startColumn: 0,
      startRow: 0,
    });
  });
});

describe('board canvas dirty region', () => {
  const fullViewport = {
    height: 356,
    width: 356,
    x: -16,
    y: -16,
  };

  it('unites interaction cells and includes fixed shadow bleed', () => {
    expect(
      getBoardInteractionDirtyViewport({
        cellKeys: new Set(['0:0', '0:1']),
        cols: 9,
        rows: 9,
        surfaceHeight: 324,
        surfaceWidth: 324,
        viewport: fullViewport,
      }),
    ).toEqual({
      height: 84,
      width: 120,
      x: -16,
      y: -16,
    });
  });

  it('clips dirty work to the visible world viewport', () => {
    expect(
      getBoardInteractionDirtyViewport({
        cellKeys: new Set(['2:10']),
        cols: 30,
        rows: 16,
        surfaceHeight: 576,
        surfaceWidth: 1080,
        viewport: {
          height: 216,
          width: 360,
          x: 360,
          y: 72,
        },
      }),
    ).toEqual({
      height: 68,
      width: 68,
      x: 360,
      y: 72,
    });
  });

  it('ignores malformed and off-board cell keys', () => {
    expect(
      getBoardInteractionDirtyViewport({
        cellKeys: new Set(['bad-key', '9:0', '0:9']),
        cols: 9,
        rows: 9,
        surfaceHeight: 324,
        surfaceWidth: 324,
        viewport: fullViewport,
      }),
    ).toBeNull();
    expect(
      getBoardInteractionDirtyViewport({
        cellKeys: new Set(['0:0']),
        cols: 30,
        rows: 16,
        surfaceHeight: 576,
        surfaceWidth: 1080,
        viewport: {
          height: 216,
          width: 360,
          x: 360,
          y: 72,
        },
      }),
    ).toBeNull();
  });

  it('falls back when the dirty rectangle covers too much of the viewport', () => {
    expect(
      isBoardInteractionDirtyViewportEfficient({
        dirtyViewport: {
          height: 100,
          width: 100,
          x: 0,
          y: 0,
        },
        fullViewport: {
          height: 200,
          width: 200,
          x: 0,
          y: 0,
        },
      }),
    ).toBe(true);
    expect(
      isBoardInteractionDirtyViewportEfficient({
        dirtyViewport: {
          height: 180,
          width: 180,
          x: 0,
          y: 0,
        },
        fullViewport: {
          height: 200,
          width: 200,
          x: 0,
          y: 0,
        },
      }),
    ).toBe(false);
  });

  it('rounds to device pixels and maps the cleared rectangle back to world', () => {
    expect(
      getBoardCanvasDirtyRegion({
        backingHeight: 360,
        backingWidth: 500,
        dirtyViewport: {
          height: 10.1,
          width: 20.1,
          x: 100.2,
          y: 70.2,
        },
        fullViewport: {
          height: 120,
          width: 200,
          x: 84,
          y: 64,
        },
        scaleX: 2.5,
        scaleY: 3,
      }),
    ).toEqual({
      deviceRect: {
        height: 31,
        width: 51,
        x: 40,
        y: 18,
      },
      worldViewport: {
        height: 31 / 3,
        width: 51 / 2.5,
        x: 100,
        y: 70,
      },
    });
  });
});

describe('board interaction tween', () => {
  const firstCell = { cellIndex: 0, rowIndex: 0 };
  const secondCell = { cellIndex: 1, rowIndex: 0 };

  const sync = ({
    hoverSnapRevision = 0,
    hoveredCell = null,
    now,
    pressSnapRevision = 0,
    pressedCell = null,
    tweens,
  }: {
    hoverSnapRevision?: number;
    hoveredCell?: typeof firstCell | null;
    now: number;
    pressSnapRevision?: number;
    pressedCell?: typeof firstCell | null;
    tweens: ReturnType<typeof createBoardInteractionTweens>;
  }) =>
    syncBoardInteractionTweens({
      hoverSnapRevision,
      hoveredCell,
      now,
      pressSnapRevision,
      pressedCell,
      tweens,
    });

  it('matches CSS ease endpoints and timing channels', () => {
    expect(getBoardInteractionEase(0)).toBe(0);
    expect(getBoardInteractionEase(0.5)).toBeCloseTo(0.8024, 3);
    expect(getBoardInteractionEase(1)).toBe(1);
    expect(BOARD_HOVER_TWEEN_DURATION_MS).toBe(120);
    expect(BOARD_PRESS_TWEEN_DURATION_MS).toBe(80);
  });

  it('interpolates fixed CSS hover geometry independently of zoom', () => {
    expect(
      getBoardHoverEffectFrame({
        baseBorderWidth: 1.5,
        progress: 0.5,
      }),
    ).toEqual({
      borderWidth: 1.25,
      blur: 6,
      offsetY: 2,
      opacity: 0.5,
    });
    expect(
      getBoardHoverEffectFrame({
        baseBorderWidth: 2,
        progress: 1,
      }),
    ).toEqual({
      borderWidth: 1,
      blur: 12,
      offsetY: 4,
      opacity: 1,
    });
    expect(
      getBoardHoverEffectFrame({
        baseBorderWidth: 0.5,
        progress: 1,
      }),
    ).toEqual({
      borderWidth: 1,
      blur: 12,
      offsetY: 4,
      opacity: 1,
    });
  });

  it('retargets hover without a visual jump and scales reverse duration', () => {
    const tweens = createBoardInteractionTweens();

    sync({ hoveredCell: firstCell, now: 0, tweens });
    const midpoint = sampleBoardInteractionTweens(tweens, 60);
    const midpointValue = midpoint.byCell.get('0:0')!.hover;

    expect(midpoint.isActive).toBe(true);
    expect(midpointValue).toBeGreaterThan(0);
    expect(midpointValue).toBeLessThan(1);

    sync({ now: 60, tweens });
    const reversedAtSameTime = sampleBoardInteractionTweens(tweens, 60);

    expect(reversedAtSameTime.byCell.get('0:0')!.hover).toBeCloseTo(
      midpointValue,
      8,
    );
    expect(
      sampleBoardInteractionTweens(
        tweens,
        60 + BOARD_HOVER_TWEEN_DURATION_MS * midpointValue,
      ).byCell.has('0:0'),
    ).toBe(false);
  });

  it('keeps rapid cell-to-cell retargets continuous', () => {
    const tweens = createBoardInteractionTweens();

    sync({ hoveredCell: firstCell, now: 0, tweens });
    sampleBoardInteractionTweens(tweens, 30);
    sync({ hoveredCell: secondCell, now: 30, tweens });
    const switched = sampleBoardInteractionTweens(tweens, 30);

    expect(switched.byCell.get('0:0')!.hover).toBeGreaterThan(0);
    expect(switched.byCell.get('0:1')?.hover ?? 0).toBe(0);

    sync({ hoveredCell: firstCell, now: 45, tweens });
    const switchedBack = sampleBoardInteractionTweens(tweens, 45);

    expect(switchedBack.isActive).toBe(true);
    expect(switchedBack.byCell.get('0:0')!.hover).toBeGreaterThan(0);
    expect(switchedBack.byCell.get('0:1')!.hover).toBeGreaterThan(0);
  });

  it('snap-clears active press feedback for a pinch', () => {
    const tweens = createBoardInteractionTweens();

    sync({ now: 0, pressedCell: firstCell, tweens });
    expect(sampleBoardInteractionTweens(tweens, 20).isActive).toBe(true);

    sync({
      now: 20,
      pressSnapRevision: 1,
      tweens,
    });

    expect(sampleBoardInteractionTweens(tweens, 20)).toEqual({
      byCell: new Map(),
      isActive: false,
    });
  });

  it('drops tweens for cells whose closed overlay disappeared', () => {
    const tweens = createBoardInteractionTweens();

    sync({ hoveredCell: firstCell, now: 0, tweens });
    sampleBoardInteractionTweens(tweens, 20);
    retainBoardInteractionTweenCells(tweens, new Set(['0:1']));

    expect(sampleBoardInteractionTweens(tweens, 20)).toEqual({
      byCell: new Map(),
      isActive: false,
    });
  });
});

describe('board result highlight tween', () => {
  const normalMine = createCell({
    isOpened: false,
    marker: null,
    value: 'mine',
  });
  const openedRedMine = createCell({
    highlight: 'red',
    isOpened: true,
    marker: null,
    value: 'mine',
  });

  const syncResult = ({
    board,
    isGameLost = false,
    now,
    tweens,
  }: {
    board: TBoard;
    isGameLost?: boolean;
    now: number;
    tweens: ReturnType<typeof createBoardResultHighlightTweens>;
  }) =>
    syncBoardResultHighlightTweens({
      board,
      isGameLost,
      now,
      tweens,
    });

  it('matches the 120ms CSS ease and interpolates shadow geometry', () => {
    const tweens = createBoardResultHighlightTweens();

    syncResult({ board: [[normalMine]], now: 0, tweens });
    syncResult({
      board: [[openedRedMine]],
      isGameLost: true,
      now: 100,
      tweens,
    });

    expect(sampleBoardResultHighlightTweens(tweens, 100)).toEqual({
      byCell: new Map(),
      isActive: true,
    });

    const middle = sampleBoardResultHighlightTweens(tweens, 160);
    const middleProgress = getBoardInteractionEase(0.5);

    expect(BOARD_RESULT_HIGHLIGHT_TWEEN_DURATION_MS).toBe(120);
    expect(middle.isActive).toBe(true);
    expect(middle.byCell.get('0:0')?.surfaceRed).toBeCloseTo(middleProgress, 8);
    expect(
      getBoardResultHighlightEffectFrame({
        channel: 'surfaceRed',
        progress: middleProgress,
      }),
    ).toEqual({
      blur: 20 * middleProgress,
      opacity: middleProgress,
      spread: 2 * middleProgress,
    });
    expect(
      getBoardResultHighlightEffectFrame({
        channel: 'overlayRed',
        progress: 1,
      }),
    ).toEqual({
      blur: 12,
      opacity: 1,
      spread: 1,
    });
    expect(
      getBoardResultHighlightEffectFrame({
        channel: 'overlayGreen',
        progress: 1,
      }),
    ).toEqual({
      blur: 0,
      opacity: 1,
      spread: 1,
    });
    expect(
      getBoardResultHighlightBorderWidth({
        baseWidth: 1.5,
        progress: middleProgress,
      }),
    ).toBeCloseTo(1.5 + (1 - 1.5) * middleProgress, 8);
    expect(
      getBoardResultHighlightBorderWidth({
        baseWidth: 1.5,
        progress: 1,
      }),
    ).toBe(1);

    expect(sampleBoardResultHighlightTweens(tweens, 220)).toEqual({
      byCell: new Map([
        [
          '0:0',
          {
            overlayGreen: 0,
            overlayRed: 0,
            surfaceRed: 1,
          },
        ],
      ]),
      isActive: false,
    });
  });

  it('animates only the closed green overlay on a win', () => {
    const closedGreenMine = createCell({
      highlight: 'green',
      isOpened: false,
      marker: CELL_MARKERS.FLAG,
      value: 'mine',
    });
    const openedGreenMine = createCell({
      highlight: 'green',
      isOpened: true,
      marker: null,
      value: 'mine',
    });
    const tweens = createBoardResultHighlightTweens();

    syncResult({ board: [[normalMine, normalMine]], now: 0, tweens });
    syncResult({
      board: [[closedGreenMine, openedGreenMine]],
      now: 10,
      tweens,
    });

    const middle = sampleBoardResultHighlightTweens(tweens, 70);

    expect(getBoardResultHighlightTarget(closedGreenMine, false)).toBe(
      'overlayGreen',
    );
    expect(getBoardResultHighlightTarget(openedGreenMine, false)).toBeNull();
    expect(middle.byCell.get('0:0')?.overlayGreen).toBeGreaterThan(0);
    expect(middle.byCell.has('0:1')).toBe(false);
    expect(middle.isActive).toBe(true);
  });

  it('reverses from the sampled value without a jump', () => {
    const closedGreenMine = createCell({
      highlight: 'green',
      isOpened: false,
      marker: CELL_MARKERS.FLAG,
      value: 'mine',
    });
    const tweens = createBoardResultHighlightTweens();

    syncResult({ board: [[normalMine]], now: 0, tweens });
    syncResult({ board: [[closedGreenMine]], now: 100, tweens });

    const beforeReverse = sampleBoardResultHighlightTweens(
      tweens,
      160,
    ).byCell.get('0:0')!.overlayGreen;

    syncResult({ board: [[normalMine]], now: 160, tweens });

    expect(
      sampleBoardResultHighlightTweens(tweens, 160).byCell.get('0:0')
        ?.overlayGreen,
    ).toBeCloseTo(beforeReverse, 8);
    expect(
      sampleBoardResultHighlightTweens(tweens, 260).byCell.has('0:0'),
    ).toBe(false);
    expect(sampleBoardResultHighlightTweens(tweens, 260).isActive).toBe(false);
  });

  it('interpolates Canvas colors while keeping exact endpoints', () => {
    expect(mixBoardCanvasColors('#000000', '#ffffff', 0)).toBe('#000000');
    expect(mixBoardCanvasColors('#000000', '#ffffff', 0.5)).toBe(
      'rgba(127.5, 127.5, 127.5, 1)',
    );
    expect(mixBoardCanvasColors('#000000', 'rgba(255, 0, 0, 0.2)', 0.5)).toBe(
      'rgba(42.5, 0, 0, 0.6)',
    );
    expect(mixBoardCanvasColors('#000000', '#ffffff', 1)).toBe('#ffffff');
  });
});

describe('board cell render model', () => {
  it('provides a dynamic text alternative for the visual canvas', () => {
    const board = [
      [
        createCell({ isOpened: true, marker: null, value: 2 }),
        createCell({
          isOpened: false,
          marker: CELL_MARKERS.FLAG,
          value: 1,
        }),
      ],
      [
        createCell({ isOpened: true, marker: null, value: 0 }),
        createCell({
          isOpened: false,
          marker: CELL_MARKERS.FLAG,
          value: 1,
        }),
      ],
    ];

    expect(
      getBoardCanvasAccessibleLabel({
        board,
        isGameLost: true,
      }),
    ).toBe(
      'Minesweeper board, 2 rows by 2 columns. ' +
        'Row 1: 2, incorrect flag Row 2: empty, incorrect flag',
    );
  });

  it.each([
    {
      cell: createCell({ isOpened: false, marker: null, value: null }),
      content: 'none',
      label: 'closed cell',
    },
    {
      cell: createCell({
        isOpened: false,
        marker: CELL_MARKERS.FLAG,
        value: 2,
      }),
      content: 'flag',
      label: 'flagged cell',
    },
    {
      cell: createCell({
        isOpened: false,
        marker: CELL_MARKERS.QUESTION,
        value: 2,
      }),
      content: 'question',
      label: 'question-marked cell',
    },
    {
      cell: createCell({ isOpened: true, marker: null, value: 0 }),
      content: 'none',
      label: 'opened zero',
    },
    {
      cell: createCell({ isOpened: true, marker: null, value: 4 }),
      content: 'number',
      label: 'opened number',
    },
    {
      cell: createCell({ isOpened: true, marker: null, value: 'mine' }),
      content: 'bomb',
      label: 'opened mine',
    },
  ])('maps $label to $content content', ({ cell, content }) => {
    expect(getBoardCellRenderModel(cell, false).content).toBe(content);
  });

  it('keeps the opened number value', () => {
    expect(
      getBoardCellRenderModel(
        createCell({ isOpened: true, marker: null, value: 8 }),
        false,
      ).number,
    ).toBe(8);
  });

  it('maps loss and win highlights with current DOM parity', () => {
    expect(
      getBoardCellRenderModel(
        createCell({
          highlight: 'red',
          isOpened: true,
          marker: null,
          value: 'mine',
        }),
        true,
      ),
    ).toMatchObject({
      overlayHighlight: null,
      surfaceHighlight: 'red',
    });

    expect(
      getBoardCellRenderModel(
        createCell({
          highlight: 'green',
          isOpened: false,
          marker: CELL_MARKERS.FLAG,
          value: 'mine',
        }),
        false,
      ),
    ).toMatchObject({
      overlayHighlight: 'green',
      surfaceHighlight: null,
    });

    expect(
      getBoardCellRenderModel(
        createCell({
          highlight: 'green',
          isOpened: true,
          marker: null,
          value: 'mine',
        }),
        false,
      ),
    ).toMatchObject({
      overlayHighlight: null,
      surfaceHighlight: null,
    });
  });

  it('draws a cross only over an incorrect flag after a loss', () => {
    const incorrectlyFlaggedCell = createCell({
      isOpened: false,
      marker: CELL_MARKERS.FLAG,
      value: 1,
    });

    expect(
      getBoardCellRenderModel(incorrectlyFlaggedCell, true).showWrongFlagCross,
    ).toBe(true);
    expect(
      getBoardCellRenderModel(incorrectlyFlaggedCell, false).showWrongFlagCross,
    ).toBe(false);
  });
});

describe('board marker animation', () => {
  const animation = {
    marker: CELL_MARKERS.FLAG,
    startedAt: 100,
  };

  it('moves and fades a newly mounted marker into place', () => {
    expect(
      getMarkerAnimationFrame({
        animation,
        now: 100,
        zoom: 1.5,
      }),
    ).toEqual({
      isActive: true,
      opacity: 0,
      translateY: -75,
    });

    const middle = getMarkerAnimationFrame({
      animation,
      now: 175,
      zoom: 1,
    });

    expect(middle.isActive).toBe(true);
    expect(middle.opacity).toBeGreaterThan(0);
    expect(middle.opacity).toBeLessThan(1);
    expect(middle.translateY).toBeGreaterThan(-50);
    expect(middle.translateY).toBeLessThan(0);

    expect(
      getMarkerAnimationFrame({
        animation,
        now: 250,
        zoom: 1,
      }),
    ).toEqual({
      isActive: false,
      opacity: 1,
      translateY: 0,
    });
  });

  it('prunes completed markers without removing active animations', () => {
    const animations = new Map<string, BoardMarkerAnimation>([
      ['0:0', animation],
      [
        '0:1',
        {
          marker: CELL_MARKERS.QUESTION,
          startedAt: 249,
        },
      ],
    ]);

    expect(
      pruneCompletedMarkerAnimations({
        animations,
        now: 250,
      }),
    ).toBe(true);
    expect([...animations.keys()]).toEqual(['0:1']);
    expect(
      pruneCompletedMarkerAnimations({
        animations,
        now: 250,
      }),
    ).toBe(false);
  });
});
