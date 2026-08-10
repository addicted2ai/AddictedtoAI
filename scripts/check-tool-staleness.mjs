#!/usr/bin/env node
// Fail the build when a Directory entry has gone unverified past the
// staleness window in policy.yml. Run from the repository root:
//
//   node scripts/check-tool-staleness.mjs
//
// The Directory is the part of this site most likely to be quietly wrong: a
// list of third-party tools, none of which owe this site a status update. A
// description verified last week and one verified never look identical without
// a date, so the dates are the product and this check is what keeps them
// honest. It runs before every `next build` via the prebuild script.
//
// The staleness window is read from policy.yml rather than copied, because a
// threshold restated in a second file drifts from the one a run is told to
// honour. preflight.mjs and dispatch.mjs already parse policy.yml the same way.
//
// tool-categories.js is ESM in a CommonJS project, so instead of importing it
// this script reads the file and matches tool blocks. The regex fails loudly
// if the file stops matching it, because a parser that silently finds nothing
// is how a guardrail goes green forever.

import fs from "fs";
import path from "path";
import { load as parseYaml } from "js-yaml";

const root = process.cwd();
const DAY = 24 * 60 * 60 * 1000;

const policy = parseYaml(fs.readFileSync(path.join(root, "policy.yml"), "utf8"));
const windowDays = policy.staleness_days?.directory_entry;
if (!Number.isInteger(windowDays)) {
  console.error("FAIL  policy.yml has no staleness_days.directory_entry to enforce");
  process.exit(1);
}

const source = fs.readFileSync(path.join(root, "app/lib/tool-categories.js"), "utf8");

// One match per tool object: `{ href: ..., name: ..., description: ...,
// verified: "YYYY-MM-DD" }`. Descriptions may wrap lines, so the block is
// matched greedily to the first closing `},` and parsed for fields.
const blocks = [...source.matchAll(/\{\s*href:[\s\S]*?\n\s*\},/g)].map((m) => m[0]);

const problems = [];
const now = Date.now();

function field(block, name) {
  const match = block.match(new RegExp(`${name}:\\s*"([^"]*)"`));
  return match ? match[1] : null;
}

for (const block of blocks) {
  const tool = field(block, "name") || field(block, "href");
  const verified = field(block, "verified");
  if (!verified) {
    problems.push(`${tool}: no verified date — every entry must carry one`);
    continue;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(verified) || Number.isNaN(Date.parse(verified))) {
    problems.push(`${tool}: verified "${verified}" is not a real date`);
    continue;
  }
  const ageDays = Math.floor((now - Date.parse(verified)) / DAY);
  if (ageDays > windowDays) {
    problems.push(
      `${tool}: verified ${verified} — ${ageDays} days ago, past the ${windowDays}-day window`
    );
  }
}

if (blocks.length === 0) {
  console.error("FAIL  no tool entries matched in app/lib/tool-categories.js");
  console.error("      the parser regex no longer matches the file — fix it, don't ignore it");
  process.exit(1);
}

if (problems.length > 0) {
  for (const problem of problems) console.log(`FAIL  ${problem}`);
  console.log(`\n${problems.length} Directory entr${problems.length === 1 ? "y" : "ies"} stale or missing a date`);
  console.log("      re-verify the tool's page and update its verified date");
  process.exit(1);
}

console.log(`ok    ${blocks.length} Directory tools verified within the ${windowDays}-day window`);
