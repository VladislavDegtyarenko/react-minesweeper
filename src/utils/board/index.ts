import { useGameStore } from "@/store/game";
import type { HandleCellInteractionProps } from "./types";
import { selectIsGameEnded, selectMinesLeft } from "@/store/game/selectors";
import { setBoard } from "@/store/game/actions";
import { useTimerStore } from "@/store/timer";
import { selectIsTimerRunning } from "@/store/timer/selectors";
import { startTimer } from "@/store/timer/actions";
import { playSFX, initSFX } from "@/store/sfx/actions";
import { useSFXStore } from "@/store/sfx";
import { TBoard } from "@/types";
import { initBoard } from "../init";
import { deepClone } from "../deepClone";
import { revealAllMines } from "../revealAllMines";
import { revealEmptyCells } from "../revealEmptyCells";
import { checkGameWin } from "../checkGameWin";
import { produce } from "immer";

const HOLD_TIME = 300;

let touchDownTime: number | null = null;
let touchHoldTimeoutId: number | null = null;

const cleanupTimers = () => {
  if (touchHoldTimeoutId) {
    clearTimeout(touchHoldTimeoutId);
  }

  touchHoldTimeoutId = null;
  touchDownTime = null;
};

const shouldOpenCell = (row: number, col: number): boolean => {
  const state = useGameStore.getState();
  const { board } = state;
  const isGameEnded = selectIsGameEnded(state);
  const isCellOpened = board[row][col].isOpened;
  const isCellFlagged = board[row][col].isFlagged;

  if (isGameEnded || isCellOpened || isCellFlagged) {
    return false;
  }

  return true;
};

const openCell = (board: TBoard, row: number, col: number): TBoard | null => {
  if (!selectIsTimerRunning(useTimerStore.getState())) {
    startTimer();
  }

  return produce<TBoard>(board, (draft) => {
    const cell = draft[row][col];
    const isMineCell = cell.value === "mine";
    const isNumberCell = typeof cell.value === "number" && cell.value > 0;

    if (isMineCell) {
      cell.highlight = "red";
      useGameStore.setState({ isGameOver: true });
      playSFX("GAME_OVER");
      revealAllMines(draft);
    }

    if (!isMineCell) {
      const { level } = useGameStore.getState();

      cell.isOpened = true;
      if (cell.value === 0) {
        playSFX("REVEAL_EMPTY");
        revealEmptyCells(draft, level.rows, level.cols, row, col);
      }

      if (isNumberCell) {
        playSFX("REVEAL_NUMBER");
      }

      if (checkGameWin(draft as TBoard, level.totalMines)) {
        revealAllMines(draft, true);
        useGameStore.setState({ isGameWin: true });
        playSFX("GAME_WIN");
      }
    }
  });
};

export const handleOpenCell = (row: number, col: number) => {
  const { board, level } = useGameStore.getState();

  const isMineCell = board[row][col].value === "mine";
  const isFirstClick = !selectIsTimerRunning(useTimerStore.getState());
  const isFirstClickOnMine = isMineCell && isFirstClick;

  let newGameBoard: TBoard;

  if (isFirstClickOnMine) {
    do {
      newGameBoard = initBoard(level);
    } while (newGameBoard[row][col].value === "mine");
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
  const isGameEnded = selectIsGameEnded(useGameStore.getState());
  const minesLeft = selectMinesLeft(useGameStore.getState());

  const isCellOpened = board[row][col].isOpened;
  const isCellNotFlagged = !board[row][col].isFlagged;
  const allFlagsPlaced = minesLeft === 0;

  if (isGameEnded || isCellOpened || (allFlagsPlaced && isCellNotFlagged)) {
    return false;
  }

  return true;
};

const toggleFlag = (row: number, col: number) => {
  if (!selectIsTimerRunning(useTimerStore.getState())) {
    startTimer();
  }

  const { board, level } = useGameStore.getState();
  const cell = board[row][col];
  let flagsDiff = 0;

  const newGameBoard = produce<TBoard>(board, (draft) => {
    if (cell.isFlagged) {
      draft[row][col].isFlagged = false;
      flagsDiff = -1;
      playSFX("FLAG_REMOVE");
    } else {
      draft[row][col].isFlagged = true;
      flagsDiff = 1;
      playSFX("FLAG_PLACE");
    }

    if (checkGameWin(draft as TBoard, level.totalMines)) {
      revealAllMines(draft, true);
      useGameStore.setState({ isGameWin: true });
      playSFX("GAME_WIN");
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
  onFlagToggle,
}: HandleCellInteractionProps) => {
  const isPointerDown = e.type === "pointerdown";
  const isLeftClick =
    e.type === "pointerup" && e.button === 0 && e.pointerType === "mouse";
  const isRightClick = e.type === "contextmenu" && e.button === 2;

  const isTouchDown = e.type === "pointerdown" && e.pointerType === "touch";
  const isTouchUp = e.type === "pointerup" && e.pointerType === "touch";

  const contextMenuByHoldingFinger =
    e.button === -1 && e.type === "contextmenu";

  // Preload audio on first pointerdown so it's ready by pointerup
  if (isPointerDown && !useSFXStore.getState().isLoaded) {
    initSFX();
  }

  if (isLeftClick) {
    if (shouldOpenCell(row, col)) {
      handleOpenCell(row, col);
    }
  }

  if (isRightClick) {
    e.preventDefault();

    if (shouldToggleFlag(row, col)) {
      toggleFlag(row, col);
      onFlagToggle?.();
    }
  }

  if (isTouchUp) {
    e.preventDefault();

    const touchUpTime = new Date().getTime();

    if (touchUpTime - touchDownTime! < HOLD_TIME) {
      if (shouldOpenCell(row, col)) {
        handleOpenCell(row, col);
      }
    }

    cleanupTimers();
  }

  if (isTouchDown) {
    touchDownTime = new Date().getTime();

    touchHoldTimeoutId = window.setTimeout(() => {
      if (shouldToggleFlag(row, col)) {
        toggleFlag(row, col);
        onFlagToggle?.();

        cleanupTimers();
      }
    }, HOLD_TIME);
  }

  if (contextMenuByHoldingFinger) {
    e.preventDefault();
  }
};
