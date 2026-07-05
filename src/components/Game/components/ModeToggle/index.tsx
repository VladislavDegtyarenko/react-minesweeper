import { memo } from 'react';
import { useGameStore } from '@/store/game';
import { requestModeChange } from '@/store/game/actions';
import { selectGameMode } from '@/store/game/selectors';
import ToggleGroup from '@/components/ui/ToggleGroup';
import ToggleGroupItem from '@/components/ui/ToggleGroupItem';
import { useIsMobileViewport } from '@/hooks';
import { createCx } from '@/utils';
import styles from './styles.module.scss';

const cx = createCx(styles);

const MODE_LABEL = 'Mode';
const MODE_OPTIONS = [
  { value: 'free', label: 'Free Play' },
  { value: 'daily', label: 'Daily' },
] as const;

const ModeToggle = memo(() => {
  const mode = useGameStore(selectGameMode);
  const isMobileViewport = useIsMobileViewport();

  const handleModeChange = (value: string) => {
    if (value === 'daily') {
      requestModeChange('daily');

      return;
    }

    if (value === 'free') {
      requestModeChange('free');
    }
  };

  return (
    <ToggleGroup
      data-tour-id="daily-mode"
      label={isMobileViewport ? undefined : MODE_LABEL}
      type="single"
      value={mode}
      defaultValue={mode}
      aria-label={MODE_LABEL}
      onValueChange={handleModeChange}
      loop={true}
      className={cx('group')}
      labelClassName={cx('label')}
      wrapperClassName={cx('wrapper')}
    >
      {MODE_OPTIONS.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          label={option.label}
          className={cx('item')}
        />
      ))}
    </ToggleGroup>
  );
});

ModeToggle.displayName = 'ModeToggle';

export default ModeToggle;
