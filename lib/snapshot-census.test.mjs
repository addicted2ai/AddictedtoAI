/**
 * snapshot-census.test.mjs — the snapshot-anchored census gate
 * (beads addictedtoai-7q8).
 *
 * Weighted the same two ways price-attribution.test.mjs is, for the same
 * reason: a checker with no passing control is theatre, and one with no
 * real-defect control is an untested regex.
 *
 *   CATCHING   the sentences this corpus actually carried before the 7q8
 *              sweep repaired them, quoted verbatim from the files as they
 *              stood — z-ai.md, nvidia.md, cohere.md, alibaba-cloud.md and
 *              moonshotai-kimi-k2-5.md all had exactly this shape.
 *   PASSING    the repaired forms (same sentences, correct date/count), the
 *              corpus's own "as observed on DATE ... dated" hedge style
 *              (which this check does not even look at, because it carries
 *              no row-count pattern), a claim with no catalog/snapshot word
 *              nearby, fenced/inline code, and the two masking bugs
 *              price-attribution.mjs's own header names as hard-won.
 *
 * The historical sentences are quoted rather than read from git, for the
 * same reason price-attribution.test.mjs gives: a test that shells out to
 * git fails in a worktree or shallow clone, and these strings are evidence
 * of what the corpus actually said, not an arbitrary fixture. All quoted
 * apostrophes are straight (`'`), matching the corpus's own encoding —
 * verified byte-for-byte against nvidia.md before writing this suite.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { buildFixture } from './test-helpers.mjs';
import { buildSite } from './build-content.mjs';
import { makeDataLayer } from './data-layer.mjs';
import { ROOT } from './paths.mjs';
import { join } from 'node:path';
import {
  maskForCensus,
  findSnapshotCensus,
  checkSnapshotCensus,
  debtKeys,
} from './snapshot-census.mjs';

const errorsOf = (site) => site.diags.errors.filter((e) => e.rule === 'snapshot-census');
const warnsOf = (site, rule) => site.diags.warnings.filter((w) => w.rule === rule);

const FIX = 'lib/fixtures/snapshot-census';
const TODAY_SNAPSHOT = '2026-08-31';

// ---------------------------------------------------------------------------
// CATCHING — the defect, as this corpus really carried it (quoted verbatim)
// ---------------------------------------------------------------------------

test('7q8 catches the undated censuses this corpus actually had', () => {
  const preFix = [
    "Z.ai publishes weights for thirteen of its fifteen rows in the OpenRouter\ncatalog.",
    "Of\nthe 388 rows in that snapshot, eight carry a non-null expiration date and\nsix of them are Z.ai's; no other vendor carries more than one.",
    "One structural\ndetail separates Cohere from nearly every vendor in the catalog:\nninety-one of the 388 rows carry the router's `is_moderated` flag, spread\nacross eight provider prefixes",
  ];
  for (const text of preFix) {
    const hits = findSnapshotCensus(text, 1, TODAY_SNAPSHOT);
    assert.ok(hits.length > 0, `not caught: ${text.slice(0, 60)}...`);
    assert.ok(hits.every((h) => h.kind === 'undated'), `expected undated, got ${JSON.stringify(hits)}`);
  }
});

test('7q8 catches dated censuses whose date has drifted from the real snapshot', () => {
  const preFix = [
    // nvidia.md, before the sweep repaired "28 August 2026" to "31 August 2026"
    // and "MoonshotAI with seven" to the current tie at eight.
    "All ten of NVIDIA's rows in the OpenRouter\nsnapshot of 28 August 2026 carry a Hugging Face id, and no vendor with more\nrows than that publishes weights for all of them: the next fully-open\nlistings belong to `meta-llama` with eight rows and MoonshotAI with seven.",
    // alibaba-cloud.md, before 52/58 became 53/60.
    "Alibaba Cloud has 52 rows in the OpenRouter\nsnapshot of 28 August 2026, second only to OpenAI's 58.",
    // moonshotai-kimi-k2-5.md, the instance triaged by name in the issue.
    "Of the 388 rows in\nthe OpenRouter snapshot of 28 August 2026, eight carry a non-null\n`expiration_date`",
  ];
  for (const text of preFix) {
    const hits = findSnapshotCensus(text, 1, TODAY_SNAPSHOT);
    assert.ok(hits.length > 0, `not caught: ${text.slice(0, 60)}...`);
    assert.ok(
      hits.every((h) => h.kind === 'mismatched' && h.claimedDate === '2026-08-28'),
      `expected a 2026-08-28 mismatch, got ${JSON.stringify(hits)}`,
    );
  }
});

test('7q8 the build FAILS on an unanchored census, naming file and line', async () => {
  let err;
  try {
    await buildFixture('snapshot-census', { censusSnapshotDate: TODAY_SNAPSHOT });
  } catch (e) {
    err = e;
  }
  assert.ok(err, 'a guardrail that does not fire is not a guardrail');
  assert.match(err.message, /snapshot-census/);
  assert.match(err.message, /undated-census\.md/);
  assert.match(err.message, /mismatched-census\.md/);
});

test('7q8 the error names the claimed date and the real one, and offers both repairs', async () => {
  const err = await buildFixture('snapshot-census', { censusSnapshotDate: TODAY_SNAPSHOT }).catch(
    (e) => e,
  );
  assert.ok(err instanceof Error);
  assert.match(err.message, /2026-08-28/);
  assert.match(err.message, /2026-08-31/);
  // The hedge is offered by NAME and with the exact date to type, not as a
  // placeholder the author has to translate — and, since addictedtoai-jqif,
  // the check actually honours it. The advice also has to say what does NOT
  // work, because "as of the DATE snapshot" is the near miss nine wiki pages
  // reached for first.
  assert.match(err.message, /as observed on 28 August 2026/);
  assert.match(err.message, /as of the DATE snapshot.*is NOT the hedge/s);
});

// ---------------------------------------------------------------------------
// PASSING — the controls
// ---------------------------------------------------------------------------

test('7q8 the repaired forms from the real sweep pass untouched', () => {
  const postFix = [
    "All ten of NVIDIA's rows in the OpenRouter\nsnapshot of 31 August 2026 carry a Hugging Face id, and no vendor with more\nrows than that publishes weights for all of them: the next fully-open\nlistings belong to `meta-llama` and MoonshotAI, tied at eight rows each.",
    "Alibaba Cloud has 53 rows in the OpenRouter\nsnapshot of 31 August 2026, second only to OpenAI's 60.",
    "Z.ai publishes weights for fourteen of its sixteen rows in the OpenRouter\ncatalog, as of the 31 August 2026 snapshot.",
  ];
  for (const text of postFix) {
    assert.deepEqual(
      findSnapshotCensus(text, 1, TODAY_SNAPSHOT),
      [],
      `false positive: ${text.slice(0, 60)}...`,
    );
  }
});

test('7q8 the corpus own point-in-time hedge style is out of scope, by design', () => {
  // openai.md's established convention for a claim allowed to age: it carries
  // no row-COUNT at all (it is a price/rate comparison between two named
  // rows), so this check's row-count pattern never even matches it. That
  // class is addictedtoai-58o's territory, not this one's.
  const hedged =
    "One oddity in the catalog, as observed on 28 August 2026: each tier's `-pro`\nrow lists at the same price as its base row -- the catalog is what it is, dated.";
  assert.deepEqual(findSnapshotCensus(hedged, 1, TODAY_SNAPSHOT), []);
});

test('7q8 a census with no snapshot or catalog word nearby is out of scope', () => {
  // tencent.md's own "seven rows, six have a Hugging Face id" -- true today,
  // judged by hand during the sweep, and structurally different from the
  // flagged instances: nothing on the page claims it is drawn from a
  // particular fetch, so there is no anchor to bind or fail to name.
  const noScope =
    "`tencent/hy4-preview` is the only one of Tencent's seven rows with no Hugging\nFace id. The other six all have one.";
  assert.deepEqual(findSnapshotCensus(noScope, 1, TODAY_SNAPSHOT), []);
});

test('7q8 an unknown current snapshot date forgives a dated claim rather than flagging it', () => {
  // Pre-first-Pulse-run state: nothing to compare against, so a dated claim
  // is not (yet) confirmable false. Only the undated rule still fires.
  const dated =
    "All ten of NVIDIA's rows in the OpenRouter\nsnapshot of 28 August 2026 carry a Hugging Face id.";
  assert.deepEqual(findSnapshotCensus(dated, 1, null), []);
});

test('7q8 code spans and fences are not prose', () => {
  const fenced = [
    '```text',
    'Of the 388 rows in the snapshot of 28 August 2026, eight carry a date.',
    '```',
  ].join('\n');
  assert.deepEqual(findSnapshotCensus(fenced, 1, TODAY_SNAPSHOT), []);
  assert.deepEqual(
    findSnapshotCensus(
      'Inline: `Of the 388 rows in the snapshot of 28 August 2026, eight carry a date.`',
      1,
      TODAY_SNAPSHOT,
    ),
    [],
  );
});

test('7q8 masks are matched against the original, not cascaded', () => {
  // The bug price-attribution.mjs's own header names as hard-won: a line
  // OPENING with an inline code span (the single most common sentence shape
  // in this corpus) must not blank the rest of the line via the
  // indented-code mask reading the resulting leading spaces as a code block.
  //
  // The whole census phrase sits on the SAME physical line as the leading
  // span, deliberately, and deliberately with no independently-matching
  // number-unit pair anywhere else in the string: a cascaded mask blanks
  // the entire rest of THIS line (the indented-code regex is `^...$/gm`,
  // line-scoped), so a test whose fallback match survives on the next
  // physical line would pass even under the bug this exists to catch — a
  // real mistake this suite's own first draft made and mutation testing
  // caught, since the original two-line version kept passing under
  // Mutation 1 below.
  const s =
    "`vendor/row-name` ships fourteen of its sixteen rows in the OpenRouter catalog, as of the 28 August 2026 snapshot.";
  const hits = findSnapshotCensus(s, 1, TODAY_SNAPSHOT);
  assert.equal(hits.length, 1, 'a leading code span must not blank the line');
  assert.equal(hits[0].kind, 'mismatched');
  assert.equal(hits[0].match, 'fourteen of its sixteen rows');
});

test('7q8 a transclusion marker is masked to blanks, never digits', () => {
  // The other hard-won lesson: a marker's own text is a VALUE, not prose.
  // Unlike price-attribution.mjs (which needs digits to survive for its verb
  // check), this check has no reason to keep them, so a marker must leave no
  // digit residue at all. The marker id is a REAL one from this corpus
  // (org/nvidia's flagship) chosen specifically because it carries digits —
  // an earlier draft of this test used an id with none at all, which passed
  // this assertion whether or not masking ran, and was itself only caught by
  // mutation-testing this module (Mutation 2 kept passing under it).
  const raw = '{{fact:model/nvidia-nemotron-3-ultra-550b-a55b#context_window}}';
  const masked = maskForCensus(`Something says ${raw} rows total, in this OpenRouter snapshot.`);
  assert.doesNotMatch(masked, /\d/, 'a masked marker must leave no digits behind');
  assert.ok(
    masked.includes(' '.repeat(raw.length)),
    'the whole marker becomes blank, not partially',
  );
});

// ---------------------------------------------------------------------------
// PRECISION — every false positive this module actually produced when run
// against the real corpus, each fixed and pinned by its own test. Measured,
// not assumed: with "one"/"two" in NUMBER_WORD and no duration/ratio/anchor
// filtering, the FIRST full-corpus run produced 14 false errors; each fix
// below is the one that cleared a specific real sentence, and the corpus
// build is now 0 errors / 0 debt (see the module header's own account).
// ---------------------------------------------------------------------------

test('7q8 the house price-attribution hedge idiom is not a census ("two")', () => {
  // Reused verbatim across nvidia.md, thinking-machines-lab.md,
  // z-ai-glm-5-1.md, anthropic-claude-opus-4-7.md, openai-gpt-5-5.md,
  // openai-gpt-5-6-luna.md. None of it is a row count.
  const idiom =
    "Neither figure is necessarily NVIDIA's: each is the top listed provider's\nrate for its row, and two rows are not obliged to be headed by the same\nprovider, so the inversion sits between two listings rather than being a\nsurcharge anyone levied, in this OpenRouter snapshot.";
  assert.deepEqual(findSnapshotCensus(idiom, 1, TODAY_SNAPSHOT), []);
});

test('7q8 a bare "one"/"two" discourse marker is not a census', () => {
  // spacexai.md: "One more thing the rows record: version numbers here are
  // not decimals." "One" opens the sentence; it does not count rows.
  const s = 'One more thing the rows record about this OpenRouter snapshot: it moves.';
  assert.deepEqual(findSnapshotCensus(s, 1, TODAY_SNAPSHOT), []);
});

test('7q8 a number before a DURATION noun is not a census', () => {
  // z-ai-glm-5-1.md, verbatim: "Ten" counts weeks, not rows — `z-ai/glm-5.2`
  // is one specific row named a sentence later, not a total.
  const s =
    "Ten weeks after this row, `z-ai/glm-5.2` arrived listing a wider window,\nin the same OpenRouter snapshot.";
  assert.deepEqual(findSnapshotCensus(s, 1, TODAY_SNAPSHOT), []);
});

test('7q8 "a factor of N" is a ratio, not a row count', () => {
  // tencent.md, verbatim: 128 is the multiple between two windows, not a
  // count of rows — "rows" only appears because that is what the ratio is
  // between.
  const s =
    "That is a factor of 128 between two rows from one company inside a\nfortnight, in this OpenRouter catalog snapshot.";
  assert.deepEqual(findSnapshotCensus(s, 1, TODAY_SNAPSHOT), []);
});

test('7q8 only a date actually near "snapshot"/"catalog" is a candidate anchor', () => {
  // nvidia.md, verbatim shape: an unrelated architecture-announcement date
  // sits in an EARLIER paragraph of the same headless body, closer in raw
  // character distance to the free-listings census than the real snapshot
  // date two paragraphs above it. "Nearest date in the whole section" (no
  // proximity-to-"snapshot" filter) picked the wrong one; this must not.
  const s = [
    'The company that sells the hardware gives away the parts of a model that are',
    'usually the secret. All ten of NVIDIA\'s rows in the OpenRouter snapshot of',
    '31 August 2026 carry a Hugging Face id.',
    '',
    'The licence became a standard one as the models stopped being someone else\'s.',
    'NVIDIA\'s April 2025 reasoning release was a Llama derivative; the Nemotron 3',
    'family announced 15 December 2025 is NVIDIA\'s own hybrid architecture, an',
    'off-the-shelf agreement rather than a house one.',
    '',
    'Then there are the rows that argue with each other. Five of the eighteen free',
    'listings in the whole snapshot are NVIDIA\'s -- more than any other vendor.',
  ].join('\n');
  assert.deepEqual(
    findSnapshotCensus(s, 1, TODAY_SNAPSHOT),
    [],
    'the free-listings census must still resolve to 31 August 2026, not 15 December 2025',
  );
});

test('7q8 a possessive singular row is not a census, even mid-window', () => {
  // openai-gpt-5-6-terra.md, verbatim: "this row's own" names ONE row.
  // Without the (?!['’]) exclusion, \brows?\b matches "row" inside
  // "row's" because a word boundary sits at the apostrophe too.
  const s =
    "That preview reached roughly 20 organisations on 26 June 2026 at the US\ngovernment's request, thirteen days before this row's own general\navailability, in this OpenRouter snapshot.";
  assert.deepEqual(findSnapshotCensus(s, 1, TODAY_SNAPSHOT), []);
});

test('7q8 a possessive singular row is not a census, isolated from the duration rule', () => {
  // The sentence above is ALSO caught by the duration-noun rule ("days"
  // sits between the number and the unit), so mutation-testing this module
  // found that removing the (?!['’]) exclusion alone left that test
  // green -- the duration rule was silently covering for it. This sentence
  // has no duration noun anywhere in it and exactly three intervening words
  // (the CENSUS_RE window's maximum), so only the possessive exclusion can
  // be the reason it stays clean.
  const s = "Every fourteen model families shipped row's own listing, in the OpenRouter snapshot.";
  assert.deepEqual(findSnapshotCensus(s, 1, TODAY_SNAPSHOT), []);
});

test('7q8 the fixture corpus flags exactly the two bad bodies, unforgiven', async () => {
  const { Diagnostics } = await import('./errors.mjs');
  const diags = new Diagnostics();
  let threw = false;
  try {
    await buildFixture('snapshot-census', {
      diags,
      censusDebt: { known: [] },
      censusSnapshotDate: TODAY_SNAPSHOT,
    });
  } catch {
    threw = true;
  }
  assert.ok(threw, 'both bad bodies fail the build with no debt recorded');
  const census = diags.errors.filter((e) => e.rule === 'snapshot-census');
  assert.equal(census.length, 2, 'exactly the two bad bodies are flagged, clean.md is not');
  const files = census.map((e) => e.file).sort();
  assert.deepEqual(files, [
    `${FIX}/wiki/model/mismatched-census.md`,
    `${FIX}/wiki/model/undated-census.md`,
  ]);
});

// ---------------------------------------------------------------------------
// THE DEBT RATCHET — it may only shrink, same shape as price-attribution's
// ---------------------------------------------------------------------------

test('7q8 an absent debt list forgives nothing — the safe direction', async () => {
  let err;
  try {
    await buildFixture('snapshot-census', { censusDebt: undefined, censusSnapshotDate: TODAY_SNAPSHOT });
  } catch (e) {
    err = e;
  }
  assert.ok(err, 'no debt list means every instance fails');
});

test('7q8 a recorded instance warns instead of failing, and keeps the repair advice', async () => {
  const site = await buildFixture('snapshot-census', {
    censusDebt: {
      known: [
        { file: `${FIX}/wiki/model/undated-census.md`, match: 'thirteen of its fifteen rows' },
        { file: `${FIX}/wiki/model/mismatched-census.md`, match: "ten of this vendor's rows" },
      ],
    },
    censusSnapshotDate: TODAY_SNAPSHOT,
  });
  assert.equal(errorsOf(site).length, 0);
  const w = warnsOf(site, 'snapshot-census-debt');
  assert.equal(w.length, 2);
  assert.ok(w.every((x) => /repair|hedge|anchor/i.test(x.message)));
});

test('7q8 a debt entry that no longer fires is reported as removable', async () => {
  const site = await buildFixture('snapshot-census', {
    censusDebt: {
      known: [
        { file: `${FIX}/wiki/model/undated-census.md`, match: 'thirteen of its fifteen rows' },
        { file: `${FIX}/wiki/model/mismatched-census.md`, match: "ten of this vendor's rows" },
        { file: `${FIX}/wiki/model/clean.md`, match: "ten of this vendor's rows" },
      ],
    },
    censusSnapshotDate: TODAY_SNAPSHOT,
  });
  const stale = warnsOf(site, 'snapshot-census-debt-stale');
  assert.equal(stale.length, 1, 'the entry naming the clean, already-anchored file is removable');
  assert.match(stale[0].field, /clean\.md/);
  assert.match(stale[0].message, /keeps shrinking/);
});

test('7q8 the build reports what the check actually ran on, and the bound date', async () => {
  const site = await buildFixture('snapshot-census', {
    censusDebt: {
      known: [
        { file: `${FIX}/wiki/model/undated-census.md`, match: 'thirteen of its fifteen rows' },
        { file: `${FIX}/wiki/model/mismatched-census.md`, match: "ten of this vendor's rows" },
      ],
    },
    censusSnapshotDate: TODAY_SNAPSHOT,
  });
  const sc = site.snapshotCensus;
  assert.equal(sc.docs, 4, 'all four fixture documents carry a census claim');
  assert.equal(sc.scanned, 4, 'one claim per document');
  assert.equal(sc.errors, 0);
  assert.equal(sc.known, 2);
  assert.equal(sc.hedged, 1, 'the hedged body is reported, not silently dropped');
  assert.equal(site.censusSnapshotDate, TODAY_SNAPSHOT);
});

test('7q8 debtKeys tolerates a missing or empty list', () => {
  assert.equal(debtKeys(undefined).size, 0);
  assert.equal(debtKeys({}).size, 0);
  assert.equal(debtKeys({ known: [] }).size, 0);
  assert.ok(debtKeys({ known: [{ file: 'a.md', match: 'ten rows' }] }).has('a.md::ten rows'));
});

// ---------------------------------------------------------------------------
// THE PROMISED HEDGE (beads addictedtoai-jqif, and the daily-red-build finding
// addictedtoai-pxx1 that made it urgent).
//
// The check's own error message told authors there were two repairs for a
// mismatched census — re-date it, "or use the corpus's established hedge for a
// claim that is allowed to age ('as observed on DATE ...')". The second repair
// did not exist: `scanSnapshotCensus`'s whole verdict was `undated` or
// `mismatched` and nothing inspected the wording around the date, so an author
// who followed the advice literally got the same error back forever.
//
// These tests fix BOTH halves of that contract. The first asserts the branch
// exists. The rest are the ones that matter: the branch must be UNREACHABLE by
// every shape this guardrail was built to catch. If a test below ever goes
// green by widening the marker instead of repairing prose, the check has
// become decorative and the whole module is theatre.
// ---------------------------------------------------------------------------

test('jqif the promised hedge is honoured — a dated observation is allowed to age', () => {
  // The repair the error message has promised since 7q8 landed. The marker is
  // an explicit authorial act: "I am recording an observation of a named day
  // and I accept that it ages." That is a different sentence from one that
  // asserts what the catalog holds now.
  const s =
    "All ten of this vendor's rows in the OpenRouter snapshot of 28 August 2026\n" +
    'carried a Hugging Face id, as observed on 28 August 2026.';
  assert.deepEqual(findSnapshotCensus(s, 1, TODAY_SNAPSHOT), []);
});

test('jqif an UNDATED census cannot be rescued by the marker', () => {
  // Acceptance 1. There is no legitimate undated form — nothing anchors it —
  // so the hedge branch must sit AFTER the undated verdict, never beside it.
  // The marker is present in the paragraph and the census is still in scope;
  // the date simply sits too far from any catalog/snapshot word to be a
  // candidate anchor, which is exactly the undated case.
  const s =
    'As observed on 28 August 2026, and this clause exists only to push the ' +
    'first mention of the word that puts a census in scope at all well past ' +
    'the eighty-character anchor radius, ninety-one of the 388 rows in that ' +
    'catalog carry the flag.';
  const hits = findSnapshotCensus(s, 1, TODAY_SNAPSHOT);
  assert.equal(hits.length, 1, 'the undated census must still be caught');
  assert.equal(hits[0].kind, 'undated');
});

test('jqif a bare live claim cannot be rescued — the near-miss phrasing is not the marker', () => {
  // Acceptance 2, and the exact place the judgment line is drawn.
  //
  // "as of the DATE snapshot" is what nine wiki pages used until this repair.
  // It SCOPES a claim to a dated fetch but it does not mark the claim as an
  // observation allowed to age: every one of those sentences reads in the
  // present tense and asserts what the catalog holds. Accepting it here would
  // have switched the check off for the whole corpus in one regex — the same
  // outcome as forgiving all sixteen instances as debt, which pxx1 forbids.
  const s = 'As of the 28 August 2026 snapshot, ninety-three of the 396 rows carry the flag.';
  const hits = findSnapshotCensus(s, 1, TODAY_SNAPSHOT);
  assert.equal(hits.length, 1, 'a present-tense claim scoped to an old fetch is still wrong');
  assert.equal(hits[0].kind, 'mismatched');
  assert.equal(hits[0].claimedDate, '2026-08-28');
});

test('jqif the pre-sweep corpus sentences stay caught, marker or no marker', () => {
  // The three real historical defects the 7q8 suite pins above are re-asserted
  // here against the hedge branch specifically: adding the branch must not
  // have reclassified any of them. This is the regression that would tell us
  // the repair had quietly become a loosening.
  const preFix = [
    "All ten of NVIDIA's rows in the OpenRouter\nsnapshot of 28 August 2026 carry a Hugging Face id.",
    'Alibaba Cloud has 52 rows in the OpenRouter\nsnapshot of 28 August 2026, second only to OpenAI\'s 58.',
    'Of the 388 rows in\nthe OpenRouter snapshot of 28 August 2026, eight carry a non-null date.',
  ];
  for (const text of preFix) {
    const hits = findSnapshotCensus(text, 1, TODAY_SNAPSHOT);
    assert.ok(hits.length > 0, `no longer caught: ${text.slice(0, 50)}...`);
    assert.ok(hits.every((h) => h.kind === 'mismatched'));
  }
});

test('jqif a FUTURE date cannot be hedged, and gets its own verdict', () => {
  // Acceptance 3. "As observed on" a day that has not been fetched yet is not
  // an observation at all, so the branch must refuse it before it is reached
  // — and say what is actually wrong rather than offering the hedge again.
  const s =
    "As observed on 5 September 2026, all ten of this vendor's rows in the\n" +
    'OpenRouter snapshot of 5 September 2026 carried a Hugging Face id.';
  const hits = findSnapshotCensus(s, 1, TODAY_SNAPSHOT);
  assert.equal(hits.length, 1);
  assert.equal(hits[0].kind, 'future');
  assert.equal(hits[0].claimedDate, '2026-09-05');
});

test('jqif the marker must name the claim\'s own anchor date', () => {
  // A marker naming some other day licenses nothing: otherwise one hedged
  // sentence would bless every census near it whatever day it claimed.
  const s =
    "All ten of this vendor's rows in the OpenRouter snapshot of 28 August 2026\n" +
    'carried a Hugging Face id, as observed on 27 August 2026.';
  const hits = findSnapshotCensus(s, 1, TODAY_SNAPSHOT);
  assert.equal(hits.length, 1);
  assert.equal(hits[0].kind, 'mismatched');
  assert.equal(hits[0].claimedDate, '2026-08-28');
});

test('jqif the hedge is PARAGRAPH-scoped, deliberately narrower than the anchor', () => {
  // The anchor search is section-wide because this corpus states a snapshot's
  // date once and refers back to it. The hedge must NOT inherit that scope:
  // most entry bodies here carry no ATX heading at all, so "section" is the
  // whole page and one marker would license every census on it. A paragraph is
  // the unit the corpus's own established instance uses (openai.md carries the
  // marker in one sentence and the "dated" coda two sentences later).
  const s = [
    'A first paragraph, as observed on 28 August 2026, about the OpenRouter catalog.',
    '',
    "All ten of this vendor's rows in the OpenRouter snapshot of 28 August 2026",
    'carried a Hugging Face id.',
  ].join('\n');
  const hits = findSnapshotCensus(s, 1, TODAY_SNAPSHOT);
  assert.equal(hits.length, 1, 'a marker in another paragraph licenses nothing');
  assert.equal(hits[0].kind, 'mismatched');
});

test('jqif a marker inside a code span is not prose and cannot hedge', () => {
  // Same rule the rest of this module already lives by: a masked region is a
  // VALUE, not authorship. A marker quoted in backticks is documentation of
  // the convention, not an author invoking it.
  const s =
    "All ten of this vendor's rows in the OpenRouter snapshot of 28 August 2026\n" +
    'carried a Hugging Face id, `as observed on 28 August 2026`.';
  const hits = findSnapshotCensus(s, 1, TODAY_SNAPSHOT);
  assert.equal(hits.length, 1, 'a masked marker is not a hedge');
  assert.equal(hits[0].kind, 'mismatched');
});

test('jqif the date must sit IMMEDIATELY after the marker, not merely near it', () => {
  // "as observed on OR ABOUT 28 August 2026" is vaguer than the convention: it
  // names an approximate day, and the whole value of the hedge is that it
  // names the exact fetch. The date here sits well inside the lookahead
  // window, so only the "immediately after" rule can reject it.
  //
  // Mutation-testing this module caught the first draft of this test: it put
  // the date several clauses away, past the lookahead entirely, so relaxing
  // the rule left it green and the guard was never exercised. Same class of
  // mistake the 7q8 suite records twice in its own history.
  const s =
    "All ten of this vendor's rows in the OpenRouter snapshot of 28 August 2026\n" +
    'carried a Hugging Face id, as observed on or about 28 August 2026.';
  const hits = findSnapshotCensus(s, 1, TODAY_SNAPSHOT);
  assert.equal(hits.length, 1, 'an approximate observation date is not the marker');
  assert.equal(hits[0].kind, 'mismatched');
});

test('jqif a hedged claim is still COUNTED, never silently dropped', async () => {
  // The vacuum this module's own header warns about: a claim that stops being
  // an error must not stop being visible, or the branch could swallow the
  // corpus and the build line would read identically to a clean one.
  const site = await buildFixture('snapshot-census', {
    censusDebt: {
      known: [
        { file: `${FIX}/wiki/model/undated-census.md`, match: 'thirteen of its fifteen rows' },
        { file: `${FIX}/wiki/model/mismatched-census.md`, match: "ten of this vendor's rows" },
      ],
    },
    censusSnapshotDate: TODAY_SNAPSHOT,
  });
  const sc = site.snapshotCensus;
  assert.equal(sc.docs, 4, 'the hedged document is examined like any other');
  assert.equal(sc.scanned, 4);
  assert.equal(sc.hedged, 1, 'exactly the hedged document rides the branch');
  assert.equal(sc.errors, 0);
});

test('jqif the build accepts the hedged fixture end to end', async () => {
  // The whole point, measured through the real build rather than the scanner:
  // the hedged body carries a census dated three days before the bound
  // snapshot and does not fail the build, while the unhedged one beside it
  // still does.
  const err = await buildFixture('snapshot-census', { censusSnapshotDate: TODAY_SNAPSHOT }).catch(
    (e) => e,
  );
  assert.ok(err instanceof Error);
  assert.doesNotMatch(err.message, /hedged-census\.md/);
  assert.match(err.message, /mismatched-census\.md/);
});

// ---------------------------------------------------------------------------
// SCOPE — only wiki entries; tutorials keep their own freshness mechanism
// ---------------------------------------------------------------------------

test('7q8 only doc.type === "entry" is scanned', () => {
  const diags = {
    errors: [],
    warnings: [],
    error(e) { this.errors.push(e); },
    warn(w) { this.warnings.push(w); },
  };
  const body = 'Of the 388 rows in the OpenRouter snapshot of 28 August 2026, eight carry a date.';
  const tutorial = { type: 'tutorial', hasBody: true, body, bodyStartLine: 1, file: 'tutorials/x.md' };
  const result = checkSnapshotCensus(tutorial, diags, new Set(), TODAY_SNAPSHOT);
  assert.deepEqual(result, { scanned: 0, hedged: 0, errors: 0, known: 0, keys: [] });
  assert.equal(diags.errors.length, 0);

  const entry = { ...tutorial, type: 'entry', file: 'wiki/model/x.md' };
  const result2 = checkSnapshotCensus(entry, diags, new Set(), TODAY_SNAPSHOT);
  assert.equal(result2.errors, 1);
});

// ---------------------------------------------------------------------------
// DATE DERIVATION — bound to the freshness pipeline's own snapshot_date
// ---------------------------------------------------------------------------

test('7q8 the snapshot date defaults to dataLayer.source("openrouter-models").snapshot_date', async () => {
  const dataLayer = makeDataLayer({
    sources: { sources: [{ id: 'openrouter-models', url: 'https://example.org' }] },
    freshness: {
      sources: [
        {
          id: 'openrouter-models',
          snapshot_date: '2026-09-05',
          display_date: '2026-09-05',
          display_date_label: 'last checked',
          suspect: false,
        },
      ],
    },
    feedRows: {},
  });
  const site = await buildSite({
    contentRoot: join(ROOT, 'lib', 'fixtures', 'snapshot-census'),
    today: '2026-09-05',
    redirects: false,
    reviewsDir: join(ROOT, 'lib', 'fixtures', 'review-records', 'none'),
    dataLayer,
    priceDebt: { known: [] },
    censusDebt: {
      known: [
        { file: `${FIX}/wiki/model/undated-census.md`, match: 'thirteen of its fifteen rows' },
        { file: `${FIX}/wiki/model/mismatched-census.md`, match: "ten of this vendor's rows" },
        { file: `${FIX}/wiki/model/clean.md`, match: "ten of this vendor's rows" },
      ],
    },
    // censusSnapshotDate deliberately omitted (undefined), so buildSite must
    // derive it from the data layer rather than from a caller-pinned value.
  });
  assert.equal(site.censusSnapshotDate, '2026-09-05');
});
