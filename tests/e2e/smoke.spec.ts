import { expect, test, type Locator, type Page } from '@playwright/test';

type PointerEventType =
  | 'pointercancel'
  | 'pointerdown'
  | 'pointermove'
  | 'pointerup';

const getRequiredBoundingBox = async (locator: Locator) => {
  const boundingBox = await locator.boundingBox();

  expect(boundingBox).not.toBeNull();

  return boundingBox!;
};

const getCanvasBleedInsets = (frame: Locator) =>
  frame.evaluate((element) => {
    const surface = element.querySelector('[data-board-surface="true"]');

    if (!(surface instanceof HTMLElement)) {
      return null;
    }

    const frameRect = element.getBoundingClientRect();
    const surfaceRect = surface.getBoundingClientRect();

    return {
      bottom: frameRect.bottom - surfaceRect.bottom,
      left: surfaceRect.left - frameRect.left,
      right: frameRect.right - surfaceRect.right,
      top: surfaceRect.top - frameRect.top,
    };
  });

const getMaxInsetError = (
  insets: Awaited<ReturnType<typeof getCanvasBleedInsets>>,
  expectedInset: number,
): number => {
  expect(insets).not.toBeNull();

  return Math.max(
    ...Object.values(insets!).map((inset) => Math.abs(inset - expectedInset)),
  );
};

const getBoardCellBox = async (
  surface: Locator,
  rowIndex: number,
  cellIndex: number,
) => {
  const [surfaceBox, rowsAttribute, colsAttribute] = await Promise.all([
    getRequiredBoundingBox(surface),
    surface.getAttribute('data-board-rows'),
    surface.getAttribute('data-board-cols'),
  ]);
  const rows = Number(rowsAttribute);
  const cols = Number(colsAttribute);

  expect(Number.isInteger(rows) && rows > 0).toBe(true);
  expect(Number.isInteger(cols) && cols > 0).toBe(true);

  const width = surfaceBox.width / cols;
  const height = surfaceBox.height / rows;

  return {
    x: surfaceBox.x + cellIndex * width,
    y: surfaceBox.y + rowIndex * height,
    width,
    height,
  };
};

const getCanvasCellFingerprint = (
  surface: Locator,
  rowIndex: number,
  cellIndex: number,
) =>
  surface.evaluate(
    (element, coordinates) => {
      if (!(element instanceof HTMLCanvasElement)) {
        return null;
      }

      const context = element.getContext('2d');
      const surface = element.parentElement?.querySelector(
        '[data-board-surface="true"]',
      );
      const rows =
        surface instanceof HTMLElement
          ? Number(surface.dataset.boardRows)
          : Number.NaN;
      const cols =
        surface instanceof HTMLElement
          ? Number(surface.dataset.boardCols)
          : Number.NaN;
      const canvasRect = element.getBoundingClientRect();
      const surfaceRect =
        surface instanceof HTMLElement ? surface.getBoundingClientRect() : null;

      if (
        !context ||
        !surfaceRect ||
        canvasRect.width <= 0 ||
        canvasRect.height <= 0 ||
        !Number.isInteger(rows) ||
        !Number.isInteger(cols) ||
        rows <= 0 ||
        cols <= 0
      ) {
        return null;
      }

      const bitmapScaleX = element.width / canvasRect.width;
      const bitmapScaleY = element.height / canvasRect.height;
      const logicalX = (surfaceRect.left - canvasRect.left) * bitmapScaleX;
      const logicalY = (surfaceRect.top - canvasRect.top) * bitmapScaleY;
      const cellWidth = (surfaceRect.width * bitmapScaleX) / cols;
      const cellHeight = (surfaceRect.height * bitmapScaleY) / rows;
      const sampleWidth = Math.max(1, Math.floor(cellWidth * 0.6));
      const sampleHeight = Math.max(1, Math.floor(cellHeight * 0.6));
      const x = Math.floor(
        logicalX +
          coordinates.cellIndex * cellWidth +
          (cellWidth - sampleWidth) / 2,
      );
      const y = Math.floor(
        logicalY +
          coordinates.rowIndex * cellHeight +
          (cellHeight - sampleHeight) / 2,
      );
      const pixels = context.getImageData(x, y, sampleWidth, sampleHeight).data;
      let hash = 2166136261;

      for (const value of pixels) {
        hash ^= value;
        hash = Math.imul(hash, 16777619);
      }

      return hash >>> 0;
    },
    { cellIndex, rowIndex },
  );

const getCanvasDrawStats = (page: Page) =>
  page.evaluate(() => {
    const snapshot = (
      window as Window & {
        __MINESWEEPER_PINCH_PERF_DEBUG__?: {
          canvasDirtyDraws: number;
          canvasDraws: number;
          canvasFullDraws: number;
          enabled: boolean;
        };
      }
    ).__MINESWEEPER_PINCH_PERF_DEBUG__;

    return {
      canvasDirtyDraws: snapshot?.canvasDirtyDraws ?? 0,
      canvasDraws: snapshot?.canvasDraws ?? 0,
      canvasFullDraws: snapshot?.canvasFullDraws ?? 0,
      enabled: snapshot?.enabled ?? false,
    };
  });

const getCanvasDrawCount = async (page: Page) =>
  (await getCanvasDrawStats(page)).canvasDraws;

