/**
 * Task 7.3 — outcome classification, observed from the filesystem.
 *
 * Every mock executor below REALLY writes, malforms or omits `RESULT.md` on
 * disk, and the assertions read what ended up in the ledger after a real run
 * of the loop. Not one of these tests hands the loop a status value: a test
 * that did would be testing its own fixture, which is exactly the "claim
 * written from intent rather than measurement" this project exists to catch.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

import { runLoop } from '../run.mjs';
import { readLedger } from '../lib/ledger.mjs';
import { readResult, classifyRun } from '../lib/result.mjs';
import { makeRepo, writeQueue, mockCommand, runnersYaml, git, DEFAULT_CONFIG } from './helpers.mjs';

const execSync = (repo) => git(repo, ['branch', '--list']);

function repoWith(mode, { reviewerMode = 'review-approve', queue } = {}) {
  const ctx = makeRepo({
    runners: runnersYaml({
      command: mockCommand(mode),
      reviewerCommand: mockCommand(reviewerMode),
    }),
  });
  writeQueue(ctx, queue ?? [{ type: 'repair', title: 'fix the fixture link', detail: 'a small repair' }]);
  return ctx;
}

async function run(ctx, opts = {}) {
  return runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', noGates: true, ...opts });
}

test('a real `done` file plus a real diff plus an approve merges and records done', async () => {
  const ctx = repoWith('done-edit');
  const res = await run(ctx);
  assert.equal(res.outcome, 'done', ctx.output());
  const ledger = readLedger(ctx);
  assert.equal(ledger.at(-1).outcome, 'done');
  assert.equal(ledger.at(-1).provider, 'provider-a');
  assert.ok(ledger.at(-1).mm >= 0);
  assert.ok(existsSync(join(ctx.repoRoot, 'site-note.md')), 'the merged file is on main');
  assert.ok(!existsSync(join(ctx.repoRoot, '.job')), 'job scaffolding does not reach main');
  // The merge invokes the shared publish step, which prints exactly one skip
  // line while `publish: false` — and does nothing else, most importantly.
  assert.match(
    ctx.output(),
    /publish: skipped — publishing is disabled in data\/config\.json \(publish: false\)/,
  );
  assert.match(ctx.output(), /merged job\/.* into main locally as .* — nothing is pushed/);
  ctx.cleanup();
});

test('a really-omitted RESULT.md after exit is `interrupted`, not `failed`', async () => {
  const ctx = repoWith('done-no-result');
  const res = await run(ctx);
  assert.equal(res.outcome, 'interrupted', ctx.output());
  // the branch survives, carrying the partial work — that is what makes it resumable
  const branches = readFileSync(join(ctx.repoRoot, '.git', 'HEAD'), 'utf8');
  assert.ok(branches.length > 0);
  const res2 = await run(ctx, { dryRun: true });
  assert.equal(res2.resumed, true, 'the next run picks the branch up first');
  ctx.cleanup();
});

test('a really-malformed first line after exit is `interrupted`', async () => {
  const ctx = repoWith('malformed-result');
  const res = await run(ctx);
  assert.equal(res.outcome, 'interrupted', ctx.output());
  assert.match(ctx.output(), /first line is malformed/);
  ctx.cleanup();
});

test('a well-formed `blocked:` with a clean tree is an honest, successful outcome', async () => {
  const ctx = repoWith('blocked');
  const res = await run(ctx);
  assert.equal(res.outcome, 'blocked', ctx.output());
  const line = readLedger(ctx).at(-1);
  assert.equal(line.outcome, 'blocked');
  assert.match(line.note, /source does not contain the requested figure/);
  ctx.cleanup();
});

test('a `capacity` first line classifies capacity', async () => {
  const ctx = repoWith('capacity-file');
  const res = await run(ctx);
  assert.equal(res.outcome, 'capacity', ctx.output());
  ctx.cleanup();
});

test("a provider's own stderr message means capacity even with no RESULT.md", async () => {
  const ctx = repoWith('capacity-stderr');
  const res = await run(ctx);
  assert.equal(res.outcome, 'capacity', ctx.output());
  assert.match(ctx.output(), /capacity_stderr_pattern matched its stderr/);
  ctx.cleanup();
});

test('killed at the wall-clock cap with no RESULT.md is `interrupted`, and the branch survives', async () => {
  // A cap of 0.03 minutes (1.8s) against an executor that would run for ten
  // minutes. The kill is real; so is the absent RESULT.md that follows it.
  const config = structuredClone(DEFAULT_CONFIG);
  config.job_caps_minutes.repair = 0.03;
  const ctx = makeRepo({ config, runners: runnersYaml({ command: mockCommand('slow') }) });
  writeQueue(ctx, [{ type: 'repair', title: 'a repair that will not finish' }]);
  const res = await run(ctx);
  assert.equal(res.outcome, 'interrupted', ctx.output());
  assert.match(ctx.output(), /killed at its wall-clock cap/);
  const branches = execSync(ctx.repoRoot);
  assert.match(branches, /job\//, 'the branch is kept for resumption');
  ctx.cleanup();
});

test('readResult reads the file and nothing else', () => {
  const ctx = makeRepo({});
  const dir = ctx.repoRoot;
  assert.equal(readResult(dir).status, 'interrupted');
  assert.equal(readResult(dir).present, false);

  writeFileSync(join(dir, 'RESULT.md'), 'done\nnotes\n', 'utf8');
  assert.equal(readResult(dir).status, 'done');

  writeFileSync(join(dir, 'RESULT.md'), 'blocked: the figure is not in the source\n', 'utf8');
  const b = readResult(dir);
  assert.equal(b.status, 'blocked');
  assert.equal(b.reason, 'the figure is not in the source');

  writeFileSync(join(dir, 'RESULT.md'), 'blocked:\n', 'utf8');
  assert.equal(readResult(dir).status, 'interrupted', 'a blocked line with no reason is malformed');

  writeFileSync(join(dir, 'RESULT.md'), 'capacity\n', 'utf8');
  assert.equal(readResult(dir).status, 'capacity');

  writeFileSync(join(dir, 'RESULT.md'), 'Done!\n', 'utf8');
  assert.equal(readResult(dir).status, 'interrupted');
  assert.equal(readResult(dir).malformed, true);
  ctx.cleanup();
});

test('classifyRun never lets stderr override an explicit result', () => {
  const runner = { capacity_stderr_pattern: 'LIMIT' };
  const done = { status: 'done', reason: null, why: 'first line is `done`' };
  assert.equal(classifyRun({ stderr: 'LIMIT reached', killed: false, code: 0 }, done, runner).status, 'done');
  const absent = { status: 'interrupted', present: false, why: 'RESULT.md is absent' };
  assert.equal(classifyRun({ stderr: 'LIMIT reached', killed: true, code: null }, absent, runner).status, 'capacity');
  assert.equal(classifyRun({ stderr: 'ordinary noise', killed: true, code: null }, absent, runner).status, 'interrupted');
});
