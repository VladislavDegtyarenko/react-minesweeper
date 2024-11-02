// Core
import { MouseEvent, useCallback, useEffect, useState } from "react";
import useTimer from "./useTimer";
import useSFX from "./useSFX";

// Constants
import { DEFAULT_LEVEL, LEVELS } from "../constants";

// Utils
import {
  checkGameWin,
  initBoard,
  initGame,
  revealAllMines,
  revealEmptyCells,
} from "../utils";

// Types
import type { OpenedMineCell, TBoard, TLevel } from "../types";

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
                ...cell,
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
    (row: number, col: number) => {
      if (
        isGameEnded ||
        gameBoard[row][col].isOpened ||
        gameBoard[row][col].isFlagged
      )
        return;

      if (!isTimerRunning) startTimer();

      const newGameBoard: TBoard = JSON.parse(JSON.stringify(gameBoard));
      const cell = newGameBoard[row][col];
      const isMineCell = cell.value === "mine";
      const isNumberCell = typeof cell.value === "number" && cell.value > 0;

      if (isMineCell) {
        (cell as OpenedMineCell).hightlight = "red";
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

      setGameBoard(newGameBoard);
    },
    [
      gameBoard,
      currentLevel,
      isGameEnded,
      isTimerRunning,
      playSoundEffect,
      startTimer,
    ]
  );

  const handleCellLeftClick = useCallback(
    (row: number, col: number) => {
      const mineCell = gameBoard[row][col].value === "mine";
      const isFirstClick = !isTimerRunning;
      const isFirstClickOnMine = mineCell && isFirstClick;

      if (isFirstClickOnMine) {
        let newGameBoard: TBoard;

        do {
          newGameBoard = initBoard(
            currentLevel.rows,
            currentLevel.cols,
            currentLevel.totalMines
          );
        } while (newGameBoard[row][col].value === "mine");

        setGameBoard(newGameBoard);
      }

      openCell(row, col);
    },
    [gameBoard, isTimerRunning, openCell, currentLevel]
  );

  const handleCellRightClick = useCallback(
    (e: MouseEvent<HTMLDivElement>, row: number, col: number) => {
      e.preventDefault();

      if (isGameEnded || gameBoard[row][col].isOpened) return;

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
    },
    [
      gameBoard,
      isGameEnded,
      isTimerRunning,
      currentLevel.totalMines,
      playSoundEffect,
      startTimer,
    ]
  );

  return {
    level,
    changeLevel,
    gameBoard,
    minesLeft,
    timeDiff,
    startNewGame,
    restartGame,
    handleCellLeftClick,
    handleCellRightClick,
    isGameWin,
    isGameOver,
    isGameEnded,
  };
};

export default useMinesweeperGame;
