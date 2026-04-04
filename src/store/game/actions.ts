import { LevelId, TBoard } from '@/types';
import { initGame } from '@/utils';
import { getLevelById } from '@/utils/getLevelById';
import { resetTimer, stopTimer } from '../timer/actions';
import { useGameStore, type GameStatusBeforeLevelChange } from './store';

export const changeLevel = (newLevelId: LevelId) => {
  useGameStore.setState({ level: getLevelById(newLevelId) });
};

const setLevelChangeDialogState = (
  pendingLevelId: LevelId | null,
  gameStatusBeforeLevelChange: GameStatusBeforeLevelChange | null,
) => {
  useGameStore.setState({
    isLevelChangeDialogOpen: Boolean(pendingLevelId),
    pendingLevelId,
    gameStatusBeforeLevelChange,
  });
};

export const requestLevelChange = (newLevelId: LevelId) => {
  const { gameStatus, level } = useGameStore.getState();

  if (level.id === newLevelId) {
    return undefined;
  }

  if (gameStatus === 'idle' || gameStatus === 'won' || gameStatus === 'lost') {
    changeLevel(newLevelId);
    return undefined;
  }

  if (gameStatus === 'playing') {
    setLevelChangeDialogState(newLevelId, 'playing');
    useGameStore.setState({ gameStatus: 'paused' });

    return undefined;
  }

  if (gameStatus === 'paused') {
    setLevelChangeDialogState(newLevelId, 'paused');
  }

  return undefined;
};

export const confirmLevelChange = () => {
  const { pendingLevelId } = useGameStore.getState();

  if (!pendingLevelId) {
    return undefined;
  }

  setLevelChangeDialogState(null, null);
  changeLevel(pendingLevelId);

  return undefined;
};

export const cancelLevelChange = () => {
  const { gameStatusBeforeLevelChange } = useGameStore.getState();

  setLevelChangeDialogState(null, null);

  if (gameStatusBeforeLevelChange === 'playing') {
    useGameStore.setState({ gameStatus: 'playing' });
    return undefined;
  }

  if (gameStatusBeforeLevelChange === 'paused') {
    useGameStore.setState({ gameStatus: 'paused' });
  }

  return undefined;
};

export const resetBoard = (isRestart?: boolean) => {
  stopTimer();
  resetTimer();

  const { board, level } = useGameStore.getState();

  const newBoard = isRestart
    ? board.map((row) =>
        row.map((cell) => ({
          value: cell.value,
          marker: null,
          isOpened: false,
        })),
      )
    : initGame(level);

  useGameStore.setState({
    board: newBoard as TBoard,
    totalFlags: 0,
    gameStatus: 'idle',
    isLevelChangeDialogOpen: false,
    pendingLevelId: null,
    gameStatusBeforeLevelChange: null,
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
  const { gameStatus, isLevelChangeDialogOpen } = useGameStore.getState();

  if (
    gameStatus === 'won' ||
    gameStatus === 'lost' ||
    gameStatus === 'idle' ||
    isLevelChangeDialogOpen
  ) {
    return undefined;
  }

  useGameStore.setState((state) => ({
    gameStatus: state.gameStatus === 'paused' ? 'playing' : 'paused',
  }));
};
