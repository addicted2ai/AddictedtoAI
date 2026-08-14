#!/usr/bin/env node
// Fail the build when a model-retirement-calendar row has gone unverified
// past the staleness window in policy.yml. Run from the repository root:
//
//   node scripts/check-retirement-staleness.mjs
//
// The calendar (app/lib/retirement-dates.js) is the part of this site most
// exposed to quiet drift: it publishes dated shutdowns read off vendor pages,
// and the dates are the product. A row verified last week and one verified
// never look identical without a date, so the `verified` dates are what this
// check keeps honest. It is the same shape as scripts/check-tool-staleness.mjs
// (same block matching, same failure modes), and it runs before every
// `next build` via the prebuild script.
//
// The window is read from policy.yml — staleness_days.retirement_calendar —
// rather than copied, because a threshold restated in a second file drifts
// from the one a run is told to honour. policy.yml is owned by the meta track
// (CHARTER.md rule 11: the run a guardrail blocks is not the run that loosens
// it), and the key does not exist yet; adding it is filed as
// docket/open/2026-08-14-retirement-calendar-staleness-window.md. Until the
// key exists this check enforces an interim window and says loudly, every
// run, that it is doing so — a missing key must not be able to make this
// check pass forever. A key that exists but is not an integer is a real
// error and fails the build, exactly as check-tool-staleness.mjs treats a
// malformed directory_entry.
//
// retirement-dates.js is ESM in a CommonJS project, so instead of importing
// it this script reads the file and matches row blocks — the same approach
// check-tool-staleness.mjs takes with tool-categories.js. The regex fails
// loudly if the file stops matching it, because a parser that silently finds
// nothing is how a guardrail goes green forever.

import fs from "fs";
import path from "path";
import { load as parseYaml } from "js-yaml";

const root = process.cwd();
const DAY = 24 * 60 * 60 * 1000;

// The interim window enforced while policy.yml has no
// staleness_days.retirement_calendar key. Deliberately the same order as the
// site's other fast-staleness windows (demo and process_claim are 30 days);
// it is a stand-in, not a policy decision — the meta item above is where the
// real window gets argued and set.
const INTERIM_WINDOW_DAYS = 30;
const POLICY_KEY = "staleness_days.retirement_calendar";

const policy = parseYaml(fs.readFileSync(path.join(root, "policy.yml"), "utf8"));
let windowDays = policy.staleness_days?.retirement_calendar;

if (windowDays === undefined || windowDays === null) {
  console.error(
    `WARN  policy.yml has no ${POLICY_KEY} to enforce — using the interim ` +
      `${INTERIM_WINDOW_DAYS}-day window, which this check CAN fail on`
  );
  console.error(
    "      the key is owned by the meta track; adding it is filed as " +
      "docket/open/2026-08-14-retirement-calendar-staleness-window.md"
  );
  windowDays = INTERIM_WINDOW_DAYS;
} else if (!Number.isInteger(windowDays)) {
  console.error(`FAIL  policy.yml ${POLICY_KEY} is not an integer to enforce`);
  process.exit(1);
}

const source = fs.readFileSync(
  path.join(root, "app/lib/retirement-dates.js"),
  "utf8"
);

// One match per row: `{ vendor: ..., what: ..., shutdown: ...,
// verified: "YYYY-MM-DD" }` in either array. Rows are one object per line,
// so the block is matched non-greedily to the first closing `},` and parsed
// for fields.
const blocks = [...source.matchAll(/\{\s*vendor:[\s\S]*?\},/g)].map((m) => m[0]);

const problems = [];
const now = Date.now();

function field(block, name) {
  const match = block.match(new RegExp(`${name}:\\s*"([^"]*)"`));
  return match ? match[1] : null;
}

for (const block of blocks) {
  const row = field(block, "what") || field(block, "vendor");
  const verified = field(block, "verified");
  if (!verified) {
    problems.push(`${row}: no verified date — every row must carry one`);
    continue;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(verified) || Number.isNaN(Date.parse(verified))) {
    problems.push(`${row}: verified "${verified}" is not a real date`);
    continue;
  }
  const ageDays = Math.floor((now - Date.parse(verified)) / DAY);
  if (ageDays > windowDays) {
    problems.push(
      `${row}: verified ${verified} — ${ageDays} days ago, past the ${windowDays}-day window`
    );
  }
}

if (blocks.length === 0) {
  console.error("FAIL  no rows matched in app/lib/retirement-dates.js");
  console.error("      the parser regex no longer matches the file — fix it, don't ignore it");
  process.exit(1);
}

if (problems.length > 0) {
  for (const problem of problems) console.log(`FAIL  ${problem}`);
  console.log(
    `\n${problems.length} retirement-calendar row${problems.length === 1 ? "" : "s"} stale or missing a date`
  );
  console.log("      re-verify the vendor's page and update its verified date");
  process.exit(1);
}

console.log(
  `ok    ${blocks.length} retirement-calendar rows verified within the ${windowDays}-day window`
);