const getPreviewCanvasStats = (canvas: Locator) =>
  canvas.evaluate((element) => {
    if (!(element instanceof HTMLCanvasElement)) {
      return null;
    }

    const context = element.getContext('2d');
    const rect = element.getBoundingClientRect();
    const rows = Number(element.dataset.previewBoardRows);
    const cols = Number(element.dataset.previewBoardCols);

    if (!context || rect.width <= 0 || rect.height <= 0) {
      return null;
    }

    const pixels = context.getImageData(
      0,
      0,
      element.width,
      element.height,
    ).data;
    const sampleStride = Math.max(4, Math.floor(pixels.length / 4096 / 4) * 4);
    let hasVisiblePixel = false;

    for (let index = 3; index < pixels.length; index += sampleStride) {
      if (pixels[index] !== 0) {
        hasVisiblePixel = true;
        break;
      }
    }

    return {
      backingHeight: element.height,
      backingWidth: element.width,
      cols,
      cssHeight: rect.height,
      cssWidth: rect.width,
      hasVisiblePixel,
      rows,
      visibleCells: Number(element.dataset.previewBoardCanvasVisibleCells),
    };
  });

const getCanvasLeftBleedFingerprint = (canvas: Locator) =>
  canvas.evaluate((element) => {
    if (!(element instanceof HTMLCanvasElement)) {
      return null;
    }

    const context = element.getContext('2d');
    const surface = element.parentElement?.querySelector(
      '[data-board-surface="true"]',
    );

    if (!context || !(surface instanceof HTMLElement)) {
      return null;
    }

    const canvasRect = element.getBoundingClientRect();
    const surfaceRect = surface.getBoundingClientRect();
    const rows = Number(surface.dataset.boardRows);

    if (
      canvasRect.width <= 0 ||
      canvasRect.height <= 0 ||
      !Number.isInteger(rows) ||
      rows <= 0
    ) {
      return null;
    }

    const scaleX = element.width / canvasRect.width;
    const scaleY = element.height / canvasRect.height;
    const logicalLeft = (surfaceRect.left - canvasRect.left) * scaleX;
    const logicalTop = (surfaceRect.top - canvasRect.top) * scaleY;
    const cellHeight = (surfaceRect.height * scaleY) / rows;
    const sampleWidth = Math.max(1, Math.floor(8 * scaleX));
    const sampleHeight = Math.max(1, Math.floor(cellHeight * 0.7));
    const x = Math.max(0, Math.floor(logicalLeft - sampleWidth));
    const y = Math.max(
      0,
      Math.floor(logicalTop + (cellHeight - sampleHeight) / 2),
    );
    const pixels = context.getImageData(x, y, sampleWidth, sampleHeight).data;
    let hash = 2166136261;

    for (const value of pixels) {
      hash ^= value;
      hash = Math.imul(hash, 16777619);
    }

    return hash >>> 0;
  });

const expectSpotlightMatchesCellGeometry = async (
  spotlight: Locator,
  boardSurface: Locator,
) => {
  await expect
    .poll(async () => {
      const [cellBox, spotlightBox, surfaceBox] = await Promise.all([
        getBoardCellBox(boardSurface, 0, 0),
        getRequiredBoundingBox(spotlight),
        getRequiredBoundingBox(boardSurface),
      ]);
      const columnOffset = (spotlightBox.x - surfaceBox.x) / cellBox.width;
      const rowOffset = (spotlightBox.y - surfaceBox.y) / cellBox.height;

      return Math.max(
        Math.abs(spotlightBox.width - cellBox.width),
        Math.abs(spotlightBox.height - cellBox.height),
        Math.abs(columnOffset - Math.round(columnOffset)) * cellBox.width,
        Math.abs(rowOffset - Math.round(rowOffset)) * cellBox.height,
      );
    })
    .toBeLessThan(1);
};

const dispatchTouchPointer = (
  locator: Locator,
  type: PointerEventType,
  pointerId: number,
  x: number,
  y: number,
) =>
  locator.dispatchEvent(type, {
    bubbles: true,
    button: 0,
    buttons: 1,
    cancelable: true,
    clientX: x,
    clientY: y,
    isPrimary: pointerId === 1,
    pageX: x,
    pageY: y,
    pointerId,
    pointerType: 'touch',
    screenX: x,
    screenY: y,
  });

const installPreTourFocus = (page: Page) =>
  page.addInitScript(() => {
    window.localStorage.setItem('ZOOM', '1');

    const mountPreTourFocus = () => {
      if (!document.body) {
        return false;
      }

      const previousFocusButton = document.createElement('button');

      previousFocusButton.id = 'pre-tour-focus';
      previousFocusButton.style.position = 'fixed';
      previousFocusButton.style.left = '-10000px';
      previousFocusButton.textContent = 'Pre-tour focus';
      document.body.append(previousFocusButton);
      previousFocusButton.focus();

      return true;
    };

    if (mountPreTourFocus()) {
      return undefined;
    }

    const bodyObserver = new MutationObserver(() => {
      if (mountPreTourFocus()) {
        bodyObserver.disconnect();
      }
    });

    bodyObserver.observe(document, {
      childList: true,
      subtree: true,
    });

    return undefined;
  });

test('loads lobby and game screens', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('ONBOARDING_SEEN_V1', 'true');
  });

  await page.goto('/');

  await expect(page.locator('body')).toBeVisible();
  await expect(page.locator('body')).not.toBeEmpty();
  await page.screenshot({ path: 'test-results/lobby-smoke.png' });

  await page.goto('/game');

  const board = page.locator('[data-tour-id="board"]');
  const boardSurface = page.locator('[data-board-surface="true"]');
  const boardCanvas = page.locator('[data-board-canvas="true"]');

  await expect(page.locator('body')).toBeVisible();
  await expect(page.locator('body')).not.toBeEmpty();
  await expect(board).toBeVisible();
  await expect(boardSurface).toBeVisible();
  await expect(boardCanvas).toBeVisible();
  await expect(boardCanvas).toHaveAttribute('data-board-canvas-ready', 'true');
  await expect
    .poll(() =>
      boardCanvas.evaluate((element) => element instanceof HTMLCanvasElement),
    )
    .toBe(true);

  const firstCellBox = await getBoardCellBox(boardSurface, 0, 0);
  await page.mouse.click(
    firstCellBox.x + firstCellBox.width / 2,
    firstCellBox.y + firstCellBox.height / 2,
  );
  await page.screenshot({ path: 'test-results/game-smoke.png' });
});

