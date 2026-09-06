/**
 * A RESUMED JOB KEEPS THE TYPE IT WAS SELECTED AS (beads addictedtoai-bze3).
 *
 * `run.mjs` used to take a resumed job's type from its last LEDGER line and
 * hard-code `machinery` when there wasn't one. A branch interrupted before its
 * first ledger line — a worktree removal that fails, a machine that dies — is
 * exactly the case with no last line, so the fallback fired on the jobs least
 * able to argue with it.
 *
 * MEASURED, 2026-09-06: j-20260906-10 was selected from a `verify` directive,
 * died on an EPERM removing its worktree before writing a line, resumed, and
 * was recorded `machinery` for 7.67 model-minutes — against the tightest
 * ceiling in `data/config.json`, the only one currently binding. The type also
 * picks the per-type wall-clock cap and the shed level, so this was never only
 * accounting.
 *
 * The correct value was on the branch the whole time: selection writes
 * `.job/source.json` beside the brief, and the resume path already read that
 * file thirty lines further down for the proposal it came from.
 *
 * THE BRANCHES HERE ARE REAL BRANCHES with a real committed `.job/source.json`,
 * planted by `plantJobBranch`, because that file is what the fix reads. A
 * fixture that stubbed the read would pass whatever the ordering was.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { runLoop } from '../run.mjs';
import { readLedger } from '../lib/ledger.mjs';
import {
  makeRepo,
  writeLedger,
  ledgerLine,
  writeQueue,
  plantJobBranch,
  mockCommand,
  runnersYaml,
  daysAgo,
} from './helpers.mjs';

const NOW = new Date('2026-09-10T12:00:00.000Z');

/** A repository with new work available, so resumption has to win on its own. */
function repo(o = {}) {
  const ctx = makeRepo({
    now: () => NOW,
    runners: runnersYaml({
      command: mockCommand(o.mode ?? 'noop'),
      reviewerCommand: mockCommand('review-approve'),
    }),
  });
  writeQueue(ctx, [{ type: 'entry', title: 'brand-new work that must lose to a resumption' }]);
  return ctx;
}

/** The source record selection commits, in the shape `run.mjs` writes it. */
function sourceJson(id, type, extra = {}) {
  return (
    JSON.stringify({ job: id, type, source: 'directive', slug: null, path: null, issues: [], ...extra }, null, 2) +
    '\n'
  );
}

test('a branch with a committed source record and NO ledger line resumes as the type it was selected as', async (t) => {
  const ctx = repo();
  t.after(() => ctx.cleanup());
  plantJobBranch(ctx, 'j-20260910-01', {
    brief: '# Job j-20260910-01\n\nRe-verify the tutorial the directive names.\n',
    files: { '.job/source.json': sourceJson('j-20260910-01', 'verify') },
  });
  // No ledger at all: this is the state a job interrupted before its first line
  // is in, and it is the state the old `?? 'machinery'` fallback fired on.
  writeLedger(ctx, []);

  const res = await runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', dryRun: true, noGates: true });

  assert.equal(res.resumed, true, ctx.output());
  assert.equal(res.jobId, 'j-20260910-01');
  assert.equal(res.job.type, 'verify', `it was resumed as \`${res.job.type}\`\n${ctx.output()}`);
  assert.match(ctx.output(), /resumed job type: verify \(from \.job\/source\.json, committed at selection\)/);
});

test('the type it resumes as is the type the CAP and the LEDGER get, not just a log line', async (t) => {
  // The three things bze3 says key off this value, measured rather than argued:
  // the per-type wall-clock cap (verify 30 vs machinery 60 in the fixture
  // config, as in the real one), and the permanent record in the ledger.
  const ctx = repo({ mode: 'done-edit' });
  t.after(() => ctx.cleanup());
  plantJobBranch(ctx, 'j-20260910-01', {
    brief: '# Job j-20260910-01\n\nRe-verify the tutorial the directive names.\n',
    files: { '.job/source.json': sourceJson('j-20260910-01', 'verify') },
  });
  writeLedger(ctx, []);

  const res = await runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', noGates: true });

  assert.equal(res.jobId, 'j-20260910-01', ctx.output());
  assert.match(ctx.output(), /under a 30-minute cap/, `the verify cap, not machinery's 60\n${ctx.output()}`);
  const line = readLedger(ctx).at(-1);
  assert.equal(line.id, 'j-20260910-01');
  assert.equal(line.type, 'verify', `the ledger recorded \`${line.type}\`\n${ctx.output()}`);
});

test('the committed record OUTRANKS the ledger, because it is what selection decided', async (t) => {
  // A job whose earlier line was written by the very defect this fixes must not
  // be pinned to the wrong type forever by that line.
  const ctx = repo();
  t.after(() => ctx.cleanup());
  plantJobBranch(ctx, 'j-20260910-01', {
    files: { '.job/source.json': sourceJson('j-20260910-01', 'verify') },
  });
  writeLedger(ctx, [
    ledgerLine({ id: 'j-20260910-01', type: 'machinery', outcome: 'interrupted', ts: daysAgo(NOW, 1) }),
  ]);

  const res = await runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', dryRun: true, noGates: true });
  assert.equal(res.job.type, 'verify', ctx.output());
  assert.match(ctx.output(), /from \.job\/source\.json/);
});

test('with no committed record the ledger still supplies the type — the old path is unchanged', async (t) => {
  const ctx = repo();
  t.after(() => ctx.cleanup());
  // No `.job/source.json`: every branch created before that file existed.
  plantJobBranch(ctx, 'j-20260910-01');
  writeLedger(ctx, [
    ledgerLine({ id: 'j-20260910-01', type: 'repair', outcome: 'interrupted', ts: daysAgo(NOW, 1) }),
  ]);

  const res = await runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', dryRun: true, noGates: true });
  assert.equal(res.job.type, 'repair', ctx.output());
  assert.match(ctx.output(), /resumed job type: repair \(from the job's last ledger line\)/);
});

test('with NEITHER, the fallback is still `machinery` — and the log says it is a fallback', async (t) => {
  const ctx = repo();
  t.after(() => ctx.cleanup());
  plantJobBranch(ctx, 'j-20260910-01');
  writeLedger(ctx, []);

  const res = await runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', dryRun: true, noGates: true });
  assert.equal(res.job.type, 'machinery', ctx.output());
  assert.match(ctx.output(), /resumed job type: machinery \(from NEITHER/);
  assert.match(ctx.output(), /this is the fallback, not a measurement/);
});

test('a source record naming something that is not a job type is not believed', async (t) => {
  // It comes off a branch, so it is input. An unrecognised type would index
  // `job_caps_minutes` at `undefined` rather than fail, which is the silent
  // shape this repository keeps catching.
  const ctx = repo();
  t.after(() => ctx.cleanup());
  plantJobBranch(ctx, 'j-20260910-01', {
    files: { '.job/source.json': sourceJson('j-20260910-01', 'not-a-job-type') },
  });
  writeLedger(ctx, [
    ledgerLine({ id: 'j-20260910-01', type: 'repair', outcome: 'interrupted', ts: daysAgo(NOW, 1) }),
  ]);

  const res = await runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', dryRun: true, noGates: true });
  assert.equal(res.job.type, 'repair', ctx.output());
  assert.match(ctx.output(), /from the job's last ledger line/);
});
