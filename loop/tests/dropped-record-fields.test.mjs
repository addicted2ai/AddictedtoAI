/**
 * dropped-record-fields.test.mjs — beads addictedtoai-fyd3: the scout's
 * drop-record requirement gets a mechanism.
 *
 * specs/loop: "What the scout declines SHALL be recorded, never silently
 * dropped: each considered-and-declined story becomes one record in
 * `data/proposals/dropped/`, naming which test it failed and what would make it
 * worth refiling." Measured 2026-08-31 across all ten records then in the tree,
 * and again 2026-09-06 across all forty-six: every one complies and none was
 * ever validated by any code path. A requirement with no implementation task
 * and no check is invisible twice over — a literal implementer never builds it
 * and the integrated check passes without it.
 *
 * The tests below attempt the silent record and measure what happens, and each
 * refusal carries its positive control: a guard that also refused the records
 * the corpus already holds would be worse than no guard.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { runLoop } from '../run.mjs';
import { addedDroppedRecordPaths, applyProposalMergeRules, dropRecordProblems } from '../lib/proposals.mjs';
import { makeRepo, writeQueue, runnersYaml, HERE } from './helpers.mjs';

const PMOCK = join(HERE, 'mock-proposal-executor.mjs').replace(/\\/g, '/');
const pmock = (mode) => `node "${PMOCK}" ${mode} "{prompt_file}"`;

// The two shapes the corpus actually uses, both of which must pass.
const KEYED =
  '---\nslug: zai-glm-flash-latest-alias\ndate: 2026-09-02\nstatus: declined\n' +
  "failed_test: worth a stranger's attention (would-send)\n---\n\n" +
  '## Which test it failed, and why\n\nAn alias row is a router convenience.\n\n' +
  '## What would make it worth refiling\n\n- Z.ai documents what the pointer tracks.\n';
const PROSE =
  '---\nslug: considered-and-declined\ndate: 2026-09-10\n---\n\n## Dropped\n\n' +
  "- failed test: not worth a stranger's attention\n- refile when: the vendor confirms the figure\n";

// ---------------------------------------------------------------------------
// dropRecordProblems — the pure check
// ---------------------------------------------------------------------------

test('POSITIVE CONTROL — both shapes the corpus uses carry all three and are not refused', () => {
  assert.deepEqual(dropRecordProblems(KEYED), []);
  assert.deepEqual(dropRecordProblems(PROSE), []);
});

test('every drop record in this repository passes unchanged', () => {
  // The guard's whole claim is that it refuses nothing that exists. Measured
  // against the real directory — resolved from this file, never from the
  // process's working directory — because a fixture cannot make that claim.
  const dir = join(HERE, '..', '..', 'data', 'proposals', 'dropped');
  if (!existsSync(dir)) return; // a checkout without the data layer proves nothing either way
  const names = readdirSync(dir).filter((n) => n.endsWith('.md') && n !== 'README.md');
  assert.ok(names.length >= 10, `expected the real corpus, found ${names.length} records`);
  const bad = names
    .map((n) => [n, dropRecordProblems(readFileSync(join(dir, n), 'utf8'))])
    .filter(([, p]) => p.length);
  assert.deepEqual(bad, [], 'a guard that refuses the existing corpus is refusing the wrong thing');
});

test('a record naming no failed test is refused', () => {
  const problems = dropRecordProblems('---\nslug: x\n---\n\n## What would make it worth refiling\n\n- more.\n');
  assert.equal(problems.length, 1);
  assert.match(problems[0], /which test it failed/);
});

test('a record naming no refile condition is refused', () => {
  const problems = dropRecordProblems('---\nslug: x\nfailed_test: not checkable\n---\n\nI declined it.\n');
  assert.equal(problems.length, 1);
  assert.match(problems[0], /worth refiling/);
});

test('a record with no slug is refused', () => {
  const problems = dropRecordProblems(PROSE.replace('slug: considered-and-declined\n', ''));
  assert.deepEqual(problems, ['no non-empty `slug`']);
});

test('the empty file — the record nothing was ever checking for — is refused on all three counts', () => {
  assert.equal(dropRecordProblems('').length, 3);
  assert.equal(dropRecordProblems('---\n---\n').length, 3);
});

test('a blank field is not an answer: `failed_test:` with nothing after it is refused', () => {
  const problems = dropRecordProblems('---\nslug: x\nfailed_test: ""\n---\n\n## Refiling\n\nsomething\n');
  assert.equal(problems.length, 1);
  assert.match(problems[0], /which test it failed/);
});

test('the boilerplate footer alone does not count as a refile condition', () => {
  // Every record and every loop-written drop note ends "so this may be
  // refiled." A guard satisfied by that sentence would be satisfied by every
  // file it is meant to refuse.
  const problems = dropRecordProblems(
    '---\nslug: x\nfailed_test: not checkable\n---\n\n' +
      '`data/proposals/dropped/` is a record, never a block, so this may be refiled.\n',
  );
  assert.equal(problems.length, 1);
  assert.match(problems[0], /worth refiling/);
});

// ---------------------------------------------------------------------------
// addedDroppedRecordPaths — what is measured, and what is not
// ---------------------------------------------------------------------------

test('only ADDED files directly under dropped/ are measured', () => {
  const changed = [
    { path: 'data/proposals/dropped/added.md', status: 'A' },
    { path: 'data/proposals/dropped/edited.md', status: 'M' },
    { path: 'data/proposals/dropped/gone.md', status: 'D' },
    { path: 'data/proposals/dropped/README.md', status: 'A' },
    { path: 'data/proposals/dropped/deeper/nested.md', status: 'A' },
    { path: 'data/proposals/top-level.md', status: 'A' },
    { path: 'data/proposals/rejected/rejected.md', status: 'A' },
    { path: 'content/blog/post.md', status: 'A' },
  ];
  assert.deepEqual(addedDroppedRecordPaths(changed), ['data/proposals/dropped/added.md']);
});

// ---------------------------------------------------------------------------
// applyProposalMergeRules — report and stop, before it writes anything
// ---------------------------------------------------------------------------

function branchWith(files) {
  const ctx = makeRepo({ files });
  return ctx;
}

test('a silent drop record stops the merge rules before a single file is moved', () => {
  const ctx = branchWith({
    'data/proposals/a.md': '---\nslug: a\ntype: post\n---\n\nA candidate.\n',
    'data/proposals/b.md': '---\nslug: b\ntype: post\n---\n\nA candidate.\n',
    'data/proposals/dropped/silent.md': '---\nslug: silent\n---\n\nI declined it.\n',
  });
  const res = applyProposalMergeRules(ctx, {
    worktree: ctx.repoRoot,
    jobId: 'j-test',
    jobType: 'entry', // cap of 1, so two candidates WOULD have been capped
    changed: [
      { path: 'data/proposals/a.md', status: 'A' },
      { path: 'data/proposals/b.md', status: 'A' },
      { path: 'data/proposals/dropped/silent.md', status: 'A' },
    ],
  });
  assert.equal(res.refused.length, 1);
  assert.match(res.refused[0], /data\/proposals\/dropped\/silent\.md/);
  assert.match(res.refused[0], /which test it failed/);
  assert.deepEqual(res.dropped, [], 'nothing was moved');
  assert.deepEqual(res.rejected, []);
  assert.deepEqual(
    readdirSync(join(ctx.repoRoot, 'data', 'proposals')).sort(),
    ['a.md', 'b.md', 'dropped'],
    'the over-cap candidate is still where the job left it — a refusal is not a half-processed branch',
  );
  assert.ok(
    !/proposed_by_job/.test(readFileSync(join(ctx.repoRoot, 'data', 'proposals', 'a.md'), 'utf8')),
    'and nothing was stamped',
  );
  ctx.cleanup();
});

test('POSITIVE CONTROL — a compliant drop record leaves the merge rules doing their normal work', () => {
  const ctx = branchWith({
    'data/proposals/a.md': '---\nslug: a\ntype: post\n---\n\nA candidate.\n',
    'data/proposals/dropped/loud.md': PROSE,
  });
  const res = applyProposalMergeRules(ctx, {
    worktree: ctx.repoRoot,
    jobId: 'j-test',
    jobType: 'entry',
    changed: [
      { path: 'data/proposals/a.md', status: 'A' },
      { path: 'data/proposals/dropped/loud.md', status: 'A' },
    ],
  });
  assert.deepEqual(res.refused, []);
  assert.deepEqual(res.kept, ['a.md']);
  assert.match(
    readFileSync(join(ctx.repoRoot, 'data', 'proposals', 'a.md'), 'utf8'),
    /proposed_by_type: entry/,
    'the stamp still happens',
  );
  ctx.cleanup();
});

// ---------------------------------------------------------------------------
// End to end — a real loop run whose scout really writes a silent record
// ---------------------------------------------------------------------------

test('end to end: a scout that records a decline without saying why never merges', async () => {
  const ctx = makeRepo({
    runners: runnersYaml({ command: pmock('scout-silent-drop'), reviewerCommand: pmock('review-approve-plain') }),
  });
  writeQueue(ctx, [{ type: 'scout', title: 'look outward and file what clears the bar' }]);
  const res = await runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', noGates: true });

  assert.equal(res.outcome, 'failed', ctx.output());
  assert.match(ctx.output(), /do not carry|does not carry/);
  assert.match(ctx.output(), /silently-declined\.md/);
  assert.ok(
    !existsSync(join(ctx.repoRoot, 'data', 'proposals', 'dropped', 'silently-declined.md')),
    'nothing merged, so the silent record is not in the tree',
  );
  assert.ok(!existsSync(join(ctx.repoRoot, 'data', 'proposals', 'd-best.md')), 'and neither is its candidate');
  ctx.cleanup();
});
