import LobbyPage from '@/components/LobbyPage';
import { generateWebsiteJsonLd, generateGameJsonLd } from '@/lib/seo';

/**
 * Intro page with JSON-LD structured data for SEO.
 *
 * SEO Notes:
 * - JSON-LD provides structured data for search engines
 * - WebSite schema helps with site-level understanding
 * - VideoGame schema points players to the playable /game route
 * - Scripts are rendered in <head> via Next.js automatic handling
 */
export default function Page() {
  return (
    <>
      {/* JSON-LD structured data for search engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: generateWebsiteJsonLd() }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: generateGameJsonLd() }}
      />
      <LobbyPage />
    </>
  );
}
