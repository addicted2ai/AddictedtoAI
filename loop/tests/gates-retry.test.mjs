/**
 * gates-retry.test.mjs — Stage-1 U6 (task 51, row 51): a gate failure is
 * retried once, and the record names which kind it was.
 *
 * - A job's tripwire retries its two gates (the pair, once) — NEW behavior,
 *   built at the `run.mjs` tripwire site and proved through `runLoop`.
 * - A train retries the FAILING GATE, never the set — via
 *   `withFailingGateRetry`, proved at the seam, through `runTrain`, and by
 *   the whole-set mutation failing the one-re-run assertion.
 * - The classification re-run is a measurement and consumes neither retry;
 *   single-gate probes never retry; lock refusals never retry (R1 pileup
 *   guard); a retry is never retried again.
 *
 * Q-S18 throughout: throwaway repositories in the OS temp directory,
 * stubbed gate seams (plain functions, no spawns — except the two `runLoop`
 * arms, which use the mock executor like every other `runLoop` test and
 * publish nothing: `publish: false`, no origin remote), no live model call,
 * never a live push. `HOLD.md` is never asserted here at all.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

import { TRAIN_GATES, failingGateScript, withFailingGateRetry } from '../lib/gates.mjs';
import {
  TRAIN_BRANCH,
  assembleTrain,
  ensureTrainBranch,
  pendingMerges,
  runTrain,
} from '../lib/train.mjs';
import { runLoop } from '../run.mjs';
import { readLedger } from '../lib/ledger.mjs';
import { makeRepo, writeQueue, mockCommand, runnersYaml } from './helpers.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, '..', '..');
const GATES_LIB = resolve(HERE, '..', 'lib', 'gates.mjs');

/* ---------------------------------------------------------------------------
 * Stub seams: `(ctx, dir, options) => result`, the contract every call site
 * already speaks. `options.scripts` is null for default-set calls.
 * ------------------------------------------------------------------------ */

const GREEN = { ok: true, results: [], output: '' };

function redOn(script, output = `boom on ${script}`) {
  return { ok: false, results: [{ script, ok: false, status: 1, output }], output };
}

function scriptStub(impl) {
  const calls = [];
  const fn = (ctx, dir, options) => {
    const scripts = options && options.scripts ? [...options.scripts] : null;
    calls.push({ dir, scripts, retryOf: options ? options.retryOf ?? null : null });
    return impl(scripts, calls.length, { ctx, dir });
  };
  fn.calls = calls;
  return fn;
}

const FULL = [...TRAIN_GATES];

/* ---------------------------------------------------------------------------
 * failingGateScript: the unit the retry reads.
 * ------------------------------------------------------------------------ */

test('failingGateScript names the first failing gate, null when none', () => {
  assert.equal(failingGateScript({ ok: false, results: [{ script: 'a', ok: true }, { script: 'b', ok: false }] }), 'b');
  assert.equal(failingGateScript({ ok: false, results: [{ script: 'a', ok: false }, { script: 'b', ok: false }] }), 'a');
  assert.equal(failingGateScript(GREEN), null);
  assert.equal(failingGateScript({ ok: false, results: [] }), null);
  assert.equal(failingGateScript(null), null);
});

/* ---------------------------------------------------------------------------
 * The one-re-run assertion (row 51's testable sentence), shared by the green
 * path and the whole-set mutation below.
 * ------------------------------------------------------------------------ */

function redBuildThenGreen() {
  return scriptStub((scripts, n) => {
    if (n === 1) {
      assert.deepEqual(scripts, FULL, 'the first run is the whole set');
      return redOn('build');
    }
    return GREEN;
  });
}

function assertOneRerunOfFailingGate(stub, record) {
  assert.equal(stub.calls.length, 2, 'exactly one re-run');
  assert.deepEqual(stub.calls[1].scripts, ['build'], 'one re-run OF THE FAILING GATE');
  assert.equal(record.kind, 'train-failing-gate', 'the record names which kind it was');
  assert.equal(record.gate, 'build');
  assert.equal(record.passed, true);
  assert.deepEqual(record.firstFailed, ['build']);
}

test('train retry: red-then-green re-runs only the failing gate', () => {
  const stub = redBuildThenGreen();
  const seen = [];
  const wrapped = withFailingGateRetry(stub, { onlyDir: '/train', onRetry: (r) => seen.push(r) });
  const out = wrapped({ log: () => {} }, '/train', { scripts: FULL });
  assert.equal(out.ok, true);
  assertOneRerunOfFailingGate(stub, out.retry);
  assert.deepEqual(seen, [out.retry], 'the caller observes the same record through onRetry');
});

