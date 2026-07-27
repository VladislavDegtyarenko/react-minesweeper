import type { CellMarker, TBoard } from '@/types';
import { recordBoardCanvasDraw } from '@/components/Game/debug/pinchPerf';
import { useBoardCanvasAssets } from '@/hooks/useBoardCanvasAssets';
import { useBoardCanvasFontReady } from '@/hooks/useBoardCanvasFontReady';
import { BOARD_VIEWPORT_CHANGE_EVENT } from '../constants';
import {
  createBoardInteractionTweens,
  createBoardResultHighlightTweens,
  drawBoard,
  getBoardCanvasCamera,
  getBoardCanvasDirtyRegion,
  getBoardCanvasMetrics,
  getBoardCellAnimationKey,
  getBoardInteractionDirtyViewport,
  isBoardInteractionDirtyViewportEfficient,
  pruneCompletedMarkerAnimations,
  readBoardCanvasTheme,
  retainBoardInteractionTweenCells,
  sampleBoardInteractionTweens,
  sampleBoardResultHighlightTweens,
  subscribeBoardCanvasThemeChanges,
  syncBoardResultHighlightTweens,
  syncBoardInteractionTweens,
  type BoardCanvasAssets,
  type BoardCanvasCamera,
  type BoardCanvasInteractionState,
  type BoardCanvasMetrics,
  type BoardCellInteractionFrame,
  type BoardMarkerAnimation,
} from '../renderer';
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type RefObject,
} from 'react';

type UseBoardCanvasRendererOptions = BoardCanvasInteractionState & {
  board: TBoard;
  boardRef: RefObject<HTMLDivElement>;
  bleedFrameRef: RefObject<HTMLDivElement>;
  canvasRef: RefObject<HTMLCanvasElement>;
  isGameLost: boolean;
  renderLayerRef: RefObject<HTMLDivElement>;
  surfaceRef: RefObject<HTMLDivElement>;
  zoom: number;
};

type BoardCanvasFullRenderInputs = {
  assets: BoardCanvasAssets;
  board: TBoard;
  isGameLost: boolean;
  zoom: number;
};

type BoardCanvasRenderGeometry = {
  camera: BoardCanvasCamera;
  metrics: BoardCanvasMetrics;
};

const RENDER_GEOMETRY_EPSILON = 0.001;

const areRenderGeometryValuesEqual = (first: number, second: number): boolean =>
  Math.abs(first - second) <= RENDER_GEOMETRY_EPSILON;

const hasSameRenderGeometry = (
  previous: BoardCanvasRenderGeometry | undefined,
  camera: BoardCanvasCamera,
  metrics: BoardCanvasMetrics,
): boolean =>
  Boolean(
    previous &&
    previous.metrics.backingHeight === metrics.backingHeight &&
    previous.metrics.backingWidth === metrics.backingWidth &&
    areRenderGeometryValuesEqual(previous.metrics.scaleX, metrics.scaleX) &&
    areRenderGeometryValuesEqual(previous.metrics.scaleY, metrics.scaleY) &&
    areRenderGeometryValuesEqual(
      previous.camera.canvasCssHeight,
      camera.canvasCssHeight,
    ) &&
    areRenderGeometryValuesEqual(
      previous.camera.canvasCssWidth,
      camera.canvasCssWidth,
    ) &&
    areRenderGeometryValuesEqual(previous.camera.layerX, camera.layerX) &&
    areRenderGeometryValuesEqual(previous.camera.layerY, camera.layerY) &&
    areRenderGeometryValuesEqual(
      previous.camera.previewScale,
      camera.previewScale,
    ) &&
    areRenderGeometryValuesEqual(
      previous.camera.surfaceHeight,
      camera.surfaceHeight,
    ) &&
    areRenderGeometryValuesEqual(
      previous.camera.surfaceOffsetX,
      camera.surfaceOffsetX,
    ) &&
    areRenderGeometryValuesEqual(
      previous.camera.surfaceOffsetY,
      camera.surfaceOffsetY,
    ) &&
    areRenderGeometryValuesEqual(
      previous.camera.surfaceWidth,
      camera.surfaceWidth,
    ) &&
    areRenderGeometryValuesEqual(
      previous.camera.viewport.height,
      camera.viewport.height,
    ) &&
    areRenderGeometryValuesEqual(
      previous.camera.viewport.width,
      camera.viewport.width,
    ) &&
    areRenderGeometryValuesEqual(
      previous.camera.viewport.x,
      camera.viewport.x,
    ) &&
    areRenderGeometryValuesEqual(previous.camera.viewport.y, camera.viewport.y),
  );

