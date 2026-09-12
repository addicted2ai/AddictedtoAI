/**
 * train.test.mjs — the witness for Stage-1 tasks 35, 36, 37, 50
 * (U2, bead 938e).
 *
 * Row-37 Q-S18 fixture policy throughout: a throwaway repository in the OS
 * temp directory, real git plumbing, gate spawns stubbed through injection
 * (no `spawn` seam needed — the SUT takes the gates function itself), no
 * real six-gate build, never a push of any kind. The "remote-read"
 * assertions (mutation D) read the COMMITTED state (`git show <sha>:<path>`
 * in the fixture) — exactly what a remote would serve — because neither
 * the SUT (S2) nor the harness pushes anywhere: pushability is U5's
 * property, not U2's.
 *
 * Stubs and their STATED contracts (row-50 lesson applied: a stub whose
 * contract is the row's property, reviewed directly):
 * - gates: records `{scripts}` per call, always green. The SUT calls it
 *   twice (full TRAIN_GATES set, then build+launch+surfaces re-gate).
 * - rederive: counts calls; writes one COUNTED marker file per call
 *   (`content/regen-<n>.md` — the "regenerated data" the review must see,
 *   cf. mutation B); rewrites `data/derived/queue.json` dropping items
 *   whose job id has a ledger line (the batching property itself: a
 *   rederive recomputes the queue from a record that includes every
 *   finished job). Returns `{ok:true}`.
 * - review: records `{diffText, manifest}`; returns approve with reviewer
 *   identity and a zero not-in-any-record count (the 41–42 contract
 *   shape; U4 swaps the stub for the real assembly).
 *
 * Arms (each found by lookup):
 * - K: five merges trigger one train (full set once, rederive once,
 *   records commit, manifest first, declared SHA carries the records).
 * - T: two merges with the oldest backdated past `minutes` trigger.
 * - prefix: seven merges past B_train run on the fitting six.
 * - disjoint: overlapping subjects wait (API + runLoop wiring arms).
 * - idle/count/prefix/checkRecords unit arms (plain data, no fixtures).
 * - row-50: five lines, one rederive, none re-advertised; the
 *   rederive-before-fifth demonstration; the train-line copy-mutant.
 * - mutations A–D (copy-based, each red then restored hash-identical).
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

import { TRAIN_GATES } from '../lib/gates.mjs';
import { appendLedger, makeLedgerLine } from '../lib/ledger.mjs';
import { runLoop } from '../run.mjs';
import { makeRepo, runnersYaml, mockCommand, writeQueue, DEFAULT_CONFIG } from './helpers.mjs';
import {
  admissionOverlap,
  appendTrainLine,
  assembleTrain,
  checkRecordsPaths,
  countedPaths,
  dirtyPaths,
  ensureTrainBranch,
  evaluateTriggers,
  MANIFEST_PATH,
  mergeSubjects,
  pendingMerges,
  RECORDS_ALLOW,
  recordsPathAllowed,
  runTrain,
  selectFittingPrefix,
  TRAIN_BRANCH,
  unionSubjects,
} from '../lib/train.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const LIB = resolve(HERE, '..', 'lib', 'train.mjs');

function git(dir, args, env) {
  return execFileSync('git', ['-C', dir, ...args], {
    encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
    ...(env ? { env: { ...process.env, ...env } } : {}),
  }).trim();
}

const BOUNDS = { merges: 5, minutes: 90, maxReviewedBytes: 150000, maxSubjects: 12, lockWaitSeconds: 1200 };

/** Throwaway repo on `main`; ledger + queue seeded by the tests. */
function trainRepo() {
  const root = mkdtempSync(join(tmpdir(), 'atai-train-'));
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
  return { root, repo, cleanup: () => rmSync(root, { recursive: true, force: true }) };
}

function ctxFor(repo) {
  return { repoRoot: repo, ledgerPath: join(repo, 'data', 'ledger.jsonl'), now: () => new Date('2026-09-11T00:00:00.000Z') };
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
  // Exact paths ONLY, never `add -A`: a blanket add sweeps the fixture's
  // housekeeping files (seeded queue, appended ledger lines) into the job
  // commit, merging ledger history into `train` — and the next checkout
  // then refuses on the tracked-modified ledger. Same discipline as the
  // production records commit. Housekeeping stays untracked until the SUT
  // itself commits it.
  git(repo, ['add', '--', ...paths]);
  git(repo, ['commit', '--quiet', '--no-verify', '-m', `work ${id}`]);
  git(repo, ['checkout', '--quiet', TRAIN_BRANCH]);
  const env = date ? { GIT_AUTHOR_DATE: date, GIT_COMMITTER_DATE: date } : undefined;
  git(repo, ['merge', '--quiet', '--no-ff', '--no-verify', '-m', `job ${id} (repair): ${id} work`, `job/${id}`], env);
}

