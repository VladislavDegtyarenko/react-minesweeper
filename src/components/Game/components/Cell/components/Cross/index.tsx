import styles from '../../styles.module.scss';
import { createCx } from '@/utils';

const cx = createCx(styles);

type Props = {
  showIncorrectFlag: boolean;
};

const Cross = ({ showIncorrectFlag }: Props) => {
  if (showIncorrectFlag) {
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
