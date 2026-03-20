import classNames from 'classnames/bind';
import { Popover } from 'radix-ui';
import { InfoCircledIcon } from '@radix-ui/react-icons';
import styles from './styles.module.scss';
import { useState } from 'react';
import { useSettingsStore } from '@/store/settings';
import { selectIsTouchScreen } from '@/store/settings/selectors';

const cx = classNames.bind(styles);

type InfoItem = {
  title: string;
  description: string;
};

type Props = {
  label: string;
  dialogTitle: string;
  items: ReadonlyArray<InfoItem>;
};

const INFO_BUTTON_LABEL_SUFFIX = ' info';

const LabelWithInfoDialog = (props: Props) => {
  const { label, dialogTitle, items } = props;
  const [isOpen, setIsOpen] = useState(false);
  const isTouchScreen = useSettingsStore(selectIsTouchScreen);
  const tooltipSide = isTouchScreen ? 'top' : 'right';
  const tooltipSideOffset = isTouchScreen ? 8 : 10;
  const infoButtonLabel = `${label}${INFO_BUTTON_LABEL_SUFFIX}`;
  const itemNodes = items.map((item) => {
    return (
      <li key={item.title} className={cx('item')}>
        <span className={cx('itemTitle')}>{item.title}</span>
        <span className={cx('itemDescription')}>{item.description}</span>
      </li>
    );
  });

  return (
    <span className={cx('label')}>
      <span className={cx('labelText')}>{label}</span>
      <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
        <Popover.Trigger asChild>
          <button
            className={cx('infoButton')}
            type="button"
            aria-label={infoButtonLabel}
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
            onFocus={() => setIsOpen(true)}
            onBlur={() => setIsOpen(false)}
          >
            <InfoCircledIcon className={cx('infoIcon')} />
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            className={cx('content')}
            side={tooltipSide}
            align="center"
            sideOffset={tooltipSideOffset}
            collisionPadding={12}
            avoidCollisions={true}
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
          >
            <h4 className={cx('title')}>{dialogTitle}</h4>
            <div className={cx('description')}>
              <ul className={cx('list')}>{itemNodes}</ul>
            </div>
            <Popover.Arrow className={cx('arrow')} />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </span>
  );
};

export default LabelWithInfoDialog;
