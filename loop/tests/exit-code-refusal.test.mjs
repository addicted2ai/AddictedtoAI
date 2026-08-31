/**
 * exit-code-refusal.test.mjs — a refused run reports a different exit code
 * than a run that attempted or completed something (beads addictedtoai-pfv,
 * design decision D7, partial mechanism landed alongside the ruling).
 *
 * D7 asked whether the Desk should halt (a fifth breaker, `HOLD.md`) when no
 * usable runner remains. The full mechanism needs an OpenSpec change
 * (specs/loop's breaker list is closed and `openspec/specs/` is reserved) and
 * is filed separately. What lands here needs no spec change: before this,
 * `main()` mapped `res.started !== false` straight to exit 0 for EVERY
 * outcome — a refused runner, "nothing qualified", and a merged job all
 * looked identical to whatever invoked `node loop/run.mjs` and checked only
 * the exit code. `exitCodeFor()` (in `loop/run.mjs`) makes a refusal a
 * distinct code (2), so it is visible without reading the log.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { runLoop, exitCodeFor } from '../run.mjs';
import { NO_OUTPUT_STREAK_LIMIT } from '../lib/health.mjs';
import { makeRepo, writeQueue, mockCommand, runnersYaml } from './helpers.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));

/* ---------------------------------------------------------------------------
 * The pure mapping, in isolation — no process, no fixture, matching the
 * structural-test spirit of exit-code.test.mjs but as an actual behavioural
 * unit test, since `exitCodeFor` is exported specifically to allow one.
 * ------------------------------------------------------------------------ */

test('exitCodeFor: not started (STOP / HOLD.md) is 1', () => {
  assert.equal(exitCodeFor({ started: false, reason: 'a STOP file is present' }), 1);
});

test('exitCodeFor: a conformance or health refusal is 2, distinct from everything else', () => {
  assert.equal(exitCodeFor({ started: true, selected: null, refused: 'runner X is dead' }), 2);
});

test('exitCodeFor: "nothing qualified" is 0 — a normal, healthy outcome, not a failure', () => {
  assert.equal(exitCodeFor({ started: true, selected: null, nothingQualified: true }), 0);
});

test('exitCodeFor: a run that attempted or completed work is 0', () => {
  assert.equal(exitCodeFor({ started: true, jobId: 'j-1', outcome: 'done' }), 0);
  assert.equal(exitCodeFor({ started: true, jobId: 'j-1', outcome: 'failed' }), 0, 'a job failure is not a refusal');
  assert.equal(exitCodeFor({ started: true, dryRun: true, jobId: 'j-1' }), 0, '--dry-run reports, does not refuse');
});

/* ---------------------------------------------------------------------------
 * The real thing: a genuinely dead runner, run through runLoop(), mapped by
 * exitCodeFor() exactly the way main() does it.
 * ------------------------------------------------------------------------ */

function deadRunnerRepo() {
  const ctx = makeRepo({
    runners: runnersYaml({ command: mockCommand('produces-nothing'), reviewerCommand: mockCommand('review-approve') }),
  });
  writeQueue(ctx, [{ type: 'repair', title: 'fix the fixture link' }]);
  return ctx;
}

const go = (ctx) => runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', noGates: true });

test('a runner refused for producing nothing three times in a row exits 2 on the fourth run', async () => {
  const ctx = deadRunnerRepo();
  for (let i = 0; i < NO_OUTPUT_STREAK_LIMIT; i++) {
    const r = await go(ctx);
    assert.equal(exitCodeFor(r), 0, `run ${i + 1}: an interrupted-but-not-yet-refused run is still exit 0`);
  }
  const refused = await go(ctx);
  assert.equal(refused.rule, 'runner:produced-nothing', ctx.output());
  assert.equal(exitCodeFor(refused), 2, ctx.output());
  ctx.cleanup();
});

test('a conformance FAIL refuses before any run and exits 2', async () => {
  const ctx = makeRepo({});
  writeQueue(ctx, [{ type: 'repair', title: 'a repair that would otherwise qualify' }]);
  writeFileSync(
    ctx.conformancePath,
    JSON.stringify({
      'mock-frontier': {
        runner: 'mock-frontier',
        date: new Date().toISOString(),
        pass: false,
        checks: [
          { name: 'trivial-edit', result: 'FAIL' },
          { name: 'insufficient-information', result: 'PASS' },
          { name: 'fabricated-quote-trap', result: 'PASS' },
          { name: 'reserved-path-probe', result: 'PASS' },
        ],
      },
    }),
    'utf8',
  );
  const res = await go(ctx);
  assert.ok(res.refused, ctx.output());
  assert.equal(exitCodeFor(res), 2, ctx.output());
  ctx.cleanup();
});

test('an empty queue ("nothing qualified") exits 0, not 2 — it is not a refusal', async () => {
  const ctx = makeRepo({
    runners: runnersYaml({ command: mockCommand('done-edit'), reviewerCommand: mockCommand('review-approve') }),
  });
  writeQueue(ctx, []); // nothing to select
  const res = await go(ctx);
  assert.equal(res.nothingQualified, true, ctx.output());
  assert.equal(exitCodeFor(res), 0, ctx.output());
  ctx.cleanup();
});

test('a merged job exits 0', async () => {
  const ctx = makeRepo({
    runners: runnersYaml({ command: mockCommand('done-edit'), reviewerCommand: mockCommand('review-approve') }),
  });
  writeQueue(ctx, [{ type: 'repair', title: 'a repair that will actually merge' }]);
  const res = await go(ctx);
  assert.equal(res.outcome, 'done', ctx.output());
  assert.equal(exitCodeFor(res), 0);
  ctx.cleanup();
});

/* ---------------------------------------------------------------------------
 * main() itself uses exitCodeFor rather than an inline rule that could drift
 * from it — a structural check, matching exit-code.test.mjs's own precedent,
 * since main() is not exported and cannot be called directly without
 * spawning a process (which would reach publishStep and risk a live deploy).
 * ------------------------------------------------------------------------ */

test('main() maps runLoop()\'s result through exitCodeFor(), not an inline ternary', () => {
  const src = readFileSync(join(HERE, '..', 'run.mjs'), 'utf8');
  assert.match(src, /return exitCodeFor\(res\);/, 'main() must call the exported, independently-tested mapping');
  assert.doesNotMatch(
    src,
    /return res\.started === false \? 1 : 0;/,
    'the old inline mapping (which could not distinguish a refusal from a completed run) must be gone',
  );
});
