import { memo } from 'react';
import classNames from 'classnames/bind';
import { useGameStore } from '@/store/game';
import { selectGameStatus, selectMinesLeft } from '@/store/game/selectors';
import styles from './styles.module.scss';

const cx = classNames.bind(styles);

const GameStatus = memo(() => {
  const gameStatus = useGameStore(selectGameStatus);
  const minesLeft = useGameStore(selectMinesLeft);

  if (gameStatus === 'won') {
    return <span className={cx('win')}>Win!</span>;
  }

  if (gameStatus === 'lost') {
    return <span className={cx('gameOver')}>Lost!</span>;
  }

  return (
    <>
      <img
        src="/icons/bomb.svg"
        className={cx('image', 'headerIcon')}
        alt="mines left"
      />
      {minesLeft}
    </>
  );
});

export default GameStatus;
