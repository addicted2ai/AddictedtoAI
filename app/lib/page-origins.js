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
//   /directory           -> round 67  (author: added ChatGPT to the
//                                      Directory)
//   /demos               -> round 62  (maintain: corrected the walkthrough's
//                                      stale analytics claim)
//   /log                 -> round 53  (maintainer: the last content commit
//                                      touching the log's files carries no
//                                      track prefix; 53 is the nearest
//                                      recorded maintainer round)
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

// Round 72 (maintain) corrected the false human-review claim on /blog, the
// homepage sentence that claimed every round was vetoable, and the wording
// that described an unsupervised round as a scheduled one — which reaches
// /log, /log/archive and /disclosure through app/log/LogEntry.js and
// app/disclosure/page.js. Five routes therefore move together; the earlier
// mappings are kept in the comment above as the record of what produced
// each page before.
//
// Round 74 (audit) moves three of those on again: it rescoped the homepage's
// mention figures to the page they link to (app/page.js, app/lib/build-log.js)
// and withdrew a search preset (app/log/LogFilter.js), which is shared by both
// log pages. /blog and /disclosure did not change and stay on 72.
//
// Round 80 (author) publishes the auto-mode post. app/lib/posts.js feeds the
// homepage teaser and the frontier-cyber post's metadata, so both routes move
// to 80 even though only the new post page is new.
export const PRODUCING_ROUNDS = {
  // Round 80 (author) published the auto-mode post and added it to
  // app/lib/posts.js, which feeds the homepage teaser, so the newest recorded
  // change to this page's source files is now round 80's.
  "/": 80,
  // Round 76 rewrote the "what is true now" paragraph: round 75 made the
  // human-owned-paths check a required one, which falsified the sentence
  // round 72 had written to be true at the time.
  "/blog": 76,
  // Round 80 (author): the new post sits in posts.js, which is a listed
  // source file of /blog/frontier-cyber, so the newest commit touching this
  // route's files is round 80's even though the post page itself is new.
  "/blog/frontier-cyber": 80,
  "/blog/claude-code-auto-mode": 80,
  "/directory": 67,
  "/demos": 62,
  // Both log pages were produced by round 70, the build round that split the
  // log in two, until round 72 changed the origin badge they both render.
  // /log was mapped to 53 until 70; leaving it there would have had the page
  // claim a maintainer origin for a form a build round gave it. The check
  // would not have caught that — round 53 records no track, so the maintainer
  // branch of the comparison passes silently — which is exactly why it is
  // corrected by hand here rather than left to go stale.
  "/log": 74,
  "/log/archive": 74,
  "/projects": 54,
  "/disclosure": 72,
};

const ORIGIN_MEANINGS = {
  // Not "a scheduled run": see the note in app/components/AiDisclosure.js.
  unsupervised: "a run that merged itself with nobody reading it first",
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
