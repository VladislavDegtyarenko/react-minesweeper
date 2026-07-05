import styles from '../../styles.module.scss';
import { createCx } from '@/utils';

const cx = createCx(styles);

type Props = {
  isGameLost?: boolean;
  isFlagged: boolean;
  isMine: boolean;
};

const Cross = ({ isGameLost = false, isFlagged, isMine }: Props) => {
  const isFlagNotCorrect = isGameLost && isFlagged && !isMine;

  if (isFlagNotCorrect) {
    return (
      <img
        src="/icons/cross.svg"
        alt="cross"
        className={cx('image', 'crossFlag')}
        draggable={false}
      />
    );
  }

  return null;
};

export default Cross;
