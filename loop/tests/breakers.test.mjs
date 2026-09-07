/**
 * Task 7.5 — breakers and holds.
 *
 * Four breakers, and only four. The tests below check both halves of that
 * sentence: each named breaker writes `HOLD.md` with its reason, and the
 * conditions specs/loop deliberately did NOT make breakers — a `blocked`
 * outcome, a capacity pause, an empty queue — do not.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { runLoop, attemptMergeWithoutReview } from '../run.mjs';
import { readLedger } from '../lib/ledger.mjs';
import { consecutiveFailures } from '../lib/budget.mjs';
import { TRANSPORT_FAILURE_MARKER } from '../lib/gates.mjs';
import {
  BREAKERS,
  brakeScan,
  brakeState,
  checkBuildRed,
  checkConsecutiveFailures,
  checkReservedPaths,
  reservedPathViolations,
  startGate,
} from '../lib/breakers.mjs';
import { makeRepo, writeLedger, ledgerLine, writeQueue, mockCommand, runnersYaml, daysAgo } from './helpers.mjs';

const NOW = new Date('2026-09-10T12:00:00.000Z');
const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

test('breaker 1 — three consecutive same-type failures write HOLD.md; two failed and a blocked do not', () => {
  const ctx = makeRepo({ now: () => NOW });
  const line = (outcome, i) => ledgerLine({ id: `j-${i}`, type: 'post', outcome, ts: daysAgo(NOW, 5 - i) });

  const notYet = checkConsecutiveFailures(ctx, [line('failed', 1), line('failed', 2), line('blocked', 3)], 'post');
  assert.equal(notYet.tripped, false);
  assert.equal(notYet.count, 2, 'the blocked outcome is not a failure and is not counted');
  assert.ok(!existsSync(ctx.holdPath), 'and no hold was written');

  const tripped = checkConsecutiveFailures(
    ctx,
    [line('failed', 1), line('discarded', 2), line('failed', 3)],
    'post',
  );
  assert.equal(tripped.tripped, true);
  assert.equal(tripped.breaker, BREAKERS.CONSECUTIVE_FAILURES);
  const hold = readFileSync(ctx.holdPath, 'utf8');
  assert.match(hold, /three consecutive post jobs ended failed or discarded/);
  assert.match(hold, /blocked, interrupted, capacity and abandoned outcomes are not failures/);
  assert.match(hold, /This file is the maintainer's to remove/);
  ctx.cleanup();
});

// ---------------------------------------------------------------------------
// THE REFUSAL (beads addictedtoai-icpb, addictedtoai-juig).
//
// Both beads ask whether a gate failure the machine can prove environmental
// should be kept off breaker 1's count. The answer is NO, and specs/loop now
// says so: "the classification SHALL NOT remove a failure from any count, any
// breaker or any budget." The reason is the hazard the beads name themselves —
// a classifier that lets failures off the count is a classifier that can be
// wrong in the direction of never halting — and the safety property the Desk
// actually needs, a real defect still fails twice, comes from the unconditional
// retry, which trusts nothing.
//
// THIS PASSES TODAY BY CONSTRUCTION, because no exemption exists. That is the
// whole point: the tests below are what make REMOVING that construction a red
// build instead of a silent policy change. Every existing breaker test stays
// green under an exemption keyed on the note — measured, not assumed — so
// without these, the instruction "do not exempt marked failures" is enforced by
// nothing at all.
// ---------------------------------------------------------------------------

/** Gate output in `runGates`' shape, carrying the marker the emitting code writes. */
function markedGateFailure() {
  // Interpolated from the declaration, never re-typed: `loop/` carries exactly
  // one copy of that sentence and `gate-transport-retry.test.mjs` scans for a
  // second. That the real emitters produce this marker is measured there too;
  // what is measured HERE is what the breaker does with a failure carrying it.
  const output =
    `--- npm run test (FAIL, exit 1)\nnot ok 402 - a pulse fixture ingested\n  ${TRANSPORT_FAILURE_MARKER}\n`;
  return { ok: false, results: [{ script: 'test', ok: false, status: 1, output }], transport: true, output };
}

