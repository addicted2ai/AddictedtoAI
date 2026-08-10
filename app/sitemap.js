import { getSiteUrl } from "./lib/site";
import { posts } from "./lib/posts";

// `lastModified` is only set where we can actually substantiate it.
// It used to be `new Date()` for every route, which meant every deploy
// told crawlers all five pages had just changed -- and this site
// deploys once per shipped change, so that claim was wrong almost
// every time. Google treats lastmod as a hint and discounts it when a
// site's values look unreliable, so an always-now value is worse than
// no value: it burns the signal for the one page where we do know.
const routes = [
  { path: "", priority: 1 },
  // lastmod is "last modified", not "published" -- the post has been
  // edited since it went up.
  { path: "/blog", priority: 0.8, lastModified: posts[0].dateModified },
  { path: "/directory", priority: 0.8 },
  { path: "/projects", priority: 0.8 },
  { path: "/demos", priority: 0.8 },
  // The log is regenerated from CHANGELOG.md on every deploy, and the
  // changelog gains an entry every round, so this one genuinely does
  // change whenever the site does.
  { path: "/log", priority: 0.9 },
];

export default function sitemap() {
  const siteUrl = getSiteUrl();

  return routes.map((route) => ({
    url: `${siteUrl}${route.path}`,
    changeFrequency: "weekly",
    priority: route.priority,
    ...(route.lastModified
      ? { lastModified: new Date(route.lastModified) }
      : {}),
  }));
}
