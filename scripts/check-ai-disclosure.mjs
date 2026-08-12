#!/usr/bin/env node
// Verify the per-page AI disclosure map against the record and against git.
// Run from the repository root:
//
//   node scripts/check-ai-disclosure.mjs
//
// Three things can go wrong, and this script is the one that makes each of
// them loud:
//
// 1. A route maps to a round that does not exist in the build log, or to a
//    round that records no Origin. getPageDisclosure() itself throws on
//    these — this script importing it is the build-time tripwire.
// 2. A route maps to a round whose track disagrees with the most recent
//    commit touching that page's files. That means the map went stale: a
//    later round changed the page and nobody updated PRODUCING_ROUNDS. The
//    commit's track prefix (e.g. "Maintain:") must be compatible with the
//    mapped round's origin:
//      - supervised/unsupervised/delegated (loop rounds): the commit must
//        carry a track prefix matching the mapped round's track
//      - maintainer (human-directed): the commit is expected to predate the
//        track-prefix convention, so a pre-track commit is correct
//      - archive: the commit must predate the Origin field entirely
// 3. A route maps to the archive but its files were touched by a
//    current-era commit, or a route maps to a loop round but its files were
//    last touched by a pre-track (maintainer-era) commit.
//
// The route -> files mapping lives in app/lib/route-files.js rather than
// here so the route *data* stays where the track that creates routes can
// extend it: author scope is app/, public/, docket/ and CHANGELOG.md, and a
// blog post is a new route. The check *logic* stays here, in scripts/,
// because the tracks the disclosure verifies must not be able to weaken the
// verification itself. The two maps must agree on the route list: any route
// in PRODUCING_ROUNDS that is missing from ROUTE_FILES is a route this check
// cannot verify, which is itself a failure.

import { execFileSync } from "child_process";
import path from "path";

const root = process.cwd();

// Import the ESM app modules from this script context.
const { PRODUCING_ROUNDS, ARCHIVE, getPageDisclosure } = await import(
  `file://${path.join(root, "app", "lib", "page-origins.js").replace(/\\/g, "/")}`
);
const { ROUTE_FILES } = await import(
  `file://${path.join(root, "app", "lib", "route-files.js").replace(/\\/g, "/")}`
);
const { getBuildLog } = await import(
  `file://${path.join(root, "app", "lib", "build-log.js").replace(/\\/g, "/")}`
);

// A commit that also touched the disclosure machinery is *not* necessarily
// a chrome commit. The banner round (PR #9) added the disclosure to every
// page at once and should not rewrite every page's producing round — but
// the round that fixed the disclosure checker (PR #10) also corrected a
// demos caption in the same commit, and the old rule (skip any commit that
// touched a disclosure file) swallowed that real content change whole: the
// /demos map went stale under a green check. A commit is chrome only when
// its *diff to this route's files* is purely the banner insertion — the
// import and the <AiDisclosure> element — so a content change is detected
// even in a commit that also touched the disclosure machinery.
function isBannerOnlyDiff(sha, files) {
  const diff = execFileSync(
    "git",
    ["show", "--format=", sha, "--", ...files],
    { encoding: "utf8", cwd: root }
  );
  const changedLines = diff.split("\n").filter(
    (l) =>
      (l.startsWith("+") || l.startsWith("-")) &&
      !l.startsWith("+++") &&
      !l.startsWith("---")
  );
  if (changedLines.length === 0) return false;
  return changedLines.every((l) => l.includes("AiDisclosure"));
}

function lastContentCommitSubject(files, route) {
  // Walk commits newest-first, skipping banner-only ones (the round that
  // added the banner touched every page at once, and should not rewrite
  // every page's producing round). The /disclosure page is exempt: its own
  // files are the disclosure, so its producing round is the round that
  // built it.
  const commits = execFileSync(
    "git",
    ["log", "-10", "--format=%h|%s", "--", ...files],
    { encoding: "utf8", cwd: root }
  )
    .trim()
    .split("\n")
    .filter(Boolean);
  for (const line of commits) {
    const [sha, subject] = line.split("|");
    if (route !== "/disclosure" && isBannerOnlyDiff(sha, files)) continue;
    return subject;
  }
  return "";
}

const problems = [];