/** Per-job lines through the REAL ledger instrument (recordOutcome's path). */
function appendJobLines(repo, ids) {
  const ctx = ctxFor(repo);
  for (const id of ids) {
    appendLedger(ctx, makeLedgerLine({
      id, type: 'repair', runner: 'mock-frontier', provider: 'mock', tier: 'frontier',
      mm: 1, outcome: 'done', ts: '2026-09-11T00:00:00.000Z',
    }));
  }
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

/** The row-50 contract in five lines: drop lined jobs from the queue. */
function stubRederive() {
  const state = { calls: 0 };
  const fn = async (ctx, dir) => {
    state.calls += 1;
    writeFileSync(join(dir, 'content', `regen-${state.calls}.md`), `# regenerated ${state.calls}\n`, 'utf8');
    const qPath = join(dir, 'data', 'derived', 'queue.json');
    let items = [];
    try { items = JSON.parse(readFileSync(qPath, 'utf8')); } catch { items = []; }
    let lined = new Set();
    try {
      const ledger = readFileSync(join(dir, 'data', 'ledger.jsonl'), 'utf8');
      lined = new Set(ledger.split('\n').filter(Boolean).map((l) => { try { return JSON.parse(l).id; } catch { return null; } }));
    } catch { lined = new Set(); }
    writeFileSync(qPath, `${JSON.stringify(items.filter((it) => !lined.has(it.id)), null, 2)}\n`, 'utf8');
    return { ok: true, reason: 'stub', queueCount: items.length };
  };
  fn.state = state;
  return fn;
}

function stubReview(overrides = {}) {
  const seen = [];
  const fn = async ({ diffText, manifest, repo }) => {
    seen.push({ diffText, manifestPath: manifest });
    return { verdict: 'approve', runner: 'stub-reviewer', provider: 'stub', tier: 'stub', findingsNotInAnyRecord: 0, ...overrides };
  };
  fn.seen = seen;
  return fn;
}

function seedQueue(repo, ids) {
  mkdirSync(join(repo, 'data', 'derived'), { recursive: true });
  writeFileSync(join(repo, 'data', 'derived', 'queue.json'), `${JSON.stringify(ids.map((id) => ({ id, title: id })), null, 2)}\n`, 'utf8');
}

function readQueueIds(repo) {
  return JSON.parse(readFileSync(join(repo, 'data', 'derived', 'queue.json'), 'utf8')).map((it) => it.id);
}

/**
 * Read a path at a sha from the COMMITTED state (`git show`) — exactly
 * what a remote would serve. Missing (never committed there) reads as
 * empty, which IS the property: the records are missing at that SHA.
 */
function readCommitted(repo, sha, path) {
  try {
    return execFileSync('git', ['-C', repo, 'show', `${sha}:${path}`], { encoding: 'utf8' });
  } catch {
    return '';
  }
}

function readLedgerIds(repo) {
  return readFileSync(join(repo, 'data', 'ledger.jsonl'), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l).id);
}

// ---------------------------------------------------------------------------
// Unit arms (plain data — no fixtures needed).
// ---------------------------------------------------------------------------

test('countedPaths excludes derived and train machinery, keeps content and code', () => {
  assert.deepEqual(
    countedPaths(['content/a.md', 'loop/run.mjs', 'data/derived/queue.json', 'data/derived', '.train/manifest.json', '.train', 'data/ledger.jsonl']),
    ['content/a.md', 'loop/run.mjs', 'data/ledger.jsonl'],
  );
});

test('checkRecordsPaths admits the allow-list, refuses content', () => {
  assert.equal(checkRecordsPaths(['data/ledger.jsonl', 'data/reviews/r.md', 'data/carried/c.md', 'data/proposals/p.md']).ok, true);
  const bad = checkRecordsPaths(['data/ledger.jsonl', 'content/evil.md']);
  assert.equal(bad.ok, false);
  assert.match(bad.reason, /content\/evil\.md/);
});

test('recordsPathAllowed matches exact ledger and allow prefixes', () => {
  assert.equal(recordsPathAllowed('data/ledger.jsonl'), true);
  assert.equal(recordsPathAllowed('data/reviews/a/b.md'), true);
  assert.equal(recordsPathAllowed('content/a.md'), false);
  assert.equal(recordsPathAllowed('data/ledger.jsonl.evil'), false);
  for (const a of RECORDS_ALLOW) assert.ok(a.length > 0);
});

