import type { PinchPerfDebugSnapshot } from '@/components/Game/debug/pinchPerf';
import { createCx } from '@/utils';
import type { BoardElementStats } from '../../utils';
import type { PinchRates } from '../../types';
import styles from '../../styles.module.scss';

const cx = createCx(styles);

type Props = {
  averageApplyMs: number;
  board: BoardElementStats;
  pinch: PinchPerfDebugSnapshot;
  rates: PinchRates;
};

const formatMetric = (value: number, digits = 1): string => {
  return Number.isFinite(value) ? value.toFixed(digits) : '0.0';
};

const PerfDebugDetails = ({ averageApplyMs, board, pinch, rates }: Props) => (
  <>
    <span className={cx('row')}>
      <span>pinch {pinch.phase}</span>
      <span>p {pinch.activePointers}</span>
      <span>scale {formatMetric(pinch.scale, 2)}</span>
      <span>zoom {formatMetric(pinch.zoom, 2)}</span>
    </span>
    <span className={cx('row')}>
      <span>move {formatMetric(rates.pointerMovesPerSecond)}/s</span>
      <span>raf {formatMetric(rates.appliedFramesPerSecond)}/s</span>
      <span>sched {formatMetric(rates.scheduledFramesPerSecond)}/s</span>
    </span>
    <span className={cx('row')}>
      <span>apply {formatMetric(pinch.lastApplyMs)}ms</span>
      <span>avg {formatMetric(averageApplyMs)}ms</span>
      <span>max {formatMetric(pinch.maxApplyMs)}ms</span>
    </span>
    <span className={cx('row')}>
      <span>lag {formatMetric(pinch.lastInputLagMs)}ms</span>
      <span>maxLag {formatMetric(pinch.maxInputLagMs)}ms</span>
      <span>skip {pinch.skippedFrames}</span>
      {pinch.lastSkipReason ? <span>{pinch.lastSkipReason}</span> : null}
    </span>
    <span className={cx('row')}>
      <span>board {board.boardClient}</span>
      <span>scroll {board.boardScroll}</span>
      <span>pos {board.scroll}</span>
    </span>
    <span className={cx('row')}>
      <span>content {board.contentBox}</span>
      <span>inline {board.contentInline}</span>
    </span>
    <span className={cx('row')}>
      <span>surface {board.surfaceBox}</span>
      <span>t {board.surfaceTransform}</span>
    </span>
    <span className={cx('row')}>
      <span>vv {board.viewport}</span>
      <span>cells {board.cellCount}</span>
      <span>writes {pinch.scrollWrites}</span>
    </span>
  </>
);

export default PerfDebugDetails;