function unmarkedGateFailure() {
  const output = '--- npm run test (FAIL, exit 1)\nnot ok 1 - lib/schema.test.mjs\n  expected 3, got 4\n';
  return { ok: false, results: [{ script: 'test', ok: false, status: 1, output }], transport: false, output };
}

/**
 * A repository with one repair job queued, an author that edits and a reviewer
 * that approves.
 *
 * The author sleeps a KNOWN interval, because model-minutes are measured by the
 * loop's own clock and a mock that returns in a fraction of a second records
 * `0.00` — against which "the spend was not waived" is unmeasurable, since a
 * waived zero and a recorded zero are the same number.
 */
function repairRepo() {
  const ctx = makeRepo({
    runners: runnersYaml({
      command: mockCommand('done-edit', ' --sleep-ms 6000'),
      reviewerCommand: mockCommand('review-approve'),
    }),
  });
  writeQueue(ctx, [{ type: 'repair', title: 'fix the fixture link', detail: 'a small repair' }]);
  return ctx;
}

/** Run one job whose gates fail TWICE, and return its real ledger line. */
async function twiceFailedJob(result) {
  const ctx = repairRepo();
  const calls = [];
  const gates = (c, dir) => {
    calls.push(dir);
    return result();
  };
  const res = await runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', gates });
  assert.equal(res.outcome, 'failed', ctx.output());
  assert.equal(calls.filter((d) => d !== ctx.repoRoot).length, 2, 'the gates ran twice: the run and its one retry');
  assert.equal(existsSync(ctx.holdPath), false, 'one failure is not a breaker');
  const line = readLedger(ctx).at(-1);
  ctx.cleanup();
  return line;
}

test('breaker 1 — three MARKED twice-failed gate runs still trip the breaker and write HOLD.md', async () => {
  // Three repositories rather than three runs in one, for the reason the
  // sibling control in `gate-transport-retry.test.mjs` states: the mock author
  // writes the same file every time. The LINES are real — each was written by a
  // real run whose gates really failed twice with the marker present in both
  // runs — and they are handed to the real `checkConsecutiveFailures`, which is
  // the function breaker 1 actually asks.
  const lines = [];
  for (let i = 0; i < 3; i += 1) lines.push(await twiceFailedJob(markedGateFailure));

  for (const l of lines) {
    assert.equal(l.outcome, 'failed', JSON.stringify(l));
    assert.equal(l.type, 'repair');
    assert.match(l.note, /transport-marked, retried once and failed again/, l.note);
  }
  assert.equal(consecutiveFailures(lines, 'repair'), 3, 'a marked failure counts exactly as any other `failed`');

  const ctx = makeRepo({ now: () => NOW });
  const tripped = checkConsecutiveFailures(ctx, lines, 'repair');
  assert.equal(tripped.tripped, true, 'three of them halt the Desk, marker or no marker');
  assert.equal(tripped.count, 3);
  assert.equal(tripped.breaker, BREAKERS.CONSECUTIVE_FAILURES);
  const hold = readFileSync(ctx.holdPath, 'utf8');
  assert.match(hold, /three consecutive repair jobs ended failed or discarded/);
  ctx.cleanup();
});

