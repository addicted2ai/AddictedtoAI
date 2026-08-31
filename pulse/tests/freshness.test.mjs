/**
 * freshness.test.mjs — task 3.4: "staleness cannot hide".
 *
 * One fixture per state named in the spec, each run through the real
 * `pulse/run.mjs` offline with a fixed clock, so what is measured is the
 * shipped computation and not a restatement of it.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { cleanup, jsonSource, makeRoot, paths, readJson, runPulse, writeEntry, writeJson } from './helpers.mjs';

const ARGS = ['--no-build', '--no-mint', '--offline'];
const NOW = { PULSE_NOW: '2026-08-28' };

/** Write a snapshot pair straight to disk: no server, fully deterministic. */
function seedSnapshot(root, id, rows, { date = '2026-08-28', lastChange = '2026-08-28' } = {}) {
  const snapshot = { source: id, url: 'http://fixture.invalid', date, fetched_at: `${date}T00:00:00.000Z`, body_hash: 'fixture', row_count: Object.keys(rows).length, rows };
  writeJson(paths.latest(root, id), snapshot);
  writeJson(paths.previous(root, id), snapshot);
  writeJson(paths.state(root, id), {
    source: id,
    last_fetch_at: `${date}T00:00:00.000Z`,
    last_fetch_date: date,
    last_status: 200,
    last_change_date: lastChange,
    last_error: null,
    consecutive_no_change_fetches: 0,
    seeded: true,
    refusing: null,
  });
}

test('a cited fact past its volatility interval is overdue; one inside it is not', async (t) => {
  const root = makeRoot([]);
  t.after(() => cleanup(root));

  writeEntry(root, 'content/wiki/model/stale.md', {
    id: 'model/stale',
    kind: 'model',
    display_name: 'Stale',
    status: 'active',
    maintenance: 'living',
    aliases: [],
    feeds: {},
    facts: [
      { field: 'price_input', source: 'cited', value: '1', source_url: 'https://vendor.invalid/p', accessed: '2026-01-01', volatility: 'fast' },
      { field: 'license', source: 'cited', value: 'MIT', source_url: 'https://vendor.invalid/l', accessed: '2026-08-27', volatility: 'fast' },
      { field: 'released', source: 'cited', value: '2024-01-01', source_url: 'https://vendor.invalid/r', accessed: '2024-01-01', volatility: 'dated' },
    ],
    timeline: [],
    mentions: [],
  });

  assert.equal((await runPulse(root, ARGS, NOW)).status, 0);
  const fresh = readJson(paths.freshness(root));
  const fields = fresh.overdue_facts.map((f) => f.field).sort();
  assert.deepEqual(fields, ['price_input'], "only the fast fact past 14 days is overdue; `dated` facts are never re-checked");
  assert.equal(fresh.overdue_facts[0].interval_days, 14);
  assert.equal(fresh.overdue_facts[0].days_overdue, 239 - 14);
});

test('a dormant entry generates no re-check work, ever', async (t) => {
  const root = makeRoot([]);
  t.after(() => cleanup(root));
  writeEntry(root, 'content/wiki/model/dormant.md', {
    id: 'model/dormant',
    kind: 'model',
    display_name: 'Dormant',
    status: 'dead',
    maintenance: 'dormant',
    aliases: [],
    feeds: {},
    facts: [{ field: 'price_input', source: 'cited', value: '1', source_url: 'https://vendor.invalid/p', accessed: '2020-01-01', volatility: 'fast' }],
    timeline: [],
    mentions: [],
  });
  assert.equal((await runPulse(root, ARGS, NOW)).status, 0);
  assert.deepEqual(readJson(paths.freshness(root)).overdue_facts, []);
});

test('tutorial staleness has three states: fresh, stale, and demoted at 2x', async (t) => {
  const root = makeRoot([]);
  t.after(() => cleanup(root));
  const tut = (slug, verified) => ({ subjects: ['model/x'], verified_against: 'x', verified_on: verified, reverify_days: 30, mentions: [] });
  writeEntry(root, 'content/tutorials/fresh.md', tut('fresh', '2026-08-20'), 'body');
  writeEntry(root, 'content/tutorials/stale.md', tut('stale', '2026-07-20'), 'body');
  writeEntry(root, 'content/tutorials/demoted.md', tut('demoted', '2026-06-01'), 'body');

  assert.equal((await runPulse(root, ARGS, NOW)).status, 0);
  const states = Object.fromEntries(readJson(paths.freshness(root)).tutorials.map((x) => [x.slug, x.state]));
  assert.deepEqual(states, { fresh: 'fresh', stale: 'stale', demoted: 'demoted' });
});

