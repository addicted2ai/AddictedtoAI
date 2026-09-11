/**
 * breakers-retarget.test.mjs — Stage-1 U6 (tasks 49, 51): the breaker layer
 * watches the TRAIN, not per-job builds.
 *
 * Row 49: breaker 2 reads the train's post-records build
 * (`build`/`verify-launch`/`verify-surfaces` red on the tip about to advance
 * `main`), excluding red classified `pre-existing`; `evicted-at-train` never
 * counts toward breaker 1; a tracker-unreachable refusal is a classification
 * arm, never a halt input. Row 51 (breaker half): the classification re-run
 * consumes neither retry; retry never retries lock-refusals.
 *
 * Q-S18 throughout: throwaway repositories in the OS temp directory
 * (`makeRepo`), stubbed gate results (plain data, no spawns), no live model
 * call, never a live push. Every `HOLD.md` assertion reads a FIXTURE's hold
 * path — never the session repository's.
 *
 * The three-night fixture: ledger lines dated on three successive LOCAL
 * dates (computed from the machine clock at runtime, noon-anchored so a DST
 * transition cannot collapse them). Breaker 1 counts consecutive failures
 * with no nightly reset, and the false-HOLD mutation below over-halts across
 * that same span.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  BREAKERS,
  DEPLOY_MISS_REASON,
  EVICTED_AT_TRAIN_MARK,
  POST_RECORDS_RED_PREFIX,
  TRACKER_UNREACHABLE_SIGNAL,
  carriesEvictionMark,
  checkBuildRed,
  checkConsecutiveFailures,
  checkDeployWindow,
  isBreakerOneInput,
  isDeployMiss,
  isPostRecordsRedOutcome,
  isTrackerRefusalRun,
} from '../lib/breakers.mjs';
import { localDate } from '../lib/dates.mjs';
import { makeRepo, writeLedger, ledgerLine } from './helpers.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, '..', '..');
const LIB = resolve(HERE, '..', 'lib', 'breakers.mjs');

/* ---------------------------------------------------------------------------
 * Three local dates, read off the machine clock as its own command (local
 * dates only — never UTC). Noon-anchored: a 23/25-hour DST day still lands
 * each stamp on its own calendar date.
 * ------------------------------------------------------------------------ */

function threeNights() {
  const noon = new Date();
  noon.setHours(12, 0, 0, 0);
  const dates = [2, 1, 0].map((n) => localDate(new Date(noon.getTime() - n * 86400000)));
  assert.deepEqual(new Set(dates).size, 3, `three-night fixture spans three distinct local dates, saw ${dates.join(',')}`);
  const off = -noon.getTimezoneOffset();
  const sign = off >= 0 ? '+' : '-';
  const ap = Math.abs(off);
  const suffix = `${sign}${String(Math.floor(ap / 60)).padStart(2, '0')}:${String(ap % 60).padStart(2, '0')}`;
  return dates.map((d) => `${d}T12:00:00.000${suffix}`);
}

const NIGHTS = threeNights();

/** A three-night `failed` run per night, oldest first. */
function threeNightFailures(type = 'repair', extra = {}) {
  return NIGHTS.map((ts, i) => ledgerLine({ id: `j-u6-${i}`, type, outcome: 'failed', ts, ...extra }));
}

/* ---------------------------------------------------------------------------
 * Breaker 2, first trigger: the train's post-records build.
 * ------------------------------------------------------------------------ */

test('breaker 2 trips on the train triple red (classified train-did-it)', () => {
  const ctx = makeRepo({});
  const r = checkBuildRed(ctx, {
    ok: false,
    output: 'post-records re-gate red: build FAIL, exit 1',
    classification: 'train-did-it',
  });
  assert.equal(r.tripped, true);
  const hold = readFileSync(ctx.holdPath, 'utf8');
  assert.match(hold, /breaker-2-build-or-deploy-red/);
  assert.match(hold, /failed to build after a merge/);
  ctx.cleanup();
});

test('breaker 2 stays silent on red classified pre-existing', () => {
  const ctx = makeRepo({});
  const r = checkBuildRed(ctx, {
    ok: false,
    output: 'post-records re-gate red: build FAIL, exit 1',
    classification: 'pre-existing',
  });
  assert.equal(r.tripped, false);
  assert.equal(r.excluded, 'pre-existing');
  assert.equal(existsSync(ctx.holdPath), false, 'a pre-existing red writes no hold');
  ctx.cleanup();
});

