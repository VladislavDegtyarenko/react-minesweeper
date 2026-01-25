import { LevelId, TBoard } from '@/types';
import { initGame } from '@/utils';
import { getLevelById } from '@/utils/getLevelById';
import { resetTimer, stopTimer } from '../timer/actions';
import { useGameStore } from './store';

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
        })),
      )
    : initGame(level);

  useGameStore.setState({
    board: newBoard as TBoard,
    totalFlags: 0,
    gameStatus: 'idle',
    isGameRestarted: Boolean(isRestart),
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

export const togglePause = () => {
  const { gameStatus } = useGameStore.getState();

  if (gameStatus === 'won' || gameStatus === 'lost' || gameStatus === 'idle') {
    return undefined;
  }

  useGameStore.setState((state) => ({
    gameStatus: state.gameStatus === 'paused' ? 'playing' : 'paused',
  }));
};
