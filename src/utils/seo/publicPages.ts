/**
 * List of public pages for sitemap generation.
 * Hidden pages (blocked by middleware) should NOT be included here.
 *
 * SEO Note: Only include pages that are accessible and indexable.
 * Adding hidden pages to sitemap will cause crawl errors.
 */
export const PUBLIC_PAGES = [
  {
    path: '/',
    priority: 1.0,
    changeFrequency: 'weekly' as const,
  },
  { path: '/how-to-play', priority: 0.8, changeFrequency: 'monthly' as const },
  { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' as const },
  {
    path: '/terms-of-service',
    priority: 0.3,
    changeFrequency: 'yearly' as const,
  },
  // Hidden pages - uncomment when ready to publish:
  // { path: "/blog", priority: 0.7, changeFrequency: "weekly" as const },
];
