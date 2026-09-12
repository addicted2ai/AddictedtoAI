/**
 * would-cite.test.mjs — the test home for per-piece `would-cite-for` (task 61).
 *
 * TEST-HOME task: the production under test (task 60) is landed — the shared
 * entry parser (`parseWouldCiteFor`, same code path as `reads-human-from`),
 * the one prose-piece predicate (`isProsePiece` / `prosePieces`), the
 * per-entry duplicate universe, the per-piece coverage refusal, the
 * launch re-application per piece, and the train per-subject graph summary
 * with its seal. Every arm below tests THROUGH that production: the merge
 * gate, the train gate, the brief assembly, the launch's piece list and its
 * record reader, and the single verdict parser. Nothing here reimplements a
 * predicate, a parser, or a sweep. Where an arm the task demands has no
 * exported seam on one reader (the launch's inline per-piece re-application),
 * the test pins that reader's production inputs instead — the one parser via
 * the record reader the launch actually calls, and the one piece list against
 * the gate's predicate — and says so in RESULT.md rather than inventing a
 * seam.
 *
 * FIXTURE POLICY throughout (binding here as on the train tasks): throwaway
 * repositories under the OS temp directory via `makeRepo` (real git plumbing,
 * no bare origin needed — no arm pushes or reads a remote), gate spawns never
 * touched (these arms never reach a spawner), reviewers never invoked. Never
 * a test whose red path is a live push.
 *
 * Arms (each found by lookup):
 * - coverage: three prose subjects with a record-wide field only is refused;
 *   one entry for one of three leaves the unanswered two named; an entry per
 *   subject passes with and without a record-wide field.
 * - duplicates: two identical entries in one record pass; an entry recycling
 *   another record's statement is refused (and so is a record-wide field
 *   recycling an entry's statement — one universe).
 * - directory row: a non-prose subject among the subjects requires no entry.
 * - mutations A + B as the task writes them (copy-based, each red then the
 *   tracked file proved byte-identical, single-file removal per command).
 * - train graph arms in the same file: entries read per piece by the train
 *   gate within the bound-sized subject set; the brief carries one graph row
 *   per manifest subject and none of the per-job records' text (seal); an
 *   absent train record fails closed; incomplete flags appear verbatim and
 *   never block alone; no summary file is committed outside `.train/`.
 * - mutations C + D as the task writes them.
 * - launch arms: the launch's record reader carries entries through the one
 *   parser (no second entry shape), and the launch's piece list agrees with
 *   the gate's predicate on every content kind (no second prose list).
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  assembleTrainGraphSummary,
  assembleTrainReviewBrief,
  mergeGate,
  trainReviewGate,
  writeVerdictRecord,
} from '../lib/review.mjs';
import { parseWouldCiteFor } from '../lib/verdict.mjs';
import { isProsePiece, prosePieces } from '../lib/specs.mjs';
import { readReviewRecords } from '../../lib/reviews.mjs';
import { requiredRecordPieces } from '../../scripts/verify-launch.mjs';
import { makeRepo } from './helpers.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REVIEW_LIB = resolve(HERE, '..', 'lib', 'review.mjs');
const SPECS_LIB = resolve(HERE, '..', 'lib', 'specs.mjs');

// Local date, read from the machine clock (2026-09-12, Mountain).
const NOW = new Date('2026-09-12T12:00:00');
const ctxAt = () => makeRepo({ now: () => NOW });

// Three prose subjects, one per prose content kind (wiki/learn/tutorials), and
// one directory row (tool) plus one data-shaped page (claim), both non-prose.
const P1 = 'content/wiki/model/alpha.md';
const P2 = 'content/learn/beta.md';
const P3 = 'content/tutorials/gamma.md';
const TOOL = 'content/directory/tools/fixture-tool.md';
const CLAIM_PAGE = 'content/claims/fixture-claim.md';

// The train subject bound the task names: the assembly admits at most twelve
// subjects, so the gate's per-piece arm is proved at that size, not only at
// three. This is the bound's value as an input size, not a reimplementation
// of the bound — the gate under test reads the manifest's subject set as-is.
const BOUND_SIZED_SUBJECTS = 12;

function sha256(text) {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

/** Copy-mutant harness for review.mjs: one or more (search, replacement) pairs. */
async function withReviewMutant(tag, pairs, fn) {
  const before = readFileSync(REVIEW_LIB, 'utf8');
  let mutant = before;
  for (const [search, replacement] of pairs) {
    const next = mutant.replace(search, replacement);
    assert.notEqual(next, mutant, `the mutant must differ from the shipped file (${tag})`);
    mutant = next;
  }
  const sha = sha256(before);
  const copyPath = resolve(HERE, '..', 'lib', `review.mut-${process.pid}-wc-${tag}.mjs`);
  writeFileSync(copyPath, mutant, 'utf8');
  try {
    await fn(await import(`./../lib/review.mut-${process.pid}-wc-${tag}.mjs`));
    assert.equal(sha256(readFileSync(REVIEW_LIB, 'utf8')), sha, `tracked review.mjs hash-identical after the mutant run (${tag})`);
    assert.equal(readFileSync(REVIEW_LIB, 'utf8'), before, `tracked review.mjs byte-identical after the mutant run (${tag})`);
  } finally {
    rmSync(copyPath, { force: true });
  }
  assert.equal(existsSync(copyPath), false, 'the mutant copy is gone');
  const residue = readdirSync(resolve(HERE, '..', 'lib')).filter((f) => f.startsWith(`review.mut-${process.pid}-wc-`));
  assert.deepEqual(residue, [], 'no mutant residue of this file in loop/lib');
}

