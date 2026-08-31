#!/usr/bin/env node
/**
 * run-tests.mjs — what `npm test` runs.
 *
 * Finds every `*.test.mjs` (or `.test.js` / `.test.cjs`) under the source
 * directories below and hands them to Node's built-in test runner. No test
 * framework is installed: `node --test` is the whole toolchain.
 *
 * Why a script rather than `node --test` directly: the runner's default
 * discovery would walk `.next/`, `out/` and `node_modules/`, and it errors
 * when a glob matches nothing — which is the normal state until the first
 * fixtures land (task 2.6). This finds files itself and reports honestly
 * when there are none.
 *
 * Test files live beside what they test, e.g. `pulse/tests/linker.test.mjs`
 * (design D6).
 *
 * ONE TEST RUN AT A TIME PER TREE (beads addictedtoai-ngz), same idea as
 * `prebuild.mjs`'s build lock and for the same reason a *different* fix would
 * not have worked: several `pulse` tests stand up HTTP fixtures on loopback,
 * and this machine's ephemeral port range (1025-14999, `TIME_WAIT` holding for
 * minutes) is exhausted by a handful of concurrent `npm test` callers. The
 * result is `fetch failed` / `EADDRINUSE` in a test that is otherwise correct
 * — indistinguishable, in the ledger, from a real content defect, and a third
 * of the way to Breaker 1 disabling a job type for a reason that has nothing
 * to do with that job type.
 *
 * The lock has to live HERE, in the script `npm test` actually runs, not in
 * `loop/lib/gates.mjs`. The incident this fixes was three plain `npm test`
 * callers (subagents) colliding with the Desk's gate; none of them go through
 * `gates.mjs`, so a lock placed there would never see the processes that
 * caused the collision. Every caller — the Desk's gate, a subagent, a person —
 * converges here, whatever invoked them.
 *
 * It is a SEPARATE lock from the build's (`TEST_LOCK_SUFFIX`, not
 * `LOCK_SUFFIX`) — see that constant's doc comment in `build-lock.mjs` for the
 * full reasoning. Short version: the suite and `next build` do not actually
 * contend for anything (loopback ports vs. `.next/`/`out/`), so sharing one
 * lock would serialise them for no reason whenever a root build and a Desk
 * gate happen to overlap. It is NOT REENTRANT, like the build lock — safe here
 * only because `loop/lib/gates.mjs` runs `['test', 'build']` as two separate
 * `npm run` child processes in sequence, each of which acquires, holds and
 * releases its own lock before the next one's process starts. A future change
 * that held this lock while requesting the build lock (or vice versa) in one
 * process would deadlock for the full wait and fail a gate for a reason
 * unrelated to the code under test — this exact issue, reintroduced.
 */

import { readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { join, relative } from 'node:path';
import { withBuildLock, DEFAULT_WAIT_MS, TEST_LOCK_SUFFIX } from './build-lock.mjs';

const ROOT = process.cwd();
const SEARCH = ['app', 'lib', 'loop', 'pulse', 'scripts', 'tests'];
const SKIP = new Set(['node_modules', '.next', '.git', 'out', 'fixtures-out']);
const IS_TEST = /\.test\.(mjs|cjs|js)$/;

async function walk(dir, found) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return found; // directory does not exist yet — fine
  }
  for (const e of entries) {
    if (e.name.startsWith('.') || SKIP.has(e.name)) continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) await walk(full, found);
    else if (IS_TEST.test(e.name)) found.push(full);
  }
  return found;
}

const files = [];
for (const d of SEARCH) await walk(join(ROOT, d), files);
files.sort();

if (files.length === 0) {
  process.stdout.write(
    'npm test: no *.test.mjs files found yet under ' + SEARCH.join(', ') + '\n',
  );
  process.exit(0);
}

process.stdout.write(`npm test: ${files.length} test file(s)\n`);
for (const f of files) process.stdout.write(`  ${relative(ROOT, f)}\n`);

// The lock wraps only the actual test run — file discovery above is cheap and
// contends with nobody. See the header for why this is a separate,
// non-reentrant lock keyed the same way the build lock is.
let res;
try {
  res = withBuildLock(
    {
      dir: ROOT,
      suffix: TEST_LOCK_SUFFIX,
      activity: 'test run',
      label: `npm test (${ROOT})`,
      contentionNote:
        "Concurrent `npm test` runs exhaust this machine's ephemeral loopback ports " +
        "(range 1025-14999, TIME_WAIT holding for minutes), which fails a pulse HTTP-fixture " +
        'test with `fetch failed` / EADDRINUSE — a failure that reads as a real test defect and is not',
      waitMs: (() => {
        const v = Number(process.env.ATAI_TEST_LOCK_WAIT_MS ?? DEFAULT_WAIT_MS);
        return Number.isFinite(v) ? v : DEFAULT_WAIT_MS;
      })(),
      // Visible, not silent: a suite that appears to hang for minutes with no
      // explanation is its own support problem (addictedtoai-ngz).
      log: (s) => process.stdout.write(`${s}\n`),
    },
    (lock) => {
      if (lock.waitedMs > 1000) {
        process.stdout.write(`run-tests: waited ${(lock.waitedMs / 1000).toFixed(0)}s for the test lock\n`);
      }
      return spawnSync(process.execPath, ['--test', ...files], { stdio: 'inherit' });
    },
  );
} catch (err) {
  process.stderr.write(`run-tests: TEST LOCK\n${err?.message ?? err}\n`);
  process.exit(1);
}
process.exit(res.status ?? 1);
