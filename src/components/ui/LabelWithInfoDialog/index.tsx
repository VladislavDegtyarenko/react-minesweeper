import classNames from 'classnames/bind';
import * as Dialog from '@radix-ui/react-dialog';
import { Cross2Icon, InfoCircledIcon } from '@radix-ui/react-icons';
import styles from './styles.module.scss';

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

const CLOSE_BUTTON_LABEL = 'Close';
const INFO_BUTTON_LABEL_SUFFIX = ' info';

const LabelWithInfoDialog = (props: Props) => {
  const { label, dialogTitle, items } = props;
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
      <Dialog.Root>
        <Dialog.Trigger asChild>
          <button
            className={cx('infoButton')}
            type="button"
            aria-label={infoButtonLabel}
          >
            <InfoCircledIcon className={cx('infoIcon')} />
          </button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className={cx('overlay')} />
          <Dialog.Content className={cx('content')}>
            <Dialog.Title className={cx('title')}>
              {dialogTitle}
            </Dialog.Title>
            <Dialog.Description asChild>
              <div className={cx('description')}>
                <ul className={cx('list')}>{itemNodes}</ul>
              </div>
            </Dialog.Description>
            <Dialog.Close asChild>
              <button
                className={cx('closeButton')}
                type="button"
                aria-label={CLOSE_BUTTON_LABEL}
              >
                <Cross2Icon className={cx('closeIcon')} />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </span>
  );
};

export default LabelWithInfoDialog;
