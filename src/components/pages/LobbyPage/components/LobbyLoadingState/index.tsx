import { createCx } from '@/utils';
import styles from './styles.module.scss';

const cx = createCx(styles);

const LobbyLoadingState = () => {
  return (
    <section
      aria-busy="true"
      aria-label="Loading game lobby"
      className={cx('loading')}
    >
      Loading...
    </section>
  );
};

export default LobbyLoadingState;
