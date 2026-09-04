/**
 * reviews.test.mjs — the join, and the four states it reports
 * (specs/review, beads addictedtoai-zlq).
 *
 * The corpus is `lib/fixtures/review-states/`, seven entries named for the
 * state each is in. The records are written into a throwaway directory under
 * the OS temp dir at test time rather than checked in, because a record's
 * `reviewed:` hash has to be the hash of the fixture file as it stands — a
 * checked-in hash would go stale the first time anyone reflowed a fixture's
 * prose, and the test would then measure the staleness rather than the rule.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadCorpus } from './corpus.mjs';
import { relPath } from './paths.mjs';
import { robotsFor } from './indexability.mjs';
import { reviewedHashOfFile } from './review-hash.mjs';
import { fixtureRoot } from './test-helpers.mjs';
import {
  entryReviewGate,
  mismatchProblems,
  recencyOf,
  reviewJoin,
  reviewStateReport,
  reviewedOf,
} from './reviews.mjs';

const CORPUS = fixtureRoot('review-states');
const fileOf = (slug) => relPath(join(CORPUS, 'wiki', 'concept', `${slug}.md`));
const hashOf = (slug) => reviewedHashOfFile(join(CORPUS, 'wiki', 'concept', `${slug}.md`));
const NOT_THE_HASH = '0'.repeat(64);

/** One record, written the way a reviewer plus the merge step would leave it. */
function writeRecord(dir, name, { verdict = 'approve', cite, subject, date, job, reviewed } = {}) {
  const fm = ['---'];
  if (job) fm.push(`job: ${job}`);
  fm.push(`verdict: ${verdict}`, 'reasons: []', `would-cite: ${JSON.stringify(cite ?? name)}`);
  if (date) fm.push(`date: ${date}`);
  if (subject) fm.push(`subject: ${JSON.stringify(subject)}`);
  if (reviewed) {
    fm.push('reviewed:');
    for (const [k, v] of Object.entries(reviewed)) fm.push(`  ${JSON.stringify(k)}: ${JSON.stringify(v)}`);
  }
  fm.push('---', '', 'Fixture notes.', '');
  writeFileSync(join(dir, name), fm.join('\n'), 'utf8');
}

/** The whole records directory for the four-state corpus, in one throwaway dir. */
function recordsDir() {
  const dir = mkdtempSync(join(tmpdir(), 'atai-reviews-'));
  mkdirSync(dir, { recursive: true });
  writeRecord(dir, 'seed-wiki-concept-recorded.md', {
    cite: 'recorded', date: '2026-08-28', job: 'j-20260828-01',
    reviewed: { [fileOf('recorded')]: hashOf('recorded') },
  });
  writeRecord(dir, 'seed-wiki-concept-mismatched.md', {
    cite: 'mismatched', date: '2026-08-28', job: 'j-20260828-02',
    reviewed: { [fileOf('mismatched')]: NOT_THE_HASH },
  });
  writeRecord(dir, 'seed-wiki-concept-unbound.md', {
    cite: 'unbound', date: '2026-08-28', job: 'j-20260828-03',
  });
  // No record at all for `missing`.
  writeRecord(dir, 'seed-wiki-concept-other-path.md', {
    cite: 'other path', date: '2026-08-28', job: 'j-20260828-04',
    reviewed: { 'content/wiki/concept/somewhere-else.md': hashOf('other-path') },
  });
  // Two records on one piece, orderable: the older carries a stale hash, the
  // re-review carries the current one.
  writeRecord(dir, 'seed-wiki-concept-superseded.md', {
    cite: 'the first review', date: '2026-08-20', job: 'j-20260820-01',
    reviewed: { [fileOf('superseded')]: NOT_THE_HASH },
  });
  writeRecord(dir, 're-review-of-superseded.md', {
    cite: 'the re-review', date: '2026-08-29', job: 'j-20260829-03',
    subject: fileOf('superseded'),
    reviewed: { [fileOf('superseded')]: hashOf('superseded') },
  });
  // Two records on one piece, neither carrying anything to order by.
  writeRecord(dir, 'unorderable-a.md', { cite: 'a', subject: fileOf('unorderable') });
  writeRecord(dir, 'unorderable-b.md', { cite: 'b', subject: fileOf('unorderable') });
  return dir;
}

