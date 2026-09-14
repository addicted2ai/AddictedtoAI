/**
 * Task 53 — the work-order bundler in `loop/lib/select.mjs`.
 *
 * Groups affordable candidates by coherence key within the four work-order
 * bounds (`max_items` 4, `max_subjects` 4, `max_reviewed_bytes` 60000,
 * `max_reviewed_bytes_per_subject` 30000), splits over-bound sets instead of
 * truncating them, refuses a lone over-per-subject item with a recorded
 * reason, measures pathless candidates by declared-subject estimate (never
 * zero, never a refusal for pathlessness), and reads subjects from declared
 * metadata only — never title or prose.
 *
 * Pure unit tests: plain candidate objects, an injected `measure` seam, no
 * repository, no git plumbing, no spawns, no builds, no pushes. The task-37
 * fixture policy binds train tests that need real plumbing; there is nothing
 * here that could touch the network or another branch, which is the stronger
 * half of the same rule.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  WORK_ORDER_DEFAULTS,
  WORK_ORDER_PATHLESS_ESTIMATE_BYTES,
  bundleWorkOrders,
  candidateReviewedBytes,
  candidateSubjects,
  coherenceKey,
  workOrderBounds,
} from '../lib/select.mjs';
import { declarationFromOrder, workOrderItemForCandidate } from '../run.mjs';

/** Minimal config: the category map the coherence key reads, no work_order block. */
const CFG = {
  budget: {
    categories: {
      upkeep: ['repair', 'verify'],
      new_writing: ['post', 'entry'],
      machinery: ['machinery'],
    },
  },
};

const queueRepair = (title, target, extra = {}) => ({
  source: 'queue',
  type: 'repair',
  title,
  target,
  ...extra,
});

/** Every order the bundler emits satisfies all four bounds. */
function assertWithinBounds(orders, bounds) {
  for (const order of orders) {
    assert.ok(
      order.items.length <= bounds.maxItems,
      `order holds ${order.items.length} items over max_items ${bounds.maxItems}`,
    );
    assert.ok(
      order.subjects.length <= bounds.maxSubjects,
      `order holds ${order.subjects.length} subjects over max_subjects ${bounds.maxSubjects}`,
    );
    assert.ok(
      order.totalBytes <= bounds.maxReviewedBytes,
      `order totals ${order.totalBytes} bytes over max_reviewed_bytes ${bounds.maxReviewedBytes}`,
    );
    for (const [subject, bytes] of Object.entries(order.perSubjectBytes)) {
      assert.ok(
        bytes <= bounds.maxReviewedBytesPerSubject,
        `subject ${subject} carries ${bytes} bytes over the per-subject ${bounds.maxReviewedBytesPerSubject}`,
      );
    }
  }
}

test('task 53: four repairs on one page bundle into one work order', () => {
  const candidates = [1, 2, 3, 4].map((n) =>
    queueRepair(`fix link ${n}`, 'content/wiki/model/x.md'),
  );
  const { orders, refusals } = bundleWorkOrders(candidates, {
    cfg: CFG,
    measure: () => 3000,
  });
  assert.equal(refusals.length, 0);
  assert.equal(orders.length, 1);
  assert.equal(orders[0].items.length, 4);
  assert.deepEqual(orders[0].subjects, ['content/wiki/model/x.md']);
  assert.equal(orders[0].totalBytes, 12000);
  assert.equal(orders[0].governingType, 'repair');
  assert.equal(orders[0].category, 'upkeep');
});

test('task 53: a mixed-category pair on one subject is not bundled', () => {
  const candidates = [
    queueRepair('fix a link', 'content/wiki/model/x.md'),
    { source: 'queue', type: 'post', title: 'write up x', target: 'content/wiki/model/x.md' },
  ];
  const { orders, refusals } = bundleWorkOrders(candidates, {
    cfg: CFG,
    measure: () => 3000,
  });
  assert.equal(refusals.length, 0);
  assert.equal(orders.length, 2);
  assert.deepEqual(orders.map((o) => o.items.length), [1, 1]);
  assert.deepEqual(orders.map((o) => o.governingType).sort(), ['post', 'repair']);
});

