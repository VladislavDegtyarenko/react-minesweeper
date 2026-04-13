import styles from './cell-example.module.scss';
import { createCx } from '@/utils';

const cx = createCx(styles);

type Props = {
  variant: 'safe' | 'mine' | 'flag' | 'question';
};

const CellExample = ({ variant }: Props) => {
  return (
    <span className={cx('cellWrap')} aria-hidden="true">
      {variant === 'safe' && <span className={cx('cell', 'opened', 'two')}>2</span>}

      {variant === 'mine' && (
        <span className={cx('cell', 'opened', 'mine')}>
          <img
            src="/themes/blue-graphite/icons/Bomb.png"
            alt=""
            className={cx('icon')}
          />
        </span>
      )}

      {variant === 'flag' && (
        <span className={cx('cell', 'closed')}>
          <img
            src="/themes/blue-graphite/icons/Flag.svg"
            alt=""
            className={cx('icon')}
          />
        </span>
      )}

      {variant === 'question' && (
        <span className={cx('cell', 'closed')}>
          <img
            src="/themes/blue-graphite/icons/Question.png"
            alt=""
            className={cx('icon')}
          />
        </span>
      )}
    </span>
  );
};

export default CellExample;
