import { SignIn } from '@clerk/nextjs';
import type { Metadata } from 'next';
import ROUTES from '@/config/routes.json';
import { generateMetadata as buildMetadata } from '@/lib/seo';
import styles from './styles.module.scss';

export const metadata: Metadata = buildMetadata({
  title: 'Sign in',
  description:
    'Sign in to your Minesweeper account to track best scores and join the leaderboard.',
  path: ROUTES.LOGIN,
  noIndex: true,
});

const LoginPage = () => {
  return (
    <main className={styles.center}>
      <SignIn signUpUrl={ROUTES.SIGNUP} />
    </main>
  );
};

export default LoginPage;
