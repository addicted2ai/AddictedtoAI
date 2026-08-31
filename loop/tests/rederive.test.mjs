/**
 * beads addictedtoai-dgj and addictedtoai-942 — the derived tree is an output,
 * not content the Desk may merge.
 *
 * The first two tests measure the GIT MECHANISM directly: that a derived file
 * changed on both sides conflicts (the defect), and that dropping the branch's
 * copy first makes the same merge clean (the fix). Doing it at the git level
 * rather than through a full loop run is deliberate — the defect is a property
 * of three-way merge, and a test that needed an executor would be measuring
 * the harness instead.
 *
 * The rest cover the seam: the loop must not improvise a derivation when the
 * Pulse's step is missing, and the two DERIVED_PATHS declarations must agree.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { DERIVED_PATHS, findSharedDerive, rederiveStep, dirtyDerivedInputs, DERIVED_INPUT_PATHS } from '../lib/rederive.mjs';
import { DERIVED_PATHS as PULSE_DERIVED_PATHS } from '../../pulse/lib/rederive.mjs';

const git = (dir, args) => execFileSync('git', ['-C', dir, ...args], { encoding: 'utf8', stdio: 'pipe' });

/** A repo with one authored file and one derived file, on `main`. */
function makeRepo() {
  const dir = mkdtempSync(join(tmpdir(), 'derived-merge-'));
  git(dir, ['init', '-q', '-b', 'main']);
  git(dir, ['config', 'user.email', 'test@example.invalid']);
  git(dir, ['config', 'user.name', 'test']);
  // Pinned off: a global core.autocrlf rewrites checked-out fixtures to CRLF,
  // which makes byte comparisons fail for a reason that has nothing to do with
  // what is being tested. Same flake another agent hit in the publish tests.
  git(dir, ['config', 'core.autocrlf', 'false']);
  mkdirSync(join(dir, 'data', 'derived'), { recursive: true });
  mkdirSync(join(dir, 'content'), { recursive: true });
  writeFileSync(join(dir, 'content', 'entry.md'), 'original prose\n');
  writeFileSync(join(dir, 'data', 'derived', 'queue.json'), JSON.stringify({ items: ['A'] }, null, 2) + '\n');
  git(dir, ['add', '-A']);
  git(dir, ['commit', '-qm', 'base']);
  return dir;
}

/** Both sides change the derived file — the shape of a real Pulse/Desk overlap. */
function divergeBothSides(dir) {
  git(dir, ['checkout', '-qb', 'job/x']);
  writeFileSync(join(dir, 'content', 'entry.md'), 'repaired prose\n');
  writeFileSync(join(dir, 'data', 'derived', 'queue.json'), JSON.stringify({ items: ['A', 'from-branch'] }, null, 2) + '\n');
  git(dir, ['add', '-A']);
  git(dir, ['commit', '-qm', 'job work + its derived']);

  git(dir, ['checkout', '-q', 'main']);
  writeFileSync(join(dir, 'data', 'derived', 'queue.json'), JSON.stringify({ items: ['A', 'from-pulse'] }, null, 2) + '\n');
  git(dir, ['add', '-A']);
  git(dir, ['commit', '-qm', 'pulse regenerated derived mid-job']);
}

test('THE DEFECT: a derived file changed on both sides conflicts and loses the whole job', (t) => {
  const dir = makeRepo();
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  divergeBothSides(dir);

  let failed = false;
  let stderr = '';
  try {
    git(dir, ['merge', '--no-ff', '--no-verify', '-m', 'merge', 'job/x']);
  } catch (e) {
    failed = true;
    stderr = `${e.stdout ?? ''}${e.stderr ?? ''}`;
  }
  assert.ok(failed, 'the merge must fail — this is the state j-20260829-03 died in');
  assert.match(stderr, /CONFLICT|conflict/i);
  assert.match(stderr, /data\/derived\/queue\.json/);

  git(dir, ['merge', '--abort']);
  // And the authored work is lost with it: main still has the original prose.
  assert.equal(readFileSync(join(dir, 'content', 'entry.md'), 'utf8'), 'original prose\n');
});

