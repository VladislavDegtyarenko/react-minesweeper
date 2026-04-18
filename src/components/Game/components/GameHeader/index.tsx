import { createCx } from '@/utils';
import Button from '@/components/ui/Button';
import Settings from '@/components/Settings';
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
      <div className={cx('headerLabel', 'minesLeft')}>
        <GameStatus />
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
