import { SITE_URL, SITE_NAME, DEFAULT_DESCRIPTION } from "./config";
import { ROUTES } from '@/config/routes';

/**
 * Generates JSON-LD structured data for a Game schema.
 * Provides rich game information to search engines.
 */
export function generateGameJsonLd(): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    url: `${SITE_URL}${ROUTES.GAME}`,
    genre: ["Puzzle", "Logic"],
    gamePlatform: ["Web Browser", "Mobile"],
    applicationCategory: "Game",
    operatingSystem: "Any",

    // TODO: Add screenshot when game screenshot is available
    // screenshot: `${SITE_URL}/images/game-screenshot.png`,

    // TODO: Add aggregate rating when user ratings are implemented
    // aggregateRating: {
    //   "@type": "AggregateRating",
    //   ratingValue: "4.8",
    //   ratingCount: "150",
    //   bestRating: "5",
    //   worstRating: "1",
    // },

    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
  });
}
