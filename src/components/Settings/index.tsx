import * as Dialog from '@radix-ui/react-dialog';
import { Popover } from 'radix-ui';
import ToggleControlMode from './components/ToggleControlMode';
import ToggleQuestionMark from './components/ToggleQuestionMark';
import ToggleGroupZoom from './components/ToggleGroupZoom';
import ToggleSound from './components/ToggleSound';
import Separator from '../ui/Separator';
import { setIsSettingsOpened } from '@/store/settings/actions';

import { useSettingsStore } from '@/store/settings';
import {
  selectIsSettingsOpened,
  selectIsTouchScreen,
} from '@/store/settings/selectors';
import Button from '../ui/Button';

import styles from './styles.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);

const SETTINGS_LABEL = 'Settings';

const Settings = () => {
  const isSettingsOpened = useSettingsStore(selectIsSettingsOpened);
  const isTouchScreen = useSettingsStore(selectIsTouchScreen);

  const triggerButton = (
    <Button isIcon aria-label="Open settings">
      <img
        src="/themes/blue-graphite/icons/Settings.png"
        alt={SETTINGS_LABEL}
      />
    </Button>
  );

  const panelContent = (
    <div className={cx('panelBody')}>
      <p className={cx('title')}>{SETTINGS_LABEL}</p>
      <Separator />
      <ToggleControlMode />
      <ToggleQuestionMark />
      <ToggleSound />
      <ToggleGroupZoom />
    </div>
  );

  if (isTouchScreen) {
    return (
      <Dialog.Root open={isSettingsOpened} onOpenChange={setIsSettingsOpened}>
        <Dialog.Trigger asChild>{triggerButton}</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className={cx('sheetOverlay')} />
          <Dialog.Content className={cx('sheetContent')}>
            {panelContent}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }

  return (
    <Popover.Root open={isSettingsOpened} onOpenChange={setIsSettingsOpened}>
      <Popover.Trigger asChild>{triggerButton}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className={cx('popoverContent')}
          sideOffset={8}
          align="end"
        >
          {panelContent}
          <Popover.Arrow className={cx('popoverArrow')} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default Settings;
