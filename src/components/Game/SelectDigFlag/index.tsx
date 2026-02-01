import { ControlModes, DigFlag, useSettingsStore } from '@/store/settings';
import { setDigFlag } from '@/store/settings/actions';
import { selectControlMode, selectDigFlag } from '@/store/settings/selectors';
import SelectButtons from '../../ui/SelectButtons';

import { DIG_FLAG_OPTIONS } from '@/store/settings/constants';

import styles from './styles.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);

const SelectDigFlag = () => {
  const controlMode = useSettingsStore(selectControlMode);
  const digFlag = useSettingsStore(selectDigFlag);

  if (controlMode !== ControlModes.Toggle) {
    return null;
  }

  return (
    <SelectButtons<DigFlag>
      options={DIG_FLAG_OPTIONS}
      selectedOption={digFlag}
      onSelect={setDigFlag}
      className={cx('root')}
    />
  );
};

export default SelectDigFlag;