test('breaker 2 fails closed: unknown or missing classification trips, green never does', () => {
  const ctx = makeRepo({});
  assert.equal(checkBuildRed(ctx, { ok: true, classification: 'pre-existing' }).tripped, false);
  for (const classification of [undefined, 'unknown', 'train-did-it']) {
    const r = checkBuildRed(ctx, { ok: false, output: 'red', classification });
    assert.equal(r.tripped, true, `classification ${String(classification)} trips`);
  }
  ctx.cleanup();
});

/* ---------------------------------------------------------------------------
 * NAMED MUTATION 1 (row 49): pre-existing-counts-as-trip. The mutant removes
 * the exclusion; on the three-night fixture it must write a FALSE HOLD.md —
 * the mutant over-halts. Copy-based, hash-restored, residue-free.
 * ------------------------------------------------------------------------ */

const BREAKERS_LIB = LIB;

async function withBreakersMutant(tag, search, replacement, fn) {
  const before = readFileSync(BREAKERS_LIB, 'utf8');
  assert.ok(before.includes(search), 'mutant anchor present in the shipped file');
  const mutant = before.replace(search, replacement);
  assert.notEqual(mutant, before, 'the mutant must differ from the shipped file');
  const sha = createHash('sha256').update(before, 'utf8').digest('hex');
  const copyPath = resolve(HERE, '..', 'lib', `breakers.mut-${process.pid}-${tag}.mjs`);
  writeFileSync(copyPath, mutant, 'utf8');
  try {
    await fn(await import(`./../lib/breakers.mut-${process.pid}-${tag}.mjs`));
    assert.equal(
      createHash('sha256').update(readFileSync(BREAKERS_LIB, 'utf8'), 'utf8').digest('hex'),
      sha,
      'tracked breakers.mjs hash-identical after the mutant run',
    );
    assert.equal(readFileSync(BREAKERS_LIB, 'utf8'), before, 'tracked breakers.mjs byte-identical after the mutant run');
  } finally {
    rmSync(copyPath, { force: true });
  }
  assert.equal(existsSync(copyPath), false, 'the mutant copy is gone');
}

test('MUTATION pre-existing-counts-as-trip: the mutant writes a FALSE HOLD.md on the three-night fixture', async () => {
  await withBreakersMutant(
    'preexisting',
    "return { tripped: false, excluded: 'pre-existing' };",
    "return { tripped: true, ...writeHold(ctx, BREAKERS.BUILD_OR_DEPLOY_RED, 'mutant: pre-existing counted', output) };",
    async (mutant) => {
      const ctx = makeRepo({});
      writeLedger(ctx, threeNightFailures());
      const r = mutant.checkBuildRed(ctx, {
        ok: false,
        output: 'post-records re-gate red: verify-surfaces FAIL',
        classification: 'pre-existing',
      });
      assert.equal(r.tripped, true, 'the mutant trips on pre-existing red (the arm fails on the mutant)');
      assert.equal(existsSync(ctx.holdPath), true, 'the mutant writes a FALSE HOLD.md — it over-halts');
      const hold = readFileSync(ctx.holdPath, 'utf8');
      assert.match(hold, /breaker-2-build-or-deploy-red/);
      ctx.cleanup();
    },
  );
});

/* ---------------------------------------------------------------------------
 * Breaker 1: evicted-at-train never counts.
 * ------------------------------------------------------------------------ */

function rejectionWithEviction(ts, reason = 'evicted-at-train: removing abc12345 cleared build') {
  const line = ledgerLine({ id: 't-evict', type: 'train', outcome: 'failed', ts });
  line.train = {
    id: 't-evict', merges: ['abc12345'], gate_seconds: {}, evictions: [{ merge: 'abc12345', reason, wrongly: null }],
    pre_existing_hold: false, findings_not_in_any_record: 0, review_rounds: 0,
  };
  return line;
}

