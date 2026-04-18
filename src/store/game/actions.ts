import { CELL_MARKERS } from '@/constants';
import type { LevelId } from '@/types';
import { createBoardLayout, createBoardState } from '@/utils';
import { checkGameWin } from '@/utils/checkGameWin';
import { revealBoard } from '@/utils/board/revealBoard';
import { revealEmptyCells } from '@/utils/board/revealEmptyCells';
import { countCorrectFlags, updateCellViews } from '@/utils/board/utils';
import { playSFX } from '@/store/sfx/actions';
import { resetTimer, stopTimer } from '../timer/actions';
import { getLevelById } from '@/utils/getLevelById';
import { useGameStore } from './store';
import { cloneBoard, createGameState, getBoardLayout, getNextMarker } from './utils';
import type {
  GameState,
  GameStatus,
  GameStatusBeforeLevelChange,
} from './types';

const resetGameTimer = () => {
  stopTimer();
  resetTimer();
};

const resolveNextGameStatus = (
  currentStatus: GameStatus,
  hasWon: boolean,
  fallbackStatus: GameStatus = currentStatus,
): GameStatus => {
  if (hasWon) {
    return 'won';
  }

  if (currentStatus === 'idle') {
    return 'playing';
  }

  return fallbackStatus;
};

const changeLevel = (newLevelId: LevelId) => {
  resetGameTimer();

  const level = getLevelById(newLevelId);

  useGameStore.setState({
    ...createGameState(level, createBoardState(level)),
  });
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
    useGameStore.setState({
      gameStatus: 'paused',
      isLevelChangeDialogOpen: true,
      pendingLevelId: newLevelId,
      gameStatusBeforeLevelChange: 'playing',
    });

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

  changeLevel(pendingLevelId);

  return undefined;
};

export const cancelLevelChange = () => {
  const { gameStatus, gameStatusBeforeLevelChange } = useGameStore.getState();

  useGameStore.setState({
    gameStatus: gameStatusBeforeLevelChange ?? gameStatus,
    isLevelChangeDialogOpen: false,
    pendingLevelId: null,
    gameStatusBeforeLevelChange: null,
  });

  return undefined;
};

const resetBoard = (state: GameState, preserveLayout: boolean) => {
  const nextLayout = preserveLayout ? getBoardLayout(state.board) : null;

  return createGameState(
    state.level,
    createBoardState(state.level, { layout: nextLayout }),
  );
};

export const startNewGame = () => {
  resetGameTimer();

  useGameStore.setState((state) => ({
    ...resetBoard(state, false),
  }));
};

export const restartGame = () => {
  resetGameTimer();

  useGameStore.setState((state) => ({
    ...resetBoard(state, true),
  }));
};

type RevealCellResult = {
  openedSafeCount: number;
  touchedIndexes: number[];
};

const revealCellAndGetResult = (
  index: number,
  board: GameState['board'],
): RevealCellResult => {
  const touchedIndexes: number[] = [];

  if (board.mines[index]) {
    board.highlights[index] = 'red';
    touchedIndexes.push(
      index,
      ...revealBoard(board, { markIncorrectFlags: true }),
    );

    return {
      openedSafeCount: 0,
      touchedIndexes,
    };
  }

  if (board.numbers[index] === 0) {
    touchedIndexes.push(...revealEmptyCells(board, index));

    return {
      openedSafeCount: touchedIndexes.length,
      touchedIndexes,
    };
  }

  board.opened[index] = true;
  board.markers[index] = null;
  touchedIndexes.push(index);

  return {
    openedSafeCount: 1,
    touchedIndexes,
  };
};