test('renders lobby previews through static DPR-aware canvases', async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('ONBOARDING_SEEN_V1', 'true');
  });

  await page.goto('/');

  const previews = page.locator('[data-preview-board-canvas="true"]');
  const devicePixelRatio = await page.evaluate(() => window.devicePixelRatio);
  const expectedDpr = Math.min(devicePixelRatio, 2);

  await expect(previews).toHaveCount(3);

  for (const preview of await previews.all()) {
    await expect(preview).toBeVisible();
    await expect(preview).toHaveAttribute(
      'data-preview-board-canvas-ready',
      'true',
    );
    await expect(preview).toHaveAttribute(
      'data-preview-board-canvas-rendered',
      'true',
    );

    const stats = await getPreviewCanvasStats(preview);

    expect(stats).not.toBeNull();
    expect(stats!.hasVisiblePixel).toBe(true);
    expect(stats!.visibleCells).toBe(stats!.rows * stats!.cols);
    expect(
      Math.abs(stats!.backingWidth / stats!.cssWidth - expectedDpr),
    ).toBeLessThan(0.02);
    expect(
      Math.abs(stats!.backingHeight / stats!.cssHeight - expectedDpr),
    ).toBeLessThan(0.02);
    expect(
      Math.abs(stats!.cssWidth / stats!.cssHeight - stats!.cols / stats!.rows),
      JSON.stringify(stats),
    ).toBeLessThan(0.02);
  }
});

test('renders and updates the board through a DPR-aware canvas', async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('ONBOARDING_SEEN_V1', 'true');
    window.localStorage.setItem('ZOOM', '1');
  });

  await page.goto('/game?mode=free&level=easy&debug=perf');

  const boardSurface = page.locator('[data-board-surface="true"]');
  const boardCanvas = page.locator('[data-board-canvas="true"]');
  const board = page.locator('[data-tour-id="board"]');
  const minesLeft = page.locator('[data-tour-id="win-status"]');

  await expect(boardSurface).toBeVisible();
  await expect(boardCanvas).toBeVisible();
  await expect(boardCanvas).toHaveAttribute('data-board-canvas-ready', 'true');
  await expect(minesLeft).toHaveText('10');

  const [
    box,
    surfaceBox,
    bitmap,
    devicePixelRatio,
    bleedAttribute,
    boardDimensions,
  ] = await Promise.all([
    getRequiredBoundingBox(boardCanvas),
    getRequiredBoundingBox(boardSurface),
    boardCanvas.evaluate((element) => ({
      height: (element as HTMLCanvasElement).height,
      width: (element as HTMLCanvasElement).width,
    })),
    page.evaluate(() => window.devicePixelRatio),
    boardCanvas.getAttribute('data-board-canvas-bleed'),
    board.evaluate((element) => ({
      clientHeight: element.clientHeight,
      clientWidth: element.clientWidth,
      scrollHeight: element.scrollHeight,
      scrollWidth: element.scrollWidth,
    })),
  ]);
  const expectedDpr = Math.min(devicePixelRatio, 2);
  const bleed = Number(bleedAttribute);
  const isSyntheticContextLossCanceled = await boardCanvas.evaluate(
    (element) => {
      const event = new Event('contextlost', { cancelable: true });

      element.dispatchEvent(event);

      return event.defaultPrevented;
    },
  );

  expect(Math.abs(bitmap.width / box.width - expectedDpr)).toBeLessThan(0.02);
  expect(Math.abs(bitmap.height / box.height - expectedDpr)).toBeLessThan(0.02);
  expect(Math.abs(surfaceBox.x - box.x - bleed)).toBeLessThan(1);
  expect(Math.abs(surfaceBox.y - box.y - bleed)).toBeLessThan(1);
  expect(Math.abs(box.width - boardDimensions.clientWidth)).toBeLessThan(1);
  expect(Math.abs(box.height - boardDimensions.clientHeight)).toBeLessThan(1);
  expect(
    boardDimensions.scrollWidth - boardDimensions.clientWidth,
  ).toBeLessThanOrEqual(1);
  expect(
    boardDimensions.scrollHeight - boardDimensions.clientHeight,
  ).toBeLessThanOrEqual(1);
  expect(isSyntheticContextLossCanceled).toBe(false);

  await page.mouse.move(0, 0);
  const beforeHoverDrawCount = await getCanvasDrawCount(page);
  const beforeBleedFingerprint =
    await getCanvasLeftBleedFingerprint(boardCanvas);
  const beforeFingerprint = await getCanvasCellFingerprint(boardCanvas, 0, 0);
  const firstCellBox = await getBoardCellBox(boardSurface, 0, 0);
  const firstCellCenter = {
    x: firstCellBox.x + firstCellBox.width / 2,
    y: firstCellBox.y + firstCellBox.height / 2,
  };

  await page.mouse.click(surfaceBox.x - bleed / 2, firstCellCenter.y, {
    button: 'right',
  });
  await expect(minesLeft).toHaveText('10');

  await page.mouse.move(firstCellCenter.x, firstCellCenter.y);
  await expect
    .poll(() => getCanvasCellFingerprint(boardCanvas, 0, 0))
    .not.toBe(beforeFingerprint);
  await expect
    .poll(() => getCanvasLeftBleedFingerprint(boardCanvas))
    .not.toBe(beforeBleedFingerprint);
  await expect
    .poll(() => getCanvasDrawCount(page))
    .toBeGreaterThan(beforeHoverDrawCount + 1);
  await expect(boardCanvas).toHaveAttribute(
    'data-board-canvas-draw-mode',
    'dirty',
  );
  const [drawnCells, visibleCells] = await Promise.all([
    boardCanvas.getAttribute('data-board-canvas-drawn-cells'),
    boardCanvas.getAttribute('data-board-canvas-visible-cells'),
  ]);

  expect(Number(drawnCells)).toBeGreaterThan(0);
  expect(Number(drawnCells)).toBeLessThan(Number(visibleCells));

  await page.mouse.move(0, 0);
  await expect
    .poll(() => getCanvasCellFingerprint(boardCanvas, 0, 0))
    .toBe(beforeFingerprint);

  await page.mouse.click(firstCellCenter.x, firstCellCenter.y, {
    button: 'right',
  });
  await expect(minesLeft).toHaveText('9');
  await page.mouse.move(0, 0);

  await expect
    .poll(() => getCanvasCellFingerprint(boardCanvas, 0, 0))
    .not.toBe(beforeFingerprint);
});

