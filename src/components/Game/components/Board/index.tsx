import { memo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '@/store/game';
import {
  selectIsLevelChangeDialogOpen,
  selectGameStatusBeforeLevelChange,
} from '@/store/game/selectors';
import { selectZoom } from '@/store/settings/selectors';
import { useSettingsStore } from '@/store/settings';
import { createCx } from '@/utils';
import Row from '../Row';
import PauseOverlay from '../PauseOverlay';
import styles from './styles.module.scss';
import BoardWrapper from './BoardWrapper';
import { useBoardScrollHints } from '../ScrollHints/hooks/useBoardScrollHints';
import { useBoardPointerHandlers } from '../ScrollHints/hooks/useBoardPointerHandlers';
import { getCellSize } from './utils';
import ScrollHints from '../ScrollHints';

const cx = createCx(styles);

const Board = ({ gameFooterHeight }: { gameFooterHeight: number }) => {
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
    layoutKey: `${cols}|${rows}|${zoom}|${gameFooterHeight}`,
  });
  const { onContextMenu, onPointerEvent, throttledPointerMove } =
    useBoardPointerHandlers({ gameStatus });
  const shouldShowPauseOverlay =
    gameStatus === 'paused' &&
    !(isLevelChangeDialogOpen && gameStatusBeforeLevelChange === 'playing');
  const isInteractive = gameStatus === 'playing' || gameStatus === 'idle';

  return (
    <BoardWrapper cellSize={cellSize} gameFooterHeight={gameFooterHeight}>
      <div
        ref={boardRef}
        className={cx(
          'boardScrollable',
          'board',
          gameStatus === 'paused' && 'pausedBoard',
        )}
        onScroll={onScroll}
        onPointerDown={onPointerEvent}
        onPointerUp={onPointerEvent}
        onPointerMove={isInteractive ? throttledPointerMove : undefined}
        onContextMenu={onContextMenu}
      >
        {Array.from({ length: rows }, (_, rowIndex) => (
          <Row rowIndex={rowIndex} key={rowIndex} />
        ))}
      </div>

      {shouldShowPauseOverlay && <PauseOverlay />}

      <ScrollHints scrollHints={scrollHints} />
    </BoardWrapper>
  );
};

Board.displayName = 'Board';

export default memo(Board);
