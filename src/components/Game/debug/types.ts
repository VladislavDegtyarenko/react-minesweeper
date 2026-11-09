export type PinchPerfPhase = 'idle' | 'pan' | 'pinch' | 'commit';

export type PinchPerfDebugSnapshot = {
  activePointers: number;
  appliedFrames: number;
  canvasDirtyDraws: number;
  canvasDraws: number;
  canvasFullDraws: number;
  enabled: boolean;
  lastCanvasDrawnCells: number;
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
