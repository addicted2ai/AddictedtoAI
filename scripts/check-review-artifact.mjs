#!/usr/bin/env node
// Enforce the review-artifact ordering for `Origin: delegated` rounds.
//
//   node scripts/check-review-artifact.mjs [base-ref]
//
// A round that declares `Origin: delegated` claims "the orchestrating model
// chose, briefed, reviewed and merged it". The review half of that claim has
// to be a real artifact, not an assertion in the changelog: auto-merge can
// perform the merge before any review exists, which is exactly how round 85
// shipped a `delegated` entry whose pull request had zero reviews. So this
// check requires, for a delegated round, a review file at
// `docket/reviews/<sha>.md` that verifiably covers the tree being merged.
//
// The ordering conditions, all required for the artifact that vouches:
//
//   1. a file `docket/reviews/<sha>.md` exists on the branch,
//   2. its `Verdict:` line reads `approve`,
//   3. its `Commit:` SHA is an ancestor of, or equal to, the pull request
//      head, and
//   4. `git diff --name-only <that sha>..HEAD` lists nothing outside
//      `docket/reviews/`.
//
// Condition 4 is the load-bearing one. It is what makes the review true: it
// proves nothing substantive changed after the reviewer looked. A review of
// an earlier commit must never vouch for later code -- that failure happened
// once already, when CI went green on one commit and the corrected commit was
// different. It also resolves the circularity of committing the review: the
// review file changes the head SHA, so the artifact can never name the head
// it lands on. It names what it read, and condition 4 proves the difference
// between what it read and what merged is only the review itself.
//
// A review file that does NOT cover the tree -- because substantive files
// changed after the commit it names -- vouches for nothing and does not
// satisfy the gate. The gate passes only when some covering artifact says
// `approve`; a covering artifact that says `reject` fails the round.
//
// The Origin is read through the same parser the site builds from
// (app/lib/build-log.js) -- never a second parser. A second parser that could
// disagree with the first is a bug this repository has shipped before. The
// newest changelog entry is judged only if the branch actually changed the
// changelog (like `ship` does): a branch that carries no entry of its own has
// no round of its own to judge, and passes.
//
// For any Origin other than `delegated` the check does not apply and passes.
//
// This script is invoked in two places, and it is worth being precise about
// what each invocation is. In CI (.github/workflows/pr-checks.yml, the
// `review-artifact` job) it is a VISIBLE CHECK, not a gate: it is not on the
// branch-protection required list, so GitHub's auto-merge would ignore it. It
// exists to show the failure in the pull request and to be promotable to a
// required check later -- a settings change only the maintainer can make. The
// gate is `round.mjs ship`, which runs this same script with the same base-ref
// before it will arm auto-merge for a delegated round. Same rule, same parser,
// two callers.

import { execFileSync } from "child_process";
import path from "path";

const REVIEWS_DIR = "docket/reviews/";
const REQUIRED_FIELDS = ["Commit", "Verdict", "Reviewer", "Round"];
const baseRef = process.argv[2] || "origin/main";

function git(args) {
  return execFileSync("git", args, { encoding: "utf8", cwd: process.cwd() }).trim();
}
function tryGit(args) {
  try {
    return { ok: true, out: git(args) };
  } catch {
    return { ok: false };
  }
}

let failures = 0;
const ok = (msg) => console.log(`  ok    ${msg}`);
const bad = (msg) => {
  console.log(`  FAIL  ${msg}`);
  failures++;
};

const { getBuildLog } = await import(
  `file://${path.join(process.cwd(), "app", "lib", "build-log.js").replace(/\\/g, "/")}`
);

const head = git(["rev-parse", "HEAD"]);

// The newest changelog entry is the round's own only if the branch changed
// the changelog. A branch that does not is not a round of its own; judging it
// by the previous round's Origin would block or pass the wrong thing.
const logChanged = tryGit(["diff", "--name-only", `${baseRef}...HEAD`, "--", "CHANGELOG.md"]);
if (!logChanged.ok || !logChanged.out.trim()) {
  ok("this branch changes no changelog entry — no round of its own to judge");
  process.exit(0);
}

let entry;
try {
  entry = getBuildLog()[0];
} catch (error) {
  bad(`could not read the build log: ${error.message}`);
}

