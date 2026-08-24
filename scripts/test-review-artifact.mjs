#!/usr/bin/env node
// Regression test for the review-artifact gate, without touching the real
// repository's history. Builds a scratch git repository in the temp
// directory, constructs branches whose review artifacts are real, stale, or
// rejecting, and asserts the checker's verdict on each. The cases hold the
// three properties the gate must keep, after the squash-merge fix made
// absent-commit artifacts informational:
//
//   1. a branch with a covering `approve` passes,
//   2. a branch with only stale/absent-commit artifacts fails -- for the
//      right reason: no covering approve, not because the stale artifact is
//      a failure,
//   3. a branch whose head is covered by a `reject` fails.
//
// Two more cases hold the ordering the checker was changed to, on top of the
// squash-merge fix: ancestry is decided from the artifact's filename before
// its contents are read, so the two rules cannot shadow each other.
//
//   4. an artifact naming a commit absent from this branch's history fails
//      the gate as informational EVEN when it is malformed (missing fields) —
//      a malformed record of a destroyed tree is still a record of a
//      destroyed tree; the gate fails for want of a covering approve, not
//      because of that file,
//   5. an artifact naming a commit that IS in this branch's history and is
//      missing fields still fails — "informational" is not a way for a
//      broken artifact about live code to slip through.
//
// Four more held the two exits round 179's first push closed. The checker had
// two ways to return before it had looked at docket/reviews/ at all — a
// non-`delegated` Origin, and a branch carrying no changelog entry — and a
// third that reported an unevaluable base ref as a pass. A rejecting review
// walked past all three.
//
//   6. a branch declaring `Origin: supervised` while carrying a covering
//      `request-changes` artifact fails (round 152's shape),
//   7. a branch with no changelog entry of its own and a covering `reject`
//      fails for the same reason,
//   8. a base ref that cannot be resolved fails and says so, rather than
//      reporting "no round of its own to judge" — a required status check must
//      distinguish "this is false" from "I could not evaluate this"
//      (FRAME.md fact 1).
//
// Three more hold the fix to the hole adversarial review found in that same
// push, one level deeper than 6 and 7: "covering" is an exact-tree match, so
// ANY later commit — trivial or not — strips a `request-changes` review's
// coverage, and the checker used to read "nothing covers HEAD" as "nothing
// rejects it" and pass. There is no REQUIRING/HONOURING split left to exploit
// that way: every branch now needs a review that covers HEAD exactly and
// approves, full stop.
//
//   9. a branch declaring `Origin: supervised` and carrying no artifact at
//      all now fails too — the old case 9 asserted the opposite; this is its
//      replacement, proving the exemption is actually gone, not just
//      unreachable,
//  10. the same branch with a covering `approve` still passes — a
//      non-delegated round can still merge, it just needs a real approve now,
//  11. the exact case adversarial review used: a covering `request-changes`,
//      then one trivial unrelated follow-up commit. Before this fix that
//      exited 0 ("0 covering, N informational"); it must fail now, the same
//      "no covering approve" failure as never having been reviewed.
//
//   node scripts/test-review-artifact.mjs
//
// Runs in about a second, needs only git and node. Exit 0 means all eleven
// properties held.
//
// The checker is spawned with the scratch repo as its working directory, so
// every `git` call it makes and the build-log it imports resolve against the
// scratch tree, never this repository. The scratch CHANGELOG.md must pass
// the same validation the real one does, or the checker fails before the
// scenario it is testing.

import { spawnSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";

const checkerPath = fileURLToPath(new URL("./check-review-artifact.mjs", import.meta.url));
const buildLogPath = fileURLToPath(new URL("../app/lib/build-log.js", import.meta.url));
const failures = [];

// A valid entry for the real parser: Origin: delegated, with the fields
// validateEntries demands. The scratch round's PR anchor is a placeholder
// number that cannot collide with anything in the scratch repo. The file
// needs the same `## Log` section seam the real changelog has, or the parser
// finds no sections at all.
const scratchChangelog = (origin) => `# Changelog & Loop Log

Scratch record for the review-artifact regression test.

## Log

### 2026-08-13
Scratch round for the review-artifact regression test. (PR #1)

**1. Scratch**
- Hypothesis: this entry passes the same validation the real changelog does.
- Change: scratch only, lives in the temp directory.

- Origin: ${origin}
- Track: meta
- Agent: test
- Guardrails: none
- Result: not yet measured

`;

function git(repo, args) {
  const result = spawnSync("git", args, { cwd: repo, encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`git ${args.join(" ")} failed: ${result.stderr || result.stdout}`);
  }
  return result.stdout.trim();
}

// `changelogAtBase` puts CHANGELOG.md in the base commit instead of the work
// commit, so the work commit changes substantive files and leaves the
// changelog alone — a branch with no round of its own to judge.
function makeRepo({ origin = "delegated", changelogAtBase = false } = {}) {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "review-artifact-test-"));
  git(repo, ["init", "-q"]);
  git(repo, ["config", "user.name", "test"]);
  git(repo, ["config", "user.email", "test@test"]);
  fs.mkdirSync(path.join(repo, "app", "lib"), { recursive: true });
  fs.copyFileSync(buildLogPath, path.join(repo, "app", "lib", "build-log.js"));
  fs.writeFileSync(path.join(repo, "README.md"), "scratch\n");
  git(repo, ["add", "README.md"]);
  if (changelogAtBase) {
    fs.writeFileSync(path.join(repo, "CHANGELOG.md"), scratchChangelog(origin));
    git(repo, ["add", "CHANGELOG.md"]);
  }
  git(repo, ["commit", "-q", "-m", "base"]);
  const base = git(repo, ["rev-parse", "HEAD"]);
  if (changelogAtBase) {
    fs.writeFileSync(path.join(repo, "app", "lib", "shipped.js"), "export const x = 1;\n");
    git(repo, ["add", "app/lib/shipped.js"]);
  } else {
    fs.writeFileSync(path.join(repo, "CHANGELOG.md"), scratchChangelog(origin));
    git(repo, ["add", "CHANGELOG.md"]);
  }
  git(repo, ["commit", "-q", "-m", "round work"]);
  const work = git(repo, ["rev-parse", "HEAD"]);
  return { repo, base, work };
}

function reviewFile(commit, verdict, minimal = false) {
  return (
    `Commit: ${commit}\n` +
    `Verdict: ${verdict}\n` +
    (minimal ? "" : `Reviewer: test\nRound: 94\n`) +
    `\n` +
    `Reviewed the scratch commit ${commit} in full; the diff from it to HEAD ` +
    `is only this review file.\n`
  );
}

