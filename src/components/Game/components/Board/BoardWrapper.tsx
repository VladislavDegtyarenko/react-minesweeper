import { useGameStore } from '@/store/game';
import { useStatsStore } from '@/store/stats';
import {
  useRef,
  type CSSProperties,
  type PointerEvent,
  type PropsWithChildren,
} from 'react';
import { setIsWinDialogOpen } from '@/store/stats/actions';
import { createCx } from '@/utils';
import styles from './styles.module.scss';

const cx = createCx(styles);

// A press that travels further than this is a board pan, not a tap.
const TAP_MOVE_TOLERANCE_PX = 6;

type PointerOrigin = {
  clientX: number;
  clientY: number;
  pointerId: number;
};

type Props = PropsWithChildren<{
  dailyCardHeight: number;
  gameFooterHeight: number;
}>;

const BoardWrapper = ({
  children,
  dailyCardHeight,
  gameFooterHeight,
}: Props) => {
  // The board frame cancels native touch defaults to suppress the iOS
  // selection magnifier, which also drops the synthesized click. Reopening the
  // win dialog therefore listens on pointer events instead.
  const pointerOriginRef = useRef<PointerOrigin | null>(null);

  const handleBoardAreaPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    pointerOriginRef.current = {
      clientX: event.clientX,
      clientY: event.clientY,
      pointerId: event.pointerId,
    };
  };

  const handleBoardAreaPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const pointerOrigin = pointerOriginRef.current;
    pointerOriginRef.current = null;

    if (!pointerOrigin || pointerOrigin.pointerId !== event.pointerId) {
      return undefined;
    }

    const moveDistance = Math.hypot(
      event.clientX - pointerOrigin.clientX,
      event.clientY - pointerOrigin.clientY,
    );

    if (moveDistance > TAP_MOVE_TOLERANCE_PX) {
      return undefined;
    }

    const { gameStatus } = useGameStore.getState();
    const { hasPresentedWinDialog, isWinDialogOpen } = useStatsStore.getState();

    if (gameStatus !== 'won' || !hasPresentedWinDialog || isWinDialogOpen) {
      return undefined;
    }

    setIsWinDialogOpen(true);
  };

  const handleBoardAreaPointerCancel = () => {
    pointerOriginRef.current = null;
  };

  return (
    <div
      className={cx('boardArea')}
      onPointerCancel={handleBoardAreaPointerCancel}
      onPointerDown={handleBoardAreaPointerDown}
      onPointerUp={handleBoardAreaPointerUp}
      style={
        {
          '--daily-card-height': dailyCardHeight + 'px',
          '--game-footer-height': gameFooterHeight + 'px',
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
};

export default BoardWrapper;
