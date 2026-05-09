import { HINT_RAMP_PX, SCROLL_EDGE_TOLERANCE_PX } from './constants';
import type { BoardScrollHints } from './types';

const STRENGTH_EPSILON = 0.01;

const getEdgeStrength = (distanceToEdge: number) => {
  if (distanceToEdge <= SCROLL_EDGE_TOLERANCE_PX) {
    return 0;
  }

  return Math.min(
    (distanceToEdge - SCROLL_EDGE_TOLERANCE_PX) / HINT_RAMP_PX,
    1,
  );
};

export const getBoardScrollHints = (element: HTMLElement): BoardScrollHints => {
  const {
    clientHeight,
    clientWidth,
    scrollHeight,
    scrollLeft,
    scrollTop,
    scrollWidth,
  } = element;
  const overflowX = scrollWidth - clientWidth;
  const overflowY = scrollHeight - clientHeight;
  const canScrollHorizontally = overflowX > SCROLL_EDGE_TOLERANCE_PX;
  const canScrollVertically = overflowY > SCROLL_EDGE_TOLERANCE_PX;

  return {
    bottom: canScrollVertically ? getEdgeStrength(overflowY - scrollTop) : 0,
    left: canScrollHorizontally ? getEdgeStrength(scrollLeft) : 0,
    right: canScrollHorizontally ? getEdgeStrength(overflowX - scrollLeft) : 0,
    top: canScrollVertically ? getEdgeStrength(scrollTop) : 0,
  };
};

export const areBoardScrollHintsEqual = (
  firstHints: BoardScrollHints,
  secondHints: BoardScrollHints,
) =>
  Math.abs(firstHints.bottom - secondHints.bottom) < STRENGTH_EPSILON &&
  Math.abs(firstHints.left - secondHints.left) < STRENGTH_EPSILON &&
  Math.abs(firstHints.right - secondHints.right) < STRENGTH_EPSILON &&
  Math.abs(firstHints.top - secondHints.top) < STRENGTH_EPSILON;
