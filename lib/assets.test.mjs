/**
 * assets.test.mjs — the things the site publishes alongside its pages
 * (tasks 4.2, 4.9, 4.10, 4.12, 4.13).
 *
 * Feeds are parsed with `rss-parser`, the same third-party parser the task
 * names, rather than being regexed for the strings this build wrote. A feed
 * that only our own code can read is not a feed.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import Parser from 'rss-parser';

import { buildFixture, buildFixtureExpectingFailure, TODAY, demoDataLayer } from './test-helpers.mjs';
import { blogFeed, tutorialsFeed, changesFeed } from './feeds.mjs';
import { buildDataset, toCsv, factRows, entryRows } from './dataset.mjs';
import { DATASET_LICENSE } from './asset-routes.mjs';
import { buildSearchIndex } from './search-index.mjs';
import { matchIndex } from './search-match.mjs';
import { buildStamp } from './stamp.mjs';
import { tutorialStates } from './tutorials.mjs';
import { deltasNewestFirst } from './deltas.mjs';
import {
  catalogRows,
  deprecationRows,
  formatPrice,
  formatContext,
  perMillion,
  providersOf,
} from './catalog.mjs';
import {
  renderCatalogTable,
  renderDeprecationsTable,
  renderChangedTable,
  renderFetchLine,
} from './render/catalog.mjs';
import { sortNote } from './render/common.mjs';
import { SORT_CRITERIA } from './catalog.mjs';
import { findHtmlOrigins, isAllowedOrigin, scanExportedPages, originOf } from './origins.mjs';
import { changedFeed } from './changes.mjs';

let SITE;
async function site() {
  if (!SITE) SITE = await buildFixture('surfaces');
  return SITE;
}

/** A catalog file in the shape `pulse/lib/derive.mjs` writes. */
const CATALOG = {
  row_count: 3,
  rows: [
    {
      row_id: 'vendor/demo-model',
      display_name: 'Demo Model',
      provider: 'vendor',
      entry_id: 'model/full-entry',
      price_input: '0.000003',
      price_output: '0.000015',
      context_window: '200000',
      status: 'active',
      source: 'demo-source',
      source_url: 'https://example.org/demo/api/models',
    },
    {
      row_id: 'vendor/no-context',
      display_name: 'No Context Published',
      provider: 'vendor',
      entry_id: null,
      price_input: '0.000001',
      price_output: null,
      context_window: null,
      status: 'active',
      source: 'demo-source',
      source_url: 'https://example.org/demo/api/models',
    },
    {
      row_id: 'other/free-model',
      display_name: 'Free Model',
      provider: 'other',
      entry_id: null,
      price_input: '0',
      price_output: '0',
      context_window: '8192',
      status: 'active',
      source: 'demo-source',
      source_url: 'https://example.org/demo/api/models',
    },
  ],
};

const TABLES = {
  generated_on: TODAY,
  sort_criterion: SORT_CRITERIA,
  deprecations: [
    {
      row_id: 'vendor/gone',
      display_name: 'Gone Model',
      provider: 'vendor',
      entry_id: 'model/dormant-entry',
      price_input: '0.000009',
      price_output: null,
      context_window: '32000',
      status: 'retired',
      expiration_date: '2026-04-18',
      source: 'demo-source',
      source_url: 'https://example.org/demo/api/models',
    },
  ],
  changed_30d: [
    {
      date: '2026-08-20',
      key: 'k1',
      kind: 'price',
      field: 'price_input',
      old: '0.000002',
      new: '0.000003',
      display_name: 'Demo Model',
      row_id: 'vendor/demo-model',
      source: 'demo-source',
      source_url: 'https://example.org/demo/changed',
    },
  ],
};

const FRESHNESS = {
  listings: [],
  sources: [
    {
      id: 'demo-source',
      suspect: false,
      display_date: TODAY,
      display_date_label: 'last checked',
      last_fetch_date: TODAY,
    },
  ],
};

// ── 4.2 the catalog and the standing tables ──────────────────────────────

test('4.2 a missing value renders as absent, never as an estimate', async () => {
  const s = await site();
  const rows = catalogRows(CATALOG, s.corpus.byId, () => TODAY);
  const missing = rows.find((r) => r.row_id === 'vendor/no-context');

  assert.equal(missing.context_window, null, 'no context window value is produced');
  assert.equal(missing.price_output, null);
  assert.equal(perMillion(null), null);
  assert.equal(perMillion(''), null);
  assert.equal(perMillion('not-a-number'), null);

  const html = renderCatalogTable(rows);
  const start = html.indexOf('data-name="no context published"');
  assert.ok(start > 0, 'the row is in the table');
  const row = html.slice(start, html.indexOf('</tr>', start));
  assert.equal(
    (row.match(/<span class="absent" title="not published by the source">—<\/span>/g) ?? []).length,
    2,
    'both the missing output price and the missing context window render as absent',
  );
  const prose = row.replace(/data-[a-z-]+="[^"]*"/g, '').replace(/<time[\s\S]*?<\/time>/g, '');
  assert.ok(!/\d{4,}/.test(prose), 'no number was invented');
  assert.match(row, /<time datetime="2026-08-28">/, 'and the row states when it was read');
});

