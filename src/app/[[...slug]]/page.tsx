import "../../index.css";
import { ClientOnly } from "./client";
import { generateWebsiteJsonLd, generateGameJsonLd } from "../../utils/seo";

/**
 * Homepage with JSON-LD structured data for SEO.
 *
 * SEO Notes:
 * - JSON-LD provides structured data for search engines
 * - WebSite schema: helps with site-level understanding
 * - VideoGame schema: enables rich game snippets in search results
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
      <ClientOnly />
    </>
  );
}
