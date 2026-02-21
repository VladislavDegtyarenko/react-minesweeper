import { memo } from 'react';
import classNames from 'classnames/bind';
import { useGameStore } from '@/store/game';
import { selectGameStatus, selectMinesLeft } from '@/store/game/selectors';
import styles from './styles.module.scss';
import { useIsMobileViewport } from '@/hooks';
import { BombIcon, LossIcon, WinIcon } from '@/assets/themes/classic/icons';

const cx = classNames.bind(styles);

const GameStatus = memo(() => {
  const gameStatus = useGameStore(selectGameStatus);
  const minesLeft = useGameStore(selectMinesLeft);
  const isMobileViewport = useIsMobileViewport();

  if (gameStatus === 'won') {
    return isMobileViewport ? (
      <span className={cx('win')}>
        <WinIcon />
      </span>
    ) : (
      <span className={cx('statusPill', 'win')}>You Win</span>
    );
  }

  if (gameStatus === 'lost') {
    return isMobileViewport ? (
      <span className={cx('gameOver')}>
        <LossIcon />
      </span>
    ) : (
      <span className={cx('statusPill', 'gameOver')}>Game Over</span>
    );
  }

  return (
    <>
      <BombIcon className={cx('image', 'headerIcon')} aria-hidden="true" />
      {minesLeft}
    </>
  );
});

export default GameStatus;
