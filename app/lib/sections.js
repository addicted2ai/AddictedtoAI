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
];
