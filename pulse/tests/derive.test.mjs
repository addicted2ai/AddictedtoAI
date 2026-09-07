/**
 * derive.test.mjs — the vendor-posted rate (change
 * `bind-a-price-to-the-vendor-that-posts-it`, tasks 13 and 14).
 *
 * specs/pulse: "A price event names the vendor that posts the rate, or there is
 * no event." What is measured here is the resolution and, far more importantly,
 * the FIVE WAYS IT REFUSES TO RESOLVE — because every one of those renders as
 * the same empty cell, and the one that is a gap in this site's own declarations
 * is indistinguishable from the three that are facts about the vendor unless the
 * row says which it is.
 *
 * Every companion-listing entry below is given as a literal `provider_field`
 * value in the shape this source actually publishes — a `tag` string — and never
 * as pre-split fields. The split under test is `registry.mjs`'s, not the
 * fixture's: a fixture that handed the resolver a ready-made provider slug would
 * be measuring its own arithmetic.
 *
 * The entries also carry `provider_name`, which the snapshot writer does NOT
 * store. That is deliberate: the resolver must ignore a display name even when
 * one is in front of it, and the spoof control below is only a control if the
 * forgeable field is actually present to be forged.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { cleanup, makeRoot, paths, readJson, runPulse, writeJson } from './helpers.mjs';

const ARGS = ['--no-build', '--no-mint', '--offline'];

const COMPANION = {
  url_template: 'http://fixture.invalid/models/{key}/endpoints',
  fetch_every_days: 1,
  covers: { field: 'pricing.prompt', test: 'nonzero', key: 'canonical_slug' },
  snapshot: 'endpoints',
  declared_on: '2026-09-07',
  canonical_tier: 'standard',
  provider_field: 'tag',
  provider_identities: {
    openai: { provider_slug: 'openai', declared_on: '2026-09-07' },
    // The case raw equality gets wrong, and this repository's own measurement
    // of it: `data/price-attribution-debt.json` names Google's listing
    // `google-ai-studio`, not `google`.
    google: { provider_slug: 'google-ai-studio', declared_on: '2026-09-07' },
    acme: { provider_slug: 'acme', declared_on: '2026-09-07' },
    mistral: { provider_slug: 'mistral', declared_on: '2026-09-07' },
  },
  rows_path: 'data.endpoints',
  rates: { price_input: 'pricing.prompt', price_output: 'pricing.completion' },
};

/** Seven rows, one companion key each, so a row's outcome is only its own. */
const ROWS = {
  'openai/gpt': { id: 'openai/gpt', name: 'GPT', canonical_slug: 'k-openai', pricing: { prompt: '0.000001' } },
  'google/gemini': { id: 'google/gemini', name: 'Gemini', canonical_slug: 'k-google', pricing: { prompt: '0.000002' } },
  'openai/flexy': { id: 'openai/flexy', name: 'Flexy', canonical_slug: 'k-flex', pricing: { prompt: '0.000003' } },
  'acme/absent': { id: 'acme/absent', name: 'Absent', canonical_slug: 'k-acme', pricing: { prompt: '0.000004' } },
  'openai/failed': { id: 'openai/failed', name: 'Failed', canonical_slug: 'k-failed', pricing: { prompt: '0.000005' } },
  'unmapped/x': { id: 'unmapped/x', name: 'Unmapped', canonical_slug: 'k-unmapped', pricing: { prompt: '0.000006' } },
  'mistral/spoof': { id: 'mistral/spoof', name: 'Spoof', canonical_slug: 'k-spoof', pricing: { prompt: '0.000007' } },
};

