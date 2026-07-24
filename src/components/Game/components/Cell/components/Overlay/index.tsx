import styles from '../../styles.module.scss';
import { createCx } from '@/utils';
import { type PropsWithChildren } from 'react';

const cx = createCx(styles);

type Props = PropsWithChildren<{
  isMine: boolean;
  highlight: 'red' | 'green' | undefined;
}>;

const Overlay = ({ children, isMine, highlight }: Props) => {
  return <span className={cx('overlay', isMine && highlight)}>{children}</span>;
};

export default Overlay;
