import { BOARD_CANVAS_ASSET_PATHS } from './constants';
import type {
  BoardCanvasAssetName,
  BoardCanvasAssets,
  CompleteBoardCanvasAssets,
} from './types';

let assetsPromise: Promise<CompleteBoardCanvasAssets> | null = null;

const loadImage = (
  name: BoardCanvasAssetName,
  source: string,
): Promise<[BoardCanvasAssetName, HTMLImageElement]> =>
  new Promise((resolve, reject) => {
    const image = new Image();

    image.decoding = 'async';
    image.onload = () => resolve([name, image]);
    image.onerror = () =>
      reject(new Error(`Failed to load board canvas asset: ${source}`));
    image.src = source;
  });

export const hasCompleteBoardCanvasAssets = (
  assets: BoardCanvasAssets,
): assets is CompleteBoardCanvasAssets =>
  Object.keys(BOARD_CANVAS_ASSET_PATHS).every(
    (name) => assets[name as BoardCanvasAssetName] !== undefined,
  );

export const loadBoardCanvasAssets = (): Promise<CompleteBoardCanvasAssets> => {
  if (assetsPromise) {
    return assetsPromise;
  }

  const entries = Object.entries(BOARD_CANVAS_ASSET_PATHS) as [
    BoardCanvasAssetName,
    string,
  ][];

  assetsPromise = Promise.all(
    entries.map(([name, source]) => loadImage(name, source)),
  )
    .then(
      (loadedEntries) =>
        Object.fromEntries(loadedEntries) as CompleteBoardCanvasAssets,
    )
    .catch((error: unknown) => {
      assetsPromise = null;

      throw error;
    });

  return assetsPromise;
};