test('breaker 1: a whole-train rejection carrying evicted-at-train never counts', () => {
  assert.equal(EVICTED_AT_TRAIN_MARK, 'evicted-at-train');
  const ctx = makeRepo({});
  const seq = [
    rejectionWithEviction(NIGHTS[0]),
    ledgerLine({ id: 't-2', type: 'train', outcome: 'failed', ts: NIGHTS[1] }),
    ledgerLine({ id: 't-3', type: 'train', outcome: 'failed', ts: NIGHTS[2] }),
  ];
  assert.equal(carriesEvictionMark(seq[0]), true);
  assert.equal(isBreakerOneInput(seq[0]), false, 'the rejection line is not a halt input');
  const r = checkConsecutiveFailures(ctx, seq, 'train');
  assert.equal(r.tripped, false, 'the rejection in the consecutive sequence does NOT trip');
  assert.equal(r.count, 2);
  assert.equal(existsSync(ctx.holdPath), false);
  ctx.cleanup();
});

test('breaker 1: the eviction mark, not the train type, is what excludes', () => {
  const ctx = makeRepo({});
  const plain = [0, 1, 2].map((i) => ledgerLine({ id: `t-p${i}`, type: 'train', outcome: 'failed', ts: NIGHTS[i] }));
  assert.equal(isBreakerOneInput(plain[0]), true, 'an eviction-less train failure is still a halt input');
  const r = checkConsecutiveFailures(ctx, plain, 'train');
  assert.equal(r.tripped, true, 'three eviction-less train failures still trip');
  ctx.cleanup();
});

test('breaker 1: the review-path eviction phrasing carries the same mark', () => {
  const line = rejectionWithEviction(NIGHTS[0], 'evicted-at-train: removing abc12345 at train review (reason review)');
  assert.equal(carriesEvictionMark(line), true);
  assert.equal(isBreakerOneInput(line), false);
});

/* ---------------------------------------------------------------------------
 * Breaker 1: the tracker-unreachable refusal is never a halt input.
 * ------------------------------------------------------------------------ */

test('breaker 1: refusal-status runs are skipped, not reset', () => {
  assert.equal(TRACKER_UNREACHABLE_SIGNAL, 'tracker-unreachable');
  const ctx = makeRepo({});
  const refused = ledgerLine({ id: 'j-r', type: 'repair', outcome: 'failed', ts: NIGHTS[2] });
  refused.signal = TRACKER_UNREACHABLE_SIGNAL;
  assert.equal(isTrackerRefusalRun(refused), true);
  assert.equal(isBreakerOneInput(refused), false);

  // The refusal at the tail: two countable failures, no trip — whatever
  // outcome the Stage-3 producer booked beside the signal.
  const refusedInterrupted = ledgerLine({ id: 'j-r2', type: 'repair', outcome: 'interrupted', ts: NIGHTS[2] });
  refusedInterrupted.signal = TRACKER_UNREACHABLE_SIGNAL;
  assert.equal(isBreakerOneInput(refusedInterrupted), false, 'the exclusion is outcome-independent');
  const tail = [...threeNightFailures().slice(0, 2), refused, refusedInterrupted];
  const r1 = checkConsecutiveFailures(ctx, tail, 'repair');
  assert.equal(r1.tripped, false, 'a refusal-status run is not counted');
  assert.equal(r1.count, 2);
  assert.equal(existsSync(ctx.holdPath), false);
  ctx.cleanup();

  // The refusal at the head: skipped, not reset — the three around it trip.
  const ctx2 = makeRepo({});
  const head = [refused, ...threeNightFailures().map((l, i) => ledgerLine({ id: `j-h${i}`, type: 'repair', outcome: l.outcome, ts: l.ts }))];
  const r2 = checkConsecutiveFailures(ctx2, head, 'repair');
  assert.equal(r2.tripped, true, 'skipped lines neither count nor reset');
  assert.equal(r2.count, 3);
  ctx2.cleanup();
});

test('breaker 1: classified-but-unsignaled failures still count (THE REFUSAL twin)', () => {
  // The row-49 refusal is a run-level STATUS (the signal), never a reading
  // of gate output. A `failed` line whose NOTE names a classification but
  // carries no refusal signal counts exactly as any other `failed` — the
  // unit twin of `breakers.test.mjs`' real-run control, pinning that this
  // round's filter cannot become the exemption specs/loop forbids.
  const ctx = makeRepo({});
  const lines = threeNightFailures().map((l, i) => ({
    ...l,
    note: `gates failed: npm run test (exit 1) — gate-output classification present on run ${i}, retried once and failed again`,
  }));
  assert.equal(lines.every((l) => isBreakerOneInput(l)), true, 'no signal, no mark: all three are halt inputs');
  const r = checkConsecutiveFailures(ctx, lines, 'repair');
  assert.equal(r.tripped, true, 'three classified-but-unsignaled failures still halt the Desk');
  ctx.cleanup();
});

