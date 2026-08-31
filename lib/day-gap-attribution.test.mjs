/**
 * day-gap-attribution.test.mjs — the entity-pair day-gap gate
 * (beads addictedtoai-9sy).
 *
 * Weighted the same two ways `price-attribution.test.mjs` and
 * `snapshot-census.test.mjs` are, for the same reason: a checker with no
 * passing control is theatre, and one with no real-defect control is an
 * untested regex.
 *
 *   REPRODUCTION  the historical defect sentence, quoted verbatim from
 *                  `content/blog/same-catalog-same-day.md` as it stood at
 *                  commit `76d0cfa` (before the 2026-08-29 recheck fixed it),
 *                  and the fenced-code opening-shape sentence from the same
 *                  post that this check does NOT catch, named as such in the
 *                  module header.
 *   CATCHING       the defect sentence, and the class of masking/gap bugs
 *                  this module's own header records having found while
 *                  building it (a digit inside a model id's own URL breaking
 *                  a digit-excluding gap).
 *   PASSING        the corrected sentence (687, not 501), ordinary prose
 *                  mentioning the same two ids with no day-gap claim, a
 *                  reversed-order pair, code fences/indented code, and a
 *                  wiki entry (out of scope by type).
 *
 * The historical sentences are quoted rather than read from git, matching
 * the two sibling suites' own stated reason: a test that shells out to git
 * fails in a worktree or shallow clone, and these strings are evidence of
 * what the corpus actually said, not an arbitrary fixture.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { buildFixture, buildFixtureExpectingFailure } from './test-helpers.mjs';
import { makeDataLayer } from './data-layer.mjs';
import {
  CATALOG_ID_SRC,
  DAY_GAP_RE,
  daysBetween,
  maskForDayGap,
  scanDayGapClaims,
  findDayGapClaims,
  checkDayGapAttribution,
} from './day-gap-attribution.mjs';

// The real feed rows behind the historical defect, exactly as recorded in
// `data/reviews/seed-same-catalog-same-day.md`'s "Recheck 2026-08-29" section:
// `openai/gpt-4` created 1685232000 (2023-05-28T00:00:00Z), `openai/gpt-4.1-nano`
// created 1744651369 (2025-04-14T17:22:49Z).
const GPT4_CREATED = 1685232000;
const NANO_CREATED = 1744651369;

function catalogDataLayer(rows) {
  return makeDataLayer({
    sources: { sources: [{ id: 'openrouter-models', url: 'https://openrouter.ai/api/v1/models' }] },
    freshness: {
      sources: [{ id: 'openrouter-models', suspect: false, display_date: '2026-08-29', display_date_label: 'fetched' }],
    },
    feedRows: { 'openrouter-models': rows },
  });
}

const REAL_ROWS = {
  'openai/gpt-4': { id: 'openai/gpt-4', created: GPT4_CREATED },
  'openai/gpt-4.1-nano': { id: 'openai/gpt-4.1-nano', created: NANO_CREATED },
};
const realLookup = (id) => REAL_ROWS[id] ?? null;

// ---------------------------------------------------------------------------
// REPRODUCTION — the failure mode, confirmed BEFORE this module existed
// (see the beads issue and the session report: a fixture built from this
// exact sentence passed `buildSite` with 0 errors and 0 warnings prior to
// this check being wired into build-content.mjs).
// ---------------------------------------------------------------------------

// Quoted verbatim from `content/blog/same-catalog-same-day.md` at 76d0cfa.
const DEFECT_SENTENCE = [
  'Stay inside one vendor and the shape survives.',
  '[`openai/gpt-4`](https://openrouter.ai/openai/gpt-4) and',
  '[`openai/gpt-4.1-nano`](https://openrouter.ai/openai/gpt-4.1-nano), 501 days',
  'apart, same catalog, same day: `8,191` against `1,047,576` tokens of context —',
  '127.9x — at `30.000` against `0.100` per million input tokens, which is 300x.',
].join('\n');

// The corrected form, quoted verbatim from the same file at 9b229be.
const FIXED_SENTENCE = DEFECT_SENTENCE.replace('501 days', '687 days');

// The OTHER day-gap claim in the same historical post — deliberately out of
// scope. The ids appear in a FENCED code block as plain text (no backticks
// around them individually), and the claim sentence names no id at all,
// referring back to the block several lines above. Catching this needs
// cross-paragraph antecedent tracking; the module header names this as the
// documented blind spot, matching snapshot-census.mjs's own such note.
const OUT_OF_SCOPE_OPENING = [
  '```text',
  'listed 2023-05-28   openai/gpt-4                          8,191 ctx    30.000 in / 60.000 out per Mtok',
  'listed 2026-08-01   ~deepseek/deepseek-v4-flash-latest 1,310,720 ctx     0.030 in /  0.100 out per Mtok',
  '```',
  '',
  '1,161 days apart. 160.0x the context window, one one-thousandth the input',
  'price, one six-hundredth the output price. Both rows were on sale at those',
  'prices in the same second.',
].join('\n');

test('9sy reproduces: the historical defect sentence is invisible to both sibling checks', async () => {
  // price-attribution.mjs and snapshot-census.mjs are the two existing
  // "prose claim, mechanically checked" gates in this codebase. Confirmed
  // directly, not assumed: run the actual defect sentence through both and
  // show neither has anything to say about a wrong day-gap number — this is
  // the reproduction of the gap this module fills, run BEFORE trusting that
  // the new module is the right shape of fix.
  const { findPriceAttribution } = await import('./price-attribution.mjs');
  const { findSnapshotCensus } = await import('./snapshot-census.mjs');
  assert.deepEqual(findPriceAttribution(DEFECT_SENTENCE, 1), []);
  assert.deepEqual(findSnapshotCensus(DEFECT_SENTENCE, 1, '2026-08-28'), []);
});

// ---------------------------------------------------------------------------
// CATCHING
// ---------------------------------------------------------------------------

test('9sy catches the real defect sentence and recomputes the true gap', () => {
  const hits = findDayGapClaims(DEFECT_SENTENCE, 1, realLookup);
  assert.equal(hits.length, 1);
  assert.equal(hits[0].id1, 'openai/gpt-4');
  assert.equal(hits[0].id2, 'openai/gpt-4.1-nano');
  assert.equal(hits[0].claimedDays, 501);
  assert.equal(hits[0].actualDays, 687, 'the recheck\'s own confirmed value');
  assert.equal(hits[0].status, 'mismatched');
});

test('9sy the build FAILS on the defect, naming file, line and both figures', async () => {
  // The fixture directory also contains the clean/warn-only bodies — that is
  // fine, and is what the "flags exactly the one bad body" test below checks
  // separately. This test only needs the build to fail and say why.
  const err = await buildFixtureExpectingFailure('day-gap-attribution', {
    dataLayer: catalogDataLayer(REAL_ROWS),
  });
  assert.match(err.message, /day-gap-attribution/);
  assert.match(err.message, /wrong-gap\.md/);
  assert.match(err.message, /501 days/);
  assert.match(err.message, /687 calendar/);
});

test('9sy a digit inside a model id\'s own URL does not break the gap match', () => {
  // The real bug this suite caught while building the check: a first draft
  // excluded digits from the gap between the second id and the claimed
  // number, and "gpt-4.1-nano" appears inside its OWN markdown link
  // destination between its closing backtick and "501" — a `[^`\d]` gap
  // could not cross that "4" and "1" and the pattern never matched at all.
  const hits = findDayGapClaims(DEFECT_SENTENCE, 1, realLookup);
  assert.equal(hits.length, 1, 'a digit inside the id\'s own URL must not block the match');
});

test('9sy catches a plain (non-linked) inline-code pair too', () => {
  const s = 'Compare `openai/gpt-4` and `openai/gpt-4.1-nano`, 501 days apart.';
  const hits = findDayGapClaims(s, 1, realLookup);
  assert.equal(hits.length, 1);
  assert.equal(hits[0].actualDays, 687);
});

test('9sy the mismatch fires regardless of which id is named first', () => {
  const s = 'Compare `openai/gpt-4.1-nano` and `openai/gpt-4`, 501 days apart.';
  const hits = findDayGapClaims(s, 1, realLookup);
  assert.equal(hits.length, 1);
  assert.equal(hits[0].actualDays, 687, 'the recompute is order-independent');
});

test('9sy ids with a tilde prefix and a colon suffix are recognised shapes', () => {
  const rows = {
    'openai/gpt-4': REAL_ROWS['openai/gpt-4'],
    '~deepseek/deepseek-v4-flash-latest': { created: GPT4_CREATED + 10 * 86400 },
    'vendor/model:free': { created: GPT4_CREATED + 10 * 86400 },
  };
  const lookup = (id) => rows[id] ?? null;
  const a = findDayGapClaims('`openai/gpt-4` and `~deepseek/deepseek-v4-flash-latest`, 9 days apart.', 1, lookup);
  assert.equal(a.length, 1, 'tilde-prefixed id recognised');
  assert.equal(a[0].actualDays, 10);
  const b = findDayGapClaims('`openai/gpt-4` and `vendor/model:free`, 9 days apart.', 1, lookup);
  assert.equal(b.length, 1, 'colon-suffixed id recognised');
});

// ---------------------------------------------------------------------------
// PASSING — the controls
// ---------------------------------------------------------------------------

test('9sy the corrected sentence (687, not 501) is clean', () => {
  assert.deepEqual(findDayGapClaims(FIXED_SENTENCE, 1, realLookup), []);
  const { scanned } = scanDayGapClaims(FIXED_SENTENCE, 1, realLookup);
  assert.equal(scanned, 1, 'the claim was examined, not skipped');
});

test('9sy the out-of-scope opening shape is not caught, and the module says so', () => {
  const { scanned, hits } = scanDayGapClaims(OUT_OF_SCOPE_OPENING, 1, realLookup);
  assert.equal(scanned, 0);
  assert.deepEqual(hits, []);
});

test('9sy ordinary prose naming both ids with no day-gap claim is untouched', () => {
  const s = '`openai/gpt-4` and `openai/gpt-4.1-nano` sit at opposite ends of the catalog.';
  assert.deepEqual(findDayGapClaims(s, 1, realLookup), []);
});

test('9sy fenced and indented code are not scanned', () => {
  const fenced = [
    '```text',
    'Compare `openai/gpt-4` and `openai/gpt-4.1-nano`, 501 days apart.',
    '```',
  ].join('\n');
  assert.deepEqual(findDayGapClaims(fenced, 1, realLookup), []);

  const indented = '    Compare `openai/gpt-4` and `openai/gpt-4.1-nano`, 501 days apart.';
  assert.deepEqual(findDayGapClaims(indented, 1, realLookup), []);
});

test('9sy a claim with only one catalog id is not a pair claim', () => {
  const s = '`openai/gpt-4` has been listed for 501 days.';
  assert.deepEqual(findDayGapClaims(s, 1, realLookup), []);
});

test('9sy masks are matched against the original, not cascaded', () => {
  // The exact bug both sibling modules' headers record: a line that OPENS
  // with an inline code span must not blank the rest of the line.
  const s = '`openai/gpt-4` is old; `openai/gpt-4.1-nano` is new, 687 days apart.';
  const hits = findDayGapClaims(s, 1, realLookup);
  assert.deepEqual(hits, [], 'a correct claim opening with a code span must stay clean');
});

// ---------------------------------------------------------------------------
// UNVERIFIABLE — the third outcome
// ---------------------------------------------------------------------------

test('9sy a row no entry feeds from is unverifiable, not silently passed or failed', () => {
  const lookup = (id) => (id === 'openai/gpt-4' ? REAL_ROWS['openai/gpt-4'] : null);
  const hits = findDayGapClaims('`openai/gpt-4` and `vendor/never-fed`, 42 days apart.', 1, lookup);
  assert.equal(hits.length, 1);
  assert.equal(hits[0].status, 'unverifiable');
  assert.equal(hits[0].missingId, 'vendor/never-fed');
});

test('9sy checkDayGapAttribution warns (not errors) on unverifiable, errors on mismatched', () => {
  const diags = { errors: [], warnings: [], error(d) { this.errors.push(d); }, warn(d) { this.warnings.push(d); } };
  const mismatchDoc = { type: 'post', hasBody: true, body: DEFECT_SENTENCE, bodyStartLine: 1, file: 'x.md' };
  checkDayGapAttribution(mismatchDoc, diags, realLookup);
  assert.equal(diags.errors.length, 1);
  assert.equal(diags.errors[0].rule, 'day-gap-attribution');
  assert.equal(diags.warnings.length, 0);

  const diags2 = { errors: [], warnings: [], error(d) { this.errors.push(d); }, warn(d) { this.warnings.push(d); } };
  const unverifiableLookup = (id) => (id === 'openai/gpt-4' ? REAL_ROWS['openai/gpt-4'] : null);
  const unverifiableDoc = {
    type: 'post',
    hasBody: true,
    body: '`openai/gpt-4` and `vendor/never-fed`, 42 days apart.',
    bodyStartLine: 1,
    file: 'y.md',
  };
  checkDayGapAttribution(unverifiableDoc, diags2, unverifiableLookup);
  assert.equal(diags2.errors.length, 0, 'unverifiable must not fail the build');
  assert.equal(diags2.warnings.length, 1);
  assert.equal(diags2.warnings[0].rule, 'day-gap-unverifiable');
});

// ---------------------------------------------------------------------------
// SCOPE — doc.type === 'post' only
// ---------------------------------------------------------------------------

test('9sy checkDayGapAttribution reports scanned:0 for a non-post type, not silently skipped', () => {
  const diags = { errors: [], warnings: [], error(d) { this.errors.push(d); }, warn(d) { this.warnings.push(d); } };
  const entryDoc = { type: 'entry', hasBody: true, body: DEFECT_SENTENCE, bodyStartLine: 1, file: 'x.md' };
  const result = checkDayGapAttribution(entryDoc, diags, realLookup);
  assert.deepEqual(result, { scanned: 0, errors: 0, unverifiable: 0, keys: [] });
  assert.equal(diags.errors.length, 0, 'a wiki entry is out of scope for this check, deliberately');
});

// ---------------------------------------------------------------------------
// daysBetween — the calendar convention, validated against the corpus's own
// three OTHER day counts from the same post, not just the one that was wrong
// ---------------------------------------------------------------------------

function epochOf(y, m, d) {
  return Date.UTC(y, m - 1, d) / 1000;
}

test('9sy daysBetween matches the recheck\'s confirmed 687, not the raw-timestamp 687.72->688', () => {
  assert.equal(daysBetween(GPT4_CREATED, NANO_CREATED), 687);
});

test('9sy daysBetween reproduces the post\'s other three day counts (the calendar convention holds generally)', () => {
  // "1,161 days apart" — 2023-05-28 -> 2026-08-01
  assert.equal(daysBetween(epochOf(2023, 5, 28), epochOf(2026, 8, 1)), 1161);
  // "Six steps, 1,038 days" — 2023-05-28 -> 2026-03-31
  assert.equal(daysBetween(epochOf(2023, 5, 28), epochOf(2026, 3, 31)), 1038);
  // "on the list for 770 days" — 2024-07-19 -> 2026-08-28
  assert.equal(daysBetween(epochOf(2024, 7, 19), epochOf(2026, 8, 28)), 770);
});

test('9sy daysBetween is symmetric (order of the two entities does not matter)', () => {
  assert.equal(daysBetween(GPT4_CREATED, NANO_CREATED), daysBetween(NANO_CREATED, GPT4_CREATED));
});

// ---------------------------------------------------------------------------
// The fixture corpus — the full build, all four bodies together
// ---------------------------------------------------------------------------

test('9sy the fixture corpus flags exactly the one bad body and warns on exactly one unverifiable', async () => {
  const rows = {
    ...REAL_ROWS,
  };
  const dataLayer = catalogDataLayer(rows);
  let thrown;
  try {
    await buildFixture('day-gap-attribution', { dataLayer });
  } catch (e) {
    thrown = e;
  }
  assert.ok(thrown, 'wrong-gap.md must fail the build');
  assert.match(thrown.message, /wrong-gap\.md/);
  // correct-gap.md, untracked-row.md and no-claim.md must not be named as a
  // BUILD ERROR — untracked-row.md's day-gap claim is unverifiable, which is
  // a warning (checked in the next test), never a build failure.
  assert.doesNotMatch(thrown.message, /correct-gap\.md/);
  assert.doesNotMatch(thrown.message, /untracked-row\.md/);
  assert.doesNotMatch(thrown.message, /no-claim\.md/);
});

test('9sy with the offending body excluded, the rest of the fixture builds clean but warns once', async () => {
  const dataLayer = catalogDataLayer(REAL_ROWS);
  // Build just the three non-defect fixtures via a filtered content root is
  // not straightforward with buildFixture's directory-based API, so instead
  // assert directly against the per-document check, mirroring what the full
  // corpus build already showed structurally in the previous test.
  const diags = { errors: [], warnings: [], error(d) { this.errors.push(d); }, warn(d) { this.warnings.push(d); } };
  const correct = {
    type: 'post',
    hasBody: true,
    body: FIXED_SENTENCE,
    bodyStartLine: 1,
    file: 'blog/correct-gap.md',
  };
  const untracked = {
    type: 'post',
    hasBody: true,
    body: 'Compare `openai/gpt-4` against `vendor/never-fed`, 42 days apart, same catalog.',
    bodyStartLine: 1,
    file: 'blog/untracked-row.md',
  };
  const noClaim = {
    type: 'post',
    hasBody: true,
    body: '`openai/gpt-4` and `openai/gpt-4.1-nano` sit at opposite ends of the catalog.',
    bodyStartLine: 1,
    file: 'blog/no-claim.md',
  };
  const lookup = (id) => dataLayer.row('openrouter-models', id);
  checkDayGapAttribution(correct, diags, lookup);
  checkDayGapAttribution(untracked, diags, lookup);
  checkDayGapAttribution(noClaim, diags, lookup);
  assert.equal(diags.errors.length, 0);
  assert.equal(diags.warnings.length, 1);
  assert.equal(diags.warnings[0].rule, 'day-gap-unverifiable');
  assert.match(diags.warnings[0].file, /untracked-row\.md/);
});

test('9sy checkDayGapAttribution reports exact scanned/errors/unverifiable counts', () => {
  // A check that runs on nothing prints the same clean result as one that
  // runs on everything — price-attribution.mjs's and snapshot-census.mjs's
  // own suites both assert an EXACT count for the same reason. One document,
  // two claims: one mismatched, one unverifiable.
  const diags = { errors: [], warnings: [], error(d) { this.errors.push(d); }, warn(d) { this.warnings.push(d); } };
  const body = [
    'First: `openai/gpt-4` and `openai/gpt-4.1-nano`, 501 days apart.',
    '',
    'Second: `openai/gpt-4` and `vendor/never-fed`, 42 days apart.',
  ].join('\n');
  const lookup = (id) => (id === 'vendor/never-fed' ? null : realLookup(id));
  const doc = { type: 'post', hasBody: true, body, bodyStartLine: 1, file: 'z.md' };
  const result = checkDayGapAttribution(doc, diags, lookup);
  assert.equal(result.scanned, 2);
  assert.equal(result.errors, 1);
  assert.equal(result.unverifiable, 1);
  assert.equal(result.keys.length, 2);
});

// ---------------------------------------------------------------------------
// Regex / mask internals
// ---------------------------------------------------------------------------

test('9sy CATALOG_ID_SRC matches every real id shape used above', () => {
  const re = new RegExp(`^${CATALOG_ID_SRC}$`);
  for (const id of [
    'openai/gpt-4',
    'openai/gpt-4.1-nano',
    '~deepseek/deepseek-v4-flash-latest',
    'meta-llama/llama-4-scout',
    'x-ai/grok-4.20',
    'moonshotai/kimi-k2.5',
    'vendor/model:free',
  ]) {
    assert.ok(re.test(id), `should match: ${id}`);
  }
});

test('9sy maskForDayGap blanks fenced/indented code and comments, preserving offsets', () => {
  const s = '```\ncode\n```\nafter';
  const masked = maskForDayGap(s);
  assert.equal(masked.length, s.length);
  assert.ok(!masked.includes('code'));
  assert.ok(masked.includes('after'));
});

test('9sy DAY_GAP_RE requires the SECOND id to be the very next code span', () => {
  // An unrelated code span between id1 and id2 breaks the FIRST id's match by
  // design (documented scope limit): `unrelated` carries no `/`, so it can
  // never itself satisfy CATALOG_ID_SRC as a fallback starting point either,
  // and no valid two-id-then-day-count match exists anywhere in the string.
  const s = 'Compare `openai/gpt-4`, see `unrelated`, and `openai/gpt-4.1-nano`, 501 days apart.';
  DAY_GAP_RE.lastIndex = 0;
  assert.equal(DAY_GAP_RE.test(s), false);
});
