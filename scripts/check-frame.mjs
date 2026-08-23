#!/usr/bin/env node
// Runs every check command documented in FRAME.md and fails, naming the
// fact, when reality diverges. Run from the repository root:
//
//   node scripts/check-frame.mjs
//
// FRAME.md exists because round 8 (loop/meta/frame) found the orchestrator
// asserting false things about who controls what in this project -- never
// caught by review, because review checks work against a brief and the
// brief carried the error. This script is the mechanical half: FRAME.md is
// the source of truth for both the claims AND the commands that check them,
// so a claim cannot quietly drift from what actually still holds.
//
// PARSING, NOT A SEPARATE IMPLEMENTATION. Each fact in FRAME.md is a
// "## N. Title" section carrying a **Status:** line (verified|attested) and,
// for verified facts, a fenced ```sh``` block. This script extracts that
// fenced block and runs it -- it does not maintain its own copy of the
// checks. If FRAME.md's command changes, this script's behaviour changes
// with it, on purpose: two copies of the same check are exactly how this
// repository's other drift bugs happened (see CHANGELOG.md on
// scripts/check-log-pages.mjs and the homepage figure checks).
//
// SELF-VERDICT CONVENTION. Every verified fact's check command is written to
// print exactly one of three tokens as the first word of its output:
//   PASS                  -- the claim still holds
//   FAIL <reason>         -- the claim no longer holds, reason inline
//   UNVERIFIED <reason>   -- the check could not run (no network, no `gh`,
//                            no reachable local service) -- NOT a pass, and
//                            not a build failure either: a check that cannot
//                            run must be reported as unverified, never as
//                            passed, and never silently conflated with a
//                            real failure a maintainer needs to act on.
// A command that produces none of the three (a crash, a syntax error, empty
// output) is treated as FAIL -- an ambiguous result must not read as green,
// the same principle scripts/check-routes.sh's own "0 = 0 must fail" charter
// rule-count check applies.
//
// ATTESTED FACTS ARE NOT EXECUTED. They rest on the maintainer's word and no
// command in this repository can prove or disprove them. Listed on their own
// so a reader sees which is which -- conflating the two is the exact defect
// this file exists to catch.

import fs from "fs";
import { execFileSync } from "child_process";

const FRAME_PATH = "FRAME.md";

let text;
try {
  text = fs.readFileSync(FRAME_PATH, "utf8");
} catch (error) {
  console.log(`FAIL  could not read ${FRAME_PATH}: ${error.message}`);
  process.exit(1);
}

// Split on fact headings ("## N. Title"), keeping the heading with its body.
// The lookahead keeps the split points out of the captured text.
const chunks = text.split(/\n(?=## \d+\. )/).filter((c) => /^## \d+\. /.test(c));

if (chunks.length === 0) {
  console.log(`FAIL  ${FRAME_PATH} contains no "## N. Title" facts to check`);
  process.exit(1);
}

const facts = chunks.map((chunk) => {
  const headingMatch = chunk.match(/^## (\d+)\.\s*(.+)$/m);
  const id = headingMatch ? headingMatch[1] : "?";
  const title = headingMatch ? headingMatch[2].trim() : "(untitled)";

  const statusMatch = chunk.match(/\*\*Status:\*\*\s*(verified|attested)([^\n]*)/i);
  const status = statusMatch ? statusMatch[1].toLowerCase() : null;
  const statusTail = statusMatch ? statusMatch[2].trim() : "";

  const checkMatch = chunk.match(/```(?:sh|bash)?\n([\s\S]*?)\n```/);
  const checkCmd = checkMatch ? checkMatch[1] : null;

  return { id, title, status, statusTail, checkCmd };
});

// A fact declaring itself verified must actually carry a runnable check --
// the inverse of the failure this file exists to prevent would be a fact
// that claims to be checked and isn't.
const malformed = facts.filter((f) => !f.status || (f.status === "verified" && !f.checkCmd));
for (const f of malformed) {
  console.log(`FAIL  fact ${f.id}. ${f.title} -- malformed (missing Status or, for verified, a check block)`);
}

let failures = malformed.length;
let unverified = 0;
const attested = [];

console.log(`FRAME.md check -- ${facts.length} fact(s)\n`);

for (const fact of facts) {
  if (!fact.status) continue; // already reported above
  if (fact.status === "attested") {
    attested.push(fact);
    continue;
  }
  if (!fact.checkCmd) continue; // already reported above

  let verdict;
  try {
    verdict = execFileSync("bash", ["-lc", fact.checkCmd], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  } catch (error) {
    // bash itself missing, or the command threw before it could echo a
    // verdict -- either way this is "could not run", not "ran and failed".
    if (error.code === "ENOENT") {
      verdict = "UNVERIFIED bash not found";
    } else {
      const out = `${error.stdout || ""}${error.stderr || ""}`.trim();
      verdict = out || `UNVERIFIED check command errored: ${error.message}`;
    }
  }

  const firstLine = verdict.split("\n")[0] || "";
  if (firstLine.startsWith("PASS")) {
    console.log(`verified    ${fact.id}. ${fact.title}`);
  } else if (firstLine.startsWith("FAIL")) {
    console.log(`FAIL        ${fact.id}. ${fact.title} -- ${firstLine.slice(4).trim()}`);
    failures++;
  } else if (firstLine.startsWith("UNVERIFIED")) {
    console.log(`unverified  ${fact.id}. ${fact.title} -- ${firstLine.slice(10).trim()}`);
    unverified++;
  } else {
    console.log(`FAIL        ${fact.id}. ${fact.title} -- check produced no PASS/FAIL/UNVERIFIED verdict: ${firstLine.slice(0, 120)}`);
    failures++;
  }
}

if (attested.length > 0) {
  console.log(`\nattested (resting on the maintainer's word; not executed):`);
  for (const fact of attested) {
    console.log(`  ${fact.id}. ${fact.title}${fact.statusTail ? ` -- ${fact.statusTail.replace(/^—\s*/, "")}` : ""}`);
  }
}

console.log();
if (failures > 0) {
  console.log(`${failures} fact(s) failed, ${unverified} unverified, ${attested.length} attested`);
  process.exit(1);
}
if (unverified > 0) {
  console.log(`all checkable facts passed, but ${unverified} check(s) could not run (UNVERIFIED, not passed) -- see above`);
} else {
  console.log(`all ${facts.length - attested.length} checkable facts passed (${attested.length} attested, not executed)`);
}
