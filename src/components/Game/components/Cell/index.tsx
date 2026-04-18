import { memo } from 'react';
import styles from './styles.module.scss';
import { createCx } from '@/utils';
import { CELL_MARKERS, CELL_NUMBERS_COLORS } from '@/constants';
import type { CellView } from '@/utils/board/types';
import Bomb from './components/Bomb';
import Number from './components/Number';
import Cross from './components/Cross';
import Overlay from './components/Overlay';
import Flag from './components/Flag';
import QuestionMark from './components/Question';

const cx = createCx(styles);

type Props = {
  cell: CellView;
};

const Cell = ({ cell }: Props) => {
  const { highlight, isMine, isOpened, marker, showIncorrectFlag, value } =
    cell;
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
      data-row={cell.row}
      data-cell={cell.col}
    >
      {isMine && isOpened && <Bomb />}

      {typeof value === 'number' && isOpened && <Number value={value} />}

      {!isOpened && (
        <Overlay isMine={value === 'mine'} highlight={highlight}>
          {isFlagged && <Flag />}
          {isQuestionMarked && <QuestionMark />}
        </Overlay>
      )}

      <Cross showIncorrectFlag={showIncorrectFlag} />
    </div>
  );
};

Cell.displayName = 'Cell';

export default memo(Cell);
