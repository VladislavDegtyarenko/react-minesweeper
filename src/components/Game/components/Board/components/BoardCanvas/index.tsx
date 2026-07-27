import { useMemo, useRef, type CSSProperties, type RefObject } from 'react';
import { getBoardCanvasStyle } from '@/components/Game/components/Board/utils';
import { useBoardCanvasRenderer } from '@/components/Game/components/Board/hooks/useBoardCanvasRenderer';
import {
  BOARD_CANVAS_DESKTOP_BLEED_PX,
  BOARD_CANVAS_MOBILE_BLEED_PX,
  getBoardCanvasAccessibleLabel,
  type BoardCanvasInteractionState,
} from '@/components/Game/components/Board/renderer';
import type { TBoard } from '@/types';
import styles from './styles.module.scss';

type Props = BoardCanvasInteractionState & {
  board: TBoard;
  boardRef: RefObject<HTMLDivElement>;
  bleedFrameRef: RefObject<HTMLDivElement>;
  cols: number;
  isGameLost: boolean;
  renderLayerRef: RefObject<HTMLDivElement>;
  rows: number;
  surfaceRef: RefObject<HTMLDivElement>;
  zoom: number;
};

const BoardCanvas = ({
  board,
  boardRef,
  bleedFrameRef,
  cols,
  hoverSnapRevision,
  hoveredCell,
  isGameLost,
  pressSnapRevision,
  pressedCell,
  renderLayerRef,
  rows,
  surfaceRef,
  zoom,
}: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const accessibleLabel = useMemo(
    () =>
      getBoardCanvasAccessibleLabel({
        board,
        isGameLost,
      }),
    [board, isGameLost],
  );
  const areAssetsReady = useBoardCanvasRenderer({
    board,
    boardRef,
    bleedFrameRef,
    canvasRef,
    hoverSnapRevision,
    hoveredCell,
    isGameLost,
    pressSnapRevision,
    pressedCell,
    renderLayerRef,
    surfaceRef,
    zoom,
  });

  return (
    <div
      ref={bleedFrameRef}
      className={styles.bleedFrame}
      data-board-canvas-bleed-frame="true"
      style={
        {
          '--board-canvas-desktop-bleed': `${BOARD_CANVAS_DESKTOP_BLEED_PX}px`,
          '--board-canvas-mobile-bleed': `${BOARD_CANVAS_MOBILE_BLEED_PX}px`,
        } as CSSProperties
      }
    >
      <div
        ref={renderLayerRef}
        className={styles.renderLayer}
        data-board-render-layer="true"
      >
        <canvas
          ref={canvasRef}
          aria-label={accessibleLabel}
          className={styles.canvas}
          data-board-canvas="true"
          data-board-canvas-ready={areAssetsReady ? 'true' : 'false'}
          role="img"
        >
          Minesweeper game board
        </canvas>
        <div
          ref={surfaceRef}
          className={styles.surface}
          data-board-cols={cols}
          data-board-rows={rows}
          data-board-surface="true"
          style={getBoardCanvasStyle({ cols, rows, zoom })}
        />
      </div>
    </div>
  );
};

export default BoardCanvas;
