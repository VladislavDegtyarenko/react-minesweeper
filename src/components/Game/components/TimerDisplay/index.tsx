import { memo, useEffect, useRef } from 'react';
import { getCurrentElapsedMs } from '@/store/timer/actions';
import { useTimerStore } from '@/store/timer';
import { GAME_FEATURES } from '@/config';
import {
  isBoardInteractionActive,
  subscribeBoardInteraction,
} from '@/components/Game/utils/boardInteraction';
import { createCx, getTimeDiff } from '@/utils';
import styles from './styles.module.scss';

const cx = createCx(styles);
const TIMER_LABEL_SETTLE_MS = 16;

const getTimerLabel = () => getTimeDiff(getCurrentElapsedMs());

const getNextTimerLabelDelay = () => {
  const elapsedMs = getCurrentElapsedMs();
  const msUntilNextSecond = 1000 - (elapsedMs % 1000);

  return Math.max(50, msUntilNextSecond + TIMER_LABEL_SETTLE_MS);
};

const TimerDisplay = () => {
  const timerValueRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let timeoutId: number | null = null;
    let isInteractionActive =
      GAME_FEATURES.isTimerDisplayPausedDuringBoardInteractionEnabled &&
      isBoardInteractionActive();
    let unsubscribeBoardInteraction: (() => void) | null = null;

    const clearTimerTimeout = () => {
      if (timeoutId === null) {
        return;
      }

      window.clearTimeout(timeoutId);
      timeoutId = null;
    };

    const writeTimerLabel = () => {
      const timerValueElement = timerValueRef.current;

      if (!timerValueElement) {
        return;
      }

      const nextTimerLabel = getTimerLabel();

      if (timerValueElement.textContent === nextTimerLabel) {
        return;
      }

      timerValueElement.textContent = nextTimerLabel;
    };

    const updateTimerLabel = () => {
      clearTimerTimeout();

      if (!isInteractionActive) {
        writeTimerLabel();
      }

      if (
        isInteractionActive ||
        useTimerStore.getState().status !== 'running'
      ) {
        return;
      }

      timeoutId = window.setTimeout(updateTimerLabel, getNextTimerLabelDelay());
    };

    const handleBoardInteractionChange = (nextIsInteractionActive: boolean) => {
      isInteractionActive =
        GAME_FEATURES.isTimerDisplayPausedDuringBoardInteractionEnabled &&
        nextIsInteractionActive;
      updateTimerLabel();
    };

    if (GAME_FEATURES.isTimerDisplayPausedDuringBoardInteractionEnabled) {
      unsubscribeBoardInteraction = subscribeBoardInteraction(
        handleBoardInteractionChange,
      );
    }

    const unsubscribe = useTimerStore.subscribe(updateTimerLabel);

    updateTimerLabel();

    return () => {
      clearTimerTimeout();
      unsubscribeBoardInteraction?.();
      unsubscribe();
    };
  }, []);

  return (
    <>
      <img src="/icons/timer.svg" className={cx('headerIcon')} alt="timer" />
      <span ref={timerValueRef} className={cx('timerValue')}>
        {getTimerLabel()}
      </span>
    </>
  );
};

export default memo(TimerDisplay);
