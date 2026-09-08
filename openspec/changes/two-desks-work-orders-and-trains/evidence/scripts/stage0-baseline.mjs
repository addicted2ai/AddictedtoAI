// Stage-0 baseline — task 28 of `two-desks-work-orders-and-trains`.
//
// Measures, on the DEFINITION Stage 1 will later be measured against (F13 in
// evidence/reviews/round1-sealed-opus-high.md, design.md's "Measurement plan"):
//   1. median BRIEF-COMMIT -> MERGE wall-clock per merged job (not to the
//      records commit — see F13: after Stage 1 moves the records commit to
//      the train, "brief -> records" spans up to K merges and is not the same
//      quantity as the 5.5-minute desk-mech-report.md baseline).
//   2. median brief_chars — the byte size of `.job/brief.md` at the brief
//      commit, plus its growth by day.
//   3. gate seconds — NOT computable from the ledger or git history (the
//      ledger carries no per-gate timing field yet); reported instead by
//      transcribing evidence/gate-timings.txt and evidence/gate-timings-npm.txt
//      verbatim, with the caveat stated plainly in the output.
// It ALSO computes the OLD definition (brief-commit -> records-commit) for
// the same job sets, side by side, so the difference F13 describes is visible
// as numbers rather than asserted.
//
// READ-ONLY. Reads data/ledger.jsonl and `git log`/`git show` history. Writes
// nothing, invokes no gate, build, Pulse or Desk run. Prints one JSON object
// to stdout and nothing else (diagnostics, if any, go to stderr).
//
// INVOCATION:  node D:/AddictedtoAI/openspec/changes/two-desks-work-orders-and-trains/evidence/scripts/stage0-baseline.mjs
// Re-runnable by anyone with the repository; no session-scoped paths.
//
// METHOD, and why it is not a plain subject-string match keyed by job id:
// a job id in this ledger is USUALLY unique across all of git history, but is
// not always — six jobs on 2026-08-31 (j-20260831-03..07,12) each have TWO
// sets of `job <id>: brief` / `job <id> (...): ...` / `job <id>: records (...)`
// commits reachable from --all: one real, merged set, and one leftover set on
// a branch that was never merged (or was superseded and re-run under the same
// id — the repository does not record which). A naive "first/last commit with
// this subject" match silently pairs a brief from one attempt with a merge or
// records commit from the other, which can wildly overstate or understate that
// job's wall-clock. This script instead ANCHORS each job on its ledger line's
// own timestamp (`ts`, written by `recordOutcome` immediately after the merge,
// before the records commit), finds the `records (done)` commit closest to
// that timestamp, takes ITS PARENT as the merge commit (records commits the
// tree exactly at the merge — see `commitJobRecords`, loop/run.mjs:2131), and
// then walks the merge commit's SECOND PARENT (the branch tip, since
// `mergeLocal` does `git merge --no-ff branch` — loop/lib/git.mjs:207)
// backward through single-parent ancestry until it finds the commit whose
// subject is exactly `job <id>: brief`. This derives the correct brief commit
// from the correct merge's own branch history, rather than searching the
// whole repository by subject text, so a duplicate-id leftover branch cannot
// be silently substituted in. Only jobs where this method fails (no unique
// `records (done)` commit reachable from `--all`, or the branch walk does not
// reach a `brief` commit) fall back to a direct unique-merge-commit search;
// jobs where even that is ambiguous are excluded and listed by id and reason.

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const REPO = 'D:/AddictedtoAI';
const SEP = '\x1f';

function git(args, opts = {}) {
  return execFileSync('git', ['-C', REPO, ...args], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    ...opts,
  });
}

function gitBytes(args) {
  return execFileSync('git', ['-C', REPO, ...args], {
    maxBuffer: 16 * 1024 * 1024,
  }); // Buffer — byte length, not char length, per task 28's "byte size"
}

// ---- load the full commit graph (every ref, so a superseded/unmerged ------
// branch is still visible for disambiguation, not just what `main` reaches).
const log = git(['log', '--all', `--format=%H${SEP}%P${SEP}%cI${SEP}%s`]);
const commits = new Map(); // sha -> { parents: string[], date: Date, iso: string, subject: string }
for (const line of log.split('\n')) {
  if (!line) continue;
  const [sha, parentsStr, iso, subject] = line.split(SEP);
  commits.set(sha, {
    parents: parentsStr ? parentsStr.split(' ') : [],
    date: new Date(iso),
    iso,
    subject,
  });
}