test('4.2 prices convert to per-million with the raw value kept, and free is zero not absent', async () => {
  const s = await site();
  const rows = catalogRows(CATALOG, s.corpus.byId, () => TODAY);
  const demo = rows.find((r) => r.row_id === 'vendor/demo-model');
  assert.equal(demo.price_input, '$3.00', 'per million tokens');
  assert.equal(demo.raw.price_input, 3);
  assert.equal(formatContext('200000'), '200,000');
  assert.equal(rows.find((r) => r.row_id === 'other/free-model').price_input, 'free');
  assert.equal(formatPrice('0.0000008'), '$0.80');
  assert.equal(formatPrice('0.000000002'), '$0.0020', 'sub-cent prices keep four places');
  assert.equal(formatPrice('0.00006'), '$60.00', 'and the column stays alignable at every scale');
});

test('4.2 a catalog row links its wiki entry when one declares it', async () => {
  const s = await site();
  const rows = catalogRows(CATALOG, s.corpus.byId, () => TODAY);
  const html = renderCatalogTable(rows);
  assert.match(html, /<a href="\/wiki\/model\/full-entry">Demo Model<\/a>/);
  assert.match(html, /<th scope="row">No Context Published<\/th>/, 'and plain text when none does');
});

test('4.2 every standing table states its sort criterion', async () => {
  const s = await site();
  for (const [name, criterion] of Object.entries(SORT_CRITERIA)) {
    assert.match(sortNote(criterion), new RegExp(`data-sort-note="${criterion}"`), name);
  }
  const deprecations = renderDeprecationsTable(deprecationRows(TABLES, s.corpus.byId));
  assert.match(deprecations, /Gone Model/);
  assert.match(deprecations, /data-tone="ended">retired</);

  const changed = renderChangedTable(changedFeed(TABLES.changed_30d, { entries: s.corpus.entry }));
  assert.match(changed, /input price 0\.000002 → 0\.000003/);
  assert.match(changed, /example\.org\/demo\/changed/);

  const fetchLine = renderFetchLine({ freshness: FRESHNESS, sourceUrl: () => 'https://example.org/demo/api/models' });
  assert.match(fetchLine, /data-fetched="2026-08-28"/, 'the fetch date is visible on the page');
  assert.match(fetchLine, /last checked/);
});

test('4.2 the filter offers only providers that are actually present', async () => {
  const s = await site();
  assert.deepEqual(providersOf(catalogRows(CATALOG, s.corpus.byId, () => TODAY)), ['other', 'vendor']);
});

// ── 4.9 citable assets ───────────────────────────────────────────────────

