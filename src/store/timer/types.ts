export type TimerStatus = 'idle' | 'running' | 'paused' | 'stopped';

export type TimerState = {
  status: TimerStatus;
  elapsedMs: number;
  startedAtMs: number | null;
  rafId: number | null;
};
