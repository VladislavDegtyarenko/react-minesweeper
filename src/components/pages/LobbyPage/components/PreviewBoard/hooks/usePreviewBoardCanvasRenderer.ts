import { useLayoutEffect, useRef, type RefObject } from 'react';
import {
  createBoardResultHighlightTweens,
  drawBoard,
  getBoardCanvasMetrics,
  readBoardCanvasTheme,
  sampleBoardResultHighlightTweens,
  subscribeBoardCanvasThemeChanges,
  syncBoardResultHighlightTweens,
  type BoardCellInteractionFrame,
  type BoardMarkerAnimation,
} from '@/components/Game/components/Board/renderer';
import { useBoardCanvasAssets } from '@/hooks/useBoardCanvasAssets';
import { useBoardCanvasFontReady } from '@/hooks/useBoardCanvasFontReady';
import type { TBoard } from '@/types';

const EMPTY_INTERACTIONS = new Map<string, BoardCellInteractionFrame>();
const EMPTY_MARKER_ANIMATIONS = new Map<string, BoardMarkerAnimation>();
const PREVIEW_CELL_BORDER_WIDTH_PX = 1;
const PREVIEW_CELL_GAP_RATIO = 0.005;
const PREVIEW_REFERENCE_WIDTH_PX = 400;

type Options = {
  board: TBoard;
  canvasRef: RefObject<HTMLCanvasElement>;
};

export function usePreviewBoardCanvasRenderer({
  board,
  canvasRef,
}: Options): boolean {
  const { areAssetsReady, assets } = useBoardCanvasAssets();
  const requestRenderRef = useRef<() => void>(() => undefined);
  const themeRef = useRef<ReturnType<typeof readBoardCanvasTheme> | null>(null);

  useBoardCanvasFontReady(() => requestRenderRef.current());

  useLayoutEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return undefined;
    }

    const activeCanvas = canvas;
    const resultHighlightTweens = createBoardResultHighlightTweens();

    syncBoardResultHighlightTweens({
      board,
      isGameLost: false,
      now: 0,
      tweens: resultHighlightTweens,
    });

    const resultHighlightByCell = sampleBoardResultHighlightTweens(
      resultHighlightTweens,
      0,
    ).byCell;
    let animationFrameId: number | null = null;

    function renderFrame(timestamp: number) {
      animationFrameId = null;

      const cssHeight = activeCanvas.clientHeight;
      const cssWidth = activeCanvas.clientWidth;
      const metrics = getBoardCanvasMetrics({
        cssHeight,
        cssWidth,
        devicePixelRatio: window.devicePixelRatio,
      });

      if (!metrics) {
        return undefined;
      }

      if (activeCanvas.width !== metrics.backingWidth) {
        activeCanvas.width = metrics.backingWidth;
      }

      if (activeCanvas.height !== metrics.backingHeight) {
        activeCanvas.height = metrics.backingHeight;
      }

      const context = activeCanvas.getContext('2d');

      if (!context) {
        return undefined;
      }

      const theme = themeRef.current ?? readBoardCanvasTheme(activeCanvas);
      const zoom = cssWidth / PREVIEW_REFERENCE_WIDTH_PX;

      themeRef.current = theme;
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, activeCanvas.width, activeCanvas.height);
      context.setTransform(metrics.scaleX, 0, 0, metrics.scaleY, 0, 0);
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';

      const drawResult = drawBoard({
        assets,
        board,
        cellBorderWidthPx: PREVIEW_CELL_BORDER_WIDTH_PX,
        cellInsetPx: (cssWidth * PREVIEW_CELL_GAP_RATIO) / 2,
        context,
        cssHeight,
        cssWidth,
        interactionByCell: EMPTY_INTERACTIONS,
        isGameLost: false,
        markerAnimations: EMPTY_MARKER_ANIMATIONS,
        now: timestamp,
        resultHighlightByCell,
        theme,
        viewport: {
          height: cssHeight,
          width: cssWidth,
          x: 0,
          y: 0,
        },
        zoom,
      });

      activeCanvas.dataset.previewBoardCanvasDpr = String(metrics.dpr);
      activeCanvas.dataset.previewBoardCanvasRendered = 'true';
      activeCanvas.dataset.previewBoardCanvasVisibleCells = String(
        drawResult.visibleCellCount,
      );
    }

    function requestRender() {
      if (animationFrameId === null) {
        animationFrameId = window.requestAnimationFrame(renderFrame);
      }
    }

    const resizeObserver = new ResizeObserver(requestRender);
    const unsubscribeThemeChanges = subscribeBoardCanvasThemeChanges(() => {
      themeRef.current = null;
      requestRender();
    });

    requestRenderRef.current = requestRender;
    resizeObserver.observe(activeCanvas);

    activeCanvas.addEventListener('contextrestored', requestRender);
    window.addEventListener('resize', requestRender);
    renderFrame(performance.now());

    return () => {
      if (requestRenderRef.current === requestRender) {
        requestRenderRef.current = () => undefined;
      }

      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }

      activeCanvas.removeEventListener('contextrestored', requestRender);
      window.removeEventListener('resize', requestRender);
      resizeObserver.disconnect();
      unsubscribeThemeChanges();
    };
  }, [assets, board, canvasRef]);

  return areAssetsReady;
}
