import { useEffect, useRef, useState } from 'react';
import { createCx } from '@/utils';
import type { GameDebugMode } from '@/components/Game/utils/route';
import {
  readPinchPerfDebugSnapshot,
  setPinchPerfDebugEnabled,
  type PinchPerfDebugSnapshot,
} from '@/components/Game/debug/pinchPerf';
import { EMPTY_BOARD_ELEMENT_STATS, readBoardElementStats } from './utils';
import PerfDebugDetails from './components/PerfDebugDetails';
import type { DebugStats, PinchRates } from './types';
import styles from './styles.module.scss';

const cx = createCx(styles);

const SAMPLE_WINDOW_MS = 500;
const SLOW_FRAME_MS = 20;
const BAD_FRAME_MS = 33;

type Props = {
  mode: GameDebugMode;
};

const INITIAL_RATES: PinchRates = {
  appliedFramesPerSecond: 0,
  pointerMovesPerSecond: 0,
  scheduledFramesPerSecond: 0,
};

const INITIAL_STATS: DebugStats = {
  badFrames: 0,
  board: EMPTY_BOARD_ELEMENT_STATS,
  fps: 0,
  frameMs: 0,
  pinch: readPinchPerfDebugSnapshot(),
  rates: INITIAL_RATES,
  slowFrames: 0,
};

const getPinchRates = (
  previous: PinchPerfDebugSnapshot | null,
  current: PinchPerfDebugSnapshot,
  sampleDuration: number,
): PinchRates => {
  if (!previous || sampleDuration <= 0) {
    return INITIAL_RATES;
  }

  const sampleSeconds = sampleDuration / 1000;

  return {
    appliedFramesPerSecond:
      (current.appliedFrames - previous.appliedFrames) / sampleSeconds,
    pointerMovesPerSecond:
      (current.pointerMoves - previous.pointerMoves) / sampleSeconds,
    scheduledFramesPerSecond:
      (current.scheduledFrames - previous.scheduledFrames) / sampleSeconds,
  };
};

const getAverageApplyMs = (pinch: PinchPerfDebugSnapshot): number => {
  if (pinch.appliedFrames === 0) {
    return 0;
  }

  return pinch.totalApplyMs / pinch.appliedFrames;
};

const FpsDebugOverlay = ({ mode }: Props) => {
  const [stats, setStats] = useState<DebugStats>(INITIAL_STATS);
  const animationFrameIdRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number | null>(null);
  const lastPinchSnapshotRef = useRef<PinchPerfDebugSnapshot | null>(null);
  const sampleStartTimeRef = useRef<number | null>(null);
  const frameCountRef = useRef(0);
  const frameTotalMsRef = useRef(0);
  const slowFramesRef = useRef(0);
  const badFramesRef = useRef(0);
  const isPerfMode = mode === 'perf';

  useEffect(() => {
    setPinchPerfDebugEnabled(isPerfMode);

    return () => {
      setPinchPerfDebugEnabled(false);
    };
  }, [isPerfMode]);

  useEffect(() => {
    const resetSample = (timestamp: number) => {
      sampleStartTimeRef.current = timestamp;
      frameCountRef.current = 0;
      frameTotalMsRef.current = 0;
      slowFramesRef.current = 0;
      badFramesRef.current = 0;
    };

    const measureFrame = (timestamp: number) => {
      const lastFrameTime = lastFrameTimeRef.current;

      if (sampleStartTimeRef.current === null) {
        resetSample(timestamp);
      }

      if (lastFrameTime !== null) {
        const frameMs = timestamp - lastFrameTime;
        frameCountRef.current += 1;
        frameTotalMsRef.current += frameMs;

        if (frameMs > SLOW_FRAME_MS) {
          slowFramesRef.current += 1;
        }

        if (frameMs > BAD_FRAME_MS) {
          badFramesRef.current += 1;
        }
      }

      lastFrameTimeRef.current = timestamp;

      const sampleStartTime = sampleStartTimeRef.current ?? timestamp;
      const sampleDuration = timestamp - sampleStartTime;

      if (sampleDuration >= SAMPLE_WINDOW_MS && frameCountRef.current > 0) {
        const pinch = readPinchPerfDebugSnapshot();

        setStats({
          badFrames: badFramesRef.current,
          board: isPerfMode
            ? readBoardElementStats()
            : EMPTY_BOARD_ELEMENT_STATS,
          fps: Math.round((frameCountRef.current * 1000) / sampleDuration),
          frameMs: frameTotalMsRef.current / frameCountRef.current,
          pinch,
          rates: isPerfMode
            ? getPinchRates(lastPinchSnapshotRef.current, pinch, sampleDuration)
            : INITIAL_RATES,
          slowFrames: slowFramesRef.current,
        });
        lastPinchSnapshotRef.current = pinch;
        resetSample(timestamp);
      }

      animationFrameIdRef.current = window.requestAnimationFrame(measureFrame);
    };

    animationFrameIdRef.current = window.requestAnimationFrame(measureFrame);

    return () => {
      if (animationFrameIdRef.current !== null) {
        window.cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [isPerfMode]);

  const averageApplyMs = getAverageApplyMs(stats.pinch);

  return (
    <output
      className={cx('overlay', isPerfMode && 'perf')}
      aria-label="FPS debug overlay"
    >
      <span className={cx('summary')}>
        <span className={cx('fps')}>{stats.fps} FPS</span>
        <span>{stats.frameMs.toFixed(1)}ms</span>
        <span>
          slow {stats.slowFrames} / bad {stats.badFrames}
        </span>
      </span>

      {isPerfMode ? (
        <PerfDebugDetails
          averageApplyMs={averageApplyMs}
          board={stats.board}
          pinch={stats.pinch}
          rates={stats.rates}
        />
      ) : null}
    </output>
  );
};

export default FpsDebugOverlay;
