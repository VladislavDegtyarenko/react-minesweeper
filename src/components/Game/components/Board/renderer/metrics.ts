import {
  BOARD_CANVAS_MAX_BACKING_EDGE,
  BOARD_CANVAS_MAX_BACKING_PIXELS,
  BOARD_CANVAS_MAX_DPR,
} from './constants';
import type { BoardCanvasMetrics } from './types';

const getEffectiveDpr = ({
  cssHeight,
  cssWidth,
  devicePixelRatio,
}: {
  cssHeight: number;
  cssWidth: number;
  devicePixelRatio: number;
}): number => {
  const requestedDpr =
    Number.isFinite(devicePixelRatio) && devicePixelRatio > 0
      ? Math.min(devicePixelRatio, BOARD_CANVAS_MAX_DPR)
      : 1;
  const edgeLimitedDpr = Math.min(
    BOARD_CANVAS_MAX_BACKING_EDGE / cssWidth,
    BOARD_CANVAS_MAX_BACKING_EDGE / cssHeight,
  );
  const areaLimitedDpr = Math.sqrt(
    BOARD_CANVAS_MAX_BACKING_PIXELS / (cssWidth * cssHeight),
  );

  return Math.min(requestedDpr, edgeLimitedDpr, areaLimitedDpr);
};

export const getBoardCanvasMetrics = ({
  cssHeight,
  cssWidth,
  devicePixelRatio,
}: {
  cssHeight: number;
  cssWidth: number;
  devicePixelRatio: number;
}): BoardCanvasMetrics | null => {
  if (
    !Number.isFinite(cssWidth) ||
    !Number.isFinite(cssHeight) ||
    cssWidth <= 0 ||
    cssHeight <= 0
  ) {
    return null;
  }

  const dpr = getEffectiveDpr({
    cssHeight,
    cssWidth,
    devicePixelRatio,
  });
  const backingWidth = Math.max(1, Math.floor(cssWidth * dpr));
  const backingHeight = Math.max(1, Math.floor(cssHeight * dpr));

  return {
    backingHeight,
    backingWidth,
    cssHeight,
    cssWidth,
    dpr,
    scaleX: backingWidth / cssWidth,
    scaleY: backingHeight / cssHeight,
  };
};