test('task 53: an over-bound coherent set splits, and nothing is dropped', () => {
  const candidates = [1, 2, 3, 4, 5, 6].map((n) =>
    queueRepair(`fix link ${n}`, 'content/wiki/model/busy.md'),
  );
  const { orders, refusals } = bundleWorkOrders(candidates, {
    cfg: CFG,
    measure: () => 9000,
  });
  assert.equal(refusals.length, 0);
  assert.equal(orders.length, 2);
  assert.equal(
    orders.reduce((n, o) => n + o.items.length, 0),
    6,
  );
  assertWithinBounds(orders, workOrderBounds(CFG));
});

test('task 53: one item over the per-subject bound is refused with a recorded reason', () => {
  const huge = queueRepair('rewrite the huge page', 'content/wiki/huge.md');
  const small = queueRepair('fix a typo', 'content/wiki/small.md');
  const sizes = { 'content/wiki/huge.md': 34000, 'content/wiki/small.md': 1000 };
  const { orders, refusals } = bundleWorkOrders([huge, small], {
    cfg: CFG,
    measure: (subject) => sizes[subject] ?? null,
  });
  assert.equal(refusals.length, 1);
  assert.equal(refusals[0].rule, 'work-order:per-subject-bound');
  assert.match(refusals[0].reason, /34000/);
  assert.match(refusals[0].reason, /30000/);
  assert.match(refusals[0].reason, /content\/wiki\/huge\.md/);
  assert.equal(orders.length, 1);
  assert.deepEqual(orders[0].items, [small]);
});

test('task 53: the per-subject bound measures each subject\'s own size', () => {
  // Two subjects of 18,000 bytes each is a legal order on every bound
  // (36,000 total; 18,000 per subject) — it must bundle, not refuse.
  const two = { source: 'queue', type: 'repair', title: 'touch a and b', subjects: ['a', 'b'] };
  const sizes = { a: 18000, b: 18000 };
  const single = bundleWorkOrders([two], {
    cfg: CFG,
    measure: (subject) => sizes[subject] ?? null,
  });
  assert.equal(single.refusals.length, 0);
  assert.equal(single.orders.length, 1);
  assert.equal(single.orders[0].totalBytes, 36000);
  assert.deepEqual(single.orders[0].perSubjectBytes, { a: 18000, b: 18000 });
  // Accumulation pins own-size: `a` carries 10,000 + 11,000 = 21,000, so a
  // later 11,000-byte candidate on `a` still fits the same order.
  const c1 = { source: 'queue', type: 'repair', title: 'first', subjects: ['a', 'b'] };
  const c2 = { source: 'queue', type: 'repair', title: 'second', subjects: ['a'] };
  const own = new Map([
    [c1, { a: 10000, b: 10000 }],
    [c2, { a: 11000 }],
  ]);
  const { orders, refusals } = bundleWorkOrders([c1, c2], {
    cfg: CFG,
    measure: (subject, candidate) => own.get(candidate)?.[subject] ?? null,
  });
  assert.equal(refusals.length, 0);
  assert.equal(orders.length, 1);
  assert.deepEqual(orders[0].perSubjectBytes, { a: 21000, b: 10000 });
  assert.equal(orders[0].totalBytes, 31000);
});

test('task 53: a real proposal-shaped candidate is pathless and cohorts as proposal', () => {
  // Built exactly as `readProposals` builds one: an absolute proposal-file
  // `path`, no carried front matter, no subjects — the file pointer is not
  // a subject, so the candidate is pathless.
  const proposal = (slug) => ({
    source: 'proposal',
    type: 'post',
    slug,
    path: join(tmpdir(), 'atai-proposals', `${slug}.md`),
    ageDays: 5,
    expires: null,
    discardedAttempts: 0,
    preempts: false,
    title: `Proposal ${slug}`,
    detail: `Proposal ${slug}\n\nBody.`,
    evidence: null,
    issues: [],
  });
  const shaped = proposal('fresh-idea');
  assert.deepEqual(candidateSubjects(shaped), []);
  assert.equal(
    coherenceKey(shaped, { category: 'new_writing' }),
    'new_writing\ncohort:proposal',
  );
  const { orders, refusals } = bundleWorkOrders([shaped, proposal('second-idea')], {
    cfg: CFG,
    measure: () => null,
  });
  assert.equal(refusals.length, 0);
  assert.equal(orders.length, 1);
  assert.deepEqual(orders[0].subjects, []);
  assert.deepEqual(orders[0].perSubjectBytes, {});
});

