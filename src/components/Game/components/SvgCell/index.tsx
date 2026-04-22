import { memo } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/game';
import { selectIsGameLost } from '@/store/game/selectors';
import { CELL_MARKERS, CELL_NUMBERS_COLORS } from '@/constants';
import type { CellMarkerState, GameCell } from '@/types';
import { createCx } from '@/utils';
import styles from './styles.module.scss';

const cx = createCx(styles);

type Props = {
  rowIndex: number;
  cellIndex: number;
  value: GameCell['value'];
  isOpened: boolean;
  marker: CellMarkerState;
  highlight: 'red' | 'green' | undefined;
  x: number;
  y: number;
  cellSize: number;
  zoom: number;
};

const ICON_RATIO = 0.68;
const NUMBER_FONT_RATIO = 0.58;
const CELL_RADIUS = 8;

const SvgCell = (props: Props) => {
  const {
    rowIndex,
    cellIndex,
    value,
    isOpened,
    marker,
    highlight,
    x,
    y,
    cellSize,
    zoom,
  } = props;

  const isLost = useGameStore(selectIsGameLost);

  const isMine = value === 'mine';
  const isFlagged = marker === CELL_MARKERS.FLAG;
  const isQuestionMarked = marker === CELL_MARKERS.QUESTION;
  const isFlagNotCorrect = isLost && isFlagged && !isMine;
  const cellNumberClass =
    typeof value === 'number' ? CELL_NUMBERS_COLORS[value] : null;

  const iconSize = cellSize * ICON_RATIO;
  const iconOffset = (cellSize - iconSize) / 2;
  const center = cellSize / 2;

  const baseFillClass =
    isOpened && isMine && highlight === 'red' ? 'baseRed' : 'base';

  return (
    <g
      className={cx('cell')}
      data-row={rowIndex}
      data-cell={cellIndex}
      transform={`translate(${x} ${y})`}
    >
      <rect
        className={cx('baseRect', baseFillClass)}
        width={cellSize}
        height={cellSize}
        rx={CELL_RADIUS}
        ry={CELL_RADIUS}
      />

      {isOpened && isMine && (
        <use
          className={cx('bomb')}
          href="#icon-bomb"
          x={iconOffset}
          y={iconOffset}
          width={iconSize}
          height={iconSize}
        />
      )}

      {isOpened && typeof value === 'number' && value > 0 && (
        <text
          className={cx('number', cellNumberClass || undefined)}
          x={center}
          y={center}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={cellSize * NUMBER_FONT_RATIO}
        >
          {value}
        </text>
      )}

      {!isOpened && (
        <g
          className={cx(
            'overlay',
            isMine && highlight === 'red' && 'overlayRed',
            isMine && highlight === 'green' && 'overlayGreen',
          )}
        >
          <rect
            className={cx('overlayRect')}
            width={cellSize}
            height={cellSize}
            rx={CELL_RADIUS}
            ry={CELL_RADIUS}
          />

          {isFlagged && (
            <motion.g
              initial={{ opacity: 0, y: -50 * zoom }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
            >
              <use
                href="#icon-flag"
                x={iconOffset}
                y={iconOffset}
                width={iconSize}
                height={iconSize}
              />
            </motion.g>
          )}

          {isQuestionMarked && (
            <motion.g
              initial={{ opacity: 0, y: -50 * zoom }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
            >
              <use
                href="#icon-question"
                x={iconOffset}
                y={iconOffset}
                width={iconSize}
                height={iconSize}
              />
            </motion.g>
          )}
        </g>
      )}

      {isFlagNotCorrect && (
        <use
          className={cx('cross')}
          href="#icon-cross"
          x={0}
          y={0}
          width={cellSize}
          height={cellSize}
        />
      )}
    </g>
  );
};

SvgCell.displayName = 'SvgCell';

export default memo(SvgCell);
