import LobbyPage from '@/components/pages/LobbyPage';
import { LOBBY_SETUP_QUERY } from '@/config/routes';
import { generateWebsiteJsonLd, generateGameJsonLd } from '@/lib/seo';

type LobbySearchParams = {
  [LOBBY_SETUP_QUERY.param]?: string | string[];
};

type Props = {
  searchParams?: Promise<LobbySearchParams>;
};

const getSingleParam = (value: string | string[] | undefined) => {
  return Array.isArray(value) ? value[0] : value;
};

/**
 * Intro page with JSON-LD structured data for SEO.
 *
 * SEO Notes:
 * - JSON-LD provides structured data for search engines
 * - WebSite schema helps with site-level understanding
 * - VideoGame schema points players to the playable /game route
 * - Scripts are rendered in <head> via Next.js automatic handling
 */
export default async function Page({ searchParams }: Props) {
  const params = searchParams ? await searchParams : {};
  const shouldShowSetup =
    getSingleParam(params[LOBBY_SETUP_QUERY.param]) === LOBBY_SETUP_QUERY.value;

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
      <LobbyPage shouldShowSetup={shouldShowSetup} />
    </>
  );
}
