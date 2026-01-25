// Core
import { memo, useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { useShallow } from 'zustand/react/shallow';
import { CELL_NUMBERS_COLORS } from '../constants';

import type { OpenedMineCell } from '../types';
import { useGameStore } from '@/store/game';

type Props = {
  rowIndex: number;
  cellIndex: number;
};

const Cell = (props: Props) => {
  const { rowIndex, cellIndex } = props;

  // Subscribe to individual primitive values to prevent re-renders when other cells change
  const { value, isOpened, isFlagged, highlight, levelId, gameStatus } =
    useGameStore(
      useShallow((state) => {
        const cell = state.board[rowIndex][cellIndex];

        return {
          value: cell.value,
          isOpened: cell.isOpened,
          isFlagged: cell.isFlagged,
          highlight: (cell as OpenedMineCell).highlight,
          levelId: state.level.id,
          gameStatus: state.gameStatus,
        };
      }),
    );

  const [isFlagToggled, setIsFlagToggled] = useState(false);
  const previousIsFlagged = useRef(isFlagged);
  const shouldAnimate = isFlagToggled;

  useEffect(() => {
    if (previousIsFlagged.current !== isFlagged && !isFlagToggled) {
      setIsFlagToggled(true);
      previousIsFlagged.current = isFlagged;
    }
  }, [isFlagged, isFlagToggled]);

  const isFlagNotCorrect =
    gameStatus === 'lost' && isFlagged && value !== 'mine';

  return (
    <div
      className={clsx(
        'cell',
        value === 'mine' && isOpened && highlight,
        typeof value === 'number' && isOpened && CELL_NUMBERS_COLORS[value],
      )}
      data-row={rowIndex}
      data-cell={cellIndex}
    >
      {value === 'mine' && isOpened && <img src="/icons/bomb.svg" alt="mine" />}

      {typeof value === 'number' && isOpened && <>{value || ''}</>}

      {!isOpened && !isFlagNotCorrect && (
        <div className="overlay">
          <img
            src="/red-flag.png"
            alt="flag"
            className={clsx(
              'flag',
              shouldAnimate && isFlagged === true && 'visible',
              shouldAnimate && isFlagged === false && 'hidden',
            )}
          />
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
