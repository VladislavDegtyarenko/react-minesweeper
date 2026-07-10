import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * Generates robots.txt for search engine crawlers.
 *
 * SEO Notes:
 * - Allow: / — permits crawling of all public pages
 * - Sitemap: points crawlers to the sitemap for efficient discovery
 * - Hidden pages are protected by middleware redirect, not robots.txt
 *   (blocking in robots.txt would still show URLs to crawlers)
 *
 * Future: When you add a custom domain, you may want to add:
 * - Disallow rules for the old vercel.app domain
 * - Or handle this via middleware redirect + noindex meta tag
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
