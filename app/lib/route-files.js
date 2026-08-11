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
  "/log": [
    "app/log/page.js",
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
  "/projects": ["app/projects/page.js"],
  "/disclosure": ["app/disclosure/page.js"],
};
