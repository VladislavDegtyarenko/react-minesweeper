import { clamp } from '@/utils';
import {
  CELL_ACTIVE_SCALE,
  CELL_IMAGE_SIZE_RATIO,
  CELL_NUMBER_BASELINE_OFFSET_RATIO,
  CELL_NUMBER_SIZE_RATIO,
} from './constants';
import { getBoardCellRenderModel, getMarkerAnimationFrame } from './model';
import { mixBoardCanvasColors } from './color';
import { getBoardHoverEffectFrame } from './interactionTween';
import {
  getBoardResultHighlightBorderWidth,
  getBoardResultHighlightEffectFrame,
} from './resultTween';
import { getBoardCanvasShadowGeometry } from './shadow';
import type {
  BoardCanvasAssetName,
  BoardCellResultHighlightFrame,
  BoardCanvasTheme,
  DrawCellOptions,
} from './types';

type CellRect = {
  height: number;
  width: number;
  x: number;
  y: number;
};

type Shadow = {
  blur: number;
  color: string;
  offsetX?: number;
  offsetY?: number;
};

const RESULT_BORDER_COLOR = 'rgba(255, 255, 255, 0.04)';
const RESULT_GREEN_FILL = 'rgba(51, 214, 159, 0.22)';
const RESULT_GREEN_RING = 'rgba(51, 214, 159, 0.32)';
const RESULT_RED_FILL = 'rgba(255, 92, 122, 0.22)';
const RESULT_RED_GLOW = 'rgba(255, 92, 122, 0.3)';
const RESULT_RED_RING = 'rgba(255, 92, 122, 0.45)';
const HOVER_BORDER_COLOR = 'rgba(255, 255, 255, 0.06)';
const HOVER_SHADOW_COLOR = 'rgba(0, 0, 0, 0.28)';
const SURFACE_BASE_BORDER_COLOR = 'rgba(255, 255, 255, 0.03)';
const SURFACE_RED_FILL = 'rgba(255, 92, 122, 0.18)';
const SURFACE_RED_GLOW = 'rgba(255, 92, 122, 0.35)';
const SURFACE_RED_RING = 'rgba(255, 92, 122, 0.6)';

const withOpacity = (
  context: CanvasRenderingContext2D,
  opacity: number,
  draw: () => void,
) => {
  const clampedOpacity = clamp(opacity, 0, 1);

  if (clampedOpacity <= 0) {
    return undefined;
  }

  context.save();
  context.globalAlpha *= clampedOpacity;
  draw();
  context.restore();
};