/**
 * Copy-mutant harness for the predicate: a mutated specs.mjs copy plus a
 * review.mjs copy rewired to import it (the shipped review resolves
 * `./specs.mjs` statically, so the mutant review must name the mutant
 * specs file). Two tracked files, two copies, one removal per command.
 */
async function withSpecsMutant(tag, specsSearch, specsReplacement, fn) {
  const specsBefore = readFileSync(SPECS_LIB, 'utf8');
  const specsMutant = specsBefore.replace(specsSearch, specsReplacement);
  assert.notEqual(specsMutant, specsBefore, `the specs mutant must differ (${tag})`);
  const reviewBefore = readFileSync(REVIEW_LIB, 'utf8');
  const specsCopyName = `specs.mut-${process.pid}-wc-${tag}.mjs`;
  const reviewMutant = reviewBefore.replace(
    "from './specs.mjs'",
    `from './${specsCopyName}'`,
  );
  assert.notEqual(reviewMutant, reviewBefore, `the rewired review mutant must differ (${tag})`);
  const specsSha = sha256(specsBefore);
  const reviewSha = sha256(reviewBefore);
  const specsCopyPath = resolve(HERE, '..', 'lib', specsCopyName);
  const reviewCopyPath = resolve(HERE, '..', 'lib', `review.mut-${process.pid}-wc-${tag}.mjs`);
  writeFileSync(specsCopyPath, specsMutant, 'utf8');
  writeFileSync(reviewCopyPath, reviewMutant, 'utf8');
  try {
    await fn(await import(`./../lib/review.mut-${process.pid}-wc-${tag}.mjs`));
    assert.equal(sha256(readFileSync(SPECS_LIB, 'utf8')), specsSha, `tracked specs.mjs hash-identical after the mutant run (${tag})`);
    assert.equal(sha256(readFileSync(REVIEW_LIB, 'utf8')), reviewSha, `tracked review.mjs hash-identical after the mutant run (${tag})`);
    assert.equal(readFileSync(SPECS_LIB, 'utf8'), specsBefore, 'tracked specs.mjs byte-identical after the mutant run');
    assert.equal(readFileSync(REVIEW_LIB, 'utf8'), reviewBefore, 'tracked review.mjs byte-identical after the mutant run');
  } finally {
    rmSync(reviewCopyPath, { force: true });
    rmSync(specsCopyPath, { force: true });
  }
  assert.equal(existsSync(reviewCopyPath), false, 'the review mutant copy is gone');
  assert.equal(existsSync(specsCopyPath), false, 'the specs mutant copy is gone');
  const residue = readdirSync(resolve(HERE, '..', 'lib')).filter((f) => f.includes(`mut-${process.pid}-wc-${tag}`));
  assert.deepEqual(residue, [], 'no mutant residue of either file in loop/lib');
}

function listFiles(root) {
  const out = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === '.git') continue;
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else out.push(full);
    }
  };
  walk(root);
  return out.sort();
}

// ---------------------------------------------------------------------------
// Coverage: three prose pieces, record-wide versus per-piece answers.
// ---------------------------------------------------------------------------

test('coverage: three prose subjects with one record-wide field is refused naming the pieces', () => {
  const ctx = ctxAt();
  try {
    const subjects = [P1, P2, P3];
    writeVerdictRecord(ctx, 'j-wc-wide', {
      verdict: 'approve',
      wouldCite: 'A reader following this work would link it in an argument about the fixture.',
      notes: 'record-wide only',
    });
    const g = mergeGate(ctx, { jobId: 'j-wc-wide', type: 'entry', subjects });
    assert.equal(g.ok, false, 'a record-wide sentence standing for three pieces must not pass');
    assert.equal(g.code, 'would-cite-for-empty', `got ${g.code}: ${g.reason}`);
    for (const p of subjects) {
      assert.ok(g.reason.includes(p), `the refusal names the unanswered piece ${p}: ${g.reason}`);
    }
  } finally {
    ctx.cleanup();
  }
});

