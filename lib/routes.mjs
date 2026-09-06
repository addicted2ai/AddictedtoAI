/**
 * routes.mjs — every URL this site is going to serve, assembled rather than
 * listed (task 2.9's internal-link check needs a truth to check against).
 *
 * Three sources, no hand-maintained list:
 *   1. `app/` — scanned for `page.*` and `route.*` files. Segments in
 *      brackets are dynamic and contribute no literal route; route groups
 *      `(name)` contribute no path segment. `app/sitemap.*` and
 *      `app/robots.*` are Next's special files and serve `/sitemap.xml` and
 *      `/robots.txt`. **The `robots.*` case is live but currently unused**:
 *      `robots.txt` is written into `public/` by `lib/crawlers.mjs` so the
 *      crawler stance can carry its reasoning as comments, which Next's
 *      generator cannot emit (beads addictedtoai-k1j). The case stays because
 *      it describes Next's behaviour, not this repository's choice, and a
 *      future `app/robots.ts` must not silently drop out of the route table.
 *   2. `public/` — every file lands at the root under its own name.
 *   3. the content corpus — one route per document, from `urlFor`.
 *
 * Assembling it means wave 3 can add a page and the link check knows about it
 * on the next build with nothing to update here, which is the only version of
 * this check that stays true.
 */

import fg from 'fast-glob';
import { APP_DIR, PUBLIC_DIR, toPosix, relPath } from './paths.mjs';
import { join } from 'node:path';

const PAGE_FILE = /^(page|route)\.(tsx|ts|jsx|js|mdx)$/;

function segmentsToRoute(segments) {
  const parts = [];
  for (const seg of segments) {
    if (/^\(.*\)$/.test(seg)) continue; // route group: no path segment
    if (/^@/.test(seg)) return null; // parallel route slot
    if (/^\[.*\]$/.test(seg)) return null; // dynamic: content supplies these
    parts.push(seg);
  }
  return '/' + parts.join('/');
}

export async function scanAppRoutes(appDir = APP_DIR) {
  const files = await fg(toPosix(join(appDir, '**/*.{tsx,ts,jsx,js,mdx}')), { onlyFiles: true });
  const routes = new Set();
  for (const abs of files.sort()) {
    const rel = relPath(abs, appDir);
    const parts = rel.split('/');
    const base = parts.pop();
    if (/^sitemap\.(tsx|ts|jsx|js)$/.test(base) && parts.length === 0) {
      routes.add('/sitemap.xml');
      continue;
    }
    if (/^robots\.(tsx|ts|jsx|js)$/.test(base) && parts.length === 0) {
      routes.add('/robots.txt');
      continue;
    }
    if (!PAGE_FILE.test(base)) continue;
    const route = segmentsToRoute(parts);
    if (route !== null) routes.add(route === '' ? '/' : route);
  }
  return routes;
}

export async function scanPublicFiles(publicDir = PUBLIC_DIR) {
  const files = await fg(toPosix(join(publicDir, '**/*')), { onlyFiles: true, dot: false });
  const routes = new Set();
  for (const abs of files.sort()) routes.add('/' + relPath(abs, publicDir));
  return routes;
}

/** Normalize for comparison: no trailing slash except the root. */
export function normalizeRoute(path) {
  if (!path) return '/';
  const clean = path.replace(/\/+$/, '');
  return clean === '' ? '/' : clean;
}

/**
 * @returns {Promise<Set<string>>} every literal path the site is expected to serve
 */
export async function buildRouteTable(corpus, opts = {}) {
  const routes = new Set();
  for (const r of await scanAppRoutes(opts.appDir)) routes.add(normalizeRoute(r));
  for (const r of await scanPublicFiles(opts.publicDir)) routes.add(normalizeRoute(r));
  // `documents`, not `all`: a claim record mints no route (specs/wiki). Its URL
  // is a FRAGMENT on its subject's page, and a fragment in the route table
  // would be a literal path the site is expected to serve and never will.
  for (const doc of corpus?.documents ?? corpus?.all ?? []) routes.add(normalizeRoute(doc.url));
  for (const r of opts.extra ?? []) routes.add(normalizeRoute(r));
  return routes;
}
