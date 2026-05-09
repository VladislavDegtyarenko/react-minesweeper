import type { BoardScrollHints, ScrollHintDirection } from './types';

export const DEFAULT_BOARD_SCROLL_HINTS: BoardScrollHints = {
  bottom: 0,
  left: 0,
  right: 0,
  top: 0,
};

export const SCROLL_HINT_DIRECTIONS: ReadonlyArray<ScrollHintDirection> = [
  'top',
  'right',
  'bottom',
  'left',
];

export const SCROLL_EDGE_TOLERANCE_PX = 1;

/**
 * Distance (in px) of remaining scrollable content over which a hint ramps
 * from invisible to fully opaque. Larger values feel softer/slower; smaller
 * values feel snappier.
 */
export const HINT_RAMP_PX = 48;
