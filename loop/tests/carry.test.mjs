/**
 * carry.test.mjs — beads addictedtoai-2bo: a reviewer's non-blocking finding
 * gets a route into work.
 *
 * Three things are tested, each by attempting what the mechanism forbids or
 * promises and measuring the result — the same standard specs/review holds a
 * machinery reviewer to:
 *
 *  1. `parseCarry` / `parseVerdict` read `carry:` correctly, and reject a
 *     malformed entry rather than guessing what it meant.
 *  2. `transcribeCarriedFindings` writes one durable file per valid entry,
 *     named for the reviewing job, and never touches the merge gate's own
 *     refusals.
 *  3. An empty or absent `carry:` is legal and produces nothing — the normal
 *     case, not a warning.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';

import { parseCarry, parseVerdict } from '../lib/verdict.mjs';
import { mergeGate, verdictPath } from '../lib/review.mjs';
import { transcribeCarriedFindings } from '../lib/carry.mjs';
import { makeRepo, HERE, runnersYaml, git } from './helpers.mjs';
import { runLoop } from '../run.mjs';

const NOW = new Date('2026-08-31T12:00:00.000Z');
const PMOCK = join(HERE, 'mock-proposal-executor.mjs').replace(/\\/g, '/');
const pmock = (mode) => `node "${PMOCK}" ${mode} "{prompt_file}"`;

// ---------------------------------------------------------------------------
// parseCarry — the pure parser
// ---------------------------------------------------------------------------

test('parseCarry: absent or empty carry: is legal and produces nothing, not a warning', () => {
  assert.deepEqual(parseCarry({}), { carry: [], carryWarnings: [] });
  assert.deepEqual(parseCarry({ carry: null }), { carry: [], carryWarnings: [] });
  assert.deepEqual(parseCarry({ carry: [] }), { carry: [], carryWarnings: [] });
});

test('parseCarry: a well-formed entry is read whole, with subject optional', () => {
  const { carry, carryWarnings } = parseCarry({
    carry: [
      { title: 'fix the date', detail: 'The interval is 29 days, not six weeks.', subject: 'content/wiki/model/x.md' },
      { title: 'fix the other thing', detail: 'No subject on this one.' },
    ],
  });
  assert.deepEqual(carryWarnings, []);
  assert.equal(carry.length, 2);
  assert.equal(carry[0].title, 'fix the date');
  assert.equal(carry[0].detail, 'The interval is 29 days, not six weeks.');
  assert.equal(carry[0].subject, 'content/wiki/model/x.md');
  assert.equal(carry[1].subject, '', 'subject defaults to empty, never undefined');
});

test('parseCarry: a single mapping (not a list) is accepted the same way a list of one would be', () => {
  const { carry } = parseCarry({ carry: { title: 't', detail: 'd' } });
  assert.equal(carry.length, 1);
  assert.equal(carry[0].title, 't');
});

test('parseCarry: a missing title is skipped and warned about, never falls back to detail', () => {
  const { carry, carryWarnings } = parseCarry({
    carry: [{ detail: 'A long finding with no title at all, which would make an awful job heading.' }],
  });
  assert.deepEqual(carry, []);
  assert.equal(carryWarnings.length, 1);
  assert.match(carryWarnings[0], /no non-empty `title`/);
  assert.doesNotMatch(carryWarnings[0], /awful job heading/, 'the warning names the problem, not the whole detail');
});

test('parseCarry: a missing detail is skipped and warned about', () => {
  const { carry, carryWarnings } = parseCarry({ carry: [{ title: 'only a title' }] });
  assert.deepEqual(carry, []);
  assert.match(carryWarnings[0], /"only a title"/);
  assert.match(carryWarnings[0], /no non-empty `detail`/);
});

test('parseCarry: one bad entry among good ones is skipped without discarding the rest', () => {
  const { carry, carryWarnings } = parseCarry({
    carry: [
      { title: 'good one', detail: 'fine' },
      { title: '', detail: 'no title here' },
      { title: 'also good', detail: 'also fine' },
    ],
  });
  assert.deepEqual(carry.map((c) => c.title), ['good one', 'also good']);
  assert.equal(carryWarnings.length, 1);
});

test('parseCarry: a non-mapping entry (a bare string) is skipped and warned about', () => {
  const { carry, carryWarnings } = parseCarry({ carry: ['just a string, not a mapping'] });
  assert.deepEqual(carry, []);
  assert.match(carryWarnings[0], /not a mapping/);
});

// ---------------------------------------------------------------------------
// parseVerdict — the whole record, front matter only (no plain-text fallback)
// ---------------------------------------------------------------------------

test('parseVerdict carries carry: and carryWarnings alongside the existing fields, unchanged', () => {
  const text =
    '---\nverdict: approve\nwould-cite: "someone"\ncarry:\n  - title: fix it\n    detail: the finding\n---\n\nnotes\n';
  const v = parseVerdict(text);
  assert.equal(v.verdict, 'approve');
  assert.equal(v.wouldCite, 'someone');
  assert.equal(v.carry.length, 1);
  assert.equal(v.carry[0].title, 'fix it');
  assert.deepEqual(v.carryWarnings, []);
});

test('parseVerdict: a record with no carry: key at all parses with an empty carry, same as before this field existed', () => {
  const v = parseVerdict('---\nverdict: approve\nwould-cite: "someone"\n---\n\nnotes\n');
  assert.deepEqual(v.carry, []);
  assert.deepEqual(v.carryWarnings, []);
});

test('parseVerdict: the plain-text fallback (no front matter) never invents a carry list', () => {
  // Same restriction as would-cite/reads-human's fallback, for the same reason:
  // there is no plain-text carry: syntax, so a runner too weak for YAML simply
  // carries nothing rather than something guessed from prose.
  const v = parseVerdict('Verdict: approve\nwould-cite: someone\ncarry: something\n');
  assert.equal(v.verdict, 'approve');
  assert.deepEqual(v.carry, []);
});

// ---------------------------------------------------------------------------
// mergeGate — carry: must never change the merge gate's existing refusals
// ---------------------------------------------------------------------------

function writeRecordAt(ctx, jobId, front, notes = 'reviewer notes\n') {
  mkdirSync(ctx.reviewsDir, { recursive: true });
  const p = verdictPath(ctx, jobId, 1);
  writeFileSync(p, `---\njob: ${jobId}\n${front}---\n\n${notes}`, 'utf8');
  return p;
}

test('a carry: block does not affect the merge gate, in either direction', () => {
  const ctx = makeRepo({ now: () => NOW });

  // An otherwise-valid approve, WITH a well-formed carry block, merges exactly
  // as it would without one.
  writeRecordAt(
    ctx,
    'j-carry-ok',
    'verdict: approve\nwould-cite: "someone arguing X"\ncarry:\n  - title: t\n    detail: d\n',
  );
  assert.equal(mergeGate(ctx, { jobId: 'j-carry-ok', type: 'machinery' }).ok, true);

  // A record that would be refused anyway (blank would-cite on a prose type)
  // is refused for the SAME reason, carry: present or not — the field cannot
  // rescue an otherwise-invalid record.
  writeRecordAt(ctx, 'j-carry-blank-cite', 'verdict: approve\nwould-cite: ""\ncarry:\n  - title: t\n    detail: d\n');
  const g = mergeGate(ctx, { jobId: 'j-carry-blank-cite', type: 'post' });
  assert.equal(g.ok, false);
  assert.equal(g.code, 'would-cite-empty');

  // A malformed carry entry (no title) does not itself cause a refusal —
  // `carry:` is purely additive; only would-cite/reads-human/reviewed: refuse.
  writeRecordAt(ctx, 'j-carry-malformed', 'verdict: approve\nwould-cite: "fine"\ncarry:\n  - detail: no title here\n');
  assert.equal(mergeGate(ctx, { jobId: 'j-carry-malformed', type: 'machinery' }).ok, true);

  ctx.cleanup();
});

// ---------------------------------------------------------------------------
// transcribeCarriedFindings — the merge-step transcription
// ---------------------------------------------------------------------------

function writeRecord(ctx, jobId, carryYaml) {
  mkdirSync(ctx.reviewsDir, { recursive: true });
  const p = verdictPath(ctx, jobId, 1);
  writeFileSync(
    p,
    `---\njob: ${jobId}\nverdict: approve\nwould-cite: "someone"\n${carryYaml}---\n\nreviewer notes\n`,
    'utf8',
  );
  return p;
}

test('a verdict with no carry: transcribes nothing, and says why', () => {
  const ctx = makeRepo({ now: () => NOW });
  const p = writeRecord(ctx, 'j-none', '');
  const r = transcribeCarriedFindings(ctx, { jobId: 'j-none', verdictPath: p });
  assert.deepEqual(r.transcribed, []);
  assert.match(r.why, /carries no findings/);
  assert.ok(!existsSync(ctx.carriedDir));
  ctx.cleanup();
});

test('two carry entries become two files, each named for the job and numbered, with real titles', () => {
  const ctx = makeRepo({ now: () => NOW });
  const p = writeRecord(
    ctx,
    'j-two',
    'carry:\n  - title: first fix\n    detail: the first finding, in full\n    subject: content/a.md\n' +
      '  - title: second fix\n    detail: the second finding, in full\n',
  );
  const r = transcribeCarriedFindings(ctx, { jobId: 'j-two', verdictPath: p, reviewer: 'r7-fable' });
  assert.equal(r.transcribed.length, 2);
  assert.deepEqual(r.transcribed.map((t) => t.title), ['first fix', 'second fix']);

  const files = readdirSync(ctx.carriedDir).sort();
  assert.deepEqual(files, ['j-two-carry-1.md', 'j-two-carry-2.md']);

  const one = matter(readFileSync(join(ctx.carriedDir, 'j-two-carry-1.md'), 'utf8'));
  assert.equal(one.data.title, 'first fix');
  assert.equal(one.data.subject, 'content/a.md');
  assert.equal(one.data.origin, 'review of job j-two');
  assert.match(String(one.data.carried_by), /r7-fable/);
  assert.match(one.content, /the first finding, in full/);
  assert.match(one.content, /Retiring this item/);
  assert.match(one.content, /delete this file/);

  const two = matter(readFileSync(join(ctx.carriedDir, 'j-two-carry-2.md'), 'utf8'));
  assert.equal(two.data.subject, undefined, 'no subject key at all when none was given, never an empty string key');
  ctx.cleanup();
});

test('a malformed entry inside an otherwise-valid carry: list is skipped and reported, the rest still transcribe', () => {
  const ctx = makeRepo({ now: () => NOW });
  const p = writeRecord(
    ctx,
    'j-mixed',
    'carry:\n  - title: good\n    detail: this one is fine\n  - detail: no title, dropped\n',
  );
  const r = transcribeCarriedFindings(ctx, { jobId: 'j-mixed', verdictPath: p });
  assert.equal(r.transcribed.length, 1);
  assert.equal(r.transcribed[0].title, 'good');
  assert.equal(r.warnings.length, 1);
  assert.match(r.warnings[0], /no non-empty `title`/);
  assert.deepEqual(readdirSync(ctx.carriedDir), ['j-mixed-carry-1.md']);
  ctx.cleanup();
});

test('transcribing twice does not overwrite an existing file — a retry does not clobber a finding already written', () => {
  const ctx = makeRepo({ now: () => NOW });
  const p = writeRecord(ctx, 'j-retry', 'carry:\n  - title: fix\n    detail: original text\n');
  transcribeCarriedFindings(ctx, { jobId: 'j-retry', verdictPath: p });
  writeFileSync(join(ctx.carriedDir, 'j-retry-carry-1.md'), 'hand-edited sentinel\n', 'utf8');

  const r = transcribeCarriedFindings(ctx, { jobId: 'j-retry', verdictPath: p });
  assert.equal(r.transcribed.length, 0);
  assert.equal(r.skipped.length, 1);
  assert.match(r.skipped[0].why, /already exists/);
  assert.equal(readFileSync(join(ctx.carriedDir, 'j-retry-carry-1.md'), 'utf8'), 'hand-edited sentinel\n');
  ctx.cleanup();
});

test('no verdict record at the given path transcribes nothing and says so, rather than throwing', () => {
  const ctx = makeRepo({ now: () => NOW });
  const r = transcribeCarriedFindings(ctx, { jobId: 'j-missing', verdictPath: verdictPath(ctx, 'j-missing', 1) });
  assert.deepEqual(r.transcribed, []);
  assert.equal(r.why, 'no verdict record');
  ctx.cleanup();
});

// ---------------------------------------------------------------------------
// The reviewer is actually told the field exists — otherwise it would never
// be used, which is the same failure this whole mechanism exists to end.
// ---------------------------------------------------------------------------

test('the reviewer brief documents carry: — syntax, and that it is distinct from a proposal', async () => {
  const { assembleReviewBrief } = await import('../lib/review.mjs');
  const ctx = makeRepo({ now: () => NOW });
  const brief = assembleReviewBrief(ctx, {
    jobId: 'j-brief',
    job: { type: 'machinery', source: 'queue', title: 'tighten a check' },
    diffText: '--- a/x\n+++ b/x\n+changed\n',
    pass: 1,
    findings: '',
    outPath: verdictPath(ctx, 'j-brief'),
  });
  assert.match(brief, /## If you noticed something you are not blocking on/);
  assert.match(brief, /carry:/);
  assert.match(brief, /never a job-sized idea/);
  assert.match(brief, /Carrying nothing is the normal case/);
  ctx.cleanup();
});

// ---------------------------------------------------------------------------
// End to end: a REAL loop run, a REAL executor process writing a REAL verdict
// record with a carry: block, merged by the REAL merge step — the same
// standard proposal-merge.test.mjs holds `transcribeNotedProposal` to. This is
// the one test in this file that exercises loop/run.mjs's own wiring, not
// `transcribeCarriedFindings` called directly.
// ---------------------------------------------------------------------------

test('a real run transcribes the reviewer-carried findings, drops the malformed one, and commits both', async () => {
  const { writeQueue } = await import('./helpers.mjs');
  const ctx = makeRepo({
    now: () => NOW,
    runners: runnersYaml({ command: pmock('plain-edit'), reviewerCommand: pmock('review-approve-carrying') }),
  });
  writeQueue(ctx, [{ type: 'repair', title: 'an ordinary repair, so the run reaches merge' }]);

  const res = await runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', noGates: true });
  assert.equal(res.outcome, 'done', ctx.output());

  const files = readdirSync(ctx.carriedDir);
  assert.deepEqual(files, [`${res.jobId}-carry-1.md`], 'only the well-formed entry — the untitled one was dropped');

  const rec = matter(readFileSync(join(ctx.carriedDir, files[0]), 'utf8'));
  assert.equal(rec.data.title, 'fix the date arithmetic');
  assert.equal(rec.data.subject, 'content/wiki/model/fixture.md');
  assert.equal(rec.data.origin, `review of job ${res.jobId}`);
  assert.match(rec.content, /29 days, not six weeks/);

  assert.match(ctx.output(), /carried finding transcribed to/);
  assert.match(ctx.output(), /no non-empty `title`/, 'the dropped entry is reported, not silently discarded');

  // Committed with the rest of the job's records, not left loose — the same
  // requirement the proposal path is held to.
  assert.equal(git(ctx.repoRoot, ['status', '--porcelain', '--', 'data/carried']).trim(), '', ctx.output());
  assert.match(git(ctx.repoRoot, ['log', '-1', '--name-only']), new RegExp(`data/carried/${res.jobId}-carry-1\\.md`));
  ctx.cleanup();
});
