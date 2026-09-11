/**
 * train-red.test.mjs — the witness for Stage-1 tasks 38, 39, 40 (U3).
 *
 * Row-39 Q-S18 fixture policy throughout: a throwaway repository with a bare
 * origin in the OS temp directory, real git plumbing, gate spawns stubbed
 * through injection (no `spawn` seam needed — the SUT takes the gates
 * function itself), no real six-gate build, never a push of any kind. The
 * bare origin exists so "nothing merges to main from a replay train" and
 * "never pushed" are read OFF THE REMOTE (`for-each-ref` empty), not
 * asserted from local refs.
 *
 * Stubs and their STATED contracts:
 * - gates(failWhen, failingScript): records `{scripts, dir, head}` per call
 *   (`head` = `rev-parse HEAD` in the gated dir, proving WHICH commit a
 *   classification or replay ran on). Red iff `failWhen(dir)`; the result
 *   stops at the first failure in the requested order (runGates' shape), so
 *   `failingGateOf` reads the same script the SUT searches on.
 * - rederive: counts calls, returns `{ok:true}` (the red path never reaches
 *   it; the stub only proves the SUT never calls it there by staying
 *   unasserted — no arm pins incidental behavior).
 * - review: records `{diffText, manifest}` (the manifest OBJECT, so the
 *   post-eviction review provably saw the eviction mark); approves with
 *   reviewer identity unless overridden.
 *
 * Arms (each found by lookup):
 * - pre-existing: hold flag, classification-on-mainTip proof, no revert,
 *   hold line (`blocked`, `pre_existing_hold: true`), one upkeep proposal
 *   named by the pre-train commit, second run rewrites, no HOLD.md, reader.
 * - early-latent: evicts the EARLIEST merge, failing-gate-only trials in
 *   the train checkout, full set + review after eviction, re-review saw
 *   the eviction mark and the defect gone, ledger + manifest marks,
 *   solo replay from main on the gate of eviction with `wrongly: false`,
 *   main untouched, no replay ref.
 * - no-single-removal: whole-train rejection, nothing reverted, outcome
 *   `failed`, merges stay.
 * - date-change: begun-date recorded, mid-search change refuses, nothing
 *   evicted.
 * - lock: admits up to size with a note, refuses beyond naming hold+size
 *   (the telling), legacy without admission.
 * - units: begunDate/failingGateOf/appendTrainLine-outcome arms.
 * - mutation A (assume-a-merge): only the pre-existing case fails.
 * - mutation B (newest-first): isolates the WRONG merge; the replay audit
 *   then flags `wrongly: true` on the mutant run.
 * - never-records (row 40): the audit assertion fails on the mutant.
 * - assemble begunDate-drop mutant: the eviction arm fails without the
 *   floor record.
 * - no-tracker: neither the SUT nor this file invokes the tracker.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

import { TRAIN_GATES } from '../lib/gates.mjs';
import { localDate } from '../lib/dates.mjs';
import {
  appendTrainLine,
  assembleTrain,
  checkBegunDate,
  classifyRedTrain,
  ensureTrainBranch,
  failingGateOf,
  holdPreExistingTrain,
  leaveOneOutSearch,
  mergeJobBranch,
  pendingMerges,
  preExistingHold,
  recordReplayVerdict,
  rejectTrain,
  replayEviction,
  runTrain,
  TRAIN_BRANCH,
} from '../lib/train.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const LIB = resolve(HERE, '..', 'lib', 'train.mjs');
const SUT = readFileSync(LIB, 'utf8');

function git(dir, args, env) {
  return execFileSync('git', ['-C', dir, ...args], {
    encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
    ...(env ? { env: { ...process.env, ...env } } : {}),
  }).trim();
}

const BOUNDS = { merges: 5, minutes: 90, maxReviewedBytes: 150000, maxSubjects: 12, lockWaitSeconds: 1200 };
const T0 = Date.parse('2026-09-11T12:00:00');
const T1 = T0 + 24 * 60 * 60 * 1000;
const DAY0 = localDate(new Date(T0));

/** Throwaway repo on `main` with a bare origin; ledger clock fixed at T0. */
function trainRepo() {
  const root = mkdtempSync(join(tmpdir(), 'atai-trainred-'));
  const repo = join(root, 'repo');
  const remote = join(root, 'origin.git');
  mkdirSync(repo, { recursive: true });
  git(repo, ['init', '--quiet']);
  git(repo, ['symbolic-ref', 'HEAD', 'refs/heads/main']);
  git(repo, ['config', 'user.email', 'trainred@example.invalid']);
  git(repo, ['config', 'user.name', 'Train Red Test']);
  git(repo, ['config', 'commit.gpgsign', 'false']);
  writeFileSync(join(repo, 'base.txt'), 'base\n', 'utf8');
  git(repo, ['add', '-A']);
  git(repo, ['commit', '--quiet', '--no-verify', '-m', 'base']);
  execFileSync('git', ['init', '--quiet', '--bare', remote], { stdio: 'ignore' });
  git(repo, ['remote', 'add', 'origin', remote.replace(/\\/g, '/')]);
  mkdirSync(join(repo, 'data', 'derived'), { recursive: true });
  writeFileSync(join(repo, 'data', 'derived', 'queue.json'), '[]\n', 'utf8');
  return {
    root, repo, remote,
    cleanup: () => rmSync(root, { recursive: true, force: true }),
    remoteRefs: () => {
      try {
        return execFileSync('git', ['-C', remote, 'for-each-ref'], { encoding: 'utf8' }).trim();
      } catch {
        return '';
      }
    },
  };
}

