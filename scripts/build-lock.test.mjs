/**
 * The build lock (beads addictedtoai-6s7, addictedtoai-0ll).
 *
 * The defect was two `next build` processes sharing one output directory,
 * failing with `ENOENT` on `.next/server/pages-manifest.json` AFTER 493/493
 * pages generated — a failure that reads as a content defect and is not, and
 * that passes when re-run alone.
 *
 * These tests use real concurrent processes and real files. Mutual exclusion
 * asserted against a stubbed clock or a fake filesystem would prove nothing
 * about two builds racing, which is the only thing that matters here.
 *
 * The second issue moved the lock FILE out of `node_modules` — the directory
 * Vercel caches and restores between deployments — while keeping the lock KEY
 * exactly where it was. The tests below therefore assert those two things
 * separately: `buildSurfaceKey` still resolves a junctioned worktree onto the
 * repository's own `node_modules`, and `buildLockPath` puts the file somewhere
 * no build cache reaches.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  symlinkSync,
  existsSync,
  readdirSync,
  realpathSync,
  rmSync,
  rmdirSync,
  unlinkSync,
} from 'node:fs';
import { join, dirname, sep } from 'node:path';
import { tmpdir, hostname } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
  acquireBuildLock,
  buildLockDir,
  buildLockPath,
  buildSurfaceKey,
  isAlive,
  readLock,
  releaseBuildLock,
  LOCK_DIR_PREFIX,
  LOCK_SUFFIX,
} from './build-lock.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const LOCK_MODULE = pathToFileURL(join(HERE, 'build-lock.mjs')).href;

function tmp() {
  return mkdtempSync(join(tmpdir(), 'atai-lock-'));
}

/** The lock path, with its directory made — fixtures write the file directly. */
function lockPathReady(dir) {
  const p = buildLockPath(dir);
  mkdirSync(dirname(p), { recursive: true });
  return p;
}

/**
 * Remove a throwaway tree, refusing to recurse while a directory junction may
 * still be inside it.
 *
 * On 2026-08-28 a cleanup script printed "could not remove junction" and its
 * caller ran the recursive delete anyway; the delete followed the junction and
 * emptied the real `node_modules`. A failed removal is a stop, not a note — so
 * every link is removed and CHECKED first, and the recursive step never runs if
 * one survived.
 */
function removeTree(root, links = []) {
  for (const link of links) {
    if (!existsSync(link)) continue;
    // A junction is a directory to `unlink` and a reparse point to `rmdir`;
    // `rmSync` without `recursive` throws EISDIR on it, and `rmSync` WITH
    // `recursive` is the call that must never run while one is still standing.
    // `rmdir` removes the link itself and never touches the target.
    try {
      unlinkSync(link);
    } catch {
      rmdirSync(link);
    }
    assert.equal(
      existsSync(link),
      false,
      `refusing to recurse: the junction ${link} survived its removal, and a recursive delete would follow it into its target`,
    );
  }
  rmSync(root, { recursive: true, force: true });
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
  const link = join(worktree, 'node_modules');
  mkdirSync(join(repo, 'node_modules'), { recursive: true });
  mkdirSync(worktree, { recursive: true });
  try {
    symlinkSync(join(repo, 'node_modules'), link, process.platform === 'win32' ? 'junction' : 'dir');
  } catch (err) {
    t.skip(`this platform would not create the link: ${err.message}`);
    removeTree(root, [link]);
    return;
  }

  // The claim in the header — that a job worktree and the repository share one
  // build surface — is resolved by the filesystem here, not asserted. Both the
  // key and the file derived from it are checked, because the move to a hashed
  // name in the temp directory could have broken either half on its own.
  assert.equal(buildSurfaceKey(worktree), buildSurfaceKey(repo));
  assert.equal(buildLockPath(worktree), buildLockPath(repo));

  // And the key really is the repository's own node_modules, not the worktree's
  // path to it — the resolution is what makes the sharing claim true.
  const expected = realpathSync(join(repo, 'node_modules'));
  assert.equal(buildSurfaceKey(repo), process.platform === 'win32' ? expected.toLowerCase() : expected);

  // A tree with its own node_modules shares nothing, so it locks separately.
  const alone = join(root, 'alone');
  mkdirSync(join(alone, 'node_modules'), { recursive: true });
  assert.notEqual(buildLockPath(alone), buildLockPath(repo));

  // No node_modules at all: the lock still has a home, and still its own one.
  const bare = join(root, 'bare');
  mkdirSync(bare, { recursive: true });
  assert.ok(buildLockPath(bare).endsWith(LOCK_SUFFIX));
  assert.notEqual(buildLockPath(bare), buildLockPath(repo));

  removeTree(root, [link]);
});

