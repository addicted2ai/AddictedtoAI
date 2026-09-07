/**
 * registry.test.mjs — task 3.1: the checked-in source registry.
 *
 * These assertions are about the real `data/sources/registry.json`, not a
 * fixture: the launch registry is a data artifact this change is responsible
 * for, and its shape is what the rest of the Pulse relies on.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { join, resolve, dirname } from 'node:path';
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { COMPANION_REQUIRED, loadRegistry, findSource, splitProviderField } from '../lib/registry.mjs';
import { cleanup, makeRoot } from './helpers.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

test('the launch registry parses and declares both launch sources', () => {
  const registry = loadRegistry(ROOT);
  const ids = registry.sources.map((s) => s.id).sort();
  assert.deepEqual(ids, ['llm-releases', 'openrouter-models']);
});

test('every source carries a dated verification result and a dated robots check', () => {
  const registry = loadRegistry(ROOT);
  for (const s of registry.sources) {
    assert.match(s.verification.date, /^\d{4}-\d{2}-\d{2}$/, `${s.id}: verification date`);
    assert.ok(s.verification.result, `${s.id}: verification result`);
    assert.ok(s.verification.detail, `${s.id}: what the verification actually observed`);
    assert.match(s.robots.checked_on, /^\d{4}-\d{2}-\d{2}$/, `${s.id}: robots check date`);
    assert.equal(s.robots.result, 'allowed', `${s.id}: robots/terms result`);
    assert.ok(s.row_id_field, `${s.id}: which field is the row id`);
    assert.ok(Number.isFinite(s.fetch_every_days), `${s.id}: fetch cadence`);
    assert.ok(Number.isFinite(s.expected_change_days), `${s.id}: expected change cadence`);
    assert.ok(Array.isArray(s.yields) && s.yields.length > 0, `${s.id}: what it yields`);
  }
});

test('exactly one launch source mints, and it mints models', () => {
  // Design D7: "One minting source, deliberately, so cross-source duplicate
  // stubs cannot arise at launch."
  const registry = loadRegistry(ROOT);
  const minting = registry.sources.filter((s) => s.mints);
  assert.equal(minting.length, 1);
  assert.equal(minting[0].id, 'openrouter-models');
  assert.equal(minting[0].mints.kind, 'model');
  assert.equal(findSource(registry, 'llm-releases').mints, null, 'the release tracker is non-minting');
});

test('the release tracker is marked as a rolling window and never reports removals', () => {
  // Its feed carries the most recent items only. Treating a rolled-off item
  // as a retirement would put a false lifecycle event on the changed feed.
  const s = findSource(loadRegistry(ROOT), 'llm-releases');
  assert.equal(s.rolling_window, true);
  assert.equal(s.emit_on_remove, false);
  assert.ok(s.seeds, 'and it is the source the launch feed is seeded from');
});

test('the registry guards reject an undeclared source, naming what is missing', () => {
  const complete = {
    id: 'x',
    url: 'https://x.invalid',
    format: 'json',
    rows_path: 'data',
    row_id_field: 'id',
    fetch_every_days: 1,
    expected_change_days: 3,
    robots: { checked_on: '2026-08-28', result: 'allowed' },
    verification: { date: '2026-08-28', result: 'live' },
  };

  const loadWith = (source) => {
    const root = makeRoot([source]);
    try {
      loadRegistry(root);
      return null;
    } catch (err) {
      return err.message;
    } finally {
      cleanup(root);
    }
  };

  assert.equal(loadWith(complete), null, 'a complete source loads');

  const cases = [
    ['robots', /missing "robots" check/],
    ['verification', /missing "verification"/],
    ['expected_change_days', /missing numeric "expected_change_days"/],
    ['row_id_field', /missing "row_id_field"/],
    ['rows_path', /json format needs "rows_path"/],
  ];
  for (const [field, pattern] of cases) {
    const broken = { ...complete };
    delete broken[field];
    const message = loadWith(broken);
    assert.ok(message, `removing ${field} must be rejected`);
    assert.match(message, pattern);
    assert.match(message, /source "x"/, 'and the error names the source');
  }

  const badMint = { ...complete, mints: { kind: 'model', slug_from: 'display_name' } };
  assert.match(loadWith(badMint), /must be "row_id"/, 'a slug derived from anything but the row id is refused');
});

test("OpenRouter's artificial_analysis block is recorded as seen and deliberately not carried", () => {
  // The third state `material_fields_note` does not cover: a path in neither
  // `material_fields` nor `declined_fields` is UNDECIDED, and from the outside
  // that is indistinguishable from a refusal. This asserts the decision exists
  // as data, not only as prose.
  const s = findSource(loadRegistry(ROOT), 'openrouter-models');
  const declined = (s.declined_fields ?? []).find((d) => d.path === 'benchmarks.artificial_analysis');
  assert.ok(declined, 'the block carries a recorded decision');
  assert.equal(declined.decision, 'not carried');
  assert.match(declined.decided_on, /^\d{4}-\d{2}-\d{2}$/, 'and the decision is dated');
  assert.ok(declined.note.length > 200, 'and the measurement behind it travels with it');

  // Seen, not overlooked: it is in the field inventory the spec calls
  // "what fields it yields", and out of every carrying list.
  assert.ok(
    s.yields.some((y) => y.startsWith('benchmarks.artificial_analysis.')),
    'the source is recorded as serving it',
  );
  for (const spec of s.material_fields) {
    assert.ok(!String(spec.path).startsWith('benchmarks'), `${spec.field} must not carry it as a column or a fact`);
  }
});

test('a field cannot be both declined and carried, and a refusal must carry a dated reason', () => {
  const base = {
    id: 'x',
    url: 'https://x.invalid',
    format: 'json',
    rows_path: 'data',
    row_id_field: 'id',
    fetch_every_days: 1,
    expected_change_days: 3,
    robots: { checked_on: '2026-08-28', result: 'allowed' },
    verification: { date: '2026-08-28', result: 'live' },
    material_fields: [{ field: 'score', path: 'benchmarks.artificial_analysis.coding_index' }],
  };
  const good = {
    path: 'benchmarks.design_arena',
    decision: 'not carried',
    decided_on: '2026-09-05',
    note: 'measured, and here is the measurement',
  };

  const loadWith = (declined_fields, source = base) => {
    const root = makeRoot([{ ...source, declined_fields }]);
    try {
      loadRegistry(root);
      return null;
    } catch (err) {
      return err.message;
    } finally {
      cleanup(root);
    }
  };

  assert.equal(loadWith([good]), null, 'a well-formed refusal of an uncarried path loads');

  // Attempt what the guard forbids: declare the carried path refused. Either
  // direction of prefix overlap is the same contradiction.
  const collide = { ...good, path: 'benchmarks.artificial_analysis' };
  assert.match(loadWith([collide]), /declined and also carried/, 'a parent of a carried path is refused');
  assert.match(loadWith([collide]), /source "x"/, 'and the error names the source');
  const exact = { ...good, path: 'benchmarks.artificial_analysis.coding_index' };
  assert.match(loadWith([exact]), /declined and also carried/, 'and so is the exact path');

  // A refusal recorded where it cannot be enacted is not a decision.
  assert.match(loadWith([{ ...good, decision: 'column' }]), /only legal value/, 'no verdict but "not carried"');
  assert.match(loadWith([{ ...good, decision: undefined }]), /only legal value/, 'and it is required');

  // A refusal with no dated measurement is the undecided state wearing a label.
  assert.match(loadWith([{ ...good, note: '  ' }]), /needs a "note"/);
  assert.match(loadWith([{ ...good, note: undefined }]), /needs a "note"/);
  assert.match(loadWith([{ ...good, decided_on: '5 September' }]), /needs a "decided_on"/);
  assert.match(loadWith([{ ...good, decided_on: undefined }]), /needs a "decided_on"/);

  assert.match(loadWith([{ ...good, path: '' }]), /missing a string "path"/);
  assert.match(loadWith([good, { ...good }]), /declares "benchmarks.design_arena" twice/);
  assert.match(loadWith({ 'benchmarks.design_arena': 'no' }), /"declined_fields" must be an array/);
});

/*
 * The `frontier` block (`separate-a-claim-from-a-fact` task 22; specs/pulse,
 * "An index is registered with its publisher and its rights"). The registry is
 * the only place a published index may be declared, and the only place its
 * republication decision is recorded — so these assertions are about what the
 * load REFUSES, which is what makes the declaration mean something.
 */

