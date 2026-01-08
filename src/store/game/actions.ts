import { useGameStore } from ".";
import { LevelId, TBoard } from "@/types";
import { initGame } from "@/utils";
import { getLevelById } from "@/utils/getLevelById";
import { stopTimer, resetTimer } from "../timer/actions";

export const changeLevel = (newLevelId: LevelId) => {
  useGameStore.setState({ level: getLevelById(newLevelId) });
};

export const resetBoard = (isRestart?: boolean) => {
  stopTimer();
  resetTimer();

  const { board, level } = useGameStore.getState();

  const newBoard = isRestart
    ? board.map((row) =>
        row.map((cell) => ({
          value: cell.value,
          isFlagged: false,
          isOpened: false,
        }))
      )
    : initGame(level);

  useGameStore.setState({
    board: newBoard as TBoard,
    totalFlags: 0,
    isGameWin: false,
    isGameOver: false,
  });
};

export const startNewGame = () => {
  resetBoard();
};

export const restartGame = () => {
  resetBoard(true);
};

export const setBoard = (board: TBoard) => {
  useGameStore.setState({ board });
};
