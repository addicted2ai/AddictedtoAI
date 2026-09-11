/**
 * train-review.test.mjs — the witness for Stage-1 tasks 41, 42, 43, 44 (U4).
 *
 * Row-44 Q-S18 fixture policy throughout (binding on all of U4): a
 * throwaway repository with a bare origin in the OS temp directory, real
 * git plumbing, gate spawns stubbed through injection (the SUT takes the
 * gates function itself) AND reviewer invocations stubbed through the
 * `invoke` seam — no live model call in any train test, ever; no real
 * six-gate build; never a push of any kind (the bare origin is read for
 * emptiness, exactly as train-red does).
 *
 * Stubs and their STATED contracts:
 * - gates: records `{scripts}` per call, always green.
 * - rederive: counts calls, writes nothing, returns `{ok:true}` (the
 *   review loop never reaches it past the first pass; the stub only proves
 *   the SUT calls it once by staying at one).
 * - review (seam-level): scripted per-call verdicts (`stubReviewSeq`);
 *   records `{diffText, manifest}` per call.
 * - invoke (executor-level): records `{cwd, promptText}` per call, writes
 *   crafted verdict/comparison records to the paths the briefs name, and
 *   returns a runExecutor-shaped result. Two calls per sealed review —
 *   never the real `runExecutor`.
 *
 * Arms (each found by lookup):
 * - seal: the assembled brief carries the whole diff, the committed
 *   manifest (shas, job ids, subjects), every kind's checklist and the rung
 *   — and NONE of the per-job records' text.
 * - redaction: the sealed tree has the merge records REMOVED (names
 *   proved), is discarded unconditionally, leaves the branch tip unmoved;
 *   the comparison is a separate invocation with its own tree.
 * - protocol: missing record fails closed (`no-record`), malformed fails
 *   closed, prose without would-cite fails closed, repair approve passes.
 * - count: `findings_not_in_any_record` lands on the committed train line;
 *   the line's `review_rounds` stays the count; the committed manifest
 *   carries the `{verdict, tree}` history (restart-proof by re-read).
 * - eviction: a named merge is evicted with `evicted-at-train` + reason
 *   `review`, the FULL set + review re-run, then approval finishes.
 * - unnamed: a finding naming no merge rejects the whole train, nothing
 *   reverted.
 * - streak: two consecutive non-approvals over unchanged merges reject the
 *   whole train with no eviction; a manifest-only commit moves no tree.
 * - rung: missing or ambiguous reviewer-at-max fails the seam closed with
 *   no invocation; the default `review` is the sealed assembly.
 * - closure: LEDGER_FIELDS frozen, manifest keys exactly the declared set,
 *   no tracker, no model literal, never pushed.
 * - mutations A + B (row 44) plus one red arm per changed function beyond
 *   them (copy-based, each red then restored hash-identical).
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

import { TRAIN_GATES } from '../lib/gates.mjs';
import { LEDGER_FIELDS, appendLedger, makeLedgerLine } from '../lib/ledger.mjs';
import {
  assembleTrainReviewBrief,
  parseTrainComparison,
  parseTrainFindings,
  redactTrainRecords,
  reviewTrain,
  runTrainComparison,
  runTrainReview,
  trainComparisonPath,
  trainFindingsNamingMerges,
  trainKinds,
  trainReviewerRung,
  trainReviewGate,
  trainVerdictPath,
} from '../lib/review.mjs';
import {
  assembleTrain,
  consecutiveUnchangedNonApprovals,
  ensureTrainBranch,
  evictReviewNamed,
  recordTrainReviewRound,
  runTrain,
  sameMergeSet,
  trainReviewedTree,
  TRAIN_BRANCH,
} from '../lib/train.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REVIEW_LIB = resolve(HERE, '..', 'lib', 'review.mjs');
const TRAIN_LIB = resolve(HERE, '..', 'lib', 'train.mjs');

function git(dir, args, env) {
  return execFileSync('git', ['-C', dir, ...args], {
    encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
    ...(env ? { env: { ...process.env, ...env } } : {}),
  }).trim();
}

const BOUNDS = { merges: 5, minutes: 90, maxReviewedBytes: 150000, maxSubjects: 12, lockWaitSeconds: 1200 };
const T0 = Date.parse('2026-09-11T12:00:00');

/** Throwaway repo on `main` with a bare origin; clock fixed at T0. */
function trainRepo() {
  const root = mkdtempSync(join(tmpdir(), 'atai-trainrev-'));
  const repo = join(root, 'repo');
  const remote = join(root, 'origin.git');
  mkdirSync(repo, { recursive: true });
  git(repo, ['init', '--quiet']);
  git(repo, ['symbolic-ref', 'HEAD', 'refs/heads/main']);
  git(repo, ['config', 'user.email', 'trainrev@example.invalid']);
  git(repo, ['config', 'user.name', 'Train Review Test']);
  git(repo, ['config', 'commit.gpgsign', 'false']);
  writeFileSync(join(repo, 'base.txt'), 'base\n', 'utf8');
  git(repo, ['add', '-A']);
  git(repo, ['commit', '--quiet', '--no-verify', '-m', 'base']);
  execFileSync('git', ['init', '--quiet', '--bare', remote], { stdio: 'ignore' });
  git(repo, ['remote', 'add', 'origin', remote.replace(/\\/g, '/')]);
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

function ctxFor(repo) {
  return { repoRoot: repo, ledgerPath: join(repo, 'data', 'ledger.jsonl'), now: () => new Date(T0) };
}

/** Full Desk-shaped ctx for the sealed invocations (paths + log + clock). */
function ctxFull(fx, { runnersPath = null } = {}) {
  return {
    repoRoot: fx.repo,
    ledgerPath: join(fx.repo, 'data', 'ledger.jsonl'),
    reviewsDir: join(fx.repo, 'data', 'reviews'),
    worktreeRoot: join(fx.root, 'wt'),
    runnersPath: runnersPath ?? join(fx.root, 'no-such-registry.yml'),
    now: () => new Date(T0),
    log: () => {},
  };
}

/** Admit one repair job onto `train` with a parseable merge message. */
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

/** Per-job ledger lines through the real instrument (kinds come from here). */
function appendJobLines(repo, ids, type = 'repair') {
  const ctx = ctxFor(repo);
  for (const id of ids) {
    appendLedger(ctx, makeLedgerLine({
      id, type, runner: 'mock-frontier', provider: 'mock', tier: 'frontier',
      mm: 1, outcome: 'done', ts: '2026-09-11T00:00:00.000Z',
    }));
  }
}

/** Commit per-job verdict records onto the train branch (seal fixtures). */
function commitRecords(repo, entries) {
  for (const [name, text] of Object.entries(entries)) {
    const full = join(repo, 'data', 'reviews', name);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, text, 'utf8');
  }
  git(repo, ['add', '--', 'data/reviews']);
  git(repo, ['commit', '--quiet', '--no-verify', '-m', 'fixture per-job records']);
}

/** A minimal valid approve record (repair kind: prose fields unneeded). */
function approveRecord(job, { wouldCite = '', readsHuman = '', reasons = [], findings = null } = {}) {
  const fm = [
    '---',
    `job: ${job}`,
    'verdict: approve',
    `reasons: [${reasons.join(', ')}]`,
    `would-cite: ${JSON.stringify(wouldCite)}`,
  ];
  if (readsHuman) fm.push(`reads-human: ${JSON.stringify(readsHuman)}`);
  if (findings) {
    fm.push('findings:');
    for (const f of findings) {
      fm.push(`  - text: ${JSON.stringify(f.text)}`);
      fm.push(`    merges: [${(f.merges || []).map((m) => JSON.stringify(m)).join(', ')}]`);
    }
  }
  fm.push('---', '', 'notes here', '');
  return fm.join('\n');
}

function stubGates() {
  const calls = [];
  const fn = (ctx, dir, options) => {
    calls.push(options && options.scripts ? [...options.scripts] : null);
    return { ok: true, results: [], output: '' };
  };
  fn.calls = calls;
  return fn;
}

function stubRederive() {
  const state = { calls: 0 };
  const fn = async () => {
    state.calls += 1;
    return { ok: true, reason: 'stub' };
  };
  fn.state = state;
  return fn;
}

