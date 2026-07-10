import { expect, test } from '@playwright/test';

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