test('breaker 1 — a marked twice-failed job records the same spend an unmarked one does', async () => {
  // THE BUDGET LEG of the same sentence, and the one a breaker-only test cannot
  // reach: "any count, any breaker or any budget" is three claims, and nothing
  // looked at the budget at all. A waiver would be invisible to every breaker
  // test here — the outcome would still be `failed` and the count would still
  // advance — while the ledger quietly under-recorded what the run cost, which
  // is the file every share, ceiling and floor is computed from.
  //
  // Compared field for field against an unmarked job of the same shape, rather
  // than asserted to be positive: `mm > 0` is satisfied by a number that has
  // been halved.
  const marked = await twiceFailedJob(markedGateFailure);
  const unmarked = await twiceFailedJob(unmarkedGateFailure);

  assert.deepEqual(Object.keys(marked).sort(), Object.keys(unmarked).sort(), 'the same line shape either way');
  // Every field but the three that cannot be equal: when the run happened, what
  // it was called, and the note — which is the ONE thing the classification is
  // allowed to change.
  const varies = new Set(['ts', 'id', 'note', 'mm', 'phases']);
  for (const k of Object.keys(marked)) {
    if (!varies.has(k)) assert.deepEqual(marked[k], unmarked[k], `field \`${k}\` differs with the classification`);
  }
  assert.match(marked.note, /transport-marked/);
  assert.match(unmarked.note, /no transport marker in the captured output/);

  // `mm` is the job's total across its invocations, and a gate run is not one.
  // So the honest statement of "not waived" is that the total still equals the
  // invocations' own recorded minutes — the identical computation applied to
  // both lines, with nothing subtracted for the marker.
  //
  // `mm > 0` alone is satisfied by a number that has been halved (or waived by
  // any other proportion) — the author's own `--sleep-ms 6000` is a REAL wall-
  // clock floor no waiver can be under and still look plausible: the recorded
  // spend can never be less than the time the mock genuinely slept, so a floor
  // set at that sleep (in minutes) catches a proportional waiver a bare
  // positivity check cannot.
  const SLEPT_MM = 6000 / 60000;
  for (const [label, line] of [['marked', marked], ['unmarked', unmarked]]) {
    const summed = Math.round(line.phases.reduce((s, p) => s + p.mm, 0) * 100) / 100;
    assert.equal(line.mm, summed, `${label}: the ledger total is not the spend its phases record`);
    assert.ok(
      line.mm >= SLEPT_MM,
      `${label}: recorded ${line.mm} mm, below the ${SLEPT_MM} mm the author's own sleep guarantees — the spend was waived`,
    );
  }
  // And the phase entries themselves match field for field but for the minutes
  // and the `gates` record — which is where the classification is SUPPOSED to
  // show up, and the only place it may.
  assert.deepEqual(
    marked.phases.map((p) => ({ ...p, mm: null, gates: null })),
    unmarked.phases.map((p) => ({ ...p, mm: null, gates: null })),
  );
  const gatesOf = (l) => l.phases.find((p) => p.role === 'author').gates;
  assert.deepEqual({ ...gatesOf(marked), transport: null }, { ...gatesOf(unmarked), transport: null });
  assert.equal(gatesOf(marked).transport, true);
  assert.equal(gatesOf(unmarked).transport, false);
});

test('neither the breaker nor the budget reads the gate classification at all', async () => {
  // THE SOURCE GUARD BESIDE THE TEST. The control above proves the exemption is
  // absent TODAY; this proves the mechanism cannot be reintroduced quietly, in
  // either of the two files specs/loop names — and the budget is the half no
  // test looks at, which is exactly where an unwatched exemption would live.
  //
  // A guardrail is a mechanism, not an instruction. This one starts green and
  // its whole value is the day someone makes it red.
  const forbidden = ['TRANSPORT_FAILURE_MARKER', 'isTransportFailure', 'gatesHitTransportFailure', 'transport'];
  for (const file of ['lib/breakers.mjs', 'lib/budget.mjs']) {
    const text = readFileSync(join(REPO_ROOT, 'loop', file), 'utf8').toLowerCase();
    const hits = forbidden.filter((needle) => text.includes(needle.toLowerCase()));
    assert.deepEqual(
      hits,
      [],
      `${file} reads the gate failure classification (${hits.join(', ')}). specs/loop: "the ` +
        'classification SHALL NOT remove a failure from any count, any breaker or any budget" — ' +
        'a twice-failed gate run is `failed` whether its output carried the marker or not, it ' +
        'advances breaker 1\'s count exactly as any other `failed` outcome does, and its spend is ' +
        'recorded exactly as any other. A classifier that lets failures off the count is a ' +
        'classifier that can be wrong in the direction of never halting.',
    );
  }
});

