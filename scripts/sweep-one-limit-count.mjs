#!/usr/bin/env node
// Sweep the GitHub API for pull requests that merged over a failing
// `human-owned-paths` check, and write the machine-readable output the
// blog's "one limit" count renders from. Run from the repository root:
//
//   node scripts/sweep-one-limit-count.mjs
//
// The count has drifted three times (two -> five -> seven -> eight), each
// time caught only by a hand-run sequence of `gh` calls that a docket item
// had to demand. This script is that sequence, written down: it enumerates
// every merged pull request, reads each PR's HEAD commit check-runs, and
// writes scripts/one-limit-count-sweep.json — which the page renders from
// and the build guardrail (scripts/check-one-limit-count.mjs) validates.
//
// The two sharp edges the sweep has already hit are encoded here, and are
// stated in the output file, not just this header:
//
//   - Read the PR HEAD commit, never the merge commit: merge commits carry
//     no check-runs, so a sweep that read them would report "no run" for
//     every pull request.
//   - Exclude #23: it created the check and was merged before
//     `human-owned-paths` was in the required list, so its failing run is
//     the exception that makes the claim true, not a step over the gate.
//   - Enumerate every merged PR by paging the REST API, never by one
//     oversized list call: `gh pr list --limit N` caps its result at N,
//     and a bigger N would silently truncate at the next round's count.
//     A page shorter than per_page is the last page, and the sweep fails
//     loudly if it ever stops for any other reason.
//
// Fails loudly when it cannot classify a pull request: a changed API shape,
// a missing field, an incomplete run, or a head commit that shows no run
// for a pull request merged after the check existed. "No run" must never
// masquerade as "passed" — every failure mode below exits 1.

import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";

const REPO = "addicted2ai/AddictedtoAI";
const CHECK = "human-owned-paths";
// The documented exception: #23 created the check and merged before it was
// in the required list. Round 97's changelog entry records why.
const EXCLUDED_PR = 23;

const OUT = path.join(process.cwd(), "scripts", "one-limit-count-sweep.json");

function runGh(args) {
  try {
    const out = execFileSync("gh", args, {
      encoding: "utf8",
      stdio: "pipe",
      // A raw page of pull requests is ~1.8 MB, far beyond Node's 1 MB
      // execFileSync default; a sweep that cannot read a full page whole
      // would fail on every run once the list outgrew the default.
      maxBuffer: 64 * 1024 * 1024,
    });
    return { ok: true, out };
  } catch (error) {
    return { ok: false, out: `${error.stdout || ""}${error.stderr || ""}` || error.message };
  }
}

function fail(message) {
  console.error(`FAIL  ${message}`);
  process.exit(1);
}

// Enumerate every merged pull request by paging the REST API, never by
// asking for a big list in one call. `gh pr list --limit N` caps the
// result at N — the old 100 here — and the CLI's internal pagination is
// not something this script can observe, so a bigger limit would only
// move the ceiling to the next round's bug. Paging the API ourselves
// makes completeness assertable: a page shorter than per_page is the
// last page, and if the loop ever stops for any other reason it has
// truncated the list and must fail, not count.
const PER_PAGE = 100; // the API's documented maximum page size
const MAX_PAGES = 100; // a safety bound against a misbehaving API, not a count cap

function listMergedPullRequests() {
  const all = [];
  let page = 1;
  for (;;) {
    if (page > MAX_PAGES) {
      fail(
        `pagination reached ${MAX_PAGES} pages without a page shorter than ${PER_PAGE} — the list is truncated and cannot be trusted`
      );
    }
    const batch = runGh(["api", `repos/${REPO}/pulls?state=closed&per_page=${PER_PAGE}&page=${page}`]);
    if (!batch.ok) {
      fail(`could not page merged pull requests (${REPO}, page ${page}): ${batch.out.trim()}`);
    }
    let pageData;
    try {
      pageData = JSON.parse(batch.out);
    } catch {
      fail(`page ${page} of pull requests returned unparseable JSON — the CLI or API shape changed`);
    }
    if (!Array.isArray(pageData)) {
      fail(`page ${page} of pull requests did not return an array — the CLI or API shape changed`);
    }
    // The page is measured raw, before filtering: a full API page can
    // contain closed-but-unmerged pull requests, so a completeness check
    // against the merged-only count would stop early on a page that was
    // actually full. The exit condition is the raw page size, the same way
    // any REST client walks a list to its end.
    for (const pr of pageData) {
      if (pr.merged_at == null) continue;
      all.push({ number: pr.number, headRefOid: pr.head?.sha, mergedAt: pr.merged_at });
    }
    if (pageData.length < PER_PAGE) break;
    page++;
  }
  if (all.length === 0) {
    fail(`no merged pull requests found — the sweep has measured nothing`);
  }
  return all;
}

const prs = listMergedPullRequests();

const reads = new Map();
let apiFailures = 0;

