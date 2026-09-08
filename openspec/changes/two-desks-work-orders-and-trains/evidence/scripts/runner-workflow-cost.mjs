// Workflow-adjusted cost of a merged job, per AUTHOR RUNNER x JOB TYPE, from
// data/ledger.jsonl. Read-only: reads the ledger, writes nothing.
//
// WHY "WORKFLOW-ADJUSTED": orch-runner-quality.mjs (same directory) priced a
// runner on its own author-phase minutes alone. That undercounts a runner
// whose output gets revised a lot, because the revision + second review pass
// (and the minutes spent on jobs in the same cell that never merged at all)
// are real cost the workflow paid to reach a merged result, but they land on
// a different `role` than `author` — or, for jobs that failed/blocked before
// any phase breakdown existed, on no role at all. This script attributes
// EVERY minute in a cell (all roles, all outcomes) to that cell, then divides
// by the jobs that actually merged (`outcome: "done"`), so the denominator is
// "results delivered" and the numerator is "everything the workflow spent
// trying," matching the framing in loop/lib/ledger.mjs's own comment: `mm`
// on a job line is a JOB total, phases break out where it went per role.
//
// FIELD ACCESS reused from orch-runner-quality.mjs so the two tables agree on
// n: authorRunner(j) reads phases[role=author].runner, falling back to the
// job's own top-level `runner` field for the 3 lines in this ledger written
// before `phases` existed (addictedtoai-59s) — j-20260828-01, j-20260828-02,
// j-20260829-01, all pre-phases `entry`/`verify` attempts by
// claude-code-sonnet that never reached review. Those 3 lines' entire `mm` is
// counted under role `author` below (see roleBreakdown), since there is
// nothing in the line to say otherwise and the job never got past the author
// phase (outcome failed/blocked, no review recorded).
//
// COUNTING UNIT: one ledger LINE is one row here, exactly as
// orch-runner-quality.mjs counts (`for (const j of ledger)`, unconditional
// n++). This ledger has 243 lines over 242 unique ids — one job
// (j-20260907-13) was interrupted (capacity) and resumed (failed) as two
// separate lines/invocations, each with its own mm and outcome, and both are
// counted, consistent with the append-only "one line per run" design
// (ledger.mjs's jobSpendSoFar sums lines by id for a different purpose —
// total spend on one job id — which this script does not need, since a
// runner-policy question is about invocations, not job identities).
//
// VERIFIED against the raw file before writing this script: every phases[]
// array's mm sums to that line's top-level mm within 0.02 (0 mismatches
// across all 240 lines carrying phases), no line has two phase entries with
// the same role, and the top-level `runner` field equals the author phase's
// `runner` on every one of the 240 phased lines (0 mismatches). So
// authorRunner(j) and roleBreakdown(j) are reading consistent, non-redundant
// data, not reconciling two sources of truth.
import { readFileSync } from 'node:fs';

const LEDGER_PATH = 'D:/AddictedtoAI/data/ledger.jsonl';

const raw = readFileSync(LEDGER_PATH, 'utf8');
const ledger = raw
  .split('\n')
  .map((s) => s.trim())
  .filter(Boolean)
  .map((l) => JSON.parse(l));

const OUTCOME_COLS = ['done', 'failed', 'discarded', 'blocked', 'interrupted', 'capacity', 'abandoned'];
const ROLE_COLS = ['author', 'review1', 'revision', 'review2'];

const authorRunner = (j) => {
  const a = (j.phases ?? []).find((p) => p.role === 'author');
  return a?.runner ?? j.runner ?? 'unknown';
};

// mm attributed to each of ROLE_COLS, plus `other` for any role not in that
// list (none observed in this ledger, kept so the script does not silently
// drop minutes if one appears later) and `total` (should equal j.mm).
function roleBreakdown(j) {
  const out = { author: 0, review1: 0, revision: 0, review2: 0, other: 0, total: 0 };
  const mm = Number(j.mm) || 0;
  if (Array.isArray(j.phases) && j.phases.length) {
    for (const p of j.phases) {
      const pmm = Number(p.mm) || 0;
      if (ROLE_COLS.includes(p.role)) out[p.role] += pmm;
      else out.other += pmm;
    }
  } else {
    // Pre-`phases` line: the whole job ran as a single (author) attempt that
    // never reached review (see header note). Attribute it all to `author`.
    out.author += mm;
  }
  out.total = mm;
  return out;
}

// reviewer runner named on a review phase, if the phase exists.
const reviewerRunner = (j, role) => (j.phases ?? []).find((p) => p.role === role)?.runner;

function newCell() {
  const outcomes = {};
  for (const o of OUTCOME_COLS) outcomes[o] = 0;
  const roles = { author: 0, review1: 0, revision: 0, review2: 0, other: 0, total: 0 };
  return { n: 0, outcomes, roles, merged: 0, review1Runners: {}, review2Runners: {} };
}

function addToCell(cell, j) {
  cell.n++;
  const oc = j.outcome;
  if (Object.prototype.hasOwnProperty.call(cell.outcomes, oc)) cell.outcomes[oc]++;
  else cell.outcomes[oc] = (cell.outcomes[oc] ?? 0) + 1; // unexpected outcome value, still counted
  if (oc === 'done') cell.merged++;
  const rb = roleBreakdown(j);
  for (const k of Object.keys(cell.roles)) cell.roles[k] += rb[k];
  const r1 = reviewerRunner(j, 'review1');
  if (r1) cell.review1Runners[r1] = (cell.review1Runners[r1] ?? 0) + 1;
  const r2 = reviewerRunner(j, 'review2');
  if (r2) cell.review2Runners[r2] = (cell.review2Runners[r2] ?? 0) + 1;
}

