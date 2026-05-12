import type { LastWinSummary } from '@/store/stats';
import type { CreateTypes } from 'canvas-confetti';

export type CopyState = 'idle' | 'copied' | 'manual';

export type NativeSharePayload = {
  title: string;
  text: string;
  url: string;
  currentTimeLabel: string;
  bestTimeLabel: string;
};

export type ShareChannel =
  | 'x'
  | 'facebook'
  | 'reddit'
  | 'whatsapp'
  | 'telegram'
  | 'email'
  | 'copy';

export type ShareActionItem = {
  channel: ShareChannel;
  label: string;
  url?: string;
};

export type WinOverlayState = {
  copyFallbackVisible: boolean;
  copyState: CopyState;
  dialogDescription: string;
  dialogTitle: string;
  dailyStreakCount: number;
  isDailyPracticeWin: boolean;
  isDailyWin: boolean;
  isDailySyncFailed: boolean;
  isDailySyncRetrying: boolean;
  isDialogOpen: boolean;
  isNewBest: boolean;
  isScoreSyncFailed: boolean;
  isScoreSyncRetrying: boolean;
  isShareSheetOpen: boolean;
  lastWinSummary: LastWinSummary | null;
  scoreSyncMessage: string | null;
  dailySyncMessage: string | null;
  shareActionItems: ShareActionItem[];
  sharePayload: NativeSharePayload | null;
  shouldShowLeaderboardPrompt: boolean;
};

export type WinOverlayActions = {
  handleDialogOpenChange: (nextOpen: boolean) => void;
  handleNewGameClick: () => void;
  handleRetryDailySyncClick: () => Promise<void>;
  handleRetryScoreSyncClick: () => Promise<void>;
  handleShareActionClick: (channel: ShareChannel) => Promise<void>;
  handleShareClick: () => Promise<void>;
};

export type WinOverlayPresentation = WinOverlayState & WinOverlayActions;

export type ConfettiInstance = CreateTypes | null;