test('keeps the default easy board fitted on narrow viewports', async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('ONBOARDING_SEEN_V1', 'true');
    window.localStorage.setItem('ZOOM', '1');
  });

  for (const width of [360, 375]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/game?mode=free&level=easy');

    const board = page.locator('[data-tour-id="board"]');
    const boardSurface = page.locator('[data-board-surface="true"]');
    const boardCanvas = page.locator('[data-board-canvas="true"]');

    await expect(boardSurface).toBeVisible();
    await expect(boardCanvas).toHaveAttribute(
      'data-board-canvas-ready',
      'true',
    );

    const [boardBox, surfaceBox, dimensions] = await Promise.all([
      getRequiredBoundingBox(board),
      getRequiredBoundingBox(boardSurface),
      board.evaluate((element) => ({
        clientHeight: element.clientHeight,
        clientWidth: element.clientWidth,
        scrollHeight: element.scrollHeight,
        scrollWidth: element.scrollWidth,
      })),
    ]);

    // BoardFrame's two 1px borders can appear in the scroll metrics because
    // the max-content frame uses border-box sizing.
    expect(dimensions.scrollWidth - dimensions.clientWidth).toBeLessThanOrEqual(
      2,
    );
    expect(
      dimensions.scrollHeight - dimensions.clientHeight,
    ).toBeLessThanOrEqual(2);
    expect(surfaceBox.x).toBeGreaterThanOrEqual(boardBox.x - 1);
    expect(surfaceBox.y).toBeGreaterThanOrEqual(boardBox.y - 1);
    expect(surfaceBox.x + surfaceBox.width).toBeLessThanOrEqual(
      boardBox.x + boardBox.width + 1,
    );
    expect(surfaceBox.y + surfaceBox.height).toBeLessThanOrEqual(
      boardBox.y + boardBox.height + 1,
    );
  }
});

test.describe('high-DPR board canvas', () => {
  test.use({ deviceScaleFactor: 3 });

  test('caps the backing store without changing logical geometry', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 700, height: 600 });
    await page.addInitScript(() => {
      window.localStorage.setItem('ONBOARDING_SEEN_V1', 'true');
      window.localStorage.setItem('ZOOM', '1');
    });

    await page.goto('/game?mode=free&level=expert&debug=perf');

    const board = page.locator('[data-tour-id="board"]');
    const boardSurface = page.locator('[data-board-surface="true"]');
    const boardCanvas = page.locator('[data-board-canvas="true"]');

    await expect(boardSurface).toBeVisible();
    await expect(boardCanvas).toBeVisible();
    await expect(boardCanvas).toHaveAttribute(
      'data-board-canvas-ready',
      'true',
    );
    await expect(boardCanvas).toHaveAttribute('data-board-canvas-dpr', '2');
    await expect
      .poll(async () => (await getCanvasDrawStats(page)).enabled)
      .toBe(true);

    const [box, bitmap, boardDimensions, visibleCells, cameraX] =
      await Promise.all([
        getRequiredBoundingBox(boardCanvas),
        boardCanvas.evaluate((element) => ({
          height: (element as HTMLCanvasElement).height,
          width: (element as HTMLCanvasElement).width,
        })),
        board.evaluate((element) => ({
          clientHeight: element.clientHeight,
          clientWidth: element.clientWidth,
        })),
        boardCanvas.getAttribute('data-board-canvas-visible-cells'),
        boardCanvas.getAttribute('data-board-canvas-camera-x'),
      ]);

    expect(Math.abs(bitmap.width / box.width - 2)).toBeLessThan(0.02);
    expect(Math.abs(bitmap.height / box.height - 2)).toBeLessThan(0.02);
    expect(Math.abs(box.width - boardDimensions.clientWidth)).toBeLessThan(1);
    expect(Math.abs(box.height - boardDimensions.clientHeight)).toBeLessThan(1);
    expect(Number(visibleCells)).toBeGreaterThan(0);
    expect(Number(visibleCells)).toBeLessThan(16 * 30);

    await page.mouse.move(0, 0);
    const baseFingerprint = await getCanvasCellFingerprint(boardCanvas, 0, 0);
    const firstCellBox = await getBoardCellBox(boardSurface, 0, 0);

    await page.mouse.move(
      firstCellBox.x + firstCellBox.width / 2,
      firstCellBox.y + firstCellBox.height / 2,
    );
    await expect
      .poll(() => getCanvasCellFingerprint(boardCanvas, 0, 0))
      .not.toBe(baseFingerprint);
    await expect(boardCanvas).toHaveAttribute(
      'data-board-canvas-draw-mode',
      'dirty',
    );
    const hoveredFingerprint = await getCanvasCellFingerprint(
      boardCanvas,
      0,
      0,
    );

    // Let hover settle, then verify scroll emitted a full frame even though
    // clearing the hover may leave a later dirty frame as the current mode.
    await page.waitForTimeout(200);
    const beforeScrollFullDraws = (await getCanvasDrawStats(page))
      .canvasFullDraws;

    await board.evaluate((element) => {
      element.scrollLeft = 12;
    });
    await expect
      .poll(() => board.evaluate((element) => element.scrollLeft))
      .toBeGreaterThan(0);
    await expect
      .poll(async () =>
        Number(await boardCanvas.getAttribute('data-board-canvas-camera-x')),
      )
      .toBeGreaterThan(Number(cameraX));
    await expect
      .poll(async () => (await getCanvasDrawStats(page)).canvasFullDraws)
      .toBeGreaterThan(beforeScrollFullDraws);
    await expect
      .poll(() => getCanvasCellFingerprint(boardCanvas, 0, 0))
      .not.toBe(hoveredFingerprint);
  });
});

