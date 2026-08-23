#!/usr/bin/env node
// Runs every check command documented in FRAME.md and fails, naming the
// fact, when reality diverges. Run from the repository root:
//
//   node scripts/check-frame.mjs [path-to-frame-file]
//
// The optional argument defaults to FRAME.md and exists so this parser can
// be tested against a scratch fixture without touching the real file --
// exactly how round 8's own adversarial review (docket/reviews/
// 9980ade895f69b88bc25fcac08256736bd931902.md) found the defect this
// section's comments describe.
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
// EVERY CANDIDATE HEADING IS EITHER PARSED OR REPORTED MALFORMED -- NEVER
// SILENTLY DROPPED. The first version of this script split the document on
// the strict pattern "## N. " (period, space) alone, so a heading typo like
// "## 17: Title" (colon) opened no chunk boundary and the entire fact --
// heading, status, check -- was silently absorbed as trailing text inside
// the *previous* fact's chunk: not reported malformed, not counted, invisible
// in a summary that still read "all checks passed" against an undercounted
// total. Adversarial review reproduced this on a four-fact fixture. The fix:
// split on the BROAD candidate pattern "## <digits>..." first -- anything
// that looks like it is trying to be a numbered fact -- so a malformed
// heading gets its own isolated chunk instead of merging into a neighbour's,
// then classify each chunk as well-formed or malformed. The number of
// candidate headings found is printed and is always exactly the number of
// well-formed facts plus the number reported malformed: that arithmetic is
// the property under test, not incidental logging.
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

const FRAME_PATH = process.argv[2] || "FRAME.md";

let text;
try {
  text = fs.readFileSync(FRAME_PATH, "utf8");
} catch (error) {
  console.log(`FAIL  could not read ${FRAME_PATH}: ${error.message}`);
  process.exit(1);
}

// Broad net first: any line that looks like it is attempting a numbered
// fact heading, well-formed or not. A section like "## Maintenance" (no
// leading digits) is not a candidate at all and is correctly ignored -- it
// is not claiming to be a fact.
const CANDIDATE_HEADING = /^## (\d+)\S*/;
// Strict shape a real fact heading must have: digits, a literal ". ", title.
const STRICT_HEADING = /^## (\d+)\.\s+(.+)$/;

const lines = text.split("\n");
const boundaries = [];
lines.forEach((line, i) => {
  if (CANDIDATE_HEADING.test(line)) boundaries.push(i);
});

if (boundaries.length === 0) {
  console.log(`FAIL  ${FRAME_PATH} contains no "## N..." fact heading to check`);
  process.exit(1);
}

const chunks = boundaries.map((start, idx) => {
  const end = idx + 1 < boundaries.length ? boundaries[idx + 1] : lines.length;
  return lines.slice(start, end).join("\n");
});

const facts = chunks.map((chunk) => {
  const headingLine = chunk.split("\n", 1)[0];
  const strict = headingLine.match(STRICT_HEADING);
  const candidateId = (headingLine.match(CANDIDATE_HEADING) || [])[1] || "?";

  if (!strict) {
    return {
      id: candidateId,
      title: headingLine.replace(/^## /, "").trim(),
      malformedHeading: headingLine,
    };
  }

  const statusMatch = chunk.match(/\*\*Status:\*\*\s*(verified|attested)([^\n]*)/i);
  const status = statusMatch ? statusMatch[1].toLowerCase() : null;
  const statusTail = statusMatch ? statusMatch[2].trim() : "";
  const checkMatch = chunk.match(/```(?:sh|bash)?\n([\s\S]*?)\n```/);
  const checkCmd = checkMatch ? checkMatch[1] : null;

  return { id: strict[1], title: strict[2].trim(), status, statusTail, checkCmd };
});

// Every candidate heading lands in exactly one bucket: a malformed heading
// (didn't even parse), a malformed body (parsed, but missing Status or, for
// a verified fact, a check block), or a fact this script actually runs.
// That partition -- not a count printed for its own sake -- is what makes
// "malformed" impossible to launder into "absent".
const malformedHeadings = facts.filter((f) => f.malformedHeading);
const parsed = facts.filter((f) => !f.malformedHeading);
const malformedBody = parsed.filter((f) => !f.status || (f.status === "verified" && !f.checkCmd));
// Well-formed facts this script will actually act on -- executed if
// verified, listed if attested. A subset of `parsed`, never counted
// alongside it a second time: `parsed.length === wellFormed.length +
// malformedBody.length` is the invariant, and boundaries.length ===
// wellFormed.length + malformedHeadings.length + malformedBody.length is
// the one printed below and is what "reconcilable with the document" means
// mechanically, not just as a claim.
const wellFormed = parsed.filter((f) => !malformedBody.includes(f));

// A repeated fact number is its own integrity problem -- CHANGELOG.md's own
// account of scripts/check-13a-unchanged.mjs names the identical shape (a
// decoy marker carrying the real one's number) as something worth guarding
// against on purpose, not assuming away.
const seenIds = new Map();
for (const f of parsed) {
  seenIds.set(f.id, (seenIds.get(f.id) || 0) + 1);
}
const duplicateIds = [...seenIds.entries()].filter(([, n]) => n > 1).map(([id]) => id);

console.log(
  `${FRAME_PATH} check -- ${boundaries.length} candidate heading(s): ` +
    `${wellFormed.length} well-formed, ${malformedHeadings.length} malformed heading(s), ` +
    `${malformedBody.length} malformed body\n`
);

let failures = 0;
let unverified = 0;
const attested = [];

for (const f of malformedHeadings) {
  console.log(`FAIL        ${f.id}. ${f.title} -- malformed heading, does not match "## N. Title": ${JSON.stringify(f.malformedHeading)}`);
  failures++;
}
for (const f of malformedBody) {
  console.log(`FAIL        ${f.id}. ${f.title} -- malformed (missing Status or, for verified, a check block)`);
  failures++;
}
for (const id of duplicateIds) {
  console.log(`FAIL        fact number ${id} is used by more than one heading`);
  failures++;
}

for (const fact of wellFormed) {
  if (fact.status === "attested") {
    attested.push(fact);
    continue;
  }

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

console.log(
  `\nreconciled: ${boundaries.length} candidate heading(s) = ${wellFormed.length} well-formed fact(s) + ` +
    `${malformedHeadings.length} malformed heading(s) + ${malformedBody.length} malformed body`
);

const executed = wellFormed.length - attested.length;
console.log();
if (failures > 0) {
  console.log(`${failures} fact(s) failed or malformed, ${unverified} unverified, ${attested.length} attested`);
  process.exit(1);
}
if (unverified > 0) {
  console.log(`all checkable facts passed, but ${unverified} check(s) could not run (UNVERIFIED, not passed) -- see above`);
} else {
  console.log(`all ${executed} checkable facts passed (${attested.length} attested, not executed)`);
}
