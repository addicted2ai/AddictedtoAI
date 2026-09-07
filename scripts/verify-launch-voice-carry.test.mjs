/**
 * verify-launch-voice-carry.test.mjs — the launch check follows the
 * carry-forward (specs/review, beads addictedtoai-37rb; N4 and N7).
 *
 * WHY THIS FILE EXISTS SEPARATELY FROM THE MERGE GATE'S TESTS. The merge and
 * the launch check are two ends of one rule, and the failure this change was
 * filed against is the two ends disagreeing: a record the merge accepted read at
 * launch as a post nobody ever answered the voice question for. So the merge's
 * refusals are measured in `loop/tests/review-blog-bar.test.mjs` and the same
 * questions are asked again HERE, of the check that runs at launch, against
 * corpora built in the OS temp directory.
 *
 * Three states, and the difference between them is the whole requirement:
 *
 *   fresh       the current approving record carries its own `reads-human`
 *   carry       it carries a `reads-human-from` entry FOR THIS POST, resolved
 *               ONE hop to a record that approves this same piece and carries a
 *               `reads-human` of its own
 *   reach-back  it carries NEITHER field — the shape of every record written
 *               before the carry-forward existed, and one the merge now refuses
 *               to write — and an earlier approving record answered
 *
 * The last one is N7, and it is not a nicety: `data/reviews/j-20260902-23.md`
 * is the current approving record for `content/blog/glm-5-3-license-revenue-gate.md`
 * today, carries neither field, and is reached only that way.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadCorpus } from '../lib/corpus.mjs';
import { relPath, ROOT } from '../lib/paths.mjs';
import { readReviewRecords, reviewJoin } from '../lib/reviews.mjs';
import { needsReadsHuman } from '../loop/lib/review.mjs';
import { resolveVoiceAnswer } from './verify-launch.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));

/* ---------------------------------------------------------------------------
 * A throwaway corpus of blog posts and the records that judge them.
 * ------------------------------------------------------------------------ */

const BODY = (slug) =>
  `A note about ${slug}. It says what happened, who it lands on and where the ` +
  'primary evidence is, in enough running prose that the launch check counts it as a body ' +
  'rather than as a heading with a transclusion under it. Nothing here narrates its own ' +
  'method, and the last sentence is blunt on purpose.\n';

/**
 * One post file, and the key the join will know it by.
 *
 * `relPath` rather than a literal `content/blog/<slug>.md`: the corpus is built
 * in the OS temp directory, so a document's `file` is what `relPath` makes of
 * its absolute path from the repository root, and a record whose `subject:` said
 * anything else would simply not join — which is a fixture measuring its own
 * spelling instead of the rule. `title` and `date` are the whole schema
 * requirement for a post.
 */
function writePost(contentRoot, slug, date = '2026-09-01') {
  const dir = join(contentRoot, 'blog');
  mkdirSync(dir, { recursive: true });
  const abs = join(dir, `${slug}.md`);
  writeFileSync(
    abs,
    `---\ntitle: "A note about ${slug}"\ndate: "${date}"\n---\n\n${BODY(slug)}`,
    'utf8',
  );
  return relPath(abs);
}

/**
 * One verdict record, written the way a reviewer plus the merge step leave one:
 * the reviewer's fields, then `subject:`. No `reviewed:` — every record here is
 * `unbound`, which fails nothing and keeps these fixtures about the voice rule
 * alone.
 */
function writeRecord(reviewsDir, name, { verdict = 'approve', cite, subject, date, job, readsHuman, carry }) {
  const fm = ['---'];
  if (job) fm.push(`job: ${job}`);
  fm.push(`verdict: ${verdict}`, 'reasons: []', `would-cite: ${JSON.stringify(cite ?? name)}`);
  if (readsHuman) fm.push(`reads-human: ${JSON.stringify(readsHuman)}`);
  if (carry?.length) {
    fm.push('reads-human-from:');
    for (const e of carry) {
      fm.push(`  - subject: ${JSON.stringify(e.subject)}`);
      fm.push(`    record: ${JSON.stringify(e.record)}`);
      fm.push(`    why: ${JSON.stringify(e.why)}`);
    }
  }
  if (date) fm.push(`date: ${date}`);
  if (subject) {
    const list = Array.isArray(subject) ? subject : [subject];
    if (list.length === 1) fm.push(`subject: ${JSON.stringify(list[0])}`);
    else fm.push('subject:', ...list.map((s) => `  - ${JSON.stringify(s)}`));
  }
  fm.push('---', '', 'Fixture notes.', '');
  writeFileSync(join(reviewsDir, name), fm.join('\n'), 'utf8');
}

