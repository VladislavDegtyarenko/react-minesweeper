'use client';

import ROUTES from '@/config/routes.json';
import {
  fetchAccountScores,
  removeAccountAvatar,
  resetAccountStore,
  selectAccountErrorMessage,
  selectAccountUpdateProfileLoadingState,
  uploadAccountAvatar,
  upsertAccountProfile,
  useAccountStore,
} from '@/store/account';
import { resetAuthStateToGuest, useAuthStore } from '@/store/auth';
import { syncStatsWithSession } from '@/store/stats/actions';
import { deleteOwnAccount, hasSupabaseEnv, signOut } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';

type AccountForm = {
  nickname: string;
  firstName: string;
  lastName: string;
  country: string;
};

const INITIAL_FORM: AccountForm = {
  nickname: '',
  firstName: '',
  lastName: '',
  country: '',
};

export function useAccountPage() {
  const router = useRouter();
  const { profile, status, user } = useAuthStore();

  const [accountForm, setAccountForm] = useState<AccountForm>(INITIAL_FORM);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const errorMessage = useAccountStore(selectAccountErrorMessage);
  const isSaving =
    useAccountStore(selectAccountUpdateProfileLoadingState) === 'loading';

  useEffect(() => {
    if (status === 'guest') {
      router.replace(ROUTES.LOGIN);
    }
  }, [router, status]);

  useEffect(() => {
    if (!profile) {
      return undefined;
    }

    setAccountForm({
      nickname: profile.nickname,
      firstName: profile.first_name ?? '',
      lastName: profile.last_name ?? '',
      country: profile.country ?? '',
    });
  }, [profile]);

  useEffect(() => {
    if (!user) {
      return undefined;
    }

    void fetchAccountScores(user.id);
  }, [user]);

  const updateField = <K extends keyof AccountForm>(
    key: K,
    value: AccountForm[K],
  ) => {
    setAccountForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
      return undefined;
    }

    setSuccessMessage(null);

    try {
      await upsertAccountProfile(user.id, {
        country: accountForm.country || null,
        first_name: accountForm.firstName || null,
        last_name: accountForm.lastName || null,
        nickname: accountForm.nickname.trim(),
      });

      setSuccessMessage('Profile updated.');
    } catch {}
  };

  const handleAvatarUpload = async (file: File) => {
    if (!user) {
      return undefined;
    }

    setSuccessMessage(null);
    await uploadAccountAvatar(user.id, file, profile?.avatar_path ?? null);
    setSuccessMessage('Avatar updated.');
  };

  const handleAvatarRemove = async () => {
    if (!user || !profile?.avatar_path) {
      return undefined;
    }

    setSuccessMessage(null);

    try {
      await removeAccountAvatar(user.id, profile.avatar_path);
      setSuccessMessage('Avatar removed.');
    } catch {}
  };

  const handleLogout = async () => {
    await signOut();
    router.replace(ROUTES.GAME);
  };

  const handleDeleteAccount = async (): Promise<string | null> => {
    if (!user) {
      return null;
    }

    setIsDeleting(true);

    try {
      await deleteOwnAccount();
      await signOut();
      resetAccountStore();
      resetAuthStateToGuest();
      await syncStatsWithSession(null);
      router.replace(ROUTES.GAME);
      return null;
    } catch (error) {
      return error instanceof Error
        ? error.message
        : 'Failed to delete account.';
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    accountForm,
    errorMessage,
    hasSupabase: hasSupabaseEnv(),
    isDeleting,
    isSaving,
    profile,
    status,
    successMessage,
    user,
    handleAvatarRemove,
    handleAvatarUpload,
    handleDeleteAccount,
    handleLogout,
    handleProfileSubmit,
    updateField,
  };
}
