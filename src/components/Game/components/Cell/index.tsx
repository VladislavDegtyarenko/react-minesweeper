import { memo } from 'react';
import styles from './styles.module.scss';
import { createCx } from '@/utils';
import { useGameStore } from '@/store/game';
import { useShallow } from 'zustand/react/shallow';
import type { OpenedMineCell } from '@/types';
import { CELL_MARKERS, CELL_NUMBERS_COLORS } from '@/constants';
import Bomb from './components/Bomb';
import Number from './components/Number';
import Cross from './components/Cross';
import Overlay from './components/Overlay';
import Flag from './components/Flag';
import QuestionMark from './components/Question';

const cx = createCx(styles);

type Props = {
  rowIndex: number;
  cellIndex: number;
};

const Cell = (props: Props) => {
  const { rowIndex, cellIndex } = props;

  const { value, isOpened, marker, highlight } = useGameStore(
    useShallow((state) => {
      const cell = state.board[rowIndex][cellIndex];

      return {
        value: cell.value,
        isOpened: cell.isOpened,
        marker: cell.marker,
        highlight: (cell as OpenedMineCell).highlight,
      };
    }),
  );

  const isMine = value === 'mine';
  const isFlagged = marker === CELL_MARKERS.FLAG;
  const isQuestionMarked = marker === CELL_MARKERS.QUESTION;
  const cellNumberClass =
    typeof value === 'number' ? CELL_NUMBERS_COLORS[value] : null;

  return (
    <div
      className={cx(
        'cell',
        cellNumberClass || undefined,
        highlight === 'red' && 'red',
      )}
      data-row={rowIndex}
      data-cell={cellIndex}
    >
      {isMine && isOpened && <Bomb />}

      {typeof value === 'number' && isOpened && <Number value={value} />}

      {!isOpened && (
        <Overlay isMine={value === 'mine'} highlight={highlight}>
          {isFlagged && <Flag />}
          {isQuestionMarked && <QuestionMark />}
        </Overlay>
      )}

      <Cross isFlagged={isFlagged} isMine={isMine} />
    </div>
  );
};

Cell.displayName = 'Cell';

export default memo(Cell);
