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
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describeFetchError } from '../lib/sources.mjs';
import {
  assertIngested,
  cleanup,
  jsonSource,
  makeRoot,
  paths,
  readJson,
  runPulse,
  serve,
  TRANSPORT_FAILURE_MARKER,
} from './helpers.mjs';

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

  // `allowFetchFailure` because this test's SUBJECT is a lost fetch.
  // `runPulse` refuses to return from a transport failure everywhere else
  // (`assertNoTransportFailure`), which is what stops this class presenting
  // as a content bug at a fifth call site; here the failure is the point.
  const run = await runPulse(root, ['--no-build'], {}, { allowFetchFailure: true });
  assert.equal(run.status, 0, 'one unreachable source is degradation, not a crash — this is the whole trap');
  assert.equal(readJson(paths.latest(root, 'models')), null, 'and it writes no snapshot, so readers see null');
});

test('assertIngested fires on that run, and names the errno rather than a downstream symptom', async (t) => {
  const root = makeRoot([jsonSource('models', 'http://127.0.0.1:1/models')]);
  t.after(() => cleanup(root));

  assert.equal((await runPulse(root, ['--no-build'], {}, { allowFetchFailure: true })).status, 0);

  assert.throws(
    () => assertIngested(root, 'models', 'unit'),
    (err) => {
      assert.match(err.message, /never ingested/, 'it must say the source never ingested');
      assert.match(err.message, /ECONNREFUSED|EADDRINUSE|fetch failed/, 'and carry the errno undici reported');
      // Asserted against the CONSTANT, not against a copy of its words: a
      // literal here would be a fourth place the sentence lives, and re-inventing
      // the wording is the defect this keying has already had once
      // (addictedtoai-brsp).
      assert.ok(
        err.message.includes(TRANSPORT_FAILURE_MARKER),
        `it must announce the machine failure in the one shared wording; it said: ${err.message}`,
      );
      return true;
    },
  );
});

test('runPulse itself refuses to return from a lost fetch, so no call site can forget the check', async (t) => {
  // THE CLASS FIX, and the reason it is not another wired call site. The three
  // sites that had already failed got `assertIngested` on 2026-09-02; on
  // 2026-09-03 the identical failure arrived at a fourth (`mint.test.mjs:254`,
  // "a price change never reaches the timeline", 0 !== 1) and failed a Desk
  // job's merge gate, discarding 14.21 model-minutes. There are 107 `runPulse`
  // call sites; naming them one incident at a time is a fix that is always
  // one door behind. The guard now lives in the function all 107 call.
  const root = makeRoot([jsonSource('models', 'http://127.0.0.1:1/models')]);
  t.after(() => cleanup(root));

  await assert.rejects(
    () => runPulse(root, ['--no-build']),
    (err) => {
      assert.match(err.message, /lost its connection/, 'it must name the transport as the cause');
      assert.match(err.message, /ECONNREFUSED|EADDRINUSE|fetch failed/, 'and carry the errno undici reported');
      assert.ok(err.message.includes(TRANSPORT_FAILURE_MARKER), err.message);
      assert.match(err.message, /--no-build/, 'and quote the run it happened on, so the failing site is obvious');
      return true;
    },
  );
});

