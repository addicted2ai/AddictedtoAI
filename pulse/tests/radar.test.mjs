/**
 * radar.test.mjs — the scout's radar feeds (DESK-ORDER-001 §5, keeper ruling
 * K30; `specs/loop`'s standing sweep: "Radar feeds … are inputs to the sweep
 * and are never displayed raw").
 *
 * THE CLAIM UNDER TEST IS A NEGATIVE ONE, and a negative claim is exactly the
 * kind this repository refuses to accept from reasoning. "The Pulse does not
 * ingest a radar row" is not established by reading `run.mjs` and seeing no
 * call; it is established by putting a radar row in front of the real engine,
 * pointing it at a server that records every request, and measuring what the
 * run produced. That is what `nothing a radar row declares reaches the engine`
 * below does: one fetchable URL the engine never fetches, and one exhaustive
 * scan of the whole fixture tree afterwards.
 *
 * The exhaustive scan matters more than the individual assertions beside it.
 * Asserting "no catalog row", "no changed-feed line", "no queue item" one at a
 * time tests the outputs someone thought of; scanning every byte the run wrote
 * tests the ones they did not. `data/derived/sources.json` is the file that
 * makes this concrete — `derive.mjs` writes every `sources[]` row's id, title
 * and url into it BEFORE the `material_fields` check that skips catalog rows,
 * and `lib/site.mjs` serves that file to every page, so a radar row placed in
 * `sources` with no material fields would still have rendered. Which is why
 * radar rows are a separate array and not a flag.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadRegistry, radarFeeds, radarReadableUrls, sortedSources, findSource } from '../lib/registry.mjs';
import { cleanup, jsonSource, makeRoot, paths, readJson, readLines, runPulse, serve, writeJson } from './helpers.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** A well-formed radar row, the shape the four launch rows share. */
function radarRow(id, url, extra = {}) {
  return {
    id,
    title: `${id} (radar)`,
    reads_for: 'scout',
    purpose: 'an input to the scout, never displayed',
    url,
    format: 'json',
    yields: ['id', 'title'],
    robots: { url: `${url}/robots.txt`, checked_on: '2026-09-06', result: 'allowed', detail: 'Allow: /' },
    terms: { url: 'https://example.invalid/terms', read_on: '2026-09-06', result: 'permitted', quote: 'you may read it' },
    verified_on: '2026-09-06',
    ...extra,
  };
}

/** Write a fixture registry carrying both arrays. `makeRoot` writes only `sources`. */
function withRadar(root, radar) {
  const file = join(root, 'data', 'sources', 'registry.json');
  const registry = JSON.parse(readFileSync(file, 'utf8'));
  registry.radar = radar;
  writeJson(file, registry);
}

/** Every file under `dir`, recursively, as absolute paths. */
function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

// ---------------------------------------------------------------------------
// The proof: a radar row reaches nothing.
// ---------------------------------------------------------------------------

