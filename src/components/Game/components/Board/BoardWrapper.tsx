import { useGameStore } from '@/store/game';
import { selectIsGameLost } from '@/store/game/selectors';
import { useStatsStore } from '@/store/stats';
import { CSSProperties, PropsWithChildren, useState } from 'react';
import { setIsWinDialogOpen } from '@/store/stats/actions';
import { createCx } from '@/utils';
import styles from './styles.module.scss';

const cx = createCx(styles);

type Props = PropsWithChildren<{
  gameFooterHeight: number;
}>;

const BoardWrapper = ({ gameFooterHeight, children }: Props) => {
  const isGameLost = useGameStore(selectIsGameLost);

  const handleBoardAreaClick = () => {
    const { gameStatus } = useGameStore.getState();
    const { hasPresentedWinDialog, isWinDialogOpen } = useStatsStore.getState();

    if (gameStatus !== 'won' || !hasPresentedWinDialog || isWinDialogOpen) {
      return undefined;
    }

    // Open the win dialog
    setIsWinDialogOpen(true);
  };

  return (
    <div
      className={cx('boardArea', isGameLost ? 'no-pointer-events' : '')}
      onClick={handleBoardAreaClick}
      style={
        {
          '--game-footer-height': gameFooterHeight + 'px',
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
};

export default BoardWrapper;
