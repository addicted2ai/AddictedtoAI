export const sections = [
  {
    href: "/blog",
    title: "Blog",
    // "A candid account of how this site is built." until round 192. That
    // described 1 of the 12 published posts (app/lib/posts.js) — the
    // founding "/blog" entry itself. The other 11 are dated, sourced
    // reporting on things AI vendors actually did (a Copilot FAQ rewrite,
    // a Manus/Meta split with an export deadline, a ChatGPT ads policy
    // change, and eight more), not process writing about this project.
    // Flagged in docket/open/2026-08-24-the-homepage-sells-the-loop-not-the-site.md
    // (round 186, audit) as part of a larger homepage finding; this one
    // checkable-against-posts.js line is corrected here rather than left
    // wrong while the rest of that item waits on a full track.
    description:
      "Dated, sourced reporting on what AI vendors actually did — plus one account of how this site itself is built.",
  },
  {
    href: "/directory",
    title: "Directory",
    description: "Curated AI tools, organized by category.",
  },
  {
    href: "/demos",
    title: "Demos",
    description: "Interactive AI demos and playgrounds.",
  },
  // The three entries below were absent from this grid entirely until round
  // 199 (build), even though they are three of the nine links in app/Nav.js
  // and the most obviously useful things this site has built --
  // docket/open/2026-08-24-the-homepage-sells-the-loop-not-the-site.md's
  // second defect. Titles match app/Nav.js's own labels for these routes
  // exactly, and descriptions are trimmed from each page's own
  // metadata.description (app/what-vendors-promise/page.js,
  // app/model-retirement-calendar/page.js,
  // app/model-deprecation-checker/page.js) rather than written fresh, so
  // this card can be checked against the page it links to the same way the
  // /blog entry above is checked against app/lib/posts.js. Ordered to match
  // Nav.js's own order (promises, calendar, checker) rather than invented
  // here, per that file's comment: "what did the vendor commit to, when do
  // the dates land, and is anything of mine on the list."
  {
    href: "/what-vendors-promise",
    title: "Retirement promises",
    description:
      "What each AI vendor commits to before switching off a model — compared side by side, every row linking its source.",
  },
  {
    href: "/model-retirement-calendar",
    title: "Retirement calendar",
    description:
      "Dated model and API shutdowns read off vendors' own pages, with replacements and when each row was verified.",
  },
  {
    href: "/model-deprecation-checker",
    title: "Deprecation checker",
    description:
      "Paste a config or a list of model IDs and see which are retired or retiring, and what replaces them.",
  },
];