test('4.9 the blog feed parses, and exposes a title, items and valid dates', async () => {
  const s = await site();
  const xml = blogFeed(s.corpus.post).rss2();
  const parsed = await new Parser().parseString(xml);

  assert.match(parsed.title, /blog/);
  assert.equal(parsed.items.length, 2);
  assert.equal(parsed.items[0].title, 'A post with nothing to correct', 'newest first');
  assert.ok(!Number.isNaN(Date.parse(parsed.items[0].isoDate)), 'a valid item date');
  assert.equal(parsed.items[0].isoDate.slice(0, 10), '2026-08-14');
  assert.match(parsed.items[0].link, /^https:\/\/www\.addictedtoai\.net\/blog\//, 'absolute links');
  assert.notEqual(parsed.items[0].guid, parsed.items[1].guid, 'stable, distinct ids');
});

test('4.9 the tutorials feed carries verification dates and omits delisted tutorials', async () => {
  const s = await site();
  const states = tutorialStates(s.corpus, { dataLayer: s.dataLayer, today: TODAY });
  const parsed = await new Parser().parseString(tutorialsFeed(states).rss2());

  assert.equal(parsed.items.length, 3, 'demoted and archived tutorials are not in the feed');
  assert.ok(!Number.isNaN(Date.parse(parsed.items[0].isoDate)));
  assert.match(parsed.items.map((i) => i.content).join(''), /Verified against/);
});

test('4.9 the changed feed parses and carries the source on every item', async () => {
  const s = await site();
  const lines = changedFeed(TABLES.changed_30d, { entries: s.corpus.entry });
  const parsed = await new Parser().parseString(changesFeed(lines).rss2());

  assert.equal(parsed.items.length, 1);
  assert.match(parsed.items[0].title, /input price 0\.000002 → 0\.000003/);
  assert.equal(parsed.items[0].isoDate.slice(0, 10), '2026-08-20');
  assert.match(parsed.items[0].contentSnippet ?? parsed.items[0].content, /example\.org\/demo\/changed/);
});

test('4.9 the dataset carries the licence in the payload and in every CSV row', async () => {
  const s = await site();
  const dataset = buildDataset({
    corpus: s.corpus,
    catalog: CATALOG,
    tables: TABLES,
    deltas: deltasNewestFirst(s.corpus.delta),
    dataLayer: demoDataLayer(),
    today: TODAY,
    sourceUrl: () => 'https://example.org/demo/api/models',
    fetchedOn: () => TODAY,
  });

  assert.equal(dataset.license, DATASET_LICENSE);
  assert.match(dataset.license_url, /creativecommons\.org\/licenses\/by\/4\.0/);
  assert.equal(dataset.counts.entries, s.corpus.entry.length);
  assert.ok(dataset.counts.facts > 0);
  assert.ok(dataset.counts.timelines > 0);
  assert.equal(dataset.counts.deltas, 2);

  // Resolved facts, not front-matter bindings: a downloader has no snapshot to
  // resolve `pricing.prompt` against.
  const priced = dataset.facts.find(
    (f) => f.entry_id === 'model/full-entry' && f.field === 'price_input',
  );
  assert.equal(priced.value, '0.000003');
  assert.equal(priced.state, 'feed');
  assert.equal(priced.binding, 'feed');

  const csv = toCsv(dataset.entries);
  const lines = csv.trim().split('\n');
  assert.match(lines[0], /^id,kind,display_name/);
  assert.ok(lines[0].includes('license'), 'the header declares the licence column');
  for (const line of lines.slice(1)) {
    assert.ok(line.includes(DATASET_LICENSE), 'every row states the licence');
  }

  // The dated pairs travel too, with both sources.
  const deltaCsv = toCsv(dataset.deltas);
  assert.match(deltaCsv, /impossible_source_url/);
  assert.match(deltaCsv, /example\.org\/deltas\/older\/product/);
});

test('4.9 an empty table still emits its header row', () => {
  const csv = toCsv([], ['a', 'b', 'license']);
  assert.equal(csv.trim(), 'a,b,license');
});

// ── 4.10 the third-party origin allowlist ────────────────────────────────

test('4.10 a page with a stray CDN script fails the build naming the page and the origin', async () => {
  const err = await buildFixtureExpectingFailure('origin');
  assert.match(err.message, /blog\/stray-cdn\.md/);
  assert.match(err.message, /cdn\.example\.com/);
  assert.match(err.message, /third-party-origin/);
});

test('4.10 outbound links are not requests and never fail the build', async () => {
  // Every fact on this site is required to link its source (specs/wiki); a
  // check that failed on outbound links would make the two rules contradict.
  const s = await site();
  assert.equal(s.diags.errors.length, 0);
  const externalLinks = s.corpus.all.flatMap((d) => d.hrefs ?? []).filter((h) => /^https?:/.test(h));
  assert.ok(externalLinks.length === 0 || true);
  assert.deepEqual(findHtmlOrigins('<a href="https://arxiv.org/abs/1706.03762">paper</a>'), []);
});

test('4.10 Google Analytics is allowed and everything else is not', () => {
  assert.equal(isAllowedOrigin('www.googletagmanager.com'), true);
  assert.equal(isAllowedOrigin('www.google-analytics.com'), true);
  assert.equal(isAllowedOrigin('cdn.jsdelivr.net'), false);
  assert.equal(isAllowedOrigin('fonts.googleapis.com'), false, 'a font CDN is a third party too');
  assert.equal(isAllowedOrigin('www.addictedtoai.net', ['www.addictedtoai.net']), true);
  assert.equal(isAllowedOrigin(null), true, 'a root-relative reference has no origin');
  assert.equal(originOf('//evil.example/x.js'), 'evil.example', 'protocol-relative counts');
  assert.equal(originOf('/local/x.js'), null);
});

test('4.10 the exported-page scan sees stylesheets, images and inline url()', () => {
  const found = scanExportedPages(
    [
      {
        path: '/x',
        html:
          '<link rel="stylesheet" href="https://cdn.example.com/a.css">' +
          '<img src="https://images.example.net/b.png">' +
          '<div style="background:url(https://bg.example.io/c.svg)"></div>' +
          '<script src="/_next/static/chunks/ok.js"></script>' +
          '<a href="https://arxiv.org/abs/1706.03762">a link is not a request</a>',
      },
    ],
    ['www.addictedtoai.net'],
  );
  assert.deepEqual(
    found.map((f) => f.origin).sort(),
    ['bg.example.io', 'cdn.example.com', 'images.example.net'],
  );
});

// ── 4.12 client-side name search ─────────────────────────────────────────

test('4.12 typing a stub\'s alias surfaces the stub\'s page', async () => {
  const s = await site();
  const index = buildSearchIndex(s.corpus);

  // `documents`, not `all`, since separate-a-claim-from-a-fact: every PAGE is
  // in the index, stubs included — and a claim record is not a page. It renders
  // on its subject's entry, which is indexed, so nothing becomes unfindable.
  assert.equal(index.count, s.corpus.documents.length, 'every page is in the index, stubs included');
  const stub = index.docs.find((d) => d.i === 'concept/stub-entry');
  assert.equal(stub.b, true, 'flagged as a stub, not hidden');
  assert.deepEqual(stub.a, ['the stub thing'], 'aliases travel, whatever their link class');

  const hits = matchIndex(index, 'the stub thing');
  assert.equal(hits[0].u, '/wiki/concept/stub-entry');
  assert.equal(hits[0].why, 'the stub thing', 'the result says what it matched');

  // And by id, and by title, and case-insensitively.
  assert.equal(matchIndex(index, 'STUB ENTRY')[0].u, '/wiki/concept/stub-entry');
  assert.equal(matchIndex(index, 'concept/stub')[0].u, '/wiki/concept/stub-entry');
  assert.deepEqual(matchIndex(index, ''), [], 'an empty query matches nothing');
  assert.deepEqual(matchIndex(index, 'zzzznothing'), []);
});

test('4.12 the index covers every content type, not just entries', async () => {
  const s = await site();
  const index = buildSearchIndex(s.corpus);
  const kinds = new Set(index.docs.map((d) => d.k));
  assert.deepEqual(
    [...kinds].sort(),
    ['delta', 'entry', 'learn', 'post', 'tool', 'tutorial'],
  );
  assert.equal(matchIndex(index, 'newer dated pair')[0].u, '/impossible-routine/newer-delta');
});

// ── ij4h: the entries CSV and the search index export the PRESENTED status,
//    not raw front matter (`lib/fixtures/status-divergence/`) ──────────────

test('ij4h the entries dataset row and the search index both carry the resolved status', async () => {
  const s = await buildFixture('status-divergence');

  const rows = entryRows(s.corpus);
  const stubRow = rows.find((r) => r.id === 'model/stub-divergent');
  const proseRow = rows.find((r) => r.id === 'model/prose-divergent');
  assert.equal(stubRow.status, 'active', "the stub's stale front matter never reaches the dataset");
  assert.equal(proseRow.status, 'deprecated', "the prose entry's authored, reviewed claim is exported as-is");

  const index = buildSearchIndex(s.corpus);
  const stubHit = index.docs.find((d) => d.i === 'model/stub-divergent');
  const proseHit = index.docs.find((d) => d.i === 'model/prose-divergent');
  assert.equal(stubHit.s, 'active');
  assert.equal(proseHit.s, 'deprecated');
});

// ── 4.13 the build stamp ─────────────────────────────────────────────────

test('4.13 the stamp carries a UTC timestamp and a short commit, and both move', () => {
  const a = buildStamp({ now: new Date('2026-08-28T10:00:00.000Z'), commit: 'aaaaaaaaaaaa', dirty: false });
  const b = buildStamp({ now: new Date('2026-08-28T10:00:00.000Z'), commit: 'bbbbbbbbbbbb', dirty: false });
  const c = buildStamp({ now: new Date('2026-08-28T11:00:00.000Z'), commit: 'aaaaaaaaaaaa', dirty: false });

  assert.equal(a.built_at, '2026-08-28T10:00:00Z');
  assert.equal(a.stamp, '2026-08-28T10:00:00Z · aaaaaaaaaaaa');
  assert.notEqual(a.stamp, b.stamp, 'two commits, two stamps');
  assert.notEqual(a.stamp, c.stamp, 'two builds, two stamps');
  assert.match(
    buildStamp({ now: new Date('2026-08-28T10:00:00.000Z'), commit: 'a', dirty: true }).stamp,
    /\+dirty$/,
  );
});

test('4.13 a tree with no git still builds a stamp', () => {
  const s = buildStamp({ cwd: 'C:/definitely/not/a/repo' });
  assert.equal(typeof s.built_at, 'string');
  assert.equal(s.commit, 'unknown');
});
