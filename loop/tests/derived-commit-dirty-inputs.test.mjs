/**
 * derived-commit-dirty-inputs.test.mjs — addictedtoai-djd.
 *
 * The re-derive after a merged job commits `data/derived/` by exact path. The
 * state that tree is computed FROM — `data/changes.jsonl`, the source
 * snapshots under `data/sources/`, the corpus under `content/` — is not this
 * commit's to make honest: it may be dirty because a concurrent Pulse run or
 * another agent is mid-edit in the SAME main working tree this loop run
 * shares (CLAUDE.md: "Another agent is working in this checkout"). Committing
 * `data/derived/` anyway pairs it, in git history, with inputs the commit
 * itself does not carry — and the next job's branch, cut from exactly that
 * commit, inherits a queue item naming a record the branch cannot see.
 *
 * MEASURED, 2026-08-31, on commit `8f83b04` ("job j-20260831-01: records
 * (done)"): a recomputed `data/derived/queue.json` named an `interpret` item
 * over a change record that lived only in a still-dirty `data/changes.jsonl`
 * (91 lines on disk, 90 committed). Job j-20260831-02's branch, cut from that
 * commit, inherited the item and correctly reported
 * `blocked: the change record this job annotates is not on this branch` —
 * 15.47 model-minutes spent finding that out.
 *
 * These tests run the REAL loop end to end, with a witnessing shared derive
 * step (the technique `ledger-order.test.mjs` uses for the same reason: the
 * discovery seam in `loop/lib/rederive.mjs` is a real production mechanism
 * and the only place a test can stand INSIDE the moment `data/derived/` is
 * recomputed). The assertions are about what actually landed in the commit —
 * `git show --name-only` on the real HEAD — never about the fix's intent.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { runLoop } from '../run.mjs';
import { dirtyDerivedInputs } from '../lib/rederive.mjs';
import { makeRepo, writeQueue, runnersYaml, mockCommand, git } from './helpers.mjs';

/** A minimal shared derive step: writes one file, so committed-or-not is easy to read. */
const WITNESS_DERIVE = `
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

export const DERIVED_PATHS = Object.freeze(['data/derived']);

export async function rederive(root) {
  mkdirSync(join(root, 'data', 'derived'), { recursive: true });
  writeFileSync(
    join(root, 'data', 'derived', 'queue.json'),
    JSON.stringify({ items: ['witness'] }, null, 2) + '\\n',
    'utf8',
  );
  return { queue: { count: 1 } };
}
`;

const STUB_REGISTRY = 'export const loadRegistry = () => ({ version: 1, sources: [] });\n';
const STUB_CORPUS = 'export const readCorpus = () => ({ entries: [], unreadable: [] });\n';

function repoWithWitness(extraFiles = {}) {
  const ctx = makeRepo({
    runners: runnersYaml({ command: mockCommand('done-edit'), reviewerCommand: mockCommand('review-approve') }),
    files: {
      'pulse/lib/rederive.mjs': WITNESS_DERIVE,
      'pulse/lib/registry.mjs': STUB_REGISTRY,
      'pulse/lib/corpus.mjs': STUB_CORPUS,
      'data/changes.jsonl': '{"subject":"a"}\n',
      ...extraFiles,
    },
  });
  writeQueue(ctx, [{ type: 'repair', title: 'a repair job, so the run reaches a merge' }]);
  return ctx;
}

const go = (ctx) => runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', noGates: true });

