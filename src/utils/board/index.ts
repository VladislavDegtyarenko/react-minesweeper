import { useGameStore } from '@/store/game';
import { setBoard } from '@/store/game/actions';
import { selectGameStatus, selectMinesLeft } from '@/store/game/selectors';
import { useSettingsStore } from '@/store/settings';
import {
  selectIsDigMode,
  selectIsFlagMode,
  selectIsGesturesMode,
  selectIsToggleMode,
} from '@/store/settings/selectors';
import { useSFXStore } from '@/store/sfx';
import { initSFX, playSFX } from '@/store/sfx/actions';
import { useTimerStore } from '@/store/timer';
import { startTimer } from '@/store/timer/actions';
import { selectIsTimerRunning } from '@/store/timer/selectors';
import { TBoard } from '@/types';
import { produce } from 'immer';
import { checkGameWin } from '../checkGameWin';
import { initBoard } from '../init';
import { revealAllMines } from '../revealAllMines';
import { revealEmptyCells } from '../revealEmptyCells';
import type { HandleCellInteractionProps } from './types';

const HOLD_TIME = 250;

let touchDownTime: number | null = null;
let touchHoldTimeoutId: number | null = null;
let pointerDownCoordinates: { x: number; y: number } | null = null;
let latestPointerCoordinates: { x: number; y: number } | null = null;
const getLatestPointerCoordinates = (): { x: number; y: number } | null => {
  if (latestPointerCoordinates) {
    return latestPointerCoordinates;
  }

  return pointerDownCoordinates;
};
let isPointerMoved = (x: number, y: number, delta = 0.5): boolean => {
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

const shouldOpenCell = (row: number, col: number): boolean => {
  const state = useGameStore.getState();
  const { board } = state;
  const gameStatus = selectGameStatus(state);
  const isCellOpened = board[row][col].isOpened;
  const isCellFlagged = board[row][col].isFlagged;

  if (
    gameStatus === 'won' ||
    gameStatus === 'lost' ||
    isCellOpened ||
    isCellFlagged
  ) {
    return false;
  }

  return true;
};

const openCell = (board: TBoard, row: number, col: number): TBoard | null => {
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

  return produce<TBoard>(board, (draft) => {
    const cell = draft[row][col];
    const isMineCell = cell.value === 'mine';
    const isNumberCell = typeof cell.value === 'number' && cell.value > 0;

    if (isMineCell) {
      cell.highlight = 'red';
      useGameStore.setState({ gameStatus: 'lost' });
      playSFX('GAME_OVER');
      revealAllMines(draft);
    }

    if (!isMineCell) {
      const { level } = useGameStore.getState();

      cell.isOpened = true;
      if (cell.value === 0) {
        playSFX('REVEAL_EMPTY');
        revealEmptyCells(draft, level.rows, level.cols, row, col);
      }

      if (isNumberCell) {
        playSFX('REVEAL_NUMBER');
      }

      if (checkGameWin(draft as TBoard, level.totalMines)) {
        revealAllMines(draft, true);
        useGameStore.setState({ gameStatus: 'won' });
        playSFX('GAME_WIN');
      }
    }
  });
};

export const handleOpenCell = (row: number, col: number) => {
  const { board, level, isGameRestarted } = useGameStore.getState();

  const isMineCell = board[row][col].value === 'mine';
  const isFirstClick =
    !selectIsTimerRunning(useTimerStore.getState()) &&
    selectGameStatus(useGameStore.getState()) === 'idle';
  const isFirstClickOnMine = isMineCell && isFirstClick;

  let newGameBoard: TBoard;

  if (isFirstClickOnMine && !isGameRestarted) {
    do {
      newGameBoard = initBoard(level);
    } while (newGameBoard[row][col].value === 'mine');
  } else {
    newGameBoard = board;
  }

  const boardAfterOpeningCell = openCell(newGameBoard, row, col);

  if (boardAfterOpeningCell) {
    setBoard(boardAfterOpeningCell);
  }
};

const shouldToggleFlag = (row: number, col: number): boolean => {
  const { board } = useGameStore.getState();
  const gameStatus = selectGameStatus(useGameStore.getState());
  const minesLeft = selectMinesLeft(useGameStore.getState());

  const isCellOpened = board[row][col].isOpened;
  const isCellNotFlagged = !board[row][col].isFlagged;
  const allFlagsPlaced = minesLeft === 0;

  if (
    gameStatus === 'won' ||
    gameStatus === 'lost' ||
    isCellOpened ||
    (allFlagsPlaced && isCellNotFlagged)
  ) {
    return false;
  }

  return true;
};

const toggleFlag = (row: number, col: number) => {
  if (!selectIsTimerRunning(useTimerStore.getState())) {
    startTimer();
  }

  if (selectGameStatus(useGameStore.getState()) === 'idle') {
    useGameStore.setState({ gameStatus: 'playing' });
  }

  const { board, level } = useGameStore.getState();
  const cell = board[row][col];
  let flagsDiff = 0;

  const newGameBoard = produce<TBoard>(board, (draft) => {
    if (cell.isFlagged) {
      draft[row][col].isFlagged = false;
      flagsDiff = -1;
      playSFX('FLAG_REMOVE');
    } else {
      draft[row][col].isFlagged = true;
      flagsDiff = 1;
      playSFX('FLAG_PLACE');
    }

    if (checkGameWin(draft as TBoard, level.totalMines)) {
      revealAllMines(draft, true);
      useGameStore.setState({ gameStatus: 'won' });
      playSFX('GAME_WIN');
    }
  });

  useGameStore.setState((state) => ({
    board: newGameBoard,
    totalFlags: state.totalFlags + flagsDiff,
  }));
};

export const handleCellInteraction = ({
  e,
  row,
  col,
}: HandleCellInteractionProps) => {
  const isPointerMove = e.type === 'pointermove';

  if (isPointerMove) {
    latestPointerCoordinates = { x: e.screenX, y: e.screenY };

    return undefined;
  }

  const isPointerDown = e.type === 'pointerdown';
  const isLeftClick =
    e.type === 'pointerup' && e.button === 0 && e.pointerType === 'mouse';
  const isRightClick = e.type === 'contextmenu' && e.button === 2;

  const isTouchDown = e.type === 'pointerdown' && e.pointerType === 'touch';
  const isTouchUp = e.type === 'pointerup' && e.pointerType === 'touch';

  const pointerCoordinates = { x: e.screenX, y: e.screenY };

  const isPointerCancelled = e.type === 'pointercancel';

  const contextMenuByHoldingFinger =
    e.button === -1 && e.type === 'contextmenu';

  const settingsState = useSettingsStore.getState();

  const isToggleMode = selectIsToggleMode(settingsState);
  const isGesturesMode = selectIsGesturesMode(settingsState);

  const isDigMode = selectIsDigMode(settingsState);
  const isFlagMode = selectIsFlagMode(settingsState);

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

    if (shouldToggleFlag(row, col)) {
      toggleFlag(row, col);
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
          shouldToggleFlag(row, col) &&
          !isPointerMoved(latestCoordinates.x, latestCoordinates.y)
        ) {
          toggleFlag(row, col);
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
          if (shouldToggleFlag(row, col)) {
            toggleFlag(row, col);
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
