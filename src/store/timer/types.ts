type TimerStatus = 'idle' | 'running' | 'paused' | 'stopped';

export type TimerState = {
  status: TimerStatus;

  // Total elapsed time accumulated across runs (ms)
  elapsedMs: number;

  // Timestamp captured when running starts/resumes.
  startedAtMs: number | null;
};
