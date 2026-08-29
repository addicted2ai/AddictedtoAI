/**
 * sources.test.mjs — the fetch error string keeps its errno.
 *
 * `fetch` collapses every connection-level failure into the identical
 * `TypeError: fetch failed` and hangs the only distinguishing detail off
 * `err.cause`. `fetchSource` used to record just name and message, which made
 * a source that is genuinely down read exactly like a machine that has run
 * out of ephemeral ports.
 *
 * That cost a day (addictedtoai-ar0): `npm test` is a merge gate, the gate
 * failed intermittently under load, and the only evidence in the log was
 * "unreachable: TypeError: fetch failed" — which names a network or content
 * problem, not the test harness. Measured on 2026-08-29: with ~7,000 loopback
 * ports held in TIME_WAIT, 688 of 3,000 fetches to a freshly bound
 * 127.0.0.1 server failed, every one of them `connect EADDRINUSE`.
 *
 * This is the mechanism that keeps the errno, rather than a comment asking
 * the next person to preserve it.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { describeFetchError } from '../lib/sources.mjs';

/** The shape undici actually produces for a failed connect. */
function fetchFailed(code, message = 'connect EADDRINUSE 127.0.0.1:13513') {
  const cause = new Error(message);
  cause.code = code;
  cause.syscall = 'connect';
  const err = new TypeError('fetch failed');
  err.cause = cause;
  return err;
}

test('the errno behind a failed connect survives into the recorded error', () => {
  const out = describeFetchError(fetchFailed('EADDRINUSE'));
  assert.match(out, /TypeError: fetch failed/, 'the original sentence is kept');
  assert.match(out, /EADDRINUSE/, 'and the errno that distinguishes it is not thrown away');
});

test('two different connection failures no longer record the same string', () => {
  // The whole defect in one assertion: a source that is down and a machine
  // out of ports produced byte-identical evidence.
  const down = describeFetchError(fetchFailed('ECONNREFUSED', 'connect ECONNREFUSED 127.0.0.1:80'));
  const outOfPorts = describeFetchError(fetchFailed('EADDRINUSE'));
  assert.notEqual(down, outOfPorts);
  assert.match(down, /ECONNREFUSED/);
  assert.match(outOfPorts, /EADDRINUSE/);
});

test('a cause with no code still contributes its message', () => {
  const cause = new Error('other side closed');
  const err = new TypeError('fetch failed');
  err.cause = cause;
  assert.equal(describeFetchError(err), 'TypeError: fetch failed (other side closed)');
});

test('an error with no cause reads exactly as it did before', () => {
  // A timeout aborts with its own name and no cause, and must not grow a
  // trailing empty parenthesis.
  const err = new Error('The operation was aborted due to timeout');
  err.name = 'TimeoutError';
  assert.equal(
    describeFetchError(err),
    'TimeoutError: The operation was aborted due to timeout',
  );
  assert.doesNotMatch(describeFetchError(err), /\(\)/);
});