export const revealCell = (index: number) => {
  const state = useGameStore.getState();
  const { board, gameStatus, level } = state;

  if (
    gameStatus === 'lost' ||
    gameStatus === 'paused' ||
    gameStatus === 'won' ||
    board.opened[index] ||
    board.markers[index] === CELL_MARKERS.FLAG
  ) {
    return undefined;
  }

  const isLayoutReady = board.isLayoutReady;
  const isMineReveal = isLayoutReady && board.mines[index];
  const nextBoard = cloneBoard(board, {
    highlights: true,
    incorrectFlags: isMineReveal,
    markers: !isMineReveal,
    opened: true,
  });

  if (!isLayoutReady) {
    const layout = createBoardLayout(level, index);
    nextBoard.isLayoutReady = true;
    nextBoard.mines = layout.mines;
    nextBoard.numbers = layout.numbers;
    nextBoard.correctFlagCount = countCorrectFlags(nextBoard.markers, layout.mines);
  }

  const { openedSafeCount, touchedIndexes } = revealCellAndGetResult(
    index,
    nextBoard,
  );
  nextBoard.openedSafeCount += openedSafeCount;

  let nextGameStatus: GameStatus = resolveNextGameStatus(gameStatus, false);

  if (nextBoard.mines[index]) {
    nextGameStatus = 'lost';
    playSFX('GAME_OVER');
  } else {
    if (nextBoard.numbers[index] === 0) {
      playSFX('REVEAL_EMPTY');
    } else {
      playSFX('REVEAL_NUMBER');
    }

    if (checkGameWin(nextBoard)) {
      touchedIndexes.push(...revealBoard(nextBoard, { highlightWin: true }));
      nextGameStatus = 'won';
      playSFX('GAME_WIN');
    }
  }

  nextBoard.cellViews = updateCellViews(nextBoard, touchedIndexes);

  useGameStore.setState({
    board: nextBoard,
    gameStatus: nextGameStatus,
  });

  return undefined;
};

export const toggleCellMarker = (
  index: number,
  isQuestionMarkEnabled: boolean,
) => {
  const state = useGameStore.getState();
  const { board, gameStatus } = state;

  if (
    gameStatus === 'lost' ||
    gameStatus === 'paused' ||
    gameStatus === 'won' ||
    board.opened[index]
  ) {
    return undefined;
  }

  const currentMarker = board.markers[index];
  const nextMarker = getNextMarker(currentMarker, isQuestionMarkEnabled);
  const isAddingFlag =
    currentMarker !== CELL_MARKERS.FLAG && nextMarker === CELL_MARKERS.FLAG;

  if (isAddingFlag && board.flagsPlaced === board.totalMines) {
    return undefined;
  }

  const nextBoard = cloneBoard(board, {
    markers: true,
  });
  const isMine = nextBoard.isLayoutReady && nextBoard.mines[index];
  const isRemovingCorrectFlag =
    currentMarker === CELL_MARKERS.FLAG && nextMarker !== CELL_MARKERS.FLAG && isMine;
  const isAddingCorrectFlag =
    currentMarker !== CELL_MARKERS.FLAG && nextMarker === CELL_MARKERS.FLAG && isMine;

  if (currentMarker === CELL_MARKERS.FLAG && nextMarker !== CELL_MARKERS.FLAG) {
    nextBoard.flagsPlaced--;
    playSFX('FLAG_REMOVE');
  }

  if (currentMarker !== CELL_MARKERS.FLAG && nextMarker === CELL_MARKERS.FLAG) {
    nextBoard.flagsPlaced++;
    playSFX('FLAG_PLACE');
  }

  if (isRemovingCorrectFlag) {
    nextBoard.correctFlagCount--;
  }

  if (isAddingCorrectFlag) {
    nextBoard.correctFlagCount++;
  }

  nextBoard.markers[index] = nextMarker;

  const touchedIndexes = [index];
  const hasWon = checkGameWin(nextBoard);
  const nextGameStatus = resolveNextGameStatus(gameStatus, hasWon);

  if (hasWon) {
    nextBoard.opened = [...nextBoard.opened];
    nextBoard.highlights = [...nextBoard.highlights];
    touchedIndexes.push(...revealBoard(nextBoard, { highlightWin: true }));
    playSFX('GAME_WIN');
  }

  nextBoard.cellViews = updateCellViews(nextBoard, touchedIndexes);

  useGameStore.setState({
    board: nextBoard,
    gameStatus: nextGameStatus,
  });

  return undefined;
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

  useGameStore.setState((currentState) => ({
    gameStatus: currentState.gameStatus === 'paused' ? 'playing' : 'paused',
  }));

  return undefined;
};
