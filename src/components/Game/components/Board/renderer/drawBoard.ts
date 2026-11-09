import { CELL_BORDER_WIDTH_PX, CELL_HIT_INSET_PX } from '../constants';
import { getVisibleBoardRange } from './camera';
import { getBoardCellAnimationKey } from './cellKey';
import { drawBoardCell } from './drawCell';
import type {
  BoardCellResultHighlightFrame,
  DrawBoardOptions,
  DrawBoardResult,
} from './types';

const EMPTY_RESULT_HIGHLIGHT: BoardCellResultHighlightFrame = {
  overlayGreen: 0,
  overlayRed: 0,
  surfaceRed: 0,
};

export const drawBoard = ({
  assets,
  board,
  cellBorderWidthPx,
  cellInsetPx,
  context,
  cssHeight,
  cssWidth,
  interactionByCell,
  isGameLost,
  markerAnimations,
  now,
  overscan,
  resultHighlightByCell,
  theme,
  viewport,
  zoom,
}: DrawBoardOptions): DrawBoardResult => {
  const rows = board.length;
  const cols = board[0]?.length ?? 0;
  const visibleRange = getVisibleBoardRange({
    cols,
    rows,
    overscan,
    surfaceHeight: cssHeight,
    surfaceWidth: cssWidth,
    viewport,
  });

  if (!visibleRange) {
    return {
      hasActiveAnimation: false,
      visibleCellCount: 0,
    };
  }

  const pitchX = cssWidth / cols;
  const pitchY = cssHeight / rows;
  const inset = cellInsetPx ?? CELL_HIT_INSET_PX * zoom;
  const borderWidth = cellBorderWidthPx ?? CELL_BORDER_WIDTH_PX * zoom;
  const cellWidth = Math.max(0, pitchX - inset * 2);
  const cellHeight = Math.max(0, pitchY - inset * 2);
  let hasActiveAnimation = false;

  for (
    let rowIndex = visibleRange.startRow;
    rowIndex < visibleRange.endRow;
    rowIndex += 1
  ) {
    const row = board[rowIndex];

    if (!row) {
      continue;
    }

    for (
      let cellIndex = visibleRange.startColumn;
      cellIndex < visibleRange.endColumn;
      cellIndex += 1
    ) {
      const cell = row[cellIndex];

      if (!cell) {
        continue;
      }

      const cellKey = getBoardCellAnimationKey(rowIndex, cellIndex);
      const interaction = interactionByCell.get(cellKey);

      hasActiveAnimation =
        drawBoardCell({
          animation: markerAnimations.get(cellKey),
          assets,
          borderWidth,
          cell,
          cellHeight,
          cellIndex,
          cellWidth,
          context,
          hoverProgress: interaction?.hover ?? 0,
          inset,
          isGameLost,
          now,
          pitchX,
          pitchY,
          pressProgress: interaction?.press ?? 0,
          resultHighlight:
            resultHighlightByCell.get(cellKey) ?? EMPTY_RESULT_HIGHLIGHT,
          rowIndex,
          theme,
          zoom,
        }) || hasActiveAnimation;
    }
  }

  return {
    hasActiveAnimation,
    visibleCellCount:
      (visibleRange.endRow - visibleRange.startRow) *
      (visibleRange.endColumn - visibleRange.startColumn),
  };
};
