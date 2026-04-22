import {
  memo,
  MouseEvent,
  PointerEvent,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '@/store/game';
import {
  selectIsLevelChangeDialogOpen,
  selectGameStatusBeforeLevelChange,
} from '@/store/game/selectors';
import { selectZoom } from '@/store/settings/selectors';
import { useSettingsStore } from '@/store/settings';
import { handleCellInteraction } from '@/utils/board';
import { createCx, throttle } from '@/utils';
import PauseOverlay from '../PauseOverlay';
import SvgCell from '../SvgCell';
import SvgDefs from './defs/SvgDefs';
import { usePanViewport } from './hooks/usePanViewport';
import styles from './styles.module.scss';
import BoardWrapper from './BoardWrapper';

const cx = createCx(styles);
const CELL_SELECTOR = '[data-cell]';
const BASE_CELL_REM = 2.125;
const REM_PX = 16;
const GAP = 2;
const BOARD_PADDING = 16;
const TOUCH_PAN_THRESHOLD = 10;

const getRowAndCellIndex = (
  e: PointerEvent<SVGSVGElement> | MouseEvent<SVGSVGElement>,
): { rowIndex: number; cellIndex: number } | undefined => {
  const element = e.target as Element | null;

  if (!element || typeof element.closest !== 'function') {
    return undefined;
  }

  const cellElement = element.closest(CELL_SELECTOR);

  if (!cellElement) {
    return undefined;
  }

  const row = cellElement.getAttribute('data-row');
  const cell = cellElement.getAttribute('data-cell');

  if (row === null || cell === null) {
    return undefined;
  }

  const rowIndex = parseInt(row);
  const cellIndex = parseInt(cell);

  if (isNaN(rowIndex) || isNaN(cellIndex)) {
    return undefined;
  }

  return { rowIndex, cellIndex };
};

const Board = ({ gameFooterHeight }: { gameFooterHeight: number }) => {
  const { board, rows, cols, gameStatus } = useGameStore(
    useShallow((state) => ({
      board: state.board,
      rows: state.level.rows,
      cols: state.level.cols,
      gameStatus: state.gameStatus,
    })),
  );
  const isLevelChangeDialogOpen = useGameStore(selectIsLevelChangeDialogOpen);
  const gameStatusBeforeLevelChange = useGameStore(
    selectGameStatusBeforeLevelChange,
  );
  const zoom = useSettingsStore(selectZoom);

  const cellSize = useMemo(
    () => Math.round(BASE_CELL_REM * REM_PX * zoom),
    [zoom],
  );
  const gridW = cols * cellSize + Math.max(0, cols - 1) * GAP;
  const gridH = rows * cellSize + Math.max(0, rows - 1) * GAP;
  const contentW = gridW + BOARD_PADDING * 2;
  const contentH = gridH + BOARD_PADDING * 2;

  const pan = usePanViewport({ contentW, contentH });

  const shouldShowPauseOverlay =
    gameStatus === 'paused' &&
    !(isLevelChangeDialogOpen && gameStatusBeforeLevelChange === 'playing');

  const dispatchCellInteraction = (
    e: PointerEvent<SVGSVGElement> | MouseEvent<SVGSVGElement>,
  ) => {
    const indexes = getRowAndCellIndex(e);

    if (!indexes) return;

    handleCellInteraction({
      e: e.nativeEvent as unknown as globalThis.PointerEvent,
      row: indexes.rowIndex,
      col: indexes.cellIndex,
    });
  };

  // Touch gestures begin as cell interactions (tap/long-press). If the
  // finger moves beyond a small threshold we cancel the cell sequence and
  // promote the pointer to a pan gesture so the user can scroll the board.
  const deferredTouchRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    row: number;
    col: number;
  } | null>(null);

  const cancelDeferredCellInteraction = (row: number, col: number) => {
    handleCellInteraction({
      e: { type: 'pointercancel' } as unknown as globalThis.PointerEvent,
      row,
      col,
    });
  };

  // Keep a ref to the latest handler so the throttled wrapper always
  // calls the current closure without being recreated on every render.
  const pointerMoveForCellRef = useRef(dispatchCellInteraction);
  useEffect(() => {
    pointerMoveForCellRef.current = dispatchCellInteraction;
  });

  const throttledCellPointerMove = useRef(
    throttle(
      (e: PointerEvent<SVGSVGElement>) => pointerMoveForCellRef.current(e),
      100,
    ),
  ).current;

  const onPointerDown = (e: PointerEvent<SVGSVGElement>) => {
    const indexes = getRowAndCellIndex(e);

    if (!indexes) {
      pan.startPan(e);

      return;
    }

    if (e.pointerType === 'touch') {
      deferredTouchRef.current = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        row: indexes.rowIndex,
        col: indexes.cellIndex,
      };
    }

    dispatchCellInteraction(e);
  };

  const onPointerMove = (e: PointerEvent<SVGSVGElement>) => {
    if (pan.isPanning(e.pointerId)) {
      pan.updatePan(e);

      return;
    }

    const deferred = deferredTouchRef.current;

    if (deferred && deferred.pointerId === e.pointerId) {
      const dx = e.clientX - deferred.startX;
      const dy = e.clientY - deferred.startY;

      if (Math.hypot(dx, dy) > TOUCH_PAN_THRESHOLD) {
        cancelDeferredCellInteraction(deferred.row, deferred.col);
        deferredTouchRef.current = null;
        pan.startPan(e);

        return;
      }
    }

    if (gameStatus === 'playing' || gameStatus === 'idle') {
      throttledCellPointerMove(e);
    }
  };

  const onPointerUp = (e: PointerEvent<SVGSVGElement>) => {
    if (pan.isPanning(e.pointerId)) {
      pan.endPan(e);

      return;
    }

    if (deferredTouchRef.current?.pointerId === e.pointerId) {
      deferredTouchRef.current = null;
    }

    dispatchCellInteraction(e);
  };

  const onPointerCancel = (e: PointerEvent<SVGSVGElement>) => {
    if (pan.isPanning(e.pointerId)) {
      pan.endPan(e);

      return;
    }

    if (deferredTouchRef.current?.pointerId === e.pointerId) {
      deferredTouchRef.current = null;
    }

    dispatchCellInteraction(e);
  };

  const onContextMenu = (e: MouseEvent<SVGSVGElement>) => {
    dispatchCellInteraction(e);
  };

  return (
    <BoardWrapper gameFooterHeight={gameFooterHeight}>
      <div ref={pan.wrapperRef} className={cx('panWrapper')}>
        <svg
          className={cx('svgRoot')}
          width={contentW}
          height={contentH}
          viewBox={`0 0 ${contentW} ${contentH}`}
          preserveAspectRatio="xMinYMin meet"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
          onContextMenu={onContextMenu}
          onWheel={pan.onWheel}
        >
          <SvgDefs />

          <g transform={`translate(${pan.translate.x} ${pan.translate.y})`}>
            <rect
              className={cx('panBackground')}
              x={0}
              y={0}
              width={contentW}
              height={contentH}
            />

            {board.map((row, rowIndex) =>
              row.map((cell, cellIndex) => (
                <SvgCell
                  key={`${rowIndex}-${cellIndex}`}
                  rowIndex={rowIndex}
                  cellIndex={cellIndex}
                  value={cell.value}
                  isOpened={cell.isOpened}
                  marker={cell.marker}
                  highlight={
                    (cell as { highlight?: 'red' | 'green' }).highlight
                  }
                  x={BOARD_PADDING + cellIndex * (cellSize + GAP)}
                  y={BOARD_PADDING + rowIndex * (cellSize + GAP)}
                  cellSize={cellSize}
                  zoom={zoom}
                />
              )),
            )}
          </g>
        </svg>

        {shouldShowPauseOverlay && <PauseOverlay />}
      </div>
    </BoardWrapper>
  );
};

Board.displayName = 'Board';

export default memo(Board);
