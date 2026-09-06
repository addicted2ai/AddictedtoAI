/**
 * page.test.mjs — the WIRING behind the index-leaders element on /frontier
 * (`separate-a-claim-from-a-fact` task 26).
 *
 * `lib/render/frontier.test.mjs` proves `renderIndexLeaders` looks a metric up
 * and collapses when nothing is cleared. It calls the function directly, with
 * hand-built arguments. That leaves the half that actually decides what a
 * visitor sees unmeasured: whether the PAGE calls it at all, and whether
 * `lib/site.mjs` hands it the registry's answer rather than a set of its own.
 *
 * The gap was measured, not supposed. Exhaustive grep over every `*.test.mjs`
 * in the tree: `renderIndexLeaders` appeared only in the renderer's own unit
 * test; `getSite`, `site.frontier` and `site.clearedMetrics` appeared in no
 * test at all; no test read `app/frontier/page.tsx` as text. So deleting the
 * call from the page, or passing `new Set()` in place of `clearedMetricIds`,
 * left the whole change green — and task 26's entire substance is that
 * "registering one cleared metric populates it with no edit to any renderer".
 * If the wiring is wrong, clearing `ego8` or `c563` populates nothing and every
 * test still passes: implementer-ledger row 6 one layer out, which is the layer
 * the visitor is on.
 *
 * The technique — assert on the source text of a component's own wiring — is
 * this repository's established answer to that shape: `app/sitemap.test.mjs`
 * exists solely to guard "that `app/sitemap.ts` actually CALLS it", and
 * `lib/analytics.test.mjs` reads `app/_components/RouteTracker.tsx` as text for
 * the same reason. Some claims are about what a specific line says, not about
 * what a function returns.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const PAGE = readFileSync(fileURLToPath(new URL('./page.tsx', import.meta.url)), 'utf8');
const SITE = readFileSync(fileURLToPath(new URL('../../lib/site.mjs', import.meta.url)), 'utf8');

test('the page renders the index leaders, bound to BOTH the data and the rights gate', () => {
  assert.match(
    PAGE,
    /renderIndexLeaders\(\s*site\.frontier\s*,\s*site\.clearedMetrics\s*\)/,
    'omitting the call, or passing a hard-coded set in place of `site.clearedMetrics`, would render a ' +
      'permanent absence that no registration could ever fill — the empty state task 26 forbids',
  );
  assert.match(
    PAGE,
    /renderIndexLeaders,/,
    'and it is the shared renderer, imported from lib/render/frontier.mjs, not a local copy',
  );
});

test('site.frontier is the derived file and site.clearedMetrics is the REGISTRY’s answer', () => {
  // Two separate reads on purpose (see the block comment at that seam):
  // `frontier.json` is what the snapshot says, and whether a value may be
  // PRINTED is a registry question read at build time, so flipping a rights
  // outcome to `refused` takes effect at the next build rather than waiting for
  // the next Pulse run. Substituting `frontierMetrics(...)`, a literal
  // `new Set()`, or the derived file's own metric ids for `clearedMetricIds`
  // would each read as present and each answer a different question.
  assert.match(
    SITE,
    /const clearedMetrics = clearedMetricIds\(loadRegistry\(ROOT\)\)/,
    'the gate is the registry’s cleared-rights answer, computed at build time from the registry itself',
  );
  assert.match(
    SITE,
    /const frontier = await readJson\(FRONTIER_FILE,/,
    'and the data is the derived file, read with an honest empty fallback rather than an absent object',
  );
  assert.match(SITE, /\n\s{4}frontier,\n/, 'both reach the renderer: `frontier` is on the site object');
  assert.match(SITE, /\n\s{4}clearedMetrics,\n/, 'and so is `clearedMetrics`');
});
