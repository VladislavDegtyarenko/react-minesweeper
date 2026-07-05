import { useGameStore } from '@/store/game';
import { selectIsGameLost } from '@/store/game/selectors';
import Cell from '../Cell';
import { memo } from 'react';
import type { OpenedMineCell } from '@/types';

import styles from './styles.module.scss';
import { createCx } from '@/utils';

const cx = createCx(styles);

const Row = ({ rowIndex }: { rowIndex: number }) => {
  // Subscribes to the row array reference directly (no useShallow needed).
  // Immer structural sharing guarantees this reference is stable when no cell
  // in this row changed — so Row only re-renders when its own cells are affected.
  const row = useGameStore((state) => state.board[rowIndex]);
  const isGameLost = useGameStore(selectIsGameLost);

  if (!row) return null;

  return (
    <div className={cx('row')}>
      {row.map((cell, cellIndex) => (
        <Cell
          key={cellIndex}
          rowIndex={rowIndex}
          cellIndex={cellIndex}
          value={cell.value}
          isOpened={cell.isOpened}
          marker={cell.marker}
          highlight={(cell as OpenedMineCell).highlight}
          isGameLost={isGameLost}
        />
      ))}
    </div>
  );
};

Row.displayName = 'Row';

export default memo(Row);
