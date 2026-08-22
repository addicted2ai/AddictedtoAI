#!/usr/bin/env node
// Protect CHARTER.md rule 13a's stop-mechanism reservation, the narrow half
// a PR diff can actually answer: has THIS pull request's own diff cleared an
// active hold. Run from the repository root:
//
//   node scripts/check-hold-mechanism.mjs [base-ref]   # default origin/main
//
// CLEARING A HOLD, not creating one. A round halting itself when it hits
// something a human must answer is legitimate and already happens --
// scripts/orchestrate.sh's own comment records exactly that ("The
// orchestrator writes HOLD.md when it hits something a human must answer"),
// and `git log --all --oneline -- docket/HOLD.md` shows ten prior commits
// doing it, all self-merged by the loop's own account, all legitimate. The
// reserved act is the opposite one: a diff that makes docket/HOLD.md go from
// held to not held. "Held" is bash's own `-s` test -- exists and is
// non-empty, the exact condition scripts/orchestrate.sh checks -- so this
// check answers the same question the loop itself answers, not a stricter or
// looser one. Creating a hold, or editing an active hold's stated reason
// while it stays a hold, is not blocked; a symmetric guard on any touch to
// the file would fail every legitimate pause and teach people to merge past
// it, which is exactly the failure `human-owned-paths` was narrowed away
// from on 2026-08-22 (see CHARTER.md's History, same date).
//
// WHAT THIS CHECK USED TO ALSO DO, AND WHY IT DOES NOT ANY MORE: the first
// version also froze the `if [ -s docket/HOLD.md ]; then ... fi` fragment in
// scripts/orchestrate.sh byte for byte, the same narrow-fragment approach
// scripts/check-13a-unchanged.mjs takes for CHARTER.md rule 13a. Adversarial
// review defeated that half two ways in one pass, neither touching the
// frozen text: (1) `: > docket/HOLD.md` inserted in the loop, above the
// frozen block, truncates the file before `-s` ever tests it; (2) gutting
// halt() (defined elsewhere in the same file, out of the frozen span) --
// the frozen block still calls it, byte for byte, and halting does nothing.
// Freezing a span of text cannot protect a behaviour that depends on the
// code around the span and the function it calls, both unbounded -- the
// defect was in the instrument, not a bug to patch by widening the frozen
// span, since the next bypass is just another line outside whatever got
// frozen this time. The behavioural half now lives in
// scripts/test-orchestrate-hold.mjs, which actually runs the real
// scripts/orchestrate.sh in an isolated sandbox rather than diffing its
// text, wired into scripts/check-routes.sh (and so into `build-and-audit`, a
// required check today -- stronger enforcement than this PR-diff job, which
// is not required yet; see .github/workflows/pr-checks.yml). This file keeps
// only the half a diff can actually answer honestly: whether this pull
// request's own change to docket/HOLD.md clears an active hold. It does not
// and cannot speak to the honouring code at all, and no longer tries to.
//
// This check fails the same way `human-owned-paths` does: a human merges by
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
  console.log(
    "      This check only sees this pull request's own diff to the file; it says"
  );
  console.log(
    "      nothing about whether the code that reads it still does -- see"
  );
  console.log("      scripts/test-orchestrate-hold.mjs for that.");
  process.exit(1);
}

if (baseHeld && headHeld) {
  console.log(
    "ok    docket/HOLD.md was held and is still held (editing the stated reason is not the reserved act)"
  );
} else if (!baseHeld && headHeld) {
  console.log("ok    docket/HOLD.md was not held and is now held -- creating a hold is not reserved");
} else {
  console.log("ok    docket/HOLD.md was not held at either point");
}
