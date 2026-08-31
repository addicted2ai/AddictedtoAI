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

import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { makeContext } from './lib/paths.mjs';
import { loadConfig } from './lib/config.mjs';
import { loadRunners, pickRunner, conformanceGate, loadConformance } from './lib/runners.mjs';
import { appendLedger, jobSpendSoFar, makeLedgerLine, nextJobId, readLedger, LEDGER_FIELDS } from './lib/ledger.mjs';
import { invocationAllowance, jobTotalMinutes, lanePause, minInvocationMinutes } from './lib/budget.mjs';
import { selectJob, formatRefusals } from './lib/select.mjs';
import { assembleBrief, invocationAccounting, resumeBrief } from './lib/brief.mjs';
import { readResult, classifyRun, reviewProducedNothing, RESULT_FILENAME } from './lib/result.mjs';
import { runExecutor, jobLogPath } from './lib/exec.mjs';
import {
  addWorktree,
  changedPathsWithStatus,
  commitAll,
  currentBranch,
  deleteBranch,
  diffAgainst,
  gitTry,
  mergeBase,
  mergeLocal,
  removeWorktree,
} from './lib/git.mjs';
import { scanJobBranches, readCommittedBrief, readCommittedJobSource } from './lib/resume.mjs';
import { runnerHealthGate, NO_OUTPUT_STREAK_LIMIT, NO_OUTPUT_SIGNAL } from './lib/health.mjs';
import { runGates, unlinkNodeModules } from './lib/gates.mjs';
import { isReissueRefusal, joinableSubjects, mergeGate, runReview, verdictPath, writeRecordSubjects } from './lib/review.mjs';
import {
  brakeScan,
  brakeState,
  checkConsecutiveFailures,
  checkBuildRed,
  checkReviewBypass,
  checkReservedPaths,
  startGate,
} from './lib/breakers.mjs';
import { publishStep } from './lib/publish.mjs';
import { rederiveStep, DERIVED_PATHS, dirtyDerivedInputs } from './lib/rederive.mjs';
import { markDirectiveDone } from './lib/directives.mjs';
import { isIssueId, mergeIssueIds } from './lib/issues.mjs';
import {
  applyProposalMergeRules,
  consumeProposal,
  sweepExpiredProposals,
  transcribeNotedProposal,
} from './lib/proposals.mjs';
import { transcribeCarriedFindings } from './lib/carry.mjs';

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
    gates,
    ledger,
  } = opts;
  const capMinutes = cfg.job_caps_minutes[job.type];
  const base = opts.base;
  const prior = opts.prior ?? { mm: 0, invocations: 0 };

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
  const phases = [];
  const phase = (role, who, r, outcome, signal) =>
    phases.push({
      role,
      runner: who.id,
      mm: Math.round(r.mm * 100) / 100,
      killed: Boolean(r.killed),
      code: r.code ?? null,
      outcome,
      ...(signal ? { signal } : {}),
    });
  /** Every exit from this function carries the phases recorded up to it. */
  const finish = (o) => ({ ...o, phases });

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
  phase('author', runner, run, classified.status);

  // Commit whatever the executor left, INCLUDING on a kill: the branch, not
  // the scratch worktree, is what resumption reads.
  unlinkNodeModules(worktree);
  const committed = commitAll(ctx.repoRoot, worktree, `job ${jobId}: executor output`, {
    exclude: ['RESULT.md'],
  });
  if (committed.committed) ctx.log(`committed the executor's output to ${branch}`);

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

  if (changed.length === 0) {
    ctx.log('the executor reported `done` but the branch diff is empty — nothing to review or merge');
    return finish({ outcome: 'failed', mm, changed, note: 'done with an empty diff' });
  }

  // Gates. `gateReport` is what the reviewer is told about them — a
  // measurement of what ran on this branch, never a reassurance (see
  // review.mjs gatesSection, beads addictedtoai-5z9).
  let gateResult = { ok: true, output: 'gates skipped (--no-gates)' };
  let gateReport = { ran: false, why: 'the loop was run with --no-gates' };
  if (gates !== false) {
    ctx.log('running the schema/build gates on the branch');
    gateResult = typeof gates === 'function' ? gates(ctx, worktree) : runGates(ctx, worktree);
    gateReport = { ran: true, ok: gateResult.ok, results: gateResult.results ?? [] };
    ctx.log(`gates: ${gateResult.ok ? 'PASS' : 'FAIL'}`);
    if (!gateResult.ok) {
      // Print WHY, not just THAT. The worktree is torn down in the caller's
      // `finally`, so this is the only moment the evidence exists: a gate
      // failure nobody can diagnose is a gate failure nobody can act on.
      // Observed on job j-20260828-01, whose only record was `gates: FAIL`.
      for (const r of gateResult.results ?? []) {
        ctx.log(`  gate ${r.script}: ${r.ok ? 'PASS' : `FAIL (exit ${r.status})`}`);
      }
      ctx.log('--- gate output ---');
      ctx.log(gateResult.output ?? '(no output captured)');
      ctx.log('--- end gate output ---');
      return finish({ outcome: 'failed', mm, changed, note: 'gates failed', gateOutput: gateResult.output });
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
    const reviewAllowance = allowance(`review pass ${pass}`);
    if (!reviewAllowance.ok) {
      ctx.log(`BUDGET: ${reviewAllowance.reason}`);
      ctx.log(`the work on ${branch} is left where it is; nothing merges without a review`);
      return finish({ outcome: 'abandoned', mm, changed, note: reviewAllowance.reason });
    }
    ctx.log(`review pass ${pass}: invoking reviewer "${reviewer.id}" with fresh context and no edit rights, under a ${reviewAllowance.capMinutes}-minute cap${capNote(reviewAllowance)}`);
    const rev = await runReview(ctx, {
      jobId,
      job,
      branch,
      diffText,
      runner: reviewer,
      capMinutes: reviewAllowance.capMinutes,
      pass,
      findings,
      gates: gateReport,
      // The job's spend, not this run's: a resumed job carries what its earlier
      // runs cost, and the reviewer is told the number the ledger would show.
      mmSoFar: spent(),
      invocations: prior.invocations + phases.length,
      totalMinutes,
    });
    mm += rev.run.mm; // "Review MM counts toward the job it reviews."
    if (rev.discarded.discardedAnything) {
      ctx.log(`the reviewer changed its worktree; those changes were discarded (branch ${rev.branchUnchanged ? 'unchanged' : 'CHANGED — investigate'})`);
    }
    // The same measurement the post-merge write uses (`base` here IS
    // `mergeBaseSha`), re-read from the branch rather than reused from `changed`
    // above: a revision pass can add a file after the author run, and the gate
    // must compare the record against what is actually about to merge.
    const gate = mergeGate(ctx, {
      jobId,
      type: job.type,
      pass,
      subjects: joinableSubjects(changedPathsWithStatus(ctx.repoRoot, base, branch)),
    });
    // The reviewer analogue of the author's no-output detection (beads
    // addictedtoai-g8a): no verdict record, not killed, and nothing on stdout
    // — the shape of a reviewer that never really ran. Measured from `rev`,
    // which already carries both halves (`recordWritten` from `runReview`'s
    // own `existsSync`, and `run.stdout` from the executor). See
    // `reviewProducedNothing`'s doc comment for why a malformed-but-present
    // record does NOT count, and why `no-record` alone is not enough either.
    const reviewerProducedNothing = reviewProducedNothing(rev.run, rev.recordWritten, reviewer);
    if (reviewerProducedNothing) {
      ctx.log(
        `review pass ${pass} produced nothing at all: no verdict record and nothing on stdout. ` +
          `Recording signal \`${NO_OUTPUT_SIGNAL}\` on this phase.`,
      );
    }
    phase(`review${pass}`, reviewer, rev.run, gate.ok ? 'approve' : gate.code, reviewerProducedNothing ? NO_OUTPUT_SIGNAL : undefined);
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
      return finish({ outcome: 'discarded', mm, changed, note: gate.reason, verdict: gate.verdict });
    }
    // One revision pass against the named findings, then a delta review.
    findings = `${gate.verdict.reasons.join(', ')}\n\n${gate.verdict.notes}`;
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
    // The revision brief is the author brief plus the findings, and the author
    // brief's spend figures were true when it was assembled and are stale now —
    // the author run and at least one review have happened since. A brief that
    // restated "0.00 across 0 invocations" to the third invocation of a job
    // would be the exact misreading this is for, so the current accounting is
    // appended and supersedes what is above it.
    const revisionBrief =
      `${briefText}\n\n---\n\n## Revision pass (one only)\n\n` +
      `**This job's accounting, as of now** — these supersede the figures near the top of\n` +
      `this brief, which were written before the author run and the review:\n\n` +
      `${invocationAccounting({ capMinutes: revisionAllowance.capMinutes, mmSoFar: spent(), invocations: prior.invocations + phases.length, totalMinutes, floorMinutes })}\n\n` +
      `The reviewer did not approve. Address exactly these findings, change nothing\nelse, and end by writing RESULT.md again:\n\n${findings}\n`;
    // A revision is a second executor invocation into the same worktree, so it
    // gets the same brake window as the author run. This is also the ONLY place
    // the "a brake disappeared from the repository root" test is not vacuous:
    // `startGate` guarantees neither file exists when the author run starts, but
    // the maintainer can write one while the review is running, and a revision
    // that removes it is exactly the self-serving act breaker 4 names.
    brakesBefore = brakeState(ctx);
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

export async function runLoop(ctx, opts = {}) {
  const gate = startGate(ctx);
  if (!gate.ok) {
    ctx.log(`the Desk does not start: ${gate.why}`);
    return { started: false, reason: gate.why };
  }

  const cfg = loadConfig(ctx);
  const registry = loadRunners(ctx);
  const runner = pickRunner(registry, { id: opts.runner, role: 'author' });
  const reviewer = pickRunner(registry, { id: opts.reviewer, role: 'reviewer' });
  const ledger = readLedger(ctx);
  const now = ctx.now();

  // The expiry sweep, before anything can refuse the run.
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
    const type = b.last?.type ?? 'machinery';
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
    const lastType = resumeTarget.last?.type;
    job = { type: lastType ?? 'machinery', source: 'resumed', title: `resume ${jobId}`, detail: '' };
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
    // Where this job came from, read off the branch rather than remembered.
    // Without it a resumed proposal job merges and leaves its proposal
    // selectable, which is the same defect through the resumption door.
    const origin = readCommittedJobSource(ctx.repoRoot, branch);
    if (Array.isArray(origin?.issues) && origin.issues.length) {
      jobIssues = origin.issues.filter(isIssueId);
      ctx.log(`this branch records that it serves ${jobIssues.join(', ')}`);
    }
    if (origin?.source === 'proposal' && origin.slug && origin.path) {
      proposalOrigin = { slug: origin.slug, path: join(ctx.repoRoot, origin.path) };
      ctx.log(`this branch records that it was selected from proposal \`${origin.slug}\` (${origin.path})`);
    }
  } else {
    const sel = selectJob(ctx, { cfg, ledger, runner, dryRun: opts.dryRun });
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
    if (!sel.selected) {
      ctx.log('nothing qualified — the run ends here, and that is a normal, healthy outcome');
      return { started: true, selected: null, refusals: sel.refusals, nothingQualified: true };
    }
    job = sel.selected;
    jobId = nextJobId(ledger, now, scan.resumable.concat(scan.other, scan.abandonable).map((b) => b.id));
    branch = `job/${jobId}`;
    briefText = assembleBrief(ctx, {
      jobId,
      job,
      branch,
      capMinutes: cfg.job_caps_minutes[job.type],
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
      totalMinutes: jobTotalMinutes(cfg, job.type),
      floorMinutes: minInvocationMinutes(cfg, job.type),
    });
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
        'revision / review2) — and "issues", the beads ids this job serves. "mm" above ' +
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
  rmSync(worktree, { recursive: true, force: true });
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
        },
        null,
        2,
      ) + '\n',
      'utf8',
    );
    gitTry(worktree, ['add', '.job/source.json']);
    gitTry(worktree, ['commit', '--no-verify', '-m', `job ${jobId}: brief`]);
    ctx.log(`committed .job/brief.md and .job/source.json to ${branch} — the branch now carries everything resumption needs`);
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
      gates: opts.noGates ? false : opts.gates,
      ledger,
      base: mergeBaseSha,
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
        ts: ctx.now().toISOString(),
      }),
    );
    ctx.log(`ledger: ${JSON.stringify(ledgerLine)}`);
    return ledgerLine;
  };

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

    const merged = mergeLocal(ctx.repoRoot, branch, `job ${jobId} (${job.type}): ${String(job.title).slice(0, 60)}`);
    if (!merged.ok) {
      ctx.log(`merge failed: ${merged.reason}`);
      outcome = 'failed';
    } else {
      mergedSha = merged.sha;
      outcome = 'done';
      ctx.log(`merged ${branch} into ${base} locally as ${mergedSha.slice(0, 8)} — nothing is pushed`);

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
      // work. See `recordOutcome` above for the measurement.
      recordOutcome();
      const rederiveResult = await rederiveStep(ctx);
      rederived = rederiveResult.ok;

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
      const subjects = joinableSubjects(changedPathsWithStatus(ctx.repoRoot, mergeBaseSha, branch));
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
      // rejected was the work, not the idea.
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

      const built = opts.noGates ? { ok: true } : (typeof opts.gates === 'function' ? opts.gates(ctx, ctx.repoRoot) : runGates(ctx, ctx.repoRoot, { scripts: ['build'] }));
      const red = checkBuildRed(ctx, { ok: built.ok, output: built.output ?? '' });
      if (red.tripped) ctx.log(`BREAKER: the post-merge build is red; HOLD.md written`);
      await publishStep(ctx, { cfg });
      if (job.source === 'directive' && job.lineNumber) {
        const m = markDirectiveDone(ctx, job.lineNumber, jobId, now.toISOString().slice(0, 10));
        if (m.changed) ctx.log(`appended the completion marker to DIRECTIVES.md line ${job.lineNumber}`);
      }
      deleteBranch(ctx.repoRoot, branch);
    }
  } else if (outcome === 'discarded') {
    ctx.log(`discarding ${branch}; the record of the reasons is kept at ${verdictPath(ctx, jobId, result.pass ?? 1)}`);
    // The branch is not merged and is not deleted here, so the proposal files
    // it added exist only on it. Nothing moves them into `data/proposals/`:
    // ideas do not outlive the rejection of the work that produced them
    // (specs/loop). That is an absence of code, which is why it is written
    // down — and it is measured by a test that plants a proposal on a branch
    // the reviewer rejects and then reads the working tree.
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
  if (result.verdict) {
    const c = transcribeCarriedFindings(ctx, {
      jobId,
      verdictPath: verdictPath(ctx, jobId, result.pass ?? 1),
      reviewer: reviewer.id,
    });
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

  removeWorktree(ctx.repoRoot, worktree);
  rmSync(worktree, { recursive: true, force: true });

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
  if (staged.length) {
    gitTry(ctx.repoRoot, ['add', '--', ...staged]);
    const has = gitTry(ctx.repoRoot, ['diff', '--cached', '--name-only']).stdout.trim();
    if (has) {
      gitTry(ctx.repoRoot, ['commit', '--no-verify', '-m', `job ${jobId}: records (${outcome})`]);
      ctx.log(`committed the job's records: ${has.split('\n').join(', ')}`);
    }
  }

  if (outcome === 'failed' || outcome === 'discarded') {
    const b1 = checkConsecutiveFailures(ctx, readLedger(ctx), job.type);
    if (b1.tripped) ctx.log(`BREAKER: ${b1.reason}`);
  }

  return { started: true, jobId, branch, outcome, mergedSha, ledgerLine: line, result };
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
  try {
    const res = await runLoop(ctx, {
      runner: args.runner,
      reviewer: args.reviewer,
      dryRun: args.dryRun,
      noGates: args.noGates,
    });
    return exitCodeFor(res);
  } catch (e) {
    ctx.log(`loop error: ${e.message}`);
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
