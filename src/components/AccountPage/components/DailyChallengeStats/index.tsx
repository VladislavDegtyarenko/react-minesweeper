import { LEVELS_CONFIG } from '@/constants';
import type { DailyAttempt, DailyStreakSummary } from '@/utils/db';
import { createCx, formatDate, getTimeDiff } from '@/utils';
import { formatDailyKey } from '@/utils/daily';
import styles from './styles.module.scss';

const cx = createCx(styles);
const RECENT_DAILY_ATTEMPTS_LIMIT = 10;

type Props = {
  attempts: DailyAttempt[];
  className?: string;
  streak: DailyStreakSummary;
  todayKey: string;
};

const getLevelLabel = (levelId: DailyAttempt['levelId']) => {
  return LEVELS_CONFIG.find((level) => level.id === levelId)?.label ?? levelId;
};

const getAttemptResultLabel = (attempt: DailyAttempt) => {
  if (attempt.status === 'won') {
    return getTimeDiff(attempt.elapsedMs);
  }

  return 'Loss';
};

const DailyChallengeStats = ({
  attempts,
  className,
  streak,
  todayKey,
}: Props) => {
  const todayCards = LEVELS_CONFIG.map((level) => ({
    label: level.label,
    attempt:
      attempts.find(
        (attempt) =>
          attempt.dailyKey === todayKey && attempt.levelId === level.id,
      ) ?? null,
  }));
  const recentAttempts = attempts.slice(0, RECENT_DAILY_ATTEMPTS_LIMIT);

  return (
    <section className={cx(className)}>
      <header className={cx('header')}>
        <div>
          <h2>Daily Challenge</h2>
          <span>{formatDailyKey(todayKey)} UTC</span>
        </div>
      </header>

      <dl className={cx('streakGrid')} aria-label="Daily streak summary">
        <div>
          <dt>Current streak</dt>
          <dd>{streak.currentStreak}</dd>
        </div>
        <div>
          <dt>Best streak</dt>
          <dd>{streak.bestStreak}</dd>
        </div>
        <div>
          <dt>Last win</dt>
          <dd>
            {streak.lastWinKey ? formatDailyKey(streak.lastWinKey) : 'None'}
          </dd>
        </div>
      </dl>

      <div className={cx('todayList')} aria-label="Today daily status">
        {todayCards.map((card) => (
          <article className={cx('todayRow')} key={card.label}>
            <div>
              <strong>{card.label}</strong>
              <p>
                {card.attempt
                  ? card.attempt.status === 'won'
                    ? 'Cleared today'
                    : 'Attempt recorded'
                  : 'Not played today'}
              </p>
            </div>
            <span
              className={cx(
                'resultBadge',
                card.attempt?.status === 'won' && 'won',
                card.attempt?.status === 'lost' && 'lost',
              )}
            >
              {card.attempt ? getAttemptResultLabel(card.attempt) : '-'}
            </span>
          </article>
        ))}
      </div>

      <section className={cx('recentSection')}>
        <header className={cx('subheader')}>
          <h3>Recent daily attempts</h3>
          <span>Counted attempts only</span>
        </header>
        <div className={cx('recentList')}>
          {recentAttempts.length ? (
            recentAttempts.map((attempt) => (
              <article className={cx('recentRow')} key={attempt.id}>
                <div>
                  <strong>
                    {formatDailyKey(attempt.dailyKey)} -{' '}
                    {getLevelLabel(attempt.levelId)}
                  </strong>
                  <p>{formatDate(new Date(attempt.createdAt))}</p>
                </div>
                <span
                  className={cx(
                    'resultBadge',
                    attempt.status === 'won' && 'won',
                    attempt.status === 'lost' && 'lost',
                  )}
                >
                  {getAttemptResultLabel(attempt)}
                </span>
              </article>
            ))
          ) : (
            <p className={cx('emptyState')}>
              No account daily attempts recorded yet.
            </p>
          )}
        </div>
      </section>
    </section>
  );
};

export default DailyChallengeStats;
