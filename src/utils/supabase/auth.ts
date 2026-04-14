import ROUTES from '@/config/routes.json';
import type { Profile, ProfileUpdate } from '@/types/supabase';
import type { Session } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from './client';
import { getSiteUrl } from './env';

type SignUpPayload = {
  country: string;
  email: string;
  firstName: string;
  lastName: string;
  nickname: string;
  password: string;
};

type SignInPayload = {
  email: string;
  password: string;
};

const getAuthRedirectOrigin = () => {
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin;
  }

  return getSiteUrl();
};

const getRedirectUrl = (path: string) => `${getAuthRedirectOrigin()}${path}`;

export const signUpWithEmail = async (payload: SignUpPayload): Promise<void> => {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const nicknameInUse = await isNicknameTaken(payload.nickname);

  if (nicknameInUse) {
    throw new Error('This nickname is already taken.');
  }

  const { error } = await supabase.auth.signUp({
    email: payload.email,
    password: payload.password,
    options: {
      data: {
        country: payload.country || null,
        first_name: payload.firstName || null,
        last_name: payload.lastName || null,
        nickname: payload.nickname,
      },
      emailRedirectTo: getRedirectUrl('/auth/callback?next=' + ROUTES.ACCOUNT),
    },
  });

  if (error) throw error;
};

export const signInWithEmail = async (payload: SignInPayload): Promise<void> => {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const { error } = await supabase.auth.signInWithPassword(payload);

  if (error) throw error;
};

export const signOut = async (): Promise<void> => {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const { error } = await supabase.auth.signOut();

  if (error) throw error;
};

export const deleteOwnAccount = async (): Promise<void> => {
  const response = await fetch('/api/account/delete', {
    method: 'POST',
  });

  const payload = (await response.json().catch(() => null)) as
    | { error?: string | null }
    | null;

  if (!response.ok) {
    throw new Error(payload?.error || 'Failed to delete account.');
  }
};

export const requestPasswordReset = async (email: string): Promise<void> => {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: getRedirectUrl('/auth/callback?next=' + ROUTES.RESET_PASSWORD),
  });

  if (error) throw error;
};

export const updatePassword = async (password: string): Promise<void> => {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) throw error;
};

export const getCurrentSession = async (): Promise<Session | null> => {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session;
};

export const getCurrentProfile = async (
  userId: string,
): Promise<Profile | null> => {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
};

export const upsertOwnProfile = async (
  userId: string,
  updates: ProfileUpdate,
): Promise<Profile> => {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const upsertPayload = updates.nickname
    ? {
        ...updates,
        id: userId,
        nickname: updates.nickname,
      }
    : null;

  const query = upsertPayload
    ? supabase
        .from('profiles')
        .upsert(upsertPayload, {
          onConflict: 'id',
        })
        .select('*')
        .single()
    : supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select('*')
        .single();

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data;
};

export const isNicknameTaken = async (nickname: string) => {
  const trimmedNickname = nickname.trim();
  const supabase = getSupabaseBrowserClient();

  if (!supabase || !trimmedNickname) {
    throw new Error('Supabase is not configured or nickname is empty.');
  }

  const { data, error } = await supabase
    .from('public_profiles')
    .select('id')
    .eq('nickname', trimmedNickname)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return Boolean(data);
};
