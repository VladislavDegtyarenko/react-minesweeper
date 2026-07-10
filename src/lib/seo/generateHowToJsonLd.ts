import { SITE_NAME, SITE_URL } from "./config";

/**
 * Generates JSON-LD structured data for the HowTo guide page.
 */
export function generateHowToJsonLd(): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Play Minesweeper",
    description:
      "Step-by-step guide for Minesweeper controls, number clues, flags, and strategy.",
    inLanguage: "en-US",
    mainEntityOfPage: `${SITE_URL}/how-to-play`,
    about: {
      "@type": "VideoGame",
      name: SITE_NAME,
      url: SITE_URL,
    },
    step: [
      {
        "@type": "HowToStep",
        name: "Open a safe cell",
        text: "Use click or tap to reveal cells while avoiding mines.",
      },
      {
        "@type": "HowToStep",
        name: "Read number clues",
        text: "Each number shows how many mines are in adjacent cells, including diagonals.",
      },
      {
        "@type": "HowToStep",
        name: "Mark mine locations",
        text: "Use flags or question marks to track dangerous cells before opening nearby spaces.",
      },
      {
        "@type": "HowToStep",
        name: "Clear the board",
        text: "Reveal all non-mine cells or correctly flag every mine to win.",
      },
    ],
  });
}
