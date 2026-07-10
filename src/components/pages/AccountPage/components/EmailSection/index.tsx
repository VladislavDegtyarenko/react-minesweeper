'use client';

import { FormEvent, useState } from 'react';
import { useReverification, useUser } from '@clerk/nextjs';
import Button from '@/components/ui/Button';
import { createCx } from '@/utils';
import styles from './styles.module.scss';

const cx = createCx(styles);

type Stage = 'idle' | 'enterEmail' | 'verifyCode';
type PendingAction = 'idle' | 'sending' | 'verifying' | 'cancelling';

const EmailSection = () => {
  const { user, isLoaded } = useUser();
  const createEmail = useReverification((email: string) =>
    user
      ? user.createEmailAddress({ email })
      : Promise.reject(new Error('Not signed in.')),
  );
  const setPrimaryEmail = useReverification((primaryEmailAddressId: string) =>
    user
      ? user.update({ primaryEmailAddressId })
      : Promise.reject(new Error('Not signed in.')),
  );

  const [stage, setStage] = useState<Stage>('idle');
  const [newEmail, setNewEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [pendingEmailId, setPendingEmailId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isBusy = pendingAction !== 'idle';

  if (!isLoaded || !user) {
    return null;
  }

  const primaryEmail = user.primaryEmailAddress?.emailAddress ?? '—';

  const resetFlow = () => {
    setStage('idle');
    setNewEmail('');
    setVerificationCode('');
    setPendingEmailId(null);
    setErrorMessage(null);
  };

  // Cancelling mid-flow must also destroy the unverified email that was
  // already created on Clerk, otherwise the address stays attached to the user
  // and re-adding it later fails with "That email address is taken".
  const handleCancel = async () => {
    if (pendingEmailId) {
      const pending = user.emailAddresses.find(
        (entry) => entry.id === pendingEmailId,
      );

      if (pending) {
        setPendingAction('cancelling');
        try {
          await pending.destroy();
        } catch {
          // Best-effort cleanup; ignore failures so the user can still reset.
        } finally {
          setPendingAction('idle');
        }
      }
    }

    resetFlow();
  };

  const handleStart = () => {
    setSuccessMessage(null);
    setErrorMessage(null);
    setStage('enterEmail');
  };

  const handleSubmitEmail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPendingAction('sending');
    setErrorMessage(null);

    try {
      const created = await createEmail(newEmail.trim());
      await created.prepareVerification({ strategy: 'email_code' });
      setPendingEmailId(created.id);
      setStage('verifyCode');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to start change.',
      );
    } finally {
      setPendingAction('idle');
    }
  };

  const handleVerifyCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!pendingEmailId) {
      return;
    }

    setPendingAction('verifying');
    setErrorMessage(null);

    try {
      const pending = user.emailAddresses.find(
        (entry) => entry.id === pendingEmailId,
      );

      if (!pending) {
        throw new Error('Pending email address not found.');
      }

      await pending.attemptVerification({ code: verificationCode.trim() });
      await setPrimaryEmail(pending.id);

      const previousEmails = user.emailAddresses.filter(
        (entry) => entry.id !== pending.id,
      );

      await Promise.all(previousEmails.map((entry) => entry.destroy()));

      setSuccessMessage('Email updated.');
      resetFlow();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to verify code.',
      );
    } finally {
      setPendingAction('idle');
    }
  };

  return (
    <section className={cx('root')}>
      <header className={cx('header')}>
        <h2 className={cx('title')}>Email</h2>
        <p className={cx('subtitle')}>
          Used to sign in and receive notifications.
        </p>
      </header>

      {stage === 'idle' ? (
        <div className={cx('readonlyRow')}>
          <span className={cx('emailValue')}>{primaryEmail}</span>
          <Button variant="secondary" type="button" onClick={handleStart}>
            Change email
          </Button>
        </div>
      ) : null}

      {stage === 'enterEmail' ? (
        <form className={cx('form')} onSubmit={handleSubmitEmail}>
          <label className={cx('field')}>
            <span>New email address</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={newEmail}
              onChange={(event) => setNewEmail(event.target.value)}
              disabled={isBusy}
            />
          </label>
          <div className={cx('actions')}>
            <Button
              variant="ghost"
              type="button"
              isDisabled={isBusy}
              onClick={handleCancel}
            >
              {pendingAction === 'cancelling' ? 'Cancelling…' : 'Cancel'}
            </Button>
            <Button
              variant="primary"
              type="submit"
              isDisabled={isBusy || !newEmail.trim()}
            >
              {pendingAction === 'sending' ? 'Sending…' : 'Send code'}
            </Button>
          </div>
        </form>
      ) : null}

      {stage === 'verifyCode' ? (
        <form className={cx('form')} onSubmit={handleVerifyCode}>
          <p className={cx('subtitle')}>
            Enter the verification code we sent to{' '}
            <strong>{newEmail}</strong>.
          </p>
          <label className={cx('field')}>
            <span>Verification code</span>
            <input
              type="text"
              inputMode="numeric"
              required
              autoComplete="one-time-code"
              value={verificationCode}
              onChange={(event) => setVerificationCode(event.target.value)}
              disabled={isBusy}
            />
          </label>
          <div className={cx('actions')}>
            <Button
              variant="ghost"
              type="button"
              isDisabled={isBusy}
              onClick={handleCancel}
            >
              {pendingAction === 'cancelling' ? 'Cancelling…' : 'Cancel'}
            </Button>
            <Button
              variant="primary"
              type="submit"
              isDisabled={isBusy || !verificationCode.trim()}
            >
              {pendingAction === 'verifying' ? 'Verifying…' : 'Verify and replace'}
            </Button>
          </div>
        </form>
      ) : null}

      {errorMessage ? (
        <p className={cx('errorText')}>{errorMessage}</p>
      ) : null}
      {successMessage && stage === 'idle' ? (
        <p className={cx('successText')}>{successMessage}</p>
      ) : null}
    </section>
  );
};

export default EmailSection;
