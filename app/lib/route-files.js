// Which source files constitute each published page, for the disclosure
// check. A new route must be listed here AND in PRODUCING_ROUNDS
// (app/lib/page-origins.js); scripts/check-ai-disclosure.mjs fails on either
// direction of mismatch.
//
// This map lives in app/ rather than in scripts/ on purpose. Author rounds
// are the ones that create routes — a blog post is a new route — and author
// scope is app/, public/, docket/ and CHANGELOG.md. The map is route *data*,
// and the track that ships routes must be able to extend it. The check
// *logic* that consumes it lives in scripts/check-ai-disclosure.mjs, in
// scripts/, where the tracks the disclosure verifies cannot weaken the
// verification itself.

export const ROUTE_FILES = {
  "/": ["app/page.js", "app/lib/posts.js", "app/lib/sections.js"],
  // Round 82 (author) added app/lib/posts.js to this route's file list. The
  // page imports `posts` and renders its "More from the blog" list from it, so
  // /blog visibly gains a link to every new post while its disclosure was
  // claiming an older round produced its current form — a gap round 80 noted
  // and left, and round 81 did not touch. Registering the new post honestly
  // requires this file to be counted, so /blog moves to round 82 with the
  // other posts.js-fed routes.
  // Round 176 (build) adds app/lib/human-owned-paths.js: /blog renders the
  // set of paths the human-owned-paths CI job guards, read out of the
  // workflow file at build time rather than typed into the post. A change
  // to that reader changes what the page says, so it is a source file of
  // this route in exactly the sense one-limit-count.js already is.
  "/blog": [
    "app/blog/page.js",
    "app/lib/posts.js",
    "app/lib/one-limit-count.js",
    "app/lib/human-owned-paths.js",
  ],
  "/blog/frontier-cyber": [
    "app/blog/frontier-cyber/page.js",
    "app/lib/posts.js",
  ],
  "/blog/claude-code-auto-mode": [
    "app/blog/claude-code-auto-mode/page.js",
    "app/lib/posts.js",
  ],
  "/blog/cyber-eval-cascade": [
    "app/blog/cyber-eval-cascade/page.js",
    "app/lib/posts.js",
  ],
  "/blog/gpt-5-6-price-drop": [
    "app/blog/gpt-5-6-price-drop/page.js",
    "app/lib/posts.js",
  ],
  "/blog/fable-5-export-controls": [
    "app/blog/fable-5-export-controls/page.js",
    "app/lib/posts.js",
  ],
  "/blog/chatgpt-ads": ["app/blog/chatgpt-ads/page.js", "app/lib/posts.js"],
  "/blog/gemini-3-7-flash": [
    "app/blog/gemini-3-7-flash/page.js",
    "app/lib/posts.js",
  ],
  "/blog/ultrafast-mode": [
    "app/blog/ultrafast-mode/page.js",
    "app/lib/posts.js",
  ],
  "/blog/ai-security-week": [
    "app/blog/ai-security-week/page.js",
    "app/lib/posts.js",
  ],
  "/blog/manus-meta-split": [
    "app/blog/manus-meta-split/page.js",
    "app/lib/posts.js",
  ],
  "/blog/copilot-consolidation": [
    "app/blog/copilot-consolidation/page.js",
    "app/lib/posts.js",
  ],
  "/charter": ["app/charter/page.js", "app/lib/charter.js"],
  "/loop-history": [
    "app/loop-history/page.js",
    "app/lib/loop-history.js",
  ],
  "/what-vendors-promise": [
    "app/what-vendors-promise/page.js",
    "app/lib/retirement-commitments.js",
  ],
  "/model-retirement-calendar": [
    "app/model-retirement-calendar/page.js",
    "app/lib/retirement-dates.js",
  ],
  "/model-deprecation-checker": [
    "app/model-deprecation-checker/page.js",
    "app/model-deprecation-checker/ModelDeprecationChecker.js",
    "app/lib/model-deprecation-checker.js",
    "app/lib/retirement-dates.js",
  ],
  "/model-migration-chains": [
    "app/model-migration-chains/page.js",
    "app/model-migration-chains/ModelMigrationChains.js",
    "app/lib/model-migration-chains.js",
    "app/lib/model-deprecation-checker.js",
    "app/lib/retirement-dates.js",
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
    "app/lib/demos.js",
  ],
  "/log": [
    "app/log/page.js",
    "app/log/LogFilter.js",
    "app/log/LogEntry.js",
    "app/lib/build-log.js",
  ],
  "/log/early": [
    "app/log/early/page.js",
    "app/log/LogFilter.js",
    "app/log/LogEntry.js",
    "app/lib/build-log.js",
  ],
  "/log/archive": [
    "app/log/archive/page.js",
    "app/log/LogFilter.js",
    "app/log/LogEntry.js",
    "app/lib/build-log.js",
  ],
  // The per-round pages: one dynamic route, one disclosure. Files shared
  // with the other log pages, so a later change to the log machinery moves
  // the route with them.
  "/log/rounds/[id]": [
    "app/log/rounds/[id]/page.js",
    "app/log/LogEntry.js",
    "app/lib/build-log.js",
  ],
  "/projects": ["app/projects/page.js"],
  "/disclosure": ["app/disclosure/page.js"],
};
