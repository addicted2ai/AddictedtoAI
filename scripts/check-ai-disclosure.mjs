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
//      - supervised/unsupervised (loop rounds): the commit must carry a
//        track prefix matching the mapped round's track
//      - maintainer (human-directed): the commit is expected to predate the
//        track-prefix convention, so a pre-track commit is correct
//      - archive: the commit must predate the Origin field entirely
// 3. A route maps to the archive but its files were touched by a
//    current-era commit, or a route maps to a loop round but its files were
//    last touched by a pre-track (maintainer-era) commit.
//
// The route -> files mapping lives here rather than in page-origins.js so
// the disclosure data stays about what to *say*, and this script stays about
// how to *check* it. The two must agree on the route list: any route in
// PRODUCING_ROUNDS that is missing here is a route this check cannot verify,
// which is itself a failure.

import { execFileSync } from "child_process";
import path from "path";

const root = process.cwd();

// Import the ESM app modules from this script context.
const { PRODUCING_ROUNDS, ARCHIVE, getPageDisclosure } = await import(
  `file://${path.join(root, "app", "lib", "page-origins.js").replace(/\\/g, "/")}`
);
const { getBuildLog } = await import(
  `file://${path.join(root, "app", "lib", "build-log.js").replace(/\\/g, "/")}`
);

// Which source files constitute each published page. Used to find the most
// recent commit touching a page; a route missing here cannot be verified.
const ROUTE_FILES = {
  "/": ["app/page.js", "app/lib/posts.js", "app/lib/sections.js"],
  "/blog": ["app/blog/page.js"],
  "/blog/frontier-cyber": [
    "app/blog/frontier-cyber/page.js",
    "app/lib/posts.js",
  ],
  "/directory": [
    "app/directory/page.js",
    "app/directory/DirectorySearch.js",
    "app/lib/tool-categories.js",
  ],
  "/demos": [
    "app/demos/page.js",
    "app/demos/ToolFinder.js",
    "app/demos/RoundWalkthrough.js",
  ],
  "/log": ["app/log/page.js", "app/log/LogFilter.js", "app/lib/build-log.js"],
  "/projects": ["app/projects/page.js"],
  "/disclosure": ["app/disclosure/page.js"],
};

function lastCommitSubject(files) {
  const out = execFileSync("git", ["log", "-1", "--format=%s", "--", ...files], {
    encoding: "utf8",
    cwd: root,
  });
  return out.trim();
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

  const subject = lastCommitSubject(ROUTE_FILES[route]);
  const trackMatch = subject.match(/^([A-Za-z]+):/);
  // Commit subjects capitalise the track ("Maintain: ..."); the build log
  // stores it lower-case ("maintain"). Compare case-insensitively.
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

  // Supervised/unsupervised loop round: the last commit must carry a
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
