import { forwardRef } from 'react';
import { createCx } from '@/utils';
import { SCROLL_HINT_DIRECTIONS } from './constants';
import styles from './styles.module.scss';

const cx = createCx(styles);

const ScrollHints = forwardRef<HTMLDivElement>((_, ref) => (
  <div ref={ref} aria-hidden="true" className={cx('scrollHints')}>
    {SCROLL_HINT_DIRECTIONS.map((direction) => (
      <span key={direction} className={cx('scrollHint', direction)} />
    ))}
  </div>
));

ScrollHints.displayName = 'ScrollHints';

export default ScrollHints;
