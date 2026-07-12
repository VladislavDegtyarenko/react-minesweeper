export type PinchPerfPhase = 'idle' | 'pan' | 'pinch' | 'commit';

export type PinchPerfDebugSnapshot = {
  activePointers: number;
  appliedFrames: number;
  enabled: boolean;
  lastApplyMs: number;
  lastInputLagMs: number;
  lastSkipReason: string;
  maxApplyMs: number;
  maxInputLagMs: number;
  phase: PinchPerfPhase;
  pointerMoves: number;
  scale: number;
  scheduledFrames: number;
  scrollWrites: number;
  skippedFrames: number;
  startedAt: number;
  totalApplyMs: number;
  updatedAt: number;
  zoom: number;
};

const DEBUG_STATE_KEY = '__MINESWEEPER_PINCH_PERF_DEBUG__';

type WindowWithPinchPerfDebug = Window & {
  [DEBUG_STATE_KEY]?: PinchPerfDebugSnapshot;
};

const getNow = (): number => {
  return typeof performance === 'undefined' ? Date.now() : performance.now();
};

const createSnapshot = (enabled = false): PinchPerfDebugSnapshot => {
  const now = getNow();

  return {
    activePointers: 0,
    appliedFrames: 0,
    enabled,
    lastApplyMs: 0,
    lastInputLagMs: 0,
    lastSkipReason: '',
    maxApplyMs: 0,
    maxInputLagMs: 0,
    phase: 'idle',
    pointerMoves: 0,
    scale: 1,
    scheduledFrames: 0,
    scrollWrites: 0,
    skippedFrames: 0,
    startedAt: now,
    totalApplyMs: 0,
    updatedAt: now,
    zoom: 0,
  };
};

const getDebugWindow = (): WindowWithPinchPerfDebug | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  return window as WindowWithPinchPerfDebug;
};

const getSnapshot = (shouldCreate: boolean): PinchPerfDebugSnapshot | null => {
  const debugWindow = getDebugWindow();

  if (!debugWindow) {
    return null;
  }

  if (!debugWindow[DEBUG_STATE_KEY] && shouldCreate) {
    debugWindow[DEBUG_STATE_KEY] = createSnapshot();
  }

  return debugWindow[DEBUG_STATE_KEY] ?? null;
};

const updateSnapshot = (
  update: (snapshot: PinchPerfDebugSnapshot, now: number) => void,
): void => {
  const snapshot = getSnapshot(false);

  if (!snapshot?.enabled) {
    return undefined;
  }

  const now = getNow();

  update(snapshot, now);
  snapshot.updatedAt = now;
};

export const setPinchPerfDebugEnabled = (enabled: boolean): void => {
  const debugWindow = getDebugWindow();

  if (!debugWindow) {
    return undefined;
  }

  debugWindow[DEBUG_STATE_KEY] = createSnapshot(enabled);
};

export const getIsPinchPerfDebugEnabled = (): boolean => {
  return getSnapshot(false)?.enabled ?? false;
};

export const readPinchPerfDebugSnapshot = (): PinchPerfDebugSnapshot => {
  const snapshot = getSnapshot(false);

  return { ...(snapshot ?? createSnapshot()) };
};

export const recordPinchPerfPhase = (
  phase: PinchPerfPhase,
  activePointers: number,
): void => {
  updateSnapshot((snapshot) => {
    snapshot.activePointers = activePointers;
    snapshot.phase = phase;
  });
};

export const recordPinchPerfPointerMove = (
  activePointers: number,
  inputLagMs: number,
): void => {
  updateSnapshot((snapshot) => {
    snapshot.activePointers = activePointers;
    snapshot.lastInputLagMs = inputLagMs;
    snapshot.maxInputLagMs = Math.max(snapshot.maxInputLagMs, inputLagMs);
    snapshot.pointerMoves += 1;
  });
};

export const recordPinchPerfFrameScheduled = (): void => {
  updateSnapshot((snapshot) => {
    snapshot.scheduledFrames += 1;
  });
};

export const recordPinchPerfFrameSkipped = (reason: string): void => {
  updateSnapshot((snapshot) => {
    snapshot.lastSkipReason = reason;
    snapshot.skippedFrames += 1;
  });
};

export const recordPinchPerfFrameApplied = ({
  applyMs,
  scale,
  scrollWrites,
  zoom,
}: {
  applyMs: number;
  scale: number;
  scrollWrites: number;
  zoom: number;
}): void => {
  updateSnapshot((snapshot) => {
    snapshot.appliedFrames += 1;
    snapshot.lastApplyMs = applyMs;
    snapshot.maxApplyMs = Math.max(snapshot.maxApplyMs, applyMs);
    snapshot.phase = 'pinch';
    snapshot.scale = scale;
    snapshot.scrollWrites += scrollWrites;
    snapshot.totalApplyMs += applyMs;
    snapshot.zoom = zoom;
  });
};