test('nothing a radar row declares reaches the engine: no fetch, no snapshot, no catalog row, no feed line, no queue item', async (t) => {
  const asked = [];
  const server = await serve((pathname) => {
    asked.push(pathname);
    if (pathname === '/models.json') {
      return {
        status: 200,
        body: JSON.stringify({
          data: [{ id: 'acme/one', name: 'Acme One', pricing: { prompt: '0.000001' }, context_length: 8192 }],
        }),
      };
    }
    // The radar URL. Serving a perfectly good payload is the point: if the
    // engine ever fetched it, it would succeed, and the failure would be a
    // rendered page rather than an error anyone noticed.
    if (pathname === '/radar.json') {
      return {
        status: 200,
        body: JSON.stringify({ data: [{ id: 'radar/leak', name: 'RADAR LEAK', context_length: 999999 }] }),
      };
    }
    return { status: 404, body: '' };
  });

  const root = makeRoot([jsonSource('catalog-source', `${server.url}/models.json`)]);
  withRadar(root, [radarRow('scout-radar', `${server.url}/radar.json`)]);

  t.after(async () => {
    await server.close();
    cleanup(root);
  });

  // Deliberately NOT `--no-mint`: minting is one of the four effects under
  // test, so the step that could produce it has to actually run.
  const run = await runPulse(root, ['--no-build']);
  assert.equal(run.status, 0, run.out);

  // The ordinary source really did ingest — otherwise every assertion below
  // would pass for the wrong reason.
  assert.ok(asked.includes('/models.json'), `the catalog source was never fetched: ${JSON.stringify(asked)}`);
  const latest = readJson(paths.latest(root, 'catalog-source'));
  assert.ok(latest?.rows?.['acme/one'], 'the catalog source wrote a snapshot');

  // 1. NEVER FETCHED. The engine had a working URL and did not ask for it.
  assert.deepEqual(
    asked.filter((p) => p === '/radar.json'),
    [],
    `the Pulse fetched a radar feed: ${JSON.stringify(asked)}`,
  );

  // 2. NO SNAPSHOT AND NO STATE — nothing under data/sources/<radar id>/.
  assert.equal(existsSync(join(root, 'data', 'sources', 'scout-radar')), false, 'a radar row wrote a snapshot directory');

  // 3. NO CATALOG ROW, and no catalog column carrying its values.
  const catalog = readJson(paths.catalog(root)) ?? { rows: [] };
  assert.equal(catalog.rows.filter((r) => r.source === 'scout-radar').length, 0, 'a radar row produced catalog rows');
  assert.equal(catalog.rows.filter((r) => r.row_id === 'radar/leak').length, 0, 'a radar payload reached the catalog');

  // 4. NOT ON THE RENDERED SOURCE LIST. This is the file `lib/site.mjs` serves.
  const sources = readJson(paths.sources(root)) ?? { sources: [] };
  assert.deepEqual(sources.sources.map((s) => s.id), ['catalog-source'], 'a radar row reached data/derived/sources.json');

  // 5. NO CHANGED-FEED LINE and 6. NO QUEUE ITEM.
  const lines = readLines(paths.changes(root));
  assert.equal(lines.filter((l) => l.source === 'scout-radar').length, 0, 'a radar row wrote a changed-feed line');
  const queue = readJson(paths.queue(root)) ?? { items: [] };
  assert.equal(
    (queue.items ?? []).filter((i) => JSON.stringify(i).includes('scout-radar')).length,
    0,
    'a radar row minted a queue item',
  );

  // 7. THE EXHAUSTIVE ONE. `scout-radar` and its payload may appear in exactly
  //    one file in the whole tree — the registry that declares them. Anywhere
  //    else is the leak, whatever the mechanism, including one nobody has
  //    thought of yet.
  const registryFile = join(root, 'data', 'sources', 'registry.json');
  for (const file of walk(root)) {
    const text = readFileSync(file, 'utf8');
    for (const needle of ['scout-radar', 'radar/leak', 'RADAR LEAK', '/radar.json']) {
      if (!text.includes(needle)) continue;
      assert.equal(
        file,
        registryFile,
        `"${needle}" reached ${relative(root, file)} — a radar feed is an input to the scout and must ` +
          `render, seed, mint and diff nothing`,
      );
    }
  }

  // 8. And nothing was minted under content/ at all.
  assert.deepEqual(walk(join(root, 'content')), [], 'a radar row minted content');
});

// ---------------------------------------------------------------------------
// The separation, and the guards that keep it.
// ---------------------------------------------------------------------------

test('radar rows are invisible to every path that iterates sources', () => {
  const registry = loadRegistry(ROOT);
  const radarIds = new Set(radarFeeds(registry).map((r) => r.id));
  assert.ok(radarIds.size > 0, 'the launch registry declares radar feeds');

  for (const id of radarIds) {
    assert.equal(findSource(registry, id), null, `findSource resolved the radar id "${id}"`);
  }
  for (const s of sortedSources(registry)) {
    assert.equal(radarIds.has(s.id), false, `sortedSources yielded the radar row "${s.id}"`);
  }
  // The engine's own inputs, unchanged by this addition.
  assert.deepEqual(sortedSources(registry).map((s) => s.id), ['llm-releases', 'openrouter-models']);
});

