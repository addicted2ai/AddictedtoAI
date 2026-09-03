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
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

import { buildFixture, demoDataLayer, TODAY } from './test-helpers.mjs';
import {
  renderFact,
  resolveFact,
  isOverdue,
  dormantAsOf,
  todayIso,
  daysBetween,
  currentStatusOf,
} from './facts.mjs';
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

test('2.3 a per-token price renders per MILLION tokens, with the scale named beside it', () => {
  // CHANGED 2026-09-03 on the maintainer's reading of a live page: "it is
  // still displaying the price per single token ... no human wants to know
  // that a token costs $0.000001!" The unit was right and the scale was
  // unusable. What this test asserted before — no currency mark, no rescaling
  // — was the old decision, and the new assertions below are its exact
  // inverse, kept in the same shape so the reversal is legible.
  const html = renderOr(priced('pricing.prompt'), { pricing: { prompt: '0.0000008' } });

  assert.match(
    html,
    /<span class="fact-quantity"><span class="fact-value">\$0\.80<\/span><span class="fact-unit">per million tokens<\/span><\/span>/,
    'the scaled value and the scale that names it, in their own elements',
  );
  assert.ok(!html.includes('0.0000008'), 'the per-token figure no longer reaches the reader');
  assert.match(html, /fact-source/, 'the source is still reachable');
});

test('2.3 the entry, the catalog and the changed feed print the SAME string for the same price', async () => {
  // The reason to convert here rather than invent a third format: a reader
  // arrives at an entry FROM a catalog row or a feed line, and all three now
  // agree because all three call `formatPrice`.
  const { formatPrice } = await import('./catalog.mjs');
  const { describeChange } = await import('./changes.mjs');
  const raw = '0.0000008';

  const html = renderOr(priced('pricing.prompt'), { pricing: { prompt: raw } });
  assert.ok(html.includes(formatPrice(raw)), 'the entry prints what the catalog prints');

  const line = describeChange({
    kind: 'price',
    source: 'openrouter-models',
    field: 'price_input',
    old: '0.0000006',
    new: raw,
  });
  assert.ok(line.includes(formatPrice(raw)), `and what the changed feed prints: ${line}`);
});

test('2.3 a free row says "free" and takes no unit', () => {
  const html = renderOr(priced('pricing.prompt'), { pricing: { prompt: '0' } });
  assert.match(html, /<span class="fact-value">free<\/span>/);
  assert.ok(!html.includes('fact-unit'), '"free per million tokens" would be furniture that says something false');
});

test('2.3 THE CONTROL: a non-price feed value is not rescaled and keeps its own unit', () => {
  // The scaling is keyed on declared per-token PRICE paths, never on being a
  // number. A context window is the field most likely to be swept up by a
  // careless rule, and it must render exactly as it always has.
  const html = renderOr(
    { ...priced('context_length'), field: 'context_window' },
    { context_length: 300000 },
  );
  assert.match(
    html,
    /<span class="fact-quantity"><span class="fact-value">300000<\/span><span class="fact-unit">tokens<\/span><\/span>/,
  );
  assert.ok(!html.includes('$'), 'and no currency mark reaches a value that is not a price');
});

