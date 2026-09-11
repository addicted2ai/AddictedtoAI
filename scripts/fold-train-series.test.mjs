// scripts/fold-train-series.test.mjs — task 52 folding-script proof.
//
// Hermetic: the ledger under test is a string, never the live file.
// Arms: empty ledger folds to n=0 (the production state today —
// emptiness is data, not an error); a two-train ledger in REAL producer
// shapes (originating line with `wrongly: null` + a separate replay line
// carrying `train.replay_of`, per `recordReplayVerdict`) folds exact
// series with the replay JOINED (one train, one eviction, verdict
// attributed — never counted as a second train); malformed JSON throws
// rather than folding silently; a copy-based unjoined-counting mutant
// folds the same single evicted-and-replayed train 2-for-1 (red proof).

import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { foldTrainSeries } from './fold-train-series.mjs';

const DAY = '2026-09-11';
const HERE = dirname(fileURLToPath(import.meta.url));
const TRACKED = join(HERE, 'fold-train-series.mjs');

// Real producer shapes (loop/lib/train.mjs): the originating train line
// keeps `wrongly: null` (ledger is append-only); the replay verdict rides
// a SEPARATE `type: 'train'` line with `train.replay_of` naming the
// originating train and re-carrying the same eviction with its verdict.
function originTrainLine() {
  return {
    id: 't-1', type: 'train', outcome: 'done', mm: 2.5,
    train: {
      id: 't-1', merges: ['a'], gate_seconds: { test: 600, build: 40 },
      evictions: [{ merge: 'b', reason: 'evicted-at-train: removing b cleared build', wrongly: null }],
      pre_existing_hold: false, findings_not_in_any_record: 0, review_rounds: 2,
    },
  };
}

function replayLine() {
  return {
    id: 't-1-replay-b', type: 'train', outcome: 'done', mm: 0,
    train: {
      id: 't-1-replay-b', replay_of: 't-1', merges: ['b'], gate_seconds: { replay_gate: 45 },
      evictions: [{ merge: 'b', reason: 'evicted-at-train: removing b cleared build', wrongly: true }],
      pre_existing_hold: false, findings_not_in_any_record: 0, review_rounds: 0,
    },
    note: 'replay: b alone passes build — the eviction was made wrongly',
  };
}

function blockedTrainLine() {
  return {
    id: 't-2', type: 'train', outcome: 'blocked', mm: 0.5,
    train: {
      id: 't-2', merges: [], gate_seconds: {},
      evictions: [], pre_existing_hold: true,
      findings_not_in_any_record: 0, review_rounds: 0,
    },
  };
}

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

test('two-train ledger in real producer shapes folds with the replay joined', () => {
  const ledger = [originTrainLine(), replayLine(), blockedTrainLine()]
    .map((l) => JSON.stringify(l))
    .join('\n');
  const out = foldTrainSeries(ledger, DAY);
  // The replay line is not a train: two originating trains, not three lines.
  assert.equal(out.trains, 2);
  assert.equal(out.per_train.length, 2);
  assert.deepEqual(out.per_train.map((t) => t.id), ['t-1', 't-2']);
  assert.equal(out.per_train[0].gate_seconds_total, 640);
  // The verdict is attributed through the join despite the originating
  // entry keeping `wrongly: null`.
  assert.equal(out.per_train[0].evictions, 1);
  assert.equal(out.per_train[0].wrongly, 1);
  assert.equal(out.per_train[0].review_mm, 2.5);
  assert.equal(out.per_train[0].review_rounds, 2);
  assert.equal(out.per_train[1].pre_existing_hold, true);
  // Totals are re-cut off the joined shape: the replay's own gate seconds
  // (45) and its eviction re-carry contribute nothing on their own.
  assert.deepEqual(out.totals, {
    gate_seconds: 640,
    evictions: 1,
    wrongly: 1,
    pre_existing_holds: 1,
    review_mm: 3,
  });
  assert.equal(out.gate_inputs.wrongly_in_last_20, 1);
  assert.equal(out.gate_inputs.trains_observed, 2);
});

