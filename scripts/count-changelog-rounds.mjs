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

const REPO = "addicted2ai/AddictedtoAI";
const API_BASE = `https://api.github.com/repos/${REPO}`;

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
// `origin/main` is the right anchor wherever it exists, but it does not exist
// everywhere. Vercel clones a single branch, so a build there has no remote
// ref at all, and an unguarded `git log origin/main` throws and takes the whole
// prebuild with it. That is not hypothetical: it froze the site from 06:54Z to
// 18:33Z on 15 August through the publishing-quota check, and again from 19:14Z
// through this one — both times with CI green, because CI clones full history.
//
// Where the ref is missing, `HEAD` is the honest substitute: a production
// deployment builds the commit that *is* main. On a round's own branch HEAD
// would over-count by that round's unmerged entry, which is exactly why
// origin/main is preferred — so the fallback is used only when there is no
// choice, and it says so.
function baseRef() {
  try {
    execFileSync("git", ["rev-parse", "--verify", "--quiet", "origin/main^{commit}"], {
      stdio: "ignore",
    });
    return "origin/main";
  } catch {
    console.error(
      "WARN  origin/main is not in this checkout — counting the changelog from HEAD instead"
    );
    console.error(
      "      a single-branch or shallow clone has no remote ref; on a production build HEAD is main"
    );
    return "HEAD";
  }
}

export function changelogCommitAtOrBefore(takenAt) {
  return execFileSync(
    "git",
    [
      "log",
      baseRef(),
      `--before=${takenAt}`,
      "--format=%H",
      "-1",
      "--",
      "CHANGELOG.md",
    ],
    { encoding: "utf8" }
  ).trim();
}

// The same anchored count asked of the public GitHub API instead of the
// local clone: the newest commit that touched CHANGELOG.md at or before
// takenAt (`commits?path=CHANGELOG.md&until=`), then the file's content at
// that commit (`contents/CHANGELOG.md?ref=`). This is the same record
// `git log --before=` reads, from the same unauthenticated endpoints the
// snapshot checker's front 3 already uses for the Actions API — no remote
// ref, no history depth, no credentials. The site is a public repository,
// so the API answers unauthenticated requests.
//
// Returns the count, or null when the API cannot answer. An empty commits
// list is a real answer: nothing touched CHANGELOG.md at or before takenAt,
// so the count is 0.
function countRoundsViaApi(takenAt) {
  function fetchJson(url) {
    try {
      return JSON.parse(
        execFileSync("curl", ["-sf", url], { encoding: "utf8", maxBuffer: 8e6 })
      );
    } catch {
      return null;
    }
  }
  const commits = fetchJson(
    `${API_BASE}/commits?path=CHANGELOG.md&until=${encodeURIComponent(takenAt)}&per_page=1`
  );
  if (commits === null) return null;
  if (!Array.isArray(commits) || commits.length === 0) return 0;
  const sha = commits[0].sha;
  const file = fetchJson(
    `${API_BASE}/contents/CHANGELOG.md?ref=${encodeURIComponent(sha)}`
  );
  if (file === null || typeof file.content !== "string") return null;
  return countRoundEntries(Buffer.from(file.content, "base64").toString("utf8"));
}

export function countRoundsAsOf(takenAt) {
  const sha = changelogCommitAtOrBefore(takenAt);
  if (sha) {
    const blob = execFileSync("git", ["show", `${sha}:CHANGELOG.md`], {
      encoding: "utf8",
      maxBuffer: 64e6,
    });
    return countRoundEntries(blob);
  }
  // No commit at or before takenAt is visible in this checkout's history.
  // In a full clone that can only mean the changelog did not exist yet; in
  // Vercel's single-branch clone it means the record predates the clone's
  // depth. Returning 0 for the second case froze the site a third time on
  // 15-16 August 2026 (`756a58a`, `19cb78d`, `993f006`): the clone carried
  // only the newest ~11 commits, the changelog record at taken_at had been
  // pushed past that window by the merges in between, and a count that
  // depends on clone depth is not a count. The record is on the public
  // GitHub API, so the anchored count is read from there instead; the
  // git-history anchor stays where it exists.
  console.error(
    `WARN  this checkout's history cannot see the changelog record at or before ${takenAt}`
  );
  console.error(
    "      reading the record from the public GitHub API instead — this count never needs a remote ref or depth"
  );
  const viaApi = countRoundsViaApi(takenAt);
  if (viaApi === null) {
    console.error(
      "WARN  the GitHub API did not answer — the changelog count as of taken_at is not verifiable in this checkout"
    );
    return null;
  }
  return viaApi;
}