function ctxFor(repo, t = T0) {
  return { repoRoot: repo, ledgerPath: join(repo, 'data', 'ledger.jsonl'), now: () => new Date(t) };
}

/** Admit one job onto `train` with a parseable merge message. */
function admitJob(repo, id, files, { date } = {}) {
  ensureTrainBranch(repo, 'main');
  git(repo, ['checkout', '--quiet', 'main']);
  git(repo, ['checkout', '--quiet', '-b', `job/${id}`]);
  const paths = [];
  for (const [p, c] of Object.entries(files)) {
    const full = join(repo, p);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, c, 'utf8');
    paths.push(p.replace(/\\/g, '/'));
  }
  // Exact paths ONLY, never `add -A` (train.test.mjs discipline): a blanket
  // add sweeps fixture housekeeping into the job commit.
  git(repo, ['add', '--', ...paths]);
  git(repo, ['commit', '--quiet', '--no-verify', '-m', `work ${id}`]);
  git(repo, ['checkout', '--quiet', TRAIN_BRANCH]);
  const env = date ? { GIT_AUTHOR_DATE: date, GIT_COMMITTER_DATE: date } : undefined;
  git(repo, ['merge', '--quiet', '--no-ff', '--no-verify', '-m', `job ${id} (repair): ${id} work`, `job/${id}`], env);
}

/** Commit straight onto `main` (the pre-existing-red defect gets in this way). */
function commitOnMain(repo, files, message) {
  git(repo, ['checkout', '--quiet', 'main']);
  const paths = [];
  for (const [p, c] of Object.entries(files)) {
    const full = join(repo, p);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, c, 'utf8');
    paths.push(p.replace(/\\/g, '/'));
  }
  git(repo, ['add', '--', ...paths]);
  git(repo, ['commit', '--quiet', '--no-verify', '-m', message]);
}

/**
 * The gate stub: red iff `failWhen(dir)`. Records `{scripts, dir, head}`
 * per call — `head` proves which commit a classification or replay gated.
 * The result stops at the first failure in the requested order.
 */
