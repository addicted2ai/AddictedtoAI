#!/usr/bin/env node
// Keep the committed loop-history snapshot honest. Run from the repository
// root:
//
//   node scripts/check-loop-history-snapshot.mjs
//
// The /loop-history page reads app/lib/loop-history.json at build time, so
// the numbers a visitor sees are only as good as that file. This check is
// where the file has to prove itself, every build, on four fronts:
//
// 1. Shape. The snapshot must be a JSON object carrying taken_at, the run
//    counts, the failure rate and the failed-run ids, and its numbers must
//    be internally consistent (attempted = succeeded + failed; the rate
//    must match the counts; failed_run_ids must be exactly the failed
//    runs). A malformed snapshot fails the build rather than rendering a
//    page of nothing.
//
// 2. Staleness. taken_at must be a real timestamp within the process-claim
//    window in policy.yml (staleness_days.process_claim). A claim about
//    this project's own process is the kind that goes stale fastest, and a
//    stale figure on the page would read as current — the window is exactly
//    what the "carries the date it was taken" criterion is for.
//
// 3. Agreement with GitHub. The site is a public repository, so the Actions
//    API answers unauthenticated requests. When it is reachable, this check
//    recomputes the counts from the live API over the runs that had already
//    completed by taken_at — later runs are not the snapshot's business, and
//    filtering on completion time keeps a run that was in progress when the
//    snapshot was taken from false-failing the comparison — and fails if
//    the snapshot disagrees with GitHub in any direction. That includes a
//    snapshot claiming zero failures while the API reports some: "no failed
//    runs" is the easiest lie for this project to tell itself, and it is the
//    one this check exists to catch. When the API is unreachable the live
//    comparison degrades to a loud warning rather than a failure — the
//    shape and staleness checks still run, and the numbers still carry
//    their date — which is the "degrades cleanly when it cannot" clause of
//    the docket item.
//
// 4. Freshness at build time. Front 3 is anchored at taken_at: it proves the
//    snapshot told the truth when it was taken, and cannot see the world
//    move afterwards. rounds_merged only ever grows, and the page publishes
//    it as "Rounds shipped" — a count that reads as current, not as "as of
//    taken_at". Nothing mechanical regenerates the snapshot
//    (scripts/loop-history.mjs --snapshot is invoked by hand; no workflow
//    or prebuild hook calls it), so the build itself must refuse to publish
//    counts that have aged: every count must equal the live API at check
//    time, not just as of taken_at. This is the front the round-116 audit
//    found missing — the page published 60 against a live 64 and stayed
//    green, because taken_at was fresh and the as-of-cutoff numbers agreed
//    with GitHub.
//
// The comparison is over the live API, never over a second copy of the
// numbers: a snapshot regenerated with scripts/loop-history.mjs --snapshot
// always agrees with the API, and a snapshot edited by hand stops agreeing
// the moment the API is checked against it.

import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";
import { load as parseYaml } from "js-yaml";

const root = process.cwd();
const REPO = "addicted2ai/AddictedtoAI";
const WORKFLOW = "loop.yml";
const DAY = 24 * 60 * 60 * 1000;

const policy = parseYaml(fs.readFileSync(path.join(root, "policy.yml"), "utf8"));
const windowDays = policy.staleness_days?.process_claim;
if (!Number.isInteger(windowDays)) {
  console.error(
    "FAIL  policy.yml staleness_days.process_claim is not an integer to enforce"
  );
  process.exit(1);
}

let snapshot;
try {
  snapshot = JSON.parse(
    fs.readFileSync(path.join(root, "app", "lib", "loop-history.json"), "utf8")
  );
} catch (error) {
  console.error(`FAIL  loop-history snapshot is unreadable: ${error.message}`);
  process.exit(1);
}

const problems = [];

function fail(message) {
  problems.push(message);
}