test('the refusal classifier recognises the signal value and nothing else', () => {
  assert.equal(isTrackerRefusalRun({ signal: TRACKER_UNREACHABLE_SIGNAL }), true);
  assert.equal(isTrackerRefusalRun({ signal: 'no-output' }), false);
  assert.equal(isTrackerRefusalRun({ outcome: 'failed' }), false);
  assert.equal(isTrackerRefusalRun(null), false);
  assert.equal(isTrackerRefusalRun(undefined), false);
});

/* ---------------------------------------------------------------------------
 * The three-night span itself: consecutive failures across three local dates
 * still trip — no nightly reset anywhere in the counter.
 * ------------------------------------------------------------------------ */

test('three-night fixture: failures on three successive local dates trip breaker 1', () => {
  const ctx = makeRepo({});
  const lines = threeNightFailures();
  const r = checkConsecutiveFailures(ctx, lines, 'repair');
  assert.equal(r.tripped, true);
  assert.equal(r.count, 3);
  const hold = readFileSync(ctx.holdPath, 'utf8');
  assert.match(hold, /three consecutive repair jobs/);
  ctx.cleanup();
});

/* ---------------------------------------------------------------------------
 * Breaker 2, second trigger: the Pulse deploy confirmation window.
 * ------------------------------------------------------------------------ */

function deployMiss({ held = false, suppressed = false } = {}) {
  const scatter = { published: false, reason: DEPLOY_MISS_REASON };
  if (suppressed) scatter.suppressedHold = 'pre-existing';
  return {
    ok: true, sha: 'abc', published: false,
    attempts: [{ sha: 'abc', published: false, reason: DEPLOY_MISS_REASON }],
    remerges: 0,
    reason: `publish did not complete (${DEPLOY_MISS_REASON}) — the verified tree stays local`,
    ...(held ? { hold: '/holds-are-fixture-only' } : {}),
    ...(suppressed ? { suppressedHold: 'pre-existing' } : {}),
  };
}

test('checkDeployWindow: a missed deploy with no hold standing writes the breaker-2 hold', () => {
  assert.equal(DEPLOY_MISS_REASON, 'stamp-did-not-advance');
  const ctx = makeRepo({});
  assert.equal(isDeployMiss(deployMiss()), true);
  const r = checkDeployWindow(ctx, deployMiss());
  assert.equal(r.tripped, true);
  assert.equal(r.wrote, true);
  const hold = readFileSync(ctx.holdPath, 'utf8');
  assert.match(hold, /breaker-2-build-or-deploy-red/);
  assert.match(hold, /confirmation window/);
  ctx.cleanup();
});

test('checkDeployWindow: a standing deploy hold is observed, never overwritten', () => {
  const ctx = makeRepo({});
  const marker = 'deploy-hold: abc123def456abc123def456abc123def456abcd never-advanced\n';
  writeFileSync(ctx.holdPath, `# HOLD\n\n${marker}\n- first window: 10 minutes\n`, 'utf8');
  const before = readFileSync(ctx.holdPath, 'utf8');
  const r = checkDeployWindow(ctx, deployMiss({ held: true }));
  assert.equal(r.tripped, true, 'the halt stands');
  assert.equal(r.wrote, false, 'but the loop writes nothing over it');
  assert.equal(readFileSync(ctx.holdPath, 'utf8'), before, 'the deploy-hold marker and its bytes are intact');
  ctx.cleanup();
});

test('checkDeployWindow: suppressed pre-existing trips nothing; non-misses trip nothing', () => {
  const ctx = makeRepo({});
  assert.equal(checkDeployWindow(ctx, deployMiss({ suppressed: true })).tripped, false);
  assert.equal(checkDeployWindow(ctx, { ok: true, published: true }).tripped, false);
  assert.equal(checkDeployWindow(ctx, { ok: true, published: false, reason: 'scope refusal' }).tripped, false);
  assert.equal(checkDeployWindow(ctx, undefined).tripped, false);
  assert.equal(checkDeployWindow(ctx, null).tripped, false);
  assert.equal(existsSync(ctx.holdPath), false, 'no arm writes a hold');
  ctx.cleanup();
});