const FRONTIER_SOURCE = {
  id: 'models',
  url: 'http://fixture.invalid/m',
  format: 'json',
  rows_path: 'data',
  row_id_field: 'id',
  fetch_every_days: 1,
  expected_change_days: 3,
  material_fields: [{ field: 'idx', path: 'benchmarks.idx' }],
  robots: { checked_on: '2026-09-06', result: 'allowed' },
  verification: { date: '2026-09-06', result: 'live' },
};

const METRIC = {
  id: 'fixture-index',
  field: 'fixture_index',
  path: 'benchmarks.idx',
  source: 'models',
  publisher: 'Fixture Analysis',
  publisher_url: 'https://fixture.invalid/',
  republisher: 'Fixture Router',
  direction: 'higher',
  label: 'Fixture Index',
};

function loadFrontier(frontier, source = FRONTIER_SOURCE) {
  const root = makeRoot([source]);
  try {
    const file = join(root, 'data', 'sources', 'registry.json');
    const raw = JSON.parse(readFileSync(file, 'utf8'));
    raw.frontier = frontier;
    writeFileSync(file, JSON.stringify(raw, null, 2) + '\n', 'utf8');
    loadRegistry(root);
    return null;
  } catch (err) {
    return err.message;
  } finally {
    cleanup(root);
  }
}

