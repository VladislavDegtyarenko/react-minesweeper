import { generateMetadata } from '../../../utils/seo';
import ROUTES from '@/config/routes.json';

export const metadata = generateMetadata({
  title: 'How to Play',
  description:
    'Learn Minesweeper rules, strategies, and tips. Master the classic puzzle game with our comprehensive guide.',
  path: ROUTES.HOW_TO_PLAY,
  noIndex: true, // remove when pages are ready for public access
});

export default function HowToPage() {
  return <div>How To Play</div>;
}
