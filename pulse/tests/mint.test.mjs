/**
 * mint.test.mjs — task 3.10: mechanical stub minting and lifecycle timeline
 * appends.
 *
 * The properties under test are the safety ones. Minting *creates a new
 * record*; it must never modify an existing entry, and every alias it writes
 * must be classed `manual`, because an automatic process that could claim
 * `exclusive` could create a wrong link.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import YAML from 'yaml';
import { cleanup, jsonSource, makeRoot, readLines, paths, runPulse, serve, writeEntry, writeJson } from './helpers.mjs';
import { findSlugCollisions, slugFromRowId } from '../lib/mint.mjs';

const NO_BUILD = ['--no-build'];

function body(rows) {
  return JSON.stringify({ data: rows });
}

const MINTS = { mints: { kind: 'model', slug_from: 'row_id' } };

function stubDir(root) {
  return join(root, 'content', 'wiki', 'model');
}

function readStub(root, slug) {
  const text = readFileSync(join(stubDir(root), `${slug}.md`), 'utf8');
  const end = text.indexOf('\n---', 3);
  return { front: YAML.parse(text.slice(4, end + 1)), text };
}

test('slug derivation is deterministic kebab-case', () => {
  assert.equal(slugFromRowId('anthropic/claude-opus-5'), 'anthropic-claude-opus-5');
  assert.equal(slugFromRowId('dots-studio/dots-3-note-preview:free'), 'dots-studio-dots-3-note-preview-free');
  assert.equal(slugFromRowId('Z-AI/GLM_5.3'), 'z-ai-glm-5-3');
});

test('one undeclared row mints exactly one stub, with manual aliases, and a second run mints nothing', async (t) => {
  const rows = [{ id: 'acme/one', name: 'Acme One', pricing: { prompt: '0.000001' }, context_length: 100000, expiration_date: null }];
  const server = await serve(() => ({ status: 200, body: body(rows) }));
  const root = makeRoot([jsonSource('models', `${server.url}/models`, MINTS)]);
  t.after(async () => {
    await server.close();
    cleanup(root);
  });

  const first = await runPulse(root, NO_BUILD);
  assert.equal(first.status, 0, first.out);
  assert.match(first.out, /mint — 1 stub\(s\) minted from 1 undeclared row\(s\)/);

  const files = readdirSync(stubDir(root));
  assert.deepEqual(files, ['acme-one.md'], 'exactly one stub file');

  const { front } = readStub(root, 'acme-one');
  assert.equal(front.id, 'model/acme-one');
  assert.equal(front.kind, 'model');
  assert.equal(front.display_name, 'Acme One');
  assert.equal(front.maintenance, 'living');
  assert.equal(front.status, 'active');
  assert.deepEqual(front.feeds, { models: 'acme/one' });
  assert.ok(Array.isArray(front.aliases) && front.aliases.length > 0);
  for (const a of front.aliases) {
    assert.equal(a.class, 'manual', 'a mechanically minted alias is always `manual` — an automatic process never claims `exclusive`');
  }
  assert.ok(front.facts.some((f) => f.field === 'price_input' && f.source === 'feed' && f.feed === 'models' && f.path === 'pricing.prompt'));
  assert.ok(front.facts.some((f) => f.field === 'context_window' && f.path === 'context_length'));
  assert.deepEqual(front.timeline, []);
  assert.deepEqual(front.mentions, []);

  // Provenance lives beside the source's state, not in the entry: the entry
  // schema is strict and has no field for "a machine made this".
  const provenance = JSON.parse(readFileSync(join(root, 'data', 'sources', 'models', 'minted.json'), 'utf8'));
  assert.equal(provenance['acme/one'].entry_id, 'model/acme-one');
  assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(provenance['acme/one'].date));

  const second = await runPulse(root, [...NO_BUILD, '--force']);
  assert.equal(second.status, 0, second.out);
  assert.match(second.out, /mint — 0 stub\(s\) minted from 0 undeclared row\(s\)/, 'a declared row never mints again');
  assert.deepEqual(readdirSync(stubDir(root)), ['acme-one.md']);
});

test("a non-minting source's new row creates no entry file", async (t) => {
  let rows = [{ id: 'acme/one', name: 'Acme One', pricing: { prompt: '0.000001' }, context_length: 100000, expiration_date: null }];
  const server = await serve(() => ({ status: 200, body: body(rows) }));
  const root = makeRoot([jsonSource('plain', `${server.url}/plain`)]); // no `mints`
  t.after(async () => {
    await server.close();
    cleanup(root);
  });

  assert.equal((await runPulse(root, NO_BUILD)).status, 0);
  rows = [...rows, { id: 'acme/two', name: 'Acme Two', pricing: { prompt: '0.000002' }, context_length: 200000, expiration_date: null }];
  const run = await runPulse(root, [...NO_BUILD, '--force']);
  assert.equal(run.status, 0, run.out);

  assert.equal(existsSync(stubDir(root)), false, 'no entry file is created by a source with no `mints` mapping');
  const arrivals = readLines(paths.changes(root)).filter((l) => l.kind === 'arrival');
  assert.equal(arrivals.length, 1, 'the new row still reaches the changed feed');
  const catalog = JSON.parse(readFileSync(paths.catalog(root), 'utf8'));
  assert.equal(catalog.rows.length, 2, 'and the catalog');
});

test('a hand-authored entry is never re-minted or modified by minting', async (t) => {
  const rows = [{ id: 'acme/one', name: 'Acme One', pricing: { prompt: '0.000001' }, context_length: 100000, expiration_date: null }];
  const server = await serve(() => ({ status: 200, body: body(rows) }));
  const root = makeRoot([jsonSource('models', `${server.url}/models`, MINTS)]);
  t.after(async () => {
    await server.close();
    cleanup(root);
  });

  const file = writeEntry(
    root,
    'content/wiki/model/hand-written.md',
    {
      id: 'model/hand-written',
      kind: 'model',
      display_name: 'Acme One',
      status: 'active',
      maintenance: 'living',
      aliases: [{ name: 'Acme One', class: 'exclusive' }],
      feeds: { models: 'acme/one' },
      facts: [],
      timeline: [],
      mentions: [],
    },
    'A hand-authored body that must survive untouched.\n',
  );
  const before = readFileSync(file, 'utf8');

  const run = await runPulse(root, NO_BUILD);
  assert.equal(run.status, 0, run.out);
  assert.match(run.out, /mint — 0 stub\(s\) minted from 0 undeclared row\(s\)/);
  assert.deepEqual(readdirSync(stubDir(root)), ['hand-written.md'], 'the declared row minted nothing');
  assert.equal(readFileSync(file, 'utf8'), before, 'the existing entry is byte-identical after the run');
});

test('a status flip appends exactly one timeline event to the joined entry, and a re-run appends no duplicate', async (t) => {
  let rows = [{ id: 'acme/one', name: 'Acme One', pricing: { prompt: '0.000001' }, context_length: 100000, expiration_date: null }];
  const server = await serve(() => ({ status: 200, body: body(rows) }));
  const root = makeRoot([jsonSource('models', `${server.url}/models`, MINTS)]);
  t.after(async () => {
    await server.close();
    cleanup(root);
  });

  const file = writeEntry(root, 'content/wiki/model/acme-one.md', {
    id: 'model/acme-one',
    kind: 'model',
    display_name: 'Acme One',
    status: 'active',
    maintenance: 'living',
    aliases: [{ name: 'Acme One', class: 'exclusive' }],
    feeds: { models: 'acme/one' },
    facts: [],
    timeline: [],
    mentions: [],
  });

  assert.equal((await runPulse(root, NO_BUILD)).status, 0);

  // The source now says the row expires soon: derived status active -> deprecated.
  rows = [{ ...rows[0], expiration_date: '2026-09-30' }];
  const run = await runPulse(root, [...NO_BUILD, '--force'], { PULSE_NOW: '2026-08-28' });
  assert.equal(run.status, 0, run.out);
  assert.match(run.out, /timeline — 1 lifecycle event\(s\) appended/);

  const text = readFileSync(file, 'utf8');
  const front = YAML.parse(text.slice(4, text.indexOf('\n---', 3) + 1));
  assert.equal(front.timeline.length, 1, 'exactly one timeline event');
  const ev = front.timeline[0];
  assert.deepEqual(Object.keys(ev).sort(), ['date', 'event', 'source_url'], 'the strict timeline shape and nothing more');
  assert.equal(ev.date, '2026-08-28', 'the event is dated');
  assert.equal(ev.event, 'deprecated');
  assert.ok(ev.source_url, 'the event is sourced');
  assert.equal(front.id, 'model/acme-one', 'the rest of the front matter survives');

  const again = await runPulse(root, [...NO_BUILD, '--offline'], { PULSE_NOW: '2026-08-28' });
  assert.equal(again.status, 0, again.out);
  const front2 = (() => {
    const t2 = readFileSync(file, 'utf8');
    return YAML.parse(t2.slice(4, t2.indexOf('\n---', 3) + 1));
  })();
  assert.equal(front2.timeline.length, 1, 're-running appends no duplicate');
});

test('a standing diff does not re-fire the timeline event on a later day', async (t) => {
  // The diff between `previous` and `latest` only rotates when the source
  // actually changes, so the same status change is recomputed every run until
  // the next change. If the timeline append were driven by the computed diff
  // rather than by what was newly recorded, it would add one event per day.
  let rows = [{ id: 'acme/one', name: 'Acme One', pricing: { prompt: '0.000001' }, context_length: 100000, expiration_date: null }];
  const server = await serve(() => ({ status: 200, body: body(rows) }));
  const root = makeRoot([jsonSource('models', `${server.url}/models`, MINTS)]);
  t.after(async () => {
    await server.close();
    cleanup(root);
  });

  const file = writeEntry(root, 'content/wiki/model/acme-one.md', {
    id: 'model/acme-one', kind: 'model', display_name: 'Acme One', status: 'active', maintenance: 'living',
    aliases: [{ name: 'Acme One', class: 'manual' }], feeds: { models: 'acme/one' }, facts: [], timeline: [], mentions: [],
  });

  assert.equal((await runPulse(root, NO_BUILD, { PULSE_NOW: '2026-08-28' })).status, 0);
  rows = [{ ...rows[0], expiration_date: '2026-09-30' }];
  assert.equal((await runPulse(root, [...NO_BUILD, '--force'], { PULSE_NOW: '2026-08-28' })).status, 0);

  const count = () => {
    const text = readFileSync(file, 'utf8');
    return (YAML.parse(text.slice(4, text.indexOf('\n---', 3) + 1)).timeline ?? []).length;
  };
  assert.equal(count(), 1);

  // Three more days pass with no further change at the source.
  for (const day of ['2026-08-29', '2026-08-30', '2026-08-31']) {
    assert.equal((await runPulse(root, [...NO_BUILD, '--force'], { PULSE_NOW: day })).status, 0);
  }
  assert.equal(count(), 1, 'still exactly one event, three days later');
});

test('a minted stub validates against the content model\'s entry schema', async (t) => {
  let entrySchema;
  try {
    ({ entrySchema } = await import('../../lib/schema.mjs'));
  } catch {
    t.skip('lib/schema.mjs is not importable yet');
    return;
  }
  if (!entrySchema) {
    t.skip('lib/schema.mjs exports no entrySchema');
    return;
  }

  const rows = [{ id: 'acme/one:free', name: 'Acme One (free)', pricing: { prompt: '0' }, context_length: 100000, expiration_date: '2026-09-30' }];
  const server = await serve(() => ({ status: 200, body: body(rows) }));
  const root = makeRoot([jsonSource('models', `${server.url}/models`, MINTS)]);
  t.after(async () => {
    await server.close();
    cleanup(root);
  });

  assert.equal((await runPulse(root, NO_BUILD)).status, 0);
  const { front } = readStub(root, 'acme-one-free');
  const parsed = entrySchema.safeParse(front);
  assert.equal(parsed.success, true, `a mechanically minted stub must satisfy the build's schema:\n${JSON.stringify(parsed.error?.issues, null, 2)}`);
});

test('a price change never reaches the timeline — only status does', async (t) => {
  let rows = [{ id: 'acme/one', name: 'Acme One', pricing: { prompt: '0.000001' }, context_length: 100000, expiration_date: null }];
  const server = await serve(() => ({ status: 200, body: body(rows) }));
  const root = makeRoot([jsonSource('models', `${server.url}/models`, MINTS)]);
  t.after(async () => {
    await server.close();
    cleanup(root);
  });

  const file = writeEntry(root, 'content/wiki/model/acme-one.md', {
    id: 'model/acme-one',
    kind: 'model',
    display_name: 'Acme One',
    status: 'active',
    maintenance: 'living',
    aliases: [{ name: 'Acme One', class: 'manual' }],
    feeds: { models: 'acme/one' },
    facts: [],
    timeline: [],
    mentions: [],
  });

  assert.equal((await runPulse(root, NO_BUILD)).status, 0);
  rows = [{ ...rows[0], pricing: { prompt: '0.000005' } }];
  assert.equal((await runPulse(root, [...NO_BUILD, '--force'])).status, 0);

  const text = readFileSync(file, 'utf8');
  const front = YAML.parse(text.slice(4, text.indexOf('\n---', 3) + 1));
  assert.deepEqual(front.timeline, [], 'prices live in the diff history, not the timeline');
  const priceLines = readLines(paths.changes(root)).filter((l) => l.field === 'price_input');
  assert.equal(priceLines.length, 1, 'the price change is in the diff history');
});

/**
 * The regression this file did not previously catch (2026-08-29).
 *
 * `appendTimelineEvents` wrote `date` as a bare scalar, so YAML emitted
 * `date: 2026-08-29` — a *timestamp*, which round-trips back as a `Date`. The
 * entry schema's `isoDate` then rejected it ("expected string, received Date"),
 * and the Pulse's own site rebuild failed on a file the Pulse had just written.
 * Because the broken entry no longer loaded, an org page whose `mentions` named
 * it failed too: one bad scalar, two content errors, in unrelated files.
 *
 * Every other test here reads the timeline through `YAML.parse`, which is why
 * they all passed while the engine could not complete a run — a parsed `Date`
 * compares equal enough to a date string in a `deepEqual` on other fields.
 * This test asserts the TYPE after a round trip, which is the thing that broke.
 */
