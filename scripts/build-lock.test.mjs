/**
 * The build lock (beads addictedtoai-6s7).
 *
 * The defect was two `next build` processes sharing one output directory,
 * failing with `ENOENT` on `.next/server/pages-manifest.json` AFTER 493/493
 * pages generated — a failure that reads as a content defect and is not, and
 * that passes when re-run alone.
 *
 * These tests use real concurrent processes and real files. Mutual exclusion
 * asserted against a stubbed clock or a fake filesystem would prove nothing
 * about two builds racing, which is the only thing that matters here.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, symlinkSync, existsSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { acquireBuildLock, buildLockPath, isAlive, readLock, releaseBuildLock, LOCK_FILENAME } from './build-lock.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const LOCK_MODULE = pathToFileURL(join(HERE, 'build-lock.mjs')).href;

function tmp() {
  return mkdtempSync(join(tmpdir(), 'atai-lock-'));
}

/** A child that takes the lock, records when it entered and left, and releases. */
function writeContender(root) {
  const p = join(root, 'contender.mjs');
  writeFileSync(
    p,
    `import { acquireBuildLock, releaseBuildLock } from ${JSON.stringify(LOCK_MODULE)};
import { appendFileSync } from 'node:fs';
const [dir, logPath, holdMs] = process.argv.slice(2);
const lock = acquireBuildLock({ dir, label: 'contender ' + process.pid, waitMs: 30000, pollMs: 25 });
appendFileSync(logPath, 'enter ' + process.pid + '\\n');
Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, Number(holdMs));
appendFileSync(logPath, 'exit ' + process.pid + '\\n');
releaseBuildLock(lock.path, lock.holderPid);
`,
    'utf8',
  );
  return p;
}

test('the lock is keyed on the shared node_modules, so a linked worktree shares the repository lock', (t) => {
  const root = tmp();
  const repo = join(root, 'repo');
  const worktree = join(root, 'worktree');
  mkdirSync(join(repo, 'node_modules'), { recursive: true });
  mkdirSync(worktree, { recursive: true });
  try {
    symlinkSync(join(repo, 'node_modules'), join(worktree, 'node_modules'), process.platform === 'win32' ? 'junction' : 'dir');
  } catch (err) {
    t.skip(`this platform would not create the link: ${err.message}`);
    rmSync(root, { recursive: true, force: true });
    return;
  }

  // The claim in the header — that a job worktree and the repository share one
  // build surface — is resolved by the filesystem here, not asserted.
  assert.equal(buildLockPath(worktree), buildLockPath(repo));

  // And a tree with its own node_modules shares nothing, so it locks separately.
  const alone = join(root, 'alone');
  mkdirSync(join(alone, 'node_modules'), { recursive: true });
  assert.notEqual(buildLockPath(alone), buildLockPath(repo));

  // No node_modules at all: the lock still has a home.
  const bare = join(root, 'bare');
  mkdirSync(bare, { recursive: true });
  assert.equal(buildLockPath(bare), join(bare, LOCK_FILENAME));

  rmSync(root, { recursive: true, force: true });
});

test('two concurrent builds do not overlap — one waits for the other', async () => {
  const root = tmp();
  const dir = join(root, 'tree');
  mkdirSync(join(dir, 'node_modules'), { recursive: true });
  const contender = writeContender(root);
  const log = join(root, 'order.log');
  writeFileSync(log, '', 'utf8');

  const run = (holdMs) =>
    new Promise((resolve) => {
      const c = spawn(process.execPath, [contender, dir, log, String(holdMs)], { stdio: 'inherit' });
      c.on('close', (code) => resolve(code));
    });

  const [a, b] = await Promise.all([run(400), run(400)]);
  assert.equal(a, 0);
  assert.equal(b, 0);

  const events = readFileSync(log, 'utf8').trim().split('\n');
  assert.equal(events.length, 4, `expected two enter/exit pairs, got:\n${events.join('\n')}`);
  // The only ordering a mutex permits: nobody enters while somebody is inside.
  let inside = 0;
  for (const e of events) {
    if (e.startsWith('enter')) inside += 1;
    else inside -= 1;
    assert.ok(inside <= 1, `two builds were inside the lock at once:\n${events.join('\n')}`);
  }
  assert.equal(events[0].split(' ')[1], events[1].split(' ')[1], 'the first in is the first out');

  rmSync(root, { recursive: true, force: true });
});

test('a lock left behind by a dead process is reclaimed, not waited on', () => {
  const root = tmp();
  const dir = join(root, 'tree');
  mkdirSync(dir, { recursive: true });

  // A really-dead pid: spawn a process, let it exit, keep its pid.
  const corpse = spawnSync(process.execPath, ['--version']);
  assert.ok(corpse.pid > 0);
  assert.equal(isAlive(corpse.pid), false, 'the fixture process really is gone');

  const path = buildLockPath(dir);
  writeFileSync(path, JSON.stringify({ pid: corpse.pid, label: 'a crashed build', started: new Date().toISOString() }), 'utf8');

  const notes = [];
  const lock = acquireBuildLock({ dir, waitMs: 0, log: (s) => notes.push(s) });
  assert.equal(lock.reclaimed, true);
  assert.equal(readLock(path).pid, process.pid);
  assert.match(notes.join('\n'), /reclaiming .* that process is gone/);

  // A crashed build therefore never wedges the next one, which is what makes a
  // lock nothing releases safe to use.
  releaseBuildLock(path);
  assert.equal(existsSync(path), false);
  rmSync(root, { recursive: true, force: true });
});

test('a live holder is refused rather than raced, and the refusal names the failure it prevents', () => {
  const root = tmp();
  const dir = join(root, 'tree');
  mkdirSync(dir, { recursive: true });
  const first = acquireBuildLock({ dir, label: 'the build already running' });
  assert.throws(
    () => acquireBuildLock({ dir, waitMs: 0 }),
    (err) => {
      assert.match(err.message, /another build holds/);
      assert.match(err.message, /pages-manifest\.json/, 'the message names the phantom it exists to prevent');
      return true;
    },
  );
  releaseBuildLock(first.path, first.holderPid);
  rmSync(root, { recursive: true, force: true });
});

test('an over-age lock is reclaimed even if its pid is alive, so nothing wedges forever', () => {
  const root = tmp();
  const dir = join(root, 'tree');
  mkdirSync(dir, { recursive: true });
  const path = buildLockPath(dir);
  writeFileSync(
    path,
    JSON.stringify({ pid: process.pid, label: 'a very old build', started: new Date(Date.now() - 3 * 3600 * 1000).toISOString() }),
    'utf8',
  );
  const lock = acquireBuildLock({ dir, waitMs: 0, staleMs: 60 * 60 * 1000 });
  assert.equal(lock.reclaimed, true);
  releaseBuildLock(path);
  rmSync(root, { recursive: true, force: true });
});
