import { createCx } from '@/utils';
import styles from './styles.module.scss';

const cx = createCx(styles);

type Props = {
  isRetrying: boolean;
  message: string | null;
  onRetry: () => Promise<void>;
};

const ScoreSyncNotice = ({ isRetrying, message, onRetry }: Props) => {
  return (
    <section className={cx('notice')} role="status">
      <div>
        <p className={cx('title')}>Score not synced</p>
        <p className={cx('message')}>
          {isRetrying
            ? 'Retrying account sync...'
            : (message ?? 'Your score is saved locally for this dialog only.')}
        </p>
      </div>

      <button
        type="button"
        className={cx('retryButton')}
        disabled={isRetrying}
        onClick={() => void onRetry()}
      >
        {isRetrying ? 'Retrying' : 'Retry'}
      </button>
    </section>
  );
};

export default ScoreSyncNotice;
