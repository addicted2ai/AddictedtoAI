/**
 * change-kinds.test.mjs — the closed kind list has one home, and the decoy is
 * gone (`separate-a-claim-from-a-fact` tasks 17, 18, 20).
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { CHANGE_KINDS, KIND, isChangeKind, unrecognisedKinds } from './change-kinds.mjs';
import * as changes from './changes.mjs';

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