test('evaluateTriggers: K fires, T fires, idle fires, quiet stays quiet', () => {
  const nowS = 1000000;
  const old = [{ sha: 'a', ts: nowS - 100 * 60 }, { sha: 'b', ts: nowS - 10 * 60 }];
  assert.match(evaluateTriggers({ pending: [1, 2, 3, 4, 5].map((i) => ({ sha: String(i), ts: nowS })), bounds: BOUNDS, nowS, queueEmpty: false, admittedThisRun: true }).reason, /K trigger/);
  assert.match(evaluateTriggers({ pending: old, bounds: BOUNDS, nowS, queueEmpty: false, admittedThisRun: true }).reason, /T trigger/);
  assert.match(evaluateTriggers({ pending: [{ sha: 'a', ts: nowS - 60 }], bounds: BOUNDS, nowS, queueEmpty: true, admittedThisRun: false }).reason, /idle/);
  assert.equal(evaluateTriggers({ pending: [], bounds: BOUNDS, nowS, queueEmpty: true, admittedThisRun: false }).fire, false);
  assert.equal(evaluateTriggers({ pending: [{ sha: 'a', ts: nowS - 60 }], bounds: BOUNDS, nowS, queueEmpty: false, admittedThisRun: true }).fire, false);
  // A fresh solo merge with a non-empty queue never shortcuts K.
  assert.equal(evaluateTriggers({ pending: [{ sha: 'a', ts: nowS - 60 }], bounds: BOUNDS, nowS, queueEmpty: true, admittedThisRun: true }).fire, false);
});

test('selectFittingPrefix cuts at the first breach, remainder waits', () => {
  const mk = (sha, bytes, subjects) => ({ sha, bytes, subjects });
  const { admitted, remainder } = selectFittingPrefix(
    [mk('a', 60000, ['s1']), mk('b', 60000, ['s2']), mk('c', 60000, ['s3'])],
    BOUNDS,
  );
  assert.deepEqual(admitted.map((x) => x.sha), ['a', 'b']);
  assert.deepEqual(remainder.map((x) => x.sha), ['c']);
  const bySubjects = selectFittingPrefix(
    Array.from({ length: 13 }, (_, i) => mk(`m${i}`, 100, [`s${i}`])),
    BOUNDS,
  );
  assert.equal(bySubjects.admitted.length, 12);
  assert.equal(bySubjects.remainder.length, 1);
});

test('unionSubjects dedupes in first-seen order', () => {
  assert.deepEqual(unionSubjects([['a', 'b'], ['b', 'c'], []]), ['a', 'b', 'c']);
});

test('dirtyPaths parses staged, unstaged-modified and untracked lines byte-identical (addictedtoai-aw7j)', () => {
  // THE REGRESSION: dirtyPaths() read `l.trim().slice(3)`, so an unstaged
  // modification (` M data/...` — the leading space IS the X status) lost
  // its first path character (`data/ledger.jsonl` → `ata/ledger.jsonl`),
  // the allow-list filter yielded [], and the train's records commit died
  // with empty streams. Staged-only (`M `) and untracked (`?? `) parsed
  // correctly, which is why only the rederive-dirt path failed.
  const { repo, cleanup } = trainRepo();
  try {
    // One of each XY shape; the unstaged modification is the live defect
    // line itself — rederive dirt on the allow-listed ledger.
    mkdirSync(join(repo, 'data'), { recursive: true });
    writeFileSync(join(repo, 'data', 'ledger.jsonl'), '{"id":"a"}\n', 'utf8');
    writeFileSync(join(repo, 'data', 'staged.txt'), 'v1\n', 'utf8');
    git(repo, ['add', '--', 'data/ledger.jsonl', 'data/staged.txt']);
    git(repo, ['commit', '--quiet', '--no-verify', '-m', 'tracked pair']);
    writeFileSync(join(repo, 'data', 'staged.txt'), 'v2\n', 'utf8');
    git(repo, ['add', '--', 'data/staged.txt']);
    writeFileSync(join(repo, 'data', 'ledger.jsonl'), '{"id":"a"}\n{"id":"b"}\n', 'utf8');
    writeFileSync(join(repo, 'data', 'fresh.txt'), 'fresh\n', 'utf8');
    // Prove the fixture really covers all three shapes before asserting the parse.
    const raw = execFileSync('git', ['-C', repo, 'status', '--porcelain=v1', '-uall'], { encoding: 'utf8' });
    assert.match(raw, /^M {2}data\/staged\.txt\r?$/m, 'staged modification present');
    assert.match(raw, /^ M data\/ledger\.jsonl\r?$/m, 'unstaged modification present');
    assert.match(raw, /^\?\? data\/fresh\.txt\r?$/m, 'untracked file present');
    assert.deepEqual(
      dirtyPaths(repo).sort(),
      ['data/fresh.txt', 'data/ledger.jsonl', 'data/staged.txt'],
      'every shape round-trips byte-identical — no eaten first character',
    );
    assert.deepEqual(
      dirtyPaths(repo).filter((p) => recordsPathAllowed(p)),
      ['data/ledger.jsonl'],
      'the allow-list admits the ledger (pre-fix it saw ata/ledger.jsonl and yielded [])',
    );
  } finally {
    cleanup();
  }
});

// ---------------------------------------------------------------------------
// Fixture arms.
// ---------------------------------------------------------------------------

