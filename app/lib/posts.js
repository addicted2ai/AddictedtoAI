// Single source of truth for blog post metadata, so the page, its
// JSON-LD, and the RSS feed can never drift apart. Same pattern as
// lib/sections.js and lib/tool-categories.js. The post body still
// lives in app/blog/page.js — there's no CMS to render from yet.
export const posts = [
  {
    path: "/blog",
    // Sentence case for the visible heading, JSON-LD headline, and feed
    // item; title case for the <title> tag that shows in search results.
    title: "How this site builds itself",
    metaTitle: "How This Site Builds Itself",
    description:
      "AddictedtoAI.net is maintained by a scheduled, hypothesis-driven propose-build-measure loop instead of manual redesigns. Here's how the loop, guardrails, and review process work.",
    datePublished: "2026-08-09",
  },
];