/* ---------------------------------------------------------------------------
 * Feed-path pins: the post-records prefix, the deploy literal, the moved
 * (not duplicated) feed, and the deliberately read-only counter.
 * ------------------------------------------------------------------------ */

test('isPostRecordsRedOutcome matches only the red re-gate, never the did-not-run state', () => {
  assert.equal(isPostRecordsRedOutcome('post-records re-gate red: build FAIL'), true);
  assert.equal(isPostRecordsRedOutcome('post-records re-gate threw (spawn ENOENT); records stand committed, nothing publishes'), false);
  assert.equal(isPostRecordsRedOutcome('train gates red: build FAIL'), false);
  assert.equal(isPostRecordsRedOutcome(undefined), false);
  assert.equal(POST_RECORDS_RED_PREFIX, 'post-records re-gate red:');
});

test('isDeployMiss reads the shared step result shape and nothing else', () => {
  assert.equal(isDeployMiss({ published: false, reason: `x ${DEPLOY_MISS_REASON} y` }), true);
  assert.equal(isDeployMiss({ published: false, attempts: [{ reason: DEPLOY_MISS_REASON }] }), true);
  assert.equal(isDeployMiss({ published: false, reason: 'hold' }), false);
  assert.equal(isDeployMiss({ published: true }), false);
});

test('structural: the feed moved to the train result — once, and the literals agree', () => {
  const runSrc = readFileSync(join(REPO_ROOT, 'loop', 'run.mjs'), 'utf8');
  const trainSrc = readFileSync(join(REPO_ROOT, 'loop', 'lib', 'train.mjs'), 'utf8');
  const pulseSrc = readFileSync(join(REPO_ROOT, 'pulse', 'lib', 'publish.mjs'), 'utf8');
  // The post-records prefix the feed matches is the literal the train writes.
  assert.ok(trainSrc.includes(`post-records re-gate red: ${'${'}`), 'train.mjs writes the red re-gate reason the feed matches');
  assert.ok(runSrc.includes('isPostRecordsRedOutcome'), 'run.mjs feeds breaker 2 through the prefix matcher');
  assert.ok(runSrc.includes('classifyRedTrain'), 'run.mjs measures the classification with the unwrapped seam');
  // Moved, not duplicated: exactly one breaker-2 build call site in run.mjs.
  assert.equal(runSrc.split('checkBuildRed(').length - 1, 1, 'one post-records feed — two feeds would be a finding');
  assert.ok(runSrc.includes('checkDeployWindow'), 'run.mjs feeds the deploy-window trigger');
  // The deploy literal the loop matches is the literal the shared step returns.
  assert.ok(pulseSrc.includes("reason: 'stamp-did-not-advance'"), 'the shared step returns the matched reason');
  assert.ok(pulseSrc.includes("suppressedHold: 'pre-existing'"), 'the shared step reports the pre-existing suppression');
  // The old per-job feed stays deleted: no post-merge build block resurrected.
  assert.ok(runSrc.includes('its\n// post-merge-build feed is gone until task 49') || runSrc.includes('post-merge-build feed is gone'), 'the U1 deletion note still stands');
});

test('structural: the counter stays read-only — the exclusions live in the breaker', () => {
  const budgetSrc = readFileSync(join(REPO_ROOT, 'loop', 'lib', 'budget.mjs'), 'utf8');
  assert.doesNotMatch(budgetSrc, /evicted-at-train/, 'budget.mjs learns no eviction vocabulary this round');
  assert.doesNotMatch(budgetSrc, /tracker-unreachable/, 'budget.mjs learns no refusal vocabulary this round');
  const breakerSrc = readFileSync(join(REPO_ROOT, 'loop', 'lib', 'breakers.mjs'), 'utf8');
  assert.doesNotMatch(breakerSrc, /from '.\/train\.mjs'|from "\.\/train\.mjs"/, 'breakers.mjs takes no train edge — the classification arrives as a parameter');
});

test('no mutant residue: loop/lib carries no *.mut-*.mjs copies', async () => {
  const { readdirSync } = await import('node:fs');
  const leftovers = readdirSync(resolve(HERE, '..', 'lib')).filter((f) => f.includes('.mut-'));
  assert.deepEqual(leftovers, [], `mutant residue: ${leftovers.join(', ')}`);
});
