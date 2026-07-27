import type { PinchPerfDebugSnapshot } from '@/components/Game/debug/types';

export type BoardElementStats = {
  boardClient: string;
  boardScroll: string;
  canvasBitmap: string;
  canvasDpr: string;
  cellCount: number;
  contentBox: string;
  contentInline: string;
  scroll: string;
  surfaceBox: string;
  surfaceTransform: string;
  viewport: string;
};

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