test('a frontier block declaring nothing still declares an empty metrics array', () => {
  assert.equal(loadFrontier({ metrics: [], row_exclusions: [] }), null);
  // Zero declared metrics is the day-one state and has to be STATED. An absent
  // array is not the same thing as an empty one: it is the shape a file has
  // before anyone decided anything, and `data/derived/frontier.json` must be
  // able to say "looked up, found none" rather than "nobody wrote this yet".
  assert.match(loadFrontier({ row_exclusions: [] }), /"metrics" must be an array/);
  assert.match(loadFrontier({ metrics: {} }), /"metrics" must be an array/);
});

test('a declared metric carries its publisher, its republisher and its direction', () => {
  assert.equal(loadFrontier({ metrics: [METRIC] }), null);
  for (const key of ['field', 'path', 'source', 'publisher', 'publisher_url', 'label']) {
    assert.match(loadFrontier({ metrics: [{ ...METRIC, [key]: undefined }] }), new RegExp(`missing string "${key}"`), key);
  }
  assert.match(loadFrontier({ metrics: [{ ...METRIC, direction: 'up' }] }), /"direction" must be one of/);
  assert.match(loadFrontier({ metrics: [{ ...METRIC, republisher: 7 }] }), /"republisher" must be a string or null/);
  assert.equal(
    loadFrontier({ metrics: [{ ...METRIC, republisher: null }] }),
    null,
    'null says the site reads the publisher directly',
  );
  assert.match(loadFrontier({ metrics: [METRIC, METRIC] }), /duplicate metric id/);
  assert.match(loadFrontier({ metrics: [{ ...METRIC, source: 'nowhere' }] }), /is not a declared source id/);
});

test('a metric may not be declared on a path the same source declines', () => {
  // `declined_fields` records that a path is NOT CARRIED after a measurement.
  // Declaring it a frontier metric is carrying it in a fourth sense, so the two
  // lists would be two decisions silently disagreeing — the same contradiction
  // `validateDeclinedFields` already refuses between `declined_fields` and
  // `material_fields`, asked of the third list.
  const source = {
    ...FRONTIER_SOURCE,
    material_fields: [],
    declined_fields: [
      {
        path: 'benchmarks.idx',
        decision: 'not carried',
        decided_on: '2026-09-05',
        note: 'measured: not a column, not a fact, not an event.',
      },
    ],
  };
  const message = loadFrontier({ metrics: [METRIC] }, source);
  assert.match(message, /declined on source "models"/);
  assert.match(message, /carried or refused, never both/);
  // The overlap is by path, in either direction, exactly as the carried check is.
  assert.match(loadFrontier({ metrics: [{ ...METRIC, path: 'benchmarks.idx.sub' }] }, source), /declined on source/);
});

