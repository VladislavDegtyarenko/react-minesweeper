import { useGameStore } from '@/store/game';
import Cell from '../Cell';
import { useShallow } from 'zustand/react/shallow';
import { memo } from 'react';

import styles from './styles.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);

const Row = ({ rowIndex }: { rowIndex: number }) => {
  const { cols } = useGameStore(
    useShallow((state) => ({
      cols: state.level.cols,
    })),
  );

  return (
    <div className={cx('row')} key={rowIndex}>
      {Array.from({ length: cols }, (_, cellIndex) => (
        <Cell rowIndex={rowIndex} cellIndex={cellIndex} key={cellIndex} />
      ))}
    </div>
  );
};

Row.displayName = 'Row';

export default memo(Row);
