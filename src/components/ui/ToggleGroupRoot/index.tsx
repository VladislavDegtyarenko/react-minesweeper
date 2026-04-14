import type { ComponentPropsWithoutRef, PropsWithChildren } from 'react';
import { ToggleGroup as RadixToggleGroup } from 'radix-ui';
import styles from './styles.module.scss';
import { createCx } from '@/utils';

const cx = createCx(styles);

type RootProps = ComponentPropsWithoutRef<typeof RadixToggleGroup.Root>;

type Props = RootProps &
  PropsWithChildren<{
    className?: string;
  }>;

const ToggleGroupRoot = (props: Props) => {
  const { children, className, ...rootProps } = props;

  return (
    <RadixToggleGroup.Root
      className={cx('toggleGroup', className)}
      {...rootProps}
    >
      {children}
    </RadixToggleGroup.Root>
  );
};

export default ToggleGroupRoot;
