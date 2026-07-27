import type { GameCell, TBoard } from '@/types';
import { clamp } from '@/utils';
import { getBoardCellAnimationKey } from './cellKey';
import { getBoardCellRenderModel } from './model';
import {
  BOARD_RESULT_HIGHLIGHT_TWEEN_DURATION_MS,
  BOARD_TWEEN_EPSILON,
} from './constants';
import type {
  BoardCellResultHighlightFrame,
  BoardResultHighlightChannel,
  BoardResultHighlightFrame,
  BoardScalarTween,
} from './types';
import { sampleBoardScalarTween } from './tween';

const RESULT_HIGHLIGHT_CHANNELS = [
  'overlayGreen',
  'overlayRed',
  'surfaceRed',
] as const satisfies readonly BoardResultHighlightChannel[];
const RESULT_HIGHLIGHT_EFFECTS = {
  overlayGreen: {
    blur: 0,
    spread: 1,
  },
  overlayRed: {
    blur: 12,
    spread: 1,
  },
  surfaceRed: {
    blur: 20,
    spread: 2,
  },
} as const satisfies Record<
  BoardResultHighlightChannel,
  { blur: number; spread: number }
>;
const RESULT_HIGHLIGHT_BORDER_WIDTH_PX = 1;
type BoardResultHighlightTweens = {
  byChannel: Record<BoardResultHighlightChannel, Map<string, BoardScalarTween>>;
  isInitialized: boolean;
  targets: Map<string, BoardResultHighlightChannel>;
};

export const getBoardResultHighlightBorderWidth = ({
  baseWidth,
  progress,
}: {
  baseWidth: number;
  progress: number;
}): number => {
  const clampedProgress = clamp(progress, 0, 1);

  return (
    baseWidth + (RESULT_HIGHLIGHT_BORDER_WIDTH_PX - baseWidth) * clampedProgress
  );
};

export const getBoardResultHighlightEffectFrame = ({
  channel,
  progress,
}: {
  channel: BoardResultHighlightChannel;
  progress: number;
}) => {
  const clampedProgress = clamp(progress, 0, 1);
  const effect = RESULT_HIGHLIGHT_EFFECTS[channel];

  return {
    blur: effect.blur * clampedProgress,
    opacity: clampedProgress,
    spread: effect.spread * clampedProgress,
  };
};

const createStableTween = (now: number, value: 0 | 1): BoardScalarTween => ({
  durationMs: 0,
  from: value,
  startedAt: now,
  to: value,
});

export const getBoardResultHighlightTarget = (
  cell: GameCell,
  isGameLost: boolean,
): BoardResultHighlightChannel | null => {
  const model = getBoardCellRenderModel(cell, isGameLost);

  if (model.surfaceHighlight === 'red') {
    return 'surfaceRed';
  }

  if (model.overlayHighlight === 'red') {
    return 'overlayRed';
  }

  return model.overlayHighlight === 'green' ? 'overlayGreen' : null;
};

const getBoardResultHighlightTargets = (
  board: TBoard,
  isGameLost: boolean,
): Map<string, BoardResultHighlightChannel> => {
  const targets = new Map<string, BoardResultHighlightChannel>();

  board.forEach((row, rowIndex) => {
    row.forEach((cell, cellIndex) => {
      const target = getBoardResultHighlightTarget(cell, isGameLost);

      if (target) {
        targets.set(getBoardCellAnimationKey(rowIndex, cellIndex), target);
      }
    });
  });

  return targets;
};

export const createBoardResultHighlightTweens =
  (): BoardResultHighlightTweens => ({
    byChannel: {
      overlayGreen: new Map(),
      overlayRed: new Map(),
      surfaceRed: new Map(),
    },
    isInitialized: false,
    targets: new Map(),
  });

export const syncBoardResultHighlightTweens = ({
  board,
  isGameLost,
  now,
  tweens,
}: {
  board: TBoard;
  isGameLost: boolean;
  now: number;
  tweens: BoardResultHighlightTweens;
}) => {
  const nextTargets = getBoardResultHighlightTargets(board, isGameLost);

  if (!tweens.isInitialized) {
    nextTargets.forEach((channel, key) => {
      tweens.byChannel[channel].set(key, createStableTween(now, 1));
    });
    tweens.isInitialized = true;
    tweens.targets = nextTargets;

    return undefined;
  }

  const keys = new Set([...tweens.targets.keys(), ...nextTargets.keys()]);

  keys.forEach((key) => {
    const previousTarget = tweens.targets.get(key) ?? null;
    const nextTarget = nextTargets.get(key) ?? null;

    if (previousTarget === nextTarget) {
      return undefined;
    }

    RESULT_HIGHLIGHT_CHANNELS.forEach((channel) => {
      const channelTweens = tweens.byChannel[channel];
      const currentTween = channelTweens.get(key);
      const currentValue = currentTween
        ? sampleBoardScalarTween(currentTween, now).value
        : previousTarget === channel
          ? 1
          : 0;
      const nextValue = nextTarget === channel ? 1 : 0;
      const distance = Math.abs(nextValue - currentValue);

      if (distance <= BOARD_TWEEN_EPSILON) {
        if (nextValue === 0) {
          channelTweens.delete(key);
        } else {
          channelTweens.set(key, createStableTween(now, 1));
        }

        return undefined;
      }

      channelTweens.set(key, {
        durationMs: BOARD_RESULT_HIGHLIGHT_TWEEN_DURATION_MS * distance,
        from: currentValue,
        startedAt: now,
        to: nextValue,
      });
    });
  });

  tweens.targets = nextTargets;
};

export const sampleBoardResultHighlightTweens = (
  tweens: BoardResultHighlightTweens,
  now: number,
): BoardResultHighlightFrame => {
  const keys = new Set<string>();

  RESULT_HIGHLIGHT_CHANNELS.forEach((channel) => {
    tweens.byChannel[channel].forEach((_, key) => keys.add(key));
  });

  const byCell = new Map<string, BoardCellResultHighlightFrame>();
  let isActive = false;

  keys.forEach((key) => {
    const cellFrame: BoardCellResultHighlightFrame = {
      overlayGreen: 0,
      overlayRed: 0,
      surfaceRed: 0,
    };
    let hasVisibleChannel = false;

    RESULT_HIGHLIGHT_CHANNELS.forEach((channel) => {
      const channelTweens = tweens.byChannel[channel];
      const tween = channelTweens.get(key);

      if (!tween) {
        return undefined;
      }

      const frame = sampleBoardScalarTween(tween, now);

      cellFrame[channel] = frame.value;
      isActive = isActive || frame.isActive;
      hasVisibleChannel =
        hasVisibleChannel || frame.value > BOARD_TWEEN_EPSILON;

      if (!frame.isActive && tween.to === 0) {
        channelTweens.delete(key);
      }
    });

    if (hasVisibleChannel) {
      byCell.set(key, cellFrame);
    }
  });

  return {
    byCell,
    isActive,
  };
};
