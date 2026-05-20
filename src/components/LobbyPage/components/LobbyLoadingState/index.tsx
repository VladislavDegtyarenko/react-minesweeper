import { createCx } from '@/utils';
import SetupCard from '../SetupCard';
import styles from './styles.module.scss';

const cx = createCx(styles);

const LOADING_CELLS = Array.from({ length: 36 }, (_, index) => index);
const LOADING_STATS = ['Elapsed', 'Mines left'] as const;

const LobbyLoadingState = () => {
  return (
    <section
      aria-busy="true"
      aria-label="Loading game lobby"
      className={cx('flow')}
    >
      <SetupCard
        ariaLabel="Loading game slot"
        className={cx('card')}
        description="Checking this device"
        descriptionPlacement="beforeMedia"
        eyebrow="Loading"
        isSelected={false}
        media={
          <span className={cx('preview')} aria-hidden="true">
            {LOADING_CELLS.map((cell) => (
              <span className={cx('cell')} key={cell} />
            ))}
            <span className={cx('pill')}>Loading</span>
          </span>
        }
        showSelectionMark={false}
        title="Game slot"
      >
        <div className={cx('stats')} aria-hidden="true">
          {LOADING_STATS.map((stat) => (
            <span className={cx('stat')} key={stat}>
              <span className={cx('statLabel')}>{stat}</span>
              <span className={cx('statValue')} />
            </span>
          ))}
        </div>

        <span className={cx('action')} aria-hidden="true" />
      </SetupCard>
    </section>
  );
};

export default LobbyLoadingState;
