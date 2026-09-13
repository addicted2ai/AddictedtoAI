/**
 * proposal-consumed-per-item.test.mjs — Stage 2, task 66.
 *
 * Proposal consumption and directive marking run PER ITEM of a merged work
 * order, gated on the SAME per-item evidence task 56 requires: a measured
 * diff on the item's own subjects, OR `reviewed:` (read-and-unchanged)
 * coverage of them. A proposal (or directive) belonging to an item whose
 * evidence does not retire it is NOT consumed/marked; the graph never retires
 * or unretires alone — it reaches the gate only inside the retirement task 56
 * already computed (`retireWorkOrderItems`), and there is no unretire
 * anywhere. Implements: *A proposal a merged job consumed is retired* — the
 * retirement shape is `consumeProposal`'s existing one (move to
 * `data/proposals/consumed/`, note appended, record-never-a-block); nothing
 * new is invented and no second state exists.
 *
 * Reuse (not reimplemented): task-56 `retireWorkOrderItems` /
 * `checkMergeGraphScope` / `checkReviewedMerge` (`loop/run.mjs`),
 * `consumeProposal` (`loop/lib/proposals.mjs`), `markDirectiveDone`
 * (`loop/lib/directives.mjs`).
 *
 * FIXTURE POLICY (task 37, binding here): throwaway repositories with real
 * git plumbing; the merge-path graph seam (`opts.mergeGraphAnalysis`) stubbed,
 * never a live push or live index write. Copy-based mutants only: the named
 * mutation is a test-side copy of the ungated decision it replaces, so
 * nothing under test is edited and there is nothing to restore.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  checkMergeGraphScope,
  checkReviewedMerge,
  retireWorkOrderItems,
  runLoop,
} from '../run.mjs';
import {
  consumeProposal,
  consumedDir,
  perItemConsumptionPlan,
} from '../lib/proposals.mjs';
import { markDirectiveDone } from '../lib/directives.mjs';
import { readLedger } from '../lib/ledger.mjs';
import { writeRecordSubjects, writeVerdictRecord } from '../lib/review.mjs';
import {
  git,
  makeRepo,
  mockCommand,
  plantJobBranch,
  runnersYaml,
  writeLedger,
  writeQueue,
} from './helpers.mjs';

/** 2026-09-12, local by construction — the same pinned day the proposal tests use. */
const NOW = new Date(2026, 8, 12, 12, 0, 0);

const P1 = 'content/wiki/model/consume-one.md';
const P2 = 'content/wiki/model/consume-two.md';

const SPA = 'data/proposals/first-idea.md';
const SPB = 'data/proposals/second-idea.md';
const SLUG_A = 'first-idea';
const SLUG_B = 'second-idea';

const proposalText = (slug) =>
  `---\nslug: ${slug}\ntype: repair\ndate: 2026-09-12\nexpires: 2026-09-20\n---\n\n` +
  `A repair worth making, with evidence that has a shelf life.\n`;

/** One committed item with a proposal origin: subjects plus the file it came from. */
const proposalItem = (subjects, slug, path) => ({
  bead: null,
  type: 'repair',
  subjects: [...subjects],
  reason: `fixture ${slug}`,
  origin: { kind: 'proposal', slug, path },
});

/** One committed item with a directive origin: subjects plus the line it completes. */
const directiveItem = (subjects, lineNumber) => ({
  bead: null,
  type: 'repair',
  subjects: [...subjects],
  reason: `fixture line ${lineNumber}`,
  origin: { kind: 'directive', lineNumber },
});

const uni = (symbols = [], extra = {}) => ({ universe: true, symbols, risk: 'LOW', ...extra });
const presentAnalysis = (overrides = {}) => ({
  absent: false, partial: false, truncated: false, symbols: [], processes: [], subjects: {}, ...overrides,
});

/**
 * A planted two-item order whose committed `.job/source.json` carries the
 * per-item origins. The author writes exactly the paths `authorExtra` names,
 * so the merge measures one item's subjects and not the other's.
 */
