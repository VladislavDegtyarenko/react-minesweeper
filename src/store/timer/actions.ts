import { useTimerStore } from ".";

const now = () => performance.now();

const tick = (t: number) => {
  const { status, startedAtMs, elapsedMs } = useTimerStore.getState();
  if (status !== "running" || startedAtMs == null) return;

  // elapsed = accumulated + (current - startedAt)
  const nextElapsed = elapsedMs + (t - startedAtMs);

  // Important: move startedAt forward to current frame
  // so we accumulate deltas and avoid floating drift.
  useTimerStore.setState({
    elapsedMs: nextElapsed,
    startedAtMs: t,
    rafId: requestAnimationFrame(tick),
  });
};

const cancelRaf = () => {
  const id = useTimerStore.getState().rafId;
  if (id != null) cancelAnimationFrame(id);
  useTimerStore.setState({ rafId: null });
};

export const startTimer = () => {
  const { status } = useTimerStore.getState();
  if (status === "running") return;

  cancelRaf();
  const t = now();

  useTimerStore.setState({
    status: "running",
    startedAtMs: t,
    rafId: requestAnimationFrame(tick),
  });
};

export const pauseTimer = () => {
  const { status } = useTimerStore.getState();
  if (status !== "running") return;

  // elapsed is already updated on every tick,
  // so pausing is just canceling raf and status change.
  cancelRaf();
  useTimerStore.setState({ status: "paused", startedAtMs: null });
};

export const stopTimer = () => {
  const { status } = useTimerStore.getState();
  if (status !== "running" && status !== "paused") return;

  cancelRaf();
  useTimerStore.setState({ status: "stopped", startedAtMs: null });
};

export const resetTimer = () => {
  cancelRaf();
  useTimerStore.setState({
    status: "idle",
    elapsedMs: 0,
    startedAtMs: null,
    rafId: null,
  });
};
