import styles from '../../styles.module.scss';
import { createCx } from '@/utils';
import { PropsWithChildren } from 'react';

const cx = createCx(styles);

type Props = PropsWithChildren<{
  isMine: boolean;
  highlight: 'red' | 'green' | undefined;
}>;

const Overlay = ({ children, isMine, highlight }: Props) => {
  return <div className={cx('overlay', isMine && highlight)}>{children}</div>;
};

export default Overlay;