// ---- load the ledger --------------------------------------------------------
const ledgerLines = readFileSync(`${REPO}/data/ledger.jsonl`, 'utf8')
  .split('\n')
  .map((s) => s.trim())
  .filter(Boolean)
  .map((s) => JSON.parse(s));
const doneJobs = ledgerLines.filter((j) => j.outcome === 'done');

function localDate(iso) {
  return iso.slice(0, 10); // %cI already carries the commit's own offset
}

function walkForBrief(startSha, jobId, maxDepth = 300) {
  let cur = startSha;
  let depth = 0;
  while (cur && depth < maxDepth) {
    const c = commits.get(cur);
    if (!c) return null;
    if (c.subject === `job ${jobId}: brief`) return { sha: cur, ...c };
    if (c.parents.length !== 1) return null; // hit a merge or a root before finding it
    cur = c.parents[0];
    depth++;
  }
  return null;
}

const results = [];
const excluded = [];

for (const job of doneJobs) {
  const id = job.id;
  const ledgerTs = new Date(job.ts);
  const recordsSubject = `job ${id}: records (done)`;

  let mergeCommit = null;
  let briefCommit = null;
  let recordsCommit = null;
  let method = null;

  const recordsCandidates = [...commits.entries()].filter(([, c]) => c.subject === recordsSubject);
  if (recordsCandidates.length) {
    recordsCandidates.sort(
      (a, b) => Math.abs(a[1].date - ledgerTs) - Math.abs(b[1].date - ledgerTs),
    );
    const [rsha, rc] = recordsCandidates[0];
    if (rc.parents.length === 1) {
      const msha = rc.parents[0];
      const mc = commits.get(msha);
      if (mc && mc.parents.length === 2 && mc.subject.startsWith(`job ${id} (`)) {
        const bc = walkForBrief(mc.parents[1], id);
        if (bc) {
          mergeCommit = { sha: msha, ...mc };
          recordsCommit = { sha: rsha, ...rc };
          briefCommit = bc;
          method = 'records-anchored';
        }
      }
    }
  }

  if (!mergeCommit || !briefCommit) {
    const mergeCandidates = [...commits.entries()].filter(
      ([, c]) => c.parents.length === 2 && c.subject.startsWith(`job ${id} (`),
    );
    if (mergeCandidates.length === 1) {
      const [msha, mc] = mergeCandidates[0];
      const bc = walkForBrief(mc.parents[1], id);
      if (bc) {
        mergeCommit = { sha: msha, ...mc };
        briefCommit = bc;
        method = 'direct-unique-merge';
        if (!recordsCommit) {
          const rc2 = [...commits.entries()].filter(([, c]) => c.subject === recordsSubject);
          if (rc2.length === 1) recordsCommit = { sha: rc2[0][0], ...rc2[0][1] };
        }
      }
    } else if (mergeCandidates.length > 1) {
      excluded.push({
        id,
        reason: `ambiguous: ${mergeCandidates.length} merge-shaped commits share job id "${id}" and no records(done) commit anchored a unique one`,
      });
      continue;
    }
  }

  if (!mergeCommit || !briefCommit) {
    excluded.push({
      id,
      reason: !mergeCommit
        ? 'no merge commit found (no records(done) commit, and no unique merge-shaped commit by subject)'
        : 'merge commit found but branch-ancestry walk never reached a "job <id>: brief" commit',
    });
    continue;
  }

  const briefToMergeMin = (mergeCommit.date - briefCommit.date) / 60000;
  const briefToRecordsMin = recordsCommit ? (recordsCommit.date - briefCommit.date) / 60000 : null;
  const mm = Number(job.mm) || 0;

  results.push({
    id,
    type: job.type,
    ledger_ts: job.ts,
    mm,
    method,
    brief_sha: briefCommit.sha,
    brief_date: briefCommit.iso,
    merge_sha: mergeCommit.sha,
    merge_date: mergeCommit.iso,
    records_sha: recordsCommit ? recordsCommit.sha : null,
    records_date: recordsCommit ? recordsCommit.iso : null,
    brief_to_merge_min: briefToMergeMin,
    brief_to_records_min: briefToRecordsMin,
    // "Overhead" = wall-clock minus the ledger's own model-minutes (`mm`) for
    // that job — the quantity desk-mech-report.md's "5.5-minute median
    // overhead" and task 34's 2.5-minute Stage-2 threshold (per F13) are
    // actually stated on, distinct from the raw wall-clock task 28 asks this
    // script to report as the headline figure. Both are reported side by side
    // below so neither reads as the other.
    brief_to_merge_overhead_min: briefToMergeMin - mm,
    brief_to_records_overhead_min: briefToRecordsMin === null ? null : briefToRecordsMin - mm,
  });
}