test('the registry guards refuse a radar row that is really a source', () => {
  const loadWith = (radar, sources = [jsonSource('s', 'https://s.invalid')]) => {
    const root = makeRoot(sources);
    withRadar(root, radar);
    try {
      loadRegistry(root);
      return null;
    } catch (err) {
      return err.message;
    } finally {
      cleanup(root);
    }
  };

  assert.equal(loadWith([radarRow('r', 'https://r.invalid')]), null, 'a well-formed radar row loads');

  // The id may not mean two things.
  assert.match(loadWith([radarRow('s', 'https://r.invalid')]), /also declared in "sources"/);
  assert.match(loadWith([radarRow('r', 'https://a.invalid'), radarRow('r', 'https://b.invalid')]), /duplicate radar id/);

  // Every field that would make the data layer carry it.
  const ingestOnly = {
    material_fields: [{ field: 'x', path: 'y' }],
    declined_fields: [],
    mints: { kind: 'model', slug_from: 'row_id' },
    seeds: { date_field: 'd' },
    rows_path: 'data',
    row_id_field: 'id',
    status_rule: { kind: 'expiration_date' },
    schedule_rule: { kind: 'utc_windows' },
    fetch_every_days: 1,
    expected_change_days: 3,
    emit_on_remove: true,
    rolling_window: true,
  };
  for (const [field, value] of Object.entries(ingestOnly)) {
    const message = loadWith([radarRow('r', 'https://r.invalid', { [field]: value })]);
    assert.ok(message, `a radar row carrying "${field}" must be refused`);
    assert.match(message, new RegExp(`carries "${field}"`), `and the error names ${field}`);
    assert.match(message, /never fetched, snapshotted, diffed or rendered/);
  }

  // §5: robots, terms and a last-verified date, each dated.
  const strip = (field) => {
    const row = radarRow('r', 'https://r.invalid');
    delete row[field];
    return loadWith([row]);
  };
  assert.match(strip('robots'), /missing "robots" with a "checked_on" date/);
  assert.match(strip('terms'), /missing "terms" with a "read_on" date/);
  assert.match(strip('verified_on'), /needs a "verified_on" date/);
  assert.match(
    loadWith([radarRow('r', 'https://r.invalid', { robots: { checked_on: 'yesterday', result: 'allowed' } })]),
    /missing "robots" with a "checked_on" date/,
    'an undated robots check is not a check',
  );
  assert.match(
    loadWith([radarRow('r', 'https://r.invalid', { terms: { url: 'x', read_on: '2026-09-06' } })]),
    /missing "terms" with a "read_on" date .* and a "result"/,
    'a terms entry with no result is not a finding',
  );
  assert.match(strip('url'), /missing "url"/);
  assert.match(loadWith([radarRow('r', 'https://r.invalid', { format: 'yaml' })]), /"format" must be one of/);
  assert.match(loadWith({ r: 'no' }), /"radar" must be an array/);
});

test('a feed the site forbids must say what forbade it, and is never handed to a caller', () => {
  const loadWith = (feeds) => {
    const root = makeRoot([]);
    withRadar(root, [radarRow('r', 'https://r.invalid', { feeds })]);
    try {
      return { registry: loadRegistry(root), message: null };
    } catch (err) {
      return { registry: null, message: err.message };
    } finally {
      cleanup(root);
    }
  };

  const ok = {
    url: 'https://ok.invalid/feed.xml',
    format: 'rss',
    registered: true,
    robots: { url: 'https://ok.invalid/robots.txt', checked_on: '2026-09-06', result: 'allowed' },
    terms: { url: 'https://ok.invalid/terms', read_on: '2026-09-06', result: 'permitted' },
    verified_on: '2026-09-06',
  };
  const refused = {
    ...ok,
    url: 'https://no.invalid/feed.atom',
    registered: false,
    not_registered_because: 'robots.txt disallows /*.atom$',
    robots: { url: 'https://no.invalid/robots.txt', checked_on: '2026-09-06', result: 'disallowed' },
  };

  const { registry, message } = loadWith([ok, refused]);
  assert.equal(message, null, 'a registered feed beside a refused one loads');
  // The refusal is DATA — present, dated and readable — and the URL is still
  // never returned. Recording a refusal and routing around it are opposites.
  assert.equal(registry.radar[0].feeds.length, 2);
  assert.deepEqual(radarReadableUrls(registry), ['https://r.invalid', 'https://ok.invalid/feed.xml']);

  assert.match(loadWith([{ ...refused, not_registered_because: '  ' }]).message, /an honest refusal names what forbade/);
  assert.match(loadWith([{ ...refused, not_registered_because: undefined }]).message, /an honest refusal names what forbade/);
  assert.match(loadWith([{ ...ok, registered: undefined }]).message, /needs a boolean "registered"/);
  assert.match(loadWith([{ ...ok, url: undefined }]).message, /a "feeds" entry is missing a string "url"/);
  assert.match(loadWith([ok, { ...ok }]).message, /declares https:\/\/ok\.invalid\/feed\.xml twice/);
  assert.match(loadWith([{ ...ok, verified_on: undefined }]).message, /needs a "verified_on" date/);
  assert.match(loadWith([{ ...ok, robots: undefined }]).message, /missing "robots"/);
  assert.match(loadWith([{ ...ok, terms: undefined }]).message, /missing "terms"/);
  assert.match(loadWith({ feed: ok }).message, /"feeds" must be an array/);
});

