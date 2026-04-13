import { ToggleGroup } from 'radix-ui';
import type { ReactNode } from 'react';
import { createCx } from '@/utils';
import styles from './styles.module.scss';

type Props = {
  value: number | string;
  label: ReactNode;
  ariaLabel?: string;
  title?: string;
  className?: string;
};

const cx = createCx(styles);

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