test('a metric must be declared on a path that has a recorder for the other event', () => {
  // specs/pulse: "A change in the leader's VALUE with no change in the leader's
  // IDENTITY is a different event and SHALL be recorded as such, distinguishable
  // by kind or by a declared field." `pulse/lib/frontier.mjs` emits nothing for
  // that case on purpose, so the ONLY recorder is `diffSnapshots`' field_change
  // line — which fires only for a `material_fields` path not marked
  // `event: false`. Uncoupled, a metric on any other path made that event
  // unrecordable with every gate green, and BOTH real candidate metrics
  // (`benchmarks.artificial_analysis.*`, `benchmarks.design_arena[]`) are on
  // paths `openrouter-models` does not declare as material fields.
  const noMaterial = { ...FRONTIER_SOURCE, material_fields: [] };
  const message = loadFrontier({ metrics: [METRIC] }, noMaterial);
  assert.match(message, /not a "material_fields" path on source "models"/);
  assert.match(message, /recorded nowhere/, 'the message says what is lost, not only what is missing');
  assert.match(message, /Declare the path in "material_fields"|withdraw the metric/, 'and names the remedy');

  // A path declared but marked `event: false` is the same hole with a different
  // shape: the field is a catalog column and a bound fact, and no field_change
  // line is ever written for it.
  const silenced = { ...FRONTIER_SOURCE, material_fields: [{ field: 'idx', path: 'benchmarks.idx', event: false }] };
  assert.match(loadFrontier({ metrics: [METRIC] }, silenced), /"event": false/);

  // The control: the declared, event-bearing path loads.
  assert.equal(loadFrontier({ metrics: [METRIC] }), null);

  // A near-miss path is not covered by a material field either — the check is
  // on the path the field_change line is actually keyed to, not on a prefix.
  assert.match(
    loadFrontier({ metrics: [{ ...METRIC, path: 'benchmarks.idx.sub' }] }),
    /not a "material_fields" path/,
  );
});

test('a rights decision is malformed or absent, and the two are different states', () => {
  const rights = {
    terms_url: 'https://fixture.invalid/terms',
    checked_on: '2026-09-06',
    outcome: 'cleared',
    excerpt: 'You may republish these values with attribution.',
  };
  assert.equal(loadFrontier({ metrics: [{ ...METRIC, rights }] }), null);

  // ABSENT is legal and means UNANSWERED. It loads, because declaring a metric
  // and answering its rights question are two edits often days apart — and it
  // renders nothing, because `isCleared` is false for it and the build reports
  // it by name. A missing field and a cleared right must not look the same, and
  // failing the load here would instead make the honest intermediate state
  // unrepresentable.
  assert.equal(loadFrontier({ metrics: [METRIC] }), null);

  // MALFORMED is not legal, because it is a claim about permission with nothing
  // behind it.
  assert.match(
    loadFrontier({ metrics: [{ ...METRIC, rights: { ...rights, outcome: 'ok' } }] }),
    /only legal values are cleared, refused, unresolved/,
  );
  assert.match(
    loadFrontier({ metrics: [{ ...METRIC, rights: { ...rights, terms_url: '' } }] }),
    /must name the terms that were read/,
  );
  assert.match(
    loadFrontier({ metrics: [{ ...METRIC, rights: { ...rights, checked_on: 'yesterday' } }] }),
    /LOCAL date the terms were read/,
  );
  assert.match(
    loadFrontier({ metrics: [{ ...METRIC, rights: { ...rights, excerpt: '   ' } }] }),
    /"cleared" with no verbatim "excerpt"/,
    'a cleared right must rest on the words that grant it',
  );
  // A REFUSAL rests on words too, and they are the evidence. Excusing it would
  // record "somebody said no" with nothing anyone can re-read.
  assert.match(
    loadFrontier({ metrics: [{ ...METRIC, rights: { ...rights, outcome: 'refused', excerpt: undefined } }] }),
    /"refused" with no verbatim "excerpt"/,
  );
  assert.equal(
    loadFrontier({ metrics: [{ ...METRIC, rights: { ...rights, outcome: 'refused', excerpt: 'No republication of these values is permitted.' } }] }),
    null,
    'a refusal quoting the words that refused is a complete decision',
  );
  // An unresolved question needs no excerpt — there may be nothing to quote,
  // which is exactly what Artificial Analysis's 404'd terms URL looks like.
  assert.equal(
    loadFrontier({
      metrics: [
        { ...METRIC, rights: { terms_url: 'https://fixture.invalid/terms', checked_on: '2026-09-06', outcome: 'unresolved' } },
      ],
    }),
    null,
  );
});

