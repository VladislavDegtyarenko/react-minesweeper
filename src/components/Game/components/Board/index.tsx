import { CSSProperties, memo, PointerEvent, MouseEvent, useRef, useEffect } from 'react';
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
import Row from '../Row';
import PauseOverlay from '../PauseOverlay';
import styles from './styles.module.scss';
import BoardWrapper from './BoardWrapper';

const cx = createCx(styles);
const CELL_SELECTOR = '[data-cell]';

const Board = ({ gameFooterHeight }: { gameFooterHeight: number }) => {
  const { rows, gameStatus } = useGameStore(
    useShallow((state) => ({
      rows: state.level.rows,
      gameStatus: state.gameStatus,
    })),
  );
  const isLevelChangeDialogOpen = useGameStore(selectIsLevelChangeDialogOpen);
  const gameStatusBeforeLevelChange = useGameStore(
    selectGameStatusBeforeLevelChange,
  );
  const zoom = useSettingsStore(selectZoom);
  const shouldShowPauseOverlay =
    gameStatus === 'paused' &&
    !(isLevelChangeDialogOpen && gameStatusBeforeLevelChange === 'playing');

  const getRowAndCellIndex = (
    e: PointerEvent<HTMLDivElement>,
  ): { rowIndex: number; cellIndex: number } | undefined => {
    const element = e.target as HTMLElement;
    const cellElement = element.closest(CELL_SELECTOR);

    if (!cellElement || !(cellElement instanceof HTMLElement)) {
      return undefined;
    }

    const { row, cell } = cellElement.dataset;

    if (!row || !cell) {
      return undefined;
    }

    const rowIndex = parseInt(row);
    const cellIndex = parseInt(cell);

    if (isNaN(rowIndex) || isNaN(cellIndex)) {
      return undefined;
    }

    return { rowIndex, cellIndex };
  };

  const onPointerEvent = (e: PointerEvent<HTMLDivElement>) => {
    const indexes = getRowAndCellIndex(e);

    if (!indexes) return;

    const { rowIndex, cellIndex } = indexes;

    handleCellInteraction({
      e: e.nativeEvent as unknown as globalThis.PointerEvent,
      row: rowIndex,
      col: cellIndex,
    });
  };

  // Keep a ref to the latest onPointerEvent so the throttled handler always
  // calls the current closure without being recreated on every render.
  const onPointerEventRef = useRef(onPointerEvent);
  useEffect(() => {
    onPointerEventRef.current = onPointerEvent;
  });

  // Created once; never re-instantiated, so throttle state survives re-renders.
  const throttledPointerMove = useRef(
    throttle((e: PointerEvent<HTMLDivElement>) => onPointerEventRef.current(e), 100),
  ).current;

  const onContextMenu = (e: MouseEvent<HTMLDivElement>) => {
    const indexes = getRowAndCellIndex(
      e as unknown as PointerEvent<HTMLDivElement>,
    );

    if (!indexes) return;

    const { rowIndex, cellIndex } = indexes;

    handleCellInteraction({
      e: e.nativeEvent as unknown as globalThis.PointerEvent,
      row: rowIndex,
      col: cellIndex,
    });
  };

  return (
    <BoardWrapper gameFooterHeight={gameFooterHeight}>
      <div
        className={cx('boardScrollable', 'board')}
        style={
          {
            '--cell-size': `${2.125 * zoom}rem`,
          } as CSSProperties
        }
        onPointerDown={onPointerEvent}
        onPointerUp={onPointerEvent}
        onPointerMove={
          gameStatus === 'playing' || gameStatus === 'idle'
            ? throttledPointerMove
            : undefined
        }
        onContextMenu={onContextMenu}
      >
        {Array.from({ length: rows }, (_, rowIndex) => (
          <Row rowIndex={rowIndex} key={rowIndex} />
        ))}

        {shouldShowPauseOverlay && <PauseOverlay />}
      </div>
    </BoardWrapper>
  );
};

Board.displayName = 'Board';

export default memo(Board);
