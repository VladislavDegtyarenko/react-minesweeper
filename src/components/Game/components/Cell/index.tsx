// Core
import { memo, useState, useEffect, useRef } from 'react';
import classNames from 'classnames/bind';
import { useShallow } from 'zustand/react/shallow';
import { CELL_NUMBERS_COLORS, CELL_MARKERS } from '@/constants';
import type { OpenedMineCell } from '@/types';
import { useGameStore } from '@/store/game';
import styles from './styles.module.scss';

const cx = classNames.bind(styles);

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
  const cellNumberClass =
    typeof value === 'number' && isOpened ? CELL_NUMBERS_COLORS[value] : null;

  return (
    <div
      className={cx(
        'cell',
        cellNumberClass || undefined,
        gameStatus === 'lost' && highlight === 'red' && 'red',
      )}
      data-row={rowIndex}
      data-cell={cellIndex}
    >
      {value === 'mine' && isOpened && (
        <img
          src="/icons/bomb.svg"
          alt="mine"
          className={cx('image', 'cellImage')}
        />
      )}

      {typeof value === 'number' && isOpened && <>{value || ''}</>}

      {!isOpened && !isFlagNotCorrect && (
        <div className={cx('overlay', value === 'mine' && highlight)}>
          {isFlagged && (
            <img
              src="/red-flag.png"
              alt="flag"
              className={cx('image', 'cellImage')}
            />
          )}
          {isQuestionMarked && <span className={cx('questionMark')}>?</span>}
        </div>
      )}

      {isFlagNotCorrect && (
        <>
          <img
            src="/icons/bomb.svg"
            alt="mine"
            className={cx('image', 'cellImage')}
          />
          <img
            src="/icons/cross.svg"
            alt="cross"
            className={cx('image', 'crossFlag')}
          />
        </>
      )}
    </div>
  );
};

Cell.displayName = 'Cell';

export default memo(Cell);