test('a row exclusion is one declared pattern over ids, with its measurement', () => {
  const ex = { id_contains: ':', reason: 'service variant', decided_on: '2026-09-06', note: '88 of 431 rows carry one.' };
  assert.equal(loadFrontier({ metrics: [], row_exclusions: [ex] }), null);
  assert.equal(loadFrontier({ metrics: [], row_exclusions: [{ ...ex, id_contains: undefined, id_prefix: 'openrouter/' }] }), null);
  assert.match(
    loadFrontier({ metrics: [], row_exclusions: [{ ...ex, id_prefix: 'openrouter/' }] }),
    /exactly one of "id_prefix" or "id_contains"/,
    'two matchers on one row is a pattern nobody can read at a glance',
  );
  assert.match(
    loadFrontier({ metrics: [], row_exclusions: [{ reason: 'x', decided_on: '2026-09-06', note: 'n' }] }),
    /exactly one of "id_prefix" or "id_contains"/,
  );
  assert.match(loadFrontier({ metrics: [], row_exclusions: [{ ...ex, note: '  ' }] }), /needs a "note" carrying the measurement/);
  assert.match(loadFrontier({ metrics: [], row_exclusions: [{ ...ex, decided_on: undefined }] }), /needs a "decided_on" date/);
});

test('the launch registry declares a frontier block, with no metric registered and no right cleared', () => {
  // The state on 2026-09-06, and it is a measurement rather than a placeholder:
  // Artificial Analysis's terms URL 404'd (addictedtoai-ego8, OPEN) and Design
  // Arena's grant is addressed to an API applicant this repository is not, with
  // its attribution condition unmet (addictedtoai-c563, OPEN). So nothing
  // renders — and the block exists, so a surface looks it up and collapses
  // rather than standing in for it.
  const registry = loadRegistry(ROOT);
  assert.ok(registry.frontier, 'the block exists even with nothing registered');
  assert.deepEqual(registry.frontier.metrics, [], 'no index is registered by this change');
  assert.ok(registry.frontier.row_exclusions.length > 0, 'the eligibility exclusions are declared, with measurements');
  for (const ex of registry.frontier.row_exclusions) {
    assert.match(ex.decided_on, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(ex.note.length > 80, 'each exclusion carries the measurement behind it, not a label');
  }
});

/*
 * ── The companion fetch, and the bar in front of it ──────────────────────────
 *
 * Change `bind-a-price-to-the-vendor-that-posts-it`, tasks 6, 7 and 17.
 * specs/pulse, "Sources live in a registry and refusals are data".
 *
 * A companion declaration multiplies a source's request rate by the number of
 * distinct keys its own coverage rule yields. So what is measured here is what
 * the load REFUSES: eight required fields, three independent robots conditions,
 * a hand-maintained coverage list, and a display name written where a machine
 * key belongs.
 */

/**
 * Four rows over THREE covered rows and TWO distinct keys.
 *
 * `acme/one` and `acme/one:free` share one `canonical_slug`, which is the whole
 * of design D1 in a fixture: the companion is fetched once per key, so the count
 * the robots bar is compared against is 2 and not 3. `acme/free` prices at zero
 * and the `nonzero` test excludes it, so the coverage rule is doing work rather
 * than covering everything.
 */
const COMPANION_ROWS = {
  'acme/one': { id: 'acme/one', canonical_slug: 'acme/one', pricing: { prompt: '0.000001' } },
  'acme/one:free': { id: 'acme/one:free', canonical_slug: 'acme/one', pricing: { prompt: '0.000002' } },
  'acme/two': { id: 'acme/two', canonical_slug: 'acme/two', pricing: { prompt: '0.000003' } },
  'acme/free': { id: 'acme/free', canonical_slug: 'acme/free', pricing: { prompt: '0' } },
};

const COMPANION = {
  url_template: 'http://fixture.invalid/models/{key}/endpoints',
  fetch_every_days: 1,
  covers: { field: 'pricing.prompt', test: 'nonzero', key: 'canonical_slug' },
  snapshot: 'endpoints',
  declared_on: '2026-09-07',
  canonical_tier: 'standard',
  provider_field: 'tag',
  provider_identities: { acme: { provider_slug: 'acme', declared_on: '2026-09-07' } },
  rows_path: 'data.endpoints',
  rates: { price_input: 'pricing.prompt', price_output: 'pricing.completion' },
};

const COMPANION_HOST = {
  id: 'x',
  url: 'https://x.invalid',
  format: 'json',
  rows_path: 'data',
  row_id_field: 'id',
  fetch_every_days: 1,
  expected_change_days: 3,
  material_fields: [{ field: 'price_input', path: 'pricing.prompt', event: false }],
  robots: { checked_on: '2026-09-07', result: 'allowed', requests_per_day: 2 },
  verification: { date: '2026-09-07', result: 'live' },
};

/** Load a registry whose one source carries `companion`, over a written snapshot. */
function loadCompanion(companion, { robots = COMPANION_HOST.robots, rows = COMPANION_ROWS } = {}) {
  const root = makeRoot([{ ...COMPANION_HOST, robots, companion }]);
  try {
    const dir = join(root, 'data', 'sources', 'x');
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, 'latest.json'),
      JSON.stringify({ source: 'x', date: '2026-09-07', row_count: Object.keys(rows).length, rows }, null, 2),
      'utf8',
    );
    loadRegistry(root);
    return null;
  } catch (err) {
    return err.message;
  } finally {
    cleanup(root);
  }
}