test('task 53: a candidate declaring more subjects than max_subjects is refused with a recorded reason', () => {
  const wide = {
    source: 'queue',
    type: 'repair',
    title: 'touches five subjects',
    subjects: ['s1', 's2', 's3', 's4', 's5'],
  };
  const small = queueRepair('fix a typo', 'content/wiki/tiny.md');
  const { orders, refusals } = bundleWorkOrders([wide, small], {
    cfg: CFG,
    measure: () => 100,
  });
  assert.equal(refusals.length, 1);
  assert.equal(refusals[0].rule, 'work-order:subject-count');
  assert.match(refusals[0].reason, /5/);
  assert.match(refusals[0].reason, /max_subjects 4/);
  assert.equal(orders.length, 1);
  assert.deepEqual(orders[0].items, [small]);
});

test('task 53: estimates are candidate-totals — total-only splits, and the total-bound refusal says so', () => {
  // Estimated candidates have no per-subject split: four 9,000-byte estimates
  // on one subject split on the total bound alone (counts and per-subject
  // figures never bind), and estimates add nothing per subject.
  const bounds = {
    maxItems: 10,
    maxSubjects: 10,
    maxReviewedBytes: 20000,
    maxReviewedBytesPerSubject: 20000,
  };
  const mk = (n) => ({
    source: 'queue',
    type: 'repair',
    title: `estimated ${n}`,
    subjects: ['p'],
    estimatedBytes: 9000,
  });
  const split = bundleWorkOrders([mk(1), mk(2), mk(3), mk(4)], {
    cfg: CFG,
    bounds,
    measure: () => null,
  });
  assert.equal(split.refusals.length, 0);
  assert.equal(split.orders.length, 2);
  assert.deepEqual(split.orders.map((o) => o.items.length), [2, 2]);
  assert.equal(split.orders[0].totalBytes, 18000);
  assert.deepEqual(split.orders[0].perSubjectBytes, {});
  // A lone estimate over the total is refused on the total bound, with the
  // reason stating the figure is a candidate total.
  const huge = { source: 'proposal', type: 'post', slug: 'big-idea', title: 'Big', estimatedBytes: 65000 };
  const refused = bundleWorkOrders([huge], { cfg: CFG, measure: () => null });
  assert.equal(refused.orders.length, 0);
  assert.equal(refused.refusals.length, 1);
  assert.equal(refused.refusals[0].rule, 'work-order:total-bound');
  assert.match(refused.refusals[0].reason, /65000/);
  assert.match(refused.refusals[0].reason, /60000/);
  assert.match(refused.refusals[0].reason, /candidate total/);
});

test('task 53: a pathless candidate is measured by estimate — never zero, never refused for pathlessness', () => {
  const estimated = {
    source: 'proposal',
    type: 'post',
    slug: 'fresh-idea',
    title: 'A fresh idea',
    estimatedBytes: 5000,
  };
  const bare = { source: 'proposal', type: 'post', slug: 'bare-idea', title: 'Bare' };
  assert.equal(
    candidateReviewedBytes(estimated, { measure: () => null }),
    5000,
  );
  const fallback = candidateReviewedBytes(bare, { measure: () => null });
  assert.ok(
    fallback > 0,
    `a candidate with no estimate still measures positive, got ${fallback}`,
  );
  assert.equal(fallback, WORK_ORDER_PATHLESS_ESTIMATE_BYTES);
  const { orders, refusals } = bundleWorkOrders([estimated, bare], {
    cfg: CFG,
    measure: () => null,
  });
  assert.equal(refusals.length, 0);
  assert.equal(orders.length, 1);
  assert.equal(orders[0].totalBytes, 5000 + WORK_ORDER_PATHLESS_ESTIMATE_BYTES);
});

