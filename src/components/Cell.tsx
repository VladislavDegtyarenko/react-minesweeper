// Core
import { memo, useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { useShallow } from 'zustand/react/shallow';
import { CELL_NUMBERS_COLORS } from '../constants';
import { CELL_MARKERS } from '@/constants';

import type { OpenedMineCell } from '../types';
import { useGameStore } from '@/store/game';

type Props = {
  rowIndex: number;
  cellIndex: number;
};

const Cell = (props: Props) => {
  const { rowIndex, cellIndex } = props;

  // Subscribe to individual primitive values to prevent re-renders when other cells change
  const { value, isOpened, marker, highlight, levelId, gameStatus } =
    useGameStore(
      useShallow((state) => {
        const cell = state.board[rowIndex][cellIndex];

        return {
          value: cell.value,
          isOpened: cell.isOpened,
          marker: cell.marker,
          highlight: (cell as OpenedMineCell).highlight,
          levelId: state.level.id,
          gameStatus: state.gameStatus,
        };
      }),
    );

  const isFlagged = marker === CELL_MARKERS.FLAG;
  const isQuestionMarked = marker === CELL_MARKERS.QUESTION;

  const [isMarkerToggled, setIsMarkerToggled] = useState(Boolean(marker));
  const previousMarker = useRef(marker);
  const shouldAnimate = isMarkerToggled;

  useEffect(() => {
    if (previousMarker.current !== marker && !isMarkerToggled) {
      setIsMarkerToggled(true);
      previousMarker.current = marker;
    }
  }, [isMarkerToggled, marker]);

  const isFlagNotCorrect =
    gameStatus === 'lost' && isFlagged && value !== 'mine';

  return (
    <div
      className={clsx(
        'cell',
        typeof value === 'number' && isOpened && CELL_NUMBERS_COLORS[value],
        gameStatus === 'lost' && highlight === 'red' && 'red',
      )}
      data-row={rowIndex}
      data-cell={cellIndex}
    >
      {value === 'mine' && isOpened && <img src="/icons/bomb.svg" alt="mine" />}

      {typeof value === 'number' && isOpened && <>{value || ''}</>}

      {!isOpened && !isFlagNotCorrect && (
        <div
          className={clsx('overlay', value === 'mine' && isOpened && highlight)}
        >
          {isFlagged && <img src="/red-flag.png" alt="flag" />}
          {isQuestionMarked && <span className="question-mark">?</span>}
        </div>
      )}

      {isFlagNotCorrect && (
        <>
          <img src="/icons/bomb.svg" alt="mine" />
          <img src="/icons/cross.svg" alt="cross" className="cross-flag" />
        </>
      )}
    </div>
  );
};

Cell.displayName = 'Cell';

export default memo(Cell);