test('a companion declaration is refused on fourteen separate conditions, each named', () => {
  // The control. Everything present, the robots record re-checked on the day the
  // companion was declared, and the stated rate at least the distinct-key count.
  assert.equal(loadCompanion(COMPANION), null, 'a complete companion declaration loads');

  // ── The eight required fields, omitted IN TURN ────────────────────────────
  // Eight refusals, not one loop asserted once: each case asserts the thrown
  // message names THAT field. Shortening the required-field list in
  // `registry.mjs` to `canonical_tier` alone makes exactly the other seven of
  // these fail, which is the assertion that the eight are independent.
  assert.equal(COMPANION_REQUIRED.length, 8, 'the required list is the eight the delta names');
  for (const field of COMPANION_REQUIRED) {
    const broken = { ...COMPANION };
    delete broken[field];
    const message = loadCompanion(broken);
    assert.ok(message, `omitting ${field} must be refused`);
    assert.match(message, new RegExp(`is missing "${field}"`), `and the message names ${field}`);
    assert.match(message, /source "x"/, 'and names the source');
  }

  // ── The three robots conditions, independent and separately named ─────────
  const stale = loadCompanion(COMPANION, {
    robots: { checked_on: '2026-09-06', result: 'allowed', requests_per_day: 2 },
  });
  assert.match(stale, /earlier than this companion's "declared_on"/, 'a check older than the declaration');
  assert.match(stale, /source "x"/);

  const unstated = loadCompanion(COMPANION, { robots: { checked_on: '2026-09-07', result: 'allowed' } });
  assert.match(unstated, /no integer "robots.requests_per_day"/, 'a volume nobody stated as a number');

  const understated = loadCompanion(COMPANION, {
    robots: { checked_on: '2026-09-07', result: 'allowed', requests_per_day: 1 },
  });
  assert.match(
    understated,
    /is 1, fewer than the 2 distinct key\(s\)/,
    'one fewer than the distinct-key count the coverage rule yields from the snapshot',
  );
  // And the count is PER KEY, not per row: three rows are covered and two keys
  // span them, so a stated rate of 2 is enough. That is design D1's saving, in
  // the one place a build can measure it.
  assert.equal(loadCompanion(COMPANION, { robots: { ...COMPANION_HOST.robots, requests_per_day: 2 } }), null);

  // ── A hand-maintained coverage list ───────────────────────────────────────
  const listed = loadCompanion({ ...COMPANION, covers: ['acme/one', 'acme/two'] });
  assert.match(listed, /enumerates row ids/);
  assert.match(listed, /coverage gap that nothing can detect/, 'and says what a list costs');
  assert.match(listed, /source "x"/);

  // ── The fourteenth: a display name where a machine key belongs ────────────
  // The only test of "both sides of every map entry SHALL be machine keys", and
  // the reason a rename or a lookalike cannot forge an attribution. `OpenAI` is
  // a label whoever writes the listing sets; it is not a slug.
  const displayName = loadCompanion({
    ...COMPANION,
    provider_identities: { acme: { provider_slug: 'OpenAI', declared_on: '2026-09-07' } },
  });
  assert.match(displayName, /not a machine key/);
  assert.match(displayName, /entry "acme"/, 'and the message names that entry');
  assert.match(displayName, /source "x"/);
});

test('the provider_field split reads a slug and a tier out of one value', () => {
  // Task 7. The source publishes no bare provider-slug field: measured on its own
  // /endpoints response (data/reviews/j-20260902-01.md:93), an endpoint is
  // {"provider_name":"Anthropic","tag":"anthropic/fast", ...}. So the identity
  // and the tier are both read out of `tag`, by splitting on its first `/`.
  assert.deepEqual(splitProviderField({ tag: 'anthropic/fast' }, 'tag'), {
    provider_slug: 'anthropic',
    tier: 'fast',
  });

  // A value with no `/` names the provider slug alone and denotes that
  // provider's own STANDARD tier — the reading this site's own measured tier
  // spread already uses the word for: `openai` bare at 1x against `openai/flex`
  // at 0.5x and `openai/fast` at 2x (data/price-attribution-debt.json).
  assert.deepEqual(splitProviderField({ tag: 'openai' }, 'tag'), { provider_slug: 'openai', tier: 'standard' });

  // Whitespace around the slash does not move the split: it is still the first
  // `/` alone, with both halves trimmed and case-folded so the two sides of the
  // identity comparison are normalised by one rule rather than two.
  assert.deepEqual(splitProviderField({ tag: '  Anthropic / Fast  ' }, 'tag'), {
    provider_slug: 'anthropic',
    tier: 'fast',
  });
  assert.deepEqual(splitProviderField({ tag: 'azure/eu' }, 'tag'), { provider_slug: 'azure', tier: 'eu' });

  assert.equal(splitProviderField({ tag: '' }, 'tag'), null, 'an empty value identifies nobody');
  assert.equal(splitProviderField({ provider_name: 'Anthropic' }, 'tag'), null, 'a missing field identifies nobody');
  assert.equal(splitProviderField(null, 'tag'), null);
});

test('the author-identity map and the provider field are read in exactly two files', () => {
  // Task 17, and it is a SOURCE-SCANNING assertion rather than a behavioural
  // fixture on purpose: "the map SHALL NOT be consulted for anything but that
  // comparison" is a claim about where the code reads it, and no fixture can
  // measure a read that does not happen on the path the fixture drives.
  //
  // `registry.mjs` validates the declaration and owns the split; `derive.mjs`
  // resolves one row's vendor rate with it. A third reader is a second opinion
  // about what an author's identity is, which is the thing the declaration
  // exists to make singular.
  const libDir = join(ROOT, 'pulse', 'lib');
  const readers = new Set();
  for (const name of readdirSync(libDir)) {
    if (!name.endsWith('.mjs')) continue;
    const text = readFileSync(join(libDir, name), 'utf8');
    if (text.includes('.provider_identities') || text.includes('.provider_field')) readers.add(name);
  }
  assert.deepEqual([...readers].sort(), ['derive.mjs', 'registry.mjs']);
});
