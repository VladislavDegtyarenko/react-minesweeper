import { expect, test, type Locator } from '@playwright/test';

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
  const firstCell = page.locator('[data-tour-cell="0-0"]');

  await expect(page.locator('body')).toBeVisible();
  await expect(page.locator('body')).not.toBeEmpty();
  await expect(board).toBeVisible();
  await expect(firstCell).toBeVisible();
  await firstCell.click();
  await page.screenshot({ path: 'test-results/game-smoke.png' });
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
  const firstCell = page.locator('[data-tour-cell="0-0"]');

  await expect(board).toBeVisible();
  await expect(firstCell).toBeVisible();

  const beforeCellBox = await getRequiredBoundingBox(firstCell);
  const beforeBoardBox = await getRequiredBoundingBox(board);
  const centerX = beforeBoardBox.x + beforeBoardBox.width / 2;
  const centerY = beforeCellBox.y + beforeCellBox.height * 4.5;

  await dispatchTouchPointer(board, 'pointerdown', 1, centerX - 30, centerY);
  await dispatchTouchPointer(board, 'pointerdown', 2, centerX + 30, centerY);
  await page.waitForTimeout(50);

  const afterCellBox = await getRequiredBoundingBox(firstCell);
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

  await page.goto('/game?mode=free&level=easy');

  const board = page.locator('[data-tour-id="board"]');
  const firstCell = page.locator('[data-tour-cell="0-0"]');

  await expect(board).toBeVisible();
  await expect(firstCell).toBeVisible();

  const beforeCellBox = await getRequiredBoundingBox(firstCell);
  const beforeBoardBox = await getRequiredBoundingBox(board);
  const centerX = beforeBoardBox.x + beforeBoardBox.width / 2;
  const centerY = beforeCellBox.y + beforeCellBox.height * 4.5;

  await dispatchTouchPointer(board, 'pointerdown', 1, centerX - 30, centerY);
  await dispatchTouchPointer(board, 'pointerdown', 2, centerX + 30, centerY);
  await dispatchTouchPointer(board, 'pointermove', 1, centerX - 48, centerY);
  await dispatchTouchPointer(board, 'pointermove', 2, centerX + 48, centerY);
  await page.waitForTimeout(50);

  const previewBoardBox = await getRequiredBoundingBox(board);

  await dispatchTouchPointer(board, 'pointerup', 1, centerX - 48, centerY);
  await dispatchTouchPointer(board, 'pointerup', 2, centerX + 48, centerY);
  await page.waitForTimeout(150);

  const committedBoardBox = await getRequiredBoundingBox(board);

  expect(previewBoardBox.width).toBeGreaterThan(beforeBoardBox.width + 40);
  expect(previewBoardBox.height).toBeGreaterThan(beforeBoardBox.height + 40);
  expect(Math.abs(committedBoardBox.width - previewBoardBox.width)).toBeLessThan(
    2,
  );
  expect(
    Math.abs(committedBoardBox.height - previewBoardBox.height),
  ).toBeLessThan(2);
});

test('keeps a fitted pinch preview inside the board frame', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    window.localStorage.setItem('ONBOARDING_SEEN_V1', 'true');
    window.localStorage.setItem('ZOOM', '0.8');
  });

  await page.goto('/game?mode=free&level=easy');

  const board = page.locator('[data-tour-id="board"]');
  const firstCell = page.locator('[data-tour-cell="0-0"]');
  const lastCell = page.locator('[data-tour-cell="8-8"]');

  await expect(board).toBeVisible();
  await expect(firstCell).toBeVisible();
  await expect(lastCell).toBeVisible();

  const beforeCellBox = await getRequiredBoundingBox(firstCell);
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
  const previewFirstCellBox = await getRequiredBoundingBox(firstCell);
  const previewLastCellBox = await getRequiredBoundingBox(lastCell);
  const scrollPosition = await board.evaluate((element) => ({
    left: element.scrollLeft,
    top: element.scrollTop,
  }));

  expect(scrollPosition.left).toBe(0);
  expect(scrollPosition.top).toBe(0);
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

  expect(Math.abs(previewBoardBox.x - beforeBoardBox.x)).toBeLessThan(2);
  expect(Math.abs(previewBoardBox.width - beforeBoardBox.width)).toBeLessThan(2);
  expect(previewMargins.left).toBe('0px');
  expect(previewMargins.right).toBe('0px');

  await dispatchTouchPointer(board, 'pointerup', 1, centerX - 14, centerY);
  await dispatchTouchPointer(board, 'pointerup', 2, centerX + 14, centerY);
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
