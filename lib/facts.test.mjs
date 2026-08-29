/**
 * facts.test.mjs — task 2.3.
 *
 * Fixture entries for each case, rendered by the real rendering function
 * against a pinned clock and an injected data layer. The invariant that
 * matters most is the last test: there is no fact state in which a value
 * renders without its source.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { buildFixture, demoDataLayer, TODAY } from './test-helpers.mjs';
import { renderFact, resolveFact, isOverdue, dormantAsOf } from './facts.mjs';
import { makeDataLayer } from './data-layer.mjs';

let site;
const factOf = (id, field) => {
  const doc = site.corpus.entry.find((d) => d.data.id === id);
  return doc.factsHtml.find((f) => f.field === field);
};

test('load the facts fixture corpus', async () => {
  site = await buildFixture('facts');
  assert.equal(site.corpus.entry.length, 4);
});

test('2.3 a cited fact renders value, source link and accessed date', () => {
  const f = factOf('model/cited-fresh', 'license');
  assert.equal(f.state, 'cited');
  assert.match(f.html, /<span class="fact-value">Apache-2\.0<\/span>/);
  assert.match(f.html, /href="https:\/\/example\.org\/cited-fresh\/license"/);
  assert.match(f.html, /accessed 2026-08-25/);
  assert.ok(!f.html.includes('fact-overdue'), 'in-date fact carries no overdue marker');
});

test('2.3 a cited fact past its volatility interval carries a build-injected overdue marker', () => {
  const f = factOf('model/cited-overdue', 'price_input');
  assert.match(f.html, /<span class="fact-overdue" role="note">overdue — last verified 2026-07-14<\/span>/);
});

test('2.3 the overdue interval is per volatility class, not per fact', () => {
  const slow = factOf('model/cited-overdue', 'license'); // 45 days, slow = 120
  assert.ok(!slow.html.includes('fact-overdue'));

  const base = { source: 'cited', field: 'x', value: 'v', source_url: 'https://e.org', };
  assert.equal(isOverdue({ ...base, volatility: 'fast', accessed: '2026-08-13' }, TODAY), true);
  assert.equal(isOverdue({ ...base, volatility: 'fast', accessed: '2026-08-14' }, TODAY), false);
  // `static` and `dated` are never re-checked, so they can never be overdue.
  assert.equal(isOverdue({ ...base, volatility: 'dated', accessed: '2001-01-01' }, TODAY), false);
  assert.equal(isOverdue({ ...base, volatility: 'static', accessed: '2001-01-01' }, TODAY), false);
});

test('2.3 a feed fact renders the data-layer value with its source and fetch date', () => {
  const f = factOf('model/feed-model', 'price_input');
  assert.equal(f.state, 'feed');
  assert.match(f.html, /<span class="fact-value">0\.000015<\/span>/);
  assert.match(f.html, /href="https:\/\/example\.org\/demo\/api\/models"/);
  assert.match(f.html, /demo-source<\/a>, fetched 2026-08-28/);
});

test('2.3 a feed field the row does not carry renders as absent, never guessed', () => {
  const f = factOf('model/feed-model', 'output_modalities');
  assert.equal(f.state, 'absent');
  assert.match(f.html, /<span class="fact-absent">not published<\/span>/);
  assert.ok(!/fact-value/.test(f.html));
});

test('2.3 a vanished declared row renders its last-known value with a visible as-of date', () => {
  const f = factOf('model/vanished-model', 'price_input');
  assert.equal(f.state, 'vanished');
  assert.match(f.html, /data-state="vanished"/);
  assert.match(f.html, /<span class="fact-value">0\.000009<\/span>/);
  assert.match(f.html, /last known value, as of 2026-08-01/);
  assert.match(f.html, /the source no longer lists this row/);
});

test('2.3 a suspect source displays "last changed", not a recent "fetched" date', () => {
  const layer = makeDataLayer({
    sources: { sources: [{ id: 'demo-source', url: 'https://example.org/demo/api/models' }] },
    freshness: {
      sources: [
        {
          id: 'demo-source',
          suspect: true,
          display_date: '2026-06-01',
          display_date_label: 'last changed',
          last_fetch_date: '2026-08-28',
        },
      ],
    },
    feedRows: { 'demo-source': { r: { v: '1', $vanished: false, $as_of: '2026-08-28' } } },
  });
  const fact = { field: 'v', source: 'feed', feed: 'demo-source', path: 'v', volatility: 'fast' };
  const html = renderFact(fact, { dataLayer: layer, feeds: { 'demo-source': 'r' }, today: TODAY });
  assert.match(html, /last changed 2026-06-01/);
  assert.match(html, /source may be stale/);
  assert.ok(!html.includes('fetched 2026-08-28'));
});

test('2.3 before the first Pulse run a feed fact says so; it does not invent a value', () => {
  const layer = makeDataLayer({});
  const fact = { field: 'v', source: 'feed', feed: 'demo-source', path: 'v', volatility: 'fast' };
  const r = resolveFact(fact, { dataLayer: layer, feeds: { 'demo-source': 'r' }, today: TODAY });
  assert.equal(r.state, 'no-data');
  const html = renderFact(fact, { dataLayer: layer, feeds: { 'demo-source': 'r' }, today: TODAY });
  assert.match(html, /not yet fetched/);
});

test('2.3 no fact state ever renders a value without a source', () => {
  for (const doc of site.corpus.entry) {
    for (const f of doc.factsHtml) {
      const hasValue = f.html.includes('fact-value');
      const hasSource = f.html.includes('fact-source');
      assert.ok(hasSource, `${doc.data.id}#${f.field} (${f.state}) renders a source`);
      if (hasValue) assert.ok(hasSource, `${doc.data.id}#${f.field} value carries its source`);
    }
  }
});

test('2.3 rendered values are HTML-escaped and only http(s) hrefs survive', () => {
  const fact = {
    field: 'x',
    source: 'cited',
    value: '<script>alert(1)</script>',
    source_url: 'javascript:alert(1)',
    accessed: TODAY,
    volatility: 'static',
  };
  const html = renderFact(fact, { dataLayer: demoDataLayer(), feeds: {}, today: TODAY });
  assert.ok(!html.includes('<script>'));
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /href="#"/);
});

test('2.3 the dormant stamp date is derived from the record, not authored', () => {
  const doc = site.corpus.entry.find((d) => d.data.id === 'model/cited-overdue');
  assert.equal(doc.data.maintenance, 'dormant');
  assert.equal(dormantAsOf(doc.data), '2026-07-14');
});

// ── 2.3 units ────────────────────────────────────────────────────────────
//
// A verbatim value with no unit was a number no reader could interpret:
// `/wiki/model/aion-labs-aion-2-0` rendered `price input 0.0000008` while
// `/catalog` rendered the same underlying value as `$0.80 IN/MTOK`. The unit
// renders; the value is still untouched. See lib/units.mjs.

const priced = (path) => ({
  field: 'price_input',
  source: 'feed',
  feed: 'openrouter-models',
  path,
  volatility: 'fast',
});

const orLayer = (row) =>
  makeDataLayer({
    sources: { sources: [{ id: 'openrouter-models', url: 'https://openrouter.ai/api/v1/models' }] },
    freshness: { sources: [{ id: 'openrouter-models', display_date: TODAY, display_date_label: 'last checked' }] },
    feedRows: { 'openrouter-models': { 'aion-labs/aion-2.0': row } },
  });

const renderOr = (fact, row) =>
  renderFact(fact, {
    dataLayer: orLayer(row),
    feeds: { 'openrouter-models': 'aion-labs/aion-2.0' },
    today: TODAY,
  });

test('2.3 a feed value renders with its declared unit, and the value itself is untouched', () => {
  const html = renderOr(priced('pricing.prompt'), { pricing: { prompt: '0.0000008' } });

  // The exact defect: the number, alone, with nothing saying what it measures.
  assert.match(
    html,
    /<span class="fact-quantity"><span class="fact-value">0\.0000008<\/span><span class="fact-unit">USD per token<\/span><\/span>/,
    'the unit sits beside the value, in its own element',
  );
  // The rule that did not change: verbatim means verbatim.
  assert.ok(!html.includes('$'), 'no currency mark is attached to the number');
  assert.ok(!html.includes('0.80'), 'and the number is not rescaled');
  assert.match(html, /fact-source/, 'the source is still reachable');
});

test('2.3 a unit is declared data — never inferred from the field name', () => {
  // Same field name, an undeclared path: no unit, and byte-identical markup to
  // what this fact rendered before units existed.
  const html = renderOr(priced('pricing.web_search'), { pricing: { web_search: '0.004' } });
  assert.ok(!html.includes('fact-unit'), 'no unit for a path units.mjs does not declare');
  assert.ok(!html.includes('fact-quantity'), 'and no wrapper either');
  assert.match(html, /<span class="fact-value">0\.004<\/span><span class="fact-source"/);

  // A benchmark index has no unit, and inventing one would be a claim.
  const idx = renderOr(
    { ...priced('benchmarks.artificial_analysis.intelligence_index'), field: 'intelligence_index' },
    { benchmarks: { artificial_analysis: { intelligence_index: 41 } } },
  );
  assert.ok(!idx.includes('fact-unit'), 'a named index is not a quantity with a unit');
});

test('2.3 an absent value gets no unit — there is no quantity to measure', () => {
  const html = renderOr(priced('pricing.prompt'), { pricing: {} });
  assert.match(html, /fact-absent/);
  assert.ok(!html.includes('fact-unit'), 'a unit on "not published" would be furniture, not meaning');
});

test('2.3 the unit an entry states and the unit the catalog states describe the same number', async () => {
  // The finding underneath finding 3: a visitor follows a catalog row into a
  // stub and must be able to tell it is the same value. This fails the day
  // either surface changes its unit without the other.
  const { formatPrice, perMillion } = await import('./catalog.mjs');
  const { FEED_UNITS } = await import('./units.mjs');

  const raw = '0.0000008';
  assert.equal(FEED_UNITS['openrouter-models|pricing.prompt'], 'USD per token');
  assert.equal(formatPrice(raw), '$0.80', 'the catalog renders it per million tokens');
  // USD per token x 1e6 = USD per million tokens. If the entry's declared unit
  // ever stops being per-token, this arithmetic stops describing the catalog.
  // (Compared as the same computation, not against a decimal literal: the
  // product is 0.7999999999999999 in binary floating point, which is why the
  // catalog formats rather than compares.)
  assert.equal(perMillion(raw), Number(raw) * 1e6, 'one number, two stated units');
});

// ── corroborates changes nothing about rendering (specs/wiki, C26) ────────

test('2.3 declaring `corroborates` changes not one byte of how a fact renders', () => {
  // The declaration is a join for the Pulse's comparison, and nothing else. It
  // must not mark either side authoritative, annotate either page, or change
  // when either is re-checked — declaring that two sources disagree is not
  // adjudicating between them, and a feed-bound fact stays what its source
  // says, verbatim.
  const layer = demoDataLayer();
  const ctx = { dataLayer: layer, feeds: { 'demo-source': 'r' }, today: TODAY, entryId: 'model/x' };

  const feed = { field: 'parameters', source: 'feed', feed: 'demo-source', path: 'pricing.prompt', volatility: 'slow' };
  const cited = {
    field: 'card_parameters',
    source: 'cited',
    value: '304B params',
    source_url: 'https://example.org/card',
    accessed: '2026-08-25',
    volatility: 'static',
  };

  for (const fact of [feed, cited]) {
    const without = renderFact(fact, ctx);
    const with_ = renderFact({ ...fact, corroborates: 'other_field' }, ctx);
    assert.equal(with_, without, `${fact.source} fact renders identically`);

    const rWithout = resolveFact(fact, ctx);
    const rWith = resolveFact({ ...fact, corroborates: 'other_field' }, ctx);
    assert.deepEqual(rWith, rWithout, `${fact.source} fact resolves identically`);
  }

  // Nor does it change the re-check schedule: overdue is a function of
  // volatility and the accessed date, and of nothing else.
  assert.equal(
    isOverdue({ ...cited, volatility: 'fast', accessed: '2026-08-13', corroborates: 'p' }, TODAY),
    isOverdue({ ...cited, volatility: 'fast', accessed: '2026-08-13' }, TODAY),
  );
});
