/**
 * vanished-queue.test.mjs — beads addictedtoai-u0n5.
 *
 * THE DEFECT UNDER TEST, stated as the property that was missing: a
 * `vanished-feed-row` finding must be able to RETIRE. It used to be computed
 * from `freshness.vanished_feed_rows`, and a withdrawn row is absent from the
 * latest snapshot forever, so the item regenerated on every run at rank 85 —
 * the top of the queue — re-dispatching work that had already been done and
 * starving every finding beneath it, including the daily `scout`.
 *
 * Measured before the fix, on 2026-09-02: three Anthropic "(Fast)" rows were
 * withdrawn, job j-20260902-01 repaired all three pages and was approved, and
 * the next `loop/run.mjs --dry-run` selected the same item again.
 *
 * These call `computeQueue`, `vanishedRowItems` and `recordVanishedRows`
 * directly rather than spawning `pulse/run.mjs`, for the same reason
 * `carry-queue.test.mjs` does: they are plain synchronous functions, and the
 * CLI's publish step must never be reachable from a test.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { computeQueue, RANKS, vanishedRowItems } from '../lib/queue.mjs';
import {
  answerVanishedRecord,
  listAnsweredRecords,
  listVanishedRecords,
  recordVanishedRows,
  vanishedFileName,
} from '../lib/vanished.mjs';
import { makeRoot, cleanup } from './helpers.mjs';

const AT = new Date('2026-09-02T12:00:00.000Z');
const TODAY = '2026-09-02';

const VANISHED = [
  {
    source: 'openrouter-models',
    row_id: 'anthropic/claude-opus-5-fast',
    entry_id: 'model/anthropic-claude-opus-5-fast',
    path: 'content/wiki/model/anthropic-claude-opus-5-fast.md',
    last_seen_date: '2026-09-01',
    has_last_known: true,
  },
];

const FEED_ROWS = {
  'openrouter-models': {
    'anthropic/claude-opus-5-fast': {
      id: 'anthropic/claude-opus-5-fast',
      name: 'Claude Opus 5 (Fast)',
      context_length: 1000000,
      'pricing.prompt': '0.00001',
      $status: 'active',
      $as_of: '2026-09-01',
      $vanished: true,
    },
  },
};

function emptyQueue(root, over = {}) {
  return computeQueue(root, {
    freshness: {},
    changesFile: join(root, 'data', 'changes.jsonl'),
    wants: [],
    corroborations: [],
    registry: null,
    at: AT,
    ...over,
  });
}

/* ── the regression itself ─────────────────────────────────────────────── */

test('u0n5 REGRESSION: a vanished row in freshness alone no longer produces an item', () => {
  const root = makeRoot();
  try {
    // This is precisely the input that used to produce a permanent rank-85
    // item. With no record file on disk, it must now produce nothing: the
    // level signal is reporting, not work.
    const q = emptyQueue(root, { freshness: { vanished_feed_rows: VANISHED } });
    assert.equal(q.items.filter((i) => i.reason === 'vanished-feed-row').length, 0);
  } finally {
    cleanup(root);
  }
});

test('a recorded vanished row produces exactly one item, at its documented rank', () => {
  const root = makeRoot();
  try {
    recordVanishedRows(root, VANISHED, FEED_ROWS, TODAY);
    const q = emptyQueue(root);
    const items = q.items.filter((i) => i.reason === 'vanished-feed-row');
    assert.equal(items.length, 1);
    assert.equal(items[0].type, 'repair');
    assert.equal(items[0].rank, RANKS['vanished-feed-row']);
    assert.equal(items[0].subject, 'openrouter-models:anthropic/claude-opus-5-fast');
    assert.equal(items[0].target, 'content/wiki/model/anthropic-claude-opus-5-fast.md');
    assert.match(items[0].title, /vanished/i);
  } finally {
    cleanup(root);
  }
});

/* ── the property the whole change exists for ──────────────────────────── */

