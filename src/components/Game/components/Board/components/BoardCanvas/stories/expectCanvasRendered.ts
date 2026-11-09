import { expect, waitFor } from 'storybook/test';

export const expectCanvasRendered = async (container: HTMLElement) => {
  await waitFor(() => {
    const canvases = container.querySelectorAll<HTMLCanvasElement>(
      '[data-board-canvas="true"]',
    );

    expect(canvases.length).toBeGreaterThan(0);

    for (const canvas of canvases) {
      expect(canvas.dataset.boardCanvasReady).toBe('true');
      expect(Number(canvas.dataset.boardCanvasVisibleCells)).toBeGreaterThan(0);
      const pixels = canvas
        .getContext('2d')
        ?.getImageData(0, 0, canvas.width, canvas.height).data;

      expect(pixels?.some((value, index) => index % 4 === 3 && value > 0)).toBe(
        true,
      );
    }
  });
};
