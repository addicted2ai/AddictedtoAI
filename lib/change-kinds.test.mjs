/**
 * change-kinds.test.mjs — the closed kind list has one home, and the decoy is
 * gone (`separate-a-claim-from-a-fact` tasks 17, 18, 20).
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CHANGE_KINDS, KIND, isChangeKind, unrecognisedKinds } from './change-kinds.mjs';
import * as changes from './changes.mjs';

/** A throwaway changes.jsonl under the OS temp dir; never this repository's. */
function fixtureChanges(t, lines) {
  const dir = mkdtempSync(join(tmpdir(), 'change-kinds-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const file = join(dir, 'changes.jsonl');
  writeFileSync(file, lines.map((l) => JSON.stringify(l)).join('\n') + (lines.length ? '\n' : ''), 'utf8');
  return file;
}

test('the closed list is exactly the six kinds, lead-change among them', () => {
  assert.deepEqual(
    [...CHANGE_KINDS].sort(),
    ['annotation', 'arrival', 'field_change', 'lead-change', 'release', 'retirement'],
    'the kinds a changes.jsonl line may carry are declared in exactly one place; adding a member ' +
      'is an edit here and nowhere else',
  );
  assert.ok(CHANGE_KINDS.includes('lead-change'), 'lead-change is a member of the list, not a string in a renderer');
  assert.equal(Object.isFrozen(CHANGE_KINDS), true, 'a consumer cannot widen the closed list by pushing to it');
});

test('KIND names every member and nothing else', () => {
  assert.deepEqual(Object.values(KIND).sort(), [...CHANGE_KINDS].sort());
  for (const kind of CHANGE_KINDS) assert.equal(isChangeKind(kind), true, kind);
  for (const notAKind of ['annotations', 'lead_change', 'leadchange', 'price', 'context', 'status', '', null, undefined]) {
    assert.equal(isChangeKind(notAKind), false, `${JSON.stringify(notAKind)} is not a declared kind`);
  }
});

test('MATERIAL_KINDS is gone and stays gone', () => {
  // It was exported from lib/changes.mjs, commented "Material change kinds, in
  // the order specs/pulse names them", imported NOWHERE, and wrong: `price`,
  // `context` and `status` are material FIELD names carried on a line's
  // `field`, and appear as a `kind` on zero of the 182 committed lines. The
  // obvious way to add a new kind was to add it there, which would have changed
  // nothing anywhere — so it was deleted rather than updated
  // (`separate-a-claim-from-a-fact` task 18; the same grep is recorded
  // independently in data/carried/j-20260905-04-carry-1.md).
  assert.equal(
    changes.MATERIAL_KINDS,
    undefined,
    'lib/changes.mjs must not re-declare a second, unread kind list beside lib/change-kinds.mjs',
  );
});

test('unrecognised kinds are counted, including a line with no kind at all', () => {
  const counts = unrecognisedKinds([
    { kind: 'arrival' },
    { kind: 'lead-change' },
    { kind: 'leadchange' },
    { kind: 'leadchange' },
    { kind: 'annotaton' },
    { key: 'k' },
    null,
    'not an object',
  ]);
  assert.deepEqual([...counts.entries()].sort(), [
    ['(missing)', 1],
    ['annotaton', 1],
    ['leadchange', 2],
  ]);
});

test('the build REPORTS an unrecognised committed kind and does not fail on one', async (t) => {
  // specs/pulse: "The build SHALL report the number of lines on disk carrying an
  // unrecognised kind, in its summary, and SHALL NOT fail on one ... A build
  // that failed here would let one bad historical line take the whole site
  // down." The "SHALL NOT fail" half is the one with no control until this test:
  // the real corpus carries zero unrecognised kinds, so a `throw` inserted into
  // the step fires on no line the build ever sees. It is measured here over a
  // fixture that DOES carry one, which is the only place the branch is live.
  const file = fixtureChanges(t, [
    { key: 'a', kind: KIND.ARRIVAL },
    { key: 'b', kind: 'leadchange' }, // the near miss the whole change exists for
    { key: 'c' }, // and a line nobody wrote a kind on at all
  ]);
  const said = [];
  await changes.changeKindsReportStep(file, (s) => said.push(s)); // resolves: the step never throws
  const out = said.join('');
  assert.match(out, /2 of 3 committed line\(s\) carry an unrecognised kind/);
  assert.match(out, /leadchange 1/);
  assert.match(out, /\(missing\) 1/, 'a line with no kind is named as its own case, not folded into the total');
  assert.match(out, /reported, not fatal/, 'the asymmetry with the write-side refusal is stated in the output');
});

test('the build states the clean measurement out loud, rather than staying silent', async (t) => {
  // The control. Without it the assertion above would pass on a step that
  // printed the unrecognised-kind sentence unconditionally.
  const file = fixtureChanges(t, [{ key: 'a', kind: KIND.ARRIVAL }, { key: 'b', kind: KIND.LEAD_CHANGE }]);
  const said = [];
  await changes.changeKindsReportStep(file, (s) => said.push(s));
  assert.equal(said.join(''), 'prebuild: change-kinds — 2 committed line(s), every kind declared\n');
});

test('the prebuild registers the report as a step, which is what makes the SHALL about the BUILD true', () => {
  /*
   * THE SHALL IS ABOUT THE BUILD, NOT ABOUT A FUNCTION: "The build SHALL report
   * the number of lines on disk carrying an unrecognised kind, in its summary."
   * The two tests above measure `changeKindsReportStep` in isolation, which is
   * the right half and not the whole: with the STEPS entry deleted the step is
   * never invoked, the requirement is unmet, and every one of the 1296 tests in
   * this repository still passes — measured, by deleting it.
   *
   * The registration is asserted as ONE fact rather than two, because the import
   * line names the function too and a name-only match would survive the deletion
   * of the entry that actually runs it. The precedent is
   * `scripts/check-post-voice.test.mjs`, "the prebuild registers it as a step".
   */
  const prebuild = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'scripts', 'prebuild.mjs'), 'utf8');
  assert.match(
    prebuild,
    /name:\s*'change-kinds',\s*run:\s*changeKindsReportStep/,
    "the STEPS entry binds the name 'change-kinds' to changeKindsReportStep — a report nothing invokes is not a report",
  );
});

test('describeChange states a lead change without a value, a rank or an adjective', () => {
  // K24 gates an index VALUE on cleared republication rights, and the same rule
  // `flag-what-moved-the-frontier` states for an F2 post's copy — "the
  // publisher's act, never the publisher's numbers" — is what this sentence
  // obeys for a history line. It also carries no adjective: a leader can lose
  // the lead without anything shipping, so "improved" would be false about an
  // event that did not happen.
  const line = {
    kind: 'lead-change',
    metric: 'aa-intelligence',
    metric_label: 'Intelligence Index',
    publisher: 'Artificial Analysis',
    leader_value: '58.1',
    previous_leader_value: '53.4',
  };
  const detail = changes.describeChange(line);
  assert.equal(detail, 'lead changed on Intelligence Index');
  assert.equal(/\d/.test(detail), false, 'no value, ratio, rank, median or per-model score reaches the sentence');
  for (const adjective of ['best', 'strongest', 'improved', 'better', 'ahead', 'now leads']) {
    assert.equal(detail.includes(adjective), false, `"${adjective}" is a judgment this line does not make`);
  }
  assert.equal(changes.describeChange({ kind: 'lead-change' }), 'lead changed', 'the bare event when nothing names the metric');
});
