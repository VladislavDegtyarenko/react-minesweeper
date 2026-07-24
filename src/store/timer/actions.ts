import { useTimerStore } from '.';
import { getElapsedMs } from './selectors';
import type { TimerState } from './types';

const now = () => performance.now();

export const getCurrentElapsedMs = (timestampMs: number = now()) => {
  return getElapsedMs(useTimerStore.getState(), timestampMs);
};

export const startTimer = () => {
  const { status } = useTimerStore.getState();
  if (status === 'running') return;

  useTimerStore.setState({
    status: 'running',
    startedAtMs: now(),
  });
};

export const pauseTimer = () => {
  const { status } = useTimerStore.getState();
  if (status !== 'running') return;

  useTimerStore.setState({
    status: 'paused',
    elapsedMs: getCurrentElapsedMs(),
    startedAtMs: null,
  });
};

export const stopTimer = () => {
  const { status } = useTimerStore.getState();
  if (status !== 'running' && status !== 'paused') return;

  useTimerStore.setState({
    status: 'stopped',
    elapsedMs: getCurrentElapsedMs(),
    startedAtMs: null,
  });
};

export const resetTimer = () => {
  useTimerStore.setState({
    status: 'idle',
    elapsedMs: 0,
    startedAtMs: null,
  });
};

export const restoreTimerElapsed = (
  elapsedMs: number,
  status: Extract<TimerState['status'], 'idle' | 'paused'> = 'idle',
) => {
  useTimerStore.setState({
    status,
    elapsedMs,
    startedAtMs: null,
  });
};
