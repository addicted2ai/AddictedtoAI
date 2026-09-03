/**
 * records-commit.test.mjs — a run whose records did not commit says so.
 *
 * THE DEFECT (beads addictedtoai-tqpq), measured twice on 2026-09-03.
 * `j-20260903-02` and `j-20260903-05` both merged and pushed, and neither has a
 * `job <id>: records (done)` commit anywhere in the history. Their carried
 * findings sat untracked in `data/carried/`. Nothing said a word.
 *
 * The cause was four inlined lines that threw away every git return value:
 * `gitTry` reports `{ok, status, stdout, stderr}` and the call site read none
 * of it. A failed `git add` — a concurrent Pulse holding `.git/index.lock` is
 * the obvious way, and the two engines share one checkout on this machine —
 * left the staged-paths check empty, which is byte-identical to "there was
 * nothing new to commit". Two very different outcomes, one silent branch.
 *
 * What travels through that path is not incidental: the ledger line the budget
 * is computed from, the verdict record the review gate is audited by, and both
 * halves of a consumed-proposal move, whose own comment in `run.mjs` says the
 * addition and the deletion must never be split.
 *
 * THESE TESTS HOLD THE LOCK FOR REAL. `.git/index.lock` is created on disk and
 * git refuses the `add` by itself — no stubbed git, no simulated failure. That
 * is the difference between measuring the guardrail and describing it.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, existsSync, rmSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

import { commitJobRecords } from '../run.mjs';
import { makeRepo, git } from './helpers.mjs';

/** Write a record file the way the loop does, and return its repo-relative path. */
function record(ctx, rel, text = 'a record\n') {
  const abs = join(ctx.repoRoot, rel);
  mkdirSync(join(abs, '..'), { recursive: true });
  writeFileSync(abs, text, 'utf8');
  return rel;
}

const lockPath = (ctx) => join(ctx.repoRoot, '.git', 'index.lock');

