export const getSupabaseUrl = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || null;
};

export const getSupabaseAnonKey = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || null;
};

export const hasSupabaseEnv = () =>
  Boolean(getSupabaseUrl() && getSupabaseAnonKey());

export const getSiteUrl = () => {
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (configuredSiteUrl) {
    return configuredSiteUrl.replace(/\/$/, '');
  }

  return 'http://localhost:3000';
};
