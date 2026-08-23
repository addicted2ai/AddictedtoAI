#!/usr/bin/env node
// Runs every check command documented in FRAME.md and fails, naming the
// fact, when reality diverges. Run from the repository root:
//
//   node scripts/check-frame.mjs [path-to-frame-file]
//
// The optional argument defaults to FRAME.md and exists so this parser can
// be tested against a scratch fixture without touching the real file --
// exactly how round 8's own adversarial review found both defects this
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
// EVERY HEADING-LIKE LINE IS PARSED, REPORTED MALFORMED, OR FLAGGED BY AN
// INDEPENDENT COMPLETENESS SCAN -- never silently absorbed with no trace in
// the output. Two rounds of adversarial review found two different ways
// this used to fail, and this comment states plainly what is and is not
// guaranteed now rather than repeating either overclaim.
//
// (1) The first version split the document on the strict pattern "## N. "
//     (period, space) alone, so a heading typo like "## 17: Title" (colon)
//     opened no chunk boundary and the entire fact -- heading, status,
//     check -- was silently absorbed as trailing text inside the *previous*
//     fact's chunk: not reported malformed, not counted, invisible in a
//     summary that still read "all checks passed" against an undercounted
//     total. Fixed by splitting on a broader candidate pattern first
//     ("##" + optional whitespace + digits, any trailing text) so a
//     malformed heading gets its own isolated chunk instead of merging into
//     a neighbour's.
//
// (2) That fix's own "reconciled: N candidates = well-formed + malformed"
//     line was a tautology: every number in it was derived from the SAME
//     candidate pattern, so it could only ever balance against itself -- it
//     reconciled the candidate matcher against its own output, never against
//     the document. A heading the candidate pattern could not see at all
//     (no space after "##", extra space, or one heading level too deep --
//     e.g. "##2.", "##  3.", "### 4.") was invisible to both the parsing
//     AND the check meant to catch the parsing missing something, and the
//     arithmetic balanced perfectly while 3 of 4 facts in a test fixture
//     were silently gone. Fixed below with `looksLikeNumberedHeading`, a
//     second, independent completeness scan that shares no code or pattern
//     with the candidate matcher and is deliberately MORE permissive: any
//     number of leading `#` characters, any whitespace, then a digit. Its
//     count is reconciled against the candidate matcher's own count; a
//     mismatch fails loudly and names the exact line the candidate matcher
//     missed, rather than a summary that can only ever agree with itself.
//
// WHAT THIS STILL DOES NOT COVER: a fact heading written with no leading
// `#` at all, or identified by something other than a leading digit, would
// evade both scans. Stated here rather than left for a third review to find.
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

// The candidate matcher: "##" then any amount of whitespace (including
// none) then digits. Widened from a fixed single space after review found
// "##2." and "##  3." both missed it entirely. Still anchored to exactly
// two "#" characters -- a different heading level is not this matcher's
// job, it is the independent scan's below.
const CANDIDATE_HEADING = /^##\s*(\d+)/;
// Strict shape a real fact heading must have: digits, a literal ". ", title.
// Deliberately NOT widened to match CANDIDATE_HEADING's flexibility --
// "##2." and "##  3." are still malformed, just no longer invisible.
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

// Independent completeness scan. Deliberately not built from
// CANDIDATE_HEADING or any pattern it shares -- a hand-walked character
// scan, so whatever the candidate matcher cannot see, this cannot be blind
// to for the same reason. Any number of leading "#" (any heading level,
// not just two), then any whitespace, then a digit. "## Maintenance" does
// not match (next non-hash, non-space character is a letter); "### 4."
// does (three hashes, a digit) even though CANDIDATE_HEADING above will
// never match it on purpose.
function looksLikeNumberedHeading(line) {
  let i = 0;
  if (line[i] !== "#") return false;
  while (line[i] === "#") i++;
  while (line[i] === " " || line[i] === "\t") i++;
  return line[i] >= "0" && line[i] <= "9";
}

const independentHits = [];
lines.forEach((line, i) => {
  if (looksLikeNumberedHeading(line)) independentHits.push(i);
});

// CANDIDATE_HEADING is strictly narrower than looksLikeNumberedHeading (two
// hashes exactly, vs one-or-more), so boundaries is always a subset of
// independentHits when both scans agree with reality. Anything in
// independentHits but not boundaries is a heading-like line the candidate
// matcher -- and therefore every check below -- never even considered.
const boundarySet = new Set(boundaries);
const missedLines = independentHits.filter((i) => !boundarySet.has(i));

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
      title: headingLine.replace(/^##\s*/, "").trim(),
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
// This partition is an accounting of what the candidate matcher found --
// completeness (whether it found everything) is `missedLines` above, not
// this arithmetic, which cannot by itself prove anything about lines
// outside `boundaries` to begin with.
const malformedHeadings = facts.filter((f) => f.malformedHeading);
const parsed = facts.filter((f) => !f.malformedHeading);
const malformedBody = parsed.filter((f) => !f.status || (f.status === "verified" && !f.checkCmd));
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

if (missedLines.length > 0) {
  console.log(
    `FAIL        completeness: an independent scan found ${missedLines.length} heading-like ` +
      `line(s) the candidate matcher never saw at all:`
  );
  for (const i of missedLines) {
    console.log(`FAIL          line ${i + 1}: ${JSON.stringify(lines[i])}`);
  }
  failures += missedLines.length;
}

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
  `\naccounted for: ${boundaries.length} candidate heading(s) = ${wellFormed.length} well-formed fact(s) + ` +
    `${malformedHeadings.length} malformed heading(s) + ${malformedBody.length} malformed body`
);
console.log(
  `completeness: independent scan found ${independentHits.length} heading-like line(s) total, ` +
    `${missedLines.length} missed by the candidate matcher`
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