test('the happy path commits by exact path and names what it committed', () => {
  const ctx = makeRepo();
  const staged = [record(ctx, 'data/ledger.jsonl', '{"id":"j-1"}\n'), record(ctx, 'data/carried/j-1-carry-1.md')];

  const r = commitJobRecords(ctx, { staged, jobId: 'j-1', outcome: 'done' });

  assert.equal(r.committed, true, ctx.output());
  assert.deepEqual(r.paths.sort(), ['data/carried/j-1-carry-1.md', 'data/ledger.jsonl']);
  assert.match(ctx.output(), /committed the job's records/);
  assert.equal(git(ctx.repoRoot, ['status', '--porcelain']).trim(), '', 'and the tree is clean afterwards');
  assert.match(git(ctx.repoRoot, ['log', '-1', '--format=%s']), /job j-1: records \(done\)/);
  ctx.cleanup();
});

test('A HELD INDEX LOCK IS REPORTED, LOUDLY, AND NAMES THE PATHS IT COULD NOT STAGE', () => {
  // The reproduction. Nothing is stubbed: the lock file exists, so real git
  // refuses the real `add`.
  const ctx = makeRepo();
  const staged = [record(ctx, 'data/ledger.jsonl', '{"id":"j-2"}\n'), record(ctx, 'data/carried/j-2-carry-1.md')];
  writeFileSync(lockPath(ctx), '', 'utf8');

  const r = commitJobRecords(ctx, { staged, jobId: 'j-2', outcome: 'done' });

  assert.equal(r.committed, false);
  assert.match(r.why, /git add failed/);
  const out = ctx.output();
  assert.match(out, /RECORDS NOT COMMITTED/, 'the run must say the records did not commit');
  assert.match(out, /index\.lock/, 'and carry git\'s own explanation');
  assert.match(out, /data\/carried\/j-2-carry-1\.md/, 'and name every path it could not stage');
  assert.match(out, /data\/ledger\.jsonl/);
  assert.match(out, /addictedtoai-tqpq/, 'and point at the finding, so the next reader is not starting over');

  // The files are still there. The failure loses the COMMIT, never the work.
  assert.ok(existsSync(join(ctx.repoRoot, 'data/carried/j-2-carry-1.md')));
  rmSync(lockPath(ctx));
  ctx.cleanup();
});

test('THE CONTROL: an ordinary no-op reports differently than a staging failure does', () => {
  // The whole defect was that these two were the same silent branch. If this
  // test and the one above ever produce the same log line, the fix is gone.
  const ctx = makeRepo();
  const staged = [record(ctx, 'data/ledger.jsonl', '{"id":"j-3"}\n')];
  git(ctx.repoRoot, ['add', '--', 'data/ledger.jsonl']);
  git(ctx.repoRoot, ['commit', '--no-verify', '-m', 'someone else committed it first']);

  const r = commitJobRecords(ctx, { staged, jobId: 'j-3', outcome: 'done' });

  assert.equal(r.committed, false, 'it committed nothing — correctly, there was nothing to commit');
  assert.match(r.why, /already committed/);
  const out = ctx.output();
  assert.match(out, /already committed; nothing new to record/);
  assert.doesNotMatch(out, /RECORDS NOT COMMITTED/, 'an ordinary no-op must NOT read as a failure');
  ctx.cleanup();
});

test('an empty path list says so rather than passing `git add --` no arguments', () => {
  const ctx = makeRepo();
  const r = commitJobRecords(ctx, { staged: [], jobId: 'j-4', outcome: 'failed' });
  assert.equal(r.committed, false);
  assert.match(ctx.output(), /no record path existed to stage/);
  assert.doesNotMatch(ctx.output(), /RECORDS NOT COMMITTED/);
  ctx.cleanup();
});

// ---------------------------------------------------------------------------
// The unmatched pathspec, which is what actually caused every instance.
// ---------------------------------------------------------------------------

test('ONE ALREADY-COMMITTED MOVE DOES NOT DISCARD THE REST OF THE RECORDS', () => {
  // THE REPRODUCTION, measured on j-20260903-06. `sweptPaths`/`consumedPaths`
  // name the SOURCE of a move, which no longer exists on disk. That is
  // deliberate — it is how a deletion travels with its addition — but it only
  // works while git still knows the path. With publishing on, the publish step
  // runs first and stages `data/` wholesale, so it routinely commits the move
  // before this function sees it. `git add` then reports "did not match any
  // files", exits 128, AND TAKES EVERY OTHER PATH DOWN WITH IT: one odd path
  // cost the ledger line, the verdict record, the derived tree, a noted
  // proposal and two carried findings.
  const ctx = makeRepo({ files: { 'data/proposals/dated.md': '---\nslug: dated\n---\n\nbody\n' } });
  // Someone else commits the move first, exactly as the publish step does.
  rmSync(join(ctx.repoRoot, 'data/proposals/dated.md'));
  record(ctx, 'data/proposals/consumed/dated.consumed-1.md');
  git(ctx.repoRoot, ['add', '-A']);
  git(ctx.repoRoot, ['commit', '--no-verify', '-m', 'publish: staged data/ wholesale']);

  // Now the run tries to record its own work, still naming the moved source.
  const staged = [
    record(ctx, 'data/ledger.jsonl', '{"id":"j-6"}\n'),
    record(ctx, 'data/carried/j-6-carry-1.md'),
    'data/proposals/dated.md',
  ];

  const r = commitJobRecords(ctx, { staged, jobId: 'j-6', outcome: 'done' });

  // THE OUTCOME ONLY, deliberately. Two independent nets produce it — the
  // pre-filter that drops the path up front, and the per-path retry that
  // survives a batch `add` failing — and this asserts the invariant they exist
  // for rather than which one delivered it. Disabling either alone leaves this
  // green, which is what having two means; the message each one prints is
  // pinned by its own test below.
  assert.equal(r.committed, true, `the survivable paths must still commit:\n${ctx.output()}`);
  assert.ok(r.paths.includes('data/ledger.jsonl'), 'the ledger line the budget is computed from');
  assert.ok(r.paths.includes('data/carried/j-6-carry-1.md'), 'and the carried finding');
  assert.equal(git(ctx.repoRoot, ['status', '--porcelain']).trim(), '', 'nothing is left stranded');
  ctx.cleanup();
});

test('the already-committed move is dropped UP FRONT, so an ordinary publishing run stays on the fast path', () => {
  // The pre-filter's own test. Without it every publishing run would fail its
  // batch `add`, fall back to staging one path at a time, and log a
  // could-not-stage line for a completely ordinary condition — and routine
  // noise is how a real failure goes unread.
  const ctx = makeRepo({ files: { 'data/proposals/dated.md': '---\nslug: dated\n---\n\nbody\n' } });
  rmSync(join(ctx.repoRoot, 'data/proposals/dated.md'));
  record(ctx, 'data/proposals/consumed/dated.consumed-1.md');
  git(ctx.repoRoot, ['add', '-A']);
  git(ctx.repoRoot, ['commit', '--no-verify', '-m', 'publish: staged data/ wholesale']);

  const staged = [record(ctx, 'data/ledger.jsonl', '{"id":"j-6b"}\n'), 'data/proposals/dated.md'];
  const r = commitJobRecords(ctx, { staged, jobId: 'j-6b', outcome: 'done' });

  assert.equal(r.committed, true, ctx.output());
  assert.match(ctx.output(), /already committed elsewhere/, 'it must say why the path was dropped');
  assert.match(ctx.output(), /data\/proposals\/dated\.md/, 'and name it');
  assert.doesNotMatch(
    ctx.output(),
    /individually after the batch add failed/,
    'and it must never have reached the retry — the batch add has to succeed on the fast path',
  );
  assert.doesNotMatch(ctx.output(), /could not stage/, 'an ordinary condition must not print a failure line');
  ctx.cleanup();
});

test('the PER-PATH RETRY is what saves the rest when one path git refuses is not a moved source', () => {
  // The retry's own test, and it needed writing: a two-factor mutation showed
  // that disabling the retry alone failed NOTHING, because every other test
  // here is satisfied by the pre-filter or by the total-failure branch. A net
  // no test can distinguish is a net that can be deleted by accident.
  //
  // The case is real rather than contrived. `.gitignore` in this repository
  // carries `/HOLD.md` and `/STOP` (beads addictedtoai-ufu), and the fixture
  // copies those rules deliberately. A staged path git REFUSES — as opposed to
  // one it has never heard of — is invisible to the pre-filter, because the
  // file is right there on disk. It still fails the batch `add` and would
  // still take every record with it.
  const ctx = makeRepo();
  writeFileSync(join(ctx.repoRoot, 'HOLD.md'), 'a halt\n', 'utf8');
  const staged = [record(ctx, 'data/ledger.jsonl', '{"id":"j-8"}\n'), 'HOLD.md'];

  const r = commitJobRecords(ctx, { staged, jobId: 'j-8', outcome: 'done' });

  assert.equal(r.committed, true, `the ledger line must survive a path git refuses:\n${ctx.output()}`);
  assert.deepEqual(r.paths, ['data/ledger.jsonl']);
  assert.match(ctx.output(), /could not stage HOLD\.md/, 'and the refused path is named');
  assert.match(ctx.output(), /staged 1 of 2 path\(s\) individually/, 'and the retry says it happened');
  ctx.cleanup();
});

test('THE CONTROL: a move whose source is still TRACKED is kept, so the deletion travels with the addition', () => {
  // The pre-filter must not throw away the case the mechanism exists for. A
  // path absent from disk but present in the index is a staged deletion, and
  // dropping it would leave the proposal existing in two places in the
  // history — the split `run.mjs` says must never happen.
  const ctx = makeRepo({ files: { 'data/proposals/dated.md': '---\nslug: dated\n---\n\nbody\n' } });
  rmSync(join(ctx.repoRoot, 'data/proposals/dated.md'));
  const staged = ['data/proposals/dated.md', record(ctx, 'data/proposals/consumed/dated.consumed-1.md')];

  const r = commitJobRecords(ctx, { staged, jobId: 'j-7', outcome: 'done' });

  assert.equal(r.committed, true, ctx.output());
  assert.ok(r.paths.includes('data/proposals/dated.md'), 'the deletion must be in the commit');
  assert.ok(r.paths.includes('data/proposals/consumed/dated.consumed-1.md'), 'together with the addition');
  assert.doesNotMatch(ctx.output(), /already committed elsewhere/, 'and it must NOT be dropped');
  const show = git(ctx.repoRoot, ['show', '--name-status', '--format=', 'HEAD']);
  assert.match(show, /^D\s+data\/proposals\/dated\.md$/m, `the commit records the deletion:\n${show}`);
  ctx.cleanup();
});

test('both halves of a proposal move are named when the lock blocks them — the split this prevents', () => {
  // `run.mjs` stages the removal AND the addition of a consumed proposal
  // together, because "the history never shows one proposal existing in two
  // places". A silent `add` failure is how that invariant breaks, so the
  // report has to name both halves.
  const ctx = makeRepo({ files: { 'data/proposals/dated.md': '---\nslug: dated\n---\n\nbody\n' } });
  rmSync(join(ctx.repoRoot, 'data/proposals/dated.md'));
  const staged = ['data/proposals/dated.md', record(ctx, 'data/proposals/consumed/dated.consumed-1.md')];
  writeFileSync(lockPath(ctx), '', 'utf8');

  const r = commitJobRecords(ctx, { staged, jobId: 'j-5', outcome: 'done' });

  assert.equal(r.committed, false);
  assert.match(ctx.output(), /data\/proposals\/dated\.md/, 'the removal');
  assert.match(ctx.output(), /dated\.consumed-1\.md/, 'and the addition');
  rmSync(lockPath(ctx));
  ctx.cleanup();
});