const WHY = 'Three licence sentences changed; the prose, its rhythm and its point of view did not.';

/**
 * The whole fixture: six posts, one per case the requirement distinguishes.
 * Built once and read by both the in-process resolver assertions and the real
 * `verify-launch` run below, so the two cannot be measuring different trees.
 */
function buildFixture() {
  const root = mkdtempSync(join(tmpdir(), 'atai-voice-carry-'));
  const contentRoot = join(root, 'content');
  const dataDir = join(root, 'data');
  const reviewsDir = join(dataDir, 'reviews');
  mkdirSync(reviewsDir, { recursive: true });

  const files = {
    carried: writePost(contentRoot, 'carried'),
    brokenAnchor: writePost(contentRoot, 'broken-anchor'),
    chainedAnchor: writePost(contentRoot, 'chained-anchor'),
    reachBack: writePost(contentRoot, 'reach-back'),
    neverAnswered: writePost(contentRoot, 'never-answered'),
    other: writePost(contentRoot, 'other-note'),
    twoA: writePost(contentRoot, 'two-a'),
    twoB: writePost(contentRoot, 'two-b'),
  };

  // 1. CARRIED — the current record answers only by carrying forward, and its
  //    anchor holds.
  writeRecord(reviewsDir, 'j-20260901-01.md', {
    job: 'j-20260901-01', date: '2026-09-01', cite: 'the original review of carried',
    subject: files.carried,
    readsHuman: 'Carried: the paragraphs are uneven and the closing line refuses to hedge.',
  });
  writeRecord(reviewsDir, 'j-20260903-01.md', {
    job: 'j-20260903-01', date: '2026-09-03', cite: 'the repair of carried',
    subject: files.carried,
    carry: [{ subject: files.carried, record: 'j-20260901-01.md', why: WHY }],
  });

  // 2. BROKEN ANCHOR — an entry naming a record that approves a DIFFERENT piece.
  writeRecord(reviewsDir, 'j-20260901-02.md', {
    job: 'j-20260901-02', date: '2026-09-01', cite: 'a review of some other post',
    subject: files.other,
    readsHuman: 'Some other note reads human, which says nothing about this one.',
  });
  writeRecord(reviewsDir, 'j-20260903-02.md', {
    job: 'j-20260903-02', date: '2026-09-03', cite: 'the repair of broken-anchor',
    subject: files.brokenAnchor,
    carry: [{ subject: files.brokenAnchor, record: 'j-20260901-02.md', why: `${WHY} (broken-anchor)` }],
  });

  // 3. CHAINED ANCHOR — the anchor's own answer is itself a carry-forward. One
  //    hop, never a chain: this is not an answering record here either, because
  //    a check that followed a chain would pass what the merge refuses.
  writeRecord(reviewsDir, 'j-20260901-03.md', {
    job: 'j-20260901-03', date: '2026-09-01', cite: 'the middle record of the chain',
    subject: files.chainedAnchor,
    carry: [{ subject: files.chainedAnchor, record: 'j-20260831-03.md', why: `${WHY} (the middle hop)` }],
  });
  writeRecord(reviewsDir, 'j-20260903-03.md', {
    job: 'j-20260903-03', date: '2026-09-03', cite: 'the repair of chained-anchor',
    subject: files.chainedAnchor,
    carry: [{ subject: files.chainedAnchor, record: 'j-20260901-03.md', why: `${WHY} (the second hop)` }],
  });

  // 4. REACH-BACK (N7) — the current record carries NEITHER field, which is the
  //    shape of every record written before the carry-forward existed, and an
  //    earlier approving record answered.
  writeRecord(reviewsDir, 'j-20260901-04.md', {
    job: 'j-20260901-04', date: '2026-09-01', cite: 'the post review of reach-back',
    subject: files.reachBack,
    readsHuman: 'Reach-back: it is short, blunt and unevenly paced; a person wrote it.',
  });
  writeRecord(reviewsDir, 'j-20260903-04.md', {
    job: 'j-20260903-04', date: '2026-09-03', cite: 'the repair of reach-back',
    subject: files.reachBack,
  });

  // 5. NEVER ANSWERED — the ONLY record naming it carries neither field, so the
  //    reach-back reaches nothing and the post is reported. (This is why
  //    `other-note` exists: the anchor `broken-anchor` names must approve some
  //    OTHER piece, and the first draft of this fixture pointed it at
  //    `never-answered` — which then had an answering record after all, and the
  //    case measured nothing. Found by running it.)
  writeRecord(reviewsDir, 'j-20260903-05.md', {
    job: 'j-20260903-05', date: '2026-09-03', cite: 'the only record of never-answered',
    subject: files.neverAnswered,
  });

  // 6. TWO POSTS, one job, an entry each — the other end of the merge gate's
  //    two-post fixture: each post resolves through ITS OWN entry.
  writeRecord(reviewsDir, 'j-20260901-06.md', {
    job: 'j-20260901-06', date: '2026-09-01', cite: 'the post review of two-a',
    subject: files.twoA,
    readsHuman: 'Two-A reads human: the second paragraph argues with the first.',
  });
  writeRecord(reviewsDir, 'j-20260901-07.md', {
    job: 'j-20260901-07', date: '2026-09-01', cite: 'the post review of two-b',
    subject: files.twoB,
    readsHuman: 'Two-B reads human: it is blunt about what the vendor did not say.',
  });
  writeRecord(reviewsDir, 'j-20260903-07.md', {
    job: 'j-20260903-07', date: '2026-09-03', cite: 'the one repair that landed on both notes',
    subject: [files.twoA, files.twoB],
    carry: [
      { subject: files.twoA, record: 'j-20260901-06.md', why: `${WHY} (two-a)` },
      { subject: files.twoB, record: 'j-20260901-07.md', why: `${WHY} (two-b)` },
    ],
  });

  return { root, contentRoot, dataDir, reviewsDir, files };
}