test('coverage: one entry for one of three pieces leaves the unanswered two named', () => {
  const ctx = ctxAt();
  try {
    writeVerdictRecord(ctx, 'j-wc-one', {
      verdict: 'approve',
      wouldCite: 'A reader following this work would link it in an argument about the fixture one-entry case.',
      wouldCiteFor: [{ subject: P1, statement: 'A reader following alpha would link it for its alpha argument.' }],
      notes: 'one of three answered',
    });
    const g = mergeGate(ctx, { jobId: 'j-wc-one', type: 'entry', subjects: [P1, P2, P3] });
    assert.equal(g.ok, false, 'two unanswered pieces must still refuse');
    assert.equal(g.code, 'would-cite-for-empty', `got ${g.code}: ${g.reason}`);
    assert.ok(g.reason.includes(P2), `the refusal names ${P2}: ${g.reason}`);
    assert.ok(g.reason.includes(P3), `the refusal names ${P3}: ${g.reason}`);
  } finally {
    ctx.cleanup();
  }
});

test('coverage: an entry per subject passes, with and without a record-wide field', () => {
  const ctx = ctxAt();
  try {
    const entries = [
      { subject: P1, statement: 'A reader following alpha would link it for its alpha argument, full cover.' },
      { subject: P2, statement: 'A reader following beta would link it for its beta argument, full cover.' },
      { subject: P3, statement: 'A reader following gamma would link it for its gamma argument, full cover.' },
    ];
    writeVerdictRecord(ctx, 'j-wc-full', {
      verdict: 'approve',
      wouldCite: 'A reader following this work would link it in the full-cover argument.',
      wouldCiteFor: entries,
      notes: 'every piece answered',
    });
    const g = mergeGate(ctx, { jobId: 'j-wc-full', type: 'entry', subjects: [P1, P2, P3] });
    assert.equal(g.ok, true, `an entry per subject passes: ${g.reason ?? ''}`);
    // The would-cite-for-only shape: no record-wide field, every piece named.
    writeVerdictRecord(ctx, 'j-wc-only', {
      verdict: 'approve',
      wouldCite: '',
      wouldCiteFor: entries.map((e) => ({ ...e, statement: `${e.statement} Entry-only.` })),
      notes: 'entries only',
    });
    const h = mergeGate(ctx, { jobId: 'j-wc-only', type: 'entry', subjects: [P1, P2, P3] });
    assert.equal(h.ok, true, `a fully-answered would-cite-for-only record passes: ${h.reason ?? ''}`);
  } finally {
    ctx.cleanup();
  }
});

// ---------------------------------------------------------------------------
// Duplicates: same record may repeat; across records is refused, one universe.
// ---------------------------------------------------------------------------

test('duplicates: two identical entries in one record pass', () => {
  const ctx = ctxAt();
  try {
    const shared = 'A reader correcting the same typo twice would link either piece for the same honest reason.';
    writeVerdictRecord(ctx, 'j-wc-same', {
      verdict: 'approve',
      wouldCite: 'A reader following this pair would link it in the shared-typo argument.',
      wouldCiteFor: [
        { subject: P1, statement: shared },
        { subject: P2, statement: shared },
      ],
      notes: 'one honest sentence twice',
    });
    const g = mergeGate(ctx, { jobId: 'j-wc-same', type: 'entry', subjects: [P1, P2] });
    assert.equal(g.ok, true, `two entries in one record may share a statement: ${g.reason ?? ''}`);
  } finally {
    ctx.cleanup();
  }
});

test('duplicates: an entry recycling another record statement is refused, field or entry', () => {
  const ctx = ctxAt();
  try {
    const recycled = 'A reader following alpha would link it for the recycled-across-reviews argument.';
    writeVerdictRecord(ctx, 'j-wc-old', {
      verdict: 'approve',
      wouldCite: 'A reader following the older work would link it in the older argument.',
      wouldCiteFor: [{ subject: P1, statement: recycled }],
      notes: 'the earlier record',
    });
    // Entry recycling another record's entry statement.
    writeVerdictRecord(ctx, 'j-wc-new', {
      verdict: 'approve',
      wouldCite: 'A reader following the newer work would link it in the newer argument.',
      wouldCiteFor: [{ subject: P2, statement: recycled }],
      notes: 'the recycling record',
    });
    const g = mergeGate(ctx, { jobId: 'j-wc-new', type: 'entry', subjects: [P2] });
    assert.equal(g.ok, false, 'a recycled per-piece statement must not pass');
    assert.equal(g.code, 'would-cite-for-duplicate', `got ${g.code}: ${g.reason}`);
    assert.ok(g.reason.includes('j-wc-old.md'), `the refusal names the record recycled from: ${g.reason}`);
    // A record-wide field recycling another record's ENTRY statement: one universe.
    const recycledField = 'A reader following beta would link it for the field-recycles-entry argument.';
    writeVerdictRecord(ctx, 'j-wc-old2', {
      verdict: 'approve',
      wouldCite: 'A reader following the second older work would link it in its argument.',
      wouldCiteFor: [{ subject: P2, statement: recycledField }],
      notes: 'the second earlier record',
    });
    writeVerdictRecord(ctx, 'j-wc-new2', {
      verdict: 'approve',
      wouldCite: recycledField,
      notes: 'field pasted from an entry',
    });
    const h = mergeGate(ctx, { jobId: 'j-wc-new2', type: 'entry', subjects: [P3] });
    assert.equal(h.ok, false, 'a field pasted from another record entry must not pass');
    assert.equal(h.code, 'would-cite-duplicate', `got ${h.code}: ${h.reason}`);
  } finally {
    ctx.cleanup();
  }
});

