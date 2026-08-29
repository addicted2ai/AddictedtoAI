/**
 * Runner health — a runner that cannot run at all (beads addictedtoai-h5k).
 *
 * The defect was found by running the loop, not by testing it, and it lives in
 * the seam between three parts that are each correct: an absent `RESULT.md`
 * classifies `interrupted`; an `interrupted` branch is resumable and is picked
 * up before new work; and breaker 1 counts only `failed` and `discarded`. With
 * a dead credential every run is interrupted, so the Desk resumes the same
 * branch forever, halting nothing and telling nobody.
 *
 * These tests therefore run the REAL loop against a REAL executor process that
 * REALLY produces nothing — no `RESULT.md`, no output, no edit — and read what
 * ends up in the ledger and what the next run does. A test that handed the loop
 * a status, or stubbed the classification, would pass against the broken code:
 * the broken code classified correctly. It was the consequence that was missing.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { runLoop } from '../run.mjs';
import { readLedger } from '../lib/ledger.mjs';
import { classifyRun } from '../lib/result.mjs';
import {
  noOutputStreak,
  runnerHealthGate,
  NON_RUN_OUTCOMES,
  NO_OUTPUT_SIGNAL,
  NO_OUTPUT_STREAK_LIMIT,
} from '../lib/health.mjs';
import { selectJob } from '../lib/select.mjs';
import { loadConfig } from '../lib/config.mjs';
import { loadRunners, pickRunner } from '../lib/runners.mjs';
import { makeRepo, writeQueue, writeLedger, ledgerLine, mockCommand, runnersYaml, git, plantJobBranch } from './helpers.mjs';

function repoWith(mode) {
  const ctx = makeRepo({
    runners: runnersYaml({ command: mockCommand(mode), reviewerCommand: mockCommand('review-approve') }),
  });
  writeQueue(ctx, [{ type: 'repair', title: 'fix the fixture link', detail: 'a small repair' }]);
  return ctx;
}

const go = (ctx, o = {}) =>
  runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', noGates: true, ...o });

test('a run that produces nothing at all is still `interrupted`, and says so on the ledger', async () => {
  const ctx = repoWith('produces-nothing');
  const res = await go(ctx);

  // The guardrail is NOT relaxed: specs/loop says an absent RESULT.md after the
  // process exited is `interrupted`, and it still is.
  assert.equal(res.outcome, 'interrupted', ctx.output());
  const line = readLedger(ctx).at(-1);
  assert.equal(line.outcome, 'interrupted');
  // What is added is the distinction the outcome cannot carry.
  assert.equal(line.signal, NO_OUTPUT_SIGNAL);
  assert.match(ctx.output(), /produced nothing at all/);
  assert.match(ctx.output(), /startup_failure_stderr_pattern matched/);
  // and the branch is kept, exactly as a resumable branch must be
  assert.match(git(ctx.repoRoot, ['branch', '--list']), /job\//);
  ctx.cleanup();
});

test('detection does not depend on a declared pattern: silence with no diff is enough', async () => {
  const ctx = repoWith('produces-nothing-silently');
  const res = await go(ctx);
  assert.equal(res.outcome, 'interrupted', ctx.output());
  assert.equal(readLedger(ctx).at(-1).signal, NO_OUTPUT_SIGNAL);
  ctx.cleanup();
});

test('a run that produced real work carries no no-output signal, however it ended', async () => {
  // `done-no-result` really omits RESULT.md and really writes a file. Absent
  // file, exited, no output — but a diff, so the executor plainly ran. This is
  // the case the signal must NOT claim, or every ordinary interruption would
  // eventually refuse the runner.
  const ctx = repoWith('done-no-result');
  const res = await go(ctx);
  assert.equal(res.outcome, 'interrupted', ctx.output());
  assert.equal(readLedger(ctx).at(-1).signal, undefined);
  ctx.cleanup();
});

test('a dead runner is refused rather than resumed forever — the spin ends at the third empty run', async () => {
  const ctx = repoWith('produces-nothing');

  const first = await go(ctx);
  assert.equal(first.outcome, 'interrupted', ctx.output());

  // Runs 2 and 3 RESUME the branch the first left behind — that is the loop
  // doing exactly what specs/loop requires, and exactly what spun forever.
  const second = await go(ctx);
  assert.equal(second.outcome, 'interrupted');
  const third = await go(ctx);
  assert.equal(third.outcome, 'interrupted');

  const signals = readLedger(ctx).filter((l) => l.signal === NO_OUTPUT_SIGNAL);
  assert.equal(signals.length, NO_OUTPUT_STREAK_LIMIT, ctx.output());

  // The fourth run refuses instead of resuming. Before this fix it resumed,
  // and would have gone on resuming until the 14-day abandon rule fired.
  const fourth = await go(ctx);
  assert.equal(fourth.outcome, undefined, ctx.output());
  assert.equal(fourth.rule, 'runner:produced-nothing');
  assert.match(fourth.refused, /produced nothing at all on its last 3 runs/);
  assert.match(fourth.refused, /node loop\/conformance\.mjs --runner mock-frontier/);
  assert.match(ctx.output(), /REFUSED \[runner:produced-nothing\]/);

  // The refusal is not a halt: specs/loop names exactly four breakers, and this
  // is not one of them.
  assert.equal(
    readLedger(ctx).filter((l) => l.signal === NO_OUTPUT_SIGNAL).length,
    NO_OUTPUT_STREAK_LIMIT,
    'the refused run appends no ledger line',
  );
  ctx.cleanup();
});

test('refusing a runner does not stop the 14-day abandon sweep', () => {
  // The failure this whole issue is about is branches accumulating while
  // nothing says so. A refusal that also switched off the housekeeping which
  // clears them would reintroduce it while fixing it, so the sweep runs first
  // and the refusal comes after.
  const future = new Date(Date.now() + 20 * 24 * 3600 * 1000);
  const ctx = makeRepo({ now: () => future });
  const branch = plantJobBranch(ctx, 'j-20260101-01');
  writeLedger(
    ctx,
    [1, 2, 3].map((i) =>
      ledgerLine({ id: `j-other-${i}`, runner: 'mock-frontier', outcome: 'interrupted', signal: NO_OUTPUT_SIGNAL, mm: 0 }),
    ),
  );

  return runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', noGates: true }).then((res) => {
    assert.equal(res.rule, 'runner:produced-nothing', ctx.output());
    const abandoned = readLedger(ctx).filter((l) => l.outcome === 'abandoned');
    assert.equal(abandoned.length, 1, ctx.output());
    assert.equal(abandoned[0].id, 'j-20260101-01');
    assert.match(ctx.output(), new RegExp(`abandoning ${branch}`));
    ctx.cleanup();
  });
});

test('one run that produces anything clears the streak', () => {
  const empty = (i) => ledgerLine({ id: `j-${i}`, runner: 'mock-frontier', outcome: 'interrupted', signal: NO_OUTPUT_SIGNAL });
  const worked = ledgerLine({ id: 'j-9', runner: 'mock-frontier', outcome: 'blocked' });
  assert.equal(noOutputStreak([empty(1), empty(2), empty(3)], 'mock-frontier').count, 3);
  assert.equal(noOutputStreak([empty(1), empty(2), worked], 'mock-frontier').count, 0);
  assert.equal(noOutputStreak([empty(1), worked, empty(2)], 'mock-frontier').count, 1);
  // and the streak is per runner: another runner's silence is not this one's
  assert.equal(
    noOutputStreak([empty(1), empty(2), empty(3)], 'mock-cheap').count,
    0,
  );
  assert.equal(runnerHealthGate([empty(1), empty(2)], 'mock-frontier').ok, true);
  assert.equal(runnerHealthGate([empty(1), empty(2), empty(3)], 'mock-frontier').ok, false);
});

test('the 14-day abandon sweep does not re-arm the runner it just swept', () => {
  // The sweep writes its `abandoned` line with the DEAD runner's own id, zero
  // model-minutes and no signal, because no process ran. Read as an ordinary
  // line it says "this runner produced something", which is the one thing it
  // cannot say — and it therefore ended the streak. MEASURED on the exact shape
  // below before the fix: 0. A refused runner leaves an interrupted branch, the
  // branch ages out, the sweep clears the refusal, and the dead runner gets
  // three more empty runs before refusal re-fires — every fourteen days,
  // forever.
  const empty = (i) =>
    ledgerLine({ id: `j-${i}`, runner: 'mock-frontier', outcome: 'interrupted', signal: NO_OUTPUT_SIGNAL, mm: 0 });
  const swept = ledgerLine({ id: 'j-old', runner: 'mock-frontier', outcome: 'abandoned', mm: 0 });

  const ledger = [empty(1), empty(2), empty(3), swept];
  assert.equal(noOutputStreak(ledger, 'mock-frontier').count, 3, 'a sweep line is not the runner producing anything');
  assert.equal(runnerHealthGate(ledger, 'mock-frontier').ok, false, 'so the refusal survives the sweep');
  assert.deepEqual(noOutputStreak(ledger, 'mock-frontier').ids, ['j-3', 'j-2', 'j-1']);

  // Skipped, not counted: a sweep line neither ends a streak nor extends one.
  // Two empty runs plus a sweep is still two, and must NOT reach the limit.
  const short = [empty(1), empty(2), swept];
  assert.equal(noOutputStreak(short, 'mock-frontier').count, 2);
  assert.equal(runnerHealthGate(short, 'mock-frontier').ok, true);
  assert.equal(
    noOutputStreak([swept, swept, swept], 'mock-frontier').count,
    0,
    'sweep lines alone can never refuse a runner that has not been observed to fail',
  );

  // And a real run still clears it, from either side of a sweep. This is the
  // half that must not be lost: the fix makes refusal stickier, never looser.
  const worked = ledgerLine({ id: 'j-9', runner: 'mock-frontier', outcome: 'blocked' });
  assert.equal(noOutputStreak([empty(1), empty(2), empty(3), worked, swept], 'mock-frontier').count, 0);
  assert.equal(noOutputStreak([empty(1), empty(2), empty(3), swept, worked], 'mock-frontier').count, 0);

  assert.deepEqual([...NON_RUN_OUTCOMES], ['abandoned'], 'every other outcome records a real invocation');
});

/* ---------------------------------------------------------------------------
 * The audit gap (task 4.1) and the clause that keeps D7 open (task 4.2).
 *
 * Everything above was written for `addictedtoai-h5k` and asserts what the
 * refusal DOES. Nothing above asserts what it must NOT do — write `HOLD.md` —
 * and that omission is load-bearing rather than cosmetic. specs/loop names four
 * breakers and closes the list; whether a Desk with no usable runner should
 * halt is design decision D7 and is the maintainer's, not this change's. With
 * no test on the negative, adopting a fifth breaker later would silently
 * satisfy this whole suite, and the one clause distinguishing "refused" from
 * "halted" would be unmeasured at exactly the moment it stopped being true.
 * ------------------------------------------------------------------------ */

