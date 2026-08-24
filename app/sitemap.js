import { getSiteUrl } from "./lib/site";
import { posts } from "./lib/posts";
import {
  getLatestBuildLogDate,
  getPagedLog,
} from "./lib/build-log";

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
    path: "/blog/claude-code-auto-mode",
    priority: 0.8,
    lastModified: latestBuildLogDate || posts[2].dateModified,
    changeFrequency: "weekly",
  },
  {
    path: "/blog/cyber-eval-cascade",
    priority: 0.8,
    lastModified: latestBuildLogDate || posts[3].dateModified,
    changeFrequency: "weekly",
  },
  {
    path: "/blog/gpt-5-6-price-drop",
    priority: 0.8,
    lastModified: latestBuildLogDate || posts[4].dateModified,
    changeFrequency: "weekly",
  },
  {
    path: "/blog/fable-5-export-controls",
    priority: 0.8,
    lastModified: latestBuildLogDate || posts[5].dateModified,
    changeFrequency: "weekly",
  },
  {
    path: "/blog/chatgpt-ads",
    priority: 0.8,
    lastModified: latestBuildLogDate || posts[6].dateModified,
    changeFrequency: "weekly",
  },
  {
    path: "/blog/gemini-3-7-flash",
    priority: 0.8,
    lastModified: latestBuildLogDate || posts[7].dateModified,
    changeFrequency: "weekly",
  },
  {
    path: "/blog/ultrafast-mode",
    priority: 0.8,
    lastModified: latestBuildLogDate || posts[8].dateModified,
    changeFrequency: "weekly",
  },
  {
    path: "/blog/ai-security-week",
    priority: 0.8,
    lastModified: latestBuildLogDate || posts[9].dateModified,
    changeFrequency: "weekly",
  },
  {
    path: "/blog/manus-meta-split",
    priority: 0.8,
    lastModified: latestBuildLogDate || posts[10].dateModified,
    changeFrequency: "weekly",
  },
  {
    path: "/blog/copilot-consolidation",
    priority: 0.8,
    lastModified: latestBuildLogDate || posts[11].dateModified,
    changeFrequency: "weekly",
  },
  {
    path: "/disclosure",
    priority: 0.7,
    lastModified: latestBuildLogDate,
    changeFrequency: "monthly",
  },
  // The charter changes only when the maintainer amends it, which is not on
  // every deploy the way /log is, and nothing on the page substantiates a
  // lastmod the way the changelog does for /log — so no lastModified.
  { path: "/charter", priority: 0.7, changeFrequency: "monthly" },
  // The vendor-retirement comparison changes only when a round re-verifies
  // it, which is not every deploy, so like the charter it gets no lastmod.
  { path: "/what-vendors-promise", priority: 0.7, changeFrequency: "monthly" },
  // The retirement calendar changes only when a round re-verifies it, so it
  // gets no lastmod either.
  { path: "/model-retirement-calendar", priority: 0.7, changeFrequency: "monthly" },
  // The checker's own page copy changes only when a round revises it — the
  // matching itself runs against RETIREMENT_DATES at request time, so
  // nothing here substantiates a lastmod either.
  { path: "/model-deprecation-checker", priority: 0.7, changeFrequency: "monthly" },
  // Both withdrawn by round 186 (audit). They stay in the sitemap because
  // CHARTER.md rule 9 requires the address to keep resolving and a reader
  // following an old link is owed the explanation — the same reason /projects
  // has been listed here since round 54. What changes is the claim made about
  // them: a retraction notice does not change monthly, and it is not
  // comparably worth crawling, so both drop to the archive pages' treatment
  // rather than keeping the priority the live pages had.
  { path: "/model-migration-chains", priority: 0.3, changeFrequency: "yearly" },
  { path: "/promise-vs-practice", priority: 0.3, changeFrequency: "yearly" },
  // The loop-history snapshot is regenerated only when a round re-runs
  // scripts/loop-history.mjs --snapshot, so it gets no lastmod either.
  { path: "/loop-history", priority: 0.7, changeFrequency: "monthly" },
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
  // The archive is closed: it holds the rounds from the private predecessor
  // repository and cannot gain another one, so it is not regenerated with
  // meaning on every deploy the way /log is. Lower priority and no
  // lastModified, because nothing here can substantiate one.
  { path: "/log/archive", priority: 0.5, changeFrequency: "yearly" },
  // /log/early is closed too: it holds the first era of this repository,
  // frozen at a fixed boundary, so it changes only if the frozen rounds
  // themselves are ever touched. Same treatment as the archive.
  { path: "/log/early", priority: 0.5, changeFrequency: "yearly" },
  // The older current-era rounds each live on a permanent page of their own
  // at /log/rounds/<id>. A page appears when its round ages out of /log's
  // fixed full block and never moves again; the round's own date is the
  // most recent change it can substantiate.
  ...getPagedLog().map((entry) => ({
    path: `/log/rounds/${entry.id}`,
    priority: 0.6,
    changeFrequency: "yearly",
    ...(/^\d{4}-\d{2}-\d{2}$/.test(entry.date)
      ? { lastModified: entry.date }
      : {}),
  })),
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