// ---------------------------------------------------------------------------
// Directory rows are not prose pieces.
// ---------------------------------------------------------------------------

test('directory row: a non-prose subject among the subjects requires no entry', () => {
  assert.equal(isProsePiece(P1), true, `${P1} is a prose piece`);
  assert.equal(isProsePiece(P2), true, `${P2} is a prose piece`);
  assert.equal(isProsePiece(P3), true, `${P3} is a prose piece`);
  assert.equal(isProsePiece(TOOL), false, `${TOOL} is a directory row, not a prose piece`);
  assert.equal(isProsePiece(CLAIM_PAGE), false, `${CLAIM_PAGE} is data-shaped, not a prose piece`);
  const ctx = ctxAt();
  try {
    writeVerdictRecord(ctx, 'j-wc-dir', {
      verdict: 'approve',
      wouldCite: 'A reader following this pair would link it in the directory-row argument.',
      wouldCiteFor: [
        { subject: P1, statement: 'A reader following alpha would link it for the directory-row alpha argument.' },
        { subject: P2, statement: 'A reader following beta would link it for the directory-row beta argument.' },
      ],
      notes: 'tool row needs no entry',
    });
    const g = mergeGate(ctx, { jobId: 'j-wc-dir', type: 'entry', subjects: [P1, P2, TOOL] });
    assert.equal(g.ok, true, `the directory row requires no entry: ${g.reason ?? ''}`);
    assert.deepEqual(prosePieces([P1, P2, TOOL]), [P2, P1].sort(), 'the piece set holds prose only');
  } finally {
    ctx.cleanup();
  }
});

// ---------------------------------------------------------------------------
// Mutation A: the duplicate check ignoring entries blinds only the
// cross-record entry case.
// ---------------------------------------------------------------------------

test('mutation A: a duplicate check that ignores entries blinds only the cross-record case', async () => {
  await withReviewMutant(
    'mutA',
    [['    const others = existingCiteValues(ctx, jobId);', "    const others = existingFieldValues(ctx, jobId, 'wouldCite');"]],
    async (mutantReview) => {
      const ctx = ctxAt();
      try {
        const recycled = 'A reader following alpha would link it for the mutant-A cross-record argument.';
        writeVerdictRecord(ctx, 'j-wc-mutA-old', {
          verdict: 'approve',
          wouldCite: 'A reader following the mutant-A older work would link it in its argument.',
          wouldCiteFor: [{ subject: P1, statement: recycled }],
          notes: 'earlier record',
        });
        writeVerdictRecord(ctx, 'j-wc-mutA-new', {
          verdict: 'approve',
          wouldCite: 'A reader following the mutant-A newer work would link it in its argument.',
          wouldCiteFor: [{ subject: P2, statement: recycled }],
          notes: 'recycling record',
        });
        // The cross-record entry case goes green when it must not: the arm fails.
        const blind = mutantReview.mergeGate(ctx, { jobId: 'j-wc-mutA-new', type: 'entry', subjects: [P2] });
        assert.equal(blind.ok, true, 'the mutant no longer sees entry statements — the cross-record arm goes red');
        const shipped = mergeGate(ctx, { jobId: 'j-wc-mutA-new', type: 'entry', subjects: [P2] });
        assert.equal(shipped.ok, false, 'the shipped gate still refuses the recycled entry');
        assert.equal(shipped.code, 'would-cite-for-duplicate');
        // Only that case moves: field-against-field still refused on the mutant.
        writeVerdictRecord(ctx, 'j-wc-mutA-f1', {
          verdict: 'approve',
          wouldCite: 'A reader following the mutant-A field work would link it in the field argument.',
          notes: 'first field',
        });
        writeVerdictRecord(ctx, 'j-wc-mutA-f2', {
          verdict: 'approve',
          wouldCite: 'A reader following the mutant-A field work would link it in the field argument.',
          notes: 'second field',
        });
        const fieldDup = mutantReview.mergeGate(ctx, { jobId: 'j-wc-mutA-f2', type: 'entry', subjects: [P3] });
        assert.equal(fieldDup.ok, false, 'the mutant still refuses a recycled record-wide field');
        assert.equal(fieldDup.code, 'would-cite-duplicate');
        // And coverage still refused on the mutant.
        writeVerdictRecord(ctx, 'j-wc-mutA-cov', {
          verdict: 'approve',
          wouldCite: 'A reader following the mutant-A coverage work would link it in its argument.',
          notes: 'record-wide only',
        });
        const cov = mutantReview.mergeGate(ctx, { jobId: 'j-wc-mutA-cov', type: 'entry', subjects: [P1, P2, P3] });
        assert.equal(cov.ok, false, 'the mutant still refuses unanswered pieces');
        assert.equal(cov.code, 'would-cite-for-empty');
      } finally {
        ctx.cleanup();
      }
    },
  );
});