test('breaker 2 — a red build after a merge writes HOLD.md', () => {
  const ctx = makeRepo({ now: () => NOW });
  assert.equal(checkBuildRed(ctx, { ok: true }).tripped, false);
  assert.ok(!existsSync(ctx.holdPath));
  const r = checkBuildRed(ctx, { ok: false, output: 'Error: build failed on page /wiki/x' });
  assert.equal(r.tripped, true);
  const hold = readFileSync(ctx.holdPath, 'utf8');
  assert.match(hold, /failed to build after a merge/);
  assert.match(hold, /build failed on page \/wiki\/x/);
  assert.match(hold, /except for its deploy step/);
  ctx.cleanup();
});

test('breaker 3 — a review bypass attempt writes HOLD.md', () => {
  const ctx = makeRepo({ now: () => NOW });
  const r = attemptMergeWithoutReview(ctx, 'j-20260910-01', 'merge invoked with --skip-review');
  assert.equal(r.tripped, true);
  const hold = readFileSync(ctx.holdPath, 'utf8');
  assert.match(hold, /without a recorded reviewer verdict/);
  assert.match(hold, /j-20260910-01/);
  ctx.cleanup();
});

test('breaker 4 — the reserved paths are exactly the named five', () => {
  const v = reservedPathViolations([
    { status: 'M', path: 'openspec/specs/loop/spec.md' },
    { status: 'M', path: 'data/config.json' },
    { status: 'M', path: 'runners.yml' },
    { status: 'A', path: 'STOP' },
    { status: 'D', path: 'HOLD.md' },
    { status: 'M', path: 'openspec/changes/archive/2026-08-30-build-initial-site/tasks.md' },
    { status: 'M', path: 'loop/run.mjs' },
    { status: 'M', path: 'data/ledger.jsonl' },
    { status: 'M', path: 'HOLD.md' },
  ]);
  assert.deepEqual(
    v.map((x) => x.path).sort(),
    ['HOLD.md', 'STOP', 'data/config.json', 'openspec/specs/loop/spec.md', 'runners.yml'],
  );
  // loop/ is deliberately NOT reserved (design D4): reserving it would deadlock
  // the first loop bugfix on an absent maintainer.
  assert.ok(!v.some((x) => x.path.startsWith('loop/')));
  // and only REMOVAL of HOLD.md counts, not modifying it
  assert.equal(v.filter((x) => x.path === 'HOLD.md').length, 1);
});

test('breaker 4 — a job that really edits runners.yml trips the breaker and does not merge', async () => {
  const ctx = makeRepo({
    now: () => NOW,
    runners: runnersYaml({ command: mockCommand('reserved-path-edit'), reviewerCommand: mockCommand('review-approve') }),
  });
  writeQueue(ctx, [{ type: 'machinery', title: 'a job that will overstep' }]);
  const res = await runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', noGates: true });
  assert.equal(res.outcome, 'failed', ctx.output());
  assert.ok(existsSync(ctx.holdPath), ctx.output());
  const hold = readFileSync(ctx.holdPath, 'utf8');
  assert.match(hold, /changed reserved path\(s\).*runners\.yml/s);
  assert.match(hold, /The maintainer edits these freely; no job may/);
  // the edit never reached main
  assert.ok(!/edited by a job/.test(readFileSync(join(ctx.repoRoot, 'runners.yml'), 'utf8')));
  ctx.cleanup();
});

