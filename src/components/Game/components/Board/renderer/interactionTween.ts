import type { BoardCellCoordinates } from '../types';
import { clamp } from '@/utils';
import { getBoardCellAnimationKey } from './cellKey';
import {
  BOARD_HOVER_TWEEN_DURATION_MS,
  BOARD_PRESS_TWEEN_DURATION_MS,
  BOARD_TWEEN_EPSILON,
} from './constants';
import type {
  BoardCellInteractionFrame,
  BoardInteractionFrame,
  BoardInteractionTweenChannel,
  BoardInteractionTweens,
} from './types';
import { sampleBoardScalarTween } from './tween';

const HOVER_BORDER_WIDTH_PX = 1;
const HOVER_SHADOW_BLUR_PX = 12;
const HOVER_SHADOW_OFFSET_Y_PX = 4;
export const getBoardHoverEffectFrame = ({
  baseBorderWidth,
  progress,
}: {
  baseBorderWidth: number;
  progress: number;
}) => {
  const clampedProgress = clamp(progress, 0, 1);

  return {
    borderWidth:
      baseBorderWidth +
      (HOVER_BORDER_WIDTH_PX - baseBorderWidth) * clampedProgress,
    blur: HOVER_SHADOW_BLUR_PX * clampedProgress,
    offsetY: HOVER_SHADOW_OFFSET_Y_PX * clampedProgress,
    opacity: clampedProgress,
  };
};

const getCellKey = (cell: BoardCellCoordinates | null): string | null =>
  cell ? getBoardCellAnimationKey(cell.rowIndex, cell.cellIndex) : null;

const createChannel = (): BoardInteractionTweenChannel => ({
  byCell: new Map(),
  snapRevision: 0,
  targetKey: null,
});

export const createBoardInteractionTweens = (): BoardInteractionTweens => ({
  hover: createChannel(),
  press: createChannel(),
});

const setStableTarget = (
  channel: BoardInteractionTweenChannel,
  targetKey: string | null,
  now: number,
) => {
  channel.byCell.clear();

  if (targetKey) {
    channel.byCell.set(targetKey, {
      durationMs: 0,
      from: 1,
      startedAt: now,
      to: 1,
    });
  }

  channel.targetKey = targetKey;
};

const syncChannel = ({
  baseDurationMs,
  channel,
  now,
  snapRevision,
  targetKey,
}: {
  baseDurationMs: number;
  channel: BoardInteractionTweenChannel;
  now: number;
  snapRevision: number;
  targetKey: string | null;
}) => {
  if (channel.snapRevision !== snapRevision) {
    channel.snapRevision = snapRevision;
    setStableTarget(channel, targetKey, now);

    return undefined;
  }

  if (channel.targetKey === targetKey) {
    return undefined;
  }

  const keys = new Set(channel.byCell.keys());

  if (targetKey) {
    keys.add(targetKey);
  }

  keys.forEach((key) => {
    const tween = channel.byCell.get(key);
    const currentValue = tween ? sampleBoardScalarTween(tween, now).value : 0;
    const nextTarget = key === targetKey ? 1 : 0;
    const distance = Math.abs(nextTarget - currentValue);

    if (distance <= BOARD_TWEEN_EPSILON) {
      if (nextTarget === 0) {
        channel.byCell.delete(key);
      } else {
        channel.byCell.set(key, {
          durationMs: 0,
          from: 1,
          startedAt: now,
          to: 1,
        });
      }

      return undefined;
    }

    channel.byCell.set(key, {
      durationMs: baseDurationMs * distance,
      from: currentValue,
      startedAt: now,
      to: nextTarget,
    });
  });

  channel.targetKey = targetKey;
};

export const syncBoardInteractionTweens = ({
  hoverSnapRevision,
  hoveredCell,
  now,
  pressSnapRevision,
  pressedCell,
  tweens,
}: {
  hoverSnapRevision: number;
  hoveredCell: BoardCellCoordinates | null;
  now: number;
  pressSnapRevision: number;
  pressedCell: BoardCellCoordinates | null;
  tweens: BoardInteractionTweens;
}) => {
  syncChannel({
    baseDurationMs: BOARD_HOVER_TWEEN_DURATION_MS,
    channel: tweens.hover,
    now,
    snapRevision: hoverSnapRevision,
    targetKey: getCellKey(hoveredCell),
  });
  syncChannel({
    baseDurationMs: BOARD_PRESS_TWEEN_DURATION_MS,
    channel: tweens.press,
    now,
    snapRevision: pressSnapRevision,
    targetKey: getCellKey(pressedCell),
  });
};

export const retainBoardInteractionTweenCells = (
  tweens: BoardInteractionTweens,
  validCellKeys: ReadonlySet<string>,
) => {
  [tweens.hover, tweens.press].forEach((channel) => {
    channel.byCell.forEach((_, key) => {
      if (!validCellKeys.has(key)) {
        channel.byCell.delete(key);
      }
    });

    if (channel.targetKey && !validCellKeys.has(channel.targetKey)) {
      channel.targetKey = null;
    }
  });
};

export const sampleBoardInteractionTweens = (
  tweens: BoardInteractionTweens,
  now: number,
): BoardInteractionFrame => {
  const keys = new Set([
    ...tweens.hover.byCell.keys(),
    ...tweens.press.byCell.keys(),
  ]);
  const byCell = new Map<string, BoardCellInteractionFrame>();
  let isActive = false;

  keys.forEach((key) => {
    const hoverTween = tweens.hover.byCell.get(key);
    const pressTween = tweens.press.byCell.get(key);
    const hoverFrame = hoverTween
      ? sampleBoardScalarTween(hoverTween, now)
      : { isActive: false, value: 0 };
    const pressFrame = pressTween
      ? sampleBoardScalarTween(pressTween, now)
      : { isActive: false, value: 0 };

    isActive = isActive || hoverFrame.isActive || pressFrame.isActive;

    if (
      hoverFrame.value > BOARD_TWEEN_EPSILON ||
      pressFrame.value > BOARD_TWEEN_EPSILON
    ) {
      byCell.set(key, {
        hover: hoverFrame.value,
        press: pressFrame.value,
      });
    }

    if (!hoverFrame.isActive && hoverTween?.to === 0) {
      tweens.hover.byCell.delete(key);
    }

    if (!pressFrame.isActive && pressTween?.to === 0) {
      tweens.press.byCell.delete(key);
    }
  });

  return {
    byCell,
    isActive,
  };
};