// ---------------------------------------------------------------------------
// Mutation B: prose piece as "any content path" fails the directory-row case.
// ---------------------------------------------------------------------------

test('mutation B: prose-as-any-content-path fails the directory-row case', async () => {
  await withSpecsMutant(
    'mutB',
    '  return type !== null && PROSE_SUBJECT_TYPES.includes(type);',
    "  return String(subject ?? '').indexOf('content/') !== -1;",
    async (mutantReview) => {
      const ctx = ctxAt();
      try {
        writeVerdictRecord(ctx, 'j-wc-mutB', {
          verdict: 'approve',
          wouldCite: 'A reader following the mutant-B pair would link it in its argument.',
          wouldCiteFor: [
            { subject: P1, statement: 'A reader following alpha would link it for the mutant-B alpha argument.' },
            { subject: P2, statement: 'A reader following beta would link it for the mutant-B beta argument.' },
          ],
          notes: 'tool row needs no entry',
        });
        // The directory-row pass arm fails on the mutant: the tool row is now
        // "prose" and stands unanswered.
        const g = mutantReview.mergeGate(ctx, { jobId: 'j-wc-mutB', type: 'entry', subjects: [P1, P2, TOOL] });
        assert.equal(g.ok, false, 'the mutant demands an entry for the directory row — the arm goes red');
        assert.equal(g.code, 'would-cite-for-empty');
        assert.ok(g.reason.includes(TOOL), `the mutant refusal names the tool row: ${g.reason}`);
        const shipped = mergeGate(ctx, { jobId: 'j-wc-mutB', type: 'entry', subjects: [P1, P2, TOOL] });
        assert.equal(shipped.ok, true, 'the shipped predicate still passes the directory-row case');
      } finally {
        ctx.cleanup();
      }
    },
  );
});

// ---------------------------------------------------------------------------
// Train gate: per-piece entries within the subject set, fail closed.
// ---------------------------------------------------------------------------

test('train gate: per-piece entries pass and a record-wide field alone fails closed', () => {
  const ctx = ctxAt();
  try {
    writeVerdictRecord(ctx, 't-wc-train', {
      verdict: 'approve',
      wouldCite: 'A reader following this train would link it in the train argument.',
      wouldCiteFor: [
        { subject: P1, statement: 'A reader following alpha would link it for the train alpha argument.' },
        { subject: P2, statement: 'A reader following beta would link it for the train beta argument.' },
      ],
      notes: 'train entries per piece',
    });
    const g = trainReviewGate(ctx, { trainId: 't-wc-train', kinds: ['entry'], subjects: [P1, P2] });
    assert.equal(g.ok, true, `the train gate reads entries per piece: ${g.reason ?? ''}`);
    writeVerdictRecord(ctx, 't-wc-wide', {
      verdict: 'approve',
      wouldCite: 'A reader following this wide train would link it in its argument.',
      notes: 'record-wide only',
    });
    const h = trainReviewGate(ctx, { trainId: 't-wc-wide', kinds: ['entry'], subjects: [P1, P2] });
    assert.equal(h.ok, false, 'a would-cite-for-only-shaped gap fails the train closed too');
    assert.equal(h.code, 'would-cite-for-empty', `got ${h.code}: ${h.reason}`);
  } finally {
    ctx.cleanup();
  }
});

test('train gate: a bound-sized subject set passes entry by entry, adding no piece list', () => {
  const ctx = ctxAt();
  try {
    const subjects = Array.from({ length: BOUND_SIZED_SUBJECTS }, (_, i) => `content/wiki/model/wc-train-${String(i + 1).padStart(2, '0')}.md`);
    for (const s of subjects) assert.equal(isProsePiece(s), true, `${s} is a prose piece`);
    // One honest sentence may answer for every piece in a single record, so a
    // shared statement here is the allowed shape, not a recycled one.
    const shared = 'A reader following any of these train pieces would link it for the bound-sized argument.';
    writeVerdictRecord(ctx, 't-wc-bound', {
      verdict: 'approve',
      wouldCite: 'A reader following this bound-sized train would link it in its argument.',
      wouldCiteFor: subjects.map((subject) => ({ subject, statement: shared })),
      notes: 'twelve subjects, twelve entries',
    });
    const g = trainReviewGate(ctx, { trainId: 't-wc-bound', kinds: ['entry'], subjects });
    assert.equal(g.ok, true, `twelve entries for twelve subjects pass within the bound: ${g.reason ?? ''}`);
  } finally {
    ctx.cleanup();
  }
});

