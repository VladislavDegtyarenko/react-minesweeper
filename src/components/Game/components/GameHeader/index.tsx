import classNames from 'classnames/bind';
import { useGameStore } from '@/store/game';
import { startNewGame, restartGame, togglePause } from '@/store/game/actions';
import { selectGameStatus } from '@/store/game/selectors';
import Button from '@/components/ui/Button';
import Settings from '@/components/Settings';
import GameStatus from '../GameStatus';
import TimerDisplay from '../TimerDisplay';
import {
  BombIcon,
  PauseIcon,
  PlayIcon,
  RestartIcon,
} from '@/assets/themes/classic/icons';
import styles from './styles.module.scss';

const cx = classNames.bind(styles);

const GameHeader = () => {
  const gameStatus = useGameStore(selectGameStatus);

  return (
    <header className={cx('header')}>
      <div className={cx('headerLabel', 'minesLeft')}>
        <GameStatus />
      </div>
      <div className={cx('headerButtons')}>
        <Button
          onClick={togglePause}
          isDisabled={
            gameStatus === 'idle' ||
            gameStatus === 'won' ||
            gameStatus === 'lost'
          }
          title={gameStatus === 'paused' ? 'Play' : 'Pause'}
          className={cx('controlButton')}
        >
          {gameStatus === 'paused' ? (
            <PlayIcon aria-hidden="true" />
          ) : (
            <PauseIcon aria-hidden="true" />
          )}
        </Button>
        <Button
          onClick={startNewGame}
          title="Start new game"
          className={cx('controlButton')}
        >
          <BombIcon aria-hidden="true" />
        </Button>
        <Button
          onClick={restartGame}
          isDisabled={gameStatus === 'idle'}
          title="Restart"
          className={cx('controlButton')}
        >
          <RestartIcon aria-hidden="true" />
        </Button>
      </div>
      <div className={cx('toolbarRight')}>
        <div className={cx('headerLabel', 'timer')}>
          <TimerDisplay />
        </div>
        <Settings />
      </div>
    </header>
  );
};

export default GameHeader;
