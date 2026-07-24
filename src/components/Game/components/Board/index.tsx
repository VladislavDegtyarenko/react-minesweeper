import { memo, useEffect, useRef, type PointerEvent } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '@/store/game';
import {
  selectIsLevelChangeDialogOpen,
  selectGameStatusBeforeLevelChange,
} from '@/store/game/selectors';
import {
  beginBoardInteraction,
  endBoardInteraction,
  resetBoardInteraction,
} from '@/components/Game/utils/boardInteraction';
import { selectZoom } from '@/store/settings/selectors';
import { useSettingsStore } from '@/store/settings';
import Row from '../Row';
import PauseOverlay from '../PauseOverlay';
import BoardWrapper from './BoardWrapper';
import { useBoardScrollHints } from '../ScrollHints/hooks/useBoardScrollHints';
import { useBoardPointerHandlers } from '../ScrollHints/hooks/useBoardPointerHandlers';
import { getCellSize } from './utils';
import ScrollHints from '../ScrollHints';
import BoardFrame from '../BoardFrame';
import { useBoardPinchZoom } from './hooks/useBoardPinchZoom';
import styles from './styles.module.scss';

type Props = {
  dailyCardHeight: number;
  gameFooterHeight: number;
};

const Board = ({ dailyCardHeight, gameFooterHeight }: Props) => {
  const { cols, rows, gameStatus } = useGameStore(
    useShallow((state) => ({
      cols: state.level.cols,
      rows: state.level.rows,
      gameStatus: state.gameStatus,
    })),
  );
  const isLevelChangeDialogOpen = useGameStore(selectIsLevelChangeDialogOpen);
  const gameStatusBeforeLevelChange = useGameStore(
    selectGameStatusBeforeLevelChange,
  );
  const boardContentRef = useRef<HTMLDivElement>(null);
  const boardSurfaceRef = useRef<HTMLDivElement>(null);
  const zoom = useSettingsStore(selectZoom);
  const cellSize = getCellSize(zoom);
  const { boardRef, scrollHintsRef } = useBoardScrollHints({
    layoutKey: `${cols}|${rows}|${zoom}|${dailyCardHeight}|${gameFooterHeight}`,
  });
  const { onContextMenu, onPointerEvent, throttledPointerMove } =
    useBoardPointerHandlers({ gameStatus });
  const pinchZoomHandlers = useBoardPinchZoom({
    boardRef,
    contentRef: boardContentRef,
    surfaceRef: boardSurfaceRef,
  });
  const shouldShowPauseOverlay =
    gameStatus === 'paused' &&
    !(isLevelChangeDialogOpen && gameStatusBeforeLevelChange === 'playing');
  const isInteractive = gameStatus === 'playing' || gameStatus === 'idle';

  useEffect(() => {
    return resetBoardInteraction;
  }, []);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    beginBoardInteraction();

    if (pinchZoomHandlers.onPointerDown(event) || !isInteractive) {
      return;
    }

    onPointerEvent(event);
  };
  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (pinchZoomHandlers.onPointerMove(event) || !isInteractive) {
      return;
    }

    throttledPointerMove(event);
  };
  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    endBoardInteraction();

    if (pinchZoomHandlers.onPointerUp(event) || !isInteractive) {
      return;
    }

    onPointerEvent(event);
  };
  const handlePointerCancel = (event: PointerEvent<HTMLDivElement>) => {
    endBoardInteraction();

    if (pinchZoomHandlers.onPointerCancel(event) || !isInteractive) {
      return;
    }

    onPointerEvent(event);
  };

  return (
    <BoardWrapper
      cellSize={cellSize}
      dailyCardHeight={dailyCardHeight}
      gameFooterHeight={gameFooterHeight}
      zoom={zoom}
    >
      <BoardFrame
        ref={boardRef}
        data-tour-id="board"
        isPaused={gameStatus === 'paused'}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
        onPointerCancel={handlePointerCancel}
        onContextMenu={isInteractive ? onContextMenu : undefined}
      >
        <div ref={boardContentRef} className={styles.boardContent}>
          <div ref={boardSurfaceRef} className={styles.boardPinchSurface}>
            {Array.from({ length: rows }, (_, rowIndex) => (
              <Row rowIndex={rowIndex} key={rowIndex} />
            ))}
          </div>
        </div>
      </BoardFrame>

      {shouldShowPauseOverlay && <PauseOverlay />}

      <ScrollHints ref={scrollHintsRef} />
    </BoardWrapper>
  );
};

Board.displayName = 'Board';

export default memo(Board);