/** The records commit's own tree — never the working tree, which can carry more. */
function recordsCommitFiles(ctx) {
  const subject = git(ctx.repoRoot, ['log', '-1', '--format=%s']).trim();
  assert.match(subject, /records \(done\)/, `HEAD is not the records commit: ${subject}`);
  return git(ctx.repoRoot, ['show', '--name-only', '--format=', 'HEAD'])
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

test('THE DEFECT, reproduced: data/derived/ recomputed from a dirty data/changes.jsonl must not be committed alongside it', async (t) => {
  const ctx = repoWithWitness();
  t.after(() => ctx.cleanup());

  assert.deepEqual(dirtyDerivedInputs(ctx.repoRoot), [], 'precondition: nothing of the input set is dirty yet');

  // The shape of the incident: something appended to data/changes.jsonl in the
  // MAIN working tree and never committed it — a Pulse run mid-flight, or an
  // agent's own edit. This loop run shares that same working tree.
  writeFileSync(join(ctx.repoRoot, 'data', 'changes.jsonl'), '{"subject":"a"}\n{"subject":"b"}\n', 'utf8');
  assert.deepEqual(dirtyDerivedInputs(ctx.repoRoot), ['data/changes.jsonl'], 'precondition: now it is dirty');

  const res = await go(ctx);
  assert.equal(res.outcome, 'done', ctx.output());

  // data/derived/ WAS recomputed (rederiveStep ran) — the working tree carries
  // the recomputed file...
  const queuePath = join(ctx.repoRoot, 'data', 'derived', 'queue.json');
  assert.ok(existsSync(queuePath));
  assert.deepEqual(JSON.parse(readFileSync(queuePath, 'utf8')).items, ['witness']);

  // ...but it must NOT be in the records commit: its own input
  // (data/changes.jsonl) is still dirty, and the commit cannot honestly carry
  // a data/derived/ that state does not reproduce.
  const files = recordsCommitFiles(ctx);
  assert.ok(
    !files.some((f) => f.startsWith('data/derived/')),
    `data/derived/ reached the records commit while an input stayed dirty: ${files.join(', ')}`,
  );
  // The guard is scoped to data/derived/ ALONE — the rest of this run's own
  // records (the ledger line, the verdict) do not depend on the invariant it
  // protects and must still land in the same commit. A guard that withheld
  // the whole records commit would lose the ledger line the budget is
  // computed from for no reason connected to this bug.
  assert.ok(files.includes('data/ledger.jsonl'), `the ledger line must still be committed: ${files.join(', ')}`);
  assert.ok(files.some((f) => f.startsWith('data/reviews/')), `the verdict record must still be committed: ${files.join(', ')}`);

  // The guard did not silently commit the dirty input to make room for it either.
  assert.deepEqual(dirtyDerivedInputs(ctx.repoRoot), ['data/changes.jsonl'], 'the input is still dirty after the run');

  // The refusal is on the record, naming the dirty path and the issue.
  assert.match(ctx.output(), /data\/changes\.jsonl/);
  assert.match(ctx.output(), /addictedtoai-djd/);

  // THE ACTUAL HAZARD, confirmed against the committed tree rather than the
  // dirty working tree: `data/derived/queue.json` is not tracked by HEAD at
  // all — a branch cut from this commit gets whatever `data/derived/` it
  // already had (nothing, in this fixture), never a queue.json recomputed
  // from state the branch cannot see.
  const tracked = git(ctx.repoRoot, ['ls-tree', '-r', '--name-only', 'HEAD']);
  assert.ok(!tracked.split('\n').includes('data/derived/queue.json'), 'HEAD must not track the unreproducible recomputation');
});

test('POSITIVE CONTROL: a clean tree still commits the recomputed derived tree with the records (addictedtoai-942 must survive this fix)', async (t) => {
  const ctx = repoWithWitness();
  t.after(() => ctx.cleanup());

  assert.deepEqual(dirtyDerivedInputs(ctx.repoRoot), [], 'precondition: nothing dirty before the run');

  const res = await go(ctx);
  assert.equal(res.outcome, 'done', ctx.output());

  const files = recordsCommitFiles(ctx);
  assert.ok(files.includes('data/derived/queue.json'), `data/derived/ must still be committed on a clean tree: ${files.join(', ')}`);
  assert.deepEqual(dirtyDerivedInputs(ctx.repoRoot), [], 'nothing left dirty in the input set on the happy path');
  assert.doesNotMatch(ctx.output(), /addictedtoai-djd/, 'the guard has nothing to say when nothing is dirty');

  // And the committed tree really is the recomputation — the queue is not
  // merely present, it is the merged state's own answer.
  const committedQueue = git(ctx.repoRoot, ['show', 'HEAD:data/derived/queue.json']);
  assert.match(committedQueue, /witness/);
});

test('a dirty content/ file (another agent mid-edit) blocks the derived-tree commit the same way', async (t) => {
  const ctx = repoWithWitness();
  t.after(() => ctx.cleanup());
  mkdirSync(join(ctx.repoRoot, 'content'), { recursive: true });
  // Untracked, deliberately: the shape of a fresh file another agent is
  // mid-way through writing, not yet even `git add`ed.
  writeFileSync(join(ctx.repoRoot, 'content', 'someone-elses-draft.md'), 'half-written\n', 'utf8');
  assert.deepEqual(dirtyDerivedInputs(ctx.repoRoot), ['content/someone-elses-draft.md']);

  const res = await go(ctx);
  assert.equal(res.outcome, 'done', ctx.output());

  const files = recordsCommitFiles(ctx);
  assert.ok(
    !files.some((f) => f.startsWith('data/derived/')),
    `data/derived/ must not be committed while content/ carries an untracked file: ${files.join(', ')}`,
  );
  assert.match(ctx.output(), /content\/someone-elses-draft\.md/);
  // And the foreign draft is untouched — this run neither committed it nor
  // deleted it. It is not this run's file to decide about.
  assert.equal(readFileSync(join(ctx.repoRoot, 'content', 'someone-elses-draft.md'), 'utf8'), 'half-written\n');
});

test('POSITIVE CONTROL: a dirty file OUTSIDE the input set (e.g. data/launch.json) does not block the commit', async (t) => {
  // The guard is scoped to what data/derived/ actually depends on. A dirty
  // file elsewhere under data/ is somebody else's business (addictedtoai-ps3
  // territory) and must not cause a false refusal here.
  const ctx = repoWithWitness();
  t.after(() => ctx.cleanup());
  writeFileSync(join(ctx.repoRoot, 'data', 'launch.json'), '{"measured": true}\n', 'utf8');
  assert.deepEqual(dirtyDerivedInputs(ctx.repoRoot), [], 'data/launch.json is not in the derived-tree input set');

  const res = await go(ctx);
  assert.equal(res.outcome, 'done', ctx.output());

  const files = recordsCommitFiles(ctx);
  assert.ok(files.includes('data/derived/queue.json'), `an unrelated dirty file must not block the commit: ${files.join(', ')}`);
});
