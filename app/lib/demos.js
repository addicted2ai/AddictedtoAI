// One source of truth for the demos on /demos and their staleness clocks,
// so the page and the report can never drift apart. Each demo carries a
// `verified` date: when the facts the demo presents were last re-checked,
// distinct from when the demo was written. scripts/staleness-report.mjs
// fails the build when one goes past the staleness_days.demo window in
// policy.yml (30 days — the same fast window as process claims, because a
// demo's descriptions are the kind of copy that goes stale quietly).
//
// What each date means:
//   - anatomy-of-a-round — the walkthrough's claims are the loop's own
//     record, rendered straight from the build log. Round 131 (maintain)
//     corrected its "Result" caption after the record disproved it and
//     re-verified the rest of the panel that day, so the facts were last
//     checked 2026-08-15.
//   - tool-finder — the quiz's content is the Directory's (ToolFinder.js
//     renders tool-categories.js data), whose entries were last re-verified
//     2026-08-15.
export const demos = [
  {
    slug: "anatomy-of-a-round",
    name: "Anatomy of a round",
    verified: "2026-08-15",
  },
  {
    slug: "tool-finder",
    name: "Tool Finder",
    verified: "2026-08-15",
  },
];