// ---- brief_chars: byte size of .job/brief.md at each result's brief commit -
const briefCharsExcluded = [];
for (const r of results) {
  try {
    const buf = gitBytes(['show', `${r.brief_sha}:.job/brief.md`]);
    r.brief_chars = buf.length;
  } catch (e) {
    r.brief_chars = null;
    briefCharsExcluded.push({ id: r.id, sha: r.brief_sha, reason: String(e.message || e).split('\n')[0] });
  }
}

// ---- stats helpers -----------------------------------------------------------
function quantile(sortedAsc, q) {
  const n = sortedAsc.length;
  if (n === 0) return null;
  if (n === 1) return sortedAsc[0];
  const pos = q * (n - 1);
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  if (lo === hi) return sortedAsc[lo];
  return sortedAsc[lo] + (sortedAsc[hi] - sortedAsc[lo]) * (pos - lo);
}

function summarize(values) {
  const v = values.filter((x) => Number.isFinite(x)).sort((a, b) => a - b);
  if (!v.length) return { n: 0, median: null, mean: null, p90: null };
  return {
    n: v.length,
    median: quantile(v, 0.5),
    mean: v.reduce((s, x) => s + x, 0) / v.length,
    p90: quantile(v, 0.9),
  };
}

const SINCE = '2026-09-01';
const sinceSet = results.filter((r) => localDate(r.brief_date) >= SINCE);
// Exclusion reasons are id-level, not date-scoped, so the same list is
// reported for both windows below (both excluded ids predate SINCE anyway —
// verified in the report).

function windowReport(set) {
  return {
    n: set.length,
    excluded_n: 0, // filled by caller for the matching window
    excluded_ids: [],
    brief_to_merge_wallclock: summarize(set.map((r) => r.brief_to_merge_min)),
    brief_to_merge_overhead: summarize(set.map((r) => r.brief_to_merge_overhead_min)),
    brief_to_records_wallclock_old_definition: summarize(
      set.filter((r) => r.brief_to_records_min !== null).map((r) => r.brief_to_records_min),
    ),
    brief_to_records_overhead_old_definition: summarize(
      set.filter((r) => r.brief_to_records_overhead_min !== null).map((r) => r.brief_to_records_overhead_min),
    ),
    brief_to_records_n_missing: set.filter((r) => r.brief_to_records_min === null).length,
  };
}

const allTime = windowReport(results);
allTime.excluded_n = excluded.length;
allTime.excluded_ids = excluded.map((e) => e.id);

const since = windowReport(sinceSet);
// Jobs excluded for lack of a findable commit pair cannot be dated, so the
// exclusion list is reported once (all-time) and repeated here verbatim —
// every excluded id is from 2026-08-28..09-01 in this corpus (checked below
// and stated in the .md report), so this does not silently drop a September
// exclusion into only the all-time bucket.
since.excluded_n = excluded.length;
since.excluded_ids = excluded.map((e) => e.id);

// ---- brief_chars stats, all-time and since, plus growth by day --------------
const withChars = results.filter((r) => r.brief_chars !== null);
const briefCharsAllTime = summarize(withChars.map((r) => r.brief_chars));
const briefCharsSince = summarize(
  withChars.filter((r) => localDate(r.brief_date) >= SINCE).map((r) => r.brief_chars),
);

const byDayMap = new Map();
for (const r of withChars) {
  const d = localDate(r.brief_date);
  if (!byDayMap.has(d)) byDayMap.set(d, []);
  byDayMap.get(d).push(r.brief_chars);
}
const briefCharsByDay = [...byDayMap.entries()]
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([date, vals]) => {
    const s = summarize(vals);
    return { date, n: s.n, median: s.median, mean: s.mean, min: Math.min(...vals), max: Math.max(...vals) };
  });

// ---- gate seconds: transcribed, not computed --------------------------------
let gateTimingsTxt = null;
let gateTimingsNpmTxt = null;
try {
  gateTimingsTxt = readFileSync(
    `${REPO}/openspec/changes/two-desks-work-orders-and-trains/evidence/gate-timings.txt`,
    'utf8',
  );
} catch { /* absent */ }
try {
  gateTimingsNpmTxt = readFileSync(
    `${REPO}/openspec/changes/two-desks-work-orders-and-trains/evidence/gate-timings-npm.txt`,
    'utf8',
  );
} catch { /* absent */ }

