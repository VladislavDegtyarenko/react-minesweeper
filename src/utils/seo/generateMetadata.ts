import type { Metadata } from 'next';
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  SITE_NAME,
  SITE_URL,
} from './config';

type MetadataOptions = {
  title?: string;
  description?: string;
  keywords?: string[];
  path?: string;
  noIndex?: boolean;
  isRootLayout?: boolean;
};

/**
 * Generates metadata for any page with consistent defaults.
 *
 * @param options - Metadata options
 * @param options.title - Page title (omit for root to use default)
 * @param options.description - Page description
 * @param options.keywords - Page-specific keywords (merged with defaults)
 * @param options.path - URL path for canonical (default: "/")
 * @param options.noIndex - Set true for hidden pages
 * @param options.isRootLayout - Set true for layout.tsx to include metadataBase and title template
 * @returns Complete Metadata object for Next.js
 *
 * @example
 * // Root layout (app/layout.tsx):
 * export const metadata = generateMetadata({ isRootLayout: true });
 *
 * @example
 * // Page component:
 * export const metadata = generateMetadata({
 *   title: "How to Play",
 *   description: "Learn Minesweeper rules and strategies",
 *   path: "/how-to-play",
 *   noIndex: true,
 * });
 */
export function generateMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = [],
  path = '/',
  noIndex = false,
  isRootLayout = false,
}: MetadataOptions = {}): Metadata {
  const url = `${SITE_URL}${path}`;
  const displayTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const mergedKeywords = [...new Set([...DEFAULT_KEYWORDS, ...keywords])];

  const metadata: Metadata = {
    description,
    keywords: mergedKeywords,
    alternates: {
      canonical: isRootLayout ? '/' : url,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          ...(isRootLayout && {
            googleBot: {
              index: true,
              follow: true,
            },
          }),
        },
    openGraph: {
      title: displayTitle,
      description,
      url: isRootLayout ? SITE_URL : url,
      siteName: SITE_NAME,
      type: 'website',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: displayTitle,
      description,
    },
  };

  // Root layout only: metadataBase and title template
  // favicon.ico is auto-detected from app/favicon.ico
  if (isRootLayout) {
    metadata.metadataBase = new URL(SITE_URL);
    metadata.title = {
      default: SITE_NAME,
      template: `%s | ${SITE_NAME}`,
    };
  } else {
    metadata.title = title;
  }

  return metadata;
}
