import { SignUp } from '@clerk/nextjs';
import type { Metadata } from 'next';
import { ROUTES } from '@/config/routes';
import { generateMetadata as buildMetadata } from '@/lib/seo';
import styles from './styles.module.scss';

export const metadata: Metadata = buildMetadata({
  title: 'Sign up',
  description:
    'Create your Minesweeper account to track best scores and join the leaderboard.',
  path: ROUTES.SIGNUP,
  noIndex: true,
});

const SignupPage = () => {
  return (
    <main className={styles.center}>
      <SignUp signInUrl={ROUTES.LOGIN} />
    </main>
  );
};

export default SignupPage;
