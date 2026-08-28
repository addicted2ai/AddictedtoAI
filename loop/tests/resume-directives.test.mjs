/**
 * Task 7.3 — resumption from a real branch, and directive completion markers.
 *
 * The resumption tests plant an actual `job/*` branch with an actual committed
 * `.job/brief.md`. specs/loop's claim is that "the branch itself carries
 * everything resumption needs", and the only way to check that claim is to
 * delete everything except the branch and see whether the loop can still pick
 * the work up.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';

import { runLoop } from '../run.mjs';
import { readLedger } from '../lib/ledger.mjs';
import { scanJobBranches } from '../lib/resume.mjs';
import { parseDirectives, readDirectives, markDirectiveDone } from '../lib/directives.mjs';
import {
  makeRepo,
  writeLedger,
  ledgerLine,
  writeQueue,
  plantJobBranch,
  mockCommand,
  runnersYaml,
  daysAgo,
  git,
} from './helpers.mjs';

const NOW = new Date('2026-09-10T12:00:00.000Z');

test('an interrupted branch is resumed before any new selection, with no retry consumed', async () => {
  const ctx = makeRepo({
    now: () => NOW,
    runners: runnersYaml({ command: mockCommand('noop') }),
  });
  plantJobBranch(ctx, 'j-20260901-02', { brief: '# Job j-20260901-02\n\nFinish the half-done repair.\n' });
  writeLedger(ctx, [
    ledgerLine({ id: 'j-20260901-02', type: 'repair', outcome: 'interrupted', ts: daysAgo(NOW, 1) }),
  ]);
  // There is also brand-new work available; resumption must still win.
  writeQueue(ctx, [{ type: 'entry', title: 'mint a shiny new entry' }]);

  const res = await runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', dryRun: true, noGates: true });
  assert.equal(res.resumed, true, ctx.output());
  assert.equal(res.jobId, 'j-20260901-02');
  assert.equal(res.branch, 'job/j-20260901-02');
  assert.match(res.briefText, /CONTINUE: this branch already contains partial work/);
  assert.match(res.briefText, /Finish the half-done repair/);
  assert.match(ctx.output(), /no retry consumed/);
  ctx.cleanup();
});

test('a 15-day-old resumable branch is discarded with an `abandoned` ledger line', async () => {
  const ctx = makeRepo({ runners: runnersYaml({ command: mockCommand('noop') }) });
  plantJobBranch(ctx, 'j-20260801-01');
  const planted = new Date();
  const later = new Date(planted.getTime() + 15 * 24 * 3600 * 1000);
  ctx.now = () => later;
  writeLedger(ctx, [
    ledgerLine({ id: 'j-20260801-01', type: 'repair', outcome: 'interrupted', ts: planted.toISOString() }),
  ]);
  writeQueue(ctx, []);

  const scan = scanJobBranches(ctx, { ledger: readLedger(ctx), base: 'main' });
  assert.equal(scan.abandonable.length, 1, 'a 15-day-old branch is past the 14-day limit');
  assert.equal(scan.resumable.length, 0);

  const res = await runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', noGates: true });
  const line = readLedger(ctx).find((l) => l.outcome === 'abandoned');
  assert.ok(line, ctx.output());
  assert.equal(line.id, 'j-20260801-01');
  assert.equal(res.nothingQualified, true, 'and then nothing qualified, which is normal');
  ctx.cleanup();
});

test('a 13-day-old resumable branch is still resumed, not abandoned', () => {
  const ctx = makeRepo({});
  plantJobBranch(ctx, 'j-20260801-02');
  const planted = new Date();
  ctx.now = () => new Date(planted.getTime() + 13 * 24 * 3600 * 1000);
  writeLedger(ctx, [ledgerLine({ id: 'j-20260801-02', outcome: 'capacity', ts: planted.toISOString() })]);
  const scan = scanJobBranches(ctx, { ledger: readLedger(ctx), base: 'main' });
  assert.equal(scan.resumable.length, 1);
  assert.equal(scan.abandonable.length, 0);
  ctx.cleanup();
});

test('a branch whose last line is `done` is neither resumed nor abandoned', () => {
  const ctx = makeRepo({});
  plantJobBranch(ctx, 'j-20260801-03');
  writeLedger(ctx, [ledgerLine({ id: 'j-20260801-03', outcome: 'done' })]);
  const scan = scanJobBranches(ctx, { ledger: readLedger(ctx), base: 'main' });
  assert.equal(scan.resumable.length, 0);
  assert.equal(scan.other.length, 1);
  ctx.cleanup();
});

test('a `[done ...]`-marked directive is skipped while an unmarked one is selected', async () => {
  const directives = `# DIRECTIVES.md

- repair: fix the stale link on the pricing entry [done 2026-09-01 j-20260901-01]
- entry: write the entry for the thing the queue keeps asking about
- machinery: tighten the link checker [done 2026-09-02 j-20260902-01]
`;
  const ctx = makeRepo({ now: () => NOW, directives, runners: runnersYaml({ command: mockCommand('noop') }) });
  writeQueue(ctx, [{ type: 'repair', title: 'a queue item that must lose to a directive' }]);

  const parsed = parseDirectives(directives);
  assert.equal(parsed.filter((d) => d.done).length, 2);

  const { directives: selectable, warnings } = readDirectives(ctx);
  assert.equal(selectable.length, 1);
  assert.equal(selectable[0].type, 'entry');
  assert.equal(warnings.length, 0);

  const res = await runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', dryRun: true, noGates: true });
  assert.equal(res.job.source, 'directive', ctx.output());
  assert.equal(res.job.type, 'entry');
  assert.match(res.job.title, /write the entry for the thing/);
  ctx.cleanup();
});

test('a directive without a job type is skipped with a loud warning, never guessed at', () => {
  const directives = `# DIRECTIVES.md

- please sort out the pricing page somehow
- verify: re-run the in-browser inference tutorial
`;
  const ctx = makeRepo({ directives });
  const { directives: selectable, warnings } = readDirectives(ctx);
  assert.equal(selectable.length, 1);
  assert.equal(selectable[0].type, 'verify');
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /no job type/);
  assert.match(warnings[0], /will not guess/);
  ctx.cleanup();
});

test('the completion marker is appended to the directive line, and is idempotent', () => {
  const ctx = makeRepo({
    now: () => NOW,
    directives: '# DIRECTIVES.md\n\n- repair: fix the thing\n',
  });
  const first = markDirectiveDone(ctx, 3, 'j-20260910-01', '2026-09-10');
  assert.equal(first.changed, true);
  assert.match(readFileSync(ctx.directivesPath, 'utf8'), /- repair: fix the thing \[done 2026-09-10 j-20260910-01\]/);
  const second = markDirectiveDone(ctx, 3, 'j-20260910-02', '2026-09-10');
  assert.equal(second.changed, false, 'a directive is never silently re-marked');
  assert.equal(readDirectives(ctx).directives.length, 0, 'and never re-selected');
  ctx.cleanup();
});

test('completing a directive job appends the marker end to end', async () => {
  const ctx = makeRepo({
    now: () => NOW,
    directives: '# DIRECTIVES.md\n\n- repair: fix the fixture file\n',
    runners: runnersYaml({
      command: mockCommand('done-edit'),
      reviewerCommand: mockCommand('review-approve'),
    }),
  });
  const res = await runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', noGates: true });
  assert.equal(res.outcome, 'done', ctx.output());
  const text = readFileSync(ctx.directivesPath, 'utf8');
  assert.match(text, /\[done 2026-09-10 j-20260910-01\]/, text);
  assert.equal(readDirectives(ctx).directives.length, 0);
  // and the marker was committed with the job's records, not left dangling in
  // the working tree where the next clone would lose it
  assert.equal(git(ctx.repoRoot, ['status', '--porcelain', '--', 'DIRECTIVES.md']).trim(), '');
  assert.match(git(ctx.repoRoot, ['show', 'HEAD:DIRECTIVES.md']), /\[done 2026-09-10 j-20260910-01\]/);
  ctx.cleanup();
});