async function join4() {
  const corpus = await loadCorpus({ contentRoot: CORPUS });
  assert.equal(corpus.diags.errors.length, 0, 'the fixture corpus must load clean');
  return { corpus, join: reviewJoin(corpus, { reviewsDir: recordsDir() }) };
}

test('zlq the join classifies every piece into exactly one of four states', async () => {
  const { join: j } = await join4();
  const report = reviewStateReport(j);
  const state = (slug) => j.states.get(fileOf(slug));

  assert.equal(state('recorded'), 'recorded');
  assert.equal(state('mismatched'), 'mismatched');
  assert.equal(state('unbound'), 'unbound');
  assert.equal(state('missing'), 'missing');
  // The re-review binds and carries the current hash, so the piece is recorded.
  assert.equal(state('superseded'), 'recorded');
  // Neither of the unorderable pair binds, so the piece has no record at all.
  assert.equal(state('unorderable'), 'missing');

  // Every piece is in exactly one bucket and the buckets add up.
  const total = report.counts.recorded + report.counts.mismatched + report.counts.unbound + report.counts.missing;
  assert.equal(total, j.pieces.length);
  assert.equal(report.total, j.pieces.length);
});

test('zlq a record hashing a DIFFERENT path is unbound for this piece, never mismatched', async () => {
  const { join: j } = await join4();
  // It carries a hash — just not one about these bytes. Reading that as a
  // mismatch would invent a finding out of a record that said nothing.
  // The contrast is the point: an identical record that hashes THIS path is
  // `recorded`, so the state below is about the path, not about hashing at all.
  assert.equal(j.states.get(fileOf('recorded')), 'recorded');
  assert.equal(j.states.get(fileOf('other-path')), 'unbound');
  const rec = j.byFile.get(fileOf('other-path')).record;
  assert.deepEqual(Object.keys(reviewedOf(rec)), ['content/wiki/concept/somewhere-else.md']);
});

test('zlq mismatched is never collapsed into missing, and only mismatched fails', async () => {
  const { join: j } = await join4();
  const report = reviewStateReport(j);

  const missingFiles = report.missing.map((m) => m.file);
  assert.ok(!missingFiles.includes(fileOf('mismatched')), 'mismatched is not reported as missing');
  assert.ok(missingFiles.includes(fileOf('missing')));

  const problems = mismatchProblems(report);
  assert.equal(problems.length, 1, 'exactly the mismatched piece fails');
  assert.match(problems[0], /mismatched\.md/);
  assert.match(problems[0], /seed-wiki-concept-mismatched\.md/);
  assert.match(problems[0], /REVIEWED THEN CHANGED/);
  // The unbound pieces are counted and fail nothing — every seed record is one.
  assert.ok(report.counts.unbound >= 2, `unbound counted: ${report.counts.unbound}`);
  assert.ok(!problems.join('\n').includes('unbound.md'));
  assert.ok(!problems.join('\n').includes('other-path.md'));
});

test('zlq (1.7) a mismatch does not move a page: the verdict alone decides indexability', async () => {
  const { corpus, join: j } = await join4();
  const gate = entryReviewGate(corpus, j);
  const doc = corpus.entry.find((d) => d.data.id === 'concept/mismatched');
  const clean = corpus.entry.find((d) => d.data.id === 'concept/recorded');

  assert.equal(j.states.get(doc.file), 'mismatched', 'the fixture really is mismatched');
  assert.equal(gate.hasApprovedReview('concept/mismatched'), true);
  assert.ok(gate.approved.has('concept/mismatched'));
  assert.deepEqual(gate.unapproved, []);
  // Byte-identical to the piece whose record binds cleanly.
  const opts = { hasApprovedReview: gate.hasApprovedReview };
  assert.equal(robotsFor(doc, opts), robotsFor(clean, opts));
  assert.equal(robotsFor(doc, opts), 'index,follow');
});

