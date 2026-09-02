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
import { assertIngested, cleanup, jsonSource, makeRoot, paths, readJson, runPulse, serve } from './helpers.mjs';

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

/**
 * The other half of addictedtoai-ar0, missing until 2026-09-02.
 *
 * The errno has been preserved into `state.json` since that day — and no test
 * ever read it, so the diagnosis was thrown away one layer above the place it
 * was carefully kept. Three Desk jobs were failed at the merge gate by the
 * downstream symptoms of a fixture fetch that never landed (a `null` snapshot,
 * a status flip that never happened), and ~19 model-minutes of sound work was
 * discarded on two of them (addictedtoai-fpud).
 *
 * These two tests pin both halves: that a lost fetch really does leave the
 * Pulse exiting 0, which is why the symptom surfaces so far from the cause,
 * and that `assertIngested` fires on it and names the errno.
 */
test('a source that cannot be reached does NOT fail the run — it degrades, exit 0', async (t) => {
  // Port 1 on loopback: nothing listens there, so the connect is refused
  // immediately. No fixture server, and therefore no port of our own to leak.
  const root = makeRoot([jsonSource('models', 'http://127.0.0.1:1/models')]);
  t.after(() => cleanup(root));

  const run = await runPulse(root, ['--no-build']);
  assert.equal(run.status, 0, 'one unreachable source is degradation, not a crash — this is the whole trap');
  assert.equal(readJson(paths.latest(root, 'models')), null, 'and it writes no snapshot, so readers see null');
});

test('assertIngested fires on that run, and names the errno rather than a downstream symptom', async (t) => {
  const root = makeRoot([jsonSource('models', 'http://127.0.0.1:1/models')]);
  t.after(() => cleanup(root));

  assert.equal((await runPulse(root, ['--no-build'])).status, 0);

  assert.throws(
    () => assertIngested(root, 'models', 'unit'),
    (err) => {
      assert.match(err.message, /never ingested/, 'it must say the source never ingested');
      assert.match(err.message, /ECONNREFUSED|EADDRINUSE|fetch failed/, 'and carry the errno undici reported');
      assert.match(err.message, /CONNECTION failure, not a logic failure/, 'and say which kind of failure this is');
      return true;
    },
  );
});

test('and it stays quiet when the source really did ingest — the control', async (t) => {
  const rows = [{ id: 'acme/one', name: 'Acme One', pricing: { prompt: '0.000001' }, context_length: 1000 }];
  const server = await serve(() => ({ status: 200, body: JSON.stringify({ data: rows }) }));
  const root = makeRoot([jsonSource('models', `${server.url}/models`)]);
  t.after(async () => {
    await server.close();
    cleanup(root);
  });

  assert.equal((await runPulse(root, ['--no-build'])).status, 0);
  assert.doesNotThrow(() => assertIngested(root, 'models', 'control'));
});
