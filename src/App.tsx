// Core
import { MouseEvent, useEffect, useRef, useState } from "react";
import useSFX from "./hooks/useSFX";
import { LEVELS } from "./utils/constants";

// UI
import Cell from "./components/Cell";
import Confetti from "react-confetti";
import SelectLevel from "./components/SelectLevel";

// Functions
import {
  checkGameWin,
  getTimeDiff,
  initBoard,
  revealAllMines,
  revealEmptyCells,
} from "./utils";

// Styles
import "./App.css";

// Types
import { Board } from "./types";

function App() {
  const [level, setLevel] = useState(LEVELS[0]);
  const [gameBoard, setGameBoard] = useState<Board>(
    initBoard(level.rows, level.cols, level.totalMines)
    // MOCK_WINNING_BOARD
  );

  const [isGameWin, setIsGameWin] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const [totalFlags, setTotalFlags] = useState(0);
  const minesLeft = level.totalMines - totalFlags;

  const timerInterval = useRef<null | number>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [timeNow, setTimeNow] = useState<Date | null>(null);

  const { playSoundEffect } = useSFX();

  useEffect(() => {
    if (!startTime) {
      // runTimer()
      return;
    }

    if (isGameOver || isGameWin) {
      clearInterval(timerInterval.current!);
      return;
    }

    timerInterval.current = setInterval(() => {
      setTimeNow(new Date());
    }, 1000);

    return () => clearInterval(timerInterval.current!);
  }, [startTime, isGameOver, isGameWin]);

  const newGame = (rows: number, cols: number, totalMines: number) => {
    clearInterval(timerInterval.current!);
    setStartTime(null);
    setTimeNow(null);
    setTotalFlags(0);
    setGameBoard(initBoard(rows, cols, totalMines));
    setIsGameOver(false);
    setIsGameWin(false);
  };

  const restartGame = () => {
    clearInterval(timerInterval.current!);
    setStartTime(null);
    setTimeNow(null);
    setTotalFlags(0);
    setGameBoard((prevGameBoard) =>
      prevGameBoard.map((row) =>
        row.map((cell) => {
          return {
            ...cell,
            mark: null,
            isOpened: false,
          };
        })
      )
    );
    setIsGameOver(false);
    setIsGameWin(false);
  };

  const changeLevel = (selectedLevelName: string) => {
    const selectedLevel = LEVELS.find(
      (level) => level.name === selectedLevelName
    );

    if (!selectedLevel) return;

    setLevel(selectedLevel);
    newGame(selectedLevel.rows, selectedLevel.cols, selectedLevel.totalMines);
  };

  const runTimer = () => {
    setStartTime(new Date());
  };

  const handleCellLeftClick = (row: number, col: number) => {
    if (isGameOver || isGameWin) return;

    if (!startTime) runTimer();

    setGameBoard((prevGameBoard) => {
      const cell = prevGameBoard[row][col];

      const mineCell = cell.value === "mine";
      const markedCell = cell.mark !== null;
      const openedCell = cell.isOpened;
      const numberCell = typeof cell.value === "number";
      const zeroCell = cell.value === 0;

      if (openedCell || markedCell) {
        return prevGameBoard; // Prevent re-render for clicked/marked cells
      }

      // Number cell click
      if (numberCell) {
        // If cell is 0, reveal adjacent cells
        // or deep copy otherwise
        const newGameBoard = zeroCell
          ? revealEmptyCells(prevGameBoard, level.rows, level.cols, row, col)
          : JSON.parse(JSON.stringify(prevGameBoard));

        // Open the cell
        newGameBoard[row][col].isOpened = true;

        // Check for win
        const isWin = checkGameWin(newGameBoard, level.totalMines);

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
        const newGameBoard = JSON.parse(JSON.stringify(prevGameBoard));

        // Open the cell
        newGameBoard[row][col].isOpened = true;
        newGameBoard[row][col].hightlight = "red";

        // Reveal all mines (mutating)
        revealAllMines(newGameBoard);

        setIsGameOver(true);
        playSoundEffect("GAME_OVER");

        console.log("Game Over!");

        return newGameBoard;
      }

      return prevGameBoard;
    });
  };

  const handleCellRightClick = (
    e: MouseEvent<HTMLDivElement>,
    row: number,
    col: number
  ) => {
    e.preventDefault();

    if (isGameOver || isGameWin) return;

    if (!startTime) runTimer();

    let flagsDiff = 0;

    setGameBoard((prevGameBoard) => {
      const newGameBoard: Board = JSON.parse(JSON.stringify(prevGameBoard));
      const cell = prevGameBoard[row][col];

      if (cell.isOpened === false) {
        switch (cell.mark) {
          case null:
            newGameBoard[row][col].mark = "flag";
            // Increment totalFlags
            if (!flagsDiff) flagsDiff++;
            playSoundEffect("MARK_FLAG");
            break;

          case "flag":
            newGameBoard[row][col].mark = "question";
            // Decrement totalFlags
            if (!flagsDiff) flagsDiff--;
            playSoundEffect("MARK_QUESTION");
            break;

          case "question":
            newGameBoard[row][col].mark = null;
            playSoundEffect("MARK_REMOVE");
            break;
        }

        return newGameBoard;
      }

      return prevGameBoard;
    });

    setTotalFlags((prevTotalFlags) => prevTotalFlags + flagsDiff);
  };

  return (
    <div className="game">
      <header>
        <div className="header-label">
          {isGameWin ? (
            <span className="win">You win!</span>
          ) : isGameOver ? (
            <span className="game-over">Game over!</span>
          ) : (
            <>
              <img src="/icons/bomb.svg" className="header-icon" />
              {minesLeft}
            </>
          )}
        </div>
        <div className="header-buttons">
          <button
            onClick={() => {
              newGame(level.rows, level.cols, level.totalMines);
            }}
          >
            New
          </button>
          <button
            onClick={() => {
              restartGame();
            }}
          >
            Restart
          </button>
        </div>
        <div className="header-label">
          <img src="/icons/timer.svg" className="header-icon" />
          {getTimeDiff(timeNow, startTime)}
        </div>
      </header>
      <div className="board">
        {gameBoard.map((rows, rowIndex) => (
          <div className="row" key={rowIndex}>
            {rows.map((cell, cellIndex) => (
              <Cell
                cell={cell}
                rowIndex={rowIndex}
                cellIndex={cellIndex}
                handleCellLeftClick={handleCellLeftClick}
                handleCellRightClick={handleCellRightClick}
                level={level.name}
                key={cellIndex}
              />
            ))}
          </div>
        ))}
      </div>
      <SelectLevel level={level.name} changeLevel={changeLevel} />
      {isGameWin && <Confetti />}
    </div>
  );
}

export default App;
