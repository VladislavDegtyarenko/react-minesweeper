import { createCx } from '@/utils';
import styles from './styles.module.scss';

const cx = createCx(styles);

type Props = {
  isRetrying: boolean;
  message: string | null;
  onRetry: () => Promise<void>;
  retryingButtonLabel?: string;
  retryingMessage?: string;
  title?: string;
};

const ScoreSyncNotice = ({
  isRetrying,
  message,
  onRetry,
  retryingButtonLabel = 'Retrying',
  retryingMessage = 'Retrying account sync...',
  title = 'Score not synced',
}: Props) => {
  return (
    <section className={cx('notice')} role="status">
      <div>
        <p className={cx('title')}>{title}</p>
        <p className={cx('message')}>
          {isRetrying
            ? retryingMessage
            : (message ?? 'Your score is saved locally for this dialog only.')}
        </p>
      </div>

      <button
        type="button"
        className={cx('retryButton')}
        disabled={isRetrying}
        onClick={() => void onRetry()}
      >
        {isRetrying ? retryingButtonLabel : 'Retry'}
      </button>
    </section>
  );
};

export default ScoreSyncNotice;