const readBoardCanvasBleed = (bleedFrame: HTMLElement): number => {
  const bleed = Number.parseFloat(getComputedStyle(bleedFrame).paddingLeft);

  return Number.isFinite(bleed) ? bleed : 0;
};

const setCanvasDatasetValue = (
  canvas: HTMLCanvasElement,
  key: string,
  value: string,
): void => {
  if (canvas.dataset[key] !== value) {
    canvas.dataset[key] = value;
  }
};

const syncMarkerAnimations = ({
  animations,
  board,
  now,
  previousBoard,
}: {
  animations: Map<string, BoardMarkerAnimation>;
  board: TBoard;
  now: number;
  previousBoard: TBoard | undefined;
}) => {
  const markerKeys = new Set<string>();

  board.forEach((row, rowIndex) => {
    row.forEach((cell, cellIndex) => {
      const marker = cell.marker;

      if (!marker) {
        return undefined;
      }

      const key = getBoardCellAnimationKey(rowIndex, cellIndex);
      const previousMarker = previousBoard?.[rowIndex]?.[cellIndex]?.marker;

      markerKeys.add(key);

      if (previousMarker !== marker) {
        animations.set(key, {
          marker: marker as CellMarker,
          startedAt: now,
        });
      }
    });
  });

  animations.forEach((_, key) => {
    if (!markerKeys.has(key)) {
      animations.delete(key);
    }
  });
};