// ---------------------------------------------------------------------------
// The four launch rows themselves.
// ---------------------------------------------------------------------------

test('the launch registry declares the four radar feeds DESK-ORDER-001 §5 names', () => {
  const rows = radarFeeds(loadRegistry(ROOT));
  assert.deepEqual(
    rows.map((r) => r.id),
    ['arxiv-listings', 'covered-org-releases', 'github-tool-releases', 'hf-hub-models'],
  );
});

test('every radar row and every feed under it records robots, terms and a last-verified date', () => {
  // §5, verbatim: "Each row records robots/terms and a last-verified date as
  // the registry requires." Asserted on the checked-in data, not on a fixture.
  for (const row of radarFeeds(loadRegistry(ROOT))) {
    const check = (thing, where) => {
      assert.match(thing.robots.checked_on, DATE, `${where}: robots check date`);
      assert.ok(thing.robots.result, `${where}: robots result`);
      assert.ok(thing.robots.url, `${where}: which robots file was read`);
      assert.match(thing.terms.read_on, DATE, `${where}: terms read date`);
      assert.ok(thing.terms.result, `${where}: terms result`);
      assert.match(thing.verified_on, DATE, `${where}: last-verified date`);
    };
    check(row, row.id);
    assert.ok(row.purpose, `${row.id}: what the scout reads it for`);
    assert.equal(row.reads_for, 'scout', `${row.id}: who reads it`);
    for (const feed of row.feeds ?? []) check(feed, `${row.id} / ${feed.url}`);
  }
});

test('no URL a site forbids is ever handed to the scout', () => {
  // The three refusals this registry recorded on 2026-09-06, asserted as
  // absences from what the helper returns rather than as prose in a note:
  //   - export.arxiv.org/robots.txt is "User-agent: * / Disallow: /"
  //   - github.com/robots.txt disallows /*.atom$
  //   - NVIDIA's Terms of Service prohibit crawlers and their scope over
  //     blogs.nvidia.com could not be resolved
  const registry = loadRegistry(ROOT);
  const urls = radarReadableUrls(registry);
  assert.ok(urls.length > 0, 'the scout is given something to read');
  for (const url of urls) {
    assert.doesNotMatch(url, /export\.arxiv\.org/, 'export.arxiv.org disallows every path for every user-agent');
    assert.doesNotMatch(url, /\.atom(\?|$)/, 'github.com/robots.txt disallows /*.atom$');
    assert.doesNotMatch(url, /nvidia\.com/, "NVIDIA's terms forbid automated access and the scope question is open");
  }

  // And each of those refusals is present in the registry as a dated record,
  // because an omitted refusal reads as an unasked question.
  const refusals = radarFeeds(registry)
    .flatMap((r) => r.feeds ?? [])
    .filter((f) => f.registered === false);
  assert.ok(
    refusals.some((f) => f.url.includes('export.arxiv.org')),
    'the arXiv legacy API refusal is recorded, not merely absent',
  );
  assert.ok(refusals.some((f) => f.url.endsWith('.atom')), 'the GitHub .atom refusal is recorded');
  assert.ok(refusals.some((f) => f.url.includes('nvidia.com')), 'the NVIDIA refusal is recorded');
  for (const f of refusals) {
    assert.ok(f.not_registered_because.length > 40, `${f.url}: the refusal carries its reason`);
  }
});

test('radarFeeds is stably ordered and radarReadableUrls is deduplicated', () => {
  const registry = { radar: [radarRow('zeta', 'https://z.invalid'), radarRow('alpha', 'https://a.invalid')] };
  assert.deepEqual(radarFeeds(registry).map((r) => r.id), ['alpha', 'zeta']);
  assert.deepEqual(radarFeeds({}).length, 0, 'a registry with no radar array yields no rows');
  assert.deepEqual(radarReadableUrls({}), [], 'and no urls');

  // A row whose own url is repeated as a registered feed is one url, not two.
  const dup = {
    radar: [
      radarRow('r', 'https://r.invalid', {
        feeds: [
          {
            url: 'https://r.invalid',
            format: 'json',
            registered: true,
            robots: { checked_on: '2026-09-06', result: 'allowed' },
            terms: { read_on: '2026-09-06', result: 'permitted' },
            verified_on: '2026-09-06',
          },
        ],
      }),
    ],
  };
  assert.deepEqual(radarReadableUrls(dup), ['https://r.invalid']);
});

