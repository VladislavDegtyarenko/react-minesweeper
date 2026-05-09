import { createCx } from '@/utils';
import { SCROLL_HINT_DIRECTIONS } from './constants';
import type { BoardScrollHints } from './types';
import styles from './styles.module.scss';

const cx = createCx(styles);

type Props = {
  scrollHints: BoardScrollHints;
};

const ScrollHints = ({ scrollHints }: Props) => (
  <>
    {SCROLL_HINT_DIRECTIONS.map((direction) => (
      <span
        key={direction}
        aria-hidden="true"
        className={cx('scrollHint', direction)}
        style={{ opacity: scrollHints[direction] }}
      />
    ))}
  </>
);

export default ScrollHints;
