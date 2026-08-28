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
import { appendLedger, makeLedgerLine, nextJobId, readLedger, LEDGER_FIELDS } from './lib/ledger.mjs';
import { lanePause } from './lib/budget.mjs';
import { selectJob, formatRefusals } from './lib/select.mjs';
import { assembleBrief, resumeBrief } from './lib/brief.mjs';
import { readResult, classifyRun } from './lib/result.mjs';
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
import { scanJobBranches, readCommittedBrief } from './lib/resume.mjs';
import { runGates, unlinkNodeModules } from './lib/gates.mjs';
import { mergeGate, runReview, verdictPath } from './lib/review.mjs';
import {
  checkConsecutiveFailures,
  checkBuildRed,
  checkReviewBypass,
  checkReservedPaths,
  startGate,
} from './lib/breakers.mjs';
import { publishStep } from './lib/publish.mjs';
import { markDirectiveDone } from './lib/directives.mjs';

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

  ctx.log(`invoking runner "${runner.id}" (provider ${runner.provider}, tier ${runner.tier}) under a ${capMinutes}-minute cap`);
  const run = await runExecutor({
    command: runner.command,
    cwd: worktree,
    promptText: briefText,
    promptPath: join(ctx.worktreeRoot, `${jobId}-brief.md`),
    timeoutMs: capMinutes * 60 * 1000,
    role: 'author',
    jobId,
    logPath: jobLogPath(ctx.worktreeRoot, jobId, 'author'),
  });
  ctx.log(`runner returned after ${run.mm.toFixed(2)} model-minutes (exit ${run.code}${run.killed ? ', killed at cap' : ''})`);

  // Read the protocol file from the FILESYSTEM before anything else touches
  // the tree. This is the only channel; nothing here accepts a status from
  // the executor's stdout.
  const fileResult = readResult(worktree);
  const classified = classifyRun(run, fileResult, runner);
  ctx.log(`result protocol: ${classified.status} — ${classified.evidence}`);

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
  const reserved = checkReservedPaths(ctx, changed, jobId);
  if (reserved.tripped) {
    ctx.log(`BREAKER: ${reserved.reason}`);
    return { outcome: 'failed', mm: run.mm, held: reserved, changed, note: 'reserved-path edit attempt' };
  }

  if (classified.status === 'capacity') {
    return { outcome: 'capacity', mm: run.mm, changed, note: classified.evidence };
  }
  if (classified.status === 'interrupted') {
    return { outcome: 'interrupted', mm: run.mm, changed, note: classified.evidence };
  }
  if (classified.status === 'blocked') {
    // A well-formed `blocked:` with a clean tree is a SUCCESSFUL honest
    // outcome. It is not retried with the same brief unchanged.
    ctx.log(`blocked (honest outcome): ${classified.reason}`);
    return { outcome: 'blocked', mm: run.mm, changed, note: classified.reason };
  }

  if (changed.length === 0) {
    ctx.log('the executor reported `done` but the branch diff is empty — nothing to review or merge');
    return { outcome: 'failed', mm: run.mm, changed, note: 'done with an empty diff' };
  }

  // Gates.
  let gateResult = { ok: true, output: 'gates skipped (--no-gates)' };
  if (gates !== false) {
    ctx.log('running the schema/build gates on the branch');
    gateResult = typeof gates === 'function' ? gates(ctx, worktree) : runGates(ctx, worktree);
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
      return { outcome: 'failed', mm: run.mm, changed, note: 'gates failed', gateOutput: gateResult.output };
    }
  }

  // Review — the loop computes the diff itself.
  const diffText = diffAgainst(ctx.repoRoot, base, branch);
  let mm = run.mm;
  let pass = 1;
  let findings = '';
  for (;;) {
    ctx.log(`review pass ${pass}: invoking reviewer "${reviewer.id}" with fresh context and no edit rights`);
    const rev = await runReview(ctx, {
      jobId,
      job,
      branch,
      diffText,
      runner: reviewer,
      capMinutes,
      pass,
      findings,
    });
    mm += rev.run.mm; // "Review MM counts toward the job it reviews."
    if (rev.discarded.discardedAnything) {
      ctx.log(`the reviewer changed its worktree; those changes were discarded (branch ${rev.branchUnchanged ? 'unchanged' : 'CHANGED — investigate'})`);
    }
    const gate = mergeGate(ctx, { jobId, type: job.type, pass });
    if (gate.ok) {
      ctx.log(`review: approve (would-cite recorded)`);
      return { outcome: 'approve', mm, changed, verdict: gate.verdict, pass, diffText };
    }
    ctx.log(`review: merge refused — [${gate.code}] ${gate.reason}`);
    if (gate.code === 'no-record' || gate.code === 'malformed-verdict') {
      return { outcome: 'failed', mm, changed, note: gate.reason };
    }
    if (gate.code === 'would-cite-empty' || gate.code === 'would-cite-duplicate') {
      return { outcome: 'failed', mm, changed, note: gate.reason };
    }
    if (pass >= 2) {
      ctx.log('a second non-approval discards the job: branch closed, reasons kept');
      return { outcome: 'discarded', mm, changed, note: gate.reason, verdict: gate.verdict };
    }
    // One revision pass against the named findings, then a delta review.
    findings = `${gate.verdict.reasons.join(', ')}\n\n${gate.verdict.notes}`;
    ctx.log('one revision pass against the named findings');
    const revisionBrief = `${briefText}\n\n---\n\n## Revision pass (one only)\n\nThe reviewer did not approve. Address exactly these findings, change nothing\nelse, and end by writing RESULT.md again:\n\n${findings}\n`;
    const run2 = await runExecutor({
      command: runner.command,
      cwd: worktree,
      promptText: revisionBrief,
      promptPath: join(ctx.worktreeRoot, `${jobId}-revision-brief.md`),
      timeoutMs: capMinutes * 60 * 1000,
      role: 'author',
      jobId,
      logPath: jobLogPath(ctx.worktreeRoot, jobId, 'revision'),
    });
    mm += run2.mm;
    unlinkNodeModules(worktree);
    commitAll(ctx.repoRoot, worktree, `job ${jobId}: revision`, { exclude: ['RESULT.md'] });
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

  const lane = lanePause(ledger, runner.provider, now);
  let resumeTarget = null;
  if (!lane.paused && scan.resumable.length > 0) resumeTarget = scan.resumable[0];
  if (lane.paused) ctx.log(`lane paused: ${lane.reason}`);

  let jobId;
  let job;
  let branch;
  let briefText;
  let resumed = false;

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
    briefText = resumeBrief(committed);
    ctx.log(`resuming ${branch} (${resumeTarget.reason}, ${resumeTarget.ageDays.toFixed(1)} days old) — no retry consumed`);
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
    });
    ctx.log(`selected: ${job.type} from ${job.source} — ${job.title}`);
  }

  ctx.log(`job id: ${jobId}`);
  ctx.log(`branch: ${branch}`);

  if (opts.dryRun) {
    ctx.log('--- ledger line schema (written at the end of a real run) ---');
    ctx.log(ledgerSchemaLine(job, runner, jobId));
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
    gitTry(worktree, ['commit', '--no-verify', '-m', `job ${jobId}: brief`]);
    ctx.log(`committed .job/brief.md to ${branch} — the branch now carries everything resumption needs`);
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
    });
  } finally {
    unlinkNodeModules(worktree);
  }

  // --- Merge, publish, ledger. --------------------------------------------
  let outcome = result.outcome;
  let mergedSha = null;

  if (outcome === 'approve') {
    // Housekeeping so job scaffolding never reaches main; the branch keeps it.
    gitTry(worktree, ['rm', '-r', '-q', '--ignore-unmatch', '.job']);
    gitTry(worktree, ['commit', '--no-verify', '-m', `job ${jobId}: remove job scaffolding before merge`]);
    const merged = mergeLocal(ctx.repoRoot, branch, `job ${jobId} (${job.type}): ${String(job.title).slice(0, 60)}`);
    if (!merged.ok) {
      ctx.log(`merge failed: ${merged.reason}`);
      outcome = 'failed';
    } else {
      mergedSha = merged.sha;
      outcome = 'done';
      ctx.log(`merged ${branch} into ${base} locally as ${mergedSha.slice(0, 8)} — nothing is pushed`);
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
  }

  removeWorktree(ctx.repoRoot, worktree);
  rmSync(worktree, { recursive: true, force: true });

  const recordPaths = [
    relative(ctx.repoRoot, ctx.ledgerPath),
    relative(ctx.repoRoot, verdictPath(ctx, jobId, 1)),
    relative(ctx.repoRoot, verdictPath(ctx, jobId, 2)),
    relative(ctx.repoRoot, ctx.directivesPath),
  ].map((p) => p.replace(/\\/g, '/'));

  const line = appendLedger(
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
      ts: ctx.now().toISOString(),
    }),
  );
  ctx.log(`ledger: ${JSON.stringify(line)}`);

  // Commit the loop's OWN records — the ledger line, the verdict record(s), the
  // directive marker — by exact path. The entire data/ tree is committed
  // (design D1) and these are state, not derived output; leaving them
  // uncommitted would lose the ledger the budget is computed from. Exact paths
  // only: never `add -A` in the main working tree, which the maintainer or
  // another process may be mid-edit in.
  const staged = recordPaths.filter((p) => existsSync(join(ctx.repoRoot, p)));
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
    return res.started === false ? 1 : 0;
  } catch (e) {
    ctx.log(`loop error: ${e.message}`);
    if (process.env.LOOP_DEBUG) ctx.log(e.stack ?? '');
    return 1;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().then((code) => process.exit(code));
}