test('keeps the onboarding spotlight aligned with board geometry', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    window.localStorage.setItem('ZOOM', '1');
  });

  await page.goto('/game?mode=free&level=easy&tour=1');

  const board = page.locator('[data-tour-id="board"]');
  const boardSurface = page.locator('[data-board-surface="true"]');
  const spotlight = page.locator('[data-tour-spotlight="true"]');

  await expect(board).toBeVisible();
  await expect(boardSurface).toBeVisible();
  await expect(spotlight).toBeVisible();

  await expectSpotlightMatchesCellGeometry(spotlight, boardSurface);

  const boardBox = await getRequiredBoundingBox(board);
  const centerX = boardBox.x + boardBox.width / 2;
  const centerY = boardBox.y + boardBox.height / 2;

  await dispatchTouchPointer(board, 'pointerdown', 1, centerX - 30, centerY);
  await dispatchTouchPointer(board, 'pointerdown', 2, centerX + 30, centerY);
  await dispatchTouchPointer(board, 'pointermove', 1, centerX - 45, centerY);
  await dispatchTouchPointer(board, 'pointermove', 2, centerX + 45, centerY);

  await expectSpotlightMatchesCellGeometry(spotlight, boardSurface);

  await dispatchTouchPointer(board, 'pointerup', 1, centerX - 45, centerY);
  await dispatchTouchPointer(board, 'pointerup', 2, centerX + 45, centerY);
});

test('does not restore stale focus when onboarding opens settings', async ({
  page,
}) => {
  await installPreTourFocus(page);

  await page.goto('/game?mode=free&level=easy&tour=1');

  const boardSurface = page.locator('[data-board-surface="true"]');
  const spotlight = page.locator('[data-tour-spotlight="true"]');
  const previousFocusButton = page.locator('#pre-tour-focus');
  const settingsTrigger = page.locator('[data-tour-id="settings-trigger"]');

  await expect(
    page.getByRole('dialog', { name: 'Open an empty cell' }),
  ).toBeVisible();
  await expect(previousFocusButton).toHaveCount(1);
  await expectSpotlightMatchesCellGeometry(spotlight, boardSurface);

  let spotlightBox = await getRequiredBoundingBox(spotlight);
  let targetCenter = {
    x: spotlightBox.x + spotlightBox.width / 2,
    y: spotlightBox.y + spotlightBox.height / 2,
  };

  await page.mouse.click(targetCenter.x, targetCenter.y);

  await expect(
    page.getByRole('dialog', { name: 'Read the number' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Mark a mine' })).toBeVisible();
  await expectSpotlightMatchesCellGeometry(spotlight, boardSurface);

  spotlightBox = await getRequiredBoundingBox(spotlight);
  targetCenter = {
    x: spotlightBox.x + spotlightBox.width / 2,
    y: spotlightBox.y + spotlightBox.height / 2,
  };

  await page.mouse.click(targetCenter.x, targetCenter.y, {
    button: 'right',
  });

  await expect(page.getByRole('dialog', { name: 'How to win' })).toBeVisible();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(
    page.getByRole('dialog', { name: 'Customize the game' }),
  ).toBeVisible();

  await settingsTrigger.click();

  const settingsDialog = page
    .getByRole('dialog')
    .filter({ hasText: 'Settings' });

  await expect(
    page.getByRole('dialog', { name: 'Customize the game' }),
  ).toHaveCount(0);
  await expect(settingsDialog).toBeVisible();
  await expect
    .poll(() =>
      previousFocusButton.evaluate(
        (element) => element !== document.activeElement,
      ),
    )
    .toBe(true);
});

test('focuses and closes onboarding with the keyboard', async ({ page }) => {
  await installPreTourFocus(page);
  await page.goto('/game?mode=free&level=easy&tour=1');

  const dialog = page.getByRole('dialog', { name: 'Open an empty cell' });
  const closeButton = page.getByRole('button', { name: 'Skip tutorial' });
  const previousFocusButton = page.locator('#pre-tour-focus');

  await expect(dialog).toBeVisible();
  await expect(closeButton).toBeFocused();

  await page.keyboard.press('Escape');

  await expect(dialog).toHaveCount(0);
  await expect(previousFocusButton).toBeFocused();
});

test('cancels touch actions that end outside the board surface', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'maxTouchPoints', {
      configurable: true,
      get: () => 1,
    });
    window.localStorage.setItem('ONBOARDING_SEEN_V1', 'true');
    window.localStorage.setItem(
      'PREFERRED_CONTROL_MODE',
      JSON.stringify('Gestures'),
    );
    window.localStorage.setItem('ZOOM', '1');
  });

  for (const endType of ['pointerup', 'pointercancel'] as const) {
    await page.goto('/game?mode=free&level=easy');

    const board = page.locator('[data-tour-id="board"]');
    const boardSurface = page.locator('[data-board-surface="true"]');
    const minesLeft = page.locator('[data-tour-id="win-status"]');

    await expect(boardSurface).toBeVisible();
    await expect(minesLeft).toHaveText('10');

    const [firstCellBox, surfaceBox] = await Promise.all([
      getBoardCellBox(boardSurface, 0, 0),
      getRequiredBoundingBox(boardSurface),
    ]);
    const pointerDownX = firstCellBox.x + 2;
    const pointerDownY = firstCellBox.y + firstCellBox.height / 2;
    const pointerEndX = surfaceBox.x - 2;

    await dispatchTouchPointer(
      board,
      'pointerdown',
      1,
      pointerDownX,
      pointerDownY,
    );
    await dispatchTouchPointer(board, endType, 1, pointerEndX, pointerDownY);
    await page.waitForTimeout(350);

    await expect(minesLeft).toHaveText('10');
  }
});

