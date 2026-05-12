import type { LastWinSummary } from '@/store/stats';
import { getTimeDiff } from '@/utils';
import type { NativeSharePayload, ShareActionItem } from '../types';

type DailyShareContext = {
  dailyKey: string;
  currentStreak: number;
};

type PracticeShareContext = {
  dailyKey: string;
};

type SharePayloadParams = {
  baseUrl: string;
  difficultyLabel: string;
  summary: LastWinSummary;
  daily?: DailyShareContext;
  practice?: PracticeShareContext;
};

const encodeValue = (value: string) => encodeURIComponent(value);

const buildShareText = ({
  difficultyLabel,
  summary,
}: Pick<SharePayloadParams, 'difficultyLabel' | 'summary'>) => {
  const currentTimeLabel = getTimeDiff(summary.elapsedMs);
  const bestTimeLabel = getTimeDiff(summary.bestTimeMs);

  if (summary.isNewBest) {
    return `I just set a new best time on ${difficultyLabel} Minesweeper: ${currentTimeLabel}. Can you beat me?`;
  }

  return `I just cleared ${difficultyLabel} Minesweeper in ${currentTimeLabel}. My best is ${bestTimeLabel}. Can you beat me?`;
};

export const buildNativeSharePayload = (
  params: SharePayloadParams,
): NativeSharePayload => {
  const { baseUrl, difficultyLabel, summary, daily, practice } = params;
  const currentTimeLabel = getTimeDiff(summary.elapsedMs);
  const bestTimeLabel = getTimeDiff(summary.bestTimeMs);

  const shareText = daily
    ? `Minesweeper Daily ${daily.dailyKey} (${difficultyLabel}) — ${currentTimeLabel}. Streak: ${daily.currentStreak}.`
    : practice
      ? `I just cleared a ${difficultyLabel} Minesweeper daily practice run for ${practice.dailyKey} in ${currentTimeLabel}.`
    : buildShareText({ difficultyLabel, summary });

  return {
    title: daily
      ? 'Minesweeper Daily result'
      : practice
        ? 'Minesweeper practice result'
        : 'Minesweeper result',
    text: shareText,
    url: baseUrl,
    currentTimeLabel,
    bestTimeLabel,
  };
};

export const buildShareActionItems = (payload: NativeSharePayload) => {
  const encodedText = encodeValue(payload.text);
  const encodedUrl = encodeValue(payload.url);
  const encodedTitle = encodeValue(payload.title);

  const shareTargets: ShareActionItem[] = [
    {
      channel: 'x',
      label: 'X',
      url: `https://x.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    },
    {
      channel: 'facebook',
      label: 'Facebook',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      channel: 'reddit',
      label: 'Reddit',
      url: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedText}`,
    },
    {
      channel: 'whatsapp',
      label: 'WhatsApp',
      url: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    },
    {
      channel: 'telegram',
      label: 'Telegram',
      url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    },
    {
      channel: 'email',
      label: 'Email',
      url: `mailto:?subject=${encodedTitle}&body=${encodedText}%0A%0A${encodedUrl}`,
    },
    {
      channel: 'copy',
      label: 'Copy Link',
    },
  ];

  return shareTargets;
};

export const getShareSheetHeading = (dialogTitle: string) => {
  return `${dialogTitle} share options`;
};
