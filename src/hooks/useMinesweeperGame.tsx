// Core
import { useCallback, useEffect, useRef, useState } from "react";
import useTimer from "./useTimer";
import useSFX from "./useSFX";

// Constants
import { DEFAULT_LEVEL, LEVELS, HOLD_TIME } from "../constants";

// Utils
import {
  checkGameWin,
  initBoard,
  initGame,
  revealAllMines,
  revealEmptyCells,
} from "../utils";

// Types
import type { TBoard, TLevel } from "../types";

const useMinesweeperGame = () => {
  const [level, setLevel] = useState<TLevel>("easy");
  const currentLevel = LEVELS[level];

  const changeLevel = useCallback((selectedLevel: TLevel) => {
    setLevel(selectedLevel);
  }, []);

  const [gameBoard, setGameBoard] = useState<TBoard>(
    initGame(
      LEVELS[DEFAULT_LEVEL].rows,
      LEVELS[DEFAULT_LEVEL].cols,
      LEVELS[DEFAULT_LEVEL].totalMines
    )
  );

  //   useEffect(() => {
  //     localStorage.setItem(
  //       LOCAL_STORAGE_KEYS.gameBoard,
  //       JSON.stringify(gameBoard)
  //     );
  //   }, [gameBoard]);

  const [isGameWin, setIsGameWin] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const isGameEnded = isGameWin || isGameOver;

  const [totalFlags, setTotalFlags] = useState(0);
  const minesLeft = currentLevel.totalMines - totalFlags;

  const { timeDiff, isTimerRunning, startTimer, stopTimer, resetTimer } =
    useTimer();

  const { playSoundEffect } = useSFX();

  const resetBoard = useCallback(
    (isRestart?: boolean) => {
      stopTimer();
      resetTimer();
      setTotalFlags(0);
      setIsGameOver(false);
      setIsGameWin(false);

      if (isRestart) {
        setGameBoard((prevGameBoard) =>
          prevGameBoard.map((row) =>
            row.map((cell) => {
              return {
                value: cell.value,
                isFlagged: false,
                isOpened: false,
              };
            })
          )
        );
      } else {
        setGameBoard(
          initGame(
            currentLevel.rows,
            currentLevel.cols,
            currentLevel.totalMines
          )
        );
      }
    },
    [currentLevel, resetTimer, stopTimer]
  );

  const startNewGame = useCallback(() => {
    resetBoard();
  }, [resetBoard]);

  const restartGame = useCallback(() => {
    resetBoard(true);
  }, [resetBoard]);

  useEffect(() => {
    if (isGameEnded) {
      stopTimer();
    }
  }, [isGameEnded, stopTimer]);

  useEffect(() => {
    startNewGame();
  }, [level, startNewGame]);

  const openCell = useCallback(
    (board: TBoard, row: number, col: number): TBoard | null => {
      if (!isTimerRunning) startTimer();

      const newGameBoard: TBoard = JSON.parse(JSON.stringify(board));
      const cell = newGameBoard[row][col];
      const isMineCell = cell.value === "mine";
      const isNumberCell = typeof cell.value === "number" && cell.value > 0;

      if (isMineCell) {
        cell.highlight = "red";
        setIsGameOver(true);
        playSoundEffect("GAME_OVER");
        revealAllMines(newGameBoard);
      }

      if (!isMineCell) {
        cell.isOpened = true;
        if (cell.value === 0) {
          playSoundEffect("REVEAL_EMPTY");

          revealEmptyCells(
            newGameBoard,
            currentLevel.rows,
            currentLevel.cols,
            row,
            col
          );
        }

        if (isNumberCell) {
          playSoundEffect("REVEAL_NUMBER");
        }

        if (checkGameWin(newGameBoard, currentLevel.totalMines)) {
          revealAllMines(newGameBoard, true);
          setIsGameWin(true);
          playSoundEffect("GAME_WIN");
        }
      }

      return newGameBoard;
    },
    [currentLevel, isTimerRunning, playSoundEffect, startTimer]
  );

  const shouldOpenCell = (row: number, col: number): boolean => {
    if (
      isGameEnded ||
      gameBoard[row][col].isOpened ||
      gameBoard[row][col].isFlagged
    ) {
      return false;
    }

    return true;
  };

  const handleOpenCell = (row: number, col: number) => {
    const mineCell = gameBoard[row][col].value === "mine";
    const isFirstClick = !isTimerRunning;
    const isFirstClickOnMine = mineCell && isFirstClick;

    let newGameBoard: TBoard;

    if (isFirstClickOnMine) {
      do {
        newGameBoard = initBoard(
          currentLevel.rows,
          currentLevel.cols,
          currentLevel.totalMines
        );
      } while (newGameBoard[row][col].value === "mine");
    } else {
      newGameBoard = JSON.parse(JSON.stringify(gameBoard));
    }

    const boardAfterOpeningCell = openCell(newGameBoard, row, col);

    if (boardAfterOpeningCell) {
      setGameBoard(boardAfterOpeningCell);
    }
  };

  const shouldToggleFlag = (row: number, col: number): boolean => {
    if (isGameEnded || gameBoard[row][col].isOpened) return false;

    return true;
  };

  const toggleFlag = (row: number, col: number) => {
    if (!isTimerRunning) startTimer();

    let flagsDiff = 0;

    setGameBoard((prevGameBoard) => {
      const newGameBoard: TBoard = JSON.parse(JSON.stringify(prevGameBoard));
      const cell = prevGameBoard[row][col];

      if (cell.isFlagged) {
        newGameBoard[row][col].isFlagged = false;
        if (!flagsDiff) flagsDiff--;
        playSoundEffect("FLAG_REMOVE");
      }

      if (!cell.isFlagged) {
        newGameBoard[row][col].isFlagged = true;
        if (!flagsDiff) flagsDiff++;
        playSoundEffect("FLAG_PLACE");
      }

      if (checkGameWin(newGameBoard, currentLevel.totalMines)) {
        revealAllMines(newGameBoard, true);
        setIsGameWin(true);
        playSoundEffect("GAME_WIN");
      }

      return newGameBoard;
    });

    setTotalFlags((prevTotalFlags) => prevTotalFlags + flagsDiff);
  };

  const touchDownTimeRef = useRef<number | null>(null);
  const touchHoldTimeoutRef = useRef<null | number>(null);

  const cleanupTimers = () => {
    clearTimeout(touchHoldTimeoutRef.current!);
    touchHoldTimeoutRef.current = null;
    touchDownTimeRef.current = null;
  };

  const handleCellInteraction = (e: PointerEvent, row: number, col: number) => {
    const isLeftClick =
      e.type === "pointerup" && e.button === 0 && e.pointerType === "mouse";
    const isRightClick = e.type === "contextmenu" && e.button === 2; // test with real mouse

    const isTouchDown = e.type === "pointerdown" && e.pointerType === "touch";
    const isTouchUp = e.type === "pointerup" && e.pointerType === "touch";

    const contextMenuByHoldingFinger =
      e.button === -1 && e.type === "contextmenu";

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

    if (isTouchUp) {
      e.preventDefault();

      const touchUpTime = new Date().getTime();

      if (touchUpTime - touchDownTimeRef.current! < HOLD_TIME) {
        if (shouldOpenCell(row, col)) {
          handleOpenCell(row, col);
        }
      }

      cleanupTimers();
    }

    if (isTouchDown && shouldToggleFlag(row, col)) {
      touchDownTimeRef.current = new Date().getTime();

      touchHoldTimeoutRef.current = setTimeout(() => {
        toggleFlag(row, col);
        cleanupTimers();
      }, HOLD_TIME);
    }

    if (contextMenuByHoldingFinger) {
      e.preventDefault();
    }
  };

  return {
    level,
    changeLevel,
    gameBoard,
    minesLeft,
    timeDiff,
    startNewGame,
    restartGame,
    handleCellInteraction,
    isGameWin,
    isGameOver,
    isGameEnded,
  };
};

export default useMinesweeperGame;