const addRoundedRectPath = (
  context: CanvasRenderingContext2D,
  { height, width, x, y }: CellRect,
  radius: number,
  shouldBeginPath = true,
) => {
  const safeRadius = Math.max(0, Math.min(radius, width / 2, height / 2));

  if (shouldBeginPath) {
    context.beginPath();
  }

  context.moveTo(x + safeRadius, y);
  context.lineTo(x + width - safeRadius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  context.lineTo(x + width, y + height - safeRadius);
  context.quadraticCurveTo(
    x + width,
    y + height,
    x + width - safeRadius,
    y + height,
  );
  context.lineTo(x + safeRadius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  context.lineTo(x, y + safeRadius);
  context.quadraticCurveTo(x, y, x + safeRadius, y);
  context.closePath();
};

const fillRoundedRect = (
  context: CanvasRenderingContext2D,
  rect: CellRect,
  radius: number,
  fill: string,
) => {
  context.save();
  context.fillStyle = fill;
  addRoundedRectPath(context, rect, radius);
  context.fill();
  context.restore();
};

const drawRoundedRectShadow = (
  context: CanvasRenderingContext2D,
  rect: CellRect,
  radius: number,
  shadow: Shadow,
) => {
  context.save();
  context.beginPath();
  context.rect(-100_000, -100_000, 200_000, 200_000);
  addRoundedRectPath(context, rect, radius, false);
  context.clip('evenodd');
  const geometry = getBoardCanvasShadowGeometry({
    blur: shadow.blur,
    offsetX: shadow.offsetX,
    offsetY: shadow.offsetY,
    transform: context.getTransform(),
  });

  context.shadowBlur = geometry.blur;
  context.shadowColor = shadow.color;
  context.shadowOffsetX = geometry.offsetX;
  context.shadowOffsetY = geometry.offsetY;
  context.fillStyle = '#000';
  addRoundedRectPath(context, rect, radius);
  context.fill();
  context.restore();
};

const strokeRoundedRect = (
  context: CanvasRenderingContext2D,
  rect: CellRect,
  radius: number,
  color: string,
  width: number,
) => {
  if (width <= 0) {
    return undefined;
  }

  const inset = width / 2;
  const insetRect = {
    height: Math.max(0, rect.height - width),
    width: Math.max(0, rect.width - width),
    x: rect.x + inset,
    y: rect.y + inset,
  };

  context.save();
  context.lineWidth = width;
  context.strokeStyle = color;
  addRoundedRectPath(context, insetRect, Math.max(0, radius - inset));
  context.stroke();
  context.restore();
};

const fillOuterRoundedRect = (
  context: CanvasRenderingContext2D,
  rect: CellRect,
  radius: number,
  color: string,
  spread: number,
) => {
  if (spread <= 0) {
    return undefined;
  }

  context.save();
  context.fillStyle = color;
  addRoundedRectPath(
    context,
    {
      height: rect.height + spread * 2,
      width: rect.width + spread * 2,
      x: rect.x - spread,
      y: rect.y - spread,
    },
    radius + spread,
  );
  addRoundedRectPath(context, rect, radius, false);
  context.fill('evenodd');
  context.restore();
};

const drawRevealedSurface = (
  context: CanvasRenderingContext2D,
  rect: CellRect,
  radius: number,
  borderWidth: number,
  theme: BoardCanvasTheme,
  redProgress: number,
) => {
  const progress = clamp(redProgress, 0, 1);
  const effect = getBoardResultHighlightEffectFrame({
    channel: 'surfaceRed',
    progress,
  });

  withOpacity(context, effect.opacity, () => {
    drawRoundedRectShadow(context, rect, radius, {
      blur: effect.blur,
      color: SURFACE_RED_GLOW,
    });
    fillOuterRoundedRect(
      context,
      rect,
      radius,
      SURFACE_RED_RING,
      effect.spread,
    );
  });

  fillRoundedRect(
    context,
    rect,
    radius,
    mixBoardCanvasColors(theme.cellRevealed, SURFACE_RED_FILL, progress),
  );
  strokeRoundedRect(
    context,
    rect,
    radius,
    mixBoardCanvasColors(
      SURFACE_BASE_BORDER_COLOR,
      RESULT_BORDER_COLOR,
      progress,
    ),
    getBoardResultHighlightBorderWidth({
      baseWidth: borderWidth,
      progress,
    }),
  );
};

const getOverlayHighlightWeights = (
  resultHighlight: BoardCellResultHighlightFrame,
): { green: number; normal: number; red: number } => {
  const rawGreen = clamp(resultHighlight.overlayGreen, 0, 1);
  const rawRed = clamp(resultHighlight.overlayRed, 0, 1);
  const total = rawGreen + rawRed;
  const scale = total > 1 ? 1 / total : 1;
  const green = rawGreen * scale;
  const red = rawRed * scale;

  return {
    green,
    normal: Math.max(0, 1 - green - red),
    red,
  };
};

const mixOverlayHighlightColor = ({
  base,
  green,
  greenTarget,
  normal,
  red,
  redTarget,
}: {
  base: string;
  green: number;
  greenTarget: string;
  normal: number;
  red: number;
  redTarget: string;
}): string => {
  const nonGreenWeight = normal + red;
  const withoutGreen =
    nonGreenWeight > 0
      ? mixBoardCanvasColors(base, redTarget, red / nonGreenWeight)
      : base;

  return mixBoardCanvasColors(withoutGreen, greenTarget, green);
};

const drawClosedSurface = ({
  borderWidth,
  context,
  hoverProgress,
  radius,
  rect,
  resultHighlight,
  theme,
}: {
  borderWidth: number;
  context: CanvasRenderingContext2D;
  hoverProgress: number;
  radius: number;
  rect: CellRect;
  resultHighlight: BoardCellResultHighlightFrame;
  theme: BoardCanvasTheme;
}) => {
  const clampedHoverProgress = clamp(hoverProgress, 0, 1);
  const weights = getOverlayHighlightWeights(resultHighlight);
  const highlightProgress = weights.green + weights.red;
  const baseEffectsOpacity = 1 - clampedHoverProgress;
  const fill = mixOverlayHighlightColor({
    base: theme.cellClosed,
    green: weights.green,
    greenTarget: RESULT_GREEN_FILL,
    normal: weights.normal,
    red: weights.red,
    redTarget: RESULT_RED_FILL,
  });
  const border = mixOverlayHighlightColor({
    base: theme.cellBorder,
    green: weights.green,
    greenTarget: RESULT_BORDER_COLOR,
    normal: weights.normal,
    red: weights.red,
    redTarget: RESULT_BORDER_COLOR,
  });
  const greenEffect = getBoardResultHighlightEffectFrame({
    channel: 'overlayGreen',
    progress: weights.green,
  });
  const redEffect = getBoardResultHighlightEffectFrame({
    channel: 'overlayRed',
    progress: weights.red,
  });
  const resultBorderWidth = getBoardResultHighlightBorderWidth({
    baseWidth: borderWidth,
    progress: highlightProgress,
  });
  const hoverEffect = getBoardHoverEffectFrame({
    baseBorderWidth: resultBorderWidth,
    progress: clampedHoverProgress,
  });

  withOpacity(context, greenEffect.opacity * baseEffectsOpacity, () => {
    fillOuterRoundedRect(
      context,
      rect,
      radius,
      RESULT_GREEN_RING,
      greenEffect.spread,
    );
  });
  withOpacity(context, redEffect.opacity * baseEffectsOpacity, () => {
    drawRoundedRectShadow(context, rect, radius, {
      blur: redEffect.blur,
      color: RESULT_RED_GLOW,
    });
    fillOuterRoundedRect(
      context,
      rect,
      radius,
      RESULT_RED_RING,
      redEffect.spread,
    );
  });
  withOpacity(context, hoverEffect.opacity, () => {
    drawRoundedRectShadow(context, rect, radius, {
      blur: hoverEffect.blur,
      color: HOVER_SHADOW_COLOR,
      offsetY: hoverEffect.offsetY,
    });
  });
  fillRoundedRect(
    context,
    rect,
    radius,
    mixBoardCanvasColors(fill, theme.cellClosedHover, clampedHoverProgress),
  );
  strokeRoundedRect(
    context,
    rect,
    radius,
    mixBoardCanvasColors(border, HOVER_BORDER_COLOR, clampedHoverProgress),
    hoverEffect.borderWidth,
  );
};

const drawImage = ({
  assetName,
  assets,
  context,
  opacity = 1,
  rect,
  sizeRatio,
  theme,
  translateY = 0,
}: {
  assetName: BoardCanvasAssetName;
  assets: DrawCellOptions['assets'];
  context: CanvasRenderingContext2D;
  opacity?: number;
  rect: CellRect;
  sizeRatio: number;
  theme: BoardCanvasTheme;
  translateY?: number;
}) => {
  const image = assets[assetName];
  const imageWidth = rect.width * sizeRatio;
  const imageHeight = rect.height * sizeRatio;
  const imageX = rect.x + (rect.width - imageWidth) / 2;
  const imageY = rect.y + (rect.height - imageHeight) / 2 + translateY;
  const imageRect = {
    height: imageHeight,
    width: imageWidth,
    x: imageX,
    y: imageY,
  };
  const shortestSide = Math.min(imageWidth, imageHeight);

  context.save();
  context.globalAlpha = opacity;

  if (image) {
    context.drawImage(image, imageX, imageY, imageWidth, imageHeight);
    context.restore();

    return undefined;
  }

  context.lineCap = 'round';
  context.lineJoin = 'round';

  if (assetName === 'bomb') {
    context.fillStyle = '#101622';
    context.beginPath();
    context.arc(
      imageX + imageWidth / 2,
      imageY + imageHeight * 0.56,
      shortestSide * 0.31,
      0,
      Math.PI * 2,
    );
    context.fill();
    context.lineWidth = Math.max(1, shortestSide * 0.06);
    context.strokeStyle = theme.textPrimary;
    context.beginPath();
    context.moveTo(imageX + imageWidth * 0.6, imageY + imageHeight * 0.28);
    context.quadraticCurveTo(
      imageX + imageWidth * 0.72,
      imageY + imageHeight * 0.12,
      imageX + imageWidth * 0.82,
      imageY + imageHeight * 0.2,
    );
    context.stroke();
  } else if (assetName === 'flag') {
    context.lineWidth = Math.max(1, shortestSide * 0.08);
    context.strokeStyle = theme.textPrimary;
    context.beginPath();
    context.moveTo(imageX + imageWidth * 0.3, imageY + imageHeight * 0.12);
    context.lineTo(imageX + imageWidth * 0.3, imageY + imageHeight * 0.88);
    context.stroke();
    context.fillStyle = '#ff5c7a';
    context.beginPath();
    context.moveTo(imageX + imageWidth * 0.34, imageY + imageHeight * 0.18);
    context.lineTo(imageX + imageWidth * 0.82, imageY + imageHeight * 0.34);
    context.lineTo(imageX + imageWidth * 0.34, imageY + imageHeight * 0.52);
    context.closePath();
    context.fill();
  } else if (assetName === 'question') {
    context.fillStyle = theme.textPrimary;
    context.font = `700 ${shortestSide * 0.82}px ${theme.fontFamily}`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('?', imageX + imageWidth / 2, imageY + imageHeight / 2);
  } else {
    context.lineWidth = Math.max(2, shortestSide * 0.11);
    context.strokeStyle = '#f30000';
    context.beginPath();
    context.moveTo(imageRect.x, imageRect.y);
    context.lineTo(
      imageRect.x + imageRect.width,
      imageRect.y + imageRect.height,
    );
    context.moveTo(imageRect.x + imageRect.width, imageRect.y);
    context.lineTo(imageRect.x, imageRect.y + imageRect.height);
    context.stroke();
  }

  context.restore();
};

const drawNumber = ({
  context,
  number,
  rect,
  theme,
}: {
  context: CanvasRenderingContext2D;
  number: number;
  rect: CellRect;
  theme: BoardCanvasTheme;
}) => {
  const fontSize = Math.min(rect.width, rect.height) * CELL_NUMBER_SIZE_RATIO;

  context.save();
  context.fillStyle = theme.numberColors[number] ?? theme.textPrimary;
  context.font = `700 ${fontSize}px ${theme.fontFamily}`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(
    String(number),
    rect.x + rect.width / 2,
    rect.y +
      rect.height / 2 +
      Math.min(rect.width, rect.height) * CELL_NUMBER_BASELINE_OFFSET_RATIO,
  );
  context.restore();
};

export const drawBoardCell = ({
  animation,
  assets,
  borderWidth,
  cell,
  cellHeight,
  cellIndex,
  cellWidth,
  context,
  hoverProgress,
  inset,
  isGameLost,
  now,
  pitchX,
  pitchY,
  pressProgress,
  resultHighlight,
  rowIndex,
  theme,
  zoom,
}: DrawCellOptions): boolean => {
  const model = getBoardCellRenderModel(cell, isGameLost);
  const rect = {
    height: cellHeight,
    width: cellWidth,
    x: cellIndex * pitchX + inset,
    y: rowIndex * pitchY + inset,
  };
  const radius = Math.min(cellWidth, cellHeight) * theme.radiusRatio;

  drawRevealedSurface(
    context,
    rect,
    radius,
    borderWidth,
    theme,
    resultHighlight.surfaceRed,
  );

  if (!model.isClosed) {
    if (model.content === 'bomb') {
      drawImage({
        assetName: 'bomb',
        assets,
        context,
        rect,
        sizeRatio: CELL_IMAGE_SIZE_RATIO,
        theme,
      });
    } else if (model.content === 'number' && model.number !== null) {
      drawNumber({
        context,
        number: model.number,
        rect,
        theme,
      });
    }
  } else {
    const centerX = rect.x + rect.width / 2;
    const centerY = rect.y + rect.height / 2;
    const clampedPressProgress = clamp(pressProgress, 0, 1);
    const scale = 1 + (CELL_ACTIVE_SCALE - 1) * clampedPressProgress;
    const localRect = {
      height: rect.height,
      width: rect.width,
      x: -rect.width / 2,
      y: -rect.height / 2,
    };
    const markerFrame = getMarkerAnimationFrame({
      animation,
      now,
      zoom,
    });

    context.save();
    context.translate(centerX, centerY);
    context.scale(scale, scale);
    drawClosedSurface({
      borderWidth,
      context,
      hoverProgress,
      radius,
      rect: localRect,
      resultHighlight,
      theme,
    });

    if (model.content === 'flag' || model.content === 'question') {
      drawImage({
        assetName: model.content,
        assets,
        context,
        opacity: markerFrame.opacity,
        rect: localRect,
        sizeRatio: CELL_IMAGE_SIZE_RATIO,
        theme,
        translateY: markerFrame.translateY,
      });
    }

    context.restore();

    if (model.showWrongFlagCross) {
      drawImage({
        assetName: 'cross',
        assets,
        context,
        rect,
        sizeRatio: 1,
        theme,
      });
    }

    return markerFrame.isActive;
  }

  return false;
};
