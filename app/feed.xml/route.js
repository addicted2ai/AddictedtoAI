import { SITE_DESCRIPTION, SITE_NAME, getSiteUrl } from "../lib/site";
import { posts } from "../lib/posts";
import { getBuildLog } from "../lib/build-log";

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function roundSummary(entry) {
  return (
    entry.intro ||
    entry.changes?.[0]?.hypothesis ||
    `Round ${entry.number} was added to the build log.`
  );
}

export function GET() {
  const siteUrl = getSiteUrl();

  const items = posts
    .map((post) => {
      const url = `${siteUrl}${post.path}`;
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <description>${escapeXml(post.description)}</description>
      <pubDate>${new Date(post.datePublished).toUTCString()}</pubDate>
    </item>`;
    })
    .join("\n");

  // The blog has one post today, but the build log is the site's recurring
  // content. Keep each item compact: subscribers need an update and a link,
  // not a second copy of the entire log in their feed reader.
  const roundItems = getBuildLog()
    .map((entry) => {
      const url = `${siteUrl}/log#${entry.id}`;
      const stableLabel = entry.prs[0]
        ? `PR #${entry.prs[0]}`
        : `Round ${entry.number}`;
      const date = /^\d{4}-\d{2}-\d{2}$/.test(entry.date)
        ? `\n      <pubDate>${new Date(entry.date).toUTCString()}</pubDate>`
        : "";
      return `    <item>
      <title>Build log update — ${escapeXml(stableLabel)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="false">addictedtoai:round:${escapeXml(entry.id)}</guid>
      <description>${escapeXml(roundSummary(entry))}</description>${date}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${escapeXml(siteUrl)}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en</language>
    <atom:link href="${escapeXml(`${siteUrl}/feed.xml`)}" rel="self" type="application/rss+xml" />
${items}
${roundItems}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
