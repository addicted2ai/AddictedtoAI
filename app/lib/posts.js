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
    title: "How this site builds itself",
    metaTitle: "How This Site Builds Itself",
    // Curly apostrophes here, not straight ones: these strings render as
    // prose, and JSX entities like &rsquo; don't work inside a JS string.
    description:
      "AddictedtoAI.net is maintained by a scheduled, hypothesis-driven propose-build-measure loop instead of manual redesigns. Here’s how the loop, guardrails, and review process work.",
    // Shorter, more curiosity-driven than `description`, which has to
    // work as a search-result snippet. Used by the homepage teaser.
    excerpt:
      "A weekly, hypothesis-driven loop proposes, ships, and measures one change at a time — here’s how it actually works.",
    datePublished: "2026-08-09",
    // The post was rewritten after publication (PR #27 corrected its
    // guardrail figures and its shipped-work list). Kept separate from
    // datePublished so the JSON-LD and the sitemap's lastmod can both
    // be accurate instead of quietly reusing the publish date.
    dateModified: "2026-08-10",
  },
];
