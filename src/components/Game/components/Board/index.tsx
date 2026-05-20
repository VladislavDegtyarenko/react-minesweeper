import { memo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '@/store/game';
import {
  selectIsLevelChangeDialogOpen,
  selectGameStatusBeforeLevelChange,
} from '@/store/game/selectors';
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
  const zoom = useSettingsStore(selectZoom);
  const cellSize = getCellSize(zoom);
  const { boardRef, onScroll, scrollHints } = useBoardScrollHints({
    layoutKey: `${cols}|${rows}|${zoom}|${dailyCardHeight}|${gameFooterHeight}`,
  });
  const { onContextMenu, onPointerEvent, throttledPointerMove } =
    useBoardPointerHandlers({ gameStatus });
  const shouldShowPauseOverlay =
    gameStatus === 'paused' &&
    !(isLevelChangeDialogOpen && gameStatusBeforeLevelChange === 'playing');
  const isInteractive = gameStatus === 'playing' || gameStatus === 'idle';

  return (
    <BoardWrapper
      cellSize={cellSize}
      dailyCardHeight={dailyCardHeight}
      gameFooterHeight={gameFooterHeight}
    >
      <BoardFrame
        ref={boardRef}
        data-tour-id="board"
        isPaused={gameStatus === 'paused'}
        onScroll={onScroll}
        onPointerDown={isInteractive ? onPointerEvent : undefined}
        onPointerUp={isInteractive ? onPointerEvent : undefined}
        onPointerMove={isInteractive ? throttledPointerMove : undefined}
        onContextMenu={isInteractive ? onContextMenu : undefined}
      >
        {Array.from({ length: rows }, (_, rowIndex) => (
          <Row rowIndex={rowIndex} key={rowIndex} />
        ))}
      </BoardFrame>

      {shouldShowPauseOverlay && <PauseOverlay />}

      <ScrollHints scrollHints={scrollHints} />
    </BoardWrapper>
  );
};

Board.displayName = 'Board';

export default memo(Board);
