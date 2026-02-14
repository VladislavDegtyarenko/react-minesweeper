import { memo } from 'react';
import classNames from 'classnames/bind';
import { useGameStore } from '@/store/game';
import { selectGameStatus, selectMinesLeft } from '@/store/game/selectors';
import styles from './styles.module.scss';

import Win from '@/assets/themes/blue-graphite/icons/Win';
import { useIsMobileViewport } from '@/hooks';
import Loss from '@/assets/themes/blue-graphite/icons/Loss';

const cx = classNames.bind(styles);

const GameStatus = memo(() => {
  const gameStatus = useGameStore(selectGameStatus);
  const minesLeft = useGameStore(selectMinesLeft);
  const isMobileViewport = useIsMobileViewport();

  if (gameStatus === 'won') {
    return isMobileViewport ? (
      <span className={cx('win')}>
        <Win />
      </span>
    ) : (
      <span className={cx('statusPill', 'win')}>You Win</span>
    );
  }

  if (gameStatus === 'lost') {
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