test('ends a mouse interaction when the pointer leaves the board', async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('ONBOARDING_SEEN_V1', 'true');
    window.localStorage.setItem('ZOOM', '1');
  });

  await page.goto('/game?mode=free&level=easy');

  const boardSurface = page.locator('[data-board-surface="true"]');
  const timerValue = page.locator('img[alt="timer"] + span');

  await expect(boardSurface).toBeVisible();
  await expect(timerValue).toHaveText('00:00');

  const firstCellBox = await getBoardCellBox(boardSurface, 0, 0);

  await page.mouse.click(
    firstCellBox.x + firstCellBox.width / 2,
    firstCellBox.y + firstCellBox.height / 2,
    { button: 'right' },
  );
  await expect.poll(() => timerValue.textContent()).not.toBe('00:00');

  const secondCellBox = await getBoardCellBox(boardSurface, 0, 1);
  const secondCellCenter = {
    x: secondCellBox.x + secondCellBox.width / 2,
    y: secondCellBox.y + secondCellBox.height / 2,
  };
  const frozenTimerValue = await timerValue.textContent();

  await page.mouse.move(secondCellCenter.x, secondCellCenter.y);
  await page.mouse.down();
  await page.waitForTimeout(1_100);
  await expect(timerValue).toHaveText(frozenTimerValue ?? '');

  await page.mouse.move(0, 0);
  await page.mouse.up();
  await expect.poll(() => timerValue.textContent()).not.toBe(frozenTimerValue);
});

test('keeps a fitted board anchored when pinch zoom starts', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    window.localStorage.setItem('ONBOARDING_SEEN_V1', 'true');
    window.localStorage.setItem('ZOOM', '1');
  });

  await page.goto('/game?mode=free&level=easy');

  const board = page.locator('[data-tour-id="board"]');
  const boardSurface = page.locator('[data-board-surface="true"]');

  await expect(board).toBeVisible();
  await expect(boardSurface).toBeVisible();

  const beforeCellBox = await getBoardCellBox(boardSurface, 0, 0);
  const beforeBoardBox = await getRequiredBoundingBox(board);
  const centerX = beforeBoardBox.x + beforeBoardBox.width / 2;
  const centerY = beforeCellBox.y + beforeCellBox.height * 4.5;

  await dispatchTouchPointer(board, 'pointerdown', 1, centerX - 30, centerY);
  await dispatchTouchPointer(board, 'pointerdown', 2, centerX + 30, centerY);
  await page.waitForTimeout(50);

  const afterCellBox = await getBoardCellBox(boardSurface, 0, 0);
  const afterBoardBox = await getRequiredBoundingBox(board);

  expect(Math.abs(afterCellBox.x - beforeCellBox.x)).toBeLessThan(2);
  expect(Math.abs(afterCellBox.y - beforeCellBox.y)).toBeLessThan(2);
  expect(Math.abs(afterBoardBox.x - beforeBoardBox.x)).toBeLessThan(2);
  expect(Math.abs(afterBoardBox.y - beforeBoardBox.y)).toBeLessThan(2);
});

