import { clamp } from '@/utils';
import type {
  BoardCanvasCamera,
  BoardCanvasViewport,
  BoardVisibleRange,
} from './types';

type Rect = {
  height: number;
  left: number;
  top: number;
  width: number;
};

type GetBoardCanvasCameraOptions = {
  boardClientHeight: number;
  boardClientLeft: number;
  boardClientTop: number;
  boardClientWidth: number;
  boardRect: Rect;
  renderLayerOffsetWidth: number;
  renderLayerRect: Rect;
  surfaceRect: Rect;
};

const isPositiveFinite = (value: number): boolean =>
  Number.isFinite(value) && value > 0;

export const getBoardCanvasCamera = ({
  boardClientHeight,
  boardClientLeft,
  boardClientTop,
  boardClientWidth,
  boardRect,
  renderLayerOffsetWidth,
  renderLayerRect,
  surfaceRect,
}: GetBoardCanvasCameraOptions): BoardCanvasCamera | null => {
  if (
    !isPositiveFinite(boardClientWidth) ||
    !isPositiveFinite(boardClientHeight) ||
    !isPositiveFinite(renderLayerOffsetWidth) ||
    !isPositiveFinite(renderLayerRect.width) ||
    !isPositiveFinite(surfaceRect.width) ||
    !isPositiveFinite(surfaceRect.height)
  ) {
    return null;
  }

  const previewScale = renderLayerRect.width / renderLayerOffsetWidth;

  if (!isPositiveFinite(previewScale)) {
    return null;
  }

  const viewportLeft = boardRect.left + boardClientLeft;
  const viewportTop = boardRect.top + boardClientTop;
  const layerX = (viewportLeft - renderLayerRect.left) / previewScale;
  const layerY = (viewportTop - renderLayerRect.top) / previewScale;
  const surfaceOffsetX =
    (surfaceRect.left - renderLayerRect.left) / previewScale;
  const surfaceOffsetY = (surfaceRect.top - renderLayerRect.top) / previewScale;
  const canvasCssWidth = boardClientWidth / previewScale;
  const canvasCssHeight = boardClientHeight / previewScale;

  return {
    canvasCssHeight,
    canvasCssWidth,
    layerX,
    layerY,
    previewScale,
    screenHeight: boardClientHeight,
    screenWidth: boardClientWidth,
    surfaceHeight: surfaceRect.height / previewScale,
    surfaceOffsetX,
    surfaceOffsetY,
    surfaceWidth: surfaceRect.width / previewScale,
    viewport: {
      height: canvasCssHeight,
      width: canvasCssWidth,
      x: layerX - surfaceOffsetX,
      y: layerY - surfaceOffsetY,
    },
  };
};

export const getVisibleBoardRange = ({
  cols,
  overscan = 1,
  rows,
  surfaceHeight,
  surfaceWidth,
  viewport,
}: {
  cols: number;
  overscan?: number;
  rows: number;
  surfaceHeight: number;
  surfaceWidth: number;
  viewport: BoardCanvasViewport;
}): BoardVisibleRange | null => {
  if (
    !Number.isInteger(cols) ||
    cols <= 0 ||
    !Number.isInteger(rows) ||
    rows <= 0 ||
    !isPositiveFinite(surfaceWidth) ||
    !isPositiveFinite(surfaceHeight) ||
    !isPositiveFinite(viewport.width) ||
    !isPositiveFinite(viewport.height)
  ) {
    return null;
  }

  const pitchX = surfaceWidth / cols;
  const pitchY = surfaceHeight / rows;
  const safeOverscan = Math.max(0, Math.floor(overscan));
  const startColumn = clamp(
    Math.floor(viewport.x / pitchX) - safeOverscan,
    0,
    cols,
  );
  const endColumn = clamp(
    Math.ceil((viewport.x + viewport.width) / pitchX) + safeOverscan,
    0,
    cols,
  );
  const startRow = clamp(
    Math.floor(viewport.y / pitchY) - safeOverscan,
    0,
    rows,
  );
  const endRow = clamp(
    Math.ceil((viewport.y + viewport.height) / pitchY) + safeOverscan,
    0,
    rows,
  );

  return {
    endColumn: Math.max(startColumn, endColumn),
    endRow: Math.max(startRow, endRow),
    startColumn,
    startRow,
  };
};
