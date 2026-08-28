/**
 * feeds.mjs — RSS for the blog, the tutorials and the changed feed
 * (task 4.9, specs/site).
 *
 * *"Distribution is citability, not outreach: the system takes no outward
 * action (no posting, no email, no accounts anywhere)."* A feed is the one
 * form of distribution that costs nothing and asks for nothing — the reader
 * comes to it.
 *
 * Three feeds, three different notions of "date", and getting them wrong is
 * the classic feed bug (an item that re-appears as new every build):
 *   blog       the post's publication date. Fixed forever.
 *   tutorials  `verified_on` — for this surface the *verification* date is
 *              the news, and a re-verified tutorial legitimately resurfaces.
 *   changes    the change's own date, from the Pulse's diff history.
 *
 * Every item's `id` is its permanent URL (or the change's stable `key`), so a
 * reader that has seen an item never sees it twice.
 */

import { Feed } from 'feed';
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, SITE_LANGUAGE, absoluteUrl } from './site-config.mjs';
import { FEED_ROUTES } from './asset-routes.mjs';
import { escapeHtml } from './facts.mjs';
import { postsNewestFirst } from './posts.mjs';

const COPYRIGHT = `CC BY 4.0 — ${SITE_NAME}`;

/** ISO date to a Date at UTC noon — never a day off in either direction. */
function atUtcNoon(iso) {
  const d = new Date(`${iso}T12:00:00Z`);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

function newFeed({ title, description, path, updated }) {
  return new Feed({
    title,
    description,
    id: absoluteUrl(path),
    link: SITE_URL,
    language: SITE_LANGUAGE,
    copyright: COPYRIGHT,
    updated,
    generator: `${SITE_NAME} static build`,
    feedLinks: { rss: absoluteUrl(path) },
  });
}

export function blogFeed(posts) {
  const sorted = postsNewestFirst(posts);
  const feed = newFeed({
    title: `${SITE_NAME} — blog`,
    description: 'Dated stories about the technologies, methods, models and companies trying to advance AI.',
    path: FEED_ROUTES.blog,
    updated: sorted[0] ? atUtcNoon(sorted[0].data.date) : new Date(0),
  });
  for (const post of sorted) {
    feed.addItem({
      title: post.data.title,
      id: absoluteUrl(post.url),
      link: absoluteUrl(post.url),
      date: atUtcNoon(post.data.date),
      description: `Published ${post.data.date}.`,
      content: post.html || `<p>Published ${post.data.date}.</p>`,
    });
  }
  return feed;
}

export function tutorialsFeed(states) {
  const listed = states.filter((s) => s.state.listed);
  const feed = newFeed({
    title: `${SITE_NAME} — tutorials`,
    description:
      'Tutorials whose steps were actually executed, each carrying the date it was last verified.',
    path: FEED_ROUTES.tutorials,
    updated: listed[0] ? atUtcNoon(listed[0].doc.data.verified_on) : new Date(0),
  });
  for (const { doc, state } of listed) {
    const stamp = state.stamp
      .map((s) => `${s.subject} ${s.version}`)
      .join(', ');
    feed.addItem({
      title: doc.data.title,
      id: absoluteUrl(doc.url),
      link: absoluteUrl(doc.url),
      date: atUtcNoon(doc.data.verified_on),
      description: `Verified against ${stamp} on ${doc.data.verified_on}.`,
      content:
        `<p>Verified against ${escapeHtml(stamp)} on ${escapeHtml(doc.data.verified_on)}.</p>` +
        (state.notice ? `<p>${escapeHtml(state.notice)}</p>` : ''),
    });
  }
  return feed;
}

export function changesFeed(lines, opts = {}) {
  const limit = opts.limit ?? 100;
  const items = lines.slice(0, limit);
  const feed = newFeed({
    title: `${SITE_NAME} — what changed`,
    description:
      'Price moves, status changes, releases and retirements, observed mechanically from public sources and dated.',
    path: FEED_ROUTES.changes,
    updated: items[0]?.date ? atUtcNoon(items[0].date) : new Date(0),
  });
  for (const line of items) {
    const url = line.entry ? absoluteUrl(line.entry.url) : line.source_url ?? SITE_URL;
    const annotation = line.annotations?.map((a) => `<p>${escapeHtml(a.text)}</p>`).join('') ?? '';
    feed.addItem({
      title: `${line.title} — ${line.detail}`,
      id: line.key ? `${SITE_URL}/changes/${encodeURIComponent(line.key)}` : url,
      link: url,
      date: atUtcNoon(line.date),
      // The source goes in the description, not only in the HTML content: a
      // reader that shows plain text should still show where the line came
      // from, and that is the whole claim this feed makes.
      description:
        `${line.title}: ${line.detail} (${line.date}).` +
        (line.source_url ? ` Source: ${line.source_url}` : ''),
      content:
        `<p>${escapeHtml(line.title)}: ${escapeHtml(line.detail)}.</p>` +
        annotation +
        (line.source_url
          ? `<p><a href="${escapeHtml(line.source_url)}">source</a></p>`
          : ''),
    });
  }
  return feed;
}

/** All three, as `{ route: xml }`, ready to write into `public/`. */
export function renderFeeds({ posts, tutorialStates, changes }) {
  return {
    [FEED_ROUTES.blog]: blogFeed(posts).rss2(),
    [FEED_ROUTES.tutorials]: tutorialsFeed(tutorialStates).rss2(),
    [FEED_ROUTES.changes]: changesFeed(changes).rss2(),
  };
}
