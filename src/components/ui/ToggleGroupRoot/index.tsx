import type { ComponentPropsWithoutRef, PropsWithChildren } from 'react';
import { ToggleGroup as RadixToggleGroup } from 'radix-ui';
import classNames from 'classnames/bind';
import styles from './styles.module.scss';

const cx = classNames.bind(styles);

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
