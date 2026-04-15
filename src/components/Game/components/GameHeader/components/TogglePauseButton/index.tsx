import Button from '@/components/ui/Button';
import { useGameStore } from '@/store/game';
import { togglePause } from '@/store/game/actions';
import { selectGameStatus } from '@/store/game/selectors';
import { createCx } from '@/utils';
import styles from '../../styles.module.scss';

const cx = createCx(styles);

const TogglePauseButton = () => {
  const gameStatus = useGameStore(selectGameStatus);

  return (
    <Button
      onClick={togglePause}
      isDisabled={
        gameStatus === 'idle' || gameStatus === 'won' || gameStatus === 'lost'
      }
      title={gameStatus === 'paused' ? 'Play' : 'Pause'}
      className={cx('controlButton')}
    >
      {gameStatus === 'paused' ? (
        <img src="/themes/blue-graphite/icons/Play.svg" alt="Play" />
      ) : (
        <img src="/themes/blue-graphite/icons/Pause.png" alt="Pause" />
      )}
    </Button>
  );
};

export default TogglePauseButton;