test('an appended timeline date survives a round trip as a string, not a Date', async (t) => {
  let rows = [{ id: 'acme/two', name: 'Acme Two', pricing: { prompt: '0.000001' }, context_length: 100000, expiration_date: null }];
  const server = await serve(() => ({ status: 200, body: body(rows) }));
  const root = makeRoot([jsonSource('models', `${server.url}/models`, MINTS)]);
  t.after(async () => {
    await server.close();
    cleanup(root);
  });

  const file = writeEntry(root, 'content/wiki/model/acme-two.md', {
    id: 'model/acme-two',
    kind: 'model',
    display_name: 'Acme Two',
    status: 'active',
    maintenance: 'living',
    aliases: [{ name: 'Acme Two', class: 'manual' }],
    feeds: { models: 'acme/two' },
    facts: [],
    timeline: [],
    mentions: [],
  });

  assert.equal((await runPulse(root, NO_BUILD)).status, 0);
  // The source now says the row expires soon: derived status active -> deprecated,
  // which is the only kind of change that reaches the timeline.
  rows = [{ ...rows[0], expiration_date: '2026-09-30' }];
  assert.equal((await runPulse(root, [...NO_BUILD, '--force'])).status, 0);

  const text = readFileSync(file, 'utf8');
  const front = YAML.parse(text.slice(4, text.indexOf('\n---', 3) + 1));
  assert.ok(front.timeline.length >= 1, 'a status change appends a timeline event');

  for (const entry of front.timeline) {
    assert.equal(
      typeof entry.date,
      'string',
      `timeline date must round-trip as a string; got ${entry.date instanceof Date ? 'Date' : typeof entry.date}. ` +
        'A bare YAML scalar that looks like a date is parsed as a timestamp and fails the entry schema.',
    );
    assert.match(entry.date, /^\d{4}-\d{2}-\d{2}$/, 'and it must still be an ISO day');
  }
});

