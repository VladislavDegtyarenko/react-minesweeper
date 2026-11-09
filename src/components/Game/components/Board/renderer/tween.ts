import { clamp } from '@/utils';
import { BOARD_TWEEN_EPSILON } from './constants';
import type { BoardScalarTween } from './types';

const sampleCurve = (first: number, second: number, time: number) =>
  ((1 - 3 * second + 3 * first) * time + (3 * second - 6 * first)) *
    time *
    time +
  3 * first * time;

const sampleCurveDerivative = (first: number, second: number, time: number) =>
  (3 * (1 - 3 * second + 3 * first) * time + 2 * (3 * second - 6 * first)) *
    time +
  3 * first;

// CSS `ease`: cubic-bezier(0.25, 0.1, 0.25, 1).
export const getBoardInteractionEase = (progress: number): number => {
  const clampedProgress = clamp(progress, 0, 1);

  if (clampedProgress === 0 || clampedProgress === 1) {
    return clampedProgress;
  }

  let curveTime = clampedProgress;

  for (let iteration = 0; iteration < 5; iteration += 1) {
    const error = sampleCurve(0.25, 0.25, curveTime) - clampedProgress;
    const derivative = sampleCurveDerivative(0.25, 0.25, curveTime);

    if (Math.abs(derivative) < BOARD_TWEEN_EPSILON) {
      break;
    }

    curveTime = clamp(curveTime - error / derivative, 0, 1);
  }

  return sampleCurve(0.1, 1, curveTime);
};

export const sampleBoardScalarTween = (
  tween: BoardScalarTween,
  now: number,
): { isActive: boolean; value: number } => {
  if (tween.durationMs <= 0 || tween.from === tween.to) {
    return {
      isActive: false,
      value: tween.to,
    };
  }

  const linearProgress = clamp(
    (now - tween.startedAt) / tween.durationMs,
    0,
    1,
  );
  const easedProgress = getBoardInteractionEase(linearProgress);

  return {
    isActive: linearProgress < 1,
    value: tween.from + (tween.to - tween.from) * easedProgress,
  };
};
