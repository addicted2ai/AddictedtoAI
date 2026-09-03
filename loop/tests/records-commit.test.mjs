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
