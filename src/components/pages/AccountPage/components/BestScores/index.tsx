import { LEVELS_CONFIG } from '@/config';
import type { BestScore } from '@/server/db';
import { createCx, formatDate, getTimeDiff } from '@/utils';
import styles from './styles.module.scss';

const cx = createCx(styles);

type Props = {
  className?: string;
  scores: BestScore[];
};

const BestScores = ({ className, scores }: Props) => {
  const scoreCards = LEVELS_CONFIG.map((level) => ({
    label: level.label,
    score: scores.find((score) => score.levelId === level.id) ?? null,
  }));

  return (
    <section className={cx(className)}>
      <header className={cx('scoresHeader')}>
        <h2>Best Scores</h2>
        <span>Best time plus timestamp per level</span>
      </header>
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
                  ? formatDate(new Date(scoreCard.score.achievedAt))
                  : 'No account score yet'}
              </p>
            </div>
            <div className={cx('scoreTime')}>
              {scoreCard.score
                ? getTimeDiff(scoreCard.score.bestTimeMs)
                : '—'}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default BestScores;