test('one evicted-and-replayed train folds as one train with its verdict attributed', () => {
  const ledger = [originTrainLine(), replayLine()]
    .map((l) => JSON.stringify(l))
    .join('\n');
  const out = foldTrainSeries(ledger, DAY);
  assert.equal(out.trains, 1);
  assert.equal(out.per_train.length, 1);
  assert.equal(out.per_train[0].evictions, 1);
  assert.equal(out.per_train[0].wrongly, 1);
  assert.deepEqual(out.totals.evictions, 1);
  assert.deepEqual(out.totals.wrongly, 1);
});

test('malformed ledger line throws rather than folding silently', () => {
  assert.throws(() => foldTrainSeries('{"type":"train",\n', DAY), SyntaxError);
});

// Copy-based mutation (S1-polish F1 red proof): the tracked file is NEVER
// written. The mutant is a same-directory `*.mut-*.mjs` copy carrying the
// old unjoined counting (every `type: 'train'` line is a train, `wrongly`
// read straight off each line), imported fresh, then removed with absence
// asserted and the tracked file hash-verified identical.
let mutSeq = 0;
async function withUnjoinedMutant(fn) {
  const before = readFileSync(TRACKED, 'utf8');
  const filterSearch = 'const originLines = lines.filter((l) => l && l.type === \'train\' && !isReplayLine(l));';
  assert.ok(before.includes(filterSearch), 'mutant anchor (replay exclusion) present in the shipped file');
  const wronglySearch = 'if (replayVerdicts.has(key)) return replayVerdicts.get(key) === true;';
  assert.ok(before.includes(wronglySearch), 'mutant anchor (joined wrongly) present in the shipped file');
  let mutant = before.replace(
    filterSearch,
    'const originLines = lines.filter((l) => l && l.type === \'train\');',
  );
  mutant = mutant.replace(
    '      if (replayVerdicts.has(key)) return replayVerdicts.get(key) === true;\n      return e.wrongly === true;',
    '      return e.wrongly === true;',
  );
  assert.notEqual(mutant, before, 'the mutant must differ from the shipped file');
  const sha = createHash('sha256').update(before, 'utf8').digest('hex');
  mutSeq += 1;
  const copyPath = join(HERE, `fold-train-series.mut-${process.pid}-${mutSeq}.mjs`);
  writeFileSync(copyPath, mutant, 'utf8');
  try {
    await fn(await import(`./fold-train-series.mut-${process.pid}-${mutSeq}.mjs`));
    assert.equal(
      createHash('sha256').update(readFileSync(TRACKED, 'utf8'), 'utf8').digest('hex'),
      sha,
      'tracked fold-train-series.mjs hash-identical after the mutant run',
    );
    assert.equal(readFileSync(TRACKED, 'utf8'), before, 'tracked fold-train-series.mjs byte-identical after the mutant run');
  } finally {
    rmSync(copyPath, { force: true });
  }
  assert.equal(existsSync(copyPath), false, 'the mutant copy is gone');
}

test('MUTATION unjoined counting: the mutant folds one replayed train 2-for-1', async () => {
  await withUnjoinedMutant(async (mutant) => {
    const ledger = [originTrainLine(), replayLine()]
      .map((l) => JSON.stringify(l))
      .join('\n');
    const out = mutant.foldTrainSeries(ledger, DAY);
    assert.equal(out.trains, 2, 'the mutant counts the replay line as a second train (the arm fails on the mutant)');
    assert.equal(out.totals.evictions, 2, 'the mutant double-counts the re-carried eviction');
  });
});

test('no mutant-copy residue: scripts/ carries no *.mut-*.mjs copies', () => {
  const leftovers = readdirSync(HERE).filter((n) => n.includes('.mut-'));
  assert.deepEqual(leftovers, [], `delete these inert copies, then re-run: ${leftovers.join(', ')}`);
});
