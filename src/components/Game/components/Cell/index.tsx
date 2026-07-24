import { memo } from 'react';
import styles from './styles.module.scss';
import { createCx } from '@/utils';
import type { CellMarkerState, GameCell } from '@/types';
import { CELL_MARKERS, CELL_NUMBERS_COLORS } from '@/config';
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
  value: GameCell['value'];
  isOpened: boolean;
  marker: CellMarkerState;
  highlight: 'red' | 'green' | undefined;
  isGameLost?: boolean;
};

const Cell = (props: Props) => {
  const {
    rowIndex,
    cellIndex,
    value,
    isOpened,
    marker,
    highlight,
    isGameLost = false,
  } = props;

  const isMine = value === 'mine';
  const isFlagged = marker === CELL_MARKERS.FLAG;
  const isQuestionMarked = marker === CELL_MARKERS.QUESTION;
  const cellNumberClass =
    typeof value === 'number' ? CELL_NUMBERS_COLORS[value] : null;

  return (
    <span
      className={cx('cell')}
      data-row={rowIndex}
      data-cell={cellIndex}
      data-tour-cell={`${rowIndex}-${cellIndex}`}
    >
      <span
        className={cx(
          'cellSurface',
          cellNumberClass || undefined,
          highlight === 'red' && 'red',
        )}
      >
        {isMine && isOpened && <Bomb />}

        {typeof value === 'number' && isOpened && <Number value={value} />}

        {!isOpened && (
          <Overlay isMine={value === 'mine'} highlight={highlight}>
            {isFlagged && <Flag />}
            {isQuestionMarked && <QuestionMark />}
          </Overlay>
        )}

        <Cross isGameLost={isGameLost} isFlagged={isFlagged} isMine={isMine} />
      </span>
    </span>
  );
};

Cell.displayName = 'Cell';

export default memo(Cell);