test('2.3 THE CONTROL: a price value that is not a number is left exactly as it arrived', () => {
  // Fail toward the raw value. Guessing a scale for something that is not a
  // quantity is the one thing this layer refuses, and the unit must keep
  // describing what is actually on the page.
  const html = renderOr(priced('pricing.prompt'), { pricing: { prompt: 'on request' } });
  assert.match(html, /<span class="fact-value">on request<\/span>/);
  assert.match(html, /<span class="fact-unit">USD per token<\/span>/, 'the unscaled value keeps the unscaled unit');
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
  assert.equal(
    FEED_UNITS['openrouter-models|pricing.prompt'],
    'USD per token',
    'the DECLARED unit still records what the source publishes — the scaling is a display step on top of it, not a rewrite of what was read',
  );
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

// ── 2.3 the build's "today" is a LOCAL date (addictedtoai-aw6) ────────────
//
// ## What broke, and why nothing above caught it
//
// `todayIso()` was `now.toISOString().slice(0, 10)` — UTC. CLAUDE.md and
// AGENTS.md state the opposite rule for the whole repository: *"Every date in
// this repository is the LOCAL date of the machine that wrote it."* This is the
// rendering-side twin of addictedtoai-4ih, which was the same mistake in
// `pulse/lib/core.mjs`; one convention per repository is the entire point, so
// the fix here is the same shape rather than a second invention.
//
// `todayIso()` is the build's whole notion of today. It reaches `isOverdue`
// (overdue facts), `listingState` (directory freshness), `tutorialState`
// (stale tutorials) and `buildSite`. MEASURED before the fix, on this machine
// at UTC-6: from 18:00 local onward it returned tomorrow, so
// `daysBetween(fact.accessed, todayIso())` returned 1 for a fact accessed
// today — ageing every fact, listing and tutorial in the corpus by a day and
// rendering anything sitting on its interval as stale a day early. That is
// visitor-visible text, not internal bookkeeping.
//
// ## Why nothing above caught it, and why this section spawns children
//
// Every test above pins the clock with `TODAY`, a bare string, and therefore
// never calls `todayIso()` at all — the same reason `pulse/tests` missed the
// Pulse's copy. And on a machine already running in UTC, local and UTC are the
// same string, so the broken implementation passes every assertion that can be
// written about it in-process. **A date test that does not force `TZ` cannot
// fail on a UTC box and proves nothing.** `TZ` is read by Node's ICU at
// startup, so these assertions run in child processes against the REAL
// exported functions.
//
// MEASURED against the unfixed code, these tests: 4 of 6 failed (`Etc/GMT+6`
// disagreed at 6 hours of 24, `Asia/Tokyo` at 9 — a UTC stamp writes
// *yesterday* east of Greenwich — `America/Chicago` at 5). After the fix: 6 of
// 6 pass, and no zone disagrees at any hour.

const FACTS = pathToFileURL(join(dirname(fileURLToPath(import.meta.url)), 'facts.mjs')).href;

const pad = (n) => String(n).padStart(2, '0');
/** The local calendar date of a Date, computed independently of `todayIso()`. */
const localDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/**
 * Run a probe against the REAL exported functions in a child pinned to `tz`.
 * The probe returns JSON; anything it throws fails the test.
 */
function inZone(tz, probeBody) {
  const src = `
    import { todayIso, daysBetween, isOverdue, renderFact } from ${JSON.stringify(FACTS)};
    const pad = (n) => String(n).padStart(2, '0');
    const localDate = (d) => \`\${d.getFullYear()}-\${pad(d.getMonth() + 1)}-\${pad(d.getDate())}\`;
    const out = await (async () => { ${probeBody} })();
    process.stdout.write(JSON.stringify(out));
  `;
  const raw = execFileSync(process.execPath, ['--input-type=module', '-e', src], {
    encoding: 'utf8',
    env: { ...process.env, TZ: tz },
  });
  return JSON.parse(raw);
}

// A fixed-offset zone with no DST, so the arithmetic below is stated once and
// does not depend on the month. UTC-6 is the maintainer's measured offset.
const WEST = 'Etc/GMT+6';
// East of Greenwich the failure is the mirror image: UTC lags local, so a UTC
// stamp writes YESTERDAY through the early morning.
const EAST = 'Asia/Tokyo';
// A real DST zone, for the day-counting assertions.
const DST = 'America/Chicago';
const ZONES = [WEST, EAST, DST];

test('2.3 todayIso() stamps the local date at every hour a build might run, west of Greenwich', () => {
  const rows = inZone(
    WEST,
    `
    const out = [];
    for (const h of [6, 12, 18, 23]) {
      const d = new Date(2026, 7, 29, h, 30, 0, 0);
      out.push({ hour: h, local: localDate(d), stamped: todayIso(d), utc: d.toISOString().slice(0, 10) });
    }
    return out;
  `,
  );

  for (const r of rows) {
    assert.equal(r.stamped, r.local, `a build at ${pad(r.hour)}:30 local must stamp ${r.local}, not ${r.stamped}`);
  }
  // The evening build is the one that was wrong, and this asserts the fixture
  // still exercises the failure: if UTC and local agreed at 18:30 the
  // assertions above would prove nothing.
  const evening = rows.find((r) => r.hour === 18);
  assert.notEqual(evening.utc, evening.local, '18:30 local must still straddle UTC midnight for this test to mean anything');
  assert.equal(evening.stamped, '2026-08-29');
  assert.equal(evening.utc, '2026-08-30', 'UTC is a day ahead here — which is exactly what todayIso() must not return');
});

test('2.3 no hour of the day stamps a different date than the one being lived, in either direction', () => {
  for (const tz of ZONES) {
    const disagreements = inZone(
      tz,
      `
      const out = [];
      for (let h = 0; h < 24; h++) {
        const d = new Date(2026, 7, 29, h, 30, 0, 0);
        if (todayIso(d) !== localDate(d)) out.push({ hour: h, stamped: todayIso(d), local: localDate(d) });
      }
      return out;
    `,
    );
    assert.deepEqual(disagreements, [], `${tz}: todayIso() disagreed with the local calendar`);
  }
});

test('2.3 a fact accessed today is zero days old all day, whatever the zone', () => {
  for (const tz of ZONES) {
    const wrong = inZone(
      tz,
      `
      const out = [];
      for (let h = 0; h < 24; h++) {
        const d = new Date(2026, 7, 29, h, 30, 0, 0);
        const age = daysBetween(localDate(d), todayIso(d));
        if (age !== 0) out.push({ hour: h, age });
      }
      return out;
    `,
    );
    // Before the fix this was 1 from 18:00 local onward at UTC-6 — every fact,
    // listing and tutorial in the corpus a day older than it is.
    assert.deepEqual(wrong, [], `${tz}: a fact accessed today did not read as 0 days old at every hour`);
  }
});

test('2.3 a fact sitting exactly on its interval does not render stale a day early', () => {
  // The visitor-visible consequence, asserted on the rendered markup rather
  // than on the age number. `fast` is 14 days and `isOverdue` is `age > 14`,
  // so a fact accessed 14 local days ago is in date — at 09:30 and at 23:30.
  for (const tz of ZONES) {
    const res = inZone(
      tz,
      `
      const fact = { field: 'price_input', source: 'cited', value: '1', source_url: 'https://e.org',
                     accessed: '2026-08-15', volatility: 'fast' };
      const out = [];
      for (const h of [9, 18, 20, 23]) {
        const d = new Date(2026, 7, 29, h, 30, 0, 0);
        const today = todayIso(d);
        out.push({
          hour: h,
          age: daysBetween(fact.accessed, today),
          overdue: isOverdue(fact, today),
          marked: renderFact(fact, { feeds: {}, today }).includes('fact-overdue'),
        });
      }
      return out;
    `,
    );
    for (const r of res) {
      assert.equal(r.age, 14, `${tz} at ${pad(r.hour)}:30 — 2026-08-15 is 14 local days before 2026-08-29`);
      assert.equal(r.overdue, false, `${tz} at ${pad(r.hour)}:30 — a 14-day-old fast fact is on its interval, not past it`);
      assert.equal(r.marked, false, `${tz} at ${pad(r.hour)}:30 — and the page must not show an overdue marker`);
    }
  }
});

test('2.3 daysBetween() is exact and zone-independent — the half of this that must NOT change', () => {
  // Both arguments are bare corpus dates parsed in the same frame, so the
  // frame cancels and the count is already a calendar-day difference. Going
  // through UTC midnight is integer calendar arithmetic here, not a claim that
  // the values are UTC — and it is what makes the count DST-proof, since a
  // local day containing a clock change is 23 or 25 hours long and dividing
  // elapsed local milliseconds by 86400000 would silently miscount it.
  // Making this "local" too would introduce an error rather than remove one.
  const spans = {
    plain: ['2026-08-20', '2026-08-29', 9],
    acrossSpringForward: ['2026-03-07', '2026-03-09', 2], // that local day is 23h
    acrossFallBack: ['2026-10-31', '2026-11-02', 2], //      that local day is 25h
    sameDay: ['2026-08-29', '2026-08-29', 0],
    yearSpan: ['2025-08-29', '2026-08-29', 365],
  };
  for (const [name, [from, to, want]] of Object.entries(spans)) {
    assert.equal(daysBetween(from, to), want, `${name}: ${from} to ${to}`);
  }

  for (const tz of ZONES) {
    const res = inZone(
      tz,
      `return ${JSON.stringify(Object.entries(spans).map(([, [f, t]]) => [f, t]))}
        .map(([f, t]) => daysBetween(f, t));`,
    );
    assert.deepEqual(res, Object.values(spans).map(([, , want]) => want), `${tz}: daysBetween shifted with the zone`);
  }
});

test('2.3 todayIso() and daysBetween() agree with each other, whatever this machine is set to', () => {
  // Zone-independent, and therefore the one assertion here that also runs
  // in-process against whatever clock the machine really has.
  const d = new Date();
  assert.match(todayIso(d), /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(todayIso(d), localDate(d));
  assert.equal(daysBetween(todayIso(d), todayIso(d)), 0, 'the day this build stamps is zero days old to this build');
});

// ── currentStatusOf (addictedtoai-ij4h) ─────────────────────────────────
//
// Moved here from `tutorials.mjs` — see this file's export for why — with
// its behaviour unchanged: a feed-bound `status` fact overrides front
// matter when it resolves; otherwise front matter stands. Whether that
// override is actually APPLIED to what a page shows is `build-content.mjs`'s
// call (`doc.currentStatus`), tested in `surfaces.test.mjs` against the
// `status-divergence` fixture; this file proves only the resolver itself.

test('currentStatusOf returns null for a null entry, never throwing', () => {
  assert.equal(currentStatusOf(null, {}), null);
});

test('currentStatusOf falls back to front matter when no status fact is declared', () => {
  const entry = { data: { status: 'active', facts: [] } };
  assert.equal(currentStatusOf(entry, {}), 'active');
});

test('currentStatusOf falls back to front matter when the bound feed has no data yet', () => {
  const layer = makeDataLayer({}); // no sources, no rows: the "before the first Pulse run" case
  const entry = {
    data: {
      status: 'deprecated',
      feeds: { 'demo-source': 'r' },
      facts: [{ field: 'status', source: 'feed', feed: 'demo-source', path: '$status', volatility: 'fast' }],
    },
  };
  assert.equal(currentStatusOf(entry, { dataLayer: layer, today: TODAY }), 'deprecated');
});

test('currentStatusOf prefers a resolved feed value over front matter', () => {
  const layer = makeDataLayer({
    feedRows: { 'demo-source': { r: { $status: 'active', $vanished: false, $as_of: TODAY } } },
  });
  const entry = {
    data: {
      status: 'deprecated',
      feeds: { 'demo-source': 'r' },
      facts: [{ field: 'status', source: 'feed', feed: 'demo-source', path: '$status', volatility: 'fast' }],
    },
  };
  assert.equal(currentStatusOf(entry, { dataLayer: layer, today: TODAY }), 'active');
});

test('currentStatusOf prefers a resolved CITED status fact over front matter too', () => {
  const entry = {
    data: {
      status: 'active',
      facts: [
        {
          field: 'status',
          source: 'cited',
          value: 'retired',
          source_url: 'https://example.org/retired',
          accessed: TODAY,
          volatility: 'dated',
        },
      ],
    },
  };
  assert.equal(currentStatusOf(entry, { today: TODAY }), 'retired');
});