test('task 53: subjects come from declared metadata only — prose never authorises', () => {
  const declared = queueRepair(
    'fix the link (do NOT touch content/wiki/x.md)',
    'content/wiki/y.md',
  );
  assert.deepEqual(candidateSubjects(declared), ['content/wiki/y.md']);
  const proseOnly = queueRepair('fix the link in content/wiki/x.md', null);
  assert.deepEqual(candidateSubjects(proseOnly), []);
  const rawSubject = {
    source: 'queue',
    type: 'repair',
    title: 'a queue entry',
    target: null,
    raw: { subject: 'content/wiki/z.md', type: 'repair' },
  };
  assert.deepEqual(candidateSubjects(rawSubject), ['content/wiki/z.md']);
  // The prose-only candidate must not ride the x.md order it names.
  const xItem = queueRepair('declared x work', 'content/wiki/x.md');
  const { orders } = bundleWorkOrders([xItem, proseOnly], {
    cfg: CFG,
    measure: () => 1000,
  });
  assert.equal(orders.length, 2);
  const proseOrder = orders.find((o) => o.items.includes(proseOnly));
  assert.match(proseOrder.key, /cohort:/);
});

test('task 53: pathless candidates cohere on category plus source cohort', () => {
  const q1 = { source: 'queue', type: 'repair', title: 'new checklist a', estimatedBytes: 1000 };
  const q2 = { source: 'queue', type: 'repair', title: 'new checklist b', estimatedBytes: 1000 };
  const p1 = {
    source: 'proposal',
    type: 'repair',
    slug: 'an-idea',
    title: 'An idea',
    estimatedBytes: 1000,
  };
  assert.equal(
    coherenceKey(q1, { category: 'upkeep' }),
    coherenceKey(q2, { category: 'upkeep' }),
  );
  assert.notEqual(
    coherenceKey(q1, { category: 'upkeep' }),
    coherenceKey(p1, { category: 'upkeep' }),
  );
  const { orders, refusals } = bundleWorkOrders([q1, q2, p1], {
    cfg: CFG,
    measure: () => null,
  });
  assert.equal(refusals.length, 0);
  assert.equal(orders.length, 2);
  const pair = orders.find((o) => o.items.length === 2);
  assert.deepEqual(pair.items, [q1, q2]);
});

test('task 53: max_items 4 and max_subjects 4 bound the bundle; config overrides defaults', () => {
  assert.deepEqual(workOrderBounds(null), {
    maxItems: 4,
    maxSubjects: 4,
    maxReviewedBytes: 60000,
    maxReviewedBytesPerSubject: 30000,
  });
  assert.deepEqual(WORK_ORDER_DEFAULTS.maxItems, 4);
  assert.deepEqual(WORK_ORDER_DEFAULTS.maxSubjects, 4);
  // Five coherent small candidates exceed max_items: 4 + 1, none dropped.
  const five = [1, 2, 3, 4, 5].map((n) => queueRepair(`fix ${n}`, 'content/wiki/model/x.md'));
  const split = bundleWorkOrders(five, { cfg: CFG, measure: () => 1000 });
  assert.equal(split.orders.length, 2);
  assert.deepEqual(split.orders.map((o) => o.items.length), [4, 1]);
  // Candidates sharing a primary but ranging over five distinct subjects
  // exceed max_subjects and open a second order.
  const wide = ['s1', 's2', 's3', 's4', 's5'].map((s) => ({
    source: 'queue',
    type: 'repair',
    title: `touch ${s}`,
    subjects: ['p', s],
  }));
  const wideResult = bundleWorkOrders(wide, { cfg: CFG, measure: () => 100 });
  assert.equal(wideResult.orders.length, 2);
  assert.equal(wideResult.orders[0].subjects.length, 4);
  assertWithinBounds(wideResult.orders, workOrderBounds(CFG));
  // A work_order block is honoured when present.
  const cfg2 = { ...CFG, work_order: { max_items: 2 } };
  assert.equal(workOrderBounds(cfg2).maxItems, 2);
  assert.equal(workOrderBounds(cfg2).maxSubjects, 4);
  const trio = [1, 2, 3].map((n) => queueRepair(`fix ${n}`, 'content/wiki/model/x.md'));
  const custom = bundleWorkOrders(trio, { cfg: cfg2, measure: () => 1000 });
  assert.deepEqual(custom.orders.map((o) => o.items.length), [2, 1]);
  // A present-but-meaningless bound fails loudly instead of unbounding.
  assert.throws(
    () => workOrderBounds({ work_order: { max_items: 0 } }),
    /work_order\.max_items must be a positive number/,
  );
});

