import type { CellMarker, GameCell, TBoard } from '@/types';
import type { BoardCellCoordinates } from '../types';

export type BoardCanvasAssetName = 'bomb' | 'cross' | 'flag' | 'question';

export type BoardCanvasAssets = Partial<
  Record<BoardCanvasAssetName, HTMLImageElement>
>;

export type CompleteBoardCanvasAssets = Record<
  BoardCanvasAssetName,
  HTMLImageElement
>;

export type BoardCanvasTheme = {
  cellBorder: string;
  cellClosed: string;
  cellClosedHover: string;
  cellRevealed: string;
  fontFamily: string;
  numberColors: readonly string[];
  radiusRatio: number;
  textPrimary: string;
};

export type BoardCanvasMetrics = {
  backingHeight: number;
  backingWidth: number;
  cssHeight: number;
  cssWidth: number;
  dpr: number;
  scaleX: number;
  scaleY: number;
};

export type BoardCanvasViewport = {
  height: number;
  width: number;
  x: number;
  y: number;
};

export type BoardCanvasDirtyRegion = {
  deviceRect: BoardCanvasViewport;
  worldViewport: BoardCanvasViewport;
};

export type BoardCanvasCamera = {
  canvasCssHeight: number;
  canvasCssWidth: number;
  layerX: number;
  layerY: number;
  previewScale: number;
  screenHeight: number;
  screenWidth: number;
  surfaceHeight: number;
  surfaceOffsetX: number;
  surfaceOffsetY: number;
  surfaceWidth: number;
  viewport: BoardCanvasViewport;
};

export type BoardVisibleRange = {
  endColumn: number;
  endRow: number;
  startColumn: number;
  startRow: number;
};

export type BoardResultHighlightChannel =
  | 'overlayGreen'
  | 'overlayRed'
  | 'surfaceRed';

export type BoardCellResultHighlightFrame = Record<
  BoardResultHighlightChannel,
  number
>;

export type BoardResultHighlightFrame = {
  byCell: ReadonlyMap<string, BoardCellResultHighlightFrame>;
  isActive: boolean;
};

export type BoardCellContent = 'bomb' | 'flag' | 'none' | 'number' | 'question';

export type BoardCellRenderModel = {
  content: BoardCellContent;
  isClosed: boolean;
  marker: CellMarker | null;
  number: number | null;
  overlayHighlight: 'green' | 'red' | null;
  showWrongFlagCross: boolean;
  surfaceHighlight: 'red' | null;
};

export type BoardCanvasInteractionState = {
  hoverSnapRevision: number;
  hoveredCell: BoardCellCoordinates | null;
  pressSnapRevision: number;
  pressedCell: BoardCellCoordinates | null;
};

export type BoardScalarTween = {
  durationMs: number;
  from: number;
  startedAt: number;
  to: 0 | 1;
};

export type BoardInteractionTweenChannel = {
  byCell: Map<string, BoardScalarTween>;
  snapRevision: number;
  targetKey: string | null;
};

export type BoardInteractionTweens = {
  hover: BoardInteractionTweenChannel;
  press: BoardInteractionTweenChannel;
};

export type BoardCellInteractionFrame = {
  hover: number;
  press: number;
};

export type BoardInteractionFrame = {
  byCell: ReadonlyMap<string, BoardCellInteractionFrame>;
  isActive: boolean;
};

export type BoardMarkerAnimation = {
  marker: CellMarker;
  startedAt: number;
};

export type BoardMarkerAnimations = ReadonlyMap<string, BoardMarkerAnimation>;

export type DrawBoardOptions = {
  assets: BoardCanvasAssets;
  board: TBoard;
  cellBorderWidthPx?: number;
  cellInsetPx?: number;
  context: CanvasRenderingContext2D;
  cssHeight: number;
  cssWidth: number;
  interactionByCell: ReadonlyMap<string, BoardCellInteractionFrame>;
  isGameLost: boolean;
  markerAnimations: BoardMarkerAnimations;
  now: number;
  overscan?: number;
  resultHighlightByCell: ReadonlyMap<string, BoardCellResultHighlightFrame>;
  theme: BoardCanvasTheme;
  viewport: BoardCanvasViewport;
  zoom: number;
};

export type DrawBoardResult = {
  hasActiveAnimation: boolean;
  visibleCellCount: number;
};

export type DrawCellOptions = {
  animation: BoardMarkerAnimation | undefined;
  assets: BoardCanvasAssets;
  borderWidth: number;
  cell: GameCell;
  cellIndex: number;
  cellHeight: number;
  cellWidth: number;
  context: CanvasRenderingContext2D;
  hoverProgress: number;
  inset: number;
  isGameLost: boolean;
  now: number;
  pitchX: number;
  pitchY: number;
  pressProgress: number;
  resultHighlight: BoardCellResultHighlightFrame;
  rowIndex: number;
  theme: BoardCanvasTheme;
  zoom: number;
};
