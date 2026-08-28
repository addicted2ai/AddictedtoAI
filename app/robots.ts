import type { MetadataRoute } from 'next';
import { absoluteUrl } from '../lib/site-config.mjs';

/**
 * robots.txt. Everything is crawlable; per-page `noindex` (stubs, demoted
 * tutorials) is expressed in the page's own meta tag, where it belongs — a
 * `Disallow` here would stop a crawler reading the tag at all.
 */

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: absoluteUrl('/sitemap.xml'),
  };
}
