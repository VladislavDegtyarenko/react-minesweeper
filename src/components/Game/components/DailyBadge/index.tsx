import { memo } from 'react';
import { useGameStore } from '@/store/game';
import { selectIsDailyMode } from '@/store/game/selectors';
import { createCx } from '@/utils';
import styles from './styles.module.scss';

const cx = createCx(styles);

const DailyBadge = memo(() => {
  const isDailyMode = useGameStore(selectIsDailyMode);

  if (!isDailyMode) {
    return null;
  }

  return (
    <span className={cx('badge')} aria-label="Daily challenge mode">
      Daily
    </span>
  );
});

DailyBadge.displayName = 'DailyBadge';

export default DailyBadge;
