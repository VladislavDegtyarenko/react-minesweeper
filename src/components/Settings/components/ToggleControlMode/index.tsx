import { ControlModes, useSettingsStore } from '@/store/settings';
import { setControlMode } from '@/store/settings/actions';
import {
  selectControlMode,
  selectIsTouchScreen,
} from '@/store/settings/selectors';

import { MOBILE_CONTROL_MODES_OPTIONS } from '@/store/settings/constants';

import ToggleGroup from '@/components/ui/ToggleGroup';
import ToggleGroupItem from '@/components/ui/ToggleGroupItem';
import LabelWithInfoDialog from '@/components/ui/LabelWithInfoDialog';
import { createCx } from '@/utils';
import styles from '../styles.module.scss';

const cx = createCx(styles);

const CONTROL_MODE_LABEL = 'Control Mode';
const CONTROL_MODE_ARIA_LABEL = 'Control mode';
const CONTROL_MODE_DIALOG_TITLE = 'Control Modes';
const CONTROL_MODE_INFO_ITEMS = [
  {
    title: ControlModes.Toggle,
    description:
      'Two buttons appear below the board. Use them to switch between Dig and Flag taps.',
  },
  {
    title: ControlModes.Gestures,
    description: 'Tap to dig and long-press to place a flag.',
  },
] as const;

const ToggleControlMode = () => {
  const controlMode = useSettingsStore(selectControlMode);
  const isTouchScreen = useSettingsStore(selectIsTouchScreen);

  if (!isTouchScreen) {
    return null;
  }

  const handleControlModeChange = (value: string) => {
    if (value) {
      setControlMode(value as ControlModes);
    }
  };

  return (
    <ToggleGroup
      label={
        <LabelWithInfoDialog
          label={CONTROL_MODE_LABEL}
          dialogTitle={CONTROL_MODE_DIALOG_TITLE}
          items={CONTROL_MODE_INFO_ITEMS}
        />
      }
      type="single"
      value={controlMode}
      defaultValue={controlMode}
      aria-label={CONTROL_MODE_ARIA_LABEL}
      onValueChange={handleControlModeChange}
      loop={true}
      wrapperClassName={cx('zoomWrapper')}
      labelClassName={cx('zoomLabel')}
      className={cx('zoomGroup')}
    >
      {MOBILE_CONTROL_MODES_OPTIONS.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          label={option.label}
          className={cx('zoomItem')}
        />
      ))}
    </ToggleGroup>
  );
};

export default ToggleControlMode;
