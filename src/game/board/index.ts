import { CELL_MARKERS } from '@/config';
import { useGameStore } from '@/store/game';
import { selectGameStatus, selectMinesLeft } from '@/store/game/selectors';
import { useSettingsStore } from '@/store/settings';
import {
  selectIsDigMode,
  selectIsFlagMode,
  selectIsGesturesMode,
  selectIsQuestionMarkEnabled,
  selectIsToggleMode,
} from '@/store/settings/selectors';
import { useSFXStore } from '@/store/sfx';
import { initSFX, playSFX } from '@/store/sfx/actions';
import { useTimerStore } from '@/store/timer';
import { startTimer } from '@/store/timer/actions';
import { selectIsTimerRunning } from '@/store/timer/selectors';
import { type CellMarkerState, TBoard } from '@/types';
import { initBoard } from '@/utils/init';
import { produce } from 'immer';
import { checkGameWin } from '../checkGameWin';
import { revealBoard } from './revealBoard';
import { applyOpenedCells, revealEmptyCells } from './revealEmptyCells';
import type { HandleCellInteractionProps } from './types';

const HOLD_TIME = 250;

let touchDownTime: number | null = null;
let touchHoldTimeoutId: number | null = null;
let pointerDownCoordinates: { x: number; y: number } | null = null;
let latestPointerCoordinates: { x: number; y: number } | null = null;
let isPointerSequenceBlocked = false;

const getLatestPointerCoordinates = (): { x: number; y: number } | null => {
  if (latestPointerCoordinates) {
    return latestPointerCoordinates;
  }

  return pointerDownCoordinates;
};

const isPointerMoved = (x: number, y: number, delta = 0.5): boolean => {
  if (!pointerDownCoordinates) {
    return false;
  }

  const { x: pointerDownX, y: pointerDownY } = pointerDownCoordinates;
  const distance = Math.sqrt((x - pointerDownX) ** 2 + (y - pointerDownY) ** 2);

  return distance > delta;
};

const cleanupTimers = () => {
  if (touchHoldTimeoutId) {
    clearTimeout(touchHoldTimeoutId);
  }

  touchHoldTimeoutId = null;
  touchDownTime = null;
  pointerDownCoordinates = null;
  latestPointerCoordinates = null;
};

export const cancelCellPointerSequence = (): void => {
  isPointerSequenceBlocked = true;
  cleanupTimers();
};

const getNextMarker = (
  marker: CellMarkerState,
  isQuestionMarkEnabled: boolean,
): CellMarkerState => {
  if (marker === CELL_MARKERS.FLAG) {
    return isQuestionMarkEnabled ? CELL_MARKERS.QUESTION : null;
  }

  if (marker === CELL_MARKERS.QUESTION) {
    return null;
  }

  return CELL_MARKERS.FLAG;
};

const shouldOpenCell = (row: number, col: number): boolean => {
  const state = useGameStore.getState();
  const { board, onboardingTourFlagOnlyCell } = state;
  const gameStatus = selectGameStatus(state);
  const isCellOpened = board[row][col].isOpened;
  const isCellFlagged = board[row][col].marker === CELL_MARKERS.FLAG;
  const isFlagOnlyCell =
    onboardingTourFlagOnlyCell?.rowIndex === row &&
    onboardingTourFlagOnlyCell?.cellIndex === col;

  if (
    gameStatus === 'won' ||
    gameStatus === 'lost' ||
    gameStatus === 'paused' ||
    isCellOpened ||
    isCellFlagged ||
    isFlagOnlyCell
  ) {
    return false;
  }

  return true;
};

const openCell = (board: TBoard, row: number, col: number): void => {
  const gameState = useGameStore.getState();
  const timerState = useTimerStore.getState();

  const gameStatus = selectGameStatus(gameState);
  const isTimerRunning = selectIsTimerRunning(timerState);

  if (!isTimerRunning) {
    startTimer();
  }

  if (gameStatus === 'idle') {
    useGameStore.setState({ gameStatus: 'playing' });
  }

  const cell = board[row][col];
  const isMineCell = cell.value === 'mine';

  if (isMineCell) {
    const newBoard = produce<TBoard>(board, (draft) => {
      const draftCell = draft[row][col];
      if (draftCell.value === 'mine') draftCell.highlight = 'red';
      revealBoard(draft);
    });
    useGameStore.setState({ board: newBoard, gameStatus: 'lost' });
    playSFX('GAME_OVER');
    return;
  }

  const { level, openedSafeCells, correctlyFlaggedMines } =
    useGameStore.getState();
  const isNumberCell = typeof cell.value === 'number' && cell.value > 0;
  let openedDelta = 0;
  let newBoard: TBoard;

  if (cell.value === 0) {
    playSFX('REVEAL_EMPTY');
    // Run BFS on the plain board (no Immer proxy overhead), then apply via
    // targeted shallow clone that preserves structural sharing for unchanged rows/cells.
    const positions = revealEmptyCells(board, level.rows, level.cols, row, col);
    openedDelta = positions.length;
    newBoard = applyOpenedCells(board, positions);
  } else {
    if (isNumberCell) playSFX('REVEAL_NUMBER');
    openedDelta = 1;
    // Shallow-clone only the changed row and cell; all other rows reuse their references.
    const newRow = [...board[row]] as TBoard[number];
    newRow[col] = {
      ...cell,
      isOpened: true,
      marker: null,
    } as unknown as typeof cell;
    newBoard = board.map((r, i) => (i === row ? newRow : r)) as TBoard;
  }

  const newOpenedSafeCells = openedSafeCells + openedDelta;
  const totalSafeCells = level.rows * level.cols - level.totalMines;

  if (
    checkGameWin(
      newOpenedSafeCells,
      totalSafeCells,
      correctlyFlaggedMines,
      level.totalMines,
    )
  ) {
    const wonBoard = produce<TBoard>(newBoard, (draft) => {
      revealBoard(draft, true);
    });
    useGameStore.setState({
      board: wonBoard,
      gameStatus: 'won',
      openedSafeCells: newOpenedSafeCells,
    });
    playSFX('GAME_WIN');
    return;
  }

  useGameStore.setState({
    board: newBoard,
    openedSafeCells: newOpenedSafeCells,
  });
};

