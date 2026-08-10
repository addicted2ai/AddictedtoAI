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
  // Meta may touch the human-owned paths. It cannot merge them: CODEOWNERS
  // requires review there and auto-merge waits on required reviews. Rule 13 is
  // enforced at the merge, not at the edit.
  meta: [
    "scripts/",
    ".github/",
    "prompts/",
    "CHARTER.md",
    "policy.yml",
    "lighthouserc.json",
    "lighthouserc.analytics.json",
    "docket/",
    "CHANGELOG.md",
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
