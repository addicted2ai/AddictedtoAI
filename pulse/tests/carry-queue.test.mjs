/**
 * carry-queue.test.mjs — the read side of beads addictedtoai-2bo's carry:
 * mechanism: `data/carried/*.md` becomes queue items.
 *
 * Unlike the rest of this directory, these tests call `computeQueue` and
 * `carriedFindingItems` directly rather than spawning `pulse/run.mjs` as a
 * subprocess — both are plain synchronous functions, and this file's task
 * brief was explicit that `pulse/run.mjs` itself (and `pulse/verify-zero-model.mjs`)
 * must not be invoked in this session, publish being armed. That restriction
 * does not reach a direct call into the library function the CLI wraps.
 *
 * "Cannot backlog" is the property under test throughout: a carried finding
 * is a queue item exactly while its file exists under `data/carried/`, on
 * every recomputation, with no separate resolved flag anywhere.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { carriedFindingItems, computeQueue, RANKS } from '../lib/queue.mjs';
import { makeRoot, cleanup } from './helpers.mjs';

const AT = new Date('2026-08-31T12:00:00.000Z');

function writeCarried(root, name, front, body = 'The finding, in full.\n') {
  const dir = join(root, 'data', 'carried');
  mkdirSync(dir, { recursive: true });
  const fm = Object.entries(front)
    .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
    .join('\n');
  writeFileSync(join(dir, name), `---\n${fm}\n---\n\n${body}`, 'utf8');
}

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

test('a carried-finding file becomes a queue item with its own title, not the detail', () => {
  const root = makeRoot([]);
  try {
    writeCarried(
      root,
      'j-20260831-99-carry-1.md',
      { title: 'z-ai: restore the "outside China" qualifier', subject: 'content/wiki/org/z-ai.md' },
      'A very long finding paragraph that would make an awful job-brief heading if it were used as one.\n',
    );
    const items = carriedFindingItems(root);
    assert.equal(items.length, 1);
    const it = items[0];
    assert.equal(it.type, 'repair');
    assert.equal(it.reason, 'carried-finding');
    assert.equal(it.title, 'z-ai: restore the "outside China" qualifier');
    assert.notEqual(it.title, it.detail, 'the title must never be the detail — a detail can run to kilobytes');
    assert.equal(it.subject, 'content/wiki/org/z-ai.md');
    assert.equal(it.target, 'content/wiki/org/z-ai.md');
    assert.match(it.detail, /awful job-brief heading/);
    assert.equal(it.rank, RANKS['carried-finding']);
  } finally {
    cleanup(root);
  }
});

test('a carried-finding file with no subject still produces a dispatchable item, targeted at itself', () => {
  const root = makeRoot([]);
  try {
    writeCarried(root, 'j-1-carry-1.md', { title: 'fix the thing' });
    const [it] = carriedFindingItems(root);
    assert.equal(it.subject, 'data/carried/j-1-carry-1.md');
    assert.equal(it.target, 'data/carried/j-1-carry-1.md');
  } finally {
    cleanup(root);
  }
});

test('a malformed carried-finding file (no title) is skipped, not queued with a guessed name', () => {
  const root = makeRoot([]);
  try {
    const dir = join(root, 'data', 'carried');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'no-title.md'), '---\nsubject: "content/x.md"\n---\n\nNo title here.\n', 'utf8');
    writeFileSync(join(dir, 'no-front-matter.md'), 'Just a body, no front matter at all.\n', 'utf8');
    assert.deepEqual(carriedFindingItems(root), []);
  } finally {
    cleanup(root);
  }
});

test('README.md under data/carried/ is never read as a finding', () => {
  const root = makeRoot([]);
  try {
    const dir = join(root, 'data', 'carried');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'README.md'), '---\ntitle: "not a finding"\n---\n\nDocumentation.\n', 'utf8');
    assert.deepEqual(carriedFindingItems(root), []);
  } finally {
    cleanup(root);
  }
});

test('an absent data/carried/ directory produces no items and no error', () => {
  const root = makeRoot([]);
  try {
    assert.deepEqual(carriedFindingItems(root), []);
    const q = emptyQueue(root);
    assert.equal(q.items.filter((i) => i.reason === 'carried-finding').length, 0);
  } finally {
    cleanup(root);
  }
});

test('computeQueue includes carried findings alongside everything else, ranked below the routine timers', () => {
  const root = makeRoot([]);
  try {
    writeCarried(root, 'j-2-carry-1.md', { title: 'a small correction' });
    const q = emptyQueue(root);
    const carried = q.items.filter((i) => i.reason === 'carried-finding');
    assert.equal(carried.length, 1);
    assert.equal(carried[0].title, 'a small correction');
    // Below every timer in the table — the deliberate placement that keeps an
    // un-retired carried finding from becoming the addictedtoai-5hn failure.
    assert.ok(RANKS['carried-finding'] < RANKS['overdue-fact-slow'], 'below the lowest timer');
    assert.ok(RANKS['carried-finding'] < RANKS['want-eligible-mint'], 'below want-eligible-mint');
  } finally {
    cleanup(root);
  }
});

// ---------------------------------------------------------------------------
// "Cannot backlog": the file's presence IS the state, on every recomputation.
// ---------------------------------------------------------------------------

test('fixing the underlying content and deleting the carried-finding file removes the item — no close action, no flag', () => {
  const root = makeRoot([]);
  try {
    const path = join(root, 'data', 'carried', 'j-3-carry-1.md');
    writeCarried(root, 'j-3-carry-1.md', { title: 'one-word fix' });

    let q = emptyQueue(root);
    assert.equal(q.items.filter((i) => i.reason === 'carried-finding').length, 1);

    // The fixing job's own diff deletes the file — simulated directly here,
    // exactly as loop/lib/carry.mjs's README instructs the fixer to do.
    rmSync(path);

    q = emptyQueue(root);
    assert.equal(q.items.filter((i) => i.reason === 'carried-finding').length, 0, 'recomputed, not accumulated');
  } finally {
    cleanup(root);
  }
});

test('re-running with the carried-finding file unchanged produces byte-identical items', () => {
  const root = makeRoot([]);
  try {
    writeCarried(root, 'j-4-carry-1.md', { title: 'stable finding', subject: 'content/x.md' });
    const a = JSON.stringify(emptyQueue(root).items);
    const b = JSON.stringify(emptyQueue(root).items);
    assert.equal(a, b);
  } finally {
    cleanup(root);
  }
});

test('multiple carried findings sort deterministically by subject within the same rank', () => {
  const root = makeRoot([]);
  try {
    writeCarried(root, 'j-5-carry-1.md', { title: 'second alphabetically', subject: 'content/wiki/model/z.md' });
    writeCarried(root, 'j-5-carry-2.md', { title: 'first alphabetically', subject: 'content/wiki/model/a.md' });
    const q = emptyQueue(root);
    const carried = q.items.filter((i) => i.reason === 'carried-finding');
    assert.deepEqual(
      carried.map((i) => i.subject),
      ['content/wiki/model/a.md', 'content/wiki/model/z.md'],
    );
  } finally {
    cleanup(root);
  }
});
