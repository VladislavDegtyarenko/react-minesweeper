import { CELL_MARKERS } from '@/config';
import type { GameCell } from '@/types';
import {
  MARKER_ANIMATION_DISTANCE_PX,
  MARKER_ANIMATION_DURATION_MS,
} from './constants';
import type { BoardMarkerAnimation } from './types';
import type { BoardCellRenderModel } from './types';

export const getBoardCellRenderModel = (
  cell: GameCell,
  isGameLost: boolean,
): BoardCellRenderModel => {
  const isMine = cell.value === 'mine';
  const isFlagged = cell.marker === CELL_MARKERS.FLAG;
  const highlight = 'highlight' in cell ? cell.highlight : undefined;
  let content: BoardCellRenderModel['content'] = 'none';
  let number: number | null = null;

  if (cell.isOpened) {
    if (isMine) {
      content = 'bomb';
    } else if (typeof cell.value === 'number' && cell.value > 0) {
      content = 'number';
      number = cell.value;
    }
  } else if (isFlagged) {
    content = 'flag';
  } else if (cell.marker === CELL_MARKERS.QUESTION) {
    content = 'question';
  }

  return {
    content,
    isClosed: !cell.isOpened,
    marker: cell.marker,
    number,
    overlayHighlight: !cell.isOpened && isMine && highlight ? highlight : null,
    showWrongFlagCross: isGameLost && isFlagged && !isMine,
    // Preserve the current DOM renderer contract: opened green mines do not
    // receive the declared `.cellSurface.green` style.
    surfaceHighlight: cell.isOpened && highlight === 'red' ? 'red' : null,
  };
};

export const getMarkerAnimationFrame = ({
  animation,
  now,
  zoom,
}: {
  animation: BoardMarkerAnimation | undefined;
  now: number;
  zoom: number;
}) => {
  if (!animation) {
    return {
      isActive: false,
      opacity: 1,
      translateY: 0,
    };
  }

  const linearProgress = Math.min(
    1,
    Math.max(0, (now - animation.startedAt) / MARKER_ANIMATION_DURATION_MS),
  );
  const easedProgress = 1 - (1 - linearProgress) ** 3;

  return {
    isActive: linearProgress < 1,
    opacity: easedProgress,
    translateY:
      linearProgress < 1
        ? -MARKER_ANIMATION_DISTANCE_PX * zoom * (1 - easedProgress)
        : 0,
  };
};

export const pruneCompletedMarkerAnimations = ({
  animations,
  now,
}: {
  animations: Map<string, BoardMarkerAnimation>;
  now: number;
}): boolean => {
  let didPruneAnimation = false;

  animations.forEach((animation, key) => {
    if (
      !getMarkerAnimationFrame({
        animation,
        now,
        zoom: 1,
      }).isActive
    ) {
      animations.delete(key);
      didPruneAnimation = true;
    }
  });

  return didPruneAnimation;
};
