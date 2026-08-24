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
// One other shape is deliberately NOT a failure: an artifact whose `Commit:`
// is not in this branch's history at all. Such an artifact is not evidence
// about this branch -- it is a historical record of a different, already-
// merged tree, most often because the branch it reviewed was squash-merged.
// Squashing discards a branch's individual commits, so the shas its review
// artifacts name never become ancestors of anything merged afterwards, and
// the artifacts of the first squash-merged round would fail every later
// round that carried them. The gate reports them as informational, labelled
// as belonging to an already-merged or squashed tree, and counts them for
// nothing: they can never satisfy the gate, and they are never a problem.
//
// That decision is made from the artifact's FILENAME, before anything else
// and before the file is even read: the filename is the reviewed SHA, so
// ancestry can be settled without trusting the file's contents at all. This
// order is the load-bearing part of the rule. A malformed artifact --
// missing fields, an unreadable file, anything -- that names a commit absent
// from this branch's history is still a record of a tree this branch never
// had, so it is still informational: a malformed record of a destroyed tree
// is a record of a destroyed tree. The reverse does not follow: an artifact
// that names a commit IN this branch's history might be evidence, so it must
// be well-formed to count for anything and is a failure if it is not. The
// field checks are strict for artifacts that could possibly concern this
// branch; the reordering only stops them from running on artifacts that
// cannot. Deciding ancestry from the filename also means the one fact that
// matters about an artifact -- does it concern this branch at all -- never
// depends on what the artifact says.
//
// The Origin is read through the same parser the site builds from
// (app/lib/build-log.js) -- never a second parser. A second parser that could
// disagree with the first is a bug this repository has shipped before. The
// newest changelog entry is judged only if the branch actually changed the
// changelog (like `ship` does): a branch that carries no entry of its own has
// no round of its own to judge, and passes.
//
// For any Origin other than `delegated` the requirement to CARRY an artifact
// does not apply. That exemption is reported as an exemption, never as a pass:
// the `Origin` it turns on is written by the round this check is judging, so
// it is a value the branch granted itself. See
// docket/open/2026-08-17-origin-is-self-declared-in-the-tree-it-gates.md, and
// round 152, which declared `supervised` by accident and read CLEAN and
// mergeable while carrying a `request-changes` artifact.
//
// What the exemption does NOT do is discard a review that already exists. Two
// separate jobs live here, and only the first is exempt-able:
//
//   REQUIRING an artifact -- a delegated round must carry a covering approve.
//   HONOURING one         -- whatever the Origin, and whether or not the branch
//                            carries a changelog entry, a review artifact that
//                            covers the merged tree and does not say `approve`
//                            fails this check.
//
// Honouring costs nothing to a round that no reviewer rejected, and it closes
// the shape round 152 demonstrated: the branch could not have walked past its
// own `request-changes` artifact by writing a different word in its changelog.
// Whether a non-delegated round should be REQUIRED to carry an artifact at all
// is a different and much larger question. Counted through this same parser on
// 2026-08-23 -- getBuildLog().filter((e) => e.declaredOrigin), grouped by
// origin -- 131 entries declare one and 43 of them are not `delegated` (18
// supervised, 11 unsupervised, 14 maintainer), so requiring artifacts for
// `unsupervised` rounds would end unsupervised operation as this project has
// published it.
// That belongs to the maintainer, and the docket item above says so; this
// script does not decide it.
//
// This script is invoked in two places. In CI
// (.github/workflows/pr-checks.yml, the `review-artifact` job) it is a
// REQUIRED status check, and has been since 2026-08-17: the required contexts
// on `main` are `build-and-audit`, `human-owned-paths`, `review-artifact`
// (FRAME.md fact 9, which re-reads them from the API rather than quoting this
// line). This header said the opposite -- "a visible check, not a gate" --
// from 2026-08-13 until round 179 corrected it, describing this project's own
// gate as weaker than it is, which is the same defect as describing it as
// stronger. `scripts/round.mjs ship` runs this same script with the same
// base-ref before it will arm auto-merge, which stops the sanctioned path one
// step earlier. Same rule, same parser, two callers.
//
// What being required does not buy: `enforce_admins` is false (FRAME.md fact
// 8), so the account the loop operates as can merge past a red required check
// by hand.

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
//
// "There is no changelog entry" and "I could not ask whether there is one" are
// different findings, and this check printed the first for both: given a base
// ref it cannot resolve, `git diff` fails, `logChanged.ok` is false, and it
// reported `ok ... no round of its own to judge` and exited 0 -- a REQUIRED
// status check reporting success having evaluated nothing. FRAME.md fact 1
// records the same class of defect reaching CI once already, and states the
// rule it broke: a check must distinguish "this is false" from "I could not
// evaluate this".
const logChanged = tryGit(["diff", "--name-only", `${baseRef}...HEAD`, "--", "CHANGELOG.md"]);
if (!logChanged.ok) {
  bad(`could not diff CHANGELOG.md against '${baseRef}' — this check could not be evaluated`);
  console.log("        That is not a pass. Make the base ref resolvable (git fetch origin main)");
  console.log("        and re-run; a gate that cannot read its own input must not report success.");
  process.exit(1);
}
const declaresRound = Boolean(logChanged.out.trim());

let entry;
if (declaresRound) {
  try {
    entry = getBuildLog()[0];
  } catch (error) {
    bad(`could not read the build log: ${error.message}`);
  }
}

const origin = entry && entry.declaredOrigin ? entry.origin : "";