test('train retry: red-red stops after the single attempt', () => {
  const stub = scriptStub(() => redOn('verify-surfaces'));
  const seen = [];
  const wrapped = withFailingGateRetry(stub, { onlyDir: '/train', onRetry: (r) => seen.push(r) });
  const out = wrapped({ log: () => {} }, '/train', { scripts: FULL });
  assert.equal(out.ok, false);
  assert.equal(stub.calls.length, 2);
  assert.deepEqual(stub.calls[1].scripts, ['verify-surfaces']);
  assert.equal(out.retry.passed, false);
  assert.equal(seen.length, 1);
});

test('train retry: green first runs once and records nothing', () => {
  const stub = scriptStub(() => GREEN);
  const seen = [];
  const wrapped = withFailingGateRetry(stub, { onlyDir: '/train', onRetry: (r) => seen.push(r) });
  const out = wrapped({ log: () => {} }, '/train', { scripts: FULL });
  assert.equal(out, GREEN, 'untouched result, no additive keys on the green path');
  assert.equal(stub.calls.length, 1);
  assert.deepEqual(seen, [], 'no retry, no record');
});

test('train retry: the failing gate need not be the first — the set is never re-run', () => {
  const stub = scriptStub((scripts, n) => {
    if (n === 1) {
      return {
        ok: false,
        results: [
          { script: 'build', ok: true, status: 0, output: '' },
          { script: 'verify-surfaces', ok: false, status: 1, output: 'surfaces red' },
        ],
        output: 'surfaces red',
      };
    }
    assert.deepEqual(scripts, ['verify-surfaces'], 'only the failing gate re-runs — build is not re-run');
    return GREEN;
  });
  const wrapped = withFailingGateRetry(stub, { onlyDir: '/train' });
  const out = wrapped({ log: () => {} }, '/train', { scripts: FULL });
  assert.equal(out.ok, true);
  assert.equal(stub.calls.length, 2);
});

/* ---------------------------------------------------------------------------
 * The refusal boundary (T30/R1): lock refusals never retry; single-gate
 * probes never retry; out-of-checkout measurements never retry; a retry is
 * never retried.
 * ------------------------------------------------------------------------ */

test('train retry: lock refusals never retry (R1 pileup guard)', () => {
  for (const [label, output] of [
    ['build-lock', 'build-lock: another build holds the lock. Waited 30s.'],
    ['test-lock', 'run-tests: TEST LOCK held by pid 1234'],
  ]) {
    const stub = scriptStub(() => redOn('build', output));
    const seen = [];
    const wrapped = withFailingGateRetry(stub, { onlyDir: '/train', onRetry: (r) => seen.push(r) });
    const out = wrapped({ log: () => {} }, '/train', { scripts: ['build', 'verify-surfaces'] });
    assert.equal(out.ok, false);
    assert.equal(stub.calls.length, 1, `${label}: no second wait on the same holder`);
    assert.deepEqual(seen, [], `${label}: no retry, no record`);
  }
});

test('train retry: single-gate probes never retry', () => {
  const stub = scriptStub(() => redOn('build'));
  const wrapped = withFailingGateRetry(stub, { onlyDir: '/train' });
  const out = wrapped({ log: () => {} }, '/train', { scripts: ['build'] });
  assert.equal(out.ok, false);
  assert.equal(stub.calls.length, 1, 'a leave-one-out trial / replay / rebuild stays a single run');
  assert.equal(out.retry, undefined, 'and carries no retry record');
});

test('train retry: out-of-checkout measurements consume neither retry', () => {
  // The classification shape: the full set, red, in a detached scratch
  // worktree rather than the train checkout.
  const stub = scriptStub(() => redOn('test'));
  const seen = [];
  const wrapped = withFailingGateRetry(stub, { onlyDir: '/train-checkout', onRetry: (r) => seen.push(r) });
  const out = wrapped({ log: () => {} }, '/scratch/atai-train-classify-xyz', { scripts: FULL });
  assert.equal(out.ok, false);
  assert.equal(stub.calls.length, 1, 'the classification re-run is a measurement: one run, no retry');
  assert.deepEqual(seen, [], 'nothing consumed, nothing recorded');
});

test('train retry: a retry is never retried (retryOf guard, double-wrap safe)', () => {
  const stub = scriptStub(() => redOn('build'));
  const inner = withFailingGateRetry(stub, { onlyDir: '/train' });
  const outer = withFailingGateRetry(inner, { onlyDir: '/train' });
  const out = outer({ log: () => {} }, '/train', { scripts: FULL });
  assert.equal(out.ok, false);
  // Outer: stub-through-inner (2 stub calls: run + inner retry), then the
  // outer's own retry arrives carrying retryOf and the inner passes it
  // through untouched: 3 stub calls total, never a cascade.
  assert.equal(stub.calls.length, 3, `no retry cascade, saw ${stub.calls.length} stub calls`);
});

