'use client';

import { useEffect, useMemo } from 'react';
import PageShell from '@/components/PageShell';
import { LEVELS_CONFIG } from '@/constants';
import {
  fetchLeaderboard,
  selectLeaderboardEntries,
  selectLeaderboardErrorMessage,
  selectLeaderboardLoadingState,
  useLeaderboardStore,
} from '@/store/leaderboard';
import { createCx, getTimeDiff } from '@/utils';
import { getAvatarPublicUrl, hasSupabaseEnv } from '@/utils/supabase';
import Avatar from '../ui/Avatar';
import { formatDate } from '@/utils/formatDate';

import styles from './styles.module.scss';
const cx = createCx(styles);

const LeaderboardPage = () => {
  const isConfigured = hasSupabaseEnv();
  const entries = useLeaderboardStore(selectLeaderboardEntries);
  const errorMessage = useLeaderboardStore(selectLeaderboardErrorMessage);
  const loadingState = useLeaderboardStore(selectLeaderboardLoadingState);

  useEffect(() => {
    if (!isConfigured) {
      return;
    }

    void fetchLeaderboard();
  }, [isConfigured]);

  const groupedEntries = useMemo(() => {
    return LEVELS_CONFIG.map((level) => ({
      entries: entries.filter((entry) => entry.level_id === level.id),
      levelId: level.id,
      label: level.label,
    }));
  }, [entries]);

  return (
    <PageShell
      title="Leaderboard"
      description="Guests can view the ranking. Logged-in players submit their best times to the shared board."
    >
      {!isConfigured ? (
        <p className={cx('notice')}>
          Supabase is not configured yet, so the shared leaderboard is
          unavailable.
        </p>
      ) : null}
      {errorMessage ? <p className={cx('notice')}>{errorMessage}</p> : null}
      {loadingState === 'loading' ? (
        <p className={cx('notice')}>Loading leaderboard…</p>
      ) : null}

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
                  <article className={cx('entry')} key={entry.user_id}>
                    <div className={cx('rank')}>#{index + 1}</div>
                    <div className={cx('player')}>
                      <Avatar
                        alt={entry.nickname}
                        className={cx('avatar')}
                        imageUrl={getAvatarPublicUrl(entry.avatar_path)}
                        label={entry.nickname}
                      />
                      <div>
                        <strong>{entry.nickname}</strong>
                        <p>{formatDate(new Date(entry.achieved_at))}</p>
                      </div>
                    </div>
                    <div className={cx('time')}>
                      {getTimeDiff(entry.best_time_ms)}
                    </div>
                  </article>
                ))
              ) : (
                <p className={cx('emptyState')}>
                  No account scores recorded for this level yet.
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