test('breaker 4 — the target branch moving under a job, merged in by the author, is not the job\'s edit', async () => {
  // Measured 2026-09-07 on j-20260907-13: the author ran `git merge main`
  // during its run, main had gained the maintainer's own runners.yml commit
  // meanwhile, and the loop — diffing against the merge-base it measured
  // BEFORE the runner started — booked that commit as the job's reserved-path
  // edit and halted the Desk. The job is judged against the target branch as
  // it stands when the run ends; a commit the target already has is never the
  // job's, and this job's only work is one ordinary file.
  const ctx = makeRepo({
    now: () => NOW,
    runners: runnersYaml({ command: mockCommand('merge-main-then-edit'), reviewerCommand: mockCommand('review-approve') }),
  });
  writeQueue(ctx, [{ type: 'machinery', title: 'a job under which the target branch moves' }]);
  const res = await runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', noGates: true });
  assert.equal(res.outcome, 'done', ctx.output());
  assert.ok(!existsSync(ctx.holdPath), 'no HOLD.md: the reserved edit was the maintainer\'s, on the target branch\n' + ctx.output());
  assert.match(ctx.output(), /base moved during the run: [0-9a-f]{7} -> [0-9a-f]{7} — the author merged/);
  // the maintainer's edit is on the target branch exactly as the maintainer made it, once
  const registry = readFileSync(join(ctx.repoRoot, 'runners.yml'), 'utf8');
  assert.equal((registry.match(/the maintainer edited the registry on the target branch/g) || []).length, 1);
  // and the job's own work merged
  assert.ok(existsSync(join(ctx.repoRoot, 'site-note.md')), ctx.output());
  ctx.cleanup();
});

test('the shared install is reachable from the worktree while the author runs, not only at gate time', async () => {
  // Measured 2026-09-07 on j-20260907-14: the brief asks every author to run
  // `npm test` and `npm run build` in the foreground, and the worktree had no
  // `node_modules` until `runGates` linked it — after the author had already
  // reported `blocked`. The link is a junction to the repository's install;
  // the fixture's install is one marker file, gitignored like the real one.
  const ctx = makeRepo({
    now: () => NOW,
    runners: runnersYaml({ command: mockCommand('needs-node-modules'), reviewerCommand: mockCommand('review-approve') }),
  });
  mkdirSync(join(ctx.repoRoot, 'node_modules'), { recursive: true });
  writeFileSync(join(ctx.repoRoot, 'node_modules', 'fixture-package.txt'), 'the shared install\n', 'utf8');
  writeQueue(ctx, [{ type: 'machinery', title: 'a job whose author runs the checks' }]);
  const res = await runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', noGates: true });
  assert.equal(res.outcome, 'done', ctx.output());
  assert.ok(!/node_modules is absent/.test(ctx.output()), ctx.output());
  // the link never reaches the branch or main: node_modules is ignored, and the
  // real install is untouched
  assert.ok(existsSync(join(ctx.repoRoot, 'node_modules', 'fixture-package.txt')));
  assert.ok(existsSync(join(ctx.repoRoot, 'site-note.md')), ctx.output());
  ctx.cleanup();
});

// ---------------------------------------------------------------------------
// Breaker 4's filesystem companion (beads addictedtoai-59q, addictedtoai-ut1).
//
// Both brakes are gitignored, so neither can appear in a branch diff any more.
// The STOP clause went blind when the ignore landed; the removal-of-HOLD.md
// clause had never fired at all, because HOLD.md has been untracked its whole
// life and `git diff --name-status` reports only tracked files.
//
// These tests do the thing the guardrail is supposed to prevent, and are
// paired with a control: a guardrail that fires on an innocent run is noise,
// and noise is how a guardrail gets switched off.
// ---------------------------------------------------------------------------