/** Drive one full happy-path train; returns the evidence. */
function happyTrain(repo, ids, { bounds = BOUNDS } = {}) {
  ensureTrainBranch(repo, 'main');
  seedQueue(repo, ids);
  ids.forEach((id, i) => {
    admitJob(repo, id, { [`content/j${i}.md`]: `# ${id}\n` });
    appendJobLines(repo, [id]);
  });
  git(repo, ['checkout', '--quiet', TRAIN_BRANCH]);
  assert.equal(pendingMerges(repo).length, ids.length);
  const oldest = pendingMerges(repo)[0].sha;
  const asm = assembleTrain(repo, { trainId: `t-${oldest.slice(0, 8)}`, bounds });
  assert.equal(asm.ok, true, asm.reason ?? 'assembly refused a fittable set');
  const gates = stubGates();
  const rederive = stubRederive();
  const review = stubReview();
  return { asm, gates, rederive, review };
}

test('K: five merges trigger one train — set once, rederive once, records once, manifest first', async () => {
  const { repo, cleanup } = trainRepo();
  try {
    const ids = ['job-1', 'job-2', 'job-3', 'job-4', 'job-5'];
    const { asm, gates, rederive, review } = happyTrain(repo, ids);
    const tr = await runTrain(ctxFor(repo), {
      repo, trainId: asm.manifest.train, manifest: asm.manifest,
      gates, rederive, review,
    });
    assert.equal(tr.ok, true, tr.reason ?? 'happy-path train refused');
    // The ordered run: full set, then build+launch+surfaces — nothing else.
    assert.deepEqual(gates.calls, [[...TRAIN_GATES], ['build', 'verify-launch', 'verify-surfaces']]);
    assert.equal(rederive.state.calls, 1, 'exactly one rederive per train');
    // The review saw the whole diff INCLUDING rederived data.
    assert.equal(review.seen.length, 1);
    assert.match(review.seen[0].diffText, /content\/regen-1\.md/, 'regenerated data rides the reviewed diff');
    assert.match(review.seen[0].diffText, /content\/j0\.md/, 'merged content rides the reviewed diff');
    // Manifest first: the reviewed tree carries it before any gate runs.
    const log = git(repo, ['log', '--format=%s', TRAIN_BRANCH]).split('\n');
    const manifestIdx = log.findIndex((l) => l.startsWith(`train ${asm.manifest.train}: manifest`));
    const recordsIdx = log.findIndex((l) => l.startsWith(`train ${asm.manifest.train}: records`));
    assert.ok(manifestIdx > recordsIdx && recordsIdx === 0, `manifest committed before the records commit:\n${log.slice(0, 4).join('\n')}`);
    assert.equal(asm.manifest.mainTip, git(repo, ['rev-parse', 'main']), 'manifest pins the main tip it was measured against');
    // Declared SHA carries the records — read from the COMMITTED state,
    // exactly what a remote would serve (no push anywhere in this file).
    const atSha = readCommitted(repo, tr.sha, 'data/ledger.jsonl');
    assert.match(atSha, new RegExp(`"id":"${asm.manifest.train}"`), 'the declared SHA carries the train line');
    // The records commit admits allow paths only.
    const names = execFileSync('git', ['-C', repo, 'show', '--name-only', '--format=', tr.sha], { encoding: 'utf8' })
      .split('\n').map((l) => l.trim()).filter(Boolean);
    assert.ok(names.length > 0, 'the records commit is non-empty');
    for (const n of names) assert.equal(recordsPathAllowed(n), true, `${n} rides the records commit`);
    // Row 50 inside K: five lines precede the single rederive, so none of
    // the five re-advertise.
    assert.deepEqual(readQueueIds(repo), [], 'no finished job re-advertised');
    assert.equal(readLedgerIds(repo).filter((id) => ids.includes(id)).length, 5);
  } finally {
    cleanup();
  }
});

test('T: two merges with an old first trigger a train on two', async () => {
  const { repo, cleanup } = trainRepo();
  try {
    ensureTrainBranch(repo, 'main');
    seedQueue(repo, ['job-a', 'job-b']);
    admitJob(repo, 'job-a', { 'content/a.md': '# a\n' }, { date: '2026-01-01T00:00:00Z' });
    appendJobLines(repo, ['job-a']);
    admitJob(repo, 'job-b', { 'content/b.md': '# b\n' });
    appendJobLines(repo, ['job-b']);
    git(repo, ['checkout', '--quiet', TRAIN_BRANCH]);
    const pending = pendingMerges(repo);
    assert.equal(pending.length, 2);
    const trig = evaluateTriggers({
      pending, bounds: BOUNDS, nowS: Math.floor(Date.now() / 1000),
      queueEmpty: false, admittedThisRun: true,
    });
    assert.equal(trig.fire, true, 'old pending work fires the train');
    assert.match(trig.reason, /T trigger/);
    const asm = assembleTrain(repo, { trainId: 't-old', bounds: BOUNDS });
    assert.equal(asm.ok, true, asm.reason ?? 'assembly refused');
    assert.equal(asm.manifest.merges.length, 2, 'the train runs on two');
    const tr = await runTrain(ctxFor(repo), {
      repo, trainId: asm.manifest.train, manifest: asm.manifest,
      gates: stubGates(), rederive: stubRederive(), review: stubReview(),
    });
    assert.equal(tr.ok, true, tr.reason ?? 'T-train refused');
  } finally {
    cleanup();
  }
});