/**
 * findSlugCollisions (addictedtoai-2wa).
 *
 * j-20260829-03 retired `model/allenai-olmo-3-32b-think` by removing its
 * `feeds:` binding after the row vanished from OpenRouter. `minted.json`
 * still records the row, but that is not what this function reads — it
 * reads the corpus's declared feed bindings, exactly as `declaredRowIds`
 * does for minting itself. If OpenRouter ever re-lists the row, `writeStub`
 * silently refuses to mint it forever (a `slug-collision` outcome, logged
 * once per run and otherwise invisible); this function is what turns that
 * condition into a derived-queue finding the Desk can act on.
 *
 * Unit-tested directly against the pure function — no subprocess, no real
 * HTTP source, no real minting — because the property under test is
 * arithmetic over already-loaded state (a snapshot already on disk and a
 * hand-built corpus). The wiring into `freshness.json` and `queue.json` is
 * covered end to end in freshness.test.mjs and queue.test.mjs.
 */

const OLMO_ROW_ID = 'allenai/olmo-3-32b-think';
const OLMO_ROW = { id: OLMO_ROW_ID, name: 'AllenAI: Olmo 3 32B Think', pricing: { prompt: '0' }, context_length: 65536, expiration_date: null };
const OLMO_ENTRY_ID = 'model/allenai-olmo-3-32b-think';
const OLMO_ENTRY_PATH = 'content/wiki/model/allenai-olmo-3-32b-think.md';

