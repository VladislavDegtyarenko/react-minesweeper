import styles from '../../styles.module.scss';
import { createCx } from '@/utils';

const cx = createCx(styles);

const Bomb = () => {
  return (
    <img
      src="/themes/blue-graphite/icons/Bomb.png"
      alt="mine"
      className={cx('image', 'cellImage')}
      draggable={false}
    />
  );
};

export default Bomb;