test('zlq (1.8a) the most recent of two records binds; the older is not an orphan', async () => {
  const { join: j } = await join4();
  const hit = j.byFile.get(fileOf('superseded'));
  assert.equal(hit.record.name, 're-review-of-superseded.md', 'the newer record binds');
  assert.ok(!j.orphans.includes('seed-wiki-concept-superseded.md'), 'superseded is not an orphan');
  assert.ok(
    !j.contended.some((c) => c.includes('seed-wiki-concept-superseded.md')),
    'superseded is not a contention either — it is the expected residue of a re-review',
  );
  // A SET of files, not one file: supersession is per piece, so a record that
  // reviewed several pieces can lose some and keep the rest. Keyed by record
  // name alone, one re-review disowned every other page the same record had
  // approved — measured 2026-09-04 on `content/wiki/org/inception-labs.md`.
  assert.deepEqual(
    j.superseded.get('seed-wiki-concept-superseded.md'),
    new Set([fileOf('superseded')]),
  );
});

test('zlq (1.8b) with no date, the job id orders the pair', () => {
  const older = { data: { job: 'j-20260828-01' } };
  const newer = { data: { job: 'j-20260829-01' } };
  const sameDay = { data: { job: 'j-20260829-07' } };
  assert.deepEqual(recencyOf(older), { day: '20260828', seq: 1 });
  assert.ok(recencyOf(newer).day > recencyOf(older).day);
  assert.ok(recencyOf(sameDay).seq > recencyOf(newer).seq);
  // A date, when present, is what the day comes from — not the job id.
  assert.equal(recencyOf({ data: { date: '2026-09-01', job: 'j-20260101-01' } }).day, '20260901');
  assert.equal(recencyOf({ data: {} }), null);
});

test('zlq (1.8c) an unorderable pair is reported and neither binds', async () => {
  const { join: j } = await join4();
  assert.equal(j.byFile.has(fileOf('unorderable')), false);
  const c = j.contended.find((x) => x.includes('unorderable.md'));
  assert.ok(c, `the contention is reported: ${j.contended.join(' | ')}`);
  assert.match(c, /unorderable-a\.md/);
  assert.match(c, /unorderable-b\.md/);
  assert.match(c, /binds neither/);
  // Reported once, as a contention — not a second time as two orphans.
  assert.ok(!j.orphans.includes('unorderable-a.md'));
  assert.ok(!j.orphans.includes('unorderable-b.md'));
});

test('zlq (1.8d) the join reads no filesystem timestamp', () => {
  // A join that varied per clone and per checkout is the defect design D4
  // refuses; a comment saying so is not a mechanism, this is.
  const src = readFileSync(fileURLToPath(new URL('./reviews.mjs', import.meta.url)), 'utf8')
    // Comments are stripped first: the module's own header ARGUES against
    // reading mtime, and an assertion that tripped on the argument would be
    // measuring prose rather than code.
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1 ');
  for (const forbidden of ['mtime', 'statSync', 'statfs', 'birthtime', 'utimes']) {
    assert.ok(!src.includes(forbidden), `lib/reviews.mjs must not read ${forbidden}`);
  }
});

test('u0n5 ONE record naming several pieces binds ALL of them, not just the first', async () => {
  // A job that merges several files writes ONE record naming all of them —
  // `subject:` is a list for exactly that reason (addictedtoai-sge). The join
  // used to bind such a record to the first piece it matched and treat it as
  // spent, so every other file the job touched reported `missing`, i.e.
  // unreviewed, though it had been reviewed and approved in that same record.
  //
  // Measured 2026-09-02: job j-20260902-01 repaired three Anthropic "(Fast)"
  // pages in one batch and verify-launch failed with `missing 1`. The more
  // work a job batches, the more of its own output the join disowns.
  const dir = mkdtempSync(join(tmpdir(), 'atai-reviews-multi-'));
  writeRecord(dir, 'j-20260902-01.md', {
    cite: 'one review, three pages',
    date: '2026-09-02',
    job: 'j-20260902-01',
    subject: [fileOf('recorded'), fileOf('unbound'), fileOf('missing')],
  });

  const corpus = await loadCorpus({ contentRoot: CORPUS });
  const j = reviewJoin(corpus, { reviewsDir: dir });

  for (const slug of ['recorded', 'unbound', 'missing']) {
    const hit = j.byFile.get(fileOf(slug));
    assert.ok(hit, `${slug} must bind to the one record that names it`);
    assert.equal(hit.record.name, 'j-20260902-01.md');
    assert.notEqual(j.states.get(fileOf(slug)), 'missing');
  }
  // And the record is not an orphan, having been used.
  assert.ok(!j.orphans.includes('j-20260902-01.md'));
});