test('brakeScan — a STOP in the job worktree is a violation; a forged HOLD.md is a notice, not a fifth reserved path', () => {
  const ctx = makeRepo({ now: () => NOW });
  const wt = join(ctx.testRoot, 'fake-worktree');
  mkdirSync(wt, { recursive: true });

  assert.deepEqual(brakeScan(ctx, { worktree: wt }), { entries: [], notices: [] }, 'a clean worktree scans clean');

  writeFileSync(join(wt, 'STOP'), '', 'utf8');
  const withStop = brakeScan(ctx, { worktree: wt });
  assert.deepEqual(withStop.entries, [{ status: 'A', path: 'STOP', where: 'the job worktree' }]);
  // The entry is judged by the SAME function a real diff entry is.
  const v = reservedPathViolations(withStop.entries);
  assert.equal(v.length, 1);
  assert.equal(v[0].reserved, 'STOP');
  assert.equal(v[0].where, 'the job worktree');

  writeFileSync(join(wt, 'HOLD.md'), '# HOLD\n', 'utf8');
  const withBoth = brakeScan(ctx, { worktree: wt });
  assert.equal(withBoth.entries.length, 1, 'a job-created HOLD.md is NOT a violation');
  assert.equal(withBoth.notices.length, 1, 'it is reported as a notice instead');
  assert.match(withBoth.notices[0], /not among the reserved paths/);
  ctx.cleanup();
});

test('brakeScan — a brake that disappears from the repository root is a violation, and only a disappearance is', () => {
  const ctx = makeRepo({ now: () => NOW });
  assert.deepEqual(brakeState(ctx), { STOP: false, 'HOLD.md': false });

  // present before, gone after: the removal clause, now reachable.
  writeFileSync(ctx.holdPath, '# HOLD\n', 'utf8');
  writeFileSync(ctx.stopPath, '', 'utf8');
  const before = brakeState(ctx);
  assert.deepEqual(before, { STOP: true, 'HOLD.md': true });
  rmSync(ctx.holdPath);
  rmSync(ctx.stopPath);
  const gone = brakeScan(ctx, { before });
  assert.deepEqual(
    gone.entries.map((e) => `${e.status} ${e.path}`).sort(),
    ['D HOLD.md', 'D STOP'],
  );
  assert.deepEqual(
    reservedPathViolations(gone.entries).map((v) => v.reserved).sort(),
    ['STOP', 'removal of HOLD.md'],
  );

  // absent before, appearing after — a breaker writing its own hold — is not.
  const before2 = brakeState(ctx);
  writeFileSync(ctx.holdPath, '# HOLD\n', 'utf8');
  assert.deepEqual(brakeScan(ctx, { before: before2 }).entries, [], 'an appearance at the root is not a violation');
  ctx.cleanup();
});

