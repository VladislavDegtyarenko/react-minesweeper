import { ROUTES } from '@/config/routes';

/**
 * List of public pages for sitemap generation.
 * Hidden pages (blocked by middleware) should NOT be included here.
 *
 * SEO Note: Only include pages that are accessible and indexable.
 * Adding hidden pages to sitemap will cause crawl errors.
 */
export const PUBLIC_PAGES = [
  {
    path: ROUTES.LOBBY,
    priority: 1.0,
    changeFrequency: 'weekly' as const,
  },
  { path: ROUTES.GAME, priority: 0.95, changeFrequency: 'weekly' as const },
  {
    path: ROUTES.LEADERBOARD,
    priority: 0.7,
    changeFrequency: 'daily' as const,
  },
  {
    path: ROUTES.HOW_TO_PLAY,
    priority: 0.8,
    changeFrequency: 'monthly' as const,
  },
  { path: ROUTES.PRIVACY, priority: 0.3, changeFrequency: 'yearly' as const },
  {
    path: ROUTES.TERMS_OF_SERVICE,
    priority: 0.3,
    changeFrequency: 'yearly' as const,
  },
  // Hidden pages - uncomment when ready to publish:
  // { path: ROUTES.BLOG, priority: 0.7, changeFrequency: 'weekly' as const },
];
