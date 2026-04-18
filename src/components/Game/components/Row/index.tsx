import { useGameStore } from '@/store/game';
import { useShallow } from 'zustand/react/shallow';
import { memo } from 'react';
import Cell from '../Cell';
import styles from './styles.module.scss';
import { createCx } from '@/utils';

const cx = createCx(styles);

type Props = {
  rowIndex: number;
  cols: number;
};

const Row = ({ rowIndex, cols }: Props) => {
  const rowStart = rowIndex * cols;
  const rowEnd = rowStart + cols;
  const cellViews = useGameStore(
    useShallow((state) => state.board.cellViews.slice(rowStart, rowEnd)),
  );

  return (
    <div className={cx('row')}>
      {cellViews.map((cell) => {
        return <Cell cell={cell} key={cell.index} />;
      })}
    </div>
  );
};

Row.displayName = 'Row';

export default memo(Row);
