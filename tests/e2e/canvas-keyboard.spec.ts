import { expect, test } from '@playwright/test';

// Resume a legal Easy board with known mines so terminal states are reproducible.
const installSavedGame = async (page: import('@playwright/test').Page) => {
  await page.addInitScript(() => {
    if (sessionStorage.getItem('canvas-fixture-installed')) return;
    sessionStorage.setItem('canvas-fixture-installed', 'true');
    localStorage.setItem('ONBOARDING_SEEN_V1', 'true');
    localStorage.setItem('IS_MUTED_SFX', 'true');
    localStorage.setItem('IS_QUESTION_MARK_ENABLED', 'false');
    localStorage.setItem('ZOOM', '1');
    const mines = new Set(Array.from({ length: 10 }, (_, index) => index));
    const board = Array.from({ length: 9 }, (_, row) =>
      Array.from({ length: 9 }, (_, col) => {
        let nearby = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const r = row + dr;
            const c = col + dc;
            if (
              (dr || dc) &&
              r >= 0 &&
              r < 9 &&
              c >= 0 &&
              c < 9 &&
              mines.has(r * 9 + c)
            )
              nearby++;
          }
        }

        return {
          value: mines.has(row * 9 + col) ? 'mine' : nearby,
          isOpened: row === 1 && col === 1,
          marker: null,
        };
      }),
    );
    localStorage.setItem(
      'GAME_SNAPSHOT',
      JSON.stringify({
        version: 1,
        savedAt: Date.now(),
        mode: 'free',
        level: { id: 'easy', label: 'Easy', rows: 9, cols: 9, totalMines: 10 },
        board,
        totalFlags: 0,
        openedSafeCells: 1,
        correctlyFlaggedMines: 0,
        gameStatus: 'playing',
        elapsedMs: 4000,
      }),
    );
  });
};

for (const viewport of [
  { width: 1280, height: 900 },
  { width: 390, height: 844 },
]) {
  test(`keyboard controls, saving, loss and restart at ${viewport.width}px`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.setViewportSize(viewport);
    await installSavedGame(page);
    await page.goto('/game?mode=free&level=easy');
    const grid = page.getByRole('grid', { name: 'Minesweeper board' });
    const first = grid.getByRole('gridcell').first();
    await expect(grid).toHaveAttribute('aria-rowcount', '9');
    await expect(grid.locator('[tabindex="0"]')).toHaveCount(1);
    await first.focus();
    await page.keyboard.press('f');
    await expect(first).toHaveAccessibleName('Row 1, column 1: flag');
    await page.keyboard.press('Enter');
    await expect(first).toHaveAccessibleName('Row 1, column 1: flag');
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            JSON.parse(localStorage.getItem('GAME_SNAPSHOT') ?? '{}')
              .totalFlags,
        ),
      )
      .toBe(1);
    await page.reload();
    await expect(first).toHaveAccessibleName('Row 1, column 1: flag');
    await first.focus();
    await page.keyboard.press('f');
    await expect(first).toHaveAccessibleName('Row 1, column 1: closed');
    await page.keyboard.press('ArrowLeft');
    await expect(first).toBeFocused();
    await page.keyboard.press('End');
    await expect(grid.getByRole('gridcell').nth(8)).toBeFocused();
    await page.keyboard.press('Control+End');
    const last = grid.getByRole('gridcell').last();
    await expect(last).toBeFocused();
    await expect(last).toBeInViewport();
    await page.keyboard.press('Tab');
    await expect(last).not.toBeFocused();
    await first.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('status')).toHaveText('Game over.');
    await expect(first).toHaveAttribute('aria-disabled', 'true');
    await page.getByRole('button', { name: 'Restart' }).click();
    await expect(first).toHaveAccessibleName('Row 1, column 1: closed');
    await expect(grid.getByRole('gridcell', { name: /closed$/ })).toHaveCount(
      81,
    );
    expect(errors).toEqual([]);
    await page.screenshot({
      path: `test-results/canvas-keyboard-${viewport.width}.png`,
      fullPage: true,
    });
  });
}

