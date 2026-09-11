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
 *
 * REWORKED Stage-1 U2 (bead 938e): row 50 removes the per-job rederive, so
 * the per-job recomputation these tests stood inside of is gone — and with
 * it the per-job derived-commit the djd guard policed. The property moved
 * up: the train recomputes once (real witness rederive, same discovery
 * seam), and its records commit is allow-listed (ledger/reviews/carried/
 * proposals) — `data/derived/` is structurally excludable, on clean AND
 * dirty trees alike. Same witness, same committed-tree assertions, new
 * driver (assemble + ordered run instead of a job run). What retired with
 * the per-job path: the 942 positive control (derived committed WITH
 * records) — nothing commits `data/derived/` anymore, which is a boundary
 * for U5-or-later to own (RESULT2 records it), not a property to keep
 * pinning the old shape of.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { dirtyDerivedInputs } from '../lib/rederive.mjs';
import { assembleTrain, ensureTrainBranch, runTrain, TRAIN_BRANCH } from '../lib/train.mjs';
import { makeRepo, runnersYaml, mockCommand, git } from './helpers.mjs';

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
  return ctx;
}

const TRAIN_BOUNDS = { merges: 5, minutes: 90, maxReviewedBytes: 150000, maxSubjects: 12, lockWaitSeconds: 1200 };
const GREEN_GATES = () => ({ ok: true, results: [], output: '' });
const APPROVE_REVIEW = async () => ({ verdict: 'approve', runner: 'stub', provider: 'stub', tier: 'stub', findingsNotInAnyRecord: 0 });

/**
 * Admit one merge and run the ordered run with the DEFAULT rederive seam
 * (the real `rederiveStep`, discovering the witness above). Returns the
 * train result. Stubs mirror `train.test.mjs`'s stated contracts.
 */
async function witnessTrain(ctx) {
  const repo = ctx.repoRoot;
  ensureTrainBranch(repo, 'main');
  git(repo, ['checkout', '--quiet', '-b', 'job/wit', 'main']);
  mkdirSync(join(repo, 'content'), { recursive: true });
  writeFileSync(join(repo, 'content', 'wit.md'), '# witness\n', 'utf8');
  git(repo, ['add', '--', 'content/wit.md']);
  git(repo, ['commit', '--quiet', '--no-verify', '-m', 'witness work']);
  git(repo, ['checkout', '--quiet', TRAIN_BRANCH]);
  git(repo, ['merge', '--quiet', '--no-ff', '--no-verify', '-m', 'job j-wit-01 (repair): witness work', 'job/wit']);
  const asm = assembleTrain(repo, { trainId: 't-wit', bounds: TRAIN_BOUNDS });
  assert.equal(asm.ok, true, asm.reason ?? 'assembly refused');
  const tr = await runTrain(ctx, {
    repo, trainId: asm.manifest.train, manifest: asm.manifest,
    gates: GREEN_GATES, review: APPROVE_REVIEW,
  });
  assert.equal(tr.ok, true, tr.reason ?? 'witness train refused');
  return tr;
}

