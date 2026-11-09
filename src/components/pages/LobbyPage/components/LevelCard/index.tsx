import type { Level } from '@/types';
import { createCx } from '@/utils';
import { LEVEL_DETAILS } from '../../constants';
import PreviewBoard from '../PreviewBoard';
import LobbyCard from '../LobbyCard';
import styles from './styles.module.scss';

const cx = createCx(styles);

type LevelCardProps = {
  level: Level;
  isSelected: boolean;
  onSelect: (levelId: Level['id']) => void;
};

const LevelCard = ({ level, isSelected, onSelect }: LevelCardProps) => {
  const { pace, description, badge } = LEVEL_DETAILS[level.id];

  return (
    <LobbyCard
      badge={badge}
      compactBadge={badge === 'Recommended' ? 'Best' : badge}
      compactOnMobile
      compactVariant="level"
      description={description}
      eyebrow={pace}
      isSelected={isSelected}
      media={
        <span className={cx('previewWrap')}>
          <PreviewBoard level={level} />
        </span>
      }
      title={level.label}
      onSelect={() => onSelect(level.id)}
    >
      <span className={cx('mobileMeta')}>
        <span>
          {level.rows} × {level.cols}
        </span>
        <span>{level.totalMines} mines</span>
      </span>

      <span className={cx('meta')}>
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
    </LobbyCard>
  );
};

export default LevelCard;
