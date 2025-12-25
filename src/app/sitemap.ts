import type { MetadataRoute } from "next";
import { SITE_URL, PUBLIC_PAGES } from "../utils/seo";

/**
 * Generates sitemap.xml for search engine discovery.
 *
 * SEO Notes:
 * - Only includes PUBLIC_PAGES (pages not blocked by middleware)
 * - lastModified: helps search engines know when to re-crawl
 * - priority: relative importance (1.0 = highest, 0.0 = lowest)
 * - changeFrequency: hint for crawl frequency
 *
 * When you publish new pages (remove from middleware HIDDEN_ROUTES),
 * add them to PUBLIC_PAGES in utils/seo/publicPages.ts
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_PAGES.map((page) => ({
    url: `${SITE_URL}${page.path}`,
    lastModified: new Date(),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
