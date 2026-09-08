/**
 * Tests for the revert guard.
 *
 * THE RED FIXTURE IS THE GUARD. A guard demonstrated only on green is an
 * assertion that the author's mental model is correct, which is precisely the
 * thing under test. The first draft of revert-guard.mjs reported "clean" on a
 * KNOWN revert — an argument-parsing slip made it compare a commit to itself,
 * so it found 0 changed paths and printed the success line for every input. It
 * looked like a working guard. Only a case that MUST go red caught it.
 *
 * So the central test here is not "the guard passes on good input". It is:
 *   - it goes RED on a revert, and
 *   - it goes GREEN on a forward edit TO THE SAME PATH.
 * Same file, same guard, opposite verdicts. Without the second, red proves only
 * that the guard dislikes something.
 *
 * Every fixture is a throwaway repository under the OS temp directory, per this
 * project's convention; none of them touches this one.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { findReverts, blobAt } from './revert-guard.mjs';

const git = (repo, ...args) =>
  execFileSync('git', ['-C', repo, ...args], {
    encoding: 'utf8', shell: false, stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();

/** A repository with a deterministic identity and no signing, so it commits
 *  the same way on any machine. */
function newRepo() {
  const dir = mkdtempSync(join(tmpdir(), 'revert-guard-'));
  git(dir, 'init', '-q', '-b', 'main');
  git(dir, 'config', 'user.email', 'test@example.invalid');
  git(dir, 'config', 'user.name', 'Test');
  git(dir, 'config', 'commit.gpgsign', 'false');
  return dir;
}

function commit(repo, path, content, message) {
  const full = join(repo, path);
  mkdirSync(join(full, '..'), { recursive: true });
  writeFileSync(full, content);
  git(repo, 'add', '--', path);
  git(repo, 'commit', '-q', '-m', message);
  return git(repo, 'rev-parse', 'HEAD');
}

/**
 * The measured shape of addictedtoai-lvba:
 *   main:  v1 -> v2 (a deliberate supersession)
 *   branch off v1's commit, then restore v1's exact content
 * The branch is then a revert of v2.
 */
function repoWithRevert() {
  const repo = newRepo();
  commit(repo, 'data/launch.json', '{"precision":"absent"}\n', 'v1');
  commit(repo, 'data/launch.json', '{"precision":"present"}\n', 'v2 records the rule');

  // The job branches from main's TIP — where v2 is already in effect — and then
  // writes v1's content back, because its brief named v1's commit as "the
  // required baseline". That is the real shape of j-20260907-30. Branching at v1
  // instead would make the restoration a no-op with nothing to commit, which is
  // how the first version of this fixture failed.
  git(repo, 'checkout', '-q', '-b', 'job', 'main');
  commit(repo, 'data/launch.json', '{"precision":"absent"}\n', 'repair: restore baseline');
  git(repo, 'checkout', '-q', 'main');
  return repo;
}

test('RED: a change restoring a superseded blob is reported as a revert', () => {
  const repo = repoWithRevert();
  try {
    const r = findReverts(repo, 'job', 'main');
    assert.equal(r.findings.length, 1, 'the revert must be found');
    assert.equal(r.findings[0].path, 'data/launch.json');
    assert.ok(
      r.findings[0].superseding.length >= 1,
      'it must name the commit(s) that superseded the restored state',
    );
    assert.match(r.findings[0].superseding[0], /v2 records the rule/);
  } finally { rmSync(repo, { recursive: true, force: true }); }
});

test('GREEN: a forward edit to THE SAME PATH is not a revert', () => {
  const repo = newRepo();
  try {
    const v1 = commit(repo, 'data/launch.json', '{"precision":"absent"}\n', 'v1');
    commit(repo, 'data/launch.json', '{"precision":"present"}\n', 'v2');

    git(repo, 'checkout', '-q', '-b', 'forward', v1);
    // Content the target has never held.
    commit(repo, 'data/launch.json', '{"precision":"present","extra":1}\n', 'v3 forward');
    git(repo, 'checkout', '-q', 'main');

    const r = findReverts(repo, 'forward', 'main');
    assert.equal(r.findings.length, 0, 'a forward edit must not be flagged');
    assert.equal(r.forward, 1);
  } finally { rmSync(repo, { recursive: true, force: true }); }
});

test('GREEN: restoring a state nothing superseded is not a revert', () => {
  // The "deliberately moved since" conjunct. Without it, any restoration would
  // read as a revert, including an undo of something never merged past.
  const repo = newRepo();
  try {
    const v1 = commit(repo, 'notes.txt', 'one\n', 'v1');
    git(repo, 'checkout', '-q', '-b', 'undo', v1);
    commit(repo, 'notes.txt', 'two\n', 'experiment');
    commit(repo, 'notes.txt', 'one\n', 'undo the experiment');
    git(repo, 'checkout', '-q', 'main');

    const r = findReverts(repo, 'undo', 'main');
    assert.equal(r.findings.length, 0, 'main never superseded v1, so this is not a revert');
  } finally { rmSync(repo, { recursive: true, force: true }); }
});

test('a path untouched by the change is never examined', () => {
  const repo = newRepo();
  try {
    const v1 = commit(repo, 'a.txt', 'a1\n', 'a v1');
    commit(repo, 'a.txt', 'a2\n', 'a v2');
    git(repo, 'checkout', '-q', '-b', 'other', v1);
    commit(repo, 'b.txt', 'b1\n', 'unrelated');
    git(repo, 'checkout', '-q', 'main');

    const r = findReverts(repo, 'other', 'main');
    assert.equal(r.findings.length, 0);
    assert.ok(!r.changed.includes('a.txt'), 'a.txt is not in the change at all');
  } finally { rmSync(repo, { recursive: true, force: true }); }
});

test('the RED case depends on the ancestor scan, not merely on differing from the target', () => {
  // WHY THIS IS NOT A MUTATION TEST, said plainly because the first version of
  // it pretended to be one: it computed `branchBlob === targetBlob ? [] : []`
  // and asserted the result was empty. Both arms are `[]`, so the assertion
  // could not fail on any input. A proof that cannot fail is not evidence.
  //
  // The real mutation — deleting the ancestor scan from findReverts and watching
  // the RED test go red — was run against the source in an isolated worktree and
  // is recorded in the commit message. What this test CAN establish cheaply is
  // the fixture precondition that mutation depends on: the branch differs from
  // the target AND the restored content is genuinely a state the target once
  // held. If either stops being true, the RED test would pass for the wrong
  // reason.
  const repo = repoWithRevert();
  try {
    const branchBlob = blobAt(repo, 'job', 'data/launch.json');
    const targetBlob = blobAt(repo, 'main', 'data/launch.json');
    assert.notEqual(branchBlob, targetBlob, 'the branch must differ from the target');

    const firstCommit = execFileSync(
      'git', ['-C', repo, 'rev-list', '--max-parents=0', 'main'],
      { encoding: 'utf8', shell: false },
    ).trim();
    assert.equal(
      blobAt(repo, firstCommit, 'data/launch.json'), branchBlob,
      'the restored content must be a state the target genuinely held before',
    );
  } finally { rmSync(repo, { recursive: true, force: true }); }
});
