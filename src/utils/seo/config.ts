/**
 * Base URL for the site. Used for canonical URLs, OG images, sitemap, etc.
 *
 * TODO: SEO Note: When you buy a custom domain, update NEXT_PUBLIC_SITE_URL env variable.
 * Then add noindex for the old vercel.app domain to avoid duplicate content.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://playminesweepergame.com';

/**
 * Default site name used across all pages.
 */
export const SITE_NAME = 'Minesweeper';

/**
 * Default description for the site.
 */
export const DEFAULT_DESCRIPTION =
  'Play classic Minesweeper online — the timeless puzzle game. Choose Easy, Medium, or Expert difficulty and enjoy a modern mobile-friendly experience.';

/**
 * Default keywords for SEO.
 */
export const DEFAULT_KEYWORDS = [
  'minesweeper',
  'minesweeper online',
  'play minesweeper',
  'minesweeper game',
  'free minesweeper',
  'puzzle game',
  'logic game',
  'mine sweeper',
  'classic minesweeper',
  'browser game',
  'online game',
  'mobile minesweeper',
];