test('u0n5 a declared subject still loses to a newer record for that same piece', async () => {
  // Multi-binding must not weaken supersession: if a later record reviews one
  // of the pages, that page binds the newer one and the batch record keeps the
  // rest. Otherwise a re-review could never clear a mismatch on a batched page.
  const dir = mkdtempSync(join(tmpdir(), 'atai-reviews-multi2-'));
  writeRecord(dir, 'j-20260902-01.md', {
    cite: 'the batch', date: '2026-09-02', job: 'j-20260902-01',
    subject: [fileOf('recorded'), fileOf('unbound')],
  });
  writeRecord(dir, 'j-20260902-05.md', {
    cite: 'the re-review', date: '2026-09-03', job: 'j-20260902-05',
    subject: [fileOf('unbound')],
  });

  const corpus = await loadCorpus({ contentRoot: CORPUS });
  const j = reviewJoin(corpus, { reviewsDir: dir });

  assert.equal(j.byFile.get(fileOf('unbound')).record.name, 'j-20260902-05.md');
  assert.equal(j.byFile.get(fileOf('recorded')).record.name, 'j-20260902-01.md');
});

test('zlq a record with no `reviewed:` key reads as unbound, and nothing fails', async () => {
  const { join: j } = await join4();
  const hit = j.byFile.get(fileOf('unbound'));
  assert.ok(hit, 'the record still joins by name, exactly as before');
  assert.equal(hit.state, 'unbound');
  assert.equal(hit.recordedHash, null);
  assert.deepEqual(reviewedOf(hit.record), {});
});

test('a record superseded on ONE of its pieces still binds the others', async () => {
  // THE DEFECT, measured 2026-09-04. `superseded` was keyed by record name
  // alone, so the moment any single piece a record covered was re-reviewed,
  // that record was barred from binding EVERY other piece it had approved.
  //
  // On the real corpus: `j-20260903-10.md` reviewed and approved two pages in
  // one job; a repair re-reviewed only the model page; and
  // `content/wiki/org/inception-labs.md` then reported `missing` — never
  // reviewed — though that record named it in `subject:`, carried its hash in
  // `reviewed:`, and the hash still matched the file byte for byte.
  // verify-launch failed at 163/164.
  //
  // It is the same shape as the u0n5 defect above, one layer along: the more
  // pieces one record covers, the more of them the join can disown.
  const dir = mkdtempSync(join(tmpdir(), 'atai-reviews-partial-supersede-'));

  // One record reviews two pieces and approves both.
  writeRecord(dir, 'j-20260903-10.md', {
    cite: 'one review, two pages',
    date: '2026-09-03',
    job: 'j-20260903-10',
    subject: [fileOf('recorded'), fileOf('unbound')],
    reviewed: {
      [fileOf('recorded')]: hashOf('recorded'),
      [fileOf('unbound')]: hashOf('unbound'),
    },
  });
  // A later job re-reviews ONE of them, and only that one.
  writeRecord(dir, 'j-20260904-18.md', {
    cite: 'the re-review of one page',
    date: '2026-09-04',
    job: 'j-20260904-18',
    subject: fileOf('recorded'),
    reviewed: { [fileOf('recorded')]: hashOf('recorded') },
  });

  const corpus = await loadCorpus({ contentRoot: CORPUS });
  const j = reviewJoin(corpus, { reviewsDir: dir });

  // The re-reviewed piece takes the newer record — supersession still works.
  assert.equal(j.byFile.get(fileOf('recorded'))?.record?.name, 'j-20260904-18.md');

  // THE ASSERTION THIS TEST EXISTS FOR: the other piece keeps the only review
  // it has ever had, rather than being disowned by a re-review of its sibling.
  const other = j.byFile.get(fileOf('unbound'));
  assert.ok(other, 'the untouched piece must still bind the record that reviewed it');
  assert.equal(other.record.name, 'j-20260903-10.md');
  assert.notEqual(
    j.states.get(fileOf('unbound')),
    'missing',
    'a piece reviewed and approved must never report as unreviewed',
  );

  // Supersession is recorded against the piece it actually lost, and no other.
  assert.deepEqual(j.superseded.get('j-20260903-10.md'), new Set([fileOf('recorded')]));
});
