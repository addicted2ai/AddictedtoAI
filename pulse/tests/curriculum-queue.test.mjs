/**
 * curriculum-queue.test.mjs — declared coverage as queue input
 * (let-the-site-see-its-own-gaps, tasks 3.1–3.5 and 4.1).
 *
 * specs/pulse: *"Where a surface has a curriculum of record — a written
 * enumeration of the pages it intends to publish — the Pulse SHALL derive one
 * queue item for each enumerated page that `content/` does not publish."*
 *
 * This is the machinery's first INWARD-looking signal. Every other queue reason
 * answers "the world changed" or "a timer elapsed"; this one answers "the site
 * declared an intention it has not met", and it is a set difference between two
 * committed files rather than anything's judgment.
 *
 * Like every other Pulse test, these run the real `pulse/run.mjs` against a
 * throwaway root, so what is measured is the shipped program end to end.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { cleanup, jsonSource, makeRoot, paths, readJson, runPulse, writeEntry, writeJson } from './helpers.mjs';
import {
  QUEUE_PRODUCIBLE_TYPES,
  RANKS,
  curriculumGapItems,
  publishedLearnSlugs,
  readCurriculumSlugs,
} from '../lib/queue.mjs';
import { JOB_TYPES } from '../../loop/lib/config.mjs';

const ARGS = ['--no-build', '--no-mint', '--offline'];
const NOW = { PULSE_NOW: '2026-08-28' };

/** Write a curriculum of record enumerating `slugs`, into a fixture root. */
function writeCurriculum(root, slugs) {
  const file = join(root, 'openspec', 'curriculum', 'learn.md');
  mkdirSync(dirname(file), { recursive: true });
  const body = [
    '# Curriculum',
    '',
    '## §3 — How to write a page',
    '',
    '#### `prose-heading-not-an-entry`',
    '',
    '## §4 — The catalog',
    '',
    ...slugs.flatMap((s) => [`#### \`${s}\` — "${s}"`, '- **Status**: new', '']),
    '## §5 — The dependency graph',
    '',
    '#### `also-not-an-entry`',
    '',
  ].join('\n');
  writeFileSync(file, body, 'utf8');
  return file;
}

/** A published learn page. Only the filename is load-bearing for the queue. */
function writeLearnPage(root, slug) {
  return writeEntry(
    root,
    `content/learn/${slug}.md`,
    { title: slug, level: 'orientation', prerequisites: [], outcome: 'x', mentions: [] },
    'body',
  );
}

const gapItems = (queue) => queue.items.filter((i) => i.reason === 'curriculum-gap');

// ── the four spec scenarios, end to end ──────────────────────────────────

test('a declared page nobody has written becomes one education item naming the slug', async (t) => {
  const root = makeRoot([]);
  t.after(() => cleanup(root));
  writeCurriculum(root, ['written-one', 'never-written', 'written-two']);
  writeLearnPage(root, 'written-one');
  writeLearnPage(root, 'written-two');

  assert.equal((await runPulse(root, ARGS, NOW)).status, 0);
  const items = gapItems(readJson(paths.queue(root)));

  assert.equal(items.length, 1, 'one item for the one unwritten page');
  assert.equal(items[0].type, 'education', 'the type with no other producer anywhere');
  assert.equal(items[0].subject, 'never-written');
  assert.equal(items[0].target, 'content/learn/never-written.md');
  assert.match(items[0].detail, /openspec\/curriculum\/learn\.md/, 'points at the entry that briefs the job');
  assert.ok(items[0].title, 'carries a one-line outcome, because the detail runs long');
});

test('writing the page empties the item, with no close or archive action by anyone', async (t) => {
  const root = makeRoot([]);
  t.after(() => cleanup(root));
  writeCurriculum(root, ['gap']);

  assert.equal((await runPulse(root, ARGS, NOW)).status, 0);
  assert.equal(gapItems(readJson(paths.queue(root))).length, 1, 'the gap is offered');

  writeLearnPage(root, 'gap');
  assert.equal((await runPulse(root, ARGS, NOW)).status, 0);
  assert.equal(
    gapItems(readJson(paths.queue(root))).length,
    0,
    'recomputation alone retires it — nothing was closed, nothing was archived',
  );
});

test('a fully published map produces no work, and that is a healthy run', async (t) => {
  const root = makeRoot([]);
  t.after(() => cleanup(root));
  writeCurriculum(root, ['a', 'b']);
  writeLearnPage(root, 'a');
  writeLearnPage(root, 'b');

  const run = await runPulse(root, ARGS, NOW);
  assert.equal(run.status, 0, 'finding no work is a complete run, not a failure');
  assert.equal(gapItems(readJson(paths.queue(root))).length, 0);
});

test('an absent curriculum yields no items and halts nothing — the Pulse is tolerant', async (t) => {
  const root = makeRoot([]);
  t.after(() => cleanup(root));
  writeLearnPage(root, 'orphan'); // published, declared nowhere: the BUILD's problem, not the engine's

  const run = await runPulse(root, ARGS, NOW);
  assert.equal(run.status, 0, 'the engine must run on a tree where the build would fail');
  assert.equal(gapItems(readJson(paths.queue(root))).length, 0);
});

test('a curriculum with no §4 catalog section is tolerated the same way', async (t) => {
  const root = makeRoot([]);
  t.after(() => cleanup(root));
  const file = join(root, 'openspec', 'curriculum', 'learn.md');
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, '# Curriculum\n\nNo catalog here.\n', 'utf8');

  assert.equal((await runPulse(root, ARGS, NOW)).status, 0);
  assert.equal(gapItems(readJson(paths.queue(root))).length, 0);
});