test('a keyboard win records a guest best time and starts a new game', async ({
  page,
}) => {
  await installSavedGame(page);
  await page.goto('/game?mode=free&level=easy');
  const cells = page.getByRole('gridcell');
  await cells.first().focus();
  for (let index = 0; index < 9; index++) {
    await page.keyboard.press('f');
    if (index < 8) await page.keyboard.press('ArrowRight');
  }
  await page.keyboard.press('Home');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('f');
  const dialog = page.getByRole('dialog');
  await expect
    .poll(() =>
      page.evaluate(
        () => JSON.parse(localStorage.getItem('BEST_TIMES') ?? '{}').easy,
      ),
    )
    .toBeGreaterThan(0);
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await cells.first().focus();
  await page.keyboard.press('Enter');
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'New Game', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(cells.first()).toHaveAccessibleName('Row 1, column 1: closed');
  await expect(page.locator('[data-tour-id="win-status"]')).toHaveText('10');
});

test.describe('native touch input', () => {
  test.use({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  });

  test('long press marks and unmarks; tap opens without a duplicate mouse action', async ({
    page,
  }) => {
    await installSavedGame(page);
    await page.addInitScript(() =>
      localStorage.setItem(
        'PREFERRED_CONTROL_MODE',
        JSON.stringify('Gestures'),
      ),
    );
    await page.goto('/game?mode=free&level=easy');
    const first = page.getByRole('gridcell').first();
    const box = await first.boundingBox();
    expect(box).not.toBeNull();
    const point = {
      x: box!.x + box!.width / 2,
      y: box!.y + box!.height / 2,
      id: 1,
    };
    const session = await page.context().newCDPSession(page);
    for (const state of ['flag', 'closed']) {
      await session.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [point],
      });
      await expect(first).toHaveAccessibleName(`Row 1, column 1: ${state}`);
      await session.send('Input.dispatchTouchEvent', {
        type: 'touchEnd',
        touchPoints: [],
      });
      await expect(first).toHaveAccessibleName(`Row 1, column 1: ${state}`);
    }
    const safe = page.getByRole('gridcell').nth(11);
    const safeBox = await safe.boundingBox();
    expect(safeBox).not.toBeNull();
    await page.touchscreen.tap(
      safeBox!.x + safeBox!.width / 2,
      safeBox!.y + safeBox!.height / 2,
    );
    await expect(safe).toHaveAccessibleName('Row 2, column 3: 3');
    await expect(page.getByRole('status')).toBeEmpty();
  });
});

test('theme colors and changed display density redraw the live canvas', async ({
  page,
}) => {
  await installSavedGame(page);
  await page.goto('/game?mode=free&level=easy');
  const canvas = page.locator('[data-board-canvas="true"]');
  await expect(canvas).toHaveAttribute('data-board-canvas-ready', 'true');
  const session = await page.context().newCDPSession(page);
  const cssWidth = await canvas.evaluate(
    (element) => element.getBoundingClientRect().width,
  );
  await session.send('Emulation.setDeviceMetricsOverride', {
    width: 1279,
    height: 720,
    deviceScaleFactor: 2,
    mobile: false,
  });
  await expect
    .poll(() =>
      canvas.evaluate(
        (element) =>
          (element as HTMLCanvasElement).width /
          element.getBoundingClientRect().width,
      ),
    )
    .toBeCloseTo(2, 1);
  expect(
    await canvas.evaluate((element) => element.getBoundingClientRect().width),
  ).toBeCloseTo(cssWidth, 0);
  await page.evaluate(() =>
    document.documentElement.style.setProperty('--cell-closed', '#ff00ff'),
  );
  await expect
    .poll(() =>
      canvas.evaluate((element) => {
        const image = element as HTMLCanvasElement;
        const surface = document
          .querySelector('[data-board-surface="true"]')!
          .getBoundingClientRect();
        const rect = image.getBoundingClientRect();
        const x = Math.floor(
          ((surface.left + surface.width / 18 - rect.left) * image.width) /
            rect.width,
        );
        const y = Math.floor(
          ((surface.top + surface.height / 18 - rect.top) * image.height) /
            rect.height,
        );

        return Array.from(
          image.getContext('2d')!.getImageData(x, y, 1, 1).data,
        ).slice(0, 3);
      }),
    )
    .toEqual([255, 0, 255]);
  await page.evaluate(() =>
    document.documentElement.style.removeProperty('--cell-closed'),
  );
  await session.send('Emulation.clearDeviceMetricsOverride');
});
