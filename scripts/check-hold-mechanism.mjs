#!/usr/bin/env node
// Protect CHARTER.md rule 13a's stop-mechanism reservation: "docket/HOLD.md
// and the code paths that honour it, so a brake the loop can teach itself to
// ignore is no brake." Run from the repository root:
//
//   node scripts/check-hold-mechanism.mjs [base-ref]   # default origin/main
//
// Two different things are guarded here, because they are two different
// risks and conflating them would make this check either useless or
// unusable:
//
// 1. CLEARING A HOLD, not creating one. A round halting itself when it hits
//    something a human must answer is legitimate and already happens --
//    scripts/orchestrate.sh's own comment records exactly that ("The
//    orchestrator writes HOLD.md when it hits something a human must
//    answer"), and `git log --all --oneline -- docket/HOLD.md` shows ten
//    prior commits doing it, all self-merged by the loop's own account, all
//    legitimate. The reserved act is the opposite one: a diff that makes
//    docket/HOLD.md go from held to not held. "Held" is bash's own `-s`
//    test -- exists and is non-empty, the exact condition
//    scripts/orchestrate.sh checks -- so this check answers the same
//    question the loop itself answers, not a stricter or looser one.
//    Creating a hold, or editing an active hold's stated reason while it
//    stays a hold, is not blocked; a symmetric guard on any touch to the
//    file would fail every legitimate pause and teach people to merge past
//    it, which is exactly the failure `human-owned-paths` was narrowed away
//    from on 2026-08-22 (see CHARTER.md's History, same date).
//
// 2. THE HONOURING CODE ITSELF. Deleting or editing the lines in
//    scripts/orchestrate.sh that read docket/HOLD.md and halt is exactly as
//    effective as clearing the file, and the supervisor having been dead
//    since 2026-08-18 does not make that code safe to weaken -- it makes it
//    dormant, and it is what a restart runs. This does not freeze the whole
//    file, which is ordinary, frequently and legitimately improved
//    scripts/: it freezes the specific `if [ -s docket/HOLD.md ]; then ...
//    fi` fragment, byte for byte, the same narrow-fragment approach
//    scripts/check-13a-unchanged.mjs takes for CHARTER.md rule 13a.
//    scripts/orchestrate-peak.sh mentions docket/HOLD.md only in a comment
//    contrasting its own, separate peak-pricing pause -- it does not itself
//    read the file, so it carries no fragment to protect here.
//
// Both checks fail the same way `human-owned-paths` does: a human merges by
// hand, and that act is the review.

import fs from "fs";
import { execFileSync } from "child_process";

const [, , baseRef = "origin/main"] = process.argv;

try {
  execFileSync("git", ["rev-parse", "--verify", "--quiet", `${baseRef}^{commit}`], {
    stdio: "ignore",
  });
} catch {
  // A single-branch or shallow clone has no remote ref -- the same condition
  // check-docket.mjs's filing gate and check-13a-unchanged.mjs already
  // tolerate rather than inventing a baseline or taking the build down.
  console.log(`WARN  ${baseRef} does not resolve -- skipping (no baseline to compare against)`);
  process.exit(0);
}

function readAt(ref, file) {
  try {
    // docket/HOLD.md legitimately does not exist at most refs -- that is the
    // normal, unheld state, not an error -- so stderr is swallowed here
    // rather than left to print "fatal: path does not exist" on every clean
    // run.
    return execFileSync("git", ["show", `${ref}:${file}`], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    return null; // file does not exist at that ref
  }
}

function readWorking(file) {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return null;
  }
}

// bash's `[ -s FILE ]`: exists and is non-empty. Deliberately not treating a
// file holding only whitespace as "empty" -- that is not what `-s` does, and
// this check exists to answer the same question the loop itself answers.
function isHeld(content) {
  return content !== null && content.length > 0;
}

let failures = 0;

// --- 1. No silent clearing --------------------------------------------------

const baseHold = readAt(baseRef, "docket/HOLD.md");
const headHold = readWorking("docket/HOLD.md");
const baseHeld = isHeld(baseHold);
const headHeld = isHeld(headHold);

if (baseHeld && !headHeld) {
  console.log(`FAIL  docket/HOLD.md was held at ${baseRef} and is not held on this branch.`);
  console.log(
    "      Clearing an active hold is the reserved act under CHARTER.md rule 13a --"
  );
  console.log("      creating one is not. A maintainer merges this by hand.");
  failures++;
} else if (baseHeld && headHeld) {
  console.log(
    "ok    docket/HOLD.md was held and is still held (editing the stated reason is not the reserved act)"
  );
} else if (!baseHeld && headHeld) {
  console.log("ok    docket/HOLD.md was not held and is now held -- creating a hold is not reserved");
} else {
  console.log("ok    docket/HOLD.md was not held at either point");
}

// --- 2. The honouring code itself -------------------------------------------

const FRAGMENT_START = /^\s*if \[ -s docket\/HOLD\.md \]; then\s*$/;
const FRAGMENT_END = /^\s*fi\s*$/;

function extractFragment(text) {
  if (text === null) return null;
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const startIdx = lines.findIndex((l) => FRAGMENT_START.test(l));
  if (startIdx === -1) return null;
  for (let i = startIdx + 1; i < lines.length; i++) {
    if (FRAGMENT_END.test(lines[i])) {
      return lines.slice(startIdx, i + 1).join("\n");
    }
  }
  return null; // opened but never closed within the file -- treated as missing
}

const baseOrchestrate = readAt(baseRef, "scripts/orchestrate.sh");
const headOrchestrate = readWorking("scripts/orchestrate.sh");
const baseFragment = extractFragment(baseOrchestrate);
const headFragment = extractFragment(headOrchestrate);

if (baseFragment === null) {
  console.log(
    `WARN  could not find the docket/HOLD.md honouring block in scripts/orchestrate.sh at ${baseRef} -- skipping that half (nothing to compare against)`
  );
} else if (headFragment === null) {
  console.log(
    "FAIL  scripts/orchestrate.sh no longer carries the docket/HOLD.md honouring block in its expected shape."
  );
  console.log(`      expected (from ${baseRef}):`);
  console.log(baseFragment.split("\n").map((l) => "        " + l).join("\n"));
  failures++;
} else if (headFragment !== baseFragment) {
  console.log(
    `FAIL  scripts/orchestrate.sh's docket/HOLD.md honouring block differs from ${baseRef}.`
  );
  console.log(`      ${baseRef}:`);
  console.log(baseFragment.split("\n").map((l) => "        " + l).join("\n"));
  console.log("      this branch:");
  console.log(headFragment.split("\n").map((l) => "        " + l).join("\n"));
  failures++;
} else {
  console.log("ok    scripts/orchestrate.sh's docket/HOLD.md honouring block is unchanged");
}

if (failures > 0) {
  console.log(`\n${failures} stop-mechanism guardrail failure(s)`);
  process.exit(1);
}