// 1. Shape.
const counts = [
  "runs_attempted",
  "runs_succeeded",
  "runs_failed",
  "rounds_merged",
];
for (const field of [...counts, "taken_at", "failure_rate", "failed_run_ids"]) {
  if (!(field in snapshot)) {
    fail(`missing "${field}" — re-run node scripts/loop-history.mjs --snapshot`);
  }
}
if (problems.length === 0) {
  for (const field of counts) {
    if (!Number.isInteger(snapshot[field]) || snapshot[field] < 0) {
      fail(`${field} is ${snapshot[field]}, expected a non-negative integer`);
    }
  }
  if (
    typeof snapshot.failure_rate !== "number" ||
    !Number.isFinite(snapshot.failure_rate)
  ) {
    fail(`failure_rate is ${snapshot.failure_rate}, expected a number`);
  }
  if (!Array.isArray(snapshot.failed_run_ids)) {
    fail("failed_run_ids is not an array");
  }
  if (
    snapshot.runs_attempted !==
    snapshot.runs_succeeded + snapshot.runs_failed
  ) {
    fail(
      `attempted (${snapshot.runs_attempted}) is not succeeded (${snapshot.runs_succeeded}) + failed (${snapshot.runs_failed})`
    );
  }
  const expectedRate = snapshot.runs_attempted
    ? snapshot.runs_failed / snapshot.runs_attempted
    : 0;
  if (Math.abs(snapshot.failure_rate - expectedRate) > 1e-9) {
    fail(
      `failure_rate is ${snapshot.failure_rate}, expected ${expectedRate} from the counts`
    );
  }
  if (snapshot.failed_run_ids.length !== snapshot.runs_failed) {
    fail(
      `failed_run_ids has ${snapshot.failed_run_ids.length} ids but runs_failed is ${snapshot.runs_failed}`
    );
  }
}

// 2. Staleness.
const takenAt = new Date(snapshot.taken_at);
if (Number.isNaN(takenAt.getTime())) {
  fail(`taken_at "${snapshot.taken_at}" is not a real date`);
} else {
  const ageDays = Math.floor((Date.now() - takenAt.getTime()) / DAY);
  if (ageDays > windowDays) {
    fail(
      `snapshot taken ${snapshot.taken_at} — ${ageDays} days ago, past the ${windowDays}-day process-claim window`
    );
  }
}

// 3. Agreement with the live API. Unauthenticated curl first (the site is a
// public repository, and CI holds no token); `gh` as a fallback for local
// runs. Unreachable degrades to a warning, not a failure.
function fetchJson(args) {
  try {
    return JSON.parse(
      execFileSync("curl", ["-sf", ...args], { encoding: "utf8", maxBuffer: 8e6 })
    );
  } catch {
    return null;
  }
}
function fetchJsonGh(args) {
  try {
    return JSON.parse(
      execFileSync("gh", ["api", ...args], { encoding: "utf8", maxBuffer: 8e6 })
    );
  } catch {
    return null;
  }
}

const apiBase = `https://api.github.com/repos/${REPO}`;
const runsUrl = `${apiBase}/actions/workflows/${WORKFLOW}/runs?per_page=100`;
let runs = null;
let runsRaw = fetchJson([runsUrl]);
if (runsRaw !== null && Array.isArray(runsRaw.workflow_runs)) {
  runs = runsRaw.workflow_runs;
} else {
  runs = fetchJsonGh([runsUrl])?.workflow_runs || null;
}

let liveMerged = null;
if (runs !== null) {
  const pullsUrl = `${apiBase}/pulls?state=closed&per_page=100`;
  let pullsRaw = fetchJson([pullsUrl]);
  if (!Array.isArray(pullsRaw)) pullsRaw = fetchJsonGh([pullsUrl]);
  if (Array.isArray(pullsRaw)) {
    liveMerged = pullsRaw.filter(
      (pr) => pr.merged_at != null && (pr.head?.ref || "").startsWith("loop/")
    );
  }
}

