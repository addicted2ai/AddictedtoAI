import { getBuildLog } from "./build-log.js";

// Per-page AI authorship disclosure, derived from the record, not typed.
//
// The changelog's per-round `Origin` field is the site's only record of how
// much human involvement a piece of work had (unsupervised / supervised /
// maintainer / delegated). A page's disclosure states the Origin of the round
// that most recently produced its current form. That value is never hardcoded here:
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
//
// Round 82 (author) publishes the cyber-eval-cascade post. posts.js is a
// listed source file of /, /blog, and every post route, so the newest recorded
// change to each of those routes' files is round 82's — and this round also
// closes the gap round 80 noted: /blog now lists posts.js, which its page
// imports for the "More from the blog" list. All five routes move together.
//
// Round 83 (build) publishes the charter at /charter. app/page.js gains a link
// to it, so / — which lists app/page.js as a source file — moves to 83; the
// other four routes round 82 touched are untouched this round and stay on 82.
//
// Round 84 (build) splits the log a second time and re-wires the mention
// figures. app/log/page.js, app/log/archive/page.js, app/log/LogFilter.js,
// app/log/LogEntry.js and app/lib/build-log.js are all listed source files of
// /log and /log/archive, and app/page.js is a listed source file of / — all
// three routes move to 84. The new /log/early page is 84 by construction: this
// round built it. Its files are shared with the other log pages, so every
// later change to the log machinery moves all three log pages together.
//
// Round 85 (build) moves five routes. It adds the `delegated` Origin value to
// the shared parser (app/lib/build-log.js) and to LogEntry.js — both listed
// source files of every log page, so /log, /log/early and /log/archive move
// together — and adds the value's meaning to /disclosure (app/disclosure/page.js
// is that route's only listed source file). It also rewrote the homepage's
// human-involvement sentence, which was true for three Origins and would have
// gone false the moment a round with no human in the loop shipped; app/page.js
// is a listed source file of /, so / moves too. This round does not touch
// /blog, /blog/*, /charter, /directory, /demos or /projects; none of their
// listed source files changed.
//
// Round 87 (author) publishes the gpt-5-6-price-drop post. app/lib/posts.js is
// a listed source file of /, /blog, and every post route, and this round
// touches it — plus app/page.js, a listed source file of /, for the teaser
// tie-break fix. So / and /blog and every post route move to 87; the log pages
// and /disclosure are untouched and stay on 85. (Round 86 is the build round
// that shipped the auto-merge gate, which touched scripts/, not these pages.)
//
// Round 88 (author) publishes the vendor-retirement-promises comparison at
// /what-vendors-promise. It is a new route, so its producing round is 88 by
// construction. Its files — app/what-vendors-promise/page.js and
// app/lib/retirement-commitments.js — are new and touched by nothing else, so
// no other route moves this round. app/Nav.js gains a link to it but Nav.js is
// not a listed source file of any route, so the nav change is invisible to
// this map.
export const PRODUCING_ROUNDS = {
  // Round 87 (author): posts.js gained a post and page.js gained a teaser
  // tie-break fix, and both are listed source files of /, so the newest
  // recorded change to this page's files is this round's.
  "/": 87,
  // Round 87 (author): /blog lists app/lib/posts.js, and posts.js gained a
  // post, so the newest recorded change to this route's files is this round's.
  "/blog": 87,
  // Round 87 (author): the new post sits in posts.js, which is a listed
  // source file of every post route, so each post's newest commit is this
  // round's.
  "/blog/frontier-cyber": 87,
  "/blog/claude-code-auto-mode": 87,
  "/blog/cyber-eval-cascade": 87,
  // Round 87 (author) built this page. New route, so its producing round is
  // the round that created it.
  "/blog/gpt-5-6-price-drop": 87,
  // Round 83 (build) built this page and its parser. New route, so its
  // producing round is the round that created it.
  // Round 83 (build) built this page and its parser. New route, so its
  // producing round is the round that created it.
  "/charter": 83,
  // Round 88 (author) built this page. New route, so its producing round is
  // the round that created it.
  "/what-vendors-promise": 88,
  "/directory": 67,
  "/demos": 62,
  // Both log pages were produced by round 70, the build round that split the
  // log in two, until round 72 changed the origin badge they both render.
  // /log was mapped to 53 until 70; leaving it there would have had the page
  // claim a maintainer origin for a form a build round gave it. The check
  // would not have caught that — round 53 records no track, so the maintainer
  // branch of the comparison passes silently — which is exactly why it is
  // corrected by hand here rather than left to go stale.
  //
  // Round 84 (build) moved both pages again: it split the log a second time,
  // changed the shared LogFilter/LogEntry/parser files, and rewrote both
  // pages' copy. Round 74 was the newest recorded change before that.
  //
  // Round 85 (build) moves them again: it adds the `delegated` Origin value
  // to the shared parser (app/lib/build-log.js) and to LogEntry.js, both
  // listed source files of every log page.
  "/log": 85,
  // Round 84 (build) built this page, which holds the first era of this
  // repository (rounds 48-70), frozen at a closed boundary. Round 85 moves it
  // with the other two log pages: it changed the same shared parser and
  // LogEntry files.
  "/log/early": 85,
  "/log/archive": 85,
  "/projects": 54,
  // Round 72 (maintain) rewrote the page's meanings; round 85 (build) adds
  // the fourth Origin value's meaning to the enumeration it publishes, so
  // the page's current form is round 85's.
  "/disclosure": 85,
};

const ORIGIN_MEANINGS = {
  // Not "a scheduled run": see the note in app/components/AiDisclosure.js.
  unsupervised: "a run that merged itself with nobody reading it first",
  supervised: "a human triggered this run and could veto before merge",
  maintainer: "a human decided what and why; an assistant did the typing",
  delegated:
    "the orchestrating model chose this work, reviewed it and merged it; no human saw it before it landed",
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
