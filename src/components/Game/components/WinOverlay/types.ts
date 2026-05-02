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
  isDialogOpen: boolean;
  isNewBest: boolean;
  isShareSheetOpen: boolean;
  lastWinSummary: LastWinSummary | null;
  shareActionItems: ShareActionItem[];
  sharePayload: NativeSharePayload | null;
  shouldShowLeaderboardPrompt: boolean;
};

export type WinOverlayActions = {
  handleDialogOpenChange: (nextOpen: boolean) => void;
  handleNewGameClick: () => void;
  handleShareActionClick: (channel: ShareChannel) => Promise<void>;
  handleShareClick: () => Promise<void>;
};

export type WinOverlayPresentation = WinOverlayState & WinOverlayActions;

export type ConfettiInstance = CreateTypes | null;