test('train gate: an absent train record fails closed', () => {
  const ctx = ctxAt();
  try {
    const g = trainReviewGate(ctx, { trainId: 't-wc-absent', kinds: ['entry'], subjects: [P1] });
    assert.equal(g.ok, false, 'no record is never an approval');
    assert.equal(g.code, 'no-record', `got ${g.code}: ${g.reason}`);
  } finally {
    ctx.cleanup();
  }
});

// ---------------------------------------------------------------------------
// Train brief: one graph row per manifest subject, sealed from the records.
// ---------------------------------------------------------------------------

test('seal: the brief carries diff, manifest, checklists and one graph row per subject, none of the records', () => {
  const ctx = ctxAt();
  try {
    const probe = 'SEAL-PROBE-verdict-text-that-must-never-reach-the-brief-4815';
    writeVerdictRecord(ctx, 'j-wc-probe', {
      verdict: 'approve',
      wouldCite: probe,
      notes: probe,
    });
    const manifest = {
      train: 't-wc-seal',
      mainTip: 'f'.repeat(40),
      merges: [{ sha: 'a'.repeat(40), jobId: 'j-wc-probe', subjects: [P1, P2] }],
    };
    let argv = null;
    const analysis = {
      symbols: [{ name: 'symSeal', owner: P1 }],
      processes: [{ name: 'ProcSeal' }],
      subjects: {
        [P1]: { universe: true, risk: 'LOW' },
        [P2]: { universe: true, risk: 'MEDIUM' },
      },
    };
    const brief = assembleTrainReviewBrief(ctx, {
      trainId: 't-wc-seal',
      diffText: 'SEAL-DIFF-marker-9042\n+++ b/content/wiki/model/alpha.md\n',
      manifest,
      kinds: ['entry'],
      rung: { id: 'rung-fixture', provider: 'provider-fixture', tier: 'tier-fixture' },
      outPath: join(ctx.reviewsDir, 't-wc-seal.md'),
      capMinutes: 1,
      trainGraphAnalysis: (args) => {
        argv = args;
        return analysis;
      },
      graphBase: manifest.mainTip,
      graphRef: 'e'.repeat(40),
    });
    assert.ok(brief.includes('SEAL-DIFF-marker-9042'), 'the brief carries the whole train diff');
    assert.ok(brief.includes('a'.repeat(12)), 'the brief carries the manifest merge sha');
    assert.ok(brief.includes('Every cited fact has a reachable source'), 'the brief carries the kind checklist');
    assert.ok(brief.includes(`\`${P1}\``), `the brief carries a graph row for ${P1}`);
    assert.ok(brief.includes(`\`${P2}\``), `the brief carries a graph row for ${P2}`);
    assert.ok(brief.includes('symSeal'), 'the row carries the changed symbol from the analysis');
    assert.ok(brief.includes('ProcSeal'), 'the summary carries the train-wide affected processes');
    assert.ok(!brief.includes(probe), 'the brief carries none of the per-job records text');
    assert.deepEqual(argv.subjects, [P1, P2].sort(), 'the seam receives the manifest subject set');
    assert.equal(argv.base, manifest.mainTip, 'the seam pins the range base');
    assert.equal(argv.ref, 'e'.repeat(40), 'the seam pins the range tip');
    assert.ok(!JSON.stringify(argv).includes(probe), 'the seam argv never carries verdict text');
  } finally {
    ctx.cleanup();
  }
});

test('graph summary: incomplete flags appear verbatim and never block alone; absence renders rows', () => {
  const partial = assembleTrainGraphSummary({
    subjects: [P1, P2],
    analyse: () => ({
      partial: true,
      truncated: true,
      symbols: [{ name: 'symX', owner: P1 }],
      processes: ['ProcX'],
      subjects: {
        [P1]: { universe: true, risk: 'HIGH', partial: true },
        [P2]: { universe: false },
      },
    }),
    range: { base: 'b'.repeat(40), ref: 'c'.repeat(40) },
  });
  assert.ok(partial.summaryText.includes('partial'), 'the partial flag appears verbatim');
  assert.ok(partial.summaryText.includes('truncated'), 'the truncated flag appears verbatim');
  assert.ok(partial.summaryText.includes('symX'), 'owned changed symbols render per subject');
  assert.ok(partial.summaryText.includes('no-symbols'), 'a subject outside any symbol universe renders its row');
  const absent = assembleTrainGraphSummary({ subjects: [P1], analyse: null });
  assert.equal(absent.absent, true, 'no wired analysis is the absent state, not a throw');
  assert.ok(absent.summaryText.includes('graph: absent'), 'absence renders as rows, not a refusal');
  // And the gate judges the entries, never the flags: full entries still pass.
  const ctx = ctxAt();
  try {
    writeVerdictRecord(ctx, 't-wc-flags', {
      verdict: 'approve',
      wouldCite: 'A reader following this flagged train would link it in its argument.',
      wouldCiteFor: [
        { subject: P1, statement: 'A reader following alpha would link it for the flagged alpha argument.' },
        { subject: P2, statement: 'A reader following beta would link it for the flagged beta argument.' },
      ],
      notes: 'flags do not block',
    });
    const g = trainReviewGate(ctx, { trainId: 't-wc-flags', kinds: ['entry'], subjects: [P1, P2] });
    assert.equal(g.ok, true, `incomplete flags never block the train alone: ${g.reason ?? ''}`);
  } finally {
    ctx.cleanup();
  }
});

