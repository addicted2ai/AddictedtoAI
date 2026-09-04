/**
 * sitemap-dates.test.mjs — the sitemap's `lastModified` decision
 * (addictedtoai-dwo, addictedtoai-3u1).
 *
 * `app/sitemap.ts` used to give delta pages `view.routine.date` as
 * `lastModified` — the date the ROUTINE end of the impossible/routine pair
 * happened, which can be decades old and is a fact about the subject, not
 * about the page. This suite proves the replacement, `contentChangedOn`
 * (`lib/sitemap-dates.mjs`, imported by `app/sitemap.ts` rather than
 * reimplemented there), resolves every one of the four review-join states a
 * delta can be in WITHOUT ever falling back to that routine date — including
 * `missing`, whose correct answer is "no lastModified at all", not a guess.
 *
 * The fixture corpus is `lib/fixtures/sitemap-deltas/deltas/`, four deltas
 * named for the state each is in. Review records are written into a
 * throwaway directory under the OS temp dir at test time, mirroring
 * `reviews.test.mjs` — a record's `reviewed:` hash has to be the hash of the
 * fixture file as it stands, so a checked-in hash would go stale the first
 * time anyone reflowed a fixture's prose.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { loadCorpus } from './corpus.mjs';
import { fixtureRoot } from './test-helpers.mjs';
import { reviewCandidates, reviewJoin } from './reviews.mjs';
import { reviewedHashOfFile } from './review-hash.mjs';
import { later, newest, buildChangedOnMap, reviewedOn, factsMovedOn, contentChangedOn, postChangedOn } from './sitemap-dates.mjs';

const CORPUS = fixtureRoot('sitemap-deltas');
const NOT_THE_HASH = '0'.repeat(64);

/** One record, written the way a reviewer plus the merge step would leave it. */
function writeRecord(dir, name, { date, job, reviewed } = {}) {
  const fm = ['---'];
  if (job) fm.push(`job: ${job}`);
  fm.push('verdict: approve', 'reasons: []', `would-cite: ${JSON.stringify(name)}`);
  if (date) fm.push(`date: ${date}`);
  if (reviewed) {
    fm.push('reviewed:');
    for (const [k, v] of Object.entries(reviewed)) fm.push(`  ${JSON.stringify(k)}: ${JSON.stringify(v)}`);
  }
  fm.push('---', '', 'Fixture notes.', '');
  writeFileSync(join(dir, name), fm.join('\n'), 'utf8');
}

/** The corpus, and a review join built against the three bound states, in one throwaway dir. */
async function joined() {
  const corpus = await loadCorpus({ contentRoot: CORPUS });
  assert.equal(corpus.diags.errors.length, 0, 'the fixture corpus must load clean');

  const byName = (slug) => corpus.delta.find((d) => d.slug === slug);
  const recorded = byName('recorded-delta');
  const mismatched = byName('mismatched-delta');
  const unbound = byName('unbound-delta');
  const missing = byName('missing-delta');
  assert.ok(recorded && mismatched && unbound && missing, 'all four fixture deltas loaded');

  const dir = mkdtempSync(join(tmpdir(), 'atai-sitemap-dates-'));
  writeRecord(dir, `${reviewCandidates(recorded)[0]}`, {
    date: '2026-08-28',
    job: 'j-20260828-01',
    reviewed: { [recorded.file]: reviewedHashOfFile(recorded.abs) },
  });
  writeRecord(dir, `${reviewCandidates(mismatched)[0]}`, {
    date: '2026-08-20',
    job: 'j-20260820-02',
    reviewed: { [mismatched.file]: NOT_THE_HASH },
  });
  writeRecord(dir, `${reviewCandidates(unbound)[0]}`, {
    date: '2026-08-15',
    job: 'j-20260815-03',
    // No `reviewed:` key at all — the record joins by name only.
  });
  // No record whatsoever for `missing-delta`.

  const reviewJoinResult = reviewJoin(corpus, { reviewsDir: dir });
  return { corpus, reviewJoinResult, recorded, mismatched, unbound, missing };
}

