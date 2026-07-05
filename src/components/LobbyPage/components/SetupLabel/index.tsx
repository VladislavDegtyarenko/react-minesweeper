import type { PropsWithChildren } from 'react';
import { createCx } from '@/utils';
import styles from './styles.module.scss';

const cx = createCx(styles);

type SetupLabelProps = PropsWithChildren<{
  id?: string;
}>;

const SetupLabel = ({ children, id }: SetupLabelProps) => {
  return (
    <p className={cx('label')} id={id}>
      {children}
    </p>
  );
};

export default SetupLabel;