test('THE FIX: dropping the branch derived tree first makes the same merge clean', (t) => {
  const dir = makeRepo();
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  divergeBothSides(dir);

  // What loop/run.mjs now does before merging.
  git(dir, ['checkout', '-q', 'job/x']);
  git(dir, ['checkout', 'main', '--', ...DERIVED_PATHS]);
  git(dir, ['commit', '-qm', 'drop derived before merge']);
  git(dir, ['checkout', '-q', 'main']);

  git(dir, ['merge', '--no-ff', '--no-verify', '-m', 'merge', 'job/x']);

  // The authored work survives — the whole point.
  assert.equal(readFileSync(join(dir, 'content', 'entry.md'), 'utf8'), 'repaired prose\n');
  // And the derived tree is the base's, awaiting recomputation rather than
  // being a blend of two derivations that matches no real state.
  const q = JSON.parse(readFileSync(join(dir, 'data', 'derived', 'queue.json'), 'utf8'));
  assert.deepEqual(q.items, ['A', 'from-pulse'], 'never a merged blend of both sides');
});

test('the two DERIVED_PATHS declarations agree, so loop and pulse cannot drift', () => {
  assert.deepEqual([...DERIVED_PATHS], [...PULSE_DERIVED_PATHS]);
});

test('the loop refuses to improvise a derivation when the Pulse step is missing', async (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'no-pulse-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));

  const lines = [];
  const ctx = { repoRoot: dir, log: (l) => lines.push(l) };

  assert.equal(findSharedDerive(dir), null, 'precondition: no shared step present');
  const out = await rederiveStep(ctx);

  assert.equal(out.ok, false);
  assert.match(out.reason, /not present/);
  assert.match(lines.join('\n'), /SKIPPED/);
  // A wrong derived tree is worse than a stale one: the stale one is at least
  // the output of some real state.
  assert.match(out.reason, /rather than improvising/);
});

test('a failed derivation is reported, never thrown into the caller', async (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'bad-pulse-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  mkdirSync(join(dir, 'pulse', 'lib'), { recursive: true });
  writeFileSync(join(dir, 'pulse', 'lib', 'rederive.mjs'), 'export const rederive = () => { throw new Error("boom"); };\n');
  writeFileSync(join(dir, 'pulse', 'lib', 'registry.mjs'), 'export const loadRegistry = () => ({});\n');
  writeFileSync(join(dir, 'pulse', 'lib', 'corpus.mjs'), 'export const readCorpus = () => ({});\n');

  const lines = [];
  const out = await rederiveStep({ repoRoot: dir, log: (l) => lines.push(l) });

  assert.equal(out.ok, false, 'a merge must not be undone by a derivation failure');
  assert.match(out.reason, /derivation failed: boom/);
});

// -----------------------------------------------------------------------------
// addictedtoai-djd — `data/derived/` must not be committed disconnected from
// the state it was computed from. `dirtyDerivedInputs` is the guard's read of
// "is any of it dirty right now"; `loop/run.mjs` is what acts on the answer
// (covered end to end in `derived-commit-dirty-inputs.test.mjs`). These tests
// are the unit-level measurement of the guard's own read of the tree, plus
// one git-mechanism reproduction of the hazard it exists to prevent — in the
// same style as the dgj THE DEFECT/THE FIX pair above.
// -----------------------------------------------------------------------------

function initedRepo() {
  const dir = mkdtempSync(join(tmpdir(), 'derived-inputs-'));
  git(dir, ['init', '-q', '-b', 'main']);
  git(dir, ['config', 'user.email', 'test@example.invalid']);
  git(dir, ['config', 'user.name', 'test']);
  git(dir, ['config', 'core.autocrlf', 'false']);
  writeFileSync(join(dir, 'README.md'), 'fixture\n');
  git(dir, ['add', '-A']);
  git(dir, ['commit', '-qm', 'base']);
  return dir;
}

test('dirtyDerivedInputs: a clean tree reports nothing dirty', (t) => {
  const dir = initedRepo();
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  mkdirSync(join(dir, 'data'), { recursive: true });
  writeFileSync(join(dir, 'data', 'changes.jsonl'), '{"subject":"a"}\n');
  git(dir, ['add', '-A']);
  git(dir, ['commit', '-qm', 'seed changes.jsonl']);

  assert.deepEqual(dirtyDerivedInputs(dir), []);
});

test('dirtyDerivedInputs: a modified data/changes.jsonl is named', (t) => {
  const dir = initedRepo();
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  mkdirSync(join(dir, 'data'), { recursive: true });
  writeFileSync(join(dir, 'data', 'changes.jsonl'), '{"subject":"a"}\n');
  git(dir, ['add', '-A']);
  git(dir, ['commit', '-qm', 'seed changes.jsonl']);

  writeFileSync(join(dir, 'data', 'changes.jsonl'), '{"subject":"a"}\n{"subject":"b"}\n');
  assert.deepEqual(dirtyDerivedInputs(dir), ['data/changes.jsonl']);
});

