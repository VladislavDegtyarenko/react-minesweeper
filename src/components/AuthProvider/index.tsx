'use client';

import { PropsWithChildren, useEffect } from 'react';
import { hydrateAuthState } from '@/store/auth';
import { getSupabaseBrowserClient, hasSupabaseEnv } from '@/utils/supabase';

const AuthProvider = ({ children }: PropsWithChildren) => {
  useEffect(() => {
    const isConfigured = hasSupabaseEnv();

    void hydrateAuthState();

    if (!isConfigured) {
      return undefined;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return undefined;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'INITIAL_SESSION') {
        return;
      }

      void hydrateAuthState();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return children;
};

export default AuthProvider;
