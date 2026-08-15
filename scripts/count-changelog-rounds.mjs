#!/usr/bin/env node
// The one definition of "a round" for the loop-history count, shared by the
// producer (scripts/loop-history.mjs --snapshot) and the checker
// (scripts/check-loop-history-snapshot.mjs) so the two cannot disagree.
//
// A round is an entry in CHANGELOG.md: the build-log parser
// (app/lib/build-log.js) treats every dated entry as a round, numbers it,
// and /log renders it — so the record itself is the definition. The count
// is the number of round entries the changelog held at a given moment, read
// from the repository's own history. How a pull request's branch was named
// is not part of the definition, and GitHub's pull-request API is never
// consulted for it: a pull request that merged without dispatching a round
// has no changelog entry, so it never counts.
//
// The moment is anchored in the git history. This repository merges by
// squash, and GitHub stamps the squash commit's committer date at the merge
// instant, so "the last commit on origin/main that touched CHANGELOG.md at
// or before T" is exactly the changelog state at T — the count of entries in
// that blob is "rounds as of T". Later rounds never change it, so a snapshot
// taken at T stays verifiable forever; this is the same anchored-at-taken_at
// shape round 120 kept for the run counts, and it is the only shape a
// committed snapshot can keep without going stale on the merge that ships it.
//
// `origin/main` rather than `HEAD`: a round's own branch carries its own
// unmerged entry, and counting it would count a round before it shipped.

import { execFileSync } from "child_process";

// Mirrors app/lib/build-log.js's section split: the log runs from "## Log"
// and each "### date" heading opens a round. Comments are stripped first, as
// the build-log parser does, so a template placeholder never parses as a
// round. This deliberately duplicates the parser's two lines rather than
// importing the app module into a script — keep the expressions in lockstep
// with app/lib/build-log.js's parse().
export function countRoundEntries(markdown) {
  const withoutComments = markdown.replace(/<!--[\s\S]*?-->/g, "");
  const logStart = withoutComments.indexOf("\n## Log");
  const log =
    logStart === -1 ? withoutComments : withoutComments.slice(logStart);
  return log.split(/\n### /).length - 1;
}

// The commit on origin/main whose CHANGELOG.md is the record as of `takenAt`.
// An empty string means no commit touched CHANGELOG.md at or before it.
export function changelogCommitAtOrBefore(takenAt) {
  return execFileSync(
    "git",
    [
      "log",
      "origin/main",
      `--before=${takenAt}`,
      "--format=%H",
      "-1",
      "--",
      "CHANGELOG.md",
    ],
    { encoding: "utf8" }
  ).trim();
}

export function countRoundsAsOf(takenAt) {
  const sha = changelogCommitAtOrBefore(takenAt);
  if (!sha) return 0;
  const blob = execFileSync("git", ["show", `${sha}:CHANGELOG.md`], {
    encoding: "utf8",
    maxBuffer: 64e6,
  });
  return countRoundEntries(blob);
}
