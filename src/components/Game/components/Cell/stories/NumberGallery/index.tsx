import Cell from '../../index';
import { createCx } from '@/utils';
import styles from './styles.module.scss';

const cx = createCx(styles);
const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8];

const NumberGallery = () => {
  return (
    <div className={cx('gallery')}>
      {NUMBERS.map((value) => (
        <figure key={value} className={cx('sample')}>
          <Cell
            rowIndex={0}
            cellIndex={value - 1}
            value={value}
            isOpened
            marker={null}
            highlight={undefined}
          />
          <figcaption>
            {value} adjacent {value === 1 ? 'mine' : 'mines'}
          </figcaption>
        </figure>
      ))}
    </div>
  );
};

export default NumberGallery;
