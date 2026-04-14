import styles from './styles.module.scss';
import type {
  ComponentPropsWithoutRef,
  PropsWithChildren,
  ReactNode,
} from 'react';
import ToggleGroupRoot from '../ToggleGroupRoot';
import { createCx } from '@/utils';

const cx = createCx(styles);

type RootProps = ComponentPropsWithoutRef<typeof ToggleGroupRoot>;

type Props = RootProps &
  PropsWithChildren<{
    label?: ReactNode;
    labelClassName?: string;
    wrapperClassName?: string;
  }>;

const ToggleGroup = (props: Props) => {
  const { label, labelClassName, wrapperClassName, children, ...rootProps } =
    props;

  return (
    <div className={cx('wrapper', wrapperClassName)}>
      {label && <p className={cx('label', labelClassName)}>{label}</p>}

      <ToggleGroupRoot {...rootProps}>{children}</ToggleGroupRoot>
    </div>
  );
};

export default ToggleGroup;
