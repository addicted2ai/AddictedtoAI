import { getSiteUrl } from "./lib/site";
import { posts } from "./lib/posts";
import { getLatestBuildLogDate } from "./lib/build-log";

// `lastModified` is only set where we can actually substantiate it.
// It used to be `new Date()` for every route, which meant every deploy
// told crawlers all five pages had just changed -- and this site
// deploys once per shipped change, so that claim was wrong almost
// every time. Google treats lastmod as a hint and discounts it when a
// site's values look unreliable, so an always-now value is worse than
// no value: it burns the signal for the one page where we do know.
const latestBuildLogDate = getLatestBuildLogDate();

const routes = [
  {
    path: "",
    priority: 1,
    changeFrequency: "weekly",
    lastModified: latestBuildLogDate,
  },
  // lastmod is "last modified", not "published" -- the post has been
  // edited since it went up.
  {
    path: "/blog",
    priority: 0.8,
    lastModified: latestBuildLogDate || posts[0].dateModified,
    changeFrequency: "weekly",
  },
  {
    path: "/blog/frontier-cyber",
    priority: 0.8,
    lastModified: latestBuildLogDate || posts[1].dateModified,
    changeFrequency: "weekly",
  },
  {
    path: "/disclosure",
    priority: 0.7,
    lastModified: latestBuildLogDate,
    changeFrequency: "monthly",
  },
  // These pages have no build-log-derived content and do not change every
  // time the loop ships a round.
  { path: "/directory", priority: 0.8, changeFrequency: "monthly" },
  { path: "/projects", priority: 0.8, changeFrequency: "monthly" },
  {
    path: "/demos",
    priority: 0.8,
    changeFrequency: "weekly",
    lastModified: latestBuildLogDate,
  },
  // The log is regenerated from CHANGELOG.md on every deploy, and the
  // changelog gains an entry every round, so this one genuinely does
  // change whenever the site does.
  {
    path: "/log",
    priority: 0.9,
    changeFrequency: "weekly",
    lastModified: latestBuildLogDate,
  },
];

export default function sitemap() {
  const siteUrl = getSiteUrl();

  return routes.map((route) => ({
    url: `${siteUrl}${route.path}`,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
    ...(route.lastModified
      ? { lastModified: new Date(route.lastModified) }
      : {}),
  }));
}
