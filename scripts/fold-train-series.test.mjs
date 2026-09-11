// scripts/fold-train-series.test.mjs — task 52 folding-script proof.
//
// Hermetic: the ledger under test is a string, never the live file.
// Three arms: empty ledger folds to n=0 (the production state today —
// emptiness is data, not an error); a two-train ledger folds exact
// series incl. wrongly/pre-existing/review-mm; malformed JSON throws
// rather than folding silently.

import test from 'node:test';
import assert from 'node:assert/strict';
import { foldTrainSeries } from './fold-train-series.mjs';

const DAY = '2026-09-11';

test('empty ledger folds to n=0 with zeroed totals', () => {
  const out = foldTrainSeries('', DAY);
  assert.equal(out.measured_on, DAY);
  assert.equal(out.trains, 0);
  assert.deepEqual(out.per_train, []);
  assert.deepEqual(out.totals, {
    gate_seconds: 0,
    evictions: 0,
    wrongly: 0,
    pre_existing_holds: 0,
    review_mm: 0,
  });
  assert.equal(out.gate_inputs.wrongly_in_last_20, 0);
  assert.equal(out.gate_inputs.trains_observed, 0);
});

test('two-train ledger folds exact series', () => {
  const ledger = [
    {
      id: 't-1', type: 'train', outcome: 'done', mm: 2.5,
      train: {
        id: 't-1', merges: ['a'], gate_seconds: { test: 600, build: 40 },
        evictions: [{ merge: 'b', reason: 'x', wrongly: true }],
        pre_existing_hold: false, findings_not_in_any_record: 0, review_rounds: 2,
      },
    },
    {
      id: 't-2', type: 'train', outcome: 'blocked', mm: 0.5,
      train: {
        id: 't-2', merges: [], gate_seconds: {},
        evictions: [], pre_existing_hold: true,
        findings_not_in_any_record: 0, review_rounds: 0,
      },
    },
  ]
    .map((l) => JSON.stringify(l))
    .join('\n');
  const out = foldTrainSeries(ledger, DAY);
  assert.equal(out.trains, 2);
  assert.equal(out.per_train[0].gate_seconds_total, 640);
  assert.equal(out.per_train[0].wrongly, 1);
  assert.equal(out.per_train[0].review_mm, 2.5);
  assert.equal(out.per_train[0].review_rounds, 2);
  assert.equal(out.per_train[1].pre_existing_hold, true);
  assert.deepEqual(out.totals, {
    gate_seconds: 640,
    evictions: 1,
    wrongly: 1,
    pre_existing_holds: 1,
    review_mm: 3,
  });
  assert.equal(out.gate_inputs.wrongly_in_last_20, 1);
});

test('malformed ledger line throws rather than folding silently', () => {
  assert.throws(() => foldTrainSeries('{"type":"train",\n', DAY), SyntaxError);
});
