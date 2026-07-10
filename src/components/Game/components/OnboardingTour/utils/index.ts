import { CELL_MARKERS } from '@/config';
import { ControlModes, DigFlag } from '@/store/settings';
import type { GameCell, TBoard } from '@/types';
import type { CSSProperties } from 'react';
import {
  TOUR_CARD_ESTIMATED_HEIGHT,
  TOUR_TARGET_IDS,
  TOUR_VIEWPORT_MARGIN,
} from '../constants';
import type {
  FlagStepPhase,
  TourCellTarget,
  TourStepContent,
  TourStepId,
  TourTarget,
  TourTargetRect,
} from '../types';

const getCell = (
  board: TBoard,
  target: TourCellTarget | null,
): GameCell | null => {
  if (!target) {
    return null;
  }

  return board[target.rowIndex]?.[target.cellIndex] ?? null;
};

const isClosedUnmarkedCell = (cell: GameCell) =>
  !cell.isOpened && cell.marker === null;

const findCell = (
  board: TBoard,
  predicate: (cell: GameCell) => boolean,
): TourCellTarget | null => {
  for (const [rowIndex, row] of board.entries()) {
    const cellIndex = row.findIndex(predicate);

    if (cellIndex !== -1) {
      return {
        type: 'cell',
        rowIndex,
        cellIndex,
      };
    }
  }

  return null;
};

const findBestCell = (
  board: TBoard,
  predicate: (cell: GameCell) => boolean,
  getScore: (target: TourCellTarget) => number,
): TourCellTarget | null => {
  let bestTarget: TourCellTarget | null = null;
  let bestScore = Number.POSITIVE_INFINITY;

  for (const [rowIndex, row] of board.entries()) {
    for (const [cellIndex, cell] of row.entries()) {
      if (!predicate(cell)) {
        continue;
      }

      const target: TourCellTarget = {
        type: 'cell',
        rowIndex,
        cellIndex,
      };
      const score = getScore(target);

      if (score >= bestScore) {
        continue;
      }

      bestTarget = target;
      bestScore = score;
    }
  }

  return bestTarget;
};

const getTopMiddleScore = (board: TBoard, target: TourCellTarget) => {
  const rowCount = board.length || 1;
  const cellCount = board[target.rowIndex]?.length || 1;
  const preferredRowIndex = Math.floor(rowCount * 0.25);
  const preferredCellIndex = (cellCount - 1) / 2;
  const lowerHalfPenalty =
    target.rowIndex > rowCount / 2 ? rowCount * cellCount : 0;

  return (
    lowerHalfPenalty +
    Math.abs(target.rowIndex - preferredRowIndex) * cellCount +
    Math.abs(target.cellIndex - preferredCellIndex)
  );
};

export const findOpeningCellTarget = (board: TBoard): TourCellTarget | null => {
  const emptyTarget = findBestCell(
    board,
    (cell) => isClosedUnmarkedCell(cell) && cell.value === 0,
    (target) => getTopMiddleScore(board, target),
  );

  if (emptyTarget) {
    return emptyTarget;
  }

  const safeTarget = findBestCell(
    board,
    (cell) => isClosedUnmarkedCell(cell) && cell.value !== 'mine',
    (target) => getTopMiddleScore(board, target),
  );

  if (safeTarget) {
    return safeTarget;
  }

  return findCell(board, isClosedUnmarkedCell);
};

export const findRevealedNumberTarget = (
  board: TBoard,
): TourCellTarget | null =>
  findBestCell(
    board,
    (cell) => cell.isOpened && typeof cell.value === 'number' && cell.value > 0,
    (target) => getTopMiddleScore(board, target),
  );

export const findClosedMineTarget = (board: TBoard): TourCellTarget | null =>
  findCell(
    board,
    (cell) => isClosedUnmarkedCell(cell) && cell.value === 'mine',
  );

export const getCellValue = (board: TBoard, target: TourCellTarget | null) =>
  getCell(board, target)?.value ?? null;

export const isCellOpened = (board: TBoard, target: TourCellTarget | null) =>
  Boolean(getCell(board, target)?.isOpened);

export const isCellFlagged = (board: TBoard, target: TourCellTarget | null) =>
  getCell(board, target)?.marker === CELL_MARKERS.FLAG;

export const isCellStillActionable = (
  board: TBoard,
  target: TourCellTarget | null,
) => {
  const cell = getCell(board, target);

  return Boolean(cell && isClosedUnmarkedCell(cell));
};

export const getTourCellSelector = (target: TourCellTarget) =>
  `[data-tour-cell="${target.rowIndex}-${target.cellIndex}"]`;

