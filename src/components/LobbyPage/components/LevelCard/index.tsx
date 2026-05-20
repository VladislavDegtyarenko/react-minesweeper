import type { Level } from '@/types';
import { createCx } from '@/utils';
import { LEVEL_DETAILS } from '../../constants';
import PreviewBoard from '../PreviewBoard';
import SetupCard from '../SetupCard';
import styles from './styles.module.scss';

const cx = createCx(styles);

type LevelCardProps = {
  level: Level;
  isSelected: boolean;
  onSelect: (levelId: Level['id']) => void;
};

const LevelCard = ({ level, isSelected, onSelect }: LevelCardProps) => {
  const details = LEVEL_DETAILS[level.id];

  return (
    <SetupCard
      ariaLabel={`${level.label} difficulty: ${details.description}`}
      badge={details.badge}
      description={details.description}
      eyebrow={details.pace}
      isSelected={isSelected}
      media={
        <span className={cx('previewWrap')}>
          <PreviewBoard level={level} />
        </span>
      }
      title={level.label}
      onSelect={() => onSelect(level.id)}
    >
      <span className={cx('meta')} aria-label={`${level.label} board details`}>
        <span>
          <span className={cx('metaLabel')}>Grid</span>
          <span className={cx('metaValue')}>
            {level.rows} × {level.cols}
          </span>
        </span>
        <span>
          <span className={cx('metaLabel')}>Mines</span>
          <span className={cx('metaValue')}>{level.totalMines}</span>
        </span>
      </span>
    </SetupCard>
  );
};

export default LevelCard;
