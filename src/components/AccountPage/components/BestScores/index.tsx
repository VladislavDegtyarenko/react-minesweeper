import { LEVELS_CONFIG } from '@/constants';

import { createCx, formatDate, getTimeDiff } from '@/utils';
import styles from './styles.module.scss';
import {
  selectAccountScores,
  selectAccountScoresLoadingState,
  useAccountStore,
} from '@/store/account';
import { useMemo } from 'react';
const cx = createCx(styles);

type Props = {
  className?: string;
};

const BestScores = (props: Props) => {
  const { className } = props;

  const scoresLoadingState = useAccountStore(selectAccountScoresLoadingState);
  const scores = useAccountStore(selectAccountScores);

  const scoreCards = useMemo(() => {
    return LEVELS_CONFIG.map((level) => ({
      label: level.label,
      score: scores.find((score) => score.level_id === level.id) ?? null,
    }));
  }, [scores]);

  return (
    <section className={cx(className)}>
      <header className={cx('scoresHeader')}>
        <h2>Best Scores</h2>
        <span>Best time plus timestamp per level</span>
      </header>
      {scoresLoadingState === 'loading' ? (
        <p className={cx('notice')}>Loading scores…</p>
      ) : null}
      <div className={cx('scoreList')}>
        {scoreCards.map((scoreCard) => (
          <article
            className={cx('scoreRow')}
            key={scoreCard.score?.id ?? scoreCard.label}
          >
            <div>
              <strong>{scoreCard.label}</strong>
              <p>
                {scoreCard.score
                  ? formatDate(new Date(scoreCard.score.achieved_at))
                  : 'No account score yet'}
              </p>
            </div>
            <div className={cx('scoreTime')}>
              {scoreCard.score
                ? getTimeDiff(scoreCard.score.best_time_ms)
                : '—'}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default BestScores;