function plantedOrder(
  t,
  id,
  { items, source, directives, authorExtra, authorMode = 'done-content-paths', declaredSubjects, sidecar = {} } = {},
) {
  const ctx = makeRepo({
    now: () => NOW,
    runners: runnersYaml({
      command: mockCommand(authorMode, authorExtra),
      reviewerCommand: mockCommand('review-approve'),
    }),
    directives,
    files: {
      [SPA]: proposalText(SLUG_A),
      [SPB]: proposalText(SLUG_B),
    },
  });
  t.after(() => ctx.cleanup());
  const committed = {
    job: id,
    type: 'repair',
    source: source ?? 'proposal',
    slug: source === 'directive' ? null : SLUG_A,
    path: source === 'directive' ? null : SPA,
    issues: [],
    items,
    declared_subjects:
      declaredSubjects !== undefined
        ? [...declaredSubjects]
        : [...new Set(items.flatMap((i) => i.subjects))].sort(),
  };
  plantJobBranch(ctx, id, {
    brief: '# a planted work-order brief\n',
    files: {
      '.job/source.json': `${JSON.stringify(committed, null, 2)}\n`,
      ...(Object.keys(sidecar).length
        ? {
            '.job/graph.json':
              `${JSON.stringify({ version: 1, index: 'brief-index:merge-base-tree', subjects: sidecar }, null, 2)}\n`,
          }
        : {}),
    },
  });
  writeLedger(ctx, []);
  writeQueue(ctx, []);
  return { ctx, committed };
}

/** Top-level proposals still selectable, and what landed in `consumed/`. */
const active = (ctx) =>
  (existsSync(ctx.proposalsDir) ? readdirSync(ctx.proposalsDir, { withFileTypes: true }) : [])
    .filter((e) => e.isFile())
    .map((e) => e.name)
    .sort();
const consumed = (ctx) => (existsSync(consumedDir(ctx)) ? readdirSync(consumedDir(ctx)).sort() : []);

const go = (ctx, extra = {}) =>
  runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', noGates: true, ...extra });

// ---------------------------------------------------------------------------

