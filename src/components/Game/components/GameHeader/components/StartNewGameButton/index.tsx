import Button from '@/components/ui/Button';
import { createCx } from '@/utils';
import styles from '../../styles.module.scss';
import { startNewGame } from '@/store/game/actions';
const cx = createCx(styles);

const StartNewGameButton = () => {
  return (
    <Button
      onClick={startNewGame}
      title="Start new game"
      className={cx('controlButton')}
    >
      <img src="/themes/blue-graphite/icons/Bomb.png" alt="New game" />
    </Button>
  );
};

export default StartNewGameButton;
