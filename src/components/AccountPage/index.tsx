'use client';

import CountryAutocomplete from '@/components/CountryAutocomplete';
import PageShell from '@/components/PageShell';
import Button from '@/components/ui/Button';
import { createCx } from '@/utils';
import styles from './styles.module.scss';
import BestScores from './components/BestScores';
import AvatarManagement from './components/AvatarManagement';
import AccountActions from './components/AccountActions';
import { useAccountPage } from './hooks/useAccountPage';

const cx = createCx(styles);

const AccountPage = () => {
  const {
    accountForm,
    errorMessage,
    hasSupabase,
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
  } = useAccountPage();

  if (!hasSupabase) {
    return (
      <PageShell
        title="Account"
        description="Configure Supabase to enable accounts and the shared leaderboard."
      >
        <p className={cx('notice')}>
          Supabase is not configured yet, so the account page is unavailable.
        </p>
      </PageShell>
    );
  }

  if (status === 'loading') {
    return (
      <PageShell title="Account" description="Loading your account…">
        <p className={cx('notice')}>Loading your account…</p>
      </PageShell>
    );
  }

  if (!user || status === 'guest') {
    return (
      <PageShell title="Account" description="Redirecting…">
        <p className={cx('notice')}>Redirecting…</p>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Account"
      description="Manage your profile and see your best scores."
    >
      <div className={cx('layout')}>
        <section className={cx('section')}>
          <AvatarManagement
            nickname={accountForm.nickname}
            isSaving={isSaving}
            onAvatarUpload={handleAvatarUpload}
            onAvatarRemove={handleAvatarRemove}
          />

          <form className={cx('form')} onSubmit={handleProfileSubmit}>
            <label className={cx('field')}>
              <span>Email</span>
              <input disabled value={profile?.email ?? user?.email ?? ''} />
            </label>
            <label className={cx('field')}>
              <span>Nickname</span>
              <input
                required
                value={accountForm.nickname}
                onChange={(event) =>
                  updateField('nickname', event.target.value)
                }
              />
            </label>
            <div className={cx('fieldGrid')}>
              <label className={cx('field')}>
                <span>First Name</span>
                <input
                  value={accountForm.firstName}
                  onChange={(event) =>
                    updateField('firstName', event.target.value)
                  }
                />
              </label>
              <label className={cx('field')}>
                <span>Last Name</span>
                <input
                  value={accountForm.lastName}
                  onChange={(event) =>
                    updateField('lastName', event.target.value)
                  }
                />
              </label>
            </div>
            <label className={cx('field')}>
              <span>Country</span>
              <CountryAutocomplete
                value={accountForm.country}
                onChange={(value) => updateField('country', value)}
              />
            </label>
            {errorMessage ? (
              <p className={cx('errorText')}>{errorMessage}</p>
            ) : null}
            {successMessage ? (
              <p className={cx('successText')}>{successMessage}</p>
            ) : null}
            <Button
              variant="primary"
              isDisabled={isSaving || isDeleting}
              type="submit"
            >
              {isSaving ? 'Saving…' : 'Save Profile'}
            </Button>
          </form>

          <AccountActions
            expectedConfirmation={profile?.nickname ?? accountForm.nickname}
            isDeleting={isDeleting}
            isSaving={isSaving}
            onDeleteAccount={handleDeleteAccount}
            onLogout={handleLogout}
          />
        </section>

        <BestScores className={cx('section')} />
      </div>
    </PageShell>
  );
};

export default AccountPage;
