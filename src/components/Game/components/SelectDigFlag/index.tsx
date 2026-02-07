import { ControlModes, DigFlag, useSettingsStore } from '@/store/settings';
import { setDigFlag } from '@/store/settings/actions';
import { selectControlMode, selectDigFlag } from '@/store/settings/selectors';
import ToggleGroup from '@/components/ui/ToggleGroup';
import ToggleGroupItem from '@/components/ui/ToggleGroupItem';

import classNames from 'classnames/bind';
const cx = classNames.bind(styles);
import styles from './styles.module.scss';

const DIG_FLAG_LABEL = 'Mode';

export const DIG_FLAG_OPTIONS = [
  { value: DigFlag.Dig, label: String(DigFlag.Dig) },
  { value: DigFlag.Flag, label: String(DigFlag.Flag) },
];

const SelectDigFlag = () => {
  const controlMode = useSettingsStore(selectControlMode);
  const digFlag = useSettingsStore(selectDigFlag);

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
      label={DIG_FLAG_LABEL}
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
            label={option.label}
            className={cx('item')}
          />
        );
      })}
    </ToggleGroup>
  );
};

export default SelectDigFlag;
