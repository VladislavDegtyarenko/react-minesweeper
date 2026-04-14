import styles from './number-clue-demo.module.scss';
import { createCx } from '@/utils';

const cx = createCx(styles);

const CELLS = [
  { kind: 'mine' },
  { kind: 'empty' },
  { kind: 'empty' },
  { kind: 'empty' },
  { kind: 'number', value: '2' },
  { kind: 'mine' },
  { kind: 'empty' },
  { kind: 'empty' },
  { kind: 'empty' },
] as const;

const NumberClueDemo = () => {
  return (
    <figure className={cx('demo')}>
      <div
        className={cx('board')}
        role="img"
        aria-label="A 3 by 3 opened board with a 2 in the center and two mines in the surrounding cells"
      >
        {CELLS.map((cell, index) => (
          <span
            key={`${cell.kind}-${index}`}
            className={cx('cell', cell.kind, {
              two: cell.kind === 'number' && cell.value === '2',
            })}
          >
            {cell.kind === 'mine' && (
              <img
                src="/themes/blue-graphite/icons/Bomb.png"
                alt=""
                className={cx('icon')}
              />
            )}
            {cell.kind === 'number' && cell.value}
          </span>
        ))}
      </div>
      <figcaption className={cx('caption')}>
        The center <strong>2</strong> touches exactly the two mine cells shown
        here.
      </figcaption>
    </figure>
  );
};

export default NumberClueDemo;
