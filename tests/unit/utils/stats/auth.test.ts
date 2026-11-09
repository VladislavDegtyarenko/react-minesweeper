import { beforeEach, describe, expect, it, vi } from 'vitest';
import { recordGuestBestTime, syncStatsWithUser } from '@/store/stats/actions';
import { resetStatsStore, useStatsStore } from '@/store/stats/store';

vi.mock('@/app/(lobby)/actions', () => ({
  getMyBestScores: vi.fn(),
  saveBestScore: vi.fn(),
}));

beforeEach(() => resetStatsStore());

describe('guest results during auth initialization', () => {
  it('preserves a completed win when auth finishes loading as guest', async () => {
    recordGuestBestTime('easy', 4500);
    const summary = useStatsStore.getState().lastWinSummary;
    await syncStatsWithUser(false);
    expect(useStatsStore.getState().lastWinSummary).toEqual(summary);

    useStatsStore.setState({
      isWinDialogOpen: true,
      hasPresentedWinDialog: true,
    });
    await syncStatsWithUser(false);
    expect(useStatsStore.getState()).toMatchObject({
      isWinDialogOpen: true,
      hasPresentedWinDialog: true,
      bestTimesByLevel: { easy: 4500 },
    });
  });

  it('clears account results and restores guest scores on an actual sign out', async () => {
    recordGuestBestTime('easy', 4500);
    useStatsStore.setState({
      isSignedIn: true,
      scoreSource: 'account',
      bestTimesByLevel: { easy: 2000, medium: null, expert: null },
      isWinDialogOpen: true,
    });
    await syncStatsWithUser(false);
    expect(useStatsStore.getState()).toMatchObject({
      isSignedIn: false,
      scoreSource: 'guest',
      bestTimesByLevel: { easy: 4500 },
      lastWinSummary: null,
      isWinDialogOpen: false,
    });
  });

  it('restores guest state if account scores remain after auth changed', async () => {
    useStatsStore.setState({ scoreSource: 'account' });
    await syncStatsWithUser(false);
    expect(useStatsStore.getState().scoreSource).toBe('guest');
  });
});