for (const pr of prs) {
  const number = pr.number;
  const head = pr.headRefOid;

  if (!Number.isInteger(number) || number < 1) {
    fail(`pull request entry has no valid number field — the JSON shape changed (${JSON.stringify(pr)})`);
  }
  if (!/^[0-9a-f]{40}$/.test(head || "")) {
    fail(`pull request #${number} has no 40-character headRefOid — the JSON shape changed (${JSON.stringify(pr)})`);
  }
  if (typeof pr.mergedAt !== "string") {
    fail(`pull request #${number} has no mergedAt — the JSON shape changed (${JSON.stringify(pr)})`);
  }

  const runs = runGh(["api", `repos/${REPO}/commits/${head}/check-runs`]);
  if (!runs.ok) {
    apiFailures++;
    console.error(`FAIL  could not read check-runs for PR #${number} (head ${head}): ${runs.out.trim()}`);
    continue;
  }

  let body;
  try {
    body = JSON.parse(runs.out);
  } catch {
    fail(`check-runs for PR #${number} (head ${head}) returned unparseable JSON — the API shape changed`);
  }
  if (!Array.isArray(body?.check_runs)) {
    fail(`check-runs for PR #${number} (head ${head}) has no check_runs array — the API shape changed`);
  }
  if (typeof body.total_count !== "number" || body.total_count !== body.check_runs.length) {
    fail(`check-runs for PR #${number} (head ${head}) has total_count ${body.total_count} but ${body.check_runs.length} runs — the API shape changed`);
  }
  for (const run of body.check_runs) {
    if (typeof run?.name !== "string" || typeof run?.status !== "string" || !("conclusion" in run)) {
      fail(`a check-run on PR #${number} (head ${head}) lacks name/status/conclusion — the API shape changed (${JSON.stringify(run)})`);
    }
  }
  reads.set(number, body.check_runs);
}

if (apiFailures > 0) {
  fail(`${apiFailures} check-runs read(s) failed — the sweep is incomplete and cannot be trusted`);
}

// When did the check exist? Not a date any run states: it is the earliest
// merge among the pull requests whose heads carry a human-owned-paths run
// — the check cannot have run on a pull request merged before it existed.
// (Other checks — build-and-audit, Vercel — predate it, which is why the
// boundary is specific to this check's run, not any run.) PRs merged before
// that boundary legitimately have no run on their head (the first 22 do
// not); one merged at or after it must show a run, and a sweep that finds
// none has measured nothing. #23 is the first such PR — it created the
// check, which is why the earliest run and its merge coincide.
const merged = [...prs].sort((a, b) => a.mergedAt.localeCompare(b.mergedAt));
const withRuns = merged.filter((pr) =>
  reads.get(pr.number).some((run) => run.name === CHECK)
);
if (withRuns.length === 0) {
  fail(`no merged pull request head shows a ${CHECK} run — the sweep has measured nothing`);
}
const checkIntroducedAt = withRuns[0].mergedAt;
if (withRuns[0].number !== EXCLUDED_PR) {
  fail(`the first PR whose head carries a ${CHECK} run is #${withRuns[0].number}, not the documented exception #${EXCLUDED_PR} — the exception's premise is gone`);
}

const failing = [];
const passing = [];
const predating = [];

for (const pr of prs) {
  const { number, mergedAt } = pr;
  const checkRun = reads.get(number).find((run) => run.name === CHECK);

  if (!checkRun) {
    if (mergedAt < checkIntroducedAt) {
      predating.push(number);
    } else {
      fail(
        `PR #${number} merged ${mergedAt}, after the ${CHECK} check existed, but its head shows no ${CHECK} run — no run must not masquerade as passed`
      );
    }
    continue;
  }

  if (checkRun.conclusion === null || checkRun.status !== "completed") {
    fail(`PR #${number} has a ${CHECK} run that is not completed — a merged pull request cannot be classified`);
  }

  if (number === EXCLUDED_PR) {
    // The exception's failure is documented in the record; it is not a
    // step over the gate, and it never enters the count.
    continue;
  }
  if (checkRun.conclusion === "failure") {
    failing.push(number);
  } else {
    passing.push(number);
  }
}

failing.sort((a, b) => a - b);

const rules = [
  "Each merged pull request's failure state is read from its HEAD commit, never its merge commit — merge commits carry no check-runs.",
  `Pull request #${EXCLUDED_PR} is excluded: it created the ${CHECK} check and merged before the check was in branch protection's required list. Its failure is the exception that makes the claim true, not a step over the gate.`,
  `A merged pull request whose head shows no ${CHECK} run is recorded as predating the check only if it merged before ${checkIntroducedAt}, when the check's first run appeared; merged after that with no run, the sweep fails.`,
];

const output = {
  count: failing.length,
  failing,
  sweptAt: new Date().toISOString(),
  mergedCount: prs.length,
  passingCount: passing.length,
  predatingCount: predating.length,
  excluded: [EXCLUDED_PR],
  checkIntroducedAt,
  rules,
};

fs.writeFileSync(OUT, `${JSON.stringify(output, null, 2)}\n`);

console.log(JSON.stringify(output, null, 2));
console.log(`\nwrote ${path.relative(process.cwd(), OUT)}`);
console.log(
  `${failing.length} merged-over-${CHECK} pull request(s): ${failing.map((n) => `#${n}`).join(", ") || "none"}`
);
console.log(
  `(${passing.length} passing, ${predating.length} predating the check, 1 excluded: #${EXCLUDED_PR}; ${prs.length} merged in total)`
);