test('C41 refusing a runner writes no HOLD.md — a refusal is not a halt', async () => {
  const ctx = repoWith('produces-nothing');
  const hold = join(ctx.repoRoot, 'HOLD.md');
  assert.equal(ctx.holdPath, hold, 'the loop and this test mean the same file');

  // The three empty runs that build the streak. None of them may halt anything
  // either: an interrupted run is not a breaker, which is the whole reason the
  // spin was invisible in the first place.
  for (let i = 1; i <= NO_OUTPUT_STREAK_LIMIT; i++) {
    const r = await go(ctx);
    assert.equal(r.outcome, 'interrupted', ctx.output());
    assert.equal(existsSync(hold), false, `run ${i} wrote HOLD.md`);
  }

  // The refusing run.
  const refused = await go(ctx);
  assert.equal(refused.rule, 'runner:produced-nothing', ctx.output());
  assert.equal(
    existsSync(hold),
    false,
    'the refusal wrote HOLD.md — specs/loop names four breakers and this is not one of them (design D7 is the maintainer\'s open decision, not this change\'s)',
  );

  // And the run's own log says the runner was refused, so the operator learns
  // it from the output rather than from the absence of a halt file.
  assert.match(ctx.output(), /REFUSED \[runner:produced-nothing\]/);

  // A refusal is also not a start-gate halt: the NEXT run still starts and
  // still refuses, rather than finding a hold left behind by the last one.
  const again = await go(ctx);
  assert.equal(again.started, true, 'the Desk still starts');
  assert.equal(again.rule, 'runner:produced-nothing');
  assert.equal(existsSync(hold), false);
  ctx.cleanup();
});

