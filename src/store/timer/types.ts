type TimerStatus = "idle" | "running" | "paused" | "stopped";

export type TimerState = {
  status: TimerStatus;

  // Total elapsed time accumulated across runs (ms)
  elapsedMs: number;

  // Timestamp captured when "running" starts/resumes
  startedAtMs: number | null;

  // requestAnimationFrame id while running
  rafId: number | null;

  // Actions
  start: () => void;
  pause: () => void;
  stop: () => void; // stop = finalize elapsed, status -> stopped (keeps elapsed)
  reset: () => void; // reset = clear elapsed, status -> idle
};