const getTourTargetElement = (target: TourTarget): Element | null => {
  if (!target) {
    return null;
  }

  if (target.type === 'cell') {
    return document.querySelector(getTourCellSelector(target));
  }

  if (target.type === 'cell-group') {
    return document.querySelector(getTourCellSelector(target.cells[0]));
  }

  return document.querySelector(`[data-tour-id="${target.tourId}"]`);
};

const getCellGroupTargetRect = (target: TourTarget): TourTargetRect | null => {
  if (target?.type !== 'cell-group') {
    return null;
  }

  const rects = target.cells
    .map((cellTarget) =>
      document
        .querySelector(getTourCellSelector(cellTarget))
        ?.getBoundingClientRect(),
    )
    .filter((rect): rect is DOMRect => Boolean(rect));

  if (rects.length === 0) {
    return null;
  }

  const top = Math.min(...rects.map((rect) => rect.top));
  const left = Math.min(...rects.map((rect) => rect.left));
  const right = Math.max(...rects.map((rect) => rect.right));
  const bottom = Math.max(...rects.map((rect) => rect.bottom));

  return {
    top,
    left,
    width: right - left,
    height: bottom - top,
    right,
    bottom,
  };
};

export const getTourTargetRect = (
  target: TourTarget,
): TourTargetRect | null => {
  const groupRect = getCellGroupTargetRect(target);

  if (groupRect) {
    return groupRect;
  }

  const element = getTourTargetElement(target);

  if (!element) {
    return null;
  }

  const rect = element.getBoundingClientRect();

  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
    right: rect.right,
    bottom: rect.bottom,
  };
};

export const scrollTourTargetIntoView = (target: TourTarget): void => {
  const element = getTourTargetElement(target);

  if (!element || (target?.type !== 'cell' && target?.type !== 'cell-group')) {
    return undefined;
  }

  element.scrollIntoView({
    block: 'center',
    inline: 'center',
    behavior: 'smooth',
  });
};

export const getTourCardStyle = (
  targetRect: TourTargetRect | null,
): CSSProperties | undefined => {
  if (!targetRect) {
    return undefined;
  }

  const viewportHeight = window.innerHeight;
  const shouldPlaceAbove =
    targetRect.bottom + TOUR_CARD_ESTIMATED_HEIGHT > viewportHeight;
  const top = shouldPlaceAbove
    ? Math.max(
        TOUR_VIEWPORT_MARGIN,
        targetRect.top - TOUR_CARD_ESTIMATED_HEIGHT - TOUR_VIEWPORT_MARGIN,
      )
    : Math.min(
        targetRect.bottom + TOUR_VIEWPORT_MARGIN,
        viewportHeight - TOUR_CARD_ESTIMATED_HEIGHT,
      );
  const left = Math.min(
    Math.max(TOUR_VIEWPORT_MARGIN, targetRect.left),
    Math.max(TOUR_VIEWPORT_MARGIN, window.innerWidth - 376),
  );

  return {
    top,
    left,
  };
};

export const getTourBlockerStyles = (
  targetRect: TourTargetRect | null,
): CSSProperties[] => {
  if (!targetRect) {
    return [
      {
        top: 0,
        left: 0,
        width: '100dvw',
        height: '100dvh',
      },
    ];
  }

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  return [
    {
      top: 0,
      left: 0,
      width: '100dvw',
      height: Math.max(0, targetRect.top),
    },
    {
      top: targetRect.top,
      left: 0,
      width: Math.max(0, targetRect.left),
      height: Math.max(0, targetRect.height),
    },
    {
      top: targetRect.top,
      left: targetRect.right,
      width: Math.max(0, viewportWidth - targetRect.right),
      height: Math.max(0, targetRect.height),
    },
    {
      top: targetRect.bottom,
      left: 0,
      width: '100dvw',
      height: Math.max(0, viewportHeight - targetRect.bottom),
    },
  ];
};

export const getFallbackBoardTarget = (): TourTarget => ({
  type: 'tour-id',
  tourId: TOUR_TARGET_IDS.BOARD,
});

const getNumberClueTarget = (
  board: TBoard,
  target: TourCellTarget | null,
): TourTarget => {
  if (!target) {
    return getFallbackBoardTarget();
  }

  const lastRowIndex = board.length - 1;
  const lastCellIndex = (board[target.rowIndex]?.length ?? 0) - 1;
  const isEdgeCell =
    target.rowIndex === 0 ||
    target.cellIndex === 0 ||
    target.rowIndex === lastRowIndex ||
    target.cellIndex === lastCellIndex;

  if (isEdgeCell) {
    return target;
  }

  const cells: TourCellTarget[] = [target];

  for (
    let rowIndex = target.rowIndex - 1;
    rowIndex <= target.rowIndex + 1;
    rowIndex += 1
  ) {
    for (
      let cellIndex = target.cellIndex - 1;
      cellIndex <= target.cellIndex + 1;
      cellIndex += 1
    ) {
      if (rowIndex === target.rowIndex && cellIndex === target.cellIndex) {
        continue;
      }

      cells.push({
        type: 'cell',
        rowIndex,
        cellIndex,
      });
    }
  }

  return {
    type: 'cell-group',
    cells,
  };
};