test('a refused feed that repeats its row url is refused, not handed out through the row', () => {
  // THE SHAPE A REAL REFUSAL WILL BE WRITTEN IN. Three of the four launch rows
  // declare their row `url` a second time as a `feeds` entry, so the edit this
  // repository's rights discipline prescribes when a publisher's terms turn —
  // flip that feed to `registered: false` with a reason — must actually stop
  // the read. Before this test, it did not: the row url was pushed whenever the
  // ROW was not itself refused, so the refused URL still reached the caller.
  const feed = (url, registered, extra = {}) => ({
    url,
    format: 'rss',
    registered,
    robots: { url: 'https://r.invalid/robots.txt', checked_on: '2026-09-06', result: 'allowed' },
    terms: { url: 'https://r.invalid/terms', read_on: '2026-09-06', result: 'permitted' },
    verified_on: '2026-09-06',
    ...extra,
  });
  const refusal = { not_registered_because: "the publisher's terms turned on 2026-09-06 and forbid automated reads" };

  const registry = {
    radar: [
      radarRow('r', 'https://r.invalid/feed.xml', {
        feeds: [feed('https://r.invalid/feed.xml', false, refusal), feed('https://r.invalid/other.xml', true)],
      }),
    ],
  };
  assert.deepEqual(
    radarReadableUrls(registry),
    ['https://r.invalid/other.xml'],
    'a URL refused as a feed must not be handed back through the row that repeats it',
  );

  // And the registry refuses to load the contradiction at all, so it cannot sit
  // in the file looking settled while one half of it is honoured.
  const root = makeRoot([]);
  withRadar(root, registry.radar);
  try {
    assert.throws(() => loadRegistry(root), /is declared as a "registered": false feed/);
  } finally {
    cleanup(root);
  }
});

// ---------------------------------------------------------------------------
// A refusal is a fact about a URL, not about the row that records it.
//
// The check above is scoped to ONE row, and that scoping was the hole: the
// refused set was rebuilt per row, so row B never consulted row A's refusals.
// The three tests below are the cross-row case — the leak, the refusal to load
// the contradiction, and the positive control that the widened rule does not
// start eating URLs nobody refused.
// ---------------------------------------------------------------------------

/** A well-formed feed entry; `registered` is the only thing under test. */
function radarFeed(url, registered, extra = {}) {
  return {
    url,
    format: 'rss',
    registered,
    robots: { url: 'https://example.invalid/robots.txt', checked_on: '2026-09-06', result: 'allowed' },
    terms: { url: 'https://example.invalid/terms', read_on: '2026-09-06', result: 'permitted' },
    verified_on: '2026-09-06',
    ...extra,
  };
}

const WHY = { not_registered_because: 'the Terms of Service prohibit crawlers and the scope question is unresolved' };

test('a URL refused in one row is refused in every row: the scout never gets it through a second listing', () => {
  // THE LEAK. `refused` used to be built from the row being emitted, so the
  // NVIDIA feed — refused in `covered-org-releases` with a dated ToS quote —
  // came straight back out of the helper the moment any other row listed it.
  // The refusal is a fact about that URL; the row that happens to record it is
  // bookkeeping. Both routes back in are tested: a second row listing the URL
  // as a registered FEED, and a second row whose own `url` IS the refused one.
  const forbidden = 'https://blogs.nvidia.invalid/feed/';

  const viaFeed = {
    radar: [
      radarRow('row-a', 'https://a.invalid/feed.xml', {
        feeds: [radarFeed('https://a.invalid/feed.xml', true), radarFeed(forbidden, false, WHY)],
      }),
      radarRow('row-b', 'https://b.invalid/feed.xml', {
        feeds: [radarFeed('https://b.invalid/feed.xml', true), radarFeed(forbidden, true)],
      }),
    ],
  };
  assert.deepEqual(
    radarReadableUrls(viaFeed),
    ['https://a.invalid/feed.xml', 'https://b.invalid/feed.xml'],
    'a URL refused in row-a must not be handed back because row-b registers it',
  );

  // The other door: row-b's own url is the URL row-a refused, and row-b
  // declares no feeds at all, so nothing local to row-b knows about the
  // refusal. Only a set built across the whole array closes this one.
  const viaRowUrl = {
    radar: [
      radarRow('row-a', 'https://a.invalid/feed.xml', {
        feeds: [radarFeed('https://a.invalid/feed.xml', true), radarFeed(forbidden, false, WHY)],
      }),
      radarRow('row-b', forbidden),
    ],
  };
  assert.deepEqual(
    radarReadableUrls(viaRowUrl),
    ['https://a.invalid/feed.xml'],
    "a refused URL must not be handed back as some other row's own url",
  );

  // And a row refused WHOLESALE refuses its url for everybody, not just itself.
  const rowLevel = {
    radar: [
      radarRow('row-a', forbidden, { registered: false, ...WHY }),
      radarRow('row-b', 'https://b.invalid/feed.xml', { feeds: [radarFeed(forbidden, true)] }),
    ],
  };
  assert.deepEqual(radarReadableUrls(rowLevel), ['https://b.invalid/feed.xml']);
});

