// The site's identity, in one place. These strings were previously
// duplicated across the root metadata, the WebSite JSON-LD, the web
// app manifest, the RSS channel, and the blog post's author/publisher
// -- five copies that had no way of staying in sync with each other.
export const SITE_NAME = "AddictedtoAI";
export const SITE_DESCRIPTION =
  "AI tools, interactive demos, and a public record of how this site is built.";

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
  // The site's canonicals, sitemap, and JSON-LD must point at the address
  // a visitor sees, not at whatever deployment happens to be serving. On
  // Vercel, VERCEL_URL is the current deployment's URL -- which on a
  // preview-promoted or aliased production deployment is a
  // *.vercel.app preview hostname, exactly the wrong thing to tell a
  // search engine or a feed reader. VERCEL_PROJECT_PRODUCTION_URL is the
  // project's production URL regardless of which deployment serves it,
  // so prefer it; fall back to the deployment URL only when Vercel does
  // not provide it.
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${normaliseSiteUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL)}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${normaliseSiteUrl(process.env.VERCEL_URL)}`;
  }
  return "http://localhost:3000";
}

// The repository URL is optional while the project is private. Normalize it
// once so PR links do not grow a double slash when the configured value is a
// conventional trailing-slash URL.
export function getRepoUrl() {
  const value = process.env.NEXT_PUBLIC_REPO_URL;
  return value ? normaliseSiteUrl(value) : null;
}
