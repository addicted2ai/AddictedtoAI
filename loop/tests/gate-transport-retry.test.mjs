/**
 * A transport failure in the gates is not a defect (beads addictedtoai-ar0).
 *
 * On 2026-09-04 this cost real work twice in one chain: job j-20260904-38
 * authored its repair successfully (7.96 model-minutes, author outcome `done`),
 * its gate run then failed, and the whole job was recorded `failed` with its
 * branch left unmerged; the closing six-gate pass failed the same way minutes
 * later. Re-run alone with nothing else on the machine, the same suite passed
 * 1201/1201. Neither was a defect — both were `connect EADDRINUSE`, this
 * machine exhausting ephemeral ports under concurrent load. Three such runs
 * trip breaker 1 and halt the entire Desk on nothing.
 *
 * THE GATE OUTPUT IN THESE TESTS IS NOT A COPY OF THE MARKER CONSTANT. It is
 * the text `pulse/tests/helpers.mjs`'s own `assertNoTransportFailure` really
 * throws, captured from a real call against a real fixture — because a test
 * that matched the constant against itself would stay green after the emitter
 * changed its wording, which is the one failure this keying can have.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { runLoop } from '../run.mjs';
import { readLedger } from '../lib/ledger.mjs';
import {
  gateFailureNote,
  gatesHitTransportFailure,
  isTransportFailure,
  runGates,
  TRANSPORT_FAILURE_MARKER,
} from '../lib/gates.mjs';
import { assertIngested, assertNoTransportFailure } from '../../pulse/tests/helpers.mjs';
import { makeRepo, writeQueue, mockCommand, runnersYaml } from './helpers.mjs';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

/**
 * Make the real emitter emit, and return what it said.
 *
 * `assertNoTransportFailure` reads a source's recorded `last_error.detail` and
 * throws only when it is not an `HTTP <status>` — it is the code that knows the
 * difference between a machine that ran out of sockets and a response a fixture
 * chose to serve. This is the string the loop keys on in production.
 */
