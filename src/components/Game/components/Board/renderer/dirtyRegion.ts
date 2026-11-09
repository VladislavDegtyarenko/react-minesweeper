import {
  BOARD_INTERACTION_DIRTY_BLEED_PX,
  BOARD_INTERACTION_DIRTY_MAX_AREA_RATIO,
} from './constants';
import { parseBoardCellAnimationKey } from './cellKey';
import type { BoardCanvasDirtyRegion, BoardCanvasViewport } from './types';

const isPositiveFinite = (value: number): boolean =>
  Number.isFinite(value) && value > 0;

const isFiniteViewport = (viewport: BoardCanvasViewport): boolean =>
  Number.isFinite(viewport.x) &&
  Number.isFinite(viewport.y) &&
  isPositiveFinite(viewport.width) &&
  isPositiveFinite(viewport.height);

const getViewportArea = (viewport: BoardCanvasViewport): number =>
  viewport.width * viewport.height;

export const getBoardInteractionDirtyViewport = ({
  bleedPx = BOARD_INTERACTION_DIRTY_BLEED_PX,
  cellKeys,
  cols,
  rows,
  surfaceHeight,
  surfaceWidth,
  viewport,
}: {
  bleedPx?: number;
  cellKeys: Iterable<string>;
  cols: number;
  rows: number;
  surfaceHeight: number;
  surfaceWidth: number;
  viewport: BoardCanvasViewport;
}): BoardCanvasViewport | null => {
  if (
    !Number.isInteger(cols) ||
    cols <= 0 ||
    !Number.isInteger(rows) ||
    rows <= 0 ||
    !isPositiveFinite(surfaceWidth) ||
    !isPositiveFinite(surfaceHeight) ||
    !Number.isFinite(bleedPx) ||
    bleedPx < 0 ||
    !isFiniteViewport(viewport)
  ) {
    return null;
  }

  const pitchX = surfaceWidth / cols;
  const pitchY = surfaceHeight / rows;
  let minColumn = cols;
  let maxColumn = -1;
  let minRow = rows;
  let maxRow = -1;

  for (const cellKey of cellKeys) {
    const coordinates = parseBoardCellAnimationKey(cellKey);

    if (!coordinates) {
      continue;
    }

    const { rowIndex, cellIndex } = coordinates;

    if (
      rowIndex < 0 ||
      rowIndex >= rows ||
      cellIndex < 0 ||
      cellIndex >= cols
    ) {
      continue;
    }

    minColumn = Math.min(minColumn, cellIndex);
    maxColumn = Math.max(maxColumn, cellIndex);
    minRow = Math.min(minRow, rowIndex);
    maxRow = Math.max(maxRow, rowIndex);
  }

  if (maxColumn < minColumn || maxRow < minRow) {
    return null;
  }

  const left = Math.max(viewport.x, minColumn * pitchX - bleedPx);
  const top = Math.max(viewport.y, minRow * pitchY - bleedPx);
  const right = Math.min(
    viewport.x + viewport.width,
    (maxColumn + 1) * pitchX + bleedPx,
  );
  const bottom = Math.min(
    viewport.y + viewport.height,
    (maxRow + 1) * pitchY + bleedPx,
  );

  if (right <= left || bottom <= top) {
    return null;
  }

  return {
    height: bottom - top,
    width: right - left,
    x: left,
    y: top,
  };
};

export const isBoardInteractionDirtyViewportEfficient = ({
  dirtyViewport,
  fullViewport,
  maxAreaRatio = BOARD_INTERACTION_DIRTY_MAX_AREA_RATIO,
}: {
  dirtyViewport: BoardCanvasViewport;
  fullViewport: BoardCanvasViewport;
  maxAreaRatio?: number;
}): boolean => {
  const dirtyArea = getViewportArea(dirtyViewport);
  const fullArea = getViewportArea(fullViewport);

  return (
    isFiniteViewport(dirtyViewport) &&
    isFiniteViewport(fullViewport) &&
    isPositiveFinite(dirtyArea) &&
    isPositiveFinite(fullArea) &&
    Number.isFinite(maxAreaRatio) &&
    maxAreaRatio > 0 &&
    dirtyArea / fullArea <= maxAreaRatio
  );
};

export const getBoardCanvasDirtyRegion = ({
  backingHeight,
  backingWidth,
  dirtyViewport,
  fullViewport,
  scaleX,
  scaleY,
}: {
  backingHeight: number;
  backingWidth: number;
  dirtyViewport: BoardCanvasViewport;
  fullViewport: BoardCanvasViewport;
  scaleX: number;
  scaleY: number;
}): BoardCanvasDirtyRegion | null => {
  if (
    !Number.isInteger(backingWidth) ||
    backingWidth <= 0 ||
    !Number.isInteger(backingHeight) ||
    backingHeight <= 0 ||
    !isPositiveFinite(scaleX) ||
    !isPositiveFinite(scaleY) ||
    !isFiniteViewport(dirtyViewport) ||
    !isFiniteViewport(fullViewport)
  ) {
    return null;
  }

  const deviceLeft = Math.max(
    0,
    Math.floor((dirtyViewport.x - fullViewport.x) * scaleX),
  );
  const deviceTop = Math.max(
    0,
    Math.floor((dirtyViewport.y - fullViewport.y) * scaleY),
  );
  const deviceRight = Math.min(
    backingWidth,
    Math.ceil(
      (dirtyViewport.x + dirtyViewport.width - fullViewport.x) * scaleX,
    ),
  );
  const deviceBottom = Math.min(
    backingHeight,
    Math.ceil(
      (dirtyViewport.y + dirtyViewport.height - fullViewport.y) * scaleY,
    ),
  );

  if (deviceRight <= deviceLeft || deviceBottom <= deviceTop) {
    return null;
  }

  return {
    deviceRect: {
      height: deviceBottom - deviceTop,
      width: deviceRight - deviceLeft,
      x: deviceLeft,
      y: deviceTop,
    },
    worldViewport: {
      height: (deviceBottom - deviceTop) / scaleY,
      width: (deviceRight - deviceLeft) / scaleX,
      x: fullViewport.x + deviceLeft / scaleX,
      y: fullViewport.y + deviceTop / scaleY,
    },
  };
};
