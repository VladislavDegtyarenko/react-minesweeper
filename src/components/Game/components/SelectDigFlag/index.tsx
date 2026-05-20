import { ControlModes, DigFlag, useSettingsStore } from '@/store/settings';
import { setDigFlag } from '@/store/settings/actions';
import { selectControlMode, selectDigFlag } from '@/store/settings/selectors';
import ToggleGroup from '@/components/ui/ToggleGroup';
import ToggleGroupItem from '@/components/ui/ToggleGroupItem';
import { useIsMobileViewport } from '@/hooks';
import type { ReactNode } from 'react';
import { createCx } from '@/utils';
import styles from './styles.module.scss';

const cx = createCx(styles);

const DIG_FLAG_LABEL = 'Mode';
const DIG_FLAG_OPTIONS: { value: DigFlag; label: string; icon: ReactNode }[] = [
  {
    value: DigFlag.Dig,
    label: String(DigFlag.Dig),
    icon: (
      <img
        src="/themes/blue-graphite/icons/shovel.png"
        alt=""
        aria-hidden="true"
        className={cx('itemIcon', 'digIcon')}
      />
    ),
  },
  {
    value: DigFlag.Flag,
    label: String(DigFlag.Flag),
    icon: (
      <img
        src="/themes/blue-graphite/icons/Flag.svg"
        alt=""
        aria-hidden="true"
        className={cx('itemIcon', 'flagIcon')}
      />
    ),
  },
];

const SelectDigFlag = () => {
  const controlMode = useSettingsStore(selectControlMode);
  const digFlag = useSettingsStore(selectDigFlag);
  const isMobileViewport = useIsMobileViewport();

  if (controlMode !== ControlModes.Toggle) {
    return null;
  }

  const handleDigFlagChange = (value: string) => {
    if (!value) {
      return undefined;
    }

    setDigFlag(value as DigFlag);
  };

  return (
    <ToggleGroup
      data-tour-id="flag-controls"
      label={isMobileViewport ? undefined : DIG_FLAG_LABEL}
      type="single"
      value={digFlag}
      defaultValue={digFlag}
      aria-label={DIG_FLAG_LABEL}
      onValueChange={handleDigFlagChange}
      loop={true}
      className={cx('group')}
      wrapperClassName={cx('wrapper')}
      labelClassName={cx('label')}
    >
      {DIG_FLAG_OPTIONS.map((option) => {
        return (
          <ToggleGroupItem
            key={option.value}
            value={option.value}
            label={isMobileViewport ? option.icon : option.label}
            ariaLabel={option.label}
            className={cx('item')}
          />
        );
      })}
    </ToggleGroup>
  );
};

export default SelectDigFlag;
