// Single source of truth for blog post metadata, so the page, its
// JSON-LD, the homepage teaser, the sitemap, and the RSS feed can never
// drift apart. Same pattern as lib/sections.js and lib/tool-categories.js.
// The post body still lives in app/blog/page.js — there's no CMS to
// render from yet.
export const posts = [
  {
    path: "/blog",
    // Sentence case for the visible heading, JSON-LD headline, and feed
    // item; title case for the <title> tag that shows in search results.
    // "How this site builds itself" until 2026-08-10. The site does not
    // build itself: a human sets the direction and still starts most runs.
    // The old title, description and excerpt between them claimed the loop
    // was scheduled (it is triggered by hand), replaced manual redesigns
    // (it does not), ran weekly (it does not), and measured its results
    // (nothing has ever been measured — analytics was never configured).
    // CHARTER.md rule 4: a claim about this project's own process is a
    // claim like any other.
    title: "How an AI builds this site",
    metaTitle: "How An AI Builds This Site",
    // Curly apostrophes here, not straight ones: these strings render as
    // prose, and JSX entities like &rsquo; don't work inside a JS string.
    description:
      "AddictedtoAI.net is written by an AI running a propose-build-check loop inside a charter it cannot amend. Here’s how the loop, the guardrails, and the limits on its autonomy actually work.",
    // Shorter, more curiosity-driven than `description`, which has to
    // work as a search-result snippet. Used by the homepage teaser.
    excerpt:
      "A hypothesis-driven loop proposes and ships one change at a time, inside rules it can’t change — here’s how it actually works.",
    datePublished: "2026-08-09",
    // The post was rewritten after publication (PR #27 corrected its
    // guardrail figures and its shipped-work list). Kept separate from
    // datePublished so the JSON-LD and the sitemap's lastmod can both
    // be accurate instead of quietly reusing the publish date.
    dateModified: "2026-08-10",
  },
];
