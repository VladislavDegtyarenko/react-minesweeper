import { useGameStore } from '@/store/game';
import { useStatsStore } from '@/store/stats';
import type { CSSProperties, PropsWithChildren } from 'react';
import { setIsWinDialogOpen } from '@/store/stats/actions';
import { createCx } from '@/utils';
import { getCellGapVars } from './utils';
import styles from './styles.module.scss';

const cx = createCx(styles);

type Props = PropsWithChildren<{
  cellSize: string;
  dailyCardHeight: number;
  gameFooterHeight: number;
  zoom: number;
}>;

const BoardWrapper = ({
  cellSize,
  children,
  dailyCardHeight,
  gameFooterHeight,
  zoom,
}: Props) => {
  const handleBoardAreaClick = () => {
    const { gameStatus } = useGameStore.getState();
    const { hasPresentedWinDialog, isWinDialogOpen } = useStatsStore.getState();

    if (gameStatus !== 'won' || !hasPresentedWinDialog || isWinDialogOpen) {
      return undefined;
    }

    setIsWinDialogOpen(true);
  };

  return (
    <div
      className={cx('boardArea')}
      onClick={handleBoardAreaClick}
      style={
        {
          '--cell-size': cellSize,
          '--daily-card-height': dailyCardHeight + 'px',
          '--game-footer-height': gameFooterHeight + 'px',
          ...getCellGapVars(zoom),
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
};

export default BoardWrapper;
