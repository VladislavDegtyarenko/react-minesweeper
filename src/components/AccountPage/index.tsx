import PageShell from '@/components/PageShell';
import type { BestScore, DailyAttempt, DailyStreakSummary } from '@/utils/db';
import { createCx } from '@/utils';
import AccountActions from './components/AccountActions';
import AvatarManagement from './components/AvatarManagement';
import BestScores from './components/BestScores';
import DailyChallengeStats from './components/DailyChallengeStats';
import EmailSection from './components/EmailSection';
import NameForm from './components/NameForm';
import PasswordSection from './components/PasswordSection';
import UsernameForm from './components/UsernameForm';
import styles from './styles.module.scss';

const cx = createCx(styles);

type Props = {
  dailyAttempts: DailyAttempt[];
  dailyStreak: DailyStreakSummary;
  scores: BestScore[];
  todayKey: string;
};

const AccountPage = ({
  dailyAttempts,
  dailyStreak,
  scores,
  todayKey,
}: Props) => {
  return (
    <PageShell
      title="Account"
      description="Manage your profile, best scores, and daily challenge progress."
    >
      <div className={cx('layout')}>
        <section className={cx('section', 'profileSection')}>
          <AvatarManagement />
          <UsernameForm />
          <NameForm />
          <EmailSection />
          <PasswordSection />
          <AccountActions />
        </section>

        <div className={cx('sideColumn')}>
          <BestScores className={cx('section')} scores={scores} />
          <DailyChallengeStats
            attempts={dailyAttempts}
            className={cx('section')}
            streak={dailyStreak}
            todayKey={todayKey}
          />
        </div>
      </div>
    </PageShell>
  );
};

export default AccountPage;