// NOTE the narrow claim in this test's name. Removing the file removes the
// item from the READ side, which is all this proves. It is NOT retirement:
// the recorder writes it straight back, as the two tests below establish.
test('the queue reads the directory, so a removed record produces no item on that read', () => {
  const root = makeRoot();
  try {
    recordVanishedRows(root, VANISHED, FEED_ROWS, TODAY);
    assert.equal(emptyQueue(root).items.filter((i) => i.reason === 'vanished-feed-row').length, 1);

    // What a fixing job's diff does, and the ONLY thing that retires this.
    const name = vanishedFileName('openrouter-models', 'anthropic/claude-opus-5-fast');
    rmSync(join(root, 'data', 'vanished', name));

    // The row is still vanished as far as the world is concerned — pass the
    // same freshness input — and the item is nevertheless gone.
    const after = emptyQueue(root, { freshness: { vanished_feed_rows: VANISHED } });
    assert.equal(after.items.filter((i) => i.reason === 'vanished-feed-row').length, 0);
  } finally {
    cleanup(root);
  }
});

test('recomputing without fixing anything keeps the item, and does not duplicate it', () => {
  const root = makeRoot();
  try {
    recordVanishedRows(root, VANISHED, FEED_ROWS, TODAY);
    for (let i = 0; i < 3; i++) {
      const items = emptyQueue(root).items.filter((x) => x.reason === 'vanished-feed-row');
      assert.equal(items.length, 1, `run ${i + 1} should hold exactly one`);
    }
  } finally {
    cleanup(root);
  }
});

/* ── the writer ────────────────────────────────────────────────────────── */

test('recording is idempotent: a second run over an existing record writes nothing', () => {
  const root = makeRoot();
  try {
    const first = recordVanishedRows(root, VANISHED, FEED_ROWS, TODAY);
    assert.equal(first.written.length, 1);
    assert.equal(first.existing.length, 0);

    const second = recordVanishedRows(root, VANISHED, FEED_ROWS, TODAY);
    assert.equal(second.written.length, 0, 'must not rewrite an existing record');
    assert.equal(second.existing.length, 1);
    assert.equal(listVanishedRecords(root).length, 1);

  } finally {
    cleanup(root);
  }
});

/* ── the correction: deletion is NOT retirement ────────────────────────── */

test('DELETING a record does NOT retire it — the next run writes it again', () => {
  // This is the defect the first version of this module shipped, and it is
  // pinned here so it cannot come back. A carried finding can be retired by
  // deletion because its source is a one-time verdict record. A vanished row's
  // source is the permanent absence of a row, so a deleted record is simply
  // re-derived: the finding would be immortal and the original bug would be
  // reimplemented with extra steps. Measured on the real Pulse, which logged
  // "3 newly recorded" on the run after the records were deleted by hand.
  const root = makeRoot();
  try {
    recordVanishedRows(root, VANISHED, FEED_ROWS, TODAY);
    rmSync(join(root, 'data', 'vanished', listVanishedRecords(root)[0]));

    const again = recordVanishedRows(root, VANISHED, FEED_ROWS, TODAY);
    assert.equal(again.written.length, 1, 'deletion alone must not retire the finding');
    assert.equal(emptyQueue(root).items.filter((i) => i.reason === 'vanished-feed-row').length, 1);
  } finally {
    cleanup(root);
  }
});

test('THE POINT, corrected: ANSWERING a record retires it, permanently', () => {
  const root = makeRoot();
  try {
    recordVanishedRows(root, VANISHED, FEED_ROWS, TODAY);
    const name = listVanishedRecords(root)[0];

    assert.equal(answerVanishedRecord(root, name), true);
    assert.deepEqual(listVanishedRecords(root), []);
    assert.deepEqual(listAnsweredRecords(root), [name]);

    // Gone from the queue...
    assert.equal(emptyQueue(root).items.filter((i) => i.reason === 'vanished-feed-row').length, 0);

    // ...and STAYS gone, though the row is still absent from the feed forever.
    for (let i = 0; i < 3; i++) {
      const r = recordVanishedRows(root, VANISHED, FEED_ROWS, TODAY);
      assert.equal(r.written.length, 0, `run ${i + 1} must not re-record an answered row`);
      assert.equal(r.answered.length, 1);
      assert.equal(emptyQueue(root).items.filter((x) => x.reason === 'vanished-feed-row').length, 0);
    }
  } finally {
    cleanup(root);
  }
});

