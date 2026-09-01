/**
 * redirects.test.mjs — the `headers` half of the `vercel.json` generator
 * (beads `addictedtoai-k1j`).
 *
 * `lib/build-gates.test.mjs` owns the redirect rules and the
 * preserve-other-keys behaviour. This file owns the CORS block, and there is
 * exactly one claim in it worth testing, because everything else about CORS
 * happens on a host this repository cannot see:
 *
 *   **the header list is DERIVED from `STATIC_ASSET_ROUTES`, not maintained.**
 *
 * That is the difference between "the assets have CORS today" and "an asset
 * added next month has CORS on the build that first writes it". A test that
 * only asserted the current 18 routes are covered would pass forever while the
 * mechanism rotted underneath it, so the test that matters adds a route and
 * measures that the block grew.
 *
 * What this file cannot claim, and does not: that a browser actually receives
 * `Access-Control-Allow-Origin: *`. Under `output: 'export'` there is no server
 * here; the host applies `vercel.json`. `scripts/verify-surfaces.mjs` says the
 * same thing in its own label.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { corsHeaders, CORS_ROUTES, mergeVercelConfig } from './redirects.mjs';
import { STATIC_ASSET_ROUTES } from './asset-routes.mjs';

test('every asset route the build writes is CORS-enabled, and so is the sitemap', () => {
  const sources = new Set(corsHeaders().map((h) => h.source));
  for (const route of STATIC_ASSET_ROUTES) {
    assert.ok(sources.has(route), `${route} is missing from the CORS block`);
  }
  assert.ok(sources.has('/sitemap.xml'), "Next's sitemap route is named separately and is covered");
  assert.equal(sources.size, CORS_ROUTES.length, 'no duplicates');
});

test('the block is derived, so a new asset route is covered without anyone remembering', () => {
  const before = corsHeaders();
  const after = corsHeaders([...CORS_ROUTES, '/some-new-asset.json']);
  assert.equal(after.length, before.length + 1);
  assert.ok(after.some((h) => h.source === '/some-new-asset.json'));
});

test('each entry sets Access-Control-Allow-Origin and nothing else', () => {
  for (const entry of corsHeaders()) {
    assert.deepEqual(
      entry.headers,
      [{ key: 'Access-Control-Allow-Origin', value: '*' }],
      // These are public GETs with no credentials and no custom headers, so
      // they are simple requests that never preflight. Allow-Methods and
      // Allow-Headers would answer a question no browser asks here.
      `${entry.source} declares exactly the one header a simple cross-origin GET needs`,
    );
  }
});

test('headers are regenerated, never inherited from whatever the file happened to contain', () => {
  const merged = mergeVercelConfig({ headers: [{ source: '/stale', headers: [] }] }, []);
  assert.ok(
    !merged.headers.some((h) => h.source === '/stale'),
    'a stale block must not survive a build — the generator owns this key',
  );
  assert.equal(merged.headers.length, CORS_ROUTES.length);
});

test('the generated config is deterministic: same input, same bytes', () => {
  const rules = [{ source: '/a', destination: '/b', permanent: true }];
  assert.equal(
    JSON.stringify(mergeVercelConfig(null, rules)),
    JSON.stringify(mergeVercelConfig(null, rules)),
    'a rebuild with no change must not produce a diff in a committed file',
  );
});
