// Core
import { MouseEvent, useEffect, useState } from "react";
import useSFX from "./hooks/useSFX";

// UI
import Header from "./components/Header";
import Board from "./components/Board";
import Confetti from "react-confetti";
import SelectLevel from "./components/SelectLevel";

// Functions
import {
  checkGameWin,
  initBoard,
  revealAllMines,
  revealEmptyCells,
} from "./utils";

// Styles
import "./App.css";

// Types
import type { TBoard, OpenedMineCell, TLevel } from "./types";

// Constants
import { DEFAULT_LEVEL, LEVELS } from "./utils/constants";
import useTimer from "./hooks/useTimer";

const INITIAL_BOARD = initBoard(
  LEVELS[DEFAULT_LEVEL].rows,
  LEVELS[DEFAULT_LEVEL].cols,
  LEVELS[DEFAULT_LEVEL].totalMines
);

function App() {
  const [level, setLevel] = useState<TLevel>("easy");
  const currentLevel = LEVELS[level];

  const [gameBoard, setGameBoard] = useState<TBoard>(INITIAL_BOARD);

  const [isGameWin, setIsGameWin] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const isGameEnded = isGameWin || isGameOver;

  const [totalFlags, setTotalFlags] = useState(0);
  const minesLeft = currentLevel.totalMines - totalFlags;

  const { timeDiff, isTimerRunning, startTimer, stopTimer, resetTimer } =
    useTimer();

  const { playSoundEffect } = useSFX();

  useEffect(() => {
    if (isGameEnded) {
      stopTimer();
    }
  }, [isGameEnded]);

  useEffect(() => {
    newGame();
  }, [level]);

  const newGame = () => {
    stopTimer();
    resetTimer();
    setTotalFlags(0);
    setGameBoard(
      initBoard(currentLevel.rows, currentLevel.cols, currentLevel.totalMines)
    );
    setIsGameOver(false);
    setIsGameWin(false);
  };

  const restartGame = () => {
    stopTimer();
    resetTimer();
    setTotalFlags(0);
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
    setIsGameOver(false);
    setIsGameWin(false);
  };

  const changeLevel = (selectedLevel: TLevel) => {
    setLevel(selectedLevel);
  };

  const openCell = (row: number, col: number) => {
    if (isGameEnded) return;

    if (!isTimerRunning) startTimer();

    setGameBoard((prevGameBoard) => {
      const cell = prevGameBoard[row][col];

      const mineCell = cell.value === "mine";
      const flaggedCell = cell.isFlagged;
      const openedCell = cell.isOpened;
      const numberCell = typeof cell.value === "number";
      const zeroCell = cell.value === 0;

      if (openedCell || flaggedCell) {
        return prevGameBoard; // Prevent re-render for opened/flagged cells
      }

      // Number cell click
      if (numberCell) {
        const newGameBoard: TBoard = JSON.parse(JSON.stringify(prevGameBoard));

        if (zeroCell) {
          revealEmptyCells(
            newGameBoard,
            currentLevel.rows,
            currentLevel.cols,
            row,
            col
          );
        }

        // Open the cell
        newGameBoard[row][col].isOpened = true;

        // Check for win
        const isWin = checkGameWin(newGameBoard, currentLevel.totalMines);

        if (isWin) {
          revealAllMines(newGameBoard, true);
          setIsGameWin(true);
          playSoundEffect("GAME_WIN");

          console.log("You win!");
        } else {
          playSoundEffect(zeroCell ? "REVEAL_EMPTY" : "REVEAL_NUMBER");
        }

        return newGameBoard;
      }

      // Mine cell click
      if (mineCell) {
        const newGameBoard: TBoard = JSON.parse(JSON.stringify(prevGameBoard));

        newGameBoard[row][col].isOpened = true;
        (newGameBoard[row][col] as OpenedMineCell).hightlight = "red";

        setIsGameOver(true);
        playSoundEffect("GAME_OVER");
        revealAllMines(newGameBoard);
        return newGameBoard;
      }

      return prevGameBoard;
    });
  };

  const handleCellLeftClick = (row: number, col: number) => {
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
  };

  const handleCellRightClick = (
    e: MouseEvent<HTMLDivElement>,
    row: number,
    col: number
  ) => {
    e.preventDefault();

    if (isGameEnded) return;

    if (!isTimerRunning) startTimer();

    let flagsDiff = 0;

    setGameBoard((prevGameBoard) => {
      const newGameBoard: TBoard = JSON.parse(JSON.stringify(prevGameBoard));
      const cell = prevGameBoard[row][col];

      if (cell.isOpened === false) {
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

        return newGameBoard;
      }

      return prevGameBoard;
    });

    setTotalFlags((prevTotalFlags) => prevTotalFlags + flagsDiff);
  };

  return (
    <div className="game">
      <Header
        isGameWin={isGameWin}
        isGameOver={isGameOver}
        isGameEnded={isGameEnded}
        minesLeft={minesLeft}
        newGame={newGame}
        restartGame={restartGame}
        timeDiff={timeDiff}
      />
      <Board
        gameBoard={gameBoard}
        handleCellLeftClick={handleCellLeftClick}
        handleCellRightClick={handleCellRightClick}
        level={level}
      />
      <SelectLevel level={level} changeLevel={changeLevel} />
      {isGameWin && <Confetti />}
    </div>
  );
}

export default App;