test('the answered/ subdirectory is not itself read as a finding', () => {
  const root = makeRoot();
  try {
    recordVanishedRows(root, VANISHED, FEED_ROWS, TODAY);
    answerVanishedRecord(root, listVanishedRecords(root)[0]);
    assert.equal(vanishedRowItems(root).length, 0);
  } finally {
    cleanup(root);
  }
});

test('answering twice is harmless, and answering nothing reports false', () => {
  const root = makeRoot();
  try {
    recordVanishedRows(root, VANISHED, FEED_ROWS, TODAY);
    const name = listVanishedRecords(root)[0];
    assert.equal(answerVanishedRecord(root, name), true);
    assert.equal(answerVanishedRecord(root, name), false);
    assert.equal(answerVanishedRecord(root, 'never-existed.md'), false);
  } finally {
    cleanup(root);
  }
});

test('the record pins the last-known values, so snapshot rotation cannot take the evidence', () => {
  const root = makeRoot();
  try {
    recordVanishedRows(root, VANISHED, FEED_ROWS, TODAY);
    const name = listVanishedRecords(root)[0];
    const text = readFileSync(join(root, 'data', 'vanished', name), 'utf8');

    // The values themselves, not merely a note that there were some.
    assert.match(text, /pricing\.prompt/);
    assert.match(text, /0\.00001/);
    assert.match(text, /1000000/);
    // Derived `$`-prefixed keys are internal and are not presented as feed fields.
    assert.ok(!/\$vanished/.test(text), 'internal $ keys must not be rendered as values');
    // Front matter a reader and the queue both need.
    assert.match(text, /^source: "openrouter-models"$/m);
    assert.match(text, /^last_seen: "2026-09-01"$/m);
  } finally {
    cleanup(root);
  }
});

test('a row with no last-known values says so rather than rendering an empty table', () => {
  const root = makeRoot();
  try {
    recordVanishedRows(root, VANISHED, {}, TODAY);
    const text = readFileSync(join(root, 'data', 'vanished', listVanishedRecords(root)[0]), 'utf8');
    assert.match(text, /No last-known values/i);
  } finally {
    cleanup(root);
  }
});

test('row ids containing slashes, colons and tildes become one safe file name', () => {
  const a = vanishedFileName('openrouter-models', 'anthropic/claude-opus-5-fast');
  const b = vanishedFileName('openrouter-models', '~z-ai/glm-latest');
  const c = vanishedFileName('openrouter-models', 'openai/gpt-5.6-sol:batch');
  for (const n of [a, b, c]) {
    assert.ok(!n.includes('/'), `${n} must not contain a path separator`);
    assert.ok(!n.includes(':'), `${n} must not contain a colon`);
    assert.match(n, /^[a-z0-9-]+\.md$/);
  }
  assert.notEqual(a, b);
  assert.notEqual(b, c);
});

/* ── the reader's refusals ─────────────────────────────────────────────── */

test('a record with no title is skipped, not queued under a guessed name', () => {
  const root = makeRoot();
  try {
    const dir = join(root, 'data', 'vanished');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'broken.md'), '---\nsource: "x"\n---\n\nno title\n', 'utf8');
    writeFileSync(join(dir, 'alsobroken.md'), 'no front matter at all\n', 'utf8');
    assert.equal(vanishedRowItems(root).length, 0);
  } finally {
    cleanup(root);
  }
});

test('README.md in the directory is not a finding', () => {
  const root = makeRoot();
  try {
    const dir = join(root, 'data', 'vanished');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'README.md'), '---\ntitle: "docs"\n---\n\nnot a finding\n', 'utf8');
    assert.equal(vanishedRowItems(root).length, 0);
  } finally {
    cleanup(root);
  }
});

test('an absent directory is zero findings, not a crash', () => {
  const root = makeRoot();
  try {
    assert.ok(!existsSync(join(root, 'data', 'vanished')));
    assert.deepEqual(vanishedRowItems(root), []);
  } finally {
    cleanup(root);
  }
});

test('recording nothing writes no directory at all', () => {
  const root = makeRoot();
  try {
    const r = recordVanishedRows(root, [], {}, TODAY);
    assert.deepEqual(r.written, []);
    assert.ok(!existsSync(join(root, 'data', 'vanished')));
  } finally {
    cleanup(root);
  }
});