test('train retry: a throwing onRetry never moves the gate path', () => {
  const stub = redBuildThenGreen();
  const wrapped = withFailingGateRetry(stub, {
    onlyDir: '/train',
    onRetry: () => { throw new Error('observer down'); },
  });
  const out = wrapped({ log: () => {} }, '/train', { scripts: FULL });
  assert.equal(out.ok, true);
  assert.equal(out.retry.kind, 'train-failing-gate');
});

test('train retry: non-function seam defaults to runGates (production shape, spawn-free)', () => {
  // The fixture worktree carries no `build` script and no node-gate files,
  // so both attempts fail before any spawn — the default path is observable
  // with no child process anywhere.
  const ctx = makeRepo({});
  try {
    const wrapped = withFailingGateRetry(undefined, { onlyDir: ctx.repoRoot });
    const out = wrapped(ctx, ctx.repoRoot, { scripts: ['verify-surfaces', 'build'] });
    assert.equal(out.ok, false);
    assert.equal(out.retry.kind, 'train-failing-gate');
    assert.equal(out.retry.gate, 'verify-surfaces', 'the first failing script is the one re-run');
    assert.equal(out.retry.passed, false);
  } finally {
    ctx.cleanup();
  }
});

/* ---------------------------------------------------------------------------
 * NAMED MUTATION 2 (row 51): retry-whole-set. The mutant re-runs the full
 * set; the one-re-run-of-the-failing-gate assertion must FAIL on it.
 * Copy-based, hash-restored, residue-free.
 * ------------------------------------------------------------------------ */

async function withGatesMutant(tag, search, replacement, fn) {
  const before = readFileSync(GATES_LIB, 'utf8');
  assert.ok(before.includes(search), 'mutant anchor present in the shipped file');
  const mutant = before.replace(search, replacement);
  assert.notEqual(mutant, before, 'the mutant must differ from the shipped file');
  const sha = createHash('sha256').update(before, 'utf8').digest('hex');
  const copyPath = resolve(HERE, '..', 'lib', `gates.mut-${process.pid}-${tag}.mjs`);
  writeFileSync(copyPath, mutant, 'utf8');
  try {
    await fn(await import(`./../lib/gates.mut-${process.pid}-${tag}.mjs`));
    assert.equal(
      createHash('sha256').update(readFileSync(GATES_LIB, 'utf8'), 'utf8').digest('hex'),
      sha,
      'tracked gates.mjs hash-identical after the mutant run',
    );
    assert.equal(readFileSync(GATES_LIB, 'utf8'), before, 'tracked gates.mjs byte-identical after the mutant run');
  } finally {
    rmSync(copyPath, { force: true });
  }
  assert.equal(existsSync(copyPath), false, 'the mutant copy is gone');
}

test('MUTATION retry-whole-set: the mutant fails the one-re-run assertion', async () => {
  await withGatesMutant(
    'wholeset',
    'const second = inner(ctx, dir, { ...(options || {}), scripts: [gate], retryOf: scripts });',
    'const second = inner(ctx, dir, { ...(options || {}), scripts: [...scripts], retryOf: scripts });',
    async (mutant) => {
      const stub = redBuildThenGreen();
      const wrapped = mutant.withFailingGateRetry(stub, { onlyDir: '/train' });
      const out = wrapped({ log: () => {} }, '/train', { scripts: FULL });
      assert.equal(out.ok, true, 'the mutant still passes (it over-runs, not mis-verdicts)');
      assert.throws(
        () => assertOneRerunOfFailingGate(stub, out.retry),
        /one re-run OF THE FAILING GATE/,
        'the one-re-run assertion fails on the whole-set mutant',
      );
      assert.deepEqual(stub.calls[1].scripts, FULL, 'the mutant re-ran the set');
    },
  );
});

/* ---------------------------------------------------------------------------
 * Through runTrain: the ordered run retries the failing gate, not the set.
 * Throwaway repo in the OS temp dir, real git plumbing, stubbed seams, stub
 * publish (never a push of any kind).
 * ------------------------------------------------------------------------ */