function addReview(repo, commit, verdict, minimal = false) {
  const dir = path.join(repo, "docket", "reviews");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${commit}.md`), reviewFile(commit, verdict, minimal));
  git(repo, ["add", "docket/reviews"]);
  git(repo, ["commit", "-q", "-m", "review"]);
}

function runChecker(repo, base) {
  return spawnSync(process.execPath, [checkerPath, base], {
    cwd: repo,
    encoding: "utf8",
  });
}

// Case 1: a covering approve passes. The work commit is an ancestor of the
// head, and the only change after it is the review file itself.
{
  const { repo, base, work } = makeRepo();
  try {
    addReview(repo, work, "approve");
    const result = runChecker(repo, base);
    if (
      result.status === 0 &&
      /ok\s+review artifact verified: 1 covering review\(s\) approve/.test(result.stdout)
    ) {
      console.log("ok    covering approve passes (exit 0)");
    } else {
      console.log(`FAIL  covering approve should pass; exit ${result.status}`);
      console.log(result.stdout.trim());
      failures.push("covering approve did not pass");
    }
  } finally {
    fs.rmSync(repo, { recursive: true, force: true });
  }
}

// Case 2: only stale artifacts. The review file names a commit that exists
// in the object store (an orphan commit, the same shape a squash merge
// leaves behind) but is not an ancestor of the head. The gate must fail --
// no covering approve -- and the stale artifact must be a note, not a
// failure.
{
  const { repo, base } = makeRepo();
  try {
    const orphan = git(repo, ["commit-tree", "HEAD^{tree}", "-m", "orphaned by squash"]);
    addReview(repo, orphan, "approve");
    const result = runChecker(repo, base);
    if (result.status !== 1) {
      console.log(`FAIL  stale-only branch should exit 1; exit ${result.status}`);
      failures.push("stale-only branch did not fail");
    } else if (!result.stdout.includes("no review artifact covers the merged tree")) {
      console.log("FAIL  stale-only branch failed for the wrong reason:");
      console.log(result.stdout.trim());
      failures.push("stale-only branch failed for the wrong reason");
    } else if (result.stdout.includes("FAIL  docket/reviews/")) {
      console.log("FAIL  a stale artifact was reported as a failure, not informational:");
      console.log(result.stdout.trim());
      failures.push("stale artifact counted as a problem");
    } else {
      console.log("ok    stale-only branch fails: no covering approve, artifact is a note");
    }
  } finally {
    fs.rmSync(repo, { recursive: true, force: true });
  }
}

// Case 3: a covering reject must fail, and a stale approve must not override
// it. Both artifacts are present; the one that covers the head says reject.
{
  const { repo, base, work } = makeRepo();
  try {
    const orphan = git(repo, ["commit-tree", "HEAD^{tree}", "-m", "orphaned by squash"]);
    addReview(repo, orphan, "approve");
    addReview(repo, work, "reject");
    const result = runChecker(repo, base);
    if (result.status === 1 && result.stdout.includes("Verdict is 'reject'")) {
      console.log("ok    covering reject fails; stale approve does not override it");
    } else {
      console.log(`FAIL  covering reject should fail; exit ${result.status}`);
      console.log(result.stdout.trim());
      failures.push("covering reject did not fail");
    }
  } finally {
    fs.rmSync(repo, { recursive: true, force: true });
  }
}

// Case 4: an artifact naming a commit absent from this branch's history AND
// missing the Reviewer and Round fields. The ordering the checker was
// changed to must decide ancestry before field validation: a malformed
// record of a destroyed tree is still a record of a destroyed tree, so the
// artifact is informational and the gate fails for want of a covering
// approve -- never because of this file.
{
  const { repo, base } = makeRepo();
  try {
    const orphan = git(repo, ["commit-tree", "HEAD^{tree}", "-m", "orphaned by squash"]);
    addReview(repo, orphan, "approve", true);
    const result = runChecker(repo, base);
    if (result.status !== 1) {
      console.log(`FAIL  absent+malformed branch should exit 1; exit ${result.status}`);
      failures.push("absent+malformed branch did not fail");
    } else if (!result.stdout.includes("no review artifact covers the merged tree")) {
      console.log("FAIL  absent+malformed branch failed for the wrong reason:");
      console.log(result.stdout.trim());
      failures.push("absent+malformed branch failed for the wrong reason");
    } else if (result.stdout.includes(`FAIL  docket/reviews/${orphan}.md`)) {
      console.log("FAIL  a malformed artifact about an absent commit was reported as a failure:");
      console.log(result.stdout.trim());
      failures.push("malformed absent-commit artifact counted as a problem");
    } else if (!result.stdout.includes("not in this branch's history")) {
      console.log("FAIL  the malformed absent-commit artifact was not reported as informational:");
      console.log(result.stdout.trim());
      failures.push("malformed absent-commit artifact not reported as a note");
    } else {
      console.log("ok    absent+malformed artifact is a note; gate fails for no covering approve");
    }
  } finally {
    fs.rmSync(repo, { recursive: true, force: true });
  }
}

// Case 5: an artifact naming a commit that IS in this branch's history but
// is missing fields must fail. The reordering must not make "informational"
// a way for a broken artifact about live code to slip through: this artifact
// could be evidence about this branch, and it cannot be parsed, so it is a
// failure.
{
  const { repo, base, work } = makeRepo();
  try {
    addReview(repo, work, "approve", true);
    const result = runChecker(repo, base);
    if (
      result.status === 1 &&
      result.stdout.includes("missing field(s) Reviewer, Round") &&
      !result.stdout.includes("review artifact verified")
    ) {
      console.log("ok    malformed artifact about a present commit fails");
    } else {
      console.log(`FAIL  malformed artifact about a present commit should fail; exit ${result.status}`);
      console.log(result.stdout.trim());
      failures.push("malformed present-commit artifact did not fail");
    }
  } finally {
    fs.rmSync(repo, { recursive: true, force: true });
  }
}

// Case 6: round 152's shape. The branch declares `Origin: supervised` and
// carries a covering `request-changes` artifact. Before round 179's first
// push this exited 0 with "Origin is 'supervised' — this check does not
// apply", printed before anything read docket/reviews/: a required status
// check reporting green over a review that said no.
{
  const { repo, base, work } = makeRepo({ origin: "supervised" });
  try {
    addReview(repo, work, "request-changes");
    const result = runChecker(repo, base);
    if (result.status === 1 && result.stdout.includes("Verdict is 'request-changes', not 'approve'")) {
      console.log("ok    a non-delegated Origin does not exempt a branch from a covering rejection");
    } else {
      console.log(`FAIL  supervised + covering request-changes should fail; exit ${result.status}`);
      console.log(result.stdout.trim());
      failures.push("self-declared Origin walked past a covering rejection");
    }
  } finally {
    fs.rmSync(repo, { recursive: true, force: true });
  }
}

// Case 7: the other exit. The branch carries no changelog entry of its own, so
// there is no Origin here to require anything against -- and a covering
// `reject` must still stand. Before round 179 this exited 0 too.
{
  const { repo, base, work } = makeRepo({ changelogAtBase: true });
  try {
    addReview(repo, work, "reject");
    const result = runChecker(repo, base);
    if (result.status === 1 && result.stdout.includes("Verdict is 'reject'")) {
      console.log("ok    a branch with no changelog entry does not walk past a covering rejection");
    } else {
      console.log(`FAIL  no-entry branch + covering reject should fail; exit ${result.status}`);
      console.log(result.stdout.trim());
      failures.push("no-changelog-entry branch walked past a covering rejection");
    }
  } finally {
    fs.rmSync(repo, { recursive: true, force: true });
  }
}

// Case 8: an unevaluable base ref is not a pass. `git diff <bad-ref>...HEAD`
// fails, and the checker used to fold that into the same branch as "no
// changelog entry" and report `ok ... no round of its own to judge`. FRAME.md
// fact 1 records this class of defect reaching CI once already: a check must
// distinguish "this is false" from "I could not evaluate this".
{
  const { repo, work } = makeRepo();
  try {
    addReview(repo, work, "approve");
    const result = runChecker(repo, "refs/heads/no-such-base-ref");
    if (
      result.status === 1 &&
      result.stdout.includes("could not be evaluated") &&
      !result.stdout.includes("no round of its own to judge")
    ) {
      console.log("ok    an unresolvable base ref fails as unevaluable, not as a pass");
    } else {
      console.log(`FAIL  unresolvable base ref should fail as unevaluable; exit ${result.status}`);
      console.log(result.stdout.trim());
      failures.push("unresolvable base ref reported as a pass");
    }
  } finally {
    fs.rmSync(repo, { recursive: true, force: true });
  }
}

// Case 9: a non-delegated round carrying no artifact at all now fails too.
// Through round 179's first push this passed as the negative control keeping
// 6 and 7 from becoming "every round must carry a review" — but the fourth
// hole showed that same exemption is exactly what let a trivial commit
// launder a real rejection (case 11 below). Closed by removing the exemption
// rather than patching around it, so this case now asserts the opposite of
// what it used to.
{
  const { repo, base } = makeRepo({ origin: "supervised" });
  try {
    const result = runChecker(repo, base);
    if (result.status === 1 && result.stdout.includes("no file under docket/reviews/")) {
      console.log("ok    a non-delegated round carrying no artifact now fails, not exempted");
    } else {
      console.log(`FAIL  supervised + no artifact should now fail; exit ${result.status}`);
      console.log(result.stdout.trim());
      failures.push("a non-delegated round with no artifact still passed");
    }
  } finally {
    fs.rmSync(repo, { recursive: true, force: true });
  }
}

// Case 10: the same non-delegated branch still passes with a genuine covering
// approve. Closing case 9's old exemption must not turn into "no round can
// ever merge without Origin: delegated" — a non-delegated round can still
// merge, it now just needs the same real approve a delegated one does.
{
  const { repo, base, work } = makeRepo({ origin: "supervised" });
  try {
    addReview(repo, work, "approve");
    const result = runChecker(repo, base);
    if (
      result.status === 0 &&
      /ok\s+review artifact verified: 1 covering review\(s\) approve/.test(result.stdout)
    ) {
      console.log("ok    a non-delegated round with a genuine covering approve still passes");
    } else {
      console.log(`FAIL  supervised + covering approve should pass; exit ${result.status}`);
      console.log(result.stdout.trim());
      failures.push("a non-delegated round with a covering approve did not pass");
    }
  } finally {
    fs.rmSync(repo, { recursive: true, force: true });
  }
}

// Case 11: the exact hole adversarial review found, proved with hand-built
// commits — the reason this round exists. A covering `request-changes`
// review, then one trivial follow-up commit unrelated to it: the review
// stops covering HEAD (condition 4 is exact-tree, correctly), but before this
// fix the checker read "zero covering reviews of any verdict" as "nothing
// rejects this" and passed with "0 covering, N informational" — the reject
// laundered by a no-op commit, no new review required. It must fail now, the
// same "no covering approve" failure as a branch that was never reviewed.
{
  const { repo, base, work } = makeRepo({ origin: "supervised" });
  try {
    addReview(repo, work, "request-changes");
    fs.writeFileSync(path.join(repo, "trivial.txt"), "noop\n");
    git(repo, ["add", "trivial.txt"]);
    git(repo, ["commit", "-q", "-m", "trivial follow-up, unrelated to the review"]);
    const result = runChecker(repo, base);
    if (result.status === 1 && result.stdout.includes("no review artifact covers the merged tree")) {
      console.log("ok    a trivial follow-up commit cannot launder a covering rejection into a pass");
    } else {
      console.log(`FAIL  reject + trivial follow-up should still fail; exit ${result.status}`);
      console.log(result.stdout.trim());
      failures.push("a trivial follow-up commit cleared a covering rejection");
    }
  } finally {
    fs.rmSync(repo, { recursive: true, force: true });
  }
}

if (failures.length > 0) {
  console.log(`\n${failures.length} review-artifact regression assertion(s) failed`);
  process.exitCode = 1;
} else {
  console.log("all review-artifact regression assertions passed");
}
