/**
 * test-helpers.mjs — shared scaffolding for the fixture tests.
 *
 * Not named `*.test.mjs`, so `scripts/run-tests.mjs` does not try to run it.
 *
 * The clock is pinned. Every fixture that says "overdue" or "in date" says it
 * against `TODAY`, so these tests mean the same thing in November as they do
 * today — a freshness test whose result depends on when it runs is not a test.
 */

import { join } from 'node:path';
import { ROOT } from './paths.mjs';
import { buildSite } from './build-content.mjs';
import { makeDataLayer } from './data-layer.mjs';

/** The pinned build clock every fixture is written against. */
export const TODAY = '2026-08-28';

export const FIXTURES = join(ROOT, 'lib', 'fixtures');

export function fixtureRoot(...parts) {
  return join(FIXTURES, ...parts);
}

/**
 * A data layer standing in for one Pulse run, in the exact shape
 * `pulse/lib/derive.mjs` writes: one live row, one row that has vanished from
 * the latest snapshot (so its values are last-known), and the source record
 * carrying the URL and the freshness display decision.
 */
export function demoDataLayer(overrides = {}) {
  return makeDataLayer({
    sources: {
      sources: [
        {
          id: 'demo-source',
          url: 'https://example.org/demo/api/models',
          row_id_field: 'id',
          expected_change_days: 7,
        },
      ],
    },
    freshness: {
      sources: [
        {
          id: 'demo-source',
          suspect: false,
          display_date: '2026-08-28',
          display_date_label: 'fetched',
          last_fetch_date: '2026-08-28',
        },
      ],
    },
    feedRows: {
      'demo-source': {
        'vendor/demo-model': {
          id: 'vendor/demo-model',
          pricing: { prompt: '0.000003' },
          context_length: 200000,
          architecture: {},
          $status: 'active',
          $as_of: '2026-08-28',
          $vanished: false,
        },
        'vendor/feed-model': {
          id: 'vendor/feed-model',
          pricing: { prompt: '0.000015' },
          context_length: 1000000,
          architecture: {},
          $status: 'active',
          $as_of: '2026-08-28',
          $vanished: false,
        },
        'vendor/gone': {
          id: 'vendor/gone',
          pricing: { prompt: '0.000009' },
          context_length: 32000,
          $status: 'active',
          $as_of: '2026-08-01',
          $vanished: true,
        },
      },
    },
    ...overrides,
  });
}

/**
 * Build one fixture corpus through the real pipeline.
 *
 * `reviewsDir` defaults to a path that does not exist, so a fixture build
 * never reads the repository's own `data/reviews/`. A fixture that silently
 * picked up 45 real verdict records would make its result depend on content
 * it does not contain — the opposite of what a fixture is for. Tests that
 * exercise the review clause pass an explicit directory under
 * `lib/fixtures/review-records/`.
 *
 * `priceDebt` is empty for the same reason: the repository's recorded
 * price-attribution debt names real files, and a fixture inheriting it would
 * be forgiving instances it does not contain. Tests that exercise the debt
 * ratchet pass their own list.
 */
export function buildFixture(name, opts = {}) {
  return buildSite({
    contentRoot: fixtureRoot(...name.split('/')),
    today: TODAY,
    redirects: false,
    reviewsDir: fixtureRoot('review-records', 'none'),
    dataLayer: opts.dataLayer ?? demoDataLayer(),
    priceDebt: opts.priceDebt ?? { known: [] },
    ...opts,
  });
}

/**
 * Build a fixture expected to fail, and return the BuildError.
 * Throws if the build *succeeded* — "the guardrail did not fire" must never
 * be reported as a pass.
 */
export async function buildFixtureExpectingFailure(name, opts = {}) {
  try {
    await buildFixture(name, opts);
  } catch (err) {
    return err;
  }
  throw new Error(`fixture "${name}" was expected to fail the build, but it passed`);
}