test('task 66 (merge): a two-item order retires only the retiring item\u2019s proposal; the open item\u2019s stays selectable', async (t) => {
  const id = 'j-20260912-51';
  // The author writes P1 only: item 0's own subject is measured, item 1's is
  // not. Task 59's hole closure demands the sidecar carry the diff-retired
  // subject's per-item evidence, so the planted branch carries it.
  const { ctx } = plantedOrder(t, id, {
    items: [proposalItem([P1], SLUG_A, SPA), proposalItem([P2], SLUG_B, SPB)],
    authorExtra: ` ${P1}`,
    sidecar: { [P1]: { symbols: ['s1'], callers: 1, processes: 0, risk: 'LOW', partial: false, truncated: false } },
  });
  const res = await go(ctx, {
    mergeGraphAnalysis: () =>
      presentAnalysis({
        symbols: [{ name: 's1', owner: P1 }],
        subjects: { [P1]: uni(['s1']), [P2]: uni([]) },
      }),
  });
  assert.equal(res.outcome, 'done', ctx.output());

  // THE SUCCESS HALF: the completed item's proposal IS retired — the
  // existing shape, exactly (`consumeProposal`'s move, note appended).
  assert.deepEqual(active(ctx), ['second-idea.md'], ctx.output());
  assert.equal(consumed(ctx).length, 1, consumed(ctx).join(', '));
  assert.match(consumed(ctx)[0], /^first-idea\.consumed-/);
  assert.match(ctx.output(), /retired the consumed proposal to .*consumed/);
  const note = readFileSync(join(consumedDir(ctx), consumed(ctx)[0]), 'utf8');
  assert.match(note, /## Consumed: this candidate produced merged work/);
  assert.match(note, new RegExp(`- job: ${id} \\(repair\\)`));
  assert.match(note, /record, never a block/);

  // THE GATE: the unretired item's proposal is NOT consumed — it stays
  // selectable, and the log says why.
  assert.match(
    ctx.output(),
    /the proposal `second-idea` was not consumed: its item \(2\) did not retire on the merge's per-item evidence/,
    ctx.output(),
  );
  assert.ok(existsSync(join(ctx.repoRoot, SPB)), 'the open item\u2019s proposal file was never moved');

  // Task 56's already-landed line: the ledger records the order partially done.
  assert.match(readLedger(ctx).at(-1).note, /partially done: retired 1 of 2 items/);
});

test('task 66 (merge): a retired item\u2019s directive line is marked; an unretired item\u2019s line is not', async (t) => {
  const id = 'j-20260912-52';
  const directives =
    '# DIRECTIVES.md\n\n- repair: fix the first item\n- repair: fix the second item\n';
  const { ctx } = plantedOrder(t, id, {
    items: [directiveItem([P1], 3), directiveItem([P2], 4)],
    source: 'directive',
    authorExtra: ` ${P1}`,
    sidecar: { [P1]: { symbols: ['s1'], callers: 1, processes: 0, risk: 'LOW', partial: false, truncated: false } },
  });
  const res = await go(ctx, {
    mergeGraphAnalysis: () =>
      presentAnalysis({
        symbols: [{ name: 's1', owner: P1 }],
        subjects: { [P1]: uni(['s1']), [P2]: uni([]) },
      }),
  });
  assert.equal(res.outcome, 'done', ctx.output());

  const lines = readFileSync(ctx.directivesPath, 'utf8').split(/\r?\n/);
  assert.match(lines[2], /\[done 2026-09-12 j-20260912-52\]/, `line 3 marked: ${lines[2]}`);
  assert.ok(!/\[done/.test(lines[3]), `line 4 stays open: ${lines[3]}`);
  assert.match(
    ctx.output(),
    /DIRECTIVES\.md line 4 \(item 2\) was not marked: its item did not retire on the merge's per-item evidence/,
    ctx.output(),
  );
  assert.match(ctx.output(), /DIRECTIVES\.md line 3 \(item 1\)/, ctx.output());
});

test('MUTATION consume-both: the ungated decision wrongly retires the open item\u2019s proposal and wrongly marks its directive', async (t) => {
  // Task 66's named mutation, copy-based: the pre-task-66 whole-job decision
  // — consume what the job was selected from on any merged done — widened to
  // the item list with the per-item evidence discarded. Every origin is
  // consumed and marked with `open: false` unconditionally. Nothing under
  // test is edited; the mutant is this test-side copy, driven through the
  // REAL mechanical functions so its wrong outcome lands on real files.
  const ORIGINS = [
    { index: 0, origin: { kind: 'proposal', slug: SLUG_A, path: SPA } },
    { index: 1, origin: { kind: 'proposal', slug: SLUG_B, path: SPB } },
  ];
  const DIRECTIVE_ORIGINS = [
    { index: 0, origin: { kind: 'directive', lineNumber: 3 } },
    { index: 1, origin: { kind: 'directive', lineNumber: 4 } },
  ];
  const makeUngated = (entries) =>
    entries.map((e) => ({ index: e.index, origin: e.origin, gated: false, open: false }));

  // (a) The proposals: both consumed when only item 0 was done.
  {
    const id = 'j-20260912-53';
    const { ctx, committed } = plantedOrder(t, id, {
      items: [proposalItem([P1], SLUG_A, SPA), proposalItem([P2], SLUG_B, SPB)],
      authorExtra: ` ${P1}`,
      sidecar: { [P1]: { symbols: ['s1'], callers: 1, processes: 0, risk: 'LOW', partial: false, truncated: false } },
    });
    // The SAME retirement the merge computed, through the production gate —
    // the real decision runLoop's approve path consults.
    const checked = checkMergeGraphScope({
      source: committed,
      declared: committed.declared_subjects,
      contentPaths: [P1],
      diffPaths: [P1],
      resultText: '',
      analysis: presentAnalysis({
        symbols: [{ name: 's1', owner: P1 }],
        subjects: { [P1]: uni(['s1']), [P2]: uni([]) },
      }),
      sidecar: { subjects: { [P1]: { symbols: ['s1'] } } },
    });
    assert.equal(checked.ok, true, checked.reason ?? '');
    assert.deepEqual(checked.retirement.retired.map((r) => r.index), [0]);
    assert.deepEqual(checked.retirement.open.map((o) => o.index), [1]);

    // THE MUTANT consumes both. The wrongly-retired proposal is the assertion
    // the authority names: under the ungated decision, item 1's proposal is
    // retired although the merge never measured its subject.
    for (const e of makeUngated(ORIGINS).filter((x) => x.origin.kind === 'proposal')) {
      consumeProposal(ctx, {
        path: join(ctx.repoRoot, e.origin.path),
        slug: e.origin.slug,
        jobId: id,
        jobType: 'repair',
        artifacts: [P1],
        mergedSha: 'mutant-sha',
        issues: [],
      });
    }
    assert.equal(consumed(ctx).length, 2, consumed(ctx).join(', '));
    assert.ok(
      consumed(ctx).some((n) => /^second-idea\.consumed-/.test(n)),
      `WRONGLY RETIRED under the mutant: ${consumed(ctx).join(', ')}`,
    );

    // The production plan on the SAME retirement refuses that half: item 1 is
    // open (and the gate is active), so nothing consumes its proposal.
    const plan = perItemConsumptionPlan(ORIGINS, checked.retirement);
    assert.equal(plan[0].open, false, 'the done item\u2019s proposal is consumed');
    assert.equal(plan[1].open, true, 'the open item\u2019s proposal is not');
    assert.equal(plan[1].gated, true, 'the gate is active — the mutant\u2019s consumption is the defect');
  }

  // (b) The directives: both lines marked when only item 0 was done.
  {
    const id = 'j-20260912-54';
    const { ctx } = plantedOrder(t, id, {
      items: [directiveItem([P1], 3), directiveItem([P2], 4)],
      source: 'directive',
      authorExtra: ` ${P1}`,
      sidecar: { [P1]: { symbols: ['s1'], callers: 1, processes: 0, risk: 'LOW', partial: false, truncated: false } },
    });
    for (const e of makeUngated(DIRECTIVE_ORIGINS).filter((x) => x.origin.kind === 'directive')) {
      markDirectiveDone(ctx, e.origin.lineNumber, id, '2026-09-12');
    }
    const lines = readFileSync(ctx.directivesPath, 'utf8').split(/\r?\n/);
    assert.match(lines[2], /\[done 2026-09-12 j-20260912-54\]/);
    assert.ok(
      /\[done 2026-09-12 j-20260912-54\]/.test(lines[3]),
      `WRONGLY MARKED under the mutant: line 4 carries the marker (${lines[3]})`,
    );
  }
});

test('task 66: graph evidence alone neither consumes an unretired item\u2019s proposal nor unretires a consumed one', () => {
  // Two items, each carrying a proposal origin. The graph is PRESENT and rich
  // — symbols, universes, everything — but the merge measured NO diff and
  // names NO reviewed coverage. Task 56's retirement leaves both items open;
  // the gate therefore consumes nothing, and nothing anywhere moves an
  // already-consumed record back.
  const committed = {
    job: 'j-fixture',
    type: 'repair',
    source: 'proposal',
    slug: SLUG_A,
    path: SPA,
    issues: [],
    items: [proposalItem([P1], SLUG_A, SPA), proposalItem([P2], SLUG_B, SPB)],
    declared_subjects: [P1, P2],
  };
  const graphAlone = checkMergeGraphScope({
    source: committed,
    declared: committed.declared_subjects,
    contentPaths: [],
    diffPaths: [],
    resultText: '',
    analysis: presentAnalysis({
      symbols: [
        { name: 's1', owner: P1 },
        { name: 's2', owner: P2 },
      ],
      subjects: { [P1]: uni(['s1']), [P2]: uni(['s2']) },
    }),
    sidecar: null,
  });
  assert.equal(graphAlone.ok, true, graphAlone.reason ?? '');
  assert.deepEqual(graphAlone.retirement.retired, [], 'the graph never retires alone');
  assert.equal(graphAlone.retirement.open.length, 2, 'both items stay open');

  const plan = perItemConsumptionPlan(ORIGINS44(), graphAlone.retirement);
  assert.ok(plan.every((e) => e.open === true && e.gated === true), JSON.stringify(plan));
  assert.equal(plan.filter((e) => !e.open).length, 0, 'the consumption loop consumes nothing');

  // The same graph answer against an ALREADY-CONSUMED proposal: the record
  // stays exactly where consumption wrote it, and no active file reappears —
  // there is no graph-driven unretire, and no unretire anywhere.
  const ctx = makeRepo({
    now: () => NOW,
    files: {
      [SPA]: proposalText(SLUG_A),
      'data/proposals/consumed/second-idea.consumed-20260912T120000.md': proposalText(SLUG_B),
    },
  });
  const again = perItemConsumptionPlan(ORIGINS44(), graphAlone.retirement);
  assert.ok(again.every((e) => e.open === true), JSON.stringify(again));
  assert.ok(
    existsSync(join(ctx.repoRoot, 'data/proposals/consumed/second-idea.consumed-20260912T120000.md')),
    'the consumed record stays retired',
  );
  assert.ok(!existsSync(join(ctx.repoRoot, SPB)), 'and nothing re-materializes it');
  assert.deepEqual(active(ctx), ['first-idea.md'], 'the unretired proposal stays selectable');
});

/** The per-item origins a two-proposal-item record carries. */
const ORIGINS44 = () => [
  { index: 0, origin: { kind: 'proposal', slug: SLUG_A, path: SPA } },
  { index: 1, origin: { kind: 'proposal', slug: SLUG_B, path: SPB } },
];

test('task 66: the reviewed leg gates per item too — covered item consumed, uncovered item not', () => {
  // The second evidence leg: a `reviewed:` outcome whose read-and-unchanged
  // coverage retires item 0 and not item 1 (coverage must cover EVERY one of
  // an item's subjects). Same gate, same plan, same one-way move.
  const P1r = 'content/wiki/model/consume-review-one.md';
  const ctx = makeRepo({
    now: () => NOW,
    files: {
      [SPA]: proposalText(SLUG_A),
      [SPB]: proposalText(SLUG_B),
    },
  });
  const writePage = (body) => {
    mkdirSync(join(ctx.repoRoot, P1r, '..'), { recursive: true });
    writeFileSync(
      join(ctx.repoRoot, P1r),
      `---\ntitle: reviewed fixture\n---\n\n${body}\n`,
      'utf8',
    );
  };
  writePage('the approved version');
  git(ctx.repoRoot, ['add', '-A']);
  git(ctx.repoRoot, ['commit', '--quiet', '--no-verify', '-m', 'fixture: pages']);
  const rec = writeVerdictRecord(ctx, 'j-20260912-55', {
    verdict: 'approve',
    wouldCite: 'a reader checking dates would cite this',
    notes: 'fixture approval',
  });
  const wrote = writeRecordSubjects(rec, [P1r], { repoRoot: ctx.repoRoot });
  assert.equal(wrote.ok, true, `fixture record binds: ${wrote.why ?? ''}`);
  git(ctx.repoRoot, ['add', '-A']);
  git(ctx.repoRoot, ['commit', '--quiet', '--no-verify', '-m', 'fixture: the approving record']);
  writePage('an edit nobody reviewed');
  git(ctx.repoRoot, ['add', '-A']);
  git(ctx.repoRoot, ['commit', '--quiet', '--no-verify', '-m', 'fixture: later edits']);
  const base = git(ctx.repoRoot, ['rev-parse', 'HEAD']).trim();

  const committed = {
    job: 'j-20260912-55',
    type: 'repair',
    source: 'proposal',
    slug: SLUG_A,
    path: SPA,
    issues: [],
    items: [proposalItem([P1r], SLUG_A, SPA), proposalItem([P2], SLUG_B, SPB)],
    declared_subjects: [P1r, P2],
  };
  const checked = checkReviewedMerge({
    repoRoot: ctx.repoRoot,
    base,
    source: committed,
    reviewedPaths: [P1r],
    contentPaths: [],
    diffPaths: [],
    resultText: `reviewed: ${P1r}\n`,
    analysis: presentAnalysis({ subjects: { [P1r]: { universe: false }, [P2]: { universe: false } } }),
    sidecar: null,
  });
  assert.equal(checked.ok, true, checked.reason ?? '');
  const reviewed = checked.retirement.retired.filter((r) => r.via === 'reviewed');
  assert.deepEqual(reviewed.map((r) => r.index), [0], 'item 0 retires on reviewed coverage');
  assert.deepEqual(checked.retirement.open.map((o) => o.index), [1], 'item 1 has no coverage');

  const plan = perItemConsumptionPlan(ORIGINS44(), checked.retirement);
  assert.equal(plan[0].open, false, 'the covered item\u2019s proposal is consumed');
  assert.equal(plan[1].open, true, 'the uncovered item\u2019s proposal is not');
  for (const e of plan.filter((x) => x.origin.kind === 'proposal' && !x.open)) {
    const moved = consumeProposal(ctx, {
      path: join(ctx.repoRoot, e.origin.path),
      slug: e.origin.slug,
      jobId: 'j-20260912-55',
      jobType: 'repair',
      artifacts: [P1r],
      mergedSha: 'fixture-sha',
      issues: [],
    });
    assert.equal(moved.moved, true, moved.why);
  }
  assert.deepEqual(active(ctx), ['second-idea.md'], ctx.output());
  assert.equal(consumed(ctx).length, 1, consumed(ctx).join(', '));
  assert.match(consumed(ctx)[0], /^first-idea\.consumed-/);
});

test('task 66: an unattributable origin with the gate active fails closed — nothing is consumed', () => {
  // A proposal origin with NO item index cannot be joined to any item's
  // evidence. With the gate active, unattributable fails closed: the
  // proposal is not consumed, and never guessed at.
  const plan = perItemConsumptionPlan(
    [{ index: null, origin: { kind: 'proposal', slug: SLUG_A, path: SPA } }],
    { retired: [], open: [], partiallyDone: false, note: null },
  );
  assert.equal(plan.length, 1);
  assert.equal(plan[0].open, true, 'unattributable with the gate active is open, never consumed');
  assert.equal(plan[0].gated, true);

  // And the retirement itself: both declaration keys present is new-contract
  // (the `oldContract` key is never set on that shape), so the gate arms —
  // an empty items list retires nothing and leaves nothing open.
  const gated = retireWorkOrderItems(
    { job: 'j-fixture', type: 'repair', source: 'proposal', items: [], declared_subjects: [] },
    { diffPaths: [] },
  );
  assert.equal(gated.oldContract, undefined);
  assert.deepEqual(gated.retired, []);
  assert.deepEqual(gated.open, []);
});

test('task 66 FIX-1 (merge): with the gate inactive, a merged done consumes only the origin the job was selected from', async (t) => {
  // The gate INACTIVE through the REAL merged-done path: the author writes
  // only a non-content file, so the merged diff carries no content paths, and
  // the committed declaration is empty — the merge binds nothing with an
  // empty declaration, computes NO per-item retirement (`retirement ===
  // null` in the plan), and pre-FIX-1 the merged done consumed EVERY
  // committed origin here. The whole-job rule consumes only what the job was
  // selected from: the record's own proposal origin (slug A).
  const id = 'j-20260912-56';
  const { ctx } = plantedOrder(t, id, {
    items: [proposalItem([P1], SLUG_A, SPA), proposalItem([P2], SLUG_B, SPB)],
    authorExtra: ' notes.txt',
    declaredSubjects: [],
  });
  const res = await go(ctx, {});
  assert.equal(res.outcome, 'done', ctx.output());
  assert.match(ctx.output(), /binds nothing: merged diff carries no content paths/, ctx.output());

  // The whole-job fallback origin IS consumed — the existing shape, exactly
  // (`consumeProposal`'s one-way move, note appended).
  assert.deepEqual(active(ctx), ['second-idea.md'], ctx.output());
  assert.equal(consumed(ctx).length, 1, consumed(ctx).join(', '));
  assert.match(consumed(ctx)[0], /^first-idea\.consumed-/);
  assert.match(ctx.output(), /retired the consumed proposal to .*consumed/);

  // THE FIX: every other origin is open — not consumed, the file was never
  // moved, and the loud log names it in the same voice as the gate-active
  // open log.
  assert.ok(existsSync(join(ctx.repoRoot, SPB)), 'the non-selected proposal file was never moved');
  assert.match(
    ctx.output(),
    /the proposal `second-idea` was not consumed: the merge computed no per-item evidence and this job was not selected from it/,
    ctx.output(),
  );
  assert.doesNotMatch(ctx.output(), /its item \(2\) did not retire/, 'the gate-active voice must not fire with the gate inactive');
});

test('task 66 FIX-1 (gate inactive): a directive job marks only its own line; the other line stays open', async (t) => {
  // The same gate-inactive shape on the directive half, driven through the
  // production plan plus the same marking shape the merged-done block uses
  // (`markDirectiveDone` for every closed entry), mirroring the graph-alone
  // test's style. The real merge path cannot carry this scenario: a resumed
  // run's synthetic job carries no lineNumber, so the caller's whole-job
  // fallback is null there and consumes nothing (asserted below) — the plan
  // is the one place the two-origin directive order and the job's own line
  // number can be exercised together.
  const ctx = makeRepo({
    now: () => NOW,
    directives: '# DIRECTIVES.md\n\n- repair: fix the first item\n- repair: fix the second item\n',
  });
  t.after(() => ctx.cleanup());
  const DIRECTIVE_ORIGINS = [
    { index: 0, origin: { kind: 'directive', lineNumber: 3 } },
    { index: 1, origin: { kind: 'directive', lineNumber: 4 } },
  ];
  const plan = perItemConsumptionPlan(DIRECTIVE_ORIGINS, null, { kind: 'directive', lineNumber: 3 });
  assert.equal(plan.length, 2);
  assert.equal(plan[0].open, false, 'the job\u2019s own line is consumed/marked');
  assert.equal(plan[0].gated, false, 'the gate is inactive — the whole-job rule, not per-item evidence');
  assert.equal(plan[1].open, true, 'the other directive origin stays open');
  assert.equal(plan[1].gated, false);
  for (const e of plan.filter((x) => x.origin.kind === 'directive' && !x.open)) {
    markDirectiveDone(ctx, e.origin.lineNumber, 'j-20260912-57', '2026-09-12');
  }
  const lines = readFileSync(ctx.directivesPath, 'utf8').split(/\r?\n/);
  assert.match(lines[2], /\[done 2026-09-12 j-20260912-57\]/, `line 3 marked: ${lines[2]}`);
  assert.ok(!/\[done/.test(lines[3]), `line 4 stays open: ${lines[3]}`);

  // And a null fallback with the gate inactive consumes NOTHING — no fallback,
  // no whole-job attribution, nothing consumed or marked.
  const nothing = perItemConsumptionPlan(DIRECTIVE_ORIGINS, null, null);
  assert.ok(nothing.every((e) => e.open === true), JSON.stringify(nothing));

  // And with the gate ACTIVE the fallback is never consulted: the same two
  // origins against a retirement that retires only item 0 behave exactly as
  // they did before FIX-1, whatever the fallback names.
  const gated = perItemConsumptionPlan(
    DIRECTIVE_ORIGINS,
    { retired: [{ index: 0 }], open: [{ index: 1 }], partiallyDone: true, note: null },
    { kind: 'directive', lineNumber: 4 },
  );
  assert.equal(gated[0].open, false, 'the retired item\u2019s line is marked');
  assert.equal(gated[1].open, true, 'the open item\u2019s line is not');
});