test('row 53 conformance: two proposal-shaped candidates with fm subjects {A,B} and {A,C} cohere on the shared sorted-first subject', () => {
  // The post-fix emitter shape: the candidate carries its parsed front matter
  // (proposals.mjs attaches `fm`), and candidateSubjects reads (and SORTS)
  // fm.subjects — so the shared anchor must sort FIRST in BOTH items' lists
  // (`content/wiki/event/…` sorts before `content/wiki/model/…`), because the
  // coherence key reads the normalized list's subjects[0].
  const proposalWith = (slug, subjects) => ({
    source: 'proposal',
    type: 'repair',
    slug,
    path: join(tmpdir(), 'atai-proposals', `${slug}.md`),
    ageDays: 5,
    expires: '2026-09-14',
    discardedAttempts: 0,
    preempts: false,
    title: `Proposal ${slug}`,
    detail: `Proposal ${slug}\n\nBody.`,
    evidence: null,
    issues: [],
    fm: { slug, subjects },
  });
  const item1 = proposalWith('anchor-defect-b', [
    'content/wiki/model/defect-b.md',
    'content/wiki/event/shared-anchor.md',
  ]);
  const item2 = proposalWith('anchor-defect-c', [
    'content/wiki/model/defect-c.md',
    'content/wiki/event/shared-anchor.md',
  ]);
  const cat = { category: 'upkeep' };
  // The anchor sorts first in BOTH normalized lists — the D6 key's subjects[0].
  assert.deepEqual(candidateSubjects(item1), [
    'content/wiki/event/shared-anchor.md',
    'content/wiki/model/defect-b.md',
  ]);
  assert.equal(
    coherenceKey(item1, cat),
    `upkeep\nsubject:content/wiki/event/shared-anchor.md`,
  );
  assert.deepEqual(coherenceKey(item2, cat), coherenceKey(item1, cat));

  const { orders, refusals } = bundleWorkOrders([item1, item2], {
    cfg: CFG,
    measure: (subject) => (subject === 'content/wiki/event/shared-anchor.md' ? 5000 : 8000),
  });
  assert.equal(refusals.length, 0);
  assert.equal(orders.length, 1, 'the pair bundles into ONE work order');
  assert.equal(orders[0].items.length, 2);
  // Sorted union of every item's subjects — the O10 contract.
  assert.deepEqual(orders[0].subjects, [
    'content/wiki/event/shared-anchor.md',
    'content/wiki/model/defect-b.md',
    'content/wiki/model/defect-c.md',
  ]);
});

test('row 53 conformance: declarationFromOrder puts proposal fm subjects into items and the sorted union', () => {
  const candidate = {
    source: 'proposal',
    type: 'repair',
    slug: 'carries-fm',
    path: join(tmpdir(), 'atai-proposals', 'carries-fm.md'),
    ageDays: 5,
    expires: null,
    discardedAttempts: 0,
    preempts: false,
    title: 'Carries fm',
    detail: 'Body.',
    evidence: null,
    issues: [],
    fm: { slug: 'carries-fm', subjects: ['content/wiki/model/defect-b.md', 'content/wiki/model/shared-anchor.md'] },
  };
  const item = workOrderItemForCandidate(candidate);
  assert.deepEqual(item.subjects, [
    'content/wiki/model/defect-b.md',
    'content/wiki/model/shared-anchor.md',
  ]);
  assert.deepEqual(item.origin, { kind: 'proposal', slug: 'carries-fm', path: join(tmpdir(), 'atai-proposals', 'carries-fm.md').replace(/\\/g, '/') });
  const decl = declarationFromOrder({ items: [candidate], governingType: 'repair' });
  assert.deepEqual(decl.declared_subjects, [
    'content/wiki/model/defect-b.md',
    'content/wiki/model/shared-anchor.md',
  ]);
});

