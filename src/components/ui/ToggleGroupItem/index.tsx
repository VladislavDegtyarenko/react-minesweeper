import { ToggleGroup } from 'radix-ui';

import classNames from 'classnames/bind';
import styles from './styles.module.scss';
const cx = classNames.bind(styles);

type Props = {
  value: number | string;
  label: string;
  className?: string;
};

const ToggleGroupItem = ({ value, label, className }: Props) => {
  return (
    <ToggleGroup.Item
      className={cx('toggleGroupItem', className)}
      value={String(value)}
      aria-label={label}
      title={label}
    >
      {label || value}
    </ToggleGroup.Item>
  );
};

export default ToggleGroupItem;