type GetTourStepContentOptions = {
  board: TBoard;
  controlMode: ControlModes;
  digFlag: DigFlag;
  flagCellTarget: TourCellTarget | null;
  flagPhase: FlagStepPhase;
  isTouchScreen: boolean;
  numberCellTarget: TourCellTarget | null;
  openCellTarget: TourCellTarget | null;
  stepId: TourStepId;
};

const getNumberCopy = (value: GameCell['value']) => {
  if (typeof value !== 'number' || value <= 0) {
    return 'Numbers show how many mines touch a square. Use nearby numbers together before opening risky cells.';
  }

  const mineWord = value === 1 ? 'mine touches' : 'mines touch';

  return `This ${value} in the middle means ${value} ${mineWord} this square. Use nearby numbers together before opening risky cells.`;
};

const getOpenCellCopy = (value: GameCell['value']) => {
  if (value === 0) {
    return 'Click or tap this empty square. Empty areas open outward and reveal number clues around the edge.';
  }

  if (typeof value === 'number') {
    return 'Click or tap this covered safe square to reveal your first number clue.';
  }

  return 'Click or tap this covered square to make your first move.';
};

const getFlagCellCopy = (controlMode: ControlModes, isTouchScreen: boolean) => {
  if (controlMode === ControlModes.Toggle) {
    return 'Now tap this covered square to put a flag where you think a mine is hidden.';
  }

  if (isTouchScreen) {
    return 'Press and hold this covered square to put a flag where you think a mine is hidden.';
  }

  return 'Right-click this covered square to put a flag where you think a mine is hidden.';
};

export const getTourStepContent = ({
  board,
  controlMode,
  digFlag,
  flagCellTarget,
  flagPhase,
  isTouchScreen,
  numberCellTarget,
  openCellTarget,
  stepId,
}: GetTourStepContentOptions): TourStepContent => {
  if (stepId === 'open-cell') {
    const target = openCellTarget ?? getFallbackBoardTarget();
    const value = getCellValue(board, openCellTarget);

    return {
      title: 'Open an empty cell',
      body: openCellTarget
        ? getOpenCellCopy(value)
        : 'No covered safe square is available right now. Continue to learn how the clues work.',
      target,
      canUseNext:
        !openCellTarget ||
        isCellOpened(board, openCellTarget) ||
        !isCellStillActionable(board, openCellTarget),
    };
  }

  if (stepId === 'read-number') {
    const value = getCellValue(board, numberCellTarget);

    return {
      title: 'Read the number',
      body: getNumberCopy(value),
      target: getNumberClueTarget(board, numberCellTarget),
      canUseNext: true,
    };
  }

  if (stepId === 'place-flag') {
    const shouldUseFlagControl =
      controlMode === ControlModes.Toggle &&
      flagPhase === 'control' &&
      digFlag !== DigFlag.Flag;

    if (shouldUseFlagControl) {
      return {
        title: 'Mark a mine',
        body: 'Use this control to switch into Flag mode when you think a square hides a mine.',
        target: {
          type: 'tour-id',
          tourId: TOUR_TARGET_IDS.FLAG_CONTROLS,
        },
        canUseNext: false,
      };
    }

    return {
      title: 'Mark a mine',
      body: flagCellTarget
        ? getFlagCellCopy(controlMode, isTouchScreen)
        : 'Use flags to mark squares you believe contain mines. Continue when you are ready.',
      target: flagCellTarget ?? {
        type: 'tour-id',
        tourId:
          controlMode === ControlModes.Toggle
            ? TOUR_TARGET_IDS.FLAG_CONTROLS
            : TOUR_TARGET_IDS.BOARD,
      },
      canUseNext:
        !flagCellTarget ||
        isCellFlagged(board, flagCellTarget) ||
        !isCellStillActionable(board, flagCellTarget),
    };
  }

  if (stepId === 'win-condition') {
    return {
      title: 'How to win',
      body: 'You win by revealing every safe square. You can also win by correctly flagging every mine.',
      target: {
        type: 'tour-id',
        tourId: TOUR_TARGET_IDS.WIN_STATUS,
      },
      canUseNext: true,
    };
  }

  return {
    title: 'Customize the game',
    body: 'Settings let you customize controls, sound, zoom, and the gameplay flow. Enjoy!',
    target: {
      type: 'tour-id',
      tourId: TOUR_TARGET_IDS.SETTINGS_TRIGGER,
    },
    canUseNext: true,
  };
};
