import { useGameStore } from '@/store/game';
import { selectIsGameLost } from '@/store/game/selectors';
import { useStatsStore } from '@/store/stats';
import type { CSSProperties, PropsWithChildren } from 'react';
import { setIsWinDialogOpen } from '@/store/stats/actions';
import { createCx } from '@/utils';
import styles from './styles.module.scss';

const cx = createCx(styles);

type Props = PropsWithChildren<{
  cellSize: string;
  gameFooterHeight: number;
}>;

const BoardWrapper = ({ cellSize, children, gameFooterHeight }: Props) => {
  const isGameLost = useGameStore(selectIsGameLost);

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
      className={cx('boardArea', isGameLost ? 'no-pointer-events' : '')}
      onClick={handleBoardAreaClick}
      style={
        {
          '--cell-size': cellSize,
          '--game-footer-height': gameFooterHeight + 'px',
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
};

export default BoardWrapper;
