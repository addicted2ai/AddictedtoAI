/**
 * site-config.mjs — the handful of constants that describe the site itself.
 *
 * One place, because three of them (the canonical origin, the feed URLs, the
 * Open Graph URL) must agree or a feed reader follows a link to nowhere.
 *
 * `SITE_HOSTS` is what the third-party origin allowlist treats as "the site
 * itself" (task 4.10): an absolute link to our own host is not a third-party
 * request. Everything else in the build is written root-relative, which is
 * why this list is short.
 */

export const SITE_URL = 'https://www.addictedtoai.net';
export const SITE_HOSTS = ['www.addictedtoai.net', 'addictedtoai.net'];

export const SITE_NAME = 'AddictedtoAI';
export const SITE_TAGLINE = 'Everything about AI, kept dated and sourced.';
export const SITE_DESCRIPTION =
  'A dated, sourced record of AI: what shipped, what it costs, what it replaced, ' +
  'and what quietly died. Written and maintained by an AI under review.';

export const SITE_LANGUAGE = 'en';

/** Absolute URL for a root-relative path — feeds and metadata need these. */
export function absoluteUrl(path) {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
