'use client';

import ROUTES from '@/config/routes.json';
import { useAuthStore } from '@/store/auth';
import {
  requestPasswordReset,
  signInWithEmail,
  signUpWithEmail,
  updatePassword,
} from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';

export type AuthPageMode =
  | 'login'
  | 'signup'
  | 'forgot-password'
  | 'reset-password';

export const AUTH_PAGE_COPY: Record<
  AuthPageMode,
  { description: string; title: string }
> = {
  'forgot-password': {
    description: 'Request a password reset link for your Minesweeper account.',
    title: 'Forgot Password',
  },
  login: {
    description:
      'Sign in to sync your best times, keep your leaderboard profile, and manage your account.',
    title: 'Login',
  },
  'reset-password': {
    description: 'Choose a new password for your Minesweeper account.',
    title: 'Reset Password',
  },
  signup: {
    description:
      'Create an account to save best scores to the shared leaderboard and manage your profile.',
    title: 'Sign Up',
  },
};

export function useAuthPage(mode: AuthPageMode) {
  const router = useRouter();
  const { isConfigured, status } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nickname, setNickname] = useState('');
  const [country, setCountry] = useState('');
  const [hasAcceptedLegal, setHasAcceptedLegal] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const copy = AUTH_PAGE_COPY[mode];

  useEffect(() => {
    if (status === 'authenticated' && (mode === 'login' || mode === 'signup')) {
      router.replace(ROUTES.ACCOUNT);
    }
  }, [mode, router, status]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitMessage(null);

    try {
      if (mode === 'login') {
        await signInWithEmail({ email, password });
        router.push(ROUTES.ACCOUNT);
        router.refresh();

        return;
      }

      if (mode === 'signup') {
        await signUpWithEmail({
          country,
          email,
          firstName,
          lastName,
          nickname,
          password,
        });
        setSubmitMessage(
          'Check your email to verify your account. You are not logged in yet — come back after confirming.',
        );
        setIsSubmitting(false);

        return;
      }

      if (mode === 'forgot-password') {
        await requestPasswordReset(email);
        setSubmitMessage('Password reset email sent.');
        setIsSubmitting(false);

        return;
      }

      await updatePassword(password);
      setSubmitMessage(
        'Password updated. You can continue using your account.',
      );
      router.push(ROUTES.ACCOUNT);
      router.refresh();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Something went wrong.',
      );
      setIsSubmitting(false);
    }
  };

  return {
    copy,
    country,
    email,
    firstName,
    hasAcceptedLegal,
    isConfigured,
    isSubmitting,
    lastName,
    nickname,
    password,
    submitError,
    submitMessage,
    handleSubmit,
    setCountry,
    setEmail,
    setFirstName,
    setHasAcceptedLegal,
    setLastName,
    setNickname,
    setPassword,
  };
}
