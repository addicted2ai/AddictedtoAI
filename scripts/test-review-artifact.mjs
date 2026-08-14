#!/usr/bin/env node
// Regression test for the review-artifact gate, without touching the real
// repository's history. Builds a scratch git repository in the temp
// directory, constructs branches whose review artifacts are real, stale, or
// rejecting, and asserts the checker's verdict on each. The three cases hold
// the three properties the gate must keep, after the squash-merge fix made
// absent-commit artifacts informational:
//
//   1. a branch with a covering `approve` passes,
//   2. a branch with only stale/absent-commit artifacts fails -- for the
//      right reason: no covering approve, not because the stale artifact is
//      a failure,
//   3. a branch whose head is covered by a `reject` fails.
//
//   node scripts/test-review-artifact.mjs
//
// Runs in about a second, needs only git and node. Exit 0 means all three
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
const SCRATCH_CHANGELOG = `# Changelog & Loop Log

Scratch record for the review-artifact regression test.

## Log

### 2026-08-13
Scratch round for the review-artifact regression test. (PR #1)

**1. Scratch**
- Hypothesis: this entry passes the same validation the real changelog does.
- Change: scratch only, lives in the temp directory.

- Origin: delegated
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

function makeRepo() {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "review-artifact-test-"));
  git(repo, ["init", "-q"]);
  git(repo, ["config", "user.name", "test"]);
  git(repo, ["config", "user.email", "test@test"]);
  fs.mkdirSync(path.join(repo, "app", "lib"), { recursive: true });
  fs.copyFileSync(buildLogPath, path.join(repo, "app", "lib", "build-log.js"));
  fs.writeFileSync(path.join(repo, "README.md"), "scratch\n");
  git(repo, ["add", "README.md"]);
  git(repo, ["commit", "-q", "-m", "base"]);
  const base = git(repo, ["rev-parse", "HEAD"]);
  fs.writeFileSync(path.join(repo, "CHANGELOG.md"), SCRATCH_CHANGELOG);
  git(repo, ["add", "CHANGELOG.md"]);
  git(repo, ["commit", "-q", "-m", "round work"]);
  const work = git(repo, ["rev-parse", "HEAD"]);
  return { repo, base, work };
}

function reviewFile(commit, verdict) {
  return (
    `Commit: ${commit}\n` +
    `Verdict: ${verdict}\n` +
    `Reviewer: test\n` +
    `Round: 94\n` +
    `\n` +
    `Reviewed the scratch commit ${commit} in full; the diff from it to HEAD ` +
    `is only this review file.\n`
  );
}

function addReview(repo, commit, verdict) {
  const dir = path.join(repo, "docket", "reviews");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${commit}.md`), reviewFile(commit, verdict));
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

if (failures.length > 0) {
  console.log(`\n${failures.length} review-artifact regression assertion(s) failed`);
  process.exitCode = 1;
} else {
  console.log("all review-artifact regression assertions passed");
}