async function resolveFixture() {
  const fx = buildFixture();
  const corpus = await loadCorpus({ contentRoot: fx.contentRoot });
  assert.equal(corpus.diags.errors.length, 0, 'the fixture corpus must load clean');
  const records = readReviewRecords(fx.reviewsDir);
  const j = reviewJoin(corpus, { reviewsDir: fx.reviewsDir, records });
  const answerFor = (file) => {
    const hit = j.byFile.get(file);
    assert.ok(hit, `${file} must bind a record for this fixture to mean anything`);
    return {
      hit,
      answer: resolveVoiceAnswer({
        file,
        record: hit.record,
        declaredBy: hit.declaredBy ?? [],
        records,
      }),
    };
  };
  return { fx, corpus, records, join: j, answerFor };
}

/* ---------------------------------------------------------------------------
 * N4 — the check follows the carry-forward, resolved per post and one hop.
 * ------------------------------------------------------------------------ */

test('N4 a post whose current record carries only a valid carry-forward is answered', async () => {
  const { fx, answerFor } = await resolveFixture();
  const { hit, answer } = answerFor(fx.files.carried);
  assert.equal(hit.record.name, 'j-20260903-01.md', 'the repair is the current record');
  assert.equal(answer.how, 'carry');
  assert.equal(answer.record.name, 'j-20260901-01.md', 'and the answer is the record it names');
  assert.equal(answer.entry.subject, fx.files.carried);
});

test('N4 an anchor that approves a different piece answers nothing', async () => {
  const { fx, answerFor } = await resolveFixture();
  const { answer } = answerFor(fx.files.brokenAnchor);
  assert.equal(answer.how, 'unanswered');
  assert.equal(answer.record, null);
  // The entry is still reported, so the message can say which anchor failed.
  assert.equal(answer.entry.record, 'j-20260901-02.md');
});

test('N4 an anchor whose own answer is a carry-forward is not an answering record', async () => {
  // ONE HOP, by the same rule the merge applies. A check that walked the chain
  // would pass a hand-written record the merge refuses — the two ends drifting
  // apart, which is the defect this change exists to close.
  const { fx, answerFor } = await resolveFixture();
  const { answer } = answerFor(fx.files.chainedAnchor);
  assert.equal(answer.how, 'unanswered');
  assert.equal(answer.entry.record, 'j-20260901-03.md');
});

test('N4 each of two posts in one record resolves through ITS OWN entry', async () => {
  // The other end of the merge gate's two-post fixture. A per-RECORD resolver
  // passes the merge half of that fixture and fails this one: it would answer
  // both posts from whichever entry came first.
  const { fx, answerFor } = await resolveFixture();
  const a = answerFor(fx.files.twoA);
  const b = answerFor(fx.files.twoB);
  assert.equal(a.hit.record.name, 'j-20260903-07.md');
  assert.equal(b.hit.record.name, 'j-20260903-07.md', 'one record is current for both posts');
  assert.equal(a.answer.how, 'carry');
  assert.equal(b.answer.how, 'carry');
  assert.equal(a.answer.record.name, 'j-20260901-06.md');
  assert.equal(b.answer.record.name, 'j-20260901-07.md');
  assert.notEqual(a.answer.record.name, b.answer.record.name, 'and not both through one entry');
});