// Two jobs live here, and only the first can be exempted.
//
//   REQUIRING an artifact -- a delegated round must carry a covering approve.
//   HONOURING one         -- a review artifact that covers the merged tree and
//                            does not say `approve` fails this check whatever
//                            the Origin says, and whether or not the branch
//                            declares a round of its own.
//
// Both exits below used to return before anything looked at docket/reviews/,
// so either one walked a rejecting review straight past the gate. Round 152
// did exactly that: it read CLEAN and mergeable while carrying a covering
// `request-changes` artifact, because `Origin: supervised` returned first.
const required = declaresRound && origin === "delegated";

if (!declaresRound) {
  console.log("  note    this branch changes no changelog entry — it declares no round of its own,");
  console.log("          so there is no Origin here against which to require a review artifact.");
  console.log("          Any review artifact it does carry is still honoured below.");
} else if (!required) {
  console.log(`  EXEMPT  Origin is '${origin || "undeclared"}' — no review artifact is required of it.`);
  console.log("          A review artifact is required only for a round claiming an AI reviewed it");
  console.log("          before merge. This Origin is written by the round this check is judging,");
  console.log("          so it is an exemption the branch granted itself, not one this check");
  console.log("          verified — see");
  console.log("          docket/open/2026-08-17-origin-is-self-declared-in-the-tree-it-gates.md.");
  console.log("          Any review artifact it does carry is still honoured below.");
} else {
  console.log("Origin: delegated — requiring a review artifact that covers the merged tree");
}

// A review file is named by the commit it reviewed. Enumerate what the
// branch actually carries rather than trusting a changelog claim. This runs on
// every path: an exempt branch is not required to carry one, but what it does
// carry is still read.
const reviewFiles = git(["ls-tree", "-r", "--name-only", "HEAD", "--", REVIEWS_DIR])
  .split("\n")
  .filter(Boolean);

if (required && reviewFiles.length === 0) {
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
let informational = 0;
for (const file of reviewFiles) {
  const name = path.basename(file, ".md");
  if (required) console.log(`\n  ${file}`);
  if (!/^[0-9a-f]{40}$/.test(name)) {
    if (required) bad(`${file}: filename is not a full 40-character SHA`);
    continue;
  }

  // Condition 3, decided first and from the filename alone. The filename is
  // the reviewed SHA, so ancestry does not require the file's contents to be
  // trusted, or even read.
  //
  // A commit that is not in this branch's history is not evidence about this
  // branch at all. The artifact still records a review that really happened —
  // it just names a commit that the merge strategy destroyed: a squash merge
  // discards the branch's individual commits, so the shas its review artifacts
  // name never become ancestors of anything merged afterwards. Treating that
  // as a failure would make the gate fail on its own first successful use.
  // That is true whether or not the artifact is well-formed: a malformed
  // record of a destroyed tree is still a record of a destroyed tree, so the
  // ancestry decision runs before the field checks, and a file that fails
  // them is still reported as informational when the commit it is named for
  // is absent from this branch's history. Such an artifact is clearly
  // labelled as belonging to an already-merged or squashed tree and counts
  // for nothing. The reverse is unchanged: an artifact naming a commit that
  // IS in this branch's history must be well-formed to count for anything,
  // and is a failure if it is not.
  const ancestor = tryGit(["merge-base", "--is-ancestor", name, head]);
  if (!ancestor.ok) {
    if (required)
      console.log(
        `  note  ${file}: Commit ${name} is not in this branch's history — it ` +
          "belongs to an already-merged or squashed tree (or names a commit this " +
          "repository does not have), so it is not evidence about this branch; " +
          "informational only, counts for nothing"
      );
    informational++;
    continue;
  }

  const text = tryGit(["show", `HEAD:${file}`]);
  if (!text.ok) {
    if (required) bad(`${file}: could not be read from the branch`);
    continue;
  }
  const fields = reviewFields(text.out);
  const missing = REQUIRED_FIELDS.filter((field) => !fields[field]);
  if (missing.length > 0) {
    if (required)
      bad(`${file}: missing field(s) ${missing.join(", ")} — a review that cannot be parsed is not a review`);
    continue;
  }
  if (fields.Commit !== name) {
    if (required)
      bad(`${file}: Commit '${fields.Commit}' does not match the filename it is stored under`);
    continue;
  }
  if (reviewProse(text.out).length === 0) {
    if (required)
      bad(`${file}: no prose — a review that verified nothing by running anything is not a review`);
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
    if (required)
      console.log(`  note  ${file}: does not cover the merged tree (${outside.length} file(s) changed after it)`);
    continue;
  }

  covering.push({ file, fields });
}

console.log("");

// The half no exemption reaches. Whatever this branch declares about itself, a
// review that covers the tree it is about to merge and does not say `approve`
// is a review that says no.
if (!required) {
  const rejecting = covering.filter(
    (artifact) => artifact.fields.Verdict.toLowerCase() !== "approve"
  );
  for (const { file, fields } of rejecting) {
    bad(
      `${file}: Verdict is '${fields.Verdict}', not 'approve' — it covers the merged tree, ` +
        "so it stands whatever this branch declares about itself"
    );
  }
  if (failures > 0) {
    console.log("        Being exempt from CARRYING a review is not being exempt from one that");
    console.log("        already exists and says no.");
    console.log(`\n${failures} problem(s) — a covering review that does not approve blocks this branch`);
    process.exit(1);
  }
  console.log(
    `ok    no artifact required of this branch, and no covering review rejects it ` +
      `(${covering.length} covering, ${informational} informational)`
  );
  process.exit(0);
}

if (covering.length === 0) {
  bad("no review artifact covers the merged tree");
  if (informational > 0) {
    console.log(`      ${informational} artifact(s) above name commits absent from this branch's`);
    console.log("      history — records of already-merged or squashed trees, not failures,");
    console.log("      and never covering. A covering approve is still required.");
  } else {
    console.log("      a review of an earlier commit never vouches for later code");
  }
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
