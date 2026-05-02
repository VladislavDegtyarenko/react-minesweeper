import PageShell from '@/components/PageShell';
import { LEVELS_CONFIG } from '@/constants';
import type { LeaderboardEntry } from '@/utils/db';
import { createCx, getTimeDiff } from '@/utils';
import { formatDate } from '@/utils/formatDate';
import Avatar from '../ui/Avatar';
import styles from './styles.module.scss';

const cx = createCx(styles);

type Props = {
  entries: LeaderboardEntry[];
};

const LeaderboardPage = ({ entries }: Props) => {
  const groupedEntries = LEVELS_CONFIG.map((level) => ({
    entries: entries.filter((entry) => entry.levelId === level.id),
    levelId: level.id,
    label: level.label,
  }));

  return (
    <PageShell
      title="Leaderboard"
      description="Guests can view the ranking. Signed-in players can publish their best times after setting a nickname."
    >
      <div className={cx('columns')}>
        {groupedEntries.map((group) => (
          <section className={cx('column')} key={group.levelId}>
            <header className={cx('columnHeader')}>
              <h2>{group.label}</h2>
              <span>{group.entries.length} players</span>
            </header>
            <div className={cx('entries')}>
              {group.entries.length ? (
                group.entries.map((entry, index) => (
                  <article className={cx('entry')} key={entry.id}>
                    <div className={cx('rank')}>#{index + 1}</div>
                    <div className={cx('player')}>
                      <Avatar
                        alt={entry.username}
                        className={cx('avatar')}
                        imageUrl={entry.imageUrl}
                        label={entry.username}
                      />
                      <div>
                        <strong>{entry.username}</strong>
                        <p>{formatDate(new Date(entry.achievedAt))}</p>
                      </div>
                    </div>
                    <div className={cx('time')}>
                      {getTimeDiff(entry.bestTimeMs)}
                    </div>
                  </article>
                ))
              ) : (
                <p className={cx('emptyState')}>
                  No public scores recorded for this level yet.
                </p>
              )}
            </div>
          </section>
        ))}
      </div>
    </PageShell>
  );
};

export default LeaderboardPage;
