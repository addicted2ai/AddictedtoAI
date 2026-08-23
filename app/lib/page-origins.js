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
//
// Round 97 (maintain) rewrites /blog's "What is true now, and only this"
// passage to name the admin bypass it omitted. app/blog/page.js is /blog's
// only listed source file, so /blog moves to 97; the post routes list posts.js,
// which this round does not touch, and stay on 87.
//
// Round 99 (build) gives the Directory a home for agents and MCP: it
// restructures tool-categories.js into six categories, adds Claude Code,
// Claude Agent SDK, OpenAI Agents SDK and the Model Context Protocol, moves
// LangChain from "Workflow & Data" to "Agents", and rewrites the page's
// metadata description. All three of /directory's listed source files
// change, so the route moves from 98 to 99.
//
// Round 100 (author) publishes the fable-5-export-controls post.
// app/lib/posts.js is a listed source file of /, /blog, and every post
// route, and this round touches it, so all six of those routes move to 100
// together — the same pattern as round 87. The new route is 100 by
// construction: this round built it. app/page.js is untouched, but / moves
// anyway because posts.js feeds its homepage teaser.
//
// Round 101 (audit) corrects two of those pages: it rewrites /blog's
// "What is true now" passage again (five merged-over-the-check pull
// requests became seven, re-swept from the GitHub API) and fixes one
// timing imprecision in the fable-5-export-controls post. Both routes'
// listed source files change, so /blog and /blog/fable-5-export-controls
// move to 101; the other post routes and / list posts.js, untouched this
// round, and stay on 100.
//
// Round 103 (author) publishes the chatgpt-ads post. app/lib/posts.js is a
// listed source file of /, /blog, and every post route, and this round
// touches it, so all eight of those routes move to 103 together — the same
// pattern as rounds 87 and 100. The new route is 103 by construction: this
// round built it. app/page.js is untouched, but / moves anyway because
// posts.js feeds its homepage teaser.
//
// Round 104 (maintain) corrects /blog's merged-over-the-check count again
// (seven became eight: #58 merged over the failing check on 14 August).
// app/blog/page.js is /blog's only listed source file, so /blog moves to
// 104; posts.js is untouched, so / and the post routes stay on 103.
//
// Round 105 (build) makes that count mechanical: /blog now renders the
// count and failing set from the checked-in sweep output
// (scripts/one-limit-count-sweep.json) instead of typing them in, adding
// app/lib/one-limit-count.js as a source of the page. app/blog/page.js is
// /blog's only other listed source file, so /blog moves to 105; posts.js
// is untouched, so / and the post routes stay on 103.
//
// Round 107 (author) publishes the gemini-3-7-flash post. app/lib/posts.js
// is a listed source file of /, /blog, and every post route, and this round
// touches it, so all nine of those routes move to 107 together — the same
// pattern as rounds 87, 100 and 103. The new route is 107 by construction:
// this round built it. app/page.js is untouched, but / moves anyway because
// posts.js feeds its homepage teaser.
//
// Round 108 (author) publishes the ultrafast-mode post. app/lib/posts.js
// is a listed source file of /, /blog, and every post route, and this round
// touches it, so all ten of those routes move to 108 together — the same
// pattern as rounds 87, 100, 103 and 107. The new route is 108 by
// construction: this round built it. app/page.js is untouched, but / moves
// anyway because posts.js feeds its homepage teaser.
//
// Round 109 (build) publishes the model-retirement calendar at
// /model-retirement-calendar. It is a new route, so its producing round is
// 109 by construction. Its files — app/model-retirement-calendar/page.js and
// app/lib/retirement-dates.js — are new and touched by nothing else, so no
// other route moves this round. app/Nav.js gains a link to it but Nav.js is
// not a listed source file of any route, so the nav change is invisible to
// this map.
//
// Round 111 (maintain) makes the six published definitions of the
// `delegated` Origin agree: it adds the missing "briefed" verb to the
// shared parser's comment (app/lib/build-log.js), to LogEntry.js and to
// AiDisclosure.js, and aligns the delegated sentence on /disclosure and the
// homepage's prose. app/page.js is a listed source file of /, so / moves to
// 111. The shared log machinery — build-log.js and LogEntry.js — is a listed
// source of /log, /log/early, /log/archive and /log/rounds/[id], so those
// four move together. app/disclosure/page.js is /disclosure's only listed
// source file, so it moves too. /blog, the post routes, /directory, /demos,
// /charter, /projects, /what-vendors-promise and /model-retirement-calendar
// are untouched and stay on their prior rounds.
//
// Round 113 (maintain) re-verifies /what-vendors-promise: it re-fetches
// every vendor row (all ten still current, verified dates moved to
// 2026-08-14), rewrites the still-unverified Meta row with this round's
// exact fetch statuses, and corrects the Meta finding, claiming the
// Microsoft Foundry retirement page lists no Meta models. Round 116
// (audit) re-checks that correction and finds it overstated — the Foundry
// model retirement schedule does list Meta models (five retired
// 2026-06-13, three GA) — and fixes the page prose and the Meta row's
// commentary accordingly. Both
// of the route's listed source files — app/what-vendors-promise/page.js and
// app/lib/retirement-commitments.js — change, so /what-vendors-promise
// moves to 116. No other route's listed files change this round.
//
// Round 133 (maintain) corrects the record's staleness claims from round
// 132, and the correction lands in app/lib/posts.js: the /blog post's
// `verified` date moves from 2026-08-14 to 2026-08-15, because round 119's
// live API sweep (09:20:06Z on 08-15) — not round 104's or 105's — is the
// most recent check of the post's count claim, the same reasoning round
// 132 used for the earlier date. posts.js is a listed source file of /,
// /blog and every post route, so all ten move together to 133, the same
// pattern as rounds 87, 100, 103, 107, 108 and 132. scripts/
// (staleness-report.mjs's header comment) also changes, but no route lists
// it. No other route's listed files change.
//
// Round 154 (author) publishes the ai-security-week post. posts.js is a
// listed source file of /, /blog, and every post route, and this round
// touches it, so all eleven of those routes move to 154 together — the same
// pattern as rounds 87, 100, 103, 107, 108, 132 and 133. The new route is
// 154 by construction: this round built it. No other route's listed files
// change.
//
// Round 165 (author) publishes the manus-meta-split post. posts.js is a
// listed source file of /, /blog, and every post route, and this round
// touches it, so all twelve of those routes move to 165 together — the same
// pattern as rounds 87, 100, 103, 107, 108, 132, 133 and 154. The new route
// is 165 by construction: this round built it. No other route's listed
// files change.
//
// Round 168 (build) publishes /model-deprecation-checker, the first item
// filed under `serves: worth-a-visit` (CHARTER.md's 2026-08-22 amendment):
// paste a config and get back which model identifiers, read against the
// same RETIREMENT_DATES /model-retirement-calendar already renders, are
// retired or retiring. New route, so its producing round is the round that
// created it. app/model-retirement-calendar/page.js also gains a link to
// the new checker so it is discoverable from the page whose data it reuses
// — that is a real content change to that route's only non-shared listed
// file, so /model-retirement-calendar moves from 132 to 168 too.
// app/lib/retirement-dates.js, shared by both routes, is unchanged this
// round.
export const PRODUCING_ROUNDS = {
  // Round 108 (author): posts.js gained the ultrafast-mode post, a listed
  // source file of /, so the newest recorded change to this page's files
  // is this round's. (Round 107 before it: posts.js gained the gemini-3-7
  // flash post.)
  // Round 111 (maintain) moves it: app/page.js gained the corrected
  // delegated sentence, and it is a listed source file of /.
  // Round 132 (build) gives every post a `verified` date in posts.js — a
  // listed source file of / — so the newest change is this round's.
  // Round 133 (maintain) corrects the /blog post's verified date and its
  // attribution comment in posts.js, so the newest change is this round's.
  // Round 154 (author) publishes the ai-security-week post in posts.js, a
  // listed source file of /, so the newest change is this round's.
  // Round 165 (author) publishes the manus-meta-split post in posts.js, a
  // listed source file of /, so the newest change is this round's.
  "/": 165,
  // Round 108 (author): posts.js feeds the "More from the blog" list, so
  // /blog moves with the posts.js-fed routes. (Round 107 before it: the
  // gemini-3-7-flash post was added.)
  // Round 132 (build) adds the per-post verified dates and renders them in
  // the post-meta line, so the newest change is this round's.
  // Round 133 (maintain) corrects the /blog post's verified date in
  // posts.js, so the newest change is this round's.
  // Round 154 (author) adds the ai-security-week post to posts.js, which
  // feeds the "More from the blog" list, so the newest change is this
  // round's.
  // Round 159 (maintain) corrects the required-checks claim and the
  // one-limit count in app/blog/page.js, a listed source file of /blog,
  // so the newest change is this round's.
  // Round 160 (maintain) corrects the two remaining present-tense
  // "enforce_admins off" claims in app/blog/page.js to the verifiable
  // enforcement_level: non_admins form, so the newest change is this
  // round's.
  // Round 165 (author) adds the manus-meta-split post to posts.js, which
  // feeds the "More from the blog" list, so the newest change is this
  // round's.
  "/blog": 165,
  // Round 108 (author): the new post sits in posts.js, a listed source
  // file of every post route, so each post's newest commit is this round's.
  // The ultrafast-mode route is 108 by construction: this round built the
  // page.
  // Round 132 (build): posts.js and every post page carry the verified
  // dates and render them, so each route's newest commit is this round's.
  // Round 133 (maintain) corrects the /blog post's verified date in
  // posts.js — a listed source file of every post route — so each route's
  // newest commit is this round's.
  // Round 154 (author) publishes the ai-security-week post in posts.js, a
  // listed source file of every post route, so each route's newest commit
  // is this round's.
  // Round 165 (author) publishes the manus-meta-split post in posts.js, a
  // listed source file of every post route, so each route's newest commit
  // is this round's.
  "/blog/frontier-cyber": 165,
  "/blog/claude-code-auto-mode": 165,
  "/blog/cyber-eval-cascade": 165,
  "/blog/gpt-5-6-price-drop": 165,
  "/blog/fable-5-export-controls": 165,
  "/blog/chatgpt-ads": 165,
  "/blog/gemini-3-7-flash": 165,
  "/blog/ultrafast-mode": 165,
  // The ai-security-week route is 154 by construction: this round built the
  // page, and posts.js — a listed source file of every post route — carries
  // its metadata.
  // Round 165 (author) publishes the manus-meta-split post in posts.js, a
  // listed source file of every post route, so the newest commit is this
  // round's.
  "/blog/ai-security-week": 165,
  // The manus-meta-split route is 165 by construction: this round built the
  // page, and posts.js — a listed source file of every post route — carries
  // its metadata.
  "/blog/manus-meta-split": 165,
  // Round 83 (build) built this page and its parser. New route, so its
  // producing round is the round that created it.
  // Round 160 (maintain) corrects the two correction asides' present-tense
  // "enforce_admins off" claims to the verifiable enforcement_level:
  // non_admins form in app/charter/page.js, a listed source file of
  // /charter, so the newest change is this round's.
  // Round 170 (build) corrects the lead paragraph's "human-owned, so only
  // the maintainer can amend it" claim (false since round 169's rewrite of
  // rule 13/13a) and wraps the tracks table in an accessible scroll region,
  // both in app/charter/page.js, a listed source file, so the newest change
  // is this round's.
  "/charter": 170,
  // Round 88 (author) built this page. New route, so its producing round is
  // the round that created it.
  // Round 113 (maintain) re-verified every row and rewrote the Meta row and
  // its finding, touching both listed source files, so the newest change is
  // this round's.
  // Round 116 (audit) corrected the Foundry half of the Meta finding (the
  // round-113 correction overreached: the Foundry retirement schedule does
  // list Meta models), so the newest change is this round's.
  // Round 124 (build) wires the page's rows into the Directory's staleness
  // check: it extends scripts/check-tool-staleness.mjs (not a listed source
  // file of the route) and gives the still-unverified Meta row a dated
  // unverifiedSince record in app/lib/retirement-commitments.js — a listed
  // source file — so the newest change is this round's.
  // Round 125 (maintain) re-attempts the Meta verification with new
  // techniques and rewrites the Meta row's sentence with this run's
  // evidence, so the newest change is this round's.
  // Round 132 (build) rewrites the page's staleness passage to name the
  // consolidated report, and touches app/lib/retirement-commitments.js (a
  // listed source file) only via the data file's header comment — so the
  // newest change is this round's.
  "/what-vendors-promise": 132,
  // Round 109 (build) built this page. New route, so its producing round is
  // the round that created it.
  // Round 132 (build) rewrites the page's staleness passage to name the
  // consolidated report and touches app/lib/retirement-dates.js's header
  // comment, so the newest change is this round's.
  // Round 168 (build) adds a link to the new /model-deprecation-checker,
  // a real content change to app/model-retirement-calendar/page.js, so the
  // newest change is this round's.
  // Round 170 (build) fixes a 223px overflow at a 320px viewport by wrapping
  // both of the page's tables in an accessible scroll region, in
  // app/model-retirement-calendar/page.js, a listed source file, so the
  // newest change is this round's.
  //
  // Round 174 (build, loop/build/first-screenful-density) moves the page's
  // intro paragraphs and the deprecation-checker callout from between <h1>
  // and the first table to a new "About this page" section after both
  // tables (docket/open/2026-08-22-first-screenful-density.md) --
  // app/model-retirement-calendar/page.js, a listed source file, so the
  // newest change is this round's. scripts/check-ai-disclosure.mjs did not
  // itself flag this one stale (both round 170 and round 174 are `build`,
  // and the check only compares track, not round recency -- a real gap
  // this entry closes without waiting for the check to catch it) -- found
  // and fixed alongside the /directory mismatch the check did report, for
  // the same underlying reason.
  "/model-retirement-calendar": 174,
  // Round 168 (build) built this page. New route, so its producing round is
  // the round that created it.
  "/model-deprecation-checker": 168,
  // Round 112 (build) publishes the loop's run history at /loop-history. New
  // route, so its producing round is the round that created it.
  "/loop-history": 112,
  // Round 67 (author) built this page; round 91 (build) restored the mapping
  // after a merged-tree mismatch. Round 93 (audit) re-records You.com's href
  // in tool-categories.js, a listed source file, so the newest change is
  // this round's.
// Round 98 (author) adds Gemini to tool-categories.js, so the newest change
// is this round's.
// Round 99 (build) restructures the Directory into six categories, adding
// agents and MCP; page.js, DirectorySearch.js and tool-categories.js all
// change, so the newest change is this round's.
// Round 106 (author) adds Firefly to tool-categories.js, so the newest
// change is this round's.
// Round 125 (maintain) re-verifies ten of the Directory's entries against
// their live pages and renews their verified dates to 2026-08-15, touching
// tool-categories.js, so the newest change is this round's.
// Round 131 (maintain) corrects the /demos walkthrough's "Result" caption:
// it claimed every round so far reads "not yet measured", which the record
// has falsified since round 70 (31 current-era rounds record measured
// results, and the demo's own example round 74 reads one). RoundWalkthrough.js
// is a listed source file of /demos, so the route moves to 131.
//
// Round 132 (build) lands the staleness-clocks item: every post gains a
// `verified` date in app/lib/posts.js — a listed source file of /, /blog and
// every post route — and every post page renders it in its post-meta line,
// so /, /blog and all eight post routes move to 132 together, the same
// pattern as rounds 87, 100, 103, 107 and 108. The /demos page gains
// verification dates rendered from the new app/lib/demos.js (added to its
// listed files), so /demos moves too. No other route's listed files change.
  //
  // Round 174 (build, loop/build/first-screenful-density) marks up the
  // tool-card grid as a real <ul>/<li> list instead of bare <a> siblings of
  // a <div> (docket/open/2026-08-22-first-screenful-density.md) --
  // app/directory/DirectorySearch.js, a listed source file, so the newest
  // change is this round's. Found by scripts/check-ai-disclosure.mjs
  // itself: "mapped to round 125 (maintain), but its files were last
  // touched by ... (build) — update PRODUCING_ROUNDS".
  "/directory": 174,
  // Round 131 (maintain) corrected the walkthrough's "Result" caption, which
  // the record had disproved.
  // Round 132 (build) renders per-demo verification dates from the new
  // app/lib/demos.js and app/demos/page.js, so the newest change is this
  // round's.
  "/demos": 132,
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
  //
  // Round 94 (build) moves them once more: it gives the older current-era
  // rounds permanent pages of their own (/log/rounds/<id>), touching the
  // shared parser, LogEntry and /log's page, and rewrites the homepage's
  // record-partition sentence.
  //
  // Round 111 (maintain) moves them again: it corrects the `delegated`
  // definition in the shared parser comment (app/lib/build-log.js) and in
  // LogEntry.js, both listed source files of every log page.
  //
  // Round 148 (maintain) corrects the false "measured result" claim in the
  // /log lead paragraph and in the /log/early and /log/archive metadata:
  // app/log/page.js, app/log/early/page.js and app/log/archive/page.js are
  // each a listed source file of its own route, so all three move together.
  "/log": 148,
  // Round 84 (build) built this page, which holds the first era of this
  // repository (rounds 48-70), frozen at a closed boundary. Round 85 moves it
  // with the other two log pages: it changed the same shared parser and
  // LogEntry files. Round 94 moves it again, touching those shared files.
  // Round 111 moves it once more: the delegated-definition correction lands
  // in the same shared files. Round 148 moves it with the /log lead-paragraph
  // correction, this time in its own page file.
  "/log/early": 148,
  "/log/archive": 148,
  // Round 94 (build) built this route: one page per older current-era round.
  // New route, so its producing round is the round that created it.
  // Round 111 moves it with the log machinery it shares.
  // Round 150 (audit) corrects the metadata's residual "the measurement that
  // judged it" overclaim, missed by round 148's correction of the other log
  // pages; app/log/rounds/[id]/page.js is a listed source file of its own
  // route, so the route moves with it.
  "/log/rounds/[id]": 150,
  "/projects": 54,
  // Round 72 (maintain) rewrote the page's meanings; round 85 (build) adds
  // the fourth Origin value's meaning to the enumeration it publishes, so
  // the page's current form is round 85's. Round 111 (maintain) corrects
  // that enumeration's delegated wording, so the page moves to 111.
  "/disclosure": 111,
};

const ORIGIN_MEANINGS = {
  // Not "a scheduled run": see the note in app/components/AiDisclosure.js.
  unsupervised: "a run that merged itself with nobody reading it first",
  supervised: "a human triggered this run and could veto before merge",
  maintainer: "a human decided what and why; an assistant did the typing",
  delegated:
    "the orchestrating model chose, briefed, reviewed and merged it; no human saw it before it landed",
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
