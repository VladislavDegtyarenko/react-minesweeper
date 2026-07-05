import ROUTES from '@/config/routes.json';
import { useUser } from '@clerk/nextjs';
import {
  retryDailyAttemptSync,
  selectActiveDailyRunKind,
  selectDailyStreak,
  selectDailySyncError,
  selectIsDailySyncing,
  selectPendingDailySyncAttempt,
  useDailyStore,
} from '@/store/daily';
import { startNewGame } from '@/store/game/actions';
import {
  selectGameStatus,
  selectIsDailyMode,
  selectDailyKey,
} from '@/store/game/selectors';
import { useGameStore } from '@/store/game/store';
import {
  retryAccountBestTimeSync,
  setHasPresentedWinDialog,
  setIsWinDialogOpen,
} from '@/store/stats/actions';
import { canPublishUserScores } from '@/utils/clerk';
import {
  selectIsWinDialogOpen,
  selectLastWinSummary,
  selectScoreSyncState,
} from '@/store/stats/selectors';
import { useStatsStore } from '@/store/stats/store';
import { useEffect, useMemo, useRef, useState } from 'react';
import type {
  ConfettiInstance,
  CopyState,
  ShareChannel,
  WinOverlayPresentation,
} from '../types';
import {
  buildNativeSharePayload,
  buildShareActionItems,
  copyLinkToClipboard,
  createConfettiInstance,
  fireWinConfetti,
  getConfettiColors,
} from '../utils';

const WIN_DIALOG_DELAY_MS = 700;
const COPY_RESET_DELAY_MS = 2000;