// 0. Every route in the map must be verifiable here, and vice versa.
for (const route of Object.keys(PRODUCING_ROUNDS)) {
  if (!ROUTE_FILES[route]) {
    problems.push(
      `${route}: in PRODUCING_ROUNDS but missing from ROUTE_FILES — this check cannot verify it`
    );
  }
}
for (const route of Object.keys(ROUTE_FILES)) {
  if (!(route in PRODUCING_ROUNDS)) {
    problems.push(
      `${route}: in ROUTE_FILES but missing from PRODUCING_ROUNDS — the page renders no disclosure`
    );
  }
}
// An empty file list would verify nothing: `git log --` with no pathspec
// returns commits from the whole repository, and the newest one is usually
// the round being checked — so a route with no files would pass against a
// history that says nothing about it. The data now lives in app/ where the
// publishing track edits it, so an author round's typo must be a loud
// failure, not a quiet pass.
for (const route of Object.keys(ROUTE_FILES)) {
  if (ROUTE_FILES[route].length === 0) {
    problems.push(
      `${route}: ROUTE_FILES lists no source files — this check cannot verify it`
    );
  }
}

for (const route of Object.keys(ROUTE_FILES)) {
  // 1. The disclosure must resolve: mapped round exists and records an
  //    Origin. getPageDisclosure throws otherwise.
  let disclosure;
  try {
    disclosure = getPageDisclosure(route);
  } catch (error) {
    problems.push(`${route}: ${error.message}`);
    continue;
  }

  const subject = lastContentCommitSubject(ROUTE_FILES[route], route);
  // Three conventions have produced merged commits here. PRs #1-8 squashed to
  // a commit subject that capitalised the track ("Maintain: ..."); the build
  // log stores it lower-case ("maintain"), so the comparison is
  // case-insensitive. From PR #9 on, branches are named `loop/<track>/<slug>`
  // per prompts/shared/every-run.md, and GitHub's squash merge defaults the
  // commit subject to the PR title plus number -- which is the branch-style
  // name, not the old colon-prefixed one ("loop/build/ai disclosure (#9)").
  // And a PR title is editable: PR #10 merged with a colon where the branch
  // name had a slash ("loop/maintain: fix the disclosure checker ..."), so
  // the loop/ prefix is followed by the track and then either a slash or a
  // colon. Recognising only the first two conventions made this check pass
  // over exactly the commit that made the /demos map stale -- the format
  // gap and the chrome rule (fixed above) were the same PR, and each masked
  // the other.
  const trackMatch =
    subject.match(/^([A-Za-z]+):/) ||
    subject.match(/^loop\/([A-Za-z]+)[:/]/);
  const lastTrack = trackMatch ? trackMatch[1].toLowerCase() : null;

  if (PRODUCING_ROUNDS[route] === ARCHIVE) {
    if (lastTrack) {
      problems.push(
        `${route}: mapped to the archive, but its files were last touched by "${subject}" (a ${lastTrack} commit) — the map is stale`
      );
    } else {
      console.log(
        `ok    ${route}: archive-era producing round, last commit "${subject}"`
      );
    }
    continue;
  }

  const mappedOrigin = disclosure.origin;
  const mappedTrack = (
    getBuildLog().find((entry) => entry.number === PRODUCING_ROUNDS[route])
      ?.track || ""
  ).toLowerCase();

  if (mappedOrigin === "maintainer") {
    // Human-directed rounds may or may not have used track prefixes; the
    // commit's track is not the signal here. Any newer round touching the
    // page would change this route's *content* in a way the map should
    // reflect, so keep the check loose but not silent.
    if (lastTrack && lastTrack !== mappedTrack && mappedTrack) {
      problems.push(
        `${route}: mapped to round ${PRODUCING_ROUNDS[route]} (${mappedTrack || "no track"}), but its files were last touched by "${subject}" (${lastTrack}) — update PRODUCING_ROUNDS`
      );
    } else {
      console.log(
        `ok    ${route}: producing round ${PRODUCING_ROUNDS[route]} (${mappedOrigin}), last commit "${subject}"`
      );
    }
    continue;
  }

  // Supervised/unsupervised/delegated loop round: the last commit must carry a
  // matching track prefix.
  if (!lastTrack) {
    problems.push(
      `${route}: mapped to round ${PRODUCING_ROUNDS[route]} (${mappedTrack || "no track"}), but its files were last touched by a pre-track commit "${subject}" — either the map or the round assignment is wrong`
    );
  } else if (mappedTrack && lastTrack !== mappedTrack) {
    problems.push(
      `${route}: mapped to round ${PRODUCING_ROUNDS[route]} (${mappedTrack}), but its files were last touched by "${subject}" (${lastTrack}) — update PRODUCING_ROUNDS`
    );
  } else {
    console.log(
      `ok    ${route}: producing round ${PRODUCING_ROUNDS[route]} (${lastTrack}), last commit "${subject}"`
    );
  }
}

if (problems.length > 0) {
  for (const problem of problems) console.log(`FAIL  ${problem}`);
  console.log(`\n${problems.length} disclosure problem(s)`);
  process.exit(1);
}
console.log("ok    all page disclosures resolve and match git history");
process.exit(0);
