#!/usr/bin/env node
// Protect CHARTER.md rule 13a's own text -- the one clause CHARTER.md's
// Amendment section says the loop may not amend under any authorisation. Run
// from the repository root:
//
//   node scripts/check-13a-unchanged.mjs [base-ref]   # default origin/main
//
// `.github/workflows/pr-checks.yml`'s `human-owned-paths` job narrowed off
// CHARTER.md as a whole on 2026-08-22, once rule 13's delegation covered
// ordinary edits to it (CHARTER.md's History, same date). This check is what
// still protects the one clause inside that file which stays reserved: it
// fails if rule 13a's text differs from the base ref's by so much as a byte,
// and passes -- deliberately -- if rule 13a does not exist in the base ref at
// all, because the pull request that first adds it (this one) must not be
// blocked by a check protecting text that isn't there yet.
//
// Rule 13a is not a numbered list item the site's parser recognises --
// app/lib/charter.js's LIST_ITEM_RE only matches purely-numeric `N.` markers,
// so "13a." renders as plain prose, not a styled rule (see CHARTER.md's
// History, 2026-08-22). This check reads the same "13a." marker by regex
// directly against the file text, independent of that renderer.
//
// EXACTLY ONE MARKER IS REQUIRED, deliberately, not just "at least one". The
// first version of this check took the first `/^13a\.\s/` match with
// `Array.prototype.findIndex` and stopped there. That is a real hole, not a
// hypothetical one: a pull request could insert a second, decoy `13a.` line
// -- carrying the base's exact text, so it extracts clean and this check
// passes -- anywhere above the genuine one, and edit the real clause below
// it freely; the span terminator (the next `\d+\.` or `## ` line) does not
// save this, because the decoy's own span simply ends at whatever numbered
// line follows it. Found in review before this shipped, not after.
// `countMarkers` below makes the check fail on zero or more than one marker
// rather than silently taking the first. This is the one rule in the whole
// document that is supposed to survive every other constraint eroding one
// defensible increment at a time (rule 13a's own text: "every other
// constraint here is procedural... a loop that can amend the list of things
// it cannot do would not have a list"), so it is the one place in this
// repository where assuming good faith in a pull request's diff is exactly
// the wrong default.

import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";

const [, , baseRef = "origin/main"] = process.argv;
const root = process.cwd();

function normalize(text) {
  // See the note in check-docket.mjs: CRLF makes a `^` -anchored regex miss
  // every line in a working copy created before .gitattributes forced LF.
  return text.replace(/\r\n/g, "\n");
}

function countMarkers(charterText) {
  return normalize(charterText).split("\n").filter((l) => /^13a\.\s/.test(l)).length;
}

// Rule 13a runs from its own numbered line up to the next numbered rule line
// (14.) or a `## ` section heading, whichever comes first. Only meaningful
// once the caller has confirmed there is exactly one marker to start from.
function extract13a(charterText) {
  const lines = normalize(charterText).split("\n");
  const startIdx = lines.findIndex((l) => /^13a\.\s/.test(l));
  if (startIdx === -1) return null;
  let endIdx = lines.length;
  for (let i = startIdx + 1; i < lines.length; i++) {
    if (/^\d+\.\s/.test(lines[i]) || /^## /.test(lines[i])) {
      endIdx = i;
      break;
    }
  }
  return lines.slice(startIdx, endIdx).join("\n").trim();
}

function readBaseCharter(ref) {
  try {
    return execFileSync("git", ["show", `${ref}:CHARTER.md`], { encoding: "utf8" });
  } catch {
    return null;
  }
}

const baseText = readBaseCharter(baseRef);
if (baseText === null) {
  // A single-branch or shallow clone has no remote ref -- the same condition
  // check-docket.mjs's filing gate already tolerates rather than inventing a
  // baseline or taking the build down with it.
  console.log(
    `WARN  could not read CHARTER.md at ${baseRef} -- skipping (no baseline to compare against)`
  );
  process.exit(0);
}

const baseCount = countMarkers(baseText);
if (baseCount === 0) {
  console.log(`ok    rule 13a does not exist at ${baseRef} -- nothing to protect yet`);
  process.exit(0);
}
if (baseCount > 1) {
  // The base itself is already ambiguous. Not this pull request's doing, and
  // there is no correct one of several to protect -- fail loudly rather than
  // silently pick the first, the same failure mode this check exists to
  // close on the head side.
  console.log(
    `FAIL  ${baseRef}'s CHARTER.md already has ${baseCount} "13a." markers -- ambiguous, cannot establish which is the real rule 13a to protect`
  );
  process.exit(1);
}
const base13a = extract13a(baseText);

const headText = fs.readFileSync(path.join(root, "CHARTER.md"), "utf8");
const headCount = countMarkers(headText);

if (headCount === 0) {
  console.log(
    `FAIL  rule 13a existed at ${baseRef} and is missing from this branch's CHARTER.md`
  );
  console.log("      Only the maintainer may amend rule 13a (CHARTER.md's Amendment section).");
  process.exit(1);
}
if (headCount > 1) {
  console.log(
    `FAIL  this branch's CHARTER.md has ${headCount} "13a." markers; ${baseRef} has exactly 1.`
  );
  console.log(
    "      A decoy marker extracts clean and lets the real clause be edited freely below it --"
  );
  console.log(
    "      exactly one \"13a.\" line is required. Only the maintainer may amend rule 13a."
  );
  process.exit(1);
}

const head13a = extract13a(headText);

if (head13a !== base13a) {
  console.log(
    `FAIL  rule 13a's text differs from ${baseRef}. Only the maintainer may amend rule 13a` +
      " (CHARTER.md's Amendment section)."
  );
  console.log(`      ${baseRef}:`);
  console.log(base13a.split("\n").map((l) => "        " + l).join("\n"));
  console.log("      this branch:");
  console.log(head13a.split("\n").map((l) => "        " + l).join("\n"));
  process.exit(1);
}

console.log(`ok    rule 13a's text is unchanged from ${baseRef}`);
