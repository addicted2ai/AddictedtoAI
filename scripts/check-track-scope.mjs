#!/usr/bin/env node
// Enforce which files a track may change. Run from the repository root:
//
//   node scripts/check-track-scope.mjs <base-ref> <branch-name>
//   node scripts/check-track-scope.mjs origin/main loop/scout/model-deprecations
//
// The track comes from the branch name: loop/<track>/<slug>.
//
// This is the enforceable half of tool scoping. `allowedTools` can remove a
// capability but cannot scope it to a directory -- scout needs Write to file
// docket items, and that permission would otherwise reach every file in the
// repository. So capability is narrowed where it can be, and the blast radius
// is fixed here.
//
// The point is scout. A scout run that ships code has failed its charge, and
// "it seemed useful while I was in there" is exactly how rounds 38-48 happened.
// Everything else is proportionate caution.
//
// THIS FILE IS MAINTAINER-OWNED. It is listed in the `human-owned-paths` job in
// .github/workflows/pr-checks.yml, so a pull request that edits it cannot merge
// on green and waits for a human. The reason is round 78: this checker reads
// SCOPES from the branch it is judging, so a run can grant itself a path and
// spend it in the same pull request, and every check passes. Round 78 did
// exactly that. A round may still propose a scope change -- it just cannot be
// the one that approves it.

import { execFileSync } from "child_process";

const SCOPES = {
  scout: ["docket/", "CHANGELOG.md"],
  author: ["app/", "public/", "docket/", "CHANGELOG.md"],
  build: [
    "app/",
    "public/",
    "scripts/",
    "package.json",
    "package-lock.json",
    "docket/",
    "CHANGELOG.md",
  ],
  maintain: [
    "app/",
    "public/",
    "scripts/",
    "package.json",
    "package-lock.json",
    "docket/",
    "CHANGELOG.md",
  ],
  audit: [
    "app/",
    "public/",
    "scripts/",
    "package.json",
    "package-lock.json",
    "docket/",
    "CHANGELOG.md",
  ],
  // Meta may touch the maintainer-owned paths. It cannot merge them: the
  // `human-owned-paths` job fails on any pull request that touches one, and it
  // is a required check, so auto-merge will not land it. Rule 13 is enforced at
  // the merge, not at the edit. (This comment said CODEOWNERS was the
  // mechanism until round 79. It never was -- branch protection asks for zero
  // approving reviews, so the code-owner rule had nothing to demand. See
  // .github/CODEOWNERS.)
  meta: [
    "scripts/",
    ".github/",
    "prompts/",
    "CHARTER.md",
    "policy.yml",
    // Agent-facing documentation at the repository root. Neither this file nor
    // the round skills were in any track's scope, so the round that grew
    // round.mjs with --force and two start-time guards could change the
    // behaviour but not the documents describing it. AGENTS.md is added here
    // so a later meta round can fix it; this pull request does not edit the
    // file (rule 11: a run does not spend a permission it grants itself in the
    // same change).
    "AGENTS.md",
    // Repository-level configuration. Neither was in any track's scope, so no
    // track could fix the line-ending bug that broke every docket parse on
    // Windows, or the ESLint cascade conflict -- found by the first scout run,
    // which could see both and touch neither.
    ".gitattributes",
    ".eslintrc.json",
    "lighthouserc.json",
    "lighthouserc.analytics.json",
    // Deployment configuration. Same story again: a repository-root config
    // file the loop must be able to fix and no track could touch. Added when
    // the Hobby plan's 100-deployments-per-day limit became the binding
    // constraint on how often a round can run.
    "vercel.json",
    // Round 78 added "app/lib/route-files.js" here so that a meta round could
    // create that file, and used the grant in the same pull request. Rule 11
    // forbids exactly that, and this checker could not see it because it reads
    // SCOPES from the branch under test. Round 79 removes the grant. Nothing
    // needs it: the file lives in app/, which author, build, maintain and audit
    // all own already, so the tracks that would maintain it can. Meta has no
    // app/ path and is back to having none.
    "docket/",
    "CHANGELOG.md",
    // Round 8 (loop/meta/frame, 2026-08-22) adds exactly these two paths, and
    // no others: `FRAME.md` (ground truth about the arrangement -- the
    // identities, docket/HOLD.md, the delegation) and `CLAUDE.md` (short,
    // points at FRAME.md, carries the working rules Claude Code's own
    // classifier reads). Neither was writable by any track before this --
    // this checker only ever let a track touch paths already listed here,
    // and the repository root was reachable by none of them.
    //
    // This is the same map this pull request is judged by, widened in the
    // pull request that also spends the widening: FRAME.md and CLAUDE.md are
    // written on this branch. Rule 11 forbids a run blocked by a guardrail
    // from being the one that loosens it -- but the guardrail rule 11 names
    // is `human-owned-paths`, not this file's own SCOPES map, and this file
    // is itself listed in `human-owned-paths` (see that job's comment in
    // .github/workflows/pr-checks.yml) precisely so a change to it cannot
    // auto-merge. This pull request touches scripts/check-track-scope.mjs,
    // so it goes red on `human-owned-paths` by design and waits for the
    // maintainer to merge it by hand -- the same red-then-authorise shape a
    // pull request touching CHARTER.md took before 2026-08-22, when that path
    // was still unconditionally reserved. That is the enforcement round 79
    // built after round 78 spent a self-granted path in the same pull
    // request with every check green: back then this file was not in
    // `human-owned-paths`, so nothing forced a human merge. It is now, so
    // this round's own widening cannot land on green either. Two paths, both
    // used in this PR, both named here rather than smoothed over.
    "FRAME.md",
    "CLAUDE.md",
  ],
};

const [baseRef = "origin/main", branch = ""] = process.argv.slice(2);

const match = branch.match(/^loop\/([a-z]+)\//);
if (!match) {
  console.log(`skip  branch "${branch}" is not loop/<track>/<slug> — no track scope applied`);
  console.log("      (maintainer branches are not track-scoped; loop branches must be)");
  process.exit(0);
}

const track = match[1];
const allowed = SCOPES[track];
if (!allowed) {
  console.log(`FAIL  branch declares track "${track}", which is not a real track`);
  console.log(`      expected one of: ${Object.keys(SCOPES).join(", ")}`);
  process.exit(1);
}

let changed;
try {
  changed = execFileSync(
    "git",
    ["diff", "--name-only", `${baseRef}...HEAD`],
    { encoding: "utf8" }
  )
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
} catch (error) {
  console.log(`FAIL  could not diff against ${baseRef}: ${error.message}`);
  process.exit(1);
}

if (changed.length === 0) {
  console.log(`ok    ${track}: no files changed`);
  process.exit(0);
}

const outside = changed.filter(
  (file) => !allowed.some((prefix) => file === prefix || file.startsWith(prefix))
);

for (const file of changed) {
  if (!outside.includes(file)) console.log(`ok    ${file}`);
}

if (outside.length > 0) {
  console.log();
  for (const file of outside) {
    console.log(`FAIL  ${track} may not modify ${file}`);
  }
  console.log(`\n      ${track} may modify: ${allowed.join(", ")}`);
  if (track === "scout") {
    console.log(
      "      scout files work for other tracks to do; it does not do the work."
    );
  }
  console.log(`\n${outside.length} file(s) outside the ${track} track's scope`);
  process.exit(1);
}

console.log(`\nok    all ${changed.length} changed file(s) within ${track}'s scope`);