test('the registry refuses to load a URL that is registered in one row and refused in another, naming both rows', () => {
  // A filter alone would be the wrong fix: it would leave the file saying two
  // contradictory things and quietly honour one of them, which is the failure
  // mode this repository names everywhere — a decision written where it reads
  // as settled and does nothing. The loader refuses, and it names BOTH rows
  // because either may be the wrong one: the refusal may be stale, or the
  // offer may have been pasted from a row that never did the reading.
  const forbidden = 'https://blogs.nvidia.invalid/feed/';
  const radar = [
    radarRow('covered-org-releases', 'https://a.invalid/feed.xml', {
      feeds: [radarFeed('https://a.invalid/feed.xml', true), radarFeed(forbidden, false, WHY)],
    }),
    radarRow('vendor-blogs', 'https://b.invalid/feed.xml', {
      feeds: [radarFeed('https://b.invalid/feed.xml', true), radarFeed(forbidden, true)],
    }),
  ];

  const root = makeRoot([]);
  withRadar(root, radar);
  try {
    assert.throws(
      () => loadRegistry(root),
      (err) => {
        assert.match(err.message, /covered-org-releases/, 'the error names the row that refused the URL');
        assert.match(err.message, /vendor-blogs/, 'the error names the row that offered it');
        assert.ok(err.message.includes(forbidden), 'the error names the URL in dispute');
        assert.match(err.message, /prohibit crawlers/, 'and carries the recorded reason for the refusal');
        return true;
      },
    );
  } finally {
    cleanup(root);
  }

  // The same contradiction written the other way round — refused as a whole row
  // in one place, offered as a feed in another — is the same refusal.
  const crossed = [
    radarRow('nvidia-blog', forbidden, { registered: false, ...WHY }),
    radarRow('vendor-blogs', 'https://b.invalid/feed.xml', { feeds: [radarFeed(forbidden, true)] }),
  ];
  const root2 = makeRoot([]);
  withRadar(root2, crossed);
  try {
    assert.throws(() => loadRegistry(root2), /nvidia-blog[\s\S]*vendor-blogs|vendor-blogs[\s\S]*nvidia-blog/);
  } finally {
    cleanup(root2);
  }
});

test('POSITIVE CONTROL: a URL nobody refused is returned once, even when two rows list it', () => {
  // The widened rule must not start eating URLs. Two rows legitimately reading
  // the same feed is an ordinary shape — arXiv's cs.AI listing is plausibly an
  // input to more than one sweep — and it is one readable URL, returned once,
  // with the registry loading without complaint.
  const shared = 'https://rss.arxiv.invalid/rss/cs.AI';
  const radar = [
    radarRow('arxiv-listings', shared, { feeds: [radarFeed(shared, true)] }),
    radarRow('paper-sweep', 'https://p.invalid/feed.xml', {
      feeds: [radarFeed('https://p.invalid/feed.xml', true), radarFeed(shared, true)],
    }),
  ];

  assert.deepEqual(
    radarReadableUrls({ radar }),
    [shared, 'https://p.invalid/feed.xml'],
    'the shared URL appears exactly once and the row-specific one survives',
  );

  const root = makeRoot([]);
  withRadar(root, radar);
  try {
    const registry = loadRegistry(root);
    assert.deepEqual(radarReadableUrls(registry), [shared, 'https://p.invalid/feed.xml']);
  } finally {
    cleanup(root);
  }
});