test('a listing past its 45-day interval is due; two consecutive URL failures make it could-not-verify', async (t) => {
  const root = makeRoot([]);
  t.after(() => cleanup(root));
  // Ordinary public hosts, not `*.invalid`: a reserved documentation name is
  // one the rolling check deliberately never judges (see isCheckableUrl), so
  // a fixture built on one would prove nothing about the failing-URL path.
  // Nothing is fetched here — the run is offline and the state is seeded.
  writeEntry(root, 'content/directory/tools/ok.md', { url: 'https://ok.fixture-vendor.net/', pricing: 'free', last_verified: '2026-08-20', entry: 'tool/ok', mentions: [] }, 'body');
  writeEntry(root, 'content/directory/tools/old.md', { url: 'https://old.fixture-vendor.net/', pricing: 'free', last_verified: '2026-05-01', entry: 'tool/old', mentions: [] }, 'body');
  writeEntry(root, 'content/directory/tools/dead.md', { url: 'https://dead.fixture-vendor.net/', pricing: 'free', last_verified: '2026-08-20', entry: 'tool/dead', mentions: [] }, 'body');

  // A link-check state standing in for two prior Pulse checks that failed.
  writeJson(join(root, 'data', 'linkcheck.json'), {
    urls: {
      'https://ok.fixture-vendor.net/': { last_checked: '2026-08-27', status: 200, ok: true, error: null, last_ok: '2026-08-27', consecutive_failures: 0 },
      'https://old.fixture-vendor.net/': { last_checked: '2026-08-27', status: 200, ok: true, error: null, last_ok: '2026-08-27', consecutive_failures: 0 },
      'https://dead.fixture-vendor.net/': { last_checked: '2026-08-27', status: 404, ok: false, error: null, last_ok: '2026-06-01', consecutive_failures: 2 },
    },
  });

  assert.equal((await runPulse(root, ARGS, NOW)).status, 0);
  const fresh = readJson(paths.freshness(root));
  const states = Object.fromEntries(fresh.listings.map((l) => [l.slug, l.state]));
  assert.deepEqual(states, { ok: 'ok', old: 'due', dead: 'could-not-verify' });
  assert.equal(fresh.broken_links.length, 1);
  assert.equal(fresh.broken_links[0].url, 'https://dead.fixture-vendor.net/');
});

test('a source that has not changed for 3x its expected_change_days is suspect, and its date label flips', async (t) => {
  const root = makeRoot([jsonSource('quiet', 'http://fixture.invalid/quiet', { expected_change_days: 3 })]);
  t.after(() => cleanup(root));
  seedSnapshot(root, 'quiet', { 'a/b': { id: 'a/b', name: 'B', pricing: { prompt: '1' }, context_length: 1, expiration_date: null } }, {
    date: '2026-08-28',
    lastChange: '2026-08-10', // 18 days > 3 x 3
  });

  assert.equal((await runPulse(root, ARGS, NOW)).status, 0);
  const s = readJson(paths.freshness(root)).sources.find((x) => x.id === 'quiet');
  assert.equal(s.suspect, true);
  assert.equal(s.suspect_after_days, 9, 'the threshold is 3x expected_change_days, never the fetch cadence');
  assert.equal(s.display_date_label, 'last changed', 'so a silently broken fetcher cannot make the site look fresher than it is');
  assert.equal(s.display_date, '2026-08-10');
});

test('a source inside 3x its expected_change_days is not suspect', async (t) => {
  const root = makeRoot([jsonSource('busy', 'http://fixture.invalid/busy', { expected_change_days: 3, fetch_every_days: 30 })]);
  t.after(() => cleanup(root));
  seedSnapshot(root, 'busy', { 'a/b': { id: 'a/b', name: 'B', pricing: { prompt: '1' }, context_length: 1, expiration_date: null } }, {
    date: '2026-08-28',
    lastChange: '2026-08-25',
  });
  assert.equal((await runPulse(root, ARGS, NOW)).status, 0);
  const s = readJson(paths.freshness(root)).sources.find((x) => x.id === 'busy');
  assert.equal(s.suspect, false);
  assert.equal(s.display_date_label, 'last checked');
});

