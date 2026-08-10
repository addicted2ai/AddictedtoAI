// A page's `alternates` replaces the root layout's wholesale rather than
// merging with it, so every page that sets its own canonical has to
// repeat this to keep advertising the feed. Shared here so there's one
// definition to change.
export const feedAlternates = {
  "application/rss+xml": [{ url: "/feed.xml", title: "AddictedtoAI" }],
};

export function getSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}
