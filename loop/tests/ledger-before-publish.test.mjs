/**
 * ledger-before-publish.test.mjs — the ledger line for a run is written and
 * committed before that run reaches the loop's only outbound `fetch()`
 * (beads addictedtoai-z7a).
 *
 * WHY THIS MATTERS TO z7a. The job-total budget (`addictedtoai-o5t`) is
 * measured against `jobSpendSoFar(ledger, jobId)` — the sum of every ledger
 * line carrying the job's id. `addictedtoai-z7a` is the finding that a run
 * whose PROCESS dies before it writes that line contributes zero to the
 * job's recorded spend, however long it actually ran. The ruling (recorded
 * in `loop/lib/budget.mjs`, at the top of the "A JOB'S TOTAL SPEND" section)
 * is to accept that limit rather than build machinery for it, on the
 * measurement that the one KNOWN way this process used to die unexpectedly —
 * `addictedtoai-1yt`'s `process.exit()`-after-`fetch()` crash — could not
 * actually have caused it, because the crash could only fire strictly AFTER
 * the ledger line for the run in question was already written and committed.
 *
 * THIS TEST IS THAT PRECONDITION, MEASURED, NOT ASSUMED. It reads
 * `loop/run.mjs`'s own source and asserts that `recordOutcome()` — the call
 * that appends the ledger line — appears, textually, before the only call to
 * `publishStep(` (the loop's one path to a `fetch()`, per `exit-code.test.mjs`'s
 * own enumeration for addictedtoai-1yt). If a future refactor ever moved the
 * publish step ahead of the ledger append, the z7a ruling's own reasoning
 * would stop being true and the crash-window analysis in `budget.mjs` would
 * need re-deriving — this test is what would catch that before it shipped.
 *
 * Asserted STRUCTURALLY, matching the precedent `exit-code.test.mjs` set: the
 * obvious behavioural test — run a real merge and watch for a live deploy —
 * has an unacceptable failure mode (a red test that deploys the live site).
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const LOOP = dirname(dirname(fileURLToPath(import.meta.url)));
const RUN_SRC = readFileSync(join(LOOP, 'run.mjs'), 'utf8');

/** Same technique as exit-code.test.mjs: blank comments, not code, so an
 * explanatory comment that names `publishStep(` in prose cannot trip this. */
function withoutComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => ' '.repeat(m.length))
    .replace(/\/\/[^\n]*/g, (m) => ' '.repeat(m.length));
}
const RUN_CODE = withoutComments(RUN_SRC);

test('recordOutcome() runs before the loop calls publishStep() — the ledger line predates the only fetch', () => {
  const recordCall = RUN_CODE.indexOf('recordOutcome();');
  const publishCall = RUN_CODE.indexOf('publishStep(');
  assert.ok(recordCall !== -1, 'recordOutcome() must be called explicitly somewhere in run.mjs');
  assert.ok(publishCall !== -1, 'publishStep( must be called somewhere in run.mjs (loop/lib/publish.mjs)');
  assert.ok(
    recordCall < publishCall,
    'the ledger append must happen before the only call reachable to fetch() — moving it later would ' +
      'reopen the addictedtoai-z7a crash-window analysis recorded in loop/lib/budget.mjs',
  );
});

test('publishStep is called exactly once in run.mjs, so there is exactly one ordering to protect', () => {
  const matches = RUN_CODE.match(/publishStep\(/g) ?? [];
  assert.equal(matches.length, 1, 'a second call site would need its own ordering check');
});