const origin = entry && entry.declaredOrigin ? entry.origin : "";
if (origin !== "delegated") {
  ok(`Origin is '${origin || "undeclared"}' — this check does not apply`);
  console.log("      a review artifact is required only for a round claiming an AI reviewed it before merge");
  process.exit(failures ? 1 : 0);
}

console.log("Origin: delegated — requiring a review artifact that covers the merged tree");

// A review file is named by the commit it reviewed. Enumerate what the
// branch actually carries rather than trusting a changelog claim.
const reviewFiles = git(["ls-tree", "-r", "--name-only", "HEAD", "--", REVIEWS_DIR])
  .split("\n")
  .filter(Boolean);

if (reviewFiles.length === 0) {
  bad(`no file under ${REVIEWS_DIR} on this branch — a delegated round must carry its review`);
}

function reviewFields(text) {
  const fields = {};
  for (const line of text.split("\n")) {
    for (const name of REQUIRED_FIELDS) {
      if (fields[name] === undefined && line.startsWith(`${name}:`)) {
        fields[name] = line.slice(name.length + 1).trim();
      }
    }
  }
  return fields;
}

// The prose half of the convention: a review must say what it verified and by
// what command. A file holding only the four fields verified nothing, so it is
// not a review.
function reviewProse(text) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !REQUIRED_FIELDS.some((name) => line.startsWith(`${name}:`)));
}

const covering = [];
for (const file of reviewFiles) {
  const name = path.basename(file, ".md");
  console.log(`\n  ${file}`);
  if (!/^[0-9a-f]{40}$/.test(name)) {
    bad(`${file}: filename is not a full 40-character SHA`);
    continue;
  }
  const text = tryGit(["show", `HEAD:${file}`]);
  if (!text.ok) {
    bad(`${file}: could not be read from the branch`);
    continue;
  }
  const fields = reviewFields(text.out);
  const missing = REQUIRED_FIELDS.filter((field) => !fields[field]);
  if (missing.length > 0) {
    bad(`${file}: missing field(s) ${missing.join(", ")} — a review that cannot be parsed is not a review`);
    continue;
  }
  if (fields.Commit !== name) {
    bad(`${file}: Commit '${fields.Commit}' does not match the filename it is stored under`);
    continue;
  }
  if (reviewProse(text.out).length === 0) {
    bad(`${file}: no prose — a review that verified nothing by running anything is not a review`);
    continue;
  }

  // Condition 3: the reviewed commit must be part of the branch's history.
  const ancestor = tryGit(["merge-base", "--is-ancestor", fields.Commit, head]);
  if (!ancestor.ok) {
    bad(`${file}: Commit ${fields.Commit} is not an ancestor of, or equal to, the pull request head`);
    continue;
  }

  // Condition 4: the reviewed commit's tree must differ from HEAD only by
  // the review itself. A review of an earlier commit never vouches for later
  // code, so a review whose tree diverges is stale and covers nothing.
  const diff = tryGit(["diff", "--name-only", `${fields.Commit}..HEAD`]);
  const outside = (diff.ok ? diff.out.split("\n").filter(Boolean) : []).filter(
    (f) => !f.startsWith(REVIEWS_DIR)
  );
  if (outside.length > 0) {
    console.log(`  note  ${file}: does not cover the merged tree (${outside.length} file(s) changed after it)`);
    continue;
  }

  covering.push({ file, fields });
}

console.log("");
if (covering.length === 0) {
  bad("no review artifact covers the merged tree");
  console.log("      a review of an earlier commit never vouches for later code");
} else {
  for (const { file, fields } of covering) {
    const verdict = fields.Verdict.toLowerCase();
    if (verdict !== "approve") {
      bad(`${file}: Verdict is '${fields.Verdict}', not 'approve'`);
    } else {
      ok(`${file} covers the merged tree (${fields.Commit.slice(0, 12)}), Verdict: approve`);
    }
  }
}

console.log("");
if (failures === 0) {
  console.log(`ok    review artifact verified: ${covering.length} covering review(s) approve the merged tree`);
  process.exit(0);
} else {
  console.log(`${failures} problem(s) — a delegated round cannot merge without a covering approve review`);
  process.exit(1);
}