test('a declared row absent from the latest snapshot is vanished, and its last-known values stay available with an as-of date', async (t) => {
  const root = makeRoot([jsonSource('models', 'http://fixture.invalid/models')]);
  t.after(() => cleanup(root));

  const gone = { id: 'acme/gone', name: 'Acme Gone', pricing: { prompt: '0.000004' }, context_length: 4000, expiration_date: null };
  const here = { id: 'acme/here', name: 'Acme Here', pricing: { prompt: '0.000001' }, context_length: 1000, expiration_date: null };
  writeJson(paths.previous(root, 'models'), { source: 'models', url: 'http://fixture.invalid/models', date: '2026-08-20', body_hash: 'x', row_count: 2, rows: { 'acme/gone': gone, 'acme/here': here } });
  writeJson(paths.latest(root, 'models'), { source: 'models', url: 'http://fixture.invalid/models', date: '2026-08-28', body_hash: 'y', row_count: 1, rows: { 'acme/here': here } });
  writeJson(paths.state(root, 'models'), { source: 'models', last_fetch_date: '2026-08-28', last_change_date: '2026-08-28', seeded: true, refusing: null, consecutive_no_change_fetches: 0 });

  writeEntry(root, 'content/wiki/model/gone.md', {
    id: 'model/gone',
    kind: 'model',
    display_name: 'Acme Gone',
    status: 'active',
    maintenance: 'living',
    aliases: [],
    feeds: { models: 'acme/gone' },
    facts: [{ field: 'price_input', source: 'feed', feed: 'models', path: 'pricing.prompt', volatility: 'fast' }],
    timeline: [],
    mentions: [],
  });

  assert.equal((await runPulse(root, ARGS, NOW)).status, 0);
  const fresh = readJson(paths.freshness(root));
  assert.equal(fresh.vanished_feed_rows.length, 1);
  assert.equal(fresh.vanished_feed_rows[0].row_id, 'acme/gone');
  assert.equal(fresh.vanished_feed_rows[0].entry_id, 'model/gone');
  assert.equal(fresh.vanished_feed_rows[0].last_seen_date, '2026-08-20');

  const feedRows = readJson(join(root, 'data', 'derived', 'feed-rows.json'));
  const row = feedRows.models['acme/gone'];
  assert.equal(row.$vanished, true, 'the renderer is told the row is gone');
  assert.equal(row.$as_of, '2026-08-20', 'with the as-of date it must display');
  assert.equal(row.pricing.prompt, '0.000004', 'and the last-known value it must render instead of a current one');
});

test('a re-listed row that slug-collides with a retired entry not declaring it is a freshness finding (addictedtoai-2wa)', async (t) => {
  const root = makeRoot([jsonSource('models', 'http://fixture.invalid/models', { mints: { kind: 'model', slug_from: 'row_id' } })]);
  t.after(() => cleanup(root));

  const row = { id: 'allenai/olmo-3-32b-think', name: 'AllenAI: Olmo 3 32B Think', pricing: { prompt: '0' }, context_length: 65536, expiration_date: null };
  writeJson(paths.latest(root, 'models'), { source: 'models', url: 'http://fixture.invalid/models', date: '2026-08-29', body_hash: 'x', row_count: 1, rows: { 'allenai/olmo-3-32b-think': row } });
  writeJson(paths.state(root, 'models'), { source: 'models', last_fetch_date: '2026-08-29', last_change_date: '2026-08-29', seeded: true, refusing: null, consecutive_no_change_fetches: 0 });

  // Exactly the shape j-20260829-03 left behind: the entry survives, retired,
  // with its `feeds:` binding removed — `data/sources/openrouter-models/
  // minted.json` still remembers the row, but the entry no longer declares it.
  writeEntry(root, 'content/wiki/model/allenai-olmo-3-32b-think.md', {
    id: 'model/allenai-olmo-3-32b-think',
    kind: 'model',
    display_name: 'AllenAI: Olmo 3 32B Think',
    status: 'retired',
    maintenance: 'dormant',
    aliases: [],
    feeds: {},
    facts: [],
    timeline: [],
    mentions: [],
  });

  assert.equal((await runPulse(root, ARGS, NOW)).status, 0);
  const fresh = readJson(paths.freshness(root));
  assert.equal(fresh.slug_collisions.length, 1);
  assert.equal(fresh.slug_collisions[0].source, 'models');
  assert.equal(fresh.slug_collisions[0].row_id, 'allenai/olmo-3-32b-think');
  assert.equal(fresh.slug_collisions[0].entry_id, 'model/allenai-olmo-3-32b-think');
  assert.equal(fresh.slug_collisions[0].path, 'content/wiki/model/allenai-olmo-3-32b-think.md');
  assert.equal(fresh.slug_collisions[0].entry_status, 'retired');
});

test('an unparseable content file is counted and skipped, never fatal', async (t) => {
  const root = makeRoot([]);
  t.after(() => cleanup(root));
  const { writeFileSync, mkdirSync } = await import('node:fs');
  mkdirSync(join(root, 'content', 'wiki', 'model'), { recursive: true });
  writeFileSync(join(root, 'content', 'wiki', 'model', 'broken.md'), '---\nid: [unclosed\n---\nbody\n', 'utf8');
  const run = await runPulse(root, ARGS, NOW);
  assert.equal(run.status, 0, 'the engine keeps the site alive on a day one content file is broken');
  assert.match(run.out, /could not be parsed/);
  assert.equal(readJson(paths.freshness(root)).unreadable_content.length, 1);
});
