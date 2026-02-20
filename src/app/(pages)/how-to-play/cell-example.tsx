import classNames from 'classnames/bind';
import styles from './cell-example.module.scss';

const cx = classNames.bind(styles);

type Props = {
  variant: 'safe' | 'mine' | 'flag';
};

const CellExample = ({ variant }: Props) => {
  return (
    <span className={cx('cellWrap')} aria-hidden="true">
      {variant === 'safe' && <span className={cx('cell', 'opened', 'two')}>2</span>}

      {variant === 'mine' && (
        <span className={cx('cell', 'opened')}>
          <img src="/icons/bomb.svg" alt="" className={cx('icon')} />
        </span>
      )}

      {variant === 'flag' && (
        <span className={cx('cell', 'closed')}>
          <img src="/red-flag.png" alt="" className={cx('icon')} />
        </span>
      )}
    </span>
  );
};

export default CellExample;
