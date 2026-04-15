import { selectIsGameLost } from '@/store/game/selectors';
import styles from '../../styles.module.scss';
import { createCx } from '@/utils';
import { useGameStore } from '@/store/game';

const cx = createCx(styles);

type Props = {
  isFlagged: boolean;
  isMine: boolean;
};

const Cross = ({ isFlagged, isMine }: Props) => {
  const isLost = useGameStore(selectIsGameLost);
  const isFlagNotCorrect = isLost && isFlagged && !isMine;

  if (isFlagNotCorrect) {
    return (
      <img
        src="/icons/cross.svg"
        alt="cross"
        className={cx('image', 'crossFlag')}
      />
    );
  }

  return null;
};

export default Cross;