/**
 * The regression addictedtoai-0ll fixes, asserted as a property of the path
 * rather than as a promise in a comment.
 *
 * The lock used to be written to `<node_modules>/.atai-build.lock`. Vercel
 * caches and restores `node_modules` between deployments, so the file travelled
 * between machines and broke every deploy on 2026-08-29 (addictedtoai-272).
 * Nothing about the lock's PURPOSE wanted that; it was purely where the file
 * sat. Now it sits in the OS temp directory under a hash of the same key, which
 * makes it uncacheable by construction: a build cache cannot carry a file that
 * is not in the tree being cached.
 */
test('the lock file is outside the repository entirely — nothing a build cache packs up', () => {
  const root = tmp();
  const dir = join(root, 'tree');
  const modules = join(dir, 'node_modules');
  mkdirSync(modules, { recursive: true });

  const path = buildLockPath(dir);
  assert.ok(path.startsWith(realpathSync(tmpdir())) || path.startsWith(tmpdir()), `${path} is not under the temp directory`);
  assert.ok(dirname(path).includes(LOCK_DIR_PREFIX), `${path} is not in the shared lock directory`);
  assert.ok(!path.startsWith(dir + sep), `${path} is inside the tree being built`);
  assert.ok(!path.startsWith(modules + sep), `${path} is inside node_modules, which CI caches`);

  // And measured, not merely derived: take the lock for real and confirm the
  // cached directory is still empty afterwards.
  const lock = acquireBuildLock({ dir, waitMs: 0 });
  assert.equal(existsSync(lock.path), true, 'the lock file exists at its new path');
  assert.deepEqual(readdirSync(modules), [], 'a build lock was written into node_modules');
  assert.deepEqual(readdirSync(dir), ['node_modules'], 'a build lock was written into the tree');

  // The name is a hash, so the file has to say what it is for out loud.
  const holder = readLock(lock.path);
  assert.equal(holder.dir, dir);
  assert.equal(holder.surface, buildSurfaceKey(dir));

  releaseBuildLock(lock.path, lock.holderPid);
  removeTree(root);
});

/**
 * Hashing removes the filesystem from the comparison, so the canonicalisation
 * it used to do for free has to be done in `buildSurfaceKey`.
 *
 * Measured 2026-08-29 on Windows/Node 20: `fs.realpathSync` resolves links but
 * does NOT fix case (`d:/x/NODE_MODULES` comes back spelled that way), while
 * `fs.realpathSync.native` does. Under the old in-tree lock this could not
 * matter — NTFS made two spellings one file. Hashed, two spellings would be two
 * locks on one build surface, which is exactly the bug this module prevents.
 */
test('two spellings of one directory are one lock, where the filesystem says they are one directory', () => {
  const root = tmp();
  const dir = join(root, 'tree');
  mkdirSync(join(dir, 'node_modules'), { recursive: true });

  // Separator and trailing-slash spellings must never split a lock anywhere.
  assert.equal(buildLockPath(dir.replace(/\\/g, '/')), buildLockPath(dir));
  assert.equal(buildLockPath(`${dir}${sep}`), buildLockPath(dir));

  if (process.platform === 'win32') {
    // Case only on Windows: on ext4 two spellings really are two directories,
    // and folding them would be the wrong answer rather than a wasted wait.
    assert.equal(buildLockPath(dir.toUpperCase()), buildLockPath(dir));
  }

  removeTree(root);
});

/**
 * The uid segment is the one property the move gives up, and it is a deliberate
 * choice rather than an oversight — see the header. `os.tmpdir()` is shared on
 * POSIX and per-user on Windows, so the uid is what keeps two users off one
 * path there; without it, `/tmp`'s sticky bit would let user A create a lock
 * that user B can neither hold nor reclaim.
 */
