import { memo } from 'react';
import { createCx } from '@/utils';
import { useGameStore } from '@/store/game';
import {
  selectIsGameLost,
  selectIsGameWon,
  selectMinesLeft,
} from '@/store/game/selectors';
import styles from './styles.module.scss';

import Win from '@/assets/themes/blue-graphite/icons/Win';
import { useIsMobileViewport } from '@/hooks';
import Loss from '@/assets/themes/blue-graphite/icons/Loss';

const cx = createCx(styles);

const GameStatus = memo(() => {
  const isGameWon = useGameStore(selectIsGameWon);
  const isGameLost = useGameStore(selectIsGameLost);
  const minesLeft = useGameStore(selectMinesLeft);
  const isMobileViewport = useIsMobileViewport();

  if (isGameWon) {
    return isMobileViewport ? (
      <span className={cx('win')}>
        <Win />
      </span>
    ) : (
      <span className={cx('statusPill', 'win')}>You Win</span>
    );
  }

  if (isGameLost) {
    return isMobileViewport ? (
      <span className={cx('gameOver')}>
        <Loss />
      </span>
    ) : (
      <span className={cx('statusPill', 'gameOver')}>Game Over</span>
    );
  }

  return (
    <>
      <img
        src="/themes/blue-graphite/icons/Bomb.png"
        className={cx('image', 'headerIcon')}
        alt="mines left"
      />
      {minesLeft}
    </>
  );
});

export default GameStatus;
