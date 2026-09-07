/**
 * git-retry.test.mjs — a read-only git call that fails once is retried once,
 * and one that fails twice throws with the child's stderr in the message
 * (beads addictedtoai-vd5y).
 *
 * Measured twice, 2026-09-06 (j-20260906-18) and 2026-09-07 (j-20260907-11):
 * the loop died right after the runner returned on
 * `git diff --name-status <base>...<branch>` with the bare "Command failed"
 * message, no ledger line, and the identical command succeeded when re-run by
 * hand. The retry carries such a run to review; the stderr is what a reader
 * needs when the retry fails too.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { retryOnce, changedPathsWithStatus } from '../lib/git.mjs';

test('vd5y a call that fails once succeeds on the retry, and the retry is announced', () => {
  let calls = 0;
  const seen = [];
  const out = retryOnce(
    () => {
      calls += 1;
      if (calls === 1) throw Object.assign(new Error('Command failed: git diff'), { stderr: 'fatal: transient' });
      return 'ok';
    },
    { sleepMs: 10, onRetry: (e) => seen.push(e.message) },
  );
  assert.equal(out, 'ok');
  assert.equal(calls, 2, 'exactly one retry');
  assert.deepEqual(seen, ['Command failed: git diff'], 'the first failure is handed to onRetry');
});

test('vd5y a call that fails twice throws the second error with its stderr appended', () => {
  let calls = 0;
  assert.throws(
    () =>
      retryOnce(
        () => {
          calls += 1;
          throw Object.assign(new Error('Command failed: git diff'), { stderr: 'fatal: bad object deadbeef\n' });
        },
        { sleepMs: 10 },
      ),
    (e) => /Command failed: git diff/.test(e.message) && /fatal: bad object deadbeef/.test(e.message),
    'the message must carry the stderr the log previously lost',
  );
  assert.equal(calls, 2, 'it was retried exactly once before giving up');
});

test('vd5y the real changedPathsWithStatus surfaces git\'s own stderr when it fails for good', () => {
  assert.throws(
    () => changedPathsWithStatus('D:/this-directory-does-not-exist-vd5y', 'a', 'b'),
    (e) => /Command failed/.test(e.message) && /(cannot change to|not a git repository|No such file)/i.test(e.message),
    'the thrown message names git\'s reason, not just the command line',
  );
});