const ENDPOINTS = {
  // Resolves: a bare tag is the provider slug alone at its own standard tier.
  'k-openai': { status: 'ok', error: null, endpoints: [{ tag: 'openai', provider_name: 'openai', price_input: '0.00001', price_output: '0.00005' }] },
  // Resolves through the DECLARED identity, which raw equality would miss.
  'k-google': { status: 'ok', error: null, endpoints: [{ tag: 'google-ai-studio', provider_name: 'google-ai-studio', price_input: '0.00002', price_output: '0.00006' }] },
  // Present, but at no canonical tier: the measured 0.5x/2x spread, and the
  // reason guessing another of a vendor's tiers is not an option.
  'k-flex': {
    status: 'ok',
    error: null,
    endpoints: [
      { tag: 'openai/flex', provider_name: 'openai', price_input: '0.000005', price_output: '0.000025' },
      { tag: 'openai/fast', provider_name: 'openai', price_input: '0.00002', price_output: '0.0001' },
    ],
  },
  // The author is simply not in its own model's provider listing.
  'k-acme': { status: 'ok', error: null, endpoints: [{ tag: 'other', provider_name: 'other', price_input: '0.00009', price_output: '0.00009' }] },
  // One key's fetch failed; every row that key covers goes absent.
  'k-failed': { status: 'error', error: 'HTTP 500 Internal Server Error', endpoints: null },
  // The control that proves there is no raw-equality fallback: a provider whose
  // slug IS the row's raw author segment posts at the canonical tier, and the
  // map does not name that author.
  'k-unmapped': { status: 'ok', error: null, endpoints: [{ tag: 'unmapped', provider_name: 'unmapped', price_input: '0.00007', price_output: '0.00008' }] },
  // The spoof control: a different provider slug, at the canonical tier, under a
  // display name equal to the author's.
  'k-spoof': { status: 'ok', error: null, endpoints: [{ tag: 'mistral-lookalike', provider_name: 'mistral', price_input: '0.00006', price_output: '0.00006' }] },
};

function modelsSource(url, extra = {}) {
  return {
    id: 'models',
    url,
    format: 'json',
    rows_path: 'data',
    row_id_field: 'id',
    display_name_field: 'name',
    yields: ['id', 'name', 'pricing.prompt', 'canonical_slug'],
    fetch_every_days: 1,
    expected_change_days: 3,
    // `event: false` for the same reason the real registry carries it: the
    // headline is a rate on a listing whose referent rotates.
    material_fields: [{ field: 'price_input', path: 'pricing.prompt', event: false }],
    mints: null,
    robots: { checked_on: '2026-09-07', result: 'allowed', requests_per_day: 50 },
    verification: { date: '2026-09-07', result: 'live' },
    ...extra,
  };
}

/** A root whose two snapshots are written by hand, then derived from offline. */
function seededRoot({ companion = COMPANION, endpoints = ENDPOINTS } = {}) {
  const root = makeRoot([modelsSource('http://fixture.invalid/models', companion ? { companion } : {})]);
  writeJson(paths.latest(root, 'models'), {
    source: 'models',
    url: 'http://fixture.invalid/models',
    date: '2026-09-07',
    row_count: Object.keys(ROWS).length,
    rows: ROWS,
  });
  writeJson(paths.previous(root, 'models'), {
    source: 'models',
    url: 'http://fixture.invalid/models',
    date: '2026-09-07',
    row_count: Object.keys(ROWS).length,
    rows: ROWS,
  });
  if (companion) {
    writeJson(join(root, 'data', 'sources', 'models', 'endpoints.latest.json'), {
      source: 'models',
      companion: 'endpoints',
      url_template: companion.url_template,
      date: '2026-09-07',
      fetched_at: '2026-09-07T12:00:00.000Z',
      key_count: Object.keys(endpoints).length,
      keys: endpoints,
    });
  }
  return root;
}

function catalogRows(root) {
  const rows = readJson(paths.catalog(root)).rows;
  return new Map(rows.map((r) => [r.row_id, r]));
}

