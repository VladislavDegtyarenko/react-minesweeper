import { validateImage } from '../image';
import { SUPABASE_AVATAR_BUCKET } from './constants';
import { getSupabaseBrowserClient } from './client';

export const getAvatarPublicUrl = (avatarPath: string | null) => {
  if (!avatarPath) {
    return null;
  }

  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(SUPABASE_AVATAR_BUCKET).getPublicUrl(avatarPath);

  return publicUrl;
};

export const uploadAvatar = async (file: File): Promise<string> => {
  validateImage(file);

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/account/avatar', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? 'Failed to upload avatar.');
  }

  const { avatarPath } = (await response.json()) as { avatarPath: string };

  return avatarPath;
};

export const removeAvatar = async (avatarPath: string | null) => {
  const supabase = getSupabaseBrowserClient();

  if (!supabase || !avatarPath) {
    return;
  }

  const { error } = await supabase.storage
    .from(SUPABASE_AVATAR_BUCKET)
    .remove([avatarPath]);

  if (error) {
    throw error;
  }
};