export const useWinOverlay = () => {
  const { user } = useUser();
  const gameStatus = useGameStore(selectGameStatus);
  const levelLabel = useGameStore((state) => state.level.label);
  const isDailyMode = useGameStore(selectIsDailyMode);
  const dailyKey = useGameStore(selectDailyKey);
  const levelId = useGameStore((state) => state.level.id);
  const dailyStreak = useDailyStore(selectDailyStreak);
  const activeDailyRunKind = useDailyStore(selectActiveDailyRunKind);
  const dailySyncError = useDailyStore(selectDailySyncError);
  const isDailySyncing = useDailyStore(selectIsDailySyncing);
  const pendingDailySyncAttempt = useDailyStore(selectPendingDailySyncAttempt);
  const isDialogOpen = useStatsStore(selectIsWinDialogOpen);
  const lastWinSummary = useStatsStore(selectLastWinSummary);
  const scoreSyncState = useStatsStore(selectScoreSyncState);

  const [confettiCanvas, setConfettiCanvas] =
    useState<HTMLCanvasElement | null>(null);
  const [isShareSheetOpen, setIsShareSheetOpen] = useState(false);
  const [copyState, setCopyState] = useState<CopyState>('idle');

  const confettiInstanceRef = useRef<ConfettiInstance>(null);
  const confettiFrameRef = useRef<number | null>(null);
  const confettiTimeoutsRef = useRef<number[]>([]);
  const openDialogTimeoutRef = useRef<number | null>(null);
  const resetCopyStateTimeoutRef = useRef<number | null>(null);

  const confettiColors = useMemo(() => getConfettiColors(), []);

  const resetConfettiFrame = () => {
    if (confettiFrameRef.current != null) {
      window.cancelAnimationFrame(confettiFrameRef.current);
      confettiFrameRef.current = null;
    }
  };

  const resetConfettiTimeouts = () => {
    confettiTimeoutsRef.current.forEach((timeoutId) => {
      window.clearTimeout(timeoutId);
    });
    confettiTimeoutsRef.current = [];
  };

  const resetCopyFeedbackTimeout = () => {
    if (resetCopyStateTimeoutRef.current != null) {
      window.clearTimeout(resetCopyStateTimeoutRef.current);
      resetCopyStateTimeoutRef.current = null;
    }
  };

  const resetConfettiInstance = () => {
    confettiInstanceRef.current?.reset();
    confettiInstanceRef.current = null;
  };

  const resetPresentationState = () => {
    resetConfettiFrame();
    resetConfettiTimeouts();

    if (openDialogTimeoutRef.current != null) {
      window.clearTimeout(openDialogTimeoutRef.current);
      openDialogTimeoutRef.current = null;
    }

    resetCopyFeedbackTimeout();
    setIsWinDialogOpen(false);
    setIsShareSheetOpen(false);
    setCopyState('idle');
  };

  useEffect(() => {
    if (!confettiCanvas) {
      resetConfettiInstance();

      return undefined;
    }

    const confettiInstance = createConfettiInstance(confettiCanvas);
    confettiInstanceRef.current = confettiInstance;

    return () => {
      confettiInstance.reset();

      if (confettiInstanceRef.current === confettiInstance) {
        confettiInstanceRef.current = null;
      }
    };
  }, [confettiCanvas]);

  useEffect(() => {
    if (gameStatus !== 'won' || !lastWinSummary || !confettiCanvas) {
      resetConfettiFrame();

      return undefined;
    }

    confettiFrameRef.current = window.requestAnimationFrame(() => {
      if (!confettiInstanceRef.current) {
        confettiInstanceRef.current = createConfettiInstance(confettiCanvas);
      }

      confettiTimeoutsRef.current = fireWinConfetti(
        confettiInstanceRef.current,
        confettiColors,
        lastWinSummary.isNewBest,
      );
      confettiFrameRef.current = null;
    });

    return () => {
      resetConfettiFrame();
      resetConfettiTimeouts();
    };
  }, [confettiCanvas, confettiColors, gameStatus, lastWinSummary]);

  useEffect(() => {
    if (gameStatus !== 'won') {
      resetPresentationState();

      return undefined;
    }

    if (!lastWinSummary) {
      setIsWinDialogOpen(false);
      setIsShareSheetOpen(false);
      setCopyState('idle');

      return undefined;
    }

    openDialogTimeoutRef.current = window.setTimeout(() => {
      setHasPresentedWinDialog(true);
      setIsWinDialogOpen(true);
    }, WIN_DIALOG_DELAY_MS);

    return () => {
      if (openDialogTimeoutRef.current != null) {
        window.clearTimeout(openDialogTimeoutRef.current);
        openDialogTimeoutRef.current = null;
      }
    };
  }, [gameStatus, lastWinSummary]);

  useEffect(() => {
    return () => {
      resetPresentationState();
    };
  }, []);

  const isDailyGameWin =
    isDailyMode && Boolean(dailyKey) && gameStatus === 'won';
  const isDailyPracticeWin =
    isDailyGameWin && activeDailyRunKind === 'practice';
  const isDailyWin = isDailyGameWin && !isDailyPracticeWin;
  const hasCurrentDailySyncAttempt =
    pendingDailySyncAttempt?.dailyKey === dailyKey &&
    pendingDailySyncAttempt.levelId === levelId;

  const sharePayload = useMemo(() => {
    if (!lastWinSummary) {
      return null;
    }

    return buildNativeSharePayload({
      baseUrl: `${window.location.origin}${ROUTES.GAME}`,
      difficultyLabel: levelLabel,
      summary: lastWinSummary,
      daily:
        isDailyWin && dailyKey
          ? {
              dailyKey,
              currentStreak: dailyStreak.currentStreak,
            }
            : undefined,
      practice:
        isDailyPracticeWin && dailyKey
          ? {
              dailyKey,
            }
          : undefined,
    });
  }, [
    dailyKey,
    dailyStreak.currentStreak,
    isDailyPracticeWin,
    isDailyWin,
    lastWinSummary,
    levelLabel,
  ]);

  const shareActionItems = useMemo(() => {
    if (!sharePayload) {
      return [];
    }

    return buildShareActionItems(sharePayload);
  }, [sharePayload]);
  const shouldShowLeaderboardPrompt =
    Boolean(user) && !canPublishUserScores(user?.username);

  const handleDialogOpenChange = (nextOpen: boolean) => {
    setIsWinDialogOpen(nextOpen);

    if (!nextOpen) {
      resetCopyFeedbackTimeout();
      setIsShareSheetOpen(false);
      setCopyState('idle');
    }
  };

  const handleNewGameClick = () => {
    resetPresentationState();
    startNewGame();
  };

  const handleRetryScoreSyncClick = async () => {
    await retryAccountBestTimeSync();
  };

  const handleRetryDailySyncClick = async () => {
    await retryDailyAttemptSync();
  };

  const setCopiedState = (nextState: CopyState) => {
    resetCopyFeedbackTimeout();
    setCopyState(nextState);

    if (nextState === 'copied') {
      resetCopyStateTimeoutRef.current = window.setTimeout(() => {
        setCopyState('idle');
      }, COPY_RESET_DELAY_MS);
    }
  };

  const handleShareActionClick = async (channel: ShareChannel) => {
    if (!sharePayload) {
      return;
    }

    const actionItem = shareActionItems.find(
      (item) => item.channel === channel,
    );

    if (!actionItem) {
      return;
    }

    if (channel === 'copy') {
      const didCopy = await copyLinkToClipboard(sharePayload.url);
      setCopiedState(didCopy ? 'copied' : 'manual');

      return;
    }

    if (!actionItem.url) {
      return;
    }

    window.open(actionItem.url, '_blank', 'noopener,noreferrer');
  };

  const handleShareClick = async () => {
    if (!sharePayload) {
      return;
    }

    if (typeof navigator.share !== 'function') {
      setIsShareSheetOpen((current) => !current);

      return;
    }

    try {
      if (
        typeof navigator.canShare === 'function' &&
        !navigator.canShare(sharePayload)
      ) {
        setIsShareSheetOpen((current) => !current);

        return;
      }

      await navigator.share(sharePayload);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }

      setIsShareSheetOpen(true);
    }
  };

  const dialogDescription = isDailyWin
    ? `${levelLabel} • Daily ${dailyKey ?? ''}`.trim()
    : isDailyPracticeWin
      ? `${levelLabel} • Daily practice ${dailyKey ?? ''}`.trim()
    : `${levelLabel} difficulty`;
  const dialogTitle = isDailyWin
    ? 'Daily Cleared'
    : isDailyPracticeWin
      ? 'Practice Cleared'
    : lastWinSummary?.isNewBest
      ? 'New Best Time'
      : 'You Win';

  const presentation: WinOverlayPresentation = {
    copyFallbackVisible: copyState === 'manual',
    copyState,
    dailyStreakCount: dailyStreak.currentStreak,
    dialogDescription,
    dialogTitle,
    handleDialogOpenChange,
    handleNewGameClick,
    handleRetryDailySyncClick,
    handleRetryScoreSyncClick,
    handleShareActionClick,
    handleShareClick,
    dailySyncMessage: dailySyncError,
    isDailyPracticeWin,
    isDailySyncFailed: Boolean(dailySyncError && hasCurrentDailySyncAttempt),
    isDailySyncRetrying: isDailySyncing && hasCurrentDailySyncAttempt,
    isDailyWin,
    isDialogOpen,
    isNewBest: Boolean(lastWinSummary?.isNewBest),
    isScoreSyncFailed: scoreSyncState.status === 'failed',
    isScoreSyncRetrying: scoreSyncState.status === 'syncing',
    isShareSheetOpen,
    lastWinSummary,
    scoreSyncMessage: scoreSyncState.message,
    shareActionItems,
    sharePayload,
    shouldShowLeaderboardPrompt,
  };

  return {
    gameStatus,
    presentation,
    setConfettiCanvas,
  };
};
