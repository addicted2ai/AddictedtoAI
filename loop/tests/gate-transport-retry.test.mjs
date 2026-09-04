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
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { runLoop } from '../run.mjs';
import { readLedger } from '../lib/ledger.mjs';
import {
  gateFailureNote,
  isTransportFailure,
  TRANSPORT_FAILURE_MARKER,
} from '../lib/gates.mjs';
import { assertNoTransportFailure } from '../../pulse/tests/helpers.mjs';
import { makeRepo, writeQueue, mockCommand, runnersYaml } from './helpers.mjs';

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

/** Gate output in `runGates`' own shape, carrying whatever the suite printed. */
function gateOutput(body) {
  return `--- npm run test (FAIL, exit 1)\n${body}\n`;
}

const FAILING = (output) => ({
  ok: false,
  results: [{ script: 'test', ok: false, status: 1, output }],
  output,
});
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
