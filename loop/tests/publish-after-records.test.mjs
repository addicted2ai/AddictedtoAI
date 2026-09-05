/**
 * publish-after-records.test.mjs — a job's records exist BEFORE that job's work
 * reaches the remote, and the publish declares what it wrote.
 *
 * ## THE DEFECT, measured (beads addictedtoai-tqpq)
 *
 * `loop/run.mjs` called `publishStep` at the merge — before the directive
 * completion marker, before the reviewer's noted proposal, before the carried
 * findings, and before `commitJobRecords`. So a run pushed content to the live
 * site BEFORE the records describing that work existed, and those records then
 * rode out on some later run's push, or on none.
 *
 * It was not merely untidy. The publish step was also the *undeclared* caller
 * (`loop/lib/publish.mjs` passed no `owned`), so it staged `data/`, `content/`
 * and `public/` wholesale. Running first, it committed a consumed proposal's
 * move before `run.mjs` staged that same source path deliberately; `git add`
 * then answered "did not match any files" and exited 128, and ONE unmatched
 * pathspec is fatal for the WHOLE invocation. On 2026-09-03 that discarded
 * three jobs' records in one afternoon — j-20260903-02, -05 and -06, each of
 * which still reported `done`.
 *
 * ## WHY THIS IS STRUCTURAL AND NOT BEHAVIOURAL
 *
 * The obvious test — run a real merge under `publish: true` and watch what the
 * push carried — has an unacceptable failure mode: a red test that deploys the
 * live site. `addictedtoai-r8k` is the incident that set this precedent and
 * `loop/tests/ledger-before-publish.test.mjs` and `loop/tests/exit-code.test.mjs`
 * both follow it. So the ORDER is asserted against `loop/run.mjs`'s own source,
 * and the *staging* half — which can be measured without any risk, against a
 * bare remote under the OS temp directory — is asserted behaviourally in
 * `loop/tests/publish.test.mjs`.
 *
 * The two halves are checked separately on purpose. Each one alone leaves the
 * other's failure intact, so each one needs a test that goes red on its own.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const LOOP = dirname(dirname(fileURLToPath(import.meta.url)));

/** Blank comments rather than delete them, so an explanation cannot move an index. */
const RUN_CODE = readFileSync(join(LOOP, 'run.mjs'), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, (m) => ' '.repeat(m.length))
  .replace(/\/\/[^\n]*/g, (m) => ' '.repeat(m.length));

/**
 * Every step that writes or commits a record describing the job, named by its
 * CALL rather than by a line number. `commitJobRecords` is defined lower in the
 * same file than it is called, so `indexOf` finds the call; the others are
 * imported by bare name, which the trailing `(` excludes.
 */
const RECORD_STEPS = [
  ['markDirectiveDone(', 'the directive completion marker in DIRECTIVES.md'],
  ['transcribeNotedProposal(', "the reviewer's noted proposal"],
  ['transcribeCarriedFindings(', 'the findings the reviewer carried'],
  ['commitJobRecords(', "the commit of the job's own records"],
];

test('every record a job writes is written before the loop publishes', () => {
  const publishAt = RUN_CODE.indexOf('publishStep(ctx');
  assert.ok(publishAt !== -1, 'run.mjs must call publishStep(ctx, …) somewhere');
  for (const [call, what] of RECORD_STEPS) {
    const at = RUN_CODE.indexOf(call);
    assert.ok(at !== -1, `run.mjs no longer calls ${call} — this check has gone blind, update it`);
    assert.ok(
      at < publishAt,
      `${what} (${call}) is written AFTER the publish. A run must not push a job's work to the ` +
        'live site before the records describing that work exist — they then ride out on some ' +
        "later run's push, or on none (addictedtoai-tqpq).",
    );
  }
});

test('the loop publishes exactly once, so there is exactly one ordering to protect', () => {
  const matches = RUN_CODE.match(/publishStep\(/g) ?? [];
  assert.equal(matches.length, 1, 'a second call site would need its own ordering check');
});

test('the loop declares its own paths to the publish step rather than publishing undeclared', () => {
  // The other half, and it is checked here because it lives at THIS call site:
  // `loop/tests/publish.test.mjs` proves the shared step honours `owned`, but
  // it calls the adapter directly and so cannot see whether `run.mjs` passes
  // one. Without a declaration the shared step takes its `declared === null`
  // branch and stages `data/`, `content/` and `public/` wholesale.
  const call = RUN_CODE.slice(RUN_CODE.indexOf('publishStep(ctx'));
  const args = call.slice(0, call.indexOf(')') + 1);
  assert.match(
    args,
    /owned:/,
    'the publish call must declare the paths this run wrote; without `owned` the shared step ' +
      'stages data/, content/ and public/ wholesale (addictedtoai-ps3)',
  );
});
