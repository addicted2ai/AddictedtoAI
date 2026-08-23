#!/usr/bin/env node
// Runs every check command documented in FRAME.md and fails, naming the
// fact, when reality diverges. Run from the repository root:
//
//   node scripts/check-frame.mjs [path-to-frame-file]
//
// The optional argument defaults to FRAME.md and exists so this parser can
// be tested against a scratch fixture without touching the real file --
// exactly how three rounds of adversarial review found the defects this
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
// COMPLETENESS IS NOT GUARANTEED BY RECOGNISING HEADING SHAPES. It took
// three rounds of review to learn this, and the header now says so plainly
// rather than repeating a fourth version of the same overclaim:
//
// (1) v1 split the document on the strict pattern "## N. " (period, space)
//     alone, so "## 17: Title" (colon) opened no chunk boundary and the
//     whole fact was silently absorbed into the *previous* fact's chunk --
//     not reported, not counted. Fixed by widening the candidate pattern.
//
// (2) v2's own "reconciled: N = well-formed + malformed" line was a
//     tautology: both sides were derived from the same candidate pattern,
//     so they could only ever agree with each other, never with the
//     document. "##2.", "##  3." and "### 4." were invisible to both the
//     parsing and the check meant to catch the parsing missing something.
//     Fixed with a second scan, `looksLikeNumberedHeading`, sharing no code
//     with the candidate matcher and deliberately more permissive.
//
// (3) v3's two scans -- candidate matcher and the "independent" completeness
//     scan alike -- both anchor at column 0. A heading indented by one to
//     three spaces or a tab is a valid CommonMark ATX heading, not a typo,
//     and it evades both scans identically, because they share the blind
//     spot instead of disagreeing. A fact hidden this way still reported
//     "0 missed".
//
// Three fixes, three classes, each one closing exactly the reproduced case
// and nothing upstream of it. Recognising every way a Markdown heading can
// be malformed is not a bounded problem by incremental rediscovery -- and
// even a fully spec-compliant recogniser would not cover the harder case:
// a fact expressed with no heading markup at all. So this script does not
// keep chasing heading shapes for completeness. It still runs the shape
// scans above, because they give a useful, specific diagnosis when they DO
// catch something malformed -- but the actual completeness guarantee below
// is a declared total, stated in FRAME.md itself and checked against
// whatever the shape scans manage to recognise. That comparison does not
// care why a fact went unrecognised; any mismatch, for any reason, known or
// not yet discovered, fails the build. The bound on this: it holds exactly
// as long as the declared number in FRAME.md is kept in sync with the facts
// actually there, which is a single, human-auditable edit rather than a
// syntax-recognition problem, and if that declaration is itself missing or
// unparseable, this script fails rather than skipping the check silently.
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

// The completeness guarantee. Independent of every scan below on purpose:
// it does not matter whether a fact went unrecognised because of a
// punctuation typo, wrong spacing, the wrong heading level, indentation, no
// heading at all, or a form nobody has found yet -- if the declared count
// and the recognised count disagree, something is wrong, and this does not
// need to know what. `null` if the sentence is missing or does not parse,
// which fails the check below rather than skipping it.
const declaredMatch = text.match(/declares\s+\*{0,2}(\d+)\*{0,2}\s+facts?\s+below/i);
const declaredTotal = declaredMatch ? Number(declaredMatch[1]) : null;

// The candidate matcher: "##" then any amount of whitespace (including
// none) then digits. Widened from a fixed single space after review found
// "##2." and "##  3." both missed it entirely. Still anchored to exactly
// two "#" characters and to column 0 -- a different heading level, or an
// indented one, is not this matcher's job to recognise; see the header.
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

// A second scan, sharing no code or pattern with CANDIDATE_HEADING, and
// deliberately more permissive: any number of leading "#" (any heading
// level, not just two), then any whitespace, then a digit -- still anchored
// at column 0, which is exactly the blind spot the declared-total check
// above exists to catch regardless. Useful for a specific diagnosis
// ("## Maintenance" does not match; "### 4." does) even though it is not
// what completeness rests on any more.
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
// matcher -- and therefore every check below -- never even considered. This
// is a diagnostic, not the completeness guarantee: both scans share the
// column-0 anchor, so an indented heading is invisible to this comparison
// too, and only the declared-total check above catches that case.
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
// it is not proof that nothing was missed; the declared-total check is.
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

// The completeness gate. Checked first and reported loudest: this is the
// one comparison in this script that does not depend on any scan above
// having recognised the right shape.
if (declaredTotal === null) {
  console.log(
    `FAIL        completeness: ${FRAME_PATH} does not declare its fact count ` +
      `("This file declares **N** facts below.") -- cannot verify nothing is missing`
  );
  failures++;
} else if (declaredTotal !== independentHits.length) {
  console.log(
    `FAIL        completeness: ${FRAME_PATH} declares ${declaredTotal} fact(s), but only ` +
      `${independentHits.length} heading-like line(s) were found by any scan -- ` +
      `a fact may be hidden by a heading form no scan here recognises`
  );
  failures++;
}

if (missedLines.length > 0) {
  console.log(
    `FAIL        diagnostic: an independent scan found ${missedLines.length} heading-like ` +
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
  `diagnostic scan: ${independentHits.length} heading-like line(s) total, ` +
    `${missedLines.length} missed by the candidate matcher`
);
console.log(
  `completeness (declared): ${declaredTotal === null ? "not declared" : declaredTotal} declared vs ` +
    `${independentHits.length} recognised by any scan`
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
