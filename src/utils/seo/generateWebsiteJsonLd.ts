import { SITE_URL, SITE_NAME, DEFAULT_DESCRIPTION } from "./config";

/**
 * Generates JSON-LD structured data for the WebSite schema.
 * Used on the homepage for better search engine understanding.
 *
 * SEO Note: JSON-LD helps search engines understand site structure
 * and can enable rich snippets in search results.
 */
export function generateWebsiteJsonLd(): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    inLanguage: "en",
    // TODO: Uncomment when adding multilingual support
    // availableLanguage: ["en", "uk", "ru"],
    publisher: {
      "@type": "Person",
      name: "Vladyslav Dihtiarenko",
      url: "https://vd-developer.online",
    },
    potentialAction: {
      "@type": "PlayAction",
      target: SITE_URL,
      name: "Play Minesweeper",
    },
  });
}
