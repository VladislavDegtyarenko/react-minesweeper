import Button from '@/components/ui/Button';
import { restartGame } from '@/store/game/actions';
import { selectIsGameIdle } from '@/store/game/selectors';

import styles from '../../styles.module.scss';
import { createCx } from '@/utils';
import { useGameStore } from '@/store/game';
const cx = createCx(styles);

const RestartButton = () => {
  const isGameIdle = useGameStore(selectIsGameIdle);

  return (
    <Button
      onClick={restartGame}
      isDisabled={isGameIdle}
      title="Restart"
      className={cx('controlButton')}
    >
      <img
        src="/themes/blue-graphite/icons/Restart.png"
        alt="Restart current game"
      />
    </Button>
  );
};

export default RestartButton;