test('two rows resolve a vendor-posted rate and five are absent, each with its reason', async (t) => {
  const root = seededRoot();
  t.after(() => cleanup(root));

  const run = await runPulse(root, ARGS);
  assert.equal(run.status, 0, run.out);
  const rows = catalogRows(root);

  // ── The two that resolve ─────────────────────────────────────────────────
  const openai = rows.get('openai/gpt').vendor_posted_rate;
  assert.equal(openai.absent, false);
  assert.equal(openai.provider_slug, 'openai');
  assert.equal(openai.tier, 'standard', 'a bare tag denotes that provider’s own standard tier');
  assert.deepEqual(openai.rates, { price_input: '0.00001', price_output: '0.00005' });
  assert.equal(openai.as_of, '2026-09-07', 'and the bound rate is dated');

  const google = rows.get('google/gemini').vendor_posted_rate;
  assert.equal(google.absent, false, 'the declared identity resolves where raw equality would not');
  assert.equal(google.provider_slug, 'google-ai-studio');
  assert.equal(google.tier, 'standard');
  assert.deepEqual(google.rates, { price_input: '0.00002', price_output: '0.00006' });

  // ── The five that are absent, asserted on their REASONS ──────────────────
  const expected = [
    ['openai/flexy', 'author_posts_only_other_tiers', ['fast', 'flex']],
    ['acme/absent', 'author_not_in_listing', null],
    ['openai/failed', 'listing_did_not_fetch', null],
    ['unmapped/x', 'author_identity_not_declared', null],
    ['mistral/spoof', 'author_not_in_listing', null],
  ];
  for (const [rowId, code, tiers] of expected) {
    const row = rows.get(rowId);
    const vendor = row.vendor_posted_rate;
    // A DATED ABSENT VALUE, never a missing field: four different conditions
    // render as the same empty cell, and a missing field says nothing at all.
    assert.ok(
      Object.prototype.hasOwnProperty.call(row, 'vendor_posted_rate'),
      `${rowId}: the vendor field is present, not omitted`,
    );
    assert.equal(vendor.absent, true, rowId);
    assert.equal(vendor.as_of, '2026-09-07', `${rowId}: an absence is dated`);
    assert.equal(vendor.rates, null, rowId);
    assert.equal(vendor.reason.code, code, rowId);
    assert.deepEqual(vendor.reason.tiers_found, tiers, `${rowId}: the other-tiers reason names what it found`);
    // THE ASSERTION THAT CATCHES A FALLBACK. An absent vendor rate must not
    // borrow the headline: a fallback is how a listing rate becomes a vendor
    // attribution with nobody deciding to attribute anything.
    assert.equal(row.price_input, ROWS[rowId].pricing.prompt, `${rowId}: the listing rate is unchanged`);
  }

  // And the spoof control, said out loud: the comparison is on the two slugs, so
  // a display name equal to the author's forges nothing.
  assert.equal(ENDPOINTS['k-spoof'].endpoints[0].provider_name, 'mistral');
  assert.equal(rows.get('mistral/spoof').vendor_posted_rate.absent, true);
});

test('the vendor rate sits beside the listing rate and does not overwrite it', async (t) => {
  // Task 14, and design D2. The control is the SAME fixture with no companion
  // declared, so the only difference measured is the companion.
  const withCompanion = seededRoot();
  const without = seededRoot({ companion: null });
  t.after(() => {
    cleanup(withCompanion);
    cleanup(without);
  });

  assert.equal((await runPulse(withCompanion, ARGS)).status, 0);
  assert.equal((await runPulse(without, ARGS)).status, 0);

  const bound = catalogRows(withCompanion);
  const control = catalogRows(without);
  assert.equal(bound.size, control.size);
  for (const [rowId, row] of control) {
    assert.equal(
      bound.get(rowId).price_input,
      row.price_input,
      `${rowId}: the listing rate is byte-identical to what the same fixture produces with no companion`,
    );
    assert.equal(row.vendor_posted_rate, undefined, `${rowId}: a source with no companion grows no vendor field`);
    assert.ok(bound.get(rowId).vendor_posted_rate, `${rowId}: and a source with one carries it under its own name`);
  }
  // Both are true statements about different things, and the row carries both.
  assert.equal(bound.get('openai/gpt').price_input, '0.000001');
  assert.equal(bound.get('openai/gpt').vendor_posted_rate.rates.price_input, '0.00001');
});