test('breaker 4 — a job that really writes STOP into its worktree trips the breaker (it did not before)', async () => {
  const ctx = makeRepo({
    now: () => NOW,
    runners: runnersYaml({ command: mockCommand('writes-stop'), reviewerCommand: mockCommand('review-approve') }),
  });
  writeQueue(ctx, [{ type: 'machinery', title: 'a job that reaches for the brake' }]);
  const res = await runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', noGates: true });

  assert.equal(res.outcome, 'failed', ctx.output());
  assert.ok(existsSync(ctx.holdPath), ctx.output());
  const hold = readFileSync(ctx.holdPath, 'utf8');
  assert.match(hold, /breaker-4-reserved-path-edit-attempt/);
  assert.match(hold, /`STOP` \(A, reserved as STOP, found in the job worktree\)/);
  // The branch diff genuinely could not see it — this is why the companion
  // exists, and asserting it here keeps the test honest if the ignore is ever
  // removed and the diff clause starts carrying the case again.
  assert.ok(!/STOP/.test(ctx.output().match(/committed the executor's output[^\n]*/)?.[0] ?? ''));
  // and the job's ordinary work never merged
  assert.ok(!existsSync(join(ctx.repoRoot, 'site-note.md')));
  // the maintainer's brake was never created at the root, only in the scratch tree
  assert.ok(!existsSync(ctx.stopPath));
  ctx.cleanup();
});

test('breaker 4 — a job that removes a HOLD.md written while it ran trips the removal clause', async () => {
  // `startGate` refuses to start while a hold exists, so the ONLY window in
  // which a job can remove one is between its own invocations: the reviewer
  // here writes the hold mid-job and the revision pass deletes it.
  const ctx = makeRepo({ now: () => NOW });
  const root = ctx.repoRoot.replace(/\\/g, '/');
  writeFileSync(
    ctx.runnersPath,
    runnersYaml({
      command: mockCommand('removes-root-hold', ` "${root}"`),
      reviewerCommand: mockCommand('review-revise-and-brake', ` "${root}"`),
    }),
    'utf8',
  );
  writeQueue(ctx, [{ type: 'machinery', title: 'a job that clears the halt and carries on' }]);
  const res = await runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', noGates: true });

  assert.equal(res.outcome, 'failed', ctx.output());
  const hold = readFileSync(ctx.holdPath, 'utf8');
  assert.match(hold, /breaker-4-reserved-path-edit-attempt/);
  assert.match(hold, /`HOLD\.md` \(D, reserved as removal of HOLD\.md, found in the repository root\)/);
  assert.match(ctx.output(), /reserved-path edit attempt \(revision pass\)/);
  ctx.cleanup();
});

test('breaker 4 — an innocent job runs clean: no notice, no hold, and it merges', async () => {
  const ctx = makeRepo({
    now: () => NOW,
    runners: runnersYaml({ command: mockCommand('done-edit'), reviewerCommand: mockCommand('review-approve') }),
  });
  writeQueue(ctx, [{ type: 'machinery', title: 'an ordinary job' }]);
  const res = await runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', noGates: true });

  assert.equal(res.outcome, 'done', ctx.output());
  assert.ok(!existsSync(ctx.holdPath), `the filesystem companion must not fire on innocent work:\n${ctx.output()}`);
  assert.ok(!/NOTICE:/.test(ctx.output()), ctx.output());
  assert.ok(!/BREAKER/.test(ctx.output()), ctx.output());
  assert.ok(existsSync(join(ctx.repoRoot, 'site-note.md')), 'and the work merged');
  ctx.cleanup();
});

test('the loop refuses to start while STOP exists, and does not remove it', async () => {
  const ctx = makeRepo({ now: () => NOW });
  writeFileSync(ctx.stopPath, '', 'utf8');
  assert.equal(startGate(ctx).ok, false);
  const res = await runLoop(ctx, { runner: 'mock-frontier' });
  assert.equal(res.started, false);
  assert.match(res.reason, /the maintainer's brake/);
  assert.ok(existsSync(ctx.stopPath), 'STOP is still there');
  ctx.cleanup();
});

test('the loop refuses to start while HOLD.md exists, and does not remove it', async () => {
  const ctx = makeRepo({ now: () => NOW });
  writeFileSync(ctx.holdPath, '# HOLD\n\nbecause of a thing\n', 'utf8');
  const res = await runLoop(ctx, { runner: 'mock-frontier' });
  assert.equal(res.started, false);
  assert.match(res.reason, /halted until the maintainer clears it/);
  assert.ok(existsSync(ctx.holdPath));
  ctx.cleanup();
});

test('a capacity pause and an empty queue are NOT breakers', async () => {
  const ctx = makeRepo({ now: () => NOW });
  writeLedger(ctx, [ledgerLine({ provider: 'provider-a', outcome: 'capacity', ts: daysAgo(NOW, 0.01) })]);
  writeQueue(ctx, []);
  const res = await runLoop(ctx, { runner: 'mock-frontier', noGates: true });
  assert.equal(res.started, true);
  assert.ok(!existsSync(ctx.holdPath), 'a paused lane writes no hold');
  assert.match(ctx.output(), /lane "provider-a" is paused/);
  assert.equal(readLedger(ctx).length, 1, 'and no new line was written');
  ctx.cleanup();
});

test('an empty run reports "nothing qualified" and is not an error', async () => {
  const ctx = makeRepo({ now: () => NOW });
  writeQueue(ctx, []);
  const res = await runLoop(ctx, { runner: 'mock-frontier', noGates: true });
  assert.equal(res.nothingQualified, true);
  assert.match(ctx.output(), /nothing qualified — the run ends here, and that is a normal, healthy outcome/);
  assert.ok(!existsSync(ctx.holdPath));
  ctx.cleanup();
});
