import classNames from 'classnames/bind';
import { useGameStore } from '@/store/game';
import { startNewGame, restartGame, togglePause } from '@/store/game/actions';
import { selectGameStatus } from '@/store/game/selectors';
import { useSFXStore } from '@/store/sfx';
import { toggleMuteSFX } from '@/store/sfx/actions';
import Button from '@/components/ui/Button';
import Settings from '@/components/Settings';
import GameStatus from '../GameStatus';
import TimerDisplay from '../TimerDisplay';
import styles from './styles.module.scss';

const cx = classNames.bind(styles);

const GameHeader = () => {
  const isMuted = useSFXStore((state) => state.isMuted);
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
        >
          {gameStatus === 'paused' ? (
            <img src="/icons/play.svg" alt="Play" />
          ) : (
            <img src="/icons/pause.svg" alt="Pause" />
          )}
        </Button>
        <Button onClick={startNewGame} title="Start new game">
          <img src="/icons/bomb-inv.svg" />
        </Button>
        <Button
          onClick={restartGame}
          isDisabled={gameStatus === 'idle'}
          title="Restart"
        >
          <img src="/icons/restart.svg" alt="Restart current game" />
        </Button>
        <Button
          isIcon
          onClick={toggleMuteSFX}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          <img
            src={isMuted ? '/icons/sound-muted.svg' : '/icons/sound.svg'}
            alt={isMuted ? 'Unmute' : 'Mute'}
          />
        </Button>

        <Settings />
      </div>
      <div className={cx('headerLabel', 'timer')}>
        <TimerDisplay />
      </div>
    </header>
  );
};

export default GameHeader;
