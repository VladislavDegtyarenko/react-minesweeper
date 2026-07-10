import Link from 'next/link';
import PageShell from '@/components/PageShell';
import { LEVELS_CONFIG } from '@/constants';
import type {
  DailyLeaderboardEntry,
  DailyStreakLeaderboardEntry,
  LeaderboardEntry,
} from '@/server/db';
import { createCx, getTimeDiff } from '@/utils';
import { formatDailyKey } from '@/game/daily';
import { formatDate } from '@/utils/formatDate';
import Avatar from '../ui/Avatar';
import styles from './styles.module.scss';

const cx = createCx(styles);

type LeaderboardView = 'free' | 'daily';

type Props = {
  activeView: LeaderboardView;
  currentUserId: string | null;
  dailyEntries: DailyLeaderboardEntry[];
  dailyStreakEntries: DailyStreakLeaderboardEntry[];
  entries: LeaderboardEntry[];
  todayKey: string;
};

const getPlayerCountLabel = (count: number) => {
  return `${count} ${count === 1 ? 'player' : 'players'}`;
};

const LeaderboardPage = ({
  activeView,
  currentUserId,
  dailyEntries,
  dailyStreakEntries,
  entries,
  todayKey,
}: Props) => {
  const groupedEntries = LEVELS_CONFIG.map((level) => ({
    entries: entries.filter((entry) => entry.levelId === level.id),
    levelId: level.id,
    label: level.label,
  }));
  const groupedDailyEntries = LEVELS_CONFIG.map((level) => ({
    entries: dailyEntries.filter((entry) => entry.levelId === level.id),
    levelId: level.id,
    label: level.label,
  }));
  const isFreeView = activeView === 'free';
  const friendlyDailyDate = formatDailyKey(todayKey);

  return (
    <PageShell
      title="Leaderboard"
      description="Guests can view the rankings. Signed-in players can publish best times, daily wins, and daily streaks after setting a nickname."
    >
      <div className={cx('tabs')} aria-label="Leaderboard views">
        <Link
          className={cx('tab', isFreeView && 'activeTab')}
          href="/leaderboard?view=free"
          aria-current={isFreeView ? 'page' : undefined}
        >
          Free Play
        </Link>
        <Link
          className={cx('tab', !isFreeView && 'activeTab')}
          href="/leaderboard?view=daily"
          aria-current={!isFreeView ? 'page' : undefined}
        >
          Daily
        </Link>
      </div>

      {isFreeView ? (
        <div className={cx('columns')}>
          {groupedEntries.map((group) => (
            <section className={cx('column')} key={group.levelId}>
              <header className={cx('columnHeader')}>
                <h2>{group.label}</h2>
                <span>{getPlayerCountLabel(group.entries.length)}</span>
              </header>
              <div className={cx('entries')}>
                {group.entries.length ? (
                  group.entries.map((entry, index) => {
                    const isCurrentUser = entry.userId === currentUserId;

                    return (
                      <article
                        className={cx(
                          'entry',
                          isCurrentUser && 'currentUserEntry',
                        )}
                        key={entry.id}
                        aria-current={isCurrentUser ? 'true' : undefined}
                      >
                        <div className={cx('rank')}>#{index + 1}</div>
                        <div className={cx('player')}>
                          <Avatar
                            alt={entry.username}
                            className={cx('avatar')}
                            imageUrl={entry.imageUrl}
                            label={entry.username}
                          />
                          <div>
                            <strong className={cx('playerName')}>
                              {entry.username}
                              {isCurrentUser ? (
                                <span className={cx('youBadge')}>You</span>
                              ) : null}
                            </strong>
                            <p>{formatDate(new Date(entry.achievedAt))}</p>
                          </div>
                        </div>
                        <div className={cx('time')}>
                          {getTimeDiff(entry.bestTimeMs)}
                        </div>
                      </article>
                    );
                  })
                ) : (
                  <p className={cx('emptyState')}>
                    No public scores recorded for this level yet.
                  </p>
                )}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className={cx('dailyView')}>
          <section className={cx('dailyIntro')}>
            <div>
              <h2>Today&apos;s Daily</h2>
              <p>{friendlyDailyDate} UTC</p>
            </div>
            <span>{getPlayerCountLabel(dailyEntries.length)}</span>
          </section>

          <div className={cx('columns')}>
            {groupedDailyEntries.map((group) => (
              <section className={cx('column')} key={group.levelId}>
                <header className={cx('columnHeader')}>
                  <h2>{group.label}</h2>
                  <span>{getPlayerCountLabel(group.entries.length)}</span>
                </header>
                <div className={cx('entries')}>
                  {group.entries.length ? (
                    group.entries.map((entry, index) => {
                      const isCurrentUser = entry.userId === currentUserId;

                      return (
                        <article
                          className={cx(
                            'entry',
                            isCurrentUser && 'currentUserEntry',
                          )}
                          key={entry.id}
                          aria-current={isCurrentUser ? 'true' : undefined}
                        >
                          <div className={cx('rank')}>#{index + 1}</div>
                          <div className={cx('player')}>
                            <Avatar
                              alt={entry.username}
                              className={cx('avatar')}
                              imageUrl={entry.imageUrl}
                              label={entry.username}
                            />
                            <div>
                              <strong className={cx('playerName')}>
                                {entry.username}
                                {isCurrentUser ? (
                                  <span className={cx('youBadge')}>You</span>
                                ) : null}
                              </strong>
                              <p>Cleared {formatDate(new Date(entry.createdAt))}</p>
                            </div>
                          </div>
                          <div className={cx('time')}>
                            {getTimeDiff(entry.elapsedMs)}
                          </div>
                        </article>
                      );
                    })
                  ) : (
                    <p className={cx('emptyState')}>
                      No public daily wins recorded for this level yet.
                    </p>
                  )}
                </div>
              </section>
            ))}
          </div>

          <section className={cx('column', 'streakColumn')}>
            <header className={cx('columnHeader')}>
              <h2>Daily Streaks</h2>
              <span>Top 10</span>
            </header>
            <div className={cx('entries')}>
              {dailyStreakEntries.length ? (
                dailyStreakEntries.map((entry, index) => {
                  const isCurrentUser = entry.userId === currentUserId;

                  return (
                    <article
                      className={cx(
                        'entry',
                        'streakEntry',
                        isCurrentUser && 'currentUserEntry',
                      )}
                      key={entry.userId}
                      aria-current={isCurrentUser ? 'true' : undefined}
                    >
                      <div className={cx('rank')}>#{index + 1}</div>
                      <div className={cx('player')}>
                        <Avatar
                          alt={entry.username}
                          className={cx('avatar')}
                          imageUrl={entry.imageUrl}
                          label={entry.username}
                        />
                        <div>
                          <strong className={cx('playerName')}>
                            {entry.username}
                            {isCurrentUser ? (
                              <span className={cx('youBadge')}>You</span>
                            ) : null}
                          </strong>
                          <p>
                            Last win{' '}
                            {entry.lastWinKey
                              ? formatDailyKey(entry.lastWinKey)
                              : 'none'}
                          </p>
                        </div>
                      </div>
                      <dl className={cx('streakStats')}>
                        <div>
                          <dt>Current</dt>
                          <dd>{entry.currentStreak}</dd>
                        </div>
                        <div>
                          <dt>Best</dt>
                          <dd>{entry.bestStreak}</dd>
                        </div>
                      </dl>
                    </article>
                  );
                })
              ) : (
                <p className={cx('emptyState')}>
                  No public daily streaks recorded yet.
                </p>
              )}
            </div>
          </section>
        </div>
      )}
    </PageShell>
  );
};

export default LeaderboardPage;
