import { expect, waitFor, within } from 'storybook/test';

/** Checks actual image decoding so broken public-asset URLs fail a story test. */
export const expectImagesLoaded = async (
  element: HTMLElement,
  expectedNames: string[] = [],
) => {
  await waitFor(async () => {
    for (const name of expectedNames) {
      await expect(within(element).getByRole('img', { name })).toBeVisible();
    }

    const images = Array.from(element.querySelectorAll('img'));

    for (const image of images) {
      await expect(image.complete, image.src).toBe(true);
      await expect(image.naturalWidth, image.src).toBeGreaterThan(0);
    }
  });
};