function slugSnapshot(rows) {
  return { source: 'models', url: 'http://fixture.invalid/models', date: '2026-08-29', body_hash: 'x', row_count: Object.keys(rows).length, rows };
}

function slugRegistry() {
  return { sources: [jsonSource('models', 'http://fixture.invalid/models', MINTS)] };
}

test('a re-listed row that slug-collides with a retired entry not declaring it is reported', (t) => {
  const root = makeRoot([]);
  t.after(() => cleanup(root));
  writeJson(paths.latest(root, 'models'), slugSnapshot({ [OLMO_ROW_ID]: OLMO_ROW }));

  const corpus = {
    entries: [
      { id: OLMO_ENTRY_ID, path: OLMO_ENTRY_PATH, status: 'retired', feeds: {} }, // the binding j-20260829-03 removed
    ],
  };

  const found = findSlugCollisions(root, slugRegistry(), corpus);
  assert.equal(found.length, 1);
  assert.deepEqual(found[0], {
    source: 'models',
    row_id: OLMO_ROW_ID,
    entry_id: OLMO_ENTRY_ID,
    path: OLMO_ENTRY_PATH,
    entry_status: 'retired',
  });
});

test('negative (a): a row already declared by its own entry is not a collision — it mints/joins normally', (t) => {
  const root = makeRoot([]);
  t.after(() => cleanup(root));
  writeJson(paths.latest(root, 'models'), slugSnapshot({ [OLMO_ROW_ID]: OLMO_ROW }));

  const corpus = {
    entries: [{ id: OLMO_ENTRY_ID, path: OLMO_ENTRY_PATH, status: 'active', feeds: { models: OLMO_ROW_ID } }],
  };

  assert.deepEqual(findSlugCollisions(root, slugRegistry(), corpus), []);
});