function stubGates(failWhen, { failingScript = 'build' } = {}) {
  const calls = [];
  const fn = (ctx, dir, options) => {
    const scripts = options && options.scripts ? [...options.scripts] : [];
    let head = null;
    try {
      head = execFileSync('git', ['-C', dir, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
    } catch {
      head = null;
    }
    calls.push({ scripts, dir, head });
    if (!failWhen(dir)) {
      return { ok: true, results: scripts.map((s) => ({ script: s, ok: true, status: 0, output: `${s} ok` })), output: '' };
    }
    const idx = scripts.includes(failingScript) ? scripts.indexOf(failingScript) : 0;
    const ran = scripts.slice(0, idx + 1);
    return {
      ok: false,
      results: ran.map((s, i) => ({ script: s, ok: i < ran.length - 1, status: i < ran.length - 1 ? 0 : 1, output: i < ran.length - 1 ? `${s} ok` : `${s} FAILED` })),
      output: `${ran[ran.length - 1]} FAILED`,
    };
  };
  fn.calls = calls;
  return fn;
}

function stubRederive() {
  const state = { calls: 0 };
  const fn = async (ctx, dir) => {
    state.calls += 1;
    return { ok: true, reason: 'stub' };
  };
  fn.state = state;
  return fn;
}

function stubReview(overrides = {}) {
  const seen = [];
  const fn = async ({ diffText, manifest, repo }) => {
    seen.push({ diffText, manifest, repo });
    return { verdict: 'approve', runner: 'stub-reviewer', provider: 'stub', tier: 'stub', findingsNotInAnyRecord: 0, ...overrides };
  };
  fn.seen = seen;
  return fn;
}

function readCommitted(repo, sha, path) {
  try {
    return execFileSync('git', ['-C', repo, 'show', `${sha}:${path}`], { encoding: 'utf8' });
  } catch {
    return '';
  }
}

function ledgerLines(text) {
  return String(text ?? '').split('\n').filter(Boolean).map((l) => JSON.parse(l));
}

function readLedger(repo) {
  try {
    return ledgerLines(readFileSync(join(repo, 'data', 'ledger.jsonl'), 'utf8'));
  } catch {
    return [];
  }
}

function trainLog(repo) {
  return git(repo, ['log', '--format=%s', TRAIN_BRANCH]).split('\n').filter(Boolean);
}

/** Copy-mutant harness (U1/U2 pattern): same-dir copy, fresh import, residue scan. */
async function withMutant(tag, search, replacement, fn) {
  const before = readFileSync(LIB, 'utf8');
  const mutant = before.replace(search, replacement);
  assert.notEqual(mutant, before, `the mutant must differ from the shipped file (${tag})`);
  const sha = createHash('sha256').update(before, 'utf8').digest('hex');
  // Tagged path: Node ESM caches by URL within the process, so every mutant
  // needs its OWN copy path — reusing one URL silently re-imports the first
  // mutant's module.
  const copyPath = resolve(HERE, '..', 'lib', `train.mut-${process.pid}-${tag}.mjs`);
  writeFileSync(copyPath, mutant, 'utf8');
  try {
    await fn(await import(`./../lib/train.mut-${process.pid}-${tag}.mjs`));
    assert.equal(
      createHash('sha256').update(readFileSync(LIB, 'utf8'), 'utf8').digest('hex'),
      sha,
      `tracked train.mjs hash-identical after the mutant run (sha256 ${sha.slice(0, 12)}…)`,
    );
    assert.equal(readFileSync(LIB, 'utf8'), before, 'tracked train.mjs byte-identical after the mutant run');
  } finally {
    rmSync(copyPath, { force: true });
  }
  assert.equal(existsSync(copyPath), false, 'the mutant copy is gone');
  const residue = readdirSync(resolve(HERE, '..', 'lib')).filter((f) => f.startsWith('train.mut-'));
  assert.deepEqual(residue, [], 'no mutant residue in loop/lib');
}

/** The audit assertion (row 40): the replay verdict is ON the ledger. */
function assertAuditRecorded(repo, trainId, merge, wrongly) {
  const head = git(repo, ['rev-parse', TRAIN_BRANCH]);
  const lines = ledgerLines(readCommitted(repo, head, 'data/ledger.jsonl'));
  const short = String(merge).slice(0, 8);
  const replay = lines.find((l) => l.id === `${trainId}-replay-${short}`);
  assert.ok(replay, `the committed ledger carries the replay line ${trainId}-replay-${short}`);
  assert.equal(replay.outcome, 'done');
  assert.equal(replay.train.replay_of, trainId);
  assert.deepEqual(replay.train.merges, [merge]);
  assert.equal(replay.train.evictions.length, 1);
  assert.equal(replay.train.evictions[0].merge, merge);
  assert.equal(replay.train.evictions[0].wrongly, wrongly);
  return replay;
}

// ---------------------------------------------------------------------------
// Fixture builders.
// ---------------------------------------------------------------------------

/** F1: pre-train red — the defect rides `main` before the train assembles. */
function buildPreExisting(nowMs = T0) {
  const fx = trainRepo();
  const { repo } = fx;
  commitOnMain(repo, { 'content/base-red.md': '# red base\n' }, 'base red');
  ensureTrainBranch(repo, 'main');
  admitJob(repo, 'job-1', { 'content/j1.md': '# one\n' });
  admitJob(repo, 'job-2', { 'content/j2.md': '# two\n' });
  git(repo, ['checkout', '--quiet', TRAIN_BRANCH]);
  const asm = assembleTrain(repo, { trainId: 't-hold', bounds: BOUNDS, now: () => nowMs });
  assert.equal(asm.ok, true, asm.reason ?? 'assembly refused');
  return { fx, repo, asm };
}

/** F2: early-latent defect — merge 1 of 3 carries it; the last does not. */
function buildEarlyLatent(nowMs = T0) {
  const fx = trainRepo();
  const { repo } = fx;
  ensureTrainBranch(repo, 'main');
  admitJob(repo, 'job-1', { 'content/defect.md': '# defect\n', 'content/j1.md': '# one\n' });
  admitJob(repo, 'job-2', { 'content/j2.md': '# two\n' });
  admitJob(repo, 'job-3', { 'content/j3.md': '# three\n' });
  git(repo, ['checkout', '--quiet', TRAIN_BRANCH]);
  const asm = assembleTrain(repo, { trainId: 't-early', bounds: BOUNDS, now: () => nowMs });
  assert.equal(asm.ok, true, asm.reason ?? 'assembly refused');
  const shas = asm.manifest.merges.map((x) => x.sha);
  return { fx, repo, asm, earliest: shas[0], newest: shas[shas.length - 1] };
}

/** F3: no single removal clears it — each merge is independently red. */
function buildNoSingleRemoval(nowMs = T0) {
  const fx = trainRepo();
  const { repo } = fx;
  ensureTrainBranch(repo, 'main');
  admitJob(repo, 'job-1', { 'content/defect-a.md': '# defect a\n' });
  admitJob(repo, 'job-2', { 'content/defect-b.md': '# defect b\n' });
  git(repo, ['checkout', '--quiet', TRAIN_BRANCH]);
  const asm = assembleTrain(repo, { trainId: 't-noclear', bounds: BOUNDS, now: () => nowMs });
  assert.equal(asm.ok, true, asm.reason ?? 'assembly refused');
  return { fx, repo, asm };
}

// ---------------------------------------------------------------------------
// F1: pre-existing hold.
// ---------------------------------------------------------------------------

test('pre-existing red holds: classification first, no revert, hold line, one upkeep proposal', async () => {
  const { fx, repo, asm } = buildPreExisting();
  try {
    const mainTip = asm.manifest.mainTip;
    const short = mainTip.slice(0, 8);
    const gates = stubGates((dir) => existsSync(join(dir, 'content', 'base-red.md')));
    const tr = await runTrain(ctxFor(repo), {
      repo, trainId: asm.manifest.train, manifest: asm.manifest,
      gates, rederive: stubRederive(), review: stubReview(), now: () => T0,
    });
    assert.equal(tr.ok, false);
    assert.equal(tr.held, 'pre-existing');
    assert.match(tr.reason, /pre-existing red/);
    assert.match(tr.reason, new RegExp(short));
    // Classification ran the FULL set on the pre-train commit FIRST: the
    // second gate call is in another directory, at the main tip.
    assert.equal(gates.calls.length, 2);
    assert.deepEqual(gates.calls[0].scripts, [...TRAIN_GATES]);
    assert.equal(gates.calls[0].dir, repo);
    assert.deepEqual(gates.calls[1].scripts, [...TRAIN_GATES]);
    assert.notEqual(gates.calls[1].dir, repo);
    assert.equal(gates.calls[1].head, mainTip);
    // Nothing reverted before (or after) the verdict.
    assert.ok(!trainLog(repo).some((l) => l.startsWith('Revert')), 'no revert anywhere on a held train');
    // The train's own ledger line: blocked, hold flag set, committed.
    const lines = readLedger(repo);
    const hold = lines.find((l) => l.id === asm.manifest.train);
    assert.ok(hold, 'the hold line is appended');
    assert.equal(hold.outcome, 'blocked');
    assert.equal(hold.train.pre_existing_hold, true);
    assert.deepEqual(hold.train.evictions, []);
    assert.equal(hold.train.review_rounds, 0);
    const committed = ledgerLines(readCommitted(repo, git(repo, ['rev-parse', TRAIN_BRANCH]), 'data/ledger.jsonl'));
    assert.ok(committed.some((l) => l.id === asm.manifest.train && l.train.pre_existing_hold === true), 'the hold line is committed');
    // Exactly one upkeep proposal, named by the pre-train commit.
    const propDir = join(repo, 'data', 'proposals');
    const ours = readdirSync(propDir).filter((f) => f.startsWith('pre-train-'));
    assert.deepEqual(ours, [`pre-train-${short}-red.md`]);
    const prop = readCommitted(repo, git(repo, ['rev-parse', TRAIN_BRANCH]), `data/proposals/pre-train-${short}-red.md`);
    assert.match(prop, /slug: pre-train-[0-9a-f]+-red/);
    assert.match(prop, /type: repair/);
    assert.match(prop, new RegExp(mainTip));
    // No HOLD.md — the hold is a train state, not a Desk halt.
    assert.equal(existsSync(join(repo, 'HOLD.md')), false);
    // The reader agrees.
    assert.deepEqual(preExistingHold(ctxFor(repo)), { held: true, trainId: asm.manifest.train });
    // Never pushed.
    assert.equal(fx.remoteRefs(), '', 'the bare origin is empty: never pushed');
  } finally {
    fx.cleanup();
  }
});

test('pre-existing hold: a second run rewrites the one proposal and re-reports the line', async () => {
  const { fx, repo, asm } = buildPreExisting();
  try {
    const short = asm.manifest.mainTip.slice(0, 8);
    const run = () => runTrain(ctxFor(repo), {
      repo, trainId: asm.manifest.train, manifest: asm.manifest,
      gates: stubGates((dir) => existsSync(join(dir, 'content', 'base-red.md'))),
      rederive: stubRederive(), review: stubReview(), now: () => T0,
    });
    const first = await run();
    assert.equal(first.held, 'pre-existing');
    const second = await run();
    assert.equal(second.held, 'pre-existing', 'every run re-reports the hold');
    const ours = readdirSync(join(repo, 'data', 'proposals')).filter((f) => f.startsWith('pre-train-'));
    assert.deepEqual(ours, [`pre-train-${short}-red.md`], 'a second run rewrites rather than duplicates');
    const holds = readLedger(repo).filter((l) => l.id === asm.manifest.train);
    assert.equal(holds.length, 2, 'every run appends its own hold line');
    assert.ok(holds.every((l) => l.train.pre_existing_hold === true));
    assert.equal(existsSync(join(repo, 'HOLD.md')), false);
  } finally {
    fx.cleanup();
  }
});

test('merge lock under hold: admits up to size with a note, refuses beyond telling the worker', async () => {
  const { fx, repo } = buildPreExisting();
  try {
    assert.deepEqual(preExistingHold(ctxFor(repo)), { held: false, trainId: null }, 'no train line yet: unheld');
    const green = () => ({ ok: true, results: [], output: '' });
    git(repo, ['checkout', '--quiet', TRAIN_BRANCH]);
    for (const id of ['third-a', 'third-b', 'third-c']) {
      git(repo, ['checkout', '--quiet', 'main']);
      git(repo, ['checkout', '--quiet', '-b', `job/${id}`]);
      writeFileSync(join(repo, 'content', `${id}.md`), `# ${id}\n`, 'utf8');
      git(repo, ['add', '--', `content/${id}.md`]);
      git(repo, ['commit', '--quiet', '--no-verify', '-m', `work ${id}`]);
      git(repo, ['checkout', '--quiet', TRAIN_BRANCH]);
    }
    const merge = (branch, admission) => mergeJobBranch(ctxFor(repo), {
      repo, branch, baseRef: TRAIN_BRANCH,
      message: `job ${branch.slice(4)} (repair): waiting work`,
      tripwireBaseTip: null, gates: green(), lockWaitMs: 20000, admission,
    });
    // Two merges wait already; the lock refuses the third waiter past size 2.
    const refused = await merge('job/third-a', { held: true, maxMerges: 2 });
    assert.equal(refused.ok, false);
    assert.match(refused.reason, /held/);
    assert.match(refused.reason, /2 merges already wait \(limit 2\)/);
    assert.match(refused.reason, /nothing merged/);
    assert.equal(pendingMerges(repo).length, 2, 'the refused merge landed nowhere');
    // Within size it admits — and says the train is held (the telling).
    const admitted = await merge('job/third-b', { held: true, maxMerges: 5 });
    assert.equal(admitted.ok, true);
    assert.match(admitted.note ?? '', /held/);
    // Without admission the legacy unbounded behavior stands.
    const legacy = await merge('job/third-c');
    assert.equal(legacy.ok, true);
    assert.equal('note' in legacy, false);
    assert.equal(pendingMerges(repo).length, 4);
  } finally {
    fx.cleanup();
  }
});

// ---------------------------------------------------------------------------
// F2: early-latent defect — leave-one-out finds the early merge.
// ---------------------------------------------------------------------------

test('early-latent defect: leave-one-out evicts the earliest merge, then full gates + re-review + replay', async () => {
  const { fx, repo, asm, earliest, newest } = buildEarlyLatent();
  try {
    const mainBefore = git(repo, ['rev-parse', 'main']);
    const gates = stubGates((dir) => existsSync(join(dir, 'content', 'defect.md')));
    const review = stubReview();
    const tr = await runTrain(ctxFor(repo), {
      repo, trainId: asm.manifest.train, manifest: asm.manifest,
      gates, rederive: stubRederive(), review, now: () => T0,
    });
    assert.equal(tr.ok, true, tr.reason ?? 'evicted train refused');
    assert.deepEqual(tr.evicted, [earliest], 'the EARLY merge is evicted, not the newest');
    // The ordered search: full set on tip, full set on mainTip (green),
    // failing-gate-only trial in the train checkout, full set after
    // eviction, re-gate, gate-of-eviction replay elsewhere.
    assert.deepEqual(gates.calls.map((c) => c.scripts), [
      [...TRAIN_GATES],
      [...TRAIN_GATES],
      ['build'],
      [...TRAIN_GATES],
      ['build', 'verify-launch', 'verify-surfaces'],
      ['build'],
    ]);
    assert.equal(gates.calls[0].dir, repo, 'the red run gates the train tip');
    assert.equal(gates.calls[1].head, asm.manifest.mainTip, 'classification gates the pre-train commit');
    assert.equal(gates.calls[2].dir, repo, 'the removal trial runs in the train checkout');
    assert.deepEqual(gates.calls[3].scripts, [...TRAIN_GATES], 'post-eviction re-runs the FULL set — a failing-gate-only re-run is a finding');
    assert.notEqual(gates.calls[5].dir, repo, 'the replay runs off the train checkout');
    // The revert stands in history, newest-first never happened.
    const log = trainLog(repo);
    assert.ok(log.some((l) => l.startsWith(`Revert "job job-1`)), `the eviction revert is committed:\n${log.slice(0, 6).join('\n')}`);
    assert.ok(log.some((l) => l.startsWith(`train ${asm.manifest.train}: evict`)), 'the eviction mark is recommitted');
    // The re-review after eviction: one review, on the evicted tree, with
    // the eviction mark already on the manifest it was handed.
    assert.equal(review.seen.length, 1);
    assert.doesNotMatch(review.seen[0].diffText, /defect\.md/, 'the reviewed diff no longer carries the defect');
    assert.equal(review.seen[0].manifest.evictions.length, 1, 'the review saw the evicted train');
    assert.equal(review.seen[0].manifest.evictions[0].merge, earliest);
    // Ledger + manifest marks, committed.
    const head = git(repo, ['rev-parse', TRAIN_BRANCH]);
    const lines = ledgerLines(readCommitted(repo, head, 'data/ledger.jsonl'));
    const line = lines.find((l) => l.id === asm.manifest.train);
    assert.ok(line, 'the train line is committed');
    assert.equal(line.outcome, 'done');
    assert.equal(line.train.pre_existing_hold, false);
    assert.equal(line.train.evictions.length, 1);
    assert.equal(line.train.evictions[0].merge, earliest);
    assert.match(line.train.evictions[0].reason, /evicted-at-train/);
    const manifest = JSON.parse(readCommitted(repo, head, '.train/manifest.json'));
    assert.equal(manifest.evictions.length, 1);
    assert.equal(manifest.evictions[0].merge, earliest);
    assert.equal(manifest.evictions[0].wrongly, false, 'the replay verdict rides the manifest');
    // The replay audit: solo from main, gate of eviction only, recorded.
    assert.equal(tr.replay.length, 1);
    assert.equal(tr.replay[0].merge, earliest);
    assert.equal(tr.replay[0].wrongly, false, 'the defect truly lived in the evicted merge');
    assert.equal(tr.replay[0].recorded, true);
    assertAuditRecorded(repo, asm.manifest.train, earliest, false);
    // Nothing merges to main from the replay train: no ref, tip unmoved.
    assert.equal(git(repo, ['rev-parse', 'main']), mainBefore);
    assert.ok(!git(repo, ['branch', '--list']).split('\n').some((b) => b.includes('replay')), 'no replay ref left behind');
    assert.equal(fx.remoteRefs(), '', 'the bare origin is empty: never pushed');
    assert.equal(existsSync(join(repo, 'HOLD.md')), false);
  } finally {
    fx.cleanup();
  }
});

// ---------------------------------------------------------------------------
// F3: no single removal clears it — whole-train rejection.
// ---------------------------------------------------------------------------

test('no single removal clears it: whole-train rejection, nothing reverted, merges stay', async () => {
  const { fx, repo, asm } = buildNoSingleRemoval();
  try {
    const gates = stubGates((dir) => existsSync(join(dir, 'content', 'defect-a.md')) || existsSync(join(dir, 'content', 'defect-b.md')));
    const tr = await runTrain(ctxFor(repo), {
      repo, trainId: asm.manifest.train, manifest: asm.manifest,
      gates, rederive: stubRederive(), review: stubReview(), now: () => T0,
    });
    assert.equal(tr.ok, false);
    assert.equal(tr.rejected, true);
    assert.match(tr.reason, /no single removal clears build/);
    assert.deepEqual(tr.evictions, []);
    // Both removals were trialled (failing gate only, oldest first)…
    assert.deepEqual(gates.calls.map((c) => c.scripts), [[...TRAIN_GATES], [...TRAIN_GATES], ['build'], ['build']]);
    // …and nothing stands: no revert, merges still pending.
    assert.ok(!trainLog(repo).some((l) => l.startsWith('Revert')), 'no removal stands on a rejected train');
    assert.equal(pendingMerges(repo).length, 2, 'the un-reverted merges wait on train');
    // The rejection line: outcome failed, committed, no evictions.
    const head = git(repo, ['rev-parse', TRAIN_BRANCH]);
    const lines = ledgerLines(readCommitted(repo, head, 'data/ledger.jsonl'));
    const rej = lines.find((l) => l.id === asm.manifest.train);
    assert.ok(rej, 'the rejection line is committed');
    assert.equal(rej.outcome, 'failed');
    assert.deepEqual(rej.train.evictions, []);
    assert.equal(rej.train.pre_existing_hold, false);
    assert.equal(existsSync(join(repo, 'HOLD.md')), false);
    assert.equal(fx.remoteRefs(), '', 'the bare origin is empty: never pushed');
  } finally {
    fx.cleanup();
  }
});

// ---------------------------------------------------------------------------
// F4: date change mid-search refuses.
// ---------------------------------------------------------------------------

test('date change mid-search refuses: begun-date recorded, nothing evicted', async () => {
  const fx = trainRepo();
  try {
    const { repo } = fx;
    ensureTrainBranch(repo, 'main');
    admitJob(repo, 'job-1', { 'content/f1.md': '# one\n' });
    admitJob(repo, 'job-2', { 'content/late-defect.md': '# late defect\n' });
    git(repo, ['checkout', '--quiet', TRAIN_BRANCH]);
    const clock = { t: T0 };
    const asm = assembleTrain(repo, { trainId: 't-date', bounds: BOUNDS, now: () => clock.t });
    assert.equal(asm.ok, true, asm.reason ?? 'assembly refused');
    assert.equal(asm.manifest.begunDate, DAY0, 'the train records the local date it began under');
    const gates = stubGates((dir) => existsSync(join(dir, 'content', 'late-defect.md')));
    const raw = gates;
    const flipping = (ctx, dir, options) => {
      const scripts = options && options.scripts ? options.scripts : [];
      if (scripts.length === 1) clock.t = T1; // the day rolls over mid-search
      return raw(ctx, dir, options);
    };
    const tr = await runTrain(ctxFor(repo), {
      repo, trainId: asm.manifest.train, manifest: asm.manifest,
      gates: flipping, rederive: stubRederive(), review: stubReview(), now: () => clock.t,
    });
    assert.equal(tr.ok, false);
    assert.equal(tr.rejected, true);
    assert.match(tr.reason, /date change/);
    assert.deepEqual(tr.evictions, [], 'the true clearer is never evicted across the floor');
    assert.ok(!trainLog(repo).some((l) => l.startsWith('Revert')));
    const head = git(repo, ['rev-parse', TRAIN_BRANCH]);
    const lines = ledgerLines(readCommitted(repo, head, 'data/ledger.jsonl'));
    assert.ok(lines.some((l) => l.id === asm.manifest.train && l.outcome === 'failed'), 'the refusal is a recorded rejection');
    assert.equal(fx.remoteRefs(), '', 'the bare origin is empty: never pushed');
  } finally {
    fx.cleanup();
  }
});

// ---------------------------------------------------------------------------
// Units: begunDate, failingGateOf, appendTrainLine outcome, assembly shape.
// ---------------------------------------------------------------------------

test('checkBegunDate: same day passes, changed day and missing stamp refuse', () => {
  assert.equal(checkBegunDate({ begunDate: DAY0 }, () => T0).ok, true);
  const changed = checkBegunDate({ begunDate: DAY0 }, () => T1);
  assert.equal(changed.ok, false);
  assert.match(changed.reason, new RegExp(DAY0));
  const missing = checkBegunDate({}, () => T0);
  assert.equal(missing.ok, false);
  assert.match(missing.reason, /no begunDate/);
});

test('failingGateOf: first red script, null when unidentifiable', () => {
  assert.equal(failingGateOf({ results: [{ script: 'test', ok: true }, { script: 'build', ok: false }] }), 'build');
  assert.equal(failingGateOf({ results: [] }), null);
  assert.equal(failingGateOf({}), null);
  assert.equal(failingGateOf({ results: [{ script: 'test', ok: true }] }), null);
});

test('appendTrainLine: outcome rides through, default done, unknown refused', () => {
  const { repo, cleanup } = trainRepo();
  try {
    const ctx = ctxFor(repo);
    const base = { id: 't-o', runner: 'r', provider: 'p', tier: 't', mm: 0, gateSeconds: {}, train: { id: 't-o' } };
    assert.equal(appendTrainLine(ctx, base).outcome, 'done');
    assert.equal(appendTrainLine(ctx, { ...base, id: 't-o2', outcome: 'blocked' }).outcome, 'blocked');
    assert.equal(appendTrainLine(ctx, { ...base, id: 't-o3', outcome: 'failed' }).outcome, 'failed');
    assert.throws(() => appendTrainLine(ctx, { ...base, id: 't-o4', outcome: 'held' }), /not one of/, 'outside the frozen vocabulary refuses');
  } finally {
    cleanup();
  }
});

test('assembleTrain stamps begunDate and the empty eviction section', () => {
  const { repo, cleanup } = trainRepo();
  try {
    ensureTrainBranch(repo, 'main');
    admitJob(repo, 'job-1', { 'content/a.md': '# a\n' });
    git(repo, ['checkout', '--quiet', TRAIN_BRANCH]);
    const asm = assembleTrain(repo, { trainId: 't-stamp', bounds: BOUNDS, now: () => T0 });
    assert.equal(asm.ok, true, asm.reason ?? 'assembly refused');
    assert.equal(asm.manifest.begunDate, DAY0);
    assert.deepEqual(asm.manifest.evictions, []);
  } finally {
    cleanup();
  }
});

// ---------------------------------------------------------------------------
// Mutation A (row 39): assume-a-merge — only the pre-existing case fails.
// ---------------------------------------------------------------------------

test('mutation A — assume a merge did it: only the pre-existing case fails (restored byte-identical)', async () => {
  await withMutant(
    'redA',
    'const cls = classifyRedTrain(ctx, { repo, manifest, gates: fn });',
    "const cls = { ok: true, verdict: 'train-did-it' };",
    async (mutantTrain) => {
      // The pre-existing fixture no longer holds: the mutant searches a
      // train whose red predates every merge, clears nothing, and rejects.
      {
        const { fx, repo, asm } = buildPreExisting();
        try {
          const tr = await mutantTrain.runTrain(ctxFor(repo), {
            repo, trainId: asm.manifest.train, manifest: asm.manifest,
            gates: stubGates((dir) => existsSync(join(dir, 'content', 'base-red.md'))),
            rederive: stubRederive(), review: stubReview(), now: () => T0,
          });
          assert.equal(tr.held, undefined, 'the mutant never holds (the hold arm fails on the mutant)');
          assert.equal(tr.rejected, true, 'the mutant rejects the pre-existing train instead');
        } finally {
          fx.cleanup();
        }
      }
      // The early-latent fixture is unchanged: assuming the train did it
      // is CORRECT there, so the same early merge is still evicted.
      {
        const { fx, repo, asm, earliest } = buildEarlyLatent();
        try {
          const tr = await mutantTrain.runTrain(ctxFor(repo), {
            repo, trainId: asm.manifest.train, manifest: asm.manifest,
            gates: stubGates((dir) => existsSync(join(dir, 'content', 'defect.md'))),
            rederive: stubRederive(), review: stubReview(), now: () => T0,
          });
          assert.equal(tr.ok, true, tr.reason ?? 'mutant refused the train-did-it case');
          assert.deepEqual(tr.evicted, [earliest], 'only the pre-existing case fails on this mutant');
        } finally {
          fx.cleanup();
        }
      }
    },
  );
});

// ---------------------------------------------------------------------------
// Mutation B (row 39): newest-first — isolates the WRONG merge.
// ---------------------------------------------------------------------------

test('mutation B — newest-first search isolates the wrong merge (restored byte-identical)', async () => {
  await withMutant(
    'redB',
    'const search = leaveOneOutSearch(ctx, { repo, manifest, gates: fn, failingGate, now });',
    'const search = { ok: true, clearer: manifest.merges[manifest.merges.length - 1], untried: [] };',
    async (mutantTrain) => {
      const { fx, repo, asm, earliest, newest } = buildEarlyLatent();
      try {
        assert.notEqual(earliest, newest, 'the fixture separates the guilty from the newest');
        const review = stubReview();
        const tr = await mutantTrain.runTrain(ctxFor(repo), {
          repo, trainId: asm.manifest.train, manifest: asm.manifest,
          gates: stubGates((dir) => existsSync(join(dir, 'content', 'defect.md'))),
          rederive: stubRederive(), review, now: () => T0,
        });
        // The mutant "isolates" the newest — which is the answer "revert
        // the newest" gives, and the reason leave-one-out exists.
        const head = git(repo, ['rev-parse', TRAIN_BRANCH]);
        const manifest = JSON.parse(readCommitted(repo, head, '.train/manifest.json'));
        assert.equal(manifest.evictions.length, 1);
        assert.equal(manifest.evictions[0].merge, newest, 'newest-first names the wrong merge');
        assert.notEqual(manifest.evictions[0].merge, earliest);
        // Still red after evicting it (the defect lives in the earliest),
        // so the mutant train rejects — and its replay audit catches the
        // wrongful eviction: the newest alone passes its gate.
        assert.equal(tr.ok, false);
        assert.equal(tr.rejected, true);
        assert.equal(tr.replay.length, 1);
        assert.equal(tr.replay[0].merge, newest);
        assert.equal(tr.replay[0].wrongly, true, 'the audit flags the mutant eviction as made wrongly');
        assert.equal(tr.replay[0].recorded, true);
      } finally {
        fx.cleanup();
      }
    },
  );
});

// ---------------------------------------------------------------------------
// Row-40 mutation: never records the replay result — the audit fails.
// ---------------------------------------------------------------------------

test('row-40 mutation — unrecorded replay verdict fails the audit assertion (restored byte-identical)', async () => {
  await withMutant(
    'red40',
    'appendTrainLine(ctx, {\n    id: replayId,',
    'void (ctx, {\n    id: replayId,',
    async (mutantTrain) => {
      const { fx, repo, asm, earliest } = buildEarlyLatent();
      try {
        const tr = await mutantTrain.runTrain(ctxFor(repo), {
          repo, trainId: asm.manifest.train, manifest: asm.manifest,
          gates: stubGates((dir) => existsSync(join(dir, 'content', 'defect.md'))),
          rederive: stubRederive(), review: stubReview(), now: () => T0,
        });
        assert.equal(tr.ok, true, tr.reason ?? 'mutant refused the evicted train');
        assert.equal(tr.replay.length, 1);
        // The verdict was computed and the manifest rewritten, but the
        // ledger append was voided: the commit carries the manifest half
        // only, and the audit — which reads the LEDGER — fails.
        const head = git(repo, ['rev-parse', TRAIN_BRANCH]);
        const manifest = JSON.parse(readCommitted(repo, head, '.train/manifest.json'));
        assert.equal(manifest.evictions[0].wrongly, false, 'the mutant still computes the verdict');
        assert.throws(
          () => assertAuditRecorded(repo, asm.manifest.train, earliest, false),
          /replay line/,
          'the audit assertion fails when the replay result is never recorded',
        );
      } finally {
        fx.cleanup();
      }
    },
  );
});

// ---------------------------------------------------------------------------
// Assemble mutant: no begunDate stamp — the eviction arm fails.
// ---------------------------------------------------------------------------

test('assemble mutant — unstamped begunDate refuses the search (restored byte-identical)', async () => {
  await withMutant(
    'redDate',
    'begunDate: localDate(new Date(now())),',
    'begunDate: undefined,',
    async (mutantTrain) => {
      const fx = trainRepo();
      try {
        const { repo } = fx;
        ensureTrainBranch(repo, 'main');
        admitJob(repo, 'job-1', { 'content/defect.md': '# defect\n' });
        admitJob(repo, 'job-2', { 'content/j2.md': '# two\n' });
        git(repo, ['checkout', '--quiet', TRAIN_BRANCH]);
        const asm = mutantTrain.assembleTrain(repo, { trainId: 't-nostamp', bounds: BOUNDS, now: () => T0 });
        assert.equal(asm.ok, true, asm.reason ?? 'assembly refused');
        const tr = await mutantTrain.runTrain(ctxFor(repo), {
          repo, trainId: asm.manifest.train, manifest: asm.manifest,
          gates: stubGates((dir) => existsSync(join(dir, 'content', 'defect.md'))),
          rederive: stubRederive(), review: stubReview(), now: () => T0,
        });
        assert.equal(tr.ok, false);
        assert.equal(tr.rejected, true);
        assert.match(tr.reason, /no begunDate/, 'a search that cannot prove its date does not run');
        assert.deepEqual(tr.evictions, []);
      } finally {
        fx.cleanup();
      }
    },
  );
});

// ---------------------------------------------------------------------------
// No tracker from the train: neither the SUT nor this file invokes it.
// ---------------------------------------------------------------------------

test('no tracker from the train or its tests', () => {
  for (const [name, src] of [['train.mjs', SUT], ['train-red.test.mjs', readFileSync(join(HERE, 'train-red.test.mjs'), 'utf8')]]) {
    assert.doesNotMatch(src, /['"]bd['"]/, `${name} never names the tracker as a command`);
    assert.doesNotMatch(src, /spawnSync\(\s*['"`]bd\b/, `${name} never spawns the tracker`);
  }
});