test('3u1 the four review states join to a delta exactly as they do to any other piece', async () => {
  const { reviewJoinResult, recorded, mismatched, unbound, missing } = await joined();
  assert.equal(reviewJoinResult.states.get(recorded.file), 'recorded');
  assert.equal(reviewJoinResult.states.get(mismatched.file), 'mismatched');
  assert.equal(reviewJoinResult.states.get(unbound.file), 'unbound');
  assert.equal(reviewJoinResult.states.get(missing.file), 'missing');
});

test('3u1 recorded, mismatched and unbound all take the review record\'s date, never the routine date', async () => {
  const { reviewJoinResult, recorded, mismatched, unbound } = await joined();
  const changedOn = buildChangedOnMap([]); // no changed-feed lines in this fixture

  assert.equal(contentChangedOn(recorded, reviewJoinResult.byFile, changedOn), '2026-08-28');
  assert.equal(contentChangedOn(mismatched, reviewJoinResult.byFile, changedOn), '2026-08-20');
  assert.equal(contentChangedOn(unbound, reviewJoinResult.byFile, changedOn), '2026-08-15');

  // The bug this suite guards against: none of these may ever equal the
  // fixture's routine-end date (2009-08-27 / 2010-01-01 / 2011-02-02).
  for (const doc of [recorded, mismatched, unbound]) {
    const got = contentChangedOn(doc, reviewJoinResult.byFile, changedOn);
    assert.notEqual(got, doc.data.routine.date, `${doc.slug} must not fall back to routine.date`);
  }
});

test('3u1 missing gets no lastModified at all — absence, never a guess and never routine.date', async () => {
  const { reviewJoinResult, missing } = await joined();
  const changedOn = buildChangedOnMap([]);
  const got = contentChangedOn(missing, reviewJoinResult.byFile, changedOn);
  assert.equal(got, undefined, 'a piece with no bound review record gets no lastModified');
  assert.notEqual(got, missing.data.routine.date);
});

test('3u1 reviewedOn reads null for a doc with no join entry, not an exception', () => {
  assert.equal(reviewedOn({ file: 'nope.md' }, new Map()), undefined);
});

// ── the shared primitives, exercised directly (no corpus needed) ──────────

test('later picks the greater ISO date string, and tolerates either side missing', () => {
  assert.equal(later('2026-08-01', '2026-08-29'), '2026-08-29');
  assert.equal(later('2026-08-29', '2026-08-01'), '2026-08-29');
  assert.equal(later('2026-08-01', undefined), '2026-08-01');
  assert.equal(later(undefined, '2026-08-01'), '2026-08-01');
  assert.equal(later(undefined, undefined), undefined);
});

// ── addictedtoai-1r7: the twelve index routes' member-max lastModified ────

test('newest picks the greatest date in a list, ignoring absent entries, and undefined when none exist', () => {
  assert.equal(newest(['2026-08-01', '2026-08-29', '2026-08-15']), '2026-08-29');
  assert.equal(newest(['2026-08-29', undefined, '2026-08-01']), '2026-08-29');
  assert.equal(newest([undefined, undefined]), undefined);
  assert.equal(newest([]), undefined);
  assert.equal(newest(undefined), undefined, 'an absent list is treated the same as an empty one');
});

test('newest is later() folded over a list, order does not matter', () => {
  const dates = ['2020-01-01', '2026-08-31', '2019-12-25', '2026-08-30'];
  assert.equal(newest(dates), newest([...dates].reverse()));
});

test('buildChangedOnMap keeps the newest date per entry id and ignores rows with no id or date', () => {
  const map = buildChangedOnMap([
    { entry: { id: 'model/x' }, date: '2026-08-01' },
    { entry: { id: 'model/x' }, date: '2026-08-20' },
    { entry: { id: 'model/y' }, date: '2026-08-05' },
    { entry: null, date: '2026-08-30' },
    { entry: { id: 'model/z' }, date: undefined },
  ]);
  assert.equal(map.get('model/x'), '2026-08-20');
  assert.equal(map.get('model/y'), '2026-08-05');
  assert.equal(map.has('model/z'), false);
});

