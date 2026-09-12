/**
 * Task 55 (amended) — `.job/source.json` gains `items` and `declared_subjects`.
 *
 * Selection commits one work-order item (bead, type, subjects, reason) plus
 * the union `declared_subjects` before any executor runs. Subjects come from
 * declared metadata only (`candidateSubjects`, task 53) — never the brief
 * text, so a prohibition naming a path authorises nothing, and `reason`
 * prose is provenance only that no consumer substring-matches. The amended
 * refusal is scoped: a missing or empty committed declaration refuses ONLY
 * where the merged diff carries content paths (naming them); a merge with no
 * content paths binds nothing, logs, and merges. Branches selected before
 * this task (neither key present) complete under the old single-item contract
 * with no refusal and no graph arm. The committed declaration is the sole
 * subject source the graph annex reads; old-contract reads as null (no
 * annex, no sidecar, no marker).
 *
 * Fixtures are throwaway repositories in the OS temp directory with real git
 * plumbing. No test pushes anywhere; every history assertion reads the
 * fixture's own branches, every working-tree divergence assertion reads the
 * uncommitted file. No live index is written.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

import {
  buildWorkOrderDeclaration,
  checkCommittedDeclaration,
  declarationMergeDecision,
  declaredSubjectsForAnnex,
  isOldContractSource,
  workOrderItemForCandidate,
} from '../run.mjs';
import { candidateSubjects } from '../lib/select.mjs';
import { readCommittedJobSource } from '../lib/resume.mjs';
import { runLoop } from '../run.mjs';
import {
  git,
  makeRepo,
  mockCommand,
  plantJobBranch,
  runnersYaml,
  writeLedger,
  writeQueue,
} from './helpers.mjs';

const NOW = new Date('2026-09-12T12:00:00.000Z');

function queueRepair(title, target, extra = {}) {
  return { source: 'queue', type: 'repair', title, target, ...extra };
}

function oldSource(id, type) {
  return (
    JSON.stringify(
      { job: id, type, source: 'directive', slug: null, path: null, issues: [] },
      null,
      2,
    ) + '\n'
  );
}

function newSource(id, type, declared) {
  const items = declared.map((s) => ({ bead: null, type, subjects: [s], reason: 'fixture' }));
  return (
    JSON.stringify(
      {
        job: id,
        type,
        source: 'queue',
        slug: null,
        path: null,
        issues: [],
        items,
        declared_subjects: [...declared],
      },
      null,
      2,
    ) + '\n'
  );
}

test('task 55: declaration comes from declared metadata only — prose never authorises', () => {
  const declared = queueRepair(
    'fix the link (do NOT touch content/wiki/forbidden.md)',
    'content/wiki/model/x.md',
  );
  assert.deepEqual(candidateSubjects(declared), ['content/wiki/model/x.md']);
  const built = buildWorkOrderDeclaration(declared);
  assert.equal(built.items.length, 1, `expected 1 item, got ${built.items.length}`);
  assert.deepEqual(built.items[0].subjects, ['content/wiki/model/x.md']);
  assert.deepEqual(built.declared_subjects, ['content/wiki/model/x.md']);
  assert.ok(
    !built.declared_subjects.includes('content/wiki/forbidden.md'),
    'a brief-prose prohibition authorises nothing',
  );

  const proseOnly = queueRepair('fix the link in content/wiki/model/x.md', null);
  assert.deepEqual(candidateSubjects(proseOnly), []);
  const builtProse = buildWorkOrderDeclaration(proseOnly);
  assert.equal(builtProse.items.length, 1, `expected 1 item, got ${builtProse.items.length}`);
  assert.deepEqual(builtProse.items[0].subjects, []);
  assert.deepEqual(builtProse.declared_subjects, []);
});

test('task 55: a proposal file pointer never becomes a subject; front-matter subjects do', () => {
  const proposal = {
    source: 'proposal',
    type: 'repair',
    slug: 'an-idea',
    title: 'An idea about content/wiki/model/x.md',
    path: 'data/proposals/an-idea.md',
  };
  assert.deepEqual(candidateSubjects(proposal), []);
  assert.deepEqual(buildWorkOrderDeclaration(proposal).declared_subjects, []);

  const withFm = {
    source: 'proposal',
    type: 'repair',
    slug: 'an-idea',
    title: 'An idea',
    path: 'data/proposals/an-idea.md',
    fm: { subjects: ['content/wiki/model/y.md'] },
  };
  assert.deepEqual(candidateSubjects(withFm), ['content/wiki/model/y.md']);
  assert.deepEqual(buildWorkOrderDeclaration(withFm).declared_subjects, [
    'content/wiki/model/y.md',
  ]);
});

test('task 55: one item carries bead, type, subjects and reason; the union is sorted', () => {
  const candidate = {
    source: 'queue',
    type: 'repair',
    title: 'fix two links',
    subjects: ['content/wiki/b.md', 'content/wiki/a.md', 'content/wiki/a.md'],
    bead: null,
  };
  const item = workOrderItemForCandidate(candidate);
  assert.equal(item.type, 'repair');
  assert.deepEqual(item.subjects, ['content/wiki/a.md', 'content/wiki/b.md']);
  assert.equal(typeof item.reason, 'string');
  assert.ok(item.reason.length > 0, 'reason carries provenance');
  assert.equal(item.bead, null, 'no bead minted yet — null, never guessed');

  const built = buildWorkOrderDeclaration(candidate);
  assert.equal(built.items.length, 1, `expected 1 item, got ${built.items.length}`);
  assert.deepEqual(built.declared_subjects, ['content/wiki/a.md', 'content/wiki/b.md']);
});

test('task 55: old-contract detection and the annex sole source', () => {
  assert.equal(isOldContractSource(null), true);
  assert.equal(isOldContractSource({}), true);
  assert.equal(
    isOldContractSource({ job: 'j-x', type: 'repair', source: 'directive', issues: [] }),
    true,
    'pre-task-55 records carry neither key',
  );
  assert.equal(
    isOldContractSource({ items: [], declared_subjects: [] }),
    false,
    'both keys present (even empty) is new-contract, not old',
  );
  assert.equal(
    isOldContractSource({ items: [{ bead: null }], declared_subjects: ['content/wiki/a.md'] }),
    false,
  );
  // Present-but-malformed fails closed: a key present without an array is not
  // old, so it reaches the declaration check and refuses rather than passing.
  assert.equal(isOldContractSource({ items: 'corrupt' }), false);
  assert.equal(isOldContractSource({ declared_subjects: 'corrupt' }), false);
  assert.equal(
    isOldContractSource({ items: 'corrupt', declared_subjects: ['content/wiki/a.md'] }),
    false,
  );

  // Old-contract reads as null: no annex, no sidecar, no marker.
  assert.equal(declaredSubjectsForAnnex(null), null);
  assert.equal(
    declaredSubjectsForAnnex({ job: 'j-x', type: 'repair', issues: [] }),
    null,
  );
  // New-contract reads verbatim as a copy, never the brief text.
  const source = {
    items: [{ bead: null, type: 'repair', subjects: ['content/wiki/a.md'], reason: 'r' }],
    declared_subjects: ['content/wiki/a.md'],
  };
  const annex = declaredSubjectsForAnnex(source);
  assert.deepEqual(annex, ['content/wiki/a.md']);
  annex.push('content/wiki/injected.md');
  assert.deepEqual(
    source.declared_subjects,
    ['content/wiki/a.md'],
    'the annex copy must not alias the committed record',
  );
});

test('task 55: missing or empty committed declaration refuses; old passes', () => {
  const old = { job: 'j-old', type: 'repair', source: 'directive', issues: [] };
  const oldCheck = checkCommittedDeclaration(old);
  assert.equal(oldCheck.ok, true, 'old-contract is not refused');
  assert.equal(oldCheck.oldContract, true);

  const good = {
    items: [{ bead: null, type: 'repair', subjects: ['content/wiki/a.md'], reason: 'r' }],
    declared_subjects: ['content/wiki/a.md'],
  };
  const goodCheck = checkCommittedDeclaration(good);
  assert.equal(goodCheck.ok, true);
  assert.equal(goodCheck.oldContract, false);
  assert.deepEqual(goodCheck.declared, ['content/wiki/a.md']);

  const emptyDeclared = {
    items: [{ bead: null, type: 'repair', subjects: [], reason: 'r' }],
    declared_subjects: [],
  };
  const emptyCheck = checkCommittedDeclaration(emptyDeclared);
  assert.equal(emptyCheck.ok, false, 'an empty union refuses');
  assert.match(emptyCheck.reason, /nothing to bind/);

  const emptyItems = { items: [], declared_subjects: [] };
  assert.equal(checkCommittedDeclaration(emptyItems).ok, false);

  const partial = { items: [{ bead: null, type: 'repair', subjects: [], reason: 'r' }] };
  const partialCheck = checkCommittedDeclaration(partial);
  assert.equal(
    partialCheck.ok,
    false,
    'one key present without the other is a partial write, not an old contract',
  );
  assert.match(partialCheck.reason, /nothing to bind/);

  const corruptItems = { items: 'corrupt', declared_subjects: [] };
  assert.equal(isOldContractSource(corruptItems), false);
  assert.equal(checkCommittedDeclaration(corruptItems).ok, false);
  const corruptDeclared = {
    items: [{ bead: null, type: 'repair', subjects: [], reason: 'r' }],
    declared_subjects: 'corrupt',
  };
  assert.equal(isOldContractSource(corruptDeclared), false);
  assert.equal(checkCommittedDeclaration(corruptDeclared).ok, false);
});

test('task 55 (amended): the refusal is gated on content paths in the diff', () => {
  const empty = {
    items: [{ bead: null, type: 'repair', subjects: [], reason: 'r' }],
    declared_subjects: [],
  };
  const good = {
    items: [{ bead: null, type: 'repair', subjects: ['content/wiki/a.md'], reason: 'r' }],
    declared_subjects: ['content/wiki/a.md'],
  };
  const old = { job: 'j-old', type: 'repair', source: 'directive', issues: [] };
  const content = ['content/wiki/model/fixture-model.md'];

  // Content diff + empty declaration refuses, naming the path.
  const refuse = declarationMergeDecision(empty, content);
  assert.equal(refuse.ok, false, 'a content diff with nothing declared refuses');
  assert.match(refuse.reason, /nothing to bind/);
  assert.match(refuse.reason, /content\/wiki\/model\/fixture-model\.md/);

  // No-content diff + empty declaration merges, binding nothing.
  const bindsNothing = declarationMergeDecision(empty, []);
  assert.equal(bindsNothing.ok, true);
  assert.equal(bindsNothing.bindsNothing, true);
  assert.deepEqual(bindsNothing.declared, []);

  // Content diff + good declaration passes this gate (subset is task 56).
  const pass = declarationMergeDecision(good, ['content/wiki/a.md']);
  assert.equal(pass.ok, true);
  assert.equal(pass.bindsNothing ?? false, false);
  assert.deepEqual(pass.declared, ['content/wiki/a.md']);

  // No-content diff + good declaration binds nothing and merges (code-only).
  const codeOnly = declarationMergeDecision(good, []);
  assert.equal(codeOnly.ok, true);
  assert.equal(codeOnly.bindsNothing, true);

  // Old-contract passes regardless of the diff, with no graph arm.
  assert.equal(declarationMergeDecision(old, content).ok, true);
  assert.equal(declarationMergeDecision(old, content).oldContract, true);
  assert.equal(declarationMergeDecision(old, []).ok, true);
});

test('task 55 (fixture): the committed declaration is read from history, not the working tree', async (t) => {
  const ctx = makeRepo({ now: () => NOW });
  t.after(() => ctx.cleanup());
  const id = 'j-20260912-01';
  plantJobBranch(ctx, id, {
    brief: '# a planted brief\n',
    files: { '.job/source.json': newSource(id, 'repair', ['content/wiki/a.md']) },
  });

  const committed = readCommittedJobSource(ctx.repoRoot, `job/${id}`);
  assert.deepEqual(committed.declared_subjects, ['content/wiki/a.md']);
  assert.deepEqual(declaredSubjectsForAnnex(committed), ['content/wiki/a.md']);

  // Diverge the working tree without committing: the history read must not move.
  const dir = join(ctx.testRoot, `diverge-${id}`);
  git(ctx.repoRoot, ['worktree', 'add', dir, `job/${id}`]);
  try {
    mkdirSync(join(dir, '.job'), { recursive: true });
    writeFileSync(
      join(dir, '.job', 'source.json'),
      newSource(id, 'repair', ['content/wiki/diverged.md']),
      'utf8',
    );
    const reread = readCommittedJobSource(ctx.repoRoot, `job/${id}`);
    assert.deepEqual(
      reread.declared_subjects,
      ['content/wiki/a.md'],
      'history, not the diverged working tree, is the source',
    );
    assert.deepEqual(declaredSubjectsForAnnex(reread), ['content/wiki/a.md']);
  } finally {
    git(ctx.repoRoot, ['worktree', 'remove', '--force', dir]);
  }

  // Old-contract branches read as no annex.
  const oldId = 'j-20260912-02';
  plantJobBranch(ctx, oldId, {
    brief: '# an old brief\n',
    files: { '.job/source.json': oldSource(oldId, 'repair') },
  });
  const oldCommitted = readCommittedJobSource(ctx.repoRoot, `job/${oldId}`);
  assert.equal(isOldContractSource(oldCommitted), true);
  assert.equal(declaredSubjectsForAnnex(oldCommitted), null);
  assert.equal(checkCommittedDeclaration(oldCommitted).ok, true);
});

test('task 55 (fixture): selection writes items and declared_subjects committed before any executor', async (t) => {
  const ctx = makeRepo({ now: () => NOW });
  t.after(() => ctx.cleanup());
  const id = 'j-20260912-03';
  const branch = plantJobBranch(ctx, id, { brief: '# selection-shaped brief\n', files: {} });
  void branch;

  // Simulate exactly what selection commits: items plus the union, one commit
  // named `job <id>: brief`, before any executor runs (no executor here at all).
  const candidate = queueRepair('fix the fixture link', 'content/wiki/model/fixture.md');
  const declaration = buildWorkOrderDeclaration(candidate);
  assert.equal(declaration.items.length, 1, `expected 1 item, got ${declaration.items.length}`);
  assert.deepEqual(declaration.declared_subjects, ['content/wiki/model/fixture.md']);

  const dir = join(ctx.testRoot, `select-${id}`);
  git(ctx.repoRoot, ['worktree', 'add', dir, `job/${id}`]);
  try {
    mkdirSync(join(dir, '.job'), { recursive: true });
    const payload = {
      job: id,
      type: 'repair',
      source: 'queue',
      slug: null,
      path: null,
      issues: [],
      items: declaration.items,
      declared_subjects: declaration.declared_subjects,
    };
    writeFileSync(join(dir, '.job', 'source.json'), `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
    git(dir, ['add', '-A']);
    git(dir, ['commit', '--quiet', '--no-verify', '-m', `job ${id}: brief`]);
    const back = readCommittedJobSource(ctx.repoRoot, `job/${id}`);
    assert.deepEqual(back.items.length, 1, `expected 1 committed item, got ${back.items.length}`);
    assert.deepEqual(back.declared_subjects, ['content/wiki/model/fixture.md']);
    assert.equal(back.items[0].type, 'repair');
    assert.deepEqual(back.items[0].subjects, ['content/wiki/model/fixture.md']);
  } finally {
    git(ctx.repoRoot, ['worktree', 'remove', '--force', dir]);
  }
});

test('task 55 (integration): content diff + empty declaration refuses, naming the path, after observing the commit at spawn', async (t) => {
  const ctx = makeRepo({
    now: () => NOW,
    runners: runnersYaml({
      command: mockCommand('declare-check-content'),
      reviewerCommand: mockCommand('review-approve'),
    }),
  });
  t.after(() => ctx.cleanup());
  writeQueue(ctx, [{ type: 'repair', title: 'subject-less upkeep with nothing declared' }]);
  writeLedger(ctx, []);

  const res = await runLoop(ctx, {
    runner: 'mock-frontier',
    reviewer: 'mock-reviewer',
    noGates: true,
  });
  assert.equal(res.outcome, 'failed', `expected failed, got ${res.outcome}\n${ctx.output()}`);
  assert.equal(res.mergedSha, null, 'a refused declaration merges nothing');
  assert.match(ctx.output(), /declared subjects: \(none declared/);
  assert.match(ctx.output(), /nothing to bind/);
  assert.match(ctx.output(), /content\/wiki\/model\/fixture-model\.md/);
  // Ordering: the author observed the committed declaration at spawn. The
  // marker is written by the executor into its worktree, which the loop
  // removes — so read it off the refused branch, where the work survives.
  const marker = (() => {
    try {
      const out = git(ctx.repoRoot, ['show', `${res.branch}:declare-check.txt`]);
      return String(out);
    } catch {
      return '';
    }
  })();
  assert.match(
    marker,
    /declaration at spawn: present items=1 declared=0/,
    `the brief commit preceded the executor spawn\n${ctx.output()}`,
  );
});

test('task 55 (integration): no-content diff + empty declaration merges, binding nothing', async (t) => {
  const ctx = makeRepo({
    now: () => NOW,
    runners: runnersYaml({
      command: mockCommand('done-edit'),
      reviewerCommand: mockCommand('review-approve'),
    }),
  });
  t.after(() => ctx.cleanup());
  writeQueue(ctx, [{ type: 'repair', title: 'subject-less upkeep with nothing declared' }]);
  writeLedger(ctx, []);

  const res = await runLoop(ctx, {
    runner: 'mock-frontier',
    reviewer: 'mock-reviewer',
    noGates: true,
  });
  assert.equal(res.outcome, 'done', `expected done, got ${res.outcome}\n${ctx.output()}`);
  assert.ok(res.mergedSha, 'a content-free merge lands');
  assert.match(ctx.output(), /binds nothing/);
  assert.doesNotMatch(ctx.output(), /refusing \(no merge\)/);
});

test('task 55 (integration): an old-contract branch completes with no declaration refusal', async (t) => {
  const ctx = makeRepo({
    now: () => NOW,
    runners: runnersYaml({
      command: mockCommand('done-edit'),
      reviewerCommand: mockCommand('review-approve'),
    }),
  });
  t.after(() => ctx.cleanup());
  const id = 'j-20260912-04';
  plantJobBranch(ctx, id, {
    brief: '# an old single-item brief\n',
    files: { '.job/source.json': oldSource(id, 'repair') },
  });
  writeLedger(ctx, []);
  writeQueue(ctx, []);

  const res = await runLoop(ctx, {
    runner: 'mock-frontier',
    reviewer: 'mock-reviewer',
    noGates: true,
  });
  assert.equal(res.jobId, id, `expected resumption of ${id}, got ${res.jobId}\n${ctx.output()}`);
  assert.match(ctx.output(), /old-contract branch/);
  assert.doesNotMatch(ctx.output(), /nothing to bind/);
  assert.equal(res.outcome, 'done', `expected done, got ${res.outcome}\n${ctx.output()}`);
});
