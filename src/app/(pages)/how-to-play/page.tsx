import TextContent from '@/components/Blog/TextContent';
import { generateHowToJsonLd, generateMetadata } from '@/lib/seo';
import ROUTES from '@/config/routes.json';
import HowToPlayContent from './content';

export const dynamic = 'force-static';

export const metadata = generateMetadata({
  title: 'How to Play Minesweeper',
  description:
    'Learn Minesweeper rules, controls, and winning strategies. Understand number clues, flag usage, and difficulty levels.',
  keywords: [
    'how to play minesweeper',
    'minesweeper rules',
    'minesweeper controls',
    'minesweeper strategy',
    'minesweeper tips',
  ],
  path: ROUTES.HOW_TO_PLAY,
});

export default function HowToPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: generateHowToJsonLd() }}
      />
      <TextContent>
        <HowToPlayContent />
      </TextContent>
    </>
  );
}