test('factsMovedOn reads a doc\'s own id and every fact it transcluded, taking the newest', () => {
  const changedOn = buildChangedOnMap([
    { entry: { id: 'model/own' }, date: '2026-08-10' },
    { entry: { id: 'model/other' }, date: '2026-08-25' },
  ]);
  const doc = { data: { id: 'model/own' }, transcluded: { facts: ['model/other#price_input'] } };
  assert.equal(factsMovedOn(doc, changedOn), '2026-08-25', 'the transcluded entry moved later');

  const noTransclusion = { data: { id: 'model/own' }, transcluded: undefined };
  assert.equal(factsMovedOn(noTransclusion, changedOn), '2026-08-10');

  const notAnEntry = { data: {}, transcluded: undefined };
  assert.equal(factsMovedOn(notAnEntry, changedOn), undefined, 'a delta has no data.id and no transclusions');
});

// ---------------------------------------------------------------------------
// A post's date, and the drift that produced it. Found 2026-09-03 by
// verify-surfaces: `graph 2026-09-03 vs sitemap 2026-09-02` on
// /blog/glm-5-3-license-revenue-gate, the first published post ever edited.
// ---------------------------------------------------------------------------

test('postChangedOn moves when a published post is EDITED — the case that broke the invariant', () => {
  // The real shape: a post published 2026-09-02, revised by a job whose review
  // record is dated 2026-09-03. The sitemap sent `date:` and the graph sent
  // `contentChangedOn`, so one moved and the other did not.
  const doc = { file: 'content/blog/p.md', data: { date: '2026-09-02' } };
  // The join's shape: `byFile` maps a file to its record, and `recencyOf`
  // reads `record.data.date` — the review record's own front matter.
  const reviewsByFile = new Map([['content/blog/p.md', { record: { data: { date: '2026-09-03', job: 'j-20260903-15' } } }]]);

  assert.equal(contentChangedOn(doc, reviewsByFile, new Map()), '2026-09-03');
  assert.equal(
    postChangedOn(doc, reviewsByFile, new Map()),
    '2026-09-03',
    'the edit date wins over the publication date, so an edited post reports being edited',
  );
});

test('postChangedOn never regresses below the post\'s own date: — the coverage half', () => {
  // contentChangedOn ALONE would have been the obvious fix and it silently
  // drops the date for a post with no joined review record, on the one surface
  // where the date is the point. `later` of the two cannot.
  const doc = { file: 'content/blog/p.md', data: { date: '2026-09-02' } };
  const noRecord = new Map();

  assert.equal(contentChangedOn(doc, noRecord, new Map()), undefined, 'the trap being avoided');
  assert.equal(postChangedOn(doc, noRecord, new Map()), '2026-09-02', 'falls back to the publication date');
});

test('postChangedOn takes a fact move too, like every other page kind', () => {
  const doc = {
    file: 'content/blog/p.md',
    data: { date: '2026-09-02' },
    transcluded: { facts: ['model/x#price_input'] },
  };
  const changedOn = buildChangedOnMap([{ entry: { id: 'model/x' }, date: '2026-09-05' }]);
  assert.equal(postChangedOn(doc, new Map(), changedOn), '2026-09-05');
});

test('postChangedOn returns nothing for a doc carrying no dates, and still THROWS on no doc', () => {
  // Absence of a date is an answer this module already gives elsewhere, so a
  // doc with no front matter resolves to undefined rather than a guess.
  assert.equal(postChangedOn({ file: 'x' }, new Map(), new Map()), undefined);
  // An absent doc is not that case and must not be quietly absorbed: it means
  // a caller mapped over something it should not have, and `contentChangedOn`
  // has always thrown on it. Asserting the throw keeps the two consistent —
  // the first draft of this test asserted tolerance and would have argued for
  // making a real bug silent.
  assert.throws(() => postChangedOn(undefined, new Map(), new Map()), TypeError);
});
