import { ToggleGroup } from 'radix-ui';
import classNames from 'classnames/bind';
import type { ReactNode } from 'react';
import styles from './styles.module.scss';

type Props = {
  value: number | string;
  label: ReactNode;
  ariaLabel?: string;
  title?: string;
  className?: string;
};

const cx = classNames.bind(styles);

const ToggleGroupItem = ({
  value,
  label,
  ariaLabel,
  title,
  className,
}: Props) => {
  return (
    <ToggleGroup.Item
      className={cx('toggleGroupItem', className)}
      value={String(value)}
      aria-label={ariaLabel ?? String(value)}
      title={title ?? ariaLabel ?? String(value)}
    >
      {label || value}
    </ToggleGroup.Item>
  );
};

export default ToggleGroupItem;