export const handleOpenCell = (row: number, col: number) => {
  const { board, level, isGameRestarted, mode } = useGameStore.getState();

  const isMineCell = board[row][col].value === 'mine';
  const isFirstClick =
    !selectIsTimerRunning(useTimerStore.getState()) &&
    selectGameStatus(useGameStore.getState()) === 'idle';
  const isFirstClickOnMine = isMineCell && isFirstClick;

  let newGameBoard: TBoard;

  if (isFirstClickOnMine && !isGameRestarted && mode === 'free') {
    // Generate a fresh board guaranteed to have no mine at the clicked cell.
    newGameBoard = initBoard(level, { excludeCell: { row, col } });
  } else {
    newGameBoard = board;
  }

  openCell(newGameBoard, row, col);
};

const shouldToggleMarker = (
  row: number,
  col: number,
  isQuestionMarkEnabled: boolean,
): boolean => {
  const { board } = useGameStore.getState();
  const gameStatus = selectGameStatus(useGameStore.getState());
  const minesLeft = selectMinesLeft(useGameStore.getState());

  const isCellOpened = board[row][col].isOpened;
  const marker = board[row][col].marker;
  const nextMarker = getNextMarker(marker, isQuestionMarkEnabled);
  const isFlagLimitReached =
    minesLeft === 0 && nextMarker === CELL_MARKERS.FLAG;

  if (
    gameStatus === 'won' ||
    gameStatus === 'lost' ||
    gameStatus === 'paused' ||
    isCellOpened ||
    isFlagLimitReached
  ) {
    return false;
  }

  return true;
};

const toggleMarker = (
  row: number,
  col: number,
  isQuestionMarkEnabled: boolean,
) => {
  if (!selectIsTimerRunning(useTimerStore.getState())) {
    startTimer();
  }

  if (selectGameStatus(useGameStore.getState()) === 'idle') {
    useGameStore.setState({ gameStatus: 'playing' });
  }

  const { board, level, openedSafeCells, correctlyFlaggedMines } =
    useGameStore.getState();
  const cell = board[row][col];
  const isCellMine = cell.value === 'mine';
  const nextMarker = getNextMarker(cell.marker, isQuestionMarkEnabled);
  let flagsDiff = 0;
  let mineFlagDiff = 0; // tracks change to correctlyFlaggedMines

  const isCurrentlyFlagged = cell.marker === CELL_MARKERS.FLAG;
  const isNextFlagged = nextMarker === CELL_MARKERS.FLAG;

  if (isCurrentlyFlagged && !isNextFlagged) {
    flagsDiff = -1;
    if (isCellMine) mineFlagDiff = -1;
  }

  if (!isCurrentlyFlagged && isNextFlagged) {
    flagsDiff = 1;
    if (isCellMine) mineFlagDiff = 1;
  }

  // Play placement sound whenever a marker (flag or question) is being set,
  // and removal sound whenever a marker is being cleared. This keeps the
  // question-mark step audible the same way as flagging/unflagging.
  if (nextMarker !== null) {
    playSFX('FLAG_PLACE');
  } else {
    playSFX('FLAG_REMOVE');
  }

  // Shallow-clone only the changed row and cell.
  const newRow = [...board[row]] as TBoard[number];
  newRow[col] = { ...cell, marker: nextMarker } as unknown as typeof cell;
  const newGameBoard = board.map((r, i) => (i === row ? newRow : r)) as TBoard;

  const newCorrectlyFlaggedMines = correctlyFlaggedMines + mineFlagDiff;
  const totalSafeCells = level.rows * level.cols - level.totalMines;

  if (
    checkGameWin(
      openedSafeCells,
      totalSafeCells,
      newCorrectlyFlaggedMines,
      level.totalMines,
    )
  ) {
    const wonBoard = produce<TBoard>(newGameBoard, (draft) => {
      revealBoard(draft, true);
    });
    useGameStore.setState((state) => ({
      board: wonBoard,
      gameStatus: 'won',
      totalFlags: state.totalFlags + flagsDiff,
      correctlyFlaggedMines: newCorrectlyFlaggedMines,
    }));
    playSFX('GAME_WIN');
    return;
  }

  useGameStore.setState((state) => ({
    board: newGameBoard,
    totalFlags: state.totalFlags + flagsDiff,
    correctlyFlaggedMines: newCorrectlyFlaggedMines,
  }));
};

