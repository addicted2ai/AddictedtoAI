/**
 * run-tests-lock.test.mjs — proves the addictedtoai-ngz fix as a MEASUREMENT,
 * not as an inspection of the code.
 *
 * THE DEFECT: a Desk gate's `npm test` failed on a real assertion tripped by a
 * fake cause — three unrelated `npm test` callers running concurrently with
 * the gate exhausted this machine's ephemeral loopback ports, and a `pulse`
 * HTTP-fixture test saw `fetch failed` / `EADDRINUSE`. The fix serialises
 * every `npm test` run (whatever invoked it) through a lock taken in
 * `run-tests.mjs` itself, because that is the one file every caller — the
 * Desk's gate, a subagent, a person — actually runs.
 *
 * These tests spawn the REAL `run-tests.mjs`, not a stand-in, against a
 * throwaway fixture project, and read back a shared log file — the same shape
 * `build-lock.test.mjs`'s own concurrency test uses, for the same reason: a
 * mutex proven with a stubbed clock or a fake filesystem proves nothing about
 * two real `npm test` processes racing, which is the only thing that matters
 * here.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

import { buildLockPath, acquireBuildLock, releaseBuildLock, LOCK_SUFFIX, TEST_LOCK_SUFFIX } from './build-lock.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const RUN_TESTS = join(HERE, 'run-tests.mjs');

function tmp() {
  return mkdtempSync(join(tmpdir(), 'atai-run-tests-lock-'));
}

/**
 * A fixture project with one `*.test.mjs` file that logs when it starts and
 * finishes, holding for `holdMs` in between via a synchronous sleep. Placed
 * under `tests/` because that is one of `run-tests.mjs`'s SEARCH directories.
 *
 * The log lines are written at module-load time — before the file's own
 * `test()` registers — which is exactly the window `run-tests.mjs` has the
 * test lock held for `node --test` in, so it stands in for "the suite is
 * running" without needing the fixture to know anything about locking itself.
 */
function writeFixtureProject(root, logPath, holdMs) {
  mkdirSync(join(root, 'tests'), { recursive: true });
  writeFileSync(
    join(root, 'tests', 'slow.test.mjs'),
    `import { appendFileSync } from 'node:fs';
import test from 'node:test';
const log = ${JSON.stringify(logPath)};
appendFileSync(log, 'enter ' + process.pid + ' ' + Date.now() + '\\n');
Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ${Number(holdMs)});
appendFileSync(log, 'exit ' + process.pid + ' ' + Date.now() + '\\n');
test('fixture noop', () => {});
`,
    'utf8',
  );
}

/** Run the real run-tests.mjs against `root`, capturing output for diagnosis. */
function runRealRunTests(root, env = {}) {
  // These tests themselves run under `node --test`, which sets
  // NODE_TEST_CONTEXT on its own child process. Inheriting that into the
  // spawned run-tests.mjs — which shells out to `node --test` again for the
  // fixture — makes Node think that inner `--test` invocation is a recursive
  // call from the SAME test run and silently skip it ("run() is being called
  // recursively within a test file"). That collision is an artifact of
  // testing run-tests.mjs from inside another node:test process; a real
  // `npm test` (the Desk's gate, a subagent, a person) is never itself a
  // child of a `node --test` parent, so it never carries this variable. Strip
  // it so the spawned process behaves like a real top-level `npm test`.
  const childEnv = { ...process.env, ...env };
  delete childEnv.NODE_TEST_CONTEXT;
  return new Promise((resolve) => {
    const c = spawn(process.execPath, [RUN_TESTS], {
      cwd: root,
      env: childEnv,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let out = '';
    c.stdout.on('data', (d) => (out += d));
    c.stderr.on('data', (d) => (out += d));
    c.on('close', (code) => resolve({ code, out }));
  });
}

test('two concurrent `npm test` runs over one tree do not overlap — the second waits for the first', async () => {
  const root = tmp();
  const log = join(root, 'order.log');
  writeFileSync(log, '', 'utf8');
  writeFixtureProject(root, log, 500);

  const [a, b] = await Promise.all([runRealRunTests(root), runRealRunTests(root)]);
  assert.equal(a.code, 0, `first run-tests.mjs exited nonzero:\n${a.out}`);
  assert.equal(b.code, 0, `second run-tests.mjs exited nonzero:\n${b.out}`);

  const events = readFileSync(log, 'utf8').trim().split('\n').filter(Boolean);
  assert.equal(events.length, 4, `expected two enter/exit pairs from two REAL runs, got:\n${events.join('\n')}`);

  // The only ordering a mutex permits: nobody enters while somebody else is
  // inside. This is the measurement the issue asks for — not that the lock
  // code exists, but that two real processes actually serialised through it.
  let inside = 0;
  for (const e of events) {
    inside += e.startsWith('enter') ? 1 : -1;
    assert.ok(inside <= 1, `two npm test runs were inside the lock at once:\n${events.join('\n')}`);
  }
  assert.equal(
    events[0].split(' ')[1],
    events[1].split(' ')[1],
    'the first process to enter is the first process to exit — no interleaving',
  );

  rmSync(root, { recursive: true, force: true });
});

/**
 * The design decision this issue asks for explicitly: a SEPARATE lock from
 * the build's, so a held build lock never makes `npm test` wait for no
 * reason (they do not actually contend — loopback ports vs. `.next/`/`out/`).
 * Proven the same way: hold one lock for real and show the other acquires
 * immediately rather than blocking.
 */
test('the test lock and the build lock are independent files and never contend with each other', () => {
  const root = tmp();
  mkdirSync(root, { recursive: true });

  assert.notEqual(
    buildLockPath(root, TEST_LOCK_SUFFIX),
    buildLockPath(root, LOCK_SUFFIX),
    'the test lock and the build lock must be different files for the same tree',
  );

  // Hold the BUILD lock, then confirm the TEST lock is available immediately
  // (waitMs: 0 — any contention at all throws).
  const build = acquireBuildLock({ dir: root, suffix: LOCK_SUFFIX, label: 'a build in progress' });
  const testLock = acquireBuildLock({ dir: root, suffix: TEST_LOCK_SUFFIX, waitMs: 0, label: 'a test run' });
  assert.equal(testLock.waitedMs < 100, true, 'the test lock waited on an unrelated build lock');
  releaseBuildLock(testLock.path, testLock.holderPid);
  releaseBuildLock(build.path, build.holderPid);

  rmSync(root, { recursive: true, force: true });
});

/**
 * `run-tests.mjs` reports a wait rather than hanging silently — the issue's
 * "make sure a lock wait is visible" requirement, measured against real
 * stdout rather than assumed from the `log` callback being wired up.
 */
test('a real npm test run that has to wait for the lock says so on stdout', async () => {
  const root = tmp();
  const log = join(root, 'order.log');
  writeFileSync(log, '', 'utf8');
  writeFixtureProject(root, log, 1500);

  const first = runRealRunTests(root);
  // Give the first process a moment to actually acquire the lock before the
  // second tries — otherwise both could race for first place and neither
  // would be guaranteed to observe a wait.
  await new Promise((r) => setTimeout(r, 300));
  const second = await runRealRunTests(root);
  const firstResult = await first;

  assert.equal(firstResult.code, 0, firstResult.out);
  assert.equal(second.code, 0, second.out);
  assert.match(
    second.out,
    /build-lock: waiting for .* to finish its test run/,
    `the waiting process did not announce the wait:\n${second.out}`,
  );

  rmSync(root, { recursive: true, force: true });
});