test('expands a fitted board during pinch zoom preview', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    window.localStorage.setItem('ONBOARDING_SEEN_V1', 'true');
    window.localStorage.setItem('ZOOM', '0.8');
  });

  await page.goto('/game?mode=free&level=easy&debug=perf');

  const board = page.locator('[data-tour-id="board"]');
  const boardSurface = page.locator('[data-board-surface="true"]');
  const boardCanvas = page.locator('[data-board-canvas="true"]');
  const bleedFrame = page.locator('[data-board-canvas-bleed-frame="true"]');

  await expect(board).toBeVisible();
  await expect(boardSurface).toBeVisible();
  await expect(boardCanvas).toHaveAttribute('data-board-canvas-ready', 'true');
  await expect(bleedFrame).toBeVisible();
  await page.waitForTimeout(100);

  const beforeCellBox = await getBoardCellBox(boardSurface, 0, 0);
  const beforeBoardBox = await getRequiredBoundingBox(board);
  const beforeInsets = await getCanvasBleedInsets(bleedFrame);
  const beforeBleed = Number(
    await boardCanvas.getAttribute('data-board-canvas-bleed'),
  );
  const centerX = beforeBoardBox.x + beforeBoardBox.width / 2;
  const centerY = beforeCellBox.y + beforeCellBox.height * 4.5;

  await dispatchTouchPointer(board, 'pointerdown', 1, centerX - 30, centerY);
  await dispatchTouchPointer(board, 'pointerdown', 2, centerX + 30, centerY);
  await page.waitForTimeout(50);

  await dispatchTouchPointer(board, 'pointermove', 1, centerX - 48, centerY);
  await dispatchTouchPointer(board, 'pointermove', 2, centerX + 48, centerY);
  await page.waitForTimeout(50);

  const previewBoardBox = await getRequiredBoundingBox(board);
  const previewCanvasBox = await getRequiredBoundingBox(boardCanvas);
  const previewBitmap = await boardCanvas.evaluate((element) => ({
    height: (element as HTMLCanvasElement).height,
    width: (element as HTMLCanvasElement).width,
  }));
  const previewCameraScale = Number(
    await boardCanvas.getAttribute('data-board-canvas-camera-scale'),
  );
  const previewInsets = await getCanvasBleedInsets(bleedFrame);
  const previewBleed = Number(
    await boardCanvas.getAttribute('data-board-canvas-bleed'),
  );

  await dispatchTouchPointer(board, 'pointerup', 1, centerX - 48, centerY);
  await dispatchTouchPointer(board, 'pointerup', 2, centerX + 48, centerY);
  await page.waitForTimeout(150);

  const committedBoardBox = await getRequiredBoundingBox(board);
  const committedBitmap = await boardCanvas.evaluate((element) => ({
    height: (element as HTMLCanvasElement).height,
    width: (element as HTMLCanvasElement).width,
  }));
  const committedBleed = Number(
    await boardCanvas.getAttribute('data-board-canvas-bleed'),
  );
  const committedInsets = await getCanvasBleedInsets(bleedFrame);

  expect(beforeBleed).toBe(10);
  expect(previewBleed).toBe(beforeBleed);
  expect(committedBleed).toBe(beforeBleed);
  expect(getMaxInsetError(beforeInsets, beforeBleed)).toBeLessThan(1);
  expect(getMaxInsetError(previewInsets, beforeBleed)).toBeLessThan(1);
  expect(getMaxInsetError(committedInsets, beforeBleed)).toBeLessThan(1);
  expect(previewBoardBox.width).toBeGreaterThan(beforeBoardBox.width + 40);
  expect(previewBoardBox.height).toBeGreaterThan(beforeBoardBox.height + 40);
  expect(previewCameraScale).toBeGreaterThan(1);
  expect(
    Math.abs(previewBitmap.width / previewCanvasBox.width - 1),
  ).toBeLessThan(0.02);
  expect(
    Math.abs(previewBitmap.height / previewCanvasBox.height - 1),
  ).toBeLessThan(0.02);
  expect(
    Math.abs(committedBoardBox.width - previewBoardBox.width),
  ).toBeLessThan(2);
  expect(
    Math.abs(committedBoardBox.height - previewBoardBox.height),
  ).toBeLessThan(2);
  expect(Math.abs(committedBitmap.width - previewBitmap.width)).toBeLessThan(4);
  expect(Math.abs(committedBitmap.height - previewBitmap.height)).toBeLessThan(
    4,
  );
});

test('keeps a fitted pinch preview inside the board frame', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    window.localStorage.setItem('ONBOARDING_SEEN_V1', 'true');
    window.localStorage.setItem('ZOOM', '0.8');
  });

  await page.goto('/game?mode=free&level=easy');

  const board = page.locator('[data-tour-id="board"]');
  const boardSurface = page.locator('[data-board-surface="true"]');

  await expect(board).toBeVisible();
  await expect(boardSurface).toBeVisible();

  const beforeCellBox = await getBoardCellBox(boardSurface, 0, 0);
  const beforeBoardBox = await getRequiredBoundingBox(board);
  const centerX = beforeBoardBox.x + beforeBoardBox.width / 2;
  const centerY = beforeCellBox.y + beforeCellBox.height * 4.5;

  await dispatchTouchPointer(board, 'pointerdown', 1, centerX - 30, centerY);
  await dispatchTouchPointer(board, 'pointerdown', 2, centerX + 30, centerY);
  await dispatchTouchPointer(board, 'pointermove', 1, centerX - 33, centerY);
  await dispatchTouchPointer(board, 'pointermove', 2, centerX + 33, centerY);
  await page.waitForTimeout(50);

  await dispatchTouchPointer(
    board,
    'pointermove',
    1,
    centerX - 75,
    centerY - 33,
  );
  await dispatchTouchPointer(
    board,
    'pointermove',
    2,
    centerX + 9,
    centerY - 33,
  );
  await page.waitForTimeout(50);

  const previewBoardBox = await getRequiredBoundingBox(board);
  const previewFirstCellBox = await getBoardCellBox(boardSurface, 0, 0);
  const previewLastCellBox = await getBoardCellBox(boardSurface, 8, 8);

  // The scaled visual bleed may legitimately scroll while the frame clips
  // shadows. The logical grid itself must remain fully visible.
  expect(previewFirstCellBox.x).toBeGreaterThanOrEqual(previewBoardBox.x - 1);
  expect(previewFirstCellBox.y).toBeGreaterThanOrEqual(previewBoardBox.y - 1);
  expect(previewLastCellBox.x + previewLastCellBox.width).toBeLessThanOrEqual(
    previewBoardBox.x + previewBoardBox.width + 1,
  );
  expect(previewLastCellBox.y + previewLastCellBox.height).toBeLessThanOrEqual(
    previewBoardBox.y + previewBoardBox.height + 1,
  );
});

