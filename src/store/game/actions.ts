import { LevelId, TBoard } from '@/types';
import { initGame } from '@/utils';
import {
  DAILY_SEED_VERSION,
  generateDailyBoard,
  getDailyKey,
} from '@/game/daily';
import { getLevelById } from '@/game/getLevelById';
import {
  resetTimer,
  restoreTimerElapsed,
  startTimer,
  stopTimer,
} from '../timer/actions';
import { clearSnapshot } from './snapshot';
import type { GameSnapshotV1 } from './snapshot/types';
import {
  useGameStore,
  type GameMode,
  type GameStatus,
  type GameStatusBeforeLevelChange,
  type PendingGameChange,
} from './store';

const FINISHED_GAME_STATUSES: GameStatus[] = ['idle', 'won', 'lost'];

let shouldSuppressNextLevelReset = false;

const suppressNextLevelReset = () => {
  shouldSuppressNextLevelReset = true;
};

export const consumeShouldSuppressNextLevelReset = () => {
  if (!shouldSuppressNextLevelReset) {
    return false;
  }

  shouldSuppressNextLevelReset = false;

  return true;
};

export const changeLevel = (newLevelId: LevelId) => {
  useGameStore.setState({ level: getLevelById(newLevelId) });
};

const setLevelChangeDialogState = (
  pendingLevelId: LevelId | null,
  gameStatusBeforeLevelChange: GameStatusBeforeLevelChange | null,
  pendingMode: GameMode | null = null,
  pendingGameChange: PendingGameChange = null,
) => {
  useGameStore.setState({
    isLevelChangeDialogOpen: Boolean(
      pendingLevelId || pendingMode || pendingGameChange,
    ),
    pendingLevelId,
    pendingMode,
    pendingGameChange,
    gameStatusBeforeLevelChange,
  });
};

