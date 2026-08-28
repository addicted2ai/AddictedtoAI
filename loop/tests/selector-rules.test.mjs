/**
 * Task 7.8 — the surface and degradation rules the specs assert, each a real
 * selector behaviour with its own synthetic-state test.
 *
 * Every refusal below names its rule in the selector's output. A rule that
 * refuses silently is indistinguishable from a rule that is not there.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, mkdirSync, utimesSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loadConfig } from '../lib/config.mjs';
import { loadRunners, pickRunner } from '../lib/runners.mjs';
import { readLedger } from '../lib/ledger.mjs';
import { selectJob, formatRefusals } from '../lib/select.mjs';
import { recentPosts } from '../lib/surfaces.mjs';
import { readProposals } from '../lib/proposals.mjs';
import {
  makeRepo,
  writeLedger,
  ledgerLine,
  writeQueue,
  writeFreshness,
  hoursAgo,
  daysAgo,
} from './helpers.mjs';

const NOW = new Date('2026-09-10T12:00:00.000Z');

function select(ctx, { runnerId = 'mock-frontier' } = {}) {
  const cfg = loadConfig(ctx);
  const runner = pickRunner(loadRunners(ctx), { id: runnerId, role: 'author' });
  const sel = selectJob(ctx, { cfg, ledger: readLedger(ctx), runner, dryRun: true });
  sel.text = formatRefusals(sel.refusals).join('\n');
  return sel;
}

function post(date, slug) {
  return [`content/blog/${slug}.md`, `---\ntitle: ${slug}\ndate: ${date}\n---\n\nBody.\n`];
}

// ---------------------------------------------------------------------------
// (a) the blog ceiling — specs/blog
// ---------------------------------------------------------------------------

test('(a) a post job is refused while 3 published posts carry dates within the trailing 7 days', () => {
  const files = Object.fromEntries([
    post('2026-09-09', 'one'),
    post('2026-09-07', 'two'),
    post('2026-09-05', 'three'),
  ]);
  const ctx = makeRepo({ now: () => NOW, files });
  writeQueue(ctx, [{ type: 'post', title: 'a fourth post this week' }]);
  assert.equal(recentPosts(ctx).length, 3);

  const sel = select(ctx);
  assert.equal(sel.selected, null);
  assert.equal(sel.refusals[0].rule, 'blog:rolling-ceiling');
  assert.match(sel.text, /\[blog:rolling-ceiling\]/);
  assert.match(sel.text, /2026-09-05, 2026-09-07, 2026-09-09/);
  assert.match(sel.text, /depth rather than volume/);
  ctx.cleanup();
});

test('(a) two recent posts allow a third', () => {
  const files = Object.fromEntries([post('2026-09-09', 'one'), post('2026-09-07', 'two')]);
  const ctx = makeRepo({ now: () => NOW, files });
  writeQueue(ctx, [{ type: 'post', title: 'a third post this week' }]);
  assert.equal(recentPosts(ctx).length, 2);
  const sel = select(ctx);
  assert.equal(sel.selected?.type, 'post', sel.text);
  ctx.cleanup();
});

test('(a) posts older than 7 days, and drafts, do not spend the ceiling', () => {
  const files = Object.fromEntries([
    post('2026-09-01', 'old-one'),
    post('2026-08-20', 'old-two'),
    post('2026-09-09', 'recent'),
    ['content/blog/draft.md', '---\ntitle: draft\ndate: 2026-09-08\ndraft: true\n---\n\nBody.\n'],
  ]);
  const ctx = makeRepo({ now: () => NOW, files });
  assert.deepEqual(recentPosts(ctx).map((p) => p.date), ['2026-09-09']);
  ctx.cleanup();
});

// ---------------------------------------------------------------------------
// (b) tutorial upkeep priority and the demotion gate — specs/education-dynamic
// ---------------------------------------------------------------------------

test('(b) a tutorial re-verify wins over a new tutorial in the same tier', () => {
  const ctx = makeRepo({ now: () => NOW });
  writeQueue(ctx, [
    { type: 'tutorial', title: 'write a shiny new tutorial', rank: 1 },
    { type: 'verify', title: 're-verify the in-browser inference tutorial', rank: 2, subject_kind: 'tutorial' },
  ]);
  const sel = select(ctx);
  assert.equal(sel.selected.type, 'verify', sel.text);
  const refusal = sel.refusals.find((r) => r.candidate?.type === 'tutorial');
  assert.equal(refusal.rule, 'education-dynamic:verify-outranks-tutorial');
  assert.match(sel.text, /re-verifying existing tutorials takes\s+priority/);
  ctx.cleanup();
});

test('(b) a new tutorial is refused entirely while any tutorial stands demoted for staleness', () => {
  const ctx = makeRepo({ now: () => NOW });
  writeQueue(ctx, [{ type: 'tutorial', title: 'write a shiny new tutorial' }]);
  writeFreshness(ctx, {
    tutorials: [{ id: 'browser-inference', state: 'demoted', subject_status: 'active' }],
  });
  const sel = select(ctx);
  assert.equal(sel.selected, null);
  assert.equal(sel.refusals[0].rule, 'education-dynamic:demotion-gate');
  assert.match(sel.text, /browser-inference/);
  ctx.cleanup();
});

test('(b) a demoted tutorial whose subject is dead does not block — archival is the right end state', () => {
  const ctx = makeRepo({ now: () => NOW });
  writeQueue(ctx, [{ type: 'tutorial', title: 'write a shiny new tutorial' }]);
  writeFreshness(ctx, {
    tutorials: [
      { id: 'dead-thing', state: 'demoted', subject_status: 'dead' },
      { id: 'archived-thing', state: 'archived', demoted: true },
    ],
  });
  const sel = select(ctx);
  assert.equal(sel.selected?.type, 'tutorial', sel.text);
  ctx.cleanup();
});

// ---------------------------------------------------------------------------
// (c) proposal duplicate suppression and cooling — specs/loop
// ---------------------------------------------------------------------------

function plantProposal(ctx, dir, slug, ageDays, extra = {}) {
  mkdirSync(dir, { recursive: true });
  const p = join(dir, `${slug}.md`);
  const fm = Object.entries({ slug, type: 'entry', date: '2026-09-01', ...extra })
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');
  writeFileSync(p, `---\n${fm}\n---\n\nA proposal body.\n`, 'utf8');
  const t = new Date(NOW.getTime() - ageDays * 24 * 3600 * 1000);
  utimesSync(p, t, t);
  return p;
}

test('(c) a proposal whose slug matches a rejected one is auto-discarded before any model is invoked', () => {
  const ctx = makeRepo({ now: () => NOW });
  writeQueue(ctx, []);
  plantProposal(ctx, ctx.rejectedDir, 'weekly-roundup', 30, {
    rejection_reason: 'a roundup nobody would cite; not-worth-reading',
  });
  plantProposal(ctx, ctx.proposalsDir, 'weekly-roundup', 10);

  const read = readProposals(ctx);
  assert.equal(read.ripe.length, 0);
  assert.equal(read.duplicates.length, 1);
  assert.match(read.duplicates[0].why, /a roundup nobody would cite/);

  const sel = select(ctx); // dryRun: the file is reported, not moved
  assert.equal(sel.selected, null);
  assert.match(sel.notes.join('\n'), /auto-discarded/);
  assert.match(sel.notes.join('\n'), /dry run: not moved/);

  // and for real, it moves into the rejection index with the pointer appended
  const cfg = loadConfig(ctx);
  const runner = pickRunner(loadRunners(ctx), { id: 'mock-frontier', role: 'author' });
  selectJob(ctx, { cfg, ledger: [], runner, dryRun: false });
  assert.ok(!existsSync(join(ctx.proposalsDir, 'weekly-roundup.md')), 'the duplicate left the active pool');
  const moved = readdirSync(ctx.rejectedDir).find((f) => f.includes('duplicate'));
  assert.ok(moved, readdirSync(ctx.rejectedDir).join(', '));
  const text = readFileSync(join(ctx.rejectedDir, moved), 'utf8');
  assert.match(text, /Auto-discarded as a duplicate/);
  assert.match(text, /a roundup nobody would cite/);
  assert.match(text, /No model was invoked; no\s+inference was spent/);
  ctx.cleanup();
});

test('(c) a proposal younger than 3 days is not selectable while a 4-day-old one is', () => {
  const ctx = makeRepo({ now: () => NOW });
  writeQueue(ctx, []);
  plantProposal(ctx, ctx.proposalsDir, 'too-fresh', 1);
  plantProposal(ctx, ctx.proposalsDir, 'has-cooled', 4);

  const read = readProposals(ctx);
  assert.deepEqual(read.ripe.map((r) => r.slug), ['has-cooled']);
  assert.deepEqual(read.cooling.map((r) => r.slug), ['too-fresh']);
  assert.match(read.cooling[0].why, /cools for 3 days \(file age\)/);

  const sel = select(ctx);
  assert.equal(sel.selected.source, 'proposal', sel.text);
  assert.equal(sel.selected.slug, 'has-cooled');
  ctx.cleanup();
});

test('(c) a proposal with a job type outside the closed list is skipped, not guessed at', () => {
  const ctx = makeRepo({ now: () => NOW });
  plantProposal(ctx, ctx.proposalsDir, 'invent-a-type', 10, { type: 'newsletter' });
  const read = readProposals(ctx);
  assert.equal(read.ripe.length, 0);
  assert.match(read.malformed[0].why, /not in the closed job-type list/);
  ctx.cleanup();
});

// ---------------------------------------------------------------------------
// (d) capacity degradation, through the selector — specs/loop
// ---------------------------------------------------------------------------

const CAPACITY_QUEUE = [
  { type: 'post', title: 'a post', rank: 1 },
  { type: 'education', title: 'an education page', rank: 2 },
  { type: 'entry', title: 'an entry', rank: 3 },
  { type: 'tutorial', title: 'a tutorial', rank: 4 },
  { type: 'interpret', title: 'an immaterial interpret', rank: 5, field: 'description' },
  { type: 'interpret', title: 'a material interpret', rank: 6, field: 'price' },
  { type: 'verify', title: 'a verify', rank: 7 },
  { type: 'repair', title: 'a repair', rank: 8 },
];

function withCapacityEvents(n) {
  const ctx = makeRepo({ now: () => NOW });
  writeQueue(ctx, CAPACITY_QUEUE);
  // The events are old enough that no lane pause is in force (>6h), and they
  // are upkeep-typed so the budget bounds are all satisfied — what is being
  // measured here is shedding and nothing else.
  writeLedger(
    ctx,
    Array.from({ length: n }, (_, i) =>
      ledgerLine({ id: `c-${i}`, type: 'repair', mm: 5, tier: 'frontier', outcome: 'capacity', ts: hoursAgo(NOW, 10 + i) }),
    ),
  );
  return ctx;
}

test('(d) shed level 1 refuses post and education, naming the rule', () => {
  const ctx = withCapacityEvents(1);
  const sel = select(ctx);
  assert.equal(sel.shed.level, 1);
  assert.equal(sel.selected.type, 'entry', sel.text);
  const refused = sel.refusals.filter((r) => r.rule === 'degradation:shed').map((r) => r.candidate.type);
  assert.deepEqual(refused, ['post', 'education']);
  assert.match(sel.text, /\[degradation:shed\].*excludes post jobs/s);
  ctx.cleanup();
});

test('(d) shed level 2 also refuses entry and tutorial', () => {
  const ctx = withCapacityEvents(2);
  const sel = select(ctx);
  assert.equal(sel.shed.level, 2);
  assert.equal(sel.selected.type, 'interpret', sel.text);
  const refused = sel.refusals.filter((r) => r.rule === 'degradation:shed').map((r) => r.candidate.type);
  assert.deepEqual(refused, ['post', 'education', 'entry', 'tutorial']);
  ctx.cleanup();
});

test('(d) shed level 3 leaves only verify, repair and material interpret', () => {
  const ctx = withCapacityEvents(3);
  const sel = select(ctx);
  assert.equal(sel.shed.level, 3);
  assert.equal(sel.selected.type, 'interpret', sel.text);
  assert.equal(sel.selected.material, true, 'the immaterial one was passed over');
  const immaterial = sel.refusals.find((r) => r.rule === 'degradation:interpret-material-only');
  assert.ok(immaterial, sel.text);
  assert.match(immaterial.reason, /price \/ licence \/ status/);
  ctx.cleanup();
});

test('(d) shedding is per tier: the other tier is untouched', () => {
  const ctx = makeRepo({ now: () => NOW });
  writeQueue(ctx, [{ type: 'post', title: 'a post' }]);
  writeLedger(ctx, [
    ledgerLine({ type: 'repair', mm: 5, tier: 'frontier', outcome: 'capacity', ts: hoursAgo(NOW, 10) }),
    ledgerLine({ type: 'repair', mm: 5, tier: 'frontier', outcome: 'capacity', ts: hoursAgo(NOW, 11) }),
    ledgerLine({ type: 'repair', mm: 5, tier: 'frontier', outcome: 'capacity', ts: hoursAgo(NOW, 12) }),
    ledgerLine({ type: 'repair', mm: 5, tier: 'cheap', outcome: 'done', ts: hoursAgo(NOW, 9) }),
  ]);
  assert.equal(select(ctx, { runnerId: 'mock-frontier' }).selected, null);
  assert.equal(select(ctx, { runnerId: 'mock-cheap' }).selected?.type, 'post');
  ctx.cleanup();
});

test('the queue is consumed in file order, in the Pulse\'s own item shape', () => {
  // The Pulse writes `{type, reason, rank, subject, detail, target}` already
  // sorted by rank DESCENDING (100 = refusing source, 30 = a wanted mint). A
  // reader that re-sorted ascending would pick the least urgent item every
  // single run and nothing would ever look wrong. File order is the ranking.
  const ctx = makeRepo({ now: () => NOW });
  writeQueue(ctx, [
    { type: 'repair', reason: 'refusing-source', rank: 100, subject: 'llm-releases', detail: 'source refusing since 2026-09-08', target: 'data/sources/registry.json' },
    { type: 'repair', reason: 'broken-link', rank: 90, subject: 'content/wiki/x.md', detail: 'link 404s', target: 'content/wiki/x.md' },
    { type: 'entry', reason: 'want-eligible-mint', rank: 30, subject: 'Some Tool', detail: 'wanted by 3 distinct pages', target: null },
  ]);
  const sel = select(ctx);
  assert.equal(sel.selected.title, 'source refusing since 2026-09-08', sel.text);
  assert.equal(sel.selected.rank, 100);
  ctx.cleanup();
});

test('directives outrank the queue, and the queue outranks proposals', () => {
  const ctx = makeRepo({
    now: () => NOW,
    directives: '# DIRECTIVES.md\n\n- repair: the maintainer wants this first\n',
  });
  writeQueue(ctx, [{ type: 'repair', title: 'a queue item' }]);
  plantProposal(ctx, ctx.proposalsDir, 'a-ripe-idea', 10, { type: 'repair' });
  assert.equal(select(ctx).selected.source, 'directive');

  const ctx2 = makeRepo({ now: () => NOW });
  writeQueue(ctx2, [{ type: 'repair', title: 'a queue item' }]);
  plantProposal(ctx2, ctx2.proposalsDir, 'a-ripe-idea', 10, { type: 'repair' });
  assert.equal(select(ctx2).selected.source, 'queue');
  ctx.cleanup();
  ctx2.cleanup();
});
