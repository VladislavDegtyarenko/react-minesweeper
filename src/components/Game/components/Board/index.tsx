import { memo, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '@/store/game';
import {
  selectIsLevelChangeDialogOpen,
  selectGameStatusBeforeLevelChange,
} from '@/store/game/selectors';
import { selectZoom } from '@/store/settings/selectors';
import { useSettingsStore } from '@/store/settings';
import BoardFrame from '@/components/Game/components/BoardFrame';
import PauseOverlay from '@/components/Game/components/PauseOverlay';
import ScrollHints from '@/components/Game/components/ScrollHints';
import { useBoardScrollHints } from '@/components/Game/components/ScrollHints/hooks/useBoardScrollHints';
import BoardWrapper from './BoardWrapper';
import { useBoardInputHandlers } from './hooks/useBoardInputHandlers';
import BoardCanvas from './components/BoardCanvas';
import styles from './styles.module.scss';

type Props = {
  dailyCardHeight: number;
  gameFooterHeight: number;
};

const Board = ({ dailyCardHeight, gameFooterHeight }: Props) => {
  const { board, cols, rows, gameStatus } = useGameStore(
    useShallow((state) => ({
      board: state.board,
      cols: state.level.cols,
      rows: state.level.rows,
      gameStatus: state.gameStatus,
    })),
  );
  const isLevelChangeDialogOpen = useGameStore(selectIsLevelChangeDialogOpen);
  const gameStatusBeforeLevelChange = useGameStore(
    selectGameStatusBeforeLevelChange,
  );
  const boardBleedFrameRef = useRef<HTMLDivElement>(null);
  const boardContentRef = useRef<HTMLDivElement>(null);
  const boardRenderLayerRef = useRef<HTMLDivElement>(null);
  const boardSurfaceRef = useRef<HTMLDivElement>(null);
  const zoom = useSettingsStore(selectZoom);
  const layoutKey = `${cols}|${rows}|${zoom}|${dailyCardHeight}|${gameFooterHeight}`;
  const { boardRef, scrollHintsRef } = useBoardScrollHints({
    layoutKey,
  });
  const boardInput = useBoardInputHandlers({
    boardRef,
    bleedFrameRef: boardBleedFrameRef,
    contentRef: boardContentRef,
    gameStatus,
    layoutKey,
    pinchSurfaceRef: boardRenderLayerRef,
    surfaceRef: boardSurfaceRef,
  });
  const shouldShowPauseOverlay =
    gameStatus === 'paused' &&
    !(isLevelChangeDialogOpen && gameStatusBeforeLevelChange === 'playing');

  return (
    <BoardWrapper
      dailyCardHeight={dailyCardHeight}
      gameFooterHeight={gameFooterHeight}
    >
      <BoardFrame
        ref={boardRef}
        data-board-frame="true"
        data-tour-id="board"
        isPaused={gameStatus === 'paused'}
        onPointerDown={boardInput.onPointerDown}
        onPointerUp={boardInput.onPointerUp}
        onPointerMove={boardInput.onPointerMove}
        onPointerCancel={boardInput.onPointerCancel}
        onPointerLeave={boardInput.onPointerLeave}
        onContextMenu={boardInput.onContextMenu}
        onScroll={boardInput.onScroll}
      >
        <div ref={boardContentRef} className={styles.boardContent}>
          <BoardCanvas
            board={board}
            boardRef={boardRef}
            bleedFrameRef={boardBleedFrameRef}
            cols={cols}
            hoverSnapRevision={boardInput.hoverSnapRevision}
            hoveredCell={boardInput.hoveredCell}
            isGameLost={gameStatus === 'lost'}
            pressSnapRevision={boardInput.pressSnapRevision}
            pressedCell={boardInput.pressedCell}
            renderLayerRef={boardRenderLayerRef}
            rows={rows}
            surfaceRef={boardSurfaceRef}
            zoom={zoom}
          />
        </div>
      </BoardFrame>

      {shouldShowPauseOverlay && <PauseOverlay />}

      <ScrollHints ref={scrollHintsRef} />
    </BoardWrapper>
  );
};

Board.displayName = 'Board';

export default memo(Board);
