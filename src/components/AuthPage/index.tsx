'use client';

import Link from 'next/link';
import CountryAutocomplete from '@/components/CountryAutocomplete';
import PageShell from '@/components/PageShell';
import Button from '@/components/ui/Button';
import ROUTES from '@/config/routes.json';
import { createCx } from '@/utils';
import styles from './styles.module.scss';
import { useAuthPage } from './hooks/useAuthPage';
import type { AuthPageMode } from './hooks/useAuthPage';

const cx = createCx(styles);

type AuthPageProps = {
  mode: AuthPageMode;
};

const AuthPage = ({ mode }: AuthPageProps) => {
  const {
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
  } = useAuthPage(mode);
  const isSignup = mode === 'signup';

  const footerContent = (() => {
    if (mode === 'login') {
      return (
        <p className={cx('footerText')}>
          No account yet? <Link href={ROUTES.SIGNUP}>Create one</Link>.<br />
          Forgot your password?{' '}
          <Link href={ROUTES.FORGOT_PASSWORD}>Reset it</Link>.
        </p>
      );
    }

    if (mode === 'signup') {
      return (
        <p className={cx('footerText')}>
          Already have an account? <Link href={ROUTES.LOGIN}>Login</Link>.
        </p>
      );
    }

    if (mode === 'forgot-password') {
      return (
        <p className={cx('footerText')}>
          Back to <Link href={ROUTES.LOGIN}>login</Link>.
        </p>
      );
    }

    return (
      <p className={cx('footerText')}>
        After changing your password, head back to{' '}
        <Link href={ROUTES.LOGIN}>login</Link>.
      </p>
    );
  })();

  return (
    <PageShell title={copy.title} description={copy.description}>
      {!isConfigured ? (
        <p className={cx('setupNotice')}>
          Supabase is not configured yet. Add the public environment variables
          before using authentication.
        </p>
      ) : null}

      <form className={cx('form')} onSubmit={handleSubmit}>
        {(isSignup || mode === 'login' || mode === 'forgot-password') && (
          <label className={cx('field')}>
            <span
              className={cx('fieldLabel', isSignup && 'requiredFieldLabel')}
            >
              Email
            </span>
            <input
              autoComplete="email"
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
        )}

        {isSignup ? (
          <>
            <label className={cx('field')}>
              <span className={cx('fieldLabel', 'requiredFieldLabel')}>
                Nickname
              </span>
              <input
                required
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
              />
            </label>
            <div className={cx('fieldGrid')}>
              <label className={cx('field')}>
                <span>First Name</span>
                <input
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                />
              </label>
              <label className={cx('field')}>
                <span>Last Name</span>
                <input
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                />
              </label>
            </div>
            <label className={cx('field')}>
              <span>Country</span>
              <CountryAutocomplete value={country} onChange={setCountry} />
            </label>
          </>
        ) : null}

        {(mode === 'login' || isSignup || mode === 'reset-password') && (
          <label className={cx('field')}>
            <span
              className={cx('fieldLabel', isSignup && 'requiredFieldLabel')}
            >
              Password
            </span>
            <input
              autoComplete={
                mode === 'login' ? 'current-password' : 'new-password'
              }
              minLength={8}
              required
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
        )}

        {isSignup ? (
          <label className={cx('consentField')}>
            <input
              className={cx('checkbox')}
              checked={hasAcceptedLegal}
              required
              type="checkbox"
              onChange={(event) => setHasAcceptedLegal(event.target.checked)}
            />
            <span className={cx('consentText')}>
              I acknowledge the{' '}
              <Link href={ROUTES.PRIVACY}>Privacy Policy</Link> and agree to the{' '}
              <Link href={ROUTES.TERMS_OF_SERVICE}>Terms of Service</Link> for
              account features.
            </span>
          </label>
        ) : null}

        {submitError ? <p className={cx('errorText')}>{submitError}</p> : null}
        {submitMessage ? (
          <p className={cx('successText')}>{submitMessage}</p>
        ) : null}

        <Button
          variant="primary"
          isDisabled={
            !isConfigured ||
            isSubmitting ||
            (isSignup && (!hasAcceptedLegal || !nickname || !password))
          }
          type="submit"
        >
          {isSubmitting ? 'Working…' : copy.title}
        </Button>
      </form>

      {footerContent}
    </PageShell>
  );
};

export default AuthPage;
