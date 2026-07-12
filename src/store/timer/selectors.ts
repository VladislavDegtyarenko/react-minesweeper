import { getTimeDiff } from '@/utils';
import type { TimerState } from './types';

const now = () => performance.now();

export const getElapsedMs = (
  state: TimerState,
  timestampMs: number = now(),
) => {
  if (state.status !== 'running' || state.startedAtMs == null) {
    return state.elapsedMs;
  }

  return state.elapsedMs + timestampMs - state.startedAtMs;
};

export const selectTimeDiff = (state: TimerState) =>
  getTimeDiff(getElapsedMs(state));
export const selectIsTimerRunning = (state: TimerState) =>
  state.status === 'running';