export function useBoardCanvasRenderer({
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
}: UseBoardCanvasRendererOptions) {
  const { areAssetsReady, assets } = useBoardCanvasAssets();
  const canvasBleedRef = useRef<number | null>(null);
  const fullRenderInputsRef = useRef<BoardCanvasFullRenderInputs>();
  const lastRenderGeometryRef = useRef<BoardCanvasRenderGeometry>();
  const pendingFullRenderRef = useRef(true);
  const previousBoardRef = useRef<TBoard>();
  const previousIsGameLostRef = useRef<boolean>();
  const previousInteractionFrameRef = useRef<
    ReadonlyMap<string, BoardCellInteractionFrame>
  >(new Map());
  const previousResultAnimationActiveRef = useRef(false);
  const requestRenderRef = useRef<(forceFullRender?: boolean) => void>(
    () => undefined,
  );
  const themeRef = useRef<ReturnType<typeof readBoardCanvasTheme> | null>(null);
  const interactionTweensRef = useRef(createBoardInteractionTweens());
  const resultHighlightTweensRef = useRef(createBoardResultHighlightTweens());
  const markerAnimationsRef = useRef(new Map<string, BoardMarkerAnimation>());
  const validInteractionCellKeys = useMemo(() => {
    const keys = new Set<string>();

    board.forEach((row, rowIndex) => {
      row.forEach((cell, cellIndex) => {
        if (!cell.isOpened) {
          keys.add(getBoardCellAnimationKey(rowIndex, cellIndex));
        }
      });
    });

    return keys;
  }, [board]);

  useBoardCanvasFontReady(() => requestRenderRef.current(true));

  useEffect(() => {
    const boardElement = boardRef.current;
    const canvas = canvasRef.current;
    const renderLayer = renderLayerRef.current;
    const surface = surfaceRef.current;

    if (!boardElement || !canvas || !renderLayer || !surface) {
      return undefined;
    }

    const requestFullRender = () => {
      requestRenderRef.current(true);
    };
    const resizeObserver = new ResizeObserver(requestFullRender);
    const unsubscribeThemeChanges = subscribeBoardCanvasThemeChanges(() => {
      themeRef.current = null;
      requestFullRender();
    });

    resizeObserver.observe(boardElement);
    resizeObserver.observe(renderLayer);
    resizeObserver.observe(surface);

    boardElement.addEventListener('scroll', requestFullRender, {
      passive: true,
    });
    boardElement.addEventListener(
      BOARD_VIEWPORT_CHANGE_EVENT,
      requestFullRender,
    );
    window.addEventListener('resize', requestFullRender);
    canvas.addEventListener('contextrestored', requestFullRender);

    return () => {
      resizeObserver.disconnect();
      unsubscribeThemeChanges();
      boardElement.removeEventListener('scroll', requestFullRender);
      boardElement.removeEventListener(
        BOARD_VIEWPORT_CHANGE_EVENT,
        requestFullRender,
      );
      window.removeEventListener('resize', requestFullRender);
      canvas.removeEventListener('contextrestored', requestFullRender);
    };
  }, [boardRef, canvasRef, renderLayerRef, surfaceRef]);

  useLayoutEffect(() => {
    const boardElement = boardRef.current;
    const bleedFrame = bleedFrameRef.current;
    const canvas = canvasRef.current;
    const renderLayer = renderLayerRef.current;
    const surface = surfaceRef.current;

    if (!boardElement || !bleedFrame || !canvas || !renderLayer || !surface) {
      return undefined;
    }

    const activeBoardElement = boardElement;
    const activeBleedFrame = bleedFrame;
    const activeCanvas = canvas;
    const activeRenderLayer = renderLayer;
    const activeSurface = surface;
    const now = performance.now();
    const previousFullRenderInputs = fullRenderInputsRef.current;
    const didBoardChange = previousBoardRef.current !== board;
    const didResultInputsChange =
      didBoardChange || previousIsGameLostRef.current !== isGameLost;

    if (
      !previousFullRenderInputs ||
      previousFullRenderInputs.assets !== assets ||
      previousFullRenderInputs.board !== board ||
      previousFullRenderInputs.isGameLost !== isGameLost ||
      previousFullRenderInputs.zoom !== zoom
    ) {
      pendingFullRenderRef.current = true;
    }

    fullRenderInputsRef.current = {
      assets,
      board,
      isGameLost,
      zoom,
    };

    const getValidInteractionCell = (
      cell: BoardCanvasInteractionState['hoveredCell'],
    ) => {
      if (!cell) {
        return null;
      }

      const boardCell = board[cell.rowIndex]?.[cell.cellIndex];

      return boardCell && !boardCell.isOpened ? cell : null;
    };

    if (didBoardChange) {
      syncMarkerAnimations({
        animations: markerAnimationsRef.current,
        board,
        now,
        previousBoard: previousBoardRef.current,
      });
      retainBoardInteractionTweenCells(
        interactionTweensRef.current,
        validInteractionCellKeys,
      );
      previousBoardRef.current = board;
    }

    if (didResultInputsChange) {
      syncBoardResultHighlightTweens({
        board,
        isGameLost,
        now,
        tweens: resultHighlightTweensRef.current,
      });
      previousIsGameLostRef.current = isGameLost;
    }
    syncBoardInteractionTweens({
      hoverSnapRevision,
      hoveredCell: getValidInteractionCell(hoveredCell),
      now,
      pressSnapRevision,
      pressedCell: getValidInteractionCell(pressedCell),
      tweens: interactionTweensRef.current,
    });

    let animationFrameId: number | null = null;

    function requestRender(forceFullRender = false) {
      if (forceFullRender) {
        pendingFullRenderRef.current = true;
      }

      if (animationFrameId === null) {
        animationFrameId = window.requestAnimationFrame(renderFrame);
      }
    }

    function renderFrame(timestamp: number) {
      animationFrameId = null;

      const camera = getBoardCanvasCamera({
        boardClientHeight: activeBoardElement.clientHeight,
        boardClientLeft: activeBoardElement.clientLeft,
        boardClientTop: activeBoardElement.clientTop,
        boardClientWidth: activeBoardElement.clientWidth,
        boardRect: activeBoardElement.getBoundingClientRect(),
        renderLayerOffsetWidth: activeRenderLayer.offsetWidth,
        renderLayerRect: activeRenderLayer.getBoundingClientRect(),
        surfaceRect: activeSurface.getBoundingClientRect(),
      });

      if (!camera) {
        return undefined;
      }

      const canvasCssHeight = `${camera.canvasCssHeight}px`;
      const canvasCssWidth = `${camera.canvasCssWidth}px`;
      const canvasTransform = `translate(${camera.layerX}px, ${camera.layerY}px)`;
      let didChangeCanvasGeometry = false;

      if (activeCanvas.style.height !== canvasCssHeight) {
        activeCanvas.style.height = canvasCssHeight;
        didChangeCanvasGeometry = true;
      }

      if (activeCanvas.style.width !== canvasCssWidth) {
        activeCanvas.style.width = canvasCssWidth;
        didChangeCanvasGeometry = true;
      }

      if (activeCanvas.style.transform !== canvasTransform) {
        activeCanvas.style.transform = canvasTransform;
        didChangeCanvasGeometry = true;
      }

      const metrics = getBoardCanvasMetrics({
        cssHeight: camera.screenHeight,
        cssWidth: camera.screenWidth,
        devicePixelRatio: window.devicePixelRatio,
      });

      if (!metrics) {
        return undefined;
      }

      let didResizeBitmap = false;

      if (activeCanvas.width !== metrics.backingWidth) {
        activeCanvas.width = metrics.backingWidth;
        didResizeBitmap = true;
      }

      if (activeCanvas.height !== metrics.backingHeight) {
        activeCanvas.height = metrics.backingHeight;
        didResizeBitmap = true;
      }

      const context = activeCanvas.getContext('2d');

      if (!context) {
        return undefined;
      }

      const interactionFrame = sampleBoardInteractionTweens(
        interactionTweensRef.current,
        timestamp,
      );
      const resultHighlightFrame = sampleBoardResultHighlightTweens(
        resultHighlightTweensRef.current,
        timestamp,
      );
      const theme = themeRef.current ?? readBoardCanvasTheme(activeCanvas);

      themeRef.current = theme;

      if (canvasBleedRef.current === null || pendingFullRenderRef.current) {
        canvasBleedRef.current = readBoardCanvasBleed(activeBleedFrame);
      }

      const interactionCellKeys = new Set([
        ...previousInteractionFrameRef.current.keys(),
        ...interactionFrame.byCell.keys(),
      ]);
      const effectiveScaleX = metrics.scaleX * camera.previewScale;
      const effectiveScaleY = metrics.scaleY * camera.previewScale;
      const didFinishMarkerAnimations = pruneCompletedMarkerAnimations({
        animations: markerAnimationsRef.current,
        now: timestamp,
      });
      const mustDrawFull =
        pendingFullRenderRef.current ||
        didChangeCanvasGeometry ||
        didResizeBitmap ||
        !hasSameRenderGeometry(
          lastRenderGeometryRef.current,
          camera,
          metrics,
        ) ||
        didFinishMarkerAnimations ||
        markerAnimationsRef.current.size > 0 ||
        resultHighlightFrame.isActive ||
        previousResultAnimationActiveRef.current;
      const interactionDirtyViewport = mustDrawFull
        ? null
        : getBoardInteractionDirtyViewport({
            cellKeys: interactionCellKeys,
            cols: board[0]?.length ?? 0,
            rows: board.length,
            surfaceHeight: camera.surfaceHeight,
            surfaceWidth: camera.surfaceWidth,
            viewport: camera.viewport,
          });
      const dirtyRegion =
        interactionDirtyViewport &&
        isBoardInteractionDirtyViewportEfficient({
          dirtyViewport: interactionDirtyViewport,
          fullViewport: camera.viewport,
        })
          ? getBoardCanvasDirtyRegion({
              backingHeight: activeCanvas.height,
              backingWidth: activeCanvas.width,
              dirtyViewport: interactionDirtyViewport,
              fullViewport: camera.viewport,
              scaleX: effectiveScaleX,
              scaleY: effectiveScaleY,
            })
          : null;
      const drawMode = dirtyRegion ? 'dirty' : 'full';
      const renderViewport = dirtyRegion
        ? dirtyRegion.worldViewport
        : camera.viewport;

      if (dirtyRegion) {
        const { deviceRect } = dirtyRegion;

        context.save();
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.beginPath();
        context.rect(
          deviceRect.x,
          deviceRect.y,
          deviceRect.width,
          deviceRect.height,
        );
        context.clip();
        context.clearRect(
          deviceRect.x,
          deviceRect.y,
          deviceRect.width,
          deviceRect.height,
        );
      } else {
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, activeCanvas.width, activeCanvas.height);
      }

      context.setTransform(effectiveScaleX, 0, 0, effectiveScaleY, 0, 0);
      context.translate(-camera.viewport.x, -camera.viewport.y);
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';

      const drawResult = drawBoard({
        assets,
        board,
        context,
        cssHeight: camera.surfaceHeight,
        cssWidth: camera.surfaceWidth,
        interactionByCell: interactionFrame.byCell,
        isGameLost,
        markerAnimations: markerAnimationsRef.current,
        now: timestamp,
        overscan: dirtyRegion ? 0 : undefined,
        resultHighlightByCell: resultHighlightFrame.byCell,
        theme,
        viewport: renderViewport,
        zoom,
      });

      if (dirtyRegion) {
        context.restore();
      }

      setCanvasDatasetValue(
        activeCanvas,
        'boardCanvasBleed',
        String(canvasBleedRef.current ?? 0),
      );
      setCanvasDatasetValue(
        activeCanvas,
        'boardCanvasCameraScale',
        String(camera.previewScale),
      );
      setCanvasDatasetValue(
        activeCanvas,
        'boardCanvasCameraX',
        String(camera.viewport.x),
      );
      setCanvasDatasetValue(
        activeCanvas,
        'boardCanvasCameraY',
        String(camera.viewport.y),
      );
      setCanvasDatasetValue(activeCanvas, 'boardCanvasDrawMode', drawMode);
      setCanvasDatasetValue(
        activeCanvas,
        'boardCanvasDrawnCells',
        String(drawResult.visibleCellCount),
      );
      setCanvasDatasetValue(
        activeCanvas,
        'boardCanvasDpr',
        String(metrics.dpr),
      );

      if (!dirtyRegion) {
        setCanvasDatasetValue(
          activeCanvas,
          'boardCanvasVisibleCells',
          String(drawResult.visibleCellCount),
        );
      }

      lastRenderGeometryRef.current = {
        camera,
        metrics,
      };
      pendingFullRenderRef.current = false;
      previousInteractionFrameRef.current = interactionFrame.byCell;
      previousResultAnimationActiveRef.current = resultHighlightFrame.isActive;
      recordBoardCanvasDraw({
        drawnCells: drawResult.visibleCellCount,
        mode: drawMode,
      });

      if (
        drawResult.hasActiveAnimation ||
        interactionFrame.isActive ||
        resultHighlightFrame.isActive
      ) {
        requestRender();
      } else {
        markerAnimationsRef.current.clear();
      }
    }

    requestRenderRef.current = requestRender;
    renderFrame(now);

    return () => {
      if (requestRenderRef.current === requestRender) {
        requestRenderRef.current = () => undefined;
      }

      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, [
    assets,
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
    validInteractionCellKeys,
    zoom,
  ]);

  return areAssetsReady;
}
