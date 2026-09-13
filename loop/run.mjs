#!/usr/bin/env node
/**
 * loop/run.mjs — the Desk.
 *
 *     node loop/run.mjs [--runner <id>] [--reviewer <id>] [--dry-run]
 *
 * THE ENTRY POINT IS AN ORDINARY COMMAND. Not a harness feature, not a skill,
 * not a slash command (specs/loop, portability requirement 1). "Model X, from
 * provider Y, using harness Z" is chosen at start time by `--runner`, and the
 * only file that names any of the three is `runners.yml`.
 *
 * One run does exactly one of:
 *   - resume the oldest resumable job branch, or
 *   - select and execute one new job, or
 *   - report that nothing qualified, which is a normal, healthy outcome.
 */

import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, rmSync, unlinkSync, writeFileSync } from 'node:fs';
import matter from 'gray-matter';
import { execFileSync } from 'node:child_process';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { makeContext } from './lib/paths.mjs';
import { loadConfig, JOB_TYPES } from './lib/config.mjs';
import { loadRunners, pickRunner, conformanceGate, loadConformance } from './lib/runners.mjs';
import { appendLedger, jobSpendSoFar, makeLedgerLine, nextJobId, readLedger, LEDGER_FIELDS } from './lib/ledger.mjs';
import { invocationAllowance, jobTotalMinutes, lanePause, minInvocationMinutes } from './lib/budget.mjs';
import { selectJob, escalationTarget, formatRefusals, candidateSubjects } from './lib/select.mjs';
import { assembleBrief, assembleRevisionBrief, governingTypeFor, invocationAccounting, resumeBrief } from './lib/brief.mjs';
import {
  classifyClaim,
  createLineageStore,
  gitResolveDigest,
  LINEAGE_RESOLVER_GIT,
  selectOutcomeLineage,
} from './lib/lineage.mjs';
import { readResult, classifyRun, reviewProducedNothing, parseGraphAck, parseReviewedLine, RESULT_FILENAME } from './lib/result.mjs';
import { runExecutor, jobLogPath } from './lib/exec.mjs';
import {
  addWorktree,
  changedPathsWithStatus,
  commitAll,
  currentBranch,
  deleteBranch,
  describeGitFailure,
  diffAgainst,
  gitTry,
  mergeBase,
  removeWorktree,
} from './lib/git.mjs';
import { scanJobBranches, readCommittedBrief, readCommittedJobSource } from './lib/resume.mjs';
import { runnerHealthGate, NO_OUTPUT_STREAK_LIMIT, NO_OUTPUT_SIGNAL } from './lib/health.mjs';
import {
  gateFailureNote,
  gatesHitEnvironmentalFailure,
  gatesHitTransportFailure,
  runGates,
  linkNodeModules,
  unlinkNodeModules,
  withFailingGateRetry,
  TRANSPORT_FAILURE_MARKER,
} from './lib/gates.mjs';
import { isDiffRefusal, isReissueRefusal, isContentPath, joinableSubjects, mergeGate, runReview, verdictPath, writeRecordSubjects, reviewedPerPageRecordPath, classifyReviewedRun, checkReviewedRunnerEligibility, reviewedGateTypeForPage, isRecordOfJob } from './lib/review.mjs';
import { normalizeReviewStatePath, reviewStateForPageAtBase } from './lib/review-state.mjs';
import { acquireWorkerSlot, admissionOverlap, assembleTrain, checkoutTrain, classifyRedTrain, ensureTrainBranch, evaluateTriggers, mergeJobBranch, pendingMerges, releaseWorkerSlot, runTrain, runTripwire, trainBounds, TRAIN_BRANCH } from './lib/train.mjs';
import {
  brakeScan,
  brakeState,
  checkBuildRed,
  checkConsecutiveFailures,
  checkDeployWindow,
  checkReviewBypass,
  checkReservedPaths,
  isPostRecordsRedOutcome,
  startGate,
} from './lib/breakers.mjs';
import { publishStep } from './lib/publish.mjs';
import { DERIVED_PATHS, dirtyDerivedInputs } from './lib/rederive.mjs';
import { readQueue } from './lib/queue.mjs';
import { markDirectiveDone } from './lib/directives.mjs';
import { localDate } from './lib/dates.mjs';
import { isIssueId, mergeIssueIds } from './lib/issues.mjs';
import {
  applyProposalMergeRules,
  consumeProposal,
  recordDiscardedAttempt,
  sweepExpiredProposals,
  transcribeNotedProposal,
} from './lib/proposals.mjs';
import { transcribeCarriedFindings } from './lib/carry.mjs';

// Process-lifetime outcome-lineage store (item 5 follow-up: first
// producer + judgment). `recordOutcome` classifies each outcome's
// computed triple against the lines this process already recorded, so
// repeats inside one process are judged; repeats across processes need
// the ledger-backed store named (not built) in `selectOutcomeLineage`.
// Resolution binds process.cwd() per call: the loop runs from the
// repository root, whose objects include every merge-base it records.
const outcomeLineageStore = createLineageStore({
  resolver: LINEAGE_RESOLVER_GIT,
  resolve: (digest, name) => gitResolveDigest(digest, { repoRoot: process.cwd(), resolverName: name }),
});

const USAGE = `node loop/run.mjs — one Desk run

  --runner <id>          runner for the author role (default: runners.yml \`default\`)
  --reviewer <id>        runner for the reviewer role (default: the registry's choice)
  --dry-run              print the selected or resumed job and its brief; invoke nothing
  --no-gates             skip the build/test gates (for machinery debugging only)
  --repo <path>          repository root
  --worktree-root <path> where job worktrees are created (outside the repo)
  --help
`;

export function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') out.dryRun = true;
    else if (a === '--no-gates') out.noGates = true;
    else if (a === '--help' || a === '-h') out.help = true;
    else if (a === '--runner') out.runner = argv[++i];
    else if (a === '--reviewer') out.reviewer = argv[++i];
    else if (a === '--repo') out.repo = argv[++i];
    else if (a === '--worktree-root') out.worktreeRoot = argv[++i];
    else out._.push(a);
  }
  return out;
}

/** The ledger line schema, printed by --dry-run so the shape is verifiable without a run. */
export function ledgerSchemaLine(job, runner, jobId) {
  return JSON.stringify(
    Object.fromEntries(
      LEDGER_FIELDS.map((k) => {
        switch (k) {
          case 'ts':
            return [k, '<iso timestamp>'];
          case 'id':
            return [k, jobId];
          case 'type':
            return [k, job?.type ?? '<job type>'];
          case 'runner':
            return [k, runner.id];
          case 'provider':
            return [k, runner.provider];
          case 'tier':
            return [k, runner.tier];
          case 'mm':
            return [k, '<model-minutes, measured by the loop>'];
          case 'outcome':
            return [k, '<done|failed|discarded|blocked|interrupted|capacity|abandoned>'];
          default:
            return [k, null];
        }
      }),
    ),
  );
}

// ---------------------------------------------------------------------------
// Work-order declaration, Stage 2 task 55 (amended: refusal scoped to merges
// carrying content paths).
//
// One job is one work order (1..N items). The loop authors the subject list,
// commits it to the branch at selection in `.job/source.json` before any
// executor runs, and the merge refuses a missing or empty declaration ONLY
// where the merged diff carries content paths — a merge with no content paths
// has nothing to bind and merges, binding nothing, logged (the code-only
// rule). The list records each item's bead, type, subjects and reason, plus
// the union of every item's subjects as the job's declared subjects. It is
// never derived by matching strings against the brief or any prose: a brief
// names paths to forbid them as readily as to assign them, so a substring
// test reads a prohibition as an authorisation. Subjects come from
// `candidateSubjects` (task 53) only, which reads declared metadata.
//
// Transition: branches selected before this task lands carry a source record
// without `items`/`declared_subjects` and complete under the old single-item
// contract — no declaration required, a missing declaration is not a refusal
// for them, and they take no graph arm (no annex, no sidecar, no marker).
// The committed declaration is the sole subject source the brief's graph
// annex reads; old-contract branches read as null there.
// ---------------------------------------------------------------------------

/**
 * One work-order item for a selected candidate: bead, type, subjects, reason.
 * Subjects come from `candidateSubjects` only, never title/detail/prose.
 * Bead is null until intake mints one. Reason is provenance only — a human-
 * readable note about why the item was selected — and must never become
 * substring-matchable authorisation: every consumer reads `items[].subjects`
 * and `declared_subjects` and never matches strings inside `reason`.
 */
export function workOrderItemForCandidate(candidate) {
  const subjects = candidateSubjects(candidate ?? {});
  const bead =
    typeof candidate?.bead === 'string' && candidate.bead ? candidate.bead : null;
  const type = candidate?.type ?? null;
  const reason = String(
    candidate?.title ?? candidate?.slug ?? candidate?.id ?? type ?? '',
  ).slice(0, 200);
  return { bead, type, subjects, reason };
}

/**
 * The brief-side graph seam's production answer (task 59). The index lives
 * beside the checked-out tree at the repository root store, never in a job
 * worktree; queries run against the merge-base tree, never uncommitted
 * worktree state; the index is refreshed by an explicit analyze step outside
 * any job — no job writes it, no merge path refreshes it, jobs read it
 * read-only. No such wired index exists on this path today, so production
 * answers absent (recorded warning plus `graph: absent`, merge proceeds on
 * the path checks alone). The seam exists so the annex and sidecar are
 * assembled through one injected function tests stub (task-12 fixture
 * pattern): one call per declared subject, observed inside the callback.
 */
export function briefGraphQueryForSubject(subject) {
  return { absent: true, reason: 'no graph index wired on the brief path' };
}

/**
 * The N=1 declaration selection commits today: one item, its subjects as the
 * union. Multi-item bundling reuses the same item shape; the union stays the
 * sorted union of every item's subjects.
 */
export function buildWorkOrderDeclaration(candidate) {
  const item = workOrderItemForCandidate(candidate);
  return { items: [item], declared_subjects: [...item.subjects] };
}

/**
 * True for branches selected before task 55: the committed source carries
 * neither the `items` key nor the `declared_subjects` key. Detection is by key
 * presence, not by array shape, so any present-but-malformed value (a key
 * present without an array) is NOT old — it falls through to the declaration
 * check below and fails closed. Both keys absent together is the only old
 * shape; a record carrying exactly one key is a partial write, never old.
 */
export function isOldContractSource(source) {
  if (!source || typeof source !== 'object' || Array.isArray(source)) return true;
  const hasItemsKey = Object.prototype.hasOwnProperty.call(source, 'items');
  const hasDeclaredKey = Object.prototype.hasOwnProperty.call(source, 'declared_subjects');
  return !hasItemsKey && !hasDeclaredKey;
}

/**
 * The sole subject source the brief's graph annex reads. Old-contract
 * branches read as null: no annex, no sidecar, no marker. New-contract
 * branches read as a copy of the committed union — never the brief text.
 * Null also covers a present-but-unreadable partial (the merge gate, not this
 * helper, is the sole authority for partials: it refuses them, so no annex
 * row is ever assembled from them here).
 */
export function declaredSubjectsForAnnex(source) {
  if (isOldContractSource(source)) return null;
  if (!Array.isArray(source.declared_subjects)) return null;
  return [...source.declared_subjects];
}

/**
 * The declaration-only check: old-contract sources pass through (transition);
 * anything else must carry a non-empty items list and a non-empty declared
 * union. This answers "is anything declared", never "does the diff need it" —
 * the merge gate below combines it with the diff's content paths.
 */
export function checkCommittedDeclaration(source) {
  if (isOldContractSource(source)) return { ok: true, oldContract: true, declared: null };
  const items = source.items;
  const declared = source.declared_subjects;
  if (!Array.isArray(items) || items.length === 0) {
    return {
      ok: false,
      oldContract: false,
      code: 'missing-declaration',
      reason: 'nothing to bind: committed work-order items missing or empty — refusing',
    };
  }
  if (!Array.isArray(declared) || declared.length === 0) {
    return {
      ok: false,
      oldContract: false,
      code: 'missing-declaration',
      reason: 'nothing to bind: committed declared subjects missing or empty — refusing',
    };
  }
  return { ok: true, oldContract: false, declared: [...declared] };
}

/**
 * The amended merge decision (task 55 as amended): the declaration refusal is
 * gated on content-path presence in the merged diff.
 *
 * - Old-contract sources pass through with no refusal and no graph arm.
 * - Where the merged diff carries no joinable content path (`contentPaths`
 *   empty, measured with the same `joinableSubjects` predicate task 56 uses),
 *   the merge binds nothing, logs, and merges — even with a missing or empty
 *   declaration.
 * - Where the diff carries content paths, a missing or empty declaration
 *   refuses, naming the content path(s); a non-empty declaration passes this
 *   gate (the subset check against the union is task 56's, not here).
 *
 * `contentPaths` is the joinable-content list for the branch diff, never
 * brief prose. Callers compute it with `joinableSubjects`; this function
 * invents no second detector.
 */
export function declarationMergeDecision(source, contentPaths) {
  if (isOldContractSource(source)) {
    return { ok: true, oldContract: true, bindsNothing: false, declared: null };
  }
  const content = Array.isArray(contentPaths) ? contentPaths.filter(Boolean) : [];
  const decl = checkCommittedDeclaration(source);
  if (content.length === 0) {
    return {
      ok: true,
      oldContract: false,
      bindsNothing: true,
      declared: decl.ok ? [...decl.declared] : [],
    };
  }
  if (!decl.ok) {
    return {
      ok: false,
      oldContract: false,
      code: decl.code,
      reason: `${decl.reason} — refusing content path(s): ${content.join(', ')}`,
      content: [...content],
    };
  }
  return { ok: true, oldContract: false, bindsNothing: false, declared: [...decl.declared] };
}

// ---------------------------------------------------------------------------
// Work-order merge constitution and per-item retirement (Stage 2, task 56:
// the root fix).
//
// Anchor (task-32 rule): the `joinableSubjects(...)` constitution site in the
// merge path below and the refusal branch guarding it. Everything here is
// keyed on names the task text names — `declared_subjects`, `scope-violation`,
// `graph-ack:`, `graph-incomplete`, `graph: absent` — never on line numbers.
//
// THE DEFECT, in one sentence: the merge constituted its subject set from the
// measured diff, which is empty when the diff is empty (a record binding
// nothing for pages dispatched to ratify) and a subset when the diff is a
// subset (four items selected, one file changed, all four retired). The fix:
// the set is CONSTITUTED from the committed declaration and the diff only
// CHECKS it, and retirement is PER ITEM.
//
// Reuse, not reimplementation: `candidateSubjects`/`bundleWorkOrders`
// (task 53, `loop/lib/select.mjs`), `buildWorkOrderDeclaration` /
// `checkCommittedDeclaration` / `declarationMergeDecision` /
// `isOldContractSource` (task 55, above), `joinableSubjects` /
// `writeRecordSubjects` (`loop/lib/review.mjs`), `parseGraphAck`
// (`loop/lib/result.mjs`).
//
// What this block does NOT own (later tasks): the brief-side annex and
// `.job/graph.json` writer (task 59 — landed), per-item proposal consumption
// (task 66), the ledger `items` key (task 67), and bead closure (task 69 —
// no module may invoke `bd` before it). The `reviewed:` outcome's production
// wiring (task 62) rides this same block through `checkReviewedMerge` — the
// helpers below accept executor-declared paths as an argument, which is what
// lets that gate constitute from the declaration without a re-design.
// Unretired items are reported open (log + ledger note) and return to intake
// by staying unretired: nothing here closes or consumes per item.
// are reported open (log + ledger note) and return to intake by staying
// unretired: nothing here closes or consumes per item.
// ---------------------------------------------------------------------------

/** Normalise one declared/diff path for set joins: POSIX slashes, trimmed. */
function normSubjectPath(p) {
  return String(p ?? '').replace(/\\/g, '/').trim();
}

/**
 * The merge's subject set, constituted from the committed declaration — never
 * from the measured diff, never from brief prose.
 *
 * - Old-contract sources (pre-task-55, neither key present) read as
 *   `{oldContract: true, subjects: null}`: the caller falls back to the
 *   diff-derived set, exactly as before, and takes no graph arm.
 * - On the read-and-unchanged outcome the set is the executor's declared
 *   paths intersected with the committed union (`executorPaths`, parsed from
 *   the result file by task 62's reader — passed in here so the constitution
 *   point is one function, not two).
 * - Otherwise the set is the committed union, sorted and de-duplicated.
 *
 * A missing or empty declaration is `{ok: false}`; the caller combines that
 * with the diff's content presence through `declarationMergeDecision`
 * (task 55, amended: refusal only where the diff carries content paths).
 */
export function constituteMergeSubjects(source, { executorPaths = null } = {}) {
  if (isOldContractSource(source)) return { ok: true, oldContract: true, subjects: null };
  const decl = checkCommittedDeclaration(source);
  if (!decl.ok) {
    return { ok: false, oldContract: false, code: decl.code, reason: decl.reason };
  }
  const declared = [...new Set(decl.declared.map(normSubjectPath).filter(Boolean))].sort();
  if (executorPaths !== null && executorPaths !== undefined) {
    const exec = new Set(
      (Array.isArray(executorPaths) ? executorPaths : [executorPaths])
        .map(normSubjectPath)
        .filter(Boolean),
    );
    return { ok: true, oldContract: false, subjects: declared.filter((s) => exec.has(s)) };
  }
  return { ok: true, oldContract: false, subjects: declared };
}

/**
 * The CHECK direction: every joinable content path in the measured diff must
 * lie inside the constituted declaration, or the merge refuses with
 * `scope-violation` naming the undeclared path(s). Content-scoped only —
 * code paths never fail this check (a code-only merge binds nothing and
 * merges; task 55's amended gate) — and exact-member joins only: nothing
 * here matches strings inside brief prose.
 */
export function checkDeclarationSubset(contentPaths, declared) {
  const allowed = new Set((Array.isArray(declared) ? declared : []).map(normSubjectPath).filter(Boolean));
  const undeclared = [...new Set((Array.isArray(contentPaths) ? contentPaths : []).map(normSubjectPath).filter(Boolean))]
    .filter((p) => !allowed.has(p))
    .sort();
  return { ok: undeclared.length === 0, undeclared };
}

// ---------------------------------------------------------------------------
// The read-and-unchanged (`reviewed:`) outcome (Stage 2, task 62).
//
// The executor's first line names pages it read, judged sound, and left
// unchanged. The helpers below reuse task 61b's join (the ONLY source of
// truth for the mismatched precondition — never a derived store, never the
// change analysis), task 56's constitution/intersection helpers, and task
// 59's annex filter (which lives in the review brief, not here).
//
// Reuse, not reimplementation: `parseReviewedLine` (`loop/lib/result.mjs`),
// `constituteMergeSubjects` + `resolveCarriedDeclaration` (above),
// `reviewStateForPageAtBase` (`loop/lib/review-state.mjs`), `isContentPath`
// (`loop/lib/review.mjs`), `parseGraphAck` (`loop/lib/result.mjs`).
// ---------------------------------------------------------------------------

/**
 * Whether an empty branch diff fails the outcome. A `done` outcome with an
 * empty diff is settled `failed` (nothing was claimed); a `reviewed:`
 * outcome with an empty diff is the finding itself and is NOT a failure.
 * Exported so the executor path and the tests share one predicate.
 */
export function emptyDiffFailsOutcome(status) {
  return status !== 'reviewed';
}

/**
 * The executor-declared reviewed paths from a result file's text, or null
 * where the outcome is not a `reviewed:` outcome. Reads the first line
 * only, through `parseReviewedLine` — the one reader for this shape.
 */
export function reviewedPathsFromResultText(text) {
  const firstLine = String(text ?? '').split(/\r?\n/, 1)[0].trim();
  const parsed = parseReviewedLine(firstLine);
  return parsed && parsed.ok ? parsed.paths : null;
}

/**
 * Per-page verdict record paths for one pass, in page-index order (Stage 2,
 * task 63 fix F2, G1).
 *
 * Probes `reviewedPerPageRecordPath(ctx, jobId, i, pass)` for every `i` in
 * 0..99 and returns every existing record in ascending index order. There is
 * deliberately NO early break at the first gap: a page-0 review that writes
 * no record (silent reviewer → the gate refuses no-record, the loop
 * continues) followed by a page-1 approval leaves page 1's record past a
 * gap, and stopping at the gap would lose it. The transcription block and
 * its tests share this one reader, so the per-page set is detected from the
 * records on disk plus `result.verdict` — never from `mergeSubjects`, which
 * is only ever set on approve and is null on discard.
 */
export function perPageRecordPathsForPass(ctx, jobId, pass) {
  const out = [];
  const p = Number(pass) || 1;
  for (let i = 0; i < 100; i++) {
    let perPath;
    try {
      perPath = reviewedPerPageRecordPath(ctx, jobId, i, p);
    } catch {
      continue;
    }
    let present = false;
    try {
      present = existsSync(perPath);
    } catch {
      present = false;
    }
    if (!present) continue;
    out.push(perPath);
  }
  return out;
}

/**
 * This job's per-page verdict records as repo-relative paths, any pass
 * (Stage 2, task 63 fix F1).
 *
 * Lists `ctx.reviewsDir` for names where `isRecordOfJob(name, jobId)` is
 * true and the name carries the per-page `.reviewed-` marker — exact paths
 * only, never `add -A`. The records-commit and its tests share this one
 * reader, so a multi-page reviewed job's per-page records travel with the
 * ledger line that approves them.
 */
export function jobPerPageRecordRelPaths(ctx, jobId) {
  let names;
  try {
    names = readdirSync(ctx.reviewsDir);
  } catch (e) {
    // G3: an absent reviews dir stays silent `[]` —
    // early-exit paths may never have created it, and that half of the catch
    // is load-bearing. Any OTHER read error (permissions/AV lock) is logged
    // LOUDLY: silently omitting per-page records from the records commit is
    // the exact defect class F1 closed. Either way the caller stages what
    // this returns, so the ledger line still commits — failing the records
    // commit over this would lose the budget.
    if (e?.code === 'ENOENT') return [];
    ctx.log(`STAGING: could not read reviews dir ${ctx.reviewsDir}: ${e?.message ?? e} — staging no per-page records, the ledger line still commits`);
    return [];
  }
  const out = [];
  for (const name of names ?? []) {
    if (!isRecordOfJob(name, jobId)) continue;
    if (!String(name).includes('.reviewed-')) continue;
    out.push(relative(ctx.repoRoot, join(ctx.reviewsDir, name)).replace(/\\/g, '/'));
  }
  return out.sort();
}

/**
 * The CHECK direction for the reviewed outcome: no diff on a declared
 * subject may accompany it. Every joinable content path lying inside the
 * constituted union refuses, `failed` naming the path — an accompanying
 * diff is work the bounds never measured.
 *
 * @returns {{ok: true}|{ok: false, code: 'reviewed-with-diff', reason: string, paths: string[]}}
 */
export function checkReviewedDiffEmpty(contentPaths, union) {
  const allowed = new Set((Array.isArray(union) ? union : []).map(normSubjectPath).filter(Boolean));
  const offending = [...new Set((Array.isArray(contentPaths) ? contentPaths : []).map(normSubjectPath).filter(Boolean))]
    .filter((p) => allowed.has(p))
    .sort();
  if (!offending.length) return { ok: true };
  return {
    ok: false,
    code: 'reviewed-with-diff',
    reason:
      `reviewed-with-diff: the reviewed: outcome carries a non-empty diff on declared subject(s) ${offending.join(', ')} — ` +
      `a read-and-unchanged outcome binds pages without a diff, so an accompanying diff is refused`,
    paths: offending,
  };
}

/**
 * Graph emptiness corroboration for the reviewed outcome: the change
 * analysis over the branch diff against the merge base must report zero
 * changed symbols on every declared subject where the index answers for
 * that universe. `no-symbols` prose pages (outside any symbol universe)
 * are complete on this check; a non-empty symbol set on a declared
 * subject is refused, `failed` naming the path, as a non-empty diff is.
 *
 * The graph output is never a hash input and never a substitute for the
 * review-state precondition above: it corroborates emptiness, and only
 * emptiness. Absent tool/index yields `graph: absent` and ratification
 * proceeds on the path, hash, and precondition checks. Present-but-
 * incomplete answers are NOT judged here — `checkMergeGraphScope` refuses
 * those as `graph-incomplete` before this runs, and that refusal stands
 * rather than ratifying.
 *
 * @param {string[]} declared  the constituted union (carried-resolved)
 * @param {object|null} analysis  the merge-path analysis (or absent)
 * @returns {{ok: boolean, code?: string, reason?: string, warnings: string[]}}
 */
export function checkReviewedGraphEmptiness(declared, analysis) {
  const warnings = [];
  const declaredSet = new Set((Array.isArray(declared) ? declared : []).map(normSubjectPath).filter(Boolean));
  if (!analysis || analysis.absent) {
    warnings.push(
      `graph: absent — ${normSubjectPath(analysis?.reason) || 'no graph analysis available on this path'}; ` +
      `ratification proceeds on the path, hash, and precondition checks alone`,
    );
    return { ok: true, warnings };
  }
  const symbols = Array.isArray(analysis.symbols) ? analysis.symbols : [];
  const universes = analysis.subjects && typeof analysis.subjects === 'object' ? analysis.subjects : {};
  let offender = null;
  for (const sym of symbols) {
    const owner = normSubjectPath(sym?.owner);
    if (!owner) {
      warnings.push(`graph: changed symbol ${JSON.stringify(sym?.name ?? '?')} carries no owner path — reviewer-only, never a refusal`);
      continue;
    }
    if (!isContentPath(owner)) {
      warnings.push(`graph: changed symbol ${JSON.stringify(sym?.name ?? '?')} owned by non-content path ${owner} — reviewer-only, never a refusal`);
      continue;
    }
    if (!declaredSet.has(owner)) continue;
    const entry = universes[owner];
    if (entry && entry.universe === false) continue;
    if (offender === null) offender = owner;
  }
  if (offender !== null) {
    return {
      ok: false,
      code: 'reviewed-with-symbols',
      reason:
        `reviewed-with-symbols: the reviewed: outcome names ${offender} as read-and-unchanged, ` +
        `but the change analysis reports changed symbol(s) owned by that declared subject — ` +
        `a non-empty symbol set on a declared subject is refused as a non-empty diff is`,
      warnings,
    };
  }
  return { ok: true, warnings };
}

/**
 * The reviewed merge gate: preconditions, diff emptiness, graph scope, and
 * graph emptiness in one place, so the merge path and the tests share one
 * implementation.
 *
 * Order, and why: the committed declaration authorises (an executor cannot
 * widen its own authorisation, so undeclared paths refuse before anything
 * is read at the base); the task-61b join answers mismatched-or-not at the
 * pinned base; the diff check refuses accompanying work; the graph scope
 * (`checkMergeGraphScope`, with the executor's paths as `reviewedPaths`)
 * refuses incompleteness and scores retirement; emptiness corroborates.
 *
 * Binds ONLY where a committed declaration exists: old-contract branches
 * and missing/empty declarations refuse whatever the first line said.
 * `subjects` on success is the executor's paths intersected with the
 * committed union (via `constituteMergeSubjects`) — never the measured
 * diff, which is empty by construction here. The caller sets
 * `mergeSubjects` from it EVEN on an otherwise advisory merge: a reviewed
 * outcome binds pages, so the null path that leaves the record to the
 * diff-derived fallback (mutation A's defect) must not resurface.
 *
 * @returns {{ok: true, subjects: string[], warnings: string[], graphStatus: string, retirement: object} |
 *            {ok: false, code: string, reason: string, warnings: string[], retirement?: object}}
 */
