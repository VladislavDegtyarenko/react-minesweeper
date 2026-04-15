import { setAuthProfile } from '@/store/auth/actions';
import type { BestScore, ProfileUpdate } from '@/types/supabase';
import {
  fetchUserBestScores,
  removeAvatar,
  uploadAvatar,
  upsertOwnProfile,
} from '@/utils/supabase';
import { useAccountStore } from './store';

export const setAccountScoresCache = (userId: string, scores: BestScore[]) => {
  useAccountStore.setState({
    errorMessage: null,
    loadedUserId: userId,
    scores,
    scoresLoadingState: 'success',
  });
};

export const upsertAccountScore = (userId: string, nextScore: BestScore) => {
  const { scores } = useAccountStore.getState();
  const nextScores = scores.some((score) => score.level_id === nextScore.level_id)
    ? scores.map((score) =>
        score.level_id === nextScore.level_id ? nextScore : score,
      )
    : [...scores, nextScore];

  useAccountStore.setState({
    errorMessage: null,
    loadedUserId: userId,
    scores: nextScores,
    scoresLoadingState: 'success',
  });
};

export const setAccountScoresLoading = (userId: string) => {
  useAccountStore.setState({
    errorMessage: null,
    loadedUserId: userId,
    scoresLoadingState: 'loading',
  });
};

export const resetAccountStore = () => {
  useAccountStore.setState({
    errorMessage: null,
    loadedUserId: null,
    profileLoadingState: 'idle',
    scores: [],
    scoresLoadingState: 'idle',
    updateProfileLoadingState: 'idle',
  });
};

export const fetchAccountScores = async (userId: string) => {
  const { loadedUserId, scoresLoadingState } = useAccountStore.getState();

  if (scoresLoadingState === 'loading') {
    return;
  }

  if (scoresLoadingState === 'success' && loadedUserId === userId) {
    return;
  }

  useAccountStore.setState({
    errorMessage: null,
    loadedUserId: userId,
    scoresLoadingState: 'loading',
  });

  try {
    const scores = await fetchUserBestScores(userId);

    setAccountScoresCache(userId, scores);
  } catch (error) {
    useAccountStore.setState({
      errorMessage:
        error instanceof Error ? error.message : 'Failed to load scores.',
      loadedUserId: userId,
      scoresLoadingState: 'error',
    });
  }
};

export const upsertAccountProfile = async (
  userId: string,
  updates: ProfileUpdate,
) => {
  useAccountStore.setState({
    errorMessage: null,
    updateProfileLoadingState: 'loading',
  });

  try {
    const nextProfile = await upsertOwnProfile(userId, updates);

    setAuthProfile(nextProfile);
    useAccountStore.setState({
      errorMessage: null,
      profileLoadingState: 'success',
      updateProfileLoadingState: 'success',
    });

    return nextProfile;
  } catch (error) {
    useAccountStore.setState({
      errorMessage:
        error instanceof Error ? error.message : 'Failed to update profile.',
      updateProfileLoadingState: 'error',
    });
    throw error;
  }
};

export const uploadAccountAvatar = async (
  userId: string,
  file: File,
  previousAvatarPath: string | null,
) => {
  useAccountStore.setState({
    errorMessage: null,
    updateProfileLoadingState: 'loading',
  });

  try {
    const nextAvatarPath = await uploadAvatar(file);
    const nextProfile = await upsertOwnProfile(userId, {
      avatar_path: nextAvatarPath,
    });

    setAuthProfile(nextProfile);
    useAccountStore.setState({
      errorMessage: null,
      profileLoadingState: 'success',
      updateProfileLoadingState: 'success',
    });

    if (previousAvatarPath) {
      await removeAvatar(previousAvatarPath);
    }

    return nextProfile;
  } catch (error) {
    useAccountStore.setState({ updateProfileLoadingState: 'error' });
    throw error;
  }
};

export const removeAccountAvatar = async (
  userId: string,
  avatarPath: string,
) => {
  useAccountStore.setState({
    errorMessage: null,
    updateProfileLoadingState: 'loading',
  });

  try {
    await removeAvatar(avatarPath);

    const nextProfile = await upsertOwnProfile(userId, {
      avatar_path: null,
    });

    setAuthProfile(nextProfile);
    useAccountStore.setState({
      errorMessage: null,
      profileLoadingState: 'success',
      updateProfileLoadingState: 'success',
    });

    return nextProfile;
  } catch (error) {
    useAccountStore.setState({ updateProfileLoadingState: 'error' });
    throw error;
  }
};
