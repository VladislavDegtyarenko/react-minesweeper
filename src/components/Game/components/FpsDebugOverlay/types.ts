import type { PinchPerfDebugSnapshot } from '@/components/Game/debug/pinchPerf';
import type { BoardElementStats } from './utils';

export type FpsStats = {
  fps: number;
  frameMs: number;
  slowFrames: number;
  badFrames: number;
};

export type PinchRates = {
  appliedFramesPerSecond: number;
  pointerMovesPerSecond: number;
  scheduledFramesPerSecond: number;
};

export type DebugStats = FpsStats & {
  board: BoardElementStats;
  pinch: PinchPerfDebugSnapshot;
  rates: PinchRates;
};