test('prefix: seven merges past B_train run on the fitting six', () => {
  const { repo, cleanup } = trainRepo();
  try {
    ensureTrainBranch(repo, 'main');
    for (let i = 0; i < 7; i++) {
      // Exactly 25000 blob bytes each: six fit 150000, the seventh breaches.
      admitJob(repo, `job-p${i}`, { [`content/p${i}.md`]: `${'x'.repeat(24999)}\n` });
    }
    git(repo, ['checkout', '--quiet', TRAIN_BRANCH]);
    const asm = assembleTrain(repo, { trainId: 't-prefix', bounds: BOUNDS });
    assert.equal(asm.ok, true, asm.reason ?? 'assembly refused');
    assert.equal(asm.manifest.merges.length, 6, 'six 25KB merges fit 150000 bytes');
    assert.equal(asm.manifest.remainder.length, 1, 'the seventh waits for the next train');
  } finally {
    cleanup();
  }
});

test('disjoint: an overlapping job waits (API); disjoint proceeds', () => {
  const { repo, cleanup } = trainRepo();
  try {
    ensureTrainBranch(repo, 'main');
    admitJob(repo, 'job-old', { 'content/shared.md': '# shared\n' });
    git(repo, ['checkout', '--quiet', TRAIN_BRANCH]);
    assert.deepEqual(mergeSubjects(repo, pendingMerges(repo)[0].sha), ['content/shared.md']);
    const hit = admissionOverlap(repo, ['content/shared.md', 'content/other.md']);
    assert.equal(hit.overlap, true);
    assert.deepEqual(hit.with, ['content/shared.md']);
    assert.equal(admissionOverlap(repo, ['content/other.md']).overlap, false);
    assert.equal(admissionOverlap(repo, []).overlap, false, 'a subject-less job never overlaps');
  } finally {
    cleanup();
  }
});

test('appendTrainLine: frozen base fields plus the one additive train key', () => {
  const { repo, cleanup } = trainRepo();
  try {
    const line = appendTrainLine(ctxFor(repo), {
      id: 't-shape', runner: 'r', provider: 'p', tier: 't', mm: 0.5,
      gateSeconds: { full: 1.5 },
      train: { id: 't-shape', merges: ['a'], gate_seconds: {}, evictions: [], pre_existing_hold: false, findingsNotInAnyRecord: 0, review_rounds: 1 },
    });
    assert.deepEqual(Object.keys(line).slice(0, 8), ['ts', 'id', 'type', 'runner', 'provider', 'tier', 'mm', 'outcome']);
    assert.equal(line.type, 'train');
    assert.deepEqual(line.train.merges, ['a']);
    const back = JSON.parse(readFileSync(join(repo, 'data', 'ledger.jsonl'), 'utf8').trim().split('\n').pop());
    assert.equal(back.train.review_rounds, 1);
  } finally {
    cleanup();
  }
});

test('tip moved mid-train refuses: the reviewed set is no longer admitted', async () => {
  const { repo, cleanup } = trainRepo();
  try {
    const { asm } = happyTrain(repo, ['job-1', 'job-2']);
    admitJob(repo, 'job-late', { 'content/late.md': '# late\n' });
    git(repo, ['checkout', '--quiet', TRAIN_BRANCH]);
    const tr = await runTrain(ctxFor(repo), {
      repo, trainId: asm.manifest.train, manifest: asm.manifest,
      gates: stubGates(), rederive: stubRederive(), review: stubReview(),
    });
    assert.equal(tr.ok, false, 'a moved tip must refuse the train');
    assert.match(tr.reason, /moved mid-run/);
  } finally {
    cleanup();
  }
});

