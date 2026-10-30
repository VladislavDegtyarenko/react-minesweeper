import { expect, test } from '@playwright/test';
import { LOCAL_STORAGE_KEYS } from '@/config';

const COMPONENT_TITLES = [
  'UI/Button',
  'UI/Switch',
  'UI/ToggleGroup',
  'Game/Cell',
  'Game/ScoreSyncNotice',
  'Lobby/LevelCard',
  'Lobby/ContinueBanner',
];

test('publishes all seven components and their documentation', async ({
  request,
}) => {
  const response = await request.get('index.json');
  expect(response.ok()).toBe(true);
  const index = await response.json();
  const entries = Object.values(index.entries) as {
    title: string;
    type: string;
  }[];

  for (const title of COMPONENT_TITLES) {
    expect(
      entries.some((entry) => entry.title === title && entry.type === 'story'),
    ).toBe(true);
    expect(
      entries.some((entry) => entry.title === title && entry.type === 'docs'),
    ).toBe(true);
  }
});

test('loads the manager, docs, and a direct story after refresh', async ({
  page,
}) => {
  await page.goto('?path=/docs/introduction--docs');
  const preview = page.frameLocator('#storybook-preview-iframe');
  await expect(
    preview.getByRole('heading', { name: 'Minesweeper component workshop' }),
  ).toBeVisible();
  await page.goto('?path=/story/ui-switch--off');
  const toggle = preview.getByRole('switch', { name: 'Sound effects' });
  await expect(toggle).not.toBeChecked();
  await toggle.click();
  await expect(toggle).toBeChecked();
  await page.reload();
  await expect(toggle).not.toBeChecked();
  await page.screenshot({
    path: 'test-results/storybook-manager.png',
    fullPage: true,
  });
});

test('loads cell icons from the deployment subpath', async ({
  page,
  baseURL,
}) => {
  const failures: string[] = [];
  page.on('pageerror', (error) => failures.push(error.message));
  page.on('response', (response) => {
    if (response.status() >= 400) {
      failures.push(`${response.status()} ${response.url()}`);
    }
  });
  await page.goto('iframe.html?id=game-cell--incorrect-flag&viewMode=story');
  const cross = page.getByRole('img', { name: 'cross' });
  await expect(cross).toBeVisible();
  await expect
    .poll(() => cross.evaluate((image: HTMLImageElement) => image.naturalWidth))
    .toBeGreaterThan(0);
  expect(await cross.getAttribute('src')).toBe(
    new URL('icons/cross.svg', baseURL).pathname,
  );
  const flag = page.getByRole('img', { name: 'flag' });
  await expect
    .poll(() => flag.evaluate((image: HTMLImageElement) => image.naturalWidth))
    .toBeGreaterThan(0);
  expect(failures).toEqual([]);
});

test('isolates application storage and remounts with fresh state', async ({
  page,
}) => {
  await page.addInitScript((keys) => {
    const trackedKeys = new Set<string>(keys);
    const accesses: string[] = [];
    (
      window as Window & { applicationStorageAccesses?: string[] }
    ).applicationStorageAccesses = accesses;
    const originalGet = Storage.prototype.getItem;
    const originalSet = Storage.prototype.setItem;
    Storage.prototype.getItem = function (key) {
      if (trackedKeys.has(key)) {
        accesses.push(`read ${key}`);
      }

      return originalGet.call(this, key);
    };
    Storage.prototype.setItem = function (key, value) {
      if (trackedKeys.has(key)) {
        accesses.push(`write ${key}`);
      }

      return originalSet.call(this, key, value);
    };
  }, Object.values(LOCAL_STORAGE_KEYS));
  await page.goto('iframe.html?id=game-cell--flagged&viewMode=story');
  await expect(page.getByRole('img', { name: 'flag' })).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        (window as Window & { applicationStorageAccesses?: string[] })
          .applicationStorageAccesses,
    ),
  ).toEqual([]);
  await page.goto('iframe.html?id=ui-switch--off&viewMode=story');
  await page.getByRole('switch').click();
  await expect(page.getByRole('switch')).toBeChecked();
  await page.reload();
  await expect(page.getByRole('switch')).not.toBeChecked();
});

for (const viewport of [
  { width: 1280, height: 900 },
  { width: 390, height: 844 },
]) {
  test(`keeps the saved-game dialog usable at ${viewport.width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto(
      'iframe.html?id=lobby-continuebanner--daily&viewMode=story',
    );
    const trigger = page.getByRole('button', { name: 'Start New Game' });
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: 'Start a new game?' });
    await expect(dialog).toBeVisible();
    const cancel = dialog.getByRole('button', { name: 'Keep Playing' });
    await expect(cancel).toBeFocused();
    await expect(dialog).toBeInViewport({ ratio: 1 });
    await expect(
      dialog.getByRole('button', { name: 'Start New Game' }),
    ).toBeInViewport({ ratio: 1 });
    await dialog.evaluate((element) =>
      Promise.all(
        element
          .getAnimations({ subtree: true })
          .map((animation) => animation.finished),
      ),
    );
    await page.screenshot({
      path: `test-results/storybook-dialog-${viewport.width}.png`,
      fullPage: true,
    });
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  });
}