test('C37 the refusal preempts a resumption that was genuinely available', async () => {
  // The existing four-run test asserts the fourth run refuses. It does not
  // assert there was anything to resume at that moment, and a refusal that
  // beats an empty queue would satisfy it just as well. The spin this ends IS a
  // resumption loop, so the branch has to be there and has to be left alone.
  const ctx = repoWith('produces-nothing');
  for (let i = 0; i < NO_OUTPUT_STREAK_LIMIT; i++) await go(ctx);

  const branches = git(ctx.repoRoot, ['branch', '--list', 'job/*']).trim();
  assert.match(branches, /job\//, 'a resumable branch really is sitting there');
  const shaBefore = git(ctx.repoRoot, ['rev-parse', branches.replace('*', '').trim()]).trim();

  const refused = await go(ctx);
  assert.equal(refused.rule, 'runner:produced-nothing', ctx.output());
  assert.equal(refused.selected, null, 'nothing was selected and nothing was resumed');
  assert.ok(!/resuming job\//.test(ctx.output().split('REFUSED')[1] ?? ''), 'no resumption after the refusal');
  assert.equal(
    git(ctx.repoRoot, ['rev-parse', branches.replace('*', '').trim()]).trim(),
    shaBefore,
    'the branch is untouched — it was refused before resumption, not after',
  );
  ctx.cleanup();
});

test('C36 the refusal covers the reviewer role, not only the author role', async () => {
  // specs/loop: "the loop SHALL refuse that runner for the `author` and
  // `reviewer` roles". Measured before this assertion existed: only the author
  // runner was gated, so a dead REVIEWER was invoked anyway — the author spent
  // its full run producing a diff that could never be reviewed and therefore
  // could never merge. The author here is healthy; the reviewer is the one with
  // the streak.
  const ctx = makeRepo({
    runners: runnersYaml({ command: mockCommand('done-edit'), reviewerCommand: mockCommand('produces-nothing') }),
  });
  writeQueue(ctx, [{ type: 'repair', title: 'a repair that would otherwise qualify' }]);
  writeLedger(
    ctx,
    [1, 2, 3].map((i) =>
      ledgerLine({ id: `j-${i}`, runner: 'mock-reviewer', outcome: 'interrupted', signal: NO_OUTPUT_SIGNAL, mm: 0 }),
    ),
  );

  // The author is healthy — this is not the author gate firing under another name.
  assert.equal(runnerHealthGate(readLedger(ctx), 'mock-frontier').ok, true);
  assert.equal(runnerHealthGate(readLedger(ctx), 'mock-reviewer').ok, false);

  const res = await runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', noGates: true });
  assert.equal(res.rule, 'runner:produced-nothing', ctx.output());
  assert.match(res.refused, /mock-reviewer/, 'and it names the runner it refused');
  assert.match(ctx.output(), /REFUSED \[runner:produced-nothing\]/);

  // Refused BEFORE an executor is invoked: no branch, no ledger line, nothing
  // spent on work that could not have been reviewed.
  assert.equal(git(ctx.repoRoot, ['branch', '--list', 'job/*']).trim(), '', 'no job branch was created');
  assert.equal(readLedger(ctx).length, 3, 'and no new ledger line was appended');

  // Still not a halt, for the reviewer role either.
  assert.equal(existsSync(join(ctx.repoRoot, 'HOLD.md')), false);
  ctx.cleanup();
});

test('the selector refuses a dead runner too, before any candidate is considered', () => {
  const ctx = makeRepo({});
  writeQueue(ctx, [{ type: 'repair', title: 'a repair that would otherwise qualify' }]);
  writeLedger(
    ctx,
    [1, 2, 3].map((i) =>
      ledgerLine({ id: `j-${i}`, runner: 'mock-frontier', outcome: 'interrupted', signal: NO_OUTPUT_SIGNAL, mm: 0 }),
    ),
  );
  const cfg = loadConfig(ctx);
  const runner = pickRunner(loadRunners(ctx), { id: 'mock-frontier', role: 'author' });
  const sel = selectJob(ctx, { cfg, ledger: readLedger(ctx), runner, dryRun: true });
  assert.equal(sel.selected, null);
  assert.equal(sel.refusals[0].rule, 'runner:produced-nothing');
  ctx.cleanup();
});

test('classifyRun tells an executor that never ran apart one that was cut off mid-work', () => {
  const runner = { startup_failure_stderr_pattern: 'MOCK-AUTH-FAILURE' };
  const absent = { status: 'interrupted', present: false, why: 'RESULT.md is absent' };
  const malformed = { status: 'interrupted', present: true, malformed: true, why: 'first line is malformed' };

  const dead = classifyRun(
    { stderr: 'MOCK-AUTH-FAILURE: the credential has expired', stdout: '', killed: false, code: 1 },
    absent,
    runner,
  );
  assert.equal(dead.status, 'interrupted', 'the classification is unchanged — the spec says so');
  assert.equal(dead.producedNothing, true);
  assert.match(dead.startupFailure.line, /MOCK-AUTH-FAILURE/);

  // Killed at the cap is the spec's canonical `interrupted`: it ran, it was cut
  // off, and it must never count toward a dead-runner streak.
  const killed = classifyRun({ stderr: '', stdout: '', killed: true, code: null }, absent, runner);
  assert.equal(killed.status, 'interrupted');
  assert.equal(killed.producedNothing, false);

  // So must a run that said something for itself, however useless.
  const chatty = classifyRun(
    { stderr: '', stdout: 'thinking about it...', killed: false, code: 1 },
    absent,
    runner,
  );
  assert.equal(chatty.producedNothing, false);

  // A malformed RESULT.md means the executor got far enough to write a file.
  const wrote = classifyRun({ stderr: '', stdout: '', killed: false, code: 0 }, malformed, runner);
  assert.equal(wrote.producedNothing, false);
});