export function checkReviewedMerge({
  repoRoot,
  base,
  source,
  reviewedPaths,
  contentPaths = [],
  diffPaths = [],
  resultText = '',
  analysis = undefined,
  sidecar = null,
}) {
  const warnings = [];
  const paths = [...new Set((Array.isArray(reviewedPaths) ? reviewedPaths : []).map(normSubjectPath).filter(Boolean))].sort();
  if (!paths.length) {
    return {
      ok: false,
      code: 'reviewed-empty',
      reason: 'reviewed-empty: the reviewed: outcome names no page path — nothing to ratify',
      warnings,
    };
  }
  if (isOldContractSource(source)) {
    return {
      ok: false,
      code: 'reviewed-no-declaration',
      reason:
        `reviewed-no-declaration: the reviewed: outcome names ${paths.join(', ')} but the branch carries no committed ` +
        `work-order declaration — a reviewed outcome binds only where a committed declaration exists`,
      warnings,
    };
  }
  const decl = checkCommittedDeclaration(source);
  if (!decl.ok) {
    return {
      ok: false,
      code: 'reviewed-no-declaration',
      reason:
        `reviewed-no-declaration: the reviewed: outcome names ${paths.join(', ')} but ${decl.reason} — ` +
        `a reviewed outcome binds only where a committed declaration exists`,
      warnings,
    };
  }
  const constituted = constituteMergeSubjects(source, { executorPaths: paths });
  if (!constituted.ok) {
    return { ok: false, code: constituted.code, reason: constituted.reason, warnings };
  }
  // Carried resolution joins the union exactly as the done path does, so a
  // page declared through a carried finding counts as declared here too.
  const carried = resolveCarriedDeclaration(constituted.subjects, {
    readFile: (p) => {
      try {
        const r = gitTry(repoRoot, ['show', `${base}:${p}`]);
        return r.ok ? r.stdout : null;
      } catch {
        return null;
      }
    },
  });
  for (const m of carried.missing) {
    warnings.push(`carried declaration ${m.path} contributes nothing to the union (${m.why})`);
  }
  const union = carried.subjects;
  const unionSet = new Set(union);
  if (!constituted.subjects.length) {
    return {
      ok: false,
      code: 'reviewed-undeclared',
      reason:
        `reviewed-undeclared: the reviewed: outcome names ${paths.join(', ')} but none lies inside the committed ` +
        `declared subjects (${union.join(', ') || '(none)'}) — the paths are read from the executor's line but authorised by the loop's committed list`,
      warnings,
    };
  }
  // Authorisation first: every named path must lie inside the union before
  // the base is read for any of them.
  const outside = paths.filter((p) => !unionSet.has(p)).sort();
  if (outside.length) {
    return {
      ok: false,
      code: 'reviewed-undeclared',
      reason:
        `reviewed-undeclared: the reviewed: outcome names ${outside.join(', ')} outside the committed declared ` +
        `subjects (${union.join(', ')}) — an executor cannot widen its own authorisation`,
      warnings,
    };
  }
  // The precondition, from the task-61b capability as its ONLY source of
  // truth: every path must already read `mismatched` at the pinned base.
  // Re-read here, at merge time — never cached from brief assembly, never a
  // derived store, never the change analysis.
  for (const p of paths) {
    let state = null;
    let detail = '';
    try {
      const r = reviewStateForPageAtBase(repoRoot, base, normalizeReviewStatePath(p));
      state = r.state;
      detail = r.record ? ` (record ${r.record})` : '';
    } catch (e) {
      state = 'missing';
      detail = ` (the join could not be read: ${String(e?.message ?? e).slice(0, 120)})`;
    }
    if (state !== 'mismatched') {
      return {
        ok: false,
        code: 'reviewed-not-mismatched',
        reason:
          `reviewed-not-mismatched: the reviewed: outcome names ${p} but it reads ${state} at the merge base ` +
          `${String(base).slice(0, 12)}${detail}, not mismatched — only a page already reviewed-then-changed can be ratified as read-and-unchanged`,
        warnings,
      };
    }
  }
  const diffCheck = checkReviewedDiffEmpty(contentPaths, union);
  if (!diffCheck.ok) {
    return { ok: false, code: diffCheck.code, reason: diffCheck.reason, warnings };
  }
  // The universal subset rule (task 56, reused — not a second detector):
  // every diff content path lies inside the union, or the merge refuses
  // `scope-violation`. The check above refuses accompanying work on declared
  // subjects as `reviewed-with-diff`; this one refuses work the order never
  // declared at all.
  const subset = checkDeclarationSubset(contentPaths, union);
  if (!subset.ok) {
    return {
      ok: false,
      code: 'scope-violation',
      reason:
        `scope-violation: merged diff touches undeclared content path(s) ${subset.undeclared.join(', ')} — ` +
        `every diff content path must lie inside the committed declaration`,
      warnings,
    };
  }
  const scope = checkMergeGraphScope({
    source,
    declared: union,
    contentPaths,
    diffPaths,
    reviewedPaths: paths,
    resultText,
    analysis,
    sidecar,
    carried: carried.resolved,
    advisoryScope: false,
  });
  for (const w of scope.warnings) warnings.push(w);
  if (!scope.ok) {
    return { ok: false, code: scope.code, reason: scope.reason, warnings, retirement: scope.retirement };
  }
  const emptiness = checkReviewedGraphEmptiness(union, analysis);
  for (const w of emptiness.warnings) warnings.push(w);
  if (!emptiness.ok) {
    return { ok: false, code: emptiness.code, reason: emptiness.reason, warnings, retirement: scope.retirement };
  }
  const pathSet = new Set(paths);
  return { ok: true, subjects: union.filter((s) => pathSet.has(s)).sort(), warnings, graphStatus: scope.graphStatus, retirement: scope.retirement };
}

/**
 * One work-order item's normalised subject list. A present-but-malformed
 * `subjects` (not an array) reads as no subjects — the item can then only
 * retire on read-and-unchanged coverage of nothing, i.e. never, which fails
 * closed rather than retiring work with no declared surface.
 */
function itemSubjectsOf(item) {
  if (!item || !Array.isArray(item.subjects)) return [];
  return [...new Set(item.subjects.map(normSubjectPath).filter(Boolean))].sort();
}

/**
 * Per-item retirement: an item retires only where the merge measured a diff
 * on that item's OWN declared subjects, or where the outcome declared those
 * subjects as read-and-unchanged. Anything else stays open and returns to
 * intake; the ledger line records the order partially done naming every
 * item it did not retire.
 *
 * Evidence model (all joins exact-member on normalised paths):
 * - `diffPaths`: every non-deletion diff path (content AND code — a
 *   machinery item's subject is a code file, and a code-only merge still
 *   retires what it did even though it binds no record). Scaffolding must
 *   already be filtered by the caller.
 * - `reviewedPaths`: executor-declared read-and-unchanged paths, or null
 *   (no such outcome on this merge). An item is covered only where EVERY
 *   one of its subjects is covered.
 * - `graph`: the merge-time analysis (`{symbols: [{owner}], subjects:
 *   {<path>: {universe, symbols, risk}}}`), or null where the tool/index is
 *   absent — absent proceeds on the path checks alone. The graph NEVER
 *   retires or unretires alone: it only refines shared-subject attribution
 *   and reports contradiction.
 * - `carried`: `resolveCarriedDeclaration`'s `resolved` map
 *   (`{<carried path>: [<page>, ...]}`), or null. A carried file declares
 *   its page structurally, so the page counts as the declaring item's own
 *   subject for diff hits and coverage alike.
 *
 * Shared-subject refinement: a diff hit on a subject the item ALONE declares
 * retires on the path evidence. A hit ONLY on subjects other items also
 * declare retires only with the item's OWN symbol evidence — a changed
 * symbol owned by a subject that item alone declares — because shared path
 * evidence attributes to every declarer equally and therefore to none. The
 * unattributed item retires only on independent path evidence.
 * Contradiction (a path hit on a subject whose universe the present index
 * answers with zero symbols) retires nothing: the item stays open and the
 * report names the subject, the diff evidence, and the zero-symbol answer.
 * `no-symbols` (universe === false: outside any symbol universe) is
 * complete — those items retire on the path diff alone, graph summary-only.
 *
 * @returns {{oldContract?: boolean, retired: Array, open: Array,
 *            partiallyDone: boolean, note: string|null}}
 *   `retired` entries carry `{index, item, via: 'diff'|'reviewed', touched}`.
 *   `open` entries carry `{index, item, why, contradiction?}`.
 */
export function retireWorkOrderItems(source, { diffPaths = [], reviewedPaths = null, graph = null, carried = null } = {}) {
  if (isOldContractSource(source)) {
    return { oldContract: true, retired: [], open: [], partiallyDone: false, note: null };
  }
  const items = Array.isArray(source.items) ? source.items : [];
  const diffSet = new Set((Array.isArray(diffPaths) ? diffPaths : []).map(normSubjectPath).filter(Boolean));
  const reviewedSet =
    reviewedPaths === null || reviewedPaths === undefined
      ? null
      : new Set(
        (Array.isArray(reviewedPaths) ? reviewedPaths : [reviewedPaths])
          .map(normSubjectPath)
          .filter(Boolean),
      );
  const allSubjects = items.map(itemSubjectsOf);
  // F1: a carried file declares its page structurally — the resolved page
  // joins the declaring item's effective subjects, so the fixing diff (on
  // the page) is a measured diff on the item's own subjects. Sharing is
  // counted over the same effective surface the hits are measured on.
  const carriedMap = carried instanceof Map ? carried : new Map(Object.entries(carried ?? {}));
  const effectiveOf = (subs) => [
    ...new Set([...subs, ...subs.flatMap((s) => carriedMap.get(s) ?? [])]),
  ].sort();
  const allEffective = allSubjects.map(effectiveOf);
  const declarerCount = new Map();
  for (const subs of allEffective) {
    for (const s of subs) declarerCount.set(s, (declarerCount.get(s) ?? 0) + 1);
  }
  const symbols = Array.isArray(graph?.symbols) ? graph.symbols : [];
  const universes = graph && typeof graph.subjects === 'object' && graph.subjects !== null ? graph.subjects : {};
  const retired = [];
  const open = [];
  items.forEach((item, index) => {
    const subjects = allSubjects[index];
    const effective = allEffective[index];
    const hit = effective.filter((s) => diffSet.has(s));
    const exclusiveHit = hit.filter((s) => (declarerCount.get(s) ?? 0) === 1);
    const sharedHit = hit.filter((s) => (declarerCount.get(s) ?? 0) > 1);
    const reviewedHit =
      reviewedSet !== null && effective.length > 0 && effective.every((s) => reviewedSet.has(s));
    if (reviewedHit) {
      retired.push({ index, item, via: 'reviewed', touched: [...hit] });
      return;
    }
    // Contradiction first: a measured diff on a subject whose universe the
    // present index answers with zero symbols retires nothing.
    const contradiction = graph
      ? hit.filter((s) => universes[s]?.universe === true && (universes[s]?.symbols ?? []).length === 0)
      : [];
    if (contradiction.length) {
      open.push({
        index,
        item,
        why: `measured diff on ${contradiction.join(', ')} but the present index answers zero symbols for its universe`,
        contradiction: [...contradiction],
        touched: [...hit],
      });
      return;
    }
    if (exclusiveHit.length) {
      retired.push({ index, item, via: 'diff', touched: [...hit] });
      return;
    }
    if (sharedHit.length) {
      if (!graph) {
        // Absent tool/index: the path checks stand alone.
        retired.push({ index, item, via: 'diff', touched: [...hit] });
        return;
      }
      const ownEvidence = symbols.some((sym) => {
        const owner = normSubjectPath(sym?.owner);
        return owner && effective.includes(owner) && (declarerCount.get(owner) ?? 0) === 1;
      });
      if (ownEvidence) {
        retired.push({ index, item, via: 'diff', touched: [...hit] });
        return;
      }
      open.push({
        index,
        item,
        why: `diff only on shared subject(s) ${sharedHit.join(', ')} with no symbol evidence of its own — retires only on independent path evidence`,
        touched: [...hit],
      });
      return;
    }
    open.push({
      index,
      item,
      why: subjects.length
        ? `no measured diff on its subjects (${subjects.join(', ')}) and no read-and-unchanged coverage`
        : 'the item declares no subjects, so no measured diff can cover it',
      touched: [],
    });
  });
  const partiallyDone = open.length > 0;
  const label = (e) => {
    const subs = itemSubjectsOf(e.item);
    return `item ${e.index + 1}${subs.length ? ` [${subs.join(', ')}]` : ' [no subjects]'}`;
  };
  const note =
    items.length === 0
      ? null
      : partiallyDone
        ? `partially done: retired ${retired.length} of ${items.length} items; still open: ${open.map(label).join('; ')}`
        : null;
  return { retired, open, partiallyDone, note };
}

/**
 * Read the committed merge-time graph sidecar (`.job/graph.json`, written at
 * brief assembly beside the brief — task 59's writer; consumed here and at
 * discard, never landing as a live path). Shape: `{subjects: {<declared
 * path>: {symbols|no-symbols marker, callers, processes, risk,
 * partial/truncated flags, index identifier}}}` — presence of a subject key
 * is that subject's per-item evidence. Absent or unparseable reads as null,
 * never as evidence: the gate fails closed on a missing sidecar where one is
 * required, and skips the sidecar check where the graph is absent.
 */