export const handleCellInteraction = ({
  e,
  row,
  col,
}: HandleCellInteractionProps) => {
  const { isSettingsOpened } = useSettingsStore.getState();

  const isPointerMove = e.type === 'pointermove';
  const isPointerDown = e.type === 'pointerdown';
  const isPointerUp = e.type === 'pointerup';
  const isPointerCancelled = e.type === 'pointercancel';

  // Prevent interaction with the board if settings are opened
  if (isSettingsOpened) {
    if (isPointerDown) {
      isPointerSequenceBlocked = true;
    }

    if (isPointerUp || isPointerCancelled) {
      isPointerSequenceBlocked = false;
      cleanupTimers();
    }

    return undefined;
  }

  if (isPointerMove) {
    latestPointerCoordinates = { x: e.screenX, y: e.screenY };

    return undefined;
  }

  const isLeftClick =
    e.type === 'pointerup' && e.button === 0 && e.pointerType === 'mouse';
  const isRightClick = e.type === 'contextmenu' && e.button === 2;

  const isTouchDown = e.type === 'pointerdown' && e.pointerType === 'touch';
  const isTouchUp = e.type === 'pointerup' && e.pointerType === 'touch';

  const pointerCoordinates = { x: e.screenX, y: e.screenY };

  const contextMenuByHoldingFinger =
    e.button === -1 && e.type === 'contextmenu';

  const settingsState = useSettingsStore.getState();

  const isToggleMode = selectIsToggleMode(settingsState);
  const isGesturesMode = selectIsGesturesMode(settingsState);

  const isDigMode = selectIsDigMode(settingsState);
  const isFlagMode = selectIsFlagMode(settingsState);
  const isQuestionMarkEnabled = selectIsQuestionMarkEnabled(settingsState);

  if (isPointerSequenceBlocked) {
    if (isPointerUp || isPointerCancelled) {
      isPointerSequenceBlocked = false;
      cleanupTimers();
      return undefined;
    }

    if (!isPointerDown) {
      return undefined;
    }

    isPointerSequenceBlocked = false;
  }

  if (isPointerCancelled) {
    cleanupTimers();

    return undefined;
  }

  // Preload audio on first pointerdown so it's ready by pointerup
  if (isPointerDown && !useSFXStore.getState().isLoaded) {
    initSFX();
  }

  // Pointers
  if (isLeftClick) {
    if (shouldOpenCell(row, col)) {
      handleOpenCell(row, col);
    }
  }

  if (isRightClick) {
    e.preventDefault();

    if (shouldToggleMarker(row, col, isQuestionMarkEnabled)) {
      toggleMarker(row, col, isQuestionMarkEnabled);
    }
  }

  // Touchscreens
  if (isTouchDown) {
    pointerDownCoordinates = pointerCoordinates;
    latestPointerCoordinates = pointerCoordinates;

    if (isGesturesMode) {
      touchDownTime = new Date().getTime();

      touchHoldTimeoutId = window.setTimeout(() => {
        // Long finger press: Toggle flag in Gestures mode
        const latestCoordinates = getLatestPointerCoordinates();
        if (!latestCoordinates) {
          return undefined;
        }

        if (
          shouldToggleMarker(row, col, isQuestionMarkEnabled) &&
          !isPointerMoved(latestCoordinates.x, latestCoordinates.y)
        ) {
          toggleMarker(row, col, isQuestionMarkEnabled);
          cleanupTimers();
        }
      }, HOLD_TIME);
    }
  }

  if (isTouchUp) {
    latestPointerCoordinates = pointerCoordinates;
    const latestCoordinates = getLatestPointerCoordinates();
    const isTouchMoved = latestCoordinates
      ? isPointerMoved(latestCoordinates.x, latestCoordinates.y)
      : false;
    if (isTouchMoved) {
      cleanupTimers();
      return undefined;
    }

    e.preventDefault();

    const touchUpTime = new Date().getTime();

    // Tap
    // Gestures mode: short finger press
    // Toggle mode: just a touch up event (longevity of touchdown event doesn't matter)
    if (
      (isToggleMode && !touchDownTime) ||
      touchUpTime - touchDownTime! < HOLD_TIME
    ) {
      if (isGesturesMode) {
        if (shouldOpenCell(row, col)) {
          handleOpenCell(row, col);
        }
      }

      if (isToggleMode) {
        if (isDigMode) {
          if (shouldOpenCell(row, col)) {
            handleOpenCell(row, col);
          }
        }

        if (isFlagMode) {
          if (shouldToggleMarker(row, col, isQuestionMarkEnabled)) {
            toggleMarker(row, col, isQuestionMarkEnabled);
          }
        }
      }
    }

    cleanupTimers();
  }

  if (contextMenuByHoldingFinger) {
    e.preventDefault();
  }
};
