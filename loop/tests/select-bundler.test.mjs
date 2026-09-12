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

import {
  WORK_ORDER_DEFAULTS,
  WORK_ORDER_PATHLESS_ESTIMATE_BYTES,
  bundleWorkOrders,
  candidateReviewedBytes,
  candidateSubjects,
  coherenceKey,
  workOrderBounds,
} from '../lib/select.mjs';

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
  assert.equal(orders.length, 1);
  assert.deepEqual(orders[0].items, [small]);
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