test('the lock directory is per-user on POSIX, where the temp directory is not', () => {
  const d = buildLockDir();
  if (typeof process.getuid === 'function') {
    assert.match(d, new RegExp(`${LOCK_DIR_PREFIX}-u${process.getuid()}$`));
  } else {
    // Windows: AppData\Local\Temp is already per-user, and there is no uid.
    assert.ok(d.startsWith(tmpdir()));
    assert.ok(d.endsWith(LOCK_DIR_PREFIX));
  }
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

  removeTree(root);
});

test('a lock left behind by a dead process is reclaimed, not waited on', () => {
  const root = tmp();
  const dir = join(root, 'tree');
  mkdirSync(dir, { recursive: true });

  // A really-dead pid: spawn a process, let it exit, keep its pid.
  const corpse = spawnSync(process.execPath, ['--version']);
  assert.ok(corpse.pid > 0);
  assert.equal(isAlive(corpse.pid), false, 'the fixture process really is gone');

  const path = lockPathReady(dir);
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
  removeTree(root);
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
      // The file name is a hash now, so the message has to name the surface too
      // or nobody can tell which build it is talking about.
      assert.ok(err.message.includes(buildSurfaceKey(dir)), 'the refusal names the build surface the hash stands for');
      return true;
    },
  );
  releaseBuildLock(first.path, first.holderPid);
  removeTree(root);
});

test('an over-age lock is reclaimed even if its pid is alive, so nothing wedges forever', () => {
  const root = tmp();
  const dir = join(root, 'tree');
  mkdirSync(dir, { recursive: true });
  const path = lockPathReady(dir);
  writeFileSync(
    path,
    JSON.stringify({ pid: process.pid, label: 'a very old build', started: new Date(Date.now() - 3 * 3600 * 1000).toISOString() }),
    'utf8',
  );
  const lock = acquireBuildLock({ dir, waitMs: 0, staleMs: 60 * 60 * 1000 });
  assert.equal(lock.reclaimed, true);
  releaseBuildLock(path);
  removeTree(root);
});

/**
 * The regression that broke every deployment on 2026-08-29.
 *
 * The lock lived under `node_modules`, and Vercel caches and restores
 * `node_modules` between deployments. A previous build machine's lock came back
 * with the cache naming `pid 97` — a low, certainly-live pid on the fresh Linux
 * builder — so `isAlive` said "held", the build waited the full 600s and the
 * deploy failed. It had been failing on every push for hours, and the site
 * silently stopped receiving updates.
 *
 * Moving the file out of `node_modules` closes that route. This check is kept
 * anyway: it is not about `node_modules`, it is about any lock whose pid cannot
 * be verified here, and it is the thing that would catch the next unexpected way
 * one crosses a machine boundary.
 *
 * The pid in this test is deliberately `process.pid`: alive, so the test fails
 * for the right reason if the host check is ever removed.
 */
test('a lock written by another machine is reclaimed, because its pid cannot be checked here', () => {
  const root = tmp();
  const dir = join(root, 'tree');
  mkdirSync(dir, { recursive: true });
  const path = lockPathReady(dir);
  writeFileSync(
    path,
    JSON.stringify({
      pid: process.pid,
      host: 'some-other-build-machine',
      label: 'npm run build (/vercel/path0)',
      started: new Date().toISOString(),
    }),
    'utf8',
  );
  assert.equal(isAlive(process.pid), true, 'the trap only exists when the recorded pid IS alive here');
  const lock = acquireBuildLock({ dir, waitMs: 0 });
  assert.equal(lock.reclaimed, true, 'a foreign-host lock must not block this machine');
  releaseBuildLock(path);
  removeTree(root);
});

test('a live lock from THIS machine is still respected', () => {
  const root = tmp();
  const dir = join(root, 'tree');
  mkdirSync(dir, { recursive: true });
  const path = lockPathReady(dir);
  writeFileSync(
    path,
    JSON.stringify({ pid: process.pid, host: hostname(), label: 'a real concurrent build', started: new Date().toISOString() }),
    'utf8',
  );
  assert.throws(() => acquireBuildLock({ dir, waitMs: 0 }), /another build holds/);
  rmSync(path, { force: true });
  removeTree(root);
});