test('THE CONTROL: an HTTP status a fixture chose to serve is NOT a transport failure', async (t) => {
  // The distinction the guard turns on. A 404 is something a test DECIDED to
  // serve, and several tests here serve one deliberately; a fetch that never
  // connected is never intended by any fixture. Without this control the guard
  // would be free to fire on the tests it is supposed to leave alone, and
  // defaulting it on across 107 sites would be unsafe.
  const server = await serve(() => ({ status: 404, body: 'nope' }));
  const root = makeRoot([jsonSource('models', `${server.url}/models`)]);
  t.after(async () => {
    await server.close();
    cleanup(root);
  });

  const run = await runPulse(root, ['--no-build']);
  assert.equal(run.status, 0, 'a 404 source degrades exactly as before');
  assert.match(
    JSON.parse(readFileSync(paths.state(root, 'models'), 'utf8')).last_error.detail,
    /^HTTP 404/,
    'and it really did record an error — the guard is choosing not to fire, not finding nothing',
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

/*
 * ── The companion fetch: once per KEY, failing per key ───────────────────────
 *
 * Change `bind-a-price-to-the-vendor-that-posts-it`, task 8. specs/pulse: "the
 * per-row provider listing SHALL be snapshotted like any other fetch", and "a
 * companion fetch's failures SHALL be per key and SHALL NOT fail the run".
 *
 * Four priced rows over three canonical slugs, so the count that matters is
 * THREE — design D1's saving, measured at 404 rows over 335 keys on the
 * committed snapshot. Keying on the row id would fetch one provider listing
 * twice for two variants of one model.
 */

const COMPANION_ROWS = [
  { id: 'acme/one', name: 'Acme One', canonical_slug: 'k-one', pricing: { prompt: '0.000001' } },
  { id: 'acme/one:free', name: 'Acme One (free)', canonical_slug: 'k-one', pricing: { prompt: '0.000002' } },
  { id: 'acme/two', name: 'Acme Two', canonical_slug: 'k-two', pricing: { prompt: '0.000003' } },
  { id: 'acme/three', name: 'Acme Three', canonical_slug: 'k-three', pricing: { prompt: '0.000004' } },
];

function companionSource(url) {
  return {
    id: 'models',
    url: `${url}/models`,
    format: 'json',
    rows_path: 'data',
    row_id_field: 'id',
    display_name_field: 'name',
    yields: ['id', 'name', 'pricing.prompt', 'canonical_slug'],
    fetch_every_days: 1,
    expected_change_days: 3,
    material_fields: [{ field: 'price_input', path: 'pricing.prompt', event: false }],
    mints: null,
    robots: { checked_on: '2026-09-07', result: 'allowed', requests_per_day: 10 },
    verification: { date: '2026-09-07', result: 'live' },
    companion: {
      url_template: `${url}/endpoints/{key}`,
      fetch_every_days: 1,
      covers: { field: 'pricing.prompt', test: 'nonzero', key: 'canonical_slug' },
      snapshot: 'endpoints',
      declared_on: '2026-09-07',
      canonical_tier: 'standard',
      provider_field: 'tag',
      provider_identities: { acme: { provider_slug: 'acme', declared_on: '2026-09-07' } },
      rows_path: 'data.endpoints',
      rates: { price_input: 'pricing.prompt', price_output: 'pricing.completion' },
    },
  };
}

/**
 * A server that counts companion requests and fails exactly one model's listing.
 *
 * The failure is keyed on the MODEL rather than on the literal key string, so
 * mutating the code to fetch once per row id instead of once per key changes the
 * request COUNT and nothing else — which is what makes that mutation a clean
 * measurement of the count assertion rather than of three assertions at once.
 */
async function companionServer(fails = 'two') {
  let endpointCalls = 0;
  const server = await serve((pathname) => {
    if (pathname === '/models') return { status: 200, body: JSON.stringify({ data: COMPANION_ROWS }) };
    if (pathname.startsWith('/endpoints/')) {
      endpointCalls++;
      const key = pathname.slice('/endpoints/'.length);
      if (key.includes(fails)) return { status: 500, body: 'upstream is unwell' };
      return {
        status: 200,
        body: JSON.stringify({
          data: {
            endpoints: [
              { tag: 'acme', provider_name: 'Acme', pricing: { prompt: '0.00001', completion: '0.00002' } },
            ],
          },
        }),
      };
    }
    return { status: 404, body: '' };
  });
  return { server, calls: () => endpointCalls };
}

test('a companion is fetched once per key, one key can fail alone, and the run exits 0', async (t) => {
  const { server, calls } = await companionServer();
  const root = makeRoot([companionSource(server.url)]);
  t.after(async () => {
    await server.close();
    cleanup(root);
  });

  const run = await runPulse(root, ['--no-build', '--no-mint']);
  assert.equal(run.status, 0, run.out);
  assertIngested(root, 'models', 'the companion fixture');

  // THREE, not four. Two rows share `k-one`, and both read the one listing
  // fetched on that key's behalf.
  assert.equal(calls(), 3, 'one request per distinct key, not one per covered row');

  const rows = new Map(readJson(paths.catalog(root)).rows.map((r) => [r.row_id, r]));
  for (const rowId of ['acme/one', 'acme/one:free', 'acme/three']) {
    const vendor = rows.get(rowId).vendor_posted_rate;
    assert.equal(vendor.absent, false, `${rowId} resolves`);
    assert.equal(vendor.provider_slug, 'acme');
    assert.equal(vendor.tier, 'standard');
    assert.equal(vendor.rates.price_input, '0.00001');
  }
  // The failed key, and only the rows it covers.
  const failed = rows.get('acme/two').vendor_posted_rate;
  assert.equal(failed.absent, true);
  assert.equal(failed.reason.code, 'listing_did_not_fetch');
  assert.ok(failed.as_of, 'and the absence is dated');
  assert.equal(rows.get('acme/two').price_input, '0.000003', 'while the listing rate is untouched');

  // ── The snapshot half: what makes the claim false-able after the vendor
  //    changes its price. Asserted on the written file's KEY SET, not on its
  //    existence — the reduction to the bound fields is the decision (design
  //    D4), and a snapshot storing the whole upstream response for 335 slugs
  //    would dwarf the 1.1 MB models snapshot in a repository that commits its
  //    data in full.
  const snapshotFile = join(root, 'data', 'sources', 'models', 'endpoints.latest.json');
  const snapshot = readJson(snapshotFile);
  assert.match(snapshot.date, /^\d{4}-\d{2}-\d{2}$/, 'the companion snapshot is dated');
  assert.deepEqual(Object.keys(snapshot.keys).sort(), ['k-one', 'k-three', 'k-two']);
  assert.deepEqual(
    Object.keys(snapshot.keys['k-one'].endpoints[0]).sort(),
    ['price_input', 'price_output', 'tag'],
    'only the fields the site binds: the provider identity as published, and the posted rates',
  );
  assert.equal(snapshot.keys['k-two'].status, 'error', 'and a failed key records its status, not a guess');
  assert.equal(snapshot.keys['k-two'].endpoints, null);

  // ── Rotation follows the existing rule: an unchanged listing costs one
  //    request per key and no bytes.
  const latestBefore = readJson(snapshotFile);
  const previousBefore = readJson(join(root, 'data', 'sources', 'models', 'endpoints.previous.json'));
  assert.equal((await runPulse(root, ['--no-build', '--no-mint', '--force'])).status, 0);
  assert.equal(calls(), 6, 'the second run really did fetch again — the rotation is choosing not to write');
  assert.deepEqual(readJson(snapshotFile), latestBefore, 'latest is not rewritten when nothing changed');
  assert.deepEqual(
    readJson(join(root, 'data', 'sources', 'models', 'endpoints.previous.json')),
    previousBefore,
    'and previous is replaced only when the fetched rows differ from latest',
  );
});
