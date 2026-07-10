import { memo } from 'react';
import { LEVELS_CONFIG } from '@/config';
import type { LevelId } from '@/types';
import { useGameStore } from '@/store/game';
import { requestLevelChange } from '@/store/game/actions';
import ToggleGroup from '@/components/ui/ToggleGroup';
import ToggleGroupItem from '@/components/ui/ToggleGroupItem';
import { useIsMobileViewport } from '@/hooks';
import { createCx } from '@/utils';
import styles from './styles.module.scss';

const cx = createCx(styles);

const LEVEL_TOGGLE_LABEL = 'Difficulty';
const LEVEL_OPTIONS = LEVELS_CONFIG.map((level) => ({
  value: level.id,
  label: level.label,
}));

const SelectLevelToggleGroup = memo(() => {
  const selectedLevelId = useGameStore((state) => state.level).id;
  const isMobileViewport = useIsMobileViewport();

  const handleLevelChange = (value: string) => {
    if (!value) {
      return undefined;
    }

    requestLevelChange(value as LevelId);
  };

  return (
    <ToggleGroup
      label={isMobileViewport ? undefined : LEVEL_TOGGLE_LABEL}
      type="single"
      value={selectedLevelId}
      defaultValue={selectedLevelId}
      aria-label={LEVEL_TOGGLE_LABEL}
      onValueChange={handleLevelChange}
      loop={true}
      className={cx('group')}
      labelClassName={cx('label')}
      wrapperClassName={cx('wrapper')}
    >
      {LEVEL_OPTIONS.map((option) => {
        return (
          <ToggleGroupItem
            key={option.value}
            value={option.value}
            label={option.label}
            className={cx('item')}
          />
        );
      })}
    </ToggleGroup>
  );
});

SelectLevelToggleGroup.displayName = 'SelectLevelToggleGroup';

export default SelectLevelToggleGroup;
