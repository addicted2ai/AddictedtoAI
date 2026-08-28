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