// ── the parse and the derivation, directly ───────────────────────────────

test('only §4 declares: headings before and after the catalog are not entries', (t) => {
  const root = makeRoot([]);
  t.after(() => cleanup(root));
  writeCurriculum(root, ['inside']);
  assert.deepEqual(
    readCurriculumSlugs(root),
    ['inside'],
    'a `#### `slug`` in prose would otherwise be a permanent item for a page that must never exist',
  );
});

test('the gap is a set difference in curriculum order, with nothing scored or ranked', () => {
  const declared = ['zebra', 'apple', 'mango'];
  const published = new Set(['apple']);
  const items = curriculumGapItems('/unused', { declared, published });
  assert.deepEqual(
    items.map((i) => i.subject),
    ['zebra', 'mango'],
    "the curriculum's own order, never alphabetical and never by any judgment of importance",
  );
});

test("README.md is not a published page, and a page's slug is its filename", (t) => {
  const root = makeRoot([]);
  t.after(() => cleanup(root));
  writeLearnPage(root, 'real');
  const file = join(root, 'content', 'learn', 'README.md');
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, '# not a page\n', 'utf8');
  assert.deepEqual([...publishedLearnSlugs(root)].sort(), ['real']);
});

// ── the rank, argued rather than pinned to a literal ─────────────────────

test('curriculum-gap ranks below want-eligible-mint and above carried-finding', () => {
  assert.ok(
    RANKS['curriculum-gap'] < RANKS['want-eligible-mint'],
    'a reader hitting a missing link today outranks a standing intention nobody is walking into',
  );
  assert.ok(
    RANKS['curriculum-gap'] > RANKS['carried-finding'],
    'a carried finding cannot retire on its own; this item retires the moment the page exists',
  );
  for (const lower of ['broken-link', 'refusing-source', 'overdue-fact-slow', 'scout-due']) {
    assert.ok(RANKS['curriculum-gap'] < RANKS[lower], `nothing is broken, so it ranks below ${lower}`);
  }
});

// ── task 4.1: the decision on record ─────────────────────────────────────

test('4.1 every type the queue can produce is on the declared list', async (t) => {
  const root = makeRoot([jsonSource('quiet', 'http://fixture.invalid/q', { expected_change_days: 3 })]);
  t.after(() => cleanup(root));

  // A deliberately mixed state, so the assertion is made against a queue that
  // exercises several producers rather than an empty one.
  writeEntry(root, 'content/wiki/model/alpha.md', {
    id: 'model/alpha',
    kind: 'model',
    display_name: 'alpha',
    status: 'active',
    maintenance: 'living',
    aliases: [],
    feeds: {},
    facts: [{ field: 'price_input', source: 'cited', value: '1', source_url: 'https://vendor.invalid/p', accessed: '2026-01-01', volatility: 'fast' }],
    timeline: [],
    mentions: [],
  });
  writeEntry(root, 'content/tutorials/old.md', { subjects: [], verified_on: '2026-05-01', reverify_days: 30, mentions: [] }, 'body');
  writeEntry(root, 'content/directory/tools/t.md', { url: 'https://t.invalid/', pricing: 'free', last_verified: '2026-01-01', entry: 'tool/t', mentions: [] }, 'body');
  writeJson(paths.state(root, 'quiet'), { source: 'quiet', last_fetch_date: '2026-08-28', last_change_date: '2026-07-01', seeded: true, refusing: null, consecutive_no_change_fetches: 9 });
  writeFileSync(
    paths.changes(root),
    JSON.stringify({ key: 'quiet|a|b|acme/one|price_input', date: '2026-08-25', kind: 'field_change', source: 'quiet', source_url: 'http://fixture.invalid/q', row_id: 'acme/one', field: 'price_input', old: '1', new: '2' }) + '\n',
    'utf8',
  );
  writeCurriculum(root, ['unwritten']);

  assert.equal((await runPulse(root, ARGS, NOW)).status, 0);
  const queue = readJson(paths.queue(root));
  assert.ok(queue.count > 3, 'the fixture produced a queue worth checking');

  const seen = new Set();
  for (const it of queue.items) {
    assert.ok(
      QUEUE_PRODUCIBLE_TYPES.includes(it.type),
      `queue produced type "${it.type}" (reason ${it.reason}), which is not on QUEUE_PRODUCIBLE_TYPES — ` +
        'either the list is stale or a producer was added without the decision being recorded',
    );
    seen.add(it.type);
  }
  assert.ok(seen.has('education'), 'this fixture exercises the new producer too');
});

test('4.1 the producible list is a subset of the job types the loop can run', () => {
  for (const t of QUEUE_PRODUCIBLE_TYPES) {
    assert.ok(JOB_TYPES.includes(t), `${t} is queue-producible but not a job type the loop can run`);
  }
});

test('4.1 the four excluded types are excluded, and their absence is the decision', () => {
  // addictedtoai-3zf part (d). Either answer was defensible; the state that was
  // wrong was capacity with no trigger and no record of a decision. If a later
  // change makes one of these queue-producible, this assertion is the thing that
  // makes it edit the list — and therefore read the reasons beside it.
  for (const t of ['tutorial', 'post', 'prune', 'machinery']) {
    assert.ok(JOB_TYPES.includes(t), `${t} is still a runnable job type`);
    assert.ok(
      !QUEUE_PRODUCIBLE_TYPES.includes(t),
      `${t} is proposal- and maintainer-initiated by design ` +
        '(let-the-site-see-its-own-gaps, design D4/D5) — adding a queue ' +
        'producer for it means amending QUEUE_PRODUCIBLE_TYPES and the reasoning beside it',
    );
  }
});
