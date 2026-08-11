import { getBuildLog } from "./build-log.js";

// Per-page AI authorship disclosure, derived from the record, not typed.
//
// The changelog's per-round `Origin` field is the site's only record of how
// much human involvement a piece of work had (unsupervised / supervised /
// maintainer). A page's disclosure states the Origin of the round that most
// recently produced its current form. That value is never hardcoded here:
// this file maps a route to a producing round *number*, and the Origin text
// is read from that round's changelog entry at build time. If the mapped
// round does not exist or lacks an Origin, getPageDisclosure throws and the
// build fails — a page cannot claim human involvement that no round
// recorded.
//
// The producing round for each route was derived on 2026-08-10 from
// `git log -1` over each page's source files (the newest recorded change):
//
//   /                    -> round 60  (audit: corrected the post metadata
//                                      that feeds the homepage teaser)
//   /blog                -> round 60  (audit: fixed the shipped-work list)
//   /blog/frontier-cyber -> round 60  (audit: corrected the post's title)
//   /directory           -> round 59  (maintain: corrected descriptions)
//   /demos               -> archive   (last change predates the Origin
//                                      field; recorded as supervised)
//   /log                 -> round 53  (meta: made the local round runner
//                                      three commands, which last changed
//                                      the log's build-time parsing)
//   /projects            -> round 54  (audit: withdrew the page)
//   /disclosure          -> round 61  (build round that built this)
//
// scripts/check-ai-disclosure.mjs verifies the map against git: for each
// route, the most recent commit touching its files must carry the same
// track as the mapped round (or must be a pre-track commit when the route
// maps to a maintainer round, or predate the Origin field when the route
// maps to the archive). So the map cannot silently go stale.

const LEGACY_ORIGIN = "supervised";

// The archive marker means the page's current form predates the Origin
// field; build-log.js inherits LEGACY_ORIGIN for such rounds.
export const ARCHIVE = "archive";

export const PRODUCING_ROUNDS = {
  "/": 60,
  "/blog": 60,
  "/blog/frontier-cyber": 60,
  "/directory": 59,
  "/demos": ARCHIVE,
  "/log": 53,
  "/projects": 54,
  "/disclosure": 61,
};

const ORIGIN_MEANINGS = {
  unsupervised: "a scheduled run that merged itself with nobody reading it first",
  supervised: "a human triggered this run and could veto before merge",
  maintainer: "a human decided what and why; an assistant did the typing",
};

export function getPageDisclosure(route) {
  const roundNumber = PRODUCING_ROUNDS[route];
  if (roundNumber === ARCHIVE) {
    return {
      route,
      round: null,
      origin: LEGACY_ORIGIN,
      declaredOrigin: false,
      meaning: ORIGIN_MEANINGS[LEGACY_ORIGIN],
      predatesField: true,
    };
  }
  if (!roundNumber) {
    throw new Error(
      `no producing round recorded for route "${route}" — add one to PRODUCING_ROUNDS in app/lib/page-origins.js`
    );
  }
  const round = getBuildLog().find((entry) => entry.number === roundNumber);
  if (!round) {
    throw new Error(
      `route "${route}" maps to round ${roundNumber}, which is not in the build log — the map is stale`
    );
  }
  if (!round.origin) {
    throw new Error(
      `route "${route}" maps to round ${roundNumber}, which records no Origin — a page cannot claim involvement no round recorded`
    );
  }
  return {
    route,
    round: round.number,
    origin: round.origin,
    declaredOrigin: round.declaredOrigin,
    meaning: ORIGIN_MEANINGS[round.origin] || round.origin,
    predatesField: false,
  };
}