export const requestLevelChange = (newLevelId: LevelId) => {
  const { gameStatus, level } = useGameStore.getState();

  if (level.id === newLevelId) {
    return undefined;
  }

  if (FINISHED_GAME_STATUSES.includes(gameStatus)) {
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
  const { pendingLevelId, pendingMode, pendingGameChange } =
    useGameStore.getState();

  if (!pendingLevelId && !pendingMode && !pendingGameChange) {
    return undefined;
  }

  if (pendingGameChange) {
    setLevelChangeDialogState(null, null);

    return undefined;
  }

  setLevelChangeDialogState(null, null);

  if (pendingMode) {
    changeMode(pendingMode, pendingLevelId ?? undefined);

    return undefined;
  }

  if (pendingLevelId) {
    changeLevel(pendingLevelId);
  }

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

// Returns true when the confirmation dialog was opened (game in progress), or
// false when there is no active game to lose and the caller should navigate to
// the lobby directly.
export const requestGameChange = () => {
  const { gameStatus } = useGameStore.getState();
  const gameStatusBeforeLevelChange =
    gameStatus === 'playing' || gameStatus === 'paused' ? gameStatus : null;

  // Only 'playing'/'paused' have a board worth confirming; other statuses go
  // straight to the lobby without the dialog.
  if (!gameStatusBeforeLevelChange) {
    return false;
  }

  setLevelChangeDialogState(null, gameStatusBeforeLevelChange, null, 'lobby');

  if (gameStatus === 'playing') {
    useGameStore.setState({ gameStatus: 'paused' });
  }

  return true;
};

const buildBoardForCurrentMode = (level: ReturnType<typeof getLevelById>) => {
  const { mode, dailyKey, dailySeedVersion } = useGameStore.getState();

  if (mode === 'daily') {
    const key = dailyKey ?? getDailyKey();
    const seedVersion = dailySeedVersion ?? DAILY_SEED_VERSION;

    return {
      board: generateDailyBoard({ dailyKey: key, level }),
      dailyKey: key,
      dailySeedVersion: seedVersion,
    };
  }

  return {
    board: initGame(level),
    dailyKey: null,
    dailySeedVersion: null,
  };
};

export const resetBoard = (isRestart?: boolean) => {
  clearSnapshot();
  stopTimer();
  resetTimer();

  const { board, level, mode } = useGameStore.getState();

  // For daily mode, "restart" replays the same daily board with cells closed.
  // For free mode, "restart" preserves the random board values; non-restart
  // generates a fresh random board.
  const shouldReuseValues = isRestart && mode === 'free';
  const reset = shouldReuseValues
    ? {
        board: board.map((row) =>
          row.map((cell) => ({
            value: cell.value,
            marker: null,
            isOpened: false,
          })),
        ) as TBoard,
        dailyKey: null,
        dailySeedVersion: null,
      }
    : buildBoardForCurrentMode(level);

  useGameStore.setState({
    board: reset.board,
    totalFlags: 0,
    gameStatus: 'idle',
    isLevelChangeDialogOpen: false,
    pendingLevelId: null,
    pendingMode: null,
    pendingGameChange: null,
    gameStatusBeforeLevelChange: null,
    isGameRestarted: Boolean(isRestart),
    openedSafeCells: 0,
    correctlyFlaggedMines: 0,
    ...(mode === 'daily'
      ? { dailyKey: reset.dailyKey, dailySeedVersion: reset.dailySeedVersion }
      : {}),
  });
};

export const startNewGame = () => {
  resetBoard();
};

export const restartGame = () => {
  resetBoard(true);
};

export const enterDailyMode = (levelId?: LevelId) => {
  const { level } = useGameStore.getState();
  const targetLevel = levelId ? getLevelById(levelId) : level;
  const dailyKey = getDailyKey();

  useGameStore.setState({
    mode: 'daily',
    dailyKey,
    dailySeedVersion: DAILY_SEED_VERSION,
    level: targetLevel,
  });

  // Subscriptions on `level` will also call startNewGame; the explicit reset
  // covers the "same level" case where the level reference is unchanged.
  resetBoard();
};

export const enterFreeMode = (levelId?: LevelId) => {
  const { level } = useGameStore.getState();
  const targetLevel = levelId ? getLevelById(levelId) : level;

  useGameStore.setState({
    mode: 'free',
    dailyKey: null,
    dailySeedVersion: null,
    level: targetLevel,
  });

  resetBoard();
};

export const startConfiguredGame = (mode: GameMode, levelId?: LevelId) => {
  if (mode === 'daily') {
    enterDailyMode(levelId);

    return;
  }

  enterFreeMode(levelId);
};

const changeMode = (mode: GameMode, levelId?: LevelId) => {
  startConfiguredGame(mode, levelId);
};

export const requestModeChange = (newMode: GameMode, levelId?: LevelId) => {
  const { gameStatus, mode } = useGameStore.getState();

  if (mode === newMode) {
    return undefined;
  }

  if (FINISHED_GAME_STATUSES.includes(gameStatus)) {
    changeMode(newMode, levelId);

    return undefined;
  }

  const pendingLevelId = levelId ?? null;

  if (gameStatus === 'playing') {
    setLevelChangeDialogState(pendingLevelId, 'playing', newMode);
    useGameStore.setState({ gameStatus: 'paused' });

    return undefined;
  }

  if (gameStatus === 'paused') {
    setLevelChangeDialogState(pendingLevelId, 'paused', newMode);
  }

  return undefined;
};

export const setBoard = (board: TBoard) => {
  useGameStore.setState({ board });
};

export const setOnboardingTourOpen = (isOnboardingTourOpen: boolean) => {
  useGameStore.setState({ isOnboardingTourOpen });
};

export const setOnboardingTourFlagOnlyCell = (
  onboardingTourFlagOnlyCell: { rowIndex: number; cellIndex: number } | null,
) => {
  useGameStore.setState({ onboardingTourFlagOnlyCell });
};

export const resumeFromSnapshot = (snapshot: GameSnapshotV1) => {
  suppressNextLevelReset();
  restoreTimerElapsed(snapshot.elapsedMs);

  useGameStore.setState({
    board: snapshot.board,
    level: snapshot.level,
    totalFlags: snapshot.totalFlags,
    gameStatus: 'playing',
    isLevelChangeDialogOpen: false,
    pendingLevelId: null,
    pendingMode: null,
    pendingGameChange: null,
    gameStatusBeforeLevelChange: null,
    isGameRestarted: true,
    openedSafeCells: snapshot.openedSafeCells,
    correctlyFlaggedMines: snapshot.correctlyFlaggedMines,
    mode: snapshot.mode,
    dailyKey: snapshot.mode === 'daily' ? (snapshot.dailyKey ?? null) : null,
    dailySeedVersion:
      snapshot.mode === 'daily' ? (snapshot.dailySeedVersion ?? null) : null,
  });

  startTimer();
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