test('keeps an overflowing board full width during pinch (no centered clipping)', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    window.localStorage.setItem('ONBOARDING_SEEN_V1', 'true');
    window.localStorage.setItem('ZOOM', '1');
  });

  // A 16x16 board overflows a 390px viewport, so the frame is capped to the
  // viewport width and scrolls. It must stay pinned to the viewport during a
  // pinch and must never shrink below it and get centered by `margin: 0 auto`,
  // which would clip the grid on both sides.
  await page.goto('/game?mode=free&level=medium');

  const board = page.locator('[data-tour-id="board"]');
  await expect(board).toBeVisible();

  const beforeBoardBox = await getRequiredBoundingBox(board);
  const centerX = beforeBoardBox.x + beforeBoardBox.width / 2;
  const centerY = beforeBoardBox.y + beforeBoardBox.height / 2;

  // Pinch OUT (fingers moving together) - the path that previously shrank the
  // frame far below the viewport.
  await dispatchTouchPointer(board, 'pointerdown', 1, centerX - 40, centerY);
  await dispatchTouchPointer(board, 'pointerdown', 2, centerX + 40, centerY);
  await dispatchTouchPointer(board, 'pointermove', 1, centerX - 42, centerY);
  await dispatchTouchPointer(board, 'pointermove', 2, centerX + 42, centerY);
  await dispatchTouchPointer(board, 'pointermove', 1, centerX - 14, centerY);
  await dispatchTouchPointer(board, 'pointermove', 2, centerX + 14, centerY);
  await page.waitForTimeout(50);

  const previewBoardBox = await getRequiredBoundingBox(board);
  const previewMargins = await board.evaluate((element) => {
    const style = getComputedStyle(element);
    return { left: style.marginLeft, right: style.marginRight };
  });
  const previewScrollGeometry = await board.evaluate((element) => ({
    height: element.scrollHeight,
    left: element.scrollLeft,
    top: element.scrollTop,
    width: element.scrollWidth,
  }));

  expect(Math.abs(previewBoardBox.x - beforeBoardBox.x)).toBeLessThan(2);
  expect(Math.abs(previewBoardBox.width - beforeBoardBox.width)).toBeLessThan(
    2,
  );
  expect(previewMargins.left).toBe('0px');
  expect(previewMargins.right).toBe('0px');

  await dispatchTouchPointer(board, 'pointerup', 1, centerX - 14, centerY);
  await dispatchTouchPointer(board, 'pointerup', 2, centerX + 14, centerY);
  await page.waitForTimeout(150);

  const committedScrollGeometry = await board.evaluate((element) => ({
    height: element.scrollHeight,
    left: element.scrollLeft,
    top: element.scrollTop,
    width: element.scrollWidth,
  }));

  expect(
    Math.abs(previewScrollGeometry.width - committedScrollGeometry.width),
  ).toBeLessThan(2);
  expect(
    Math.abs(previewScrollGeometry.height - committedScrollGeometry.height),
  ).toBeLessThan(2);
  expect(
    Math.abs(previewScrollGeometry.left - committedScrollGeometry.left),
  ).toBeLessThan(2);
  expect(
    Math.abs(previewScrollGeometry.top - committedScrollGeometry.top),
  ).toBeLessThan(2);
});

test('keeps the pinch-zoom preview from overlapping the footer', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    window.localStorage.setItem('ONBOARDING_SEEN_V1', 'true');
    window.localStorage.setItem('ZOOM', '1');
  });

  // Zooming in grows the scaled surface tall. The board frame must stay within
  // the vertical slot the layout reserves and never spill over the footer
  // controls below it.
  await page.goto('/game?mode=free&level=medium');

  const board = page.locator('[data-tour-id="board"]');
  const footer = page.locator('text=Change Game').first();
  await expect(board).toBeVisible();
  await expect(footer).toBeVisible();

  const beforeBoardBox = await getRequiredBoundingBox(board);
  const footerBox = await getRequiredBoundingBox(footer);
  const centerX = beforeBoardBox.x + beforeBoardBox.width / 2;
  const centerY = beforeBoardBox.y + beforeBoardBox.height / 2;

  // Pinch IN (fingers apart) to zoom up hard.
  await dispatchTouchPointer(board, 'pointerdown', 1, centerX - 20, centerY);
  await dispatchTouchPointer(board, 'pointerdown', 2, centerX + 20, centerY);
  await dispatchTouchPointer(board, 'pointermove', 1, centerX - 22, centerY);
  await dispatchTouchPointer(board, 'pointermove', 2, centerX + 22, centerY);
  await dispatchTouchPointer(board, 'pointermove', 1, centerX - 120, centerY);
  await dispatchTouchPointer(board, 'pointermove', 2, centerX + 120, centerY);
  await page.waitForTimeout(50);

  const previewBoardBox = await getRequiredBoundingBox(board);

  expect(previewBoardBox.y + previewBoardBox.height).toBeLessThanOrEqual(
    footerBox.y + 1,
  );

  await dispatchTouchPointer(board, 'pointerup', 1, centerX - 120, centerY);
  await dispatchTouchPointer(board, 'pointerup', 2, centerX + 120, centerY);
});