/* ---------------------------------------------------------------------------
 * N7 — the reach-back, bounded by the record itself and never by a date.
 * ------------------------------------------------------------------------ */

test('N7 a current record carrying neither field is answered by an earlier one', async () => {
  const { fx, answerFor } = await resolveFixture();
  const { hit, answer } = answerFor(fx.files.reachBack);
  assert.equal(hit.record.name, 'j-20260903-04.md', 'the repair is current and answers neither way');
  assert.equal(answer.how, 'reach-back');
  assert.equal(answer.record.name, 'j-20260901-04.md');
});

test('N7 the reach-back is a reach-back, not an unconditional pass', async () => {
  const { fx, answerFor } = await resolveFixture();
  const { answer } = answerFor(fx.files.neverAnswered);
  assert.equal(answer.how, 'unanswered');
  assert.equal(answer.record, null);
  assert.equal(answer.entry, null, 'and it failed for the absence of an answer, not a broken entry');
});

/* ---------------------------------------------------------------------------
 * The message, from the real check — the same shape for every unanswered post.
 * ------------------------------------------------------------------------ */

test('the launch check reports exactly the unanswered posts, in the bare-missing shape', () => {
  const fx = buildFixture();
  let stdout = '';
  try {
    stdout = execFileSync(
      process.execPath,
      [
        join(HERE, 'verify-launch.mjs'),
        '--no-build',
        '--content-root',
        fx.contentRoot,
        '--data-dir',
        fx.dataDir,
      ],
      { encoding: 'utf8', cwd: ROOT },
    );
  } catch (err) {
    // The fixture corpus fails almost every OTHER launch minimum — it holds
    // seven blog posts and nothing else — so a non-zero exit is expected and its
    // stdout is what this test reads.
    stdout = `${err.stdout ?? ''}`;
  }

  const problem = (file) =>
    stdout
      .split('\n')
      .find((l) => l.includes(file) && l.includes('no approving record carries a `reads-human`'));

  // The two that are answered — by a carry-forward and by the reach-back — are
  // not reported at all.
  for (const file of [fx.files.carried, fx.files.reachBack, fx.files.twoA, fx.files.twoB, fx.files.other]) {
    assert.equal(problem(file), undefined, `${file} is answered and must not be reported\n${stdout}`);
  }
  // The three that are not, are — in the same shape a bare missing `reads-human`
  // is reported in, which is the sentence this check has always used.
  for (const file of [fx.files.brokenAnchor, fx.files.chainedAnchor, fx.files.neverAnswered]) {
    assert.ok(problem(file), `${file} is unanswered and must be reported\n${stdout}`);
  }
  // And a broken anchor says which record it stood on, because "no record
  // answered" and "the record you named does not answer" are different things
  // for the reviewer that has to fix it.
  assert.match(stdout, /reads-human-from-unanchored/);
});

/* ---------------------------------------------------------------------------
 * The live corpus, as an INVARIANT and not as a named record.
 * ------------------------------------------------------------------------ */

test('N7 every post in the live corpus is answered — by its record, its entry or the reach-back', async () => {
  // Written as an invariant deliberately. Naming `data/reviews/j-20260902-23.md`
  // here would rot the moment the next repair lands on the glm post and
  // supersedes it, and a test that turns red for a reason unrelated to what it
  // measures is the failure `lib/surfaces.test.mjs:320` avoids by loading the
  // corpus and asserting over it. The date-stamped measurement of that record
  // belongs in the proposal, which is where it is.
  const corpus = await loadCorpus({});
  const records = readReviewRecords();
  const j = reviewJoin(corpus, { records });
  const posts = corpus.post.filter((d) => needsReadsHuman(d.type));
  assert.ok(posts.length > 0, 'the live corpus holds posts, or this measures nothing');

  for (const doc of posts) {
    const hit = j.byFile.get(doc.file);
    if (!hit || hit.record.verdict.verdict !== 'approve') continue;
    const answer = resolveVoiceAnswer({
      file: doc.file,
      record: hit.record,
      declaredBy: hit.declaredBy ?? [],
      records,
    });
    assert.ok(
      answer.record,
      `${relPath(doc.abs)}: no approving record answers the voice question — current record ` +
        `${hit.record.name}, others naming it ${(hit.declaredBy ?? []).map((r) => r.name).join(', ')}`,
    );
  }
});