test('negative (b): a row with no colliding entry at all reports nothing — it mints normally', (t) => {
  const root = makeRoot([]);
  t.after(() => cleanup(root));
  const freshRow = { id: 'acme/brand-new', name: 'Brand New', pricing: { prompt: '0' }, context_length: 1000, expiration_date: null };
  writeJson(paths.latest(root, 'models'), slugSnapshot({ 'acme/brand-new': freshRow }));

  assert.deepEqual(findSlugCollisions(root, slugRegistry(), { entries: [] }), []);
});

test('negative (c): an entry whose feed binding was removed while the row is genuinely still absent reports nothing', (t) => {
  // The case a careless implementation gets wrong: it is tempting to treat "an
  // entry with an empty feeds binding" as the signal by itself, or to widen
  // the candidate rows using `minted.json`'s historical record (exactly the
  // file addictedtoai-2wa's defect centres on). The condition is about the
  // SNAPSHOT — the row must be a key of `latest.rows` — not about an entry's
  // history or minting provenance. A row that vanished and simply has not
  // come back is `vanished-feed-row`'s condition (freshness.mjs), not this
  // one, and the two must never both fire for the same row. `minted.json` is
  // seeded here with exactly the real repository's record for this row (see
  // `data/sources/openrouter-models/minted.json`) so an implementation that
  // carelessly reads it as a candidate source, instead of only `latest.rows`,
  // is caught rather than accidentally passing because the fixture omitted it.
  const root = makeRoot([]);
  t.after(() => cleanup(root));
  const otherRow = { id: 'acme/still-here', name: 'Still Here', pricing: { prompt: '0' }, context_length: 1000, expiration_date: null };
  writeJson(paths.latest(root, 'models'), slugSnapshot({ 'acme/still-here': otherRow })); // no olmo row in latest
  writeJson(join(root, 'data', 'sources', 'models', 'minted.json'), {
    [OLMO_ROW_ID]: { entry_id: OLMO_ENTRY_ID, path: OLMO_ENTRY_PATH, date: '2026-08-28' },
  });

  const corpus = {
    entries: [{ id: OLMO_ENTRY_ID, path: OLMO_ENTRY_PATH, status: 'retired', feeds: {} }],
  };

  assert.deepEqual(findSlugCollisions(root, slugRegistry(), corpus), []);
});

test('a source with no `mints` mapping is never scanned for collisions', (t) => {
  const root = makeRoot([]);
  t.after(() => cleanup(root));
  writeJson(paths.latest(root, 'plain'), { source: 'plain', url: 'http://fixture.invalid/plain', date: '2026-08-29', body_hash: 'x', row_count: 1, rows: { [OLMO_ROW_ID]: OLMO_ROW } });
  const registry = { sources: [jsonSource('plain', 'http://fixture.invalid/plain')] }; // no `mints`
  const corpus = { entries: [{ id: OLMO_ENTRY_ID, path: OLMO_ENTRY_PATH, status: 'retired', feeds: {} }] };

  assert.deepEqual(findSlugCollisions(root, registry, corpus), []);
});
