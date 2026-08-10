// The site's identity, in one place. These strings were previously
// duplicated across the root metadata, the WebSite JSON-LD, the web
// app manifest, the RSS channel, and the blog post's author/publisher
// -- five copies that had no way of staying in sync with each other.
export const SITE_NAME = "AddictedtoAI";
export const SITE_DESCRIPTION = "AI news, tools, projects, and demos.";

// A page's `alternates` replaces the root layout's wholesale rather than
// merging with it, so every page that sets its own canonical has to
// repeat this to keep advertising the feed. Shared here so there's one
// definition to change.
export const feedAlternates = {
  "application/rss+xml": [{ url: "/feed.xml", title: SITE_NAME }],
};

function normaliseSiteUrl(value) {
  return value.trim().replace(/\/+$/, "");
}

export function getSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return normaliseSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
  }
  if (process.env.VERCEL_URL) {
    return `https://${normaliseSiteUrl(process.env.VERCEL_URL)}`;
  }
  return "http://localhost:3000";
}
