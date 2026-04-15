import { createCx } from '@/utils';
import { startNewGame } from '@/store/game/actions';
import Button from '@/components/ui/Button';
import Settings from '@/components/Settings';
import GameStatus from '../GameStatus';
import TimerDisplay from '../TimerDisplay';
import styles from './styles.module.scss';
import TogglePauseButton from './components/TogglePauseButton';
import RestartButton from './components/RestartButton';

const cx = createCx(styles);

const GameHeader = () => {
  return (
    <header className={cx('header')}>
      <div className={cx('headerLabel', 'minesLeft')}>
        <GameStatus />
      </div>
      <div className={cx('headerButtons')}>
        <TogglePauseButton />
        <Button
          onClick={startNewGame}
          title="Start new game"
          className={cx('controlButton')}
        >
          <img src="/themes/blue-graphite/icons/Bomb.png" alt="New game" />
        </Button>
        <RestartButton />
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
