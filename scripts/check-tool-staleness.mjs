#!/usr/bin/env node
// Fail the build when a Directory entry or a retirement-commitment row has
// gone unverified past the staleness window in policy.yml. Run from the
// repository root:
//
//   node scripts/check-tool-staleness.mjs
//
// Two data files, one mechanism:
//   - app/lib/tool-categories.js         — the Directory (round 9)
//   - app/lib/retirement-commitments.js  — the /what-vendors-promise page
//                                          (round 88)
//
// Both publish `verified: YYYY-MM-DD` dates read off third-party pages that
// do not owe this site a status update. A description verified last week and
// one verified never look identical without a date, so the dates are the
// product and this check is what keeps them honest. It runs before every
// `next build` via the prebuild script.
//
// The window is read from policy.yml rather than copied, because a threshold
// restated in a second file drifts from the one a run is told to honour.
// preflight.mjs and dispatch.mjs already parse policy.yml the same way. The
// retirement-commitment rows are judged against the Directory's own window
// (staleness_days.directory_entry, 45 days), not a dedicated key: the page's
// claims are the same staleness class as the Directory's — vendor policy
// text that changes rarely, with the `verified` date as the checkable part —
// and a shared key cannot drift from a dedicated one. A dedicated window,
// with a number nobody has argued for, is filed and argued by the track that
// owns policy.yml if one is wanted; adding the key is not in build scope
// (CHARTER.md rule 11).
//
// A retirement-commitment row whose vendor page was unreachable carries
// `verified: null`. A null row is never treated as fresh:
//   - no `verified` and no `unverifiedSince` record   -> FAIL, naming the row
//     and the remedy: re-verify the vendor's page and set a `verified` date,
//     or record why the row stays unverified by adding a dated
//     `unverifiedSince` and renewing it within the window
//   - `unverifiedSince` not a real date               -> FAIL
//   - `unverifiedSince` past the window               -> FAIL: the record that
//     the row stays unverified has itself gone stale
//   - `unverifiedSince` within the window             -> loud WARN on every
//     run, naming the row, when its record expires, and the remedy
// A recorded null can therefore keep the build green for at most the window,
// never forever — the same trade the retirement-calendar check makes while
// its policy key is absent.
//
// Both data files are ESM in a CommonJS project, so instead of importing them
// this script reads the files and matches blocks. The regexes fail loudly if
// a file stops matching them, because a parser that silently finds nothing is
// how a guardrail goes green forever.

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

const now = Date.now();

// One match per tool object: `{ href: ..., name: ..., description: ...,
// verified: "YYYY-MM-DD" }`. Descriptions may wrap lines, so the block is
// matched greedily to the first closing `},` and parsed for fields.
function blocksOf(file, marker, label) {
  const source = fs.readFileSync(path.join(root, file), "utf8");
  const blocks = [...source.matchAll(new RegExp(`\\{\\s*${marker}[\\s\\S]*?\\n\\s*\\},`, "g"))].map(
    (m) => m[0]
  );
  if (blocks.length === 0) {
    console.error(`FAIL  no ${label} matched in ${file}`);
    console.error("      the parser regex no longer matches the file — fix it, don't ignore it");
    process.exit(1);
  }
  return blocks;
}

function field(block, name) {
  const match = block.match(new RegExp(`${name}:\\s*"([^"]*)"`));
  return match ? match[1] : null;
}

// Judge one row. `recordedNullAllowed` is the retirement-commitments policy:
// a `verified: null` row passes for at most the window, and only with a dated
// `unverifiedSince` record; otherwise it fails now, naming the remedy.
function judgeBlock(block, displayName, recordedNullAllowed) {
  const problems = [];
  const warnings = [];
  const verified = field(block, "verified");
  if (!verified) {
    if (!recordedNullAllowed) {
      problems.push(`${displayName}: no verified date — every entry must carry one`);
      return { problems, warnings };
    }
    const since = field(block, "unverifiedSince");
    if (!since) {
      problems.push(
        `${displayName}: verified: null with no unverifiedSince record — ` +
          "re-verify the vendor's page and set a verified date, or record why " +
          "it stays unverified by adding unverifiedSince: \"YYYY-MM-DD\" and " +
          "renewing it within the window"
      );
      return { problems, warnings };
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(since) || Number.isNaN(Date.parse(since))) {
      problems.push(`${displayName}: unverifiedSince "${since}" is not a real date`);
      return { problems, warnings };
    }
    const ageDays = Math.floor((now - Date.parse(since)) / DAY);
    if (ageDays > windowDays) {
      problems.push(
        `${displayName}: verified: null — the record that it stays unverified ` +
          `(unverifiedSince ${since}) is ${ageDays} days old, past the ` +
          `${windowDays}-day window; re-verify the vendor's page and set a ` +
          "verified date, or renew the record"
      );
    } else {
      warnings.push(
        `${displayName}: unverified — last re-checked ${since} (unverifiedSince); ` +
          `this check will fail once that record is past the ${windowDays}-day ` +
          "window unless the vendor's page is re-verified or the record is renewed"
      );
    }
    return { problems, warnings };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(verified) || Number.isNaN(Date.parse(verified))) {
    problems.push(`${displayName}: verified "${verified}" is not a real date`);
    return { problems, warnings };
  }
  const ageDays = Math.floor((now - Date.parse(verified)) / DAY);
  if (ageDays > windowDays) {
    problems.push(
      `${displayName}: verified ${verified} — ${ageDays} days ago, past the ${windowDays}-day window`
    );
  }
  return { problems, warnings };
}

const problems = [];
const warnings = [];
let unverifiedRecorded = 0;

const toolBlocks = blocksOf("app/lib/tool-categories.js", "href:", "tool entries");
for (const block of toolBlocks) {
  const tool = field(block, "name") || field(block, "href");
  const result = judgeBlock(block, tool, false);
  problems.push(...result.problems);
  warnings.push(...result.warnings);
}

const commitBlocks = blocksOf(
  "app/lib/retirement-commitments.js",
  "vendor:",
  "retirement-commitment rows"
);
for (const block of commitBlocks) {
  const vendor = field(block, "vendor") || field(block, "href");
  const result = judgeBlock(block, vendor, true);
  problems.push(...result.problems);
  warnings.push(...result.warnings);
  if (!field(block, "verified") && result.problems.length === 0) unverifiedRecorded += 1;
}

for (const warning of warnings) {
  console.log(`WARN  ${warning}`);
}

if (problems.length > 0) {
  for (const problem of problems) console.log(`FAIL  ${problem}`);
  console.log(
    `\n${problems.length} Directory entr${problems.length === 1 ? "y" : "ies"} or retirement-commitment row${problems.length === 1 ? "" : "s"} stale or missing a date`
  );
  console.log("      re-verify the source's page and update its verified date");
  process.exit(1);
}

const summary = [
  `${toolBlocks.length} Directory tools and ${commitBlocks.length} retirement-commitment rows`,
  `judged within the ${windowDays}-day window`,
  unverifiedRecorded > 0 ? `(${unverifiedRecorded} unverified, recorded)` : "",
];
console.log(`ok    ${summary.filter(Boolean).join(" ")}`);
