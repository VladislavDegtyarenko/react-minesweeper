import PageShell from '@/components/PageShell';
import type { BestScore } from '@/utils/db';
import { createCx } from '@/utils';
import AccountActions from './components/AccountActions';
import AvatarManagement from './components/AvatarManagement';
import BestScores from './components/BestScores';
import EmailSection from './components/EmailSection';
import NameForm from './components/NameForm';
import PasswordSection from './components/PasswordSection';
import UsernameForm from './components/UsernameForm';
import styles from './styles.module.scss';

const cx = createCx(styles);

type Props = {
  scores: BestScore[];
};

const AccountPage = ({ scores }: Props) => {
  return (
    <PageShell
      title="Account"
      description="Manage your profile and see your best scores."
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

        <BestScores className={cx('section')} scores={scores} />
      </div>
    </PageShell>
  );
};

export default AccountPage;
