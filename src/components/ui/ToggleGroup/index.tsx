import classNames from 'classnames/bind';
import styles from './styles.module.scss';
import type {
  ComponentPropsWithoutRef,
  PropsWithChildren,
  ReactNode,
} from 'react';
import ToggleGroupRoot from '../ToggleGroupRoot';
const cx = classNames.bind(styles);

type RootProps = ComponentPropsWithoutRef<typeof ToggleGroupRoot>;

type Props = RootProps &
  PropsWithChildren<{
    label?: ReactNode;
  }>;

const ToggleGroup = (props: Props) => {
  const { label, children, ...rootProps } = props;

  return (
    <div className={cx('wrapper')}>
      {label && <p className={cx('label')}>{label}</p>}

      <ToggleGroupRoot {...rootProps}>{children}</ToggleGroupRoot>
    </div>
  );
};

export default ToggleGroup;