function git(dir, args) {
  return execFileSync('git', ['-C', dir, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

const BOUNDS = { merges: 5, minutes: 90, maxReviewedBytes: 150000, maxSubjects: 12, lockWaitSeconds: 1200 };

function trainRepo() {
  const root = mkdtempSync(join(tmpdir(), 'atai-u6-retry-'));
  const repo = join(root, 'repo');
  mkdirSync(repo, { recursive: true });
  git(repo, ['init', '--quiet']);
  git(repo, ['symbolic-ref', 'HEAD', 'refs/heads/main']);
  git(repo, ['config', 'user.email', 'train@example.invalid']);
  git(repo, ['config', 'user.name', 'Train Test']);
  git(repo, ['config', 'commit.gpgsign', 'false']);
  writeFileSync(join(repo, 'base.txt'), 'base\n', 'utf8');
  git(repo, ['add', '-A']);
  git(repo, ['commit', '--quiet', '--no-verify', '-m', 'base']);
  mkdirSync(join(repo, 'data', 'derived'), { recursive: true });
  writeFileSync(join(repo, 'data', 'derived', 'queue.json'), '[]\n', 'utf8');
  return { root, repo, cleanup: () => rmSync(root, { recursive: true, force: true }) };
}

function admitJob(repo, id, files) {
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
  git(repo, ['add', '--', ...paths]);
  git(repo, ['commit', '--quiet', '--no-verify', '-m', `work ${id}`]);
  git(repo, ['checkout', '--quiet', TRAIN_BRANCH]);
  git(repo, ['merge', '--quiet', '--no-ff', '--no-verify', '-m', `job ${id} (repair): ${id} work`, `job/${id}`]);
}

function stubRederive() {
  const state = { calls: 0 };
  const fn = async (ctx, dir) => {
    state.calls += 1;
    writeFileSync(join(dir, 'content', `regen-${state.calls}.md`), `# regenerated ${state.calls}\n`, 'utf8');
    return { ok: true };
  };
  fn.state = state;
  return fn;
}

function stubReview() {
  const fn = async () => ({
    verdict: 'approve', runner: 'stub-reviewer', provider: 'stub', tier: 'stub', findingsNotInAnyRecord: 0,
  });
  return fn;
}

test('runTrain through the wrapper: one re-run of the failing gate, the set never re-run', async () => {
  const { repo, cleanup } = trainRepo();
  try {
    admitJob(repo, 'job-1', { 'content/j1.md': '# j1\n' });
    git(repo, ['checkout', '--quiet', TRAIN_BRANCH]);
    assert.equal(pendingMerges(repo).length, 1);
    const oldest = pendingMerges(repo)[0].sha;
    const asm = assembleTrain(repo, { trainId: `t-${oldest.slice(0, 8)}`, bounds: BOUNDS });
    assert.equal(asm.ok, true, asm.reason ?? 'assembly refused');

    const stub = redBuildThenGreen();
    const seen = [];
    const logs = [];
    const ctx = {
      repoRoot: repo,
      ledgerPath: join(repo, 'data', 'ledger.jsonl'),
      now: () => new Date('2026-09-11T00:00:00.000Z'),
      log: (s) => logs.push(s),
    };
    const tr = await runTrain(ctx, {
      repo, trainId: asm.manifest.train, manifest: asm.manifest,
      gates: withFailingGateRetry(stub, { onlyDir: repo, onRetry: (r) => seen.push(r) }),
      rederive: stubRederive(),
      review: stubReview(),
      publish: async () => ({ published: false, reason: 'fixture: no publish step' }),
    });
    assert.equal(tr.ok, true, tr.reason ?? 'train refused');
    // The ordered run: full set, exactly one single-gate re-run, then the
    // post-records triple — the set is never re-run.
    assert.deepEqual(stub.calls.map((c) => c.scripts), [
      FULL,
      ['build'],
      ['build', 'verify-launch', 'verify-surfaces'],
    ]);
    assert.equal(seen.length, 1);
    assert.equal(seen[0].kind, 'train-failing-gate');
    assert.ok(logs.some((l) => l.includes('(kind train-failing-gate)')), 'the retry is logged with its kind');
  } finally {
    cleanup();
  }
});

/* ---------------------------------------------------------------------------
 * Through runLoop: the job tripwire retries its two gates (OQ7: NEW
 * behavior — cite runTripwire's single gates call and the previously
 * single runTripwire invocation). Red-then-green merges; red-red fails
 * after exactly one pair retry; the ledger note names the kind.
 * ------------------------------------------------------------------------ */

function tripwireSequenceStub(tripwireResults) {
  const calls = [];
  const fn = (ctx, dir, options) => {
    const atRoot = dir === ctx.repoRoot;
    const scripts = options && options.scripts ? [...options.scripts] : null;
    calls.push({ where: atRoot ? 'root' : 'worktree', scripts });
    if (atRoot) return GREEN;
    const wt = calls.filter((c) => c.where === 'worktree').length;
    if (wt === 1) return GREEN; // the branch gates
    return tripwireResults[Math.min(wt - 2, tripwireResults.length - 1)];
  };
  fn.calls = calls;
  return fn;
}

function jobRepo() {
  const ctx = makeRepo({
    runners: runnersYaml({
      command: mockCommand('done-edit'),
      reviewerCommand: mockCommand('review-approve'),
    }),
  });
  writeQueue(ctx, [{ type: 'repair', title: 'fix the fixture link', detail: 'a small repair' }]);
  return ctx;
}

const tripwireCalls = (gates) =>
  gates.calls.filter((c) => c.where === 'worktree' && c.scripts && c.scripts.join('+') === 'build+verify-surfaces');

test('tripwire red-then-green: the pair retries once and the job merges', async () => {
  const ctx = jobRepo();
  try {
    const gates = tripwireSequenceStub([redOn('build', 'tripwire red together'), GREEN]);
    const res = await runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', gates });
    assert.equal(res.outcome, 'done', ctx.output());
    assert.equal(tripwireCalls(gates).length, 2, 'the two tripwire gates ran twice: the run and its one pair retry');
    assert.match(ctx.output(), /kind job-tripwire-pair/, 'the log names the retry kind');
    const line = readLedger(ctx).at(-1);
    assert.match(line.note ?? '', /kind job-tripwire-pair/, 'the ledger note names the retry kind');
    assert.match(line.note ?? '', /passed/, 'and says the retry passed');
  } finally {
    ctx.cleanup();
  }
});

test('tripwire red-red: one pair retry, then an ordinary failure', async () => {
  const ctx = jobRepo();
  try {
    const gates = tripwireSequenceStub([redOn('build', 'tripwire red together'), redOn('build', 'still red')]);
    const res = await runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', gates });
    assert.equal(res.outcome, 'failed', ctx.output());
    assert.equal(tripwireCalls(gates).length, 2, 'single attempt: no third run');
    const line = readLedger(ctx).at(-1);
    assert.match(line.note ?? '', /kind job-tripwire-pair/, 'the ledger note names the retry kind');
    assert.match(line.note ?? '', /failed again/, 'and says the retry failed again');
  } finally {
    ctx.cleanup();
  }
});

/* ---------------------------------------------------------------------------
 * Structural: the wiring this round owns in run.mjs, and the twin pin.
 * ------------------------------------------------------------------------ */

test('structural: run.mjs installs the failing-gate wrapper on the train seam and retries the tripwire pair', () => {
  const runSrc = readFileSync(join(REPO_ROOT, 'loop', 'run.mjs'), 'utf8');
  assert.ok(
    runSrc.includes('gates: trainGates') && runSrc.includes('withFailingGateRetry(opts.gates'),
    'the train runs through the wrapped seam',
  );
  assert.ok(runSrc.includes('onlyDir: ctx.repoRoot'), 'the wrapper is pinned to the train checkout');
  const tripwireRuns = runSrc.split('runTripwire(ctx, { worktree, baseRef: TRAIN_BRANCH, gates: opts.gates })').length - 1;
  assert.equal(tripwireRuns, 2, 'the tripwire runs, then re-runs once as a pair on non-environmental red');
  const authorRuns = runSrc.split('gateResult = runTheGates()').length - 1;
  assert.equal(authorRuns, 2, 'the author pair retry stands untouched (run + one re-run)');
  assert.ok(
    runSrc.includes('manifest: asm.manifest, gates: opts.gates })') || runSrc.includes('gates: opts.gates }'),
    'the classification measures with the unwrapped seam — it consumes neither retry',
  );
  assert.ok(runSrc.includes('kind job-author-pair'), 'the author retry record names its kind');
});

test('structural: failingGateScript twins train.mjs failingGateOf', () => {
  const trainSrc = readFileSync(join(REPO_ROOT, 'loop', 'lib', 'train.mjs'), 'utf8');
  assert.ok(trainSrc.includes('export function failingGateOf(gateResult)'), 'the red-path twin exists');
  const probe = { ok: false, results: [{ script: 'build', ok: true }, { script: 'test', ok: false, status: 1 }] };
  assert.equal(failingGateScript(probe), 'test', 'both answer the same question the same way');
});

test('no mutant residue: loop/lib carries no *.mut-*.mjs copies', async () => {
  const { readdirSync } = await import('node:fs');
  const leftovers = readdirSync(resolve(HERE, '..', 'lib')).filter((f) => f.includes('.mut-'));
  assert.deepEqual(leftovers, [], `mutant residue: ${leftovers.join(', ')}`);
});
