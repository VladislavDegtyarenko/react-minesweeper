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

export const uploadAvatar = async (userId: string, file: File) => {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const extension = file.name.split('.').pop()?.toLowerCase() || 'png';
  const avatarPath = `${userId}/avatar-${Date.now()}.${extension}`;

  const { error } = await supabase.storage
    .from(SUPABASE_AVATAR_BUCKET)
    .upload(avatarPath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    throw error;
  }

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
