import { Popover } from 'radix-ui';
import ToggleControlMode from './components/ToggleControlMode';
import ToggleQuestionMark from './components/ToggleQuestionMark';
import ToggleGroupZoom from './components/ToggleGroupZoom';
import ToggleSound from './components/ToggleSound';
import Separator from '../ui/Separator';
import { setIsSettingsOpened } from '@/store/settings/actions';

import { useSettingsStore } from '@/store/settings';
import { selectIsSettingsOpened } from '@/store/settings/selectors';
import Button from '../ui/Button';

import styles from './styles.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);

const Settings = () => {
  const isSettingsOpened = useSettingsStore(selectIsSettingsOpened);

  return (
    <Popover.Root open={isSettingsOpened} onOpenChange={setIsSettingsOpened}>
      <Popover.Trigger asChild>
        <Button isIcon aria-label="Open settings">
          <img src="/icons/settings.svg" alt="Settings" />
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className={cx('popoverContent')} sideOffset={5}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p className="Text" style={{ fontWeight: 700 }}>
              Settings
            </p>

            <Separator />

            <ToggleControlMode />

            <ToggleQuestionMark />

            <ToggleSound />

            <ToggleGroupZoom />
          </div>
          <Popover.Arrow className="PopoverArrow" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default Settings;