// ---- build cells: (runner, type) and (runner, __ALL__) ---------------------
const byRunnerType = {}; // key `${runner}|${type}`
const byRunnerAll = {}; // key runner

for (const j of ledger) {
  const r = authorRunner(j);
  const t = j.type;
  const kRT = `${r}|${t}`;
  (byRunnerType[kRT] ??= newCell());
  addToCell(byRunnerType[kRT], j);
  (byRunnerAll[r] ??= newCell());
  addToCell(byRunnerAll[r], j);
}

// ---- derived numbers per cell ----------------------------------------------
function derive(cell) {
  const total = cell.roles.total;
  const merged = cell.merged;
  const workflowMmPerMerged = merged > 0 ? total / merged : null;
  const authorMmPerMerged = merged > 0 ? cell.roles.author / merged : null;
  const revisionShareNum = cell.roles.revision + cell.roles.review2;
  const revisionShare = total > 0 ? revisionShareNum / total : null;
  return { workflowMmPerMerged, authorMmPerMerged, revisionShare };
}

// ---- printing helpers (Markdown) --------------------------------------------
const n1 = (x) => x.toFixed(1);
const fmt1 = (x) => (x == null ? 'n/a' : x.toFixed(1));
const fmtPct = (x) => (x == null ? 'n/a' : `${(x * 100).toFixed(0)}%`);

function printCellTable(title, entries) {
  console.log('');
  console.log(`### ${title}`);
  console.log('');
  console.log(
    '| key | n | done | failed | disc | blk | int | cap | abn | author-mm | review1-mm | revision-mm | review2-mm | other-mm | total-mm | merged | workflow-mm/merged | author-mm/merged | revision-share |',
  );
  console.log('|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|');
  for (const [key, cell] of entries) {
    const d = derive(cell);
    const o = cell.outcomes;
    const displayKey = key.replace(/\|/g, ' / '); // '|' is the internal runner/type join char; unsafe in a Markdown table cell
    console.log(
      `| ${displayKey} | ${cell.n} | ${o.done ?? 0} | ${o.failed ?? 0} | ${o.discarded ?? 0} | ${o.blocked ?? 0} | ` +
        `${o.interrupted ?? 0} | ${o.capacity ?? 0} | ${o.abandoned ?? 0} | ${n1(cell.roles.author)} | ` +
        `${n1(cell.roles.review1)} | ${n1(cell.roles.revision)} | ${n1(cell.roles.review2)} | ${n1(cell.roles.other)} | ` +
        `${n1(cell.roles.total)} | ${cell.merged} | ${fmt1(d.workflowMmPerMerged)} | ${fmt1(d.authorMmPerMerged)} | ${fmtPct(d.revisionShare)} |`,
    );
  }
}

function printReviewerMix(title, entries, keyLabel) {
  console.log('');
  console.log(`### ${title}`);
  console.log('');
  console.log(`| ${keyLabel} | review1 runner(s) : n jobs | review2 runner(s) : n jobs |`);
  console.log('|---|---|---|');
  for (const [key, cell] of entries) {
    const r1 = Object.entries(cell.review1Runners).sort((a, b) => b[1] - a[1]);
    const r2 = Object.entries(cell.review2Runners).sort((a, b) => b[1] - a[1]);
    const r1s = r1.map(([r, n]) => `${r}:${n}`).join(', ') || '-';
    const r2s = r2.map(([r, n]) => `${r}:${n}`).join(', ') || '-';
    const displayKey = key.replace(/\|/g, ' / '); // '|' is the internal runner/type join char; unsafe in a Markdown table cell
    console.log(`| ${displayKey} | ${r1s} | ${r2s} |`);
  }
}

console.log(`ledger read: \`${LEDGER_PATH}\``);
console.log(`line count: ${ledger.length}`);
const tss = ledger.map((j) => j.ts).filter(Boolean).sort();
console.log(`ts range: ${tss[0]} .. ${tss[tss.length - 1]}`);

// 1-4: by runner x type
const rtEntries = Object.entries(byRunnerType).sort((a, b) => b[1].n - a[1].n);
printCellTable('BY AUTHOR RUNNER x TYPE (n < 10 is a small cell)', rtEntries);

// 1-4: by runner overall
const rEntries = Object.entries(byRunnerAll)
  .map(([r, c]) => [`${r} (all types)`, c])
  .sort((a, b) => b[1].n - a[1].n);
printCellTable('BY AUTHOR RUNNER, OVERALL (all job types combined)', rEntries);

// 5: reviewer runner mix per (runner, type) cell that has any review1/review2
const rtWithReview = rtEntries.filter(
  ([, cell]) => Object.keys(cell.review1Runners).length || Object.keys(cell.review2Runners).length,
);
printReviewerMix('REVIEWER RUNNER MIX per (author runner, type) cell', rtWithReview, 'author runner / type');

// 5: reviewer runner mix per runner overall
const rAllSorted = Object.entries(byRunnerAll).sort((a, b) => b[1].n - a[1].n);
printReviewerMix('REVIEWER RUNNER MIX per author runner, OVERALL', rAllSorted, 'author runner');

// 6: type=repair only, across runners
const repairEntries = rtEntries.filter(([key]) => key.endsWith('|repair'));
printCellTable('TYPE = repair ONLY, BY AUTHOR RUNNER', repairEntries);

console.log('');
console.log('done.');
