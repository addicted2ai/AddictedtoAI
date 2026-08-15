#!/usr/bin/env node
// What the loop has actually done, including the runs that produced nothing.
//
//   node scripts/loop-history.mjs           # summary
//   node scripts/loop-history.mjs --json    # machine-readable
//   node scripts/loop-history.mjs --snapshot [path]
//                                          # write a committed snapshot for
//                                          # the /loop-history page
//
// Needs `gh` authenticated. Reads the Actions API rather than the changelog,
// deliberately: the changelog only contains rounds that finished. A run that
// dies mid-round -- out of turns, timed out, crashed -- writes nothing at all,
// so counting entries in CHANGELOG.md measures successes and calls it the
// total. The site would then publish "N rounds shipped" with no denominator,
// which flatters the work in exactly the way CHARTER.md rule 7 forbids.
//
// GitHub is the only place that records the attempts. This asks it.
//
// `--snapshot` writes the report plus the date it was taken to a JSON file
// (default app/lib/loop-history.json) that the /loop-history page reads at
// build time. The build never calls the API: the snapshot is committed, and
// scripts/check-loop-history-snapshot.mjs keeps it from going stale or
// disagreeing with the live API. Committing the truth here instead of
// fetching it in `next build` is what lets a visitor check the published
// numbers against GitHub without the build holding any credentials.

import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";

const REPO = "addicted2ai/AddictedtoAI";
const WORKFLOW = "loop.yml";
const asJson = process.argv.includes("--json");
const snapshotArg = process.argv.indexOf("--snapshot");
const snapshotPath =
  snapshotArg !== -1
    ? process.argv[snapshotArg + 1] ||
      path.join(process.cwd(), "app", "lib", "loop-history.json")
    : null;

function gh(args) {
  return JSON.parse(execFileSync("gh", args, { encoding: "utf8", maxBuffer: 8e6 }));
}

let runs;
try {
  runs = gh([
    "api",
    `repos/${REPO}/actions/workflows/${WORKFLOW}/runs?per_page=100`,
    "-q",
    ".workflow_runs | map({id, status, conclusion, created_at, event})",
  ]);
} catch (error) {
  console.error(`could not read run history: ${String(error.message).split("\n")[0]}`);
  console.error("(needs `gh` authenticated; this is a report, not a gate)");
  process.exit(1);
}

const finished = runs.filter((r) => r.status === "completed");
const succeeded = finished.filter((r) => r.conclusion === "success");
const failed = finished.filter((r) => r.conclusion !== "success");

// A successful workflow run is not the same as a shipped round: the dispatcher
// can legitimately select nothing, and a track may conclude there is no work.
// Counting merged pull requests separately keeps those apart.
let merged = [];
try {
  merged = gh([
    "api",
    `repos/${REPO}/pulls?state=closed&per_page=100`,
    "-q",
    "map(select(.merged_at != null and (.head.ref | startswith(\"loop/\")))) | map({number, ref: .head.ref, merged_at})",
  ]);
} catch {
  merged = [];
}

const report = {
  runs_attempted: finished.length,
  runs_succeeded: succeeded.length,
  runs_failed: failed.length,
  failure_rate: finished.length ? failed.length / finished.length : 0,
  rounds_merged: merged.length,
  failed_run_ids: failed.map((r) => r.id),
  recent_failures: failed.slice(0, 5).map((r) => ({
    id: r.id,
    when: r.created_at,
    conclusion: r.conclusion,
    url: `https://github.com/${REPO}/actions/runs/${r.id}`,
  })),
};

if (snapshotPath) {
  const snapshot = { ...report, taken_at: new Date().toISOString() };
  fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2) + "\n");
  console.log(`snapshot written to ${snapshotPath}`);
  console.log(`  taken at: ${snapshot.taken_at}`);
  console.log(`  runs attempted / succeeded / failed: ${snapshot.runs_attempted} / ${snapshot.runs_succeeded} / ${snapshot.runs_failed}`);
  process.exit(0);
}

if (asJson) {
  process.stdout.write(JSON.stringify(report, null, 2) + "\n");
} else {
  const pct = (report.failure_rate * 100).toFixed(0);
  console.log(`  runs attempted:  ${report.runs_attempted}`);
  console.log(`  succeeded:       ${report.runs_succeeded}`);
  console.log(`  failed:          ${report.runs_failed}  (${pct}%)`);
  console.log(`  rounds merged:   ${report.rounds_merged}`);
  if (report.runs_attempted > 0 && report.rounds_merged < report.runs_succeeded) {
    console.log();
    console.log("  Note: fewer rounds merged than runs succeeded. That is not");
    console.log("  necessarily wrong -- a run may correctly find nothing to do");
    console.log("  (rule 20) -- but if it keeps happening, check that runs are");
    console.log("  reaching a pull request at all.");
  }
  if (report.recent_failures.length > 0) {
    console.log();
    console.log("  recent failures:");
    for (const f of report.recent_failures) {
      console.log(`    ${f.when}  ${f.conclusion}  ${f.url}`);
    }
  }
}
