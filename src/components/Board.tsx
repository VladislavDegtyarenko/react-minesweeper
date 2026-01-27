import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '@/store/game';
import { CSSProperties, memo, PointerEvent, MouseEvent } from 'react';
import Row from './Row';
import { selectZoom } from '@/store/settings/selectors';
import { useSettingsStore } from '@/store/settings';
import PauseOverlay from './PauseOverlay';
import { handleCellInteraction } from '@/utils/board';
import { throttle } from '@/utils';

const Board = () => {
  const { rows, gameStatus } = useGameStore(
    useShallow((state) => ({
      rows: state.level.rows,
      gameStatus: state.gameStatus,
    })),
  );

  const zoom = useSettingsStore(selectZoom);

  const getRowAndCellIndex = (
    e: PointerEvent<HTMLDivElement>,
  ): { rowIndex: number; cellIndex: number } | undefined => {
    const element = e.target as HTMLElement;
    const cellElement = element.closest('.cell');

    if (!cellElement || !(cellElement instanceof HTMLElement)) return;

    const { row, cell } = cellElement.dataset;

    if (!row || !cell) return;

    const rowIndex = parseInt(row);
    const cellIndex = parseInt(cell);

    if (isNaN(rowIndex) || isNaN(cellIndex)) return;

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

  const throttledPointerMove = throttle((e: PointerEvent<HTMLDivElement>) => {
    onPointerEvent(e);
  }, 100);

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
    <div
      className="board"
      style={
        {
          '--cell-size': `${2 * zoom}rem`,
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

      {gameStatus === 'paused' && <PauseOverlay />}
    </div>
  );
};

Board.displayName = 'Board';

export default memo(Board);