test('row-50 order demonstration: a line missing at rederive re-advertises', async () => {
  // Driver reorder, NOT a code mutant (labeled as such): the SUT ordering
  // guarantee is temporal across runs (recordOutcome at merge time always
  // precedes any later train rederive), so no single-function mutant can
  // express "rederive before the fifth append". The copy-mutant half is
  // the next test. What this pins: the stub rederive reads the CURRENT
  // ledger, so exactly the missing line's job re-advertises.
  const { repo, cleanup } = trainRepo();
  try {
    const ids = ['job-1', 'job-2', 'job-3', 'job-4', 'job-5'];
    ensureTrainBranch(repo, 'main');
    seedQueue(repo, ids);
    ids.forEach((id, i) => admitJob(repo, id, { [`content/q${i}.md`]: `# ${id}\n` }));
    appendJobLines(repo, ids.slice(0, 4));
    git(repo, ['checkout', '--quiet', TRAIN_BRANCH]);
    const asm = assembleTrain(repo, { trainId: 't-order', bounds: BOUNDS });
    assert.equal(asm.ok, true, asm.reason ?? 'assembly refused');
    const rederive = stubRederive();
    const tr = await runTrain(ctxFor(repo), {
      repo, trainId: asm.manifest.train, manifest: asm.manifest,
      gates: stubGates(), rederive, review: stubReview(),
    });
    assert.equal(tr.ok, true, tr.reason ?? 'order-demo train refused');
    assert.equal(rederive.state.calls, 1);
    assert.deepEqual(readQueueIds(repo), ['job-5'], 'exactly the missing line re-advertises');
  } finally {
    cleanup();
  }
});

