// Core
import { memo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { CELL_NUMBERS_COLORS, CELL_MARKERS } from '@/constants';
import type { OpenedMineCell } from '@/types';
import { useGameStore } from '@/store/game';
import styles from './styles.module.scss';
import { AnimatePresence, motion } from 'framer-motion';
import { selectZoom } from '@/store/settings/selectors';
import { useSettingsStore } from '@/store/settings';
import { createCx } from '@/utils';

const cx = createCx(styles);

type Props = {
  rowIndex: number;
  cellIndex: number;
};

const Cell = (props: Props) => {
  const { rowIndex, cellIndex } = props;

  const zoom = useSettingsStore(selectZoom);

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
          src="/themes/blue-graphite/icons/Bomb.png"
          alt="mine"
          className={cx('image', 'cellImage')}
        />
      )}

      {typeof value === 'number' && isOpened && <>{value || ''}</>}

      <AnimatePresence key="overlay">
        {!isOpened && !isFlagNotCorrect && (
          <motion.div
            className={cx('overlay', value === 'mine' && highlight)}
            exit={{ opacity: 0, scale: 1.25 * zoom }}
            transition={{ duration: 0.15 }}
          >
            <AnimatePresence key="flag">
              {isFlagged && (
                <motion.img
                  src="/themes/blue-graphite/icons/Flag.svg"
                  alt="flag"
                  className={cx('image', 'cellImage')}
                  initial={{ opacity: 0, y: -50 * zoom }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 25 * zoom }}
                  transition={{ duration: 0.15 }}
                />
              )}
            </AnimatePresence>
            <AnimatePresence key="question">
              {isQuestionMarked && (
                <motion.img
                  src="/themes/blue-graphite/icons/Question.png"
                  alt="question"
                  className={cx('image', 'cellImage')}
                  initial={{ opacity: 0, y: -50 * zoom }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 25 * zoom }}
                  transition={{ duration: 0.15 }}
                />
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {isFlagNotCorrect && (
        <>
          <img
            src="/themes/blue-graphite/icons/Bomb.png"
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