function realTransportFailureText() {
  const root = mkdtempSync(join(tmpdir(), 'atai-transport-'));
  try {
    mkdirSync(join(root, 'data', 'sources', 'flaky'), { recursive: true });
    writeFileSync(
      join(root, 'data', 'sources', 'flaky', 'state.json'),
      JSON.stringify({
        last_error: {
          date: '2026-09-04',
          detail: 'TypeError: fetch failed (connect EADDRINUSE 127.0.0.1:63410)',
        },
      }),
      'utf8',
    );
    let message = null;
    try {
      assertNoTransportFailure(root, ['--no-build']);
    } catch (err) {
      message = err.message;
    }
    assert.ok(message, 'the fixture no longer induces a transport failure from the real emitter');
    return message;
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

/**
 * The SECOND emitting site, made to emit, returning what it said.
 *
 * `assertIngested` fires on any recorded `last_error`, so unlike
 * `assertNoTransportFailure` it must decide for itself whether what it saw was
 * the machine. `detail` here is a lost connect, so it is.
 */
function realConnectionFailureText(detail = 'TypeError: fetch failed (connect EADDRINUSE 127.0.0.1:63410)') {
  const root = mkdtempSync(join(tmpdir(), 'atai-ingest-'));
  try {
    mkdirSync(join(root, 'data', 'sources', 'flaky'), { recursive: true });
    writeFileSync(
      join(root, 'data', 'sources', 'flaky', 'state.json'),
      JSON.stringify({ last_error: { date: '2026-09-04', detail } }),
      'utf8',
    );
    let message = null;
    try {
      assertIngested(root, 'flaky', 'unit');
    } catch (err) {
      message = err.message;
    }
    assert.ok(message, 'the fixture no longer induces a failure from the real `assertIngested`');
    return message;
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

/** Gate output in `runGates`' own shape, carrying whatever the suite printed. */
function gateOutput(body) {
  return `--- npm run test (FAIL, exit 1)\n${body}\n`;
}

const FAILING = (output) => ({
  ok: false,
  results: [{ script: 'test', ok: false, status: 1, output }],
  transport: isTransportFailure(output),
  output,
});

/**
 * WHAT A REAL TRUNCATED RUN LOOKS LIKE: `runGates` saw the marker in the full
 * output and said so, and then truncated the log until the marker was gone. The
 * measurement in `runGates truncates the log it keeps, and decides BEFORE it
 * does` below is what says this shape is real and not a convenient invention.
 */
const FLAGGED_BUT_TRUNCATED = {
  ok: false,
  results: [{ script: 'test', ok: false, status: 1, output: 'ok 1198\nok 1199\nok 1200\nok 1201\n' }],
  transport: true,
  output: gateOutput('ok 1198\nok 1199\nok 1200\nok 1201\n'),
};
const PASSING = { ok: true, results: [{ script: 'test', ok: true, status: 0, output: 'ok' }], output: 'ok' };

/** A repository whose author really edits a file and whose reviewer approves. */
function repo() {
  const ctx = makeRepo({
    runners: runnersYaml({
      command: mockCommand('done-edit'),
      reviewerCommand: mockCommand('review-approve'),
    }),
  });
  writeQueue(ctx, [{ type: 'repair', title: 'fix the fixture link', detail: 'a small repair' }]);
  return ctx;
}

/**
 * A gate stub that answers from a script and records where each call ran.
 *
 * `runLoop` uses the same hook twice for different things: the branch gates in
 * the job's worktree, and — after a merge — the post-merge build, which runs at
 * the repository root. Only the first is what the retry is about, so the tests
 * below count the calls made in the worktree rather than every call.
 */
function stub(...answers) {
  const calls = [];
  const fn = (ctx, dir) => {
    calls.push(dir);
    return answers[Math.min(calls.length - 1, answers.length - 1)];
  };
  fn.calls = calls;
  fn.branchCalls = (ctx) => calls.filter((d) => d !== ctx.repoRoot);
  return fn;
}

test('the marker the loop keys on is the marker the emitting code really writes', () => {
  const emitted = realTransportFailureText();
  assert.match(emitted, /connect EADDRINUSE/, 'the fixture induced the class this is about');
  assert.ok(
    emitted.includes(TRANSPORT_FAILURE_MARKER),
    `the emitter no longer contains ${JSON.stringify(TRANSPORT_FAILURE_MARKER)}; it said: ${emitted}`,
  );
  assert.equal(isTransportFailure(gateOutput(emitted)), true);
});

test('a marked gate failure is retried once, and a passing retry is not a failure at all', async () => {
  const ctx = repo();
  const gates = stub(FAILING(gateOutput(realTransportFailureText())), PASSING);
  const res = await runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', gates });

  assert.equal(gates.branchCalls(ctx).length, 2, 'the branch gates ran exactly twice');
  assert.equal(res.outcome, 'done', ctx.output());
  assert.match(ctx.output(), /gates \(retry after a transport failure\): PASS/);
  const line = readLedger(ctx).at(-1);
  assert.equal(line.outcome, 'done');
  assert.ok(!/gates failed/.test(line.note ?? ''), 'nothing is recorded as a gate failure');
  ctx.cleanup();
});

test('an UNMARKED gate failure is not retried, and the note says which gate failed', async () => {
  const ctx = repo();
  // A real defect: the suite failed and said nothing about transport. If this
  // were retried, a broken diff would cost two full gate runs every time.
  const gates = stub(FAILING(gateOutput('not ok 1 - lib/schema.test.mjs\n  expected 3, got 4')), PASSING);
  const res = await runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', gates });

  assert.equal(gates.branchCalls(ctx).length, 1, 'the gates ran exactly once — no retry without the marker');
  assert.equal(res.outcome, 'failed', ctx.output());
  assert.doesNotMatch(ctx.output(), /retry after a transport failure/);
  const line = readLedger(ctx).at(-1);
  assert.equal(line.outcome, 'failed');
  assert.equal(line.note, 'gates failed: npm run test (exit 1) — no transport marker in the captured output');
  ctx.cleanup();
});

test('a marked failure whose retry ALSO fails still ends `failed`, and the note says so', async () => {
  const ctx = repo();
  const marked = FAILING(gateOutput(realTransportFailureText()));
  const gates = stub(marked, marked);
  const res = await runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', gates });

  assert.equal(gates.branchCalls(ctx).length, 2, 'retried once, never in a loop');
  assert.equal(res.outcome, 'failed', ctx.output());
  assert.match(ctx.output(), /gates \(retry after a transport failure\): FAIL/);
  const line = readLedger(ctx).at(-1);
  assert.equal(line.outcome, 'failed');
  assert.equal(
    line.note,
    'gates failed: npm run test (exit 1) — transport-marked, retried once and failed again',
  );
  ctx.cleanup();
});

test('gateFailureNote names a gate that could not run at all', () => {
  const note = gateFailureNote({
    ok: false,
    results: [{ script: 'build', ok: false, status: null, output: 'no "build" script' }],
    output: 'no "build" script',
  });
  assert.equal(note, 'gates failed: npm run build (could not run) — no transport marker in the captured output');
});

// ---------------------------------------------------------------------------
// CASE 2 (beads addictedtoai-brsp) — the SECOND emitting site.
//
// `assertIngested` announced the identical class of machine failure in its own
// words ("CONNECTION"), and the marker matched only `assertNoTransportFailure`'s
// ("TRANSPORT"), so half the emitting surface was invisible to the retry. The
// fix is one definition, imported by both, not a regex covering both — a wider
// regex leaves the next fixture free to invent a third wording, which is exactly
// how this defect was born.
// ---------------------------------------------------------------------------

test('the SECOND emitting site announces a machine failure in the same one wording', () => {
  const emitted = realConnectionFailureText();
  assert.match(emitted, /connect EADDRINUSE/, 'the fixture induced the class this is about');
  assert.ok(
    emitted.includes(TRANSPORT_FAILURE_MARKER),
    `assertIngested no longer contains ${JSON.stringify(TRANSPORT_FAILURE_MARKER)}; it said: ${emitted}`,
  );
  // And therefore the loop can now SEE it, which is the whole point.
  assert.equal(isTransportFailure(gateOutput(emitted)), true);
});

test('an HTTP status from that site carries NO marker — the retry is not widened', () => {
  // `assertIngested` fires on ANY `last_error`, and fixtures in this repository
  // serve a 403 or a 404 on purpose. An HTTP status is a response a test CHOSE;
  // treating it as a machine failure would make the Desk retry a real,
  // reproducible defect, and "a real defect still fails twice" is the only
  // reason the retry is safe at all.
  const emitted = realConnectionFailureText('HTTP 403 Forbidden');
  assert.match(emitted, /never ingested/, 'it still refuses to let the run continue');
  assert.equal(
    emitted.includes(TRANSPORT_FAILURE_MARKER),
    false,
    `an HTTP status must not be announced as a machine failure; it said: ${emitted}`,
  );
  assert.equal(isTransportFailure(gateOutput(emitted)), false);
});

test('`pulse/` carries no hard-coded wording of the machine-failure sentence', () => {
  // THE MECHANISM, not the instruction. A shared constant only helps while
  // everyone imports it; nothing stops the next fixture from typing its own
  // sentence, which is precisely what happened. This scans every `.mjs` under
  // `pulse/` for the shape of the sentence written as a literal and fails on
  // one, so a re-invention is a red test rather than a silently unretried gate.
  const shape = /failure, not a logic failure/;
  const offenders = [];
  const walk = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith('.mjs') && shape.test(readFileSync(p, 'utf8'))) offenders.push(p);
    }
  };
  walk(join(REPO_ROOT, 'pulse'));
  assert.deepEqual(
    offenders,
    [],
    'these files write the machine-failure sentence themselves instead of importing ' +
      '`TRANSPORT_FAILURE_MARKER` from `loop/lib/gates.mjs`, so the Desk cannot key on what they say',
  );
});

// ---------------------------------------------------------------------------
// CASE 1 (beads addictedtoai-kisa) — the marker thrown away before it is read.
//
// `runGates` keeps `r.output.slice(-6000)` per script for the human-readable
// log. `npm test` runs 1201 tests and prints a line per test, so a transport
// failure raised EARLY is pushed out of that window long before anything reads
// it. The decision must therefore be made at the point of capture, over the
// full output, and carried as a flag.
// ---------------------------------------------------------------------------

/**
 * A throwaway package whose `test` script prints `body` and then enough noise to
 * bury it, exactly as a 1201-test run buries an early failure.
 */
function noisyGateWorktree(body, noiseChars = 40000) {
  const dir = mkdtempSync(join(tmpdir(), 'atai-noisy-gate-'));
  writeFileSync(
    join(dir, 'package.json'),
    JSON.stringify({ name: 'noisy-gate-fixture', private: true, scripts: { test: 'node noisy.mjs' } }),
    'utf8',
  );
  writeFileSync(
    join(dir, 'noisy.mjs'),
    `process.stdout.write(${JSON.stringify(body + '\n')});\n` +
      `process.stdout.write('ok a passing test\\n'.repeat(${Math.ceil(noiseChars / 20)}));\n` +
      `process.exit(1);\n`,
    'utf8',
  );
  return dir;
}

test('runGates truncates the log it keeps, and decides BEFORE it does', () => {
  const emitted = realTransportFailureText();
  const dir = noisyGateWorktree(emitted);
  try {
    const res = runGates({ repoRoot: dir }, dir, { scripts: ['test'], timeoutMs: 120000 });

    assert.equal(res.ok, false, `the fixture gate was meant to fail; it returned ${JSON.stringify(res.results)}`);
    // The truncation is REAL and is kept: this is the condition kisa describes,
    // reproduced rather than asserted about.
    assert.equal(
      isTransportFailure(res.output),
      false,
      'the fixture no longer buries the marker outside the 6000-char tail, so this test is measuring nothing',
    );
    // And the decision survived it.
    assert.equal(res.transport, true, 'the marker was in the full captured output and must have been seen there');
    assert.equal(gatesHitTransportFailure(res), true);
    assert.equal(
      gateFailureNote(res),
      'gates failed: npm run test (exit 1) — transport-marked',
      'and the ledger line says the machine failed, not the diff',
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('a marked failure whose marker was truncated out of the log is STILL retried', async () => {
  const ctx = repo();
  // Precisely the shape the measurement above produced: nothing in the summary,
  // the decision on the result. Read from the log, this is an ordinary failing
  // test run and the retry never fires.
  assert.equal(isTransportFailure(FLAGGED_BUT_TRUNCATED.output), false, 'the fixture must not smuggle the marker in');
  const gates = stub(FLAGGED_BUT_TRUNCATED, PASSING);
  const res = await runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', gates });

  assert.equal(gates.branchCalls(ctx).length, 2, 'the branch gates ran exactly twice');
  assert.equal(res.outcome, 'done', ctx.output());
  assert.match(ctx.output(), /gates \(retry after a transport failure\): PASS/);
  ctx.cleanup();
});

test('an unflagged, unmarked failure is still not retried — the flag is not a blanket', async () => {
  const ctx = repo();
  const plain = {
    ok: false,
    results: [{ script: 'test', ok: false, status: 1, output: 'not ok 1 - lib/schema.test.mjs' }],
    transport: false,
    output: gateOutput('not ok 1 - lib/schema.test.mjs\n  expected 3, got 4'),
  };
  const gates = stub(plain, PASSING);
  const res = await runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', gates });

  assert.equal(gates.branchCalls(ctx).length, 1, 'a real defect still fails once and is not retried');
  assert.equal(res.outcome, 'failed', ctx.output());
  ctx.cleanup();
});