/** Seam-level review stub: one scripted verdict per call (last repeats). */
function stubReviewSeq(responses) {
  const seen = [];
  let n = 0;
  const fn = async ({ diffText, manifest, repo }) => {
    seen.push({ diffText, manifest, repo });
    const r = responses[Math.min(n, responses.length - 1)];
    n += 1;
    return { verdict: 'approve', runner: 'stub-reviewer', provider: 'stub', tier: 'stub', findingsNotInAnyRecord: 0, findings: [], ...r };
  };
  fn.seen = seen;
  return fn;
}

/** Executor-level stub: records invocations, writes crafted records. */
function stubInvoke({ onCall = null } = {}) {
  const seen = [];
  const fn = async ({ command, cwd, promptText, promptPath, timeoutMs, role, jobId, logPath }) => {
    seen.push({ cwd, promptText, promptPath, role, jobId });
    if (onCall) await onCall({ cwd, promptText });
    return { code: 0, killed: false, stdout: '', stderr: '', mm: 0, ms: 1, command: command ?? '', promptPath, logPath };
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

function trainLog(repo) {
  return git(repo, ['log', '--format=%s', TRAIN_BRANCH]).split('\n').filter(Boolean);
}

/** Copy-mutant harness for review.mjs (U1/U2 pattern, own tag family). */
async function withReviewMutant(tag, search, replacement, fn) {
  const before = readFileSync(REVIEW_LIB, 'utf8');
  const mutant = before.replace(search, replacement);
  assert.notEqual(mutant, before, `the mutant must differ from the shipped file (${tag})`);
  const sha = createHash('sha256').update(before, 'utf8').digest('hex');
  const copyPath = resolve(HERE, '..', 'lib', `review.mut-${process.pid}-u4r-${tag}.mjs`);
  writeFileSync(copyPath, mutant, 'utf8');
  try {
    await fn(await import(`./../lib/review.mut-${process.pid}-u4r-${tag}.mjs`));
    assert.equal(
      createHash('sha256').update(readFileSync(REVIEW_LIB, 'utf8'), 'utf8').digest('hex'),
      sha,
      `tracked review.mjs hash-identical after the mutant run (sha256 ${sha.slice(0, 12)}…)`,
    );
    assert.equal(readFileSync(REVIEW_LIB, 'utf8'), before, 'tracked review.mjs byte-identical after the mutant run');
  } finally {
    rmSync(copyPath, { force: true });
  }
  assert.equal(existsSync(copyPath), false, 'the mutant copy is gone');
  const residue = readdirSync(resolve(HERE, '..', 'lib')).filter((f) => f.startsWith(`review.mut-${process.pid}-u4r-`));
  assert.deepEqual(residue, [], 'no mutant residue of this file in loop/lib');
}

/** Copy-mutant harness for train.mjs (own tag family). */
async function withTrainMutant(tag, search, replacement, fn) {
  const before = readFileSync(TRAIN_LIB, 'utf8');
  const mutant = before.replace(search, replacement);
  assert.notEqual(mutant, before, `the mutant must differ from the shipped file (${tag})`);
  const sha = createHash('sha256').update(before, 'utf8').digest('hex');
  const copyPath = resolve(HERE, '..', 'lib', `train.mut-${process.pid}-u4t-${tag}.mjs`);
  writeFileSync(copyPath, mutant, 'utf8');
  try {
    await fn(await import(`./../lib/train.mut-${process.pid}-u4t-${tag}.mjs`));
    assert.equal(
      createHash('sha256').update(readFileSync(TRAIN_LIB, 'utf8'), 'utf8').digest('hex'),
      sha,
      `tracked train.mjs hash-identical after the mutant run (sha256 ${sha.slice(0, 12)}…)`,
    );
    assert.equal(readFileSync(TRAIN_LIB, 'utf8'), before, 'tracked train.mjs byte-identical after the mutant run');
  } finally {
    rmSync(copyPath, { force: true });
  }
  assert.equal(existsSync(copyPath), false, 'the mutant copy is gone');
  const residue = readdirSync(resolve(HERE, '..', 'lib')).filter((f) => f.startsWith(`train.mut-${process.pid}-u4t-`));
  assert.deepEqual(residue, [], 'no mutant residue of this file in loop/lib');
}

// ---------------------------------------------------------------------------
// Seal: the brief carries everything but the per-job records.
// ---------------------------------------------------------------------------

test('seal: brief carries diff + manifest + kind checklists + rung, none of the records', () => {
  const fx = trainRepo();
  try {
    const { repo } = fx;
    ensureTrainBranch(repo, 'main');
    admitJob(repo, 'job-1', { 'content/a.md': '# a\n' });
    admitJob(repo, 'job-2', { 'content/b.md': '# b\n' });
    appendJobLines(repo, ['job-1', 'job-2']);
    git(repo, ['checkout', '--quiet', TRAIN_BRANCH]);
    const asm = assembleTrain(repo, { trainId: 't-seal', bounds: BOUNDS, now: () => T0 });
    assert.equal(asm.ok, true, asm.reason ?? 'assembly refused');
    const probe1 = 'SEAL-PROBE-ALPHA-quux-2187';
    const probe2 = 'SEAL-PROBE-BETA-quux-4319';
    commitRecords(repo, {
      'job-1.md': approveRecord('job-1', { wouldCite: probe1 }),
      'job-2.md': approveRecord('job-2', { wouldCite: probe2 }),
    });
    const ctx = ctxFull(fx);
    const brief = assembleTrainReviewBrief(ctx, {
      trainId: 't-seal',
      diffText: '--- reviewed diff for train t-seal ---\nfiles:\ncontent/a.md\n',
      manifest: asm.manifest,
      kinds: ['repair'],
      rung: { id: 'stub-rung', provider: 'stub', tier: 'stub' },
      outPath: trainVerdictPath(ctx, 't-seal'),
      capMinutes: 1,
    });
    assert.match(brief, /content\/a\.md/, 'the whole diff rides the brief');
    for (const m of asm.manifest.merges) {
      assert.ok(brief.includes(String(m.sha).slice(0, 12)), 'every merge sha rides the brief');
      assert.ok(brief.includes(m.jobId), 'every job id rides the brief');
    }
    assert.match(brief, /Spot-check the changed rows/, 'the repair kind checklist rides the brief');
    assert.ok(brief.includes('stub-rung'), 'the registry rung rides the brief');
    assert.ok(!brief.includes(probe1), 'no per-job record text rides the brief (record 1)');
    assert.ok(!brief.includes(probe2), 'no per-job record text rides the brief (record 2)');
    assert.match(brief, /state this first/, 'the reviewer states received files first');
    assert.match(brief, /the seal has failed/, 'a readable record is a stop, not a shrug');
  } finally {
    fx.cleanup();
  }
});

test('seal: unknown kind refuses the assembly instead of inventing a checklist', () => {
  const fx = trainRepo();
  try {
    const ctx = ctxFull(fx);
    assert.throws(
      () => assembleTrainReviewBrief(ctx, {
        trainId: 't-x', diffText: 'd', manifest: { train: 't-x', merges: [] },
        kinds: ['not-a-kind'], rung: { id: 'r' }, outPath: 'o', capMinutes: 1,
      }),
      /no checklist/,
    );
    assert.throws(
      () => assembleTrainReviewBrief(ctx, {
        trainId: 't-x', diffText: 'd', manifest: { train: 't-x', merges: [] },
        kinds: [], rung: { id: 'r' }, outPath: 'o', capMinutes: 1,
      }),
      /no kinds/,
    );
  } finally {
    fx.cleanup();
  }
});

// ---------------------------------------------------------------------------
// Protocol: the ordinary refusals on the train record.
// ---------------------------------------------------------------------------

function gateCtx(fx) {
  return { repoRoot: fx.repo, reviewsDir: join(fx.repo, 'data', 'reviews'), now: () => new Date(T0), log: () => {} };
}

test('protocol: missing record fails closed with no-record', () => {
  const fx = trainRepo();
  try {
    const g = trainReviewGate(gateCtx(fx), { trainId: 't-missing', kinds: ['repair'], subjects: [] });
    assert.equal(g.ok, false);
    assert.equal(g.code, 'no-record');
    assert.match(g.reason, /no reviewer verdict recorded/);
  } finally {
    fx.cleanup();
  }
});

test('protocol: malformed record fails closed, repair approve passes', () => {
  const fx = trainRepo();
  try {
    const ctx = gateCtx(fx);
    mkdirSync(ctx.reviewsDir, { recursive: true });
    writeFileSync(join(ctx.reviewsDir, 't-bad.md'), '---\njob: t-bad\nverdict: maybe\n---\n\nnotes\n', 'utf8');
    const bad = trainReviewGate(ctx, { trainId: 't-bad', kinds: ['repair'], subjects: [] });
    assert.equal(bad.ok, false);
    assert.equal(bad.code, 'malformed-verdict');
    writeFileSync(join(ctx.reviewsDir, 't-ok.md'), approveRecord('t-ok'), 'utf8');
    const ok = trainReviewGate(ctx, { trainId: 't-ok', kinds: ['repair'], subjects: [] });
    assert.equal(ok.ok, true, ok.reason ?? 'a clean repair approve must pass');
  } finally {
    fx.cleanup();
  }
});

test('protocol: prose train without would-cite fails closed', () => {
  const fx = trainRepo();
  try {
    const ctx = gateCtx(fx);
    mkdirSync(ctx.reviewsDir, { recursive: true });
    writeFileSync(
      join(ctx.reviewsDir, 't-prose.md'),
      approveRecord('t-prose', { wouldCite: '', readsHuman: ' judgment in own words ' }),
      'utf8',
    );
    const g = trainReviewGate(ctx, { trainId: 't-prose', kinds: ['post'], subjects: [] });
    assert.equal(g.ok, false);
    assert.equal(g.code, 'would-cite-empty');
  } finally {
    fx.cleanup();
  }
});

test('protocol: unknown kind fails the gate closed', () => {
  const fx = trainRepo();
  try {
    const g = trainReviewGate(gateCtx(fx), { trainId: 't-x', kinds: ['not-a-kind'], subjects: [] });
    assert.equal(g.ok, false);
    assert.equal(g.code, 'unknown-kind');
    const empty = trainReviewGate(gateCtx(fx), { trainId: 't-x', kinds: [], subjects: [] });
    assert.equal(empty.ok, false);
    assert.equal(empty.code, 'no-kinds');
  } finally {
    fx.cleanup();
  }
});

// ---------------------------------------------------------------------------
// Units: kinds, rung, findings partition, tree, comparison parse.
// ---------------------------------------------------------------------------

test('kinds: ledger join per merge, unknown job fails closed', () => {
  const fx = trainRepo();
  try {
    const { repo } = fx;
    ensureTrainBranch(repo, 'main');
    admitJob(repo, 'job-1', { 'content/a.md': '# a\n' });
    git(repo, ['checkout', '--quiet', TRAIN_BRANCH]);
    const asm = assembleTrain(repo, { trainId: 't-kind', bounds: BOUNDS, now: () => T0 });
    assert.equal(asm.ok, true, asm.reason ?? 'assembly refused');
    const ctx = ctxFor(repo);
    const unknown = trainKinds(ctx, asm.manifest);
    assert.equal(unknown.ok, false);
    assert.match(unknown.reason, /no ledger line for merge job/);
    appendJobLines(repo, ['job-1']);
    const known = trainKinds(ctx, asm.manifest);
    assert.equal(known.ok, true);
    assert.deepEqual(known.kinds, ['repair']);
  } finally {
    fx.cleanup();
  }
});

test('rung: exactly one reviewer at max wins; zero or two fail closed', () => {
  const one = trainReviewerRung([
    { id: 'r-max', provider: 'p1', tier: 'cheap', roles: ['reviewer'], effort: 'max' },
    { id: 'r-other', provider: 'p2', tier: 'cheap', roles: ['reviewer'] },
    { id: 'r-auth', provider: 'p1', tier: 'cheap', roles: ['author'], effort: 'max' },
  ]);
  assert.equal(one.ok, true);
  assert.equal(one.rung.id, 'r-max');
  const none = trainReviewerRung([
    { id: 'r-other', provider: 'p2', tier: 'cheap', roles: ['reviewer'] },
  ]);
  assert.equal(none.ok, false);
  assert.match(none.reason, /no registry entry/);
  const two = trainReviewerRung([
    { id: 'r-a', provider: 'p1', tier: 'cheap', roles: ['reviewer'], effort: 'max' },
    { id: 'r-b', provider: 'p2', tier: 'cheap', roles: ['reviewer'], effort: 'max' },
  ]);
  assert.equal(two.ok, false);
  assert.match(two.reason, /ambiguous reviewer rung/);
  const disabled = trainReviewerRung([
    { id: 'r-off', provider: 'p1', tier: 'cheap', roles: ['reviewer'], effort: 'max', enabled: false },
  ]);
  assert.equal(disabled.ok, false, 'a disabled entry is not a rung');
});

test('findings: named by sha, short sha or job id; the rest is unnamed', () => {
  const manifest = {
    merges: [
      { sha: 'aaa1111222233334444', jobId: 'job-1', subjects: [] },
      { sha: 'bbb5555666677778888', jobId: 'job-2', subjects: [] },
    ],
  };
  const { findings } = parseTrainFindings({
    data: {
      findings: [
        { text: 'full sha names one', merges: ['aaa1111222233334444'] },
        { text: 'short sha names two', merges: ['bbb5555'] },
        { text: 'job id names one again', merges: ['job-1'] },
        { text: 'names nothing', merges: [] },
        { text: 'names a stranger', merges: ['zzz9999'] },
        { text: '  ', merges: ['aaa1111222233334444'] },
        'a bare string finding',
      ],
    },
  });
  assert.equal(findings.length, 6, 'the blank-text entry is dropped, the rest parse');
  const part = trainFindingsNamingMerges(findings, manifest);
  assert.deepEqual(part.named, ['aaa1111222233334444', 'bbb5555666677778888'], 'named in manifest order');
  assert.equal(part.unnamed.length, 3, 'empty, stranger and bare-string findings name no merge');
  const empty = parseTrainFindings({ data: {} });
  assert.deepEqual(empty.findings, []);
});

test('tree: manifest-only commits move nothing, content commits move it', () => {
  const fx = trainRepo();
  try {
    const { repo } = fx;
    ensureTrainBranch(repo, 'main');
    admitJob(repo, 'job-1', { 'content/a.md': '# a\n' });
    git(repo, ['checkout', '--quiet', TRAIN_BRANCH]);
    const asm = assembleTrain(repo, { trainId: 't-tree', bounds: BOUNDS, now: () => T0 });
    assert.equal(asm.ok, true, asm.reason ?? 'assembly refused');
    const t0 = trainReviewedTree(repo);
    assert.ok(t0 && t0.length === 64, 'a sha256 hex tree hash');
    const rec = recordTrainReviewRound(repo, asm.manifest, { verdict: 'revise', tree: t0 });
    assert.equal(rec.ok, true, rec.reason ?? 'round record refused');
    assert.deepEqual(asm.manifest.review_rounds, [{ verdict: 'revise', tree: t0 }]);
    assert.equal(trainReviewedTree(repo), t0, 'the round bookkeeping commit moves no reviewed tree');
    git(repo, ['checkout', '--quiet', 'main']);
    mkdirSync(join(repo, 'content'), { recursive: true });
    writeFileSync(join(repo, 'content', 'drift.md'), '# drift\n', 'utf8');
    git(repo, ['add', '--', 'content/drift.md']);
    git(repo, ['commit', '--quiet', '--no-verify', '-m', 'drift on main']);
    git(repo, ['checkout', '--quiet', TRAIN_BRANCH]);
    git(repo, ['merge', '--quiet', '--no-ff', '--no-verify', '-m', 'merge main (tree-changing)', 'main']);
    assert.notEqual(trainReviewedTree(repo), t0, 'a tree-changing main-merge moves the reviewed tree');
  } finally {
    fx.cleanup();
  }
});

test('streak: trailing same-tree non-approvals count, anything else resets', () => {
  const base = { merges: [{ sha: 'a' }, { sha: 'b' }] };
  assert.equal(consecutiveUnchangedNonApprovals({ ...base, review_rounds: [] }, ['a', 'b']), 0);
  assert.equal(consecutiveUnchangedNonApprovals({
    ...base, review_rounds: [{ verdict: 'revise', tree: 'T' }, { verdict: 'revise', tree: 'T' }],
  }, ['a', 'b']), 2);
  assert.equal(consecutiveUnchangedNonApprovals({
    ...base, review_rounds: [{ verdict: 'revise', tree: 'T1' }, { verdict: 'revise', tree: 'T2' }],
  }, ['a', 'b']), 1, 'an eviction between rounds moves the tree and resets');
  assert.equal(consecutiveUnchangedNonApprovals({
    ...base, review_rounds: [{ verdict: 'revise', tree: 'T' }, { verdict: 'approve', tree: 'T' }],
  }, ['a', 'b']), 0, 'an approval breaks the run');
  assert.equal(consecutiveUnchangedNonApprovals({
    ...base, review_rounds: [{ verdict: 'revise', tree: 'T' }, { verdict: 'revise', tree: 'T' }],
  }, ['a', 'b', 'c']), 0, 'a changed merge set resets even on one tree');
  assert.equal(sameMergeSet(['a', 'b'], ['b', 'a']), true);
  assert.equal(sameMergeSet(['a'], ['a', 'b']), false);
});

test('comparison: missing list parses, absent or blank fails closed', () => {
  const good = parseTrainComparison('---\ntrain: t-1\nmissing:\n  - "first miss"\n  - "second miss"\n---\n\nnotes\n');
  assert.equal(good.ok, true);
  assert.deepEqual(good.missing, ['first miss', 'second miss']);
  const none = parseTrainComparison('---\ntrain: t-1\nmissing: []\n---\n\nempty is an answer\n');
  assert.equal(none.ok, true);
  assert.deepEqual(none.missing, []);
  assert.equal(parseTrainComparison('').ok, false);
  assert.equal(parseTrainComparison('---\ntrain: t-1\n---\n\nno key\n').ok, false);
  assert.equal(parseTrainComparison('---\ntrain: t-1\nmissing:\n  - "kept"\n  - "  "\n---\n').ok, false, 'blank entries fail closed');
});

// ---------------------------------------------------------------------------
// Invocations: sealed review tree, separate comparison tree.
// ---------------------------------------------------------------------------

test('invocation: sealed tree redacts the merge records and is discarded', async () => {
  const fx = trainRepo();
  try {
    const { repo } = fx;
    ensureTrainBranch(repo, 'main');
    admitJob(repo, 'job-1', { 'content/a.md': '# a\n' });
    admitJob(repo, 'job-2', { 'content/b.md': '# b\n' });
    appendJobLines(repo, ['job-1', 'job-2']);
    const probe = 'REDACT-PROBE-quux-9021';
    commitRecords(repo, { 'job-1.md': approveRecord('job-1', { wouldCite: probe }) });
    git(repo, ['checkout', '--quiet', TRAIN_BRANCH]);
    const asm = assembleTrain(repo, { trainId: 't-sealed', bounds: BOUNDS, now: () => T0 });
    assert.equal(asm.ok, true, asm.reason ?? 'assembly refused');
    const ctx = ctxFull(fx);
    const outPath = trainVerdictPath(ctx, 't-sealed');
    const invoke = stubInvoke({
      onCall: ({ cwd, promptText }) => {
        const names = readdirSync(join(cwd, 'data', 'reviews'));
        assert.ok(!names.includes('job-1.md'), `the sealed tree carries no per-job record (saw ${names.join(',')})`);
        assert.ok(!promptText.includes(probe), 'the sealed brief carries no record text');
        writeFileSync(outPath, approveRecord('t-sealed'), 'utf8');
      },
    });
    const headBefore = git(repo, ['rev-parse', TRAIN_BRANCH]);
    const res = await runTrainReview(ctx, {
      trainId: 't-sealed', ref: headBefore, diffText: 'diff\n', manifest: asm.manifest,
      kinds: ['repair'], runner: { id: 'stub-rung', provider: 'stub', tier: 'stub', command: 'true' },
      capMinutes: 1, invoke,
    });
    assert.equal(res.recordWritten, true);
    assert.deepEqual(res.redacted.removed, ['job-1.md'], 'the removal is proved by name');
    assert.deepEqual(res.redacted.missing, ['job-2'], 'a merge with no record is reported, not failed');
    assert.equal(res.headUnchanged, true, 'the sealed run moves no branch tip');
    assert.equal(existsSync(join(ctx.worktreeRoot, 't-sealed-train-review')), false, 'the sealed tree is discarded');
    assert.equal(invoke.seen.length, 1);
    assert.ok(!invoke.seen[0].promptText.includes(probe));
    assert.equal(fx.remoteRefs(), '', 'the bare origin is empty: never pushed');
  } finally {
    fx.cleanup();
  }
});

test('invocation: comparison runs separately, unredacted, and is discarded', async () => {
  const fx = trainRepo();
  try {
    const { repo } = fx;
    ensureTrainBranch(repo, 'main');
    admitJob(repo, 'job-1', { 'content/a.md': '# a\n' });
    git(repo, ['checkout', '--quiet', TRAIN_BRANCH]);
    const asm = assembleTrain(repo, { trainId: 't-cmp', bounds: BOUNDS, now: () => T0 });
    assert.equal(asm.ok, true, asm.reason ?? 'assembly refused');
    const ctx = ctxFull(fx);
    const outPath = trainComparisonPath(ctx, 't-cmp');
    const probe = 'COMPARE-PROBE-quux-5577';
    const invoke = stubInvoke({
      onCall: ({ cwd, promptText }) => {
        assert.ok(promptText.includes(probe), 'the comparison sees the per-job records by design');
        assert.ok(promptText.includes('TRAIN-FINDING-quux-1133'), 'the comparison sees the train findings');
        void cwd;
        writeFileSync(outPath, '---\ntrain: t-cmp\nmissing:\n  - "TRAIN-FINDING-quux-1133"\n---\n\nnotes\n', 'utf8');
      },
    });
    const head = git(repo, ['rev-parse', TRAIN_BRANCH]);
    const res = await runTrainComparison(ctx, {
      trainId: 't-cmp', ref: head,
      trainRecordText: approveRecord('t-cmp', { findings: [{ text: 'TRAIN-FINDING-quux-1133', merges: [] }] }),
      perJobTexts: { 'job-1.md': approveRecord('job-1', { wouldCite: probe }) },
      runner: { id: 'stub-rung', provider: 'stub', tier: 'stub', command: 'true' },
      capMinutes: 1, invoke,
    });
    assert.equal(res.recordWritten, true);
    assert.equal(existsSync(join(ctx.worktreeRoot, 't-cmp-train-compare')), false, 'the comparison tree is discarded');
    const parsed = parseTrainComparison(readFileSync(outPath, 'utf8'));
    assert.deepEqual(parsed.missing, ['TRAIN-FINDING-quux-1133']);
  } finally {
    fx.cleanup();
  }
});

// ---------------------------------------------------------------------------
// Seam: the two invocations composed, fail-closed throughout.
// ---------------------------------------------------------------------------

function fixtureRegistry(root, runners) {
  const p = join(root, 'registry.yml');
  const body = ['version: 1', `default: ${runners[0].id}`, 'runners:']
    .concat(runners.flatMap((r) => [
      `  - id: ${r.id}`,
      `    provider: ${r.provider ?? 'p'}`,
      `    tier: ${r.tier ?? 'cheap'}`,
      `    roles: [${(r.roles ?? ['reviewer']).join(', ')}]`,
      ...(r.effort ? [`    effort: ${r.effort}`] : []),
      ...(r.enabled === false ? ['    enabled: false'] : []),
      `    command: '${r.command ?? 'true'}'`,
    ]))
    .join('\n') + '\n';
  writeFileSync(p, body, 'utf8');
  return p;
}

test('seam: two stubbed invocations approve with the comparison count', async () => {
  const fx = trainRepo();
  try {
    const { repo } = fx;
    ensureTrainBranch(repo, 'main');
    admitJob(repo, 'job-1', { 'content/a.md': '# a\n' });
    appendJobLines(repo, ['job-1']);
    const probe = 'SEAM-PROBE-quux-6644';
    commitRecords(repo, { 'job-1.md': approveRecord('job-1', { wouldCite: probe }) });
    git(repo, ['checkout', '--quiet', TRAIN_BRANCH]);
    const asm = assembleTrain(repo, { trainId: 't-seam', bounds: BOUNDS, now: () => T0 });
    assert.equal(asm.ok, true, asm.reason ?? 'assembly refused');
    const runnersPath = fixtureRegistry(fx.root, [
      { id: 'fixture-max', roles: ['reviewer'], effort: 'max' },
      { id: 'fixture-author', roles: ['author'] },
    ]);
    const ctx = ctxFull(fx, { runnersPath });
    const invoke = stubInvoke({
      onCall: ({ promptText }) => {
        if (promptText.startsWith('# Train comparison')) {
          writeFileSync(trainComparisonPath(ctx, 't-seam'), '---\ntrain: t-seam\nmissing:\n  - "miss one"\n  - "miss two"\n---\n\nnotes\n', 'utf8');
        } else {
          assert.ok(!promptText.includes(probe), 'the sealed invocation never sees record text');
          writeFileSync(trainVerdictPath(ctx, 't-seam'), approveRecord('t-seam'), 'utf8');
        }
      },
    });
    const seam = await reviewTrain(ctx, {
      diffText: '--- reviewed diff ---\nfiles:\ncontent/a.md\n',
      manifest: asm.manifest, repo, capMinutes: 1, invoke,
    });
    assert.equal(seam.verdict, 'approve', seam.reason ?? 'sealed seam refused');
    assert.equal(seam.runner, 'fixture-max', 'the rung is read, never named');
    assert.equal(seam.findingsNotInAnyRecord, 2, 'the comparison count rides the seam');
    assert.equal(invoke.seen.length, 2, 'two invocations: sealed review plus comparison');
    assert.notEqual(
      basename(invoke.seen[0].cwd), basename(invoke.seen[1].cwd),
      'each invocation runs in its own tree',
    );
    assert.equal(fx.remoteRefs(), '', 'the bare origin is empty: never pushed');
  } finally {
    fx.cleanup();
  }
});

test('seam: missing or ambiguous rung fails closed with no invocation', async () => {
  const fx = trainRepo();
  try {
    const { repo } = fx;
    ensureTrainBranch(repo, 'main');
    admitJob(repo, 'job-1', { 'content/a.md': '# a\n' });
    appendJobLines(repo, ['job-1']);
    git(repo, ['checkout', '--quiet', TRAIN_BRANCH]);
    const asm = assembleTrain(repo, { trainId: 't-rung', bounds: BOUNDS, now: () => T0 });
    assert.equal(asm.ok, true, asm.reason ?? 'assembly refused');
    const diffText = 'd';
    for (const [tag, runners] of [
      ['missing', [{ id: 'r-low', roles: ['reviewer'] }]],
      ['ambiguous', [
        { id: 'r-a', roles: ['reviewer'], effort: 'max' },
        { id: 'r-b', roles: ['reviewer'], effort: 'max' },
      ]],
    ]) {
      const runnersPath = fixtureRegistry(fx.root, runners);
      const ctx = ctxFull(fx, { runnersPath });
      const invoke = stubInvoke({
        onCall: () => { throw new Error(`no invocation may run on the ${tag}-rung path`); },
      });
      const seam = await reviewTrain(ctx, { diffText, manifest: asm.manifest, repo, capMinutes: 1, invoke });
      assert.equal(seam.verdict, 'reject', `${tag} rung must not approve`);
      assert.match(seam.reason, /fail closed/);
      assert.equal(invoke.seen.length, 0, `${tag} rung runs no invocation`);
    }
  } finally {
    fx.cleanup();
  }
});

test('seam: default review is the sealed assembly, failing closed without a registry', async () => {
  const fx = trainRepo();
  try {
    const { repo } = fx;
    ensureTrainBranch(repo, 'main');
    admitJob(repo, 'job-1', { 'content/a.md': '# a\n' });
    appendJobLines(repo, ['job-1']);
    git(repo, ['checkout', '--quiet', TRAIN_BRANCH]);
    const asm = assembleTrain(repo, { trainId: 't-def', bounds: BOUNDS, now: () => T0 });
    assert.equal(asm.ok, true, asm.reason ?? 'assembly refused');
    const tr = await runTrain(ctxFor(repo), {
      repo, trainId: asm.manifest.train, manifest: asm.manifest,
      gates: stubGates(), rederive: stubRederive(), now: () => T0,
    });
    assert.equal(tr.ok, false, 'no registry beside the fixture means no approval');
    assert.match(tr.reason, /registry|no-record|no train verdict|fail closed/, 'the refusal names the closed gate');
    assert.equal(fx.remoteRefs(), '', 'the bare origin is empty: never pushed');
  } finally {
    fx.cleanup();
  }
});

// ---------------------------------------------------------------------------
// Loop: count on the line, eviction, unnamed rejection, streak rejection.
// ---------------------------------------------------------------------------

test('loop: not-in-any-record count lands on the committed line', async () => {
  const fx = trainRepo();
  try {
    const { repo } = fx;
    ensureTrainBranch(repo, 'main');
    admitJob(repo, 'job-1', { 'content/a.md': '# a\n' });
    appendJobLines(repo, ['job-1']);
    git(repo, ['checkout', '--quiet', TRAIN_BRANCH]);
    const asm = assembleTrain(repo, { trainId: 't-count', bounds: BOUNDS, now: () => T0 });
    assert.equal(asm.ok, true, asm.reason ?? 'assembly refused');
    const gates = stubGates();
    const review = stubReviewSeq([{ findingsNotInAnyRecord: 7 }]);
    const tr = await runTrain(ctxFor(repo), {
      repo, trainId: asm.manifest.train, manifest: asm.manifest,
      gates, rederive: stubRederive(), review, now: () => T0,
    });
    assert.equal(tr.ok, true, tr.reason ?? 'counted train refused');
    assert.equal(review.seen.length, 1, 'one approval costs one review');
    const head = git(repo, ['rev-parse', TRAIN_BRANCH]);
    const lines = ledgerLines(readCommitted(repo, head, 'data/ledger.jsonl'));
    const line = lines.find((l) => l.id === asm.manifest.train);
    assert.ok(line, 'the train line is committed');
    assert.equal(line.train.findings_not_in_any_record, 7, 'the count lands on the line');
    assert.equal(line.train.review_rounds, 1, 'the line keeps the count');
    const manifest = JSON.parse(readCommitted(repo, head, '.train/manifest.json'));
    assert.equal(manifest.review_rounds.length, 1, 'the manifest holds the history');
    assert.equal(manifest.review_rounds[0].verdict, 'approve');
    assert.match(manifest.review_rounds[0].tree, /^[0-9a-f]{64}$/, 'the round carries the reviewed tree');
    assert.equal(fx.remoteRefs(), '', 'the bare origin is empty: never pushed');
  } finally {
    fx.cleanup();
  }
});

test('loop: named merge evicted with reason review, full gates and review re-run', async () => {
  const fx = trainRepo();
  try {
    const { repo } = fx;
    ensureTrainBranch(repo, 'main');
    admitJob(repo, 'job-1', { 'content/a.md': '# a\n' });
    admitJob(repo, 'job-2', { 'content/b.md': '# b\n' });
    appendJobLines(repo, ['job-1', 'job-2']);
    git(repo, ['checkout', '--quiet', TRAIN_BRANCH]);
    const asm = assembleTrain(repo, { trainId: 't-evict', bounds: BOUNDS, now: () => T0 });
    assert.equal(asm.ok, true, asm.reason ?? 'assembly refused');
    const named = asm.manifest.merges[0].sha;
    const gates = stubGates();
    const review = stubReviewSeq([
      { verdict: 'revise', reason: 'probe finding', findings: [{ text: 'defect in the first merge', merges: [named] }] },
      { verdict: 'approve' },
    ]);
    const tr = await runTrain(ctxFor(repo), {
      repo, trainId: asm.manifest.train, manifest: asm.manifest,
      gates, rederive: stubRederive(), review, now: () => T0,
    });
    assert.equal(tr.ok, true, tr.reason ?? 'evicted train refused');
    assert.equal(review.seen.length, 2, 'eviction triggers a re-review');
    assert.deepEqual(gates.calls[0], [...TRAIN_GATES], 'the first run gates the full set');
    assert.deepEqual(gates.calls[1], [...TRAIN_GATES], 'post-eviction re-runs the FULL set — failing-gate-only is a finding');
    assert.deepEqual(gates.calls[2], ['build', 'verify-launch', 'verify-surfaces'], 'then the post-records re-gate');
    const head = git(repo, ['rev-parse', TRAIN_BRANCH]);
    const manifest = JSON.parse(readCommitted(repo, head, '.train/manifest.json'));
    assert.equal(manifest.evictions.length, 1);
    assert.equal(manifest.evictions[0].merge, named);
    assert.match(manifest.evictions[0].reason, /evicted-at-train/, 'U3 marks ride the review eviction');
    assert.match(manifest.evictions[0].reason, /reason review/, 'the trigger vocabulary differs by name');
    const lines = ledgerLines(readCommitted(repo, head, 'data/ledger.jsonl'));
    const line = lines.find((l) => l.id === asm.manifest.train);
    assert.ok(line, 'the train line is committed');
    assert.equal(line.train.evictions.length, 1);
    assert.equal(line.train.evictions[0].merge, named);
    assert.equal(line.train.review_rounds, 2, 'both reviews count');
    assert.deepEqual(manifest.review_rounds.map((r) => r.verdict), ['revise', 'approve']);
    assert.ok(trainLog(repo).some((l) => l.startsWith('Revert "job job-1')), 'the eviction revert stands');
    assert.equal(fx.remoteRefs(), '', 'the bare origin is empty: never pushed');
  } finally {
    fx.cleanup();
  }
});

test('loop: finding naming no merge rejects the whole train, nothing reverted', async () => {
  const fx = trainRepo();
  try {
    const { repo } = fx;
    ensureTrainBranch(repo, 'main');
    admitJob(repo, 'job-1', { 'content/a.md': '# a\n' });
    appendJobLines(repo, ['job-1']);
    git(repo, ['checkout', '--quiet', TRAIN_BRANCH]);
    const asm = assembleTrain(repo, { trainId: 't-unnamed', bounds: BOUNDS, now: () => T0 });
    assert.equal(asm.ok, true, asm.reason ?? 'assembly refused');
    const review = stubReviewSeq([
      { verdict: 'revise', reason: 'vague unease', findings: [{ text: 'something feels off', merges: [] }] },
    ]);
    const tr = await runTrain(ctxFor(repo), {
      repo, trainId: asm.manifest.train, manifest: asm.manifest,
      gates: stubGates(), rederive: stubRederive(), review, now: () => T0,
    });
    assert.equal(tr.ok, false);
    assert.equal(tr.rejected, true);
    assert.match(tr.reason, /names no train merge/);
    assert.ok(!trainLog(repo).some((l) => l.startsWith('Revert')), 'no eviction without a named merge');
    const head = git(repo, ['rev-parse', TRAIN_BRANCH]);
    const lines = ledgerLines(readCommitted(repo, head, 'data/ledger.jsonl'));
    const rej = lines.find((l) => l.id === asm.manifest.train);
    assert.ok(rej, 'the rejection line is committed');
    assert.equal(rej.outcome, 'failed');
    assert.equal(fx.remoteRefs(), '', 'the bare origin is empty: never pushed');
  } finally {
    fx.cleanup();
  }
});

test('loop: two consecutive unchanged non-approvals reject with no eviction', async () => {
  const fx = trainRepo();
  try {
    const { repo } = fx;
    ensureTrainBranch(repo, 'main');
    admitJob(repo, 'job-1', { 'content/a.md': '# a\n' });
    appendJobLines(repo, ['job-1']);
    git(repo, ['checkout', '--quiet', TRAIN_BRANCH]);
    const asm = assembleTrain(repo, { trainId: 't-streak', bounds: BOUNDS, now: () => T0 });
    assert.equal(asm.ok, true, asm.reason ?? 'assembly refused');
    // A prior round already recorded against this same tree (a restart
    // re-reads it from memory here, from the committed manifest in
    // production): the next same-tree non-approval is the second.
    asm.manifest.review_rounds = [{ verdict: 'revise', tree: trainReviewedTree(repo) }];
    const named = asm.manifest.merges[0].sha;
    const review = stubReviewSeq([
      { verdict: 'revise', reason: 'still wrong', findings: [{ text: 'defect persists', merges: [named] }] },
    ]);
    const tr = await runTrain(ctxFor(repo), {
      repo, trainId: asm.manifest.train, manifest: asm.manifest,
      gates: stubGates(), rederive: stubRederive(), review, now: () => T0,
    });
    assert.equal(tr.ok, false);
    assert.equal(tr.rejected, true);
    assert.match(tr.reason, /two consecutive/);
    assert.ok(!trainLog(repo).some((l) => l.startsWith('Revert')), 'the streak rejects before any eviction');
    assert.equal(review.seen.length, 1, 'no re-review after a streak rejection');
    assert.equal(fx.remoteRefs(), '', 'the bare origin is empty: never pushed');
  } finally {
    fx.cleanup();
  }
});

// ---------------------------------------------------------------------------
// Closure: frozen ledger, declared manifest keys, no tracker, no model.
// ---------------------------------------------------------------------------

test('closure: LEDGER_FIELDS frozen, manifest keys exactly the declared set', async () => {
  const fx = trainRepo();
  try {
    assert.deepEqual([...LEDGER_FIELDS], ['ts', 'id', 'type', 'runner', 'provider', 'tier', 'mm', 'outcome']);
    const { repo } = fx;
    ensureTrainBranch(repo, 'main');
    admitJob(repo, 'job-1', { 'content/a.md': '# a\n' });
    appendJobLines(repo, ['job-1']);
    git(repo, ['checkout', '--quiet', TRAIN_BRANCH]);
    const asm = assembleTrain(repo, { trainId: 't-keys', bounds: BOUNDS, now: () => T0 });
    assert.equal(asm.ok, true, asm.reason ?? 'assembly refused');
    const tr = await runTrain(ctxFor(repo), {
      repo, trainId: asm.manifest.train, manifest: asm.manifest,
      gates: stubGates(), rederive: stubRederive(), review: stubReviewSeq([{}]), now: () => T0,
    });
    assert.equal(tr.ok, true, tr.reason ?? 'keyed train refused');
    const head = git(repo, ['rev-parse', TRAIN_BRANCH]);
    const committed = JSON.parse(readCommitted(repo, head, '.train/manifest.json'));
    assert.deepEqual(
      Object.keys(committed).sort(),
      ['baselinePaths', 'begunDate', 'bounds', 'evictions', 'mainTip', 'measuredPaths', 'merges', 'remainder', 'review_rounds', 'train'].sort(),
      'the manifest gains ONLY the row-43 pair-list',
    );
    assert.ok(!('assemblyTip' in committed), 'the in-memory tip pin is never committed');
  } finally {
    fx.cleanup();
  }
});

test('closure: no tracker, no model literal, no registry write in this diff', () => {
  const reviewSrc = readFileSync(REVIEW_LIB, 'utf8');
  const trainSrc = readFileSync(TRAIN_LIB, 'utf8');
  const selfSrc = readFileSync(join(HERE, 'train-review.test.mjs'), 'utf8');
  for (const [name, src] of [['review.mjs', reviewSrc], ['train.mjs', trainSrc], ['train-review.test.mjs', selfSrc]]) {
    assert.doesNotMatch(src, /['"]bd['"]/, `${name} never names the tracker as a command`);
    assert.doesNotMatch(src, /spawnSync\(\s*['"`]bd\b/, `${name} never spawns the tracker`);
  }
  // No model, provider or harness literal ON THE CODE PATH (row 43,
  // Q-S6): the rung is read from the registry and only ever interpolated
  // at runtime. Scoped to the new functions' sources rather than the whole
  // file, because pre-existing prose (e.g. a `CLAUDE.md` reference in an
  // old comment) names no model on any path.
  const codePath = [
    assembleTrainReviewBrief, trainReviewerRung, reviewTrain, runTrainReview,
    runTrainComparison, parseTrainComparison, trainReviewGate, parseTrainFindings,
    trainFindingsNamingMerges, redactTrainRecords, trainKinds,
    assembleTrain, trainReviewedTree, recordTrainReviewRound,
    consecutiveUnchangedNonApprovals, sameMergeSet, evictReviewNamed, runTrain,
  ].map((f) => f.toString()).join('\n');
  assert.doesNotMatch(codePath, /gpt|claude|codex|deepseek|muse-spark|anthropic|openai|openrouter|-luna/i, 'the train review path names no model, provider or harness');
  assert.ok(!reviewSrc.includes('runners.yml", "w') && !trainSrc.includes("runners.yml', 'w"), 'no registry write path');
});

// ---------------------------------------------------------------------------
// Mutation A (row 44): interpolate the per-job verdicts into the brief.
// ---------------------------------------------------------------------------

test('mutation A — verdicts interpolated: the seal assertion fails (restored byte-identical)', async () => {
  await withReviewMutant(
    'seal-leak',
    '## What you received — state this first\n',
    '## What you received — state this first\n\n${(() => { try { return readdirSync(ctx.reviewsDir).filter((f) => f.endsWith(".md")).map((f) => readFileSync(join(ctx.reviewsDir, f), "utf8")).join(" "); } catch (e) { return "noleak"; } })()}\n',
    async (mutantReview) => {
      const fx = trainRepo();
      try {
        const { repo } = fx;
        ensureTrainBranch(repo, 'main');
        admitJob(repo, 'job-1', { 'content/a.md': '# a\n' });
        appendJobLines(repo, ['job-1']);
        git(repo, ['checkout', '--quiet', TRAIN_BRANCH]);
        const asm = assembleTrain(repo, { trainId: 't-mutA', bounds: BOUNDS, now: () => T0 });
        assert.equal(asm.ok, true, asm.reason ?? 'assembly refused');
        const probe = 'MUTANT-A-PROBE-quux-7741';
        commitRecords(repo, { 'job-1.md': approveRecord('job-1', { wouldCite: probe }) });
        const ctx = ctxFull(fx);
        const brief = mutantReview.assembleTrainReviewBrief(ctx, {
          trainId: 't-mutA', diffText: 'd', manifest: asm.manifest,
          kinds: ['repair'], rung: { id: 'r' }, outPath: 'o', capMinutes: 1,
        });
        assert.ok(brief.includes(probe), 'the mutant brief leaks the record — the seal assertion goes red');
      } finally {
        fx.cleanup();
      }
    },
  );
});

// ---------------------------------------------------------------------------
// Mutation B (row 44): absent train-review record treated as approval.
// ---------------------------------------------------------------------------

test('mutation B — absent-as-approval: the missing record passes when it must not (restored byte-identical)', async () => {
  await withReviewMutant(
    'absent-approve',
    '    if (!g.ok) return g;\n',
    '    if (!g.ok && g.code !== "no-record") return g;\n    if (!g.ok) return { ok: true, verdict: { verdict: "approve", reasons: [], wouldCite: "mutant", readsHuman: "", readsHumanFrom: [], data: { findings: [] }, raw: "" } };\n',
    async (mutantReview) => {
      const fx = trainRepo();
      try {
        const g = mutantReview.trainReviewGate(gateCtx(fx), { trainId: 't-mutB', kinds: ['repair'], subjects: [] });
        assert.equal(g.ok, true, 'the mutant approves an absent record — approval goes green when it must not');
        const shipped = trainReviewGate(gateCtx(fx), { trainId: 't-mutB', kinds: ['repair'], subjects: [] });
        assert.equal(shipped.ok, false, 'the shipped gate still fails the absent record closed');
        assert.equal(shipped.code, 'no-record');
      } finally {
        fx.cleanup();
      }
    },
  );
});

// ---------------------------------------------------------------------------
// Red arms beyond A/B: one per changed function.
// ---------------------------------------------------------------------------

test('arms: redaction mutants keep the sealed tree sealed', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'atai-redact-'));
  try {
    writeFileSync(join(dir, 'job-1.md'), 'record', 'utf8');
    await withReviewMutant(
      'redact-skip',
      '        rmSync(join(worktreeReviewsDir, h));\n',
      '        void h;\n',
      async (mutantReview) => {
        const r = mutantReview.redactTrainRecords(dir, ['job-1']);
        assert.ok(existsSync(join(dir, 'job-1.md')), 'the record stands on the mutant — the removal arm goes red');
        assert.deepEqual(r.removed, ['job-1.md'], 'while the mutant still claims it');
      },
    );
    const shipped = redactTrainRecords(dir, ['job-1']);
    assert.deepEqual(shipped.removed, ['job-1.md'], 'the shipped redaction removes by name');
    assert.deepEqual(shipped.missing, []);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('arms: caller mutant that redacts nothing breaks the seal', async () => {
  await withReviewMutant(
    'caller-skip',
    '  const redacted = redactTrainRecords(join(reviewDir, rel), ((manifest && manifest.merges) || []).map((m) => m.jobId));\n',
    '  const redacted = redactTrainRecords(join(reviewDir, rel), []);\n',
    async (mutantReview) => {
      const fx = trainRepo();
      try {
        const { repo } = fx;
        ensureTrainBranch(repo, 'main');
        admitJob(repo, 'job-1', { 'content/a.md': '# a\n' });
        appendJobLines(repo, ['job-1']);
        commitRecords(repo, { 'job-1.md': approveRecord('job-1') });
        git(repo, ['checkout', '--quiet', TRAIN_BRANCH]);
        const asm = assembleTrain(repo, { trainId: 't-mutC', bounds: BOUNDS, now: () => T0 });
        assert.equal(asm.ok, true, asm.reason ?? 'assembly refused');
        const ctx = ctxFull(fx);
        const outPath = trainVerdictPath(ctx, 't-mutC');
        const invoke = stubInvoke({
          onCall: () => { writeFileSync(outPath, approveRecord('t-mutC'), 'utf8'); },
        });
        const res = await mutantReview.runTrainReview(ctx, {
          trainId: 't-mutC', ref: git(repo, ['rev-parse', TRAIN_BRANCH]), diffText: 'd',
          manifest: asm.manifest, kinds: ['repair'],
          runner: { id: 'r', provider: 'p', tier: 't', command: 'true' }, capMinutes: 1, invoke,
        });
        assert.deepEqual(res.redacted.removed, [], 'the mutant caller redacts nothing');
        assert.deepEqual(res.redacted.missing, [], 'and reports nothing missing either');
      } finally {
        fx.cleanup();
      }
    },
  );
});

test('arms: kinds mutant invents a checklist for an unknown job', async () => {
  await withReviewMutant(
    'kinds-drop',
    '    const t = byId.get(m && m.jobId);\n',
    "    const t = byId.get(m && m.jobId) || 'repair';\n",
    async (mutantReview) => {
      const g = mutantReview.trainKinds({ ledgerPath: '/no-such-ledger.jsonl' }, { merges: [{ sha: 'a', jobId: 'job-x' }] });
      assert.equal(g.ok, true, 'the mutant kinds the unknown job — the unknown-job arm goes green when it must not');
      const shipped = trainKinds({ ledgerPath: '/no-such-ledger.jsonl' }, { merges: [{ sha: 'a', jobId: 'job-x' }] });
      assert.equal(shipped.ok, false, 'the shipped join still fails the unknown job closed');
    },
  );
});

test('arms: rung mutant admits a non-max entry', async () => {
  await withReviewMutant(
    'rung-widen',
    "r.roles.includes('reviewer')",
    'true',
    async (mutantReview) => {
      const g = mutantReview.trainReviewerRung([
        { id: 'r-max', provider: 'p1', tier: 'cheap', roles: ['reviewer'], effort: 'max' },
        { id: 'r-authmax', provider: 'p2', tier: 'cheap', roles: ['author'], effort: 'max' },
      ]);
      assert.equal(g.ok, false, 'the mutant admits a non-reviewer — the single-rung arm goes red');
      assert.match(g.reason, /ambiguous/);
    },
  );
});

test('arms: comparison mutant that always reports zero', async () => {
  await withReviewMutant(
    'compare-zero',
    '  return { ok: true, missing };\n',
    '  return { ok: true, missing: [] };\n',
    async (mutantReview) => {
      const g = mutantReview.parseTrainComparison('---\nmissing:\n  - "a miss"\n---\n');
      assert.deepEqual(g.missing, [], 'the mutant zeroes the count — the count arm goes red');
    },
  );
});

test('arms: findings mutant that forgives blank text', async () => {
  await withReviewMutant(
    'parse-fallback',
    "    if (!text) {\n",
    "    if (false && !text) {\n",
    async (mutantReview) => {
      const { findings } = mutantReview.parseTrainFindings({ data: { findings: [{ text: '  ', merges: [] }] } });
      assert.equal(findings.length, 1, 'the mutant keeps the blank finding — the drop arm goes red');
    },
  );
});

test('arms: verdict-path mutant breaks the gate lookup', async () => {
  await withReviewMutant(
    'path-pass2',
    '  return verdictPath(ctx, trainId, 1);\n',
    '  return verdictPath(ctx, trainId, 2);\n',
    async (mutantReview) => {
      const fx = trainRepo();
      try {
        const ctx = gateCtx(fx);
        mkdirSync(ctx.reviewsDir, { recursive: true });
        writeFileSync(join(ctx.reviewsDir, 't-p.md'), approveRecord('t-p'), 'utf8');
        const g = mutantReview.trainReviewGate(ctx, { trainId: 't-p', kinds: ['repair'], subjects: [] });
        assert.equal(g.ok, false, 'the mutant looks beside the record — the pass arm goes red');
        assert.equal(g.code, 'no-record');
      } finally {
        fx.cleanup();
      }
    },
  );
});

test('arms: seam mutant that never reads the rung', async () => {
  await withReviewMutant(
    'seam-norung',
    '  const r = trainReviewerRung(runners);\n',
    '  const r = trainReviewerRung([]);\n',
    async (mutantReview) => {
      assert.ok(mutantReview.reviewTrain, 'the seam still exists on the mutant');
      const fx = trainRepo();
      try {
        const runnersPath = fixtureRegistry(fx.root, [
          { id: 'fixture-max', roles: ['reviewer'], effort: 'max' },
        ]);
        const ctx = ctxFull(fx, { runnersPath });
        const seam = await mutantReview.reviewTrain(ctx, { diffText: 'd', manifest: { train: 't-x', merges: [] }, repo: fx.repo, capMinutes: 1, invoke: stubInvoke() });
        assert.equal(seam.verdict, 'reject', 'the mutant cannot reach past the missing rung');
        assert.match(seam.reason, /no registry entry/);
      } finally {
        fx.cleanup();
      }
    },
  );
});

test('arms: tree mutant counts bookkeeping as content', async () => {
  await withTrainMutant(
    'tree-full',
    "    .filter((l) => l.trim() && !l.endsWith('\\t.train/manifest.json'));\n",
    '    .filter((l) => l.trim());\n',
    async (mutantTrain) => {
      const fx = trainRepo();
      try {
        const { repo } = fx;
        ensureTrainBranch(repo, 'main');
        admitJob(repo, 'job-1', { 'content/a.md': '# a\n' });
        git(repo, ['checkout', '--quiet', TRAIN_BRANCH]);
        const asm = assembleTrain(repo, { trainId: 't-mutT', bounds: BOUNDS, now: () => T0 });
        assert.equal(asm.ok, true, asm.reason ?? 'assembly refused');
        const t0 = mutantTrain.trainReviewedTree(repo);
        const rec = recordTrainReviewRound(repo, asm.manifest, { verdict: 'revise', tree: t0 });
        assert.equal(rec.ok, true);
        assert.notEqual(mutantTrain.trainReviewedTree(repo), t0, 'the mutant moves under the bookkeeping commit');
      } finally {
        fx.cleanup();
      }
    },
  );
});

test('arms: round mutant that never commits the history', async () => {
  await withTrainMutant(
    'round-nocommit',
    '  const cm = gitTry(repo, [\'commit\', \'--no-verify\', \'-m\', `train ${manifest.train}: review round ${n} (${verdict})`]);\n',
    '  const cm = { ok: true };\n',
    async (mutantTrain) => {
      const fx = trainRepo();
      try {
        const { repo } = fx;
        ensureTrainBranch(repo, 'main');
        admitJob(repo, 'job-1', { 'content/a.md': '# a\n' });
        git(repo, ['checkout', '--quiet', TRAIN_BRANCH]);
        const asm = assembleTrain(repo, { trainId: 't-mutR', bounds: BOUNDS, now: () => T0 });
        assert.equal(asm.ok, true, asm.reason ?? 'assembly refused');
        const rec = mutantTrain.recordTrainReviewRound(repo, asm.manifest, { verdict: 'approve', tree: 'T' });
        assert.equal(rec.ok, true, 'the mutant claims the record');
        const head = git(repo, ['rev-parse', TRAIN_BRANCH]);
        const committed = JSON.parse(readCommitted(repo, head, '.train/manifest.json'));
        assert.deepEqual(committed.review_rounds, [], 'nothing committed — the restart-proof arm goes red');
      } finally {
        fx.cleanup();
      }
    },
  );
});

test('arms: streak mutant that ignores the tree', async () => {
  await withTrainMutant(
    'streak-notree',
    "    if (rounds[i].verdict === 'approve' || rounds[i].tree !== tree) break;\n",
    "    if (rounds[i].verdict === 'approve') break;\n",
    async (mutantTrain) => {
      const n = mutantTrain.consecutiveUnchangedNonApprovals(
        { merges: [{ sha: 'a' }], review_rounds: [{ verdict: 'revise', tree: 'T1' }, { verdict: 'revise', tree: 'T2' }] },
        ['a'],
      );
      assert.equal(n, 2, 'the mutant counts across an eviction — the reset arm goes red');
    },
  );
});

test('arms: review-eviction mutant that skips the first named merge', async () => {
  await withTrainMutant(
    'evict-skipfirst',
    '  for (const sha of shas ?? []) {\n',
    '  for (const sha of (shas ?? []).slice(1)) {\n',
    async (mutantTrain) => {
      const fx = trainRepo();
      try {
        const { repo } = fx;
        ensureTrainBranch(repo, 'main');
        admitJob(repo, 'job-1', { 'content/a.md': '# a\n' });
        git(repo, ['checkout', '--quiet', TRAIN_BRANCH]);
        const asm = assembleTrain(repo, { trainId: 't-mutE', bounds: BOUNDS, now: () => T0 });
        assert.equal(asm.ok, true, asm.reason ?? 'assembly refused');
        const out = mutantTrain.evictReviewNamed({ repo, trainId: 't-mutE', manifest: asm.manifest, shas: [asm.manifest.merges[0].sha] });
        assert.equal(out.ok, true);
        assert.deepEqual(out.evictions, [], 'the mutant evicts nothing and calls it success');
      } finally {
        fx.cleanup();
      }
    },
  );
});

test('arms: unnamed-finding mutant that swallows whole-train rejection', async () => {
  await withTrainMutant(
    'unnamed-skip',
    '    if (unnamed.length) {\n',
    '    if (false) {\n',
    async (mutantTrain) => {
      const fx = trainRepo();
      try {
        const { repo } = fx;
        ensureTrainBranch(repo, 'main');
        admitJob(repo, 'job-1', { 'content/a.md': '# a\n' });
        appendJobLines(repo, ['job-1']);
        git(repo, ['checkout', '--quiet', TRAIN_BRANCH]);
        const asm = assembleTrain(repo, { trainId: 't-mutU', bounds: BOUNDS, now: () => T0 });
        assert.equal(asm.ok, true, asm.reason ?? 'assembly refused');
        const review = stubReviewSeq([
          { verdict: 'revise', reason: 'vague', findings: [{ text: 'off', merges: [] }] },
          { verdict: 'revise', reason: 'vague', findings: [{ text: 'off', merges: [] }] },
          { verdict: 'approve' },
        ]);
        const tr = await mutantTrain.runTrain(ctxFor(repo), {
          repo, trainId: asm.manifest.train, manifest: asm.manifest,
          gates: stubGates(), rederive: stubRederive(), review, now: () => T0,
        });
        assert.doesNotMatch(tr.reason ?? '', /names no train merge/, 'the mutant never rejects on unnamed findings');
      } finally {
        fx.cleanup();
      }
    },
  );
});

test('arms: assembly mutant that drops the pair-list', async () => {
  await withTrainMutant(
    'assembly-norounds',
    '    review_rounds: [],\n',
    '    review_rounds: undefined,\n',
    async (mutantTrain) => {
      const fx = trainRepo();
      try {
        const { repo } = fx;
        ensureTrainBranch(repo, 'main');
        admitJob(repo, 'job-1', { 'content/a.md': '# a\n' });
        git(repo, ['checkout', '--quiet', TRAIN_BRANCH]);
        const asm = mutantTrain.assembleTrain(repo, { trainId: 't-mutS', bounds: BOUNDS, now: () => T0 });
        assert.equal(asm.ok, true, asm.reason ?? 'assembly refused');
        assert.equal(asm.manifest.review_rounds, undefined, 'the mutant assembles no history');
      } finally {
        fx.cleanup();
      }
    },
  );
});

test('arms: merge-set mutant that never sees a new merge', async () => {
  await withTrainMutant(
    'set-always-same',
    '  return sa === sb;\n',
    '  return true;\n',
    async (mutantTrain) => {
      assert.equal(mutantTrain.sameMergeSet(['a'], ['a', 'b']), true, 'the mutant blinds the set half');
      assert.equal(sameMergeSet(['a'], ['a', 'b']), false, 'the shipped comparison still sees it');
    },
  );
});