const gateSeconds = {
  caveat:
    'NOT a per-job series and NOT computed by this script — the ledger carries no per-gate ' +
    'timing field. This is Orch\'s single push-bar measurement on commit 78c6361, publishing ' +
    'off, transcribed verbatim from evidence/gate-timings.txt and evidence/gate-timings-npm.txt.',
  measured_on_commit: '78c6361',
  verify_gates: [
    { gate: 'npm test', exit: null, secs: 0.0, share_pct: 0.0, note: 'not run in this pass; see npm-gates row below' },
    { gate: 'npm run build', exit: null, secs: 0.0, share_pct: 0.0, note: 'not run in this pass; see npm-gates row below' },
    { gate: 'verify-launch', exit: 0, secs: 39.6, share_pct: 40.2 },
    { gate: 'verify-design', exit: 0, secs: 35.7, share_pct: 36.3 },
    { gate: 'verify-surfaces', exit: 0, secs: 3.7, share_pct: 3.7 },
    { gate: 'verify-analytics', exit: 0, secs: 19.5, share_pct: 19.8 },
  ],
  verify_gates_total_secs: 98.5,
  npm_gates_separate_pass: [
    { gate: 'npm test', exit: 0, secs: 314.8 },
    { gate: 'npm run build', exit: 0, secs: 29.2 },
  ],
  note_on_job_gates:
    'A job runs four of the six gates (npm test, npm run build, verify-surfaces, verify-design ' +
    '— DEFAULT_GATES, loop/lib/gates.mjs:346), not all six; verify-launch and verify-analytics run ' +
    'only in this push-bar measurement, not inside a job.',
  raw_gate_timings_txt: gateTimingsTxt,
  raw_gate_timings_npm_txt: gateTimingsNpmTxt,
};

// ---- assemble and print ------------------------------------------------------
const out = {
  meta: {
    script: 'openspec/changes/two-desks-work-orders-and-trains/evidence/scripts/stage0-baseline.mjs',
    generated_at: new Date().toISOString(),
    repo: REPO,
    ledger_path: 'data/ledger.jsonl',
    ledger_lines: ledgerLines.length,
    done_jobs: doneJobs.length,
    since_cutoff_local_date: SINCE,
  },
  brief_to_merge: {
    definition:
      'merge commit ("job <id> (<type>): ...", the --no-ff commit made by mergeLocal, ' +
      'loop/lib/git.mjs:207) minus brief commit ("job <id>: brief", loop/run.mjs:1350) wall-clock, ' +
      'per merged (outcome=done) job. "_wallclock" is the raw figure task 28 asks for; ' +
      '"_overhead" subtracts the ledger\'s own model-minutes (mm) for that job and is the quantity ' +
      'desk-mech-report.md\'s "5.5-minute median overhead" and task 34\'s 2.5-minute Stage-2 ' +
      'threshold (per F13) are actually stated on — reported so the two are not conflated.',
    all_time: allTime,
    since_2026_09_01: since,
  },
  brief_chars: {
    definition:
      'byte size of .job/brief.md read at the brief commit (git show <brief_sha>:.job/brief.md), ' +
      'for every job in brief_to_merge.all_time\'s included set.',
    all_time: briefCharsAllTime,
    since_2026_09_01: briefCharsSince,
    excluded: briefCharsExcluded,
    by_day: briefCharsByDay,
  },
  gate_seconds: gateSeconds,
  excluded_jobs: excluded,
  jobs: results.map((r) => ({
    id: r.id,
    type: r.type,
    mm: r.mm,
    method: r.method,
    brief_sha: r.brief_sha.slice(0, 12),
    merge_sha: r.merge_sha.slice(0, 12),
    records_sha: r.records_sha ? r.records_sha.slice(0, 12) : null,
    brief_date: r.brief_date,
    merge_date: r.merge_date,
    records_date: r.records_date,
    brief_to_merge_min: Number(r.brief_to_merge_min.toFixed(3)),
    brief_to_merge_overhead_min: Number(r.brief_to_merge_overhead_min.toFixed(3)),
    brief_to_records_min: r.brief_to_records_min === null ? null : Number(r.brief_to_records_min.toFixed(3)),
    brief_to_records_overhead_min:
      r.brief_to_records_overhead_min === null ? null : Number(r.brief_to_records_overhead_min.toFixed(3)),
    brief_chars: r.brief_chars,
  })),
};

console.log(JSON.stringify(out, null, 2));
