/**
 * ledger-order.test.mjs — the queue must never be rederived from a ledger that
 * is missing the job that just finished.
 *
 * ## The defect, measured 2026-08-30
 *
 * `loop/run.mjs` called `rederiveStep` after a merge and appended the job's
 * ledger line at the very end of the run. Part of the derived queue is a
 * function of the ledger — `pulse/lib/queue.mjs` decides whether to offer the
 * daily scout by asking `scoutRanToday`, which reads `data/ledger.jsonl` — so
 * the recomputation ran against a record of the world that did not yet contain
 * the scout that had just run. The queue came back still advertising
 * `scout-due`, and the very next Desk run selected the scout AGAIN: 20.7
 * model-minutes on a duplicate daily sweep, and specs/pulse's "Once per day,
 * the Pulse queues the scout" violated by the mechanism that implements it.
 *
 * ## How this measures it, rather than asserting the fix's intent
 *
 * `loop/lib/rederive.mjs` finds the derivation by looking for
 * `pulse/lib/rederive.mjs` **inside the repository it is run against** and
 * importing it dynamically. That discovery seam is a real production mechanism
 * (it is what makes the two halves swappable) and it is also the only place a
 * test can stand INSIDE the moment the queue is recomputed. So the fixture
 * carries a `pulse/lib/rederive.mjs` that does one thing: at the instant it is
 * called, it asks the REAL `pulse/lib/queue.mjs` — the shipped `scoutItems`,
 * imported by absolute path so its own dependencies resolve normally — whether
 * a scout item is due, and writes the answer down.
 *
 * The witness therefore records what production would have computed, at the
 * moment production computes it. Nothing here reimplements the decision.
 *
 * Against the old ordering the witness reads `scoutItems: 1` and
 * `ledgerLines: 0`; against the fix it reads `0` and `1`. The positive control
 * is a job that is NOT a scout, whose witness must still read `scoutItems: 1` —
 * because a mechanism that suppressed the scout unconditionally would pass the
 * first test and would silently retire the daily sweep forever.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { runLoop } from '../run.mjs';
import { DEFAULT_REPO_ROOT } from '../lib/paths.mjs';
import { makeRepo, writeQueue, runnersYaml, mockCommand } from './helpers.mjs';

const REAL_QUEUE = pathToFileURL(join(DEFAULT_REPO_ROOT, 'pulse', 'lib', 'queue.mjs')).href;

/**
 * The fixture's shared derive step: the real decision, recorded at the moment
 * the loop makes it.
 *
 * `readFileSync` on the ledger rather than a helper, because the point of the
 * witness is what is on DISK when the derivation runs.
 */
const WITNESS_DERIVE = `
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { scoutItems } from ${JSON.stringify(REAL_QUEUE)};

export const DERIVED_PATHS = Object.freeze(['data/derived']);

export async function rederive(root) {
  const ledgerPath = join(root, 'data', 'ledger.jsonl');
  const raw = existsSync(ledgerPath) ? readFileSync(ledgerPath, 'utf8') : '';
  const lines = raw.split('\\n').filter((l) => l.trim() !== '');
  const items = scoutItems(root, { changesFile: join(root, 'data', 'changes.jsonl') });
  mkdirSync(join(root, 'data', 'derived'), { recursive: true });
  writeFileSync(
    join(root, 'data', 'derived', 'rederive-witness.json'),
    JSON.stringify({ ledgerLines: lines.length, ledger: lines.map((l) => JSON.parse(l)), scoutItems: items.length }, null, 2) + '\\n',
    'utf8',
  );
  return { queue: { count: items.length } };
}
`;

const STUB_REGISTRY = 'export const loadRegistry = () => ({ version: 1, sources: [] });\n';
const STUB_CORPUS = 'export const readCorpus = () => ({ entries: [], unreadable: [] });\n';

function repoWithWitness(type) {
  const ctx = makeRepo({
    runners: runnersYaml({
      command: mockCommand('done-edit'),
      reviewerCommand: mockCommand('review-approve'),
    }),
    files: {
      'pulse/lib/rederive.mjs': WITNESS_DERIVE,
      'pulse/lib/registry.mjs': STUB_REGISTRY,
      'pulse/lib/corpus.mjs': STUB_CORPUS,
    },
  });
  writeQueue(ctx, [{ type, title: `a ${type} job, so the run reaches a merge` }]);
  return ctx;
}

const go = (ctx) => runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', noGates: true });

function witness(ctx) {
  const p = join(ctx.repoRoot, 'data', 'derived', 'rederive-witness.json');
  assert.ok(existsSync(p), `the rederive never ran, so nothing was measured:\n${ctx.output()}`);
  return JSON.parse(readFileSync(p, 'utf8'));
}

test('the ledger line exists before the queue is recomputed from it', async (t) => {
  const ctx = repoWithWitness('scout');
  t.after(() => ctx.cleanup());

  const res = await go(ctx);
  assert.equal(res.outcome, 'done', ctx.output());

  const w = witness(ctx);
  assert.equal(
    w.scoutItems,
    0,
    'the queue recomputed after a scout merged still advertised scout-due — the next run would select it again',
  );
  assert.equal(
    w.ledgerLines,
    1,
    'the derivation ran against a ledger with no record of the job that had just finished',
  );
  assert.equal(w.ledger[0].id, res.jobId);
  assert.equal(w.ledger[0].type, 'scout');
  assert.equal(w.ledger[0].outcome, 'done', 'the recorded line is the real outcome, not a placeholder');
});

test('POSITIVE CONTROL — a non-scout job leaves the daily scout due', async (t) => {
  // A rederive that returned no scout item whatever had happened would pass the
  // test above and would retire the daily sweep permanently. The only thing
  // different here is the job's type.
  const ctx = repoWithWitness('repair');
  t.after(() => ctx.cleanup());

  const res = await go(ctx);
  assert.equal(res.outcome, 'done', ctx.output());

  const w = witness(ctx);
  assert.equal(w.ledgerLines, 1, 'the ordering holds for every job type, not only the scout');
  assert.equal(w.ledger[0].type, 'repair');
  assert.equal(w.scoutItems, 1, 'no scout has run today, so one is still due');
});

test('the ledger line is appended exactly once, not once per call site', async (t) => {
  // `recordOutcome` is idempotent and is called from two places. A second
  // append would double-count every merged job in the budget, which reads the
  // ledger by summing `mm`.
  const ctx = repoWithWitness('repair');
  t.after(() => ctx.cleanup());

  const res = await go(ctx);
  const lines = readFileSync(ctx.ledgerPath, 'utf8').split('\n').filter((l) => l.trim() !== '');
  assert.equal(lines.length, 1, lines.join('\n'));
  assert.equal(JSON.parse(lines[0]).id, res.jobId);
});