test('dirtyDerivedInputs: an UNTRACKED file under data/sources/ is named too (-uall matters)', (t) => {
  // A brand-new snapshot file is untracked, not modified. `--untracked-files=
  // normal` (git's default) would report the containing directory instead of
  // the file, which for a per-source directory would read as "dirty" forever.
  const dir = initedRepo();
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  mkdirSync(join(dir, 'data', 'sources', 'a-source'), { recursive: true });
  writeFileSync(join(dir, 'data', 'sources', 'a-source', 'latest.json'), '{}\n');

  const dirty = dirtyDerivedInputs(dir);
  assert.deepEqual(dirty, ['data/sources/a-source/latest.json']);
});

test('dirtyDerivedInputs: an untracked content/ file is named', (t) => {
  const dir = initedRepo();
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  mkdirSync(join(dir, 'content'), { recursive: true });
  writeFileSync(join(dir, 'content', 'draft.md'), 'half-written\n');

  assert.deepEqual(dirtyDerivedInputs(dir), ['content/draft.md']);
});

test('dirtyDerivedInputs: a dirty file OUTSIDE the input set is not named', (t) => {
  const dir = initedRepo();
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  mkdirSync(join(dir, 'data'), { recursive: true });
  writeFileSync(join(dir, 'data', 'launch.json'), '{}\n');

  assert.deepEqual(dirtyDerivedInputs(dir), [], 'data/launch.json is not part of DERIVED_INPUT_PATHS');
});

test('dirtyDerivedInputs: "cannot tell" (not a repository) is null, not an empty array', () => {
  const dir = mkdtempSync(join(tmpdir(), 'not-a-repo-'));
  try {
    mkdirSync(join(dir, 'data'), { recursive: true });
    writeFileSync(join(dir, 'data', 'changes.jsonl'), '{}\n');
    assert.equal(dirtyDerivedInputs(dir), null, 'null must read differently than an empty array — "cannot tell" is not "nothing is dirty"');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('THE DEFECT (git level, addictedtoai-djd): data/derived/ committed alone pairs it with state a branch cut from it cannot see', (t) => {
  const dir = initedRepo();
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  mkdirSync(join(dir, 'data', 'derived'), { recursive: true });
  writeFileSync(join(dir, 'data', 'changes.jsonl'), '{"subject":"a"}\n');
  writeFileSync(join(dir, 'data', 'derived', 'queue.json'), JSON.stringify({ items: ['a'] }, null, 2) + '\n');
  git(dir, ['add', '-A']);
  git(dir, ['commit', '-qm', 'base with one change record']);

  // The shape of the incident: a second line lands on disk and is never
  // committed (a concurrent Pulse mid-run), and the re-derive recomputes
  // data/derived/ from it anyway — because the derivation reads the
  // filesystem, not git.
  writeFileSync(join(dir, 'data', 'changes.jsonl'), '{"subject":"a"}\n{"subject":"b"}\n');
  writeFileSync(join(dir, 'data', 'derived', 'queue.json'), JSON.stringify({ items: ['a', 'b'] }, null, 2) + '\n');

  // The UNGUARDED commit this issue is about: data/derived/ only, by exact
  // path — exactly what loop/run.mjs did before this fix.
  git(dir, ['add', '--', 'data/derived']);
  git(dir, ['commit', '-qm', 'job x: records (done)']);

  // data/changes.jsonl is still dirty after that commit.
  assert.match(git(dir, ['status', '--porcelain', '--', 'data/changes.jsonl']), /^ M/);

  // The next job's branch is cut from exactly that commit.
  git(dir, ['branch', 'job/next']);

  // What a fresh checkout of that branch actually carries — read from the
  // committed blobs, the way `git worktree add` populates a new worktree,
  // never from this working tree's leftover dirty file.
  const branchChanges = git(dir, ['show', 'job/next:data/changes.jsonl']);
  const branchQueue = JSON.parse(git(dir, ['show', 'job/next:data/derived/queue.json']));

  assert.equal(branchChanges, '{"subject":"a"}\n', 'the branch cannot see subject "b"');
  assert.deepEqual(branchQueue.items, ['a', 'b'], 'yet the committed queue names it — the exact defect addictedtoai-djd reports');
});

test('the two DERIVED_INPUT_PATHS lists agree with the beads issue\'s own enumerable set', () => {
  assert.deepEqual([...DERIVED_INPUT_PATHS], ['data/changes.jsonl', 'data/sources', 'content']);
});