test('row-50 copy-mutant: no train line without the append (restored hash-identical)', async () => {
  const before = readFileSync(LIB, 'utf8');
  const mutant = before.replace('line.train = train;', 'line.train = undefined;');
  assert.notEqual(mutant, before, 'the mutant must differ from the shipped file');
  const sha = createHash('sha256').update(before, 'utf8').digest('hex');
  const copyPath = resolve(HERE, '..', 'lib', `train.mut-${process.pid}-r50.mjs`);
  writeFileSync(copyPath, mutant, 'utf8');
  try {
    const mutantTrain = await import(`./../lib/train.mut-${process.pid}-r50.mjs`);
    const { repo, cleanup } = trainRepo();
    try {
      const { asm } = happyTrain(repo, ['job-1']);
      const tr = await mutantTrain.runTrain(ctxFor(repo), {
        repo, trainId: asm.manifest.train, manifest: asm.manifest,
        gates: stubGates(), rederive: stubRederive(), review: stubReview(),
      });
      assert.equal(tr.ok, true, 'the mutant still passes (it drops data, not the verdict)');
      const last = JSON.parse(readFileSync(join(repo, 'data', 'ledger.jsonl'), 'utf8').trim().split('\n').pop());
      assert.equal(last.id, asm.manifest.train);
      assert.equal(last.train, undefined, 'the mutant train line carries no train key (the arm fails on the mutant)');
    } finally {
      cleanup();
    }
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
});

/** Copy-mutant harness (U1 pattern): same-dir copy, fresh import, residue scan. */
async function withMutant(tag, search, replacement, fn) {
  const before = readFileSync(LIB, 'utf8');
  const mutant = before.replace(search, replacement);
  assert.notEqual(mutant, before, `the mutant must differ from the shipped file (${search.slice(0, 60)}…)`);
  const sha = createHash('sha256').update(before, 'utf8').digest('hex');
  // Tagged path: Node ESM caches by URL within the process, so every mutant
  // in this file needs its OWN copy path — reusing one URL silently
  // re-imports the first mutant's module (caught during authoring: B/C/D
  // executed A's code).
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
}

test('mutation A — rederive per merge: the single-recomputation arm fails', async () => {
  await withMutant('A', 'rd = await rederive(ctx, repo);', 'rd = await rederive(ctx, repo); await rederive(ctx, repo);', async (mutantTrain) => {
    const { repo, cleanup } = trainRepo();
    try {
      const { asm } = happyTrain(repo, ['job-1']);
      const rederive = stubRederive();
      const tr = await mutantTrain.runTrain(ctxFor(repo), {
        repo, trainId: asm.manifest.train, manifest: asm.manifest,
        gates: stubGates(), rederive, review: stubReview(),
      });
      assert.equal(tr.ok, true, 'the mutant still passes (it over-recomputes, not mis-verdicts)');
      assert.equal(rederive.state.calls, 2, 'mutant rederives twice (the exactly-once arm fails on the mutant)');
    } finally {
      cleanup();
    }
  });
});

test('mutation B — review before rederive output exists: the reviewed-diff arm fails', async () => {
  await withMutant(
    'B',
    'vr = await review({ diffText, manifest, repo });',
    "vr = await review({ diffText: '--- reviewed diff (mutant: pre-rederive) ---\\nfiles:\\n', manifest, repo });",
    async (mutantTrain) => {
      const { repo, cleanup } = trainRepo();
      try {
        const { asm } = happyTrain(repo, ['job-1']);
        const review = stubReview();
        const tr = await mutantTrain.runTrain(ctxFor(repo), {
          repo, trainId: asm.manifest.train, manifest: asm.manifest,
          gates: stubGates(), rederive: stubRederive(), review,
        });
        assert.equal(tr.ok, true, 'the mutant still passes (it blinds the review, not the verdict)');
        assert.equal(review.seen.length, 1);
        assert.doesNotMatch(review.seen[0].diffText, /content\/regen-1\.md/, 'mutant review misses regenerated data (the reviewed-diff arm fails on the mutant)');
      } finally {
        cleanup();
      }
    },
  );
});

test('mutation C — records commit touches a content path: the machine check fails', async () => {
  await withMutant(
    'C',
    'const staged = dirty.filter((p) => recordsPathAllowed(p));',
    "const staged = dirty.filter((p) => recordsPathAllowed(p)).concat(['content/evil.md']);",
    async (mutantTrain) => {
      const { repo, cleanup } = trainRepo();
      try {
        const { asm } = happyTrain(repo, ['job-1']);
        mkdirSync(join(repo, 'content'), { recursive: true });
        writeFileSync(join(repo, 'content', 'evil.md'), '# stray\n', 'utf8');
        const tr = await mutantTrain.runTrain(ctxFor(repo), {
          repo, trainId: asm.manifest.train, manifest: asm.manifest,
          gates: stubGates(), rederive: stubRederive(), review: stubReview(),
        });
        assert.equal(tr.ok, false, 'a content path in the records commit must fail the train');
        assert.match(tr.reason, /non-allow/, 'the machine check names the path');
      } finally {
        cleanup();
      }
    },
  );
});

test('mutation D — pre-records tip declared verified: the remote-read arm fails', async () => {
  await withMutant('D', 'const sha = headSha(repo);', 'const sha = manifest.assemblyTip;', async (mutantTrain) => {
    const { repo, cleanup } = trainRepo();
    try {
      const { asm } = happyTrain(repo, ['job-1']);
      const tr = await mutantTrain.runTrain(ctxFor(repo), {
        repo, trainId: asm.manifest.train, manifest: asm.manifest,
        gates: stubGates(), rederive: stubRederive(), review: stubReview(),
      });
      assert.equal(tr.ok, true, 'the mutant still passes (it mis-declares, not mis-gates)');
      const atSha = readCommitted(repo, tr.sha, 'data/ledger.jsonl');
      assert.doesNotMatch(atSha, new RegExp(`"id":"${asm.manifest.train}"`), 'pre-records tip carries no train line (the remote-read arm fails on the mutant)');
    } finally {
      cleanup();
    }
  });
});

// ---------------------------------------------------------------------------
// runLoop wiring arms (the run.mjs half: prep, disjointness, merge-to-train).
// ---------------------------------------------------------------------------

function loopRepo(t, { train: trainCfg } = {}) {
  // NOTE: writeQueue runs LAST (after any git branch/commit pre-work in the
  // test): committing a job branch with `git add -A` sweeps an uncommitted
  // queue.json onto that branch, and checking main back out removes it from
  // the worktree — the selector then finds nothing ("nothing qualified").
  // lock_wait_seconds 30 (not 0): the merge path takes the REAL machine
  // lock by row-33 design, and under a full parallel suite a sibling may
  // hold it for seconds — a zero wait would flake the happy path (the
  // zero-wait refusal itself is pinned by the third-state lock test).
  const ctx = makeRepo({
    config: { ...DEFAULT_CONFIG, publish: false, train: { merges: 99, minutes: 9000, max_reviewed_bytes: 150000, max_subjects: 12, lock_wait_seconds: 30, ...trainCfg } },
    files: {},
    runners: runnersYaml({
      command: mockCommand('done-content-entry'),
      reviewerCommand: mockCommand('review-approve'),
    }),
  });
  t.after(() => ctx.cleanup());
  return ctx;
}

const GREEN_GATES = (ctx, dir, options) => ({ ok: true, results: [], output: '' });

test('runLoop overlap: a job whose subjects ride an admitted merge waits', async (t) => {
  // The mock author writes content/blog/fixture-post.md (done-content-entry
  // mode); pre-admit a merge touching that same path. Bounds set high so
  // no trigger fires — this arm pins the wait, not the train.
  const ctx = loopRepo(t);
  git(ctx.repoRoot, ['checkout', '--quiet', '-b', 'job/old', 'main']);
  mkdirSync(join(ctx.repoRoot, 'content', 'blog'), { recursive: true });
  writeFileSync(join(ctx.repoRoot, 'content', 'blog', 'fixture-post.md'), '# old\n', 'utf8');
  git(ctx.repoRoot, ['add', '--', 'content/blog/fixture-post.md']);
  git(ctx.repoRoot, ['commit', '--quiet', '--no-verify', '-m', 'old work']);
  git(ctx.repoRoot, ['checkout', '--quiet', 'main']);
  ensureTrainBranch(ctx.repoRoot, 'main');
  git(ctx.repoRoot, ['checkout', '--quiet', TRAIN_BRANCH]);
  git(ctx.repoRoot, ['merge', '--quiet', '--no-ff', '--no-verify', '-m', 'job old-1 (repair): old work', 'job/old']);
  git(ctx.repoRoot, ['checkout', '--quiet', 'main']);
  writeQueue(ctx, [{ type: 'repair', title: 'fix the fixture link', detail: 'a small repair' }]);
  const res = await runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', gates: GREEN_GATES });
  assert.equal(res.outcome, 'interrupted', `overlap waits, resumable:\n${ctx.output()}`);
  assert.match(ctx.output(), /subjects overlap a merge on the train/, 'the log names the wait');
  assert.match(ctx.output(), /content\/blog\/fixture-post\.md/, 'the log names the shared subject');
  const merges = git(ctx.repoRoot, ['log', '--merges', '--oneline', TRAIN_BRANCH]).split('\n').filter(Boolean);
  assert.equal(merges.length, 1, 'the waiting job merged nowhere');
});

test('runLoop happy merge lands on train, main frozen, nothing published', async (t) => {
  const ctx = loopRepo(t);
  const baseMain = git(ctx.repoRoot, ['rev-parse', 'main']);
  writeQueue(ctx, [{ type: 'repair', title: 'fix the fixture link', detail: 'a small repair' }]);
  const res = await runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', gates: GREEN_GATES });
  assert.equal(res.outcome, 'done', ctx.output());
  assert.equal(git(ctx.repoRoot, ['rev-parse', 'main']), baseMain, 'main is frozen between trains');
  assert.equal(git(ctx.repoRoot, ['branch', '--show-current']), TRAIN_BRANCH, 'the checkout rides the train after admission');
  const merges = git(ctx.repoRoot, ['log', '--merges', '--format=%s', TRAIN_BRANCH]).split('\n').filter(Boolean);
  assert.equal(merges.length, 1, 'exactly the job merge rides the train');
  assert.match(merges[0], /^job j-/, 'the merge message carries a parseable job id for the manifest');
  assert.match(ctx.output(), /publish handoff|nothing publishes|nothing is pushed/, 'no per-job publish');
  assert.equal(existsSync(join(ctx.repoRoot, '.train', 'manifest.json')), false, 'no trigger fired (bounds high), so no train assembled');
});

test('runLoop idle: stale pending with an empty queue and no admission fires the train', async (t) => {
  // WIRING arm for the idle trigger (the unit arm passes queueEmpty
  // directly and cannot see the readQueue wiring): a directives-selected
  // job whose tripwire cannot run admits nothing; with one stale pending
  // merge and an empty queue file, the run must fire idle. Fails on the
  // unwired form — `readQueue(ctx).length` is undefined, never 0, so the
  // trigger stays silent (sealed-review catch, fixed with the `.items`).
  const directives = '# DIRECTIVES.md\n\n- repair: fix the idle fixture link\n';
  const ctx = makeRepo({
    directives,
    config: { ...DEFAULT_CONFIG, publish: false, train: { merges: 99, minutes: 9000, max_reviewed_bytes: 150000, max_subjects: 12, lock_wait_seconds: 30 } },
    files: {},
    runners: runnersYaml({
      command: mockCommand('done-content-entry'),
      reviewerCommand: mockCommand('review-approve'),
    }),
  });
  t.after(() => ctx.cleanup());
  git(ctx.repoRoot, ['checkout', '--quiet', '-b', 'job/old', 'main']);
  mkdirSync(join(ctx.repoRoot, 'content'), { recursive: true });
  writeFileSync(join(ctx.repoRoot, 'content', 'old-idle.md'), '# old\n', 'utf8');
  git(ctx.repoRoot, ['add', '--', 'content/old-idle.md']);
  git(ctx.repoRoot, ['commit', '--quiet', '--no-verify', '-m', 'old work']);
  git(ctx.repoRoot, ['checkout', '--quiet', 'main']);
  ensureTrainBranch(ctx.repoRoot, 'main');
  git(ctx.repoRoot, ['checkout', '--quiet', TRAIN_BRANCH]);
  git(ctx.repoRoot, ['merge', '--quiet', '--no-ff', '--no-verify', '-m', 'job old-9 (repair): old work', 'job/old']);
  git(ctx.repoRoot, ['checkout', '--quiet', 'main']);
  writeQueue(ctx, []);
  const throwingTripwire = (ctx2, dir, options) => {
    const scripts = options && options.scripts ? options.scripts.join('+') : '';
    if (scripts === 'build+verify-surfaces') throw new Error('spawn down (fixture: tripwire gates cannot run)');
    return { ok: true, results: [], output: '' };
  };
  const res = await runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', gates: throwingTripwire });
  assert.equal(res.outcome, 'interrupted', `tripwire environmental books interrupted:\n${ctx.output()}`);
  assert.match(ctx.output(), /idle trigger/, 'the idle trigger fired on stale pending with an empty queue');
  assert.ok(existsSync(join(ctx.repoRoot, '.train', 'manifest.json')), 'assembly ran on the idle trigger');
});