/** The train's records commit's own tree — never the working tree. */
function recordsCommitFiles(ctx, sha) {
  const subject = git(ctx.repoRoot, ['log', '-1', '--format=%s', sha]).trim();
  assert.match(subject, /train t-wit: records/, `not the records commit: ${subject}`);
  return git(ctx.repoRoot, ['show', '--name-only', '--format=', sha])
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

test('THE DEFECT, moved up: data/derived/ recomputed from a dirty data/changes.jsonl must not reach the train records commit', async (t) => {
  const ctx = repoWithWitness();
  t.after(() => ctx.cleanup());

  assert.deepEqual(dirtyDerivedInputs(ctx.repoRoot), [], 'precondition: nothing of the input set is dirty yet');

  // The shape of the incident: something appended to data/changes.jsonl in the
  // working tree and never committed it — a Pulse run mid-flight, or an
  // agent's own edit.
  writeFileSync(join(ctx.repoRoot, 'data', 'changes.jsonl'), '{"subject":"a"}\n{"subject":"b"}\n', 'utf8');
  assert.deepEqual(dirtyDerivedInputs(ctx.repoRoot), ['data/changes.jsonl'], 'precondition: now it is dirty');

  const tr = await witnessTrain(ctx);

  // data/derived/ WAS recomputed (the real rederive ran) — the working tree
  // carries the recomputed file...
  const queuePath = join(ctx.repoRoot, 'data', 'derived', 'queue.json');
  assert.ok(existsSync(queuePath));
  assert.deepEqual(JSON.parse(readFileSync(queuePath, 'utf8')).items, ['witness']);

  // ...but it must NOT be in the records commit: the allow-list admits
  // ledger/reviews/carried/proposals and nothing else, on clean AND dirty
  // trees alike. The djd foot guard this replaces policed the same pairing
  // per job; the train holds it structurally.
  const files = recordsCommitFiles(ctx, tr.sha);
  assert.ok(
    !files.some((f) => f.startsWith('data/derived/')),
    `data/derived/ reached the records commit while an input stayed dirty: ${files.join(', ')}`,
  );
  assert.ok(files.includes('data/ledger.jsonl'), `the train line must still be committed: ${files.join(', ')}`);

  // The dirty input is still dirty after the run — the train neither
  // committed it to make room nor cleaned it.
  assert.deepEqual(dirtyDerivedInputs(ctx.repoRoot), ['data/changes.jsonl'], 'the input is still dirty after the run');

  // THE ACTUAL HAZARD, confirmed against the committed tree: the records
  // commit pairs no derived output with inputs it does not carry.
  const tracked = git(ctx.repoRoot, ['ls-tree', '-r', '--name-only', tr.sha]);
  assert.ok(!tracked.split('\n').includes('data/derived/queue.json'), 'the records commit must not track the recomputation');
});

test('POSITIVE CONTROL, new form: the exclusion holds on a clean tree too', async (t) => {
  // Row 50 retired the 942 mechanism (derived committed WITH records);
  // nothing commits data/derived/ anymore. This pins that the exclusion is
  // structural — not a guard that only fires when dirty.
  const ctx = repoWithWitness();
  t.after(() => ctx.cleanup());

  assert.deepEqual(dirtyDerivedInputs(ctx.repoRoot), [], 'precondition: nothing dirty before the run');

  const tr = await witnessTrain(ctx);

  const files = recordsCommitFiles(ctx, tr.sha);
  assert.ok(!files.some((f) => f.startsWith('data/derived/')), `clean tree, still excluded: ${files.join(', ')}`);
  assert.ok(files.includes('data/ledger.jsonl'), `the train line is committed: ${files.join(', ')}`);
  assert.deepEqual(dirtyDerivedInputs(ctx.repoRoot), [], 'nothing left dirty in the input set on the happy path');
});

test('a dirty content/ file (another agent mid-edit) stays out of the records commit the same way', async (t) => {
  const ctx = repoWithWitness();
  t.after(() => ctx.cleanup());
  mkdirSync(join(ctx.repoRoot, 'content'), { recursive: true });
  // Untracked, deliberately: the shape of a fresh file another agent is
  // mid-way through writing, not yet even `git add`ed.
  writeFileSync(join(ctx.repoRoot, 'content', 'someone-elses-draft.md'), 'half-written\n', 'utf8');
  assert.deepEqual(dirtyDerivedInputs(ctx.repoRoot), ['content/someone-elses-draft.md']);

  const tr = await witnessTrain(ctx);

  const files = recordsCommitFiles(ctx, tr.sha);
  assert.ok(
    !files.some((f) => f.startsWith('data/derived/')),
    `data/derived/ must not be committed while content/ carries an untracked file: ${files.join(', ')}`,
  );
  // And the foreign draft is untouched — this run neither committed it nor
  // deleted it. It is not this run's file to decide about.
  assert.equal(readFileSync(join(ctx.repoRoot, 'content', 'someone-elses-draft.md'), 'utf8'), 'half-written\n');
});

test('POSITIVE CONTROL: a dirty file OUTSIDE the input set (e.g. data/launch.json) changes nothing', async (t) => {
  // The exclusion is structural (allow-list), not input-scoped: a dirty
  // file elsewhere under data/ is somebody else's business and must not
  // change what the records commit carries.
  const ctx = repoWithWitness();
  t.after(() => ctx.cleanup());
  writeFileSync(join(ctx.repoRoot, 'data', 'launch.json'), '{"measured": true}\n', 'utf8');
  assert.deepEqual(dirtyDerivedInputs(ctx.repoRoot), [], 'data/launch.json is not in the derived-tree input set');

  const tr = await witnessTrain(ctx);

  const files = recordsCommitFiles(ctx, tr.sha);
  assert.ok(!files.some((f) => f.startsWith('data/derived/')), `an unrelated dirty file changes nothing: ${files.join(', ')}`);
  assert.ok(files.includes('data/ledger.jsonl'), `the train line is committed: ${files.join(', ')}`);
});