if (runs === null) {
  console.error(
    "WARN  could not reach the Actions API — live agreement not checked this run"
  );
  console.error(
    "      the snapshot still must be well-formed and within its staleness window"
  );
} else if (Number.isNaN(takenAt.getTime())) {
  // Shape already failed on the date; the comparison window is undefined.
} else {
  const cutoff = takenAt.toISOString();
  // Runs that had already completed by the time the snapshot was taken:
  // `updated_at` on a completed run is its completion time, so this excludes
  // both runs that did not exist yet and runs that were still in progress —
  // neither was the snapshot's business, and neither may fail it.
  const relevant = runs.filter(
    (r) => r.status === "completed" && r.updated_at <= cutoff
  );
  const liveFailed = relevant.filter((r) => r.conclusion !== "success");
  const live = {
    runs_attempted: relevant.length,
    runs_succeeded: relevant.length - liveFailed.length,
    runs_failed: liveFailed.length,
    failed_run_ids: liveFailed.map((r) => r.id),
  };

  const mismatches = [];
  for (const field of [
    "runs_attempted",
    "runs_succeeded",
    "runs_failed",
  ]) {
    if (snapshot[field] !== live[field]) {
      mismatches.push(
        `${field}: snapshot says ${snapshot[field]}, the API has ${live[field]}`
      );
    }
  }
  const snapshotIds = new Set(snapshot.failed_run_ids);
  const liveIds = new Set(live.failed_run_ids);
  if (
    snapshotIds.size !== liveIds.size ||
    [...snapshotIds].some((id) => !liveIds.has(id))
  ) {
    mismatches.push(
      `failed_run_ids: snapshot lists ${snapshot.failed_run_ids.join(", ")}, the API has ${live.failed_run_ids.join(", ")}`
    );
  }
  if (snapshot.runs_failed === 0 && live.runs_failed > 0) {
    mismatches.push(
      `the snapshot claims zero failed runs but the API reports ${live.runs_failed} before ${cutoff}`
    );
  }

  if (Array.isArray(liveMerged)) {
    const mergedByCutoff = liveMerged.filter(
      (pr) => pr.merged_at <= cutoff
    ).length;
    if (snapshot.rounds_merged !== mergedByCutoff) {
      mismatches.push(
        `rounds_merged: snapshot says ${snapshot.rounds_merged}, the API has ${mergedByCutoff} merged by ${cutoff}`
      );
    }
  } else {
    console.error(
      "WARN  could not fetch merged pull requests — rounds_merged not checked against the live API"
    );
  }

  // Front 4: the counts must equal the live API at check time, not only as
  // of taken_at. The comparisons above prove the snapshot agreed with
  // GitHub when it was taken; they cannot see a run complete or a pull
  // request merge afterwards, and the page publishes the numbers as
  // current. A snapshot that trails the live count — however fresh its
  // taken_at — fails the build, because the page would otherwise render a
  // count the world has already passed until a round happens to
  // regenerate it by hand.
  const completedNow = runs.filter((r) => r.status === "completed");
  const failedNow = completedNow.filter((r) => r.conclusion !== "success");
  const liveNow = {
    runs_attempted: completedNow.length,
    runs_succeeded: completedNow.length - failedNow.length,
    runs_failed: failedNow.length,
    failed_run_ids: failedNow.map((r) => r.id),
  };
  for (const field of ["runs_attempted", "runs_succeeded", "runs_failed"]) {
    if (snapshot[field] !== liveNow[field]) {
      mismatches.push(
        `${field}: snapshot says ${snapshot[field]}, the live API has ${liveNow[field]} at check time`
      );
    }
  }
  const snapshotFailedIdsNow = new Set(snapshot.failed_run_ids);
  const liveFailedIdsNow = new Set(liveNow.failed_run_ids);
  if (
    snapshotFailedIdsNow.size !== liveFailedIdsNow.size ||
    [...snapshotFailedIdsNow].some((id) => !liveFailedIdsNow.has(id))
  ) {
    mismatches.push(
      `failed_run_ids: snapshot lists ${snapshot.failed_run_ids.join(", ")}, the live API has ${liveNow.failed_run_ids.join(", ")} at check time`
    );
  }
  if (Array.isArray(liveMerged) && snapshot.rounds_merged !== liveMerged.length) {
    mismatches.push(
      `rounds_merged: snapshot says ${snapshot.rounds_merged}, the live API has ${liveMerged.length} merged at check time — the page's counts have aged past the live count`
    );
  }

  if (mismatches.length > 0) {
    fail(`the snapshot disagrees with GitHub's Actions API: ${mismatches.join("; ")}`);
    fail(
      `re-run node scripts/loop-history.mjs --snapshot to take a fresh one — do not edit the numbers by hand`
    );
  }
}

if (problems.length > 0) {
  for (const problem of problems) console.log(`FAIL  ${problem}`);
  console.log(`\n${problems.length} loop-history snapshot problem(s)`);
  process.exit(1);
}

console.log(
  `ok    loop-history snapshot well-formed, within the ${windowDays}-day window`
);
if (runs !== null) {
  console.log(
    `ok    snapshot matches the live API over ${snapshot.runs_attempted} completed run(s) as of ${snapshot.taken_at}`
  );
}
process.exit(0);
