import { createCx } from '@/utils';
import Settings from '@/components/Settings';
import DailyBadge from '../DailyBadge';
import GameStatus from '../GameStatus';
import TimerDisplay from '../TimerDisplay';
import styles from './styles.module.scss';
import TogglePauseButton from './components/TogglePauseButton';
import RestartButton from './components/RestartButton';
import StartNewGameButton from './components/StartNewGameButton';

const cx = createCx(styles);

const GameHeader = () => {
  return (
    <header className={cx('header')}>
      <div className={cx('headerLabel', 'minesLeft')} data-tour-id="win-status">
        <GameStatus />
        <DailyBadge />
      </div>
      <div className={cx('headerButtons')}>
        <TogglePauseButton />
        <StartNewGameButton />
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