test('no persisted summary outside .train: assembly and gating write no files', () => {
  const ctx = ctxAt();
  try {
    writeVerdictRecord(ctx, 't-wc-files', {
      verdict: 'approve',
      wouldCite: 'A reader following this file-train would link it in its argument.',
      wouldCiteFor: [
        { subject: P1, statement: 'A reader following alpha would link it for the file alpha argument.' },
      ],
      notes: 'one piece',
    });
    const manifest = {
      train: 't-wc-files',
      mainTip: 'd'.repeat(40),
      merges: [{ sha: 'b'.repeat(40), jobId: 'j-wc-files', subjects: [P1] }],
    };
    const before = listFiles(ctx.repoRoot);
    const brief = assembleTrainReviewBrief(ctx, {
      trainId: 't-wc-files',
      diffText: 'd',
      manifest,
      kinds: ['entry'],
      rung: { id: 'r' },
      outPath: join(ctx.reviewsDir, 't-wc-files.md'),
      capMinutes: 1,
      trainGraphAnalysis: () => null,
      graphBase: manifest.mainTip,
      graphRef: 'c'.repeat(40),
    });
    const g = trainReviewGate(ctx, { trainId: 't-wc-files', kinds: ['entry'], subjects: [P1] });
    assert.equal(g.ok, true, `the file arm gate passes: ${g.reason ?? ''}`);
    assert.deepEqual(listFiles(ctx.repoRoot), before, 'assembly and gating persist no summary file anywhere');
    assert.ok(brief.includes('.train/manifest.json'), 'the one persisted train path the brief names lives under .train/');
  } finally {
    ctx.cleanup();
  }
});

// ---------------------------------------------------------------------------
// Mutation C: a summary derived from verdict text fails the seal arm.
// ---------------------------------------------------------------------------

test('mutation C: a summary derived from verdict text fails the seal arm', async () => {
  await withReviewMutant(
    'mutC',
    [
      ['  const graphSummary = assembleTrainGraphSummary({', "  const graphSummary = (String((manifest && manifest.verdictTexts) || '') + '\\n' + assembleTrainGraphSummary({"],
      ['    range: { base: graphRangeBase, ref: graphRef },\n  }).summaryText;', '    range: { base: graphRangeBase, ref: graphRef },\n  }).summaryText);'],
    ],
    async (mutantReview) => {
      const ctx = ctxAt();
      try {
        const probe = 'MUTANT-C-PROBE-verdict-text-as-summary-7731';
        const manifest = {
          train: 't-wc-mutC',
          mainTip: 'f'.repeat(40),
          merges: [{ sha: 'a'.repeat(40), jobId: 'j-wc-mutC', subjects: [P1] }],
          verdictTexts: probe,
        };
        const args = {
          trainId: 't-wc-mutC',
          diffText: 'd',
          manifest,
          kinds: ['entry'],
          rung: { id: 'r' },
          outPath: join(ctx.reviewsDir, 't-wc-mutC.md'),
          capMinutes: 1,
          trainGraphAnalysis: () => null,
          graphBase: manifest.mainTip,
          graphRef: 'e'.repeat(40),
        };
        const mutantBrief = mutantReview.assembleTrainReviewBrief(ctx, args);
        assert.ok(mutantBrief.includes(probe), 'the mutant summary carries verdict text — the seal arm goes red');
        const shipped = assembleTrainReviewBrief(ctx, args);
        assert.ok(!shipped.includes(probe), 'the shipped summary is derived from the diff and the manifest subject set, never from records');
      } finally {
        ctx.cleanup();
      }
    },
  );
});

// ---------------------------------------------------------------------------
// Mutation D: an absent train record treated as approval goes green unasked.
// ---------------------------------------------------------------------------

