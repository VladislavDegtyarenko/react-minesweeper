import styles from '../../styles.module.scss';
import { createCx } from '@/utils';
import { type PropsWithChildren } from 'react';

const cx = createCx(styles);

type Props = PropsWithChildren<{
  as?: 'div' | 'span';
  isMine: boolean;
  highlight: 'red' | 'green' | undefined;
}>;

const Overlay = ({
  as: Component = 'div',
  children,
  isMine,
  highlight,
}: Props) => {
  return (
    <Component className={cx('overlay', isMine && highlight)}>
      {children}
    </Component>
  );
};

export default Overlay;