export function readCommittedGraphSidecar(repo, branch) {
  const r = gitTry(repo, ['show', `${branch}:.job/graph.json`]);
  if (!r.ok) return null;
  try {
    const parsed = JSON.parse(r.stdout);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Whether a path is content-path-shaped for graph-scope purposes: the
 * shared `isContentPath` membership from `loop/lib/review.mjs` (F5 — one
 * predicate, not two). Graph scope corroboration is content-path-scoped:
 * symbols with a content-path owner are checked against the declaration;
 * every other symbol and every transitive affected process is reviewer
 * information only and never refuses.
 */
function isContentPathShaped(p) {
  return isContentPath(p);
}

/**
 * A declared carried-finding path: `data/carried/*.md`, never the directory
 * README — the same membership `unearnedCarriedDeletion` (`loop/lib/review.mjs`)
 * uses for what counts as a finding. Such a path declares its page
 * structurally (F1): its `subject:` front-matter field joins the union.
 */
const CARRIED_DECLARATION_RE = /^data\/carried\/[^/]+\.md$/;

function isCarriedDeclarationPath(p) {
  const n = normSubjectPath(p);
  return CARRIED_DECLARATION_RE.test(n) && !n.endsWith('/README.md');
}

/**
 * Resolve declared carried files into the constitution-time union (F1: the
 * task-56 amendment). Each declared `data/carried/*.md` path contributes
 * that file's `subject:` front-matter field — read structurally, never
 * prose — so a carried fix's page diff lies inside the declared set.
 *
 * `readFile` is the history-pinned reader: the merge path reads each file at
 * the merge base (`git show <base>:<path>`), the tree the diff is measured
 * against — never worktree state, since the job's own diff deletes the
 * finding it fixes. A missing or unreadable file, an unparseable block, or
 * a missing/empty `subject:` field contributes NOTHING (fail closed toward
 * refusal) and is reported in `missing` for the merge log.
 *
 * @param {string[]} declared  the constituted declaration (normalised)
 * @param {{readFile?: ((path: string) => string|null)}} [opts]
 * @returns {{subjects: string[], resolved: Record<string, string[]>, missing: Array<{path: string, why: string}>}}
 *   `subjects` is the sorted union; `resolved` maps each carried path to the
 *   page(s) it contributed (per-item retirement reads the same map, so the
 *   page counts as the declaring item's own subject).
 */
export function resolveCarriedDeclaration(declared, { readFile = null } = {}) {
  const union = new Set((Array.isArray(declared) ? declared : []).map(normSubjectPath).filter(Boolean));
  const resolved = {};
  const missing = [];
  for (const path of [...union]) {
    if (!isCarriedDeclarationPath(path)) continue;
    if (typeof readFile !== 'function') {
      missing.push({ path, why: 'no history reader available' });
      continue;
    }
    let text = null;
    try {
      text = readFile(path);
    } catch {
      text = null;
    }
    if (typeof text !== 'string' || !text) {
      missing.push({ path, why: 'not readable at the merge base' });
      continue;
    }
    let field = null;
    try {
      field = matter(text).data?.subject ?? null;
    } catch {
      field = null;
    }
    const pages = (Array.isArray(field) ? field : [field])
      .filter((s) => typeof s === 'string')
      .map(normSubjectPath)
      .filter(Boolean);
    if (!pages.length) {
      missing.push({ path, why: 'no subject: field in front matter' });
      continue;
    }
    resolved[path] = [...new Set(pages)].sort();
    for (const page of resolved[path]) union.add(page);
  }
  return { subjects: [...union].sort(), resolved, missing };
}

/**
 * The merge-path graph corroboration gate (task 56, folded H2/H3 hooks).
 *
 * Inputs: the committed `source`, the constituted `declared` set, the
 * joinable `contentPaths`, every non-deletion `diffPaths`, the result file's
 * `resultText` (for `graph-ack:`), the merge `base`, and two injected seams:
 *
 * - `analyse`: the merge-path graph seam —
 *   `({repoRoot, base, branch, subjects}) => analysis`. The analysis runs
 *   over the branch diff against the merge base (the `compare` form where a
 *   base exists) and maps changed symbols/processes to declared subjects via
 *   the same exact-member path-to-subject join the diff check uses. The seam
 *   is observed inside the callback (tests assert the merge base travelled).
 *   Contract: read-only against the merge-base tree beside the checked-out
 *   tree (never worktree state); refreshed by an explicit analyze step
 *   outside any job — no job writes the index, no merge path refreshes it.
 *   Return `{absent: true, reason}` where the tool or index is absent, else
 *   `{absent: false, partial, truncated, symbols: [{name, owner}],
 *   processes: [...], subjects: {<path>: {universe, symbols, risk}}}`.
 *   Pass a pre-computed `analysis` instead where the caller already invoked
 *   the seam (the merge path calls it before the subset check, so the H2(a)
 *   arm observes the spawn even where the path check then refuses).
 * - `sidecar`: the parsed `.job/graph.json` (or null). Its per-item
 *   evidence is required for every item retired on a measured diff; items
 *   retired on read-and-unchanged coverage are exempt.
 * - `carried`: `resolveCarriedDeclaration`'s `resolved` map, forwarded to
 *   per-item retirement so a carried file's page counts as its item's own
 *   subject.
 * - `advisoryScope`: downgrade ONLY the scope-violation arm ((a)) to a
 *   warning — the code-only exemption, which the task scopes to (a)'s
 *   quantifier. `graph-incomplete` (H2(b) incompleteness, the sidecar check)
 *   stays a refusal under this flag.
 *
 * Three-way absence, fail-closed: absent tool/index → warning plus a
 * `graph: absent` status, merge proceeds on the path checks alone (absent is
 * never incomplete); present-but-incomplete (`partial`/`truncated`, or
 * UNKNOWN risk inside a symbol universe) with no well-formed `graph-ack:`
 * entry → `graph-incomplete` naming `graph:<path>` and the flag, no merge
 * on the scope side (incomplete is never absent); answered → corroboration.
 * `no-symbols` (universe === false) is complete, never `unresolved-graph`;
 * UNKNOWN inside a symbol universe is never an all-clear.
 *
 * @returns {{ok: boolean, code?: string, reason?: string, warnings: string[],
 *            graphStatus: 'absent'|'complete'|'incomplete-answered',
 *            retirement: object}}
 */
export function checkMergeGraphScope({
  source,
  declared,
  contentPaths = [],
  diffPaths = [],
  reviewedPaths = null,
  resultText = '',
  analyse = null,
  analysis = undefined,
  sidecar = null,
  carried = null,
  advisoryScope = false,
}) {
  const warnings = [];
  const declaredList = (Array.isArray(declared) ? declared : []).map(normSubjectPath).filter(Boolean);
  const declaredSet = new Set(declaredList);
  const retireWith = (graph) => retireWorkOrderItems(source, { diffPaths, reviewedPaths, graph, carried });
  let resolved = analysis;
  if (resolved === undefined && typeof analyse === 'function') {
    resolved = analyse();
  }
  if (!resolved || resolved.absent) {
    warnings.push(
      `graph: absent — ${normSubjectPath(resolved?.reason) || 'no graph analysis available on this path'}; proceeding on the path checks alone`,
    );
    return { ok: true, warnings, graphStatus: 'absent', retirement: retireWith(null) };
  }
  const symbols = Array.isArray(resolved.symbols) ? resolved.symbols : [];
  const universes =
    resolved.subjects && typeof resolved.subjects === 'object' ? resolved.subjects : {};
  const processes = Array.isArray(resolved.processes) ? resolved.processes : [];
  // (a) Every changed symbol with a content-path owner lies inside the
  // declaration. Anything else — a non-content owner, a missing owner, a
  // transitive process — is recorded for the reviewer and never refuses. The
  // scan collects every warning first and reports the violation after, so a
  // refusing merge still carries the full corroboration picture (H2(a)).
  let scopeViolationOwner = null;
  for (const sym of symbols) {
    const owner = normSubjectPath(sym?.owner);
    if (!owner) {
      warnings.push(`graph: changed symbol ${JSON.stringify(sym?.name ?? '?')} carries no owner path — reviewer-only, never a refusal`);
      continue;
    }
    if (!isContentPathShaped(owner)) {
      warnings.push(`graph: changed symbol ${JSON.stringify(sym?.name ?? '?')} owned by non-content path ${owner} — reviewer-only, never a refusal`);
      continue;
    }
    if (!declaredSet.has(owner) && scopeViolationOwner === null) {
      scopeViolationOwner = owner;
    }
  }
  if (processes.length) {
    warnings.push(
      `graph: ${processes.length} transitive affected process(es) (${processes.map((p) => String(p?.name ?? p)).slice(0, 5).join(', ')}) — recorded for the reviewer; transitive reach alone never refuses where every changed content path is inside the declaration`,
    );
  }
  if (scopeViolationOwner !== null) {
    if (advisoryScope) {
      // F2: the code-only exemption is scoped to (a)'s quantifier — a merge
      // that binds nothing logs the scope finding and merges. `graph-incomplete`
      // below is NOT downgraded: incompleteness stays a refusal (H2(b)).
      warnings.push(
        `scope-violation (advisory on a merge that binds nothing): graph maps a changed symbol onto undeclared content path ${scopeViolationOwner} (outside the committed declaration)`,
      );
    } else {
      return {
        ok: false,
        code: 'scope-violation',
        reason: `scope-violation: graph maps a changed symbol onto undeclared content path ${scopeViolationOwner} (outside the committed declaration)`,
        warnings,
        graphStatus: 'complete',
        retirement: retireWith({ symbols, subjects: universes }),
      };
    }
  }
  // Incompleteness is per declared subject inside a symbol universe: global
  // partial/truncated, per-subject flags, or UNKNOWN risk. A subject the
  // analysis never names has no universe evidence and is not incomplete.
  const ack = parseGraphAck(resultText);
  const incomplete = [];
  for (const subject of declaredList) {
    const entry = universes[subject];
    if (!entry || entry.universe !== true) continue;
    const flags = [];
    if (resolved.partial || entry.partial) flags.push('partial');
    if (resolved.truncated || entry.truncated) flags.push('truncated');
    if (entry.risk === 'UNKNOWN') flags.push('UNKNOWN');
    if (flags.length && !ack.bySubject.has(subject)) {
      incomplete.push({ subject, flags });
    }
  }
  incomplete.sort((a, b) => (a.subject < b.subject ? -1 : 1));
  if (incomplete.length) {
    const first = incomplete[0];
    return {
      ok: false,
      code: 'graph-incomplete',
      reason: `graph-incomplete: no well-formed graph-ack: entry for graph:${first.subject} (flag: ${first.flags.join('/')})`,
      warnings,
      graphStatus: 'complete',
      retirement: retireWith({ symbols, subjects: universes }),
    };
  }
  const graphStatus = resolved.partial || resolved.truncated ? 'incomplete-answered' : 'complete';
  const retirement = retireWith({ symbols, subjects: universes });
  // Contradiction is retirement-level, never a merge refusal: the item stays
  // open, and the merge report names the subject, the diff evidence, and the
  // zero-symbol answer.
  for (const o of retirement.open) {
    if (o.contradiction?.length) {
      warnings.push(
        `contradiction: item ${o.index + 1} measured a diff on ${(o.touched ?? []).join(', ') || '(no paths)'} but the present index answers zero symbols for ${o.contradiction.join(', ')} — the item stays open`,
      );
    }
  }
  // (b) The sidecar's per-item evidence is present for every item retired on
  // a measured diff. Reviewed-coverage retirements are exempt. `no-symbols`
  // items retire on the path diff alone with the graph recorded summary-only.
  //
  // Task 59 closed the F6 hole: the sidecar writer exists (brief assembly
  // commits `.job/graph.json` beside the brief), so a new-contract branch
  // whose non-empty declaration retires on a diff while its committed `.job/`
  // lacks the sidecar refuses rather than warns. The executor's output commit
  // (`commitAll` minus `RESULT.md`) can delete the committed sidecar, and a
  // missing file must not convert a would-be (b) refusal into a warning.
  // Absent tool/index never reaches here (early `graph: absent` return above);
  // `no-symbols`-only retirements still warn summary-only (complete, never
  // `unresolved-graph`).
  //
  // F3 decision (task 59 fix round): an `absent: true` sidecar entry is NOT
  // per-item evidence. The writer records one per queried subject — including
  // subjects the brief-side tool could not answer — but the gate reads key
  // presence as evidence, so an absent entry would satisfy (b) vacuously once
  // a merge-side index is wired while the brief side stays absent. A
  // diff-retired subject whose only sidecar entry is absent refuses with the
  // sidecar flag exactly as a missing key does (outside-universe subjects
  // stay exempt: complete on the path diff alone).
  //
  // F7 (task 59 fix round): the gate credits the declaring carried key. An
  // item declaring `data/carried/<slug>.md` retires on its resolved page's
  // diff with `touched` naming the page, while the writer — querying the
  // committed declaration — keys the sidecar under the carried path. Either
  // key holding non-absent evidence satisfies (b) for that subject.
  const sidecarSubjects =
    sidecar && typeof sidecar.subjects === 'object' && sidecar.subjects !== null
      ? sidecar.subjects
      : null;
  // Reverse carried-resolution map (page → declaring carried paths) from the
  // same `resolved` map per-item retirement reads, so the sidecar credit below
  // joins on the same constitution the retirement did.
  const carriedEntries = carried instanceof Map
    ? [...carried.entries()]
    : Object.entries(carried ?? {});
  const declarersOf = new Map();
  for (const [cpath, pages] of carriedEntries) {
    const declarer = normSubjectPath(cpath);
    if (!declarer) continue;
    for (const page of Array.isArray(pages) ? pages : [pages]) {
      const p = normSubjectPath(page);
      if (!p) continue;
      if (!declarersOf.has(p)) declarersOf.set(p, []);
      if (!declarersOf.get(p).includes(declarer)) declarersOf.get(p).push(declarer);
    }
  }
  const hasSidecarEvidence = (key) =>
    Object.prototype.hasOwnProperty.call(sidecarSubjects ?? {}, key) &&
    !(sidecarSubjects[key] && typeof sidecarSubjects[key] === 'object' && sidecarSubjects[key].absent === true);
  if (!sidecarSubjects) {
    const diffRetired = retirement.retired.filter((r) => r.via === 'diff');
    if (diffRetired.length > 0) {
      // Subjects needing sidecar evidence: diff-touched subjects inside a
      // symbol universe (universe !== false). Outside-universe subjects are
      // complete on the path diff alone.
      const needing = [];
      for (const r of diffRetired) {
        for (const subject of r.touched ?? []) {
          const entry = universes[subject];
          if (entry?.universe === false) continue;
          if (!needing.includes(subject)) needing.push(subject);
        }
      }
      needing.sort();
      if (needing.length > 0) {
        return {
          ok: false,
          code: 'graph-incomplete',
          reason: `graph-incomplete: no well-formed graph-ack: entry for graph:${needing[0]} (flag: sidecar)`,
          warnings,
          graphStatus,
          retirement,
        };
      }
      warnings.push(
        'graph: no .job/graph.json sidecar committed — diff-retired subjects answer no-symbols (outside any symbol universe); retired on the path diff alone, graph recorded summary-only',
      );
    }
  } else {
    for (const r of retirement.retired) {
      if (r.via !== 'diff') continue;
      for (const subject of r.touched ?? []) {
        if (hasSidecarEvidence(subject)) continue;
        // F7: a page retired via carried resolution is evidenced under its
        // declaring carried path as well as under the page itself.
        const credited = (declarersOf.get(normSubjectPath(subject)) ?? []).some((d) => hasSidecarEvidence(d));
        if (credited) continue;
        const entry = universes[subject];
        if (entry?.universe === false) {
          warnings.push(`graph: ${subject} answers no-symbols (outside any symbol universe) — retired on the path diff alone, graph recorded summary-only`);
          continue;
        }
        return {
          ok: false,
          code: 'graph-incomplete',
          reason: `graph-incomplete: no well-formed graph-ack: entry for graph:${subject} (flag: sidecar)`,
          warnings,
          graphStatus,
          retirement,
        };
      }
    }
  }
  for (const [subject, entry] of Object.entries(universes)) {
    if (entry?.universe === false && declaredSet.has(normSubjectPath(subject))) {
      warnings.push(`graph: ${normSubjectPath(subject)} answers no-symbols (outside any symbol universe) — complete, never unresolved-graph`);
    }
  }
  return { ok: true, warnings, graphStatus, retirement };
}

async function executeJob(ctx, opts) {
  const {
    cfg,
    runner,
    reviewer,
    jobId,
    job,
    branch,
    worktree,
    resumed,
    briefText,
    workOrder = null,
    gates,
    ledger,
  } = opts;
  const capMinutes = cfg.job_caps_minutes[job.type];
  let base = opts.base;
  const prior = opts.prior ?? { mm: 0, invocations: 0 };

  // The job is judged against the target branch AS IT STANDS WHEN THE RUN
  // ENDS, not as it stood when the job was selected. `opts.base` is the
  // merge-base measured before the runner was invoked; if the author merges
  // the target branch into its own during the run, that base goes stale and
  // every commit the target gained since — none of them the job's — shows up
  // in the job's diff. Measured 2026-09-07 on j-20260907-13: the author ran
  // `git merge main` twice, the second merge carried the maintainer's own
  // `runners.yml` commit, and breaker 4 halted the Desk for a reserved-path
  // edit no job had made. So the base is re-measured after every executor
  // pass, from the target REF (`opts.baseRef`); a runner without one keeps
  // the measured SHA it was given.
  const refreshBase = (who) => {
    if (!opts.baseRef) return;
    const live = mergeBase(ctx.repoRoot, opts.baseRef, branch);
    if (live && live !== base) {
      ctx.log(
        `base moved during the run: ${base.slice(0, 7)} -> ${live.slice(0, 7)} — ${who} merged ` +
          `${opts.baseRef} into ${branch}; ${opts.baseRef}'s own commits are not this job's diff`,
      );
      base = live;
    }
  };

  // -------------------------------------------------------------------------
  // THE JOB'S TOTAL BUDGET (beads addictedtoai-o5t).
  //
  // `capMinutes` above is per INVOCATION and stays exactly what it was: a
  // runaway-process guard. What was missing is anything bounding their SUM. A
  // job makes up to four invocations — author, review 1, revision, review 2 —
  // and each was handed the full cap, so a job's entitlement was four caps and
  // no line of code anywhere ever added them up. Measured on the real ledger,
  // j-20260831-08 spent 54.55 model-minutes across exactly that shape.
  //
  // Two numbers now travel together through this function:
  //   `mm`      — what THIS RUN has spent so far, accumulated from the first
  //               invocation onward rather than from the review loop onward.
  //   `spent()` — what the JOB has spent, which is `prior.mm` (every earlier
  //               run of this job, read off the ledger) plus `mm`.
  //
  // `spent()` is the number the bound is measured against, and it is the whole
  // reason a resumed job cannot get a fresh allowance: `prior` comes from
  // `jobSpendSoFar(ledger, jobId)`, the ledger being the only durable record of
  // what an earlier run cost. Nothing here remembers anything.
  //
  // Before EVERY invocation, `allowance()` answers two questions at once: may
  // this one start, and how long may it be. The cap it returns is
  // `min(capMinutes, what is left)`, so the bound is exact rather than
  // exceeded-and-then-noticed — the alternative (per-invocation caps untouched,
  // check afterwards) lets the invocation that crosses the line run to its own
  // full cap first, which is a bound that lies about its own value by one cap.
  // -------------------------------------------------------------------------
  const totalMinutes = jobTotalMinutes(cfg, job.type);
  const floorMinutes = minInvocationMinutes(cfg, job.type);
  /** This RUN's model-minutes, across every invocation it makes. */
  let mm = 0;
  /** The JOB's model-minutes: earlier runs (from the ledger) plus this one. */
  const spent = () => prior.mm + mm;
  const allowance = (role) => invocationAllowance(cfg, { type: job.type, spentMm: spent(), role });
  /** Said out loud only when the JOB's remainder, not the runaway guard, set the cap. */
  const capNote = (a) =>
    a.derived
      ? ` (the per-invocation cap is ${a.per_invocation_cap_minutes} minutes; this job has ` +
        `${a.remaining_minutes} of its ${a.total_minutes}-minute total budget left, and the ` +
        `smaller of the two is what binds)`
      : '';

  // -------------------------------------------------------------------------
  // PER-INVOCATION MODEL-MINUTES (beads addictedtoai-59s).
  //
  // The ledger's `mm` is the JOB total — author, review pass 1, revision,
  // review pass 2 — and the cap is PER INVOCATION. A total therefore cannot
  // say where the cap belongs: 20.87 MM is either one twenty-minute author with
  // two half-minute reviews or four five-minute runs, and those want opposite
  // caps. Every number here was already in memory (`runExecutor` returns
  // `run.mm`, and the reviewer brief already prints the running total); only
  // writing it down was missing. `mm` stays the total, untouched — `budget.mjs`
  // sums it and must keep working unchanged.
  //
  // `outcome` is per invocation, and it means a different thing for each role
  // because the loop learns a different thing from each: the author's is the
  // result-protocol classification, a reviewer's is what the merge gate made of
  // its verdict. The revision run is recorded `unclassified` because that is
  // true — the loop reads no RESULT.md after it; the delta review that follows
  // is where its work is judged. A guessed value there would be exactly the
  // "written from intent rather than measurement" defect this repository keeps
  // catching.
  // -------------------------------------------------------------------------
  // `signal` on a phase entry is optional and additive, the same way `signal`
  // is on the ledger line itself (ledger.mjs) — and for the identical reason:
  // it says something about the INVOCATION the outcome cannot carry. The one
  // in use, again, is `no-output` (beads addictedtoai-g8a: a runner serving
  // only as REVIEWER accrued no ledger lines at its own id, because the
  // line-level `runner`/`signal` fields always name the AUTHOR — so its streak
  // could never move however dead it was). health.mjs's `noOutputStreak` now
  // reads a `review*`-role phase's own `signal` field the same way it reads
  // the line's, per runner id.
  // -------------------------------------------------------------------------
  // `phase()` RETURNS the entry it pushed, so a later measurement about the SAME
  // invocation can be attached to it. `gates` is the one that does (beads
  // addictedtoai-xzdd): a gate retry belongs to the author run whose work the
  // gates were judging. It is attached rather than pushed as a phase of its own
  // because a gate run is not a model invocation — `phases.length` is what the
  // reviewer brief counts invocations with, and an entry carrying no runner and
  // no minutes would make that count wrong in order to say this. Additive in
  // exactly the way `signal` is: absent unless there is something to say, and a
  // reader that does not know the key is unaffected.
  // -------------------------------------------------------------------------
  const phases = [];
  let gateReport = { ran: false, why: 'the loop was run with --no-gates' };
  const gateSecondsForLedger = () => {
    if (!gateReport.ran) return undefined;
    const seconds = Object.fromEntries(
      (gateReport.results ?? [])
        .filter((result) => Number.isFinite(result.durationMs))
        .map((result) => [result.script, Math.round((result.durationMs / 1000) * 10) / 10]),
    );
    return Object.keys(seconds).length ? seconds : undefined;
  };
  const phase = (role, who, r, outcome, signal) => {
    const entry = {
      role,
      runner: who.id,
      effort: who.effort ?? null,
      mm: Math.round(r.mm * 100) / 100,
      killed: Boolean(r.killed),
      code: r.code ?? null,
      outcome,
      ...(signal ? { signal } : {}),
    };
    phases.push(entry);
    return entry;
  };
  /** Every exit from this function carries the phases recorded up to it. */
  const finish = (o) => {
    const result = { ...o, phases };
    const gate_seconds = gateSecondsForLedger();
    if (gate_seconds) result.gate_seconds = gate_seconds;
    return result;
  };

  // Defence in depth, and it is not decorative: `runLoop` sweeps an exhausted
  // resumable branch before it ever gets here, and a NEW job has spent nothing,
  // so in the loop's own path this cannot fire. It fires for a caller that
  // builds a job by hand — and a guardrail whose only enforcement point is
  // upstream of itself is one refactor away from being gone.
  const authorAllowance = allowance('author run');
  if (!authorAllowance.ok) {
    ctx.log(`BUDGET: ${authorAllowance.reason}`);
    return finish({ outcome: 'abandoned', mm, changed: [], note: authorAllowance.reason });
  }
  ctx.log(`invoking runner "${runner.id}" (provider ${runner.provider}, tier ${runner.tier}) under a ${authorAllowance.capMinutes}-minute cap${capNote(authorAllowance)}`);
  // Breaker 4's filesystem companion needs a "before" for the two brakes, and
  // the window that matters is the executor's own run, not the whole job.
  let brakesBefore = brakeState(ctx);
  // The brief tells the author to run `npm test` and `npm run build` in the
  // foreground before it finishes, so the shared install has to be reachable
  // from the worktree BEFORE the executor starts — not only inside `runGates`,
  // which runs after it. Measured on j-20260907-08 (proposal
  // link-node-modules-before-the-author-runs: every test file failed with
  // ERR_MODULE_NOT_FOUND) and again on j-20260907-14, whose author reported
  // `blocked` for exactly this. The link is a junction to the shared install;
  // `unlinkNodeModules` below removes it before any git or delete touches the
  // worktree, and `linkNodeModules` is idempotent for the gate-time call.
  const authorLink = linkNodeModules(worktree, ctx.repoRoot);
  if (!authorLink.linked && authorLink.why !== 'already present') {
    ctx.log(`node_modules not linked for the author: ${authorLink.why}`);
  }
  const run = await runExecutor({
    command: runner.command,
    cwd: worktree,
    promptText: briefText,
    promptPath: join(ctx.worktreeRoot, `${jobId}-brief.md`),
    timeoutMs: authorAllowance.capMinutes * 60 * 1000,
    role: 'author',
    jobId,
    logPath: jobLogPath(ctx.worktreeRoot, jobId, 'author'),
  });
  mm += run.mm;
  ctx.log(`runner returned after ${run.mm.toFixed(2)} model-minutes (exit ${run.code}${run.killed ? ', killed at cap' : ''})`);

  // Read the protocol file from the FILESYSTEM before anything else touches
  // the tree. This is the only channel; nothing here accepts a status from
  // the executor's stdout.
  const fileResult = readResult(worktree);
  const classified = classifyRun(run, fileResult, runner);
  ctx.log(`result protocol: ${classified.status} — ${classified.evidence}`);
  const authorPhase = phase('author', runner, run, classified.status);

  // Commit whatever the executor left, INCLUDING on a kill: the branch, not
  // the scratch worktree, is what resumption reads.
  unlinkNodeModules(worktree);
  const committed = commitAll(ctx.repoRoot, worktree, `job ${jobId}: executor output`, {
    exclude: ['RESULT.md'],
  });
  if (committed.committed) ctx.log(`committed the executor's output to ${branch}`);
  refreshBase('the author');

  const head = gitTry(ctx.repoRoot, ['rev-parse', branch]).stdout.trim();
  const changed = changedPathsWithStatus(ctx.repoRoot, base, branch).filter(
    (e) => e.path !== '.job/brief.md' && !e.path.startsWith('.job/'),
  );

  // Breaker 4 — before anything is judged on its merits.
  //
  // Two channels, one judgement. The branch diff sees the reserved paths git
  // can see; `brakeScan` sees `STOP` and `HOLD.md`, which are gitignored and so
  // can never appear in a diff again (beads addictedtoai-59q, addictedtoai-ut1).
  // Both feed the same `reservedPathViolations`, so there is one definition of a
  // violation rather than two that can drift apart.
  const brakes = brakeScan(ctx, { worktree, before: brakesBefore });
  for (const n of brakes.notices) ctx.log(`NOTICE: ${n}`);
  const reserved = checkReservedPaths(ctx, [...changed, ...brakes.entries], jobId);
  if (reserved.tripped) {
    ctx.log(`BREAKER: ${reserved.reason}`);
    return finish({ outcome: 'failed', mm, held: reserved, changed, note: 'reserved-path edit attempt' });
  }

  if (classified.status === 'capacity') {
    return finish({ outcome: 'capacity', mm, changed, note: classified.evidence });
  }
  if (classified.status === 'interrupted') {
    // The outcome stays `interrupted` — specs/loop says an absent RESULT.md
    // after the process exited is exactly that, and the branch stays resumable.
    // The SIGNAL is the added detection: the run produced no RESULT.md, no
    // output AND no diff, which is a runner that never ran rather than a job
    // cut off mid-work. health.mjs counts these; three in a row refuses the
    // runner instead of resuming its branch forever (beads addictedtoai-h5k).
    const producedNothing = Boolean(classified.producedNothing) && changed.length === 0;
    if (producedNothing) {
      ctx.log(
        `this run produced nothing at all: no RESULT.md, nothing on stdout, and an empty branch diff. ` +
          `Recording signal \`${NO_OUTPUT_SIGNAL}\` on the ledger line` +
          (classified.startupFailure
            ? ` (the runner's declared startup_failure_stderr_pattern matched: ${JSON.stringify(classified.startupFailure.line)})`
            : '') +
          '.',
      );
    }
    return finish({
      outcome: 'interrupted',
      mm,
      changed,
      note: classified.evidence,
      signal: producedNothing ? NO_OUTPUT_SIGNAL : undefined,
    });
  }
  if (classified.status === 'blocked') {
    // A well-formed `blocked:` with a clean tree is a SUCCESSFUL honest
    // outcome. It is not retried with the same brief unchanged.
    ctx.log(`blocked (honest outcome): ${classified.reason}`);
    return finish({ outcome: 'blocked', mm, changed, note: classified.reason });
  }

  if (changed.length === 0 && emptyDiffFailsOutcome(classified.status)) {
    ctx.log('the executor reported `done` but the branch diff is empty — nothing to review or merge');
    return finish({ outcome: 'failed', mm, changed, note: 'done with an empty diff' });
  }
  if (changed.length === 0) {
    // A `reviewed:` outcome with an empty diff is the finding itself, not a
    // failure: the pages were read, judged sound, and correctly left
    // unchanged. The run proceeds to gates and review; the merge ratifies
    // the pages against the committed declaration and their review state.
    ctx.log('the executor reported `reviewed:` with an empty branch diff — the absence of a diff is the finding, proceeding to review');
  }

  // Gates. `gateReport` is what the reviewer is told about them — a
  // measurement of what ran on this branch, never a reassurance (see
  // review.mjs gatesSection, beads addictedtoai-5z9).
  let gateResult = { ok: true, output: 'gates skipped (--no-gates)' };
  if (gates !== false) {
    const gateTimeoutMs = capMinutes * 60 * 1000;
    const runTheGates = () => (typeof gates === 'function'
      ? gates(ctx, worktree)
      : runGates(ctx, worktree, { timeoutMs: gateTimeoutMs }));
    // -----------------------------------------------------------------------
    // PRINT WHY, NOT JUST THAT — at the moment of the failure, not at the end
    // of the block.
    //
    // The worktree is torn down in the caller's `finally`, so the moment a gate
    // run fails is the only moment its evidence exists: a gate failure nobody
    // can diagnose is a gate failure nobody can act on. Observed on job
    // j-20260828-01, whose only record was `gates: FAIL`.
    //
    // IT IS A FUNCTION BECAUSE THE RETRY MOVED WHERE THAT LOSS HAPPENS. Until
    // 2026-09-06 a gate failure only ever ended one way — `failed` — so
    // printing once, at the end, printed everything there was. Retrying on ANY
    // failure (beads addictedtoai-xzdd) makes a failure that PASSES on the
    // second run the COMMON path, and that path overwrites `gateResult`: the
    // first run's failing script, its exit status and its captured output are
    // gone, and `gates: FAIL` plus three booleans is all that is left. Those
    // are exactly the runs xzdd exists to characterise — it asks whether the
    // intermittency can be made deterministic, and that question cannot be
    // answered from a boolean per job. So the evidence is emitted where it is
    // still in hand, whichever way the retry ends.
    // -----------------------------------------------------------------------
    const emitGateEvidence = (result, what) => {
      ctx.log(`--- ${what} ---`);
      for (const r of result.results ?? []) {
        ctx.log(`  gate ${r.script}: ${r.ok ? 'PASS' : `FAIL (exit ${r.status})`}`);
      }
      ctx.log('--- gate output ---');
      ctx.log(result.output ?? '(no output captured)');
      ctx.log('--- end gate output ---');
    };
    ctx.log('running the schema/build gates on the branch');
    gateResult = runTheGates();
    gateReport = { ran: true, ok: gateResult.ok, results: gateResult.results ?? [] };
    ctx.log(`gates: ${gateResult.ok ? 'PASS' : 'FAIL'}`);

    // -----------------------------------------------------------------------
    // A GATE FAILURE IS RETRIED ONCE, WHATEVER IT SAID. The marker explains WHY
    // a retry happened; it is not what makes retrying safe.
    //
    // The original measurement (beads addictedtoai-ar0), 2026-09-04: job
    // j-20260904-38 authored its repair successfully (7.96 model-minutes,
    // author outcome `done`), its gate run failed, and the job was recorded
    // `failed` with its branch left unmerged; the closing six-gate pass failed
    // the same way minutes later. Re-run alone on an idle machine, the same
    // suite passed 1201/1201. Neither was a defect — both were `connect
    // EADDRINUSE` from ephemeral-port exhaustion under concurrent load. Three
    // such runs trip breaker 1 and halt the whole Desk on nothing.
    //
    // WHY THE MARKER STOPPED BEING ENOUGH (beads addictedtoai-xzdd), measured
    // 2026-09-06: four gate failures in ~20 jobs. One was real. The other three
    // were intermittent failures in tests that emit NO marker — a publish-verify
    // assertion, an exit-code test — in files with nothing to do with the job's
    // own work, and none of them reproduced afterwards: 6 standalone runs, 5
    // more, 6-way concurrency and 4 full-suite runs, all clean. Roughly one job
    // in seven lost its entire authored work to a failure nobody could
    // reproduce, and each one counts toward breaker 1.
    //
    // THE INSTINCT IS TO WIDEN THE MARKER; THAT IS THE WRONG FIX. A marker that
    // matches more is a marker the next fixture can evade, which is how the
    // original defect was born. Look instead at where the safety comes from: the
    // property that makes a retry safe is A REAL DEFECT STILL FAILS TWICE, and
    // that property holds for ANY retry-once policy. It never came from the
    // marker. The marker is a COST optimisation — it avoids spending a second
    // full gate run on a failure already known to be a machine failure — so
    // dropping it as a PRECONDITION costs one extra gate run (~4 minutes) on
    // genuinely failing jobs, against a ~1-in-7 loss of complete jobs.
    //
    // So: ONCE on any failure, never in a loop. A pass means the run continues
    // normally and nothing is recorded as a failure; a second failure is
    // recorded `failed` exactly as before, and no outcome and no breaker
    // semantics change. The marker is still read, still logged, and still says
    // in the ledger note which kind of failure this was.
    //
    // THE MARKER DECISION IS READ, NOT RE-DERIVED. `gateResult.output` is a
    // truncated human-readable log — each script's last 6000 characters — so a
    // marker raised early in a 1201-test run is not in it (beads
    // addictedtoai-kisa). `runGates` computes `transport` over the FULL output
    // at the point of capture; `gatesHitTransportFailure` reads that flag, and
    // falls back to scanning only for a result that never came from `runGates`.
    // -----------------------------------------------------------------------
    let retried = false;
    if (!gateResult.ok) {
      retried = true;
      const environmental = gatesHitEnvironmentalFailure(gateResult);
      const marked = gatesHitTransportFailure(gateResult);
      // Named BEFORE the retry overwrites `gateResult`. These are the scripts,
      // not their output — cheap enough to carry on the job's permanent record,
      // which a log that is never kept is not.
      // GATE NAMES, deliberately, and they stay gate names: this array is
      // written into the ledger as `phases[].gates.first_failed`, where every
      // line already written carries names, and a field whose contents change
      // shape mid-history cannot be counted across it. The brief renders each
      // name as the command that would reproduce it (`gateCommandForName`),
      // which is where the distinction between an npm gate and a node one
      // belongs (beads addictedtoai-one6).
      const firstFailed = (gateResult.results ?? []).filter((r) => !r.ok).map((r) => r.script);
      ctx.log(
        environmental
          ? `the gate was refused by the environment (${gateFailureNote(gateResult)}) — recording an ` +
              `interrupted run so it resumes without re-authoring; no second wait on the same holder.`
          : marked
          ? `a gate's full output carried the marker \`${TRANSPORT_FAILURE_MARKER}\` — this is the ` +
              `machine, not the diff. It may not appear in the truncated log printed below, which is ` +
              `why the decision is made at capture. transport marker: running the gates ONCE more.`
          : `no transport marker in the captured output — this may be a real defect, and it may be ` +
              `the intermittency that has cost whole jobs (beads addictedtoai-xzdd). The gates are ` +
              `run ONCE more either way: a real defect still fails twice, which is the only property ` +
              `that ever made this safe. unmarked failure, retrying once.`,
      );
      // The whole of the first run, while it still exists. If the retry passes
      // this is the ONLY record that anything failed at all, and it is the
      // record the measurement xzdd asks for has to be made from.
      emitGateEvidence(gateResult, 'the FIRST gate run, which FAILED (its evidence, before the retry replaces it)');
      if (environmental) {
        gateReport = {
          ran: true,
          ok: false,
          results: gateResult.results ?? [],
          environmental: true,
          firstFailed,
        };
        const note = gateFailureNote(gateResult);
        ctx.log(note);
        return finish({ outcome: 'interrupted', mm, changed, note, gateOutput: gateResult.output });
      }
      gateResult = runTheGates();
      gateReport = {
        ran: true,
        ok: gateResult.ok,
        results: gateResult.results ?? [],
        retried: true,
        transport: marked,
        firstFailed,
      };
      ctx.log(
        `gates (retry after a ${marked ? 'transport failure' : 'gate failure with no transport marker'}): ` +
          `${gateResult.ok ? 'PASS' : 'FAIL'} — kind job-author-pair`,
      );
      // On the job's permanent record, not only in a log that is not kept: the
      // author invocation's phase entry says a retry happened and how it ended.
      // Without it the ledger cannot tell a job that passed first time from one
      // that needed a second run — which is the number that says whether this
      // policy is paying for itself.
      // `first_failed` names the scripts the first run failed on. Without it a
      // retried-then-passed job's permanent record is three booleans, and no
      // later reader could tell a flaky publish-verify from a flaky
      // exit-code test — which is the distinction xzdd is about.
      //
      // WRITTEN BEFORE THE ENVIRONMENTAL RETURN BELOW, AND THAT ORDER IS THE
      // WHOLE FIX (addictedtoai-q6xp). It used to sit after it, so a retry that
      // met a build lock recorded `interrupted` and carried NO gates entry —
      // dropping the measurement for EXACTLY the case the retry policy exists
      // to measure, and `first_failed` with it. An early return is a
      // control-flow change as much as a behaviour change, and what it jumps
      // over is invisible to any test of what it does: the sealed reviewer of
      // the round that introduced this verified the new classification, mutated
      // it, watched it go red and restored it, and never asked what the return
      // skipped.
      if (authorPhase) {
        authorPhase.gates = {
          retried: true,
          passed: gateResult.ok,
          transport: marked,
          first_failed: firstFailed,
        };
      }
      if (!gateResult.ok && gatesHitEnvironmentalFailure(gateResult)) {
        const note = gateFailureNote(gateResult, { retried: true });
        ctx.log(`${note} — recording an interrupted run so it resumes without re-authoring`);
        return finish({ outcome: 'interrupted', mm, changed, note, gateOutput: gateResult.output });
      }
    }

    if (!gateResult.ok) {
      emitGateEvidence(gateResult, retried ? 'the RETRY, which FAILED too' : 'the gate run, which FAILED');
      const note = gateFailureNote(gateResult, { retried });
      ctx.log(note);
      return finish({ outcome: 'failed', mm, changed, note, gateOutput: gateResult.output });
    }
  }

  // Review — the loop computes the diff itself.
  const diffText = diffAgainst(ctx.repoRoot, base, branch);
  let pass = 1;
  let findings = '';
  for (;;) {
    // THE REVIEW IS WHERE THE BOUND MOST OFTEN BINDS, and where refusing is
    // least comfortable: the author's work is already on the branch and nothing
    // merges without an approval, so an abandon here loses that work. It is
    // still the right answer. The alternative is a review capped at whatever
    // scraps are left, and a review killed at its cap writes no verdict record
    // at all — the merge gate then fails the job at `no-record`, which spends
    // the reviewer's minutes AND loses the work. A stub review is not a cheaper
    // review; it is the same loss with a worse record of why.
    //
    // Read-and-unchanged per-page split (Stage 2, task 63): on a multi-page
    // `reviewed:` outcome each declared page gets its own review invocation
    // (its surface, hash and kind checklist, never a bundle), each with its
    // own per-type allowance and budget accounting, each record still passing
    // the merge gate. Single-page and non-reviewed paths below are unchanged.
    const isReviewedOutcome = classified.status === 'reviewed';
    const declaredPages = isReviewedOutcome && Array.isArray(classified.paths)
      ? [...new Set(classified.paths.map(normSubjectPath).filter(Boolean))].sort()
      : [];
    const isPerPageReviewed = isReviewedOutcome && declaredPages.length > 1;
    // Per-page state for the shared post-review handling below (closure,
    // phases, revision findings): populated only on the per-page branch.
    let perPageReviews = null;
    let perPageGates = null;
    let perPageAllowances = null;
    let perPageOutPaths = null;
    let perPageRevisionFindings = null;
    let reviewAllowance = allowance(`review pass ${pass}`);
    if (!reviewAllowance.ok) {
      ctx.log(`BUDGET: ${reviewAllowance.reason}`);
      ctx.log(`the work on ${branch} is left where it is; nothing merges without a review`);
      return finish({ outcome: 'abandoned', mm, changed, note: reviewAllowance.reason });
    }
    // The runner eligibility for reviewed outcomes (task 63): a timeout-prone
    // reviewer (last 3 reviewer invocations all killed, read from the ledger)
    // is excluded unless an explicit timeout/interrupted-rate guard is
    // recorded in the operator-owned runner registry (`runners.yml`
    // `timeout_guard` on the reviewer entry; absent means none). An exclusion
    // settles `interrupted` (resumable, never a breaker input), never a
    // verdict failure.
    if (isReviewedOutcome) {
      const eligibility = checkReviewedRunnerEligibility(reviewer, { ledger: Array.isArray(ledger) ? ledger : null, guard: reviewer?.timeout_guard ?? null });
      if (!eligibility.ok) {
        ctx.log(`reviewed: ${eligibility.reason} — booking interrupted, nothing merges`);
        return finish({ outcome: 'interrupted', mm, changed, note: eligibility.reason });
      }
      if (eligibility.prone) {
        ctx.log(`reviewed: reviewer "${reviewer.id}" is timeout-prone but an explicit guard is recorded — proceeding`);
      }
    }
    if (isPerPageReviewed) {
      ctx.log(`reviewed: outcome names ${declaredPages.length} pages (${declaredPages.join(', ')}) — one review invocation per declared page, never a bundle`);
    }
    let reviewedOnly = null;
    let reviewedSurfaceText = null;
    let rev = null;
    let gateChanged = null;
    let gate = null;
    if (isPerPageReviewed) {
      // Per-page invocations, one per declared page. Each carries that page's
      // machine-generated surface (read from the worktree, never invented),
      // its hash and kind checklist (in the brief, via `runReview`'s
      // `reviewedOnly`), and the filtered annex after it — reused single-page
      // plumbing, extended with distinct record/worktree suffixes, never
      // forked. Each invocation has its own per-type allowance (the same
      // `allowance` the single path reads — duplicated nowhere) and its own
      // budget accounting (`mm`, `phases`, brief `mmSoFar`/`invocations`).
      // A timeout (killed, no record) settles `interrupted` immediately —
      // resumable, never a breaker input — rather than absent review.
      gateChanged = changedPathsWithStatus(ctx.repoRoot, base, branch);
      perPageReviews = [];
      perPageGates = [];
      perPageAllowances = [];
      perPageOutPaths = [];
      for (let pi = 0; pi < declaredPages.length; pi++) {
        const page = declaredPages[pi];
        const pageAllowance = allowance(`review pass ${pass} page ${pi + 1}/${declaredPages.length} ${page}`);
        if (!pageAllowance.ok) {
          ctx.log(`BUDGET: ${pageAllowance.reason}`);
          ctx.log(`the work on ${branch} is left where it is; nothing merges without a review`);
          return finish({ outcome: 'abandoned', mm, changed, note: pageAllowance.reason });
        }
        perPageAllowances.push(pageAllowance);
        ctx.log(`review pass ${pass} page ${pi + 1}/${declaredPages.length} (${page}): invoking reviewer "${reviewer.id}" with fresh context and no edit rights, under a ${pageAllowance.capMinutes}-minute cap${capNote(pageAllowance)}`);
        const outPath = reviewedPerPageRecordPath(ctx, jobId, pi, pass);
        perPageOutPaths.push(outPath);
        // F8 (folded into F8x): the stale-record clear lives in shared
        // `runReview` (every path); no caller-side unlink here, never twice
        // on one path.
        let surface = null;
        try {
          surface = readFileSync(join(worktree, page), 'utf8');
        } catch {
          surface = null;
        }
        // F4 (G4: also the empty string): fail the page invocation closed
        // before dispatch when its machine-generated surface cannot be read
        // — task 63 requires each invocation to carry the page's surface AND
        // its hash, so a page without its bytes is never sent to the
        // reviewer. A readable-but-empty page carries no bytes to bind: the
        // brief's truthy `hasSurface` would substitute the no-surface
        // fallback with no bound hash while the reviewer may still approve —
        // an unbound approval. Single-page fallback below (task 62) is
        // untouched.
        if (surface == null || surface === '') {
          const reason = surface === ''
            ? `reviewed: cannot review page ${page}: its machine-generated surface is empty — failing closed, no review without its bytes`
            : `reviewed: cannot review page ${page}: its machine-generated surface could not be read — failing closed, no review without its bytes`;
          ctx.log(reason);
          return finish({ outcome: 'failed', mm, changed, note: reason });
        }
        const one = await runReview(ctx, {
          jobId,
          job,
          branch,
          diffText,
          runner: reviewer,
          capMinutes: pageAllowance.capMinutes,
          pass,
          findings,
          gates: gateReport,
          workOrder: workOrder ?? null,
          reviewedOnly: page,
          reviewedSurfaceText: surface,
          reviewGraphQuery: briefGraphQueryForSubject,
          graphIndexId: 'review-index:merge-base-tree',
          mmSoFar: spent(),
          invocations: prior.invocations + phases.length,
          totalMinutes,
          reviewer,
          outPathOverride: outPath,
          reviewSuffix: `-p${pi}`,
        });
        perPageReviews.push(one);
        mm += one.run.mm; // "Review MM counts toward the job it reviews." Per page, summed.
        if (one.discarded.discardedAnything) {
          ctx.log(`the reviewer changed its worktree on page ${page}; those changes were discarded (branch ${one.branchUnchanged ? 'unchanged' : 'CHANGED — investigate'})`);
        }
        const timeoutClass = classifyReviewedRun({ killed: Boolean(one.run.killed), recordWritten: Boolean(one.recordWritten) });
        // The reviewer analogue of no-output, per page (the same predicate
        // the single path reads, never reimplemented): no record, not killed,
        // nothing on stdout.
        const producedNothing = reviewProducedNothing(one.run, one.recordWritten, reviewer);
        if (producedNothing) {
          ctx.log(
            `review pass ${pass} page ${page} produced nothing at all: no verdict record and nothing on stdout. ` +
              `Recording signal \`${NO_OUTPUT_SIGNAL}\` on this phase.`,
          );
        }
        if (timeoutClass === 'interrupted') {
          phase(`review${pass}-p${pi}`, reviewer, one.run, 'interrupted', producedNothing ? NO_OUTPUT_SIGNAL : undefined);
          ctx.log(`review pass ${pass} page ${page}: reviewer was killed at the ${pageAllowance.capMinutes}-minute cap${pageAllowance.derived ? ` (which was the job's remaining total budget, not the ${capMinutes}-minute per-invocation cap)` : ''} with no verdict — booking interrupted, resumable, never a breaker input`);
          // Push phases for the remaining unreviewed pages? No — they were
          // never invoked, so there is nothing to record. The pages already
          // reviewed keep their phases above; the run resumes from the branch.
          return finish({ outcome: 'interrupted', mm, changed, note: `review pass ${pass} page ${page} timed out at its cap with no verdict — resumable` });
        }
        let pageKind = job.type;
        try {
          pageKind = reviewedGateTypeForPage(page);
        } catch (e) {
          // Fail closed: no checklist for this kind means no review for it.
          const reason = `reviewed: cannot review page ${page}: ${String(e?.message ?? e)}`;
          ctx.log(reason);
          const iphase2 = phase(`review${pass}-p${pi}`, reviewer, one.run, 'reviewed-kind-unknown', producedNothing ? NO_OUTPUT_SIGNAL : undefined);
          void iphase2;
          return finish({ outcome: 'failed', mm, changed, note: reason });
        }
        const onegate = mergeGate(ctx, {
          jobId,
          type: pageKind,
          pass,
          subjects: [page],
          changed: gateChanged,
          recordPath: outPath,
        });
        perPageGates.push(onegate);
        const iphase = phase(`review${pass}-p${pi}`, reviewer, one.run, onegate.ok ? 'approve' : onegate.code, producedNothing ? NO_OUTPUT_SIGNAL : undefined);
        if (onegate.verdict) iphase.carried = Array.isArray(onegate.verdict.carry) ? onegate.verdict.carry.length : 0;
        if (!onegate.ok) {
          ctx.log(`review pass ${pass} page ${page}: merge refused — [${onegate.code}] ${onegate.reason}`);
        } else {
          ctx.log(`review pass ${pass} page ${page}: approve (would-cite recorded)`);
        }
      }
      // All pages reviewed. The combined gate is the first failure (with all
      // failing pages' findings carried for the revision brief), or ok with
      // the first verdict for the shared post-review handling below (closure,
      // approve). Every page's record already passed its own gate; the merge
      // still re-checks every precondition via `checkReviewedMerge` at merge
      // time (61b join, diff/graph emptiness) — no per-page verdict bypasses it.
      const failures = perPageGates
        .map((g, i) => ({ g, i }))
        .filter(({ g }) => !g.ok);
      if (!failures.length) {
        gate = { ok: true, verdict: perPageGates[0].verdict, path: perPageOutPaths[0], perPage: true, outPaths: [...perPageOutPaths], pages: [...declaredPages] };
        rev = perPageReviews[0];
        reviewAllowance = perPageAllowances[perPageAllowances.length - 1];
      } else {
        const first = failures[0];
        gate = { ...first.g, perPage: true, outPaths: [...perPageOutPaths], pages: [...declaredPages], failedPage: declaredPages[first.i], failedIndex: first.i };
        rev = perPageReviews[first.i];
        reviewAllowance = perPageAllowances[first.i];
        // Revision findings carry every failing page, not just the first —
        // one revision pass answers all of them, then pass 2 re-reviews all.
        const parts = [];
        for (const { g, i } of failures) {
          const pg = declaredPages[i];
          const v = g.verdict;
          if (v) {
            const r = Array.isArray(v.reasons) ? v.reasons.join(', ') : '';
            const n = typeof v.notes === 'string' ? v.notes : '';
            const block = [`page ${pg}: ${g.code}`, r, n, isDiffRefusal(g.code) ? g.reason : ''].filter((s) => String(s ?? '').trim()).join('\n\n');
            if (block.trim()) parts.push(block);
          } else {
            parts.push(`page ${pg}: ${g.code} — ${g.reason}`);
          }
        }
        perPageRevisionFindings = parts.filter((s) => String(s ?? '').trim()).join('\n\n');
      }
    } else {
      // Single-page and non-reviewed paths, unchanged (task 62 wiring kept).
      // A multi-page declaration never reaches here (handled above, never a
      // bundle); a single-page reviewed outcome carries that page's surface.
      if (isReviewedOutcome) {
        const declared = declaredPages;
        if (declared.length === 1) {
          reviewedOnly = declared[0];
          try {
            reviewedSurfaceText = readFileSync(join(worktree, reviewedOnly), 'utf8');
          } catch {
            reviewedSurfaceText = null;
          }
          // F4x: fail the single-page invocation closed before dispatch when
          // its machine-generated surface cannot be read (G4: also when it
          // is the empty string) — task 63 requires each invocation to carry
          // the page's surface AND its hash, so a page without its bytes is
          // never sent to the reviewer. An empty surface fails the same way:
          // it carries no bytes to bind (see the per-page F4 note above).
          if (reviewedSurfaceText == null || reviewedSurfaceText === '') {
            const reason = reviewedSurfaceText === ''
              ? `reviewed: cannot review page ${reviewedOnly}: its machine-generated surface is empty — failing closed, no review without its bytes`
              : `reviewed: cannot review page ${reviewedOnly}: its machine-generated surface could not be read — failing closed, no review without its bytes`;
            ctx.log(reason);
            return finish({ outcome: 'failed', mm, changed, note: reason });
          }
        }
      }
      const singleAllowance = reviewAllowance;
      ctx.log(`review pass ${pass}: invoking reviewer "${reviewer.id}" with fresh context and no edit rights, under a ${singleAllowance.capMinutes}-minute cap${capNote(singleAllowance)}`);
      rev = await runReview(ctx, {
        jobId,
        job,
        branch,
        diffText,
        runner: reviewer,
        capMinutes: singleAllowance.capMinutes,
        pass,
        findings,
        gates: gateReport,
        // The committed work-order declaration: the review brief keys its
        // checklist on the governing type (task 59), never on an item's type.
        // On a single-page reviewed invocation the brief keys on the page's
        // kind instead (task 63, inside `assembleReviewBrief`).
        workOrder: workOrder ?? null,
        reviewedOnly,
        reviewedSurfaceText,
        reviewGraphQuery: briefGraphQueryForSubject,
        graphIndexId: 'review-index:merge-base-tree',
        // The job's spend, not this run's: a resumed job carries what its earlier
        // runs cost, and the reviewer is told the number the ledger would show.
        mmSoFar: spent(),
        invocations: prior.invocations + phases.length,
        totalMinutes,
        reviewer,
      });
      mm += rev.run.mm; // "Review MM counts toward the job it reviews."
      if (rev.discarded.discardedAnything) {
        ctx.log(`the reviewer changed its worktree; those changes were discarded (branch ${rev.branchUnchanged ? 'unchanged' : 'CHANGED — investigate'})`);
      }
      // The same measurement the post-merge write uses (`base` here IS
      // `mergeBaseSha`), re-read from the branch rather than reused from `changed`
      // above: a revision pass can add a file after the author run, and the gate
      // must compare the record against what is actually about to merge.
      //
      // ONE measurement, two arguments: `subjects` is derived from the same list
      // the carried-deletion check reads, so the gate cannot be judging one diff
      // for the record's `reviewed:` and another for what the branch deleted.
      gateChanged = changedPathsWithStatus(ctx.repoRoot, base, branch);
      if (reviewedOnly) {
        // Single-page reviewed gate: the record answers for the one page it
        // reviewed (subjects `[page]`, type the page's kind), still through
        // the one `mergeGate` — every page's record passes 62's gate, one
        // page or many. The empty-diff subjects (`[]`) would bind nothing and
        // prove nothing (task 58's mutation), so the page is measured, not
        // the diff.
        let singleKind = job.type;
        try {
          singleKind = reviewedGateTypeForPage(reviewedOnly);
        } catch (e) {
          const reason = `reviewed: cannot review page ${reviewedOnly}: ${String(e?.message ?? e)}`;
          ctx.log(reason);
          return finish({ outcome: 'failed', mm, changed, note: reason });
        }
        gate = mergeGate(ctx, {
          jobId,
          type: singleKind,
          pass,
          subjects: [reviewedOnly],
          changed: gateChanged,
        });
      } else {
      gate = mergeGate(ctx, {
        jobId,
        type: job.type,
        pass,
        subjects: joinableSubjects(gateChanged),
        changed: gateChanged,
      });
      }
    }
    // Brief-closure gate (item 3 follow-up, bead 7dmp): the brief's Files list
    // against the merge-base diff, judged by pin-misses, not prose. Runs as a
    // SUBPROCESS (node scripts/brief-closure.mjs), not an import: the reviewer
    // runs the same file the same way, so the merge path and the reviewer can
    // never disagree about what the instrument said. The verdict gate above
    // still leads — this only ever ADDS a refusal, and only when a verdict
    // record exists to carry it (a missing record fails closed upstream, and
    // a closure finding would add nothing to that failure). Scope misses
    // (touched-but-unlisted) are LOGGED, never refused: automatic scope
    // refusal's false-fire rate is unmeasured, so scope stays reviewer-side. A
    // missing brief or a broken instrument SKIPS loudly rather than refusing:
    // refusing on what the gate cannot read would fail jobs for
    // infrastructure reasons.
    {
      const closureBrief = readCommittedBrief(ctx.repoRoot, branch);
      if (closureBrief == null) {
        ctx.log(`closure: no committed .job/brief.md on ${branch} — skipping (a file list cannot be judged without the brief)`);
      } else {
        const closureBriefPath = join(ctx.worktreeRoot, `${jobId}-closure-brief.md`);
        try {
          writeFileSync(closureBriefPath, closureBrief, 'utf8');
          const closureOut = execFileSync(process.execPath, [
            join(ctx.repoRoot, 'scripts', 'brief-closure.mjs'),
            '--brief', closureBriefPath, '--base', base, '--tip', branch,
            '--root', ctx.repoRoot, '--candidates-only',
          ], { encoding: 'utf8', timeout: 60000, stdio: ['ignore', 'pipe', 'pipe'] });
          for (const l of String(closureOut).split(/\r?\n/)) {
            if (l.startsWith('SCOPE ')) ctx.log(`closure scope (reviewer-side, not refused): ${l.slice(6)}`);
          }
          ctx.log('closure: no pin-miss candidates');
        } catch (e) {
          const out = e && e.stdout ? String(e.stdout) : '';
          const outLines = out.split(/\r?\n/);
          const candidates = outLines.filter((l) => l.startsWith('CANDIDATE '));
          for (const l of outLines) {
            if (l.startsWith('SCOPE ')) ctx.log(`closure scope (reviewer-side, not refused): ${l.slice(6)}`);
          }
          if (candidates.length > 0) {
            const reason = `brief closure refused: ${candidates.join('; ')}`;
            ctx.log(`closure: merge refused — ${reason}`);
            // `closure-candidates` is a review.mjs DIFF_REFUSAL_CODE, so the
            // refusal joins the revision findings like any other diff-measured
            // one; when the verdict gate already failed, its reason is kept
            // and the closure text joins it rather than replacing it. Without
            // a verdict record there is nothing to carry the refusal, and the
            // missing record fails closed upstream — so the candidates are
            // logged, and the no-record failure stands unmodified.
            if (gate.verdict) {
              gate = gate.ok
                ? { ok: false, code: 'closure-candidates', reason, verdict: gate.verdict }
                : { ...gate, reason: `${gate.reason} | ${reason}` };
            }
          } else {
            ctx.log(`closure: instrument did not judge (exit ${e && e.status != null ? e.status : 'spawn-failed'}${e && e.killed ? ', killed at the cap' : ''}) — skipping loudly, the verdict gate stands`);
            if (out.trim()) ctx.log(`closure output: ${out.trim().split(/\r?\n/).slice(0, 5).join(' | ')}`);
          }
        } finally {
          try { unlinkSync(closureBriefPath); } catch { /* best-effort temp cleanup */ }
        }
      }
    }
    // The reviewer analogue of the author's no-output detection (beads
    // addictedtoai-g8a): no verdict record, not killed, and nothing on stdout
    // — the shape of a reviewer that never really ran. Measured from `rev`,
    // which already carries both halves (`recordWritten` from `runReview`'s
    // own `existsSync`, and `run.stdout` from the executor). See
    // `reviewProducedNothing`'s doc comment for why a malformed-but-present
    // record does NOT count, and why `no-record` alone is not enough either.
    // Task 63: on the per-page branch each page already recorded its own
    // signal on its own phase above — this single-phase handling runs only
    // for the single/non-reviewed paths.
    let reviewerProducedNothing = false;
    let reviewPhase = null;
    if (!isPerPageReviewed) {
    reviewerProducedNothing = reviewProducedNothing(rev.run, rev.recordWritten, reviewer);
    if (reviewerProducedNothing) {
      ctx.log(
        `review pass ${pass} produced nothing at all: no verdict record and nothing on stdout. ` +
          `Recording signal \`${NO_OUTPUT_SIGNAL}\` on this phase.`,
      );
    }
    reviewPhase = phase(
      `review${pass}`,
      reviewer,
      rev.run,
      gate.ok ? 'approve' : gate.code,
      reviewerProducedNothing ? NO_OUTPUT_SIGNAL : undefined,
    );
    if (gate.verdict) reviewPhase.carried = Array.isArray(gate.verdict.carry) ? gate.verdict.carry.length : 0;
    }
    if (gate.ok) {
      ctx.log(`review: approve (would-cite recorded)`);
      return finish({ outcome: 'approve', mm, changed, verdict: gate.verdict, pass, diffText });
    }
    ctx.log(`review: merge refused — [${gate.code}] ${gate.reason}`);
    if (gate.code === 'no-record' || gate.code === 'malformed-verdict') {
      // Fail closed, and say WHY the record is missing — the refusal is
      // correct, but "no-record" alone does not distinguish a reviewer killed
      // at its cap from one that ended on its own with its judgment unwritten.
      // The second is what happened on j-20260829-01 (beads addictedtoai-5z9).
      ctx.log(
        `  the reviewer's run ${
          rev.run.killed
            ? `was killed at the ${reviewAllowance.capMinutes}-minute cap` +
              (reviewAllowance.derived
                ? ` (which was the job's remaining total budget, not the ${capMinutes}-minute per-invocation cap)`
                : '')
            : `ended on its own after ${rev.run.mm.toFixed(2)} model-minutes (exit ${rev.run.code})`
        } and left no usable verdict at ${rev.outPath}. Its log is at ${rev.run.logPath ?? '(not captured)'}.`,
      );
      return finish({ outcome: 'failed', mm, changed, note: gate.reason });
    }
    // A blank or recycled forced-judgment field means THE RECORD is unusable,
    // not the work. Sending the author into a revision pass against a
    // reviewer's clerical failure spends an executor on nothing. The list is
    // `review.mjs`'s (`REISSUE_CODES`) rather than two codes written out here:
    // the `reads-human` refusals joined it, and a hard-coded pair would have
    // sent every post whose reviewer left that field blank into a revision.
    if (isReissueRefusal(gate.code)) {
      return finish({ outcome: 'failed', mm, changed, note: gate.reason });
    }
    if (pass >= 2) {
      ctx.log('a second non-approval discards the job: branch closed, reasons kept');
      // `pass` matters, and its absence here was a real defect: everything
      // downstream reads `verdictPath(ctx, jobId, result.pass ?? 1)`, so a
      // discard silently transcribed PASS ONE's carried findings and would
      // have recorded pass one's reasons on the proposal — not the refusal
      // that actually discarded the job. Measured on j-20260903-03, whose two
      // transcribed findings both came from the pass-1 record while the
      // blocking finding sat in pass 2 (addictedtoai-z5dj).
      return finish({ outcome: 'discarded', mm, changed, note: gate.reason, verdict: gate.verdict, pass });
    }
    // One revision pass against the named findings, then a delta review.
    //
    // A DIFF-MEASURED refusal is added to them (beads addictedtoai-jdt8). The
    // reviewer can write a well-formed `approve` and the merge still refuse —
    // `carried-deletion-unearned` is measured from the branch, not from the
    // record — so the record's `reasons:` and `notes:` say nothing about it,
    // and an author handed only those two fields is being asked to fix
    // findings that never mention why its work was refused. The predicate is
    // `review.mjs`'s, not a `gate.code === '…'` literal here, for the reason
    // `REISSUE_CODES` states.
    //
    // Task 63: on the per-page branch the revision answers every failing
    // page, not just the first — `perPageRevisionFindings` already carries
    // each failing page's reasons/notes (one revision, then pass 2 re-reviews
    // all pages). Otherwise the findings are the single gate's, as before.
    findings = isPerPageReviewed && perPageRevisionFindings
      ? perPageRevisionFindings
      : [
      gate.verdict.reasons.join(', '),
      gate.verdict.notes,
      isDiffRefusal(gate.code) ? gate.reason : '',
    ]
        .filter((s) => String(s ?? '').trim())
        .join('\n\n');
    // And the revision is an invocation like any other, so it is asked for the
    // same permission. Refusing HERE rather than at the delta review is the
    // cheaper stop of the two: the job ends one invocation earlier and the
    // findings are already on the verdict record either way.
    const revisionAllowance = allowance('revision pass');
    if (!revisionAllowance.ok) {
      ctx.log(`BUDGET: ${revisionAllowance.reason}`);
      ctx.log(`the reviewer's findings are kept at ${verdictPath(ctx, jobId, pass)}; the revision is not invoked`);
      return finish({ outcome: 'abandoned', mm, changed, note: revisionAllowance.reason, verdict: gate.verdict, pass });
    }
    ctx.log(`one revision pass against the named findings, under a ${revisionAllowance.capMinutes}-minute cap${capNote(revisionAllowance)}`);
    // The revision brief is rebuilt from the current verdict, accounting,
    // judged diff and structurally cited requirements. The original author
    // brief is deliberately not sent again: its spend figures are stale and
    // its unrelated outcome and proposal prose are not revision inputs.
    // REVISION/RESUME RULING (bead 7dmp): 2b and 3a do not run here BY DESIGN,
    // not by omission — a revision brief is a DELTA against a verdict, not a
    // restatement of the source, so reconciling it against the full ledger
    // and dispatch state false-fires by construction. Closure over the final
    // diff is judged at the merge gate above (brief-closure), which reads the
    // committed brief against what is actually about to merge.
    const revisionBrief = assembleRevisionBrief(ctx, {
      jobId,
      job,
      branch,
      capMinutes: revisionAllowance.capMinutes,
      mmSoFar: spent(),
      invocations: prior.invocations + phases.length,
      totalMinutes,
      floorMinutes,
      verdict: gate.verdict,
      findings,
      diffText,
      // The committed work-order declaration: the revision brief's acceptance
      // checks and fallback excerpts key on the governing type (task 59).
      workOrder: workOrder ?? null,
    });
    // A revision is a second executor invocation into the same worktree, so it
    // gets the same brake window as the author run. This is also the ONLY place
    // the "a brake disappeared from the repository root" test is not vacuous:
    // `startGate` guarantees neither file exists when the author run starts, but
    // the maintainer can write one while the review is running, and a revision
    // that removes it is exactly the self-serving act breaker 4 names.
    brakesBefore = brakeState(ctx);
    // Same reason as the author pass: a revision runs the gates its brief asks for.
    const revisionLink = linkNodeModules(worktree, ctx.repoRoot);
    if (!revisionLink.linked && revisionLink.why !== 'already present') {
      ctx.log(`node_modules not linked for the revision: ${revisionLink.why}`);
    }
    const run2 = await runExecutor({
      command: runner.command,
      cwd: worktree,
      promptText: revisionBrief,
      promptPath: join(ctx.worktreeRoot, `${jobId}-revision-brief.md`),
      timeoutMs: revisionAllowance.capMinutes * 60 * 1000,
      role: 'author',
      jobId,
      logPath: jobLogPath(ctx.worktreeRoot, jobId, 'revision'),
    });
    mm += run2.mm;
    phase('revision', runner, run2, 'unclassified');
    unlinkNodeModules(worktree);
    commitAll(ctx.repoRoot, worktree, `job ${jobId}: revision`, { exclude: ['RESULT.md'] });
    refreshBase('the revision');

    // Both channels again, not just the brakes. Breaker 4 ran once, after the
    // AUTHOR run, and a revision is a second unattended invocation into the same
    // worktree — a revision that edited `runners.yml` reached the merge gate
    // unexamined. Checking only the brakes here would look like coverage of the
    // revision pass while being half of one, which is the failure mode this
    // whole repair is about.
    const changed2 = changedPathsWithStatus(ctx.repoRoot, base, branch).filter(
      (e) => e.path !== '.job/brief.md' && !e.path.startsWith('.job/'),
    );
    const brakes2 = brakeScan(ctx, { worktree, before: brakesBefore });
    for (const n of brakes2.notices) ctx.log(`NOTICE: ${n}`);
    const reserved2 = checkReservedPaths(ctx, [...changed2, ...brakes2.entries], jobId);
    if (reserved2.tripped) {
      ctx.log(`BREAKER: ${reserved2.reason}`);
      return finish({ outcome: 'failed', mm, held: reserved2, changed, note: 'reserved-path edit attempt (revision pass)' });
    }
    pass = 2;
  }
}

/**
 * Tear down a job's worktree. CLEANUP, NOT THE OUTCOME (beads
 * addictedtoai-osru).
 *
 * MEASURED 2026-09-06 on job `j-20260906-17`. The author committed 527 lines to
 * its branch and exited without `RESULT.md`, so the run was classified
 * `interrupted` — correctly. Then the three calls below ran INLINE and
 * unguarded, and `rmSync` threw
 *     EPERM: operation not permitted, \\?\D:\addictedtoai-worktrees\j-20260906-17
 * because a process the author had left running still had the worktree as its
 * working directory. Windows lets the files go and refuses the directory. The
 * throw escaped before `recordOutcome()` and before `commitJobRecords`, so the
 * run ended on `loop error: EPERM` with NO ledger line (`data/ledger.jsonl`
 * stopped at `j-16`), no verdict record, no records commit, and 11.91
 * model-minutes unaccounted — and a resumed job reads its prior spend FROM the
 * ledger, so that job's budget is now understated by exactly the invocation
 * that produced the work.
 *
 * The branch survives either way (`resume.mjs` reads "no ledger line, but a
 * brief is committed" as interrupted), so what the throw destroys is never the
 * work; it is the RECORD of the work. That is the wrong thing to lose to a
 * failed `rm`.
 *
  * So every step is guarded SEPARATELY and the run continues. A refusal from
  * git leaves the directory and its files standing; `rmSync` is not a fallback
  * for that refusal. When git succeeds but leaves an empty directory behind,
  * `rmSync` clears that residue and prune then cleans any stale registration.
 *
 * `deps` is a seam, and it is reached end to end through `ctx.worktreeCleanup`,
 * which nothing in production sets — `makeContext` does not create the field, so
 * the loop's own call resolves to `{}` and every default below is the real
 * function. It exists so a test can make the removal throw on ANY platform: a
 * directory that is genuinely undeletable is a Windows-only, timing-dependent
 * condition, and a guard measured only where it happens to reproduce is a guard
 * measured nowhere.
 *
  * @returns {{removed: boolean, failures: string[], refused?: boolean}}
 */
export function removeJobWorktree(ctx, worktree, deps = {}) {
  const remove = deps.remove ?? removeWorktree;
  const rm = deps.rm ?? rmSync;
  const prune = deps.prune ?? ((repo) => void gitTry(repo, ['worktree', 'prune']));
  const lstat = deps.lstat ?? lstatSync;
  const unlink = deps.unlink ?? unlinkSync;
  const failures = [];

  // A `node_modules` junction that is still linked is a STOP, not a cleanup
  // failure to continue past. A forced worktree removal FOLLOWS a junction
  // into its target, and the target is the repository's one shared install —
  // measured 2026-09-07 on job j-20260907-03, when a scratch worktree's forced
  // removal emptied D:/AddictedtoAI/node_modules under every running suite on
  // the machine. `unlinkNodeModules` is best-effort (a link a process holds
  // open will not unlink), so it is re-tried here and, if the link is STILL
  // there, the removal is refused: the directory is left for the next run's
  // startup sweep, which unlinks before it deletes, and the prune still runs.
  const link = join(worktree, 'node_modules');
  const isLinked = () => {
    try {
      return lstat(link).isSymbolicLink();
    } catch {
      return false;
    }
  };
  if (isLinked()) {
    try {
      unlink(link);
    } catch {
      /* judged by the re-check below */
    }
  }
  if (isLinked()) {
    ctx.log(
      `WORKTREE CLEANUP REFUSED: ${link} is still a junction to the shared node_modules, and ` +
        `\`git worktree remove --force\` or a recursive delete would follow it into the real install ` +
        `(measured 2026-09-07 on job j-20260907-03: the shared install was emptied). The directory ` +
        `is left for the next run's startup sweep; the run CONTINUES to its ledger line and its ` +
        `records commit.`,
    );
    const pruneOnly = [];
    try {
      prune(ctx.repoRoot);
    } catch (e) {
      pruneOnly.push('git worktree prune');
      ctx.log(`WORKTREE CLEANUP FAILED: git worktree prune on ${worktree}: ${(e && e.message) || String(e)}`);
    }
    return { removed: false, failures: ['node_modules junction still linked', ...pruneOnly], refused: true };
  }
  const step = (what, fn) => {
    try {
      return fn() !== false;
    } catch (e) {
      failures.push(what);
      const code = e && e.code ? ` (${e.code})` : '';
      ctx.log(
        `WORKTREE CLEANUP FAILED: ${what}${code} on ${worktree}: ${(e && e.message) || String(e)} — ` +
          `the run CONTINUES to its ledger line and its records commit; the worktree is cleanup, not ` +
          `the outcome, and the next run clears a stale directory before it adds one ` +
          `(addictedtoai-osru)`,
      );
      return false;
    }
  };
  const removed = step('git worktree remove', () => {
    const result = remove(ctx.repoRoot, worktree);
    if (!result || result.ok !== true) {
      failures.push('git worktree remove');
      ctx.log(
        `WORKTREE CLEANUP REFUSED: git worktree remove on ${worktree}: ` +
          `${result?.reason ?? 'the removal did not return ok'} — the directory is left standing ` +
          `and the run CONTINUES to its ledger line and its records commit (addictedtoai-osru).`,
      );
      return false;
    }
    return true;
  });
  if (removed) step('rmSync', () => rm(worktree, { recursive: true, force: true }));
  step('git worktree prune', () => prune(ctx.repoRoot));
  return { removed: failures.length === 0, failures };
}

export async function runLoop(ctx, opts = {}) {
  const gate = startGate(ctx);
  if (!gate.ok) {
    ctx.log(`the Desk does not start: ${gate.why}`);
    return { started: false, reason: gate.why };
  }

  const cfg = loadConfig(ctx);
  const registry = loadRunners(ctx);
  let runner = pickRunner(registry, { id: opts.runner, role: 'author' });
  const reviewer = pickRunner(registry, { id: opts.reviewer, role: 'reviewer' });
  for (const [role, who] of [['author', runner], ['reviewer', reviewer]]) {
    if (who.enabled !== false) continue;
    const reason =
      `runner "${who.id}" is disabled (enabled: false) and cannot be used for the ${role} role`;
    ctx.log(`REFUSED [runner:disabled]: ${reason}`);
    return { started: true, selected: null, refused: reason, rule: 'runner:disabled' };
  }
  const ledger = readLedger(ctx);
  const now = ctx.now();

  // The expiry sweep, before selection can refuse a candidate. Enablement is
  // checked immediately after runner resolution because it outranks this
  // housekeeping refusal by policy.
  //
  // Placed here for the same reason the 14-day abandon sweep sits ahead of the
  // health gate: housekeeping that stops when a runner is refused is
  // housekeeping that stops exactly when it is needed. A candidate whose
  // evidence has stopped being current must leave the pool whether or not this
  // run goes on to select anything, and it must leave it BEFORE selection, so
  // that no run can be dispatched at a story the clock has already retired.
  // `--dry-run` reports the sweep without performing it (specs/loop).
  const swept = sweepExpiredProposals(ctx, { dryRun: opts.dryRun });
  for (const n of swept.notes) ctx.log(`note: ${n}`);
  // The sweep moves files inside `data/`, which is committed in full, so the
  // move is staged with the run's own records at the end. Both halves are
  // named — the vanished source as well as the new record — because staging
  // only the destination leaves the deletion uncommitted and the proposal
  // appears to exist in two places in the history.
  const sweptPaths = swept.swept
    .filter((s) => s.moved)
    .flatMap((s) => [relative(ctx.repoRoot, s.path), relative(ctx.repoRoot, s.dest)])
    .map((p) => p.replace(/\\/g, '/'));

  ctx.log(`runner: ${runner.id} (provider ${runner.provider}, tier ${runner.tier}) — the only file naming a model, provider or harness is runners.yml`);
  const conf = conformanceGate(loadConformance(ctx), runner.id);
  ctx.log(
    `conformance: runner "${runner.id}" — loaded ${conf.entries} conformance ` +
      `${conf.entries === 1 ? 'entry' : 'entries'}`,
  );
  if (!conf.ok) {
    ctx.log(`REFUSED: ${conf.reason}`);
    return { started: true, selected: null, refused: conf.reason };
  }
  if (conf.unrecorded) {
    ctx.log(`note: runner "${runner.id}" has no recorded conformance result. Only a recorded FAIL blocks selection, but run \`node loop/conformance.mjs --runner ${runner.id}\` before trusting it.`);
  }

  const base = opts.base ?? currentBranch(ctx.repoRoot);

  // --- Resumption, before the three work sources. -------------------------
  const scan = scanJobBranches(ctx, { ledger, base });

  // -------------------------------------------------------------------------
  // ONE ANSWER TO "WHAT TYPE IS THIS BRANCH'S JOB", SHARED BY BOTH CONSUMERS
  // (beads addictedtoai-bze3).
  //
  // Two places decide it: the budget-exhaustion sweep just below, and the
  // resume path further down. They must not be able to disagree — a branch the
  // sweep measures as `machinery` and the resume path runs as `verify` would be
  // let past a check it should not have passed, and then abandoned one step
  // late by `executeJob`'s defence-in-depth, after a worktree exists. The
  // requirement puts that abandonment BEFORE selection, so the two reads are
  // one read here.
  //
  // The precedence is the fix's precedence, in one place: the record selection
  // committed to the branch, checked against `JOB_TYPES` because it is input
  // off a branch; then the job's last ledger line; then `machinery`, which is a
  // guess and is logged as one. Memoised because `git show` per branch per
  // consumer is a cost with no answer to add.
  // -------------------------------------------------------------------------
  const committedSources = new Map();
  const committedSourceFor = (branch) => {
    if (!committedSources.has(branch)) committedSources.set(branch, readCommittedJobSource(ctx.repoRoot, branch));
    return committedSources.get(branch);
  };
  const committedTypeFor = (branch) => {
    const src = committedSourceFor(branch);
    return JOB_TYPES.includes(src?.type) ? src.type : null;
  };
  for (const b of scan.abandonable) {
    const last = b.last;
    ctx.log(`abandoning ${b.branch}: ${b.ageDays.toFixed(1)} days old, past the 14-day limit`);
    if (!opts.dryRun) {
      appendLedger(
        ctx,
        makeLedgerLine({
          id: b.id,
          type: last?.type ?? 'machinery',
          runner: last?.runner ?? runner.id,
          provider: last?.provider ?? runner.provider,
          tier: last?.tier ?? runner.tier,
          mm: 0,
          outcome: 'abandoned',
          note: `resumable branch ${b.branch} was ${b.ageDays.toFixed(1)} days old`,
          ts: now.toISOString(),
        }),
      );
    }
  }

  // -------------------------------------------------------------------------
  // THE SAME HOUSEKEEPING FOR A JOB THAT HAS SPENT ITS TOTAL BUDGET
  // (beads addictedtoai-o5t).
  //
  // THIS IS WHERE THE DEFECT ACTUALLY LIVED. Spend accumulates across
  // invocations, and resumption is where an accumulated total is easiest to
  // lose: `resume.mjs` rebuilds a job object from its branch and by design
  // remembers nothing, so without this a job could be interrupted at its bound
  // and handed a fresh allowance on the next run, and again on the one after
  // that — an unbounded total by a slower road than four caps in one run.
  //
  // The ledger is the only durable record of what an earlier run cost, and
  // `jobSpendSoFar` already sums every line a job id carries. Nothing new is
  // stored, and nothing is remembered: the branch says which job, the ledger
  // says what it has cost, and this is the arithmetic between them.
  //
  // Shaped exactly like the 14-day sweep above, and placed beside it for the
  // same two reasons. Before the health gate, because housekeeping that stops
  // when a runner is refused stops exactly when it is needed. As a SWEEP rather
  // than a check on the one branch about to be resumed, because a second
  // exhausted branch behind the first would otherwise sit unexamined until it
  // reached the front of the queue.
  //
  // `abandoned` is the outcome, and the choice is load-bearing. It is not a
  // failure outcome, so breaker 1 neither counts it nor is reset by it — a job
  // that ran out of budget says nothing about whether its TYPE is broken, and
  // counting it would disable a whole job type for a reason unrelated to its
  // quality. And a branch whose last line is `abandoned` is not resumable, so
  // this cannot spin: the sweep fires once per branch, ever.
  // -------------------------------------------------------------------------
  const resumable = [];
  for (const b of scan.resumable) {
    // The branch's own committed record first, exactly as the resume path reads
    // it. Reading only the ledger here would measure the budget of a type the
    // job never was — and, worse, write that wrong type onto the permanent
    // `abandoned` line, minting a false record while fixing one (bze3).
    const type = committedTypeFor(b.branch) ?? b.last?.type ?? 'machinery';
    const spend = jobSpendSoFar(ledger, b.id);
    const allow = invocationAllowance(cfg, {
      type,
      spentMm: spend.mm,
      role: 'next invocation of this resumed job',
    });
    if (allow.ok) {
      resumable.push(b);
      continue;
    }
    ctx.log(`abandoning ${b.branch}: ${allow.reason}`);
    ctx.log(
      `  its spend is the sum of ${spend.invocations} recorded invocation(s) across every ledger ` +
        `line carrying id ${b.id} — a resumed job inherits what it has already cost, it does not ` +
        `start again at zero`,
    );
    if (!opts.dryRun) {
      appendLedger(
        ctx,
        makeLedgerLine({
          id: b.id,
          type,
          runner: b.last?.runner ?? runner.id,
          provider: b.last?.provider ?? runner.provider,
          tier: b.last?.tier ?? runner.tier,
          // Zero, because no process ran. The spend is already on the lines this
          // was computed from and counting it twice would inflate the budget
          // shares that read `mm`.
          mm: 0,
          outcome: 'abandoned',
          note: allow.reason,
          ts: now.toISOString(),
        }),
      );
    }
  }

  // Runner health, after the 14-day abandon sweep and BEFORE resumption. The
  // placement is both halves of the fix. Before resumption, because a dead
  // credential leaves an interrupted branch, an interrupted branch is resumable,
  // and resumption happens ahead of the three work sources — a check sitting
  // only in the selector would never be reached and the spin would continue.
  // After the abandon sweep, because refusing a runner must not also stop the
  // housekeeping that keeps dead branches from accumulating silently — that is
  // the failure this whole issue is about, and it would be perverse to
  // reintroduce it while fixing it (beads addictedtoai-h5k).
  //
  // BOTH ROLES, because the requirement says both: "the loop SHALL refuse that
  // runner for the `author` and `reviewer` roles". Only the author was gated
  // here before, and the reviewer half is not a formality — measured on a
  // throwaway repository with a healthy author and a dead reviewer, the loop
  // selected a job, spent the author's whole run producing a diff, invoked the
  // dead reviewer, got no verdict record, and failed the job at `no-record`.
  // Every one of those minutes bought work that could not have merged, because
  // nothing merges without a review. Refusing the run is therefore the cheaper
  // and the honest outcome, and it happens before any executor is invoked.
  for (const [role, who] of [['author', runner], ['reviewer', reviewer]]) {
    const h = runnerHealthGate(ledger, who.id);
    if (!h.ok) {
      ctx.log(`REFUSED [${h.rule}]: (${role} role) ${h.reason}`);
      return { started: true, selected: null, refused: `(${role} role) ${h.reason}`, rule: h.rule };
    }
    if (h.streak > 0) {
      ctx.log(
        `note: ${role} runner "${who.id}" produced nothing on its last ${h.streak} run(s); ` +
          `at ${NO_OUTPUT_STREAK_LIMIT} it is refused until a run on it produces something.`,
      );
    }
  }

  const lane = lanePause(ledger, runner.provider, now);
  let resumeTarget = null;
  // `resumable`, not `scan.resumable`: a branch swept above for an exhausted
  // total budget is no longer a resumption candidate on this run either.
  if (!lane.paused && resumable.length > 0) resumeTarget = resumable[0];
  if (lane.paused) ctx.log(`lane paused: ${lane.reason}`);

  let jobId;
  let job;
  let branch;
  let briefText;
  let briefGraphSidecar = null;
  // The committed work-order declaration for this run's branch: constituted
  // at selection (new jobs) or read off the branch (resumed). Threaded into
  // `executeJob` so the review brief's checklist keys on the governing type.
  let runWorkOrder = null;
  let resumed = false;
  /**
   * The proposal this job was selected from, if any — `{slug, path}` with an
   * absolute `path`. Carried all the way to the merge, where a done outcome
   * retires it (see `consumeProposal`). Null for directives, queue items, and
   * for a resumed branch whose selection predates `.job/source.json`.
   */
  let proposalOrigin = null;
  /**
   * The beads issues this job serves, as a list (`addictedtoai-occ0`). Set from
   * the selected candidate below, or recovered from `.job/source.json` on a
   * resumed branch — a job that spans two runs serves the same issues in both,
   * and re-deriving them from a directives file the maintainer may have edited
   * since would be a guess.
   */
  let jobIssues = [];

  if (resumeTarget) {
    resumed = true;
    jobId = resumeTarget.id;
    branch = resumeTarget.branch;
    const committed = readCommittedBrief(ctx.repoRoot, branch);
    if (!committed) {
      ctx.log(`${branch} has no committed .job/brief.md — cannot resume it honestly; leaving it for the maintainer`);
      return { started: true, selected: null, reason: 'unresumable branch' };
    }
    // Where this job came from, read off the branch rather than remembered.
    // Without it a resumed proposal job merges and leaves its proposal
    // selectable, which is the same defect through the resumption door.
    const origin = committedSourceFor(branch);
    // -----------------------------------------------------------------------
    // THE TYPE IS READ OFF THE BRANCH FIRST, AND THE ORDER IS THE WHOLE FIX
    // (beads addictedtoai-bze3).
    //
    // The type was decided at SELECTION and written into `.job/source.json`
    // beside the brief (see the write below, ~120 lines on). Until 2026-09-06
    // this line consulted only the job's last LEDGER line and hard-coded
    // `machinery` when there wasn't one — which is precisely the state a branch
    // interrupted before its first ledger line is in. Measured: j-20260906-10,
    // a `verify` job whose first run died removing its worktree, resumed as
    // `machinery` and charged 7.67 model-minutes to the tightest ceiling in
    // `data/config.json`. The correct value was committed on the branch the
    // whole time and `readCommittedJobSource` was already being called for it,
    // thirty lines after the decision.
    //
    // `machinery` READS AS THE CONSERVATIVE DEFAULT AND IS NOT: the type picks
    // the budget category, the per-type wall-clock cap and the shed level, and
    // it is written into the append-only ledger permanently. Falling back to it
    // is a guess, so it stays last and it says so in the log.
    //
    // The committed value is checked against `JOB_TYPES` because it comes off a
    // branch: an unrecognised type would index `job_caps_minutes` at `undefined`
    // rather than fail, and a value that cannot be a job type has not "been
    // found". The ledger fallback is left exactly as it was.
    //
    // `committedTypeFor` is the SAME function the budget-exhaustion sweep uses,
    // and that is not tidiness: two implementations of this precedence can
    // disagree about one branch, and a branch the sweep passed on the wrong
    // type is abandoned after a worktree exists rather than before selection.
    // -----------------------------------------------------------------------
    const committedType = committedTypeFor(branch);
    const lastType = resumeTarget.last?.type;
    const typed = committedType
      ? { type: committedType, from: '.job/source.json, committed at selection' }
      : lastType
        ? { type: lastType, from: "the job's last ledger line" }
        : { type: 'machinery', from: 'NEITHER a committed source record nor a ledger line — this is the fallback, not a measurement' };
    ctx.log(`resumed job type: ${typed.type} (from ${typed.from})`);
    job = { type: typed.type, source: 'resumed', title: `resume ${jobId}`, detail: '' };
    // The committed brief's spend figures are frozen at the run that wrote it.
    // For a resumed job they are stale by construction, so the current ones go
    // above it and say so.
    // The cap this brief prints is the one the invocation will actually get:
    // `min(per-invocation cap, what the job has left)`. A resumed job is the
    // one case where those two routinely differ, so printing the raw per-type
    // cap here would restate the exact falsehood addictedtoai-o5t is about.
    briefText = resumeBrief(committed, (() => {
      const spend = jobSpendSoFar(ledger, jobId);
      const allow = invocationAllowance(cfg, { type: job.type, spentMm: spend.mm, role: 'resumed run' });
      return {
        capMinutes: allow.capMinutes,
        // `mmSoFar`, NAMED, not `...spend`. `jobSpendSoFar` returns `{mm,
        // invocations}` and `invocationAccounting` reads `mmSoFar`, so spreading
        // it set the invocation count and silently left the spend at its default
        // of 0 — every resumed brief said "0.00 model-minutes across 4 completed
        // invocations", which is the stale-figure misreading addictedtoai-o5t
        // exists to end, reappearing inside its own disclosure. Found by the
        // resumption test below, not by reading.
        mmSoFar: spend.mm,
        invocations: spend.invocations,
        totalMinutes: jobTotalMinutes(cfg, job.type),
        floorMinutes: minInvocationMinutes(cfg, job.type),
      };
    })());
    ctx.log(`resuming ${branch} (${resumeTarget.reason}, ${resumeTarget.ageDays.toFixed(1)} days old) — no retry consumed`);
    // The work-order declaration committed at selection travels with the
    // branch: the review brief keys its checklist on the governing type, so
    // the resumed run reads the same declaration the author brief did.
    runWorkOrder = origin ?? null;
    // The rest of what the branch records about its own selection — read once,
    // above, before the type was chosen.
    if (Array.isArray(origin?.issues) && origin.issues.length) {
      jobIssues = origin.issues.filter(isIssueId);
      ctx.log(`this branch records that it serves ${jobIssues.join(', ')}`);
    }
    if (origin?.source === 'proposal' && origin.slug && origin.path) {
      proposalOrigin = { slug: origin.slug, path: join(ctx.repoRoot, origin.path) };
      ctx.log(`this branch records that it was selected from proposal \`${origin.slug}\` (${origin.path})`);
    }
  } else {
    let sel = selectJob(ctx, { cfg, ledger, runner, dryRun: opts.dryRun });
    for (const w of sel.warnings) ctx.log(`WARNING ${w}`);
    for (const n of sel.notes) ctx.log(`note: ${n}`);
    ctx.log(
      `budget (${runner.tier} tier, rolling ${cfg.budget.window_days}d): ` +
        (sel.shares.total_mm === 0
          ? 'no model-minutes recorded yet — no bound binds'
          : Object.entries(sel.shares.share_pct)
              .map(([k, v]) => `${k} ${v === null ? 'n/a' : v.toFixed(1) + '%'}`)
              .join(', ')),
    );
    if (sel.shares.total_mm > 0 && sel.shares.warming_up) {
      // Say which denominator the ceilings actually used, or the printed shares
      // above look like they contradict the refusals below them.
      ctx.log(
        `  warming up: ${sel.shares.total_mm.toFixed(2)} of ${sel.shares.warm_up_mm} model-minutes. ` +
          `The shares above are the observed ones; the CEILINGS are measured against the ` +
          `${sel.shares.ceiling_denominator_mm}-minute warm-up window (` +
          Object.entries(sel.shares.ceiling_pct)
            .map(([k, v]) => `${k} ${v.toFixed(1)}%`)
            .join(', ') +
          `), because a share of one job is not a share of anything. The upkeep floor still ` +
          `reads the observed share.`,
      );
    }
    if (sel.shed.level > 0) {
      ctx.log(`capacity shed level ${sel.shed.level} (${sel.shed.events} capacity event(s) in the trailing ${cfg.degradation.window_hours}h)`);
    }
    if (sel.refusals.length) for (const l of formatRefusals(sel.refusals)) ctx.log(l);
    const escalation = escalationTarget(registry, runner, sel);
    if (!escalation && sel.topRanked?.rule === 'runner:job-type') {
      const target = registry.byId.get(runner.escalates_to);
      if (target?.enabled === false) {
        ctx.log(
          `escalation refused: runner "${target.id}" is disabled (enabled: false); ` +
            `keeping the original selection outcome`,
        );
      }
    }
    if (escalation) {
      const top = sel.topRanked.candidate;
      ctx.log(
        `escalation: top-ranked ${top.type} candidate refused [${sel.topRanked.rule}] on ` +
          `runner "${runner.id}"; re-running selection on declared runner "${escalation.id}"`,
      );
      const escalated = selectJob(ctx, { cfg, ledger, runner: escalation, dryRun: opts.dryRun });
      if (escalated.topRanked === null && escalated.selected !== null) {
        runner = escalation;
        sel = escalated;
        ctx.log(`escalation adopted: top-ranked ${top.type} candidate selected on runner "${runner.id}"`);
      } else {
        const refused = escalated.topRanked
          ? escalated.refusals.find(
              (r) =>
                r.rule === escalated.topRanked.rule &&
                r.candidate?.type === escalated.topRanked.candidate.type,
            )
          : escalated.refusals[0];
        const detail = refused
          ? `refused [${refused.rule}] ${refused.reason}`
          : escalated.selected
            ? `selected ${escalated.selected.type} instead of the top-ranked candidate`
            : 'did not select the top-ranked candidate';
        ctx.log(
          `escalation refused: runner "${escalation.id}" ${detail}; keeping the original ` +
            `${sel.selected ? `selection ${sel.selected.type}` : 'selection outcome'}`,
        );
      }
    }
    if (!sel.selected) {
      ctx.log('nothing qualified — the run ends here, and that is a normal, healthy outcome');
      return { started: true, selected: null, refusals: sel.refusals, nothingQualified: true };
    }
    job = sel.selected;
    jobId = nextJobId(ledger, now, scan.resumable.concat(scan.other, scan.abandonable).map((b) => b.id));
    branch = `job/${jobId}`;
    // Task 59: constitute the declaration BEFORE assembling the brief, so the
    // brief's N blocks, excerpts (governing type + declared subjects),
    // verification section and graph annex all read the committed union —
    // never brief prose. The sidecar is assembled through the same single
    // per-subject queries (one query per subject) and committed beside the
    // brief. `opts.briefGraphQuery` is the injected seam tests stub (task-12
    // fixture pattern); production answers absent (no wired index).
    const newWorkOrder = buildWorkOrderDeclaration(job);
    const newGoverning = governingTypeFor(job, newWorkOrder);
    const briefSink = {};
    briefText = assembleBrief(ctx, {
      jobId,
      job,
      branch,
      capMinutes: cfg.job_caps_minutes[newGoverning] ?? cfg.job_caps_minutes[job.type],
      // A new job: nothing spent, nothing invoked. Stated rather than omitted,
      // because "0.00 across 0 invocations" is the figure that makes the cap
      // read as per-invocation on the very first brief.
      //
      // Named rather than spread, for the reason the resume path above records:
      // `jobSpendSoFar` returns `mm` and this reads `mmSoFar`. Here the two are
      // both zero by construction, which is exactly why the same defect was
      // invisible on this path and visible on that one.
      mmSoFar: jobSpendSoFar(ledger, jobId).mm,
      invocations: jobSpendSoFar(ledger, jobId).invocations,
      totalMinutes: jobTotalMinutes(cfg, newGoverning),
      floorMinutes: minInvocationMinutes(cfg, newGoverning),
      workOrder: newWorkOrder,
      sidecarSink: briefSink,
      graphIndexId: 'brief-index:merge-base-tree',
    }, undefined, (typeof opts.briefGraphQuery === 'function' ? opts.briefGraphQuery : briefGraphQueryForSubject));
    briefGraphSidecar = briefSink.sidecar ?? null;
    runWorkOrder = newWorkOrder;
    ctx.log(`selected: ${job.type} from ${job.source} — ${job.title}`);
    jobIssues = mergeIssueIds(job.issues);
    if (jobIssues.length) ctx.log(`this job serves ${jobIssues.join(', ')}`);
    if (job.source === 'proposal' && job.slug && job.path) {
      proposalOrigin = { slug: job.slug, path: job.path };
    }
  }

  ctx.log(`job id: ${jobId}`);
  ctx.log(`branch: ${branch}`);

  if (opts.dryRun) {
    ctx.log('--- ledger line schema (written at the end of a real run) ---');
    ctx.log(ledgerSchemaLine(job, runner, jobId));
    ctx.log(
      'plus, when they apply: "note", "signal" (no-output), "phases" — one ' +
        '{role, runner, mm, killed, code, outcome} per invocation (author / review1 / ' +
        'revision / review2), the author\'s carrying "gates" {retried, passed, transport} ' +
        'when a gate failure was retried — and "issues", the beads ids this job serves. "mm" above ' +
        'stays the JOB TOTAL; "phases" is what says where a per-invocation cap belongs. ' +
        '"issues" is omitted when the job serves none, which is the common case: routine ' +
        'upkeep has nothing behind it and an id per job would manufacture backlog noise.',
    );
    ctx.log('--- assembled brief ---');
    ctx.log(briefText);
    ctx.log('--- end of brief (dry run: nothing was invoked, no branch was created) ---');
    return { started: true, dryRun: true, jobId, branch, job, briefText, runner, resumed };
  }

  // --- Branch, worktree, committed brief. ---------------------------------
  mkdirSync(ctx.worktreeRoot, { recursive: true });
  const worktree = join(ctx.worktreeRoot, jobId);
  // Unlink a lingering `node_modules` junction BEFORE the recursive delete, so a
  // stale directory left by a refused cleanup (removeJobWorktree) is cleared
  // without the delete ever reaching the shared install through the link.
  unlinkNodeModules(worktree);
  try {
    const rm = ctx.worktreeStartup?.rm ?? rmSync;
    rm(worktree, { recursive: true, force: true });
  } catch (e) {
    const path = e?.path ?? worktree;
    const errno = e?.errno ?? 'unknown';
    const reason = `could not clear stale worktree before startup (path=${path}; errno=${errno})`;
    ctx.log(`REFUSED: ${reason}; the job is left for a later run`);
    return { started: true, selected: job, jobId, branch, refused: reason };
  }
  addWorktree(ctx.repoRoot, worktree, branch, { create: !resumed, base });
  if (!resumed) {
    mkdirSync(join(worktree, '.job'), { recursive: true });
    writeFileSync(join(worktree, '.job', 'brief.md'), briefText, 'utf8');
    gitTry(worktree, ['add', '.job/brief.md']);
    // Where this job came from, written down rather than remembered. The brief
    // is prose and says it too, but a mechanism that had to parse the prose of
    // a brief to find a file path would be guessing. Repo-relative and POSIX,
    // so it survives being read from a different worktree on a different
    // machine. `.job/` is removed from the branch before the merge, so this
    // never reaches `main`.
    //
    // Stage-2 task 55: the work-order declaration. `items` (one entry today:
    // bead, type, subjects, reason) and the union `declared_subjects` are
    // committed here, before any executor runs. Subjects come from
    // `candidateSubjects` — declared metadata only, never the brief text —
    // so a prohibition naming a path in the brief can never authorise it.
    // Task 59 reuses the same declaration the brief was assembled from (built
    // before `assembleBrief` above): rebuilding it here from the same job is
    // byte-identical by construction, not a second detector.
    const workOrder = buildWorkOrderDeclaration(job);
    writeFileSync(
      join(worktree, '.job', 'source.json'),
      JSON.stringify(
        {
          job: jobId,
          type: job.type,
          source: job.source ?? null,
          slug: proposalOrigin?.slug ?? null,
          path: proposalOrigin ? relative(ctx.repoRoot, proposalOrigin.path).replace(/\\/g, '/') : null,
          // The issues this job serves, written down rather than remembered, on
          // exactly the terms the proposal path above records: a resumed run
          // must not re-derive them from a directives file the maintainer may
          // have edited in between.
          issues: jobIssues,
          items: workOrder.items,
          declared_subjects: workOrder.declared_subjects,
        },
        null,
        2,
      ) + '\n',
      'utf8',
    );
    gitTry(worktree, ['add', '.job/source.json']);
    // Task 59 sidecar writer: `.job/graph.json` committed beside the brief
    // (per subject, queried names or `no-symbols`, caller/process counts,
    // risk, partial/truncated flags, index identifier), consumed at
    // merge/discard, never landing as a live path (`.job/` is removed before
    // the merge). Old-contract branches take no graph arm and write none.
    if (briefGraphSidecar) {
      writeFileSync(
        join(worktree, '.job', 'graph.json'),
        `${JSON.stringify(briefGraphSidecar, null, 2)}\n`,
        'utf8',
      );
      gitTry(worktree, ['add', '.job/graph.json']);
    }
    gitTry(worktree, ['commit', '--no-verify', '-m', `job ${jobId}: brief`]);
    ctx.log(`committed .job/brief.md and .job/source.json${briefGraphSidecar ? ' and .job/graph.json' : ''} to ${branch} — the branch now carries everything resumption needs`);
    if (workOrder.declared_subjects.length) {
      ctx.log(`declared subjects (${workOrder.declared_subjects.length}): ${workOrder.declared_subjects.join(', ')}`);
    } else {
      ctx.log(`declared subjects: (none declared — binds nothing unless the diff carries content paths, which refuse)`);
    }
  }
  const mergeBaseSha = mergeBase(ctx.repoRoot, base, branch);

  let result;
  try {
    result = await executeJob(ctx, {
      cfg,
      runner,
      reviewer,
      jobId,
      job,
      branch,
      worktree,
      resumed,
      briefText,
      workOrder: runWorkOrder,
      gates: opts.noGates ? false : opts.gates,
      ledger,
      base: mergeBaseSha,
      // The target ref itself, so the job runner can re-measure the base after
      // each executor pass (see `refreshBase`); the SHA above is only where it
      // starts.
      baseRef: base,
      // What this job cost BEFORE this run. Zero for a new job; for a resumed
      // one, the sum of its earlier lines — without it every brief in a resumed
      // job would restate the running total as though the job had just started.
      prior: jobSpendSoFar(ledger, jobId),
    });
  } finally {
    unlinkNodeModules(worktree);
  }

  // --- Merge, publish, ledger. --------------------------------------------
  let outcome = result.outcome;
  let mergedSha = null;
  /** Set when the derived tree was recomputed after a merge (addictedtoai-942). */
  let rederived = false;
  /**
   * The merged job branch, deleted after the worktree that holds it is gone.
   * `null` on every other outcome — a branch that did not merge is kept.
   */
  let mergedBranch = null;
  /**
   * Pinned-dead pre-U5 per-job publish flag (Stage-1 U5): always false —
   * the merge lands on train and the TRAIN's scoped push (publishTrain)
   * owns the push — retained because `publish-after-records` +
   * `ledger-before-publish` pin the single `publishStep(` call site and
   * its order after the records. See the call site for the measurement
   * (addictedtoai-tqpq).
   */
  let publishAfterRecords = false;
  /** Both halves of the consumed-proposal move, staged with the job's records. */
  const consumedPaths = [];

  // -------------------------------------------------------------------------
  // THE LEDGER LINE IS WRITTEN BEFORE ANYTHING RECOMPUTES THE QUEUE FROM IT.
  //
  // It used to be written at the very end of the run, after `rederiveStep`. So
  // the queue was recomputed from a ledger that did not yet contain the job
  // that had just finished — and the derived queue is a function of the ledger
  // for at least one item.
  //
  // MEASURED, 2026-08-30: the daily scout ran; its post-merge rederive
  // recomputed a queue that still advertised `scout-due`, because
  // `pulse/lib/queue.mjs` `scoutRanToday` reads the ledger and the scout's line
  // was not in it yet; and the very next Desk run selected the scout AGAIN.
  // 20.7 model-minutes on a duplicate daily sweep, and the "once per day"
  // requirement in specs/pulse violated by the mechanism that implements it.
  //
  // The alternative — teaching the derivation about an in-flight job — would
  // put a second, special-cased notion of "what has happened" beside the
  // ledger, which is the file whose whole job is to be that notion. Writing the
  // record when the outcome is known is the smaller and truer change.
  //
  // Idempotent, because it is called from two places: the merge path calls it
  // before the rederive, and every other path falls through to the call at the
  // foot of this function. The line is appended exactly once either way.
  // -------------------------------------------------------------------------
  // Item 5 lineage wire (wisdom item 5): a measurement lineage the job carried
  // in rides the ledger line additively beside brief_chars and gate_seconds,
  // where `loop/lib/lineage.mjs` can later judge an independence claim against
  // it. No selector sets one today, so this is absent in practice and a line
  // without it keeps its exact shape; `makeLedgerLine` omits it when
  // undefined, so this changes nothing until a job arrives carrying one.
  const jobLineage = job.lineage ?? undefined;
  let ledgerLine = null;
  const recordOutcome = () => {
    if (ledgerLine) return ledgerLine;
    ledgerLine = appendLedger(
      ctx,
      makeLedgerLine({
        id: jobId,
        type: job.type,
        runner: runner.id,
        provider: runner.provider,
        tier: runner.tier,
        mm: result.mm ?? 0,
        outcome,
        note: result.note,
        signal: result.signal,
        phases: result.phases,
        // The join, carried from whatever source this job was selected from
        // (`addictedtoai-occ0`). Omitted when the job serves no issue, which is
        // the common and healthy case.
        issues: jobIssues,
        brief_chars: briefText.length,
        gate_seconds: result.gate_seconds,
        authority_sha: mergeBaseSha,
        lineage: jobLineage,
        ts: ctx.now().toISOString(),
      }),
    );
    ctx.log(`ledger: ${JSON.stringify(ledgerLine)}`);
    // First-producer judgment (item 5 follow-up): classify this outcome's
    // computed triple against the process store. The verdict goes to the
    // log only — never onto the line, whose exact shape the packet-E
    // closure pins. Ledger writes never fail on lineage.
    try {
      const triple = selectOutcomeLineage(
        { mergeBaseSha, jobType: job.type },
        (d, n) => outcomeLineageStore.resolve(d, n),
      );
      if (triple) {
        const judged = classifyClaim(outcomeLineageStore, { lineage: triple });
        if (judged.ok) {
          ctx.log(
            judged.independent
              ? `lineage: ${jobId} independent (${judged.id})`
              : `lineage: ${jobId} consistencyOf ${judged.consistencyOf} — same producer+digest as an earlier outcome in this process; check job ids before reading corroboration`,
          );
        } else {
          ctx.log(`lineage: ${jobId} ${judged.code} — ${judged.reason}`);
        }
      }
    } catch {
      // lineage observation must not move the ledger path
    }
    return ledgerLine;
  };

  // Stage-2 tasks 55 (amended) + 56 (root fix): the committed-declaration
  // gate, scoped to merges carrying content paths, with the subject set
  // CONSTITUTED from the declaration and the diff used only to CHECK it.
  // Read from branch history (`git show branch:.job/source.json`, via the
  // declaration-read seam `opts.declarationReader`), never the working tree —
  // the check is on what selection committed before any executor ran. Content
  // presence is measured with the same `joinableSubjects` predicate task 56
  // uses (joinable content paths, deletions excluded); no second detector.
  // Old-contract branches (neither key present) complete under the single-item
  // contract with no refusal and no graph arm. A missing or empty declaration
  // refuses only where the diff carries content paths, naming them; a diff
  // with no content paths binds nothing, logs, and merges. Per-item
  // retirement runs on every new-contract merge (content or code-only — a
  // machinery item's subject is a code file, and binding nothing is about the
  // record, not about whether the work was done); on a merge that binds
  // nothing the graph scope side is advisory (logged, never refusing).
  // Checked before the scaffolding removal below, so a refused branch keeps
  // its `.job/` evidence instead of gaining a removal commit on the way to
  // no merge.
  //
  // Seams (task-37 fixture policy: throwaway repos, stubbed spawns, never a
  // live push or live index write): `opts.declarationReader`,
  // `opts.graphSidecarReader`, `opts.mergeGraphAnalysis` — each defaulting to
  // the history-reading production function (or to absent, for the graph).
  let mergeSubjects = null;
  let mergeRetirement = null;
  if (outcome === 'approve') {
    const readSource = opts.declarationReader ?? readCommittedJobSource;
    const readSidecar = opts.graphSidecarReader ?? readCommittedGraphSidecar;
    const committedSource = readSource(ctx.repoRoot, branch);
    const mergeDiff = changedPathsWithStatus(ctx.repoRoot, mergeBaseSha, branch);
    const contentPaths = joinableSubjects(mergeDiff);
    // Scaffolding is committed on the branch at gate time (removed below, on
    // the way to a merge) and untracked RESULT.md never enters a git diff —
    // neither is any item's measured work. Same filter `executeJob` uses.
    const workDiffPaths = mergeDiff
      .filter((e) => e?.status !== 'D')
      .map((e) => String(e?.path ?? '').replace(/\\/g, '/'))
      .filter((p) => p && p !== '.job/brief.md' && !p.startsWith('.job/'));
    const declCheck = declarationMergeDecision(committedSource, contentPaths);
    const failMerge = (reason) => {
      ctx.log(`${reason} on ${branch} — refusing (no merge)`);
      outcome = 'failed';
      result.note = result.note ? `${result.note} — ${reason}` : reason;
    };
    const runGraphScope = (unionSubjects, carriedMap, scopeAdvisory) => {
      let resultText = '';
      try {
        const resultPath = join(worktree, RESULT_FILENAME);
        if (existsSync(resultPath)) resultText = readFileSync(resultPath, 'utf8');
      } catch {
        resultText = '';
      }
      // The seam fires before the subset check below, so the H2(a) arm
      // observes the spawn (with the merge base) even where the path check
      // then refuses on the same undeclared path.
      let analysis;
      if (typeof opts.mergeGraphAnalysis === 'function') {
        analysis = opts.mergeGraphAnalysis({
          repoRoot: ctx.repoRoot, base: mergeBaseSha, branch, subjects: [...unionSubjects],
        });
      }
      return checkMergeGraphScope({
        source: committedSource,
        declared: unionSubjects,
        contentPaths,
        diffPaths: workDiffPaths,
        reviewedPaths: null,
        resultText,
        analysis,
        sidecar: readSidecar(ctx.repoRoot, branch),
        carried: carriedMap,
        advisoryScope: scopeAdvisory,
      });
    };
    // The executor's outcome line, read from the worktree's RESULT.md —
    // untracked, so never in the branch diff above. A `reviewed:` outcome
    // takes the read-and-unchanged branch below; anything else takes the
    // declaration path it always took.
    let reviewedResultText = '';
    try {
      const resultPath = join(worktree, RESULT_FILENAME);
      if (existsSync(resultPath)) reviewedResultText = readFileSync(resultPath, 'utf8');
    } catch {
      reviewedResultText = '';
    }
    const reviewedPaths = reviewedPathsFromResultText(reviewedResultText);
    if (reviewedPaths) {
      // Read-and-unchanged merge (task 62): the set is the executor's paths
      // intersected with the committed declaration, every path already
      // `mismatched` at the merge base (the 61b join, the only source), no
      // diff on a declared subject, and graph emptiness corroborated — all
      // inside `checkReviewedMerge`, so this path and the tests share one
      // implementation. The seam fires before any refusal below, with the
      // merge base pinned, so the spawn is observed even where the checks
      // then refuse.
      const seamDecl = checkCommittedDeclaration(committedSource);
      const seamSubjects = seamDecl.ok && !seamDecl.oldContract && Array.isArray(seamDecl.declared)
        ? [...seamDecl.declared]
        : [...reviewedPaths];
      let reviewedAnalysis;
      if (typeof opts.mergeGraphAnalysis === 'function') {
        reviewedAnalysis = opts.mergeGraphAnalysis({
          repoRoot: ctx.repoRoot, base: mergeBaseSha, branch, subjects: seamSubjects,
        });
      }
      const checked = checkReviewedMerge({
        repoRoot: ctx.repoRoot,
        base: mergeBaseSha,
        source: committedSource,
        reviewedPaths,
        contentPaths,
        diffPaths: workDiffPaths,
        resultText: reviewedResultText,
        analysis: reviewedAnalysis,
        sidecar: readSidecar(ctx.repoRoot, branch),
      });
      for (const w of checked.warnings ?? []) ctx.log(w);
      if (!checked.ok) {
        failMerge(checked.reason);
        if (checked.retirement?.note) ctx.log(checked.retirement.note);
      } else {
        // A reviewed outcome BINDS pages: `mergeSubjects` is set EVEN
        // though the diff is empty (and the merge otherwise advisory) — a
        // null here falls back to the diff-derived set below, which is
        // empty by construction, and the record would bind nothing for
        // pages dispatched to ratify (mutation A's defect on this branch).
        ctx.log(`reviewed: outcome ratifies ${checked.subjects.length} page(s): ${checked.subjects.join(', ')}`);
        ctx.log(`merge subjects constituted from declaration ∩ reviewed (${checked.subjects.length}): ${checked.subjects.join(', ') || '(none)'}`);
        mergeSubjects = [...checked.subjects];
        mergeRetirement = checked.retirement;
        if (mergeRetirement?.note) {
          ctx.log(mergeRetirement.note);
          result.note = result.note ? `${result.note} — ${mergeRetirement.note}` : mergeRetirement.note;
        }
      }
    } else if (!declCheck.ok) {
      failMerge(declCheck.reason);
    } else if (declCheck.oldContract) {
      ctx.log(`old-contract branch (no committed items/declared_subjects) — completing under the single-item contract, no graph arm`);
    } else if (declCheck.bindsNothing && declCheck.declared.length === 0) {
      ctx.log(`binds nothing: merged diff carries no content paths on ${branch} — merging with no subject binding`);
    } else {
      // New-contract merge with a non-empty declaration — content-carrying or
      // code-only. The graph analysis runs on both (the H2(a) arm pins the
      // spawn even where the path check then refuses). F2: on a merge that
      // binds nothing ONLY the scope-violation arm is advisory (the code-only
      // exemption lives in (a)'s quantifier); `graph-incomplete` stays a
      // refusal. Per-item retirement still counts the code diff — a machinery
      // item's subject is a code file, and binding nothing is about the
      // record, not about whether the work was done.
      const advisory = declCheck.bindsNothing;
      // Task 56 constitution: the set comes from the committed declaration.
      // (On the read-and-unchanged outcome the executor's declared paths are
      // intersected in the `reviewedPaths` branch above, through
      // `checkReviewedMerge` — never here, and never from the diff.)
      const constituted = constituteMergeSubjects(committedSource);
      if (!constituted.ok) {
        failMerge(constituted.reason);
      } else {
        // F1 (amendment): each declared carried file contributes its page.
        // History-pinned at the merge base — the tree the diff is measured
        // against — never worktree state, since the fixing diff deletes the
        // finding it resolves. Missing/unreadable fields contribute nothing
        // (fail closed toward refusal) and are logged, never silent.
        const readAtBase = (p) => {
          const r = gitTry(ctx.repoRoot, ['show', `${mergeBaseSha}:${p}`]);
          return r.ok ? r.stdout : null;
        };
        const carried = resolveCarriedDeclaration(constituted.subjects, { readFile: readAtBase });
        for (const m of carried.missing) {
          ctx.log(`carried declaration ${m.path} contributes nothing to the union (${m.why})`);
        }
        for (const [cpath, pages] of Object.entries(carried.resolved)) {
          ctx.log(`carried resolution: ${cpath} contributes ${pages.join(', ')} to the declared union`);
        }
        const union = carried.subjects;
        if (advisory) {
          // F4: the no-joinable-path state names the declaration (the full
          // union, carried-resolved pages included).
          ctx.log(`binds nothing: merged diff carries no content paths on ${branch} — merging with no subject binding; declaration: ${union.join(', ') || '(none)'}`);
        } else {
          ctx.log(`merge declaration: ${union.length} subject(s): ${union.join(', ')}`);
          ctx.log(`merge subjects constituted from declaration (${union.length}): ${union.join(', ') || '(none)'}`);
        }
        const g = runGraphScope(union, carried.resolved, advisory);
        for (const w of g.warnings) ctx.log(w);
        const subset = checkDeclarationSubset(contentPaths, union);
        if (!subset.ok) {
          // The path check is primary; a graph scope refusal naming the same
          // path is logged as corroboration (H2(a): the mapping names the
          // path the subset check refused).
          if (!g.ok) ctx.log(`graph corroboration agrees: ${g.reason}`);
          failMerge(`scope-violation: merged diff touches undeclared content path(s) ${subset.undeclared.join(', ')} — every diff content path must lie inside the committed declaration`);
          if (g.retirement?.note) ctx.log(g.retirement.note);
        } else if (!g.ok) {
          failMerge(g.reason);
          if (g.retirement?.note) ctx.log(g.retirement.note);
        } else {
          if (!advisory) mergeSubjects = [...union];
          mergeRetirement = g.retirement;
          if (mergeRetirement?.note) {
            ctx.log(mergeRetirement.note);
            result.note = result.note ? `${result.note} — ${mergeRetirement.note}` : mergeRetirement.note;
          }
        }
      }
    }
  }

  if (outcome === 'approve') {
    // Housekeeping so job scaffolding never reaches main; the branch keeps it.
    //
    // RESULT.md is scaffolding too, and it was missing from this list until
    // j-20260830-01 became the first job to MERGE successfully and carried it
    // into the repository root, tracked and pushed. Every earlier run either
    // failed or was discarded, so the leak had never had a chance to land —
    // the bug was as old as the loop and invisible until the first success.
    // Named from the constant rather than the string so the two cannot drift.
    gitTry(worktree, ['rm', '-r', '-q', '--ignore-unmatch', '.job', RESULT_FILENAME]);
    gitTry(worktree, ['commit', '--no-verify', '-m', `job ${jobId}: remove job scaffolding before merge`]);

    // The proposal caps, the stamp, and the same-type discard (specs/loop).
    //
    // Applied ON THE BRANCH, before the merge, so that what reaches
    // `data/proposals/` is already capped and stamped and the drop records
    // ride in with the work that produced them. Doing it after the merge would
    // mean the uncapped set existed on `main`, however briefly, and "however
    // briefly" is how a mechanism becomes a race.
    //
    // The changed list is re-read from the branch here rather than reused from
    // `result.changed`: that list was computed after the AUTHOR run, and a
    // revision pass can add a proposal file afterwards. A cap that a revision
    // could walk around is not a cap.
    const proposals = applyProposalMergeRules(ctx, {
      worktree,
      jobId,
      jobType: job.type,
      changed: changedPathsWithStatus(ctx.repoRoot, mergeBaseSha, branch),
    });
    for (const n of proposals.notes) ctx.log(n);
    if (proposals.dropped.length || proposals.rejected.length) {
      gitTry(worktree, ['add', '-A', '--', 'data/proposals']);
      const c = gitTry(worktree, [
        'commit', '--no-verify', '-m',
        `job ${jobId}: proposal caps, stamps and discards`,
      ]);
      if (c.ok) ctx.log(`committed the proposal mechanics to ${branch} before merging`);
    } else if (proposals.kept.length) {
      // Nothing moved, but every kept file was stamped with the proposing job.
      gitTry(worktree, ['add', '-A', '--', 'data/proposals']);
      const c = gitTry(worktree, [
        'commit', '--no-verify', '-m',
        `job ${jobId}: stamp the proposing job onto ${proposals.kept.length} proposal(s)`,
      ]);
      if (c.ok) ctx.log(`stamped proposed_by_type: ${job.type} onto ${proposals.kept.join(', ')}`);
    }

    // The branch contributes NO derived state (beads addictedtoai-dgj).
    //
    // `data/derived/` is an output, not content, and a three-way merge of two
    // derivations is not the derivation of the merge:
    //     branch  = derive(OLD snapshot + this job's work)
    //     base    = derive(NEW snapshot + without this job's work)
    //     correct = derive(NEW snapshot + this job's work)   <- neither has it
    // A conflict there discards an approved job — j-20260829-03 lost 18.77
    // model-minutes that way, after passing its gates and being approved. A
    // CLEAN auto-merge would have been worse: a tree matching no real state.
    //
    // So the branch is reset to the base's derived tree before merging. The
    // job's authored files merge normally; the derived tree is recomputed from
    // the merged result immediately below.
    const droppedDerived = gitTry(worktree, ['checkout', base, '--', ...DERIVED_PATHS]);
    if (droppedDerived.ok) {
      const c = gitTry(worktree, [
        'commit', '--no-verify', '-m',
        `job ${jobId}: drop derived state before merge — recomputed from the merged tree`,
      ]);
      if (c.ok) ctx.log('dropped the branch\'s data/derived/ before merging — it is an output, not content (addictedtoai-dgj)');
    }

    // A drop record the branch adds must say what specs/loop requires of it
    // (beads addictedtoai-fyd3): which test the story failed, and what would
    // make it worth refiling. `applyProposalMergeRules` measures that BEFORE it
    // writes anything, so a refusal here leaves the branch exactly as the job
    // left it — nothing capped, nothing stamped, nothing moved. Reported
    // through the merge's own failure path, which already logs the reason and
    // records the outcome; a separate refusal path would be a second way to say
    // "this did not merge".
    // Stage-1 U1 tripwire (task 33, bead avs5): green apart says nothing
    // about green together. Before the real merge, provisionally merge the
    // base tip into the job worktree — uncommitted, under no merge lock —
    // and run the two tripwire gates over that merged tip. Red together is
    // an ordinary gate failure: nothing landed anywhere (ruling a). Gates
    // that could not RUN leave togetherness unverified, and an unverified
    // merge must not land: that books `interrupted`, resumable like any
    // environmental refusal. `--no-gates` skips the tripwire outright (the
    // operator override keeps its pre-train meaning).
    let tripwireBaseTip = null;
    let tripwireBlocked = null;
    // Stage-1 U2 (tasks 35+36): merges land on the `train` integration
    // branch; `main` stays frozen between trains. Ensure it from `base`
    // and move the checkout onto it, so the merge, the per-job records
    // and (later) the train's own commits all land on `train` with the
    // merges they describe. A checkout failure is environmental: the
    // merge must not land.
    let admissionBlocked = null;
    const trainPrep = ensureTrainBranch(ctx.repoRoot, base);
    if (!trainPrep.ok) {
      ctx.log(`train branch unavailable (${trainPrep.reason}) — booking interrupted, nothing merges`);
      admissionBlocked = 'interrupted';
    } else {
      const co = checkoutTrain(ctx.repoRoot);
      if (!co.ok) {
        ctx.log(`train checkout failed (${co.reason}) — booking interrupted, nothing merges`);
        admissionBlocked = 'interrupted';
      }
    }
    // Admission disjointness (row 35): the incoming job's subjects (the
    // branch diff vs `base`, the run's existing measurement) against the
    // admitted set's, measured live from git — no pending-state file
    // exists to go stale. Overlap waits: resumable, never a failure.
    if (admissionBlocked == null) {
      const incoming = joinableSubjects(changedPathsWithStatus(ctx.repoRoot, mergeBaseSha, branch));
      const disj = admissionOverlap(ctx.repoRoot, incoming);
      if (disj.overlap) {
        ctx.log(`subjects overlap a merge on the train (${disj.with.join(', ')}) — waiting, nothing merges`);
        admissionBlocked = 'interrupted';
      }
    }
    if (!opts.noGates && admissionBlocked == null) {
      let trip = runTripwire(ctx, { worktree, baseRef: TRAIN_BRANCH, gates: opts.gates });
      tripwireBaseTip = trip.baseTip ?? null;
      if (!trip.ok && !trip.environmental) {
        // Stage-1 U6 (task 51, row 51): a job's tripwire retries its two
        // gates — the pair, once. An environmental tripwire (togetherness
        // unverified) still books `interrupted` immediately below: no second
        // wait on the same holder. The record names which kind it was, on
        // the ledger note (an existing key — no new one) and in the log.
        ctx.log(`tripwire red together (${trip.reason}) — retrying the two tripwire gates once as a pair (kind job-tripwire-pair)`);
        const again = runTripwire(ctx, { worktree, baseRef: TRAIN_BRANCH, gates: opts.gates });
        tripwireBaseTip = again.baseTip ?? tripwireBaseTip;
        const retryNote =
          `tripwire gates retried once as a pair (kind job-tripwire-pair) and ${again.ok ? 'passed' : 'failed again'}`;
        ctx.log(`tripwire retry: ${again.ok ? 'PASS — togetherness verified on the second run' : `FAIL (${again.reason})`}`);
        result.note = result.note ? `${result.note} — ${retryNote}` : retryNote;
        trip = again;
      }
      if (!trip.ok) {
        if (trip.environmental) {
          ctx.log(`tripwire: branch+train togetherness unverified (${trip.reason}) — booking interrupted, nothing merges`);
          tripwireBlocked = 'interrupted';
        } else {
          ctx.log(`tripwire: branch+train red together (${trip.reason}) — ordinary gate failure, nothing merges`);
          tripwireBlocked = 'failed';
        }
      } else {
        ctx.log(`tripwire: branch+train green together at ${String(trip.baseTip).slice(0, 8)}`);
      }
    }
    const merged = proposals.refused.length
      ? {
          ok: false,
          reason:
            `${proposals.refused.length} drop record${proposals.refused.length === 1 ? '' : 's'} ` +
            `the branch adds ${proposals.refused.length === 1 ? 'does' : 'do'} not carry what a ` +
            `declined story must record (specs/loop): ${proposals.refused.join(' | ')}`,
        }
      : (tripwireBlocked || admissionBlocked)
        ? { ok: false, quiet: true, blocked: tripwireBlocked || admissionBlocked }
        : await mergeJobBranch(ctx, {
            repo: ctx.repoRoot,
            branch,
            baseRef: TRAIN_BRANCH,
            message: `job ${jobId} (${job.type}): ${String(job.title).slice(0, 60)}`,
            tripwireBaseTip,
            gates: opts.gates,
            noGates: opts.noGates,
            lockWaitMs: (cfg.train?.lock_wait_seconds ?? 1200) * 1000,
          });
    if (!merged.ok) {
      if (!merged.quiet) ctx.log(`merge failed: ${merged.reason}`);
      // A tripwire booking survives: `interrupted` is resumable, `failed`
      // is counted. A merge the machine refused (merge-lock expiry) is
      // environmental like any gate refusal — `interrupted`, never a breaker
      // input — unless the run already failed, which stands. Anything else
      // that refused the merge is an ordinary failure.
      if (merged.blocked) outcome = merged.blocked;
      else if (merged.environmental && outcome !== 'failed') outcome = 'interrupted';
      else if (outcome !== 'interrupted') outcome = 'failed';
    } else {
      mergedSha = merged.sha;
      outcome = 'done';
      ctx.log(`merged ${branch} into ${TRAIN_BRANCH} locally as ${mergedSha.slice(0, 8)} — nothing is pushed`);

      // Recompute the derived tree from the MERGED state (addictedtoai-942).
      // Without this the queue keeps advertising the work this job just
      // finished, and the next run is dispatched at it — spending an author
      // AND a review invocation to discover there is nothing to do. Observed
      // on j-20260830-01 and -02, both of which had correctly retired their
      // own queue items; only the file was stale.
      //
      // This is the other half of the same idea as dropping derived above: the
      // merge carries authored files, and the derivation happens once, here,
      // over the result. Any change it makes is committed with the job's
      // records below, so the tree is never left half-derived.
      //
      // The ledger line goes in FIRST. Part of the queue is derived from the
      // ledger — `scoutRanToday` is read straight out of it — so a rederive
      // that ran before the append would recompute the queue from a record of
      // the world that omits the job that just finished, and re-advertise its
      // work. See `recordOutcome` above for the measurement. The rederive is
      // the train's single one (row 50); the ordering is what this preserves.
      recordOutcome();

      // The record says what it reviewed, now that "what it reviewed" is a
      // settled fact: these files are on `${base}`. Without this the record
      // names only the job id, which `lib/reviews.mjs` cannot join to any
      // piece, so every loop-written entry reads unreviewed from the build
      // (beads addictedtoai-sge). Written before the records are staged below,
      // so the declaration is committed with the verdict it belongs to.
      //
      // Measured from the branch at merge time, not from `result.changed`:
      // that list was computed after the AUTHOR run and a revision pass can add
      // a file to the branch afterwards. This is the diff that just merged.
      //
      // Task 56 (root fix): the record binds the CONSTITUTED declaration, not
      // the measured diff — `mergeSubjects` from the gate above. Old-contract
      // branches (null) keep the diff-derived set, exactly as before. On a
      // `reviewed:` outcome that set IS the executor's paths intersected with
      // the declaration (set in the reviewed branch above, never null there),
      // so the record binds the reviewed bytes — and the hashes below are
      // read from the merged tree, never from the graph output (task 62).
      // A merge that bound nothing records nothing: the join reads the record as the
      // piece(s) reviewed, and there is no piece.
      const subjects = mergeSubjects ?? joinableSubjects(changedPathsWithStatus(ctx.repoRoot, mergeBaseSha, branch));
      // Task 63: on a multi-page `reviewed:` outcome each page has its own
      // review record (one invocation per page, never a bundle) — bind each
      // record to its one page, still through the one `writeRecordSubjects`
      // (hashes from the merged tree, never graph output). Detected by the
      // per-page records the review loop wrote (not by any in-memory reviewed
      // list, which lives in a narrower block): where the first per-page
      // record exists and several subjects bound, this is that path.
      // Single-page and non-reviewed paths keep the one-record write exactly
      // as before.
      let isMultiPageReviewedMerge = false;
      try {
        isMultiPageReviewedMerge =
          Array.isArray(subjects) && subjects.length > 1 &&
          existsSync(reviewedPerPageRecordPath(ctx, jobId, 0, result.pass ?? 1));
      } catch {
        isMultiPageReviewedMerge = false;
      }
      if (isMultiPageReviewedMerge) {
        let boundCount = 0;
        let hashCount = 0;
        for (let mi = 0; mi < subjects.length; mi++) {
          const page = subjects[mi];
          const perPath = reviewedPerPageRecordPath(ctx, jobId, mi, result.pass ?? 1);
          const w = writeRecordSubjects(perPath, [page], { repoRoot: ctx.repoRoot });
          if (w.ok) {
            boundCount++;
            if (w.reviewed) hashCount += Object.keys(w.reviewed).length;
            ctx.log(`recorded subject: ${page} on per-page verdict record ${perPath} — the join reads it as the piece reviewed`);
          } else {
            ctx.log(`could not record the reviewed file ${page} on per-page verdict record ${perPath}: ${w.why}`);
          }
        }
        if (boundCount) {
          ctx.log(`recorded reviewed: ${hashCount} reviewed-surface hash(es) across ${boundCount} per-page record(s) — an edit to any of these files now reads as mismatched, not as approved`);
        }
      } else {
      const wrote = writeRecordSubjects(verdictPath(ctx, jobId, result.pass ?? 1), subjects, {
        repoRoot: ctx.repoRoot,
      });
      if (wrote.ok) {
        ctx.log(`recorded subject: ${subjects.join(', ')} on the verdict record — the join reads it as the piece(s) reviewed`);
        // WHAT it reviewed, not only which files (beads addictedtoai-zlq). The
        // hashes are read from the merged tree, in the same call, so the two
        // keys can never describe different diffs.
        if (wrote.reviewed) {
          ctx.log(`recorded reviewed: ${Object.keys(wrote.reviewed).length} reviewed-surface hash(es) — an edit to any of these files now reads as mismatched, not as approved`);
        } else {
          ctx.log(`NO reviewed: hash was recorded (${wrote.hashWhy}) — the record binds by name only, as records did before this mechanism`);
        }
      } else if (subjects.length) {
        ctx.log(`could not record the reviewed files on the verdict record: ${wrote.why}`);
      }
      }

      // RETIRE THE PROPOSAL THIS JOB CONSUMED (observed 2026-08-30).
      //
      // A proposal selected, written, reviewed and merged into a published post
      // stayed in `data/proposals/` and stayed selectable. The next `--dry-run`
      // after the first post selected THE SAME PROPOSAL again; its `expires:`
      // was a week out, so the loop would have rewritten that post on every run
      // until then. Three were retired by hand in commit `5e226a6`; this is the
      // mechanism that makes it stop being by hand.
      //
      // Only on a merged, DONE outcome, and `outcome` is already `'done'` here.
      // A discarded job's proposal deliberately stays selectable: what was
      // rejected was the work, not the idea. It does not stay AHEAD of the
      // queue, though — `recordDiscardedAttempt` below stamps the attempt onto
      // it and that clears its `preempts` (addictedtoai-z5dj).
      //
      // Placed before the build gate and the publish so that a publishing run
      // pushes the retirement with the piece it produced; the move is also
      // staged by exact path with the job's records at the foot of this
      // function, which is what commits it on a run that does not publish.
      if (proposalOrigin) {
        const consumed = consumeProposal(ctx, {
          path: proposalOrigin.path,
          slug: proposalOrigin.slug,
          jobId,
          jobType: job.type,
          artifacts: subjects,
          mergedSha,
          issues: jobIssues,
        });
        ctx.log(
          consumed.moved
            ? `retired the consumed proposal to ${consumed.dest}: ${consumed.why}`
            : `the consumed proposal was not retired: ${consumed.why}`,
        );
        if (consumed.moved) {
          // BOTH halves of the move, like the expiry sweep: staging only the
          // destination leaves the deletion uncommitted and the proposal
          // appears to exist in two places in the history.
          consumedPaths.push(
            relative(ctx.repoRoot, proposalOrigin.path).replace(/\\/g, '/'),
            relative(ctx.repoRoot, consumed.dest).replace(/\\/g, '/'),
          );
        }
      }

      // Stage-1 task 32 (U1, bead avs5) DELETED the post-merge build block
      // that stood here: the `postMergeGateOptions`/`runGates` call over the
      // merged tip plus its three-state handling. Verification-before-publish
      // now comes from the tripwire (same tip) or the merge-time rebuild
      // (moved tip) above — `merged.verified` carries it to the publish flag
      // below. What this means for breaker 2 is stated beside that flag: its
      // post-merge-build feed is gone until task 49 (U6) retargets it, by the
      // rows' sequence, not by omission here.

      // (Three-state handling for the deleted post-merge build — the
      // build-did-not-run honesty above — moved with the tripwire: an
      // unverified merge leaves `merged.verified` false and the publish flag
      // down. See the deletion note and the flag below.)
      const buildDidNotRun = !merged.verified;

      if (buildDidNotRun) {
        ctx.log(
          `the merged content is UNVERIFIED${merged.note ? ` — ${merged.note}` : ''} — NOT PUBLISHED: ` +
            `the merge stays local until a later run verifies it.`,
        );
      } else {
        ctx.log(`the merged content is verified (tripwire same-tip green, rebuild green, or no-gates override) — publishable`);
      }
      // WHAT `verified` CARRIES (Stage-1 U1, bead avs5): the tripwire proved
      // THIS tip green-together, or the merge-time rebuild proved the moved
      // tip, or `--no-gates` overrode verification as before. Unverified
      // merges publish nothing — the old third-state honesty, now fed by the
      // tripwire instead of the deleted post-merge build.
      //
      // BREAKER-2 GAP, STATED NOT TO HIDE IT: the deleted block fed breaker 2
      // (red post-merge build → HOLD.md). Nothing in U1 replaces that feed —
      // a red build on main is now observed by no Desk mechanism until task
      // 49 (U6) retargets the breaker, which is the rows' sequence. A red
      // merged tip cannot reach main through THIS path (the tripwire refuses
      // it, the rebuild reverts it); what U1 stops seeing is redness that
      // arrives any other way.
      // Row 36 / S2: the per-job publish is gone — the merge lands on train
      // with main frozen; the TRAIN's scoped push (U5 publishTrain inside
      // finishTrainRun) owns the push. `merged.verified` still drives the honesty logs above.
      publishAfterRecords = false;
      if (job.source === 'directive' && job.lineNumber) {
        // LOCAL, not UTC (beads addictedtoai-nmr). The completion marker goes
        // into `DIRECTIVES.md`, a file in the corpus that a human reads, and an
        // unattended evening run stamped tomorrow onto it until 2026-08-31.
        const m = markDirectiveDone(ctx, job.lineNumber, jobId, localDate(now));
        if (m.changed) ctx.log(`appended the completion marker to DIRECTIVES.md line ${job.lineNumber}`);
      }
      // NOT DELETED HERE. This job's own worktree still has `branch` checked
      // out until `removeWorktree` below, and git refuses to delete a branch
      // checked out in a linked worktree. The deletion is deferred to after
      // that removal; see the call site below for the measurement.
      mergedBranch = branch;
    }
  } else if (outcome === 'discarded') {
    ctx.log(`discarding ${branch}; the record of the reasons is kept at ${verdictPath(ctx, jobId, result.pass ?? 1)}`);
    // The branch is not merged and is not deleted here, so the proposal files
    // it added exist only on it. Nothing moves them into `data/proposals/`:
    // ideas do not outlive the rejection of the work that produced them
    // (specs/loop). That is an absence of code, which is why it is written
    // down — and it is measured by a test that plants a proposal on a branch
    // the reviewer rejects and then reads the working tree.
    //
    // The proposal this job was SELECTED from is a different file, living in
    // the main working tree, and it survives: see `recordDiscardedAttempt`
    // below, which stamps this attempt onto it.
  }

  // A proposal the REVIEWER noted, transcribed from the verdict record.
  //
  // Attempted on any outcome the merge gate parsed a verdict for — approved or
  // not. A reviewer that rejects a piece and says "the real work here is an
  // `interpret` job on X" has produced the most valuable noticing of the run,
  // and losing it because the work it reviewed was rejected would throw away
  // the judgment along with the diff. Its edits to the reviewed tree are
  // discarded; this record is its only channel.
  const transcribedPaths = [];
  if (result.verdict) {
    const t = transcribeNotedProposal(ctx, {
      jobId,
      jobType: job.type,
      verdictPath: verdictPath(ctx, jobId, result.pass ?? 1),
      reviewer: reviewer.id,
    });
    if (t.transcribed) {
      transcribedPaths.push(relative(ctx.repoRoot, t.dest));
      ctx.log(
        t.selfAmplifying
          ? `the reviewer noted a \`${t.noted.type}\` proposal while reviewing a \`${job.type}\` job — ` +
            `written straight to the rejection index at ${t.dest}: ${t.reason}`
          : `transcribed the reviewer's noted proposal to ${t.dest}, naming job ${jobId} as its origin`,
      );
    } else if (t.malformed || (t.why && !/notes no proposal|no verdict record/.test(t.why))) {
      ctx.log(`the verdict record's noted proposal was not transcribed: ${t.why}`);
    }
  }

  // Findings the reviewer CARRIED — recorded but did not block on (beads
  // addictedtoai-2bo). Same channel and same "any outcome the merge gate
  // parsed a verdict for" scope as the noted proposal above, and for the same
  // reason: the reviewer's edits to the reviewed tree are discarded, so
  // `carry:` in its own record is the only way one of these reaches work.
  const orphanedFindings = [];
  if (result.verdict) {
    const c = transcribeCarriedFindings(ctx, {
      jobId,
      verdictPath: verdictPath(ctx, jobId, result.pass ?? 1),
      reviewer: reviewer.id,
      // Only on a discard, and only then because only then can the subject be
      // absent: the branch that would have created it was thrown away
      // (addictedtoai-z5dj). These entries go to the proposal below instead of
      // becoming a queue item pointed at a file that never existed.
      subjectMustExist: outcome === 'discarded',
    });
    orphanedFindings.push(...c.orphaned);
    for (const t of c.transcribed) {
      transcribedPaths.push(relative(ctx.repoRoot, t.dest));
      ctx.log(`carried finding transcribed to ${t.dest}: ${JSON.stringify(t.title)}`);
    }
    for (const s of c.skipped) {
      ctx.log(`a carried finding was not transcribed: ${s.why}`);
    }
    for (const w of c.warnings) {
      ctx.log(`the verdict record's carry: block ${w}`);
    }
  }

  // Task 63: on a multi-page `reviewed:` outcome each page has its own record
  // — transcribe noted proposals and carried findings from every per-page
  // record, not just the job's own (which does not exist on this path, so the
  // single-record attempts above quietly note "no verdict record"). Detected
  // from `result.verdict` plus every existing per-page record for this pass
  // (both approve and discarded carry `result.verdict`) — never from
  // `mergeSubjects`, which is only ever set on approve and is null on
  // discard, where the old key silently lost every page's carried findings
  // and noted proposals.
  {
    let perPaths = [];
    try {
      if (result.verdict) {
        perPaths = perPageRecordPathsForPass(ctx, jobId, result.pass ?? 1);
      }
    } catch {
      perPaths = [];
    }
    if (perPaths.length) {
      for (let pi = 0; pi < perPaths.length; pi++) {
        const perPath = perPaths[pi];
        // Noted proposals, one record at a time (at most one per record by
        // the brief's contract, so N pages yield at most N proposals).
        try {
          const t = transcribeNotedProposal(ctx, { jobId, jobType: job.type, verdictPath: perPath, reviewer: reviewer.id });
          if (t.transcribed) {
            transcribedPaths.push(relative(ctx.repoRoot, t.dest));
            ctx.log(`transcribed the page ${pi} reviewer's noted proposal to ${t.dest}, naming job ${jobId} as its origin`);
          } else if (t.malformed || (t.why && !/notes no proposal|no verdict record/.test(t.why))) {
            ctx.log(`per-page verdict record ${perPath}'s noted proposal was not transcribed: ${t.why}`);
          }
        } catch (e) {
          ctx.log(`per-page verdict record ${perPath}'s noted proposal was not transcribed: ${String(e?.message ?? e).slice(0, 160)}`);
        }
        try {
          // G2: one transcription call per per-page record — tag each call's
          // dests with the record's page index so page N's first finding
          // cannot collide with page M's (`${jobId}-carry-${tag}-${i+1}.md`).
          // Parsed from the record path itself, never the loop counter: a gap
          // in the probed indices (G1) would misalign a counter with the page.
          const perTag = String(perPath).match(/\.reviewed-(\d+)/)?.[1] ?? String(pi);
          const c2 = transcribeCarriedFindings(ctx, {
            jobId,
            verdictPath: perPath,
            reviewer: reviewer.id,
            subjectMustExist: outcome === 'discarded',
            destTag: perTag,
          });
          orphanedFindings.push(...c2.orphaned);
          for (const t of c2.transcribed) {
            transcribedPaths.push(relative(ctx.repoRoot, t.dest));
            ctx.log(`carried finding transcribed to ${t.dest} from page ${pi}: ${JSON.stringify(t.title)}`);
          }
          for (const s of c2.skipped) {
            ctx.log(`a carried finding was not transcribed from page ${pi}: ${s.why}`);
          }
          for (const w of c2.warnings) {
            ctx.log(`per-page verdict record ${perPath}'s carry: block ${w}`);
          }
        } catch (e) {
          ctx.log(`per-page verdict record ${perPath}'s carry: block could not be read: ${String(e?.message ?? e).slice(0, 160)}`);
        }
      }
    }
  }

  // The discarded attempt, recorded in the proposal it came from
  // (addictedtoai-z5dj). Two effects, one append: the candidate stops
  // outranking the derived queue, and the next attempt's brief carries the
  // reasons the last one was refused — a proposal's body IS the brief's
  // `detail`. Both are needed: without the first the same proposal returns to
  // the front every run at ~35 model-minutes an attempt; without the second the
  // retry repeats the mistake that got it refused.
  if (outcome === 'discarded' && proposalOrigin) {
    const rec = recordDiscardedAttempt(ctx, {
      path: proposalOrigin.path,
      slug: proposalOrigin.slug,
      jobId,
      jobType: job.type,
      reasons: result.verdict?.reasons ?? [],
      notes: result.verdict?.notes ?? '',
      findings: orphanedFindings,
    });
    ctx.log(
      rec.recorded
        ? `recorded discarded attempt ${rec.attempts} on the proposal${
            orphanedFindings.length
              ? `, carrying ${orphanedFindings.length} finding(s) that named a file the branch never merged`
              : ''
          }: ${rec.why}`
        : `the discarded attempt was not recorded on the proposal: ${rec.why}`,
    );
    if (rec.recorded) {
      transcribedPaths.push(relative(ctx.repoRoot, proposalOrigin.path));
    }
  } else if (outcome === 'discarded' && orphanedFindings.length) {
    // No proposal to hold them, and no file to repair: the job came from a
    // directive or the queue and the piece its findings name was never merged.
    // They stay in the committed verdict record, which is where a reader
    // looking at why this job was discarded will be. Said out loud rather than
    // dropped silently — a finding that goes nowhere should say so.
    for (const f of orphanedFindings) {
      ctx.log(
        `a carried finding was not transcribed: it names \`${f.subject}\`, which the discarded ` +
          `branch never merged, and this job came from no proposal that could hold it — ` +
          `it stays in the verdict record: ${JSON.stringify(f.title)}`,
      );
    }
  }

  // `removeWorktree` asks git to remove the worktree without forcing it and
  // returns the refusal reason when git cannot complete. `removeJobWorktree`
  // leaves that directory standing on refusal; its recursive `rmSync` step is
  // permitted only after an `{ok: true}` result. The final prune still runs in
  // every case, and each cleanup failure is logged without escaping before the
  // ledger line or the records commit (addictedtoai-osru).
  // `RESULT.md` is the executor protocol file, not job work. Remove it before
  // asking git to remove the otherwise-clean worktree; this keeps throwaway
  // fixtures whose ignore rules do not name the protocol file equivalent to
  // the real repository without weakening git's refusal for actual work.
  const resultPath = join(worktree, RESULT_FILENAME);
  if (existsSync(resultPath)) {
    try {
      unlinkSync(resultPath);
    } catch (e) {
      ctx.log(`WORKTREE CLEANUP FAILED: could not clear ${resultPath}: ${(e && e.message) || String(e)}`);
    }
  }
  removeJobWorktree(ctx, worktree, ctx.worktreeCleanup ?? {});

  // -------------------------------------------------------------------------
  // DELETE THE MERGED BRANCH — here, after the worktree, and read the answer.
  //
  // This used to run at the merge, while this job's own worktree still had the
  // branch checked out. Measured in a throwaway repository reproducing exactly
  // that state: `git branch -D` answers
  //     error: Cannot delete branch 'job/probe' checked out at '<worktree>'
  // with the worktree present, and succeeds the moment it is removed. So the
  // deletion had never once worked: measured on this repository 2026-09-04,
  // `main` carries 112 `job <id> (<type>):` merge commits and 113 already-merged
  // `job/*` branches are still present locally. Not one was ever deleted.
  //
  // It was invisible because `deleteBranch` returns a boolean out of `gitTry`
  // and the call site discarded it. `gitTry` exists so a git failure is a value
  // to inspect rather than an exception; inspecting it is the other half of the
  // fix. A refusal is reported, not raised: a branch left behind costs nothing
  // this run needs, and the merge already happened.
  // -------------------------------------------------------------------------
  if (mergedBranch) {
    if (deleteBranch(ctx.repoRoot, mergedBranch)) {
      ctx.log(`deleted the merged branch ${mergedBranch}`);
    } else {
      ctx.log(
        `could not delete the merged branch ${mergedBranch} — git refused it. The merge stands; ` +
          `the branch is left behind and can be removed by hand.`,
      );
    }
  }

  // -------------------------------------------------------------------------
  // GUARD: do not commit `data/derived/` disconnected from what it was
  // computed from (addictedtoai-djd).
  //
  // `rederiveStep` above (when it ran) recomputed `data/derived/` from
  // whatever `data/changes.jsonl`, `data/sources/*` and `content/` hold ON
  // DISK right now — including any of it that is dirty in this main working
  // tree because a concurrent Pulse run or another agent is mid-edit. That is
  // the right thing for the WORKING TREE: the recomputed files are the true
  // reflection of the current state, useful to this process's own view of the
  // world. It is the wrong thing to COMMIT: committing `data/derived/` by
  // exact path while its own inputs stay uncommitted pairs it, in git
  // history, with a `data/changes.jsonl`/`data/sources/`/`content/` the
  // COMMITTED state does not carry — and the next job's branch is cut from
  // exactly that commit, inheriting a queue item naming a record the branch
  // cannot see. Measured 2026-08-31 on commit `8f83b04`: a recomputed
  // `queue.json` named an `interpret` item over a change record that lived
  // only in a still-dirty `data/changes.jsonl`, and the branch cut from that
  // commit blocked, unable to find it.
  //
  // The alternative — bring the inputs along, committing them together with
  // `data/derived/` — was rejected. Those files are not this run's to commit:
  // `data/changes.jsonl` and `data/sources/*` are the Pulse's state, and a
  // dirty `content/` file may be another agent's unfinished edit. Sweeping
  // them into a commit here is the exact attribution failure addictedtoai-ps3
  // fixed for the Pulse's own publish step — a mechanism must not commit what
  // it cannot honestly say it wrote. So there is no third option: either the
  // derived tree travels with inputs this run does not own, or it is left
  // uncommitted until whoever owns them commits them. This takes the second.
  //
  // Guarded HERE, at the commit, rather than at the branch cut where the
  // damage lands: refusing here stops the bad pairing from ever reaching
  // history, so every later reader (every future branch cut from this commit,
  // `git show`, the Pulse's own next run) sees a `data/derived/` git can
  // actually explain — one refusal instead of one detection per branch cut
  // from it. `HOLD.md` is not written: this is a normal operating condition
  // in a working tree several agents share, not a breaker-level halt, and the
  // rest of this run's records (the ledger line, the verdict, the directive
  // marker) do not depend on the invariant this guards and still commit.
  // -------------------------------------------------------------------------
  const dirtyInputs = rederived ? dirtyDerivedInputs(ctx.repoRoot) : [];
  if (rederived && dirtyInputs === null) {
    ctx.log(
      'rederive: could not read the state of data/derived/\'s own inputs (git status failed) — ' +
        'not committing the recomputed tree; it stays in the working tree, uncommitted, matching ' +
        'whatever it was computed from (addictedtoai-djd)',
    );
  } else if (rederived && dirtyInputs.length) {
    ctx.log(
      `rederive: data/derived/ was recomputed, but its own inputs are uncommitted in the working ` +
        `tree (${dirtyInputs.join(', ')}) — committing it now would pair it, in history, with a ` +
        `data/changes.jsonl / data/sources/ / content/ the commit itself does not carry, and the ` +
        `next job branched from this commit would inherit a queue item naming a record it cannot ` +
        `see (addictedtoai-djd). Leaving data/derived/ uncommitted; whoever commits those inputs ` +
        `(the next Pulse run, or the agent mid-edit) carries it forward correctly.`,
    );
  }
  /** Only when `rederiveStep` ran AND its inputs are confirmed clean. */
  const derivedCommittable = rederived && Array.isArray(dirtyInputs) && dirtyInputs.length === 0;

  // F1: this job's per-page verdict records (multi-page `reviewed:` path)
  // travel with the ledger line that approves them — listed from
  // `ctx.reviewsDir` where `isRecordOfJob` holds, exact paths only, never
  // `add -A`. Without these the multi-page merge commits the ledger with
  // NONE of the records that approved it (the two `verdictPath`s do not
  // exist on that path and the `existsSync` filter below drops them).
  let perPageRecordRelPaths = [];
  try {
    perPageRecordRelPaths = jobPerPageRecordRelPaths(ctx, jobId);
  } catch {
    perPageRecordRelPaths = [];
  }
  const recordPaths = [
    relative(ctx.repoRoot, ctx.ledgerPath),
    relative(ctx.repoRoot, verdictPath(ctx, jobId, 1)),
    relative(ctx.repoRoot, verdictPath(ctx, jobId, 2)),
    relative(ctx.repoRoot, ctx.directivesPath),
    // The recomputed derived tree, when there was one AND the guard above
    // confirmed its own inputs are clean. It is the derivation of the merged
    // state and must land in the same commit as the records, or the
    // repository is left holding a queue that describes the tree from before
    // this job (addictedtoai-942). Still staged by exact path — never `add -A`.
    ...(derivedCommittable ? DERIVED_PATHS : []),
    // A proposal or a carried finding transcribed from the verdict record is
    // written into the main working tree after the merge, so it is not
    // carried by any branch. Both are committed here with the record they
    // came from, or they would sit untracked and the next run would read
    // work nothing in the history explains.
    ...transcribedPaths,
    // F1: the per-page records themselves (see above).
    ...perPageRecordRelPaths,
  ].map((p) => p.replace(/\\/g, '/'));

  // A no-op on the merge path, which already recorded the outcome before its
  // rederive; the append for every other path.
  const line = recordOutcome();

  // Commit the loop's OWN records — the ledger line, the verdict record(s), the
  // directive marker — by exact path. The entire data/ tree is committed
  // (design D1) and these are state, not derived output; leaving them
  // uncommitted would lose the ledger the budget is computed from. Exact paths
  // only: never `add -A` in the main working tree, which the maintainer or
  // another process may be mid-edit in.
  // `existsSync` is the right filter for every record the loop WRITES, and the
  // wrong one for a file it MOVED: the source of an expiry sweep or a consumed
  // proposal is gone by construction, and dropping it here would stage the
  // addition without the deletion.
  const staged = recordPaths.filter((p) => existsSync(join(ctx.repoRoot, p))).concat(sweptPaths, consumedPaths);
  commitJobRecords(ctx, { staged, jobId, outcome });

  // -------------------------------------------------------------------------
  // PUBLISH — PINNED-DEAD per-job call site (Stage-1 U5): `publishAfterRecords`
  // is always false — the merge lands on train and the TRAIN's scoped push
  // (publishTrain) owns the push. Retained because `publish-after-records` +
  // `ledger-before-publish` pin this single `publishStep(` call site and its
  // order after the records; the history below explains the ordering it pins.
  //
  // It used to run at the merge, ~280 lines above: before the directive
  // completion marker, before the reviewer's noted proposal, before the carried
  // findings, and before `commitJobRecords`. Two defects came out of that one
  // position, and each one alone left the other intact:
  //
  //   1. A run PUSHED CONTENT TO THE LIVE SITE BEFORE THE RECORDS DESCRIBING
  //      THAT WORK EXISTED. The verdict record the review gate is audited by,
  //      the ledger line the budget is computed from, the completion marker a
  //      human reads in DIRECTIVES.md — all of it rode out on some LATER run's
  //      push, or on none.
  //   2. The step was the UNDECLARED CALLER (`loop/lib/publish.mjs` passed no
  //      `owned`), so it staged `data/`, `content/` and `public/` wholesale.
  //      Running first, it routinely committed a consumed proposal's move
  //      before the lines above staged that same source path deliberately;
  //      `git add` then answered "did not match any files", exited 128, and ONE
  //      unmatched pathspec is fatal for the WHOLE invocation. Measured
  //      2026-09-03: three jobs' records discarded in one afternoon, each of
  //      which still reported `done` (addictedtoai-tqpq, j-20260903-02, -05,
  //      -06).
  //
  // Moving the call fixes (1); declaring `owned` fixes (2). The invariant needs
  // BOTH, and it is one sentence (pre-U5 wording, kept for the pin): a job's
  // content and that job's own records reached the remote in ONE per-job push,
  // and the publish step never stages a file the job did not produce. Since
  // U5 the per-job push is gone — the merge lands on train and the TRAIN's
  // scoped push carries it — but the ordering this pinned (records before any
  // push) still holds through the train.
  //
  // `owned` is `staged` — the exact paths this run wrote or moved. Everything
  // the job authored is already IN the merge commit, not in the working tree,
  // so the declaration covers what is left: the records. When the commit above
  // succeeded they are clean and the shared step's phase 1 finds nothing to do;
  // when it could not (a concurrent Pulse holding `.git/index.lock`) phase 1
  // commits them by exact path, and they still leave in this run's push.
  //
  // Not conditional on the outcome by itself (pre-U5): `publishAfterRecords`
  // was set only on a merge, which is the same condition the old call site was
  // nested under. Now always false — the condition is dead but the call site
  // stays for the ordering pin above; the live push is the train's scoped push.
  // -------------------------------------------------------------------------
  if (publishAfterRecords) await publishStep(ctx, { cfg, owned: staged });

  // Stage-1 U2 (tasks 35+36): after the merge phase, evaluate the
  // triggers and run the ordered train synchronously when one fires. K/T
  // evaluate on done AND interrupted runs (a refused job must not strand
  // met triggers); idle additionally needs an empty queue with nothing
  // admitted this run, so fresh solo merges never shortcut K. A train
  // failure is NOT a job failure — the job merged fine; the merges wait
  // on `train` for the next evaluation. So this logs loudly and never
  // touches `outcome` (red-path classification is U3).
  if ((outcome === 'done' || outcome === 'interrupted') && !opts.dryRun) {
    let queueEmpty = false;
    try {
      // `.items`: readQueue returns `{items, warnings, ...}`, never an
      // array — `.length` on the object is undefined and the idle trigger
      // below would be dead in production (caught by the sealed review;
      // the unit arm passes queueEmpty directly and cannot see this).
      queueEmpty = (readQueue(ctx).items || []).length === 0;
    } catch {
      queueEmpty = false;
    }
    const bounds = trainBounds(cfg);
    const pending = pendingMerges(ctx.repoRoot);
    const trig = evaluateTriggers({
      pending, bounds, nowS: Math.floor(Date.now() / 1000),
      queueEmpty, admittedThisRun: Boolean(mergedSha),
    });
    if (trig.fire) {
      ctx.log(`train trigger (${trig.reason}) — assembling the ordered run`);
      const oldest = pending[0].sha;
      const asm = assembleTrain(ctx.repoRoot, {
        trainId: `t-${String(oldest).slice(0, 8)}`,
        bounds,
      });
      if (!asm.ok) {
        ctx.log(`train assembly refused: ${asm.reason} — merges wait on train`);
      } else {
        // Stage-1 U6 (task 51, row 51): a train retries the FAILING GATE,
        // never the set — through the wrapped seam, so `train.mjs` is not
        // edited. The wrapper's own contract (`gates.mjs`) keeps single-gate
        // probes and out-of-checkout measurements retry-free; the
        // classification below deliberately takes the UNWRAPPED seam, so the
        // classification re-run consumes neither retry.
        const trainGates = withFailingGateRetry(opts.gates, {
          onlyDir: ctx.repoRoot,
          onRetry: (r) => ctx.log(
            `train gate retry [${r.kind}]: ${r.gate} ${r.passed ? 'PASS' : 'FAIL'}` +
            `${r.transport ? ' (transport-marked)' : ''}`,
          ),
        });
        let tr = null;
        try {
          // The train reviews with the run's resolved reviewer: the operator's
          // per-run --reviewer choice flows through here as reviewerId. Absent
          // an explicit choice the id is whatever pickRunner resolved at
          // startup (reviewer default, else global default, else first
          // cleared entry); flagged for later revisit whether the train
          // should carry its own reviewer selection instead of inheriting
          // the run's.
          tr = await runTrain(ctx, { repo: ctx.repoRoot, trainId: asm.manifest.train, manifest: asm.manifest, gates: trainGates, reviewerId: reviewer.id });
        } catch (e) {
          // runTrain returns {ok:false} for every named failure, but a seam
          // throwing past it (disk full under appendLedger, a reviewer
          // harness dying) must not escape the run: log loudly, merges wait.
          ctx.log(`train threw (${e.message ?? String(e)}) — merges wait on train, nothing publishes`);
        }
        if (tr && !tr.ok) {
          ctx.log(`train failed: ${tr.reason} — merges wait on train, nothing publishes`);
          // Stage-1 U6 (task 49, row 49): breaker 2 reads the TRAIN's
          // post-records build. Only a RED re-gate feeds it: a re-gate that
          // could not run (`threw`) is the did-not-run third state, and any
          // other train failure already has its own handling (the red path's
          // hold-or-reject). The old per-job feed stays deleted.
          if (isPostRecordsRedOutcome(tr.reason)) {
            let classification = 'unknown';
            try {
              const cls = classifyRedTrain(ctx, { repo: ctx.repoRoot, manifest: asm.manifest, gates: opts.gates });
              if (cls && cls.ok && cls.verdict) classification = cls.verdict;
            } catch {
              // Unclassifiable stays unknown, which trips (fail-closed).
            }
            const b2 = checkBuildRed(ctx, { ok: false, output: tr.reason, classification });
            if (b2.tripped) ctx.log(`BREAKER: ${b2.reason}`);
            else ctx.log(`breaker 2: post-records re-gate red classified ${classification} — excluded, no halt`);
          }
        } else if (tr) {
          ctx.log(`train verified ${String(tr.sha).slice(0, 8)} — scoped push already ran inside the train (publishTrain); consuming its publish result`);
          // Stage-1 U6 (task 49, row 49), second trigger: the Pulse's deploy
          // confirmation window, observed through the shared publish step's
          // missed-deploy result — never a live deploy from here.
          const b2d = checkDeployWindow(ctx, tr.publish);
          if (b2d.tripped && b2d.wrote) ctx.log(`BREAKER: ${b2d.reason}`);
          else if (b2d.tripped) ctx.log(`breaker 2: missed deploy observed on the standing hold — not overwritten`);
        }
      }
    }
  }

  // The run's last word, unconditionally.
  //
  // Diagnostic, and it is here because its absence cost a diagnosis today. On
  // 2026-09-03 j-20260903-05 merged, published, transcribed its findings — and
  // its log simply STOPPED there, with the process exiting 0 and no records
  // commit anywhere. A run that reached the end with nothing to commit and a
  // run that stopped between the transcription and the commit produced exactly
  // the same log, because the last thing the run ever printed was conditional.
  // A terminal line that always prints makes it answerable from the log alone
  // whether a run finished (addictedtoai-tqpq).
  ctx.log(`job ${jobId} complete — outcome ${outcome}`);

  if (outcome === 'failed' || outcome === 'discarded') {
    const b1 = checkConsecutiveFailures(ctx, readLedger(ctx), job.type);
    if (b1.tripped) ctx.log(`BREAKER: ${b1.reason}`);
  }

  return { started: true, jobId, branch, outcome, mergedSha, ledgerLine: line, result };
}

/**
 * Commit the loop's own records — the ledger line, the verdict record(s), the
 * directive marker, the recomputed derived tree, and anything transcribed from
 * the verdict — by exact path.
 *
 * Exported and separated from `runLoop` so the failure below can be MEASURED,
 * which is the whole reason this function exists (beads addictedtoai-tqpq).
 *
 * THE DEFECT. This was four inlined lines that discarded every git return
 * value:
 *
 *     gitTry(repo, ['add', '--', ...staged]);
 *     const has = gitTry(repo, ['diff', '--cached', '--name-only']).stdout.trim();
 *     if (has) { gitTry(repo, ['commit', ...]); log(...) }
 *
 * `gitTry` reports `{ok, status, stdout, stderr}` and nothing here read `ok`.
 * So a failed `add` — most obviously a concurrent Pulse holding
 * `.git/index.lock`, which happens on this machine because the two engines
 * share one checkout — left `has` empty, took the `if` false, logged NOTHING,
 * and the run went on to report `done`. "Staging failed" and "there was
 * nothing new to commit" were the same silent branch.
 *
 * MEASURED 2026-09-03, twice in one day. `j-20260903-02` and `j-20260903-05`
 * both merged and pushed with no `records` commit anywhere in the history, and
 * their carried findings sat untracked. In -02's case the Pulse's own commit
 * `b2aa018` carried the Desk's ledger line, verdict record and consumed
 * proposal — files the Pulse did not write — which is `addictedtoai-ps3`'s
 * attribution failure arriving through this door.
 *
 * WHAT IS AT STAKE beyond a few files: this same path carries the ledger line
 * the budget is computed from, the verdict record the review gate is audited
 * by, and BOTH halves of a proposal move. A failed `add` there leaves the
 * addition uncommitted while the deletion is not staged either — the exact
 * split `consumedPaths`' own comment says must never happen.
 *
 * THE FIX IS VISIBILITY, NOT A RETRY. Whether the loop should retry, wait for
 * the lock, or leave the files for the next run is a real design question and
 * a separate one; a failure that prints nothing cannot be any of them. So this
 * distinguishes the three outcomes and says which one happened, every time.
 *
 * @returns {{committed: boolean, why: string, paths: string[]}}
 */
export function commitJobRecords(ctx, { staged: stagedIn, jobId, outcome }) {
  let staged = stagedIn;
  if (!staged.length) {
    const why = 'no record path existed to stage';
    ctx.log(`records: ${why}`);
    return { committed: false, why, paths: [] };
  }
  // Drop the source half of a move that something else has ALREADY committed.
  //
  // This is the cause rather than the damage, and dropping it here keeps the
  // ordinary publishing run on the fast path. When publishing is on, the
  // publish step runs before this commit and stages `data/` wholesale
  // (addictedtoai-ps3), so it routinely commits a consumed proposal's move
  // first. The source path is then in neither the working tree nor the index,
  // which makes it an unmatched pathspec — and one of those is fatal for the
  // whole `add` (see the retry below). A path that is absent from disk but
  // still tracked is exactly what `sweptPaths`/`consumedPaths` exist for and
  // is kept: `ls-files` returns it, because that is how a deletion gets
  // staged alongside its addition.
  const absent = staged.filter((p) => !existsSync(join(ctx.repoRoot, p)));
  let stageable = staged;
  if (absent.length) {
    const ls = gitTry(ctx.repoRoot, ['ls-files', '--', ...absent]);
    const tracked = new Set(
      ls.stdout
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
    );
    // Only drop when `ls-files` actually answered. If it failed, keep every
    // path and let the retry sort it out — a broken query must not silently
    // discard records.
    const drop = ls.ok ? absent.filter((p) => !tracked.has(p)) : [];
    if (drop.length) {
      stageable = staged.filter((p) => !drop.includes(p));
      ctx.log(
        `records: ${drop.length} moved path(s) are already committed elsewhere and are not this ` +
          `run's to record: ${drop.join(', ')}`,
      );
    }
  }
  if (!stageable.length) {
    const why = 'every record path was already committed elsewhere';
    ctx.log(`records: ${why}`);
    return { committed: false, why, paths: [] };
  }
  staged = stageable;

  const add = gitTry(ctx.repoRoot, ['add', '--', ...staged]);
  if (!add.ok) {
    // ONE UNMATCHED PATHSPEC IS FATAL FOR THE WHOLE `add`, and that is the
    // mechanism behind every instance of this defect measured so far.
    //
    // `sweptPaths` and `consumedPaths` name the SOURCE of a move, which by
    // construction no longer exists on disk. Staging it is right and
    // deliberate — it is how the deletion travels with the addition — but it
    // only works while git still knows the path. When publishing is on, the
    // publish step runs BEFORE this commit and stages `data/` wholesale
    // (addictedtoai-ps3), so it may already have committed the move. The path
    // is then absent from the working tree AND from the index, `git add` says
    // "did not match any files", exits 128, and takes every OTHER path in the
    // same invocation down with it.
    //
    // Measured 2026-09-03 on j-20260903-06: one already-committed proposal
    // move discarded the ledger line, the verdict record, the derived tree, a
    // noted proposal and both carried findings.
    //
    // So retry per path. A record that can be staged is staged; one that
    // cannot is named. No single odd path may cost the rest.
    const staged1 = [];
    const failed = [];
    for (const p of staged) {
      const one = gitTry(ctx.repoRoot, ['add', '--', p]);
      if (one.ok) staged1.push(p);
      else failed.push({ path: p, why: describeGitFailure(one, 'git add failed') });
    }
    for (const f of failed) {
      const gone = /did not match any file/i.test(f.why);
      ctx.log(
        `records: could not stage ${f.path} — ${f.why}${
          gone
            ? '. This is the source half of a move that something else has already committed ' +
              '(most likely the publish step, which stages data/ wholesale and runs first), so ' +
              'there is nothing left for this run to record about it.'
            : ''
        }`,
      );
    }
    if (!staged1.length) {
      // Loud, and naming the paths, because these files are now the only copy
      // of this run's records and nothing downstream will notice they are
      // missing.
      ctx.log(`RECORDS NOT COMMITTED — not one record path could be staged (exit ${add.status})`);
      ctx.log(`  could not stage: ${staged.join(', ')}`);
      ctx.log(
        '  they are in the working tree, uncommitted. If .git/index.lock is held, a concurrent ' +
          'Pulse or another agent has the index; the files are intact and need committing by the ' +
          'next run or by hand (addictedtoai-tqpq).',
      );
      return { committed: false, why: describeGitFailure(add, 'git add failed'), paths: staged };
    }
    ctx.log(`records: staged ${staged1.length} of ${staged.length} path(s) individually after the batch add failed`);
  }
  const has = gitTry(ctx.repoRoot, ['diff', '--cached', '--name-only']).stdout.trim();
  if (!has) {
    // A real and ordinary outcome — usually because a concurrent Pulse's
    // wholesale `data/` staging already committed them. Said out loud so it
    // can never again be mistaken for the failure above.
    const why = 'everything was already committed; nothing new to record';
    ctx.log(`records: ${why}`);
    return { committed: false, why, paths: [] };
  }
  const paths = has.split('\n');
  const commit = gitTry(ctx.repoRoot, ['commit', '--no-verify', '-m', `job ${jobId}: records (${outcome})`]);
  if (!commit.ok) {
    ctx.log(
      `RECORDS NOT COMMITTED — the paths staged but \`git commit\` failed: ${describeGitFailure(commit, 'git commit')}`,
    );
    ctx.log(`  staged and left staged: ${paths.join(', ')}`);
    return { committed: false, why: describeGitFailure(commit, 'git commit failed'), paths };
  }
  ctx.log(`committed the job's records: ${paths.join(', ')}`);
  return { committed: true, why: 'committed', paths };
}

/** Breaker 3, exported so the bypass path is testable by attempting it. */
export function attemptMergeWithoutReview(ctx, jobId, detail = '') {
  return checkReviewBypass(ctx, `job ${jobId}: ${detail}`);
}

/**
 * The Desk's exit code, computed from what one run actually did (beads
 * addictedtoai-pfv, design decision D7 — RULED 2026-08-31, the maintainer's
 * delegated decision, PARTIAL implementation; see below for the part this
 * cannot cover).
 *
 * D7 asked whether a Desk with no usable runner should halt (a fifth
 * breaker, writing `HOLD.md`) rather than merely refuse. RULING: yes in
 * principle — design.md's Option B (the narrowest form, firing only when
 * EVERY runner cleared for `author` is refused) remains the right target,
 * for the reason its own analysis gives: it is the only option under which
 * "the Desk cannot do anything" reaches the maintainer without a log read,
 * and its firing condition is tight enough it cannot become the breaker
 * that cries wolf (measured 2026-08-30 in `data/conformance.json`: 3 of 4
 * registered runners pass conformance today, so the condition is currently
 * far from live).
 *
 * WHY IT IS NOT IMPLEMENTED HERE. specs/loop's breaker list is closed —
 * "No other condition halts the loop" — and `openspec/specs/` is a reserved
 * path (breaker 4) no job, and no ruling made outside the OpenSpec workflow,
 * may edit. Writing code that halts the Desk on a fifth condition the spec
 * does not yet name would make the CODE violate the CURRENT spec, which is
 * the same defect this repository's guardrails exist to prevent in the
 * other direction. The requirement text (drafted in the archived
 * `harden-seed-wave-guardrails` design.md as "DRAFT — NOT ADOPTED") and the
 * usable-runner predicate across the WHOLE registry (not just the two
 * runners this invocation was given) are filed as their own beads issue,
 * addictedtoai-8wm0, to be built once the spec change lands.
 *
 * WHAT IS DONE HERE, WITHOUT WAITING. `runLoop()`'s refusal paths
 * (conformance FAIL, or `runnerHealthGate` FAIL after three no-output runs —
 * see `health.mjs`) set `res.refused` but leave `res.started` `true`, and
 * `main()` used to map ANY `started !== false` result to exit 0 — the SAME
 * code a run that merged a job returns. A scheduled process invoking
 * `node loop/run.mjs` and watching only its exit code would see "success" on
 * a run that refused a dead runner and did nothing, indistinguishable from a
 * run that worked. This closes THAT gap, and only that gap: a refusal for
 * THIS invocation's chosen runner(s) is now a distinct exit code. It is
 * honestly a narrower claim than D7's — it says nothing about whether some
 * OTHER runner in the registry would have worked, because nothing here
 * enumerates the registry — but it is real, needs no spec change (exit codes
 * are not normative anywhere in specs/loop, checked by grep before this was
 * written), and it is available today rather than gated on the maintainer's
 * OpenSpec review.
 *
 * `main()` calls this instead of inlining the mapping so the mapping is
 * independently testable without spawning a process — matching the
 * structural-assertion precedent `exit-code.test.mjs` set for addictedtoai-1yt.
 *
 *  0 — the run attempted something, or genuinely found nothing to do.
 *      "nothing qualified" is a normal, healthy outcome (specs/loop), not a
 *      failure, and is deliberately NOT distinguished from a merged job here.
 *  1 — the loop did not even start (a `STOP` file, an existing `HOLD.md`) or
 *      `main()`'s own try/catch caught an error. Unchanged from before.
 *  2 — REFUSED before any work was attempted: the runner this invocation was
 *      given (author or reviewer role) is not usable right now.
 */
export function exitCodeFor(res) {
  if (res.started === false) return 1;
  if (res.refused) return 2;
  return 0;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    process.stdout.write(USAGE);
    return 0;
  }
  const ctx = makeContext({ repoRoot: args.repo, worktreeRoot: args.worktreeRoot });
  // Stage-1 task 35b (U1, bead avs5): one worker is a mechanism, not a
  // discipline. A run takes a worker slot before anything else; when none is
  // free the run refuses with the did-not-start status (1 — the same status
  // a STOP/HOLD refusal carries, per `exitCodeFor` above) and is booked
  // `interrupted`: resumable, never a breaker input. There is no job yet, so
  // the log line IS the booking, the same shape as every other startup
  // refusal. Exit status found in this file for Q6: 1 (did-not-start class).
  let slot = null;
  try {
    slot = acquireWorkerSlot({ workers: loadConfig(ctx).workers ?? 1 });
    if (!slot.ok) {
      ctx.log(slot.message);
      return 1;
    }
    try {
      const res = await runLoop(ctx, {
        runner: args.runner,
        reviewer: args.reviewer,
        dryRun: args.dryRun,
        noGates: args.noGates,
      });
      return exitCodeFor(res);
    } finally {
      const rel = releaseWorkerSlot(slot);
      if (!rel.ok) ctx.log(`worker slot release failed: ${rel.reason}`);
    }
  } catch (e) {
    // A child process's stderr is the whole diagnosis of a "Command failed"
    // (execFileSync puts only the command line in `message`); twice a run died
    // here on a transient `git diff` with nothing to read afterwards
    // (addictedtoai-vd5y: j-20260906-18, j-20260907-11).
    const stderr = e && e.stderr ? String(e.stderr).trim() : '';
    const status = e && e.status != null ? ` (exit ${e.status})` : '';
    ctx.log(`loop error: ${e.message}${status}${stderr ? `\n${stderr}` : ''}`);
    if (process.env.LOOP_DEBUG) ctx.log(e.stack ?? '');
    return 1;
  }
}

// ---- how this program ends, and why it is not `process.exit(code)` --------
//
// It ends by setting `process.exitCode` and letting the event loop drain,
// exactly as `pulse/run.mjs` does (addictedtoai-9bh) and for the same reason
// (addictedtoai-1yt). By the time this line runs, the process may have
// reached `publishStep` -> `pulse/lib/publish.mjs` `fetchLiveStamp`, which
// polls the live `/status.json` build stamp with `fetch`. `process.exit()`
// in a process that has used `fetch` can die on Windows on
//
//   Assertion failed: !(handle->flags & UV_HANDLE_CLOSING), file src\win\async.c
//
// exiting 3221226505 (0xC0000409) instead of the code `main()` returned.
// Unlike the Pulse's constant 0, this file's code is MEANINGFUL — 0 (done),
// 1 (refused/error), or whatever `runLoop` reports — so the assertion would
// not just flip success to failure, it would erase which outcome happened.
//
// Draining is safe here, not just convenient: every fetch reachable from this
// file (the deploy poll in `fetchLiveStamp`) is bounded by
// `AbortSignal.timeout(15000)` and awaited, and the poll loop's own delay is
// an awaited `setTimeout`, not a bare timer — confirmed 2026-08-31 by reading
// `pulse/lib/publish.mjs` for addictedtoai-1yt. Nothing else in `loop/`'s own
// process calls `fetch` (the runner and reviewer are separate child
// processes via `spawn`, not this process's network activity).
//
// DO NOT "fix" a future hang by putting `process.exit()` back. It would
// restore this crash and flatten every real exit code to one number.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().then((code) => {
    process.exitCode = code;
  });
}