test('mutation D: an absent record treated as approval goes green when it must not', async () => {
  await withReviewMutant(
    'mutD',
    [['    if (!g.ok) return g;', '    if (!g.ok && g.code !== "no-record") return g;\n    if (!g.ok) return { ok: true, verdict: { verdict: "approve", reasons: [], wouldCite: "mutant", readsHuman: "", readsHumanFrom: [], wouldCiteFor: [], data: { findings: [] }, raw: "" } };']],
    async (mutantReview) => {
      const ctx = ctxAt();
      try {
        const g = mutantReview.trainReviewGate(ctx, { trainId: 't-wc-mutD', kinds: ['entry'], subjects: [P1] });
        assert.equal(g.ok, true, 'the mutant approves an absent record — fail-closed goes green when it must not');
        const shipped = trainReviewGate(ctx, { trainId: 't-wc-mutD', kinds: ['entry'], subjects: [P1] });
        assert.equal(shipped.ok, false, 'the shipped gate still fails the absent record closed');
        assert.equal(shipped.code, 'no-record');
      } finally {
        ctx.cleanup();
      }
    },
  );
});

// ---------------------------------------------------------------------------
// Launch arms: the same parser, the same piece list — no second list either.
// ---------------------------------------------------------------------------

test('launch: the record reader carries entries through the one parser', () => {
  // A single mapping where a list is expected reads as a one-entry list —
  // the shared scalar-or-list rule, straight from the production parser.
  const single = parseWouldCiteFor({ 'would-cite-for': { subject: P1, statement: 'A reader following alpha would link it.' } });
  assert.deepEqual(single.wouldCiteFor, [{ subject: P1, statement: 'A reader following alpha would link it.' }]);
  assert.deepEqual(single.wouldCiteForWarnings, []);
  const ctx = ctxAt();
  try {
    const entries = [
      { subject: P1, statement: 'A reader following alpha would link it for the launch alpha argument.' },
      { subject: P2, statement: 'A reader following beta would link it for the launch beta argument.' },
    ];
    writeVerdictRecord(ctx, 'j-wc-launch', {
      verdict: 'approve',
      wouldCite: '',
      wouldCiteFor: entries,
      notes: 'would-cite-for-only record',
    });
    // `readReviewRecords` is the reader the launch check runs through its
    // join: what it carries is what the launch re-applies per piece.
    const records = readReviewRecords(ctx.reviewsDir);
    const rec = records.get('j-wc-launch.md');
    assert.ok(rec, 'the launch reader sees the record');
    assert.deepEqual(rec.verdict.wouldCiteFor, entries, 'entries round-trip through the one parser with subject and statement intact');
  } finally {
    ctx.cleanup();
  }
});

test('launch: the piece list agrees with the gate predicate on every content kind', () => {
  const body = `${'Running prose sentence with several words. '.repeat(20)}`;
  const corpus = {
    entry: [{ file: P1, body }],
    learn: [{ file: P2 }],
    tutorial: [{ file: P3 }],
    post: [{ file: 'content/blog/delta-post.md' }],
    delta: [{ file: 'content/deltas/epsilon.md' }],
  };
  const files = requiredRecordPieces(corpus).map((d) => d.file).sort();
  assert.deepEqual(
    files,
    [P1, P2, P3, 'content/blog/delta-post.md', 'content/deltas/epsilon.md'].sort(),
    'the launch requires records for the prose kinds and only them',
  );
  // The gate's predicate answers the same way on the corresponding paths, so
  // the two lists cannot drift: entry/learn/tutorial/post/delta prose, tool
  // and claim not.
  for (const f of files) assert.equal(isProsePiece(f), true, `gate predicate agrees ${f} is prose`);
  assert.equal(isProsePiece(TOOL), false, 'gate predicate agrees the tool row is not prose');
  assert.equal(isProsePiece(CLAIM_PAGE), false, 'gate predicate agrees the claim page is not prose');
});

test('launch: a would-cite-for-only record answers piece by piece or fails each piece it skips', () => {
  const body = `${'Running prose sentence with several words. '.repeat(20)}`;
  const corpus = {
    entry: [{ file: P1, body }],
    learn: [{ file: P2 }],
    tutorial: [{ file: P3 }],
    post: [],
    delta: [],
  };
  const pieces = requiredRecordPieces(corpus);
  assert.equal(pieces.length, 3, 'three required pieces on the production piece list');
  const full = [
    { subject: P1, statement: 'A reader following alpha would link it for the mapping alpha argument.' },
    { subject: P2, statement: 'A reader following beta would link it for the mapping beta argument.' },
    { subject: P3, statement: 'A reader following gamma would link it for the mapping gamma argument.' },
  ];
  const answeredBy = (entries) => pieces.filter((p) => entries.some((e) => e.subject === p.file)).map((p) => p.file);
  assert.deepEqual(answeredBy(full).sort(), [P1, P2, P3].sort(), 'full entries answer every piece');
  const short = full.filter((e) => e.subject !== P3);
  const unanswered = pieces.map((p) => p.file).filter((f) => !answeredBy(short).includes(f));
  assert.deepEqual(unanswered, [P3], 'a record skipping one piece fails exactly that piece');
});
