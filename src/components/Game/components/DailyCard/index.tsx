import { forwardRef, memo } from 'react';
import {
  retryDailyAttemptSync,
  selectActiveDailyRunKind,
  selectDailyAccountStateStatus,
  selectDailyStreak,
  selectDailySyncError,
  selectDailyTodayKey,
  selectHasPendingSyncAttemptByLevel,
  selectIsDailySyncing,
  selectTodayEntryByLevel,
  useDailyStore,
  type DailyHistoryEntry,
} from '@/store/daily';
import { useGameStore } from '@/store/game';
import { selectGameStatus, selectIsDailyMode } from '@/store/game/selectors';
import { createCx, getTimeDiff } from '@/utils';
import { formatDailyKey } from '@/game/daily';
import { useDailyResetCountdown } from './hooks/useDailyResetCountdown';
import styles from './styles.module.scss';

const cx = createCx(styles);

const getRecordedStatusText = (todayEntry: DailyHistoryEntry | null) => {
  if (!todayEntry) {
    return 'Fresh challenge';
  }

  if (todayEntry.status === 'won') {
    return `Result recorded: ${getTimeDiff(todayEntry.elapsedMs)}`;
  }

  return 'Result recorded: loss';
};

const DailyCard = memo(
  forwardRef<HTMLElement>((_props, ref) => {
    const isDailyMode = useGameStore(selectIsDailyMode);
    const gameStatus = useGameStore(selectGameStatus);
    const levelId = useGameStore((state) => state.level.id);
    const levelLabel = useGameStore((state) => state.level.label);
    const todayKey = useDailyStore(selectDailyTodayKey);
    const accountStateStatus = useDailyStore(selectDailyAccountStateStatus);
    const streak = useDailyStore(selectDailyStreak);
    const todayEntry = useDailyStore(selectTodayEntryByLevel(levelId));
    const activeRunKind = useDailyStore(selectActiveDailyRunKind);
    const syncError = useDailyStore(selectDailySyncError);
    const isSyncing = useDailyStore(selectIsDailySyncing);
    const hasPendingSyncAttempt = useDailyStore(
      selectHasPendingSyncAttemptByLevel(levelId),
    );
    const resetCountdown = useDailyResetCountdown(isDailyMode);

    if (!isDailyMode) {
      return null;
    }

    const isAccountProgressLoading =
      accountStateStatus === 'idle' || accountStateStatus === 'loading';
    const isAccountProgressUnavailable = accountStateStatus === 'failed';
    const shouldHideAccountProgress =
      isAccountProgressLoading || isAccountProgressUnavailable;
    const isCompletedToday =
      !shouldHideAccountProgress && todayEntry?.status === 'won';
    const isPracticeReplay =
      !shouldHideAccountProgress &&
      (activeRunKind === 'practice' ||
        (Boolean(todayEntry) && gameStatus === 'idle'));
    const hasSyncError = Boolean(syncError);
    const canRetrySync = hasPendingSyncAttempt && hasSyncError && !isSyncing;
    const statusText = isAccountProgressLoading
      ? 'Loading account progress'
      : canRetrySync
        ? 'Sync failed - retry'
        : isAccountProgressUnavailable
          ? 'Account progress unavailable'
          : isSyncing
            ? 'Syncing daily progress'
            : isPracticeReplay
              ? 'Replay only'
              : hasSyncError
                ? 'Account sync unavailable'
                : getRecordedStatusText(todayEntry);
    const friendlyDate = formatDailyKey(todayKey);

    return (
      <section
        ref={ref}
        className={cx(
          'card',
          isCompletedToday && 'completed',
          isPracticeReplay && 'practice',
          canRetrySync && 'syncFailed',
        )}
        aria-label={`Daily challenge for ${friendlyDate}, ${levelLabel}`}
      >
        <div className={cx('main')}>
          <span className={cx('eyebrow')}>Daily Challenge</span>
          <div className={cx('dateRow')}>
            <time className={cx('date')} dateTime={todayKey}>
              {friendlyDate}
            </time>
            <span className={cx('separator')} aria-hidden="true">
              •
            </span>
            <span className={cx('status')}>{statusText}</span>
          </div>
          <span className={cx('countdown')}>
            Next daily in {resetCountdown}
          </span>
        </div>

        <dl className={cx('stats')} aria-label="Daily streak">
          <div className={cx('stat')}>
            <dt>Streak</dt>
            <dd>{shouldHideAccountProgress ? '-' : streak.currentStreak}</dd>
          </div>
          <div className={cx('stat')}>
            <dt>Best</dt>
            <dd>{shouldHideAccountProgress ? '-' : streak.bestStreak}</dd>
          </div>
        </dl>

        {canRetrySync && (
          <button
            type="button"
            className={cx('retryButton')}
            onClick={() => void retryDailyAttemptSync()}
          >
            Retry
          </button>
        )}
      </section>
    );
  }),
);

DailyCard.displayName = 'DailyCard';

export default DailyCard;
